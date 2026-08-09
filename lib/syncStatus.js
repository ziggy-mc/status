import Status from "../Schemas/statusSchema";

export async function applySyncStatus(affectedSystems, severity) {
  if (!["minor", "major", "critical"].includes(severity)) {
    return;
  }

  const status = await Status.findOne();
  if (!status) {
    console.error("syncStatus: No Status document found; skipping sync.");
    return;
  }

  for (const systemKey of affectedSystems) {
    if (systemKey in status.toObject()) {
      status[systemKey] = severity;
    }
  }

  await status.save();
}
