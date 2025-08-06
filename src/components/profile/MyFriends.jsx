import { useState } from "react";

function MyFriends({ user }) {
  const [activeTab, setActiveTab] = useState("online");
  const [searchTerm, setSearchTerm] = useState("");

  // Mock arkadaş verileri
  const friends = [
    {
      id: 1,
      name: "MaSSer",
      avatar: "https://res.cloudinary.com/dppjlhdth/image/upload/v1745746418/SporPlanet_Transparent_Logo_hecyyn.png",
      status: "online",
      activity: "Far Cry 4 oynuyor",
      lastSeen: null
    },
    {
      id: 2,
      name: "Phyrex",
      avatar: null,
      status: "online",
      activity: "Spotify'da müzik dinliyor",
      lastSeen: null
    },
    {
      id: 3,
      name: "Yorgo",
      avatar: "https://res.cloudinary.com/dppjlhdth/image/upload/v1745746418/SporPlanet_Transparent_Logo_hecyyn.png",
      status: "online",
      activity: "Halısaha maçı arıyor",
      lastSeen: null
    },
    {
      id: 4,
      name: "DeVoe",
      avatar: null,
      status: "offline",
      activity: null,
      lastSeen: "1294 gün önce"
    },
    {
      id: 5,
      name: "Klein",
      avatar: null,
      status: "offline",
      activity: null,
      lastSeen: "21 gün önce"
    },
    {
      id: 6,
      name: "Larisa",
      avatar: null,
      status: "offline",
      activity: null,
      lastSeen: "3 saat önce"
    },
    {
      id: 7,
      name: "menesay005",
      avatar: null,
      status: "offline",
      activity: null,
      lastSeen: "46 gün önce"
    },
    {
      id: 8,
      name: "Mergen",
      avatar: null,
      status: "offline",
      activity: null,
      lastSeen: "27 gün önce"
    },
    {
      id: 9,
      name: "muhammedbayram4444",
      avatar: null,
      status: "offline",
      activity: null,
      lastSeen: "16 saat önce"
    },
    {
      id: 10,
      name: "NYmeX+",
      avatar: null,
      status: "offline",
      activity: null,
      lastSeen: "12 gün önce"
    },
    {
      id: 11,
      name: "STICK",
      avatar: null,
      status: "offline",
      activity: null,
      lastSeen: "8 gün önce"
    },
    {
      id: 12,
      name: "G A G A V U Z",
      avatar: null,
      status: "offline",
      activity: null,
      lastSeen: "5 gün önce"
    }
  ];

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

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onlineFriends = filteredFriends.filter(friend => friend.status === "online");
  const offlineFriends = filteredFriends.filter(friend => friend.status === "offline");

  const tabs = [
    { id: "online", label: "Çevrimiçi", count: onlineFriends.length },
    { id: "all", label: "Tümü", count: filteredFriends.length },
    { id: "pending", label: "Bekleyen", count: 0 },
    { id: "blocked", label: "Engellenen", count: 0 }
  ];

  const getFriendsToShow = () => {
    switch (activeTab) {
      case "online":
        return onlineFriends;
      case "all":
        return [...onlineFriends, ...offlineFriends];
      case "pending":
        return [];
      case "blocked":
        return [];
      default:
        return filteredFriends;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">Arkadaşlarım</h2>
        
        {/* Search */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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
                <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                  activeTab === tab.id
                    ? "bg-green-500 text-white"
                    : "bg-gray-300 text-gray-700"
                }`}>
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
                <div key={friend.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
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
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(friend.status)} rounded-full border-2 border-white`}></div>
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
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </button>
                    <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
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
                    <div key={friend.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
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
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(friend.status)} rounded-full border-2 border-white`}></div>
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
                      </div>
                      <div className="flex space-x-2">
                        <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </button>
                        <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
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
                  <div key={friend.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors opacity-60">
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
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(friend.status)} rounded-full border-2 border-white`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">
                        {friend.name}
                      </p>
                      {friend.lastSeen && (
                        <p className="text-xs text-gray-500 truncate">
                          Son çevrimiçi {friend.lastSeen}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </button>
                      <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
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
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Çevrimiçi arkadaş yok</h3>
            <p className="mt-1 text-sm text-gray-500">Şu anda çevrimiçi olan arkadaşınız bulunmuyor.</p>
          </div>
        )}

        {(activeTab === "pending" || activeTab === "blocked") && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {activeTab === "pending" ? "Bekleyen istek yok" : "Engellenen kullanıcı yok"}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {activeTab === "pending" 
                ? "Bekleyen arkadaşlık isteğiniz bulunmuyor." 
                : "Engellediğiniz kullanıcı bulunmuyor."
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyFriends;