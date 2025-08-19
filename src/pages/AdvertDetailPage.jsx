import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useWebSocket } from "../context/WebSocketContext";
import Header from "../components/shared/Header";
import Footer from "../components/shared/Footer";
import AdvertInfo from "../components/advert-detail/AdvertInfo";
import MessagingSection from "../components/advert-detail/MessagingSection";
import Notification from "../components/shared/Notification";

function AdvertDetailPage() {
  const { advertId } = useParams();
  const { user, markAdvertMessagesAsSeen } = useAuth();
  const {
    notificationSocket,
    isNotificationConnected,
    chatSocket,
    isChatConnected,
    joinChatRoom,
    leaveChatRoom,
    leaveChatRoomMultiple,
  } = useWebSocket();
  const [advert, setAdvert] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [determiningStatus, setDeterminingStatus] = useState(false);
  const [error, setError] = useState(null);
  const [userParticipationStatus, setUserParticipationStatus] = useState(null); // 'participant', 'waiting', 'none', null = not checked yet

  // Notification states
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState("success");

  // Show notification helper
  const showNotificationMessage = (message, type = "success") => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
  };

  // Close notification handler
  const handleCloseNotification = () => {
    setShowNotification(false);
  };

  // Function to check user participation status
  const checkUserParticipationStatus = (advertData, currentUser) => {
    if (!advertData || !currentUser || !currentUser._id) {
      return "none";
    }

    // Check if user is the creator of the advert
    const isCreator =
      advertData.createdBy && advertData.createdBy._id === currentUser._id;

    if (isCreator) {
      return "participant"; // Creator is always considered a participant
    }

    // Check if user is a participant
    const isParticipant =
      advertData.participants &&
      Array.isArray(advertData.participants) &&
      advertData.participants.some(
        (participant) =>
          participant.user && participant.user._id === currentUser._id
      );

    if (isParticipant) {
      return "participant";
    }

    // Check if user is in waiting list
    const isInWaitingList =
      advertData.waitingList &&
      Array.isArray(advertData.waitingList) &&
      advertData.waitingList.some(
        (waitingUser) =>
          waitingUser.user && waitingUser.user._id === currentUser._id
      );

    if (isInWaitingList) {
      return "waiting";
    }

    return "none";
  };

  // Generate dummy messages for blurred state
  const generateDummyMessages = () => {
    return [
      {
        _id: "dummy1",
        content: "Merhaba arkadaşlar, bugün maç için hazır mısınız?",
        sender: "dummy-sender-1",
        type: "text",
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        senderInfo: {
          _id: "dummy-sender-1",
          name: "Ahmet K.",
          profilePicture: "https://via.placeholder.com/32/4CAF50/white?text=AK",
        },
      },
      {
        _id: "dummy2",
        content: "Evet! Saat kaçta buluşalım?",
        sender: "dummy-sender-2",
        type: "text",
        createdAt: new Date(Date.now() - 3300000).toISOString(),
        senderInfo: {
          _id: "dummy-sender-2",
          name: "Mehmet Y.",
          profilePicture: "https://via.placeholder.com/32/2196F3/white?text=MY",
        },
      },
      {
        _id: "dummy3",
        content: "18:00 da sahanın önünde buluşalım",
        sender: "dummy-sender-3",
        type: "text",
        createdAt: new Date(Date.now() - 3000000).toISOString(),
        senderInfo: {
          _id: "dummy-sender-3",
          name: "Ali D.",
          profilePicture: "https://via.placeholder.com/32/FF9800/white?text=AD",
        },
      },
      {
        _id: "dummy4",
        content: "Kaleci de var mı aramızda?",
        sender: "dummy-sender-4",
        type: "text",
        createdAt: new Date(Date.now() - 2700000).toISOString(),
        senderInfo: {
          _id: "dummy-sender-4",
          name: "Fatma Ö.",
          profilePicture: "https://via.placeholder.com/32/E91E63/white?text=FO",
        },
      },
      {
        _id: "dummy5",
        content: "Ben kaleciyim, hazırım! 👐",
        sender: "dummy-sender-5",
        type: "text",
        createdAt: new Date(Date.now() - 2400000).toISOString(),
        senderInfo: {
          _id: "dummy-sender-5",
          name: "Emre S.",
          profilePicture: "https://via.placeholder.com/32/9C27B0/white?text=ES",
        },
      },
      {
        _id: "dummy6",
        content: "Harika! O zaman takım hazır demektir",
        sender: "dummy-sender-1",
        type: "text",
        createdAt: new Date(Date.now() - 2100000).toISOString(),
        senderInfo: {
          _id: "dummy-sender-1",
          name: "Ahmet K.",
          profilePicture: "https://via.placeholder.com/32/4CAF50/white?text=AK",
        },
      },
    ];
  };

  // Translate error messages to Turkish
  const translateErrorMessage = (message) => {
    const errorTranslations = {
      "Advert not found": "İlan bulunamadı",
      "Messages not found": "Mesajlar bulunamadı",
      "You are not a participant of this advert":
        "Bu ilanın katılımcısı değilsiniz",
      NotFoundError: "İlan bulunamadı",
      BadRequestError: "Geçersiz istek",
      UnauthorizedError: "Yetkisiz erişim",
      ForbiddenError: "Erişim engellendi",
      "Failed to fetch": "Sunucuya bağlanılamadı",
      "Network error": "Ağ bağlantısı hatası",
      "Backend error": "Sunucu hatası",
      "Please provide required data": "Gerekli bilgileri sağlayın",
    };

    // Check if the message contains any known error patterns
    for (const [englishError, turkishError] of Object.entries(
      errorTranslations
    )) {
      if (message.includes(englishError)) {
        return turkishError;
      }
    }

    // If no translation found, return original message
    return message || "Bilinmeyen bir hata oluştu";
  };

  // Scroll to top function
  const scrollToTop = () => {
    // Multiple methods to ensure scroll to top works
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Force scroll position multiple times
    setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 0);

    setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 50);
  };

  // Disable browser scroll restoration
  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    // Force scroll to top immediately on page load/refresh
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Multiple aggressive scroll attempts
    const forceScrollTop = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    forceScrollTop();
    setTimeout(forceScrollTop, 10);
    setTimeout(forceScrollTop, 50);
    setTimeout(forceScrollTop, 100);
    setTimeout(forceScrollTop, 200);

    return () => {
      if ("scrollRestoration" in history) {
        history.scrollRestoration = "auto";
      }
    };
  }, []);

  // Scroll to top and refresh data when component mounts or advertId changes
  useEffect(() => {
    // Clear previous data to force fresh load
    setAdvert(null);
    setMessages([]);
    setLoading(true);
    setError(null);

    // Immediate scroll to top
    scrollToTop();
  }, [advertId]); // Depend on advertId to refresh when URL changes

  // Prevent scrolling when loading state changes
  useEffect(() => {
    if (!loading) {
      // When loading completes, ensure we're at the top
      scrollToTop();
    }
  }, [loading]);

  // Additional scroll control for page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // When page becomes visible again, scroll to top
        setTimeout(() => scrollToTop(), 100);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Helper function to map sender IDs to user information
  const enrichMessagesWithUserInfo = (messages, advert) => {
    if (!messages) return messages;

    // Create a map of user IDs to user information
    const userMap = new Map();

    // Add creator to user map (with null check)
    if (advert && advert.createdBy && advert.createdBy._id) {
      userMap.set(advert.createdBy._id, advert.createdBy);
    }

    // Add all participants to user map (with null checks)
    if (advert && advert.participants && Array.isArray(advert.participants)) {
      advert.participants.forEach((participant) => {
        if (participant.user && participant.user._id) {
          userMap.set(participant.user._id, participant.user);
        }
      });
    }

    // Add waiting list users to user map (with null checks)
    if (advert && advert.waitingList && Array.isArray(advert.waitingList)) {
      advert.waitingList.forEach((waitingUser) => {
        if (waitingUser.user && waitingUser.user._id) {
          userMap.set(waitingUser.user._id, waitingUser.user);
        }
      });
    }

    // Mock user data for message senders (since they might not be in participants)
    const mockUsers = {
      "68347987b024a2d8571443b2": {
        _id: "68347987b024a2d8571443b2",
        name: "Ahmet Yılmaz",
        profilePicture: "https://via.placeholder.com/32/FF5722/white?text=AY",
      },
      "6841e708222bba20673cc337": {
        _id: "6841e708222bba20673cc337",
        name: "Mehmet Kaya",
        profilePicture: "https://via.placeholder.com/32/2196F3/white?text=MK",
      },
      "6841e844222bba20673cc339": {
        _id: "6841e844222bba20673cc339",
        name: "Ali Demir",
        profilePicture: "https://via.placeholder.com/32/4CAF50/white?text=AD",
      },
      "6846f236f95a3b7499dfd98b": {
        _id: "6846f236f95a3b7499dfd98b",
        name: "Fatma Özkan",
        profilePicture: "https://via.placeholder.com/32/E91E63/white?text=FO",
      },
      "688890cba69689a3ca2dd938": {
        _id: "688890cba69689a3ca2dd938",
        name: "Emre Şahin",
        profilePicture: "https://via.placeholder.com/32/9C27B0/white?text=ES",
      },
      "688892f9a69689a3ca2dd943": {
        _id: "688892f9a69689a3ca2dd943",
        name: "Zeynep Arslan",
        profilePicture: "https://via.placeholder.com/32/FF9800/white?text=ZA",
      },
      "68889962a69689a3ca2dd951": {
        _id: "68889962a69689a3ca2dd951",
        name: "Burak Çelik",
        profilePicture: "https://via.placeholder.com/32/607D8B/white?text=BC",
      },
      "6888be8982a459125acd4d42": {
        _id: "6888be8982a459125acd4d42",
        name: "Ayşe Güler",
        profilePicture: "https://via.placeholder.com/32/795548/white?text=AG",
      },
      "687243c690c09520e98cafd2": {
        _id: "687243c690c09520e98cafd2",
        name: "Oğuz Kaan",
        profilePicture: "https://via.placeholder.com/32/3F51B5/white?text=OK",
      },
      "6846df07e810518fb9e60c72": {
        _id: "6846df07e810518fb9e60c72",
        name: "Selin Yıldız",
        profilePicture: "https://via.placeholder.com/32/009688/white?text=SY",
      },
      "686e61f70d43f60e09a66ebe": {
        _id: "686e61f70d43f60e09a66ebe",
        name: "Hasan Polat",
        profilePicture: "https://via.placeholder.com/32/8BC34A/white?text=HP",
      },
      "68888d16a69689a3ca2dd931": {
        _id: "68888d16a69689a3ca2dd931",
        name: "Deniz Akar",
        profilePicture: "https://via.placeholder.com/32/CDDC39/white?text=DA",
      },
      "6888bf1f82a459125acd4d47": {
        _id: "6888bf1f82a459125acd4d47",
        name: "Murat Doğan",
        profilePicture: "https://via.placeholder.com/32/FFC107/white?text=MD",
      },
    };

    // Add mock users to user map
    Object.values(mockUsers).forEach((user) => {
      userMap.set(user._id, user);
    });

    // Enrich messages with user information
    return messages.map((message) => ({
      ...message,
      senderInfo: userMap.get(message.sender) || {
        _id: message.sender,
        name: "Bilinmeyen Kullanıcı",
        profilePicture: "https://via.placeholder.com/32/9E9E9E/white?text=?",
      },
    }));
  };

  // Fetch chat messages for the advert - Step 2.1
  const fetchChatMessages = async (advertId, advertData = null) => {
    try {
      console.log("Fetching chat messages for advert:", advertId);
      setMessagesLoading(true);

      const messagesResponse = await fetch(
        `/api/v1/advert-chat/messages/${advertId}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!messagesResponse.ok) {
        const errorData = await messagesResponse.json().catch(() => ({}));

        if (messagesResponse.status === 404) {
          // Handle 404 - could be either advert not found or messages not found
          if (errorData.msg && errorData.msg.includes("Messages not found")) {
            console.log(
              "No messages found for this advert - initializing empty messages"
            );
            setMessages([]);
            setMessagesLoading(false); // Explicitly stop loading for 404 messages not found
            return; // Don't throw error for no messages, just set empty array
          } else if (
            errorData.msg &&
            errorData.msg.includes("Advert not found")
          ) {
            throw new Error("İlan bulunamadı");
          } else {
            throw new Error("İlan veya mesajlar bulunamadı");
          }
        } else if (messagesResponse.status === 401) {
          throw new Error("Yetkisiz erişim");
        } else if (messagesResponse.status === 403) {
          throw new Error("Bu işlemi gerçekleştirme yetkiniz yok");
        } else if (messagesResponse.status === 400) {
          // Handle specific 400 errors
          if (
            errorData.msg &&
            errorData.msg.includes("You are not a participant")
          ) {
            throw new Error("Bu ilanın katılımcısı değilsiniz");
          } else if (
            errorData.msg &&
            errorData.msg.includes("Please provide required data")
          ) {
            throw new Error("Gerekli bilgileri sağlayın");
          } else {
            throw new Error("Geçersiz istek");
          }
        } else {
          throw new Error(
            errorData.msg || `Backend error: ${messagesResponse.status}`
          );
        }
      }

      const messagesData = await messagesResponse.json();
      console.log("Chat messages fetched successfully:", messagesData);

      if (messagesData.messages && Array.isArray(messagesData.messages)) {
        // Backend returns { messages: [...], userId: "..." }
        console.log("Processing messages array:", messagesData.messages.length);
        console.log("Messages seen by user:", messagesData.userId);

        // Messages come pre-populated from backend, no need for enrichment
        console.log("Setting messages from backend:", messagesData.messages);
        console.log(
          "First message attachments:",
          messagesData.messages[0]?.attachments
        );
        setMessages(messagesData.messages);

        // Mark messages as seen for this advert since user just fetched them
        if (advertId && user && user._id) {
          markAdvertMessagesAsSeen(advertId);
          console.log(`Marked messages as seen for advert: ${advertId}`);
        }
      } else {
        console.log(
          "No messages data in response - initializing empty messages"
        );
        setMessages([]);
      }
    } catch (err) {
      console.error("Error fetching chat messages:", err);

      // Only show error notifications for non-404 errors or critical errors
      if (
        !err.message.includes("İlan veya mesajlar bulunamadı") &&
        !err.message.includes("Messages not found")
      ) {
        showNotificationMessage(err.message, "error");
      }

      // Initialize empty messages array on any error
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Validate advertId
        if (!advertId) {
          throw new Error("İlan ID bulunamadı");
        }

        // Fetch advert data from backend API - Step 1.1
        const advertResponse = await fetch(`/api/v1/advert/${advertId}`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!advertResponse.ok) {
          const errorData = await advertResponse.json().catch(() => ({}));

          if (advertResponse.status === 404) {
            throw new Error("NotFoundError");
          } else if (advertResponse.status === 401) {
            throw new Error("UnauthorizedError");
          } else if (advertResponse.status === 403) {
            throw new Error("ForbiddenError");
          } else if (advertResponse.status === 400) {
            throw new Error("BadRequestError");
          } else {
            throw new Error(
              errorData.msg || `Backend error: ${advertResponse.status}`
            );
          }
        }

        const advertData = await advertResponse.json();
        const foundAdvert = advertData.advert;

        // Validate advert data
        if (!foundAdvert) {
          throw new Error("İlan verisi alınamadı");
        }

        // Successfully loaded advert data
        setAdvert(foundAdvert);

        // Check user participation status (only if user is loaded)
        if (user && user._id) {
          const participationStatus = checkUserParticipationStatus(
            foundAdvert,
            user
          );
          setUserParticipationStatus(participationStatus);

          // Determine message state based on participation status - NO backend calls for non-participants
          if (participationStatus === "participant") {
            // Only for participants: fetch real messages from backend
            setMessages([]);
            fetchChatMessages(advertId, foundAdvert);
          } else if (participationStatus === "waiting") {
            // Waiting list users: dummy messages (will show "Bekleme Listesinde" overlay)
            setMessages(generateDummyMessages());
          } else {
            // Non-participants: dummy messages (will show "Mesajlara Erişim Yok" overlay)
            setMessages(generateDummyMessages());
          }
        } else {
          // User not loaded yet, show status determination spinner in message area
          setUserParticipationStatus(null);
          setMessages([]);
          setDeterminingStatus(true);
        }
      } catch (err) {
        console.error("Error fetching advert data:", err);
        const translatedError = translateErrorMessage(err.message);
        setError(translatedError);
        showNotificationMessage(translatedError, "error");
      } finally {
        setLoading(false);
      }
    };

    if (advertId) {
      fetchData();
    }
  }, [advertId, user]); // Added user as dependency

  // Separate effect to handle user data changes after advert is loaded
  useEffect(() => {
    if (advert && user && user._id && userParticipationStatus === null) {
      // This effect only runs when we first get user data and haven't set participation status yet
      const participationStatus = checkUserParticipationStatus(advert, user);
      console.log(
        "Initial user participation status check:",
        participationStatus
      );
      setUserParticipationStatus(participationStatus);

      // Stop the status determination spinner
      setDeterminingStatus(false);

      // Set message state based on participation status - NO backend calls for non-participants
      if (participationStatus === "participant") {
        console.log(
          "Fetching messages for identified participant (delayed user load)"
        );
        setMessages([]); // Clear messages and show loading spinner
        fetchChatMessages(advertId, advert);
      } else if (participationStatus === "waiting") {
        // Waiting list users: dummy messages (will show "Bekleme Listesinde" overlay)
        setMessages(generateDummyMessages());
      } else {
        // Non-participants: dummy messages (will show "Mesajlara Erişim Yok" overlay)
        setMessages(generateDummyMessages());
      }
    }
  }, [user]); // Only react to user changes

  // Function to leave the advert room (notification namespace)
  const leaveAdvertRoom = (roomId) => {
    if (notificationSocket && notificationSocket.connected && roomId) {
      console.log(`Leaving advert room: ${roomId}`);
      notificationSocket.emit("leaveRoom", { roomId });
      console.log(`Successfully emitted leaveRoom event for advert: ${roomId}`);
    }
  };

  // WebSocket joinRoom effect - Join advert room for real-time notifications
  useEffect(() => {
    if (
      notificationSocket &&
      isNotificationConnected &&
      advertId &&
      user && // Only join if user is authenticated
      user._id
    ) {
      console.log(
        `Joining advert room for real-time notifications. AdvertId: ${advertId}, User: ${user._id}`
      );

      // Emit joinRoom event to backend with advert ID as roomId
      notificationSocket.emit("joinRoom", { roomId: advertId });

      console.log(
        `Successfully emitted joinRoom event for advert: ${advertId}`
      );

      // Cleanup function to leave room when component unmounts
      return () => {
        leaveAdvertRoom(advertId);
      };
    }
  }, [notificationSocket, isNotificationConnected, advertId, user]);

  // Chat room joining effect - Only participants should join chat room
  useEffect(() => {
    if (
      chatSocket &&
      isChatConnected &&
      advertId &&
      user &&
      user._id &&
      userParticipationStatus === "participant"
    ) {
      console.log(
        `Joining chat room for participant. AdvertId: ${advertId}, User: ${user._id}`
      );

      // Join chat room for real-time message updates
      joinChatRoom(advertId);

      // Cleanup function to leave chat room when component unmounts
      return () => {
        leaveChatRoom(advertId);
      };
    } else if (
      chatSocket &&
      isChatConnected &&
      advertId &&
      userParticipationStatus !== "participant" &&
      userParticipationStatus !== null
    ) {
      // User is not a participant anymore, leave chat room
      leaveChatRoom(advertId);
    }
  }, [
    chatSocket,
    isChatConnected,
    advertId,
    user,
    userParticipationStatus,
    joinChatRoom,
    leaveChatRoom,
  ]);

  // Effect to handle page unload and navigation - ensure user leaves rooms
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (advertId && user && user._id) {
        leaveAdvertRoom(advertId);
        if (userParticipationStatus === "participant") {
          leaveChatRoom(advertId);
        }
      }
    };

    const handlePageHide = () => {
      if (advertId && user && user._id) {
        leaveAdvertRoom(advertId);
        if (userParticipationStatus === "participant") {
          leaveChatRoom(advertId);
        }
      }
    };

    // Add event listeners
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handlePageHide);

    // Cleanup event listeners on component unmount
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handlePageHide);

      // Also leave rooms when component unmounts (navigation away)
      if (advertId && user && user._id) {
        leaveAdvertRoom(advertId);
        if (userParticipationStatus === "participant") {
          leaveChatRoom(advertId);
        }
      }
    };
  }, [advertId, user, userParticipationStatus]);

  // WebSocket event listeners for real-time advert updates
  useEffect(() => {
    if (notificationSocket && isNotificationConnected) {
      console.log("Setting up WebSocket event listeners for advert updates");

      // Handle new join requests (advertRequest event)
      const handleAdvertRequest = (data) => {
        console.log("Received advertRequest event:", data);

        if (data.user && advert) {
          // Update the advert state by adding the new user to the waiting list
          const updatedAdvert = {
            ...advert,
            waitingList: [
              ...advert.waitingList,
              {
                user: data.user,
                requestedAt: new Date().toISOString(),
              },
            ],
          };

          console.log(
            "Updated advert with new waiting list user:",
            updatedAdvert
          );

          // Update the advert state which will trigger UI updates
          handleAdvertUpdate(updatedAdvert);
        }
      };

      // Handle user request acceptance (requestAccept event)
      const handleRequestAccept = (data) => {
        console.log("Received requestAccept event:", data);
        console.log(
          "Is current user the one being accepted?",
          data.user?._id === user?._id
        );

        if (data.user && advert) {
          // Move user from waiting list to participants
          const updatedAdvert = {
            ...advert,
            participants: [
              ...advert.participants,
              {
                user: data.user,
                joinedAt: new Date().toISOString(),
              },
            ],
            waitingList: advert.waitingList.filter(
              (waitingUser) => waitingUser.user._id !== data.user._id
            ),
          };

          console.log("Updated advert with accepted user:", updatedAdvert);
          console.log(
            "Current user participation status after accept:",
            checkUserParticipationStatus(updatedAdvert, user)
          );

          // Update the advert state which will trigger UI updates
          handleAdvertUpdate(updatedAdvert);
        }
      };

      // Handle user request rejection (requestRejected event)
      const handleRequestRejected = (data) => {
        console.log("Received requestRejected event:", data);

        if (data.user && advert) {
          // Remove user from waiting list
          const updatedAdvert = {
            ...advert,
            waitingList: advert.waitingList.filter(
              (waitingUser) => waitingUser.user._id !== data.user._id
            ),
          };

          console.log(
            "Updated advert with rejected user removed:",
            updatedAdvert
          );

          // Update the advert state which will trigger UI updates
          handleAdvertUpdate(updatedAdvert);
        }
      };

      // Handle admin addition (adminAdded event)
      const handleAdminAdded = (data) => {
        console.log("Received adminAdded event:", data);

        if (data.user && advert) {
          // Add user to adminAdvert array if not already there
          const isAlreadyAdmin = advert.adminAdvert.some(
            (adminId) => adminId === data.user._id
          );

          if (!isAlreadyAdmin) {
            const updatedAdvert = {
              ...advert,
              adminAdvert: [...advert.adminAdvert, data.user._id],
            };

            console.log("Updated advert with new admin:", updatedAdvert);

            // Update the advert state which will trigger UI updates
            handleAdvertUpdate(updatedAdvert);
          }
        }
      };

      // Handle admin removal (adminRemoved event)
      const handleAdminRemoved = (data) => {
        console.log("Received adminRemoved event:", data);

        if (data.user && advert) {
          // Remove user from adminAdvert array
          const updatedAdvert = {
            ...advert,
            adminAdvert: advert.adminAdvert.filter(
              (adminId) => adminId !== data.user._id
            ),
          };

          console.log("Updated advert with admin removed:", updatedAdvert);

          // Update the advert state which will trigger UI updates
          handleAdvertUpdate(updatedAdvert);
        }
      };

      // Handle participant expulsion (participantExpelled event)
      const handleParticipantExpelled = (data) => {
        console.log("Received participantExpelled event:", data);

        if (data.user && advert) {
          // Emit leaveRoom for chat namespace for the expelled user
          leaveChatRoom(advert._id, data.user._id);

          // Remove user from both participants and adminAdvert arrays
          const updatedAdvert = {
            ...advert,
            participants: advert.participants.filter(
              (participant) => participant.user._id !== data.user._id
            ),
            adminAdvert: advert.adminAdvert.filter(
              (adminId) => adminId !== data.user._id
            ),
          };

          console.log(
            "Updated advert with participant expelled:",
            updatedAdvert
          );

          // Update the advert state which will trigger UI updates
          handleAdvertUpdate(updatedAdvert);
        }
      };

      // Handle user leaving advert (leaveAdvert event)
      const handleLeaveAdvert = (data) => {
        console.log("Received leaveAdvert event:", data);

        if (data.user && advert) {
          // Emit leaveRoom for chat namespace for the leaving user
          leaveChatRoom(advert._id, data.user._id);

          let updatedAdvert = { ...advert };

          // Scenario 1: Regular user leaving (no newCreator or newCreatorParticipant)
          if (!data.newCreator && !data.newCreatorParticipant) {
            console.log("Regular user leaving advert:", data.user.name);

            // Remove user from participants and adminAdvert arrays
            updatedAdvert = {
              ...updatedAdvert,
              participants: advert.participants.filter(
                (participant) => participant.user._id !== data.user._id
              ),
              adminAdvert: advert.adminAdvert.filter(
                (adminId) => adminId !== data.user._id
              ),
            };
          }

          // Scenario 2: Owner leaving, new creator from existing admins (newCreator)
          else if (data.newCreator && !data.newCreatorParticipant) {
            console.log(
              "Owner leaving, new creator from admins:",
              data.newCreator.name
            );

            // Remove the leaving user from participants and adminAdvert
            updatedAdvert = {
              ...updatedAdvert,
              participants: advert.participants.filter(
                (participant) => participant.user._id !== data.user._id
              ),
              adminAdvert: advert.adminAdvert.filter(
                (adminId) => adminId !== data.user._id
              ),
              // Update the createdBy to the new creator
              createdBy: data.newCreator,
            };
          }

          // Scenario 3: Owner leaving, new creator from participants (newCreatorParticipant)
          else if (data.newCreatorParticipant && !data.newCreator) {
            console.log(
              "Owner leaving, new creator from participants:",
              data.newCreatorParticipant.name
            );

            // Remove the leaving user from participants and adminAdvert
            updatedAdvert = {
              ...updatedAdvert,
              participants: advert.participants.filter(
                (participant) => participant.user._id !== data.user._id
              ),
              adminAdvert: advert.adminAdvert.filter(
                (adminId) => adminId !== data.user._id
              ),
              // Update the createdBy to the new creator
              createdBy: data.newCreatorParticipant,
            };

            // Add the new creator to adminAdvert array (they become both owner and admin)
            if (
              !updatedAdvert.adminAdvert.includes(
                data.newCreatorParticipant._id
              )
            ) {
              updatedAdvert.adminAdvert = [
                ...updatedAdvert.adminAdvert,
                data.newCreatorParticipant._id,
              ];
            }
          }

          console.log("Updated advert after user left:", updatedAdvert);

          // Update the advert state which will trigger UI updates
          handleAdvertUpdate(updatedAdvert);
        }
      };

      // Handle advert deletion (advertDeleted event)
      const handleAdvertDeleted = (data) => {
        console.log("Received advertDeleted event:", data);

        if (data.advertId && data.advertId === advertId) {
          console.log("Current advert has been deleted by owner");

          // Emit leaveRoom for chat namespace for all participants
          if (
            advert &&
            advert.participants &&
            Array.isArray(advert.participants)
          ) {
            const allParticipantIds = advert.participants.map(
              (p) => p.user._id
            );
            leaveChatRoomMultiple(advertId, allParticipantIds);
          }

          // Leave the notification room immediately
          if (notificationSocket && notificationSocket.connected) {
            console.log("Leaving notification room for deleted advert");
            notificationSocket.emit("leaveRoom", { roomId: advertId });
          }

          // Show notification about advert deletion
          showNotificationMessage(
            "Bu ilan sahibi tarafından silindi. Ana sayfaya yönlendiriliyorsunuz...",
            "error"
          );

          // Redirect to matches page after a short delay
          setTimeout(() => {
            window.location.href = "/matches";
          }, 3000);
        }
      };

      // Handle request revocation (revokeRequest event)
      const handleRevokeRequest = (data) => {
        console.log("Received revokeRequest event:", data);

        if (data.user && advert) {
          // Remove user from waiting list
          const updatedAdvert = {
            ...advert,
            waitingList: advert.waitingList.filter(
              (waitingUser) => waitingUser.user._id !== data.user._id
            ),
          };

          console.log(
            "Updated advert with revoked request user removed:",
            updatedAdvert
          );

          // Update the advert state which will trigger UI updates
          handleAdvertUpdate(updatedAdvert);
        }
      };

      // Handle rivalry status update (rivalryStatusUpdated event)
      const handleRivalryStatusUpdated = (data) => {
        console.log("Received rivalryStatusUpdated event:", data);

        if (typeof data.agreed !== "undefined" && advert) {
          // Update the advert state with new rivalry agreed status
          const updatedAdvert = {
            ...advert,
            isRivalry: {
              ...advert.isRivalry,
              agreed: data.agreed,
              updatedAt: new Date().toISOString(),
            },
          };

          console.log("Updated advert with rivalry status:", updatedAdvert);

          // Update the advert state which will trigger UI updates
          handleAdvertUpdate(updatedAdvert);
        }
      };

      // Handle advert status change (advertStatusChanged event)
      const handleAdvertStatusChanged = (data) => {
        console.log("Received advertStatusChanged event:", data);

        if (data.status && advert) {
          // Update the advert state with new status
          const updatedAdvert = {
            ...advert,
            status: data.status,
            updatedAt: new Date().toISOString(),
          };

          console.log("Updated advert with new status:", updatedAdvert);

          // Update the advert state which will trigger UI updates
          handleAdvertUpdate(updatedAdvert);
        }
      };

      // Handle link participation (advertLinkParticipated event)
      const handleAdvertLinkParticipated = (data) => {
        console.log("Received advertLinkParticipated event:", data);

        if (data.user && advert) {
          // Add user to participants list
          const updatedAdvert = {
            ...advert,
            participants: [
              ...advert.participants,
              {
                user: data.user,
                joinedAt: new Date().toISOString(),
              },
            ],
          };

          console.log("Updated advert with link participant:", updatedAdvert);

          // Update the advert state which will trigger UI updates
          handleAdvertUpdate(updatedAdvert);
        }
      };

      // Register event listeners
      notificationSocket.on("advertRequest", handleAdvertRequest);
      notificationSocket.on("requestAccept", handleRequestAccept);
      notificationSocket.on("requestRejected", handleRequestRejected);
      notificationSocket.on("adminAdded", handleAdminAdded);
      notificationSocket.on("adminRemoved", handleAdminRemoved);
      notificationSocket.on("participantExpelled", handleParticipantExpelled);
      notificationSocket.on("leaveAdvert", handleLeaveAdvert);
      notificationSocket.on("advertDeleted", handleAdvertDeleted);
      notificationSocket.on("revokeRequest", handleRevokeRequest);
      notificationSocket.on("rivalryStatusUpdated", handleRivalryStatusUpdated);
      notificationSocket.on("advertStatusChanged", handleAdvertStatusChanged);
      notificationSocket.on(
        "advertLinkParticipated",
        handleAdvertLinkParticipated
      );

      // Cleanup event listeners when effect unmounts
      return () => {
        console.log("Cleaning up WebSocket event listeners");
        notificationSocket.off("advertRequest", handleAdvertRequest);
        notificationSocket.off("requestAccept", handleRequestAccept);
        notificationSocket.off("requestRejected", handleRequestRejected);
        notificationSocket.off("adminAdded", handleAdminAdded);
        notificationSocket.off("adminRemoved", handleAdminRemoved);
        notificationSocket.off(
          "participantExpelled",
          handleParticipantExpelled
        );
        notificationSocket.off("leaveAdvert", handleLeaveAdvert);
        notificationSocket.off("advertDeleted", handleAdvertDeleted);
        notificationSocket.off("revokeRequest", handleRevokeRequest);
        notificationSocket.off(
          "rivalryStatusUpdated",
          handleRivalryStatusUpdated
        );
        notificationSocket.off(
          "advertStatusChanged",
          handleAdvertStatusChanged
        );
        notificationSocket.off(
          "advertLinkParticipated",
          handleAdvertLinkParticipated
        );
      };
    }
  }, [
    notificationSocket,
    isNotificationConnected,
    advert,
    leaveChatRoom,
    leaveChatRoomMultiple,
    advertId,
  ]);

  // Chat WebSocket event listeners for real-time message updates
  useEffect(() => {
    if (
      chatSocket &&
      isChatConnected &&
      userParticipationStatus === "participant"
    ) {
      console.log("Setting up Chat WebSocket event listeners for messages");

      // Handle new message (newMessage event)
      const handleNewMessage = (data) => {
        console.log("Received newMessage event:", data);
        console.log(
          "Message attachments structure:",
          data.message?.attachments
        );

        if (data.message) {
          // Message comes pre-populated from backend with sender info
          setMessages((prevMessages) => [...prevMessages, data.message]);

          // Scroll to bottom to show new message
          setTimeout(() => {
            const messageContainer = document.querySelector(
              ".messages-container"
            );
            if (messageContainer) {
              messageContainer.scrollTop = messageContainer.scrollHeight;
            }
          }, 100);

          // Mark messages as seen for this advert since user is actively viewing
          if (advertId && user && user._id) {
            markAdvertMessagesAsSeen(advertId);
            console.log(`Marked messages as seen for advert: ${advertId}`);
          }
        }
      };

      // Handle message seen events (messageSeen event)
      const handleMessageSeen = (data) => {
        console.log("Received messageSeen event:", data);

        if (data.userId) {
          // Remove the user from notSeenBy array of all messages
          setMessages((prevMessages) =>
            prevMessages.map((message) => ({
              ...message,
              notSeenBy: message.notSeenBy
                ? message.notSeenBy.filter(
                    (unseenUserId) => unseenUserId !== data.userId
                  )
                : [],
            }))
          );

          console.log(
            `Updated messages: User ${data.userId} marked messages as seen`
          );
        }
      };

      // Register event listeners
      chatSocket.on("newMessage", handleNewMessage);
      chatSocket.on("messageSeen", handleMessageSeen);

      // Cleanup event listeners when effect unmounts
      return () => {
        console.log("Cleaning up Chat WebSocket event listeners");
        chatSocket.off("newMessage", handleNewMessage);
        chatSocket.off("messageSeen", handleMessageSeen);
      };
    }
  }, [
    chatSocket,
    isChatConnected,
    userParticipationStatus,
    advert,
    advertId,
    user,
    markAdvertMessagesAsSeen,
  ]);

  const handleAdvertUpdate = (updatedAdvert) => {
    setAdvert(updatedAdvert);

    // Check user participation status with updated advert data
    const newParticipationStatus = checkUserParticipationStatus(
      updatedAdvert,
      user
    );
    const previousParticipationStatus = userParticipationStatus;
    setUserParticipationStatus(newParticipationStatus);

    // Note: All users stay in the WebSocket room regardless of participation status
    // This allows non-participants to see real-time updates (new requests, acceptances, etc.)

    // Handle message state based on participation status - NO backend calls for non-participants
    console.log("Participation status change:", {
      previous: previousParticipationStatus,
      new: newParticipationStatus,
      userId: user?._id,
      acceptedUserId: updatedAdvert?.participants?.find(
        (p) => p.user._id === user?._id
      )?.user._id,
    });

    if (
      newParticipationStatus === "participant" &&
      previousParticipationStatus !== "participant"
    ) {
      console.log("User just became participant - fetching real messages");
      // User just became a participant, fetch real messages from backend
      setMessages([]); // Clear dummy messages immediately
      setMessagesLoading(true); // Show loading spinner
      fetchChatMessages(advertId, updatedAdvert);
    } else if (newParticipationStatus === "participant") {
      // User is already a participant, messages should already be real and populated
      // No need to re-enrich since backend sends complete data
      console.log("User is already a participant with real messages");
    } else if (newParticipationStatus === "waiting") {
      // Waiting list users: dummy messages (will show "Bekleme Listesinde" overlay)
      setMessages(generateDummyMessages());
    } else {
      // Non-participants: dummy messages (will show "Mesajlara Erişim Yok" overlay)
      setMessages(generateDummyMessages());
    }
  };

  // Function to refresh messages - only for participants
  const refreshMessages = async () => {
    if (advertId && advert && userParticipationStatus === "participant") {
      await fetchChatMessages(advertId, advert);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || (!loading && !advert)) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-red-600 mb-4">
              {error === "İlan bulunamadı" ? "İlan Bulunamadı" : "Hata Oluştu"}
            </h1>
            <p className="text-lg text-gray-600">
              {error === "İlan bulunamadı"
                ? "Aradığınız ilan mevcut değil veya kaldırılmış olabilir."
                : `Bir hata oluştu: ${error}`}
            </p>
            <button
              onClick={() => (window.location.href = "/matches")}
              className="mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-md transition-colors"
            >
              Maçlara Geri Dön
            </button>
          </div>
        </div>
        <Footer />
        <Notification
          message={notificationMessage}
          type={notificationType}
          isVisible={showNotification}
          onClose={handleCloseNotification}
        />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          {/* Mobile layout */}
          <div className="lg:hidden">
            <div className="space-y-6">
              {/* Advert Info on top for mobile */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <AdvertInfo
                  advert={advert}
                  onAdvertUpdate={handleAdvertUpdate}
                />
              </div>

              {/* Messaging below for mobile */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden h-96 relative">
                <MessagingSection
                  messages={messages}
                  advertId={advertId}
                  onRefreshMessages={refreshMessages}
                  advert={advert}
                  userParticipationStatus={userParticipationStatus}
                  isBlurred={userParticipationStatus !== "participant"}
                  messagesLoading={messagesLoading}
                  determiningStatus={determiningStatus}
                />
                {/* Blur overlay for non-participants */}
                {userParticipationStatus !== "participant" &&
                  userParticipationStatus !== null && (
                    <div className="absolute inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-10">
                      <div className="bg-white/90 backdrop-blur-md rounded-lg p-6 shadow-lg max-w-sm mx-4 text-center">
                        {userParticipationStatus === "waiting" ? (
                          <>
                            <div className="mb-4">
                              <svg
                                className="w-12 h-12 text-orange-500 mx-auto"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">
                              Bekleme Listesinde
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                              Katılım talebiniz ilan yöneticilerine
                              iletilmiştir. Talebiniz onaylandıktan sonra bu
                              ilan kapsamında gerçekleşen mesajlaşmalara erişim
                              sağlayabileceksiniz.
                            </p>
                          </>
                        ) : (
                          <>
                            <div className="mb-4">
                              <svg
                                className="w-12 h-12 text-gray-400 mx-auto"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                />
                              </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">
                              Mesajlara Erişim Yok
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                              Bu ilan kapsamındaki mesajlaşmalara erişim
                              sağlamak için öncelikle ilana katılmanız
                              gerekmektedir.
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>

          {/* Desktop layout */}
          <div className="hidden lg:grid lg:grid-cols-10 gap-6 h-[calc(100vh-8rem)]">
            {/* Left side - Advert Info (30%) */}
            <div className="lg:col-span-4 bg-white rounded-lg shadow-md overflow-hidden">
              <AdvertInfo advert={advert} onAdvertUpdate={handleAdvertUpdate} />
            </div>

            {/* Right side - Messaging (70%) */}
            <div className="lg:col-span-6 bg-white rounded-lg shadow-md overflow-hidden relative">
              <MessagingSection
                messages={messages}
                advertId={advertId}
                onRefreshMessages={refreshMessages}
                advert={advert}
                userParticipationStatus={userParticipationStatus}
                isBlurred={userParticipationStatus !== "participant"}
                messagesLoading={messagesLoading}
                determiningStatus={determiningStatus}
              />
              {/* Blur overlay for non-participants */}
              {userParticipationStatus !== "participant" &&
                userParticipationStatus !== null && (
                  <div className="absolute inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-10">
                    <div className="bg-white/90 backdrop-blur-md rounded-lg p-8 shadow-lg max-w-md text-center">
                      {userParticipationStatus === "waiting" ? (
                        <>
                          <div className="mb-6">
                            <svg
                              className="w-16 h-16 text-orange-500 mx-auto"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-4">
                            Bekleme Listesinde
                          </h3>
                          <p className="text-gray-600 leading-relaxed">
                            Katılım talebiniz ilan yöneticilerine iletilmiştir.
                            Talebiniz onaylandıktan sonra bu ilan kapsamında
                            gerçekleşen mesajlaşmalara erişim
                            sağlayabileceksiniz.
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="mb-6">
                            <svg
                              className="w-16 h-16 text-gray-400 mx-auto"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                              />
                            </svg>
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-4">
                            Mesajlara Erişim Yok
                          </h3>
                          <p className="text-gray-600 leading-relaxed">
                            Bu ilan kapsamındaki mesajlaşmalara erişim sağlamak
                            için öncelikle ilana katılmanız gerekmektedir.
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <Notification
        message={notificationMessage}
        type={notificationType}
        isVisible={showNotification}
        onClose={handleCloseNotification}
      />
    </>
  );
}

export default AdvertDetailPage;
