import { useEffect, useState } from "react";

type Alert = {
  id: number;
  tier: "ACTION" | "NOTICE" | "CRITICAL" | string;
  parameter_code: string;
  location_label: string;
  title: string;
  message: string;
  occurrence_count: number;
  last_seen_at: string;
  delivery_channel?: string;
  status?: string;
};

export default function AlertFeed() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8001/api/v1/alerts");

      if (!res.ok) {
        throw new Error(`Failed to fetch alerts: ${res.status}`);
      }

      const data = await res.json();
      setAlerts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch alerts", err);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  const getTierStyles = (tier: string) => {
    switch (tier) {
      case "CRITICAL":
        return {
          border: "border-red-700",
          bg: "bg-red-50",
          badge: "bg-red-700 text-white",
        };
      case "ACTION":
        return {
          border: "border-red-500",
          bg: "bg-red-50",
          badge: "bg-red-600 text-white",
        };
      case "NOTICE":
        return {
          border: "border-yellow-500",
          bg: "bg-yellow-50",
          badge: "bg-yellow-500 text-black",
        };
      default:
        return {
          border: "border-gray-300",
          bg: "bg-white",
          badge: "bg-gray-400 text-white",
        };
    }
  };

  const formatTime = (time: string) => {
    const date = new Date(time);
    return Number.isNaN(date.getTime()) ? time : date.toLocaleString();
  };

  return (
    <div className="mt-8 bg-zinc-900 rounded-xl border border-zinc-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-semibold text-white">Live Alerts</h3>
        <span className="text-sm text-zinc-400">Auto-refresh every 5s</span>
      </div>

      {loading && (
        <div className="text-zinc-400 text-sm animate-pulse">Loading alerts...</div>
      )}

      {!loading && alerts.length === 0 && (
        <div className="text-zinc-500 text-sm">No alerts detected</div>
      )}

      <div className="space-y-4">
        {alerts.map((alert) => {
          const styles = getTierStyles(alert.tier);

          return (
            <div
              key={alert.id}
              className={`rounded-xl border p-5 shadow ${styles.border} ${styles.bg}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="text-black text-lg font-semibold">
                    {alert.title}
                  </h4>

                  <div className="mt-2 text-sm text-zinc-700">
                    📍 {alert.location_label || "Unknown location"}
                  </div>

                  <div className="mt-4 text-sm text-zinc-800 leading-6">
                    {alert.message.length > 140
                      ? `${alert.message.slice(0, 140)}...`
                      : alert.message}
                  </div>
                </div>

                <span className={`text-xs px-3 py-1 rounded font-medium ${styles.badge}`}>
                  {alert.tier}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap justify-between gap-3 text-xs text-zinc-600">
                <span>
                  Seen {alert.occurrence_count} time
                  {alert.occurrence_count > 1 ? "s" : ""}
                </span>
                <span>{formatTime(alert.last_seen_at)}</span>
                {alert.delivery_channel ? <span>{alert.delivery_channel}</span> : null}
                {alert.status ? <span>{alert.status}</span> : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}