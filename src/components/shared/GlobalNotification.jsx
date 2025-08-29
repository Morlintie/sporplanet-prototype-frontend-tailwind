import { useWebSocket } from "../../context/WebSocketContext";
import Notification from "./Notification";

function GlobalNotification() {
  const { globalNotification, hideGlobalNotification } = useWebSocket();

  return (
    <Notification
      message={globalNotification.message}
      type={globalNotification.type}
      isVisible={globalNotification.isVisible}
      onClose={hideGlobalNotification}
      duration={4000} // Show for 4 seconds for better visibility
    />
  );
}

export default GlobalNotification;
