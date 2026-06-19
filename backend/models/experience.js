import mongoose from 'mongoose';

const ExperienceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  company: { type: String, required: true },
  role: { type: String, required: true },
  rounds: [{ type: String }],
  questions: [{ type: String }],
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  status: { type: String, enum: ['Selected', 'Rejected', 'Under Review'], default: 'Selected' },
  approved: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.Experience || mongoose.model('Experience', ExperienceSchema);
