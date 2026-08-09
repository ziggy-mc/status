/**
 * Reports an outage to the status page API.
 * Intended for use by a Discord bot when detecting service failures.
 *
 * @param {Object} options
 * @param {string} options.title - Incident title
 * @param {string} options.description - Incident description
 * @param {string} options.severity - "minor" | "major" | "critical"
 * @param {string[]} options.affectedSystems - List of affected system names
 * @param {boolean} [options.sync=true] - Whether to sync status with affected systems
 * @returns {Promise<Object>} The created incident document
 *
 * Required environment variables:
 *   BOT_API_KEY     - Secret key that matches the status page API key
 *   STATUS_API_URL  - Base URL of the status page (e.g. https://status.example.com)
 *
 * Example usage in a Discord bot:
 *   import { reportOutage } from "./lib/reportOutage";
 *   // When failure is detected:
 *   await reportOutage({
 *     title: "API Outage",
 *     description: "Health check failed — API is not responding.",
 *     severity: "critical",
 *     affectedSystems: ["API", "Website"],
 *     sync: true,
 *   });
 */
export async function reportOutage({
  title,
  description,
  severity,
  affectedSystems,
  sync = true,
}) {
  const apiUrl = process.env.STATUS_API_URL || "http://localhost:3000";
  const apiKey = process.env.BOT_API_KEY;

  if (!apiKey) {
    throw new Error("BOT_API_KEY environment variable is not set");
  }

  const res = await fetch(`${apiUrl}/api/incidents`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({ title, description, severity, affectedSystems, sync }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Failed to create incident: ${err.error || res.status}`);
  }

  return res.json();
}
