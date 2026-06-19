import mongoose from 'mongoose';

const InterviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company: { type: String, default: 'General HR' },
  role: { type: String, default: 'Software Engineer' },
  answers: [{
    question: { type: String, required: true },
    answer: { type: String, required: true },
    confidence: { type: Number, default: 0 },
    communication: { type: Number, default: 0 },
    grammar: { type: Number, default: 0 },
    clarity: { type: Number, default: 0 },
    fluency: { type: Number, default: 0 },
    fillerWords: [{ type: String }],
    feedback: { type: String }
  }],
  overallScore: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.models.Interview || mongoose.model('Interview', InterviewSchema);
