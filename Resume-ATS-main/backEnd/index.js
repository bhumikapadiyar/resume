import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

import connectDB from './config/db.js';
import { validateEnvironment } from './config/env.js';
import { apiLimiter, authLimiter, securityHeaders } from './config/security.js';
import authRoutes from './routes/auth.js';
import analysesRoutes from './routes/analyses.js';
import Analysis from './models/Analysis.js';
import { requireAuth } from './middleware/auth.js';
import { analyzeResume } from './services/analysis.js';
import { uploadResume } from './services/fileStorage.js';

dotenv.config();
connectDB();
validateEnvironment();

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 4000;
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    const allowed = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    callback(null, allowed.includes(file.mimetype));
  }
});
app.disable('x-powered-by');
app.use(securityHeaders);

// Robust CORS: allows configured origins + all localhost / 127.0.0.1 dev ports
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:3000,http://127.0.0.1:3000')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true
}));

app.use('/api', apiLimiter);
app.use(express.json({ limit: '2mb' }));

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/analyses', analysesRoutes);

app.post('/api/analyze', requireAuth, upload.single('resume'), async (req, res, next) => {
  try {
    let text = req.body.text || '';
    if (req.file) {
      const fileBuffer = req.file.buffer;
      if (req.file.mimetype === 'application/pdf') text = (await pdfParse(fileBuffer)).text;
      else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') text = (await mammoth.extractRawText({ buffer: fileBuffer })).value;
      else text = fileBuffer.toString('utf8');
      req.resumeFile = { mimeType: req.file.mimetype, size: req.file.size, originalName: req.file.originalname };
    }
    if (!text.trim()) return res.status(400).json({ error: 'Add resume text or upload a PDF/DOC file first.' });
    const { result: analysis, source } = await analyzeResume(text, req.body.jobDescription || '');
    if (req.file) req.resumeAsset = await uploadResume(req.file);
    if (process.env.MONGO_URI) {
      await Analysis.create({ user: req.auth.sub, resumeName: req.file?.originalname || 'Pasted resume', resumeText: text.slice(0, 30000), resumeFile: req.resumeFile, resumeAsset: req.resumeAsset, jobDescription: req.body.jobDescription || '', score: analysis.score, result: analysis, source });
    }
    res.json({ analysis, source, resumeAsset: req.resumeAsset || null });
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  console.error(`${req.method} ${req.path}:`, error.message);
  if (res.headersSent) return next(error);
  const status = error.statusCode || error.status || 500;
  const isClientOrServiceError = status < 500 || status === 502 || status === 503 || status === 504;
  const message = isClientOrServiceError && error.message
    ? error.message
    : 'Something went wrong. Please try again.';
  res.status(status).json({ error: message });
});

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Resumely ATS REST API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      analyses: '/api/analyses',
      analyze: '/api/analyze'
    }
  });
});

app.use('*', (req, res) => {
  res.status(404).json({ error: `API route ${req.originalUrl} not found.` });
});
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Resumely server running on port ${PORT}`);
});
