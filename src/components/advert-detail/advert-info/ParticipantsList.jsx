import { useState, useEffect } from "react";
import UserCard from "./UserCard";

function ParticipantsList({
  safeParticipants,
  safeWaitingList,
  isCurrentUserAdmin,
  onAcceptRequest,
  onRejectRequest,
  isUserOnline,
  advert,
  currentUser,
  onPromoteToAdmin,
  onDemoteFromAdmin,
  onExpelUser,
}) {
  const [showAllParticipants, setShowAllParticipants] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [processingUserId, setProcessingUserId] = useState(null);

  // Total count including both participants and waiting list
  const totalUsersCount = safeParticipants.length + safeWaitingList.length;

  // Combine participants and waiting list for display (participants first)
  const allUsersToShow = showAllParticipants
    ? [...safeParticipants, ...safeWaitingList]
    : [...safeParticipants, ...safeWaitingList].slice(0, 6);

  // Toggle dropdown visibility
  const toggleDropdown = (userId) => {
    setOpenDropdownId(openDropdownId === userId ? null : userId);
  };

  // Close dropdown when clicking outside
  const handleClickOutside = () => {
    setOpenDropdownId(null);
  };

  // Add event listener for clicking outside to close dropdown
  useEffect(() => {
    if (openDropdownId) {
      document.addEventListener("click", handleClickOutside);
      return () => {
        document.removeEventListener("click", handleClickOutside);
      };
    }
  }, [openDropdownId]);

  // Handle accepting a join request
  const handleAcceptRequestLocal = async (waitingUserId) => {
    try {
      console.log("Accepting join request for user:", waitingUserId);

      // Close the dropdown immediately and start loading state
      setOpenDropdownId(null);
      setProcessingUserId(waitingUserId);

      // Call the parent component's handler
      if (onAcceptRequest) {
        await onAcceptRequest(waitingUserId);
      }
    } catch (error) {
      console.error("Error accepting request:", error);
      // Error handling is done in the parent component
    } finally {
      // Clear loading state
      setProcessingUserId(null);
    }
  };

  // Handle rejecting a join request
  const handleRejectRequest = async (waitingUserId) => {
    try {
      console.log("Rejecting join request for user:", waitingUserId);

      // Close the dropdown immediately and start loading state
      setOpenDropdownId(null);
      setProcessingUserId(waitingUserId);

      // Call the parent component's handler
      if (onRejectRequest) {
        await onRejectRequest(waitingUserId);
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
      // Error handling is done in the parent component
    } finally {
      // Clear loading state
      setProcessingUserId(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <div
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setShowAllParticipants(!showAllParticipants)}
      >
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">
            Katılımcılar ({safeParticipants.length}
            {safeWaitingList.length > 0 && ` + ${safeWaitingList.length}`})
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
            {totalUsersCount}
          </span>
          <svg
            className={`w-4 h-4 text-gray-600 transition-transform duration-300 ${
              showAllParticipants ? "rotate-180" : ""
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
      </div>

      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          showAllParticipants
            ? "max-h-[400px] opacity-100"
            : "max-h-0 opacity-0"
        }`}
      >
        <div className="overflow-y-auto max-h-[350px]">
          <div className="p-3 pt-0">
            {totalUsersCount > 0 ? (
              <div className="space-y-2">
                {allUsersToShow.map((userItem, index) => {
                  const isWaitingListUser = index >= safeParticipants.length;
                  const user = userItem.user || {};

                  return (
                    <UserCard
                      key={`${
                        isWaitingListUser ? "waiting" : "participant"
                      }-${index}`}
                      userItem={userItem}
                      isWaitingListUser={isWaitingListUser}
                      isCurrentUserAdmin={isCurrentUserAdmin}
                      isUserOnline={isUserOnline}
                      openDropdownId={openDropdownId}
                      toggleDropdown={toggleDropdown}
                      handleAcceptRequest={handleAcceptRequestLocal}
                      handleRejectRequest={handleRejectRequest}
                      isProcessingRequest={processingUserId === user._id}
                      advert={advert}
                      currentUser={currentUser}
                      onPromoteToAdmin={onPromoteToAdmin}
                      onDemoteFromAdmin={onDemoteFromAdmin}
                      onExpelUser={onExpelUser}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <svg
                  className="w-12 h-12 text-gray-300 mx-auto mb-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
                <p className="text-gray-600">Henüz katılımcı yok</p>
                <p className="text-xs text-gray-500 mt-1">
                  İlk katılan kişi siz olun!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ParticipantsList;
