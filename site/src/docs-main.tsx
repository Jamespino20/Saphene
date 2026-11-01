import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import DocsApp from "./DocsApp";

createRoot(document.getElementById("docs-root")!).render(
  <StrictMode>
    <DocsApp />
  </StrictMode>,
);
