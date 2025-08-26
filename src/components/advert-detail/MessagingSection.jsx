import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import MessageHeader from "./messaging/MessageHeader";
import MessageList from "./messaging/MessageList";
import MessageInput from "./messaging/MessageInput";
import AccessControl from "./messaging/AccessControl";

function MessagingSection({
  messages,
  onSendMessage,
  advertId,
  onRefreshMessages,
  advert,
  isUserOnline,
  onCreatePrivateLink,
  onSendInvitation,
  typingUsers,
  onStartTyping,
  onStopTyping,
  onDeleteMessage,
  onEditMessage,
  editingMessageId,
  editingText,
  onEditTextChange,
  onSaveEdit,
  onCancelEdit,
}) {
  const [sending, setSending] = useState(false);
  const { user } = useAuth();

  // Debug log to check if typing props are received (only when typing users change)
  useEffect(() => {
    if (typingUsers && typingUsers.length > 0) {
      console.log("MessagingSection: Typing users updated", {
        typingUsersCount: typingUsers.length,
        typingUserIds: typingUsers,
      });
    }
  }, [typingUsers]);

  // Determine user's access state to the advert messaging
  const getUserAccessState = () => {
    if (!user || !advert) return "no_access";

    // Check if user is a participant
    const isParticipant =
      advert.participants &&
      Array.isArray(advert.participants) &&
      advert.participants.some(
        (participant) => participant.user && participant.user._id === user._id
      );

    if (isParticipant) return "participant";

    // Check if user is in waiting list
    const isInWaitingList =
      advert.waitingList &&
      Array.isArray(advert.waitingList) &&
      advert.waitingList.some(
        (waitingUser) => waitingUser.user && waitingUser.user._id === user._id
      );

    if (isInWaitingList) return "waiting_list";

    // User is neither participant nor in waiting list
    return "no_access";
  };

  const userAccessState = getUserAccessState();

  // Handle sending message with proper state management
  const handleSendMessageWithState = async (messageData) => {
    setSending(true);
    try {
      await onSendMessage(messageData);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  // Main conditional rendering based on user access state
  switch (userAccessState) {
    case "no_access":
      return (
        <AccessControl
          advert={advert}
          message="Bu ilanın mesajlarını görebilmek için ilana üye olmanız gerekmektedir."
        />
      );

    case "waiting_list":
      return (
        <AccessControl
          advert={advert}
          message="Bekleme listesinde yer alıyorsunuz. Bir yönetici size yanıt verdiğinde mesajları görebileceksiniz."
        />
      );

    case "participant":
      return (
        <div className="h-full flex flex-col">
          <MessageHeader advert={advert} />
          <MessageList
            messages={messages}
            isUserOnline={isUserOnline}
            typingUsers={typingUsers}
            advert={advert}
            onDeleteMessage={onDeleteMessage}
            onEditMessage={onEditMessage}
            editingMessageId={editingMessageId}
            editingText={editingText}
            onEditTextChange={onEditTextChange}
            onSaveEdit={onSaveEdit}
            onCancelEdit={onCancelEdit}
          />
          <MessageInput
            onSendMessage={handleSendMessageWithState}
            sending={sending}
            advertId={advertId}
            onCreatePrivateLink={onCreatePrivateLink}
            onSendInvitation={onSendInvitation}
            advert={advert}
            onStartTyping={onStartTyping}
            onStopTyping={onStopTyping}
          />
        </div>
      );

    default:
      return (
        <AccessControl
          advert={advert}
          message="Bu ilanın mesajlarını görebilmek için ilana üye olmanız gerekmektedir."
        />
      );
  }
}

export default MessagingSection;
