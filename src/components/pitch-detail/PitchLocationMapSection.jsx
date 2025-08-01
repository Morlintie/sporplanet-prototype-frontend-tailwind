function PitchLocationMapSection({ pitch }) {
  // Koordinatları pitch data'sından al
  const coordinates = pitch.coordinates || {
    lat: 41.0082,
    lng: 28.9784
  };
  
  // Google Maps Embed URL oluştur
  const getMapUrl = () => {
    const { lat, lng } = coordinates;
    return `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${lat},${lng}&zoom=15&maptype=roadmap`;
  };

  // Static map URL (API key gerektirmez)
  const getStaticMapUrl = () => {
    const { lat, lng } = coordinates;
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&size=400x250&maptype=roadmap&markers=color:red%7C${lat},${lng}&key=YOUR_API_KEY`;
  };

  // OpenStreetMap kullanıyoruz (ücretsiz ve API key gerektirmeyen harita servisi)
  const getOpenStreetMapUrl = () => {
    const { lat, lng } = coordinates;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.01},${lat-0.01},${lng+0.01},${lat+0.01}&layer=mapnik&marker=${lat},${lng}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Konum</h2>
      
      {/* Address Info */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <img 
            src="https://www.svgrepo.com/show/486721/location.svg" 
            alt="Location" 
            className="w-5 h-5"
          />
          <p className="text-gray-700 font-medium">{pitch.fullAddress}</p>
        </div>
        <p className="text-gray-600 text-sm ml-7">
          {pitch.location}
        </p>
        <p className="text-gray-500 text-xs ml-7 mt-1">
          {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
        </p>
      </div>

      {/* Interactive Map */}
      <div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden border border-gray-300">
        <iframe
          src={getOpenStreetMapUrl()}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Saha Konumu"
        ></iframe>
      </div>

      {/* Map Actions */}
      <div className="mt-4 flex gap-2">
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2 px-3 rounded-md text-center transition-colors"
        >
          Google Maps'te Aç
        </a>
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${coordinates.lat},${coordinates.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm font-medium py-2 px-3 rounded-md text-center transition-colors"
        >
          Yol Tarifi Al
        </a>
      </div>

      {/* Distance Info */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Merkeze Uzaklık</p>
            <p className="font-medium text-gray-900">~2.5 km</p>
          </div>
          <div>
            <p className="text-gray-500">Ulaşım</p>
            <p className="font-medium text-gray-900">Metro, Otobüs</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PitchLocationMapSection;