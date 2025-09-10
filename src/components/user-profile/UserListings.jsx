import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

function UserListings({ user }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("participated");

  // Backend-compatible listings data using user's advertParticipation and advertWaitingList
  const listings = useMemo(() => {
    console.log("UserListings: Full user data:", user);
    console.log("UserListings: advertParticipation:", user?.advertParticipation);
    console.log("UserListings: advertWaitingList:", user?.advertWaitingList);
    
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

  // Helper function to get status label and color
  const getAdvertStatus = (advert) => {
    const now = new Date();
    const startDate = new Date(advert.startsAt);

    if (advert.isDeleted || advert.archived) {
      return {
        label: "Silindi",
        color: "bg-red-500 text-white",
        status: "deleted",
      };
    }

    if (advert.status === "cancelled") {
      return {
        label: "İptal Edildi",
        color: "bg-orange-500 text-white",
        status: "cancelled",
      };
    }

    if (advert.status === "full") {
      return { label: "Dolu", color: "bg-blue-500 text-white", status: "full" };
    }

    if (startDate < now) {
      return {
        label: "Tamamlandı",
        color: "bg-gray-500 text-white",
        status: "completed",
      };
    }

    if (advert.status === "open") {
      return {
        label: "Açık",
        color: "bg-green-500 text-white",
        status: "open",
      };
    }

    return {
      label: "Bilinmeyen",
      color: "bg-gray-400 text-white",
      status: "unknown",
    };
  };

  // Helper function to get time range
  const getTimeRange = (advert) => {
    const startTime = new Date(advert.startsAt);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // Add 1 hour

    const startTimeStr = startTime.toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const endTimeStr = endTime.toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return `${startTimeStr} - ${endTimeStr}`;
  };

  // Helper function to get pitch name
  const getPitchName = (advert) => {
    console.log("UserListings: getPitchName - advert:", advert);
    
    // Check for booking pitch name
    if (advert.booking && advert.booking.pitch && advert.booking.pitch.name) {
      return advert.booking.pitch.name;
    }
    // Check for custom pitch
    if (advert.customPitch && advert.customPitch.name) {
      return advert.customPitch.name;
    }
    // Check for direct pitch object
    if (advert.pitch && typeof advert.pitch === "object" && advert.pitch.name) {
      return advert.pitch.name;
    }
    // Fallback to the name field
    if (advert.name) {
      return advert.name;
    }
    return "Saha Bilgisi Yok";
  };

  // Helper function to get creator name
  const getCreatorName = (advert) => {
    console.log("UserListings: getCreatorName - advert.createdBy:", advert.createdBy);
    console.log("UserListings: user data for comparison:", user);
    
    // If createdBy is an object with name, use it
    if (typeof advert.createdBy === 'object' && advert.createdBy?.name) {
      return advert.createdBy.name;
    }
    
    // If createdBy is a string ID and matches current user's ID, show user's name
    if (typeof advert.createdBy === 'string' && advert.createdBy === user?._id) {
      return user.name;
    }
    
    return "Bilinmiyor";
  };

  // Helper function to get creator ID
  const getCreatorId = (advert) => {
    if (typeof advert.createdBy === 'object' && advert.createdBy?._id) {
      return advert.createdBy._id;
    }
    if (typeof advert.createdBy === 'string') {
      return advert.createdBy;
    }
    return null;
  };

  // Helper function to get pitch ID
  const getPitchId = (advert) => {
    if (advert.booking && advert.booking.pitch && advert.booking.pitch._id) {
      return advert.booking.pitch._id;
    }
    if (advert.pitch && typeof advert.pitch === "object" && advert.pitch._id) {
      return advert.pitch._id;
    }
    return null;
  };

  const handleAdvertClick = (advert) => {
    console.log("UserListings: handleAdvertClick - full advert object:", advert);
    console.log("UserListings: advert._id:", advert._id);
    console.log("UserListings: advert.id:", advert.id);
    
    const advertId = advert._id || advert.id;
    console.log("UserListings: Final advertId to navigate:", advertId);
    
    if (advertId) {
      navigate(`/advert/${advertId}`);
    } else {
      console.error("UserListings: No valid advert ID found:", advert);
    }
  };

  const handleCreatorClick = (e, advert) => {
    e.stopPropagation();
    const creatorId = getCreatorId(advert);
    if (creatorId) {
      console.log("UserListings: Navigating to creator:", creatorId);
      navigate(`/user/${creatorId}`);
    }
  };

  const handlePitchClick = (e, advert) => {
    e.stopPropagation();
    const pitchId = getPitchId(advert);
    if (pitchId) {
      console.log("UserListings: Navigating to pitch:", pitchId);
      navigate(`/pitch/${pitchId}`);
    }
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
          {currentListings.map((listing) => {
            const status = getAdvertStatus(listing);
            const pitchName = getPitchName(listing);
            const creatorName = getCreatorName(listing);
            const timeRange = getTimeRange(listing);
            
            return (
              <div
                key={listing._id || listing.id}
                onClick={() => handleAdvertClick(listing)}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {listing.name || "İlan Başlığı Yok"}
                      </h3>
                      <div className="flex gap-2 flex-shrink-0 ml-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          {status.label}
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
                      {listing.startsAt && (
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
                            {formatDate(listing.startsAt)} - {timeRange}
                          </span>
                        </div>
                      )}
                      {listing.participants && (
                        <div className="flex items-center gap-1">
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                          </svg>
                          <span>{listing.participants.length || 0} katılımcı</span>
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
                      <button
                        onClick={(e) => handleCreatorClick(e, listing)}
                        className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs hover:bg-gray-200 transition-colors"
                      >
                        Kurucu: {creatorName}
                      </button>
                      
                      {getPitchId(listing) ? (
                        <button
                          onClick={(e) => handlePitchClick(e, listing)}
                          className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs hover:bg-blue-200 transition-colors"
                        >
                          Saha: {pitchName}
                        </button>
                      ) : (
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                          Saha: {pitchName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default UserListings;
