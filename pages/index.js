import Head from "next/head";
import { useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import StatusCard from "../components/StatusCard";
import IncidentBanner from "../components/IncidentBanner";
import { ADMIN_DISCORD_ID } from "../lib/constants";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [services, setServices] = useState([]);
  const [activeIncidents, setActiveIncidents] = useState([]);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [embedCopied, setEmbedCopied] = useState(false);

  const getEmbedCode = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://status.zavrobot.tech";
    return `<iframe\n  src="${origin}/embed"\n  width="600"\n  height="500"\n  style="border:none;border-radius:12px;"\n  title="Zavro Bot System Status"\n></iframe>`;
  };

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(getEmbedCode()).then(() => {
      setEmbedCopied(true);
      setTimeout(() => setEmbedCopied(false), 2000);
    }).catch(() => {
      alert("Failed to copy embed code. Please copy it manually.");
    });
  };

  const handleLoginClick = () => {
    const agreed = typeof window !== "undefined" && localStorage.getItem("termsAgreed");
    if (agreed) {
      signIn("discord");
    } else {
      setShowConsentModal(true);
    }
  };

  const handleAgree = () => {
    if (typeof window !== "undefined") localStorage.setItem("termsAgreed", "true");
    setShowConsentModal(false);
    signIn("discord");
  };
  
  
  // Redirect after login
  useEffect(() => {
    if (session) {
      if (session.user.id === ADMIN_DISCORD_ID) {
        router.replace("/select"); // Admin
      } else {
        router.replace("/advanced-status"); // Others
      }
    }
  }, [session, router]);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/status");
        if (!res.ok) throw new Error("Failed to fetch status");
        const data = await res.json();

        setServices([
          { service: "Website (overall)", status: data.websiteoverall, message: data.websiteoverallmsg },
          { service: "Database (overall)", status: data.dataoverall, message: data.dataoverallmsg },
          { service: "VPS (overall)", status: data.vpsoverall, message: data.vpsoverallmsg },
          { service: "CDN", status: data.cdn, message: data.cdnmsg },
        ]);
      } catch (err) {
        console.error(err);
        setServices([
          { service: "Website (overall)", status: "Degraded", message: "This status page is currently experiencing some issues, please check again later" },
          { service: "Database (overall)", status: "Degraded", message: "This status page is currently experiencing some issues, please check again later" },
          { service: "VPS (overall)", status: "Degraded", message: "This status page is currently experiencing some issues, please check again later" },
          { service: "CDN", status: "Degraded", message: "This status page is currently experiencing some issues, please check again later" },
        ]);
      }
    };

    fetchStatus();

    const fetchActiveIncidents = async () => {
      try {
        const res = await fetch("/api/incidents");
        if (res.ok) {
          const data = await res.json();
          setActiveIncidents(data);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchActiveIncidents();
  }, []);

  if (status === "loading") return null; // wait for session to load

  return (
    <>
    <Head>
        <meta property="og:title" content="System Status | muiwzi services" />
        <meta property="og:description" content="Check the current status of our infrastructure." />
        <meta property="og:url" content="https://status.ziggymc.me/" />
        <meta property="og:type" content="website" />
        <meta name="theme-color" content="#5865F2" />
      </Head>
    <Layout title="System Status | muiwzi services">
      
      {/* Active Incidents Banner */}
      <IncidentBanner />

      {/* Login / Logout Button */}
      {!session ? (
        <div className="text-center mt-8">
          <button
            onClick={handleLoginClick}
            className="bg-blue-500 hover:scale-105 transition-transform text-white font-bold py-2 px-4 rounded"
          >
            Login with Discord
          </button>
        </div>
      ) : (
        <div className="text-center mt-8">
          <p className="mb-2">Welcome, {session.user.username}!</p>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="bg-red-500 hover:scale-105 transition-transform text-white font-bold py-2 px-4 rounded"
          >
            Logout
          </button>
        </div>
      )}

      {/* Status Cards */}
      <section className="max-w-3xl mx-auto space-y-6 mt-12">
        {services.map((s, i) => (
          <StatusCard key={i} {...s} />
        ))}
      </section>
      
      <section className="mt-16 max-w-3xl mx-auto text-center">
        <p className="text-gray-300">
          For more in dept information, login with discord.
        </p>
        </section>

      {/* Active Incidents */}
      {activeIncidents.length > 0 && (
        <section className="mt-12 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-center">Active Incidents</h2>
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
        </section>
      )}

      {/* Contact Us */}
      <section className="mt-16 max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4">Contact Us</h2>
        <p className="text-gray-300 mb-2">
          Need assistance or want to report an issue? Our support team is available from 09:00 - 21:00 UTC-04.
        </p>
        <p>
          Email us at{" "}
          <a href="mailto:support.zavro@ziggymc.me" className="text-blue-400 underline">
            support@ziggymc.me
          </a>
        </p>
      </section>
    </Layout>

      {/* Terms & Privacy Consent Modal */}
      {showConsentModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60">
          <div className="bg-gray-800 text-white rounded-xl shadow-xl max-w-md w-full mx-4 p-8">
            <h2 className="text-2xl font-bold mb-4 text-center">Before you continue</h2>
            <p className="text-gray-300 mb-6 text-center">
              By logging in you agree to our{" "}
              <a
                href="https://www.zavrobot.tech/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="https://www.zavrobot.tech/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline"
              >
                Privacy Policy
              </a>
              .
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleAgree}
                className="bg-blue-500 hover:bg-blue-600 transition-colors text-white font-bold py-2 px-6 rounded"
              >
                I Agree
              </button>
              <button
                onClick={() => setShowConsentModal(false)}
                className="bg-gray-600 hover:bg-gray-500 transition-colors text-white font-bold py-2 px-6 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
