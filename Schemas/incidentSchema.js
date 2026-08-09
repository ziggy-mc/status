import mongoose from "mongoose";

const UpdateSchema = new mongoose.Schema({
  message: { type: String, required: true },
  status: {
    type: String,
    enum: ["investigating", "identified", "monitoring", "resolved"],
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

const IncidentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: {
    type: String,
    enum: ["investigating", "identified", "monitoring", "resolved"],
    default: "investigating",
  },
  severity: {
    type: String,
    enum: ["minor", "major", "critical"],
    required: true,
  },
  affectedSystems: [{ type: String }],
  updates: [UpdateSchema],
  sync: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date, default: null },
});

export default mongoose.models.Incident || mongoose.model("Incident", IncidentSchema);
