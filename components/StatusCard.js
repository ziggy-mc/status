import { motion } from "framer-motion";

// Extract status color mapping to constant to avoid recreating on every render
const STATUS_COLORS = {
  "Online": "bg-green-500",
  "No Impact": "bg-green-500",
  minor: "bg-yellow-500",
  major: "bg-orange-500",
  critical: "bg-red-500",
  "Offline": "bg-red-500",
  "Major Impact": "bg-red-500",
  "Degraded": "bg-yellow-500",
  "Minor Impact": "bg-yellow-500",
  "Maintenance": "bg-blue-500",
  "Other Issues": "bg-blue-500",
  "Beta": "bg-gradient-to-r from-purple-500 to-blue-500",
  "Awaiting Storm": "bg-gradient-to-r from-purple-500 to-blue-500",
};

export default function StatusCard({ service, status, message }) {
  const statusColor = STATUS_COLORS[status] || "bg-gray-500";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 mb-4 rounded-lg bg-gray-800 shadow-lg"
    >
      <div className="flex flex-col sm:flex-row justify-between items-center mb-2 gap-2">
        <h2 className="text-xl font-semibold text-center sm:text-left">{service}</h2>
        <span className={`px-4 py-1 rounded-full text-white ${statusColor}`}>
          {status}
        </span>
      </div>
      {message && <p className="text-gray-300 text-center sm:text-left">{message}</p>}
    </motion.div>
  );
}
