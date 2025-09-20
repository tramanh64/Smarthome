// src/pages/Dashboard.jsx

import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../services/auth";
import { db } from "../firebaseConfig";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";

// Import custom hook và các component con
import { useHomeData } from "../hooks/useHomeData";
import SensorCard from "../components/Dashboard/SensorCard";
import ActuatorToggle from "../components/Dashboard/ActuatorToggle";

const HOME_ID = "my_home_id";

// --- Các hàm tiện ích có thể giữ lại hoặc chuyển ra file riêng ---
function formatTimestamp(ts) {
  if (!ts) return "-";
  const date = ts.toDate ? ts.toDate() : ts;
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(date);
}

export default function Dashboard() {
  const nav = useNavigate();
  const { home, loading } = useHomeData(); // <-- Gọi custom hook

  async function handleLogout() {
    await logout();
    nav("/login");
  }

  // Hàm này vẫn cần ở đây vì nó thay đổi dữ liệu
  async function toggleActuator(key, nextValue) {
    if (!home) return;
    const ref = doc(db, "homes", HOME_ID);
    await updateDoc(ref, {
      [`actuators.${key}`]: nextValue,
      last_updated: serverTimestamp(),
    });
  }

  const statusColor = useMemo(() => {
    if (!home) return "#6b7280";
    switch (home.security_status) {
      case "alert_motion": return "#f59e0b";
      case "alert_sound": return "#ef4444";
      default: return "#10b981";
    }
  }, [home]);

  if (loading) {
    return <div style={{ padding: 40, fontFamily: "sans-serif" }}><h2>Đang tải Dashboard…</h2></div>;
  }

  if (!home) {
    return <div style={{ padding: 40, fontFamily: "sans-serif" }}><h2>Không tìm thấy dữ liệu nhà</h2><button onClick={handleLogout}>Log out</button></div>;
  }

  const { name, sensors = {}, actuators = {} } = home;

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", fontFamily: "sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>SmartHome Dashboard</h1>
        <span style={{ marginLeft: "auto", padding: "4px 10px", borderRadius: 999, background: statusColor, color: "#fff", fontSize: 12, fontWeight: 700 }} title="security_status">
          {home.security_status}
        </span>
        <button onClick={handleLogout}>Log out</button>
      </div>
      <p style={{ color: "#64748b", margin: 0 }}>
        Home: <b>{name}</b> • Last updated: <b>{formatTimestamp(home.last_updated)}</b>
      </p>

      <hr style={{ margin: "20px 0" }} />

      {/* Sensors */}
      <h3>Sensors</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
        <SensorCard title="Motion (PIR)">{sensors.motion ? "Detected" : "No motion"}</SensorCard>
        <SensorCard title="Light Level (lux)">{Number(sensors.light_level ?? 0)}</SensorCard>
        <SensorCard title="Temperature (°C)">{Number(sensors.temperature ?? 0)}</SensorCard>
        <SensorCard title="Humidity (%)">{Number(sensors.humidity ?? 0)}</SensorCard>
        <SensorCard title="Sound Detected">{sensors.sound_detected ? "Yes" : "No"}</SensorCard>
      </div>

      <hr style={{ margin: "20px 0" }} />

      {/* Actuators */}
      <h3>Actuators</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
        <ActuatorToggle title="Fan" on={!!actuators.fan_on} onChange={(v) => toggleActuator("fan_on", v)} />
        <ActuatorToggle title="Alarm" on={!!actuators.alarm_on} onChange={(v) => toggleActuator("alarm_on", v)} />
        <ActuatorToggle title={actuators.door_locked ? "Door (Locked)" : "Door (Unlocked)"} on={!actuators.door_locked} onChange={(v) => toggleActuator("door_locked", !v)} labels={{ on: "Unlock", off: "Lock" }} />
      </div>
    </div>
  );
}