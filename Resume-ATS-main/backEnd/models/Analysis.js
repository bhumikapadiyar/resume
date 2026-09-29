import mongoose from 'mongoose';

const analysisSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    resumeName: { type: String, trim: true, maxlength: 160 },
    resumeText: { type: String, required: true, select: false, maxlength: 30000 },
    resumeFile: {
      mimeType: { type: String, trim: true },
      size: { type: Number, min: 0 },
      originalName: { type: String, trim: true, maxlength: 160 }
    },
    resumeAsset: {
      publicId: { type: String, trim: true },
      url: { type: String, trim: true },
      resourceType: { type: String, trim: true }
    },
    jobDescription: { type: String, trim: true, maxlength: 12000 },
    score: { type: Number, required: true, min: 0, max: 100 },
    result: { type: mongoose.Schema.Types.Mixed, required: true },
    source: { type: String, enum: ['gemini'], required: true, default: 'gemini' }
  },
  { timestamps: true }
);

export default mongoose.model('Analysis', analysisSchema);
