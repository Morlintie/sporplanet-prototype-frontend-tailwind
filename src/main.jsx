import { createRoot } from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { WebSocketProvider } from "./context/WebSocketContext";
import { BrowserRouter } from "react-router-dom";

const root = createRoot(document.getElementById("root"));

root.render(
  <AuthProvider>
    <WebSocketProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </WebSocketProvider>
  </AuthProvider>
);
