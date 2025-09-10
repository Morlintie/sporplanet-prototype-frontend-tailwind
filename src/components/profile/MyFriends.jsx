import { useState, useMemo, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useWebSocket } from "../../context/WebSocketContext";
import { useNavigate } from "react-router-dom";
import Notification from "../shared/Notification";

function MyFriends({ user }) {
  const {
    getProfilePictureUrl,
    addOutgoingFriendRequest,
    addIncomingFriendRequest,
    removeOutgoingFriendRequest,
    removeIncomingFriendRequest,
    acceptFriendRequest,
    addFriend,
    removeFriendRequest,
    setCurrentlyViewingFriendRequests,
    followerCount,
    incrementFollowerCount,
    isUserBlockedByMe,
    isCurrentUserBlockedBy,
  } = useAuth();
  const { isUserOnline, listenForNotificationEvent } = useWebSocket();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("online");
  const [searchTerm, setSearchTerm] = useState("");

  // Notification state
  const [notification, setNotification] = useState({
    isVisible: false,
    message: "",
    type: "success",
  });

  // Show notification helper
  const showNotification = (message, type = "success") => {
    setNotification({
      isVisible: true,
      message,
      type,
    });
  };

  // Hide notification helper
  const hideNotification = () => {
    setNotification({
      isVisible: false,
      message: "",
      type: "success",
    });
  };

  // Error message translation function for revoke functionality
  const translateRevokeMessage = (message) => {
    const translations = {
      // Network errors
      "Failed to fetch":
        "Bağlantı hatası oluştu. İnternet bağlantınızı kontrol edin.",
      "Network Error": "Ağ hatası oluştu. Lütfen tekrar deneyin.",

      // Backend error messages from the controller
      "Please provide required data.": "Gerekli bilgileri girin.",
      "User couldn't found.": "Kullanıcı bulunamadı.",
      "You have not sent a friend request to that user.":
        "Bu kullanıcıya arkadaşlık isteği göndermemişsiniz.",
      "That user has not sent you a friend request.":
        "Bu kullanıcı size arkadaşlık isteği göndermemiş.",
      "You are already friends with that user.":
        "Bu kullanıcıyla zaten arkadaşsınız.",
      "You have been banned by this user":
        "Bu kullanıcı tarafından engellendiniz.",
      "You have banned that user": "Bu kullanıcıyı engellemişsiniz.",

      // Generic errors
      "Request revoke failed": "İstek iptal etme başarısız.",
      "Something went wrong": "Bir şeyler ters gitti. Lütfen tekrar deneyin.",
      "Server Error": "Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.",
      Unauthorized: "Yetkisiz erişim.",
    };

    return (
      translations[message] ||
      "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin."
    );
  };

  // Error message translation function for accept/reject functionality
  const translateReplyMessage = (message) => {
    const translations = {
      // Network errors
      "Failed to fetch":
        "Bağlantı hatası oluştu. İnternet bağlantınızı kontrol edin.",
      "Network Error": "Ağ hatası oluştu. Lütfen tekrar deneyin.",

      // Backend error messages from the replyFriendRequest controller
      "Please provide required data.": "Gerekli bilgileri girin.",
      "User couldn't found.": "Kullanıcı bulunamadı.",
      "This user did not send you a friend request.":
        "Bu kullanıcı size arkadaşlık isteği göndermedi.",
      "This user has not sent you a friend request.":
        "Bu kullanıcı size arkadaşlık isteği göndermemiş.",
      "This user is already your friend.": "Bu kullanıcı zaten arkadaşınız.",
      "You have been banned by this user":
        "Bu kullanıcı tarafından engellendiniz.",
      "You have banned that user": "Bu kullanıcıyı engellemişsiniz.",

      // Generic errors
      "Accept request failed": "İstek kabul etme başarısız.",
      "Reject request failed": "İstek reddetme başarısız.",
      "Something went wrong": "Bir şeyler ters gitti. Lütfen tekrar deneyin.",
      "Server Error": "Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.",
      Unauthorized: "Yetkisiz erişim.",
    };

    return (
      translations[message] ||
      "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin."
    );
  };

  // Track when user is viewing the pending friend requests tab
  useEffect(() => {
    // Notify AuthContext when user is viewing pending friend requests
    const isViewingPending = activeTab === "pending";
    setCurrentlyViewingFriendRequests(isViewingPending);

    // Cleanup: when component unmounts or tab changes, stop viewing
    return () => {
      if (isViewingPending) {
        setCurrentlyViewingFriendRequests(false);
      }
    };
  }, [activeTab, setCurrentlyViewingFriendRequests]);

  // WebSocket listeners for real-time updates in MyFriends component
  useEffect(() => {
    if (listenForNotificationEvent) {
      console.log("Setting up WebSocket listeners for MyFriends");

      // Listen for when someone accepts our friend request
      const handleFriendRequestAccepted = (data) => {
        console.log("Received friendRequestAccepted event in MyFriends:", data);

        if (data && data.userId) {
          // data.userId is the user who ACCEPTED our friend request
          // This will be handled globally by WebSocketContext, but we can add local logging
          console.log("Friend request accepted by user:", data.userId);
        }
      };

      // Listen for when someone rejects our friend request
      const handleFriendRequestRejected = (data) => {
        console.log("Received friendRequestRejected event in MyFriends:", data);

        if (data && data.userId) {
          // data.userId is the user who REJECTED our friend request
          // This will be handled globally by WebSocketContext, but we can add local logging
          console.log("Friend request rejected by user:", data.userId);
        }
      };

      // Listen for when someone revokes their friend request to us
      const handleFriendRequestRevoked = (data) => {
        console.log("Received friendRequestRevoked event in MyFriends:", data);

        if (data && data.userId) {
          // data.userId is the user who REVOKED their friend request to us
          console.log("Friend request revoked by user:", data.userId);
        }
      };

      // Listen for new friend requests
      const handleFriendRequest = (data) => {
        console.log("Received friendRequest event in MyFriends:", data);

        if (data && data.user) {
          console.log("New friend request from user:", data.user.name);
        }
      };

      // Set up listeners
      const cleanupAccepted = listenForNotificationEvent(
        "friendRequestAccepted",
        handleFriendRequestAccepted
      );

      const cleanupRejected = listenForNotificationEvent(
        "friendRequestRejected",
        handleFriendRequestRejected
      );

      const cleanupRevoked = listenForNotificationEvent(
        "friendRequestRevoked",
        handleFriendRequestRevoked
      );

      const cleanupNewRequest = listenForNotificationEvent(
        "friendRequest",
        handleFriendRequest
      );

      // Cleanup on unmount
      return () => {
        console.log("Cleaning up WebSocket listeners in MyFriends");
        if (cleanupAccepted) cleanupAccepted();
        if (cleanupRejected) cleanupRejected();
        if (cleanupRevoked) cleanupRevoked();
        if (cleanupNewRequest) cleanupNewRequest();
      };
    }
  }, [listenForNotificationEvent]);

  // Helper function to filter user data for blocking
  const filterUserDataForBlocking = (userData) => {
    if (!userData) return userData;

    // Check if current user has blocked this user
    const currentUserBlockedThisUser = isUserBlockedByMe(userData._id);

    // Check if this user has blocked current user (pass the bannedProfiles array)
    const thisUserBlockedCurrentUser = isCurrentUserBlockedBy(
      userData.bannedProfiles
    );

    if (currentUserBlockedThisUser || thisUserBlockedCurrentUser) {
      // Return only basic info for blocked users
      return {
        _id: userData._id,
        name: userData.name,
        email: userData.email,
      };
    }

    return userData;
  };

  // Process friends data with real-time online status
  const friends = useMemo(() => {
    if (!user?.friends) return [];

    return user.friends.map((friend) => {
      const filteredFriend = filterUserDataForBlocking(friend);

      return {
        _id: filteredFriend._id,
        name: filteredFriend.name,
        email: filteredFriend.email,
        avatar: getProfilePictureUrl(filteredFriend.profilePicture),
        status: isUserOnline(filteredFriend._id) ? "online" : "offline",
        activity: isUserOnline(filteredFriend._id) ? "Aktif" : null,
        lastSeen: !isUserOnline(filteredFriend._id)
          ? "Son çevrimiçi bilinmiyor"
          : null,
        school: filteredFriend.school,
        age: filteredFriend.age,
        location: filteredFriend.location,
        goalKeeper: filteredFriend.goalKeeper,
        role: filteredFriend.role,
        createdAt: filteredFriend.createdAt,
        updatedAt: filteredFriend.updatedAt,
      };
    });
  }, [
    user?.friends,
    isUserOnline,
    getProfilePictureUrl,
    isUserBlockedByMe,
    isCurrentUserBlockedBy,
  ]);

  // Process outgoing friend requests (selfFriendRequests - requests we sent)
  const outgoingRequests = useMemo(() => {
    if (!user?.selfFriendRequests || user.selfFriendRequests.length === 0) {
      return [];
    }

    const processed = user.selfFriendRequests.map((request) => {
      const filteredRequest = filterUserDataForBlocking(request);

      return {
        _id: filteredRequest._id,
        name: filteredRequest.name,
        email: filteredRequest.email,
        avatar: getProfilePictureUrl(filteredRequest.profilePicture),
        status: "outgoing",
        type: "outgoing",
        activity: null,
        lastSeen: null,
        school: filteredRequest.school,
        age: filteredRequest.age,
        location: filteredRequest.location,
        goalKeeper: filteredRequest.goalKeeper,
        role: filteredRequest.role,
        createdAt: filteredRequest.createdAt,
        updatedAt: filteredRequest.updatedAt,
      };
    });
    return processed;
  }, [
    user?.selfFriendRequests,
    getProfilePictureUrl,
    isUserBlockedByMe,
    isCurrentUserBlockedBy,
  ]);

  // Process incoming friend requests (friendRequests - requests sent to us)
  const incomingRequests = useMemo(() => {
    if (!user?.friendRequests || user.friendRequests.length === 0) return [];

    return user.friendRequests.map((request) => {
      const filteredUser = filterUserDataForBlocking(request.user);

      return {
        _id: filteredUser._id,
        name: filteredUser.name,
        email: filteredUser.email,
        avatar: getProfilePictureUrl(filteredUser.profilePicture),
        status: "incoming",
        type: "incoming",
        activity: null,
        lastSeen: null,
        school: filteredUser.school,
        age: filteredUser.age,
        location: filteredUser.location,
        goalKeeper: filteredUser.goalKeeper,
        role: filteredUser.role,
        seen: request.seen,
        createdAt: filteredUser.createdAt,
        updatedAt: filteredUser.updatedAt,
      };
    });
  }, [
    user?.friendRequests,
    getProfilePictureUrl,
    isUserBlockedByMe,
    isCurrentUserBlockedBy,
  ]);

  // Combine all pending requests
  const allPendingRequests = useMemo(() => {
    return [...outgoingRequests, ...incomingRequests];
  }, [outgoingRequests, incomingRequests]);

  const getInitials = (name) => {
    if (!name) return "?";
    const nameParts = name.split(/[\s.]+/).filter((part) => part.length > 0);
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }
    return (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "idle":
        return "bg-yellow-500";
      case "dnd":
        return "bg-red-500";
      case "offline":
      default:
        return "bg-gray-400";
    }
  };

  const filteredFriends = friends.filter((friend) =>
    friend.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPendingRequests = allPendingRequests.filter((request) =>
    request.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOutgoingRequests = outgoingRequests.filter((request) =>
    request.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredIncomingRequests = incomingRequests.filter((request) =>
    request.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onlineFriends = filteredFriends.filter(
    (friend) => friend.status === "online"
  );
  const offlineFriends = filteredFriends.filter(
    (friend) => friend.status === "offline"
  );

  const tabs = [
    { id: "online", label: "Çevrimiçi", count: onlineFriends.length },
    { id: "all", label: "Tümü", count: filteredFriends.length },
    { id: "pending", label: "Bekleyen", count: filteredPendingRequests.length },
  ];

  const getFriendsToShow = () => {
    switch (activeTab) {
      case "online":
        return onlineFriends;
      case "all":
        return [...onlineFriends, ...offlineFriends];
      case "pending":
        return filteredPendingRequests;
      default:
        return filteredFriends;
    }
  };

  // Handle navigation to user profile
  const handleUserClick = (userId) => {
    navigate(`/user/${userId}`);
  };

  // Handle accept friend request
  const handleAcceptRequest = async (userId) => {
    try {
      console.log("Accepting friend request from user:", userId);

      const response = await fetch(
        `/api/v1/user/replyFriendRequest/${userId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            accepted: "true", // String, not boolean as per backend requirement
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.msg || errorData.message || "Accept request failed"
        );
      }

      const data = await response.json();
      console.log("Friend request accepted successfully:", data);

      // Update AuthContext with the response data
      // New HTTP response structure: { user: newSendUser, accepted: true }
      // Where user is the FULL user data of the person whose friend request we accepted
      if (data && data.user && data.accepted === true) {
        console.log(
          "HTTP response - accepting friend request from user:",
          data.user._id,
          "User data:",
          data.user
        );

        // The acceptFriendRequest function now handles both removing from incoming requests AND adding to friends
        acceptFriendRequest(data.user._id);

        // Increment follower count since user accepted someone's friend request
        incrementFollowerCount();

        showNotification("Arkadaşlık isteği kabul edildi!", "success");
      } else {
        console.log("Unexpected response data:", data);
      }
    } catch (error) {
      console.error("Friend request accept error:", error);

      // Handle network errors
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        showNotification(translateReplyMessage("Failed to fetch"), "error");
      } else {
        showNotification(translateReplyMessage(error.message), "error");
      }
    }
  };

  const handleRejectRequest = async (userId) => {
    try {
      const response = await fetch(
        `/api/v1/user/replyFriendRequest/${userId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            accepted: "false", // String, not boolean as per backend requirement
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.msg || errorData.message || "Reject request failed"
        );
      }

      const data = await response.json();
      console.log("Friend request rejected successfully:", data);

      // Update AuthContext with the response data
      // The HTTP response contains { userId: id, accepted: false }
      if (data && data.userId && data.accepted === false) {
        acceptFriendRequest(data.userId); // This just removes from incoming requests
        showNotification("Arkadaşlık isteği reddedildi.", "info");
      } else {
        console.log("Unexpected response data:", data);
      }
    } catch (error) {
      console.error("Friend request reject error:", error);

      // Handle network errors
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        showNotification(translateReplyMessage("Failed to fetch"), "error");
      } else {
        showNotification(translateReplyMessage(error.message), "error");
      }
    }
  };

  const handleSendRequest = async (userId) => {
    try {
      const response = await fetch(`/api/v1/user/sendFriendRequest/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.msg || errorData.message || "Friend request failed"
        );
      }

      const data = await response.json();
      console.log("Friend request sent successfully:", data);
      // Update AuthContext with the response data
      // The HTTP response contains { user: sendFriendRequest } which is the recipient user data
      if (data && data.user) {
        addOutgoingFriendRequest(data.user);
        console.log("Arkadaşlık isteği gönderildi!");
      } else {
        console.log("No user data in response:", data);
      }
    } catch (error) {
      console.error("Friend request error:", error);
      console.log(
        "Arkadaşlık isteği gönderilirken hata oluştu:",
        error.message
      );
      // TODO: Show error notification to user
    }
  };

  const handleCancelRequest = async (userId) => {
    try {
      const response = await fetch(
        `/api/v1/user/revokeFriendRequest/${userId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.msg || errorData.message || "Request revoke failed"
        );
      }

      const data = await response.json();
      console.log("Friend request revoked successfully:", data);

      // Update AuthContext with the response data
      // The HTTP response contains { userId: id } which is the user we revoked the request from
      if (data && data.userId) {
        removeOutgoingFriendRequest(data.userId);
        showNotification("Arkadaşlık isteği iptal edildi!", "success");
      } else {
        console.log("No userId in response:", data);
      }
    } catch (error) {
      console.error("Friend request revoke error:", error);

      // Handle network errors
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        showNotification(translateRevokeMessage("Failed to fetch"), "error");
      } else {
        showNotification(translateRevokeMessage(error.message), "error");
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md pb-20">
      {/* Header - Profile Info */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
          Arkadaşlarım
        </h2>

        {/* User Profile Info */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center space-x-6">
            {/* Profile Photo */}
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
              {getProfilePictureUrl(user.profilePicture) ? (
                <img
                  src={getProfilePictureUrl(user.profilePicture)}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-500">
                  {user.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="flex space-x-8">
              <button
                onClick={() => navigate("/followers")}
                className="text-center hover:bg-gray-50 rounded-lg p-2 transition-colors cursor-pointer"
                tabIndex="0"
                aria-label="Takipçilerim sayfasına git"
              >
                <div className="text-2xl font-bold text-gray-900">
                  {followerCount || 0}
                </div>
                <div className="text-sm text-gray-600 hover:text-green-600 transition-colors">
                  Takipçilerim
                </div>
              </button>
              <button
                onClick={() => navigate("/following")}
                className="text-center hover:bg-gray-50 rounded-lg p-2 transition-colors cursor-pointer"
                tabIndex="0"
                aria-label="Takip ettiklerim sayfasına git"
              >
                <div className="text-2xl font-bold text-gray-900">
                  {user.friends?.length || 0}
                </div>
                <div className="text-sm text-gray-600 hover:text-green-600 transition-colors">
                  Takip Ettiklerim
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
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
          </div>
          <input
            type="text"
            placeholder="Arkadaşları ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab.id
                  ? "bg-green-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                    activeTab === tab.id
                      ? "bg-green-500 text-white"
                      : "bg-gray-300 text-gray-700"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Friends List */}
      <div className="p-6">
        {activeTab === "online" && onlineFriends.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Çevrimiçi — {onlineFriends.length}
            </h3>
            <div className="space-y-3">
              {onlineFriends.map((friend) => (
                <div
                  key={friend._id}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleUserClick(friend._id)}
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center overflow-hidden">
                      {friend.avatar ? (
                        <img
                          src={friend.avatar}
                          alt={friend.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-semibold text-sm">
                          {getInitials(friend.name)}
                        </span>
                      )}
                    </div>
                    <div
                      className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(
                        friend.status
                      )} rounded-full border-2 border-white`}
                    ></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {friend.name}
                    </p>
                    {friend.activity && (
                      <p className="text-xs text-gray-500 truncate">
                        {friend.activity}
                      </p>
                    )}
                    {friend.location && (
                      <p className="text-xs text-gray-400 truncate">
                        {friend.location.city}, {friend.location.district}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/messages/${friend._id}`);
                      }}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                    </button>
                    <button
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      onClick={(e) => {
                        e.stopPropagation(); /* Add more options */
                      }}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "all" && offlineFriends.length > 0 && (
          <div>
            {onlineFriends.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Çevrimiçi — {onlineFriends.length}
                </h3>
                <div className="space-y-3">
                  {onlineFriends.map((friend) => (
                    <div
                      key={friend._id}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => handleUserClick(friend._id)}
                    >
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center overflow-hidden">
                          {friend.avatar ? (
                            <img
                              src={friend.avatar}
                              alt={friend.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-white font-semibold text-sm">
                              {getInitials(friend.name)}
                            </span>
                          )}
                        </div>
                        <div
                          className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(
                            friend.status
                          )} rounded-full border-2 border-white`}
                        ></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {friend.name}
                        </p>
                        {friend.activity && (
                          <p className="text-xs text-gray-500 truncate">
                            {friend.activity}
                          </p>
                        )}
                        {friend.location && (
                          <p className="text-xs text-gray-400 truncate">
                            {friend.location.city}, {friend.location.district}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/messages/${friend._id}`);
                          }}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                          </svg>
                        </button>
                        <button
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          onClick={(e) => {
                            e.stopPropagation(); /* Add more options */
                          }}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Çevrimdışı — {offlineFriends.length}
              </h3>
              <div className="space-y-3">
                {offlineFriends.map((friend) => (
                  <div
                    key={friend._id}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors opacity-60 cursor-pointer"
                    onClick={() => handleUserClick(friend._id)}
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden">
                        {friend.avatar ? (
                          <img
                            src={friend.avatar}
                            alt={friend.name}
                            className="w-full h-full object-cover grayscale"
                          />
                        ) : (
                          <span className="text-white font-semibold text-sm">
                            {getInitials(friend.name)}
                          </span>
                        )}
                      </div>
                      <div
                        className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(
                          friend.status
                        )} rounded-full border-2 border-white`}
                      ></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">
                        {friend.name}
                      </p>
                      {friend.lastSeen && (
                        <p className="text-xs text-gray-500 truncate">
                          {friend.lastSeen}
                        </p>
                      )}
                      {friend.location && (
                        <p className="text-xs text-gray-400 truncate">
                          {friend.location.city}, {friend.location.district}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/messages/${friend._id}`);
                        }}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                      </button>
                      <button
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        onClick={(e) => {
                          e.stopPropagation(); /* Add more options */
                        }}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "online" && onlineFriends.length === 0 && (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
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
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Çevrimiçi arkadaş yok
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Şu anda çevrimiçi olan arkadaşınız bulunmuyor.
            </p>
          </div>
        )}

        {activeTab === "pending" && (
          <div>
            {/* Incoming Friend Requests Section */}
            {filteredIncomingRequests.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Gelen İstekler — {filteredIncomingRequests.length}
                </h3>
                <div className="space-y-3">
                  {filteredIncomingRequests.map((request) => (
                    <div
                      key={request._id}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => handleUserClick(request._id)}
                    >
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center overflow-hidden">
                          {request.avatar ? (
                            <img
                              src={request.avatar}
                              alt={request.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-white font-semibold text-sm">
                              {getInitials(request.name)}
                            </span>
                          )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                          <svg
                            className="w-2 h-2 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        {/* New Request Indicator */}
                        {!request.seen && (
                          <div className="absolute -top-1 -left-1 w-3 h-3 bg-red-500 rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {request.name}
                        </p>
                        <p className="text-xs text-blue-600 truncate">
                          Size arkadaşlık isteği gönderdi
                        </p>
                        {request.location && (
                          <p className="text-xs text-gray-400 truncate">
                            {request.location.city}, {request.location.district}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-1">
                        <button
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAcceptRequest(request._id);
                          }}
                          title="İsteği Kabul Et"
                          tabIndex="0"
                        >
                          <svg
                            className="w-4 h-4"
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
                        </button>
                        <button
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRejectRequest(request._id);
                          }}
                          title="İsteği Reddet"
                          tabIndex="0"
                        >
                          <svg
                            className="w-4 h-4"
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
                        <button
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSendRequest(request._id);
                          }}
                          title="İstek Gönder"
                          tabIndex="0"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Outgoing Friend Requests Section */}
            {filteredOutgoingRequests.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Gönderilen İstekler — {filteredOutgoingRequests.length}
                </h3>
                <div className="space-y-3">
                  {filteredOutgoingRequests.map((request) => (
                    <div
                      key={request._id}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => handleUserClick(request._id)}
                    >
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-yellow-600 flex items-center justify-center overflow-hidden">
                          {request.avatar ? (
                            <img
                              src={request.avatar}
                              alt={request.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-white font-semibold text-sm">
                              {getInitials(request.name)}
                            </span>
                          )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full border-2 border-white flex items-center justify-center">
                          <svg
                            className="w-2 h-2 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {request.name}
                        </p>
                        <p className="text-xs text-yellow-600 truncate">
                          Gönderdiğiniz arkadaşlık isteği bekliyor
                        </p>
                        {request.location && (
                          <p className="text-xs text-gray-400 truncate">
                            {request.location.city}, {request.location.district}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelRequest(request._id);
                          }}
                          title="İsteği İptal Et"
                          tabIndex="0"
                        >
                          <svg
                            className="w-4 h-4"
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
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {filteredPendingRequests.length === 0 && (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  Bekleyen istek yok
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Gelen veya gönderilen bekleyen arkadaşlık isteğiniz
                  bulunmuyor.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Notification */}
      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />
    </div>
  );
}

export default MyFriends;
