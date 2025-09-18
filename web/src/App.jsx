import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { watchAuth } from "./services/auth";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

// Route bảo vệ: chỉ cho vào nếu có user
function PrivateRoute({ user, children }) {
  if (user === undefined) {
    // đang kiểm tra trạng thái đăng nhập -> show loading
    return <div style={{ padding: 24, textAlign: "center" }}>Loading…</div>;
  }
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const unsub = watchAuth(setUser);
    return () => unsub();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Mặc định đi vào login trước */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute user={user}>
              <Dashboard user={user} />
            </PrivateRoute>
          }
        />
        <Route path="/test" element={<div style={{ padding: 20 }}>Router OK</div>} />


        {/* Catch-all */}
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}
