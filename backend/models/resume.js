import mongoose from 'mongoose';

const ResumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  atsScore: { type: Number, required: true },
  missingKeywords: [{ type: String }],
  suggestions: [{ type: String }],
  completenessScore: { type: Number, default: 0 },
  formattingReview: [{ type: String }]
}, { timestamps: true });

export default mongoose.models.Resume || mongoose.model('Resume', ResumeSchema);
