import { Analytics } from "@vercel/analytics/react";
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const ROOT_ID = "root";
const rootElement = document.getElementById(ROOT_ID);
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
      <Analytics />
    </StrictMode>
  );
} else {
  const errorDiv = document.createElement("div");
  errorDiv.id = "root-error";
  errorDiv.style.padding = "2rem";
  errorDiv.style.fontFamily = "monospace";
  errorDiv.style.color = "#f87171";
  errorDiv.textContent = `Saphene site: root container '#${ROOT_ID}' not found.`;
  document.body.prepend(errorDiv);
  console.error(
    `Saphene application failure: root container '#${ROOT_ID}' not found in the DOM. The app did not mount.`,
  );
}
