import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";

function AdvertHeader({ advert, onStatusToggle, showNotification }) {
  const { user } = useAuth();
  const [localStatus, setLocalStatus] = useState(advert.status);
  const [isToggling, setIsToggling] = useState(false);
  const [localAgreed, setLocalAgreed] = useState(
    advert.isRivalry?.agreed || false
  );
  const [isTogglingAgreed, setIsTogglingAgreed] = useState(false);

  // Update local status when advert status changes via WebSocket
  useEffect(() => {
    if (advert.status !== localStatus) {
      console.log(
        "AdvertHeader: Updating local status from",
        localStatus,
        "to",
        advert.status
      );
      setLocalStatus(advert.status);
    }
  }, [advert.status, localStatus]);

  // Update local agreed status when advert rivalry agreed changes
  useEffect(() => {
    const currentAgreed = advert.isRivalry?.agreed || false;
    if (currentAgreed !== localAgreed) {
      console.log(
        "AdvertHeader: Updating local agreed from",
        localAgreed,
        "to",
        currentAgreed
      );
      setLocalAgreed(currentAgreed);
    }
  }, [advert.isRivalry?.agreed, localAgreed]);

  // Check if current user is the creator (advert owner)
  const isCurrentUserCreator =
    user && advert.createdBy && advert.createdBy._id === user._id;

  // Can only toggle between "open" and "cancelled"
  const canToggleStatus =
    isCurrentUserCreator &&
    (localStatus === "open" || localStatus === "cancelled");

  // Check if advert is a rivalry advert
  const isRivalryAdvert = advert.isRivalry?.status === true;

  // Can toggle agreed status if user is creator and it's a rivalry advert
  const canToggleAgreed = isCurrentUserCreator && isRivalryAdvert;

  // Show agreed status to all users if it's a rivalry advert
  const shouldShowAgreedStatus = isRivalryAdvert;

  // Turkish status translations
  const getStatusText = (status) => {
    const statusLabels = {
      open: "Açık",
      full: "Dolu",
      cancelled: "İptal",
      expired: "Süresi Doldu",
      completed: "Tamamlandı",
    };
    return statusLabels[status] || "Bilinmiyor";
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "bg-green-300";
      case "full":
        return "bg-yellow-300";
      case "cancelled":
        return "bg-red-300";
      case "expired":
        return "bg-gray-300";
      case "completed":
        return "bg-blue-300";
      default:
        return "bg-gray-300";
    }
  };

  // Turkish error message translation
  const translateErrorMessage = (message) => {
    const errorMessages = {
      "Please provide required data": "Gerekli verileri sağlayın",
      "Advert not found": "İlan bulunamadı",
      "Advert is not open for cancellation": "İlan iptal edilemez durumda",
      "You cannot activate a full advert":
        "Dolu olan bir ilanı aktif yapamazsınız",
      "You are not allowed to cancel this advert":
        "Bu ilanı iptal etme yetkiniz yok",
      "This advert is not marked as a rivalry":
        "Bu ilan rekabet ilanı olarak işaretlenmemiş",
      "You are not allowed to agree on rivalry for this advert":
        "Bu ilan için rekabet anlaşması yapma yetkiniz yok",
      "Failed to fetch":
        "Bağlantı hatası oluştu. İnternet bağlantınızı kontrol edin.",
      "Network Error": "Ağ hatası oluştu. Lütfen tekrar deneyin.",
      "Internal Server Error":
        "Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.",
      "Bad Request": "Geçersiz istek",
      Unauthorized: "Yetki hatası. Lütfen giriş yapın.",
      Forbidden: "Bu işlem için yetkiniz yok",
      "Not Found": "İlan bulunamadı",
      "Too Many Requests": "Çok fazla istek. Lütfen biraz bekleyin.",
      "Service Unavailable": "Servis şu anda kullanılamıyor",
    };
    return errorMessages[message] || message || "Beklenmeyen bir hata oluştu";
  };

  // Handle status toggle
  const handleStatusToggle = async () => {
    if (!canToggleStatus || isToggling) return;

    try {
      setIsToggling(true);

      const response = await fetch(
        `http://localhost:5000/api/v1/advert/toggle/${advert._id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        let errorMessage = "Failed to toggle status";

        try {
          const errorData = await response.json();
          errorMessage = errorData.msg || errorData.message || errorMessage;
        } catch {
          // If we can't parse the error response, use status-based messages
          switch (response.status) {
            case 400:
              errorMessage = "Bad Request";
              break;
            case 401:
              errorMessage = "Unauthorized";
              break;
            case 403:
              errorMessage = "Forbidden";
              break;
            case 404:
              errorMessage = "Advert not found";
              break;
            case 429:
              errorMessage = "Too Many Requests";
              break;
            case 500:
              errorMessage = "Internal Server Error";
              break;
            case 503:
              errorMessage = "Service Unavailable";
              break;
            default:
              errorMessage = `Server error: ${response.status}`;
          }
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Status toggle successful:", data);

      // Update local status
      setLocalStatus(data.status);

      // Show success notification
      const statusText = getStatusText(data.status);
      showNotification(
        `İlan durumu "${statusText}" olarak güncellendi`,
        "success"
      );

      // Call parent handler if provided
      if (onStatusToggle) {
        onStatusToggle(data.status);
      }
    } catch (err) {
      console.error("Error toggling status:", err);

      // Enhanced error handling with Turkish messages
      let errorMessage = "İlan durumu değiştirilirken hata oluştu";

      if (err.message.includes("Network Error") || !navigator.onLine) {
        errorMessage = "Bağlantı hatası. İnternet bağlantınızı kontrol edin";
      } else if (err.message) {
        errorMessage = translateErrorMessage(err.message);
      }

      showNotification(errorMessage, "error");
    } finally {
      setIsToggling(false);
    }
  };

  // Handle agreed toggle
  const handleAgreedToggle = async () => {
    if (!canToggleAgreed || isTogglingAgreed) return;

    try {
      setIsTogglingAgreed(true);

      const response = await fetch(
        `http://localhost:5000/api/v1/advert/rivalry/${advert._id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        let errorMessage = "Failed to toggle agreed status";

        try {
          const errorData = await response.json();
          errorMessage = errorData.msg || errorData.message || errorMessage;
        } catch {
          // If we can't parse the error response, use status-based messages
          switch (response.status) {
            case 400:
              errorMessage = "Bad Request";
              break;
            case 401:
              errorMessage = "Unauthorized";
              break;
            case 403:
              errorMessage = "Forbidden";
              break;
            case 404:
              errorMessage = "Advert not found";
              break;
            case 429:
              errorMessage = "Too Many Requests";
              break;
            case 500:
              errorMessage = "Internal Server Error";
              break;
            case 503:
              errorMessage = "Service Unavailable";
              break;
            default:
              errorMessage = `Server error: ${response.status}`;
          }
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Agreed toggle successful:", data);

      // Update local agreed status
      setLocalAgreed(data.agreed);

      // Show success notification
      const agreedText = data.agreed ? "anlaşmalı" : "anlaşmasız";
      showNotification(
        `Rekabet durumu "${agreedText}" olarak güncellendi`,
        "success"
      );
    } catch (err) {
      console.error("Error toggling agreed status:", err);

      // Enhanced error handling with Turkish messages
      let errorMessage = "Rekabet durumu değiştirilirken hata oluştu";

      if (err.message.includes("Network Error") || !navigator.onLine) {
        errorMessage = "Bağlantı hatası. İnternet bağlantınızı kontrol edin";
      } else if (err.message) {
        errorMessage = translateErrorMessage(err.message);
      }

      showNotification(errorMessage, "error");
    } finally {
      setIsTogglingAgreed(false);
    }
  };

  return (
    <div
      className="text-white py-4 px-4 sticky top-0 z-10 shadow-xl border-b-2 border-green-300"
      style={{ 
        background: "linear-gradient(135deg, #064e3b, #059669)",
        backdropFilter: "blur(10px)"
      }}
    >
      <div className="flex items-center justify-between">
        <div className="text-left">
          {/* Match Name */}
          <h1 className="text-lg font-bold leading-tight mb-1">
            {advert.name}
          </h1>
        </div>

        {/* Status Badge - Right Side */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <div
              className={`w-1.5 h-1.5 rounded-full ${getStatusColor(
                localStatus
              )}`}
            ></div>
            <span className="text-xs opacity-90">
              {getStatusText(localStatus)}
            </span>
          </div>

          {/* Status Toggle Switch for Creator */}
          {canToggleStatus && (
            <button
              onClick={handleStatusToggle}
              disabled={isToggling}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-green-600 ${
                isToggling
                  ? "bg-gray-200 cursor-not-allowed"
                  : localStatus === "open"
                  ? "bg-green-200"
                  : "bg-red-200"
              }`}
              title={
                isToggling
                  ? "Durum değiştiriliyor..."
                  : `Durumu değiştir: ${
                      localStatus === "open" ? "İptal Et" : "Yeniden Aç"
                    }`
              }
            >
              {isToggling ? (
                <div className="w-3 h-3 mx-auto">
                  <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                </div>
              ) : (
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    localStatus === "open" ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              )}
            </button>
          )}

          {/* Agreed Status Display/Toggle for Rivalry Adverts */}
          {shouldShowAgreedStatus && (
            <div className="flex items-center space-x-1">
              <span className="text-xs opacity-90">
                {localAgreed ? "Anlaşmalı" : "Anlaşmasız"}
              </span>

              {/* Interactive toggle for creator only */}
              {canToggleAgreed ? (
                <button
                  onClick={handleAgreedToggle}
                  disabled={isTogglingAgreed}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-green-600 ${
                    isTogglingAgreed
                      ? "bg-gray-200 cursor-not-allowed"
                      : localAgreed
                      ? "bg-blue-200"
                      : "bg-orange-200"
                  }`}
                  title={
                    isTogglingAgreed
                      ? "Rekabet durumu değiştiriliyor..."
                      : `Rekabet durumunu değiştir: ${
                          localAgreed ? "Anlaşmasız Yap" : "Anlaşmalı Yap"
                        }`
                  }
                >
                  {isTogglingAgreed ? (
                    <div className="w-3 h-3 mx-auto">
                      <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                    </div>
                  ) : (
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                        localAgreed ? "translate-x-5" : "translate-x-1"
                      }`}
                    />
                  )}
                </button>
              ) : (
                /* Read-only status indicator for non-creators */
                <div
                  className={`relative inline-flex h-5 w-9 items-center rounded-full ${
                    localAgreed ? "bg-blue-200" : "bg-orange-200"
                  }`}
                  title={`Rekabet durumu: ${
                    localAgreed ? "Anlaşmalı" : "Anlaşmasız"
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      localAgreed ? "translate-x-5" : "translate-x-1"
                    }`}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdvertHeader;
