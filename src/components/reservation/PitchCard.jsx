function PitchCard({ pitch, onReservation }) {
  const handleReservation = () => {
    onReservation(pitch.id);
  };

  // Render stars for rating
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const stars = [];
    
    for (let i = 0; i < 5; i++) {
      stars.push(
        <svg 
          key={i} 
          className={`w-4 h-4 ${i < fullStars ? 'text-yellow-400' : 'text-gray-300'}`} 
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
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
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Pitch Image */}
      <div className="relative h-48 bg-gray-200">
        <img
          src={pitch.image}
          alt={pitch.name}
          className="w-full h-full object-cover"
        />
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
            {statusBadge.text}
          </span>
        </div>
        {/* Rating Badge */}
        <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-full shadow-sm">
          <div className="flex items-center gap-1">
            {renderStars(pitch.rating)}
            <span className="text-sm font-medium text-gray-700 ml-1">
              {pitch.rating}
            </span>
          </div>
        </div>
      </div>

      {/* Pitch Info */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {pitch.name}
        </h3>
        
        <p className="text-gray-600 text-sm mb-2">{pitch.location}</p>
        
        {/* Capacity and Surface Type */}
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            {pitch.capacity}
          </span>
          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
            {pitch.pitchType === 'indoor' ? 'Kapalı' : 'Açık'} Saha
          </span>
          {pitch.totalReviews && (
            <span className="text-gray-500 text-xs">
              ({pitch.totalReviews} değerlendirme)
            </span>
          )}
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-1 mb-3">
          {pitch.features.slice(0, 3).map((feature) => (
            <span
              key={feature}
              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
            >
              {feature}
            </span>
          ))}
          {pitch.features.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
              +{pitch.features.length - 3} daha
            </span>
          )}
        </div>

        {/* Price and Button */}
        <div className="flex justify-between items-center">
          <div>
            <span className="text-xl font-bold text-gray-900">
              ₺{pitch.price}
            </span>
            <span className="text-gray-500 text-sm">/saat</span>
            {pitch.nightPrice && pitch.nightPrice !== pitch.price && (
              <div className="text-sm text-gray-600">
                Gece: ₺{pitch.nightPrice}
              </div>
            )}
          </div>
          
          <button 
            onClick={handleReservation}
            disabled={pitch.status !== 'active'}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              pitch.status === 'active'
                ? 'bg-[rgb(0,128,0)] text-white hover:bg-[rgb(0,100,0)] focus:ring-green-500'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            tabIndex="0"
          >
            {pitch.status === 'active' ? 'Rezervasyon Yap' : 'Rezervasyon Yapılamaz'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PitchCard; 