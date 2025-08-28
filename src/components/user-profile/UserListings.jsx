import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

function UserListings({ user }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("participated");

  // Backend-compatible listings data using user's advertParticipation and advertWaitingList
  const listings = useMemo(() => {
    return {
      participated: user?.advertParticipation || [],
      waiting: user?.advertWaitingList || [],
    };
  }, [user]);

  if (!user) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">
          Kullanıcı bilgileri yüklenemedi.
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusText = (status) => {
    const statusMap = {
      open: "Açık",
      full: "Dolu",
      cancelled: "İptal",
      completed: "Tamamlandı",
      expired: "Süresi Doldu",
    };
    return statusMap[status] || status;
  };

  const getLevelText = (level) => {
    const levelMap = {
      beginner: "Başlangıç",
      intermediate: "Orta",
      advanced: "İleri",
      professional: "Profesyonel",
      pro: "Pro",
    };
    return levelMap[level] || level;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      open: "bg-green-100 text-green-700",
      full: "bg-blue-100 text-blue-700",
      cancelled: "bg-red-100 text-red-700",
      completed: "bg-gray-100 text-gray-700",
      expired: "bg-yellow-100 text-yellow-700",
    };
    return colorMap[status] || "bg-gray-100 text-gray-700";
  };

  const handleAdvertClick = (advertId) => {
    navigate(`/advert/${advertId}`);
  };

  const currentListings = listings[activeTab] || [];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {user.name} - İlanları
        </h1>
        <p className="text-gray-600">
          Bu kullanıcının oluşturduğu ve katıldığı maç ilanları
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
        <button
          onClick={() => setActiveTab("participated")}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === "participated"
              ? "bg-white text-green-700 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Katıldığı İlanlar ({listings.participated.length})
        </button>
        <button
          onClick={() => setActiveTab("waiting")}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === "waiting"
              ? "bg-white text-green-700 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Bekleyen İlanlar ({listings.waiting.length})
        </button>
      </div>

      {/* Listings */}
      {currentListings.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Henüz İlan Yok
          </h3>
          <p className="text-gray-600">
            {activeTab === "participated"
              ? "Bu kullanıcı henüz hiçbir ilana katılmamış."
              : "Bu kullanıcı henüz hiçbir ilanda bekleme listesinde değil."}
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {currentListings.map((listing) => (
            <div
              key={listing._id}
              onClick={() => handleAdvertClick(listing._id)}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {listing.name}
                    </h3>
                    <div className="flex gap-2 flex-shrink-0 ml-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          listing.status
                        )}`}
                      >
                        {getStatusText(listing.status)}
                      </span>
                      {listing.level && (
                        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">
                          {getLevelText(listing.level)}
                        </span>
                      )}
                    </div>
                  </div>

                  {listing.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {listing.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>
                        {formatDate(listing.startsAt)} -{" "}
                        {formatTime(listing.startsAt)}
                      </span>
                    </div>
                    {listing.participants && (
                      <div className="flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                        </svg>
                        <span>{listing.participants.length} katılımcı</span>
                      </div>
                    )}
                    {listing.waitingList && listing.waitingList.length > 0 && (
                      <div className="flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>{listing.waitingList.length} bekleyen</span>
                      </div>
                    )}
                  </div>

                  {/* Additional Info */}
                  <div className="flex flex-wrap gap-2">
                    {listing.createdBy && (
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                        Organizatör ID: {listing.createdBy}
                      </span>
                    )}
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                      İlan ID: {listing._id}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserListings;
