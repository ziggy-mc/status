import Head from "next/head";
import { useEffect, useState } from "react";

const STATUS_COLORS = {
  Online: "bg-green-500",
  "No Impact": "bg-green-500",
  Degraded: "bg-yellow-500",
  "Minor Impact": "bg-yellow-500",
  "Major Impact": "bg-red-500",
  Offline: "bg-red-500",
  Maintenance: "bg-blue-500",
  "Other Issues": "bg-blue-500",
  Beta: "bg-purple-500",
  "Awaiting Storm": "bg-purple-500",
};

const SEVERITY_STYLES = {
  critical: { bar: "bg-red-600", badge: "bg-red-600", label: "Critical" },
  major:    { bar: "bg-orange-500", badge: "bg-orange-500", label: "Major" },
  minor:    { bar: "bg-yellow-500", badge: "bg-yellow-500", label: "Minor" },
};

function CompactStatusRow({ service, status }) {
  const color = STATUS_COLORS[status] || "bg-gray-500";
  return (
    <div className="flex items-center justify-between px-3 py-2 rounded-md bg-gray-800">
      <span className="text-sm text-gray-200">{service}</span>
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full text-white ${color}`}>
        {status}
      </span>
    </div>
  );
}

function IncidentNotification({ incident, onClose }) {
  const sev = SEVERITY_STYLES[incident.severity] || SEVERITY_STYLES.minor;
  return (
    <div className="rounded-lg overflow-hidden border border-gray-700 shadow-lg mb-3">
      <div className={`${sev.bar} px-3 py-1.5 flex items-center justify-between`}>
        <span className="text-xs font-semibold text-white uppercase tracking-wide">
          {sev.label} Incident
        </span>
        <button
          onClick={() => onClose(incident._id)}
          aria-label="Dismiss incident notification"
          className="text-white hover:text-gray-200 text-lg leading-none"
        >
          &times;
        </button>
      </div>
      <div className="bg-gray-800 px-3 py-3">
        <p className="text-sm font-semibold text-white mb-1">{incident.title}</p>
        <p className="text-xs text-gray-300 mb-2 leading-relaxed">{incident.description}</p>
        <a
          href={`https://status.zavrobot.tech/incidents/${incident._id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-400 hover:underline"
        >
          View incident &rarr;
        </a>
      </div>
    </div>
  );
}

export default function Embed() {
  const [services, setServices] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [dismissed, setDismissed] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = async () => {
    try {
      const [statusRes, bannerRes] = await Promise.all([
        fetch("/api/status"),
        fetch("/api/banner"),
      ]);

      if (statusRes.ok) {
        const data = await statusRes.json();
        setServices([
          { service: "Website",           status: data.website || "Online" },
          { service: "API",               status: data.api     || "Online" },
          { service: "Database",          status: data.database|| "Online" },
          { service: "Dashboard",         status: data.auth    || "Online" },
          { service: "Bot Server/Host",   status: data.bot     || "Online" },
          { service: "Commands / Events", status: data.cmdev   || "Online" },
        ]);
        setLastUpdated(new Date());
      }

      if (bannerRes.ok) {
        const banner = await bannerRes.json();
        if (banner.active && banner.incidents) {
          setIncidents(banner.incidents);
        } else {
          setIncidents([]);
        }
      }
    } catch (err) {
      console.error(err);
      setServices([
        { service: "Website",           status: "Degraded" },
        { service: "API",               status: "Degraded" },
        { service: "Database",          status: "Degraded" },
        { service: "Dashboard",         status: "Degraded" },
        { service: "Bot Server/Host",   status: "Degraded" },
        { service: "Commands / Events", status: "Degraded" },
      ]);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleDismiss = (id) => setDismissed((prev) => [...prev, id]);

  const visibleIncidents = incidents.filter((inc) => !dismissed.includes(inc._id));

  return (
    <>
      <Head>
        <meta name="robots" content="noindex" />
        <meta name="theme-color" content="#5865F2" />
        <title>System Status | Zavro Discord Bot</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4">
        <h1 className="text-lg font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 text-center">
          System Status
        </h1>

        {/* Incident notification boxes */}
        {visibleIncidents.map((inc) => (
          <IncidentNotification key={inc._id} incident={inc} onClose={handleDismiss} />
        ))}

        {/* Compact service status rows */}
        <div className="space-y-1.5">
          {services.map((s, i) => (
            <CompactStatusRow key={i} service={s.service} status={s.status} />
          ))}
        </div>

        <div className="mt-3 text-center text-xs text-gray-500">
          {lastUpdated && (
            <span>Updated {lastUpdated.toLocaleTimeString()} &mdash; </span>
          )}
          <a
            href="https://status.zavrobot.tech"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            Zavro Status
          </a>
        </div>
      </div>
    </>
  );
}
