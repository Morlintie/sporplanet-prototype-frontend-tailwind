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

function MessageList({ messages, isUserOnline }) {
  const messagesEndRef = useRef(null);
  const { user } = useAuth();

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
    return user && user._id === senderId;
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
                  <div className="flex-shrink-0 relative">
                    {message.senderInfo?.profilePicture ||
                    message.user?.profilePicture?.url ? (
                      <img
                        src={
                          message.senderInfo?.profilePicture ||
                          message.user?.profilePicture?.url
                        }
                        alt={
                          message.senderInfo?.name ||
                          message.user?.name ||
                          "User"
                        }
                        className="w-8 h-8 rounded-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className={`w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-medium ${
                        message.senderInfo?.profilePicture ||
                        message.user?.profilePicture?.url
                          ? "hidden"
                          : "flex"
                      }`}
                    >
                      {getInitials(
                        message.senderInfo?.name || message.user?.name
                      )}
                    </div>

                    {/* Online indicator for message sender */}
                    {isUserOnline && isUserOnline(message.sender) && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full"></div>
                    )}
                  </div>

                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      isCurrentUser(message.sender)
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {/* Sender name (only for non-current user messages) */}
                    {!isCurrentUser(message.sender) && (
                      <p className="text-xs text-gray-600 mb-1 font-medium">
                        {message.senderInfo?.name ||
                          message.user?.name ||
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
                        <p className="text-sm">{message.content}</p>

                        {/* Attachments */}
                        {message.attachments && message.attachments.items && (
                          <div className="mt-2">
                            {message.attachments.items.map((item, idx) => (
                              <div key={idx} className="mb-2">
                                {item.mimeType.startsWith("image/") ? (
                                  <img
                                    src={item.url}
                                    alt={item.name}
                                    className="max-w-full h-auto rounded-lg"
                                  />
                                ) : item.mimeType.startsWith("video/") ? (
                                  <video
                                    src={item.url}
                                    controls
                                    className="max-w-full h-auto rounded-lg"
                                  />
                                ) : null}
                                {message.attachments.caption && (
                                  <p className="text-xs mt-1 opacity-75">
                                    {message.attachments.caption}
                                  </p>
                                )}
                              </div>
                            ))}
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
  );
}

export default MessageList;

