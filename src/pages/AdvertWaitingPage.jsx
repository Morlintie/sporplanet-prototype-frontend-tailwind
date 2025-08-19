import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "../components/shared/Header";
import Footer from "../components/shared/Footer";
import Notification from "../components/shared/Notification";

function AdvertWaitingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Notification states
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState("success");

  // Show notification helper
  const showNotificationMessage = (message, type = "success") => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
  };

  // Close notification handler
  const handleCloseNotification = () => {
    setShowNotification(false);
  };

  // Translate error messages to Turkish based on backend controller logic
  const translateErrorMessage = (message) => {
    const errorTranslations = {
      "Please provide required data": "Gerekli bilgileri sağlayın",
      "Advert not found": "İlan bulunamadı",
      "Advert is full": "İlan dolu durumda",
      "The invite link has been expired": "Davet bağlantısının süresi dolmuş",
      "You are already a participant in this advert":
        "Bu ilana zaten katılmış durumdasınız",
      "You have already requested to join this advert":
        "Bu ilan için zaten katılım talebinde bulunmuşsunuz",
      "Invalid or expired invite":
        "Geçersiz veya süresi dolmuş davet bağlantısı",
      "You are already a participant": "Bu ilana zaten katılmış durumdasınız",
      "Oturum açmanız gerekiyor": "Oturum açmanız gerekiyor",
      "Bu işlemi gerçekleştirme yetkiniz yok":
        "Bu işlemi gerçekleştirme yetkiniz yok",
      "Geçersiz istek": "Geçersiz istek",
      "Davet işlenirken hata oluştu": "Davet işlenirken hata oluştu",
    };

    // Check if the message contains any known error patterns
    for (const [englishError, turkishError] of Object.entries(
      errorTranslations
    )) {
      if (message.includes(englishError)) {
        return turkishError;
      }
    }

    // If no translation found, return original message
    return message || "Bilinmeyen bir hata oluştu";
  };

  // Process the invite when component mounts
  useEffect(() => {
    const processInvite = async () => {
      try {
        // Remove premature auth check - let backend handle authentication

        // Get encrypted date and id from URL params
        const encryptedDate = searchParams.get("date");
        const encryptedId = searchParams.get("id");

        if (!encryptedDate || !encryptedId) {
          throw new Error("Geçersiz davet bağlantısı - eksik parametreler");
        }

        console.log("Processing invite with encrypted data...");

        // Hit the invite endpoint with encrypted data
        const response = await fetch(
          `/api/v1/advert/invite?date=${encodeURIComponent(
            encryptedDate
          )}&id=${encodeURIComponent(encryptedId)}`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));

          // Handle specific error cases with Turkish translations based on backend controller
          if (response.status === 400) {
            // BadRequestError cases from backend controller
            if (
              errorData.msg &&
              errorData.msg.includes("Please provide required data")
            ) {
              throw new Error(
                translateErrorMessage("Please provide required data")
              );
            } else if (
              errorData.msg &&
              errorData.msg.includes("Advert is full")
            ) {
              throw new Error(translateErrorMessage("Advert is full"));
            } else if (
              errorData.msg &&
              errorData.msg.includes("The invite link has been expired")
            ) {
              throw new Error(
                translateErrorMessage("The invite link has been expired")
              );
            } else if (
              errorData.msg &&
              errorData.msg.includes(
                "You are already a participant in this advert"
              )
            ) {
              throw new Error(
                translateErrorMessage(
                  "You are already a participant in this advert"
                )
              );
            } else if (
              errorData.msg &&
              errorData.msg.includes(
                "You have already requested to join this advert"
              )
            ) {
              throw new Error(
                translateErrorMessage(
                  "You have already requested to join this advert"
                )
              );
            } else if (
              errorData.msg &&
              errorData.msg.includes("Invalid or expired invite")
            ) {
              throw new Error(
                translateErrorMessage("Invalid or expired invite")
              );
            } else {
              // Use the backend error message and translate it
              throw new Error(
                translateErrorMessage(errorData.msg || "Geçersiz istek")
              );
            }
          } else if (response.status === 401) {
            // Unauthorized - redirect to login
            console.log("Unauthorized - redirecting to login");
            navigate("/login");
            return;
          } else if (response.status === 403) {
            // ForbiddenError - though this shouldn't happen in this controller based on the logic
            throw new Error(
              translateErrorMessage(
                errorData.msg || "Bu işlemi gerçekleştirme yetkiniz yok"
              )
            );
          } else if (response.status === 404) {
            // NotFoundError - advert not found
            if (errorData.msg && errorData.msg.includes("Advert not found")) {
              throw new Error(translateErrorMessage("Advert not found"));
            } else {
              throw new Error(translateErrorMessage("Advert not found"));
            }
          } else {
            // Other errors - use backend message and translate
            throw new Error(
              translateErrorMessage(
                errorData.msg || "Davet işlenirken hata oluştu"
              )
            );
          }
        }

        const result = await response.json();
        console.log("Invite processed successfully:", result);

        // Check if the response indicates success
        if (result.success && result.id) {
          // Show success message
          showNotificationMessage(
            "Başarıyla ilana katıldınız! İlan sayfasına yönlendiriliyorsunuz...",
            "success"
          );

          setLoading(false);

          // Redirect to the advert detail page using the decrypted ID
          setTimeout(() => {
            navigate(`/advert-detail/${result.id}`);
          }, 2000);
        } else {
          // Handle unexpected response format
          throw new Error("Beklenmeyen yanıt formatı");
        }
      } catch (err) {
        console.error("Error processing invite:", err);
        const translatedError = translateErrorMessage(err.message);
        setError(translatedError);
        showNotificationMessage(translatedError, "error");
        setLoading(false);

        // Redirect to matches page after error
        setTimeout(() => {
          navigate("/matches");
        }, 3000);
      }
    };

    // Process invite immediately when component mounts
    processInvite();
  }, [searchParams, navigate]); // Removed user dependency

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            {loading && !error ? (
              <>
                {/* Loading Spinner */}
                <div className="mb-6">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto"></div>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Davet İşleniyor
                </h2>
                <p className="text-gray-600">
                  Davet bağlantınız işleniyor, lütfen bekleyiniz...
                </p>
              </>
            ) : error ? (
              <>
                {/* Error State */}
                <div className="mb-6">
                  <svg
                    className="w-16 h-16 text-red-500 mx-auto"
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
                <h2 className="text-xl font-semibold text-red-600 mb-4">
                  Hata Oluştu
                </h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                  onClick={() => navigate("/matches")}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-md transition-colors"
                >
                  Maçlara Geri Dön
                </button>
              </>
            ) : (
              <>
                {/* Success State */}
                <div className="mb-6">
                  <svg
                    className="w-16 h-16 text-green-500 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-green-600 mb-4">
                  Başarılı!
                </h2>
                <p className="text-gray-600">
                  İlana başarıyla katıldınız. İlan sayfasına
                  yönlendiriliyorsunuz...
                </p>
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
      <Notification
        message={notificationMessage}
        type={notificationType}
        isVisible={showNotification}
        onClose={handleCloseNotification}
      />
    </>
  );
}

export default AdvertWaitingPage;
