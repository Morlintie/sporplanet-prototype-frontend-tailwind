import { useRef, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";

// Helper function to get user initials for avatar fallback
const getInitials = (name) => {
  if (!name || typeof name !== "string") return "?";
  const cleanName = name.trim();
  if (!cleanName) return "?";

  const nameParts = cleanName.split(/[\s.]+/); // Split by space or dot
  if (nameParts.length >= 2) {
    return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
  }
  return cleanName[0]?.toUpperCase() || "?";
};

// Typing indicator component
function TypingIndicator({ typingUsers, advert }) {
  // Get user names from participant list based on typing user IDs
  const getTypingUserNames = () => {
    if (!advert || !advert.participants || !typingUsers) return [];

    const typingUserNames = [];

    typingUsers.forEach((userId) => {
      const participant = advert.participants.find(
        (p) => p.user && p.user._id === userId
      );
      if (participant) {
        typingUserNames.push(participant.user.name);
      }
    });

    return typingUserNames;
  };

  const typingUserNames = getTypingUserNames();

  if (typingUserNames.length === 0) return null;

  // Format typing text based on number of users
  const getTypingText = () => {
    if (typingUserNames.length === 1) {
      const name = typingUserNames[0];
      // Clip long names
      const clippedName =
        name.length > 15 ? `${name.substring(0, 15)}...` : name;
      return `${clippedName} yazıyor`;
    } else if (typingUserNames.length === 2) {
      const name1 = typingUserNames[0];
      const name2 = typingUserNames[1];
      // Clip long names
      const clippedName1 =
        name1.length > 10 ? `${name1.substring(0, 10)}...` : name1;
      const clippedName2 =
        name2.length > 10 ? `${name2.substring(0, 10)}...` : name2;
      return `${clippedName1} ve ${clippedName2} yazıyor`;
    } else {
      const name1 = typingUserNames[0];
      const clippedName1 =
        name1.length > 10 ? `${name1.substring(0, 10)}...` : name1;
      return `${clippedName1} ve ${
        typingUserNames.length - 1
      } kişi daha yazıyor`;
    }
  };

  return (
    <div className="px-4 py-2">
      <div className="flex items-center space-x-2">
        {/* Typing animation dots */}
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
          <div
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>

        {/* Typing text */}
        <span className="text-sm text-gray-500 italic">{getTypingText()}</span>
      </div>
    </div>
  );
}

function MessageList({
  messages,
  isUserOnline,
  typingUsers,
  advert,
  onDeleteMessage,
  onEditMessage,
  editingMessageId,
  editingText,
  onEditTextChange,
  onSaveEdit,
  onCancelEdit,
  shouldScrollToBottom,
}) {
  const messagesEndRef = useRef(null);
  const { user } = useAuth();

  // Controlled scroll to bottom - only triggered by parent component
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      });
    }
  };

  // Only scroll when parent component explicitly requests it
  useEffect(() => {
    if (shouldScrollToBottom) {
      console.log(`MessageList: Scrolling to bottom for advert ${advert?._id}`);
      scrollToBottom();
    }
  }, [shouldScrollToBottom]);

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

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatMessageDate(message.createdAt);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  const isCurrentUser = (sender) => {
    // Handle both old format (senderId) and new format (sender object)
    if (typeof sender === "string") {
      return user && user._id === sender;
    }
    // New format: sender is an object with _id
    return user && sender && user._id === sender._id;
  };

  // Check if current user can delete a specific message
  const canDeleteMessage = (message) => {
    if (!user || !advert) return false;

    const messageSenderId =
      typeof message.sender === "string" ? message.sender : message.sender?._id;

    // Owner (createdBy) can delete any message
    if (user._id === advert.createdBy?._id) {
      return true;
    }

    // Admins can delete other users' messages (but not the owner's messages)
    const isCurrentUserAdmin = advert.adminAdvert?.includes(user._id);
    const isMessageFromOwner = messageSenderId === advert.createdBy?._id;

    if (isCurrentUserAdmin && !isMessageFromOwner) {
      return true;
    }

    // Regular participants can only delete their own messages
    if (messageSenderId === user._id) {
      return true;
    }

    return false;
  };

  // Check if current user can edit a specific message
  // Only the sender of the message can edit it
  const canEditMessage = (message) => {
    if (!user || !message) return false;

    const messageSenderId =
      typeof message.sender === "string" ? message.sender : message.sender?._id;

    // Only the sender can edit their own message
    return messageSenderId === user._id;
  };

  // Check if a message was actually edited (has meaningful time difference)
  const isMessageEdited = (message) => {
    if (!message.createdAt || !message.updatedAt) return false;

    const createdTime = new Date(message.createdAt).getTime();
    const updatedTime = new Date(message.updatedAt).getTime();

    // Show "düzenlendi" only if there's a meaningful time difference (more than 1 second)
    // This accounts for small timestamp differences that might occur during message creation
    const timeDifference = Math.abs(updatedTime - createdTime);
    return timeDifference > 1000; // More than 1 second difference indicates an actual edit
  };

  // Handle delete message
  const handleDeleteMessage = (messageId) => {
    if (onDeleteMessage) {
      onDeleteMessage(messageId);
    }
  };

  // Handle edit message
  const handleEditMessage = (messageId) => {
    if (onEditMessage) {
      onEditMessage(messageId);
    }
  };

  // Helper function to render attachment
  const renderAttachment = (item, index) => {
    console.log(`Rendering attachment ${index}:`, item);

    // Ensure we have a URL for display
    if (!item.url && item.content) {
      const mimeType = item.mimeType || "application/octet-stream";
      item.url = item.content.startsWith("data:")
        ? item.content
        : `data:${mimeType};base64,${item.content}`;
    }

    if (!item.url) {
      console.warn("Attachment has no URL:", item);
      return (
        <div
          key={index}
          className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
        >
          <p className="text-sm text-yellow-800">Ek dosya yüklenemedi</p>
        </div>
      );
    }

    // Image attachments
    if (item.mimeType && item.mimeType.startsWith("image/")) {
      return (
        <div key={index}>
          <img
            src={item.url}
            alt={item.name || "Image"}
            className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => window.open(item.url, "_blank")}
            onError={(e) => {
              console.error("Image failed to load:", item.url);
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "block";
            }}
          />
          {/* Fallback for broken images */}
          <div
            className="hidden p-2 bg-gray-100 border border-gray-300 rounded-lg text-center w-full h-24 flex flex-col justify-center"
            style={{ display: "none" }}
          >
            <div className="text-gray-500 mb-1">
              <svg
                className="w-6 h-6 mx-auto"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <p className="text-xs text-gray-600">Resim yüklenemedi</p>
          </div>
        </div>
      );
    }

    // Video attachments
    if (item.mimeType && item.mimeType.startsWith("video/")) {
      return (
        <div key={index} className="mt-2">
          <video
            src={item.url}
            controls
            className="max-w-xs rounded-lg"
            onError={(e) => {
              console.error("Video failed to load:", item.url);
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "block";
            }}
          />
          {/* Fallback for broken videos */}
          <div
            className="hidden p-4 bg-gray-100 border border-gray-300 rounded-lg text-center max-w-xs"
            style={{ display: "none" }}
          >
            <div className="text-gray-500 mb-2">
              <svg
                className="w-8 h-8 mx-auto"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <p className="text-sm text-gray-600">Video yüklenemedi</p>
            <p className="text-xs text-gray-500 mt-1">
              {item.name || "Bilinmeyen dosya"}
            </p>
          </div>
        </div>
      );
    }

    // Document attachments (PDF, DOC, etc.)
    return (
      <div key={index} className="mt-2">
        <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm max-w-sm hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3">
            {/* File icon */}
            <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center flex-shrink-0">
              <svg
                className="w-4 h-4 text-green-600"
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

            {/* File info */}
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-gray-900">
                {item.mimeType === "application/pdf"
                  ? "PDF Dosyası"
                  : item.mimeType?.includes("word")
                  ? "Word Dosyası"
                  : item.mimeType?.includes("document")
                  ? "Word Dosyası"
                  : "Dosya"}
              </div>
              {/* Clickable short URL for download */}
              {item.url && (
                <a
                  href={item.url}
                  download
                  className="text-xs text-blue-600 mt-1 hover:text-blue-800 cursor-pointer underline block truncate max-w-[200px]"
                  title="İndirmek için tıklayın"
                >
                  {item.url.split("?")[0].split("/").pop().substring(0, 30)}...
                </a>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex-shrink-0 flex space-x-1">
            {/* Copy URL button */}
            <button
              onClick={() => {
                navigator.clipboard.writeText(item.url);
                // Optional: Show a toast notification
                console.log("URL kopyalandı:", item.url);
              }}
              className="text-blue-600 text-xs px-2 py-1 border border-blue-600 rounded hover:bg-blue-600 hover:text-white transition-colors"
              title="URL'yi kopyala"
            >
              Kopyala
            </button>

            {/* Open/Download button */}
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 text-xs px-2 py-1 border border-green-600 rounded hover:bg-green-600 hover:text-white transition-colors"
            >
              Aç
            </a>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className="flex-1 overflow-y-auto p-4 space-y-4"
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
          <div className="text-center">
            <p className="text-lg mb-2">Henüz mesaj yok</p>
            <p className="text-sm">
              İlk mesajı siz gönderip sohbeti başlatabilirsiniz!
            </p>
          </div>
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
              {message.type === "system" && !message.sender ? (
                <div className="flex items-center justify-center mb-2">
                  <div className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
                    <span>{message.content}</span>
                  </div>
                </div>
              ) : (
                <div className="w-full">
                  <div
                    className={`flex items-start space-x-2 mb-1 ${
                      isCurrentUser(message.sender)
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    {/* Profile picture for others only */}
                    {!isCurrentUser(message.sender) && (
                      <div className="flex-shrink-0 relative">
                        {message.sender?.profilePicture?.url ? (
                          <img
                            src={message.sender.profilePicture.url}
                            alt={message.sender?.name || "User"}
                            className="w-8 h-8 rounded-full object-cover"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div
                          className={`w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-medium ${
                            message.sender?.profilePicture?.url
                              ? "hidden"
                              : "flex"
                          }`}
                        >
                          {getInitials(message.sender?.name)}
                        </div>

                        {/* DISABLED: Online indicator - was causing cross-user visual interference 
                        {isUserOnline &&
                          message.sender?._id &&
                          isUserOnline(message.sender._id) && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full"></div>
                          )} */}
                      </div>
                    )}

                    <div className="relative group">
                      <div
                        className={`max-w-xs lg:max-w-md px-3 py-2 rounded-2xl shadow-sm ${
                          isCurrentUser(message.sender)
                            ? "bg-green-500 text-white rounded-br-md"
                            : "bg-white text-gray-800 rounded-bl-md border"
                        }`}
                      >
                        {/* Sender name (only for non-current user messages) */}
                        {!isCurrentUser(message.sender) && (
                          <p className="text-xs text-blue-600 mb-1 font-medium">
                            {message.sender?.name || "Kullanıcı"}
                          </p>
                        )}

                        {/* Message content - inline editing */}
                        {editingMessageId === message._id ? (
                          <div className="space-y-2">
                            <textarea
                              value={editingText}
                              onChange={(e) => onEditTextChange(e.target.value)}
                              className="w-full text-sm p-2 border border-gray-300 rounded resize-none focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                              rows={3}
                              autoFocus
                            />
                            <div className="flex space-x-2">
                              <button
                                onClick={() => onSaveEdit(message._id)}
                                disabled={!editingText.trim()}
                                className="px-2 py-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white text-xs rounded transition-colors"
                              >
                                Kaydet
                              </button>
                              <button
                                onClick={onCancelEdit}
                                className="px-2 py-1 bg-gray-500 hover:bg-gray-600 text-white text-xs rounded transition-colors"
                              >
                                İptal
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {/* Regular message content display */}
                            {message.content && (
                              <p className="text-sm">{message.content}</p>
                            )}

                            {/* Attachment caption - show if message has attachments with caption */}
                            {message.attachments &&
                              message.attachments.caption &&
                              message.attachments.caption.trim() && (
                                <p className="text-sm mt-1">
                                  {message.attachments.caption}
                                </p>
                              )}
                          </>
                        )}

                        {/* Edited indicator - show if message was edited */}
                        {isMessageEdited(message) && (
                          <p className="text-xs text-gray-400 italic mt-1">
                            düzenlendi
                          </p>
                        )}

                        {/* Action buttons container - hide when editing inline */}
                        {editingMessageId !== message._id && (
                          <div className="flex space-x-1">
                            {/* Edit button - only show if user can edit this message */}
                            {canEditMessage(message) && (
                              <button
                                onClick={() => handleEditMessage(message._id)}
                                className={`absolute ${
                                  isCurrentUser(message.sender)
                                    ? "-left-8 top-1"
                                    : "-right-8 top-1"
                                } w-6 h-6 rounded-full ${
                                  isCurrentUser(message.sender)
                                    ? "bg-blue-500 hover:bg-blue-600 text-white"
                                    : "bg-blue-500 hover:bg-blue-600 text-white"
                                } opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center shadow-lg transform hover:scale-110`}
                                title="Mesajı Düzenle"
                              >
                                <svg
                                  className="w-3 h-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                              </button>
                            )}

                            {/* Delete button - only show if user can delete this message */}
                            {canDeleteMessage(message) && (
                              <button
                                onClick={() => handleDeleteMessage(message._id)}
                                className={`absolute ${
                                  isCurrentUser(message.sender)
                                    ? canEditMessage(message)
                                      ? "-left-16 top-1"
                                      : "-left-8 top-1"
                                    : canEditMessage(message)
                                    ? "-right-16 top-1"
                                    : "-right-8 top-1"
                                } w-6 h-6 rounded-full ${
                                  isCurrentUser(message.sender)
                                    ? "bg-red-500 hover:bg-red-600 text-white"
                                    : "bg-red-500 hover:bg-red-600 text-white"
                                } opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center shadow-lg transform hover:scale-110`}
                                title="Mesajı Sil"
                              >
                                <svg
                                  className="w-3 h-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            )}
                          </div>
                        )}

                        {/* Attachments */}
                        {message.attachments &&
                          message.attachments.items &&
                          message.attachments.items.length > 0 && (
                            <div className="mt-2">
                              {/* Render images in a grid for side-by-side display */}
                              {message.attachments.items.filter(
                                (item) =>
                                  item.mimeType &&
                                  item.mimeType.startsWith("image/")
                              ).length > 0 && (
                                <div className="grid grid-cols-3 gap-1">
                                  {message.attachments.items
                                    .filter(
                                      (item) =>
                                        item.mimeType &&
                                        item.mimeType.startsWith("image/")
                                    )
                                    .map((item, idx) =>
                                      renderAttachment(item, idx)
                                    )}
                                </div>
                              )}

                              {/* Render non-image attachments normally */}
                              {message.attachments.items
                                .filter(
                                  (item) =>
                                    !item.mimeType ||
                                    !item.mimeType.startsWith("image/")
                                )
                                .map((item, idx) =>
                                  renderAttachment(item, idx)
                                )}
                            </div>
                          )}

                        {/* Time */}
                        <div
                          className={`text-xs mt-1 text-right ${
                            isCurrentUser(message.sender)
                              ? "text-green-100"
                              : "text-gray-500"
                          }`}
                        >
                          {formatMessageTime(message.createdAt)}
                          {message.archived && (
                            <span className="ml-2 opacity-60">
                              (Arşivlendi)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ))}

      {/* Typing indicator */}
      {typingUsers && typingUsers.length > 0 && (
        <TypingIndicator typingUsers={typingUsers} advert={advert} />
      )}

      {/* Message scroll target - only used for controlled scrolling */}
      <div ref={messagesEndRef}></div>
    </div>
  );
}

export default MessageList;
