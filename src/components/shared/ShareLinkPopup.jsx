import { useEffect } from "react";
import "../../styles/maintenance-popup.css";

// Helper function to truncate URL for display
const truncateUrl = (url, maxLength = 50) => {
  if (!url || url.length <= maxLength) return url;

  const start = url.substring(0, Math.floor(maxLength * 0.6));
  const end = url.substring(url.length - Math.floor(maxLength * 0.3));

  return `${start}...${end}`;
};

function ShareLinkPopup({
  isVisible,
  onClose,
  privateLink,
  onCopyToClipboard,
  isGenerating = false,
  error = null,
}) {
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

  if (!isVisible) return null;

  return (
    <div className="maintenance-popup-overlay" onClick={onClose}>
      {/* Popup Content */}
      <div
        className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 transform transition-all duration-300 scale-100"
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
        <div className="mb-5">
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
            Özel Davet Bağlantısı
          </h3>
          <p className="text-gray-600 text-center text-sm leading-relaxed">
            Bu bağlantı ile kullanıcılar doğrudan ilana katılabilir. Bağlantı 3
            gün boyunca geçerlidir.
          </p>
        </div>

        {/* Content */}
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mb-4"></div>
            <p className="text-gray-600 text-sm">
              Özel bağlantı oluşturuluyor...
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-red-600 text-sm text-center mb-4">{error}</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
            >
              Kapat
            </button>
          </div>
        ) : privateLink ? (
          <>
            {/* Private Link Display */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Davet Bağlantısı
              </label>
              <div className="flex items-center space-x-2">
                <div
                  className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 cursor-pointer hover:bg-gray-100 transition-colors"
                  title={privateLink}
                  onClick={onCopyToClipboard}
                >
                  <span className="font-mono">
                    {truncateUrl(privateLink, 60)}
                  </span>
                </div>
                <button
                  onClick={onCopyToClipboard}
                  className="p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex-shrink-0"
                  title="Panoya kopyala"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                💡 Tam bağlantıyı görmek için üzerine gelip bekleyin veya
                kopyalama butonuna tıklayın
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
                  <p className="text-sm font-medium text-blue-900 mb-1">
                    Güvenlik Bilgisi
                  </p>
                  <p className="text-xs text-blue-800 leading-relaxed">
                    Bu bağlantı şifrelenmiş ve 3 gün boyunca geçerlidir.
                    Bağlantıyı kullanan kişiler doğrudan ilana katılım
                    sağlayacaktır.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
              >
                Kapat
              </button>
              <button
                onClick={onCopyToClipboard}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-sm"
              >
                Panoya Kopyala
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default ShareLinkPopup;
