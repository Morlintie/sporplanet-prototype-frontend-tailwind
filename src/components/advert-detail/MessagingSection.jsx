import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import ShareLinkPopup from "../shared/ShareLinkPopup";
import FriendInvitePopup from "../shared/FriendInvitePopup";
import Notification from "../shared/Notification";

function MessagingSection({
  messages,
  advertId,
  onRefreshMessages,
  advert,
  userParticipationStatus,
  isBlurred,
  messagesLoading = false,
  determiningStatus = false,
}) {
  const [newMessage, setNewMessage] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const { user, getUserFriends } = useAuth();

  // Share dropdown states
  const [showShareDropdown, setShowShareDropdown] = useState(false);

  // Share link popup states
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [privateLink, setPrivateLink] = useState("");
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [linkError, setLinkError] = useState(null);

  // Friend invite popup states
  const [showFriendInvitePopup, setShowFriendInvitePopup] = useState(false);
  const [isSendingInvites, setIsSendingInvites] = useState(false);

  // Notification states
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState("success");

  // Notification helpers
  const showNotificationMessage = (message, type = "success") => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
  };

  const handleCloseNotification = () => {
    setShowNotification(false);
  };

  // Handle click outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowShareDropdown(false);
      }
    };

    if (showShareDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showShareDropdown]);

  // Get user's friends
  const friends = getUserFriends() || [];

  // Check if current user is admin (creator or in adminAdvert array)
  const isCurrentUserAdmin = () => {
    if (!user || !advert) return false;

    // Check if user is the creator
    if (advert.createdBy && advert.createdBy._id === user._id) {
      return true;
    }

    // Check if user is in adminAdvert array
    if (advert.adminAdvert && Array.isArray(advert.adminAdvert)) {
      return advert.adminAdvert.some((adminId) => adminId === user._id);
    }

    return false;
  };

  // Handle share dropdown toggle
  const handleShareDropdownToggle = () => {
    setShowShareDropdown(!showShareDropdown);
  };

  // Handle private link generation
  const handleGeneratePrivateLink = async () => {
    setShowShareDropdown(false); // Close dropdown
    try {
      setIsGeneratingLink(true);
      setLinkError(null);
      setShowSharePopup(true);

      console.log("Generating private link for advert:", advert._id);

      const response = await fetch(
        `/api/v1/advert/private-link/${advert._id}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Handle specific error cases with Turkish translations
        if (response.status === 400) {
          throw new Error("Geçersiz istek");
        } else if (response.status === 401) {
          throw new Error("Oturum açmanız gerekiyor");
        } else if (response.status === 403) {
          if (
            errorData.msg &&
            errorData.msg.includes(
              "You are not allowed to generate private link"
            )
          ) {
            throw new Error(
              "Bu ilan için özel bağlantı oluşturma yetkiniz yok"
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
        } else {
          throw new Error(
            errorData.msg || "Özel bağlantı oluşturulurken hata oluştu"
          );
        }
      }

      const result = await response.json();
      console.log("Private link generation response:", result);

      // Generate the private link URL
      const baseUrl = window.location.origin;
      const generatedLink = `${baseUrl}/wait/advert/?date=${encodeURIComponent(
        result.date
      )}&id=${encodeURIComponent(result.id)}`;

      setPrivateLink(generatedLink);
    } catch (err) {
      console.error("Error generating private link:", err);
      setLinkError(err.message);
    } finally {
      setIsGeneratingLink(false);
    }
  };

  // Handle copy to clipboard
  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(privateLink);
      showNotificationMessage(
        "Bağlantı başarıyla panoya kopyalandı",
        "success"
      );
      setShowSharePopup(false);
    } catch (clipboardErr) {
      console.error("Failed to copy to clipboard:", clipboardErr);
      showNotificationMessage("Panoya kopyalama başarısız oldu", "error");
    }
  };

  // Handle share popup close
  const handleCloseSharePopup = () => {
    setShowSharePopup(false);
    setPrivateLink("");
    setLinkError(null);
    setIsGeneratingLink(false);
  };

  // Handle friend invite popup open
  const handleOpenFriendInvite = () => {
    setShowShareDropdown(false); // Close dropdown
    setShowFriendInvitePopup(true);
  };

  // Handle friend invite popup close
  const handleCloseFriendInvite = () => {
    setShowFriendInvitePopup(false);
    setIsSendingInvites(false);
  };

  // Handle sending friend invites (placeholder for now)
  const handleSendFriendInvites = async (selectedFriends) => {
    try {
      setIsSendingInvites(true);

      // TODO: Implement backend call to send friend invites
      console.log("Sending invites to friends:", selectedFriends);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      showNotificationMessage(
        `${selectedFriends.length} arkadaşa davet gönderildi`,
        "success"
      );

      setShowFriendInvitePopup(false);
    } catch (error) {
      console.error("Error sending friend invites:", error);
      showNotificationMessage("Davet gönderilirken hata oluştu", "error");
    } finally {
      setIsSendingInvites(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatMessageDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Bugün";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Dün";
    } else {
      return date.toLocaleDateString("tr-TR");
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    // Silent return if both message and attachments are empty
    if (!newMessage.trim() && attachments.length === 0) {
      return;
    }

    if (sending) return;

    // Check if user is participant
    if (userParticipationStatus !== "participant") {
      showNotificationMessage(
        "Sadece katılımcılar mesaj gönderebilir",
        "error"
      );
      return;
    }

    try {
      setSending(true);

      // Prepare request body according to backend expectations
      const requestBody = {};

      if (attachments.length > 0) {
        // Send attachments with caption (text from input field as caption)
        requestBody.attachments = {
          caption: newMessage.trim() || "", // Text from "Mesajınızı yazın" field as caption (can be empty)
          items: attachments.map((att) => ({
            content: att.content, // base64 data only
          })),
        };
        // Don't send content field when sending attachments
      } else if (newMessage.trim()) {
        // Send only content (no attachments) - text from input field
        requestBody.content = newMessage.trim();
      } else {
        // Silent return for empty text messages (no error shown, as per requirement)
        setSending(false);
        return;
      }

      console.log("Sending message to backend:", requestBody);

      const response = await fetch(`/api/v1/advert-chat/send/${advertId}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 404) {
          throw new Error("İlan bulunamadı");
        } else if (response.status === 401) {
          throw new Error("Yetkisiz erişim");
        } else if (response.status === 403) {
          throw new Error("Bu işlemi gerçekleştirme yetkiniz yok");
        } else if (response.status === 400) {
          if (
            errorData.msg &&
            errorData.msg.includes("You are not a participant")
          ) {
            throw new Error("Bu ilanın katılımcısı değilsiniz");
          } else if (
            errorData.msg &&
            errorData.msg.includes("Please provide content or attachments")
          ) {
            throw new Error("Mesaj içeriği veya dosya eklemelisiniz");
          } else if (
            errorData.msg &&
            errorData.msg.includes("Please provide required data")
          ) {
            throw new Error("Gerekli bilgileri sağlayın");
          } else if (
            errorData.msg &&
            errorData.msg.includes(
              "You can not send both content and attachments at the same time"
            )
          ) {
            throw new Error("Hem metin hem de dosya aynı anda gönderilemez");
          } else if (
            errorData.msg &&
            errorData.msg.includes("Please provide content")
          ) {
            throw new Error("Mesaj içeriği boş olamaz");
          } else if (
            errorData.msg &&
            errorData.msg.includes("File size exceeds 100MB limit")
          ) {
            throw new Error("Dosya boyutu 100MB limitini aşıyor");
          } else if (
            errorData.msg &&
            errorData.msg.includes(
              "Attachments must be an array with at least one item"
            )
          ) {
            throw new Error("Eklenen dosyalar geçersiz format");
          } else {
            throw new Error("Geçersiz istek");
          }
        } else {
          throw new Error(errorData.msg || `Sunucu hatası: ${response.status}`);
        }
      }

      const result = await response.json();
      console.log("Message sent successfully:", result);

      // Show success notification
      showNotificationMessage("Mesaj başarıyla gönderildi", "success");

      // Clear form
      setNewMessage("");
      setAttachments([]);

      // Note: No need to refresh messages manually since WebSocket 'newMessage' event
      // will handle real-time updates automatically

      // Force scroll to bottom after message is sent
      setTimeout(() => {
        scrollToBottom();
      }, 200);
    } catch (err) {
      console.error("Error sending message:", err);

      // Translate error message to Turkish
      const translateError = (message) => {
        if (message.includes("İlan bulunamadı")) return "İlan bulunamadı";
        if (message.includes("Yetkisiz erişim")) return "Yetkisiz erişim";
        if (message.includes("Bu işlemi gerçekleştirme yetkiniz yok"))
          return "Bu işlemi gerçekleştirme yetkiniz yok";
        if (message.includes("Bu ilanın katılımcısı değilsiniz"))
          return "Bu ilanın katılımcısı değilsiniz";
        if (message.includes("Mesaj içeriği boş olamaz"))
          return "Mesaj içeriği boş olamaz";
        if (message.includes("Geçersiz istek")) return "Geçersiz istek";
        if (message.includes("Failed to fetch"))
          return "Sunucuya bağlanılamadı";
        if (message.includes("Network Error")) return "Ağ bağlantısı hatası";
        return message || "Mesaj gönderilirken hata oluştu";
      };

      const translatedError = translateError(err.message);
      showNotificationMessage(translatedError, "error");
    } finally {
      setSending(false);
    }
  };

  // Convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Keep the full data URL format (data:type/subtype;base64,xxxxx)
        resolve(reader.result);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      const newAttachments = [];

      for (const file of files) {
        // Check file size (100MB limit as per backend)
        if (file.size > 100 * 1024 * 1024) {
          showNotificationMessage(
            `Dosya "${file.name}" 100MB limitini aşıyor`,
            "error"
          );
          continue;
        }

        const base64Content = await fileToBase64(file);
        const fileData = {
          content: base64Content,
          name: file.name,
          mimeType: file.type,
          size: file.size,
          url: URL.createObjectURL(file), // For preview only
        };

        newAttachments.push(fileData);
      }

      // Replace existing attachments with new ones
      setAttachments(newAttachments);
    } catch (error) {
      console.error("Error converting files to base64:", error);
      showNotificationMessage("Dosya işlenirken hata oluştu", "error");
    }
  };

  const removeAttachment = (index) => {
    if (index !== undefined) {
      // Remove specific attachment
      setAttachments((prev) => prev.filter((_, i) => i !== index));
    } else {
      // Remove all attachments
      setAttachments([]);
    }

    // Clear file input if no attachments left
    if (
      fileInputRef.current &&
      (index === undefined || attachments.length === 1)
    ) {
      fileInputRef.current.value = "";
    }
  };

  const getMessageTypeIcon = (type) => {
    switch (type) {
      case "image":
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "video":
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "system":
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatMessageDate(message.createdAt);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  const isCurrentUser = (senderId) => {
    // Handle both cases: senderId as string or message.sender as object with _id
    const actualSenderId =
      typeof senderId === "string" ? senderId : senderId?._id;
    const isMatch = user && user._id === actualSenderId;

    // Debug logging
    console.log("isCurrentUser check:", {
      currentUserId: user?._id,
      senderId: senderId,
      actualSenderId: actualSenderId,
      isMatch: isMatch,
    });

    return isMatch;
  };

  return (
    <div
      className={`h-full flex flex-col ${
        isBlurred ? "pointer-events-none" : ""
      }`}
    >
      {/* Header */}
      <div
        className="text-white py-3 px-4 sticky top-0 z-10 shadow-lg"
        style={{ backgroundImage: "linear-gradient(135deg, #065f46, #10b981)" }}
      >
        <div className="text-left">
          <h2 className="text-lg font-bold leading-tight mb-1">
            {advert?.name || "İlan Sohbeti"}
          </h2>
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4 messages-container"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.85), rgba(255,255,255,0.85)), url('https://res.cloudinary.com/dyepiphy8/image/upload/v1755275577/ChatGPT_Image_Aug_15_2025_07_32_40_PM_jhshte.png')",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-gray-500">
            {determiningStatus ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-lg mb-2">Durum belirleniyor...</p>
                <p className="text-sm">
                  Mesaj erişim durumunuz kontrol ediliyor
                </p>
              </div>
            ) : messagesLoading && userParticipationStatus === "participant" ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                <p className="text-lg mb-2">Mesajlar yükleniyor...</p>
                <p className="text-sm">Sohbet geçmişi getiriliyor</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-lg mb-2">Henüz mesaj yok</p>
                <p className="text-sm">
                  İlk mesajı siz gönderip sohbeti başlatabilirsiniz!
                </p>
              </div>
            )}
          </div>
        )}
        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <div key={date}>
            {/* Date separator */}
            <div className="flex items-center justify-center mb-4">
              <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                {date}
              </div>
            </div>

            {/* Messages for this date */}
            {dateMessages.map((message, index) => (
              <div key={index} className="mb-4">
                {message.type === "system" ? (
                  <div className="flex items-center justify-center mb-2">
                    <div className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full flex items-center space-x-1">
                      {getMessageTypeIcon(message.type)}
                      <span>{message.content}</span>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`flex items-end space-x-2 ${
                      isCurrentUser(message.sender)
                        ? "justify-end flex-row-reverse space-x-reverse"
                        : "justify-start"
                    }`}
                  >
                    {/* Profile picture */}
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {message.sender?.profilePicture?.url ? (
                        <img
                          src={message.sender.profilePicture.url}
                          alt={message.sender?.name || "User"}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <div
                        className={`w-full h-full flex items-center justify-center text-white font-semibold text-xs ${
                          message.sender?.profilePicture?.url
                            ? "hidden"
                            : "flex"
                        }`}
                      >
                        {message.sender?.name?.charAt(0)?.toUpperCase() ||
                          message.senderInfo?.name?.charAt(0)?.toUpperCase() ||
                          "?"}
                      </div>
                    </div>

                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        isCurrentUser(message.sender)
                          ? "bg-green-100 text-gray-800"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      {/* Sender name (only for non-current user messages) */}
                      {!isCurrentUser(message.sender) && (
                        <p className="text-xs text-gray-600 mb-1 font-medium">
                          {message.sender?.name ||
                            message.senderInfo?.name ||
                            "Kullanıcı"}
                        </p>
                      )}

                      {/* Message content */}
                      <div className="flex items-start space-x-2">
                        {message.type !== "text" && (
                          <div className="mt-1">
                            {getMessageTypeIcon(message.type)}
                          </div>
                        )}
                        <div className="flex-1">
                          {message.content && (
                            <p className="text-sm break-words whitespace-pre-wrap">
                              {message.content}
                            </p>
                          )}

                          {/* Attachments */}
                          {message.attachments && message.attachments.items && (
                            <div className="mt-2">
                              {/* Render each attachment item */}
                              {message.attachments.items.map((item, idx) => (
                                <div key={idx} className="mb-2">
                                  {/* Check mimeType to decide how to display */}
                                  {item.mimeType === "image/png" ||
                                  item.mimeType === "image/jpeg" ||
                                  item.mimeType === "image/gif" ||
                                  item.mimeType === "image/webp" ? (
                                    // Display as image
                                    <img
                                      src={item.url}
                                      alt={item.name}
                                      className="max-w-full h-auto rounded-lg"
                                    />
                                  ) : item.mimeType === "video/mp4" ||
                                    item.mimeType === "video/webm" ||
                                    item.mimeType === "video/ogg" ? (
                                    // Display as video
                                    <video
                                      src={item.url}
                                      controls
                                      className="max-w-full h-auto rounded-lg"
                                    />
                                  ) : (
                                    // Display as file icon for other types
                                    <div className="flex items-center space-x-2 p-3 bg-gray-100 rounded-lg">
                                      <svg
                                        className="w-8 h-8 text-gray-500"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                      <div className="flex-1">
                                        <a
                                          href={item.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-xs text-blue-600 hover:text-blue-800 block truncate max-w-xs"
                                          title={item.url}
                                        >
                                          {item.url.length > 50
                                            ? `${item.url.substring(0, 50)}...`
                                            : item.url}
                                        </a>
                                      </div>
                                      <a
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                      >
                                        İndir
                                      </a>
                                    </div>
                                  )}
                                </div>
                              ))}

                              {/* Caption displayed normally (not italic) */}
                              {message.attachments.caption && (
                                <p className="text-sm mt-2">
                                  {message.attachments.caption}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Time */}
                      <div
                        className={`text-xs mt-1 ${
                          isCurrentUser(message.sender)
                            ? "text-green-100"
                            : "text-gray-500"
                        }`}
                      >
                        {formatMessageTime(message.createdAt)}
                        {message.archived && (
                          <span className="ml-2 opacity-60">(Arşivlendi)</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input - only show if not blurred */}
      {!isBlurred && (
        <div className="border-t bg-white p-4">
          {/* Attachment preview */}
          {attachments.length > 0 && (
            <div className="mb-3 p-3 bg-gray-50 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 font-medium">
                  Ekler ({attachments.length})
                </span>
                <button
                  onClick={() => removeAttachment()}
                  className="text-red-500 hover:text-red-700 text-xs"
                >
                  Tümünü Kaldır
                </button>
              </div>

              <div className="space-y-2 max-h-32 overflow-y-auto">
                {attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-white p-2 rounded border"
                  >
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      {/* File type icon */}
                      <div className="flex-shrink-0">
                        {attachment.mimeType.startsWith("image/") ? (
                          <img
                            src={attachment.url}
                            alt={attachment.name}
                            className="w-8 h-8 object-cover rounded"
                          />
                        ) : attachment.mimeType.startsWith("video/") ? (
                          <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-blue-600"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                            </svg>
                          </div>
                        ) : (
                          <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-gray-600"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* File info */}
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-xs text-gray-800 truncate"
                          title={attachment.name}
                        >
                          {attachment.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(attachment.size / (1024 * 1024)).toFixed(1)} MB
                        </p>
                      </div>
                    </div>

                    {/* Remove individual file */}
                    <button
                      onClick={() => removeAttachment(index)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <form
            onSubmit={handleSendMessage}
            className="flex items-center space-x-2"
          >
            <div className="flex-1">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Mesajınızı yazın..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                rows="1"
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
            </div>

            {/* Share dropdown - only show for admins */}
            {isCurrentUserAdmin() && (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={handleShareDropdownToggle}
                  className="p-2 text-green-500 hover:text-green-700 transition-colors"
                  title="Paylaş"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {/* Dropdown menu */}
                {showShareDropdown && (
                  <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[200px]">
                    {/* Private Link Option */}
                    <button
                      onClick={handleGeneratePrivateLink}
                      className="w-full px-4 py-2 text-left text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors flex items-center space-x-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm">Özel Bağlantı Oluştur</span>
                    </button>

                    {/* Friend Invite Option */}
                    <button
                      onClick={handleOpenFriendInvite}
                      className="w-full px-4 py-2 text-left text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm">Arkadaş Davet Et</span>
                      <span className="text-xs text-gray-500 ml-auto">
                        ({friends.length})
                      </span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* File attachment button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*,.pdf,.doc,.docx,.txt"
              onChange={handleFileSelect}
              className="hidden"
              multiple
            />

            {/* Send button */}
            <button
              type="submit"
              disabled={
                (!newMessage.trim() && attachments.length === 0) || sending
              }
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 min-w-[100px]"
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span className="text-sm">Gönderiliyor</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                  <span className="text-sm">Gönder</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Share Link Popup */}
      <ShareLinkPopup
        isVisible={showSharePopup}
        onClose={handleCloseSharePopup}
        privateLink={privateLink}
        onCopyToClipboard={handleCopyToClipboard}
        isGenerating={isGeneratingLink}
        error={linkError}
      />

      {/* Friend Invite Popup */}
      <FriendInvitePopup
        isVisible={showFriendInvitePopup}
        onClose={handleCloseFriendInvite}
        friends={friends}
        onSendInvites={handleSendFriendInvites}
        isSending={isSendingInvites}
      />

      {/* Notification */}
      <Notification
        message={notificationMessage}
        type={notificationType}
        isVisible={showNotification}
        onClose={handleCloseNotification}
      />
    </div>
  );
}

export default MessagingSection;
