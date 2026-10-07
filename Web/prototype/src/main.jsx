import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.jsx";
import { motionCssVariables } from "./motion/tokens.js";
import "./styles/palette.css";
import "./styles/theme.css";
import "./styles.css";
import "./styles/profile.css";

for (const [name, value] of Object.entries(motionCssVariables)) {
  document.documentElement.style.setProperty(name, String(value));
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
