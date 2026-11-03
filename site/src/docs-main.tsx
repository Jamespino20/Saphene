import { Analytics } from "@vercel/analytics/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import DocsApp from "./DocsApp";

const DOCS_ROOT_ID = "docs-root";
const docsRoot = document.getElementById(DOCS_ROOT_ID);
if (docsRoot) {
  createRoot(docsRoot).render(
    <StrictMode>
      <DocsApp />
      <Analytics />
    </StrictMode>
  );
} else {
  const errorDiv = document.createElement("div");
  errorDiv.id = "docs-root-error";
  errorDiv.style.padding = "2rem";
  errorDiv.style.fontFamily = "monospace";
  errorDiv.style.color = "#f87171";
  errorDiv.textContent = `Saphene docs: root container '#${DOCS_ROOT_ID}' not found.`;
  document.body.prepend(errorDiv);
  console.error(
    `Saphene docs failure: root container '#${DOCS_ROOT_ID}' not found in the DOM. The docs app did not mount.`,
  );
}
