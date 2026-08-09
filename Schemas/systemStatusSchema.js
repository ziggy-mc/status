import mongoose from "mongoose";

const SystemStatusSchema = new mongoose.Schema({
  systemName: { type: String, required: true, unique: true },
  status: {
    type: String,
    enum: ["online", "degraded", "offline", "maintenance", "beta"],
    default: "online",
  },
  lastUpdated: { type: Date, default: Date.now },
});

export default mongoose.models.CSystemStatus || mongoose.model("CSystemStatus", CSystemStatusSchema);
