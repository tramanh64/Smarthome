import { useNavigate } from "react-router-dom";
import { logout } from "../services/auth";

export default function Dashboard({ user }) {
  const nav = useNavigate();
  async function handleLogout() {
    await logout();
    nav("/login");
  }

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>SmartHome Dashboard</h1>
      <p>Welcome, <b>{user?.email}</b></p>
      <button onClick={handleLogout}>Log out</button>
      <hr />
      <p>sensor data + charts here.</p>
    </div>
  );
}
