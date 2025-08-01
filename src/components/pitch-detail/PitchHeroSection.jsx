function PitchHeroSection({ pitch, renderStars }) {
  return (
    <div className="relative h-96 bg-gray-200 overflow-hidden">
      {pitch.image ? (
        <img
          src={pitch.image}
          alt={pitch.name}
          className="w-full h-full object-cover object-center"
          onError={(e) => {
            console.log("Hero image failed to load:", pitch.image);
            e.target.src = "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=250&fit=crop";
          }}
        />
      ) : (
        <div className="w-full h-full bg-green-600 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-2">{pitch.name}</h1>
            <p className="text-xl opacity-90">{pitch.location}</p>
          </div>
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
                style={{filter: 'brightness(0) invert(1)'}}
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
    </div>
  );
}

export default PitchHeroSection;