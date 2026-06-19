import mongoose from 'mongoose';

const RoadmapSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  weeks: [{
    weekNumber: { type: Number, required: true },
    title: { type: String, required: true },
    tasks: [{
      id: { type: String, required: true },
      title: { type: String, required: true },
      completed: { type: Boolean, default: false }
    }]
  }]
}, { timestamps: true });

export default mongoose.models.Roadmap || mongoose.model('Roadmap', RoadmapSchema);
