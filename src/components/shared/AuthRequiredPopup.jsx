import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/auth-required-popup.css";

function AuthRequiredPopup({
  isVisible,
  onClose,
  actionType = "default",
  customMessage = null,
}) {
  const navigate = useNavigate();

  // Get appropriate message based on action type
  const getMessage = () => {
    if (customMessage) {
      return customMessage;
    }

    const messages = {
      like: "Yorumu beğenmek için giriş yapmalısınız",
      dislike: "Yorumu beğenmemek için giriş yapmalısınız",
      reply: "Yoruma cevap verebilmek için giriş yapmalısınız",
      default: "Bu işlemi yapabilmek için giriş yapmalısınız",
    };

    return messages[actionType] || messages.default;
  };

  // Close popup on Escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && isVisible) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when popup is open
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isVisible, onClose]);

  const handleSignupRedirect = () => {
    onClose();
    navigate("/auth/signup");
  };

  const handleLoginRedirect = () => {
    onClose();
    navigate("/auth/login");
  };

  if (!isVisible) return null;

  return (
    <div className="auth-required-popup-overlay" onClick={onClose}>
      {/* Popup Content */}
      <div
        className="auth-required-popup-content relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
          tabIndex="0"
          aria-label="Popup'ı kapat"
        >
          <svg
            className="w-6 h-6"
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

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
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
            Giriş Gerekli
          </h3>
          <p className="text-gray-600 text-center leading-relaxed">
            {getMessage()}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Sign Up Button */}
          <button
            onClick={handleSignupRedirect}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
            style={{
              backgroundColor: "rgb(0, 128, 0)",
              borderRadius: "6px",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "rgb(0, 100, 0)";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "rgb(0, 128, 0)";
            }}
          >
            Hesap Oluştur
          </button>

          {/* Login Button */}
          <button
            onClick={handleLoginRedirect}
            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            style={{ borderRadius: "6px" }}
          >
            Zaten hesabım var, giriş yap
          </button>

          {/* Cancel Button */}
          <button
            onClick={onClose}
            className="w-full text-gray-500 py-2 px-4 text-sm hover:text-gray-700 transition-colors"
          >
            İptal
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthRequiredPopup;
