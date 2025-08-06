import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

function PitchFeaturesSection({ pitch, onNotification }) {
  const { user, isAuthenticated, updateUser } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);

  // Error message translation function
  const translateMessage = (message) => {
    const translations = {
      // Network errors
      "Failed to fetch":
        "Bağlantı hatası oluştu. İnternet bağlantınızı kontrol edin.",
      "Network Error": "Ağ hatası oluştu. Lütfen tekrar deneyin.",

      // Backend error messages
      "You have been banned, please get contact with our customer service.":
        "Hesabınız askıya alınmıştır. Müşteri hizmetleri ile iletişime geçin.",
      "Please provide required data.": "Gerekli bilgileri girin.",
      "Pitch not found.": "Saha bulunamadı.",

      // Generic errors
      "Something went wrong": "Bir şeyler ters gitti. Lütfen tekrar deneyin.",
      "Server Error": "Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.",
    };

    return (
      translations[message] ||
      "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin."
    );
  };

  // Check if pitch is in user's favorites
  useEffect(() => {
    if (isAuthenticated && user && user.favoritePitches) {
      const isFav = user.favoritePitches.some(
        (favPitch) => (favPitch._id || favPitch) === pitch.id
      );
      setIsFavorite(isFav);
    } else {
      setIsFavorite(false);
    }
  }, [isAuthenticated, user, pitch.id]);

  const handleFavoriteToggle = async () => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      if (onNotification) {
        onNotification(
          "Favorilere eklemek için giriş yapmanız gerekiyor.",
          "warning"
        );
      }
      return;
    }

    // Store original state for potential revert
    const originalIsFavorite = isFavorite;

    // Immediately update UI to the new state
    setIsFavorite(!isFavorite);

    try {
      const endpoint = originalIsFavorite
        ? `/api/v1/user/removeFavoritePitch/${pitch.id}`
        : `/api/v1/user/addFavoritePitch/${pitch.id}`;

      const method = originalIsFavorite ? "DELETE" : "PATCH";

      console.log(
        `${originalIsFavorite ? "Removing" : "Adding"} favorite pitch:`,
        pitch.id
      );

      const response = await fetch(endpoint, {
        method: method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        let errorMessage = "Something went wrong";

        try {
          const errorData = await response.json();
          if (errorData.msg) {
            errorMessage = errorData.msg;
          }
        } catch (parseError) {
          if (response.status === 400) {
            errorMessage = "Please provide required data.";
          } else if (response.status === 401) {
            errorMessage = "Giriş yapmanız gerekiyor.";
          } else if (response.status === 403) {
            errorMessage =
              "You have been banned, please get contact with our customer service.";
          } else if (response.status === 404) {
            errorMessage = "Pitch not found.";
          } else if (response.status >= 500) {
            errorMessage = "Server Error";
          }
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Favorite operation successful:", data);

      // Update user in AuthContext with new user data
      if (data.user) {
        updateUser(data.user);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);

      // Revert to original state on error
      setIsFavorite(originalIsFavorite);

      // Handle network errors
      let translatedError;
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        translatedError = translateMessage("Failed to fetch");
      } else {
        translatedError = translateMessage(error.message);
      }

      if (onNotification) {
        onNotification(translatedError, "error");
      }
    }
  };
  // Çim tipi belirle
  const getSurfaceTypeFeature = () => {
    switch (pitch.surfaceType) {
      case "artificial_turf":
        return { key: "surfaceType", label: "Yapay Çim", category: "Zemin" };
      case "natural_grass":
        return { key: "naturalGrass", label: "Doğal Çim", category: "Zemin" };
      case "indoor_court":
        return { key: "indoorCourt", label: "Kapalı Kort", category: "Zemin" };
      default:
        return { key: "surfaceType", label: "Yapay Çim", category: "Zemin" };
    }
  };

  // Saha tipi belirle (açık/kapalı)
  const getPitchTypeFeature = () => {
    if (pitch.pitchType === "indoor") {
      return { key: "isIndoor", label: "Kapalı Saha", category: "Yapı" };
    } else {
      return { key: "isOutdoor", label: "Açık Saha", category: "Yapı" };
    }
  };

  // Tüm mümkün özellikler listesi
  const allFeatures = [
    // Dinamik çim tipi
    getSurfaceTypeFeature(),

    // Dinamik saha tipi (açık/kapalı)
    getPitchTypeFeature(),

    // Temel Saha Özellikleri
    { key: "hasLighting", label: "Işıklandırma", category: "Yapı" },

    // Tesis Özellikleri
    { key: "changingRooms", label: "Soyunma Odası", category: "Tesis" },
    { key: "showers", label: "Duş", category: "Tesis" },
    { key: "parking", label: "Otopark", category: "Tesis" },
    { key: "camera", label: "Kamera Sistemi", category: "Güvenlik" },
    { key: "shoeRenting", label: "Ayakkabı Kiralama", category: "Hizmet" },

    // Ek Hizmetler
    { key: "wifi", label: "WiFi", category: "Teknoloji" },
    { key: "cafe", label: "Kafeterya", category: "Sosyal" },
    { key: "locker", label: "Dolap", category: "Tesis" },
    { key: "spectator area", label: "Seyirci Alanı", category: "Sosyal" },
    { key: "masjid", label: "Mescit", category: "Tesis" },
  ];

  // Sahanın sahip olduğu özellikler
  const pitchHasFeature = (featureKey) => {
    switch (featureKey) {
      case "surfaceType":
        return pitch.surfaceType === "artificial_turf";
      case "naturalGrass":
        return pitch.surfaceType === "natural_grass";
      case "indoorCourt":
        return pitch.surfaceType === "indoor_court";
      case "isIndoor":
        return pitch.pitchType === "indoor";
      case "isOutdoor":
        return pitch.pitchType !== "indoor"; // Açık saha (indoor değilse)
      case "hasLighting":
        return pitch.hasLighting;
      case "changingRooms":
        return pitch.facilities?.changingRooms;
      case "showers":
        return pitch.facilities?.showers;
      case "parking":
        return pitch.facilities?.parking;
      case "camera":
        return pitch.cameraSystem;
      case "shoeRenting":
        return pitch.shoeRental;
      default:
        // otherAmenities içinde ara
        return pitch.facilities?.otherAmenities?.includes(featureKey);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 relative">
      {/* Favorite Button - Top Right */}
      <button
        onClick={handleFavoriteToggle}
        className={`absolute top-4 right-4 p-2 rounded-full transition-colors group ${
          isFavorite ? "bg-red-50 hover:bg-red-100" : "hover:bg-gray-100"
        }`}
        title={isFavorite ? "Favorilerden Çıkar" : "Favorilere Ekle"}
      >
        <svg
          className={`w-6 h-6 transition-colors ${
            isFavorite
              ? "text-red-500 fill-current"
              : "text-gray-400 group-hover:text-red-500"
          }`}
          fill={isFavorite ? "currentColor" : "none"}
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
      </button>

      {/* Title */}
      <h2
        className="text-2xl font-bold text-center mb-6"
        style={{ color: "rgb(0, 128, 0)" }}
      >
        {pitch.name} Özellikleri
      </h2>

      {/* Saha Boyutları */}
      <div className="mb-6 p-2 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-center gap-[140px]">
          {/* Sol taraf - Max Oyuncu */}
          <div className="flex items-center gap-1">
            <svg
              className="w-5 h-5 text-blue-600"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
            <span className="text-sm font-medium text-gray-700">
              {pitch.capacity || "14 max oyuncu"}
            </span>
          </div>

          {/* Sağ taraf - Saha Boyutları */}
          <div className="flex items-center gap-1">
            <svg
              className="w-5 h-5 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16l-4-4m0 0l4-4m-4 4h18M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
            <span className="text-lg font-semibold text-gray-900">
              {pitch.dimensions?.length || 30}m ×{" "}
              {pitch.dimensions?.width || 50}m
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-2 gap-3">
        {allFeatures.map((feature, index) => {
          const hasFeature = pitchHasFeature(feature.key);

          return (
            <div key={index} className="flex items-center gap-3">
              <span
                className={`text-lg ${
                  hasFeature ? "text-green-500" : "text-gray-300"
                }`}
              >
                {hasFeature ? "✓" : "✗"}
              </span>
              <span
                className={`text-sm ${
                  hasFeature ? "text-gray-900 font-medium" : "text-gray-400"
                }`}
              >
                {feature.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PitchFeaturesSection;
