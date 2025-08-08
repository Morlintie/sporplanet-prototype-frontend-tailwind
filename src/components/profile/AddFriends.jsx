import { useState } from "react";

function AddFriends({ user }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  // Mock arama sonuçları
  const mockUsers = [
    {
      id: 1,
      name: "Ahmet Yılmaz",
      username: "ahmet_y",
      avatar: null,
      isFollowing: false,
      isPending: false,
      mutualFriends: 3
    },
    {
      id: 2,
      name: "Zeynep Kaya",
      username: "zeynep_k",
      avatar: "https://res.cloudinary.com/dppjlhdth/image/upload/v1745746418/SporPlanet_Transparent_Logo_hecyyn.png",
      isFollowing: false,
      isPending: false,
      mutualFriends: 1
    },
    {
      id: 3,
      name: "Mehmet Demir",
      username: "mehmet_d",
      avatar: null,
      isFollowing: false,
      isPending: true,
      mutualFriends: 0
    },
    {
      id: 4,
      name: "Ayşe Şahin",
      username: "ayse_s",
      avatar: null,
      isFollowing: true,
      isPending: false,
      mutualFriends: 5
    }
  ];

  const getInitials = (name) => {
    if (!name) return "?";
    const nameParts = name.split(' ').filter(part => part.length > 0);
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    
    // Simulate API call
    setTimeout(() => {
      const results = mockUsers.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(results);
      setIsSearching(false);
    }, 1000);
  };

  const handleFollowRequest = async (userId) => {
    // Simulate follow request
    const updatedResults = searchResults.map(user => {
      if (user.id === userId) {
        return { ...user, isPending: true };
      }
      return user;
    });
    setSearchResults(updatedResults);
  };

  const handleUnfollow = async (userId) => {
    // Simulate unfollow
    const updatedResults = searchResults.map(user => {
      if (user.id === userId) {
        return { ...user, isFollowing: false };
      }
      return user;
    });
    setSearchResults(updatedResults);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">Arkadaş Ekle</h2>
      
      {/* Search Section */}
      <div className="mb-6">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Kullanıcı adı veya isim ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching || !searchTerm.trim()}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold px-6 py-2 rounded-md transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center space-x-2"
            tabIndex="0"
          >
            {isSearching ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Aranıyor...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Ara</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Search Results */}
      <div>
        {searchResults.length > 0 ? (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Arama Sonuçları ({searchResults.length})
            </h3>
            <div className="space-y-4">
              {searchResults.map((foundUser) => (
                <div key={foundUser.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center overflow-hidden">
                      {foundUser.avatar ? (
                        <img
                          src={foundUser.avatar}
                          alt={foundUser.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-semibold">
                          {getInitials(foundUser.name)}
                        </span>
                      )}
                    </div>
                    
                    {/* User Info */}
                    <div>
                      <h4 className="font-semibold text-gray-900">{foundUser.name}</h4>
                      <p className="text-sm text-gray-600">@{foundUser.username}</p>
                      {foundUser.mutualFriends > 0 && (
                        <p className="text-xs text-green-600">
                          {foundUser.mutualFriends} ortak arkadaş
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Action Button */}
                  <div>
                    {foundUser.isFollowing ? (
                      <button
                        onClick={() => handleUnfollow(foundUser.id)}
                        className="bg-gray-600 hover:bg-gray-700 text-white font-semibold px-4 py-2 rounded-md transition-colors cursor-pointer text-sm"
                        tabIndex="0"
                      >
                        Takip Ediliyor
                      </button>
                    ) : foundUser.isPending ? (
                      <button
                        disabled
                        className="bg-yellow-500 text-white font-semibold px-4 py-2 rounded-md cursor-not-allowed text-sm"
                      >
                        İstek Gönderildi
                      </button>
                    ) : (
                      <button
                        onClick={() => handleFollowRequest(foundUser.id)}
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-md transition-colors cursor-pointer text-sm"
                        tabIndex="0"
                      >
                        Takip Et
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : searchTerm && !isSearching ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Sonuç bulunamadı</h3>
            <p className="mt-1 text-sm text-gray-500">
              "{searchTerm}" için herhangi bir kullanıcı bulunamadı.
            </p>
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Arkadaş Ara</h3>
            <p className="mt-1 text-sm text-gray-500">
              Yeni arkadaşlar bulmak için yukarıdaki arama kutusunu kullanın.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AddFriends;
