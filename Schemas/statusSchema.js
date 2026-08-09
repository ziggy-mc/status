import mongoose from "mongoose";

const StatusSchema = new mongoose.Schema({
  weather: { type: String, default: "No Impact" },
  weathermsg: { type: String, default: "No weather impact at this time." },
  overall: { type: String, default: "Online" },
  overallmsg: { type: String, default: "All systems are operational (x0)" },
  website1: { type: String, default: "Online" },
  websiteMessage1: { type: String, default: "All systems operational. (x0, <=500ms)" },
  website2: { type: String, default: "Online" },
  websiteMessage2: { type: String, default: "All systems operational. (x0, <=500ms)" },
  websiteoverall: { type: String, default: "Online" },
  websiteoverallmsg: { type: String, default: "All website systems are operational." },
  data1: { type: String, default: "Online" },
  data1msg: { type: String, default: "Our database is currently up. (<=400ms)" },
  data2: { type: String, default: "Online" },
  data2msg: { type: String, default: "Our database is currently up. (<=400ms)" },
  dataoverall: { type: String, default: "Online" },
  dataoverallmsg: { type: String, default: "All database systems are operational." },
  vps1: { type: String, default: "Online" },
  vps1msg: { type: String, default: "All VPS systems are operational." },
  vps2: { type: String, default: "Online" },
  vps2msg: { type: String, default: "All VPS systems are operational." },
  vpsoverall: { type: String, default: "Online" },
  vpsoverallmsg: { type: String, default: "All VPS systems are operational." },
  cdn: { type: String, default: "Online" },
  cdnmsg: { type: String, default: "All CDN systems are operational." },
}, { timestamps: true });

export default mongoose.models.CStatus || mongoose.model("CStatus", CStatusSchema);
