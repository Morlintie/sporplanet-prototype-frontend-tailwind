import { useRef, useEffect } from "react";

function MessageList({
  messages,
  currentUser,
  targetUser,
  isUserOnline,
  editingMessageId,
  editingText,
  onEditTextChange,
  onEditMessage,
  onDeleteMessage,
  onSaveEdit,
  onCancelEdit,
  shouldScrollToBottom = false,
  showNotification,
  isTypingUser = null,
}) {
  const messagesEndRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (shouldScrollToBottom) {
      scrollToBottom();
    }
  }, [shouldScrollToBottom]);

  // Auto-scroll to bottom when messages change or typing status changes
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTypingUser]);

  // Format message timestamp (time only)
  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format message date for date separators
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

  // Get user initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return "?";
    const nameParts = name.split(" ").filter((part) => part.length > 0);
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }
    return (
      nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)
    ).toUpperCase();
  };

  // Check if current user can edit a specific message
  const canEditMessage = (message) => {
    if (!currentUser || !message) return false;
    const messageSenderId =
      typeof message.sender === "string" ? message.sender : message.sender?._id;
    return messageSenderId === currentUser._id;
  };

  // Check if current user can delete a specific message
  const canDeleteMessage = (message) => {
    if (!currentUser || !message) return false;
    const messageSenderId =
      typeof message.sender === "string" ? message.sender : message.sender?._id;
    return messageSenderId === currentUser._id;
  };

  // Check if current user is the sender of the message
  const isCurrentUser = (sender) => {
    return currentUser && sender && currentUser._id === sender._id;
  };

  // Check if a message was actually edited
  const isMessageEdited = (message) => {
    if (!message.createdAt || !message.updatedAt) return false;
    const createdTime = new Date(message.createdAt).getTime();
    const updatedTime = new Date(message.updatedAt).getTime();
    const timeDifference = Math.abs(updatedTime - createdTime);
    return timeDifference > 1000;
  };

  // Helper function to render attachments
  const renderAttachment = (item, index) => {
    // Ensure we have a URL for display
    if (!item.url && item.content) {
      const mimeType = item.mimeType || "application/octet-stream";
      item.url = item.content.startsWith("data:")
        ? item.content
        : `data:${mimeType};base64,${item.content}`;
    }

    if (!item.url) {
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
            className="w-full max-w-xs h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => window.open(item.url, "_blank")}
            onError={(e) => {
              console.error("Image failed to load:", item.url);
              e.target.style.display = "none";
            }}
          />
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
            className="w-full max-w-xs h-32 rounded-lg"
            onError={(e) => {
              console.error("Video failed to load:", item.url);
            }}
          >
            Tarayıcınız video oynatmayı desteklemiyor.
          </video>
        </div>
      );
    }

    // Document attachments (PDF, DOC, etc.)
    return (
      <div key={index} className="mt-2">
        <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm max-w-xs hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
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
              <div className="text-sm font-medium text-gray-900 truncate">
                {item.mimeType === "application/pdf"
                  ? "PDF Dosyası"
                  : item.mimeType?.includes("word")
                  ? "Word Dosyası"
                  : item.mimeType?.includes("document")
                  ? "Word Dosyası"
                  : "Dosya"}
              </div>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 underline truncate block"
                title={item.url}
              >
                {item.name ? item.name.split("/").pop() : "Dosya"}
              </a>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex-shrink-0 ml-2 flex space-x-1">
            <button
              onClick={() => {
                navigator.clipboard.writeText(item.url);
                if (showNotification) {
                  showNotification("Link kopyalandı", "success");
                }
              }}
              className="text-blue-600 text-xs px-2 py-1 border border-blue-600 rounded hover:bg-blue-600 hover:text-white transition-colors whitespace-nowrap"
            >
              Kopyala
            </button>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 text-xs px-2 py-1 border border-green-600 rounded hover:bg-green-600 hover:text-white transition-colors whitespace-nowrap"
            >
              Aç
            </a>
          </div>
        </div>
      </div>
    );
  };

  if (messages.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-gray-400"
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
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Henüz mesaj yok
        </h3>
        <p className="text-gray-500 mb-4">
          {targetUser?.name} ile ilk mesajınızı gönderin
        </p>
        <div ref={messagesEndRef} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(groupedMessages).map(([date, dateMessages]) => (
        <div key={date}>
          {/* Date separator */}
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
              {date}
            </div>
          </div>

          {/* Messages for this date */}
          {dateMessages.map((message) => (
            <div
              key={message._id}
              className={`flex mb-4 ${
                message.sender._id === currentUser._id
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`group relative max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender._id === currentUser._id
                    ? "bg-green-600 text-white"
                    : "bg-white border border-gray-200 text-gray-900"
                } ${message.isTemp ? "opacity-70" : ""}`}
              >
                {/* Message content - inline editing */}
                {editingMessageId === message._id ? (
                  <div className="space-y-2">
                    {/* Show attachments during editing if they exist */}
                    {message.attachments &&
                      message.attachments.items &&
                      message.attachments.items.length > 0 && (
                        <div className="mb-2">
                          {/* Render images in a grid for side-by-side display */}
                          {message.attachments.items.filter(
                            (item) =>
                              item.mimeType &&
                              item.mimeType.startsWith("image/")
                          ).length > 0 && (
                            <div className="grid grid-cols-2 gap-1">
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
                            .map((item, idx) => renderAttachment(item, idx))}
                        </div>
                      )}

                    <textarea
                      value={editingText}
                      onChange={(e) => onEditTextChange(e.target.value)}
                      className={`w-full text-sm p-2 border border-gray-300 rounded resize-none focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 ${
                        isCurrentUser(message.sender)
                          ? "text-white bg-green-600 placeholder-green-200"
                          : "text-gray-900 bg-white placeholder-gray-500"
                      }`}
                      rows={3}
                      autoFocus
                      placeholder={
                        message.attachments &&
                        message.attachments.items &&
                        message.attachments.items.length > 0
                          ? "Dosya açıklamasını düzenleyin..."
                          : "Mesajınızı düzenleyin..."
                      }
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
                    {message.content && !message.attachments && (
                      <p className="text-sm">{message.content}</p>
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
                            <div className="grid grid-cols-2 gap-1">
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
                            .map((item, idx) => renderAttachment(item, idx))}

                          {/* Display caption at the bottom of files if present */}
                          {message.attachments.caption && (
                            <p className="text-sm mt-2">
                              {message.attachments.caption}
                            </p>
                          )}
                        </div>
                      )}
                  </>
                )}

                {/* Timestamp and edited indicator - hide when editing inline */}
                {editingMessageId !== message._id && (
                  <p
                    className={`text-xs mt-1 ${
                      message.sender._id === currentUser._id
                        ? "text-green-100"
                        : "text-gray-500"
                    }`}
                  >
                    {formatMessageTime(message.createdAt)}
                    {message.isTemp && " • Gönderiliyor..."}
                    {!message.isTemp &&
                      isMessageEdited(message) &&
                      " • düzenlendi"}
                  </p>
                )}

                {/* Action buttons container - hide when editing inline */}
                {editingMessageId !== message._id && (
                  <div className="flex space-x-1">
                    {/* Edit button - only show if user can edit this message */}
                    {canEditMessage(message) && (
                      <button
                        onClick={() => onEditMessage(message._id)}
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
                        onClick={() => onDeleteMessage(message._id)}
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
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* Typing Indicator */}
      {isTypingUser && targetUser && isTypingUser === targetUser._id && (
        <div className="flex justify-start">
          <div className="bg-white border border-gray-200 text-gray-900 px-4 py-2 rounded-lg max-w-xs">
            <div className="flex items-center space-x-2">
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
              <span className="text-sm text-gray-600">
                {targetUser.name} yazıyor...
              </span>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}

export default MessageList;
