import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import Layout from "../../components/Layout";

const SEVERITY_STYLES = {
  critical: {
    badge: "bg-red-600 text-white",
    border: "border-red-500",
    heading: "text-red-400",
  },
  major: {
    badge: "bg-orange-500 text-white",
    border: "border-orange-500",
    heading: "text-orange-400",
  },
  minor: {
    badge: "bg-yellow-500 text-black",
    border: "border-yellow-500",
    heading: "text-yellow-400",
  },
};

const STATUS_LABEL = {
  investigating: "Investigating",
  identified: "Identified",
  monitoring: "Monitoring",
  resolved: "Resolved",
};

export default function IncidentPage() {
  const router = useRouter();
  const { id } = router.query;
  const [incident, setIncident] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchIncident = async () => {
      try {
        const res = await fetch(`/api/incidents/${id}`);
        if (!res.ok) {
          setError("Incident not found.");
          return;
        }
        const data = await res.json();
        setIncident(data);
      } catch (err) {
        setError("Failed to load incident.");
      } finally {
        setLoading(false);
      }
    };
    fetchIncident();
  }, [id]);

  const severity = incident?.severity;
  const knownSeverity = Object.prototype.hasOwnProperty.call(SEVERITY_STYLES, severity);
  const styles = knownSeverity ? SEVERITY_STYLES[severity] : SEVERITY_STYLES.minor;
  const isResolved = incident?.status === "resolved";

  const sortedUpdates = useMemo(
    () =>
      incident?.updates
        ? [...incident.updates].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          )
        : [],
    [incident]
  );

  return (
    <>
      <Head>
        <meta property="og:title" content="Incident | Zavro Discord Bot" />
        <meta name="theme-color" content="#5865F2" />
      </Head>
      <Layout title="Incident Report">
        <div className="max-w-2xl mx-auto">
          <a href="/" className="text-blue-400 underline text-sm mb-6 inline-block">
            ← Back to Status
          </a>

          {loading && (
            <p className="text-gray-400 text-center mt-12">Loading incident…</p>
          )}

          {error && (
            <p className="text-red-400 text-center mt-12">{error}</p>
          )}

          {incident && (
            <div className={`bg-gray-800 border rounded-xl p-6 ${styles.border}`}>
              {/* Title & Severity */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <h2 className={`text-2xl font-bold ${styles.heading}`}>
                  {incident.title}
                </h2>
                <span
                  className={`text-sm font-semibold px-3 py-1 rounded-full ${styles.badge}`}
                >
                  {knownSeverity
                    ? severity.charAt(0).toUpperCase() + severity.slice(1)
                    : severity}
                </span>
              </div>

              {/* Status */}
              <p className="text-gray-300 mb-6">
                <span className="font-semibold text-white">Status: </span>
                <span
                  className={
                    isResolved ? "text-green-400 font-semibold" : "text-yellow-300 font-semibold"
                  }
                >
                  {STATUS_LABEL[incident.status] || incident.status}
                </span>
              </p>

              {/* Timeline */}
              <h3 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">
                Updates
              </h3>
              {sortedUpdates.length === 0 ? (
                <p className="text-gray-400 text-sm">No updates yet.</p>
              ) : (
                <ol className="relative border-l border-gray-600 space-y-6 ml-2">
                  {sortedUpdates.map((update, i) => (
                    <li key={update._id || `${update.createdAt}-${i}`} className="ml-4">
                      <div className="absolute -left-[7px] w-3 h-3 bg-gray-400 rounded-full border-2 border-gray-800" />
                      <p className="text-xs text-gray-500 mb-1">
                        {new Date(update.createdAt).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                        {" · "}
                        <span className="capitalize">{update.status}</span>
                      </p>
                      <p className="text-gray-200 text-sm">{update.message}</p>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          )}
        </div>
      </Layout>
    </>
  );
}
