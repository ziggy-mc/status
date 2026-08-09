import { connectDB } from "../../../../lib/mongodb";
import Incident from "../../../../Schemas/incidentSchema";
import Status from "../../../../Schemas/statusSchema";

export default async function handler(req, res) {
  try {
    await connectDB();

    const { id } = req.query;

    if (req.method === "POST") {
      const incident = await Incident.findById(id);
      if (!incident) return res.status(404).json({ error: "Incident not found" });

      incident.status = "resolved";
      incident.resolvedAt = new Date();
      incident.updates.push({
        message: "Incident resolved.",
        status: "resolved",
        createdAt: new Date(),
      });
      await incident.save();

      if (incident.sync && incident.affectedSystems.length > 0) {
        const status = await Status.findOne();
        if (status) {
          for (const systemKey of incident.affectedSystems) {
            if (systemKey in status.toObject()) {
              status[systemKey] = "Online";
            }
          }
          await status.save();
        } else {
          console.error("Incident Resolve: No Status document found; skipping status reset.");
        }
      }

      return res.status(200).json(incident);
    }

    return res.status(405).end();
  } catch (err) {
    console.error("Incident Resolve Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
