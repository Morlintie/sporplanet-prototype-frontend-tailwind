import { useState, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { useWebSocket } from "../../context/WebSocketContext";
import { useNavigate } from "react-router-dom";

function MyFriends({ user }) {
  const { getProfilePictureUrl } = useAuth();
  const { isUserOnline } = useWebSocket();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("online");
  const [searchTerm, setSearchTerm] = useState("");

  // Process friends data with real-time online status
  const friends = useMemo(() => {
    if (!user?.friends) return [];

    return user.friends.map((friend) => ({
      _id: friend._id,
      name: friend.name,
      email: friend.email,
      avatar: getProfilePictureUrl(friend.profilePicture),
      status: isUserOnline(friend._id) ? "online" : "offline",
      activity: isUserOnline(friend._id) ? "Aktif" : null,
      lastSeen: !isUserOnline(friend._id) ? "Son çevrimiçi bilinmiyor" : null,
      school: friend.school,
      age: friend.age,
      location: friend.location,
      goalKeeper: friend.goalKeeper,
      role: friend.role,
      createdAt: friend.createdAt,
      updatedAt: friend.updatedAt,
    }));
  }, [user?.friends, isUserOnline, getProfilePictureUrl]);

  // Process pending friend requests
  const pendingRequests = useMemo(() => {
    if (!user?.selfFriendRequests) return [];

    return user.selfFriendRequests.map((request) => ({
      _id: request._id,
      name: request.name,
      email: request.email,
      avatar: getProfilePictureUrl(request.profilePicture),
      status: "pending",
      activity: null,
      lastSeen: null,
      school: request.school,
      age: request.age,
      location: request.location,
      goalKeeper: request.goalKeeper,
      role: request.role,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
    }));
  }, [user?.selfFriendRequests, getProfilePictureUrl]);

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

  const filteredPendingRequests = pendingRequests.filter((request) =>
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

  return (
    <div className="bg-white rounded-lg shadow-md">
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
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {user.friendRequests?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Takipçilerim</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {user.friends?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Takip Ettiklerim</div>
              </div>
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
                        e.stopPropagation(); /* Add message functionality */
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
                            e.stopPropagation(); /* Add message functionality */
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
                          e.stopPropagation(); /* Add message functionality */
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
            {filteredPendingRequests.length > 0 ? (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Bekleyen İstekler — {filteredPendingRequests.length}
                </h3>
                <div className="space-y-3">
                  {filteredPendingRequests.map((request) => (
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
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
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
                          Bekleyen arkadaşlık isteği
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
                            e.stopPropagation(); /* Add cancel request functionality */
                          }}
                          title="İsteği İptal Et"
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
            ) : (
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
                  Bekleyen arkadaşlık isteğiniz bulunmuyor.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyFriends;
