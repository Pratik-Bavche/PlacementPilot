import mongoose from 'mongoose';

const BattleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  score: { type: Number, required: true },
  contestName: { type: String, required: true },
  rank: { type: Number }
}, { timestamps: true });

export default mongoose.models.Battle || mongoose.model('Battle', BattleSchema);
