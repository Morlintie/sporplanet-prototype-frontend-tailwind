import { useEffect } from "react";
import "../../styles/maintenance-popup.css";

function MaintenanceContactPopup({
  isVisible,
  onClose,
  pitchName,
  contactInfo,
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
        className="relative bg-white rounded-lg shadow-xl max-w-sm w-full mx-4 p-5 transform transition-all duration-300 scale-100"
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
        <div className="mb-4">
          <div className="flex items-center justify-center w-14 h-14 bg-orange-100 rounded-full mx-auto mb-3">
            <svg
              className="w-7 h-7 text-orange-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
            Saha Bakımda
          </h3>
          <p className="text-gray-600 text-center text-sm">
            <span className="font-medium">{pitchName}</span> şu anda bakım
            çalışmaları nedeniyle hizmet verememektedir.
          </p>
        </div>

        {/* Contact Information */}
        <div className="space-y-2">
          <h4 className="text-base font-semibold text-gray-900 mb-2">
            İletişim Bilgileri
          </h4>

          {/* Phone */}
          {contactInfo?.phone ? (
            <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex-shrink-0">
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
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Telefon</p>
                <a
                  href={`tel:${contactInfo.phone}`}
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  {contactInfo.phone}
                </a>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
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
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Telefon</p>
                <a
                  href="tel:+902125550123"
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  +90 212 555 0123
                </a>
              </div>
            </div>
          )}

          {/* Email */}
          {contactInfo?.email ? (
            <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex-shrink-0">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">E-posta</p>
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {contactInfo.email}
                </a>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">E-posta</p>
                <a
                  href="mailto:info@sporplanet.com"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  info@sporplanet.com
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Social Media Icons */}
        {(contactInfo?.instagram ||
          contactInfo?.socialMedia?.instagram ||
          contactInfo?.twitter ||
          contactInfo?.socialMedia?.twitter ||
          contactInfo?.facebook ||
          contactInfo?.socialMedia?.facebook) && (
          <div className="mt-3 flex justify-center space-x-3">
            {/* Instagram */}
            {(contactInfo?.instagram ||
              contactInfo?.socialMedia?.instagram) && (
              <a
                href={(() => {
                  const instagramUrl =
                    contactInfo?.instagram ||
                    contactInfo?.socialMedia?.instagram;
                  return instagramUrl.startsWith("http")
                    ? instagramUrl
                    : `https://instagram.com/${
                        instagramUrl.split("/").pop() ||
                        instagramUrl.replace("@", "")
                      }`;
                })()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center bg-gray-50 rounded-full shadow-sm hover:shadow-md hover:bg-white transition-all duration-200 hover:scale-110"
                aria-label="Instagram"
              >
                <svg
                  className="w-5 h-5 text-pink-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.40z" />
                </svg>
              </a>
            )}

            {/* Twitter */}
            {(contactInfo?.twitter || contactInfo?.socialMedia?.twitter) && (
              <a
                href={(() => {
                  const twitterUrl =
                    contactInfo?.twitter || contactInfo?.socialMedia?.twitter;
                  return twitterUrl.startsWith("http")
                    ? twitterUrl
                    : `https://twitter.com/${
                        twitterUrl.split("/").pop() ||
                        twitterUrl.replace("@", "")
                      }`;
                })()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center bg-gray-50 rounded-full shadow-sm hover:shadow-md hover:bg-white transition-all duration-200 hover:scale-110"
                aria-label="Twitter"
              >
                <svg
                  className="w-5 h-5 text-blue-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
            )}

            {/* Facebook */}
            {(contactInfo?.facebook || contactInfo?.socialMedia?.facebook) && (
              <a
                href={(() => {
                  const facebookUrl =
                    contactInfo?.facebook || contactInfo?.socialMedia?.facebook;
                  return facebookUrl.startsWith("http")
                    ? facebookUrl
                    : `https://facebook.com/${
                        facebookUrl.split("/").pop() ||
                        facebookUrl.replace("@", "")
                      }`;
                })()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center bg-gray-50 rounded-full shadow-sm hover:shadow-md hover:bg-white transition-all duration-200 hover:scale-110"
                aria-label="Facebook"
              >
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            )}
          </div>
        )}

        {/* Footer Message */}
        <div className="mt-4 p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-green-800 text-center">
            Detaylı bilgi almak ve rezervasyon yapmak için bizimle iletişime
            geçebilirsiniz.
          </p>
        </div>
      </div>
    </div>
  );
}

export default MaintenanceContactPopup;
