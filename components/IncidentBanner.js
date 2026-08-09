import { useEffect, useRef, useState } from "react";

const BANNER_DISMISSED_KEY = "incidentBannerClosed";
const BANNER_Z_INDEX = 9999;

const SEVERITY_COLORS = {
  critical: "#ed4245",
  major: "#e67e22",
  minor: "#faa61a",
};

function HoverLink({ href, children }) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={href}
      style={{
        color: "#00aff4",
        textDecoration: "none",
        backgroundColor: hovered ? "rgba(0, 175, 244, 0.2)" : "rgba(0, 175, 244, 0.1)",
        padding: "2px 10px",
        borderRadius: "4px",
        fontSize: "14px",
        display: "inline-block",
        transition: "background-color 0.15s",
      }}
      onMouseOver={() => setHovered(true)}
      onMouseOut={() => setHovered(false)}
    >
      {children}
    </a>
  );
}

export default function IncidentBanner() {
  const [banner, setBanner] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const bannerRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem(BANNER_DISMISSED_KEY) === "true") {
      setDismissed(true);
      return;
    }

    const loadIncidentBanner = async () => {
      try {
        const res = await fetch("/api/banner");
        if (res.ok) {
          const data = await res.json();
          if (data.active) setBanner(data);
        }
      } catch (err) {
        console.error("Banner fetch error:", err);
      }
    };

    loadIncidentBanner();
  }, []);

  // Adjust body padding so fixed banner doesn't overlap page content
  useEffect(() => {
    if (dismissed || !banner) {
      document.body.style.paddingTop = "";
      return;
    }
    const el = bannerRef.current;
    if (el) {
      document.body.style.paddingTop = el.offsetHeight + "px";
    }
    return () => {
      document.body.style.paddingTop = "";
    };
  }, [banner, dismissed]);

  const handleDismiss = () => {
    setDismissed(true);
    if (typeof window !== "undefined") {
      localStorage.setItem(BANNER_DISMISSED_KEY, "true");
    }
  };

  if (dismissed || !banner || !Array.isArray(banner.incidents)) return null;

  const severities = banner.incidents.map((i) => i.severity);
  const severityOrder = ["critical", "major", "minor"];
  const topSeverity = severityOrder.find((s) => severities.includes(s)) ?? "minor";
  const borderColor = SEVERITY_COLORS[topSeverity];

  return (
    <div
      ref={bannerRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: BANNER_Z_INDEX,
        backgroundColor: "#2b2d31",
        borderLeft: `4px solid ${borderColor}`,
        boxShadow: "0 2px 12px rgba(0, 0, 0, 0.6)",
        padding: "12px 20px",
      }}
    >
      <div style={{ maxWidth: "860px", margin: "0 auto", position: "relative", paddingRight: "28px" }}>
        {/* Close button */}
        <button
          onClick={handleDismiss}
          aria-label="Dismiss incident banner"
          style={{
            position: "absolute",
            top: "50%",
            right: 0,
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            color: "#b9bbbe",
            cursor: "pointer",
            fontSize: "18px",
            lineHeight: 1,
            padding: "4px",
          }}
        >
          ✕
        </button>

        {/* Title */}
        <p style={{ fontWeight: "bold", color: "#ffffff", fontSize: "15px", marginBottom: "2px" }}>
          Zavro Bot 🚨
        </p>

        {/* Subtitle */}
        <p style={{ color: "#b9bbbe", fontSize: "13px", marginBottom: "8px" }}>Active Incidents</p>

        {/* Incident list */}
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {banner.incidents.map((incident) => (
            <li key={incident._id}>
              <HoverLink href={`/incidents/${incident._id}`}>{incident.title}</HoverLink>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
