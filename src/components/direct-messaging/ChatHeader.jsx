import { useNavigate } from "react-router-dom";

function ChatHeader({ targetUser, isUserOnline, getProfilePictureUrl }) {
  const navigate = useNavigate();

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

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-4 shadow-sm">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Back Button */}
          <button
            onClick={() => window.history.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Geri Dön"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* User Info */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                {getProfilePictureUrl(targetUser?.profilePicture) ? (
                  <img
                    src={getProfilePictureUrl(targetUser.profilePicture)}
                    alt={targetUser?.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-green-600 text-white font-semibold">
                    {getInitials(targetUser?.name)}
                  </div>
                )}
              </div>
              {/* Online Status */}
              {isUserOnline && isUserOnline(targetUser?._id) && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
              )}
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {targetUser?.name}
              </h1>
              <p className="text-sm text-gray-500">
                {isUserOnline && isUserOnline(targetUser?._id)
                  ? "Çevrimiçi"
                  : "Çevrimdışı"}
              </p>
            </div>
          </div>
        </div>

        {/* Chat Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate(`/user/${targetUser?._id}`)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Profili Görüntüle"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatHeader;
