import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useWebSocket } from "../../context/WebSocketContext";
import Notification from "../shared/Notification";

function Invitations({ user }) {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState("incoming"); // incoming = gelen davetler, sent = gönderilen davetler
  const [activeFilter, setActiveFilter] = useState("current"); // current = güncel, old = geçmiş
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 18,
    total: 0,
    totalPages: 0,
  });
  const {
    user: authUser,
    getProfilePictureUrl,
    addAdvertParticipation,
    refreshUnseenInvitationsCount,
    decrementUnseenInvitationsCount,
    setCurrentlyViewingIncomingInvitations,
    getUnseenInvitationsCount,
  } = useAuth();
  const {
    listenForNotificationEvent,
    isNotificationConnected,
    joinSingleAdvertChatRoom,
    isChatConnected,
  } = useWebSocket();
  const navigate = useNavigate();

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

  // Calculate unseen count for current section and filter
  const calculateCurrentUnseenCount = (invitationsData) => {
    return invitationsData.filter((invitation) => invitation.seen === false)
      .length;
  };

  // Mark invitations as seen in the database
  const markInvitationsAsSeen = async (statuses) => {
    try {
      console.log("Marking invitations as seen for statuses:", statuses);

      const response = await fetch("/api/v1/invitation/mark-seen", {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          statuses: statuses,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Invitations marked as seen successfully:", data.message);

        // Refresh global unseen count after marking as seen
        refreshUnseenInvitationsCount();
      } else {
        // Handle error cases gracefully (don't show to user)
        let errorMessage = "Failed to mark invitations as seen";

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
              errorMessage = "Yetki hatası";
              break;
            case 403:
              errorMessage = "Bu işlemi yapma yetkiniz yok";
              break;
            case 404:
              errorMessage = "Davet bilgileri bulunamadı";
              break;
            case 429:
              errorMessage = "Çok fazla istek";
              break;
            case 500:
              errorMessage = "Sunucu hatası";
              break;
            default:
              errorMessage = `Sunucu hatası: ${response.status}`;
          }
        }

        console.warn("Failed to mark invitations as seen:", errorMessage);
      }
    } catch (error) {
      console.error("Error marking invitations as seen:", error);

      // Handle network errors
      let errorMessage = "Ağ hatası oluştu";
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        errorMessage =
          "Bağlantı hatası oluştu. İnternet bağlantınızı kontrol edin.";
      }

      console.warn("Network error marking invitations as seen:", errorMessage);
    }
  };

  // Error message translation function
  const translateMessage = (message) => {
    const translations = {
      // Network errors
      "Failed to fetch":
        "Bağlantı hatası oluştu. İnternet bağlantınızı kontrol edin.",
      "Network Error": "Ağ hatası oluştu. Lütfen tekrar deneyin.",

      // Backend error messages for invitations
      "Please provide required data": "Gerekli bilgileri girin.",
      "Recipients must be an array": "Alıcı listesi geçersiz.",
      "Recipients array must not be empty": "En az bir alıcı seçmelisiniz.",
      "Invalid status provided": "Geçersiz durum bilgisi sağlandı.",
      "No invites found": "Hiç davet bulunamadı.",
      "Advert not found or is not open for invitations":
        "İlan bulunamadı veya davet kabul etmiyor.",
      "One of the recipients is already a participant of this advert":
        "Seçtiğiniz kişilerden biri zaten bu ilana katılmış.",
      "One of the recipients is already on the waiting list of this advert":
        "Seçtiğiniz kişilerden biri zaten bekleme listesinde.",
      "You are not an admin of this advert": "Bu ilanın yöneticisi değilsiniz.",
      "You have banned one of the recipients":
        "Davet ettiğiniz kişilerden birini engellemişsiniz.",
      "One of the recipients has blocked you.":
        "Davet ettiğiniz kişilerden biri sizi engellemiş.",
      "User not found": "Kullanıcı bulunamadı.",
      "Invitation not found": "Davet bulunamadı.",
      "Invitation already responded": "Bu davete zaten cevap verilmiş.",
      "You are not the recipient of this invitation":
        "Bu davetin alıcısı değilsiniz.",
      "You are already a participant of this advert":
        "Bu ilana zaten katılıyorsunuz.",
      "You are already on the waiting list of this advert":
        "Bu ilanın bekleme listesinde zaten bulunuyorsunuz.",
      "Advert is not open for invitations": "İlan davet kabul etmiyor.",

      // Revoke invitation specific errors
      "Invitation cannot be revoked": "Davet geri çekilemez.",
      "You are not the sender of this invitation":
        "Bu davetin gönderen kişisi değilsiniz.",
      "Invitation is already responded": "Bu davete zaten cevap verilmiş.",
      "Invitation not found or cannot be revoked":
        "Davet bulunamadı veya geri çekilemez.",

      // HTTP Status errors
      "Geçersiz istek": "Geçersiz istek.",
      "Yetki hatası": "Yetki hatası.",
      "Bu işlemi yapma yetkiniz yok": "Bu işlemi yapma yetkiniz yok.",
      "Davet bulunamadı": "Davet bulunamadı.",
      "Çok fazla istek": "Çok fazla istek.",
      "Sunucu hatası": "Sunucu hatası.",

      // Generic errors
      "Something went wrong": "Bir şeyler ters gitti. Lütfen tekrar deneyin.",
      "Server Error": "Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.",
      Unauthorized: "Yetkisiz erişim.",
    };

    return (
      translations[message] ||
      "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin."
    );
  };

  // Fetch invitations from backend
  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        setLoading(true);
        setError(null);

        // Determine endpoint and request body based on active section
        let endpoint, requestBody;

        if (activeSection === "incoming") {
          // For incoming invitations - POST /api/v1/invitation/user
          endpoint = `/api/v1/invitation/user`;

          // Determine statuses based on filter
          const statuses =
            activeFilter === "current"
              ? ["pending"]
              : ["accepted", "declined", "expired", "cancelled"];

          requestBody = {
            statuses: statuses,
          };
        } else {
          // For sent invitations - POST /api/v1/invitation/send
          endpoint = `/api/v1/invitation/send`;

          // Determine statuses based on filter
          const statuses =
            activeFilter === "current"
              ? ["pending"]
              : ["accepted", "declined", "expired", "cancelled"];

          requestBody = {
            statuses: statuses,
          };
        }

        // Add pagination query parameter only for sent invitations
        let url = endpoint;

        if (activeSection === "sent") {
          // Sent invitations: Add pagination parameters
          url += `?page=${pagination.page}&limit=10`;
        }
        // Incoming invitations: No pagination parameters needed

        console.log(`Fetching ${activeSection} invitations:`, {
          url,
          requestBody,
        });

        const response = await fetch(url, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          // Handle 404 gracefully - no invitations found
          if (response.status === 404) {
            setInvitations([]);
            setPagination((prev) => ({ ...prev, total: 0, totalPages: 0 }));
            return;
          }

          let errorMessage = "Davetler yüklenemedi";
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
                errorMessage = "Yetki hatası";
                break;
              case 403:
                errorMessage = "Bu işlemi yapma yetkiniz yok";
                break;
              case 429:
                errorMessage = "Çok fazla istek";
                break;
              case 500:
                errorMessage = "Sunucu hatası";
                break;
              default:
                errorMessage = `Sunucu hatası: ${response.status}`;
            }
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log("Fetched invitations:", data);

        // Process the invitations data from backend
        const processedInvitations = (data.invites || []).map((invitation) => ({
          ...invitation,
          // Ensure we have fallback values for missing data
          advert: {
            ...invitation.advert,
            name: invitation.advert?.name || "İlan",
            startsAt: invitation.advert?.startsAt || new Date().toISOString(),
            playersNeeded: invitation.advert?.playersNeeded || 0,
            goalKeepersNeeded: invitation.advert?.goalKeepersNeeded || 0,
            notes: invitation.advert?.notes || "",
            level: invitation.advert?.level || "intermediate",
            pitch: {
              ...invitation.advert?.pitch,
              name: invitation.advert?.pitch?.name || "Saha",
              location: {
                ...invitation.advert?.pitch?.location,
                address: {
                  ...invitation.advert?.pitch?.location?.address,
                  district:
                    invitation.advert?.pitch?.location?.address?.district ||
                    "Bilinmeyen",
                  city:
                    invitation.advert?.pitch?.location?.address?.city ||
                    "İstanbul",
                },
              },
              pricing: {
                ...invitation.advert?.pitch?.pricing,
                hourlyRate: invitation.advert?.pitch?.pricing?.hourlyRate || 0,
                currency: invitation.advert?.pitch?.pricing?.currency || "TRY",
              },
              specifications: {
                ...invitation.advert?.pitch?.specifications,
                recommendedCapacity: {
                  ...invitation.advert?.pitch?.specifications
                    ?.recommendedCapacity,
                  players:
                    invitation.advert?.pitch?.specifications
                      ?.recommendedCapacity?.players || 14,
                },
              },
            },
            createdBy: {
              ...invitation.advert?.createdBy,
              name:
                invitation.advert?.createdBy?.name || "Bilinmeyen Kullanıcı",
            },
          },
          sender: {
            ...invitation.sender,
            name: invitation.sender?.name || "Bilinmeyen Kullanıcı",
            profilePicture: invitation.sender?.profilePicture || null,
          },
          recipient: {
            ...invitation.recipient,
            name: invitation.recipient?.name || "Bilinmeyen Kullanıcı",
            profilePicture: invitation.recipient?.profilePicture || null,
          },
          role: invitation.role || "player",
          message: invitation.message || "",
          status: invitation.status || "pending",
          seen: invitation.seen || false,
          respondedAt: invitation.respondedAt || null,
          createdAt: invitation.createdAt || new Date().toISOString(),
          updatedAt: invitation.updatedAt || new Date().toISOString(),
        }));

        // Handle data loading differently for incoming vs sent invitations
        if (activeSection === "incoming") {
          // Incoming invitations: No pagination, always replace all data
          setInvitations(processedInvitations);

          // Calculate and update unseen count for incoming invitations
          const unseenCount = calculateCurrentUnseenCount(processedInvitations);

          // If viewing "Gelen Davetler" "Güncel", refresh global unseen count
          // since user is now seeing all pending invitations
          if (activeFilter === "current") {
            refreshUnseenInvitationsCount();
          }

          // Update pagination with simple total count (no pagination)
          setPagination((prev) => ({
            ...prev,
            page: 1,
            limit: processedInvitations.length,
            total: processedInvitations.length,
            totalPages: 1,
          }));
        } else {
          // Sent invitations: Keep pagination logic
          if (pagination.page === 1) {
            // First page - replace all data
            setInvitations(processedInvitations);

            // Calculate and update unseen count for sent invitations
            const unseenCount =
              calculateCurrentUnseenCount(processedInvitations);
          } else {
            // Subsequent pages - append to existing data
            setInvitations((prevInvitations) => {
              const updatedInvitations = [
                ...prevInvitations,
                ...processedInvitations,
              ];

              // Recalculate unseen count with all data
              const unseenCount =
                calculateCurrentUnseenCount(updatedInvitations);

              return updatedInvitations;
            });
          }

          // Update pagination with backend data
          setPagination((prev) => ({
            ...prev,
            page: pagination.page,
            limit: data.limit || 10,
            total: data.total || processedInvitations.length,
            totalPages: Math.ceil(
              (data.total || processedInvitations.length) / (data.limit || 10)
            ),
          }));
        }
      } catch (err) {
        console.error("Error fetching invitations:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (authUser?._id) {
      fetchInvitations();
    }
  }, [authUser, activeSection, activeFilter, pagination.page]);

  // WebSocket listeners for real-time updates
  useEffect(() => {
    if (isNotificationConnected && authUser?._id) {
      console.log("Setting up WebSocket listeners for invitations");

      // Listen for invite declined events
      const cleanupDeclined = listenForNotificationEvent(
        "invite-declined",
        (data) => {
          console.log("Received invite-declined event:", data);

          if (data && data.inviteId) {
            // Update invitations list - move from current to old if user is viewing sent invitations
            setInvitations((prevInvitations) => {
              // Only update if we're viewing sent invitations
              if (activeSection === "sent") {
                if (activeFilter === "current") {
                  // Remove from current view since it's no longer pending
                  const updatedInvitations = prevInvitations.filter(
                    (inv) => inv._id !== data.inviteId
                  );

                  // Update pagination count
                  setPagination((prev) => ({
                    ...prev,
                    total: Math.max(0, prev.total - 1),
                  }));

                  return updatedInvitations;
                } else if (activeFilter === "old") {
                  // If we're in "old" view, update the status
                  return prevInvitations.map((inv) =>
                    inv._id === data.inviteId
                      ? {
                          ...inv,
                          status: "declined",
                          respondedAt: new Date().toISOString(),
                        }
                      : inv
                  );
                }
              }
              return prevInvitations;
            });

            console.log(
              `Invitation ${data.inviteId} was declined via WebSocket`
            );
          }
        }
      );

      // Listen for new invite events
      const cleanupNewInvite = listenForNotificationEvent(
        "newInvite",
        (data) => {
          console.log("Received newInvite event:", data);

          if (data && data.invite) {
            const newInvitation = data.invite;
            console.log("Processing new invitation:", newInvitation);

            // Check if user is currently viewing "Gelen Davetler" "Güncel"
            const isViewingIncomingCurrent =
              activeSection === "incoming" && activeFilter === "current";

            if (isViewingIncomingCurrent) {
              // User is viewing "Gelen Davetler" "Güncel" - add to list and mark as seen
              setInvitations((prevInvitations) => {
                // Check if invitation already exists to avoid duplicates
                const exists = prevInvitations.some(
                  (inv) => inv._id === newInvitation._id
                );
                if (exists) {
                  console.log("Invitation already exists, skipping duplicate");
                  return prevInvitations;
                }

                console.log("Adding new invitation to incoming current list");

                // Since user is viewing "Gelen Davetler" "Güncel", mark this new invitation as seen
                const seenInvitation = { ...newInvitation, seen: true };
                return [seenInvitation, ...prevInvitations];
              });

              // Update pagination count (only for incoming invitations with simple count)
              setPagination((prev) => ({
                ...prev,
                total: prev.total + 1,
                limit: prev.total + 1, // Update limit to match total for incoming
              }));

              console.log("New invitation added to incoming invitations list");

              // Mark this new invitation as seen in database since user is viewing "Gelen Davetler" "Güncel"
              console.log(
                "🔔 MARK SEEN: User is viewing incoming current, marking new invitation as seen"
              );
              markInvitationsAsSeen(["pending"]);
            } else {
              // User is NOT viewing "Gelen Davetler" "Güncel" - just increment unseen count by +1
              console.log(
                "🔔 UNSEEN COUNT: User not viewing incoming current, incrementing unseen count by +1"
              );
              // Note: The global increment will be handled by WebSocketContext
              // We don't need to do anything here locally since the user is not viewing the relevant section
            }
          }
        }
      );

      // Listen for invite accepted individual events (for sent invitations)
      const cleanupAcceptedIndividual = listenForNotificationEvent(
        "invite-accepted-individual",
        (data) => {
          console.log("Received invite-accepted-individual event:", data);

          if (data && data.inviteId) {
            // Update invitations list - move from current to old if user is viewing sent invitations
            setInvitations((prevInvitations) => {
              // Only update if we're viewing sent invitations
              if (activeSection === "sent") {
                if (activeFilter === "current") {
                  // Remove from current view since it's no longer pending
                  const updatedInvitations = prevInvitations.filter(
                    (inv) => inv._id !== data.inviteId
                  );

                  // Update pagination count
                  setPagination((prev) => ({
                    ...prev,
                    total: Math.max(0, prev.total - 1),
                  }));

                  return updatedInvitations;
                } else if (activeFilter === "old") {
                  // If we're in "old" view, update the status
                  return prevInvitations.map((inv) =>
                    inv._id === data.inviteId
                      ? {
                          ...inv,
                          status: "accepted",
                          respondedAt: new Date().toISOString(),
                        }
                      : inv
                  );
                }
              }
              return prevInvitations;
            });

            console.log(
              `Invitation ${data.inviteId} was accepted via WebSocket`
            );
          }
        }
      );

      // Listen for invite revoked events (for incoming invitations)
      const cleanupRevokedInvite = listenForNotificationEvent(
        "invite-revoked",
        (data) => {
          console.log(
            "🚀 REVOKE INVITATION: Received invite-revoked event:",
            data
          );

          if (data && data.inviteId) {
            // Update invitations list - move from current to old if user is viewing incoming invitations
            setInvitations((prevInvitations) => {
              // Only update if we're viewing incoming invitations
              if (activeSection === "incoming") {
                if (activeFilter === "current") {
                  // Remove from current view since it's no longer pending
                  const updatedInvitations = prevInvitations.filter(
                    (inv) => inv._id !== data.inviteId
                  );

                  // Update pagination count (incoming invitations don't use real pagination)
                  setPagination((prev) => ({
                    ...prev,
                    total: Math.max(0, prev.total - 1),
                    limit: Math.max(0, prev.total - 1), // Update limit to match total for incoming
                  }));

                  console.log(
                    "🚀 REVOKE INVITATION: Removed revoked invitation from current view"
                  );
                  return updatedInvitations;
                } else if (activeFilter === "old") {
                  // If we're in "old" view, update the status
                  const updatedInvitations = prevInvitations.map((inv) =>
                    inv._id === data.inviteId
                      ? {
                          ...inv,
                          status: "cancelled",
                          respondedAt: new Date().toISOString(),
                        }
                      : inv
                  );

                  console.log(
                    "🚀 REVOKE INVITATION: Updated revoked invitation status to cancelled"
                  );
                  return updatedInvitations;
                }
              }
              return prevInvitations;
            });

            console.log(
              `🚀 REVOKE INVITATION: Invitation ${data.inviteId} was revoked via WebSocket`
            );
          }
        }
      );

      // Cleanup function
      return () => {
        if (cleanupDeclined) cleanupDeclined();
        if (cleanupNewInvite) cleanupNewInvite();
        if (cleanupAcceptedIndividual) cleanupAcceptedIndividual();
        if (cleanupRevokedInvite) cleanupRevokedInvite();
      };
    }
  }, [
    isNotificationConnected,
    authUser,
    activeSection,
    activeFilter,
    listenForNotificationEvent,
  ]);

  // Handle accept invitation
  const handleAccept = async (invitationId) => {
    try {
      console.log("Accepting invitation:", invitationId);

      // Make API call to accept invitation
      const response = await fetch(
        `/api/v1/invitation/accept/${invitationId}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        let errorMessage = "Davet kabul edilemedi";

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
              errorMessage = "Yetki hatası";
              break;
            case 403:
              errorMessage = "Bu işlemi yapma yetkiniz yok";
              break;
            case 404:
              errorMessage = "Davet bulunamadı";
              break;
            case 429:
              errorMessage = "Çok fazla istek";
              break;
            case 500:
              errorMessage = "Sunucu hatası";
              break;
            default:
              errorMessage = `Sunucu hatası: ${response.status}`;
          }
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Invitation accepted successfully:", data);

      // Extract advert data from response: { inviteId: id, advert }
      const { inviteId, advert } = data;
      const advertId = advert?._id;

      console.log("Response inviteId:", inviteId);
      console.log("Response advert:", advert);
      console.log("Advert ID for redirect:", advertId);

      if (advert && advertId) {
        console.log(
          "🚀 INVITATION ACCEPTANCE: Processing successful invitation acceptance"
        );
        console.log("🚀 INVITATION ACCEPTANCE: Advert data:", advert.name);
        console.log("🚀 INVITATION ACCEPTANCE: Advert ID:", advertId);

        // Add advert to user's advertParticipation array
        console.log(
          "🚀 INVITATION ACCEPTANCE: Adding advert to user participation"
        );
        addAdvertParticipation(advert);

        // Join the advert's chat room immediately
        if (isChatConnected) {
          console.log(
            "🚀 INVITATION ACCEPTANCE: Chat connected, joining room immediately"
          );
          joinSingleAdvertChatRoom(advertId);
        } else {
          console.log(
            "🚀 INVITATION ACCEPTANCE: Chat not connected, will join when connection is established"
          );
        }

        // Immediate redirect to advert detail page
        console.log(
          "🚀 INVITATION ACCEPTANCE: Redirecting to advert detail page"
        );
        console.log(
          "🚀 INVITATION ACCEPTANCE: Target URL:",
          `/advert-detail/${advertId}`
        );

        // Use immediate navigation
        navigate(`/advert-detail/${advertId}`, { replace: true });

        console.log("🚀 INVITATION ACCEPTANCE: Navigation command executed");
      } else {
        console.error(
          "🚀 INVITATION ACCEPTANCE: Missing advert data or advert._id in response:",
          data
        );
      }

      // Update local state - move from current to old if we're in current filter
      if (activeFilter === "current") {
        // Remove from current view since it's no longer pending
        setInvitations((prevInvitations) => {
          const updatedInvitations = prevInvitations.filter(
            (inv) => inv._id !== invitationId
          );

          // Update unseen count
          const unseenCount = calculateCurrentUnseenCount(updatedInvitations);

          return updatedInvitations;
        });
        // Update pagination count
        setPagination((prev) => ({
          ...prev,
          total: Math.max(0, prev.total - 1),
        }));
      } else {
        // If we're in "old" view, update the status
        setInvitations((prevInvitations) => {
          const updatedInvitations = prevInvitations.map((inv) =>
            inv._id === invitationId
              ? {
                  ...inv,
                  status: "accepted",
                  respondedAt: new Date().toISOString(),
                }
              : inv
          );

          // Update unseen count
          const unseenCount = calculateCurrentUnseenCount(updatedInvitations);

          return updatedInvitations;
        });
      }

      // Refresh global unseen invitations count (for sidebar badge)
      if (activeSection === "incoming") {
        decrementUnseenInvitationsCount();
      }

      // Success notification will be shown on the advert detail page
    } catch (err) {
      console.error("Error accepting invitation:", err);

      // Show error notification
      const errorMessage = translateMessage(err.message);
      showNotification(errorMessage, "error");
    }
  };

  // Handle revoke invitation
  const handleRevokeInvitation = async (invitationId) => {
    try {
      console.log("🚀 REVOKE INVITATION: Revoking invitation:", invitationId);

      // Find the invitation to get recipient info
      const invitation = invitations.find((inv) => inv._id === invitationId);
      if (!invitation || !invitation.recipient?._id) {
        showNotification("Davet bilgileri bulunamadı", "error");
        return;
      }

      console.log(
        "🚀 REVOKE INVITATION: Found invitation:",
        invitationId,
        "Recipient:",
        invitation.recipient._id
      );

      // Make API call to revoke invitation
      const response = await fetch(
        `/api/v1/invitation/revoke/${invitationId}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            recipient: invitation.recipient._id, // The recipient field expects recipient's ID for notification
          }),
        }
      );

      if (!response.ok) {
        let errorMessage = "Davet geri çekilemedi";

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
              errorMessage = "Yetki hatası";
              break;
            case 403:
              errorMessage = "Bu işlemi yapma yetkiniz yok";
              break;
            case 404:
              errorMessage = "Davet bulunamadı";
              break;
            case 429:
              errorMessage = "Çok fazla istek";
              break;
            case 500:
              errorMessage = "Sunucu hatası";
              break;
            default:
              errorMessage = `Sunucu hatası: ${response.status}`;
          }
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log(
        "🚀 REVOKE INVITATION: Invitation revoked successfully:",
        data.inviteId
      );

      // Update local state - move from current to old if we're in current filter
      if (activeFilter === "current") {
        // Remove from current view since it's no longer pending
        setInvitations((prevInvitations) =>
          prevInvitations.filter((inv) => inv._id !== invitationId)
        );
        // Update pagination count
        setPagination((prev) => ({
          ...prev,
          total: Math.max(0, prev.total - 1),
        }));
      } else {
        // If we're in "old" view, update the status
        setInvitations((prevInvitations) =>
          prevInvitations.map((inv) =>
            inv._id === invitationId
              ? {
                  ...inv,
                  status: "cancelled",
                  respondedAt: new Date().toISOString(),
                }
              : inv
          )
        );
      }

      // Show success notification
      showNotification("Davet başarıyla geri çekildi", "success");

      console.log("🚀 REVOKE INVITATION: Local state updated successfully");
    } catch (err) {
      console.error("🚀 REVOKE INVITATION: Error revoking invitation:", err);

      // Show error notification
      const errorMessage = translateMessage(err.message);
      showNotification(errorMessage, "error");
    }
  };

  // Handle decline invitation
  const handleDecline = async (invitationId) => {
    try {
      // Find the invitation to get sender info
      const invitation = invitations.find((inv) => inv._id === invitationId);
      if (!invitation || !invitation.sender?._id) {
        showNotification("Davet bilgileri bulunamadı", "error");
        return;
      }

      console.log(
        "Declining invitation:",
        invitationId,
        "Sender:",
        invitation.sender._id
      );

      // Make API call to decline invitation
      const response = await fetch(
        `/api/v1/invitation/reject/${invitationId}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            recipient: invitation.sender._id, // The recipient field expects sender's ID for notification
          }),
        }
      );

      if (!response.ok) {
        let errorMessage = "Davet reddedilemedi";

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
              errorMessage = "Yetki hatası";
              break;
            case 403:
              errorMessage = "Bu işlemi yapma yetkiniz yok";
              break;
            case 404:
              errorMessage = "Davet bulunamadı";
              break;
            case 429:
              errorMessage = "Çok fazla istek";
              break;
            case 500:
              errorMessage = "Sunucu hatası";
              break;
            default:
              errorMessage = `Sunucu hatası: ${response.status}`;
          }
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Invitation declined successfully:", data.inviteId);

      // Update local state - move from current to old if we're in current filter
      if (activeFilter === "current") {
        // Remove from current view since it's no longer pending
        setInvitations((prevInvitations) => {
          const updatedInvitations = prevInvitations.filter(
            (inv) => inv._id !== invitationId
          );

          // Update unseen count
          const unseenCount = calculateCurrentUnseenCount(updatedInvitations);

          return updatedInvitations;
        });
        // Update pagination count
        setPagination((prev) => ({
          ...prev,
          total: Math.max(0, prev.total - 1),
        }));
      } else {
        // If we're in "old" view, update the status
        setInvitations((prevInvitations) => {
          const updatedInvitations = prevInvitations.map((inv) =>
            inv._id === invitationId
              ? {
                  ...inv,
                  status: "declined",
                  respondedAt: new Date().toISOString(),
                }
              : inv
          );

          // Update unseen count
          const unseenCount = calculateCurrentUnseenCount(updatedInvitations);

          return updatedInvitations;
        });
      }

      // Refresh global unseen invitations count (for sidebar badge)
      if (activeSection === "incoming") {
        decrementUnseenInvitationsCount();
      }

      // Show success notification
      showNotification("Davet başarıyla reddedildi", "success");
    } catch (err) {
      console.error("Error declining invitation:", err);

      // Show error notification
      const errorMessage = translateMessage(err.message);
      showNotification(errorMessage, "error");
    }
  };

  // Filter invitations based on section and status
  const filteredInvitations = invitations.filter((invitation) => {
    // Filter based on current/old status
    if (activeFilter === "current") {
      return invitation.status === "pending";
    } else if (activeFilter === "old") {
      return ["accepted", "declined", "cancelled", "expired"].includes(
        invitation.status
      );
    }
    return true;
  });

  // Use backend pagination
  const paginatedInvitations = filteredInvitations;

  // Reset pagination and unseen count when filter or section changes
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [activeFilter, activeSection]);

  // Track if user is viewing "Gelen Davetler" "Güncel" for real-time unseen count updates
  useEffect(() => {
    const isViewingIncomingCurrent =
      activeSection === "incoming" && activeFilter === "current";

    setCurrentlyViewingIncomingInvitations(isViewingIncomingCurrent);

    // Cleanup when component unmounts
    return () => {
      setCurrentlyViewingIncomingInvitations(false);
    };
  }, [activeSection, activeFilter, setCurrentlyViewingIncomingInvitations]);

  // Mark invitations as seen when user views "Gelen Davetler" sections
  useEffect(() => {
    // Only mark as seen if user is viewing incoming invitations
    if (activeSection === "incoming" && authUser?._id) {
      let statuses = [];

      if (activeFilter === "current") {
        // Mark pending invitations as seen for "Güncel"
        statuses = ["pending"];
      } else if (activeFilter === "old") {
        // Mark old invitations as seen for "Geçmiş"
        statuses = ["accepted", "declined", "expired", "cancelled"];
      }

      if (statuses.length > 0) {
        console.log(`Marking ${activeFilter} invitations as seen...`);
        markInvitationsAsSeen(statuses);
      }
    }
  }, [activeSection, activeFilter, authUser?._id]);

  // Get role display text
  const getRoleText = (role) => {
    switch (role) {
      case "player":
        return "Oyuncu";
      case "goalkeeper":
        return "Kaleci";
      default:
        return role || "Oyuncu";
    }
  };

  // Format date and time
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("tr-TR"),
      time: date.toLocaleTimeString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  // Format start time with end time (1 hour later)
  const formatGameTime = (startTime) => {
    const start = new Date(startTime);
    const end = new Date(start.getTime() + 60 * 60 * 1000); // Add 1 hour
    return {
      date: start.toLocaleDateString("tr-TR"),
      time: `${start.toLocaleTimeString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
      })}-${end.toLocaleTimeString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
      })}`,
    };
  };

  // Calculate statistics for current filter
  const stats = {
    current: invitations.filter((inv) => inv.status === "pending").length,
    old: invitations.filter((inv) =>
      ["accepted", "declined", "cancelled", "expired"].includes(inv.status)
    ).length,
    total: invitations.length,
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Veriler Yüklenemedi
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 md:p-6">
      <h2 className="text-lg sm:text-xl text-center font-bold text-gray-900 mb-2 sm:mb-0">
        Davetlerim
      </h2>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6">
        <div className="text-xs sm:text-sm text-gray-500 flex justify-end">
          Toplam {pagination.total}{" "}
          {activeSection === "incoming" ? "gelen davet" : "gönderilen davet"}
        </div>
      </div>

      {/* Section Navigation */}
      <div className="flex justify-center gap-3 mb-6">
        <button
          onClick={() => setActiveSection("incoming")}
          className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer ${
            activeSection === "incoming"
              ? "bg-green-600 text-white shadow-md"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <span>Gelen Davetler</span>
          {/* Show unseen count badge for incoming invitations when not viewing that section */}
          {activeSection !== "incoming" && getUnseenInvitationsCount() > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center ml-2">
              {getUnseenInvitationsCount()}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSection("sent")}
          className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer ${
            activeSection === "sent"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
            />
          </svg>
          <span>Gönderilen Davetler</span>
        </button>
      </div>

      {/* Loading Display */}
      {loading && invitations.length === 0 && (
        <div className="mb-6 text-center py-8">
          <div className="inline-flex items-center">
            <svg
              className="animate-spin h-5 w-5 text-green-600 mr-2"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span className="text-gray-600">Davetler yükleniyor...</span>
          </div>
        </div>
      )}

      {/* Tabs - Current/Old filter */}
      <div className="flex flex-wrap justify-center gap-1 mb-4 sm:mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveFilter("current")}
          className={`flex items-center justify-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap hover:cursor-pointer ${
            activeFilter === "current"
              ? "bg-white text-green-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <span>Güncel</span>
        </button>
        <button
          onClick={() => setActiveFilter("old")}
          className={`flex items-center justify-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap hover:cursor-pointer ${
            activeFilter === "old"
              ? "bg-white text-green-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <span>Geçmiş</span>
        </button>
      </div>

      {/* Invitations List - MyReservations style */}
      <div className="space-y-3 sm:space-y-4">
        {paginatedInvitations.map((invitation) => {
          const gameTime = formatGameTime(
            invitation.advert?.startsAt || new Date().toISOString()
          );
          const senderName = invitation.sender?.name || "Bilinmeyen Kullanıcı";
          const pitchName = invitation.advert?.pitch?.name || "Saha";
          const advertName = invitation.advert?.name || "İlan";
          const district =
            invitation.advert?.pitch?.location?.address?.district ||
            "Bilinmeyen";
          const city =
            invitation.advert?.pitch?.location?.address?.city || "İstanbul";
          const totalPlayers =
            invitation.advert?.pitch?.specifications?.recommendedCapacity
              ?.players || 14;
          const hourlyRate = invitation.advert?.pitch?.pricing?.hourlyRate || 0;
          const currency = invitation.advert?.pitch?.pricing?.currency || "TRY";
          const pricePerPerson =
            totalPlayers > 0 ? Math.round(hourlyRate / totalPlayers) : 0;

          // Get status info for display
          const getStatusInfo = (status) => {
            switch (status) {
              case "pending":
                return {
                  text: "Beklemede",
                  icon: "⏳",
                  bgColor: "bg-yellow-100",
                  textColor: "text-yellow-700",
                };
              case "accepted":
                return {
                  text: "Kabul Edildi",
                  icon: "✅",
                  bgColor: "bg-green-100",
                  textColor: "text-green-700",
                };
              case "declined":
                return {
                  text: "Reddedildi",
                  icon: "❌",
                  bgColor: "bg-red-100",
                  textColor: "text-red-700",
                };
              case "cancelled":
                return {
                  text: "İptal Edildi",
                  icon: "🚫",
                  bgColor: "bg-gray-100",
                  textColor: "text-gray-700",
                };
              case "expired":
                return {
                  text: "Süresi Dolmuş",
                  icon: "⏰",
                  bgColor: "bg-gray-100",
                  textColor: "text-gray-700",
                };
              default:
                return {
                  text: status || "Bilinmeyen",
                  icon: "❓",
                  bgColor: "bg-gray-100",
                  textColor: "text-gray-700",
                };
            }
          };

          const statusInfo = getStatusInfo(invitation.status);

          return (
            <div
              key={invitation._id}
              className="relative border-2 border-gray-200 rounded-lg p-4 sm:p-4 md:p-5 lg:p-6 shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden"
              style={{
                backgroundImage: "url(/images/mesajlaşma.png)",
                backgroundSize: "100% 100%",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            >
              {/* Very light overlay for readability */}
              <div className="absolute inset-0 bg-white/80 rounded-lg"></div>
              {/* Content */}
              <div className="relative z-10">
                <div className="mb-4 sm:mb-3">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-3 sm:mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-base sm:text-lg">
                        {advertName} - {pitchName}
                      </h3>
                      <hr className="border-gray-300 mt-1 mb-2" />

                      {/* Saha ve Konum Bilgisi */}
                      <div className="flex flex-col gap-2 mb-3">
                        <div className="flex items-center space-x-2">
                          <svg
                            className="w-3 h-3 sm:w-4 sm:h-4 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                          <span className="text-sm text-gray-600 font-medium">
                            📍 {district}, {city}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <svg
                            className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                          <span className="text-sm text-gray-600 font-medium">
                            👥 {totalPlayers} Kişilik Oyun
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <svg
                            className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                            />
                          </svg>
                          <span className="text-sm font-bold text-green-600">
                            💰 {pricePerPerson} {currency} / Kişi
                          </span>
                        </div>
                      </div>

                      {/* Tarih ve Saat */}
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 text-sm sm:text-base font-semibold text-gray-700 italic">
                        <div className="flex items-center space-x-1">
                          <svg
                            className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span>{gameTime.date}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <svg
                            className="w-3 h-3 sm:w-4 sm:h-4 text-green-600"
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
                          <span>{gameTime.time}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col lg:items-end space-y-2 mt-3 lg:mt-0">
                      {invitation.seen && (
                        <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                          ✅ Görüldü
                        </span>
                      )}
                      {invitation.respondedAt && (
                        <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                          📅 Ödendi:{" "}
                          {formatDateTime(invitation.respondedAt).date}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sender/Receiver and Message Info */}
                <div className="mb-3 sm:mb-3 flex flex-col space-y-3 sm:space-y-2">
                  <div className="flex items-center space-x-2">
                    {/* Profile Picture */}
                    {activeSection === "incoming" ? (
                      // Show sender's profile picture for incoming invitations
                      invitation.sender?.profilePicture?.url ? (
                        <img
                          src={invitation.sender.profilePicture.url}
                          alt={senderName}
                          className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-semibold">
                          {senderName
                            ? senderName.charAt(0).toUpperCase()
                            : "?"}
                        </div>
                      )
                    ) : // Show recipient's profile picture for sent invitations
                    invitation.recipient?.profilePicture?.url ? (
                      <img
                        src={invitation.recipient.profilePicture.url}
                        alt={
                          invitation.recipient?.name || "Bilinmeyen Kullanıcı"
                        }
                        className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-semibold">
                        {invitation.recipient?.name
                          ? invitation.recipient.name.charAt(0).toUpperCase()
                          : "?"}
                      </div>
                    )}
                    <span className="font-semibold text-gray-600 text-sm sm:text-base">
                      {activeSection === "incoming"
                        ? `Gönderen: ${senderName}`
                        : `Alıcı: ${
                            invitation.recipient?.name || "Bilinmeyen Kullanıcı"
                          }`}
                    </span>
                  </div>

                  {invitation.message && (
                    <div className="mb-3 p-2 sm:mb-3 mx-0 p-3 sm:p-2 bg-blue-50/60 rounded-lg border-l-4 border-blue-400/70">
                      <p className="text-xs sm:text-sm text-blue-700">
                        <span className="font-medium">Mesaj:</span>{" "}
                        {invitation.message}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap sm:flex-nowrap gap-2 sm:space-x-2 justify-start sm:justify-end">
                    {/* Gelen Davetler için Onay/Red butonları */}
                    {activeSection === "incoming" &&
                      invitation.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleAccept(invitation._id)}
                            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 hover:cursor-pointer transition-colors flex-1 sm:flex-none"
                          >
                            Kabul Et
                          </button>
                          <button
                            onClick={() => handleDecline(invitation._id)}
                            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 hover:cursor-pointer transition-colors flex-1 sm:flex-none"
                          >
                            Reddet
                          </button>
                        </>
                      )}

                    {/* Gönderilen Davetler için Geri Çekme butonu */}
                    {activeSection === "sent" &&
                      invitation.status === "pending" && (
                        <button
                          onClick={() => handleRevokeInvitation(invitation._id)}
                          className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-white bg-orange-600 rounded-lg hover:bg-orange-700 hover:cursor-pointer transition-colors flex-1 sm:flex-none"
                        >
                          Davet Geri Çek
                        </button>
                      )}

                    {/* Diğer durumlar için sadece durum gösterimi */}
                    {(activeSection === "incoming" ||
                      invitation.status !== "pending") && (
                      <div
                        className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg ${statusInfo.bgColor} ${statusInfo.textColor}`}
                      >
                        {statusInfo.icon} {statusInfo.text}
                        {invitation.status === "pending" &&
                          activeSection === "sent" && (
                            <span className="ml-2 text-xs">
                              (Cevap Bekleniyor)
                            </span>
                          )}
                      </div>
                    )}
                  </div>
                </div>
              </div>{" "}
              {/* Content wrapper end */}
            </div>
          );
        })}
      </div>

      {/* Load More Button - Backend pagination (only for sent invitations) */}
      {activeSection === "sent" &&
        pagination.totalPages > 1 &&
        paginatedInvitations.length > 0 &&
        invitations.length < pagination.total && (
          <div className="mt-4 sm:mt-6 text-center">
            <button
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
              }
              disabled={loading}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              style={{
                backgroundColor: "rgb(0, 128, 0)",
                borderRadius: "6px",
              }}
              onMouseEnter={(e) => {
                if (!loading) e.target.style.backgroundColor = "rgb(0, 100, 0)";
              }}
              onMouseLeave={(e) => {
                if (!loading) e.target.style.backgroundColor = "rgb(0, 128, 0)";
              }}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-3 w-3 sm:h-4 sm:w-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Yükleniyor...
                </div>
              ) : (
                `Daha Fazla Göster (${
                  pagination.total - invitations.length
                } kaldı)`
              )}
            </button>
          </div>
        )}

      {/* Empty State */}
      {filteredInvitations.length === 0 && !loading && (
        <div className="text-center py-6 sm:py-8">
          <svg
            className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {activeSection === "incoming" ? "Gelen davet" : "Gönderilen davet"}{" "}
            bulunamadı
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            {activeFilter === "current"
              ? activeSection === "incoming"
                ? "Henüz hiç güncel gelen davet almamışsınız."
                : "Henüz hiç güncel davet göndermemişsiniz."
              : activeSection === "incoming"
              ? "Geçmiş gelen davet bulunamadı."
              : "Geçmiş gönderilen davet bulunamadı."}
          </p>
        </div>
      )}

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

export default Invitations;
