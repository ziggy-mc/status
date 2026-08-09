import { connectDB } from "../../../../lib/mongodb";
import Incident from "../../../../Schemas/incidentSchema";
import { applySyncStatus } from "../../../../lib/syncStatus";

export default async function handler(req, res) {
  try {
    await connectDB();

    const { id } = req.query;

    if (req.method === "POST") {
      const { message, status } = req.body;

      const incident = await Incident.findById(id);
      if (!incident) return res.status(404).json({ error: "Incident not found" });

      incident.updates.push({ message, status, createdAt: new Date() });
      if (status) incident.status = status;
      await incident.save();

      if (incident.sync && incident.affectedSystems.length > 0) {
        await applySyncStatus(incident.affectedSystems, incident.severity);
      }

      return res.status(200).json(incident);
    }

    return res.status(405).end();
  } catch (err) {
    console.error("Incident Update Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
