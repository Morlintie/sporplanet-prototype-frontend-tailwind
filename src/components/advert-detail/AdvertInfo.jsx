import { useAuth } from "../../context/AuthContext";
import AdvertHeader from "./advert-info/AdvertHeader";
import AdvertDetails from "./advert-info/AdvertDetails";
import CreatorInfo from "./advert-info/CreatorInfo";
import MatchTypeDisplay from "./advert-info/MatchTypeDisplay";
import ParticipantsList from "./advert-info/ParticipantsList";
import JoinButton from "./advert-info/JoinButton";

function AdvertInfo({
  advert,
  onAdvertUpdate,
  isUserOnline,
  onJoinRequest,
  onLeaveRequest,
  onDeleteRequest,
  onRevokeRequest,
  onAcceptRequest,
  onRejectRequest,
  onPromoteToAdmin,
  onDemoteFromAdmin,
  onExpelUser,
  onStatusToggle,
  showNotification,
}) {
  const { user } = useAuth();

  // Check if current user is an admin of this advert
  const isCurrentUserAdmin = () => {
    if (!user || !advert || !advert.adminAdvert) return false;
    return advert.adminAdvert.some((adminId) => adminId === user._id);
  };

  // Check if current user is already a participant
  const isCurrentUserParticipant =
    user &&
    advert.participants &&
    Array.isArray(advert.participants) &&
    advert.participants.some(
      (participant) => participant.user && participant.user._id === user._id
    );

  // Check if current user is the creator
  const isCurrentUserCreator =
    user && advert.createdBy && advert.createdBy._id === user._id;

  // Check if current user is in waiting list
  const isCurrentUserInWaitingList =
    user &&
    advert.waitingList &&
    Array.isArray(advert.waitingList) &&
    advert.waitingList.some(
      (waitingUser) => waitingUser.user && waitingUser.user._id === user._id
    );

  const isParticipant = isCurrentUserParticipant;
  const isCreator = isCurrentUserCreator;
  const isInWaitingList = isCurrentUserInWaitingList;

  const safeParticipants =
    advert.participants && Array.isArray(advert.participants)
      ? advert.participants
      : [];

  const safeWaitingList =
    advert.waitingList && Array.isArray(advert.waitingList)
      ? advert.waitingList
      : [];

  return (
    <div className="h-full flex flex-col">
      <AdvertHeader
        advert={advert}
        onStatusToggle={onStatusToggle}
        showNotification={showNotification}
      />

      <AdvertDetails advert={advert} />

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        <CreatorInfo
          advert={advert}
          isCreator={isCreator}
          isUserOnline={isUserOnline}
        />

        <MatchTypeDisplay advert={advert} safeParticipants={safeParticipants} />

        <ParticipantsList
          safeParticipants={safeParticipants}
          safeWaitingList={safeWaitingList}
          isCurrentUserAdmin={isCurrentUserAdmin}
          onAcceptRequest={onAcceptRequest}
          onRejectRequest={onRejectRequest}
          isUserOnline={isUserOnline}
          advert={advert}
          currentUser={user}
          onPromoteToAdmin={onPromoteToAdmin}
          onDemoteFromAdmin={onDemoteFromAdmin}
          onExpelUser={onExpelUser}
        />
      </div>

      <JoinButton
        isCreator={isCreator}
        isParticipant={isParticipant}
        isInWaitingList={isInWaitingList}
        onJoinRequest={onJoinRequest}
        onLeaveRequest={onLeaveRequest}
        onDeleteRequest={onDeleteRequest}
        onRevokeRequest={onRevokeRequest}
      />
    </div>
  );
}

export default AdvertInfo;
