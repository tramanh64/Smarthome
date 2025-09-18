import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// MUI
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

// tạo theme global
const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#4f46e5", // xanh tím Indigo
    },
    secondary: {
      main: "#f59e0b", // cam vàng
    },
    background: {
      default: "#f3f4f6", // màu nền toàn trang
    },
  },
  typography: {
    fontFamily: "Inter, Roboto, Arial, sans-serif",
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* reset + đồng bộ font, màu nền */}
      <App />
    </ThemeProvider>
  </StrictMode>
);
