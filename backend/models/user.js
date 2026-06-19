import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  targetCompany: { type: String, default: 'Google' },
  streak: { type: Number, default: 0 },
  lastActive: { type: String, default: new Date().toISOString() },
  readinessScore: { type: Number, default: 45 }, // initial overall percentage
  completedTopics: [{ type: String }],
  skills: [{ type: String }],
  strengths: [{ type: String }],
  weaknesses: [{ type: String }],
  predictedTimeline: { type: String, default: 'October 2027' }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
