import { connectDB } from "../../lib/mongodb";
import Status from "../../Schemas/statusSchema";
import { getToken } from "next-auth/jwt";

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
      let statusDoc = await Status.findOne().lean();
      if (!statusDoc) {
        statusDoc = (await Status.create({})).toObject();
      }
      res.setHeader('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=30');
      return res.status(200).json(statusDoc);
    }

    if (req.method === "PUT" || req.method === "POST") {
      const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
      if (!token) return res.status(401).json({ error: "Unauthorized" });

      const newStatus = req.body;
      const updated = await Status.findOneAndUpdate({}, newStatus, { new: true, upsert: true, setDefaultsOnInsert: true });
      return res.status(200).json(updated);
    }

    return res.status(405).end();
  } catch (err) {
    console.error("Status API Error:", err);
    return res.status(500).json({ error: "Failed to read or write status" });
  }
}
