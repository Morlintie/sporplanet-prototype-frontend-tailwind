import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useWebSocket } from "../context/WebSocketContext";
import Header from "../components/shared/Header";
import Footer from "../components/shared/Footer";
import Notification from "../components/shared/Notification";

function PrivateInvitePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const { emitChatEvent, isChatConnected } = useWebSocket();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasProcessed, setHasProcessed] = useState(false); // Prevent multiple API calls
  const [notification, setNotification] = useState({
    message: "",
    type: "",
    isVisible: false,
  });

  // Get query parameters
  const date = searchParams.get("date");
  const id = searchParams.get("id");

  // Turkish error message translation
  const translateErrorMessage = (message) => {
    const errorMessages = {
      "Please provide required data": "Gerekli verileri sağlayın",
      "Advert not found": "İlan bulunamadı",
      "Advert is full": "İlan dolu",
      "The invite link has been expired": "Davet bağlantısının süresi dolmuş",
      "You are already a participant in this advert":
        "Bu ilana zaten katılıyorsunuz",
      "You have already requested to join this advert":
        "Bu ilana zaten katılım talebinde bulundunuz",
      "Failed to fetch":
        "Bağlantı hatası oluştu. İnternet bağlantınızı kontrol edin.",
      "Network Error": "Ağ hatası oluştu. Lütfen tekrar deneyin.",
      "Internal Server Error":
        "Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.",
      "Bad Request": "Geçersiz istek",
      Unauthorized: "Yetki hatası. Lütfen giriş yapın.",
      Forbidden: "Bu içeriğe erişim yetkiniz yok",
      "Not Found": "İlan bulunamadı",
      "Too Many Requests": "Çok fazla istek. Lütfen biraz bekleyin.",
      "Service Unavailable": "Servis şu anda kullanılamıyor",
    };

    return errorMessages[message] || message || "Beklenmeyen bir hata oluştu";
  };

  // Show notification helper
  const showNotification = (message, type = "error") => {
    setNotification({
      message: translateErrorMessage(message),
      type,
      isVisible: true,
    });
  };

  // Close notification
  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, isVisible: false }));
  };

  // Process the invite link
  const processInviteLink = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `http://localhost:5000/api/v1/advert/invite?date=${encodeURIComponent(
          date
        )}&id=${encodeURIComponent(id)}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        let errorMessage = "Failed to process invite";

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
      console.log("Invite processed successfully:", data);

      if (data.success && data.id) {
        // Make user join chat room after successful private link participation
        if (user && user._id) {
          console.log(
            `Private link successful: User ${user._id} joining chat room ${data.id}`
          );
          emitChatEvent("joinRoom", {
            roomId: data.id,
            userId: user._id,
          });
        }

        // Show success notification
        showNotification(
          "İlana başarıyla katıldınız! Yönlendiriliyorsunuz...",
          "success"
        );

        // Redirect to the advert detail page after a short delay
        setTimeout(() => {
          navigate(`/advert-detail/${data.id}`);
        }, 2000);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      console.error("Error processing invite link:", err);

      // Enhanced error handling with Turkish messages
      let errorMessage = "Davet bağlantısı işlenirken hata oluştu";

      if (err.message.includes("Network Error") || !navigator.onLine) {
        errorMessage = "Bağlantı hatası. İnternet bağlantınızı kontrol edin";
      } else if (err.message) {
        errorMessage = translateErrorMessage(err.message);
      }

      setError(errorMessage);
      showNotification(errorMessage, "error");

      // Redirect to matches page after showing error for 3 seconds
      setTimeout(() => {
        navigate("/matches");
      }, 3000);
    } finally {
      setLoading(false);
    }
  }, [date, id, user, emitChatEvent]);

  // Check authentication and parameters on mount
  useEffect(() => {
    // Wait for authentication to finish loading
    if (authLoading) {
      return;
    }

    // Prevent multiple API calls
    if (hasProcessed) {
      return;
    }

    // Check if required parameters are present
    if (!date || !id) {
      setError("Geçersiz davet bağlantısı");
      setLoading(false);
      setHasProcessed(true);
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      // Redirect to login page with return URL
      const returnUrl = encodeURIComponent(
        `/private-invite?date=${encodeURIComponent(
          date
        )}&id=${encodeURIComponent(id)}`
      );
      navigate(`/auth/login?returnUrl=${returnUrl}`);
      return;
    }

    // User is authenticated, process the invite link
    setHasProcessed(true);
    processInviteLink();
  }, [
    authLoading,
    isAuthenticated,
    user,
    date,
    id,
    navigate,
    processInviteLink,
    hasProcessed,
  ]);

  if (loading || authLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
            <div className="text-center">
              {/* Loading Animation */}
              <div className="flex items-center justify-center mb-6">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500"></div>
              </div>

              {/* Loading Text */}
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Davet Bağlantısı İşleniyor
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                Davet bağlantınız doğrulanıyor ve ilana katılım işleminiz
                gerçekleştiriliyor. Lütfen bekleyin...
              </p>

              {/* Progress Dots */}
              <div className="flex justify-center space-x-1 mt-6">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <div
                  className="w-2 h-2 bg-green-500 rounded-full animate-pulse"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-green-500 rounded-full animate-pulse"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />

        {/* Notification component */}
        <Notification
          message={notification.message}
          type={notification.type}
          isVisible={notification.isVisible}
          onClose={handleCloseNotification}
          duration={4000}
        />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
            <div className="text-center">
              {/* Error Icon */}
              <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>

              {/* Error Title */}
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Davet Bağlantısı Hatası
              </h2>

              {/* Error Message */}
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                {error}
              </p>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => navigate("/matches")}
                  className="w-full px-4 py-3 bg-[rgb(0,128,0)] text-white rounded-lg hover:bg-[rgb(0,100,0)] transition-colors font-semibold text-sm"
                >
                  Maçlar Sayfasına Git
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                >
                  Ana Sayfaya Dön
                </button>
              </div>
            </div>
          </div>
        </div>
        <Footer />

        {/* Notification component */}
        <Notification
          message={notification.message}
          type={notification.type}
          isVisible={notification.isVisible}
          onClose={handleCloseNotification}
          duration={4000}
        />
      </>
    );
  }

  // This shouldn't render, but just in case
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Yönlendiriliyor...
          </h1>
          <p className="text-lg text-gray-600">
            İlan sayfasına yönlendiriliyorsunuz.
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default PrivateInvitePage;
