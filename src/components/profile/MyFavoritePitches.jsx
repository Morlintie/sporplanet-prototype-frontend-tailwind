import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Notification from "../shared/Notification";
import LocationPermissionPopup from "../shared/LocationPermissionPopup";

function MyFavoritePitches() {
  const [searchTerm, setSearchTerm] = useState("");
  const [removingPitchId, setRemovingPitchId] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState("success");
  const [isSearching, setIsSearching] = useState(false);
  const [showRemovePopup, setShowRemovePopup] = useState(false);
  const [pitchToRemove, setPitchToRemove] = useState(null);

  const navigate = useNavigate();
  const { getFavoritePitches, updateUser } = useAuth();

  // Get favorite pitches from user data - using real backend data
  const favoritePitches = getFavoritePitches().map((fav) => {
    // Primary image selection logic - prioritize isPrimary, then first image
    const primaryImage = fav.media?.images?.find((img) => img.isPrimary);
    const firstImage = fav.media?.images?.[0];

    const imageUrl = primaryImage?.url || firstImage?.url;

    return {
      id: fav._id,
      name: fav.name,
      image: imageUrl,
      location: `${fav.location?.address?.neighborhood || ""}, ${
        fav.location?.address?.city || ""
      }`,
      rating: fav.rating?.averageRating || 0,
      totalReviews: fav.rating?.totalReviews || 0,
      price: `${fav.pricing?.hourlyRate || "N/A"}₺/saat`,

      category: fav.category || "Futbol",
      features: [
        ...(fav.facilities?.changingRooms ? ["Soyunma Odası"] : []),
        ...(fav.facilities?.showers ? ["Duş"] : []),
        ...(fav.facilities?.parking ? ["Otopark"] : []),
        ...(fav.specifications?.hasLighting ? ["Işıklandırma"] : []),
        ...(fav.specifications?.isIndoor ? ["Kapalı"] : ["Açık"]),
        ...(fav.facilities?.camera ? ["Kamera"] : []),
        ...(fav.facilities?.shoeRenting ? ["Ayakkabı Kiralama"] : []),
      ],
    };
  });

  const showNotificationMessage = (message, type = "success") => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
  };

  const handleRemoveFromFavorites = (pitchId) => {
    setPitchToRemove(pitchId);
    setShowRemovePopup(true);
  };

  const confirmRemoveFromFavorites = async () => {
    if (!pitchToRemove) return;

    setRemovingPitchId(pitchToRemove);

    try {
      const response = await fetch(
        `/api/v1/user/removeFavoritePitch/${pitchToRemove}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Update user context with new user data
        updateUser(data.user);
        showNotificationMessage("Saha favorilerden kaldırıldı.", "success");
      } else {
        const errorData = await response.json();
        showNotificationMessage(
          errorData.msg || "Saha favorilerden kaldırılırken bir hata oluştu.",
          "error"
        );
      }
    } catch (error) {
      console.error("Remove from favorites error:", error);
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        showNotificationMessage(
          "Bağlantı hatası oluştu. Lütfen tekrar deneyin.",
          "error"
        );
      } else {
        showNotificationMessage(
          "Bir hata oluştu. Lütfen tekrar deneyin.",
          "error"
        );
      }
    } finally {
      setRemovingPitchId(null);
      setPitchToRemove(null);
      setShowRemovePopup(false);
    }
  };

  const cancelRemoveFromFavorites = () => {
    setShowRemovePopup(false);
    setPitchToRemove(null);
  };

  // Frontend search functionality
  const filteredPitches = favoritePitches.filter((pitch) => {
    if (!searchTerm.trim()) {
      return true; // Show all pitches if no search term
    }

    const searchLower = searchTerm.toLowerCase().trim();

    // Search in pitch name
    if (pitch.name.toLowerCase().includes(searchLower)) {
      return true;
    }

    // Search in location
    if (pitch.location.toLowerCase().includes(searchLower)) {
      return true;
    }

    // Search in features
    if (
      pitch.features.some((feature) =>
        feature.toLowerCase().includes(searchLower)
      )
    ) {
      return true;
    }

    // Search in price (remove ₺/saat and search in numbers)
    const priceText = pitch.price.replace("₺/saat", "").trim();
    if (priceText !== "N/A" && priceText.includes(searchTerm)) {
      return true;
    }

    // Search in rating
    if (pitch.rating.toString().includes(searchTerm)) {
      return true;
    }

    return false;
  });

  const handleViewPitch = (pitchId) => {
    window.scrollTo(0, 0);
    navigate(`/pitch-detail/${pitchId}`);
  };

  // Handle escape key to clear search
  const handleKeyDown = (e) => {
    if (e.key === "Escape" && searchTerm) {
      setSearchTerm("");
      setIsSearching(false);
    }
  };

  // Handle search input change with spinner effect
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Show spinner for a brief moment to simulate search processing
    if (value.trim()) {
      setIsSearching(true);
      // Hide spinner after a short delay to give smooth search feel
      setTimeout(() => {
        setIsSearching(false);
      }, 300);
    } else {
      setIsSearching(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">
          Favori Sahalarım
        </h2>
        <div className="flex items-center justify-end mb-4">
          <div className="flex items-center space-x-2">
            <svg
              className="w-6 h-6 text-red-500"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span className="text-lg font-semibold text-gray-700">
              {favoritePitches.length} Saha
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {isSearching ? (
              <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            ) : (
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
            )}
          </div>
          <input
            type="text"
            placeholder="Saha ara..."
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("");
                setIsSearching(false);
              }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer hover:text-gray-600 transition-colors"
              title="Aramayı temizle"
            >
              <svg
                className="h-5 w-5 text-gray-400 hover:text-gray-600"
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
          )}
        </div>

        {/* Search Results Counter */}
        {searchTerm && (
          <div className="mt-3 text-center">
            <p className="text-sm text-gray-600">
              {isSearching ? (
                <span className="inline-flex items-center">
                  <div className="w-3 h-3 border-2 border-green-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                  Aranıyor...
                </span>
              ) : (
                <>
                  <span className="font-medium">{filteredPitches.length}</span>{" "}
                  saha bulundu
                  {filteredPitches.length !== favoritePitches.length && (
                    <span className="text-gray-500">
                      {" "}
                      (toplam {favoritePitches.length} saha)
                    </span>
                  )}
                </>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Pitches Grid */}
      <div className="p-6">
        {filteredPitches.length > 0 ? (
          <div
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-200 ${
              isSearching ? "opacity-75" : "opacity-100"
            }`}
          >
            {filteredPitches.map((pitch) => (
              <div
                key={pitch.id}
                className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative">
                  <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                    <img
                      src={pitch.image}
                      alt={pitch.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    onClick={() => handleRemoveFromFavorites(pitch.id)}
                    disabled={removingPitchId === pitch.id}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    title="Favorilerden kaldır"
                  >
                    {removingPitchId === pitch.id ? (
                      <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg
                        className="w-5 h-5 text-red-500"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    )}
                  </button>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {pitch.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2 flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {pitch.location}
                  </p>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <svg
                        className="w-4 h-4 text-yellow-400 mr-1"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      <span className="text-sm text-gray-600">
                        {pitch.rating > 0 ? pitch.rating : "N/A"}
                        {pitch.totalReviews > 0 && (
                          <span className="text-xs text-gray-500 ml-1">
                            ({pitch.totalReviews})
                          </span>
                        )}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-green-600">
                      {pitch.price}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {pitch.features.slice(0, 3).map((feature, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded"
                      >
                        {feature}
                      </span>
                    ))}
                    {pitch.features.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded">
                        +{pitch.features.length - 3}
                      </span>
                    )}
                  </div>

                  <div className="flex justify-center mb-3">
                    <button
                      onClick={() => handleViewPitch(pitch.id)}
                      className="w-4/5 bg-[rgb(0,128,0)] hover:bg-[rgb(0,100,0)] text-white font-semibold py-2 px-4 rounded-md transition-colors cursor-pointer focus:outline-none"
                      tabIndex="0"
                      aria-label="Sahayı görüntüle"
                    >
                      Sahayı Görüntüle
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {searchTerm
                ? "Arama sonucu bulunamadı"
                : "Favori saha bulunamadı"}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm
                ? `"${searchTerm}" aramasına uygun favori saha bulunamadı.`
                : "Henüz favori sahanız bulunmuyor."}
            </p>
          </div>
        )}
      </div>

      {/* Notification Component */}
      <Notification
        message={notificationMessage}
        type={notificationType}
        isVisible={showNotification}
        onClose={() => setShowNotification(false)}
      />

      {/* Remove from Favorites Confirmation Popup */}
      <LocationPermissionPopup
        isVisible={showRemovePopup}
        onAccept={confirmRemoveFromFavorites}
        onDecline={cancelRemoveFromFavorites}
        title="Favorilerden Kaldır"
        message="Bu sahayı favorilerinizden kaldırmak istediğinizden emin misiniz? Bu işlem geri alınamaz."
        acceptText="Evet, Kaldır"
        declineText="İptal"
        icon="delete"
        infoTitle="Favori Saha Kaldırma"
        infoMessage="Favorilerden kaldırılan saha, favori sahalarınız listesinden çıkarılacaktır. Daha sonra tekrar favorilere ekleyebilirsiniz."
        showInfo={true}
      />
    </div>
  );
}

export default MyFavoritePitches;
