import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Notification from "./Notification";
import PopupSpinner from "./PopupSpinner";
import "../../styles/maintenance-popup.css";

function ArchivedUserPopup() {
  const navigate = useNavigate();
  const {
    showArchivedUserPopup,
    handleAccountRecovery,
    handleAccountRecoveryDecline,
    closeArchivedUserPopup,
  } = useAuth();

  const [isProcessing, setIsProcessing] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState("success");
  const [showRedirectSpinner, setShowRedirectSpinner] = useState(false);

  // Show notification helper function
  const showNotificationMessage = (message, type = "success") => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
  };

  // Close notification
  const handleCloseNotification = () => {
    setShowNotification(false);
  };

  // Prevent body scroll and disable escape key when popup is open
  useEffect(() => {
    if (showArchivedUserPopup) {
      // Prevent body scroll when popup is open
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showArchivedUserPopup]);

  const handleRecoveryAccept = async () => {
    setIsProcessing(true);
    try {
      const result = await handleAccountRecovery();
      if (result.success) {
        showNotificationMessage(result.message, "success");

        // Show success message for 1 second, then show popup spinner
        setTimeout(() => {
          setShowRedirectSpinner(true);
        }, 1000);

        // Redirect after total 3 seconds
        setTimeout(() => {
          closeArchivedUserPopup();
          navigate("/");
        }, 3000);
      } else {
        showNotificationMessage(result.message, "error");
      }
    } catch (error) {
      showNotificationMessage(
        "Bir hata oluştu. Lütfen tekrar deneyin.",
        "error"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRecoveryDecline = async () => {
    setIsProcessing(true);
    try {
      await handleAccountRecoveryDecline();
      // User will be logged out and redirected
    } catch (error) {
      console.error("Recovery decline error:", error);
      // Even if there's an error, continue with logout
      await handleAccountRecoveryDecline();
    }
  };

  if (!showArchivedUserPopup) return null;

  return (
    <>
      <div className="maintenance-popup-overlay">
        {/* Popup Content */}
        <div
          className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 transform transition-all duration-300 scale-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="mb-5">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-3">
              Hesap Geri Yükleme
            </h3>
            <p className="text-gray-600 text-center text-sm leading-relaxed">
              Hesabınız daha önce silinmiş ancak 15 günlük süre henüz dolmadığı
              için verileriniz korunuyor. Hesabınızı geri yüklemek istiyor
              musunuz?
            </p>
          </div>

          {/* Information */}
          <div className="mb-5 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-3">
              <svg
                className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">Bilgi</p>
                <p className="text-xs text-blue-800 leading-relaxed">
                  Hesabınızı geri yüklerseniz tüm verileriniz,
                  rezervasyonlarınız ve geçmişiniz eski haline dönecektir.
                  "Hayır" seçerseniz oturumunuz kapatılacaktır.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleRecoveryDecline}
              disabled={isProcessing}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              tabIndex="0"
            >
              {isProcessing ? "İşleniyor..." : "Hayır, Oturumu Kapat"}
            </button>
            <button
              onClick={handleRecoveryAccept}
              disabled={isProcessing}
              className="flex-1 px-4 py-3 bg-[rgb(0,128,0)] hover:bg-[rgb(0,100,0)] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              tabIndex="0"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Geri Yükleniyor...</span>
                </>
              ) : (
                <span>Evet, Hesabımı Geri Yükle</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Notification Component */}
      <Notification
        message={notificationMessage}
        type={notificationType}
        isVisible={showNotification}
        onClose={handleCloseNotification}
        duration={3000}
      />

      {/* Popup Spinner for Redirect */}
      <PopupSpinner
        isVisible={showRedirectSpinner}
        message="Ana sayfaya yönlendiriliyorsunuz..."
      />
    </>
  );
}

export default ArchivedUserPopup;
