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

function UserCard({
  userItem,
  isWaitingListUser,
  isCurrentUserAdmin,
  isUserOnline,
  openDropdownId,
  toggleDropdown,
  handleAcceptRequest,
  handleRejectRequest,
  isProcessingRequest,
  advert,
  currentUser,
  onPromoteToAdmin,
  onDemoteFromAdmin,
  onExpelUser,
}) {
  const user = userItem.user || {};

  // Helper functions for permission checks
  const isAdvertOwner = (userId) => {
    return advert?.createdBy?._id === userId;
  };

  const isUserAdmin = (userId) => {
    return advert?.adminAdvert?.some((adminId) => adminId === userId);
  };

  const isCurrentUserOwner = () => {
    return isAdvertOwner(currentUser?._id);
  };

  const canCurrentUserManage = () => {
    return isCurrentUserOwner() || isCurrentUserAdmin();
  };

  // Permission checks for specific actions
  const canPromoteToAdmin = () => {
    if (!canCurrentUserManage()) return false;
    if (isWaitingListUser) return false; // Cannot promote waiting list users
    if (isUserAdmin(user._id)) return false; // Already admin
    if (isAdvertOwner(user._id)) return false; // Owner is always admin
    return true;
  };

  const canDemoteFromAdmin = () => {
    if (!canCurrentUserManage()) return false;
    if (!isUserAdmin(user._id)) return false; // Not admin
    if (isAdvertOwner(user._id)) return false; // Cannot demote owner
    return true;
  };

  const canExpelUser = () => {
    if (!canCurrentUserManage()) return false;
    if (isWaitingListUser) return false; // Cannot expel waiting list users (use reject instead)
    if (isAdvertOwner(user._id)) return false; // Cannot expel owner
    if (user._id === currentUser?._id) return false; // Cannot expel self
    return true;
  };

  // Check if user should have admin controls menu
  const shouldShowAdminMenu = () => {
    if (user._id === currentUser?._id) return false; // No menu for self
    return (
      canCurrentUserManage() &&
      (canPromoteToAdmin() ||
        canDemoteFromAdmin() ||
        canExpelUser() ||
        isWaitingListUser)
    );
  };

  return (
    <div
      className={`rounded-lg p-3 border transition-opacity ${
        isWaitingListUser
          ? "bg-gray-50/60 border-gray-100/60 opacity-60" // Faded for waiting list
          : "bg-gray-50 border-gray-100" // Normal for participants
      }`}
    >
      <div className="flex items-center space-x-3">
        <div className="relative">
          {user.profilePicture?.url ? (
            <img
              src={user.profilePicture.url}
              alt={user.name || "Kullanıcı"}
              className={`w-8 h-8 rounded-full object-cover transition-all duration-200 ${
                isProcessingRequest ? "blur-md opacity-50" : ""
              }`}
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
          ) : null}
          <div
            className={`w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-medium transition-all duration-200 ${
              user.profilePicture?.url ? "hidden" : "flex"
            } ${isProcessingRequest ? "blur-md opacity-50" : ""}`}
          >
            {getInitials(user.name)}
          </div>

          {/* Loading spinner overlay */}
          {isProcessingRequest && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-full">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-600 border-t-transparent bg-white  shadow-lg"></div>
            </div>
          )}
          {user.goalKeeper && (
            <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
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

          {/* Online indicator - positioned differently if user is goalkeeper */}
          {isUserOnline && isUserOnline(user._id) && (
            <div
              className={`absolute w-3 h-3 bg-green-400 border-2 border-white rounded-full ${
                user.goalKeeper
                  ? "-bottom-0.5 -left-0.5" // Bottom left if goalkeeper (to avoid overlap with goalkeeper badge)
                  : "-bottom-0.5 -right-0.5" // Bottom right if not goalkeeper
              }`}
            ></div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <a
              href={`/profile/${user._id}`}
              className={`font-medium text-sm truncate cursor-pointer hover:underline ${
                isWaitingListUser
                  ? "text-blue-400 hover:text-blue-600" // Faded blue for waiting list
                  : "text-blue-600 hover:text-blue-800" // Normal blue for participants
              }`}
            >
              {user.name || "İsimsiz Kullanıcı"}
            </a>

            {/* Admin badge */}
            {!isAdvertOwner(user._id) && isUserAdmin(user._id) && (
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-1.5 py-0.5 rounded">
                Admin
              </span>
            )}

            {/* Waiting status */}
            {isWaitingListUser && (
              <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-1.5 py-0.5 rounded">
                Beklemede
              </span>
            )}

            {/* Goalkeeper badge */}
            {!isWaitingListUser && user.goalKeeper && (
              <span className="bg-green-100 text-green-800 text-xs font-medium px-1.5 py-0.5 rounded">
                K
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="text-right">
            <p
              className={`text-xs ${
                isWaitingListUser ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {userItem.joinedAt
                ? new Date(userItem.joinedAt).toLocaleDateString("tr-TR")
                : "-"}
            </p>
          </div>

          {/* Admin controls - three-dot menu for manageable users */}
          {shouldShowAdminMenu() && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!isProcessingRequest) {
                    toggleDropdown(user._id);
                  }
                }}
                disabled={isProcessingRequest}
                className={`p-1 rounded-full transition-colors ${
                  isProcessingRequest
                    ? "cursor-not-allowed opacity-50"
                    : "hover:bg-gray-100"
                }`}
                title={
                  isProcessingRequest
                    ? "İşlem devam ediyor..."
                    : "Yönetim Seçenekleri"
                }
              >
                <svg
                  className="w-4 h-4 text-gray-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {openDropdownId === user._id && (
                <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="py-1">
                    {/* Waiting list controls */}
                    {isWaitingListUser && (
                      <>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAcceptRequest(user._id);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-green-700 hover:bg-green-50 transition-colors"
                        >
                          <svg
                            className="w-4 h-4 mr-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Katılım Talebini Kabul Et
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRejectRequest(user._id);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors"
                        >
                          <svg
                            className="w-4 h-4 mr-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                          Katılım Talebini Reddet
                        </button>
                        {(canPromoteToAdmin() || canExpelUser()) && (
                          <div className="border-t border-gray-100 my-1"></div>
                        )}
                      </>
                    )}

                    {/* Admin promotion controls */}
                    {canPromoteToAdmin() && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onPromoteToAdmin && onPromoteToAdmin(user._id);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 transition-colors"
                      >
                        <svg
                          className="w-4 h-4 mr-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Admin Yap
                      </button>
                    )}

                    {/* Admin demotion controls */}
                    {canDemoteFromAdmin() && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onDemoteFromAdmin && onDemoteFromAdmin(user._id);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-orange-700 hover:bg-orange-50 transition-colors"
                      >
                        <svg
                          className="w-4 h-4 mr-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 14l-7 7m0 0l-7-7m7 7V3"
                          />
                        </svg>
                        Adminlikten Çıkart
                      </button>
                    )}

                    {/* User expulsion controls */}
                    {canExpelUser() && (
                      <>
                        {(canPromoteToAdmin() || canDemoteFromAdmin()) && (
                          <div className="border-t border-gray-100 my-1"></div>
                        )}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onExpelUser && onExpelUser(user._id);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors"
                        >
                          <svg
                            className="w-4 h-4 mr-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                          İlandan At
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserCard;
