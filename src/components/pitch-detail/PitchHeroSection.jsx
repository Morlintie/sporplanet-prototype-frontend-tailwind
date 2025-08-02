import { useState, useEffect, useCallback } from "react";

function PitchHeroSection({ pitch, renderStars }) {
  // Get media items from pitch data
  const mediaItems =
    pitch?.images?.map((img) => ({
      type: "image",
      url: img.url,
      thumbnail: img.thumbnail || img.url,
      caption: img.caption,
    })) || []; // Fallback to empty array if no images

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const nextImage = useCallback(() => {
    if (mediaItems.length === 0) return;
    setCurrentImageIndex((prev) => {
      const newIndex = (prev + 1) % mediaItems.length;
      return newIndex;
    });
  }, [mediaItems.length]);

  const prevImage = useCallback(() => {
    if (mediaItems.length === 0) return;
    setCurrentImageIndex((prev) => {
      const newIndex = (prev - 1 + mediaItems.length) % mediaItems.length;
      return newIndex;
    });
  }, [mediaItems.length]);

  // Touch/Swipe handlers
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextImage();
    } else if (isRightSwipe) {
      prevImage();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "Escape" && isLightboxOpen) {
        setIsLightboxOpen(false);
      } else if (e.key === "ArrowLeft") {
        prevImage();
      } else if (e.key === "ArrowRight") {
        nextImage();
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [nextImage, prevImage, isLightboxOpen]);

  return (
    <div
      className="relative h-[500px] bg-gray-200 overflow-hidden hero-carousel"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ userSelect: "none" }}
    >
      {mediaItems.length > 0 ? (
        <>
          {/* Main Image Content */}
          <img
            key={currentImageIndex}
            src={
              mediaItems[currentImageIndex]?.url ||
              "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=500&fit=crop"
            }
            alt={`${pitch.name} - Fotoğraf ${currentImageIndex + 1}`}
            className="w-full h-full object-cover object-center transition-opacity duration-500"
            onError={(e) => {
              e.target.src =
                "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=500&fit=crop";
            }}
          />
          {/* Zoom Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsLightboxOpen(true);
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsLightboxOpen(true);
            }}
            className="absolute bottom-4 right-4 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-colors z-20 shadow-lg hover:scale-105 active:scale-95"
            aria-label="Fotoğrafı büyüt"
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
              />
            </svg>
          </button>
        </>
      ) : (
        /* No Images Fallback */
        <div className="flex items-center justify-center h-full bg-gray-300">
          <div className="text-center text-gray-600">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-lg font-medium">Fotoğraf bulunmuyor</p>
          </div>
        </div>
      )}

      {/* Navigation Arrows - Only show when there are multiple images */}
      {mediaItems.length > 1 && (
        <>
          {/* Previous Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors group z-10"
            aria-label="Önceki fotoğraf"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Next Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors group z-10"
            aria-label="Sonraki fotoğraf"
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
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </>
      )}

      {/* Image Indicators */}
      {mediaItems.length > 1 && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2">
          {mediaItems.map((item, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentImageIndex(index);
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              className={`w-3 h-3 rounded-full transition-colors z-10 ${
                index === currentImageIndex
                  ? "bg-white"
                  : "bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`${index + 1}. fotoğrafa git`}
            />
          ))}
        </div>
      )}

      {/* Image Counter */}
      {mediaItems.length > 1 && (
        <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          {currentImageIndex + 1} / {mediaItems.length}
        </div>
      )}

      {/* Overlay with Pitch Info */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 w-full">
          <div className="text-white">
            <h1 className="text-4xl font-bold mb-2">{pitch.name}</h1>
            <div className="flex items-center gap-2 mb-2">
              <img
                src="https://www.svgrepo.com/show/486721/location.svg"
                alt="Location"
                className="w-5 h-5"
                style={{ filter: "brightness(0) invert(1)" }}
              />
              <p className="text-lg">{pitch.fullAddress}</p>
            </div>
            <div className="flex items-center gap-2">
              {renderStars(pitch.rating)}
              <span className="text-lg font-medium ml-2">
                {pitch.rating} ({pitch.totalReviews} değerlendirme)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal - Only show when there are images */}
      {isLightboxOpen && mediaItems.length > 0 && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-2 right-2 text-white bg-black/50 hover:bg-black/70 rounded-full p-2 z-10"
              aria-label="Büyütmeyi kapat"
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

            {/* Lightbox Image */}
            <img
              src={
                mediaItems[currentImageIndex]?.url ||
                "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=500&fit=crop"
              }
              alt={`${pitch.name} - Büyütülmüş fotoğraf`}
              className="absolute inset-0 w-full h-full object-cover"
              onClick={(e) => e.stopPropagation()}
              onError={(e) => {
                e.target.src =
                  "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=500&fit=crop";
              }}
            />

            {/* Navigation in Lightbox */}
            {mediaItems.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/70 rounded-full p-3"
                  aria-label="Önceki fotoğraf"
                >
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/70 rounded-full p-3"
                  aria-label="Sonraki fotoğraf"
                >
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </>
            )}

            {/* Image Counter in Lightbox */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/50 px-4 py-2 rounded-full">
              {currentImageIndex + 1} / {mediaItems.length} fotoğraf
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PitchHeroSection;
