import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./lib/sampleData"; // Initialize sample data

createRoot(document.getElementById("root")!).render(<App />);
