import { useEffect, useState, useCallback } from "react";
import { signOut } from "next-auth/react";
import { getSession } from "next-auth/react";
import { ADMIN_DISCORD_ID } from "../lib/constants";

const INCIDENT_STATUSES = ["investigating", "identified", "monitoring", "resolved"];
// Exclude "resolved" from update dropdowns — use the Resolve button for that
const INCIDENT_UPDATE_STATUSES = ["investigating", "identified", "monitoring"];
const INCIDENT_SEVERITIES = ["minor", "major", "critical"];

const parseAffectedSystems = (input) =>
  input ? input.split(",").map((s) => s.trim()).filter(Boolean) : [];

const emptyIncidentForm = {
  title: "",
  description: "",
  severity: "minor",
  affectedSystems: "",
  sync: false,
};

const emptyUpdateForm = { message: "", status: "investigating" };

export default function Admin({ session }) {
  // --- System status state ---
  const [status, setStatus] = useState({});
  const [newStatus, setNewStatus] = useState({});

  // --- Incident state ---
  const [incidents, setIncidents] = useState([]);
  const [incidentForm, setIncidentForm] = useState(emptyIncidentForm);
  const [incidentError, setIncidentError] = useState("");
  const [incidentSuccess, setIncidentSuccess] = useState("");

  // Per-incident "Add Update" form state keyed by incident _id
  const [updateForms, setUpdateForms] = useState({});

  // -------------------------------------------------------------------
  // Load system status
  // -------------------------------------------------------------------
  useEffect(() => {
    fetch("/api/status")
      .then((res) => res.json())
      .then((data) => {
        setStatus(data);
        setNewStatus(data);
      });
  }, []);

  // -------------------------------------------------------------------
  // Load active incidents
  // -------------------------------------------------------------------
  const loadIncidents = useCallback(() => {
    fetch("/api/incidents")
      .then((res) => res.json())
      .then((data) => setIncidents(Array.isArray(data) ? data : []));
  }, []);

  useEffect(() => {
    loadIncidents();
  }, [loadIncidents]);

  // -------------------------------------------------------------------
  // System status handlers
  // -------------------------------------------------------------------
  const handleStatusChange = useCallback((key, value) => {
    setNewStatus((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newStatus),
    });
    if (!res.ok) {
      const err = await res.json();
      alert(`Error: ${err.error || res.status}`);
      return;
    }
    setStatus(newStatus);
    alert("Status updated!");
  };

  // -------------------------------------------------------------------
  // Create incident handlers
  // -------------------------------------------------------------------
  const handleIncidentChange = (field, value) => {
    setIncidentForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateIncident = async (e) => {
    e.preventDefault();
    setIncidentError("");
    setIncidentSuccess("");

    const payload = {
      title: incidentForm.title,
      description: incidentForm.description,
      severity: incidentForm.severity,
      affectedSystems: parseAffectedSystems(incidentForm.affectedSystems),
      sync: incidentForm.sync,
    };

    const res = await fetch("/api/incidents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();
      setIncidentError(err.error || `Error ${res.status}`);
      return;
    }

    setIncidentForm(emptyIncidentForm);
    setIncidentSuccess("Incident created successfully.");
    loadIncidents();
  };

  // -------------------------------------------------------------------
  // Per-incident update form handlers
  // -------------------------------------------------------------------
  const getUpdateForm = (id) => updateForms[id] || emptyUpdateForm;

  const handleUpdateFormChange = (id, field, value) => {
    setUpdateForms((prev) => ({
      ...prev,
      [id]: { ...getUpdateForm(id), [field]: value },
    }));
  };

  const handleAddUpdate = async (e, id) => {
    e.preventDefault();
    const form = getUpdateForm(id);
    const res = await fetch(`/api/incidents/${id}/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: form.message, status: form.status }),
    });
    if (!res.ok) {
      const err = await res.json();
      alert(`Error: ${err.error || res.status}`);
      return;
    }
    // Reset that incident's update form and refresh list
    setUpdateForms((prev) => ({ ...prev, [id]: emptyUpdateForm }));
    loadIncidents();
  };

  const handleResolve = async (id) => {
    if (!confirm("Resolve this incident?")) return;
    const res = await fetch(`/api/incidents/${id}/resolve`, { method: "POST" });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("Failed to resolve incident:", id, err);
      alert(`Error: ${err.error || res.status}`);
      return;
    }
    loadIncidents();
  };

  // -------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------
  return (
    <div className="min-h-screen p-8 bg-gray-900 text-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* System Status Form                                                */}
      {/* ---------------------------------------------------------------- */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Update System Status</h2>
        <form onSubmit={handleStatusSubmit} className="space-y-4 max-w-lg">
          {Object.keys(status).map((key) => (
            <div key={key} className="flex flex-col">
              <label className="mb-1 capitalize">{key}</label>
              <input
                value={newStatus[key] || ""}
                onChange={(e) => handleStatusChange(key, e.target.value)}
                className="p-2 rounded text-black bg-white"
              />
            </div>
          ))}
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded"
          >
            Update Status
          </button>
        </form>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Create Incident Form                                              */}
      {/* ---------------------------------------------------------------- */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Create Incident</h2>
        <form
          onSubmit={handleCreateIncident}
          className="space-y-4 max-w-lg bg-gray-800 p-6 rounded-lg"
        >
          {/* Title */}
          <div className="flex flex-col">
            <label className="mb-1">Title</label>
            <input
              required
              value={incidentForm.title}
              onChange={(e) => handleIncidentChange("title", e.target.value)}
              className="p-2 rounded text-black bg-white"
              placeholder="Incident title"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col">
            <label className="mb-1">Description</label>
            <textarea
              required
              value={incidentForm.description}
              onChange={(e) => handleIncidentChange("description", e.target.value)}
              className="p-2 rounded text-black bg-white"
              rows={3}
              placeholder="Describe the incident"
            />
          </div>

          {/* Severity */}
          <div className="flex flex-col">
            <label className="mb-1">Severity</label>
            <select
              value={incidentForm.severity}
              onChange={(e) => handleIncidentChange("severity", e.target.value)}
              className="p-2 rounded text-black bg-white"
            >
              {INCIDENT_SEVERITIES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Affected Systems */}
          <div className="flex flex-col">
            <label className="mb-1">Affected Systems (comma-separated)</label>
            <input
              value={incidentForm.affectedSystems}
              onChange={(e) => handleIncidentChange("affectedSystems", e.target.value)}
              className="p-2 rounded text-black bg-white"
              placeholder="e.g. API, Website, Database"
            />
          </div>

          {/* Sync Toggle */}
          <div className="flex items-center gap-3">
            <label>Sync Status</label>
            <button
              type="button"
              onClick={() => handleIncidentChange("sync", !incidentForm.sync)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                incidentForm.sync ? "bg-blue-500" : "bg-gray-600"
              }`}
              aria-pressed={incidentForm.sync}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  incidentForm.sync ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className="text-sm text-gray-400">
              {incidentForm.sync ? "Enabled" : "Disabled"}
            </span>
          </div>

          {incidentError && (
            <p className="text-red-400 text-sm">{incidentError}</p>
          )}
          {incidentSuccess && (
            <p className="text-green-400 text-sm">{incidentSuccess}</p>
          )}

          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
          >
            Create Incident
          </button>
        </form>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Active Incidents                                                  */}
      {/* ---------------------------------------------------------------- */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Active Incidents</h2>
        {incidents.length === 0 ? (
          <p className="text-gray-400">No active incidents.</p>
        ) : (
          <div className="space-y-6 max-w-2xl">
            {incidents.map((incident) => {
              const updateForm = getUpdateForm(incident._id);
              return (
                <div
                  key={incident._id}
                  className="bg-gray-800 p-6 rounded-lg space-y-4"
                >
                  {/* Incident header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold">{incident.title}</h3>
                      <p className="text-sm text-gray-400 mt-1">
                        {incident.description}
                      </p>
                    </div>
                    <div className="text-right text-sm space-y-1">
                      <span className="block capitalize px-2 py-0.5 rounded bg-gray-700">
                        {incident.severity}
                      </span>
                      <span className="block capitalize px-2 py-0.5 rounded bg-gray-700">
                        {incident.status}
                      </span>
                    </div>
                  </div>

                  {/* Affected systems */}
                  {incident.affectedSystems && incident.affectedSystems.length > 0 && (
                    <p className="text-sm text-gray-400">
                      <span className="font-semibold text-gray-300">Affected: </span>
                      {incident.affectedSystems.join(", ")}
                    </p>
                  )}

                  {/* Add Update form */}
                  <form
                    onSubmit={(e) => handleAddUpdate(e, incident._id)}
                    className="space-y-2 border-t border-gray-700 pt-4"
                  >
                    <p className="text-sm font-semibold text-gray-300">Add Update</p>
                    <textarea
                      required
                      value={updateForm.message}
                      onChange={(e) =>
                        handleUpdateFormChange(incident._id, "message", e.target.value)
                      }
                      className="w-full p-2 rounded text-black bg-white text-sm"
                      rows={2}
                      placeholder="Update message"
                    />
                    <select
                      value={updateForm.status}
                      onChange={(e) =>
                        handleUpdateFormChange(incident._id, "status", e.target.value)
                      }
                      className="p-2 rounded text-black bg-white text-sm"
                    >
                      {INCIDENT_UPDATE_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="bg-blue-500 hover:bg-blue-600 px-3 py-1.5 rounded text-sm"
                    >
                      Post Update
                    </button>
                  </form>

                  {/* Resolve button */}
                  <div className="border-t border-gray-700 pt-4">
                    <button
                      className="resolve-btn bg-yellow-600 hover:bg-yellow-700 px-3 py-1.5 rounded text-sm"
                      data-id={incident._id}
                      onClick={(e) => handleResolve(e.currentTarget.dataset.id)}
                    >
                      Resolve Incident
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

// Protect page server-side — only the admin Discord account may access
export async function getServerSideProps(context) {
  const session = await getSession(context);
  if (!session || session.user.id !== ADMIN_DISCORD_ID) {
    return { redirect: { destination: "/", permanent: false } };
  }
  return { props: { session } };
}
