import { useState, useEffect } from "react";
import "../../styles/maintenance-popup.css";

function FriendInvitePopup({
  isVisible,
  onClose,
  friends = [],
  onSendInvites,
  isSending = false,
}) {
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Close popup on Escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && isVisible) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when popup is open
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isVisible, onClose]);

  // Reset state when popup opens/closes
  useEffect(() => {
    if (isVisible) {
      setSelectedFriends([]);
      setSearchQuery("");
    }
  }, [isVisible]);

  // Filter friends based on search query
  const filteredFriends = friends.filter(
    (friend) =>
      friend.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.school?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle friend selection
  const handleFriendSelect = (friendId) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedFriends.length === filteredFriends.length) {
      setSelectedFriends([]);
    } else {
      setSelectedFriends(filteredFriends.map((friend) => friend._id));
    }
  };

  // Handle send invites
  const handleSendInvites = () => {
    if (selectedFriends.length > 0) {
      const selectedFriendsData = friends.filter((friend) =>
        selectedFriends.includes(friend._id)
      );
      onSendInvites(selectedFriendsData);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="maintenance-popup-overlay" onClick={onClose}>
      {/* Popup Content */}
      <div
        className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 transform transition-all duration-300 scale-100 max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
          tabIndex="0"
          aria-label="Popup'ı kapat"
        >
          <svg
            className="w-6 h-6"
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
        </button>

        {/* Header */}
        <div className="mb-5">
          <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 text-center mb-3">
            Arkadaşlarını Davet Et
          </h3>
          <p className="text-gray-600 text-center text-sm leading-relaxed">
            Bu maça katılması için arkadaşlarını davet et. Seçtiğin arkadaşlar
            davet bildirimi alacak.
          </p>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Arkadaş ara..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Friends List */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Select All Button */}
          {filteredFriends.length > 0 && (
            <div className="mb-3">
              <button
                onClick={handleSelectAll}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {selectedFriends.length === filteredFriends.length
                  ? "Tümünü Kaldır"
                  : "Tümünü Seç"}
              </button>
              <span className="text-xs text-gray-500 ml-2">
                ({selectedFriends.length}/{filteredFriends.length} seçili)
              </span>
            </div>
          )}

          {/* Friends List */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {filteredFriends.length > 0 ? (
              filteredFriends.map((friend) => (
                <div
                  key={friend._id}
                  onClick={() => handleFriendSelect(friend._id)}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedFriends.includes(friend._id)
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-medium text-gray-600">
                          {friend.name?.charAt(0)?.toUpperCase() || "?"}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {friend.name || "İsimsiz"}
                        </p>
                        {friend.school && (
                          <p className="text-xs text-gray-500">
                            {friend.school}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center">
                      {friend.goalKeeper && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">
                          Kaleci
                        </span>
                      )}
                      {selectedFriends.includes(friend._id) && (
                        <svg
                          className="w-5 h-5 text-blue-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : friends.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg
                  className="w-12 h-12 mx-auto mb-3 text-gray-300"
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
                <p className="text-sm">Henüz arkadaşın yok</p>
                <p className="text-xs">
                  Arkadaş ekleyerek onları maçlara davet edebilirsin
                </p>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <svg
                  className="w-12 h-12 mx-auto mb-3 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <p className="text-sm">Aradığın arkadaş bulunamadı</p>
                <p className="text-xs">Farklı bir isim ile dene</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 mt-5">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
          >
            İptal
          </button>
          <button
            onClick={handleSendInvites}
            disabled={selectedFriends.length === 0 || isSending}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold text-sm"
          >
            {isSending ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Gönderiliyor...
              </div>
            ) : (
              `Davet Gönder (${selectedFriends.length})`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default FriendInvitePopup;
