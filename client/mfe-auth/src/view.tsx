import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js"; // cho dropdown, v.v.
import "./styles/auth.css"; // style tinh chỉnh
import "./index.css";

import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";

const el = document.getElementById("root");
if (el) createRoot(el).render(<App />);