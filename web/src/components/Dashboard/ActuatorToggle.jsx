// src/components/Dashboard/ActuatorToggle.jsx

export default function ActuatorToggle({ title, on, onChange, labels = { on: "On", off: "Off" } }) {
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 14,
        background: "#fff",
        boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", marginBottom: 8 }}>
        {title}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button
          onClick={() => onChange(!on)}
          style={{
            padding: "8px 14px",
            borderRadius: 8,
            border: "1px solid #d1d5db",
            background: on ? "#10b981" : "#f3f4f6",
            color: on ? "#fff" : "#111827",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          {on ? labels.on : labels.off}
        </button>
        <span style={{ color: "#6b7280", fontSize: 13 }}>
          State: <b>{on ? "ON" : "OFF"}</b>
        </span>
      </div>
    </div>
  );
}