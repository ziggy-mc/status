import { connectDB } from "../../lib/mongodb";
import Incident from "../../Schemas/incidentSchema";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  try {
    await connectDB();

    if (req.method === "GET") {
      const activeIncidents = await Incident.find({ status: { $ne: "resolved" } }).lean();

      if (activeIncidents.length > 0) {
        return res.status(200).json({
          active: true,
          message: "Zavro is experiencing issues",
          incidents: activeIncidents,
        });
      }

      return res.status(200).json({ active: false });
    }

    return res.status(405).end();
  } catch (err) {
    console.error("Banner API Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
