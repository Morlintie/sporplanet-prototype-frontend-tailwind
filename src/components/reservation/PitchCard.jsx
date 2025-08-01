import { useNavigate } from "react-router-dom";

function PitchCard({ pitch, onReservation }) {
  const navigate = useNavigate();
  
  const handleReservation = () => {
    // Navigate to pitch detail page instead of direct reservation
    navigate(`/reservation/${pitch.id}`);
  };

  // Render stars for rating
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasPartialStar = rating % 1 !== 0;
    const partialStarValue = rating - fullStars;
    const stars = [];
    
    for (let i = 0; i < 5; i++) {
      const isFullStar = i < fullStars;
      const isPartialStar = i === fullStars && hasPartialStar;
      const isEmpty = i > fullStars;
      
      if (isPartialStar) {
        // Partial star with gradient
        stars.push(
          <div key={i} className="relative w-4 h-4 inline-block">
            {/* Background (empty) star */}
            <img
              src="https://www.svgrepo.com/show/13695/star.svg"
              alt="Star"
              className="absolute w-4 h-4 opacity-30"
              style={{
                filter: 'brightness(0) saturate(100%) invert(80%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(95%) contrast(85%)'
              }}
            />
            {/* Foreground (filled) star with clip */}
            <img
              src="https://www.svgrepo.com/show/13695/star.svg"
              alt="Star"
              className="absolute w-4 h-4 opacity-100"
              style={{
                filter: 'brightness(0) saturate(100%) invert(78%) sepia(86%) saturate(2476%) hue-rotate(7deg) brightness(101%) contrast(107%)',
                clipPath: `inset(0 ${100 - (partialStarValue * 100)}% 0 0)`
              }}
            />
          </div>
        );
      } else {
        // Full or empty star
        stars.push(
          <img
            key={i}
            src="https://www.svgrepo.com/show/13695/star.svg"
            alt="Star"
            className={`w-4 h-4 ${isFullStar ? 'opacity-100' : 'opacity-30'}`}
            style={{
              filter: isFullStar 
                ? 'brightness(0) saturate(100%) invert(78%) sepia(86%) saturate(2476%) hue-rotate(7deg) brightness(101%) contrast(107%)' 
                : 'brightness(0) saturate(100%) invert(80%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(95%) contrast(85%)'
            }}
          />
        );
      }
    }
    return stars;
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return { color: 'bg-green-100 text-green-800', text: 'Aktif' };
      case 'inactive':
        return { color: 'bg-gray-100 text-gray-800', text: 'Pasif' };
      case 'maintenance':
        return { color: 'bg-yellow-100 text-yellow-800', text: 'Bakımda' };
      default:
        return { color: 'bg-gray-100 text-gray-800', text: 'Bilinmiyor' };
    }
  };

  const statusBadge = getStatusBadge(pitch.status);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
      {/* Pitch Image */}
      <div className="relative h-48 bg-gray-200">
        <img
          src={pitch.image}
          alt={pitch.name}
          className="w-full h-full object-cover object-center"
          onError={(e) => {
            console.log("Image failed to load:", pitch.image);
            e.target.src = "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=250&fit=crop";
          }}
        />
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
            {statusBadge.text}
          </span>
        </div>
      </div>

      {/* Pitch Info */}
      <div className="p-4 flex-grow flex flex-col">
        {/* Rating Badge */}
        <div className="flex items-center gap-1 mb-2">
          {renderStars(pitch.rating)}
          <span className="text-sm font-medium text-gray-700 ml-1">
            {pitch.rating}
          </span>
          {pitch.totalReviews > 0 && (
            <span className="text-xs text-gray-500 ml-1">
              ({pitch.totalReviews})
            </span>
          )}
        </div>

        {/* Pitch Name */}
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {pitch.name}
        </h3>
        
        <div className="flex items-center gap-1 mb-2">
          <img 
            src="https://www.svgrepo.com/show/486721/location.svg" 
            alt="Location" 
            className="w-4 h-4 flex-shrink-0"
          />
          <p className="text-gray-600 text-sm">{pitch.location}</p>
        </div>
        


        {/* Features Header */}
        <div className="mb-2">
          <h4 className="text-sm font-medium text-gray-800">Özellikler</h4>
        </div>

        {/* Filterable Features */}
        <div className="mb-3 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">→</span>
            <span className="text-sm text-gray-600">{pitch.capacity}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">→</span>
            <span className="text-sm text-gray-600">
              {pitch.pitchType === 'indoor' ? 'Kapalı Saha' : 'Açık Saha'}
            </span>
          </div>
          {pitch.cameraSystem && (
            <div className="flex items-center gap-2">
              <span className="text-gray-400">→</span>
              <span className="text-sm text-gray-600">Kamera Sistemi</span>
            </div>
          )}
          {pitch.shoeRental && (
            <div className="flex items-center gap-2">
              <span className="text-gray-400">→</span>
              <span className="text-sm text-gray-600">Ayakkabı Kiralama</span>
            </div>
          )}
        </div>

        {/* Spacer to push button to bottom */}
        <div className="flex-grow"></div>

        {/* Price and Button Section - Fixed at bottom */}
        <div className="mt-auto">
          {/* Maintenance Warning */}
          {pitch.status === 'maintenance' && (
            <div className="mb-3 text-center">
              <p className="text-[rgb(0,100,0)] text-sm font-semibold">
                Yakında Rezervasyona Açılacak!
              </p>
            </div>
          )}

          {/* Price and Button */}
          <div className="flex justify-between items-center">
            <div>
              <span className="text-xl font-bold text-gray-900">
                ₺{pitch.price}
              </span>
            </div>
            
            <button 
              onClick={handleReservation}
              disabled={pitch.status !== 'active'}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                pitch.status === 'active'
                  ? 'bg-[rgb(0,128,0)] text-white hover:bg-[rgb(0,100,0)] focus:ring-green-500'
                  : pitch.status === 'maintenance'
                  ? 'bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-500'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              tabIndex="0"
            >
              {pitch.status === 'active' 
                ? 'Rezervasyon Yap' 
                : pitch.status === 'maintenance'
                ? 'İletişime Geç'
                : 'Rezervasyon Yapılamaz'
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PitchCard; 