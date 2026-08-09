import { connectDB } from "./mongodb";
import Incident from "../Schemas/incidentSchema";

async function cleanupOldIncidents() {
  try {
    await connectDB();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const result = await Incident.deleteMany({
      resolvedAt: { $exists: true, $ne: null, $lt: thirtyDaysAgo },
    });
    console.log(`[Cleanup Job] Deleted ${result.deletedCount} old resolved incidents.`);
  } catch (err) {
    console.error("[Cleanup Job] Error during cleanup:", err);
  }
}

export function startCleanupJob() {
  cleanupOldIncidents();
  setInterval(cleanupOldIncidents, 60 * 60 * 1000);
  console.log("[Cleanup Job] Started - runs every hour.");
}
