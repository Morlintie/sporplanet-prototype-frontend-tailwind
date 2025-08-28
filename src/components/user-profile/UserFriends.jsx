import { useState } from "react";
import { useNavigate } from "react-router-dom";

function UserFriends({ user }) {
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">
          Kullanıcı bilgileri yüklenemedi.
        </div>
      </div>
    );
  }

  const friends = user.friends || [];

  const formatDate = (dateString) => {
    if (!dateString) return "Bilinmiyor";
    const date = new Date(dateString);
    return date.toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getRoleText = (role) => {
    switch (role) {
      case "admin":
        return "Admin";
      case "companyOwner":
        return "Şirket Sahibi";
      case "banned":
        return "Yasaklı";
      case "user":
      default:
        return "Kullanıcı";
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-700";
      case "companyOwner":
        return "bg-yellow-100 text-yellow-700";
      case "banned":
        return "bg-red-100 text-red-700";
      case "user":
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const handleViewFriend = (friendId) => {
    navigate(`/user/${friendId}`);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {user.name} - Arkadaşları
        </h1>
        <p className="text-gray-600">
          Bu kullanıcının arkadaş listesi ({friends.length} arkadaş)
        </p>
      </div>

      {/* Friends List */}
      {friends.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Henüz Arkadaş Yok
          </h3>
          <p className="text-gray-600">
            Bu kullanıcının henüz hiç arkadaşı bulunmuyor.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {friends.map((friend) => (
            <div
              key={friend._id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              {/* Friend Header */}
              <div className="flex items-start gap-4 mb-4">
                {/* Avatar */}
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                  <img
                    src={friend.profilePicture?.url || "/default-avatar.png"}
                    alt={friend.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "/default-avatar.png";
                    }}
                  />
                </div>

                {/* Basic Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {friend.name}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${getRoleBadgeColor(
                            friend.role
                          )}`}
                        >
                          {getRoleText(friend.role)}
                        </span>
                        {friend.goalKeeper && (
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                            Kaleci
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2">
                    {friend.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>
                          {friend.location.city}, {friend.location.district}
                        </span>
                      </div>
                    )}

                    {friend.age && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>{friend.age} yaşında</span>
                      </div>
                    )}

                    {friend.school && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                        </svg>
                        <span>{friend.school}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Arkadaş: {formatDate(friend.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => handleViewFriend(friend._id)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  Profili Görüntüle
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserFriends;
