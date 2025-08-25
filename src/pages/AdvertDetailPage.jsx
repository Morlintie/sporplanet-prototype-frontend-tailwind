import { useState, useEffect, useRef, useMemo } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/shared/Header";
import Footer from "../components/shared/Footer";
import AdvertInfo from "../components/advert-detail/AdvertInfo";
import MessagingSection from "../components/advert-detail/MessagingSection";
import Notification from "../components/shared/Notification";
import PrivateLinkPopup from "../components/shared/PrivateLinkPopup";
import AuthRequiredPopup from "../components/shared/AuthRequiredPopup";
import { useWebSocket } from "../context/WebSocketContext";
import { useAuth } from "../context/AuthContext";

function AdvertDetailPage() {
  const { advertId } = useParams();
  const {
    isUserOnline,
    emitNotificationEvent,
    isNotificationConnected,
    listenForNotificationEvent,
    emitChatEvent,
    isChatConnected,
    listenForChatEvent,
  } = useWebSocket();
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const [advert, setAdvert] = useState(null);

  // Track if we've joined a room to avoid duplicate joins
  const hasJoinedRoomRef = useRef(false);
  const currentAdvertIdRef = useRef(null);
  const hasJoinedRealRoomRef = useRef(false); // Track if we've joined the real room
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({
    message: "",
    type: "",
    isVisible: false,
  });
  const [privateLinkPopup, setPrivateLinkPopup] = useState({
    isVisible: false,
    link: "",
  });
  const [authRequiredPopup, setAuthRequiredPopup] = useState({
    isVisible: false,
    actionType: "default",
    customMessage: null,
  });
  const [typingUsers, setTypingUsers] = useState([]); // Array of user IDs who are currently typing

  // Helper function to check if current user is a participant of the advert
  const isUserParticipant = (advertData, currentUser) => {
    if (!advertData || !currentUser) {
      console.log("AdvertDetailPage: isUserParticipant - missing data", {
        hasAdvert: !!advertData,
        hasUser: !!currentUser,
      });
      return false;
    }

    // IMPORTANT: Only check if user is in participants array
    // Users in waitingList are NOT participants yet and should NOT join real room
    const isParticipant =
      advertData.participants &&
      advertData.participants.some(
        (participant) =>
          participant.user && participant.user._id === currentUser._id
      );

    // Check if user is in waiting list (should NOT be in real room)
    const isInWaitingList =
      advertData.waitingList &&
      advertData.waitingList.some(
        (waiting) => waiting.user && waiting.user._id === currentUser._id
      );

    console.log("AdvertDetailPage: isUserParticipant check", {
      userId: currentUser._id,
      advertId: advertData._id,
      isParticipant,
      isInWaitingList,
      participantsCount: advertData.participants?.length || 0,
      waitingListCount: advertData.waitingList?.length || 0,
      createdBy: advertData.createdBy,
    });

    // Only return true if user is actually in participants array
    // Being in waitingList does NOT make them a participant
    return isParticipant;
  };

  // Helper function to process messages and convert base64 attachments to displayable URLs
  const processMessageAttachments = (message) => {
    if (!message.attachments || !message.attachments.items) {
      return message;
    }

    const processedMessage = { ...message };
    processedMessage.attachments.items = processedMessage.attachments.items.map(
      (item) => {
        if (item.content && item.content.startsWith("data:")) {
          // Already a data URL, use as-is
          item.url = item.content;
        } else if (item.content && !item.url) {
          // If content is base64 without data URL prefix, create proper data URL
          const mimeType = item.mimeType || "application/octet-stream";
          item.url = `data:${mimeType};base64,${item.content}`;
        }

        // Ensure we have required properties for display
        if (!item.name) {
          item.name = "Attachment";
        }
        if (!item.mimeType) {
          item.mimeType = "application/octet-stream";
        }

        return item;
      }
    );

    return processedMessage;
  };

  // Turkish error message translation
  const translateErrorMessage = (message) => {
    const errorMessages = {
      "Please provide required data": "Gerekli bilgileri sağlayın",
      "Please provide all required data": "Gerekli bilgileri sağlayın",
      "Advert not found": "İlan bulunamadı",
      "Advert is not open for requests": "İlan şu anda katılım için açık değil",
      "You are already a participant in this advert":
        "Bu ilana zaten katılıyorsunuz",
      "You have already requested to join this advert":
        "Bu ilana zaten katılım talebinde bulundunuz",
      "You cannot get in an agreed rivalry without private link":
        "Anlaşmalı rekabete özel link olmadan katılamazsınız",
      "User not found": "Kullanıcı bulunamadı",
      "Request not found in waiting list": "Talep bekleyen listede bulunamadı",
      "User is already a participant in this advert":
        "Kullanıcı zaten bu ilana katılıyor",
      "You are not allowed to accept this request":
        "Bu talebi kabul etme yetkiniz yok",
      "You are not allowed to reject this request":
        "Bu talebi reddetme yetkiniz yok",
      "User is not a participant in this advert":
        "Kullanıcı bu ilana katılmış değil",
      "You are not allowed to remove this admin":
        "Bu admini çıkarma yetkiniz yok",
      "You cannot expel yourself from an advert, please leave it instead":
        "Kendinizi ilandan atamazsınız, lütfen ayrılın",
      "You are not allowed to expel participant from this advert":
        "Bu ilandan katılımcı atma yetkiniz yok",
      "You cannot expel the creator of this advert, please delete it instead":
        "Bu ilanın sahibini atamazsınız, lütfen ilanı silin",
      "You are not a participant in this advert":
        "Bu ilana katılmış değilsiniz",
      "You are not a participant of this advert":
        "Bu ilanın katılımcısı değilsiniz",
      "Messages not found": "Mesajlar bulunamadı",
      "Please provide content or attachments":
        "Lütfen içerik veya dosya ekleyin",
      "You can not send both content and attachments at the same time":
        "Aynı anda hem metin hem de dosya gönderemezsiniz",
      "Please provide content": "Lütfen mesaj içeriği girin",
      "Attachments must be an array with at least one item":
        "En az bir dosya eklemelisiniz",
      "File size exceeds 100MB limit": "Dosya boyutu 100MB sınırını aşıyor",
      "You have left the advert successfully": "İlandan başarıyla ayrıldınız",
      "You have left the advert successfully, and a new creator has been assigned":
        "İlandan ayrıldınız ve yeni bir lider atandı",
      "You have left the advert successfully, and it has been deleted":
        "İlandan ayrıldınız ve ilan silindi",
      "Failed to leave advert": "İlandan ayrılma işlemi başarısız oldu",
      "Failed to delete advert": "İlan silme işlemi başarısız oldu",
      "Advert deleted successfully": "İlan başarıyla silindi",
      "Failed to revoke request":
        "Katılım isteği geri alma işlemi başarısız oldu",
      "You have not requested this advert":
        "Bu ilana katılım talebinde bulunmamışsınız",
      "Failed to create private link": "Özel bağlantı oluşturulamadı",
      "You are not allowed to generate private link for this advert":
        "Bu ilan için özel bağlantı oluşturma yetkiniz yok",
      "Advert is full": "İlan dolu",
      "The invite link has been expired": "Davet bağlantısının süresi dolmuş",
      "Please provide required data": "Gerekli verileri sağlayın",
      "Failed to fetch":
        "Bağlantı hatası oluştu. İnternet bağlantınızı kontrol edin.",
      "Network Error": "Ağ hatası oluştu. Lütfen tekrar deneyin.",
      "Internal Server Error":
        "Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.",
      "Bad Request": "Geçersiz istek",
      Unauthorized: "Yetki hatası. Lütfen giriş yapın.",
      Forbidden: "Bu içeriğe erişim yetkiniz yok",
      "Not Found": "İlan bulunamadı",
      "Too Many Requests": "Çok fazla istek. Lütfen biraz bekleyin.",
      "Service Unavailable": "Servis şu anda kullanılamıyor",
    };

    return errorMessages[message] || message || "Beklenmeyen bir hata oluştu";
  };

  // Show notification helper
  const showNotification = (message, type = "error") => {
    setNotification({
      message: translateErrorMessage(message),
      type,
      isVisible: true,
    });
  };

  // Close notification
  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, isVisible: false }));
  };

  // Close private link popup
  const handleClosePrivateLinkPopup = () => {
    setPrivateLinkPopup((prev) => ({ ...prev, isVisible: false }));
  };

  // Close auth required popup
  const handleCloseAuthRequiredPopup = () => {
    setAuthRequiredPopup((prev) => ({ ...prev, isVisible: false }));
  };

  // Show auth required popup
  const showAuthRequiredPopup = (
    actionType = "default",
    customMessage = null
  ) => {
    setAuthRequiredPopup({
      isVisible: true,
      actionType,
      customMessage,
    });
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

    // Reset real room tracking for new advert
    hasJoinedRealRoomRef.current = false;

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

  useEffect(() => {
    const fetchData = async () => {
      console.log("AdvertDetailPage: fetchData called", {
        advertId,
        isAuthenticated,
        user: user ? `User ID: ${user._id}` : "No user",
        authLoading,
      });

      // Don't fetch if auth is still loading
      if (authLoading) {
        console.log("AdvertDetailPage: Skipping fetch - auth still loading");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch advert data from backend API
        const advertResponse = await fetch(`/api/v1/advert/${advertId}`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!advertResponse.ok) {
          let errorMessage = "Failed to fetch advert";

          try {
            const errorData = await advertResponse.json();
            errorMessage = errorData.msg || errorData.message || errorMessage;
          } catch {
            // If we can't parse the error response, use status-based messages
            switch (advertResponse.status) {
              case 400:
                errorMessage = "Bad Request";
                break;
              case 401:
                errorMessage = "Unauthorized";
                break;
              case 403:
                errorMessage = "Forbidden";
                break;
              case 404:
                errorMessage = "Advert not found";
                break;
              case 429:
                errorMessage = "Too Many Requests";
                break;
              case 500:
                errorMessage = "Internal Server Error";
                break;
              case 503:
                errorMessage = "Service Unavailable";
                break;
              default:
                errorMessage = `Server error: ${advertResponse.status}`;
            }
          }

          throw new Error(errorMessage);
        }

        const advertData = await advertResponse.json();
        const foundAdvert = advertData.advert;

        if (!foundAdvert) {
          throw new Error("Advert not found");
        }

        setAdvert(foundAdvert);

        // Fetch messages data from backend API (only for authenticated participants)
        console.log("AdvertDetailPage: Message fetch check", {
          isAuthenticated,
          user: user ? `User ID: ${user._id}` : "No user",
          advertId,
        });

        if (isAuthenticated && user) {
          console.log(
            "AdvertDetailPage: Attempting to fetch messages for authenticated user"
          );
          try {
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

            if (messagesResponse.ok) {
              const messagesData = await messagesResponse.json();
              console.log("Messages fetched successfully:", messagesData);

              // Process messages to convert base64 attachments to displayable URLs
              const processedMessages = (messagesData.messages || []).map(
                processMessageAttachments
              );
              setMessages(processedMessages);
            } else {
              // Handle message fetch errors (but don't fail the whole page)
              console.warn(
                "Failed to fetch messages:",
                messagesResponse.status
              );
              if (messagesResponse.status === 400) {
                console.log("User is not a participant, cannot fetch messages");
              }
              // Set empty messages array for non-participants
              setMessages([]);
            }
          } catch (messagesError) {
            console.error("Error fetching messages:", messagesError);
            // Don't fail the whole page for message errors
            setMessages([]);
          }
        } else {
          // For unauthenticated users, set empty messages
          console.log(
            "AdvertDetailPage: Not fetching messages - user not authenticated or user object missing"
          );
          setMessages([]);
        }
      } catch (err) {
        console.error("Error fetching advert data:", err);

        // Handle network errors specifically
        let errorMessage = err.message || "Failed to fetch advert";
        if (err.name === "TypeError" && err.message.includes("fetch")) {
          errorMessage = "Network Error";
        }

        setError(errorMessage);
        showNotification(errorMessage, "error");
      } finally {
        setLoading(false);
      }
    };

    if (advertId) {
      fetchData();
    }
  }, [advertId, isAuthenticated, user, authLoading]);

  // Handle notification room join/leave for advert-specific notifications
  useEffect(() => {
    // Only join rooms if user is authenticated, socket is connected, and we have advertId
    if (isAuthenticated && isNotificationConnected && advertId) {
      // Avoid duplicate joins
      if (
        !hasJoinedRoomRef.current ||
        currentAdvertIdRef.current !== advertId
      ) {
        // Leave previous room if we were in a different one
        if (
          hasJoinedRoomRef.current &&
          currentAdvertIdRef.current &&
          currentAdvertIdRef.current !== advertId
        ) {
          console.log(
            `Leaving previous notification room: ${currentAdvertIdRef.current}`
          );
          emitNotificationEvent("leaveRoom", {
            roomId: currentAdvertIdRef.current,
          });
        }

        console.log(`Joining notification room for advert: ${advertId}`);
        emitNotificationEvent("joinRoom", { roomId: advertId });
        hasJoinedRoomRef.current = true;
        currentAdvertIdRef.current = advertId;
      }
    } else if (hasJoinedRoomRef.current && currentAdvertIdRef.current) {
      // User logged out or lost connection - leave room
      console.log(
        `Leaving notification room due to auth/connection change: ${currentAdvertIdRef.current}`
      );
      emitNotificationEvent("leaveRoom", {
        roomId: currentAdvertIdRef.current,
      });
      hasJoinedRoomRef.current = false;
      currentAdvertIdRef.current = null;
    }

    // Cleanup function - leave room when component unmounts
    return () => {
      if (hasJoinedRoomRef.current && currentAdvertIdRef.current) {
        console.log(
          `Leaving notification room on unmount: ${currentAdvertIdRef.current}`
        );
        emitNotificationEvent("leaveRoom", {
          roomId: currentAdvertIdRef.current,
        });
        hasJoinedRoomRef.current = false;
        currentAdvertIdRef.current = null;
      }
    };
  }, [isAuthenticated, isNotificationConnected, advertId]);

  // Track THIS user's participant status to prevent false triggers
  const currentUserParticipantStatusRef = useRef(null);

  // ULTIMATE FIX: Only react when THIS user's participant status ACTUALLY changes
  useEffect(() => {
    // Basic requirements check
    if (
      !isAuthenticated ||
      !isChatConnected ||
      !advertId ||
      !user ||
      !user._id
    ) {
      if (hasJoinedRealRoomRef.current) {
        console.log(
          `🚀 ULTIMATE: LEAVE real room - Basic requirements not met`
        );
        emitChatEvent("leaveRealRoom", {
          roomId: advertId,
          userId: user._id,
        });
        hasJoinedRealRoomRef.current = false;
        currentUserParticipantStatusRef.current = null;
      }
      return;
    }

    // Cleanup when component unmounts
    return () => {
      if (hasJoinedRealRoomRef.current && isChatConnected && user && advertId) {
        console.log(
          `🚀 ULTIMATE: LEAVE real room - Component unmount/page leave`
        );
        emitChatEvent("leaveRealRoom", {
          roomId: advertId,
          userId: user._id,
        });
        hasJoinedRealRoomRef.current = false;
        currentUserParticipantStatusRef.current = null;
      }
    };
  }, [isAuthenticated, isChatConnected, advertId, user?._id]); // NO advert dependency!

  // BULLETPROOF: Create a stable reference that only changes when participant IDs change
  const participantUserIds = useMemo(() => {
    if (!advert?.participants) return [];
    return advert.participants
      .map((p) => p.user?._id)
      .filter(Boolean)
      .sort(); // Sort for stable comparison
  }, [advert?.participants]);

  // BULLETPROOF: Only run when participant user IDs actually change
  useEffect(() => {
    if (
      !isAuthenticated ||
      !isChatConnected ||
      !advertId ||
      !user ||
      !user._id
    ) {
      return;
    }

    const isCurrentlyParticipant = participantUserIds.includes(user._id);
    const previousStatus = currentUserParticipantStatusRef.current;

    console.log(
      `🚀 BULLETPROOF: Participant status check for user ${user._id}`,
      {
        advertId,
        isCurrentlyParticipant,
        previousStatus,
        hasJoinedRealRoom: hasJoinedRealRoomRef.current,
        participantUserIds,
        actualChange:
          previousStatus !== null && previousStatus !== isCurrentlyParticipant,
      }
    );

    // ONLY act if THIS user's status ACTUALLY changed
    if (previousStatus !== null && previousStatus !== isCurrentlyParticipant) {
      if (isCurrentlyParticipant && !hasJoinedRealRoomRef.current) {
        // User became participant → JOIN
        console.log(
          `🚀 BULLETPROOF: JOIN - User ${user._id} became participant`
        );
        emitChatEvent("joinRealRoom", {
          roomId: advertId,
          userId: user._id,
        });
        hasJoinedRealRoomRef.current = true;
      } else if (!isCurrentlyParticipant && hasJoinedRealRoomRef.current) {
        // User lost participation → LEAVE
        console.log(
          `🚀 BULLETPROOF: LEAVE - User ${user._id} lost participation`
        );
        emitChatEvent("leaveRealRoom", {
          roomId: advertId,
          userId: user._id,
        });
        hasJoinedRealRoomRef.current = false;
      }
    }
    // Initial join for existing participants
    else if (
      previousStatus === null &&
      isCurrentlyParticipant &&
      !hasJoinedRealRoomRef.current
    ) {
      console.log(
        `🚀 BULLETPROOF: INITIAL JOIN - User ${user._id} is participant`
      );
      emitChatEvent("joinRealRoom", {
        roomId: advertId,
        userId: user._id,
      });
      hasJoinedRealRoomRef.current = true;
    }

    // Update status AFTER checking
    currentUserParticipantStatusRef.current = isCurrentlyParticipant;
  }, [participantUserIds, user?._id]); // Only when participant IDs or current user changes

  // Listen for advertRequest WebSocket events (new join requests)
  useEffect(() => {
    if (isNotificationConnected && advertId) {
      console.log("Setting up advertRequest listener for advert:", advertId);

      const cleanup = listenForNotificationEvent("advertRequest", (data) => {
        console.log("Received advertRequest event:", data);

        if (data && data.user) {
          // Update the advert state to include the new waiting list user
          setAdvert((prevAdvert) => {
            if (!prevAdvert) return prevAdvert;

            // Check if user is already in waiting list to avoid duplicates
            const isAlreadyInWaitingList =
              prevAdvert.waitingList &&
              prevAdvert.waitingList.some(
                (w) => w.user && w.user._id === data.user._id
              );

            if (isAlreadyInWaitingList) {
              console.log(
                "User already in waiting list, ignoring duplicate request"
              );
              return prevAdvert;
            }

            // Add the new user to waiting list
            const updatedAdvert = {
              ...prevAdvert,
              waitingList: [
                ...(prevAdvert.waitingList || []),
                {
                  user: data.user,
                  joinedAt: new Date().toISOString(),
                },
              ],
            };

            console.log(
              "Updated advert with new waiting list user:",
              updatedAdvert
            );
            return updatedAdvert;
          });

          // Show notification about new join request (optional - only if current user is admin)
          // This could be enhanced later to only show for admins
        }
      });

      // Cleanup function
      return cleanup;
    }
  }, [isNotificationConnected, advertId, listenForNotificationEvent]);

  // Listen for requestAccept WebSocket events (accepted join requests)
  useEffect(() => {
    if (isNotificationConnected && advertId) {
      console.log("Setting up requestAccept listener for advert:", advertId);

      const cleanup = listenForNotificationEvent("requestAccept", (data) => {
        console.log("Received requestAccept event:", data);

        if (data && data.user) {
          // Update the advert state: move user from waiting list to participants
          setAdvert((prevAdvert) => {
            if (!prevAdvert) return prevAdvert;

            // Remove user from waiting list
            const updatedWaitingList = prevAdvert.waitingList
              ? prevAdvert.waitingList.filter(
                  (w) => w.user && w.user._id !== data.user._id
                )
              : [];

            // Check if user is already in participants to avoid duplicates
            const isAlreadyParticipant =
              prevAdvert.participants &&
              prevAdvert.participants.some(
                (p) => p.user && p.user._id === data.user._id
              );

            let updatedParticipants = prevAdvert.participants || [];
            if (!isAlreadyParticipant) {
              // Add user to participants with current timestamp
              updatedParticipants = [
                ...updatedParticipants,
                {
                  user: data.user,
                  joinedAt: new Date().toISOString(),
                },
              ];
            }

            const updatedAdvert = {
              ...prevAdvert,
              waitingList: updatedWaitingList,
              participants: updatedParticipants,
            };

            console.log("Updated advert with accepted request:", updatedAdvert);
            return updatedAdvert;
          });

          // Real room joining will be handled by main useEffect when advert state updates

          // Show success notification
          showNotification(
            `${data.user.name} adlı kullanıcının katılım talebi kabul edildi`,
            "success"
          );
        }
      });

      // Cleanup function
      return cleanup;
    }
  }, [isNotificationConnected, advertId, listenForNotificationEvent]);

  // Listen for requestRejected WebSocket events (rejected join requests)
  useEffect(() => {
    if (isNotificationConnected && advertId) {
      console.log("Setting up requestRejected listener for advert:", advertId);

      const cleanup = listenForNotificationEvent("requestRejected", (data) => {
        console.log("Received requestRejected event:", data);

        if (data && data.user) {
          // Update the advert state: remove user from waiting list
          setAdvert((prevAdvert) => {
            if (!prevAdvert) return prevAdvert;

            // Remove user from waiting list
            const updatedWaitingList = prevAdvert.waitingList
              ? prevAdvert.waitingList.filter(
                  (w) => w.user && w.user._id !== data.user._id
                )
              : [];

            const updatedAdvert = {
              ...prevAdvert,
              waitingList: updatedWaitingList,
            };

            console.log("Updated advert with rejected request:", updatedAdvert);
            return updatedAdvert;
          });

          // Show notification for rejected request
          showNotification(
            `${data.user.name} adlı kullanıcının katılım talebi reddedildi`,
            "info"
          );
        }
      });

      // Cleanup function
      return cleanup;
    }
  }, [isNotificationConnected, advertId, listenForNotificationEvent]);

  // Listen for adminAdded WebSocket events (user promoted to admin)
  useEffect(() => {
    if (isNotificationConnected && advertId) {
      console.log("Setting up adminAdded listener for advert:", advertId);

      const cleanup = listenForNotificationEvent("adminAdded", (data) => {
        console.log("Received adminAdded event:", data);

        if (data && data.user) {
          // Update the advert state: add user to adminAdvert array
          setAdvert((prevAdvert) => {
            if (!prevAdvert) return prevAdvert;

            // Add user to adminAdvert array if not already there
            const isAlreadyAdmin = prevAdvert.adminAdvert?.some(
              (adminId) => adminId === data.user._id
            );
            if (!isAlreadyAdmin) {
              return {
                ...prevAdvert,
                adminAdvert: [...(prevAdvert.adminAdvert || []), data.user._id],
              };
            }
            return prevAdvert;
          });

          // Show notification for admin promotion
          showNotification(`${data.user.name} admin olarak atandı`, "success");
        }
      });

      // Cleanup function
      return cleanup;
    }
  }, [isNotificationConnected, advertId, listenForNotificationEvent]);

  // Listen for adminRemoved WebSocket events (user demoted from admin)
  useEffect(() => {
    if (isNotificationConnected && advertId) {
      console.log("Setting up adminRemoved listener for advert:", advertId);

      const cleanup = listenForNotificationEvent("adminRemoved", (data) => {
        console.log("Received adminRemoved event:", data);

        if (data && data.user) {
          // Update the advert state: remove user from adminAdvert array
          setAdvert((prevAdvert) => {
            if (!prevAdvert) return prevAdvert;

            // Remove user from adminAdvert array
            const updatedAdminAdvert = prevAdvert.adminAdvert
              ? prevAdvert.adminAdvert.filter(
                  (adminId) => adminId !== data.user._id
                )
              : [];

            return {
              ...prevAdvert,
              adminAdvert: updatedAdminAdvert,
            };
          });

          // Show notification for admin demotion
          showNotification(`${data.user.name} adminlikten çıkarıldı`, "info");
        }
      });

      // Cleanup function
      return cleanup;
    }
  }, [isNotificationConnected, advertId, listenForNotificationEvent]);

  // Listen for participantExpelled WebSocket events (user expelled from advert)
  useEffect(() => {
    if (isNotificationConnected && advertId) {
      console.log(
        "Setting up participantExpelled listener for advert:",
        advertId
      );

      const cleanup = listenForNotificationEvent(
        "participantExpelled",
        (data) => {
          console.log("Received participantExpelled event:", data);

          if (data && data.user) {
            // Update the advert state: remove user from participants and adminAdvert arrays
            setAdvert((prevAdvert) => {
              if (!prevAdvert) return prevAdvert;

              // Remove user from participants array
              const updatedParticipants = prevAdvert.participants
                ? prevAdvert.participants.filter(
                    (p) => p.user._id !== data.user._id
                  )
                : [];

              // Remove user from adminAdvert array if they were an admin
              const updatedAdminAdvert = prevAdvert.adminAdvert
                ? prevAdvert.adminAdvert.filter(
                    (adminId) => adminId !== data.user._id
                  )
                : [];

              return {
                ...prevAdvert,
                participants: updatedParticipants,
                adminAdvert: updatedAdminAdvert,
              };
            });

            // Real room leaving will be handled by main useEffect when advert state updates

            // Show notification for user expulsion
            showNotification(`${data.user.name} ilandan atıldı`, "warning");
          }
        }
      );

      // Cleanup function
      return cleanup;
    }
  }, [isNotificationConnected, advertId, listenForNotificationEvent]);

  // Listen for leaveAdvert WebSocket events (user left advert)
  useEffect(() => {
    if (isNotificationConnected && advertId) {
      console.log("Setting up leaveAdvert listener for advert:", advertId);

      const cleanup = listenForNotificationEvent("leaveAdvert", (data) => {
        console.log("Received leaveAdvert event:", data);

        if (data && data.user) {
          // Update the advert state based on the scenario
          setAdvert((prevAdvert) => {
            if (!prevAdvert) return prevAdvert;

            // Remove the leaving user from participants array
            const updatedParticipants = prevAdvert.participants
              ? prevAdvert.participants.filter(
                  (p) => p.user._id !== data.user._id
                )
              : [];

            // Remove the leaving user from adminAdvert array if they were an admin
            const updatedAdminAdvert = prevAdvert.adminAdvert
              ? prevAdvert.adminAdvert.filter(
                  (adminId) => adminId !== data.user._id
                )
              : [];

            let updatedAdvert = {
              ...prevAdvert,
              participants: updatedParticipants,
              adminAdvert: updatedAdminAdvert,
            };

            // If there's a new creator (scenarios 1 & 2), update the createdBy field
            if (data.newCreatorParticipant) {
              updatedAdvert = {
                ...updatedAdvert,
                createdBy: data.newCreatorParticipant,
                // Add new creator to adminAdvert if not already there
                adminAdvert: updatedAdminAdvert.includes(
                  data.newCreatorParticipant._id
                )
                  ? updatedAdminAdvert
                  : [...updatedAdminAdvert, data.newCreatorParticipant._id],
              };

              // Show notification about new leader
              showNotification(
                `${data.user.name} ilandan ayrıldı, ${data.newCreatorParticipant.name} yeni lider oldu`,
                "info"
              );
            } else {
              // Regular participant left (scenario 4)
              showNotification(`${data.user.name} ilandan ayrıldı`, "info");
            }

            // Real room leaving will be handled by main useEffect when advert state updates

            console.log("Updated advert after leave:", updatedAdvert);
            return updatedAdvert;
          });
        }
      });

      // Cleanup function
      return cleanup;
    }
  }, [isNotificationConnected, advertId, listenForNotificationEvent]);

  // Listen for advertDeleted WebSocket events (advert was deleted)
  useEffect(() => {
    if (isNotificationConnected && advertId) {
      console.log("Setting up advertDeleted listener for advert:", advertId);

      const cleanup = listenForNotificationEvent("advertDeleted", (data) => {
        console.log("Received advertDeleted event:", data);

        if (data && data.advertId && data.advertId === advertId) {
          // Show notification that advert was deleted
          showNotification("İlan silindi", "warning");

          // Redirect to home page after a short delay
          setTimeout(() => {
            window.location.href = "/";
          }, 2000);
        }
      });

      // Cleanup function
      return cleanup;
    }
  }, [isNotificationConnected, advertId, listenForNotificationEvent]);

  // Listen for revokeRequest WebSocket events (user revoked their join request)
  useEffect(() => {
    if (isNotificationConnected && advertId) {
      console.log("Setting up revokeRequest listener for advert:", advertId);

      const cleanup = listenForNotificationEvent("revokeRequest", (data) => {
        console.log("Received revokeRequest event:", data);

        if (data && data.user) {
          // Update the advert state: remove user from waiting list
          setAdvert((prevAdvert) => {
            if (!prevAdvert) return prevAdvert;

            // Remove user from waiting list
            const updatedWaitingList = prevAdvert.waitingList
              ? prevAdvert.waitingList.filter(
                  (w) => w.user && w.user._id !== data.user._id
                )
              : [];

            const updatedAdvert = {
              ...prevAdvert,
              waitingList: updatedWaitingList,
            };

            console.log("Updated advert with revoked request:", updatedAdvert);
            return updatedAdvert;
          });

          // Show notification for revoked request
          showNotification(
            `${data.user.name} katılım talebini geri aldı`,
            "info"
          );
        }
      });

      // Cleanup function
      return cleanup;
    }
  }, [isNotificationConnected, advertId, listenForNotificationEvent]);

  // Listen for advertLinkParticipated WebSocket events (user joined via private link)
  useEffect(() => {
    if (isNotificationConnected && advertId) {
      console.log(
        "Setting up advertLinkParticipated listener for advert:",
        advertId
      );

      const cleanup = listenForNotificationEvent(
        "advertLinkParticipated",
        (data) => {
          console.log("Received advertLinkParticipated event:", data);

          if (data && data.user) {
            // Update the advert state: add user to participants array
            setAdvert((prevAdvert) => {
              if (!prevAdvert) return prevAdvert;

              // Check if user is already a participant to avoid duplicates
              const isAlreadyParticipant =
                prevAdvert.participants &&
                prevAdvert.participants.some(
                  (p) => p.user && p.user._id === data.user._id
                );

              if (isAlreadyParticipant) {
                console.log("User already a participant, ignoring duplicate");
                return prevAdvert;
              }

              // Add the new user to participants array
              const updatedParticipants = [
                ...(prevAdvert.participants || []),
                {
                  user: data.user,
                  joinedAt: new Date().toISOString(),
                },
              ];

              const updatedAdvert = {
                ...prevAdvert,
                participants: updatedParticipants,
              };

              console.log(
                "Updated advert with private link participant:",
                updatedAdvert
              );
              return updatedAdvert;
            });

            // Real room joining will be handled by main useEffect when advert state updates

            // Show notification for private link participation
            showNotification(
              `${data.user.name} özel bağlantı ile ilana katıldı`,
              "success"
            );
          }
        }
      );

      // Cleanup function
      return cleanup;
    }
  }, [isNotificationConnected, advertId, listenForNotificationEvent]);

  // Listen for advertStatusChanged WebSocket events (status toggle)
  useEffect(() => {
    if (isNotificationConnected && advertId) {
      console.log(
        "Setting up advertStatusChanged listener for advert:",
        advertId
      );

      const cleanup = listenForNotificationEvent(
        "advertStatusChanged",
        (data) => {
          console.log("Received advertStatusChanged event:", data);

          if (data && data.status) {
            // Update the advert state with new status
            setAdvert((prevAdvert) => {
              if (!prevAdvert) return prevAdvert;

              const updatedAdvert = {
                ...prevAdvert,
                status: data.status,
              };

              console.log("Updated advert with new status:", updatedAdvert);
              return updatedAdvert;
            });

            // Show notification about status change
            const statusLabels = {
              open: "Açık",
              full: "Dolu",
              cancelled: "İptal",
              expired: "Süresi Doldu",
              completed: "Tamamlandı",
            };
            const statusText = statusLabels[data.status] || "Bilinmiyor";
            showNotification(
              `İlan durumu "${statusText}" olarak güncellendi`,
              "info"
            );
          }
        }
      );

      // Cleanup function
      return cleanup;
    }
  }, [isNotificationConnected, advertId, listenForNotificationEvent]);

  // Listen for rivalryStatusUpdated WebSocket events (agreed status toggle)
  useEffect(() => {
    if (isNotificationConnected && advertId) {
      console.log(
        "Setting up rivalryStatusUpdated listener for advert:",
        advertId
      );

      const cleanup = listenForNotificationEvent(
        "rivalryStatusUpdated",
        (data) => {
          console.log("Received rivalryStatusUpdated event:", data);

          if (data && typeof data.agreed === "boolean") {
            // Update the advert state with new agreed status
            setAdvert((prevAdvert) => {
              if (!prevAdvert) return prevAdvert;

              const updatedAdvert = {
                ...prevAdvert,
                isRivalry: {
                  ...prevAdvert.isRivalry,
                  agreed: data.agreed,
                  updatedAt: new Date().toISOString(),
                },
              };

              console.log(
                "Updated advert with new rivalry agreed status:",
                updatedAdvert
              );
              return updatedAdvert;
            });

            // Show notification about rivalry status change
            const agreedText = data.agreed ? "anlaşmalı" : "anlaşmasız";
            showNotification(
              `Rekabet durumu "${agreedText}" olarak güncellendi`,
              "info"
            );
          }
        }
      );

      // Cleanup function
      return cleanup;
    }
  }, [isNotificationConnected, advertId, listenForNotificationEvent]);

  // Listen for messageSeen WebSocket events (user has seen all messages)
  useEffect(() => {
    if (isChatConnected && advertId) {
      console.log("Setting up messageSeen listener for advert:", advertId);

      const cleanup = listenForChatEvent("messageSeen", (data) => {
        console.log("Received messageSeen event:", data);

        if (data && data.userId) {
          // Update all messages to remove the user from notSeenBy array
          setMessages((prevMessages) => {
            return prevMessages.map((message) => ({
              ...message,
              notSeenBy: message.notSeenBy
                ? message.notSeenBy.filter((userId) => userId !== data.userId)
                : [],
            }));
          });

          console.log(
            `User ${data.userId} has seen all messages in advert ${advertId}`
          );
        }
      });

      // Cleanup function
      return cleanup;
    }
  }, [isChatConnected, advertId, listenForChatEvent]);

  // Listen for newMessage WebSocket events (new message received)
  useEffect(() => {
    if (isChatConnected && advertId) {
      console.log("Setting up newMessage listener for advert:", advertId);

      const cleanup = listenForChatEvent("newMessage", (data) => {
        console.log("Received newMessage event:", data);

        if (data && data.message) {
          // Process message to convert base64 attachments to displayable URLs
          const processedMessage = processMessageAttachments(data.message);

          // Add the processed message to the messages array
          setMessages((prevMessages) => [...prevMessages, processedMessage]);
          console.log("New message added to chat:", processedMessage);
        }
      });

      // Cleanup function
      return cleanup;
    }
  }, [isChatConnected, advertId, listenForChatEvent]);

  // Listen for typingInRoom WebSocket events (user started typing)
  useEffect(() => {
    if (isChatConnected && advertId) {
      console.log("Setting up typingInRoom listener for advert:", advertId);

      const cleanup = listenForChatEvent("typingInRoom", (data) => {
        console.log("Received typingInRoom event:", data);

        if (data && data.userId) {
          // Add user to typing list if not already there and not the current user
          setTypingUsers((prevTypingUsers) => {
            // Don't show typing indicator for current user
            if (user && user._id === data.userId) {
              return prevTypingUsers;
            }

            // Check if user is already in typing list
            const isAlreadyTyping = prevTypingUsers.includes(data.userId);
            if (!isAlreadyTyping) {
              const updatedTypingUsers = [...prevTypingUsers, data.userId];
              console.log(
                "User started typing:",
                data.userId,
                "Current typing users:",
                updatedTypingUsers
              );
              return updatedTypingUsers;
            }
            return prevTypingUsers;
          });
        }
      });

      // Cleanup function
      return cleanup;
    }
  }, [isChatConnected, advertId, listenForChatEvent, user]);

  // Listen for stopTypingInRoom WebSocket events (user stopped typing)
  useEffect(() => {
    if (isChatConnected && advertId) {
      console.log("Setting up stopTypingInRoom listener for advert:", advertId);

      const cleanup = listenForChatEvent("stopTypingInRoom", (data) => {
        console.log("Received stopTypingInRoom event:", data);

        if (data && data.userId) {
          // Remove user from typing list
          setTypingUsers((prevTypingUsers) => {
            const updatedTypingUsers = prevTypingUsers.filter(
              (userId) => userId !== data.userId
            );
            console.log(
              "User stopped typing:",
              data.userId,
              "Current typing users:",
              updatedTypingUsers
            );
            return updatedTypingUsers;
          });
        }
      });

      // Cleanup function
      return cleanup;
    }
  }, [isChatConnected, advertId, listenForChatEvent]);

  // Handle typing events
  const handleStartTyping = () => {
    console.log("AdvertDetailPage: handleStartTyping called", {
      isChatConnected,
      advertId,
      userId: user?._id,
      hasEmitChatEvent: !!emitChatEvent,
    });

    if (isChatConnected && advertId && user && user._id) {
      console.log(
        `AdvertDetailPage: Emitting typingRoom event for user ${user._id} in advert ${advertId}`
      );
      emitChatEvent("typingRoom", {
        roomId: advertId,
        userId: user._id,
      });
    } else {
      console.log(
        "AdvertDetailPage: Cannot emit typingRoom - missing requirements",
        {
          isChatConnected,
          advertId,
          userId: user?._id,
        }
      );
    }
  };

  const handleStopTyping = () => {
    console.log("AdvertDetailPage: handleStopTyping called", {
      isChatConnected,
      advertId,
      userId: user?._id,
      hasEmitChatEvent: !!emitChatEvent,
    });

    if (isChatConnected && advertId && user && user._id) {
      console.log(
        `AdvertDetailPage: Emitting stopTypingRoom event for user ${user._id} in advert ${advertId}`
      );
      emitChatEvent("stopTypingRoom", {
        roomId: advertId,
        userId: user._id,
      });
    } else {
      console.log(
        "AdvertDetailPage: Cannot emit stopTypingRoom - missing requirements",
        {
          isChatConnected,
          advertId,
          userId: user?._id,
        }
      );
    }
  };

  const handleSendMessage = async (messageData) => {
    // Check authentication first
    if (!isAuthenticated) {
      showAuthRequiredPopup(
        "message",
        "Mesaj göndermek için giriş yapmalısınız"
      );
      return;
    }

    try {
      // Prepare the request payload based on message type
      let requestBody = {};

      // Check if user provided file attachments
      if (
        messageData.attachments &&
        messageData.attachments.items &&
        messageData.attachments.items.length > 0
      ) {
        // User provided files - need to format for backend
        console.log("Processing file attachments:", messageData.attachments);

        const attachmentsPayload = {
          caption: messageData.attachments.caption || null,
          items: messageData.attachments.items.map((file) => {
            console.log("Processing file:", file);
            return {
              content: file.content || file.data || file.base64, // Handle different possible property names
            };
          }),
        };

        requestBody.attachments = attachmentsPayload;
        console.log("Final attachments payload:", requestBody.attachments);
      } else {
        // User provided only text content
        if (!messageData.content || messageData.content.trim() === "") {
          // Silently do nothing for empty messages (as requested)
          console.log("Empty message, not sending to backend");
          return;
        }
        requestBody.content = messageData.content;
        console.log("Text-only message payload:", requestBody);
      }

      console.log("Sending message with payload:", requestBody);

      const response = await fetch(`/api/v1/advert-chat/send/${advertId}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        let errorMessage = "Failed to send message";

        try {
          const errorData = await response.json();
          errorMessage = errorData.msg || errorData.message || errorMessage;
        } catch {
          // If we can't parse the error response, use status-based messages
          switch (response.status) {
            case 400:
              errorMessage = "Bad Request";
              break;
            case 401:
              errorMessage = "Unauthorized";
              break;
            case 403:
              errorMessage = "Forbidden";
              break;
            case 404:
              errorMessage = "Advert not found";
              break;
            case 413:
              errorMessage = "File size exceeds 100MB limit";
              break;
            case 429:
              errorMessage = "Too Many Requests";
              break;
            case 500:
              errorMessage = "Internal Server Error";
              break;
            case 503:
              errorMessage = "Service Unavailable";
              break;
            default:
              errorMessage = `Server error: ${response.status}`;
          }
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Message sent successfully:", data);

      // Note: The message will be added to the UI via WebSocket listener (newMessage event)
      // No need to manually add it here since backend will emit it to all connected users
    } catch (err) {
      console.error("Error sending message:", err);

      // Enhanced error handling with Turkish messages
      let errorMessage = "Mesaj gönderilirken hata oluştu";

      if (err.message.includes("Network Error") || !navigator.onLine) {
        errorMessage = "Bağlantı hatası. İnternet bağlantınızı kontrol edin";
      } else if (err.message) {
        errorMessage = translateErrorMessage(err.message);
      }

      showNotification(errorMessage, "error");
      throw err; // Re-throw to let MessagingSection handle the error
    }
  };

  const handleAdvertUpdate = (updatedAdvert) => {
    setAdvert(updatedAdvert);

    // Force a complete data refresh to ensure everything is up to date
    setTimeout(() => {
      if (advertId) {
        // Clear state and trigger fresh fetch
        setLoading(true);
        // The fetchData useEffect will trigger automatically
      }
    }, 100);
  };

  // Handle join request functionality
  const handleJoinRequest = async () => {
    // Check authentication first
    if (!isAuthenticated) {
      showAuthRequiredPopup("join", "İlana katılmak için giriş yapmalısınız");
      return;
    }

    try {
      const response = await fetch(`/api/v1/advert/request/${advertId}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        let errorMessage = "Request failed";

        try {
          const errorData = await response.json();
          errorMessage = errorData.msg || errorData.message || errorMessage;
        } catch {
          // If we can't parse the error response, use status-based messages
          switch (response.status) {
            case 400:
              errorMessage = "Bad Request";
              break;
            case 401:
              errorMessage = "Unauthorized";
              break;
            case 403:
              errorMessage = "Forbidden";
              break;
            case 404:
              errorMessage = "Advert not found";
              break;
            case 429:
              errorMessage = "Too Many Requests";
              break;
            case 500:
              errorMessage = "Internal Server Error";
              break;
            case 503:
              errorMessage = "Service Unavailable";
              break;
            default:
              errorMessage = `Server error: ${response.status}`;
          }
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Show success notification
      showNotification("Katılım talebiniz başarıyla gönderildi", "success");

      console.log("Join request successful:", data.message);
    } catch (err) {
      console.error("Error sending join request:", err);

      // Handle network errors specifically
      let errorMessage = err.message || "Failed to send join request";
      if (err.name === "TypeError" && err.message.includes("fetch")) {
        errorMessage = "Network Error";
      }

      showNotification(errorMessage, "error");
    }
  };

  // Handle accepting join request functionality
  const handleAcceptRequest = async (requestId) => {
    // Check authentication first
    if (!isAuthenticated) {
      showAuthRequiredPopup(
        "admin",
        "Bu işlemi yapabilmek için giriş yapmalısınız"
      );
      return;
    }

    try {
      const response = await fetch(
        `/api/v1/advert/request/accept/${advertId}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ requestId }),
        }
      );

      if (!response.ok) {
        let errorMessage = "Failed to accept request";

        try {
          const errorData = await response.json();
          errorMessage = errorData.msg || errorData.message || errorMessage;
        } catch {
          // If we can't parse the error response, use status-based messages
          switch (response.status) {
            case 400:
              errorMessage = "Bad Request";
              break;
            case 401:
              errorMessage = "Unauthorized";
              break;
            case 403:
              errorMessage = "Forbidden";
              break;
            case 404:
              errorMessage = "Advert not found";
              break;
            case 429:
              errorMessage = "Too Many Requests";
              break;
            case 500:
              errorMessage = "Internal Server Error";
              break;
            case 503:
              errorMessage = "Service Unavailable";
              break;
            default:
              errorMessage = `Server error: ${response.status}`;
          }
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Make accepted user join chat room
      if (isChatConnected && data.user && data.user._id) {
        console.log(
          `Accepted user ${data.user._id} joining chat room ${advertId}`
        );
        emitChatEvent("joinRoom", {
          roomId: advertId,
          userId: data.user._id,
        });
      }

      // Show success notification
      showNotification("Katılım talebi başarıyla kabul edildi", "success");

      console.log("Accept request successful:", data.user);

      // Note: WebSocket will handle the real-time UI update
    } catch (err) {
      console.error("Error accepting request:", err);

      // Handle network errors specifically
      let errorMessage = err.message || "Failed to accept request";
      if (err.name === "TypeError" && err.message.includes("fetch")) {
        errorMessage = "Network Error";
      }

      showNotification(errorMessage, "error");
      throw err; // Re-throw to let AdvertInfo handle any additional UI cleanup
    }
  };

  // Handle rejecting join request functionality
  const handleRejectRequest = async (requestId) => {
    // Check authentication first
    if (!isAuthenticated) {
      showAuthRequiredPopup(
        "admin",
        "Bu işlemi yapabilmek için giriş yapmalısınız"
      );
      return;
    }

    try {
      const response = await fetch(
        `/api/v1/advert/request/reject/${advertId}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ requestId }),
        }
      );

      if (!response.ok) {
        let errorMessage = "Failed to reject request";

        try {
          const errorData = await response.json();
          errorMessage = errorData.msg || errorData.message || errorMessage;
        } catch {
          // If we can't parse the error response, use status-based messages
          switch (response.status) {
            case 400:
              errorMessage = "Bad Request";
              break;
            case 401:
              errorMessage = "Unauthorized";
              break;
            case 403:
              errorMessage = "Forbidden";
              break;
            case 404:
              errorMessage = "Advert not found";
              break;
            case 429:
              errorMessage = "Too Many Requests";
              break;
            case 500:
              errorMessage = "Internal Server Error";
              break;
            case 503:
              errorMessage = "Service Unavailable";
              break;
            default:
              errorMessage = `Server error: ${response.status}`;
          }
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Show success notification
      showNotification("Katılım talebi başarıyla reddedildi", "success");

      console.log("Reject request successful:", data.user);

      // Note: WebSocket will handle the real-time UI update
    } catch (err) {
      console.error("Error rejecting request:", err);

      // Handle network errors specifically
      let errorMessage = err.message || "Failed to reject request";
      if (err.name === "TypeError" && err.message.includes("fetch")) {
        errorMessage = "Network Error";
      }

      showNotification(errorMessage, "error");
      throw err; // Re-throw to let AdvertInfo handle any additional UI cleanup
    }
  };

  // Handle promoting user to admin
  const handlePromoteToAdmin = async (userId) => {
    // Check authentication first
    if (!isAuthenticated) {
      showAuthRequiredPopup(
        "admin",
        "Bu işlemi yapabilmek için giriş yapmalısınız"
      );
      return;
    }

    try {
      const response = await fetch(`/api/v1/advert/admin/add/${advertId}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ adminId: userId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Admin atama işlemi başarısız oldu");
      }

      const data = await response.json();
      console.log("User promoted to admin successfully:", data.user);

      // Update local advert state - add user to adminAdvert array
      setAdvert((prevAdvert) => {
        if (!prevAdvert) return prevAdvert;

        // Add user to adminAdvert array if not already there
        const isAlreadyAdmin = prevAdvert.adminAdvert?.some(
          (adminId) => adminId === userId
        );
        if (!isAlreadyAdmin) {
          return {
            ...prevAdvert,
            adminAdvert: [...(prevAdvert.adminAdvert || []), userId],
          };
        }
        return prevAdvert;
      });

      showNotification(`${data.user.name} admin olarak atandı`, "success");
    } catch (err) {
      console.error("Error promoting user to admin:", err);

      // Enhanced error handling with Turkish messages
      let errorMessage = "Admin atama işlemi başarısız oldu";

      if (err.message.includes("Network Error") || !navigator.onLine) {
        errorMessage = "Bağlantı hatası. İnternet bağlantınızı kontrol edin";
      } else if (err.message) {
        errorMessage = translateErrorMessage(err.message);
      }

      showNotification(errorMessage, "error");
      throw err; // Re-throw to let component handle any additional UI cleanup
    }
  };

  // Handle demoting user from admin
  const handleDemoteFromAdmin = async (userId) => {
    // Check authentication first
    if (!isAuthenticated) {
      showAuthRequiredPopup(
        "admin",
        "Bu işlemi yapabilmek için giriş yapmalısınız"
      );
      return;
    }

    try {
      const response = await fetch(`/api/v1/advert/admin/remove/${advertId}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ adminId: userId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Admin çıkarma işlemi başarısız oldu");
      }

      const data = await response.json();
      console.log("User demoted from admin successfully:", data.user);

      // Update local advert state - remove user from adminAdvert array
      setAdvert((prevAdvert) => {
        if (!prevAdvert) return prevAdvert;

        // Remove user from adminAdvert array
        const updatedAdminAdvert = prevAdvert.adminAdvert
          ? prevAdvert.adminAdvert.filter((adminId) => adminId !== userId)
          : [];

        return {
          ...prevAdvert,
          adminAdvert: updatedAdminAdvert,
        };
      });

      showNotification(`${data.user.name} adminlikten çıkarıldı`, "success");
    } catch (err) {
      console.error("Error demoting user from admin:", err);

      // Enhanced error handling with Turkish messages
      let errorMessage = "Admin çıkarma işlemi başarısız oldu";

      if (err.message.includes("Network Error") || !navigator.onLine) {
        errorMessage = "Bağlantı hatası. İnternet bağlantınızı kontrol edin";
      } else if (err.message) {
        errorMessage = translateErrorMessage(err.message);
      }

      showNotification(errorMessage, "error");
      throw err; // Re-throw to let component handle any additional UI cleanup
    }
  };

  // Handle expelling user from advert
  const handleExpelUser = async (userId) => {
    // Check authentication first
    if (!isAuthenticated) {
      showAuthRequiredPopup(
        "admin",
        "Bu işlemi yapabilmek için giriş yapmalısınız"
      );
      return;
    }

    try {
      const response = await fetch(`/api/v1/advert/expel/${advertId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ participantId: userId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.msg || "Kullanıcı atma işlemi başarısız oldu"
        );
      }

      const data = await response.json();
      console.log("User expelled from advert successfully:", data.user);

      // Make expelled user leave chat room
      if (isChatConnected && userId) {
        console.log(`Expelled user ${userId} leaving chat room ${advertId}`);
        emitChatEvent("leaveRoom", {
          roomId: advertId,
          userId: userId, // Use the userId parameter (expelled user's ID)
        });
      }

      // Update local advert state - remove user from participants and adminAdvert arrays
      setAdvert((prevAdvert) => {
        if (!prevAdvert) return prevAdvert;

        // Remove user from participants array
        const updatedParticipants = prevAdvert.participants
          ? prevAdvert.participants.filter((p) => p.user._id !== userId)
          : [];

        // Remove user from adminAdvert array if they were an admin
        const updatedAdminAdvert = prevAdvert.adminAdvert
          ? prevAdvert.adminAdvert.filter((adminId) => adminId !== userId)
          : [];

        return {
          ...prevAdvert,
          participants: updatedParticipants,
          adminAdvert: updatedAdminAdvert,
        };
      });

      showNotification(`${data.user.name} ilandan atıldı`, "success");
    } catch (err) {
      console.error("Error expelling user:", err);

      // Enhanced error handling with Turkish messages
      let errorMessage = "Kullanıcı atma işlemi başarısız oldu";

      if (err.message.includes("Network Error") || !navigator.onLine) {
        errorMessage = "Bağlantı hatası. İnternet bağlantınızı kontrol edin";
      } else if (err.message) {
        errorMessage = translateErrorMessage(err.message);
      }

      showNotification(errorMessage, "error");
      throw err; // Re-throw to let component handle any additional UI cleanup
    }
  };

  // Handle leaving advert (user voluntarily leaves)
  const handleLeaveRequest = async () => {
    // Check authentication first
    if (!isAuthenticated) {
      showAuthRequiredPopup(
        "leave",
        "İlandan ayrılmak için giriş yapmalısınız"
      );
      return;
    }

    try {
      const response = await fetch(`/api/v1/advert/leave/${advertId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        let errorMessage = "Failed to leave advert";

        try {
          const errorData = await response.json();
          errorMessage = errorData.msg || errorData.message || errorMessage;
        } catch {
          // If we can't parse the error response, use status-based messages
          switch (response.status) {
            case 400:
              errorMessage = "Bad Request";
              break;
            case 401:
              errorMessage = "Unauthorized";
              break;
            case 403:
              errorMessage = "Forbidden";
              break;
            case 404:
              errorMessage = "Advert not found";
              break;
            case 429:
              errorMessage = "Too Many Requests";
              break;
            case 500:
              errorMessage = "Internal Server Error";
              break;
            case 503:
              errorMessage = "Service Unavailable";
              break;
            default:
              errorMessage = `Server error: ${response.status}`;
          }
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Leave advert successful:", data.message);

      // Leave chat room when user successfully leaves the advert
      if (isChatConnected && user && user._id) {
        console.log(`User ${user._id} leaving chat room ${advertId}`);
        emitChatEvent("leaveRoom", {
          roomId: advertId,
          userId: user._id,
        });
      }

      // Show success notification based on the response message
      let successMessage = "İlandan başarıyla ayrıldınız";
      if (data.message.includes("new creator has been assigned")) {
        successMessage = "İlandan ayrıldınız ve yeni bir lider atandı";
      } else if (data.message.includes("has been deleted")) {
        successMessage = "İlandan ayrıldınız ve ilan silindi";
      }

      showNotification(successMessage, "success");

      // Note: WebSocket will handle the real-time UI update
      // For scenario 3 (advert deleted), we might want to redirect
      if (data.message.includes("has been deleted")) {
        // Redirect to home page after a short delay
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      }
    } catch (err) {
      console.error("Error leaving advert:", err);

      // Enhanced error handling with Turkish messages
      let errorMessage = "İlandan ayrılma işlemi başarısız oldu";

      if (err.message.includes("Network Error") || !navigator.onLine) {
        errorMessage = "Bağlantı hatası. İnternet bağlantınızı kontrol edin";
      } else if (err.message) {
        errorMessage = translateErrorMessage(err.message);
      }

      showNotification(errorMessage, "error");
      throw err; // Re-throw to let component handle any additional UI cleanup
    }
  };

  // Handle deleting advert (owner deletes the advert)
  const handleDeleteRequest = async () => {
    // Check authentication first
    if (!isAuthenticated) {
      showAuthRequiredPopup("admin", "İlanı silmek için giriş yapmalısınız");
      return;
    }

    try {
      const response = await fetch(`/api/v1/advert/delete/${advertId}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        let errorMessage = "Failed to delete advert";

        try {
          const errorData = await response.json();
          errorMessage = errorData.msg || errorData.message || errorMessage;
        } catch {
          // If we can't parse the error response, use status-based messages
          switch (response.status) {
            case 400:
              errorMessage = "Bad Request";
              break;
            case 401:
              errorMessage = "Unauthorized";
              break;
            case 403:
              errorMessage = "Forbidden";
              break;
            case 404:
              errorMessage = "Advert not found";
              break;
            case 429:
              errorMessage = "Too Many Requests";
              break;
            case 500:
              errorMessage = "Internal Server Error";
              break;
            case 503:
              errorMessage = "Service Unavailable";
              break;
            default:
              errorMessage = `Server error: ${response.status}`;
          }
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Delete advert successful:", data.message);

      // Make all participants leave chat room when advert is deleted
      if (isChatConnected && advert && advert.participants) {
        console.log(
          `Making all participants leave chat room ${advertId} due to advert deletion`
        );

        // Make each participant leave the chat room (this includes the creator)
        advert.participants.forEach((participant) => {
          if (participant.user && participant.user._id) {
            console.log(
              `Participant ${participant.user._id} leaving chat room ${advertId}`
            );
            emitChatEvent("leaveRoom", {
              roomId: advertId,
              userId: participant.user._id,
            });
          }
        });

        // Note: Creator is already handled in the participants loop above
        // No need to handle createdBy separately since they're also a participant
      }

      // Show success notification
      showNotification("İlan başarıyla silindi", "success");

      // Note: WebSocket will handle the real-time UI update and redirect
      // Redirect to home page after a short delay
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (err) {
      console.error("Error deleting advert:", err);

      // Enhanced error handling with Turkish messages
      let errorMessage = "İlan silme işlemi başarısız oldu";

      if (err.message.includes("Network Error") || !navigator.onLine) {
        errorMessage = "Bağlantı hatası. İnternet bağlantınızı kontrol edin";
      } else if (err.message) {
        errorMessage = translateErrorMessage(err.message);
      }

      showNotification(errorMessage, "error");
      throw err; // Re-throw to let component handle any additional UI cleanup
    }
  };

  // Handle revoking join request (user cancels their join request)
  const handleRevokeRequest = async () => {
    // Check authentication first
    if (!isAuthenticated) {
      showAuthRequiredPopup(
        "revoke",
        "İsteği geri almak için giriş yapmalısınız"
      );
      return;
    }

    try {
      const response = await fetch(`/api/v1/advert/request/${advertId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        let errorMessage = "Failed to revoke request";

        try {
          const errorData = await response.json();
          errorMessage = errorData.msg || errorData.message || errorMessage;
        } catch {
          // If we can't parse the error response, use status-based messages
          switch (response.status) {
            case 400:
              errorMessage = "Bad Request";
              break;
            case 401:
              errorMessage = "Unauthorized";
              break;
            case 403:
              errorMessage = "Forbidden";
              break;
            case 404:
              errorMessage = "Advert not found";
              break;
            case 429:
              errorMessage = "Too Many Requests";
              break;
            case 500:
              errorMessage = "Internal Server Error";
              break;
            case 503:
              errorMessage = "Service Unavailable";
              break;
            default:
              errorMessage = `Server error: ${response.status}`;
          }
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Revoke request successful:", data.user);

      // Show success notification
      showNotification("Katılım isteğiniz başarıyla geri alındı", "success");

      // Note: WebSocket will handle the real-time UI update
    } catch (err) {
      console.error("Error revoking join request:", err);

      // Enhanced error handling with Turkish messages
      let errorMessage = "Katılım isteği geri alma işlemi başarısız oldu";

      if (err.message.includes("Network Error") || !navigator.onLine) {
        errorMessage = "Bağlantı hatası. İnternet bağlantınızı kontrol edin";
      } else if (err.message) {
        errorMessage = translateErrorMessage(err.message);
      }

      showNotification(errorMessage, "error");
      throw err; // Re-throw to let component handle any additional UI cleanup
    }
  };

  // Function to refresh messages from backend API
  const refreshMessages = async () => {
    if (!isAuthenticated || !user) {
      console.log("Cannot refresh messages: User not authenticated");
      return;
    }

    try {
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

      if (messagesResponse.ok) {
        const messagesData = await messagesResponse.json();
        console.log("Messages refreshed successfully:", messagesData);

        // Process messages to convert base64 attachments to displayable URLs
        const processedMessages = (messagesData.messages || []).map(
          processMessageAttachments
        );
        setMessages(processedMessages);
      } else {
        console.warn("Failed to refresh messages:", messagesResponse.status);
        if (messagesResponse.status === 400) {
          console.log("User is not a participant, cannot refresh messages");
          setMessages([]);
        }
      }
    } catch (err) {
      console.error("Error refreshing messages:", err);
    }
  };

  // Handle creating private link
  const handleCreatePrivateLink = async () => {
    // Check authentication first
    if (!isAuthenticated) {
      showAuthRequiredPopup(
        "admin",
        "Özel bağlantı oluşturmak için giriş yapmalısınız"
      );
      return;
    }

    try {
      console.log("Creating private link for advert:", advertId);

      const response = await fetch(`/api/v1/advert/private-link/${advertId}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        let errorMessage = "Failed to create private link";

        try {
          const errorData = await response.json();
          errorMessage = errorData.msg || errorData.message || errorMessage;
        } catch {
          // If we can't parse the error response, use status-based messages
          switch (response.status) {
            case 400:
              errorMessage = "Bad Request";
              break;
            case 401:
              errorMessage = "Unauthorized";
              break;
            case 403:
              errorMessage =
                "You are not allowed to generate private link for this advert";
              break;
            case 404:
              errorMessage = "Advert not found";
              break;
            case 429:
              errorMessage = "Too Many Requests";
              break;
            case 500:
              errorMessage = "Internal Server Error";
              break;
            case 503:
              errorMessage = "Service Unavailable";
              break;
            default:
              errorMessage = `Server error: ${response.status}`;
          }
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Private link generated successfully:", data);

      // Create the private link URL
      const privateLink = `${
        window.location.origin
      }/private-invite?date=${encodeURIComponent(
        data.date
      )}&id=${encodeURIComponent(data.id)}`;

      // Show the popup with the private link
      setPrivateLinkPopup({
        isVisible: true,
        link: privateLink,
      });
    } catch (err) {
      console.error("Error creating private link:", err);

      // Enhanced error handling with Turkish messages
      let errorMessage = "Özel bağlantı oluşturulamadı";

      if (err.message.includes("Network Error") || !navigator.onLine) {
        errorMessage = "Bağlantı hatası. İnternet bağlantınızı kontrol edin";
      } else if (err.message) {
        errorMessage = translateErrorMessage(err.message);
      }

      showNotification(errorMessage, "error");
    }
  };

  // Handle sending invitations to friends
  const handleSendInvitation = async (selectedFriendIds) => {
    // Check authentication first
    if (!isAuthenticated) {
      showAuthRequiredPopup(
        "admin",
        "Arkadaş davet etmek için giriş yapmalısınız"
      );
      return;
    }

    try {
      console.log("Sending invitations to friends:", selectedFriendIds);
      console.log("For advert:", advertId);

      // TODO: Implement API call to send invitations
      showNotification(
        `${selectedFriendIds.length} arkadaşınıza davet gönderilecek (UI tamamlandı - backend bağlantısı beklemede)`,
        "info"
      );
    } catch (err) {
      console.error("Error sending invitations:", err);
      showNotification("Davet gönderilirken hata oluştu", "error");
    }
  };

  // Handle status toggle
  const handleStatusToggle = (newStatus) => {
    console.log("Status toggle callback received:", newStatus);
    // Update local advert state
    setAdvert((prevAdvert) => {
      if (!prevAdvert) return prevAdvert;
      return {
        ...prevAdvert,
        status: newStatus,
      };
    });
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

  if (error || !advert) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-red-600 mb-4">
              {error === "Advert not found" ? "İlan Bulunamadı" : "Hata Oluştu"}
            </h1>
            <p className="text-lg text-gray-600">
              {error === "Advert not found"
                ? "Aradığınız ilan mevcut değil veya kaldırılmış olabilir."
                : `Bir hata oluştu: ${error}`}
            </p>
          </div>
        </div>
        <Footer />
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
                  isUserOnline={isUserOnline}
                  onJoinRequest={handleJoinRequest}
                  onLeaveRequest={handleLeaveRequest}
                  onDeleteRequest={handleDeleteRequest}
                  onRevokeRequest={handleRevokeRequest}
                  onAcceptRequest={handleAcceptRequest}
                  onRejectRequest={handleRejectRequest}
                  onPromoteToAdmin={handlePromoteToAdmin}
                  onDemoteFromAdmin={handleDemoteFromAdmin}
                  onExpelUser={handleExpelUser}
                  onStatusToggle={handleStatusToggle}
                  showNotification={showNotification}
                />
              </div>

              {/* Messaging below for mobile */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden h-96">
                <MessagingSection
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  advertId={advertId}
                  onRefreshMessages={refreshMessages}
                  advert={advert}
                  isUserOnline={isUserOnline}
                  onCreatePrivateLink={handleCreatePrivateLink}
                  onSendInvitation={handleSendInvitation}
                  typingUsers={typingUsers}
                  onStartTyping={handleStartTyping}
                  onStopTyping={handleStopTyping}
                />
              </div>
            </div>
          </div>

          {/* Desktop layout */}
          <div className="hidden lg:grid lg:grid-cols-10 gap-6 h-[calc(100vh-8rem)]">
            {/* Left side - Advert Info (30%) */}
            <div className="lg:col-span-4 bg-white rounded-lg shadow-md overflow-hidden">
              <AdvertInfo
                advert={advert}
                onAdvertUpdate={handleAdvertUpdate}
                isUserOnline={isUserOnline}
                onJoinRequest={handleJoinRequest}
                onLeaveRequest={handleLeaveRequest}
                onDeleteRequest={handleDeleteRequest}
                onRevokeRequest={handleRevokeRequest}
                onAcceptRequest={handleAcceptRequest}
                onRejectRequest={handleRejectRequest}
                onPromoteToAdmin={handlePromoteToAdmin}
                onDemoteFromAdmin={handleDemoteFromAdmin}
                onExpelUser={handleExpelUser}
                onStatusToggle={handleStatusToggle}
                showNotification={showNotification}
              />
            </div>

            {/* Right side - Messaging (70%) */}
            <div className="lg:col-span-6 bg-white rounded-lg shadow-md overflow-hidden">
              <MessagingSection
                messages={messages}
                onSendMessage={handleSendMessage}
                advertId={advertId}
                onRefreshMessages={refreshMessages}
                advert={advert}
                isUserOnline={isUserOnline}
                onCreatePrivateLink={handleCreatePrivateLink}
                onSendInvitation={handleSendInvitation}
                typingUsers={typingUsers}
                onStartTyping={handleStartTyping}
                onStopTyping={handleStopTyping}
              />
            </div>
          </div>
        </div>
      </div>
      <Footer />

      {/* Notification component for error messages */}
      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={handleCloseNotification}
        duration={4000}
      />

      {/* Private Link Popup */}
      <PrivateLinkPopup
        isVisible={privateLinkPopup.isVisible}
        onClose={handleClosePrivateLinkPopup}
        link={privateLinkPopup.link}
      />

      {/* Auth Required Popup */}
      <AuthRequiredPopup
        isVisible={authRequiredPopup.isVisible}
        onClose={handleCloseAuthRequiredPopup}
        actionType={authRequiredPopup.actionType}
        customMessage={authRequiredPopup.customMessage}
      />
    </>
  );
}

export default AdvertDetailPage;
