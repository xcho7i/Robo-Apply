import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import App from "./App.js"

import "@smastrom/react-rating/style.css"
import "./index.css"

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>
)
