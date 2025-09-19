import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../services/auth";
import { db } from "../firebaseConfig";
import {
  doc,
  onSnapshot,
  updateDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

const HOME_ID = "my_home_id"; // đổi nếu cần

export default function Dashboard() {
  const nav = useNavigate();
  const [home, setHome] = useState(null);
  const [loading, setLoading] = useState(true);

  // ---- Logout ----
  async function handleLogout() {
    await logout();
    nav("/login");
  }

  // ---- Subscribe Firestore doc ----
  useEffect(() => {
    const ref = doc(db, "homes", HOME_ID);
    const unsub = onSnapshot(
      ref,
      async (snap) => {
        if (!snap.exists()) {
          // tạo document mẫu nếu chưa có
          const sample = {
            name: "Nhà của tôi",
            security_status: "safe", // "alert_motion" | "alert_sound"
            sensors: {
              motion: false,
              light_level: 750,
              temperature: 28.5,
              humidity: 70,
              sound_detected: false,
            },
            actuators: {
              fan_on: true,
              alarm_on: false,
              door_locked: true,
            },
            last_updated: serverTimestamp(),
          };
          await setDoc(ref, sample);
          return;
        }
        setHome(snap.data());
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  // ---- Helpers ----
  const statusColor = useMemo(() => {
    switch (home?.security_status) {
      case "alert_motion":
        return "#f59e0b";
      case "alert_sound":
        return "#ef4444";
      default:
        return "#10b981";
    }
  }, [home]);

  async function toggleActuator(key, nextValue) {
    if (!home) return;
    const ref = doc(db, "homes", HOME_ID);
    // optimistic UI
    setHome((h) => ({
      ...h,
      actuators: { ...h.actuators, [key]: nextValue },
      last_updated: new Date(),
    }));
    await updateDoc(ref, {
      [`actuators.${key}`]: nextValue,
      last_updated: serverTimestamp(),
    });
  }

  function fmtTs(ts) {
    if (!ts) return "-";
    // ts có thể là Timestamp Firestore hoặc Date
    const date = ts.toDate ? ts.toDate() : ts;
    return new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "short",
      timeStyle: "medium",
    }).format(date);
  }

  if (loading) {
    return (
      <div style={{ maxWidth: 800, margin: "40px auto", fontFamily: "sans-serif" }}>
        <h2>Đang tải Dashboard…</h2>
      </div>
    );
  }

  if (!home) {
    return (
      <div style={{ maxWidth: 800, margin: "40px auto", fontFamily: "sans-serif" }}>
        <h2>Không tìm thấy dữ liệu nhà</h2>
        <button onClick={handleLogout}>Log out</button>
      </div>
    );
  }

  const { name, sensors = {}, actuators = {} } = home;

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", fontFamily: "sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h1 style={{ margin: 0 }}>SmartHome Dashboard</h1>
        <span
          style={{
            marginLeft: "auto",
            padding: "4px 10px",
            borderRadius: 999,
            background: statusColor,
            color: "#fff",
            fontSize: 12,
            fontWeight: 700,
          }}
          title="security_status"
        >
          {home.security_status}
        </span>
        <button onClick={handleLogout}>Log out</button>
      </div>

      <p style={{ color: "#64748b", marginTop: 8, marginBottom: 16 }}>
        Home: <b>{name}</b> • Last updated: <b>{fmtTs(home.last_updated)}</b>
      </p>

      <hr />

      {/* Sensors */}
      <h3>Sensors</h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
        }}
      >
        <Card title="Motion (PIR)">
          {sensors.motion ? "Detected" : "No motion"}
        </Card>
        <Card title="Light Level (lux)">
          {Number(sensors.light_level ?? 0)}
        </Card>
        <Card title="Temperature (°C)">
          {Number(sensors.temperature ?? 0)}
        </Card>
        <Card title="Humidity (%)">
          {Number(sensors.humidity ?? 0)}
        </Card>
        <Card title="Sound Detected">
          {sensors.sound_detected ? "Yes" : "No"}
        </Card>
      </div>

      <hr style={{ margin: "20px 0" }} />

      {/* Actuators */}
      <h3>Actuators</h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 12,
        }}
      >
        <ToggleCard
          title="Fan"
          on={!!actuators.fan_on}
          onChange={(v) => toggleActuator("fan_on", v)}
        />
        <ToggleCard
          title="Alarm"
          on={!!actuators.alarm_on}
          onChange={(v) => toggleActuator("alarm_on", v)}
        />
        <ToggleCard
          title={actuators.door_locked ? "Door (Locked)" : "Door (Unlocked)"}
          on={!actuators.door_locked}
          onChange={(v) => toggleActuator("door_locked", !v)}
          labels={{ on: "Unlock", off: "Lock" }}
        />
      </div>
    </div>
  );
}

/* --------------------- Small presentational bits --------------------- */
function Card({ title, children }) {
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 14,
        background: "#fff",
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", marginBottom: 8 }}>
        {title}
      </div>
      <div style={{ fontSize: 18 }}>{children}</div>
    </div>
  );
}

function ToggleCard({ title, on, onChange, labels = { on: "On", off: "Off" } }) {
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 14,
        background: "#fff",
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
