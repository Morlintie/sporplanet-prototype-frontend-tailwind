import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useWebSocket } from "../../context/WebSocketContext";
import Notification from "../shared/Notification";

function AdvertInfo({ advert, onAdvertUpdate }) {
  const [showAllParticipants, setShowAllParticipants] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [showLeaveDropdown, setShowLeaveDropdown] = useState(false);
  const [rivalryAgreed, setRivalryAgreed] = useState(false);

  // Initialize rivalry agreed status from advert data
  useEffect(() => {
    if (
      advert &&
      advert.isRivalry &&
      typeof advert.isRivalry.agreed !== "undefined"
    ) {
      setRivalryAgreed(advert.isRivalry.agreed);
    }
  }, [advert]);
  const dropdownRef = useRef(null);
  const { user: currentUser } = useAuth();
  const { isUserOnline } = useWebSocket();
  const navigate = useNavigate();

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

  // Handle click outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowLeaveDropdown(false);
      }
    };

    if (showLeaveDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showLeaveDropdown]);

  // Generate initials from user name
  const getInitials = (name) => {
    if (!name) return "U";

    const nameParts = name.split(/[\s.]+/).filter((part) => part.length > 0);
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }
    return (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase();
  };

  // Get profile picture URL (supports both string and object formats)
  const getProfilePictureUrl = (profilePicture) => {
    if (!profilePicture) return null;
    if (typeof profilePicture === "string") return profilePicture;
    if (typeof profilePicture === "object" && profilePicture.url)
      return profilePicture.url;
    return null;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const endDate = new Date(date.getTime() + 60 * 60 * 1000); // 1 saat sonrası

    const dateStr = date.toLocaleDateString("tr-TR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const startTime = date.toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const endTime = endDate.toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return `${dateStr} ${startTime}-${endTime}`;
  };

  // Translate error messages to Turkish
  const translateJoinErrorMessage = (message) => {
    const errorTranslations = {
      "Advert not found": "İlan bulunamadı",
      "Advert is not open for requests": "İlan katılım için açık değil",
      "You are already a participant in this advert":
        "Bu ilana zaten katılmışsınız",
      "You have already requested to join this advert":
        "Bu ilana zaten katılım talebinde bulunmuşsunuz",
      "You cannot get in an agreed rivalry without private link":
        "Özel davet linki olmadan bu rekabet ilanına katılamazsınız",
      "Please provide required data": "Gerekli bilgileri sağlayın",
      "Failed to fetch": "Sunucuya bağlanılamadı",
      "Network error": "Ağ bağlantısı hatası",
      "Request sent successfully": "Katılım talebiniz başarıyla gönderildi",
    };

    // Check if the message contains any known error patterns
    for (const [englishError, turkishError] of Object.entries(
      errorTranslations
    )) {
      if (message.includes(englishError)) {
        return turkishError;
      }
    }

    // If no translation found, return original message or a generic error
    return message || "Bilinmeyen bir hata oluştu";
  };

  const handleJoinAdvert = async (e) => {
    e.preventDefault(); // Prevent any default form behavior
    e.stopPropagation(); // Stop event bubbling

    if (isJoining) return;

    // Store current scroll position
    const currentScrollY = window.scrollY;

    try {
      setIsJoining(true);

      console.log("Sending join request for advert:", advert._id);

      const response = await fetch(`/api/v1/advert/request/${advert._id}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 404) {
          throw new Error("Advert not found");
        } else if (response.status === 400) {
          // Handle specific 400 errors
          if (errorData.msg) {
            throw new Error(errorData.msg);
          } else {
            throw new Error("Please provide required data");
          }
        } else if (response.status === 401) {
          throw new Error("Yetkisiz erişim");
        } else if (response.status === 403) {
          throw new Error("Erişim engellendi");
        } else {
          throw new Error(errorData.msg || `Backend error: ${response.status}`);
        }
      }

      const result = await response.json();

      // Show success message
      if (result.message) {
        const translatedMessage = translateJoinErrorMessage(result.message);
        showNotificationMessage(translatedMessage, "success");
      } else {
        showNotificationMessage(
          "Katılım talebiniz başarıyla gönderildi",
          "success"
        );
      }

      // Instead of reloading the page, trigger an immediate update to show waiting status
      // This will be handled by the parent component (AdvertDetailPage)
      if (onAdvertUpdate) {
        // Create an updated advert object with the user added to waiting list
        const updatedAdvert = {
          ...advert,
          waitingList: [
            ...(advert.waitingList || []),
            {
              user: {
                _id: currentUser._id,
                name: currentUser.name,
                email: currentUser.email,
                profilePicture: currentUser.profilePicture,
              },
            },
          ],
        };
        onAdvertUpdate(updatedAdvert);
      } else {
        // Fallback: reload page if callback not available
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (err) {
      console.error("Error joining advert:", err);
      const translatedError = translateJoinErrorMessage(err.message);
      showNotificationMessage(translatedError, "error");

      // Restore scroll position on error
      setTimeout(() => {
        window.scrollTo(0, currentScrollY);
      }, 100);
    } finally {
      setIsJoining(false);
    }
  };

  // Admin functions for accepting/declining waiting list users
  const handleAcceptUser = async (userId, userName) => {
    try {
      console.log("Accepting user:", userId);

      const response = await fetch(
        `/api/v1/advert/request/accept/${advert._id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            requestId: userId,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Handle specific error cases with Turkish translations
        if (response.status === 400) {
          if (
            errorData.msg &&
            errorData.msg.includes("Please provide all required data")
          ) {
            throw new Error("Gerekli veriler sağlanamadı");
          } else if (
            errorData.msg &&
            errorData.msg.includes("User not found")
          ) {
            throw new Error("Kullanıcı bulunamadı");
          } else if (
            errorData.msg &&
            errorData.msg.includes("Request not found in waiting list")
          ) {
            throw new Error("İstek bekleme listesinde bulunamadı");
          } else if (
            errorData.msg &&
            errorData.msg.includes("User is already a participant")
          ) {
            throw new Error("Kullanıcı zaten katılımcı");
          } else if (
            errorData.msg &&
            errorData.msg.includes("Advert is not open for requests")
          ) {
            throw new Error("İlan istek kabul etmiyor");
          } else if (
            errorData.msg &&
            errorData.msg.includes("You cannot get in an agreed rivalry")
          ) {
            throw new Error(
              "Anlaşmalı rekabete özel bağlantı olmadan katılamazsınız"
            );
          } else {
            throw new Error("Geçersiz istek");
          }
        } else if (response.status === 403) {
          throw new Error("Bu isteği kabul etme yetkiniz yok");
        } else if (response.status === 404) {
          throw new Error("İlan bulunamadı");
        } else {
          throw new Error(
            errorData.msg || "Kullanıcı kabul edilirken hata oluştu"
          );
        }
      }

      const result = await response.json();
      showNotificationMessage(`${userName} başarıyla kabul edildi`, "success");

      // The backend now sends just the accepted user, not the full advert
      // The WebSocket "requestAccept" event will handle the real-time update
      // So we don't need to manually update the advert state here
      console.log(
        "User accepted successfully, WebSocket will handle the update:",
        result
      );
    } catch (err) {
      console.error("Error accepting user:", err);
      showNotificationMessage(err.message, "error");
    }
  };

  const handleDeclineUser = async (userId, userName) => {
    try {
      console.log("Declining user:", userId);

      const response = await fetch(
        `/api/v1/advert/request/reject/${advert._id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            requestId: userId,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Handle specific error cases with Turkish translations (same as accept)
        if (response.status === 400) {
          if (
            errorData.msg &&
            errorData.msg.includes("Please provide all required data")
          ) {
            throw new Error("Gerekli veriler sağlanamadı");
          } else if (
            errorData.msg &&
            errorData.msg.includes("User not found")
          ) {
            throw new Error("Kullanıcı bulunamadı");
          } else if (
            errorData.msg &&
            errorData.msg.includes("Request not found in waiting list")
          ) {
            throw new Error("İstek bekleme listesinde bulunamadı");
          } else if (
            errorData.msg &&
            errorData.msg.includes("User is already a participant")
          ) {
            throw new Error("Kullanıcı zaten katılımcı");
          } else if (
            errorData.msg &&
            errorData.msg.includes("Advert is not open for requests")
          ) {
            throw new Error("İlan istek kabul etmiyor");
          } else if (
            errorData.msg &&
            errorData.msg.includes("You cannot get in an agreed rivalry")
          ) {
            throw new Error(
              "Anlaşmalı rekabete özel bağlantı olmadan katılamazsınız"
            );
          } else {
            throw new Error("Geçersiz istek");
          }
        } else if (response.status === 403) {
          throw new Error("Bu isteği reddetme yetkiniz yok");
        } else if (response.status === 404) {
          throw new Error("İlan bulunamadı");
        } else {
          throw new Error(
            errorData.msg || "Kullanıcı reddedilirken hata oluştu"
          );
        }
      }

      const result = await response.json();
      showNotificationMessage(`${userName} reddedildi`, "success");

      // The backend now sends just the rejected user, not the full advert
      // The WebSocket "requestRejected" event will handle the real-time update
      // So we don't need to manually update the advert state here
      console.log(
        "User rejected successfully, WebSocket will handle the update:",
        result
      );
    } catch (err) {
      console.error("Error declining user:", err);
      showNotificationMessage(err.message, "error");
    }
  };

  // Check if current user is already a participant
  const isCurrentUserParticipant =
    currentUser &&
    advert.participants &&
    Array.isArray(advert.participants) &&
    advert.participants.some(
      (participant) =>
        participant.user && participant.user._id === currentUser._id
    );

  // Check if current user is in waiting list
  const isCurrentUserInWaitingList =
    currentUser &&
    advert.waitingList &&
    Array.isArray(advert.waitingList) &&
    advert.waitingList.some(
      (waitingUser) =>
        waitingUser.user && waitingUser.user._id === currentUser._id
    );

  // Check if current user is the creator
  const isCurrentUserCreator =
    currentUser && advert.createdBy && advert.createdBy._id === currentUser._id;

  const isParticipant = isCurrentUserParticipant;
  const isCreator = isCurrentUserCreator;

  // Check if current user is admin (in adminAdvert array)
  const isCurrentUserAdmin =
    currentUser &&
    advert.adminAdvert &&
    Array.isArray(advert.adminAdvert) &&
    advert.adminAdvert.some((adminId) => adminId === currentUser._id);

  // Debug logging for admin check
  console.log("Admin check debug:", {
    currentUserId: currentUser?._id,
    adminAdvertArray: advert.adminAdvert,
    isCurrentUserAdmin: isCurrentUserAdmin,
  });

  // Helper function to check if a user is admin
  const isUserAdmin = (userId) => {
    return (
      advert.adminAdvert &&
      Array.isArray(advert.adminAdvert) &&
      advert.adminAdvert.some((adminId) => adminId === userId)
    );
  };

  // Function for making user admin
  const handleMakeAdmin = async (userId, userName) => {
    try {
      console.log("Making user admin:", userId);

      const response = await fetch(`/api/v1/advert/admin/add/${advert._id}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adminId: userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Handle specific error cases with Turkish translations
        if (response.status === 400) {
          if (
            errorData.msg &&
            errorData.msg.includes("Please provide all required data")
          ) {
            throw new Error("Gerekli veriler sağlanamadı");
          } else if (
            errorData.msg &&
            errorData.msg.includes("User is not a participant")
          ) {
            throw new Error("Kullanıcı bu ilanın katılımcısı değil");
          } else {
            throw new Error("Geçersiz istek");
          }
        } else if (response.status === 403) {
          throw new Error("Bu kullanıcıyı yönetici yapma yetkiniz yok");
        } else if (response.status === 404) {
          throw new Error("İlan bulunamadı");
        } else {
          throw new Error(
            errorData.msg || "Kullanıcı yönetici yapılırken hata oluştu"
          );
        }
      }

      const result = await response.json();
      showNotificationMessage(
        `${userName} başarıyla yönetici yapıldı`,
        "success"
      );

      // The backend now sends just the user who was made admin, not the full advert
      // The WebSocket "adminAdded" event will handle the real-time update
      // So we don't need to manually update the advert state here
      console.log(
        "User made admin successfully, WebSocket will handle the update:",
        result
      );
    } catch (err) {
      console.error("Error making user admin:", err);
      showNotificationMessage(err.message, "error");
    }
  };

  // Function for expelling user
  const handleExpelUser = async (userId, userName) => {
    try {
      console.log("Expelling user:", userId);

      const response = await fetch(`/api/v1/advert/expel/${advert._id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          participantId: userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Handle specific error cases with Turkish translations
        if (response.status === 400) {
          if (
            errorData.msg &&
            errorData.msg.includes("Please provide required data")
          ) {
            throw new Error("Gerekli veriler sağlanamadı");
          } else if (
            errorData.msg &&
            errorData.msg.includes("You cannot expel yourself")
          ) {
            throw new Error(
              "Kendinizi ilandan çıkaramazsınız, bunun yerine ayrılın"
            );
          } else if (
            errorData.msg &&
            errorData.msg.includes("User is not a participant")
          ) {
            throw new Error("Kullanıcı bu ilanın katılımcısı değil");
          } else if (
            errorData.msg &&
            errorData.msg.includes("You cannot expel the creator")
          ) {
            throw new Error(
              "İlan sahibini çıkaramazsınız, bunun yerine ilanı silin"
            );
          } else {
            throw new Error("Geçersiz istek");
          }
        } else if (response.status === 403) {
          throw new Error("Bu kullanıcıyı çıkarma yetkiniz yok");
        } else if (response.status === 404) {
          throw new Error("İlan bulunamadı");
        } else {
          throw new Error(
            errorData.msg || "Kullanıcı çıkarılırken hata oluştu"
          );
        }
      }

      const result = await response.json();
      showNotificationMessage(
        `${userName} başarıyla ilandan çıkarıldı`,
        "success"
      );

      // The backend now sends just the user who was expelled, not the full advert
      // The WebSocket "participantExpelled" event will handle the real-time update
      // So we don't need to manually update the advert state here
      console.log(
        "User expelled successfully, WebSocket will handle the update:",
        result
      );
    } catch (err) {
      console.error("Error expelling user:", err);
      showNotificationMessage(err.message, "error");
    }
  };

  // Helper function to check if current user can expel a specific user
  const canExpelUser = (targetUserId) => {
    // Must be an admin to expel anyone
    if (!isCurrentUserAdmin) return false;

    // Cannot expel yourself
    if (targetUserId === currentUser?._id) return false;

    // Cannot expel the advert creator (only creator can leave voluntarily)
    if (targetUserId === advert.createdBy?._id) return false;

    return true;
  };

  // Function for removing admin status
  const handleRemoveAdmin = async (userId, userName) => {
    try {
      console.log("Removing admin status from user:", userId);

      const response = await fetch(
        `/api/v1/advert/admin/remove/${advert._id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            adminId: userId,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Handle specific error cases with Turkish translations
        if (response.status === 400) {
          if (
            errorData.msg &&
            errorData.msg.includes("Please provide all required data")
          ) {
            throw new Error("Gerekli veriler sağlanamadı");
          } else {
            throw new Error("Geçersiz istek");
          }
        } else if (response.status === 403) {
          throw new Error(
            "Bu kullanıcının yöneticilik durumunu değiştirme yetkiniz yok"
          );
        } else if (response.status === 404) {
          throw new Error("İlan bulunamadı");
        } else {
          throw new Error(
            errorData.msg || "Yöneticilik kaldırılırken hata oluştu"
          );
        }
      }

      const result = await response.json();
      showNotificationMessage(
        `${userName} başarıyla yöneticilikten çıkarıldı`,
        "success"
      );

      // The backend now sends just the user who was demoted from admin, not the full advert
      // The WebSocket "adminRemoved" event will handle the real-time update
      // So we don't need to manually update the advert state here
      console.log(
        "Admin removed successfully, WebSocket will handle the update:",
        result
      );
    } catch (err) {
      console.error("Error removing admin status:", err);
      showNotificationMessage(err.message, "error");
    }
  };

  // Helper function to check if current user can remove admin status from a specific user
  const canRemoveAdmin = (targetUserId) => {
    // Must be an admin to remove admin status from anyone
    if (!isCurrentUserAdmin) return false;

    // Cannot remove admin status from yourself
    if (targetUserId === currentUser?._id) return false;

    // Target user must be an admin to remove their admin status
    if (!isUserAdmin(targetUserId)) return false;

    // Only the advert creator can remove admin status from the creator
    // Others cannot remove admin status from the creator
    if (
      targetUserId === advert.createdBy?._id &&
      currentUser?._id !== advert.createdBy?._id
    ) {
      return false;
    }

    return true;
  };

  // Function for leaving the advert
  const handleLeaveAdvert = async () => {
    try {
      console.log("Leaving advert:", advert._id);
      setShowLeaveDropdown(false);

      const response = await fetch(`/api/v1/advert/leave/${advert._id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Handle specific error cases with Turkish translations
        if (response.status === 400) {
          if (
            errorData.msg &&
            errorData.msg.includes("Please provide required data")
          ) {
            throw new Error("Gerekli veriler sağlanamadı");
          } else if (
            errorData.msg &&
            errorData.msg.includes("You are not a participant in this advert")
          ) {
            throw new Error("Bu ilanın katılımcısı değilsiniz");
          } else {
            throw new Error("Geçersiz istek");
          }
        } else if (response.status === 404) {
          throw new Error("İlan bulunamadı");
        } else if (response.status === 403) {
          throw new Error("Bu işlemi gerçekleştirme yetkiniz yok");
        } else if (response.status === 401) {
          throw new Error("Oturum açmanız gerekiyor");
        } else {
          throw new Error(errorData.msg || "İlandan ayrılırken hata oluştu");
        }
      }

      const result = await response.json();

      // Handle different success scenarios based on the message
      if (result.message.includes("deleted")) {
        showNotificationMessage(
          "İlandan ayrıldınız ve ilan silindi",
          "success"
        );
        // Navigate back to matches page after deletion
        setTimeout(() => {
          navigate("/matches");
        }, 1500);
      } else if (result.message.includes("new creator")) {
        showNotificationMessage(
          "İlandan ayrıldınız ve yeni bir ilan yöneticisi atandı",
          "success"
        );
        // Navigate back to matches page
        setTimeout(() => {
          navigate("/matches");
        }, 1500);
      } else {
        showNotificationMessage("İlandan başarıyla ayrıldınız", "success");

        // Update the advert data if callback is available and we have updated advert data
        if (onAdvertUpdate && result.advert) {
          onAdvertUpdate(result.advert);
        } else {
          // If no updated advert data or callback, navigate to matches page
          setTimeout(() => {
            navigate("/matches");
          }, 1500);
        }
      }
    } catch (err) {
      console.error("Error leaving advert:", err);
      showNotificationMessage(err.message, "error");
    }
  };

  // Function for deleting the advert
  const handleDeleteAdvert = async () => {
    try {
      console.log("Deleting advert:", advert._id);
      setShowLeaveDropdown(false);

      const response = await fetch(`/api/v1/advert/delete/${advert._id}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Handle specific error cases with Turkish translations
        if (response.status === 400) {
          if (
            errorData.msg &&
            errorData.msg.includes("Please provide required data")
          ) {
            throw new Error("Gerekli veriler sağlanamadı");
          } else {
            throw new Error("Geçersiz istek");
          }
        } else if (response.status === 404) {
          throw new Error("İlan bulunamadı veya silme yetkiniz yok");
        } else if (response.status === 403) {
          throw new Error("Bu işlemi gerçekleştirme yetkiniz yok");
        } else if (response.status === 401) {
          throw new Error("Oturum açmanız gerekiyor");
        } else {
          throw new Error(errorData.msg || "İlan silinirken hata oluştu");
        }
      }

      const result = await response.json();
      showNotificationMessage("İlan başarıyla silindi", "success");

      // Navigate back to matches page after successful deletion
      setTimeout(() => {
        navigate("/matches");
      }, 1500);
    } catch (err) {
      console.error("Error deleting advert:", err);
      showNotificationMessage(err.message, "error");
    }
  };

  // Function for reverting join request
  const handleRevertJoinRequest = async () => {
    try {
      console.log("Reverting join request for advert:", advert._id);

      const response = await fetch(`/api/v1/advert/request/${advert._id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Handle specific error cases with Turkish translations
        if (response.status === 400) {
          if (
            errorData.msg &&
            errorData.msg.includes("Please provide required data")
          ) {
            throw new Error("Gerekli veriler sağlanamadı");
          } else if (
            errorData.msg &&
            errorData.msg.includes("You have not requested this advert")
          ) {
            throw new Error("Bu ilan için talebiniz bulunmuyor");
          } else {
            throw new Error("Geçersiz istek");
          }
        } else if (response.status === 404) {
          throw new Error("İlan bulunamadı");
        } else if (response.status === 403) {
          throw new Error("Bu işlemi gerçekleştirme yetkiniz yok");
        } else if (response.status === 401) {
          throw new Error("Oturum açmanız gerekiyor");
        } else {
          throw new Error(errorData.msg || "Talep geri alınırken hata oluştu");
        }
      }

      const result = await response.json();
      showNotificationMessage(
        "Katılım talebiniz başarıyla geri alındı",
        "success"
      );

      // The backend now sends just the user who revoked their request, not the full advert
      // The WebSocket "revokeRequest" event will handle the real-time update
      // So we don't need to manually update the advert state here
      console.log(
        "Request revoked successfully, WebSocket will handle the update:",
        result
      );
    } catch (err) {
      console.error("Error reverting join request:", err);
      showNotificationMessage(err.message, "error");
    }
  };

  // Handle status toggle (cancel/reopen advert)
  const handleStatusToggle = async () => {
    try {
      console.log("Current advert status:", advert.status);
      console.log("Toggling advert status...");

      const response = await fetch(`/api/v1/advert/toggle/${advert._id}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Handle specific error cases with Turkish translations
        if (response.status === 400) {
          if (
            errorData.msg &&
            errorData.msg.includes("Please provide required data")
          ) {
            throw new Error("Gerekli bilgileri sağlayın");
          } else if (
            errorData.msg &&
            errorData.msg.includes("Advert is not open for cancellation")
          ) {
            throw new Error(
              "Bu ilan iptal edilemez (tamamlanmış veya süresi geçmiş)"
            );
          } else if (
            errorData.msg &&
            errorData.msg.includes("You cannot activate a full advert")
          ) {
            throw new Error("Dolu olan bir ilan aktif edilemez");
          } else {
            throw new Error("Geçersiz istek");
          }
        } else if (response.status === 401) {
          throw new Error("Oturum açmanız gerekiyor");
        } else if (response.status === 403) {
          if (
            errorData.msg &&
            errorData.msg.includes("You are not allowed to cancel this advert")
          ) {
            throw new Error("Bu ilanı iptal etme yetkiniz yok");
          } else {
            throw new Error("Bu işlemi gerçekleştirme yetkiniz yok");
          }
        } else if (response.status === 404) {
          if (errorData.msg && errorData.msg.includes("Advert not found")) {
            throw new Error("İlan bulunamadı");
          } else {
            throw new Error("İlan bulunamadı");
          }
        } else {
          throw new Error(
            errorData.msg || "İlan durumu değiştirilirken hata oluştu"
          );
        }
      }

      const result = await response.json();
      console.log("Status toggle response:", result);

      // Update the advert status in state
      const updatedAdvert = {
        ...advert,
        status: result.status,
      };

      if (onAdvertUpdate) {
        onAdvertUpdate(updatedAdvert);
      }

      // Show success notification with status-specific message
      const statusMessages = {
        active: "İlan başarıyla aktif edildi",
        cancelled: "İlan başarıyla iptal edildi",
        open: "İlan başarıyla açıldı",
        full: "İlan dolu olarak işaretlendi",
        expired: "İlan süresi doldu",
        completed: "İlan tamamlandı",
      };

      const successMessage =
        statusMessages[result.status] ||
        `İlan durumu ${result.status} olarak değiştirildi`;
      showNotificationMessage(successMessage, "success");
    } catch (err) {
      console.error("Error toggling advert status:", err);
      showNotificationMessage(err.message, "error");
    }
  };

  // Handle rivalry toggle (backend integration)
  const handleRivalryToggle = async () => {
    try {
      console.log("Rivalry toggle clicked - Current state:", rivalryAgreed);

      const response = await fetch(`/api/v1/advert/rivalry/${advert._id}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Handle specific error cases with Turkish translations
        if (response.status === 400) {
          if (
            errorData.msg &&
            errorData.msg.includes("This advert is not marked as a rivalry")
          ) {
            throw new Error("Bu ilan rekabet ilanı olarak işaretlenmemiş");
          } else {
            throw new Error("Geçersiz istek");
          }
        } else if (response.status === 403) {
          if (
            errorData.msg &&
            errorData.msg.includes("You are not allowed to agree on rivalry")
          ) {
            throw new Error(
              "Bu ilan için rekabet anlaşması yapma yetkiniz yok"
            );
          } else {
            throw new Error("Bu işlemi gerçekleştirme yetkiniz yok");
          }
        } else if (response.status === 404) {
          if (errorData.msg && errorData.msg.includes("Advert not found")) {
            throw new Error("İlan bulunamadı");
          } else {
            throw new Error("İlan bulunamadı");
          }
        } else if (response.status === 401) {
          throw new Error("Oturum açmanız gerekiyor");
        } else {
          throw new Error(
            errorData.msg || "Rekabet durumu değiştirilirken hata oluştu"
          );
        }
      }

      const result = await response.json();
      console.log("Rivalry toggle response:", result);

      // Update local state with backend response
      setRivalryAgreed(result.agreed);

      // Show success notification
      showNotificationMessage(
        result.agreed
          ? "Rekabet anlaşması kabul edildi"
          : "Rekabet anlaşması iptal edildi",
        "success"
      );

      // Update the advert data if callback is available
      if (onAdvertUpdate && advert) {
        const updatedAdvert = {
          ...advert,
          isRivalry: {
            ...advert.isRivalry,
            agreed: result.agreed,
            updatedAt: new Date().toISOString(),
          },
        };
        onAdvertUpdate(updatedAdvert);
      }
    } catch (err) {
      console.error("Error toggling rivalry status:", err);
      showNotificationMessage(err.message, "error");
    }
  };

  const safeParticipants =
    advert.participants && Array.isArray(advert.participants)
      ? advert.participants
      : [];

  const safeWaitingList =
    advert.waitingList && Array.isArray(advert.waitingList)
      ? advert.waitingList
      : [];

  // Combine participants and waiting list for display
  const allUsersToShow = [
    ...safeParticipants.map((p) => ({ ...p, isWaiting: false })),
    ...safeWaitingList.map((w) => ({ ...w, isWaiting: true })),
  ];

  const participantsToShow = showAllParticipants
    ? allUsersToShow
    : allUsersToShow.slice(0, 6);

  const remainingCount = allUsersToShow.length - 6;

  return (
    <div className="h-full flex flex-col">
      {/* Header - Sticky - Compact Design */}
      <div
        className="text-white py-3 px-4 sticky top-0 z-10 shadow-lg"
        style={{ backgroundImage: "linear-gradient(135deg, #065f46, #10b981)" }}
      >
        <div className="flex items-center justify-between">
          <div className="text-left">
            {/* Match Name */}
            <h1 className="text-lg font-bold leading-tight mb-1">
              {advert.name}
            </h1>
          </div>

          {/* Status Badge/Dropdown & Rivalry Toggle - Right Side */}
          <div className="flex items-center space-x-3">
            {/* Rivalry Toggle Switch - Show if advert has rivalry status */}
            {advert.isRivalry && advert.isRivalry.status && (
              <div className="flex items-center">
                <span className="text-xs text-white/80 mr-2">Rekabet</span>
                <label
                  className={`relative inline-flex items-center ${
                    currentUser &&
                    advert.createdBy &&
                    currentUser._id === advert.createdBy._id
                      ? "cursor-pointer"
                      : "cursor-not-allowed opacity-75"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={rivalryAgreed}
                    onChange={
                      currentUser &&
                      advert.createdBy &&
                      currentUser._id === advert.createdBy._id
                        ? handleRivalryToggle
                        : undefined
                    }
                    disabled={
                      !currentUser ||
                      !advert.createdBy ||
                      currentUser._id !== advert.createdBy._id
                    }
                    className="sr-only peer"
                  />
                  <div
                    className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 ${
                      !currentUser ||
                      !advert.createdBy ||
                      currentUser._id !== advert.createdBy._id
                        ? "peer-disabled:bg-gray-300 peer-disabled:peer-checked:bg-gray-400"
                        : ""
                    }`}
                  ></div>
                </label>
              </div>
            )}

            {/* Status Toggle Switch */}
            {currentUser &&
            advert.createdBy &&
            currentUser._id === advert.createdBy._id ? (
              // Owner sees toggle switch to change status
              <div className="flex items-center gap-2">
                <button
                  onClick={handleStatusToggle}
                  disabled={
                    advert.status === "completed" ||
                    advert.status === "expired" ||
                    advert.status === "full"
                  }
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-white/20 ${
                    advert.status === "open" || advert.status === "active"
                      ? "bg-green-500"
                      : advert.status === "cancelled" ||
                        advert.status === "canceled"
                      ? "bg-red-500"
                      : advert.status === "full"
                      ? "bg-yellow-500 opacity-50 cursor-not-allowed"
                      : advert.status === "expired"
                      ? "bg-gray-500 opacity-50 cursor-not-allowed"
                      : advert.status === "completed"
                      ? "bg-blue-500 opacity-50 cursor-not-allowed"
                      : "bg-gray-500"
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition duration-200 ease-in-out ${
                      advert.status === "open" || advert.status === "active"
                        ? "translate-x-5"
                        : "translate-x-1"
                    }`}
                  />
                </button>
                <span className="text-xs text-white/90 font-medium">
                  {advert.status === "open" || advert.status === "active"
                    ? "Aktif"
                    : advert.status === "cancelled" ||
                      advert.status === "canceled"
                    ? "İptal"
                    : advert.status === "full"
                    ? "Dolu"
                    : advert.status === "expired"
                    ? "Süresi Geçti"
                    : advert.status === "completed"
                    ? "Tamamlandı"
                    : advert.status || "Bilinmeyen"}
                </span>
              </div>
            ) : (
              // Non-owners see regular status badge
              <div className="flex items-center space-x-1">
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    advert.status === "open" || advert.status === "active"
                      ? "bg-green-300"
                      : advert.status === "full"
                      ? "bg-yellow-300"
                      : advert.status === "cancelled" ||
                        advert.status === "canceled"
                      ? "bg-red-300"
                      : advert.status === "expired"
                      ? "bg-gray-300"
                      : advert.status === "completed"
                      ? "bg-blue-300"
                      : "bg-gray-300"
                  }`}
                ></div>
                <span className="text-xs opacity-90 capitalize">
                  {advert.status === "open" || advert.status === "active"
                    ? "Aktif"
                    : advert.status === "full"
                    ? "Dolu"
                    : advert.status === "cancelled" ||
                      advert.status === "canceled"
                    ? "İptal"
                    : advert.status === "expired"
                    ? "Süresi Geçti"
                    : advert.status === "completed"
                    ? "Tamamlandı"
                    : "Bilinmeyen"}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Maç Detayları - Compact Design */}
      <div className="bg-white px-4 py-3  sticky top-[56px] z-10 shadow-sm">
        <div className="max-w-lg mx-auto">
          {/* Date, Time & Venue in one box */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Date & Time */}
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500">
                    Tarih & Saat
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatDate(advert.startsAt)}
                  </p>
                </div>
              </div>

              {/* Venue */}
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500">Saha</p>
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {advert.pitch?.name ||
                      advert.customPitch?.name ||
                      "Halısaha Belirtilmemiş"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* İlan Veren Bilgisi - Compact */}
        <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              İlan Veren
            </span>
            {isCreator && (
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                Siz
              </span>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center overflow-hidden ring-2 ring-blue-100">
                {getProfilePictureUrl(advert.createdBy?.profilePicture) ? (
                  <img
                    src={getProfilePictureUrl(advert.createdBy?.profilePicture)}
                    alt={advert.createdBy?.name || "Kullanıcı"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className={`w-full h-full flex items-center justify-center text-white font-semibold text-sm ${
                    getProfilePictureUrl(advert.createdBy?.profilePicture)
                      ? "hidden"
                      : "flex"
                  }`}
                >
                  {getInitials(advert.createdBy?.name)}
                </div>
              </div>
              {/* Online indicator - only show if user is online */}
              {isUserOnline(advert.createdBy?._id) && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
              )}
            </div>
            <div className="flex-1">
              <button
                onClick={() => {
                  if (advert.createdBy?._id) {
                    window.scrollTo(0, 0);
                    navigate(`/profile?userId=${advert.createdBy._id}`);
                  }
                }}
                className="font-medium text-gray-900 hover:text-green-600 text-sm transition-colors cursor-pointer text-left"
              >
                {advert.createdBy?.name || "İsimsiz Kullanıcı"}
              </button>
            </div>
          </div>
        </div>

        {/* Maç Türüne Göre Display */}
        {advert.isRivalry?.status ? (
          // Rakip Takım İlanları - Compact XvsX
          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
            <div className="text-center">
              <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full mb-3 inline-block">
                Rakip Takım Maçı
              </span>

              <div className="bg-gradient-to-r from-red-50 to-blue-50 rounded-lg p-4 mb-3">
                <div className="flex items-center justify-center space-x-4">
                  <div className="text-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mb-1">
                      <span className="text-white font-bold text-sm">
                        {Math.ceil(
                          ((advert.playersNeeded || 0) +
                            (advert.goalKeepersNeeded || 0)) /
                            2
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-1">
                      <span className="text-white font-bold text-sm">
                        {Math.ceil(
                          ((advert.playersNeeded || 0) +
                            (advert.goalKeepersNeeded || 0)) /
                            2
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : advert.playersNeeded && advert.playersNeeded > 0 ? (
          // Oyuncu İlanları - Compact Progress Bar
          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Oyuncu Durumu
                </span>
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                  {safeParticipants.length}/
                  {(advert.playersNeeded || 0) +
                    (advert.goalKeepersNeeded || 0)}
                </span>
              </div>

              <div className="relative">
                <div className="w-full bg-gray-200 rounded-lg h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-lg transition-all duration-300"
                    style={{
                      width: `${Math.min(
                        100,
                        (safeParticipants.length /
                          ((advert.playersNeeded || 0) +
                            (advert.goalKeepersNeeded || 0))) *
                          100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-green-50 rounded-md p-2 text-center">
                  <p className="text-lg font-bold text-green-600">
                    {safeParticipants.length}
                  </p>
                  <p className="text-xs text-green-700">Katılan</p>
                </div>
                <div className="bg-orange-50 rounded-md p-2 text-center">
                  <p className="text-lg font-bold text-orange-600">
                    {Math.max(
                      0,
                      (advert.playersNeeded || 0) +
                        (advert.goalKeepersNeeded || 0) -
                        safeParticipants.length
                    )}
                  </p>
                  <p className="text-xs text-orange-700">Kalan</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Normal Takım Maçları - Compact X vs X
          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-3 mb-2">
                <div className="text-center">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs mb-1">
                    {Math.ceil(safeParticipants.length / 2)}
                  </div>
                </div>
                <div className="text-sm font-bold text-gray-700">VS</div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-xs mb-1">
                    {Math.floor(safeParticipants.length / 2)}
                  </div>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-800">
                {safeParticipants.length} oyuncu
              </p>
            </div>
          </div>
        )}

        {/* Katılımcılar - Compact Accordion */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div
            className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => setShowAllParticipants(!showAllParticipants)}
          >
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">
                Katılımcılar ({safeParticipants.length}){" "}
                {safeWaitingList.length > 0 &&
                  `+ ${safeWaitingList.length} beklemede`}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
                {safeParticipants.length}
              </span>
              {safeWaitingList.length > 0 && (
                <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full">
                  {safeWaitingList.length}
                </span>
              )}
              <svg
                className={`w-4 h-4 text-gray-600 transition-transform duration-300 ${
                  showAllParticipants ? "rotate-180" : ""
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              showAllParticipants
                ? "max-h-[400px] opacity-100"
                : "max-h-0 opacity-0"
            }`}
          >
            <div className="overflow-y-auto max-h-[350px]">
              <div className="p-3 pt-0">
                {allUsersToShow.length > 0 ? (
                  <div className="space-y-2">
                    {participantsToShow.map((item, index) => {
                      const user = item.user || {};
                      const isWaiting = item.isWaiting;
                      return (
                        <div
                          key={index}
                          className={`rounded-lg p-3 border ${
                            isWaiting
                              ? "bg-orange-50 border-orange-200 opacity-75"
                              : "bg-gray-50 border-gray-100"
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <div
                                className={`w-8 h-8 rounded-full ${
                                  isWaiting ? "bg-orange-500" : "bg-green-600"
                                } flex items-center justify-center overflow-hidden`}
                              >
                                {getProfilePictureUrl(user.profilePicture) ? (
                                  <img
                                    src={getProfilePictureUrl(
                                      user.profilePicture
                                    )}
                                    alt={user.name || "Kullanıcı"}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.style.display = "none";
                                      e.target.nextSibling.style.display =
                                        "flex";
                                    }}
                                  />
                                ) : null}
                                <div
                                  className={`w-full h-full flex items-center justify-center text-white font-semibold text-xs ${
                                    getProfilePictureUrl(user.profilePicture)
                                      ? "hidden"
                                      : "flex"
                                  }`}
                                >
                                  {getInitials(user.name)}
                                </div>
                              </div>
                              {/* Goal Keeper Badge */}
                              {user.goalKeeper && (
                                <div
                                  className={`absolute -top-0.5 -right-0.5 w-4 h-4 ${
                                    isWaiting ? "bg-orange-400" : "bg-green-500"
                                  } rounded-full flex items-center justify-center`}
                                >
                                  <svg
                                    className="w-2 h-2 text-white"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </div>
                              )}
                              {/* Online indicator - only show if user is online */}
                              {isUserOnline(user._id) && (
                                <div
                                  className={`absolute w-3 h-3 bg-green-400 border-2 border-white rounded-full ${
                                    user.goalKeeper
                                      ? "-bottom-0.5 -left-0.5"
                                      : "-bottom-0.5 -right-0.5"
                                  }`}
                                ></div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <a
                                  href={`/profile/${user._id}`}
                                  className={`font-medium text-sm truncate cursor-pointer hover:underline ${
                                    isWaiting
                                      ? "text-orange-600 hover:text-orange-800"
                                      : "text-blue-600 hover:text-blue-800"
                                  }`}
                                >
                                  {user.name || "İsimsiz Kullanıcı"}
                                </a>
                                {isWaiting && (
                                  <span className="bg-orange-100 text-orange-800 text-xs font-medium px-1.5 py-0.5 rounded">
                                    Beklemede
                                  </span>
                                )}
                                {user.goalKeeper && (
                                  <span
                                    className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                                      isWaiting
                                        ? "bg-orange-100 text-orange-800"
                                        : "bg-green-100 text-green-800"
                                    }`}
                                  >
                                    K
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              {/* Admin buttons for waiting list users */}
                              {isWaiting && isCurrentUserAdmin && (
                                <>
                                  <button
                                    onClick={() =>
                                      handleAcceptUser(user._id, user.name)
                                    }
                                    className="bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-1 rounded transition-colors"
                                    title="Kabul Et"
                                  >
                                    ✓
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeclineUser(user._id, user.name)
                                    }
                                    className="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded transition-colors"
                                    title="Reddet"
                                  >
                                    ✕
                                  </button>
                                </>
                              )}

                              {/* Make Admin button for non-admin participants */}
                              {!isWaiting &&
                                isCurrentUserAdmin &&
                                !isUserAdmin(user._id) &&
                                user._id !== currentUser?._id && (
                                  <button
                                    onClick={() =>
                                      handleMakeAdmin(user._id, user.name)
                                    }
                                    className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-2 py-1 rounded transition-colors"
                                    title="Yönetici Yap"
                                  >
                                    👑
                                  </button>
                                )}

                              {/* Expel User button for admins */}
                              {!isWaiting && canExpelUser(user._id) && (
                                <button
                                  onClick={() =>
                                    handleExpelUser(user._id, user.name)
                                  }
                                  className="bg-red-500 hover:bg-red-600 text-white text-xs px-1.5 py-1 rounded transition-colors"
                                  title="İlandan Çıkar"
                                >
                                  ⚠️
                                </button>
                              )}

                              {/* Remove Admin Status button for admins */}
                              {!isWaiting && canRemoveAdmin(user._id) && (
                                <button
                                  onClick={() =>
                                    handleRemoveAdmin(user._id, user.name)
                                  }
                                  className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-1.5 py-1 rounded transition-colors"
                                  title="Yöneticilikten Çıkar"
                                >
                                  👑⬇️
                                </button>
                              )}
                              <div className="text-right">
                                <p className="text-xs text-gray-500">
                                  {item.joinedAt
                                    ? new Date(
                                        item.joinedAt
                                      ).toLocaleDateString("tr-TR")
                                    : "-"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <svg
                      className="w-12 h-12 text-gray-300 mx-auto mb-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                    </svg>
                    <p className="text-gray-600">Henüz katılımcı yok</p>
                    <p className="text-xs text-gray-500 mt-1">
                      İlk katılan kişi siz olun!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Join Button - Sticky Bottom */}
      <div
        className="sticky bottom-0 bg-white p-4  shadow-lg z-10"
        style={{ scrollMarginBottom: "0px" }}
        onFocus={(e) => e.preventDefault()}
      >
        {isCreator ? (
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setShowLeaveDropdown(!showLeaveDropdown)}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-xl text-center shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                  clipRule="evenodd"
                />
              </svg>
              <span>İlanı Yönet</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {showLeaveDropdown && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-20">
                <button
                  onClick={handleLeaveAdvert}
                  className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2"
                >
                  <svg
                    className="w-5 h-5 text-orange-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>İlandan Ayrıl</span>
                </button>
                <button
                  onClick={handleDeleteAdvert}
                  className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"
                      clipRule="evenodd"
                    />
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>İlanı Sil</span>
                </button>
              </div>
            )}
          </div>
        ) : isParticipant ? (
          <button
            type="button"
            onClick={handleLeaveAdvert}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            <span>İlandan Ayrıl</span>
          </button>
        ) : isCurrentUserInWaitingList ? (
          <button
            type="button"
            onClick={handleRevertJoinRequest}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            <span>Talebi Geri Al</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleJoinAdvert}
            disabled={isJoining}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center space-x-3"
          >
            {isJoining ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                <span className="text-lg">Katılıyor...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-lg">Maça Katıl</span>
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </>
            )}
          </button>
        )}
      </div>
      <Notification
        message={notificationMessage}
        type={notificationType}
        isVisible={showNotification}
        onClose={handleCloseNotification}
      />
    </div>
  );
}

export default AdvertInfo;
