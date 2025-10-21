// src/pages/Dashboard.jsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../services/auth";
import { db } from "../firebaseConfig";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";

// MUI Components
import {
  Grid,
  Switch,
  FormControlLabel,
  Container,
  Box,
  Typography,
  Button,
  Chip,
  Divider,
  CircularProgress,
} from "@mui/material";

// Hooks & Components
import { useHomeData } from "../hooks/useHomeData";
import { useSimulation } from "../hooks/useSimulation"; // Dùng hook giả lập mới
import { useSensorHistory } from "../hooks/useSensorHistory";
import SensorCard from "../components/Dashboard/SensorCard";
import ActuatorToggle from "../components/Dashboard/ActuatorToggle";
import SensorHistoryChart from "../components/Dashboard/SensorHistoryChart";

const HOME_ID = "my_home_id";

// --- util: format timestamp
function formatTimestamp(ts) {
  if (!ts) return "-";
  // Hỗ trợ cả object Date của JS và Timestamp của Firestore
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return new Intl.DateTimeFormat("en-US", {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', second: '2-digit',
  }).format(date);
}

export default function Dashboard() {
  const nav = useNavigate();
  const [sim, setSim] = useState(true);

  // --- Lấy dữ liệu thật từ Firestore ---
  const { home, loading } = useHomeData(HOME_ID);
  const firestoreHistory = useSensorHistory(HOME_ID, 120);

  // --- Lấy dữ liệu giả lập từ local (chạy trên trình duyệt) ---
  // Hook này bây giờ trả về dữ liệu để hiển thị trực tiếp
  const { currentSensors: simSensors, history: simHistory } = useSimulation(sim, 2000, 120);

  // --- Chọn nguồn dữ liệu để hiển thị, dựa trên `sim` state ---
  const displaySensors = sim ? simSensors : home?.sensors || {};
  const displayHistory = sim ? simHistory : firestoreHistory;
  const displayName = sim ? "My Simulated Home" : home?.name;
  const displayLastUpdated = sim ? new Date() : home?.last_updated;
  const displayActuators = sim ? { fan_on: true, alarm_on: false, door_locked: true } : home?.actuators || {};
  const displayStatus = sim ? "safe" : home?.security_status;

  async function handleLogout() {
    await logout();
    nav("/login");
  }

  // Cập nhật actuator -> chỉ hoạt động khi không ở chế độ giả lập
  async function toggleActuator(key, nextValue) {
    if (sim || !home) return;
    const ref = doc(db, "homes", HOME_ID);
    await updateDoc(ref, {
      [`actuators.${key}`]: nextValue,
      last_updated: serverTimestamp(),
    });
  }
  
  const statusColor = useMemo(() => {
    if (!displayStatus) return "default";
    switch (displayStatus) {
      case "alert_motion": return "warning";
      case "alert_sound": return "error";
      default: return "success";
    }
  }, [displayStatus]);

  // Loading state (chỉ áp dụng khi tắt simulation)
  if (loading && !sim) {
    return (
      <Box sx={{ p: 5, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading Dashboard…</Typography>
      </Box>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ my: 5 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
        <Typography variant="h4" component="h1" sx={{ m: 0, flexGrow: 1 }}>
          SmartHome Dashboard
        </Typography>
        <FormControlLabel
          control={<Switch checked={sim} onChange={(e) => setSim(e.target.checked)} />}
          label="Simulation Mode"
        />
        <Chip label={displayStatus} color={statusColor} title="security_status" />
        <Button variant="outlined" onClick={handleLogout}>Log out</Button>
      </Box>

      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Home: <b>{displayName}</b> • Last updated:{" "}
        <b>{formatTimestamp(displayLastUpdated)}</b>
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h5" component="h2" sx={{ mb: 3 }}>Sensors</Typography>
      <Box 
        sx={{ 
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 4,
          py: 2
        }}
      >
        <SensorCard title="Motion (PIR)">
          {displaySensors.motion ? "Yes" : "No"}
        </SensorCard>
        <SensorCard title="Temperature (°C)">
          {Number(displaySensors.temperature ?? 0).toFixed(1)}
        </SensorCard>
        <SensorCard title="Humidity (%)">
          {Number(displaySensors.humidity ?? 0).toFixed(1)}
        </SensorCard>
        <SensorCard title="Sound Detected">
          {displaySensors.sound_detected ? "Yes" : "No"}
        </SensorCard>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Actuators */}
      <Typography variant="h5" component="h2" sx={{ mb: 3 }}>Actuators</Typography>
      <Box 
        sx={{ 
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 4,
          py: 2
        }}
      >
        <ActuatorToggle
          title="Fan"
          on={!!displayActuators.fan_on}
          onChange={(v) => toggleActuator("fan_on", v)}
          disabled={sim}
        />
        <ActuatorToggle
          title="Alarm"
          on={!!displayActuators.alarm_on}
          onChange={(v) => toggleActuator("alarm_on", v)}
          disabled={sim}
        />
        <ActuatorToggle
          title={displayActuators.door_locked ? "Door (Locked)" : "Door (Unlocked)"}
          on={!displayActuators.door_locked}
          onChange={(v) => toggleActuator("door_locked", !v)}
          disabled={sim}
        />
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Charts */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 'bold' }}>
          Sensor History
        </Typography>
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'row', 
            gap: 4,
            px: 2
          }}
        >
          <Box sx={{ flex: 1 }}>
            <SensorHistoryChart
              title="Temperature"
              data={displayHistory}
              dataKey="temperature"
              unit="°C"
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <SensorHistoryChart
              title="Humidity"
              data={displayHistory}
              dataKey="humidity"
              unit="%"
            />
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
