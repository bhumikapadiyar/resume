import express from 'express';
import Analysis from '../models/Analysis.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const analyses = await Analysis.find({ user: req.auth.sub }).sort({ createdAt: -1 }).limit(20).select('-result');
    res.json({ analyses });
  } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const analysis = await Analysis.findOne({ _id: req.params.id, user: req.auth.sub }).select('+resumeText');
    if (!analysis) return res.status(404).json({ error: 'Analysis not found.' });
    res.json({ analysis });
  } catch (error) { next(error); }
});

export default router;
