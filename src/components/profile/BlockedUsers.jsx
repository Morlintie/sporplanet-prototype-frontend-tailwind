import { useState } from "react";

function BlockedUsers({ user }) {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock engellenen kullanıcılar
  const blockedUsers = [
    {
      id: 1,
      name: "Toksik Oyuncu",
      username: "toxic_player",
      avatar: null,
      blockedDate: "2024-01-15",
      reason: "Uygunsuz davranış"
    },
    {
      id: 2,
      name: "Spam Hesabı",
      username: "spam_account",
      avatar: null,
      blockedDate: "2024-01-10",
      reason: "Spam mesajlar"
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleUnblock = async (userId) => {
    if (window.confirm('Bu kullanıcının engelini kaldırmak istediğinizden emin misiniz?')) {
      // Simulate API call
      console.log(`Unblocking user ${userId}`);
      // Here you would make an API call to unblock the user
    }
  };

  const filteredBlockedUsers = blockedUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">Engellenen Kullanıcılar</h2>
      
      {/* Search */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Engellenen kullanıcıları ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
      </div>

      {/* Blocked Users List */}
      <div>
        {filteredBlockedUsers.length > 0 ? (
          <div className="space-y-4">
            {filteredBlockedUsers.map((blockedUser) => (
              <div key={blockedUser.id} className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center overflow-hidden">
                    {blockedUser.avatar ? (
                      <img
                        src={blockedUser.avatar}
                        alt={blockedUser.name}
                        className="w-full h-full object-cover grayscale"
                      />
                    ) : (
                      <span className="text-white font-semibold">
                        {getInitials(blockedUser.name)}
                      </span>
                    )}
                  </div>
                  
                  {/* User Info */}
                  <div>
                    <h4 className="font-semibold text-gray-900">{blockedUser.name}</h4>
                    <p className="text-sm text-gray-600">@{blockedUser.username}</p>
                    <p className="text-xs text-red-600">
                      {formatDate(blockedUser.blockedDate)} tarihinde engellendi
                    </p>
                    {blockedUser.reason && (
                      <p className="text-xs text-gray-500 mt-1">
                        Sebep: {blockedUser.reason}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Unblock Button */}
                <div>
                  <button
                    onClick={() => handleUnblock(blockedUser.id)}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-md transition-colors cursor-pointer text-sm"
                    tabIndex="0"
                  >
                    Engeli Kaldır
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : blockedUsers.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Engellenen kullanıcı yok</h3>
            <p className="mt-1 text-sm text-gray-500">
              Henüz hiç kullanıcı engellemediniz.
            </p>
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Sonuç bulunamadı</h3>
            <p className="mt-1 text-sm text-gray-500">
              "{searchTerm}" için engellenen kullanıcı bulunamadı.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default BlockedUsers;
