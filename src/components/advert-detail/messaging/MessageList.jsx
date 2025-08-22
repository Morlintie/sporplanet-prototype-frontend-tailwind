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

function MessageList({ messages, isUserOnline, typingUsers, advert }) {
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
                  <div className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
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
                      className={`w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-medium ${
                        message.sender?.profilePicture?.url ? "hidden" : "flex"
                      }`}
                    >
                      {getInitials(message.sender?.name)}
                    </div>

                    {/* Online indicator for message sender */}
                    {isUserOnline &&
                      message.sender?._id &&
                      isUserOnline(message.sender._id) && (
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
                        {message.sender?.name || "Kullanıcı"}
                      </p>
                    )}

                    {/* Message content */}
                    <div className="flex items-start space-x-2">
                      <div className="flex-1">
                        <p className="text-sm">{message.content}</p>

                        {/* Single File Display */}
                        {message.attachments &&
                          message.attachments.items &&
                          message.attachments.items.length > 0 && (
                            <div className="mt-2">
                              {message.attachments.items.map((item, index) => {
                                // Case 1: Image or Video files
                                if (
                                  item.mimeType &&
                                  (item.mimeType.startsWith("image/") ||
                                    item.mimeType.startsWith("video/"))
                                ) {
                                  return (
                                    <div key={index} className="mt-2">
                                      {item.mimeType.startsWith("image/") ? (
                                        <img
                                          src={item.url}
                                          alt="Shared image"
                                          className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                          onClick={() =>
                                            window.open(item.url, "_blank")
                                          }
                                        />
                                      ) : (
                                        <div className="relative max-w-xs">
                                          <video
                                            src={item.url}
                                            controls
                                            className="w-full rounded-lg"
                                          />
                                        </div>
                                      )}
                                    </div>
                                  );
                                }

                                // Case 2: Document files - File card with folder icon and download button
                                else {
                                  // Function to clip URL with ellipsis
                                  const clipUrl = (url, maxLength = 40) => {
                                    if (url.length <= maxLength) return url;
                                    const start = url.substring(0, 15);
                                    const end = url.substring(url.length - 20);
                                    return `${start}...${end}`;
                                  };

                                  return (
                                    <div key={index} className="mt-2">
                                      <div className="relative p-3 bg-white rounded-lg border border-gray-300 shadow-sm max-w-sm">
                                        {/* Download button - top right corner */}
                                        <a
                                          href={item.url}
                                          download
                                          className="absolute top-2 right-2 p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                          title="Download file"
                                        >
                                          <svg
                                            className="w-4 h-4"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                          >
                                            <path
                                              fillRule="evenodd"
                                              d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                                              clipRule="evenodd"
                                            />
                                          </svg>
                                        </a>

                                        {/* Main content area */}
                                        <div className="flex items-center space-x-3 pr-8">
                                          {/* Folder icon - left side */}
                                          <div className="flex-shrink-0">
                                            <svg
                                              className="w-8 h-8 text-blue-500"
                                              fill="currentColor"
                                              viewBox="0 0 20 20"
                                            >
                                              <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                                            </svg>
                                          </div>

                                          {/* Clipped URL - right side */}
                                          <div className="flex-1 min-w-0">
                                            <a
                                              href={item.url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-sm text-gray-700 hover:text-blue-600 transition-colors cursor-pointer"
                                              title={item.url}
                                            >
                                              {clipUrl(item.url)}
                                            </a>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                }
                              })}

                              {/* Caption display below all files */}
                              {message.attachments.caption && (
                                <div className="mt-2 pt-2 border-t border-gray-200">
                                  <p className="text-sm text-gray-700">
                                    {message.attachments.caption}
                                  </p>
                                </div>
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

      {/* Typing indicator */}
      {typingUsers && typingUsers.length > 0 && (
        <TypingIndicator typingUsers={typingUsers} advert={advert} />
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}

export default MessageList;
