import { useEffect } from "react";
import "../../styles/maintenance-popup.css";

function LocationPermissionPopup({ isVisible, onAccept, onDecline }) {
  // Close popup on Escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && isVisible) {
        onDecline();
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
  }, [isVisible, onDecline]);

  if (!isVisible) return null;

  return (
    <div className="maintenance-popup-overlay" onClick={onDecline}>
      {/* Popup Content */}
      <div
        className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onDecline}
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
          </div>
          <h3 className="text-xl font-bold text-gray-900 text-center mb-3">
            Konum İzni Gerekli
          </h3>
          <p className="text-gray-600 text-center text-sm leading-relaxed">
            Yakınınızdaki sahaları bulabilmemiz için konum bilginizi
            <span className="font-semibold text-green-700">
              {" "}
              Sporplanet
            </span>{" "}
            ile paylaşmanıza izin vermeniz gerekmektedir.
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
                Konum Bilgisi Kullanımı
              </p>
              <p className="text-xs text-blue-800 leading-relaxed">
                Konum bilginiz sadece yakınınızdaki spor sahalarını göstermek
                için kullanılacak ve hiçbir şekilde saklanmayacaktır.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onDecline}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors font-medium text-sm"
            tabIndex="0"
          >
            Hayır, İstemiyorum
          </button>
          <button
            onClick={onAccept}
            className="flex-1 px-4 py-3 bg-[rgb(0,128,0)] text-white rounded-lg hover:bg-[rgb(0,100,0)] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors font-semibold text-sm"
            tabIndex="0"
          >
            Evet, İzin Veriyorum
          </button>
        </div>
      </div>
    </div>
  );
}

export default LocationPermissionPopup;
