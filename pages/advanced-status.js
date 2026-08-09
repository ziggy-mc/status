import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import StatusCard from "../components/StatusCard";
import IncidentBanner from "../components/IncidentBanner";

export default function AdvancedStatus() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [services, setServices] = useState([]);
  const [activeIncidents, setActiveIncidents] = useState([]);
  const [incidentHistory, setIncidentHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      // Use Next.js router for client-side navigation (faster than window.location)
      router.replace("/");
      return;
    }

    const fetchStatus = async () => {
      try {
        const [statusRes, historyRes, activeRes] = await Promise.all([
          fetch("/api/status"),
          fetch("/api/incidents?history=true"),
          fetch("/api/incidents"),
        ]);

        if (!statusRes.ok) throw new Error("Failed to fetch status");
        const data = await statusRes.json();

        setServices([
          { service: "Website 1 (mtr)", status: data.website1, message: data.websiteMessage1 },
          { service: "Website 2 (zavro)", status: data.website2, message: data.websiteMessage2 },
          { service: "Website (overall)", status: data.websiteoverall, message: data.websiteoverallmsg },
          { service: "Database 1 (mongo)", status: data.data1, message: data.data1msg },
          { service: "Database 2 (sqlite)", status: data.data2, message: data.data2msg },
          { service: "Database (overall)", status: data.dataoverall, message: data.dataoverallmsg },
          { service: "VPS 1 (mtr,live)", status: data.vps1, message: data.vps1msg },
          { service: "VPS 2 (zavro)", status: data.vps2, message: data.vps2msg },
          { service: "VPS (overall)", status: data.vpsoverall, message: data.vpsoverallmsg },
          { service: "CDN", status: data.cdn, message: data.cdnmsg },
        ]);

        if (historyRes.ok) {
          const historyData = await historyRes.json();
          setIncidentHistory(historyData);
        }

        if (activeRes.ok) {
          const activeData = await activeRes.json();
          setActiveIncidents(activeData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [session, status, router]);

  if (status === "loading" || loading) {
    return (
      <Layout title="Advanced System Status">
        <p className="text-center mt-10 text-gray-400">Loading...</p>
      </Layout>
    );
  }

  return (
    <Layout title="Advanced System Status | muiwzi services">
      {/* Active Incidents Banner */}
      <IncidentBanner />

      {/* Logout button */}
      <div className="text-center mb-6">
        <p className="mb-2">Welcome, {session.user.username}!</p>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="bg-red-500 hover:scale-105 transition-transform text-white font-bold py-2 px-4 rounded"
        >
          Logout
        </button>
      </div>

      <section className="max-w-3xl mx-auto space-y-6 mt-6">
        <h1 className="text-4xl font-bold mb-6 text-center"></h1>
        {services.map((s, i) => (
          <StatusCard key={i} {...s} />
        ))}
      </section>
      
   
      {/* Active Incidents */}
      <section className="mt-12 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-center">Active Incidents</h2>
        {activeIncidents.length === 0 ? (
          <p className="text-center text-gray-400">No active incidents</p>
        ) : (
          <ul className="space-y-3">
            {activeIncidents.map((incident) => (
              <li key={incident._id} className="bg-gray-800 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <a
                    href={`/incidents/${incident._id}`}
                    className="text-blue-400 underline font-semibold hover:text-blue-300"
                  >
                    {incident.title}
                  </a>
                  <div className="text-sm text-gray-400 mt-1">
                    <span className="capitalize mr-3">Severity: {incident.severity}</span>
                    <span className="capitalize">Status: {incident.status}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Incident History */}
      <section className="mt-12 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-center">Incident History (Last 30 Days)</h2>
        {incidentHistory.length === 0 ? (
          <p className="text-center text-gray-400">No incidents in the past 30 days</p>
        ) : (
          <ul className="space-y-3">
            {incidentHistory.map((incident) => (
              <li key={incident._id} className="bg-gray-800 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <a
                    href={`/incidents/${incident._id}`}
                    className="text-blue-400 underline font-semibold hover:text-blue-300"
                  >
                    {incident.title}
                  </a>
                  <div className="text-sm text-gray-400 mt-1">
                    <span className="capitalize mr-3">Severity: {incident.severity}</span>
                    <span>
                      Resolved:{" "}
                      {incident.resolvedAt
                        ? new Date(incident.resolvedAt).toLocaleString()
                        : "—"}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      

      {/* Contact Us */}
      <section className="mt-16 max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4">Contact Us</h2>
        <p className="text-gray-300 mb-2">
          Need assistance or want to report an issue? Our support team is available from 09:00 - 21:00 UTC-04.
        </p>
        <p>
          Email us at{" "}
          <a href="mailto:support@ziggymc.me" className="text-blue-400 underline">
            support@ziggymc.me
          </a>
        </p>
      </section>
    </Layout>
  );
}
