import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useWebSocket } from "../context/WebSocketContext";
import Header from "../components/shared/Header";
import Footer from "../components/shared/Footer";
import Notification from "../components/shared/Notification";
import ChatHeader from "../components/direct-messaging/ChatHeader";
import MessageList from "../components/direct-messaging/MessageList";
import MessageInput from "../components/direct-messaging/MessageInput";

function DirectMessaging() {
  const { userId } = useParams(); // The ID of the user we're chatting with
  const navigate = useNavigate();
  const {
    user: currentUser,
    getProfilePictureUrl,
    isAuthenticated,
    loading: authLoading,
  } = useAuth();
  const { emitChatEvent, listenForChatEvent, isChatConnected, isUserOnline } =
    useWebSocket();
  const { refreshUnseenDirectMessages } = useAuth();

  // State management
  const [targetUser, setTargetUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null); // ID of message being edited
  const [editingText, setEditingText] = useState(""); // Text content for editing
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);
  const [isTypingUser, setIsTypingUser] = useState(null); // User ID who is currently typing

  // Notification state
  const [notification, setNotification] = useState({
    isVisible: false,
    message: "",
    type: "success",
  });

  // Show notification helper
  const showNotification = (message, type = "success") => {
    setNotification({
      isVisible: true,
      message,
      type,
    });
  };

  // Hide notification helper
  const hideNotification = () => {
    setNotification({
      isVisible: false,
      message: "",
      type: "success",
    });
  };

  // Error message translation
  const translateMessage = (message) => {
    const translations = {
      "Failed to fetch":
        "Bağlantı hatası oluştu. İnternet bağlantınızı kontrol edin.",
      "Network Error": "Ağ hatası oluştu. Lütfen tekrar deneyin.",
      "User not found": "Kullanıcı bulunamadı.",
      "User not found.": "Kullanıcı bulunamadı.",
      Unauthorized: "Yetkisiz erişim.",
      "Something went wrong": "Bir şeyler ters gitti. Lütfen tekrar deneyin.",
      "Please provide content or attachments.":
        "Lütfen mesaj içeriği veya dosya ekleyin.",
      "Please provide required data.": "Gerekli bilgileri sağlayın.",
      "You cannot send a message to yourself":
        "Kendinize mesaj gönderemezsiniz.",
      "You can not send both content and attachments at the same time.":
        "Aynı anda hem metin hem de dosya gönderemezsiniz.",
      "Please provide content.": "Lütfen mesaj içeriği girin.",
      "Attachments must be an array with at least one item":
        "En az bir dosya eklemelisiniz.",
      "Maximum 3 attachments are allowed":
        "Maksimum 3 dosya gönderebilirsiniz.",
      "File size must be less than 100MB":
        "Dosya boyutu 100MB'dan küçük olmalıdır.",

      // Edit message specific errors
      "Please provide required data": "Gerekli bilgileri sağlayın",
      "Message not found or you do not have permission to edit it":
        "Mesaj bulunamadı veya düzenleme yetkiniz yok",

      // Delete message specific errors
      "Message not found or you do not have permission to delete it":
        "Mesaj bulunamadı veya silme yetkiniz yok",
      "You cannot delete messages for the users that you blocked":
        "Engellediğiniz kullanıcılar için mesaj silemezsiniz",
      "User not found": "Kullanıcı bulunamadı",

      // Mark messages as seen specific errors
      "Please provide required data": "Gerekli bilgileri sağlayın",
    };

    return (
      translations[message] ||
      "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin."
    );
  };

  // Fetch target user data
  const fetchTargetUser = async (targetUserId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/v1/user/getSingle/${targetUserId}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        let errorMessage = "Kullanıcı bulunamadı";
        if (response.status === 403) {
          errorMessage = "Bu kullanıcıyla mesajlaşma yetkiniz bulunmuyor.";
        } else if (response.status === 404) {
          errorMessage = "Kullanıcı bulunamadı.";
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setTargetUser(data.user);
    } catch (err) {
      console.error("Error fetching target user:", err);
      setError(err.message);
      showNotification(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Fetch chat history from backend
  const fetchChatHistory = async (targetUserId) => {
    try {
      console.log("Fetching chat history with user:", targetUserId);

      const response = await fetch(`/api/v1/chat/chat/${targetUserId}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        let errorMessage = "Mesaj geçmişi yüklenemedi";

        if (response.status === 400) {
          const errorData = await response.json();
          if (
            errorData.msg?.includes("You cannot get messages from yourself")
          ) {
            errorMessage = "Kendinizle mesajlaşamazsınız";
          } else if (errorData.msg?.includes("Please provide required data")) {
            errorMessage = "Gerekli bilgiler eksik";
          } else {
            errorMessage = "Geçersiz istek";
          }
        } else if (response.status === 401) {
          errorMessage = "Oturum süreniz dolmuş. Lütfen tekrar giriş yapın";
        } else if (response.status === 403) {
          errorMessage = "Bu sohbete erişim yetkiniz bulunmuyor";
        } else if (response.status === 404) {
          errorMessage = "Kullanıcı bulunamadı";
        } else if (response.status >= 500) {
          errorMessage =
            "Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin";
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Chat history fetched successfully:", data);

      // Set messages from backend response
      if (data.messages && Array.isArray(data.messages)) {
        setMessages(data.messages);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error("Error fetching chat history:", err);

      // Handle network errors
      if (err.name === "TypeError" && err.message.includes("fetch")) {
        showNotification(
          "Bağlantı hatası oluştu. İnternet bağlantınızı kontrol edin",
          "error"
        );
      } else {
        showNotification(err.message, "error");
      }

      // Set empty messages on error
      setMessages([]);
    }
  };

  // Send message
  const handleSendMessage = async ({ content, files }) => {
    // Check if we have either message or files
    if ((!content && files.length === 0) || sending || !isChatConnected) {
      return;
    }

    const messageText = content;
    const filesToSend = files;
    setSending(true);

    try {
      // Create temporary message for immediate UI feedback
      const tempMessage = {
        _id: `temp-${Date.now()}`,
        sender: {
          _id: currentUser._id,
          name: currentUser.name,
          profilePicture: currentUser.profilePicture,
        },
        recipient: {
          _id: targetUser._id,
          name: targetUser.name,
        },
        // Handle the three scenarios correctly
        content: filesToSend.length > 0 ? null : messageText || null,
        attachments:
          filesToSend.length > 0
            ? {
                caption: messageText || null,
                items: filesToSend.map((file) => ({
                  name: file.name,
                  mimeType: file.type,
                  url: file.content,
                })),
              }
            : null,
        createdAt: new Date().toISOString(),
        isTemp: true,
      };

      // Add temporary message to UI
      setMessages((prev) => [...prev, tempMessage]);

      // Prepare request body based on the three scenarios
      let requestBody = {};

      if (filesToSend.length > 0) {
        // Scenario 2 & 3: User has files
        const attachmentsPayload = {
          items: filesToSend.map((file) => ({
            content: file.content, // Send full base64 data
          })),
        };

        // Scenario 3: If there's also text content, add it as caption
        if (messageText) {
          attachmentsPayload.caption = messageText;
        }

        requestBody.attachments = attachmentsPayload;
      } else if (messageText) {
        // Scenario 1: Only text content
        requestBody.content = messageText;
      } else {
        // Neither text nor files - should not happen due to validation above
        throw new Error("No content to send");
      }

      console.log("Sending DM message to backend:", {
        recipientId: userId,
        requestBody,
      });

      // Send message to backend
      const response = await fetch(`/api/v1/chat/send/${userId}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        let errorMessage = "Mesaj gönderilemedi";

        try {
          const errorData = await response.json();
          errorMessage = errorData.msg || errorData.message || errorMessage;
        } catch {
          // If we can't parse the error response, use status-based messages
          switch (response.status) {
            case 400:
              errorMessage = "Geçersiz istek";
              break;
            case 401:
              errorMessage = "Oturum süreniz dolmuş. Lütfen tekrar giriş yapın";
              break;
            case 403:
              errorMessage = "Bu kullanıcıyla mesajlaşma yetkiniz bulunmuyor";
              break;
            case 404:
              errorMessage = "Kullanıcı bulunamadı";
              break;
            case 413:
              errorMessage = "Dosya boyutu 100MB sınırını aşıyor";
              break;
            case 429:
              errorMessage = "Çok fazla istek. Lütfen biraz bekleyin";
              break;
            case 500:
              errorMessage =
                "Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin";
              break;
            default:
              errorMessage = `Sunucu hatası: ${response.status}`;
          }
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Message sent successfully:", data);

      // Remove temporary message and add the real message from backend
      setMessages((prev) => {
        const filteredMessages = prev.filter(
          (msg) => msg._id !== tempMessage._id
        );
        return [...filteredMessages, data.message];
      });

      setSending(false);
      setShouldScrollToBottom(true);

      // Note: Real-time message for recipient will be handled via WebSocket listener
    } catch (err) {
      console.error("Error sending message:", err);

      // Enhanced error handling with Turkish messages
      let errorMessage = "Mesaj gönderilirken hata oluştu";

      if (err.name === "TypeError" && err.message.includes("fetch")) {
        errorMessage =
          "Bağlantı hatası oluştu. İnternet bağlantınızı kontrol edin";
      } else if (err.message) {
        errorMessage = translateMessage(err.message);
      }

      showNotification(errorMessage, "error");

      // Remove temporary message on error
      setMessages((prev) => prev.filter((msg) => msg._id !== tempMessage._id));
      setSending(false);
      throw err; // Re-throw to let MessageInput handle form restoration
    }
  };

  // Handle delete message
  const handleDeleteMessage = async (messageId) => {
    if (!messageId) {
      showNotification("Silinecek mesaj bulunamadı", "error");
      return;
    }

    try {
      console.log("Deleting DM message:", messageId);

      const response = await fetch(`/api/v1/chat/delete/${messageId}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        let errorMessage = "Mesaj silinirken hata oluştu";

        try {
          const errorData = await response.json();
          errorMessage = errorData.msg || errorData.message || errorMessage;
        } catch {
          // If we can't parse the error response, use status-based messages
          switch (response.status) {
            case 400:
              errorMessage = "Gerekli bilgileri sağlayın";
              break;
            case 401:
              errorMessage = "Oturum süreniz dolmuş. Lütfen tekrar giriş yapın";
              break;
            case 403:
              errorMessage = "Bu mesajı silme yetkiniz yok";
              break;
            case 404:
              errorMessage = "Mesaj bulunamadı veya silme yetkiniz yok";
              break;
            case 429:
              errorMessage = "Çok fazla istek. Lütfen biraz bekleyin";
              break;
            case 500:
              errorMessage =
                "Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin";
              break;
            default:
              errorMessage = `Sunucu hatası: ${response.status}`;
          }
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("DM message deleted successfully:", data);

      // Remove the message from local state immediately
      setMessages((prevMessages) => {
        return prevMessages.filter((message) => message._id !== messageId);
      });

      // Show success notification
      showNotification("Mesaj başarıyla silindi", "success");

      // Clear editing state if the deleted message was being edited
      if (editingMessageId === messageId) {
        setEditingMessageId(null);
        setEditingText("");
      }

      // Note: Real-time update for recipient will be handled via WebSocket listener
    } catch (err) {
      console.error("Error deleting DM message:", err);

      // Enhanced error handling with Turkish messages
      let errorMessage = "Mesaj silinirken hata oluştu";

      if (err.name === "TypeError" && err.message.includes("fetch")) {
        errorMessage =
          "Bağlantı hatası oluştu. İnternet bağlantınızı kontrol edin";
      } else if (err.message) {
        errorMessage = translateMessage(err.message);
      }

      showNotification(errorMessage, "error");
    }
  };

  // Handle edit message - start inline editing
  const handleEditMessage = (messageId) => {
    console.log("Edit message clicked for messageId:", messageId);

    try {
      // Find the message to edit
      const messageToEdit = messages.find((msg) => msg._id === messageId);
      if (!messageToEdit) {
        showNotification("Düzenlenecek mesaj bulunamadı", "error");
        return;
      }

      // Determine what to edit based on message type
      let initialText = "";
      if (
        messageToEdit.attachments &&
        messageToEdit.attachments.items &&
        messageToEdit.attachments.items.length > 0
      ) {
        // Message has files - edit caption
        initialText = messageToEdit.attachments.caption || "";
      } else {
        // Text-only message - edit content
        initialText = messageToEdit.content || "";
      }

      // Set inline editing state
      setEditingMessageId(messageId);
      setEditingText(initialText);
    } catch (err) {
      console.error("Error starting edit message:", err);
      showNotification("Mesaj düzenleme başlatılırken hata oluştu", "error");
    }
  };

  // Handle saving edited message
  const handleSaveEditedMessage = async (messageId) => {
    if (!editingMessageId || !messageId) return;

    // Validate text content - backend expects non-empty content
    const trimmedText = editingText.trim();
    if (!trimmedText) {
      // Find the message to check if it has attachments
      const messageToEdit = messages.find((msg) => msg._id === messageId);
      const hasAttachments =
        messageToEdit?.attachments &&
        messageToEdit.attachments.items &&
        messageToEdit.attachments.items.length > 0;
      const errorMsg = hasAttachments
        ? "Açıklama boş olamaz. En az bir karakter yazmalısınız."
        : "Metin içeriği boş olamaz";
      showNotification(errorMsg, "error");
      return;
    }

    try {
      console.log("Saving edited DM message:", messageId);

      const response = await fetch(`/api/v1/chat/edit/${messageId}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: trimmedText,
        }),
      });

      if (!response.ok) {
        let errorMessage = "Mesaj düzenlenirken hata oluştu";

        try {
          const errorData = await response.json();
          errorMessage = errorData.msg || errorData.message || errorMessage;
        } catch {
          // If we can't parse the error response, use status-based messages
          switch (response.status) {
            case 400:
              errorMessage = "Gerekli bilgileri sağlayın";
              break;
            case 401:
              errorMessage = "Oturum süreniz dolmuş. Lütfen tekrar giriş yapın";
              break;
            case 403:
              errorMessage = "Bu mesajı düzenleme yetkiniz yok";
              break;
            case 404:
              errorMessage = "Mesaj bulunamadı veya düzenleme yetkiniz yok";
              break;
            case 429:
              errorMessage = "Çok fazla istek. Lütfen biraz bekleyin";
              break;
            case 500:
              errorMessage =
                "Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin";
              break;
            default:
              errorMessage = `Sunucu hatası: ${response.status}`;
          }
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("DM message edited successfully:", data.message);

      // Update the message in local state immediately
      setMessages((prevMessages) => {
        return prevMessages.map((message) => {
          if (message._id === messageId) {
            console.log(
              "Updating edited message in local state:",
              data.message
            );
            return data.message;
          }
          return message;
        });
      });

      // Show success notification
      showNotification("Mesaj başarıyla düzenlendi", "success");

      // Clear editing state
      setEditingMessageId(null);
      setEditingText("");

      // Note: Real-time update for recipient will be handled via WebSocket listener
    } catch (err) {
      console.error("Error editing DM message:", err);

      // Enhanced error handling with Turkish messages
      let errorMessage = "Mesaj düzenlenirken hata oluştu";

      if (err.name === "TypeError" && err.message.includes("fetch")) {
        errorMessage =
          "Bağlantı hatası oluştu. İnternet bağlantınızı kontrol edin";
      } else if (err.message) {
        errorMessage = translateMessage(err.message);
      }

      showNotification(errorMessage, "error");
    }
  };

  // Handle canceling edit
  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingText("");
  };

  // Handle editing text change
  const handleEditTextChange = (newText) => {
    setEditingText(newText);
  };

  // Handle typing events for private messages
  const handleStartTyping = () => {
    if (isChatConnected && userId && currentUser && currentUser._id) {
      console.log(
        `DirectMessaging: Emitting typingPrivate event for user ${currentUser._id} to ${userId}`
      );
      emitChatEvent("typingPrivate", {
        userId: currentUser._id,
        receiverId: userId,
      });
    }
  };

  const handleStopTyping = () => {
    if (isChatConnected && userId && currentUser && currentUser._id) {
      console.log(
        `DirectMessaging: Emitting stopTypingPrivate event for user ${currentUser._id} to ${userId}`
      );
      emitChatEvent("stopTypingPrivate", {
        userId: currentUser._id,
        receiverId: userId,
      });
    }
  };

  // Mark messages as seen
  const markMessagesAsSeen = async (senderUserId) => {
    if (!senderUserId) {
      console.log("No sender user ID provided for marking messages as seen");
      return;
    }

    try {
      console.log("Marking messages as seen for sender:", senderUserId);

      const response = await fetch(`/api/v1/chat/mark/${senderUserId}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        let errorMessage = "Mesajlar okundu olarak işaretlenirken hata oluştu";

        try {
          const errorData = await response.json();
          errorMessage = errorData.msg || errorData.message || errorMessage;
        } catch {
          // If we can't parse the error response, use status-based messages
          switch (response.status) {
            case 400:
              errorMessage = "Gerekli bilgileri sağlayın";
              break;
            case 401:
              errorMessage = "Oturum süreniz dolmuş. Lütfen tekrar giriş yapın";
              break;
            case 403:
              errorMessage =
                "Bu mesajları okundu olarak işaretleme yetkiniz yok";
              break;
            case 404:
              errorMessage = "Kullanıcı bulunamadı";
              break;
            case 429:
              errorMessage = "Çok fazla istek. Lütfen biraz bekleyin";
              break;
            case 500:
              errorMessage =
                "Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin";
              break;
            default:
              errorMessage = `Sunucu hatası: ${response.status}`;
          }
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Messages marked as seen successfully:", data);

      // Refresh unseen direct messages to update UI
      await refreshUnseenDirectMessages();
    } catch (err) {
      console.error("Error marking messages as seen:", err);

      // Enhanced error handling with Turkish messages
      let errorMessage = "Mesajlar okundu olarak işaretlenirken hata oluştu";

      if (err.name === "TypeError" && err.message.includes("fetch")) {
        errorMessage =
          "Bağlantı hatası oluştu. İnternet bağlantınızı kontrol edin";
      } else if (err.message) {
        errorMessage = translateMessage(err.message);
      }

      // Only show error notification for critical errors, not for minor issues
      console.error("Mark as seen error:", errorMessage);
      // Don't show notification to user as this is a background operation
    }
  };

  // Initialize chat when component mounts
  useEffect(() => {
    // Don't redirect during auth loading
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!userId) {
      setError("Kullanıcı ID'si bulunamadı.");
      setLoading(false);
      return;
    }

    if (userId === currentUser?._id) {
      setError("Kendinizle mesajlaşamazsınız.");
      setLoading(false);
      return;
    }

    fetchTargetUser(userId);
    fetchChatHistory(userId);

    // Mark messages as seen when entering this chat
    markMessagesAsSeen(userId);
  }, [userId, currentUser, isAuthenticated, authLoading, navigate]);

  // Set up WebSocket listeners for real-time messages
  useEffect(() => {
    if (isChatConnected && userId) {
      console.log("Setting up DM WebSocket listeners for user:", userId);

      // Listen for incoming private messages
      const handlePrivateMessage = (data) => {
        console.log("Received privateMessage event:", data);

        if (data && data.message) {
          const message = data.message;

          // Only add message if it's from the user we're chatting with
          if (message.sender && message.sender._id === userId) {
            console.log("Adding received private message to chat:", message);
            setMessages((prev) => [...prev, message]);
            setShouldScrollToBottom(true);

            // Mark this message as seen since user is currently viewing this chat
            markMessagesAsSeen(userId);
          } else {
            console.log("Private message not from current chat user, ignoring");
          }
        }
      };

      // Listen for edited private messages
      const handlePrivateMessageEdited = (data) => {
        console.log("Received privateMessageEdited event:", data);

        if (data && data.message) {
          const editedMessage = data.message;

          // Only update message if it's from the user we're chatting with
          if (editedMessage.sender && editedMessage.sender._id === userId) {
            console.log(
              "Updating edited private message in chat:",
              editedMessage
            );
            setMessages((prevMessages) => {
              return prevMessages.map((message) => {
                if (message._id === editedMessage._id) {
                  console.log("Found message to update:", editedMessage);
                  return editedMessage;
                }
                return message;
              });
            });
          } else {
            console.log(
              "Edited private message not from current chat user, ignoring"
            );
          }
        }
      };

      // Listen for deleted private messages
      const handleIndividualMessageDeleted = (data) => {
        console.log("Received individualMessageDeleted event:", data);

        if (data && data.messageId && data.sender) {
          const { messageId, sender } = data;

          // Only remove message if it's from the user we're chatting with
          if (sender === userId) {
            console.log(
              "Removing deleted private message from chat:",
              messageId
            );
            setMessages((prevMessages) => {
              return prevMessages.filter(
                (message) => message._id !== messageId
              );
            });

            // Clear editing state if the deleted message was being edited
            if (editingMessageId === messageId) {
              setEditingMessageId(null);
              setEditingText("");
            }
          } else {
            console.log(
              "Deleted private message not from current chat user, ignoring"
            );
          }
        }
      };

      // Set up listeners for privateMessage, privateMessageEdited, and individualMessageDeleted events
      const cleanupPrivateMessage = listenForChatEvent(
        "privateMessage",
        handlePrivateMessage
      );

      const cleanupPrivateMessageEdited = listenForChatEvent(
        "privateMessageEdited",
        handlePrivateMessageEdited
      );

      const cleanupIndividualMessageDeleted = listenForChatEvent(
        "individualMessageDeleted",
        handleIndividualMessageDeleted
      );

      // Listen for private typing events
      const handleTypingInPrivate = (data) => {
        console.log("Received typingInPrivate event:", data);

        if (data && data.userId) {
          // Only show typing indicator if it's from the user we're chatting with
          if (data.userId === userId) {
            console.log(`User ${data.userId} started typing in private chat`);
            setIsTypingUser(data.userId);
          } else {
            console.log(
              `Typing from different user ${data.userId}, ignoring (current chat: ${userId})`
            );
          }
        }
      };

      const handleStopTypingInPrivate = (data) => {
        console.log("Received stopTypingInPrivate event:", data);

        if (data && data.userId) {
          // Only remove typing indicator if it's from the user we're chatting with
          if (data.userId === userId) {
            console.log(`User ${data.userId} stopped typing in private chat`);
            setIsTypingUser(null);
          } else {
            console.log(
              `Stop typing from different user ${data.userId}, ignoring (current chat: ${userId})`
            );
          }
        }
      };

      const cleanupTypingInPrivate = listenForChatEvent(
        "typingInPrivate",
        handleTypingInPrivate
      );

      const cleanupStopTypingInPrivate = listenForChatEvent(
        "stopTypingInPrivate",
        handleStopTypingInPrivate
      );

      // Cleanup function
      return () => {
        cleanupPrivateMessage();
        cleanupPrivateMessageEdited();
        cleanupIndividualMessageDeleted();
        cleanupTypingInPrivate();
        cleanupStopTypingInPrivate();
      };
    }
  }, [isChatConnected, userId, listenForChatEvent]);

  // Loading state (both auth loading and component loading)
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {authLoading ? "Kimlik doğrulanıyor..." : "Sohbet yükleniyor..."}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Sohbet Bulunamadı
          </h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <div className="space-x-4">
            <button
              onClick={() => window.history.back()}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              Geri Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <div className="flex-1 flex flex-col pt-16">
        {/* Chat Header */}
        <ChatHeader
          targetUser={targetUser}
          isUserOnline={isUserOnline}
          getProfilePictureUrl={getProfilePictureUrl}
        />

        {/* Messages Container */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto px-4 py-4">
            <div className="max-w-4xl mx-auto">
              <MessageList
                messages={messages}
                currentUser={currentUser}
                targetUser={targetUser}
                isUserOnline={isUserOnline}
                editingMessageId={editingMessageId}
                editingText={editingText}
                onEditTextChange={handleEditTextChange}
                onEditMessage={handleEditMessage}
                onDeleteMessage={handleDeleteMessage}
                onSaveEdit={handleSaveEditedMessage}
                onCancelEdit={handleCancelEdit}
                shouldScrollToBottom={shouldScrollToBottom}
                showNotification={showNotification}
                isTypingUser={isTypingUser}
              />
            </div>
          </div>
        </div>

        {/* Message Input */}
        <MessageInput
          targetUser={targetUser}
          sending={sending}
          isChatConnected={isChatConnected}
          onSendMessage={handleSendMessage}
          showNotification={showNotification}
          onStartTyping={handleStartTyping}
          onStopTyping={handleStopTyping}
        />
      </div>

      <Footer />

      {/* Notification */}
      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />
    </div>
  );
}

export default DirectMessaging;
