import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import InvitationMessagePopup from "../../shared/InvitationMessagePopup";

function PrivateLinkDropdown({
  advertId,
  onCreatePrivateLink,
  onSendInvitation,
  advert,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showFriendsList, setShowFriendsList] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showMessagePopup, setShowMessagePopup] = useState(false);
  const dropdownRef = useRef(null);
  const { getUserFriends, user, getProfilePictureUrl } = useAuth();

  const friends = getUserFriends();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowFriendsList(false);
        setSelectedFriends([]);
        setSearchTerm("");
        setShowMessagePopup(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCreatePrivateLink = () => {
    onCreatePrivateLink();
    setIsOpen(false);
  };

  const handleShowFriendsList = () => {
    setShowFriendsList(true);
    setSelectedFriends([]);
    setSearchTerm("");
  };

  const handleToggleFriend = (friendId) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleSendInvitations = () => {
    if (selectedFriends.length > 0) {
      // Get full friend objects for the popup
      const selectedFriendObjects = friends.filter((friend) =>
        selectedFriends.includes(friend._id)
      );
      setShowMessagePopup(true);
    }
  };

  const handleSendInvitationsWithMessage = async (message) => {
    // Call the original onSendInvitation function with selected friend IDs and message
    await onSendInvitation(selectedFriends, message);

    // Reset all states
    setIsOpen(false);
    setShowFriendsList(false);
    setSelectedFriends([]);
    setSearchTerm("");
    setShowMessagePopup(false);
  };

  const handleCloseMessagePopup = () => {
    setShowMessagePopup(false);
  };

  const handleBackToMain = () => {
    setShowFriendsList(false);
    setSelectedFriends([]);
    setSearchTerm("");
  };

  // Check if current user is an admin of this advert
  const isCurrentUserAdmin = () => {
    if (!user || !advert) return false;

    // Check if user is the creator (always an admin)
    const isCreator = advert.createdBy && advert.createdBy._id === user._id;
    if (isCreator) return true;

    // Check if user is in adminAdvert array
    const isAdmin =
      advert.adminAdvert &&
      Array.isArray(advert.adminAdvert) &&
      advert.adminAdvert.includes(user._id);

    return isAdmin;
  };

  // Don't render anything if user is not an admin
  if (!isCurrentUserAdmin()) {
    return null;
  }

  // Filter friends based on search term
  const filteredFriends = friends.filter((friend) =>
    friend.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Chain Icon Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
        title="Özel Bağlantı ve Davet"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {!showFriendsList ? (
            // Main Menu
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Özel Bağlantı ve Davet
              </h3>

              <div className="space-y-2">
                {/* Create Private Link Option */}
                <button
                  onClick={handleCreatePrivateLink}
                  className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      Özel Bağlantı Oluştur
                    </div>
                    <div className="text-sm text-gray-500">
                      Bu ilanın özel katılım bağlantısını oluştur
                    </div>
                  </div>
                </button>

                {/* Send Friend Invitations Option */}
                <button
                  onClick={handleShowFriendsList}
                  className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-blue-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      Arkadaşlarına Davet Gönder
                    </div>
                    <div className="text-sm text-gray-500">
                      Arkadaş listenden seçerek davet gönder
                    </div>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            // Friends Selection Menu
            <div className="p-4">
              {/* Header with back button */}
              <div className="flex items-center space-x-2 mb-4">
                <button
                  onClick={handleBackToMain}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <h3 className="text-lg font-semibold text-gray-800">
                  Arkadaş Seç ({selectedFriends.length})
                </h3>
              </div>

              {/* Search input */}
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Arkadaş ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Friends list */}
              <div className="max-h-48 overflow-y-auto mb-4">
                {filteredFriends.length > 0 ? (
                  <div className="space-y-1">
                    {filteredFriends.map((friend) => (
                      <label
                        key={friend._id}
                        className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedFriends.includes(friend._id)}
                          onChange={() => handleToggleFriend(friend._id)}
                          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <div className="flex items-center space-x-2 flex-1">
                          {/* Friend avatar */}
                          {getProfilePictureUrl(friend.profilePicture) ? (
                            <img
                              src={getProfilePictureUrl(friend.profilePicture)}
                              alt={friend.name || "Profile"}
                              className="w-8 h-8 rounded-full object-cover"
                              onError={(e) => {
                                // Fallback to initials if image fails to load
                                e.target.style.display = "none";
                                e.target.nextElementSibling.style.display =
                                  "flex";
                              }}
                            />
                          ) : null}
                          <div
                            className={`w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-semibold ${
                              getProfilePictureUrl(friend.profilePicture)
                                ? "hidden"
                                : ""
                            }`}
                          >
                            {friend.name
                              ? friend.name.charAt(0).toUpperCase()
                              : "?"}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 text-sm">
                              {friend.name}
                            </div>
                            {friend.school && (
                              <div className="text-xs text-gray-500">
                                {friend.school}
                              </div>
                            )}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    {searchTerm
                      ? "Arama sonucu bulunamadı"
                      : "Henüz arkadaşın yok"}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={handleBackToMain}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  İptal
                </button>
                <button
                  onClick={handleSendInvitations}
                  disabled={selectedFriends.length === 0}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  Davet Gönder ({selectedFriends.length})
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Invitation Message Popup */}
      <InvitationMessagePopup
        isVisible={showMessagePopup}
        onClose={handleCloseMessagePopup}
        onSend={handleSendInvitationsWithMessage}
        selectedFriends={friends.filter((friend) =>
          selectedFriends.includes(friend._id)
        )}
      />
    </div>
  );
}

export default PrivateLinkDropdown;
