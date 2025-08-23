import { useState, useEffect, useRef } from "react";

function JoinButton({
  isCreator,
  isParticipant,
  isInWaitingList,
  onJoinRequest,
  onLeaveRequest,
  onDeleteRequest,
  onRevokeRequest,
}) {
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [showOwnerDropdown, setShowOwnerDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowOwnerDropdown(false);
      }
    };

    if (showOwnerDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showOwnerDropdown]);

  const handleJoinAdvert = async (e) => {
    e.preventDefault(); // Prevent any default form behavior
    e.stopPropagation(); // Stop event bubbling

    if (isJoining) return;

    if (!onJoinRequest) {
      console.warn("onJoinRequest function not provided");
      return;
    }

    setIsJoining(true);
    try {
      await onJoinRequest();
    } catch (error) {
      console.error("Error joining advert:", error);
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveAdvert = async (e) => {
    e.preventDefault(); // Prevent any default form behavior
    e.stopPropagation(); // Stop event bubbling

    if (isLeaving) return;

    if (!onLeaveRequest) {
      console.warn("onLeaveRequest function not provided");
      return;
    }

    setIsLeaving(true);
    try {
      await onLeaveRequest();
    } catch (error) {
      console.error("Error leaving advert:", error);
    } finally {
      setIsLeaving(false);
    }
  };

  const handleDeleteAdvert = async (e) => {
    e.preventDefault(); // Prevent any default form behavior
    e.stopPropagation(); // Stop event bubbling

    if (isDeleting) return;

    if (!onDeleteRequest) {
      console.warn("onDeleteRequest function not provided");
      return;
    }

    setIsDeleting(true);
    setShowOwnerDropdown(false); // Close dropdown
    try {
      await onDeleteRequest();
    } catch (error) {
      console.error("Error deleting advert:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOwnerLeaveAdvert = async (e) => {
    e.preventDefault(); // Prevent any default form behavior
    e.stopPropagation(); // Stop event bubbling

    if (isLeaving) return;

    if (!onLeaveRequest) {
      console.warn("onLeaveRequest function not provided");
      return;
    }

    setIsLeaving(true);
    setShowOwnerDropdown(false); // Close dropdown
    try {
      await onLeaveRequest();
    } catch (error) {
      console.error("Error leaving advert:", error);
    } finally {
      setIsLeaving(false);
    }
  };

  const handleRevokeRequest = async (e) => {
    e.preventDefault(); // Prevent any default form behavior
    e.stopPropagation(); // Stop event bubbling

    if (isRevoking) return;

    if (!onRevokeRequest) {
      console.warn("onRevokeRequest function not provided");
      return;
    }

    setIsRevoking(true);
    try {
      await onRevokeRequest();
    } catch (error) {
      console.error("Error revoking request:", error);
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <div
      className="sticky bottom-0 bg-white p-4 shadow-lg z-10"
      style={{ scrollMarginBottom: "0px" }}
      onFocus={(e) => e.preventDefault()}
    >
      {isCreator ? (
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowOwnerDropdown(!showOwnerDropdown);
            }}
            disabled={isLeaving || isDeleting}
            className={`w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-4 px-6 rounded-xl text-center shadow-lg transition-all duration-200 ${
              isLeaving || isDeleting
                ? "opacity-75 cursor-not-allowed"
                : "hover:from-blue-600 hover:to-blue-700 hover:shadow-xl"
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                {isLeaving
                  ? "İlandan Ayrılınıyor..."
                  : isDeleting
                  ? "İlan Siliniyor..."
                  : "Bu sizin ilanınız"}
              </span>
              <svg
                className={`w-5 h-5 transition-transform duration-200 ${
                  showOwnerDropdown ? "rotate-180" : ""
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </button>

          {/* Dropdown Menu */}
          {showOwnerDropdown && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="py-1">
                <button
                  onClick={handleOwnerLeaveAdvert}
                  disabled={isLeaving || isDeleting}
                  className="flex items-center w-full px-4 py-3 text-sm text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg
                    className="w-4 h-4 mr-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-2 0V4H5v12h10v-2a1 1 0 112 0v3a1 1 0 01-1 1H4a1 1 0 01-1-1V3z"
                      clipRule="evenodd"
                    />
                    <path
                      fillRule="evenodd"
                      d="M6 10a1 1 0 011-1h6l-2-2a1 1 0 112-2l4 4a1 1 0 010 1.414l-4 4a1 1 0 11-1.414-1.414L13.586 11H7a1 1 0 01-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  İlandan Ayrıl
                </button>
                <div className="border-t border-gray-100"></div>
                <button
                  onClick={handleDeleteAdvert}
                  disabled={isLeaving || isDeleting}
                  className="flex items-center w-full px-4 py-3 text-sm text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  İlanı Sil
                </button>
              </div>
            </div>
          )}
        </div>
      ) : isInWaitingList ? (
        <button
          type="button"
          onClick={handleRevokeRequest}
          disabled={isRevoking}
          className={`w-full text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg flex items-center justify-center space-x-3 ${
            isRevoking
              ? "bg-gradient-to-r from-yellow-400 to-orange-500 cursor-not-allowed"
              : "bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 hover:shadow-xl transform hover:-translate-y-0.5"
          }`}
        >
          {isRevoking ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              <span className="text-lg">İstek Geri Alınıyor...</span>
            </>
          ) : (
            <>
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-lg">Katılım İsteğini Geri Al</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </>
          )}
        </button>
      ) : isParticipant ? (
        <button
          type="button"
          onClick={handleLeaveAdvert}
          disabled={isLeaving}
          className={`w-full text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg flex items-center justify-center space-x-3 ${
            isLeaving
              ? "bg-gradient-to-r from-red-400 to-red-500 cursor-not-allowed"
              : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 hover:shadow-xl transform hover:-translate-y-0.5"
          }`}
        >
          {isLeaving ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              <span className="text-lg">İlandan Ayrılınıyor...</span>
            </>
          ) : (
            <>
              <span className="text-lg">İlandan Ayrıl</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-2 0V4H5v12h10v-2a1 1 0 112 0v3a1 1 0 01-1 1H4a1 1 0 01-1-1V3z"
                  clipRule="evenodd"
                />
                <path
                  fillRule="evenodd"
                  d="M6 10a1 1 0 011-1h6l-2-2a1 1 0 112-2l4 4a1 1 0 010 1.414l-4 4a1 1 0 11-1.414-1.414L13.586 11H7a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </>
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={handleJoinAdvert}
          disabled={isJoining}
          className={`w-full text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg flex items-center justify-center space-x-3 ${
            isJoining
              ? "bg-gradient-to-r from-green-400 to-emerald-500 cursor-not-allowed"
              : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:shadow-xl transform hover:-translate-y-0.5"
          }`}
        >
          {isJoining ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              <span className="text-lg">Maça Katılınıyor...</span>
            </>
          ) : (
            <>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-lg">Maça Katıl</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </>
          )}
        </button>
      )}
    </div>
  );
}

export default JoinButton;
