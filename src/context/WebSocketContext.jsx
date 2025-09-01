import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
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
  const {
    user,
    isAuthenticated,
    addUnseenMessageForAdvert,
    addIncomingFriendRequest,
    removeIncomingFriendRequest,
    addFriend,
    removeFriendRequest,
    removeFromFriendsList,
    removeFriend,
    incrementUnseenInvitationsCount,
    isCurrentlyViewingIncomingCurrentInvitations,
  } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const onlineUsersDebounceRef = useRef(null);
  const [connectionError, setConnectionError] = useState(null);
  const socketRef = useRef(null);

  // Global notification state for WebSocket events
  const [globalNotification, setGlobalNotification] = useState({
    isVisible: false,
    message: "",
    type: "success",
  });

  // Show global notification helper
  const showGlobalNotification = (message, type = "success") => {
    setGlobalNotification({
      isVisible: true,
      message,
      type,
    });
  };

  // Hide global notification helper
  const hideGlobalNotification = () => {
    setGlobalNotification({
      isVisible: false,
      message: "",
      type: "success",
    });
  };

  // Notification namespace socket state
  const [notificationSocket, setNotificationSocket] = useState(null);
  const [isNotificationConnected, setIsNotificationConnected] = useState(false);
  const [notificationConnectionError, setNotificationConnectionError] =
    useState(null);
  const notificationSocketRef = useRef(null);

  // Chat namespace socket state
  const [chatSocket, setChatSocket] = useState(null);
  const [isChatConnected, setIsChatConnected] = useState(false);
  const [chatConnectionError, setChatConnectionError] = useState(null);
  const chatSocketRef = useRef(null);

  // Initialize WebSocket connection to default namespace
  useEffect(() => {
    if (isAuthenticated && user && user._id) {
      console.log("Initializing WebSocket connection for user:", user._id);

      try {
        // Connect to default namespace with userId in handshake query
        const socketInstance = io("http://localhost:5000", {
          query: {
            userId: user._id,
          },
          autoConnect: true,
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        });

        socketRef.current = socketInstance;
        setSocket(socketInstance);

        // Connect to notification namespace with userId in handshake query
        const notificationSocketInstance = io(
          "http://localhost:5000/notifications",
          {
            query: {
              userId: user._id,
            },
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
          }
        );

        notificationSocketRef.current = notificationSocketInstance;
        setNotificationSocket(notificationSocketInstance);

        // Connect to chat namespace with userId in handshake query
        const chatSocketInstance = io("http://localhost:5000/chat", {
          query: {
            userId: user._id,
          },
          autoConnect: true,
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        });

        chatSocketRef.current = chatSocketInstance;
        setChatSocket(chatSocketInstance);

        // Connection event listeners
        socketInstance.on("connect", () => {
          console.log(
            "WebSocket connected to default namespace with socket ID:",
            socketInstance.id
          );
          setIsConnected(true);
          setConnectionError(null);
        });

        socketInstance.on("connect_error", (error) => {
          console.error("WebSocket connection error:", error);
          setConnectionError(`WebSocket bağlantı hatası: ${error.message}`);
          setIsConnected(false);
        });

        socketInstance.on("disconnect", (reason) => {
          console.log("WebSocket disconnected:", reason);
          setIsConnected(false);

          // Don't show error for intentional disconnects
          if (
            reason !== "io client disconnect" &&
            reason !== "io server disconnect"
          ) {
            setConnectionError("WebSocket bağlantısı kesildi");
          }
        });

        // Listen for online users updates from server - debounced to prevent cascading re-renders
        socketInstance.on("onlineUsers", (userIds) => {
          console.log("Online users updated:", userIds);

          // Clear existing debounce timer
          if (onlineUsersDebounceRef.current) {
            clearTimeout(onlineUsersDebounceRef.current);
          }

          // Debounce the online users update to prevent rapid re-renders
          onlineUsersDebounceRef.current = setTimeout(() => {
            setOnlineUsers(userIds || []);
          }, 500); // 500ms debounce to batch rapid online/offline changes
        });

        // Error handling
        socketInstance.on("error", (error) => {
          console.error("WebSocket error:", error);
          setConnectionError(`WebSocket hatası: ${error}`);
        });

        // Handle reconnection
        socketInstance.on("reconnect", (attemptNumber) => {
          console.log("WebSocket reconnected after", attemptNumber, "attempts");
          setIsConnected(true);
          setConnectionError(null);
        });

        socketInstance.on("reconnect_error", (error) => {
          console.error("WebSocket reconnection failed:", error);
          setConnectionError("WebSocket yeniden bağlantı başarısız");
        });

        socketInstance.on("reconnect_failed", () => {
          console.error("WebSocket reconnection completely failed");
          setConnectionError("WebSocket bağlantısı tamamen başarısız");
        });

        // Notification namespace event listeners
        notificationSocketInstance.on("connect", () => {
          console.log(
            "WebSocket connected to notification namespace with socket ID:",
            notificationSocketInstance.id
          );
          setIsNotificationConnected(true);
          setNotificationConnectionError(null);
        });

        notificationSocketInstance.on("connect_error", (error) => {
          console.error("Notification WebSocket connection error:", error);
          setNotificationConnectionError(
            `Bildirim WebSocket bağlantı hatası: ${error.message}`
          );
          setIsNotificationConnected(false);
        });

        notificationSocketInstance.on("disconnect", (reason) => {
          console.log("Notification WebSocket disconnected:", reason);
          setIsNotificationConnected(false);

          // Don't show error for intentional disconnects
          if (
            reason !== "io client disconnect" &&
            reason !== "io server disconnect"
          ) {
            setNotificationConnectionError(
              "Bildirim WebSocket bağlantısı kesildi"
            );
          }
        });

        // Error handling for notification namespace
        notificationSocketInstance.on("error", (error) => {
          console.error("Notification WebSocket error:", error);
          setNotificationConnectionError(`Bildirim WebSocket hatası: ${error}`);
        });

        // Handle reconnection for notification namespace
        notificationSocketInstance.on("reconnect", (attemptNumber) => {
          console.log(
            "Notification WebSocket reconnected after",
            attemptNumber,
            "attempts"
          );
          setIsNotificationConnected(true);
          setNotificationConnectionError(null);
        });

        notificationSocketInstance.on("reconnect_error", (error) => {
          console.error("Notification WebSocket reconnection failed:", error);
          setNotificationConnectionError(
            "Bildirim WebSocket yeniden bağlantı başarısız"
          );
        });

        notificationSocketInstance.on("reconnect_failed", () => {
          console.error(
            "Notification WebSocket reconnection completely failed"
          );
          setNotificationConnectionError(
            "Bildirim WebSocket bağlantısı tamamen başarısız"
          );
        });

        // Chat namespace event listeners
        chatSocketInstance.on("connect", () => {
          console.log(
            "WebSocket connected to chat namespace with socket ID:",
            chatSocketInstance.id
          );
          setIsChatConnected(true);
          setChatConnectionError(null);
        });

        chatSocketInstance.on("connect_error", (error) => {
          console.error("Chat WebSocket connection error:", error);
          setChatConnectionError(
            `Chat WebSocket bağlantı hatası: ${error.message}`
          );
          setIsChatConnected(false);
        });

        chatSocketInstance.on("disconnect", (reason) => {
          console.log("Chat WebSocket disconnected:", reason);
          setIsChatConnected(false);

          // Don't show error for intentional disconnects
          if (
            reason !== "io client disconnect" &&
            reason !== "io server disconnect"
          ) {
            setChatConnectionError("Chat WebSocket bağlantısı kesildi");
          }
        });

        // Error handling for chat namespace
        chatSocketInstance.on("error", (error) => {
          console.error("Chat WebSocket error:", error);
          setChatConnectionError(`Chat WebSocket hatası: ${error}`);
        });

        // Handle reconnection for chat namespace
        chatSocketInstance.on("reconnect", (attemptNumber) => {
          console.log(
            "Chat WebSocket reconnected after",
            attemptNumber,
            "attempts"
          );
          setIsChatConnected(true);
          setChatConnectionError(null);
        });

        chatSocketInstance.on("reconnect_error", (error) => {
          console.error("Chat WebSocket reconnection failed:", error);
          setChatConnectionError("Chat WebSocket yeniden bağlantı başarısız");
        });

        chatSocketInstance.on("reconnect_failed", () => {
          console.error("Chat WebSocket reconnection completely failed");
          setChatConnectionError("Chat WebSocket bağlantısı tamamen başarısız");
        });

        // Global friend request state management listeners
        notificationSocketInstance.on("friendRequest", (data) => {
          console.log("Received global friendRequest event:", data);

          if (data && data.user) {
            // Add the new incoming friend request to AuthContext globally
            addIncomingFriendRequest(data.user);

            // Show global notification to inform user about new friend request
            const senderName = data.user.name || "Bilinmeyen kullanıcı";
            showGlobalNotification(
              `${senderName} arkadaşlık isteği gönderdi`,
              "info"
            );
          }
        });

        notificationSocketInstance.on("friendRequestRevoked", (data) => {
          console.log("Received global friendRequestRevoked event:", data);

          if (data && data.userId) {
            // Remove the revoked incoming friend request from AuthContext globally
            removeIncomingFriendRequest(data.userId);
          }
        });

        notificationSocketInstance.on("friendRequestAccepted", (data) => {
          console.log("Received global friendRequestAccepted event:", data);

          if (data && data.user) {
            // New data structure: { user: newCurrentUser }
            // data.user is the FULL user data of the person who ACCEPTED our friend request
            const acceptedUser = data.user;
            const acceptedUserId = acceptedUser._id;
            const acceptedUserName =
              acceptedUser.name || "Bilinmeyen kullanıcı";

            console.log("Friend request accepted by user:", acceptedUserId);
            console.log("Accepted user data:", acceptedUser);

            // Show global notification
            showGlobalNotification(
              `${acceptedUserName} arkadaşlık isteğini kabul etti`,
              "success"
            );

            // Update state: Remove from selfFriendRequests and add the accepter to friends
            removeFriendRequest(acceptedUserId);
            addFriend(acceptedUser);
          }
        });

        notificationSocketInstance.on("friendRequestRejected", (data) => {
          console.log("Received global friendRequestRejected event:", data);

          if (data && data.userId) {
            // Find the user who rejected our request
            const rejectedUser = user?.selfFriendRequests?.find(
              (req) => req._id === data.userId
            );
            const rejectedUserName =
              rejectedUser?.name || "Bilinmeyen kullanıcı";

            // Show global notification
            showGlobalNotification(
              `${rejectedUserName} arkadaşlık isteğini reddetti`,
              "info"
            );

            // Update state: Just remove from selfFriendRequests, don't add to friends
            removeFriendRequest(data.userId);
          }
        });

        notificationSocketInstance.on("removedFromFriends", (data) => {
          console.log("Received global removedFromFriends event:", data);

          if (data && data.userId) {
            // Someone removed us from their friends list
            // We need to decrement our follower count
            removeFromFriendsList(data.userId);

            // No notification shown to the user who was removed
            // The unfriending happens silently for the removed user
          }
        });

        notificationSocketInstance.on("removedFromFollowers", (data) => {
          console.log("Received global removedFromFollowers event:", data);

          if (data && data.userId) {
            // Someone removed us from their followers list
            // This means we need to remove them from our friends list
            // (since in this system, being removed from followers means losing the friendship)
            removeFriend(data.userId);

            // Find the user who removed us (if we have their info)
            const removerUser = user?.friends?.find(
              (friend) => friend._id === data.userId
            );
            const removerName = removerUser?.name || "Bir kullanıcı";

            // Show global notification
            showGlobalNotification(
              `${removerName} sizi takipçilerinden çıkardı`,
              "info"
            );
          }
        });

        notificationSocketInstance.on("newInvite", (data) => {
          console.log("Received global newInvite event:", data);

          if (data && data.invite) {
            const invitation = data.invite;
            const senderName =
              invitation.sender?.name || "Bilinmeyen kullanıcı";
            const advertName = invitation.advert?.name || "bir ilana";

            // Show global notification
            showGlobalNotification(
              `${senderName} sizi ${advertName} ilanına davet etti`,
              "info"
            );

            console.log(
              "New invitation received from:",
              senderName,
              "for advert:",
              advertName
            );

            // Real-time unseen count increment logic
            // Only increment if user is NOT currently viewing "Gelen Davetler" "Güncel"
            const isViewingIncomingCurrent =
              isCurrentlyViewingIncomingCurrentInvitations();

            if (isViewingIncomingCurrent) {
              console.log(
                "🔔 UNSEEN COUNT: User is viewing 'Gelen Davetler' 'Güncel', invitation will be seen immediately - no increment needed"
              );
            } else {
              console.log(
                "🔔 UNSEEN COUNT: User is NOT viewing 'Gelen Davetler' 'Güncel', incrementing unseen count by +1"
              );
              incrementUnseenInvitationsCount();
            }
          }
        });
      } catch (error) {
        console.error("Error creating WebSocket connection:", error);
        setConnectionError(`WebSocket oluşturma hatası: ${error.message}`);
      }
    } else {
      // User is not authenticated, clean up any existing connections
      if (socketRef.current) {
        console.log("User not authenticated, disconnecting default WebSocket");
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
        setOnlineUsers([]);
        setConnectionError(null);
      }

      if (notificationSocketRef.current) {
        console.log(
          "User not authenticated, disconnecting notification WebSocket"
        );
        notificationSocketRef.current.disconnect();
        notificationSocketRef.current = null;
        setNotificationSocket(null);
        setIsNotificationConnected(false);
        setNotificationConnectionError(null);
      }
    }

    // Cleanup function - this will run when component unmounts or dependencies change
    return () => {
      // Clear debounce timer
      if (onlineUsersDebounceRef.current) {
        clearTimeout(onlineUsersDebounceRef.current);
        onlineUsersDebounceRef.current = null;
      }

      if (socketRef.current) {
        console.log("Cleaning up default WebSocket connection");
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
        setOnlineUsers([]);
        setConnectionError(null);
      }

      if (notificationSocketRef.current) {
        console.log("Cleaning up notification WebSocket connection");
        notificationSocketRef.current.disconnect();
        notificationSocketRef.current = null;
        setNotificationSocket(null);
        setIsNotificationConnected(false);
        setNotificationConnectionError(null);
      }

      if (chatSocketRef.current) {
        console.log("Cleaning up chat WebSocket connection");
        chatSocketRef.current.disconnect();
        chatSocketRef.current = null;
        setChatSocket(null);
        setIsChatConnected(false);
        setChatConnectionError(null);
      }
    };
  }, [
    isAuthenticated,
    user?._id,
    addIncomingFriendRequest,
    removeIncomingFriendRequest,
    addFriend,
    removeFriendRequest,
    removeFromFriendsList,
    removeFriend,
    incrementUnseenInvitationsCount,
    isCurrentlyViewingIncomingCurrentInvitations,
  ]);

  // Auto-join advert chat rooms when chat connection is established and user is authenticated
  useEffect(() => {
    if (isChatConnected && user && user._id && chatSocket) {
      const advertParticipation = user.advertParticipation || [];

      console.log(
        "Chat connected and user authenticated, joining advert chat rooms"
      );
      console.log(
        `Joining chat rooms for ${advertParticipation.length} participated adverts`
      );

      advertParticipation.forEach((participation) => {
        if (participation && participation._id) {
          const roomId = participation._id;
          const userId = user._id;

          console.log(`Joining chat room: ${roomId} for user: ${userId}`);

          // Directly emit to chat socket instead of using emitChatEvent
          chatSocket.emit("joinRoom", {
            roomId: roomId,
            userId: userId,
          });
        }
      });
    }
  }, [isChatConnected, user?._id, user?.advertParticipation, chatSocket]);

  // Global newMessage listener for real-time unseen message tracking
  useEffect(() => {
    if (
      isChatConnected &&
      chatSocket &&
      user &&
      user._id &&
      addUnseenMessageForAdvert
    ) {
      console.log(
        "Setting up global newMessage listener for unseen message tracking"
      );

      const handleNewMessage = (data) => {
        console.log("Global newMessage received:", data);

        if (data && data.message && data.advertId) {
          const { message, advertId } = data;

          // Only count as unseen if message is NOT sent by current user
          if (message.sender && message.sender._id !== user._id) {
            console.log(
              `Message from ${message.sender._id}, not from current user ${user._id}, checking if should be marked unseen`
            );
            addUnseenMessageForAdvert(advertId);
          } else {
            console.log(
              `Message from current user ${user._id}, not marking as unseen`
            );
          }
        }
      };

      chatSocket.on("newMessage", handleNewMessage);

      // Cleanup function
      return () => {
        console.log("Cleaning up global newMessage listener");
        chatSocket.off("newMessage", handleNewMessage);
      };
    }
  }, [isChatConnected, chatSocket, user?._id, addUnseenMessageForAdvert]);

  // Helper functions - memoized to prevent unnecessary re-renders
  const isUserOnline = useCallback(
    (userId) => {
      return onlineUsers.includes(userId);
    },
    [onlineUsers]
  );

  const getOnlineUsersCount = () => {
    return onlineUsers.length;
  };

  // Emit events to server (for future use)
  const emitEvent = useCallback(
    (eventName, data) => {
      if (socket && isConnected) {
        console.log(`Emitting event: ${eventName}`, data);
        socket.emit(eventName, data);
      } else {
        console.warn(`Cannot emit event ${eventName}: WebSocket not connected`);
      }
    },
    [socket, isConnected]
  );

  // Emit events to notification namespace
  const emitNotificationEvent = useCallback(
    (eventName, data) => {
      if (notificationSocket && isNotificationConnected) {
        console.log(`Emitting notification event: ${eventName}`, data);
        notificationSocket.emit(eventName, data);
      } else {
        console.warn(
          `Cannot emit notification event ${eventName}: Notification WebSocket not connected`
        );
      }
    },
    [notificationSocket, isNotificationConnected]
  );

  // Listen for custom events (for future use)
  const listenForEvent = (eventName, callback) => {
    if (socket) {
      console.log(`Listening for event: ${eventName}`);
      socket.on(eventName, callback);

      // Return cleanup function
      return () => {
        socket.off(eventName, callback);
      };
    } else {
      console.warn(
        `Cannot listen for event ${eventName}: WebSocket not available`
      );
      return () => {}; // Return empty cleanup function
    }
  };

  // Listen for notification events
  const listenForNotificationEvent = useCallback(
    (eventName, callback) => {
      if (notificationSocket) {
        console.log(`Listening for notification event: ${eventName}`);
        notificationSocket.on(eventName, callback);

        // Return cleanup function
        return () => {
          notificationSocket.off(eventName, callback);
        };
      } else {
        console.warn(
          `Cannot listen for notification event ${eventName}: Notification WebSocket not available`
        );
        return () => {}; // Return empty cleanup function
      }
    },
    [notificationSocket]
  );

  // Emit events to chat namespace
  const emitChatEvent = useCallback(
    (eventName, data) => {
      console.log(`[CHAT EMIT] Attempting to emit event: ${eventName}`, data);
      console.log(`[CHAT EMIT] Chat connection state:`, {
        chatSocket: !!chatSocket,
        isChatConnected,
        socketId: chatSocket?.id,
      });

      if (chatSocket && isChatConnected) {
        console.log(`[CHAT EMIT] Emitting chat event: ${eventName}`, data);
        chatSocket.emit(eventName, data);
        console.log(`[CHAT EMIT] Event ${eventName} emitted successfully`);
      } else {
        console.warn(
          `[CHAT EMIT] Cannot emit chat event ${eventName}: Chat WebSocket not connected`
        );
        console.warn(`[CHAT EMIT] Connection details:`, {
          chatSocket: !!chatSocket,
          isChatConnected,
          socketId: chatSocket?.id,
        });
      }
    },
    [chatSocket, isChatConnected]
  );

  // Listen for chat events
  const listenForChatEvent = useCallback(
    (eventName, callback) => {
      if (chatSocket) {
        console.log(`Listening for chat event: ${eventName}`);
        chatSocket.on(eventName, callback);

        // Return cleanup function
        return () => {
          chatSocket.off(eventName, callback);
        };
      } else {
        console.warn(
          `Cannot listen for chat event ${eventName}: Chat WebSocket not available`
        );
        return () => {}; // Return empty cleanup function
      }
    },
    [chatSocket]
  );

  // Manual function to join advert chat rooms (for external calls)
  const joinAdvertChatRooms = useCallback(() => {
    if (chatSocket && isChatConnected && user && user._id) {
      const advertParticipation = user.advertParticipation || [];

      console.log(
        `Manually joining chat rooms for ${advertParticipation.length} participated adverts`
      );

      advertParticipation.forEach((participation) => {
        if (participation && participation._id) {
          const roomId = participation._id;
          const userId = user._id;

          console.log(
            `Manually joining chat room: ${roomId} for user: ${userId}`
          );

          emitChatEvent("joinRoom", {
            roomId: roomId,
            userId: userId,
          });
        }
      });
    } else {
      console.warn(
        "Cannot join advert chat rooms: Chat WebSocket not connected or user not available"
      );
    }
  }, [chatSocket, isChatConnected, user, emitChatEvent]);

  // Manual function to join a single advert chat room (for invitation acceptance)
  const joinSingleAdvertChatRoom = useCallback(
    (advertId) => {
      if (chatSocket && isChatConnected && user && user._id && advertId) {
        console.log(
          `🚀 INVITATION ACCEPTANCE: Joining single chat room: ${advertId} for user: ${user._id}`
        );

        // Use joinRoom event as specified in backend requirements
        emitChatEvent("joinRoom", {
          roomId: advertId,
          userId: user._id,
        });

        console.log(
          `🚀 INVITATION ACCEPTANCE: joinRoom event emitted for user ${user._id} in advert ${advertId}`
        );
      } else {
        console.warn(
          "🚀 INVITATION ACCEPTANCE: Cannot join single advert chat room",
          {
            chatSocket: !!chatSocket,
            isChatConnected,
            user: !!user,
            userId: user?._id,
            advertId,
          }
        );
      }
    },
    [chatSocket, isChatConnected, user, emitChatEvent]
  );

  // Remove event listener
  const removeEventListener = (eventName, callback) => {
    if (socket) {
      socket.off(eventName, callback);
    }
  };

  // Remove notification event listener
  const removeNotificationEventListener = (eventName, callback) => {
    if (notificationSocket) {
      notificationSocket.off(eventName, callback);
    }
  };

  // Manual disconnect (for future use if needed)
  const disconnect = () => {
    if (socket) {
      console.log("Manually disconnecting WebSocket");
      socket.disconnect();
    }
  };

  // Manual reconnect (for future use if needed)
  const reconnect = () => {
    if (socket) {
      console.log("Manually reconnecting WebSocket");
      socket.connect();
    }
  };

  const value = {
    // Default namespace connection state
    socket,
    isConnected,
    connectionError,

    // Notification namespace connection state
    notificationSocket,
    isNotificationConnected,
    notificationConnectionError,

    // Chat namespace connection state
    chatSocket,
    isChatConnected,
    chatConnectionError,

    // Online users management
    onlineUsers,
    isUserOnline,
    getOnlineUsersCount,

    // Default namespace event management
    emitEvent,
    listenForEvent,
    removeEventListener,

    // Notification namespace event management
    emitNotificationEvent,
    listenForNotificationEvent,
    removeNotificationEventListener,

    // Chat namespace event management
    emitChatEvent,
    listenForChatEvent,
    joinAdvertChatRooms,
    joinSingleAdvertChatRoom,

    // Connection management
    disconnect,
    reconnect,

    // Global notifications
    globalNotification,
    showGlobalNotification,
    hideGlobalNotification,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketContext;
