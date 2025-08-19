import { createContext, useContext, useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const WebSocketContext = createContext();

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [notificationSocket, setNotificationSocket] = useState(null);
  const [chatSocket, setChatSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const [isNotificationConnected, setIsNotificationConnected] = useState(false);
  const [isChatConnected, setIsChatConnected] = useState(false);
  const socketRef = useRef(null);
  const notificationSocketRef = useRef(null);
  const chatSocketRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const notificationReconnectAttempts = useRef(0);
  const chatReconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Helper function to check if a user is online
  const isUserOnline = (userId) => {
    if (!userId || !onlineUsers) return false;
    return userId in onlineUsers;
  };

  // Helper functions for chat room management
  const joinChatRoom = (roomId) => {
    if (chatSocket && chatSocket.connected && roomId) {
      console.log(`Joining chat room: ${roomId}`);
      chatSocket.emit("joinRoom", { roomId });
    }
  };

  const leaveChatRoom = (roomId, userId = null) => {
    if (chatSocket && chatSocket.connected && roomId) {
      const currentUserId = userId || user?._id;
      console.log(`Leaving chat room: ${roomId}, User: ${currentUserId}`);
      chatSocket.emit("leaveRoom", { roomId, userId: currentUserId });
    }
  };

  const leaveChatRoomMultiple = (roomId, userIds) => {
    if (
      chatSocket &&
      chatSocket.connected &&
      roomId &&
      Array.isArray(userIds)
    ) {
      console.log(
        `Leaving chat room for multiple users: ${roomId}, Users:`,
        userIds
      );
      userIds.forEach((userId) => {
        chatSocket.emit("leaveRoom", { roomId, userId });
      });
    }
  };

  // Connect to Chat WebSocket namespace
  const connectChatSocket = () => {
    if (!user || !user._id || !isAuthenticated) {
      console.log("User not authenticated, skipping chat WebSocket connection");
      return;
    }

    // Prevent multiple connections
    if (chatSocketRef.current && chatSocketRef.current.connected) {
      console.log("Chat WebSocket already connected");
      return;
    }

    try {
      console.log(
        "Connecting to Chat WebSocket namespace with userId:",
        user._id
      );

      const newChatSocket = io("http://localhost:5000/chat", {
        query: {
          userId: user._id,
        },
        transports: ["websocket", "polling"],
        timeout: 10000,
        forceNew: true,
      });

      console.log("Chat WebSocket handshake query:", {
        userId: user._id,
      });

      chatSocketRef.current = newChatSocket;

      // Connection event handlers for chat
      newChatSocket.on("connect", () => {
        console.log(
          "Chat WebSocket connected successfully with socket ID:",
          newChatSocket.id
        );
        setIsChatConnected(true);
        setChatSocket(newChatSocket);
        chatReconnectAttempts.current = 0;

        // Join all advert rooms that the user is participating in
        if (
          user &&
          user.advertParticipation &&
          Array.isArray(user.advertParticipation)
        ) {
          console.log(
            "Joining chat rooms for user's advert participation:",
            user.advertParticipation.length
          );
          user.advertParticipation.forEach((advert) => {
            if (advert && advert._id) {
              console.log(`Joining chat room for advert: ${advert._id}`);
              newChatSocket.emit("joinRoom", { roomId: advert._id });
            }
          });
        }
      });

      newChatSocket.on("disconnect", (reason) => {
        console.log("Chat WebSocket disconnected:", reason);
        setIsChatConnected(false);
        setChatSocket(null);

        // Auto-reconnect for certain disconnect reasons
        if (reason === "io server disconnect") {
          // Server disconnected us, try to reconnect
          setTimeout(() => {
            if (chatReconnectAttempts.current < maxReconnectAttempts) {
              chatReconnectAttempts.current++;
              console.log(
                `Attempting to reconnect chat socket (${chatReconnectAttempts.current}/${maxReconnectAttempts})`
              );
              connectChatSocket();
            }
          }, 2000);
        }
      });

      // Error event handler for chat
      newChatSocket.on("connect_error", (error) => {
        console.error("Chat WebSocket connection error:", error);
        setIsChatConnected(false);
        setChatSocket(null);

        // Retry connection with backoff
        if (chatReconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(
            1000 * Math.pow(2, chatReconnectAttempts.current),
            10000
          );
          setTimeout(() => {
            chatReconnectAttempts.current++;
            console.log(
              `Retrying chat connection (${chatReconnectAttempts.current}/${maxReconnectAttempts}) in ${delay}ms`
            );
            connectChatSocket();
          }, delay);
        }
      });

      // Heartbeat to keep connection alive
      newChatSocket.on("ping", () => {
        newChatSocket.emit("pong");
      });
    } catch (error) {
      console.error("Error creating chat WebSocket connection:", error);
      setIsChatConnected(false);
      setChatSocket(null);
    }
  };

  // Connect to Notifications WebSocket namespace
  const connectNotificationSocket = () => {
    if (!user || !user._id || !isAuthenticated) {
      console.log(
        "User not authenticated, skipping notification WebSocket connection"
      );
      return;
    }

    // Prevent multiple connections
    if (
      notificationSocketRef.current &&
      notificationSocketRef.current.connected
    ) {
      console.log("Notification WebSocket already connected");
      return;
    }

    try {
      console.log(
        "Connecting to Notification WebSocket namespace with userId:",
        user._id
      );

      const newNotificationSocket = io("http://localhost:5000/notifications", {
        query: {
          userId: user._id,
        },
        transports: ["websocket", "polling"],
        timeout: 10000,
        forceNew: true,
      });

      console.log("Notification WebSocket handshake query:", {
        userId: user._id,
      });

      notificationSocketRef.current = newNotificationSocket;

      // Connection event handlers for notifications
      newNotificationSocket.on("connect", () => {
        console.log(
          "Notification WebSocket connected successfully with socket ID:",
          newNotificationSocket.id
        );
        setIsNotificationConnected(true);
        setNotificationSocket(newNotificationSocket);
        notificationReconnectAttempts.current = 0;
      });

      newNotificationSocket.on("disconnect", (reason) => {
        console.log("Notification WebSocket disconnected:", reason);
        setIsNotificationConnected(false);
        setNotificationSocket(null);

        // Auto-reconnect for certain disconnect reasons
        if (reason === "io server disconnect") {
          // Server disconnected us, try to reconnect
          setTimeout(() => {
            if (notificationReconnectAttempts.current < maxReconnectAttempts) {
              notificationReconnectAttempts.current++;
              console.log(
                `Attempting to reconnect notification socket (${notificationReconnectAttempts.current}/${maxReconnectAttempts})`
              );
              connectNotificationSocket();
            }
          }, 2000);
        }
      });

      // Error event handler for notifications
      newNotificationSocket.on("connect_error", (error) => {
        console.error("Notification WebSocket connection error:", error);
        setIsNotificationConnected(false);
        setNotificationSocket(null);

        // Retry connection with backoff
        if (notificationReconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(
            1000 * Math.pow(2, notificationReconnectAttempts.current),
            10000
          );
          setTimeout(() => {
            notificationReconnectAttempts.current++;
            console.log(
              `Retrying notification connection (${notificationReconnectAttempts.current}/${maxReconnectAttempts}) in ${delay}ms`
            );
            connectNotificationSocket();
          }, delay);
        }
      });

      // Heartbeat to keep connection alive
      newNotificationSocket.on("ping", () => {
        newNotificationSocket.emit("pong");
      });
    } catch (error) {
      console.error("Error creating notification WebSocket connection:", error);
      setIsNotificationConnected(false);
      setNotificationSocket(null);
    }
  };

  // Connect to WebSocket
  const connectWebSocket = () => {
    if (!user || !user._id || !isAuthenticated) {
      console.log("User not authenticated, skipping WebSocket connection");
      return;
    }

    // Prevent multiple connections
    if (socketRef.current && socketRef.current.connected) {
      console.log("WebSocket already connected");
      return;
    }

    try {
      console.log("Connecting to WebSocket with userId:", user._id);

      const newSocket = io("http://localhost:5000", {
        query: {
          userId: user._id,
        },
        transports: ["websocket", "polling"],
        timeout: 10000,
        forceNew: true,
      });

      socketRef.current = newSocket;

      // Connection event handlers
      newSocket.on("connect", () => {
        console.log(
          "WebSocket connected successfully with socket ID:",
          newSocket.id
        );
        setIsConnected(true);
        setSocket(newSocket);
        reconnectAttempts.current = 0;
      });

      newSocket.on("disconnect", (reason) => {
        console.log("WebSocket disconnected:", reason);
        setIsConnected(false);
        setSocket(null);

        // Auto-reconnect for certain disconnect reasons
        if (reason === "io server disconnect") {
          // Server disconnected us, try to reconnect
          setTimeout(() => {
            if (reconnectAttempts.current < maxReconnectAttempts) {
              reconnectAttempts.current++;
              console.log(
                `Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})`
              );
              connectWebSocket();
            }
          }, 2000);
        }
      });

      // Online users event handler
      newSocket.on("onlineUsers", (onlineUsersList) => {
        console.log("Received online users update:", onlineUsersList);

        // Convert array of user IDs to object format
        const onlineUsersMap = {};
        if (Array.isArray(onlineUsersList)) {
          onlineUsersList.forEach((userId) => {
            onlineUsersMap[userId] = true; // We don't need the socket ID for the UI
          });
        }

        setOnlineUsers(onlineUsersMap);
      });

      // Error event handler
      newSocket.on("connect_error", (error) => {
        console.error("WebSocket connection error:", error);
        setIsConnected(false);
        setSocket(null);

        // Retry connection with backoff
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(
            1000 * Math.pow(2, reconnectAttempts.current),
            10000
          );
          setTimeout(() => {
            reconnectAttempts.current++;
            console.log(
              `Retrying connection (${reconnectAttempts.current}/${maxReconnectAttempts}) in ${delay}ms`
            );
            connectWebSocket();
          }, delay);
        }
      });

      // Heartbeat to keep connection alive
      newSocket.on("ping", () => {
        newSocket.emit("pong");
      });
    } catch (error) {
      console.error("Error creating WebSocket connection:", error);
      setIsConnected(false);
      setSocket(null);
    }
  };

  // Disconnect Chat WebSocket
  const disconnectChatSocket = () => {
    if (chatSocketRef.current) {
      console.log("Disconnecting Chat WebSocket");
      chatSocketRef.current.disconnect();
      chatSocketRef.current = null;
      setChatSocket(null);
      setIsChatConnected(false);
    }
  };

  // Disconnect Notification WebSocket
  const disconnectNotificationSocket = () => {
    if (notificationSocketRef.current) {
      console.log("Disconnecting Notification WebSocket");
      notificationSocketRef.current.disconnect();
      notificationSocketRef.current = null;
      setNotificationSocket(null);
      setIsNotificationConnected(false);
    }
  };

  // Disconnect WebSocket
  const disconnectWebSocket = () => {
    if (socketRef.current) {
      console.log("Disconnecting WebSocket");
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
      setOnlineUsers({});
    }
  };

  // Connect when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user && user._id) {
      connectWebSocket();
      connectNotificationSocket();
      connectChatSocket();
    } else {
      disconnectWebSocket();
      disconnectNotificationSocket();
      disconnectChatSocket();
    }

    // Cleanup on unmount
    return () => {
      disconnectWebSocket();
      disconnectNotificationSocket();
      disconnectChatSocket();
    };
  }, [isAuthenticated, user]);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, but keep connection alive
        console.log("Page hidden, keeping WebSocket connections");
      } else {
        // Page is visible again, ensure connections are active
        console.log("Page visible, checking WebSocket connections");
        if (isAuthenticated && user && user._id) {
          if (!isConnected) {
            connectWebSocket();
          }
          if (!isNotificationConnected) {
            connectNotificationSocket();
          }
          if (!isChatConnected) {
            connectChatSocket();
          }
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [
    isAuthenticated,
    user,
    isConnected,
    isNotificationConnected,
    isChatConnected,
  ]);

  // Handle browser beforeunload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (notificationSocketRef.current) {
        notificationSocketRef.current.disconnect();
      }
      if (chatSocketRef.current) {
        chatSocketRef.current.disconnect();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const value = {
    socket,
    notificationSocket,
    chatSocket,
    isConnected,
    isNotificationConnected,
    isChatConnected,
    onlineUsers,
    isUserOnline,
    connectWebSocket,
    disconnectWebSocket,
    connectNotificationSocket,
    disconnectNotificationSocket,
    connectChatSocket,
    disconnectChatSocket,
    joinChatRoom,
    leaveChatRoom,
    leaveChatRoomMultiple,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketProvider;
