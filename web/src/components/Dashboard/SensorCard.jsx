// src/components/Dashboard/SensorCard.jsx

export default function SensorCard({ title, children }) {
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
      <div style={{ fontSize: 18, fontWeight: 600 }}>{children}</div>
    </div>
  );
}