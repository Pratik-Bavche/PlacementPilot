import mongoose from 'mongoose';

const ApplicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company: { type: String, required: true },
  role: { type: String, required: true },
  stage: { 
    type: String, 
    enum: ['Applied', 'OA Scheduled', 'Interview Scheduled', 'Offer Extended', 'Rejected'], 
    default: 'Applied' 
  },
  salary: { type: String, default: '' },
  deadline: { type: String, default: '' },
  notes: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.models.Application || mongoose.model('Application', ApplicationSchema);
