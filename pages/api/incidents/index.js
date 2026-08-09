import crypto from "crypto";
import { connectDB } from "../../../lib/mongodb";
import Incident from "../../../Schemas/incidentSchema";
import { applySyncStatus } from "../../../lib/syncStatus";
import { getToken } from "next-auth/jwt";
import { startCleanupJob } from "../../../lib/cleanupJob";

// Safe localStorage utilities — gracefully handle sandboxed environments
// where localStorage may be blocked (e.g. iframes without allow-same-origin).
function safeGetItem(key) {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key, value) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, value);
  } catch {
    // Silently ignore — storage unavailable in this environment.
  }
}

function safeRemoveItem(key) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(key);
  } catch {
    // Silently ignore — storage unavailable in this environment.
  }
}

// Start the background cleanup job once per server instance
if (!global.__cleanupJobStarted) {
  global.__cleanupJobStarted = true;
  startCleanupJob();
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    await connectDB();

    if (req.method === "POST") {
      // Accept either a valid bot API key or a valid admin session
      const apiKey = req.headers["Access-Control-Allow-Headers", "Content-Type, Authorization, x-api-key"];
      const botApiKey = process.env.BOT_API_KEY;

      const hasValidApiKey =
        botApiKey &&
        apiKey &&
        apiKey.length === botApiKey.length &&
        crypto.timingSafeEqual(Buffer.from(apiKey), Buffer.from(botApiKey));

      if (!hasValidApiKey) {
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
        if (!token) {
          return res.status(401).json({ error: "Unauthorized" });
        }
      }

      const { title, description, status, severity, affectedSystems, sync } = req.body;

      const incident = await Incident.create({
        title,
        description,
        status: status || "investigating",
        severity,
        affectedSystems: affectedSystems || [],
        sync: sync || false,
        updates: [
          {
            message: description,
            status: status || "investigating",
            createdAt: new Date(),
          },
        ],
      });

      if (sync && affectedSystems && affectedSystems.length > 0) {
        await applySyncStatus(affectedSystems, severity);
      }

      return res.status(201).json(incident);
    }

    if (req.method === "GET") {
      if (req.query.history === "true") {
        const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
        const thirtyDaysAgo = new Date(Date.now() - THIRTY_DAYS_MS);
        const incidents = await Incident.find({
          status: "resolved",
          resolvedAt: { $gte: thirtyDaysAgo },
        })
          .sort({ resolvedAt: -1 })
          .lean();
        return res.status(200).json(incidents);
      }

      const incidents = await Incident.find({ status: { $ne: "resolved" } }).lean();
      return res.status(200).json(incidents);
    }

    return res.status(405).end();
  } catch (err) {
    console.error("Incidents API Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
