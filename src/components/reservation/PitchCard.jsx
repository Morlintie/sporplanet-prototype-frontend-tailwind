function PitchCard({ pitch, onReservation }) {
  const handleReservation = (time) => {
    onReservation(pitch.id, time);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      {/* Pitch Image */}
      <div className="h-48 bg-gray-200">
        <img
          src={pitch.image}
          alt={pitch.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Pitch Info */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-gray-900">
            {pitch.name}
          </h3>
          <div className="flex items-center">
            <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm text-gray-600">{pitch.rating}</span>
          </div>
        </div>

        <p className="text-gray-600 mb-4">{pitch.location}</p>

        {/* Features */}
        <div className="flex flex-wrap gap-2 mb-4">
          {pitch.features.map((feature) => (
            <span
              key={feature}
              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
            >
              {feature}
            </span>
          ))}
        </div>

        {/* Price */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <span className="text-2xl font-bold text-green-600">
              ₺{pitch.price}
            </span>
            <span className="text-gray-500 text-sm">/saat</span>
          </div>
        </div>

        {/* Available Hours */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Müsait Saatler
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {pitch.availableHours.map((hour) => (
              <button
                key={hour}
                onClick={() => handleReservation(hour)}
                className="px-3 py-1 text-sm border border-blue-300 text-blue-600 rounded hover:bg-blue-50 transition-colors cursor-pointer"
                tabIndex="0"
              >
                {hour}
              </button>
            ))}
          </div>
        </div>

        {/* Reserve Button */}
        <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium cursor-pointer">
          Rezervasyon Yap
        </button>
      </div>
    </div>
  );
}

export default PitchCard; 