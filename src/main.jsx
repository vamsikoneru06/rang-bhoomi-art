import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./lib/gsap.js"; // register all GSAP plugins globally first
import "./styles/tokens.css";
import "./styles/global.css";
import "./styles/glass.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
