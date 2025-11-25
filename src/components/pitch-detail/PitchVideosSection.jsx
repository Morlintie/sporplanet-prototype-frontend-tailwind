import { useState, useEffect } from "react";

function PitchVideosSection({ pitch }) {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [thumbnailErrors, setThumbnailErrors] = useState({});
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [isVideoError, setIsVideoError] = useState(false);

  // Video data from pitch prop
  const videos = pitch.videos || [];

  // Video yoksa component'i render etme
  if (!videos || videos.length === 0) {
    return null;
  }

  // Reset loading state when videos change
  useEffect(() => {
    if (videos.length > 0) {
      setIsVideoLoading(true);
      setIsVideoError(false);
    }
  }, [videos]);

  const currentVideo = videos[currentVideoIndex];

  const handleVideoChange = (index) => {
    if (index !== currentVideoIndex) {
      setIsVideoLoading(true);
      setIsVideoError(false);
      setCurrentVideoIndex(index);
    }
  };

  // Video event handlers
  const handleVideoLoadStart = () => {
    setIsVideoLoading(true);
    setIsVideoError(false);
  };

  const handleVideoCanPlay = () => {
    setIsVideoLoading(false);
    setIsVideoError(false);
  };

  const handleVideoError = () => {
    setIsVideoLoading(false);
    setIsVideoError(true);
  };

  const handleVideoWaiting = () => {
    setIsVideoLoading(true);
  };

  const handleVideoPlaying = () => {
    setIsVideoLoading(false);
  };

  const handleThumbnailError = (videoId) => {
    setThumbnailErrors((prev) => ({
      ...prev,
      [videoId]: true,
    }));
  };

  // Default video icon component
  const VideoIcon = ({ className = "w-12 h-8" }) => (
    <div
      className={`${className} bg-gray-200 rounded flex items-center justify-center flex-shrink-0`}
    >
      <svg
        className="w-6 h-6 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
        />
      </svg>
    </div>
  );

  // Loading spinner component
  const LoadingSpinner = () => (
    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
      <div className="bg-white bg-opacity-90 rounded-lg p-4 flex flex-col items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-2"></div>
        <p className="text-sm text-gray-700 font-medium">Video yükleniyor...</p>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 h-full flex flex-col">
      <h2
        className="text-2xl font-bold text-center mb-6"
        style={{ color: "rgb(0, 128, 0)" }}
      >
        Videolar
      </h2>

      {/* Main Video Player */}
      <div className="mb-4 bg-gray-900 rounded-lg overflow-hidden relative">
        {currentVideo?.url ? (
          <>
            <video
              key={`video-${currentVideoIndex}-${
                currentVideo.id || currentVideo.url
              }`}
              className="w-full h-[250px] object-contain bg-black"
              controls
              controlsList="nodownload"
              poster={currentVideo.thumbnail}
              preload="metadata"
              onLoadStart={handleVideoLoadStart}
              onCanPlay={handleVideoCanPlay}
              onError={handleVideoError}
              onWaiting={handleVideoWaiting}
              onPlaying={handleVideoPlaying}
              onLoadedData={() => setIsVideoLoading(false)}
              onSeeking={() => setIsVideoLoading(true)}
              onSeeked={() => setIsVideoLoading(false)}
            >
              <source src={currentVideo.url} type="video/mp4" />
              <source src={currentVideo.url} type="video/webm" />
              <source src={currentVideo.url} type="video/ogg" />
              Tarayıcınız video oynatmayı desteklemiyor.
            </video>

            {/* Loading Overlay */}
            {isVideoLoading && <LoadingSpinner />}

            {/* Error Overlay */}
            {isVideoError && (
              <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-10">
                <div className="bg-white bg-opacity-90 rounded-lg p-4 flex flex-col items-center text-center">
                  <svg
                    className="w-12 h-12 text-red-500 mb-2"
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
                  <p className="text-sm text-gray-700 font-medium mb-2">
                    Video yüklenemedi
                  </p>
                  <button
                    onClick={() => {
                      setIsVideoError(false);
                      setIsVideoLoading(true);
                      // Force video reload by updating key
                      const video = document.querySelector("video");
                      if (video) video.load();
                    }}
                    className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
                  >
                    Tekrar Dene
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-[250px] bg-gray-200 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <VideoIcon className="w-16 h-16 mx-auto mb-2" />
              <p className="text-sm">Video yüklenemedi</p>
            </div>
          </div>
        )}
      </div>

      {/* Video Info */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-gray-900">
            {currentVideo?.title || "Video"}
          </h3>
          {isVideoLoading && (
            <div className="flex items-center gap-1">
              <div className="animate-spin rounded-full h-3 w-3 border-b border-green-600"></div>
              <span className="text-xs text-green-600 font-medium">
                Yükleniyor...
              </span>
            </div>
          )}
          {isVideoError && (
            <span className="text-xs text-red-500 font-medium flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              Hata
            </span>
          )}
        </div>
        {videos.length > 1 && (
          <p className="text-xs text-gray-500 mt-1">
            {currentVideoIndex + 1} / {videos.length} video
          </p>
        )}
      </div>

      {/* Video Thumbnails List */}
      {videos.length > 1 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Diğer Videolar:
          </h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {videos.map((video, index) => (
              <button
                key={`${video.id || index}-${video.url || index}`}
                onClick={() => handleVideoChange(index)}
                disabled={isVideoLoading && index !== currentVideoIndex}
                className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left relative ${
                  index === currentVideoIndex
                    ? "bg-green-50 border border-green-200"
                    : isVideoLoading && index !== currentVideoIndex
                    ? "bg-gray-50 border border-gray-200 opacity-60 cursor-not-allowed"
                    : "hover:bg-gray-50 border border-transparent cursor-pointer"
                }`}
                type="button"
              >
                {/* Thumbnail with fallback */}
                {video.thumbnail && !thumbnailErrors[video.id || index] ? (
                  <img
                    src={video.thumbnail}
                    alt={video.title || "Video thumbnail"}
                    className="w-12 h-8 object-cover rounded flex-shrink-0"
                    onError={() => handleThumbnailError(video.id || index)}
                    onLoad={() => {
                      // Remove from error state if it loads successfully
                      setThumbnailErrors((prev) => {
                        const newErrors = { ...prev };
                        delete newErrors[video.id || index];
                        return newErrors;
                      });
                    }}
                  />
                ) : (
                  <VideoIcon className="w-12 h-8" />
                )}

                <div className="flex-grow min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {video.title || "Video"}
                  </p>
                </div>

                {/* Play Icon */}
                <div className="flex-shrink-0">
                  {index === currentVideoIndex ? (
                    isVideoLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b border-green-600"></div>
                    ) : (
                      <svg
                        className="w-4 h-4 text-green-600"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                      </svg>
                    )
                  ) : (
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default PitchVideosSection;
