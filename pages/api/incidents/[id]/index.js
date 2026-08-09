import { connectDB } from "../../../../lib/mongodb";
import Incident from "../../../../Schemas/incidentSchema";

export default async function handler(req, res) {
  try {
    await connectDB();

    const { id } = req.query;

    if (req.method === "GET") {
      const incident = await Incident.findById(id).lean();
      if (!incident) return res.status(404).json({ error: "Incident not found" });
      return res.status(200).json(incident);
    }

    return res.status(405).end();
  } catch (err) {
    console.error("Incident GET Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
