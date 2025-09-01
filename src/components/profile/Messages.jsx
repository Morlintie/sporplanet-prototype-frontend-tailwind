import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Messages() {
  const {
    unseenDirectMessages,
    unseenDirectMessageSenders,
    getProfilePictureUrl,
    applyBlockingLogic,
  } = useAuth();
  const navigate = useNavigate();

  // Process direct message senders with unseen counts and ensure uniqueness
  const individualMessages = unseenDirectMessageSenders
    .map((sender) => {
      // Apply blocking logic to filter sensitive data
      const filteredSender = applyBlockingLogic(sender);

      return {
        id: filteredSender._id,
        name: filteredSender.name,
        lastMessage: "Yeni mesaj", // We don't have the actual last message content from the API
        unreadCount: unseenDirectMessages[filteredSender._id] || 0,
        isOnline: false, // We can add online status later if needed
        avatar: getProfilePictureUrl(filteredSender.profilePicture),
        email: filteredSender.email,
        school: filteredSender.school,
        age: filteredSender.age,
        location: filteredSender.location,
      };
    })
    .filter(
      (message, index, self) =>
        // Remove duplicates by ensuring each user ID appears only once
        index === self.findIndex((m) => m.id === message.id)
    );

  const getInitials = (name) => {
    if (!name) return "?";
    const nameParts = name.trim().split(" ");
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return name[0]?.toUpperCase() || "?";
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <svg
            className="w-6 h-6 text-green-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-900">Mesajlarım</h2>
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto">
        {individualMessages.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {individualMessages.map((person) => (
              <div
                key={person.id}
                onClick={() => {
                  // Navigate to direct messaging page
                  navigate(`/messages/${person.id}`);
                }}
                className="p-3 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold overflow-hidden">
                      {person.avatar ? (
                        <img
                          src={person.avatar}
                          alt={person.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        getInitials(person.name)
                      )}
                    </div>
                    {person.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-gray-900 truncate">
                        {person.name}
                      </h4>
                      {person.unreadCount > 0 && (
                        <span className="bg-red-600 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                          {person.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 truncate mt-0.5">
                      {person.lastMessage}
                    </p>
                    {person.location && (
                      <p className="text-xs text-gray-400 truncate mt-1">
                        {person.location.city}, {person.location.district}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Show empty state when no direct messages
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <svg
                className="w-12 h-12 text-gray-400 mx-auto mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <h3 className="text-sm font-medium text-gray-900 mb-1">
                Henüz okunmamış mesajınız yok
              </h3>
              <p className="text-xs text-gray-600">
                Yeni mesajlar burada görünecektir
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Messages;
