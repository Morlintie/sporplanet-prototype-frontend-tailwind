function PitchFeaturesSection({ pitch }) {
  // Tüm mümkün özellikler listesi
  const allFeatures = [
    // Temel Saha Özellikleri
    { key: 'surfaceType', label: 'Yapay Çim', category: 'Zemin' },
    { key: 'naturalGrass', label: 'Doğal Çim', category: 'Zemin' },
    { key: 'indoorCourt', label: 'Kapalı Kort', category: 'Zemin' },
    { key: 'isIndoor', label: 'Kapalı Saha', category: 'Yapı' },
    { key: 'hasLighting', label: 'Işıklandırma', category: 'Yapı' },
    
    // Tesis Özellikleri
    { key: 'changingRooms', label: 'Soyunma Odası', category: 'Tesis' },
    { key: 'showers', label: 'Duş', category: 'Tesis' },
    { key: 'parking', label: 'Otopark', category: 'Tesis' },
    { key: 'camera', label: 'Kamera Sistemi', category: 'Güvenlik' },
    { key: 'shoeRenting', label: 'Ayakkabı Kiralama', category: 'Hizmet' },
    
    // Ek Hizmetler
    { key: 'wifi', label: 'WiFi', category: 'Teknoloji' },
    { key: 'cafe', label: 'Kafeterya', category: 'Sosyal' },
    { key: 'locker', label: 'Dolap', category: 'Tesis' },
    { key: 'snack bar', label: 'Snack Bar', category: 'Sosyal' },
    { key: 'first aid', label: 'İlk Yardım', category: 'Güvenlik' },
    { key: 'referee room', label: 'Hakem Odası', category: 'Tesis' },
    { key: 'spectator area', label: 'Seyirci Alanı', category: 'Sosyal' },
    { key: 'sound system', label: 'Ses Sistemi', category: 'Teknoloji' },
    
    // Kapasite Özellikleri
    { key: 'capacity', label: `${pitch.capacity}`, category: 'Kapasite' },
  ];

  // Sahanın sahip olduğu özellikler
  const pitchHasFeature = (featureKey) => {
    switch (featureKey) {
      case 'surfaceType':
        return pitch.surfaceType === 'artificial_turf';
      case 'naturalGrass':
        return pitch.surfaceType === 'natural_grass';
      case 'indoorCourt':
        return pitch.surfaceType === 'indoor_court';
      case 'isIndoor':
        return pitch.pitchType === 'indoor';
      case 'hasLighting':
        return pitch.hasLighting;
      case 'changingRooms':
        return pitch.facilities?.changingRooms;
      case 'showers':
        return pitch.facilities?.showers;
      case 'parking':
        return pitch.facilities?.parking;
      case 'camera':
        return pitch.cameraSystem;
      case 'shoeRenting':
        return pitch.shoeRental;
      case 'capacity':
        return true; // Her zaman göster
      default:
        // otherAmenities içinde ara
        return pitch.facilities?.otherAmenities?.includes(featureKey);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Saha Özellikleri</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {allFeatures.map((feature, index) => {
          const hasFeature = pitchHasFeature(feature.key);
          
          return (
            <div key={index} className="flex items-center gap-3">
              <span className={`text-lg ${hasFeature ? 'text-green-500' : 'text-gray-300'}`}>
                {hasFeature ? '✓' : '✗'}
              </span>
              <span className={`text-sm ${hasFeature ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                {feature.label}
              </span>
            </div>
          );
        })}
      </div>
      
      {/* Özellik Sayısı */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            Toplam {allFeatures.filter(f => pitchHasFeature(f.key)).length} özellik mevcut
          </span>
          <span className="text-gray-400">
            {allFeatures.length} özellik arasından
          </span>
        </div>
      </div>
    </div>
  );
}

export default PitchFeaturesSection;