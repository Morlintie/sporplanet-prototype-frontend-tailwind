import { useState, useEffect } from "react";
import "../../styles/maintenance-popup.css";

function PrivateLinkPopup({
  isVisible,
  onClose,
  link,
  title = "Özel Bağlantı Oluşturuldu",
  message = "İlanınızın özel katılım bağlantısı başarıyla oluşturuldu. Bu bağlantıyı paylaştığınız kişiler doğrudan ilana katılabilir.",
}) {
  const [copied, setCopied] = useState(false);

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

  // Reset copied state when popup opens/closes
  useEffect(() => {
    if (!isVisible) {
      setCopied(false);
    }
  }, [isVisible]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);

      // Reset copied state after 3 seconds
      setTimeout(() => {
        setCopied(false);
      }, 3000);
    } catch (err) {
      console.error("Failed to copy link:", err);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = link;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
        }, 3000);
      } catch (fallbackErr) {
        console.error("Fallback copy failed:", fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  // Create truncated version of the link for display
  const getTruncatedLink = (fullLink) => {
    if (fullLink.length <= 50) return fullLink;
    return `${fullLink.substring(0, 25)}...${fullLink.substring(
      fullLink.length - 20
    )}`;
  };

  if (!isVisible) return null;

  return (
    <div className="maintenance-popup-overlay" onClick={onClose}>
      {/* Popup Content */}
      <div
        className="relative bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6 transform transition-all duration-300 scale-100"
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
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 text-center mb-3">
            {title}
          </h3>
          <p className="text-gray-600 text-center text-sm leading-relaxed">
            {message}
          </p>
        </div>

        {/* Link Display Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Özel Bağlantı:
          </label>
          <div className="flex items-center space-x-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex-1 min-w-0">
              <p
                className="text-sm text-gray-800 font-mono truncate"
                title={link}
              >
                {getTruncatedLink(link)}
              </p>
            </div>
            <button
              onClick={handleCopyLink}
              className="flex-shrink-0 p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
              title={copied ? "Kopyalandı!" : "Bağlantıyı kopyala"}
            >
              {copied ? (
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                </svg>
              )}
            </button>
          </div>
          {copied && (
            <p className="text-sm text-green-600 mt-2 flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Bağlantı panoya kopyalandı!
            </p>
          )}
        </div>

        {/* Information */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
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
              <p className="text-sm font-medium text-blue-900 mb-1">
                Önemli Bilgiler
              </p>
              <ul className="text-xs text-blue-800 leading-relaxed space-y-1">
                <li>
                  • Bağlantı 24 saat sonra otomatik olarak geçersiz hale gelir
                </li>
                <li>
                  • Bu bağlantıyla katılan kullanıcılar doğrudan ilana dahil
                  olur
                </li>
                <li>
                  • Sadece giriş yapmış kullanıcılar bu bağlantıyı kullanabilir
                </li>
                <li>• Bağlantıyı güvenli bir şekilde paylaşın</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors font-medium text-sm"
            tabIndex="0"
          >
            Kapat
          </button>
          <button
            onClick={handleCopyLink}
            className="flex-1 px-4 py-3 bg-[rgb(0,128,0)] text-white rounded-lg hover:bg-[rgb(0,100,0)] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors font-semibold text-sm"
            tabIndex="0"
          >
            {copied ? "Kopyalandı!" : "Bağlantıyı Kopyala"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PrivateLinkPopup;
