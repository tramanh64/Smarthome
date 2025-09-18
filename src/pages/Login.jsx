import { useState } from "react";
import { loginEmailPassword, registerEmailPassword } from "../services/auth";
import { useNavigate } from "react-router-dom";

// MUI
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  IconButton,
  InputAdornment,
  Divider,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export default function Login() {
  const nav = useNavigate();
  const [mode, setMode] = useState("login"); // 'login' | 'register'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      setBusy(true);
      if (mode === "login") {
        await loginEmailPassword(email, password);
      } else {
        await registerEmailPassword(email, password);
      }
      nav("/dashboard");
    } catch (err) {
      const msg = err?.code?.replace("auth/", "").replaceAll("-", " ") || err.message;
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    // nền gradient rực rỡ
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg,#6366f1 0%,#3b82f6 50%,#06b6d4 100%)",
        px: 2,
      }}
    >
      <Container component="main" maxWidth="xs">
        <Paper elevation={10} sx={{ p: 4, borderRadius: 3 }}>
          <Typography
            variant="h5"
            align="center"
            fontWeight="700"
            sx={{ color: "primary.main" }}
            gutterBottom
          >
            {mode === "login" ? "Sign in to SmartHome" : "Create your account"}
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              label="Email"
              type="email"
              margin="normal"
              fullWidth
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <TextField
              label="Password"
              type={showPw ? "text" : "password"}
              margin="normal"
              fullWidth
              required
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPw((v) => !v)} edge="end">
                      {showPw ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={busy}
              sx={{ mt: 3, mb: 1.5, py: 1.2, fontWeight: 700 }}
            >
              {busy ? "Processing..." : mode === "login" ? "Sign In" : "Sign Up"}
            </Button>

            <Divider sx={{ my: 1.5 }} />

            <Button
              fullWidth
              variant="text"
              onClick={() => setMode((m) => (m === "login" ? "register" : "login"))}
            >
              {mode === "login"
                ? "Don't have an account? Sign Up"
                : "Already have an account? Sign In"}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
