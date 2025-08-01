import { useState } from 'react';

function PitchVideosSection({ pitch }) {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  // Video data from pitch prop
  const videos = pitch.videos || [];

  // Video yoksa component'i render etme
  if (!videos || videos.length === 0) {
    return null;
  }

  const currentVideo = videos[currentVideoIndex];

  const handleVideoChange = (index) => {
    setCurrentVideoIndex(index);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 h-full flex flex-col">
      <h2 className="text-2xl font-bold text-center mb-6" style={{ color: 'rgb(0, 128, 0)' }}>
        Videolar
      </h2>

      {/* Main Video Player */}
      <div className="mb-4 bg-gray-100 rounded-lg overflow-hidden">
        <video
          key={currentVideo.id}
          className="w-full h-[250px] object-cover"
          controls
          poster={currentVideo.thumbnail}
        >
          <source src={currentVideo.url} type="video/mp4" />
          Tarayıcınız video oynatmayı desteklemiyor.
        </video>
      </div>

      {/* Video Info */}
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900 mb-1">{currentVideo.title}</h3>
        <p className="text-sm text-gray-600">Süre: {currentVideo.duration}</p>
      </div>

      {/* Video Thumbnails List */}
      {videos.length > 1 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Diğer Videolar:</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {videos.map((video, index) => (
              <button
                key={video.id}
                onClick={() => handleVideoChange(index)}
                className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left ${
                  index === currentVideoIndex
                    ? 'bg-green-50 border border-green-200'
                    : 'hover:bg-gray-50'
                }`}
              >
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-12 h-8 object-cover rounded flex-shrink-0"
                />
                <div className="flex-grow min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {video.title}
                  </p>
                  <p className="text-xs text-gray-500">{video.duration}</p>
                </div>
                {/* Play Icon */}
                <div className="flex-shrink-0">
                  <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
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