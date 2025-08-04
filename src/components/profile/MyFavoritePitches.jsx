import { useState } from "react";
import { useFavorites } from "../../context/FavoritesContext";

function MyFavoritePitches({ user }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const { favorites, removeFromFavorites, loading } = useFavorites();

  // Favori sahalar artık context'ten geliyor - mock veri kaldırıldı
  const favoritePitches = favorites.map(fav => ({
    id: fav.id,
    name: fav.name,
    image: "https://res.cloudinary.com/dppjlhdth/image/upload/v1745746418/SporPlanet_Transparent_Logo_hecyyn.png",
    location: `${fav.location.address.district}, ${fav.location.address.city}`,
    rating: fav.rating.averageRating,
    price: `${fav.pricing.hourlyRate}₺/saat`,
    lastVisited: "Henüz ziyaret edilmedi",
    addedDate: fav.addedAt.toLocaleDateString('tr-TR'),
    category: fav.category,
    features: [
      ...(fav.facilities.changingRooms ? ["Soyunma Odası"] : []),
      ...(fav.facilities.showers ? ["Duş"] : []),
      ...(fav.facilities.parking ? ["Otopark"] : []),
      ...(fav.specifications.hasLighting ? ["Işıklandırma"] : []),
      ...(fav.specifications.isIndoor ? ["Kapalı"] : ["Açık"]),
      ...(fav.facilities.otherAmenities || [])
    ]
  }));

  const handleRemoveFromFavorites = async (pitchId) => {
    if (window.confirm('Bu sahayı favorilerden kaldırmak istediğinizden emin misiniz?')) {
      const success = await removeFromFavorites(pitchId);
      if (success) {
        // Başarılı mesajı gösterebiliriz
      } else {
        alert('Saha favorilerden kaldırılırken bir hata oluştu.');
      }
    }
  };

  const filteredPitches = favoritePitches.filter(pitch => {
    const matchesSearch = pitch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pitch.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterBy === "all") return matchesSearch;
    return matchesSearch && pitch.category === filterBy;
  });

  const handleRemoveFavorite = (pitchId) => {
    console.log(`Favorilerden kaldır: ${pitchId}`);
    // TODO: Implement remove from favorites
  };

  const handleViewPitch = (pitchId) => {
    console.log(`Sahayı görüntüle: ${pitchId}`);
    // TODO: Navigate to pitch detail
  };

  const categories = ["all", "Halısaha", "Açık Saha", "Premium"];

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Favori Sahalarım</h2>
          <div className="flex items-center space-x-2">
            <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            <span className="text-lg font-semibold text-gray-700">{favoritePitches.length} Saha</span>
          </div>
        </div>
        
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Saha ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="all">Tüm Kategoriler</option>
            {categories.slice(1).map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Pitches Grid */}
      <div className="p-6">
        {filteredPitches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPitches.map((pitch) => (
              <div key={pitch.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="relative">
                  <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                    <img 
                      src={pitch.image} 
                      alt={pitch.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    onClick={() => handleRemoveFromFavorites(pitch.id)}
                    disabled={loading}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                    title="Favorilerden kaldır"
                  >
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                  </button>
                  <div className="absolute top-2 left-2 px-2 py-1 bg-green-600 text-white text-xs rounded-full">
                    {pitch.category}
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{pitch.name}</h3>
                  <p className="text-sm text-gray-600 mb-2 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {pitch.location}
                  </p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      <span className="text-sm text-gray-600">{pitch.rating}</span>
                    </div>
                    <span className="text-sm font-semibold text-green-600">{pitch.price}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {pitch.features.slice(0, 3).map((feature, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded">
                        {feature}
                      </span>
                    ))}
                    {pitch.features.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded">
                        +{pitch.features.length - 3}
                      </span>
                    )}
                  </div>
                  
                  <div className="text-xs text-gray-500 mb-3">
                    Son ziyaret: {pitch.lastVisited}
                  </div>
                  
                  <button
                    onClick={() => handleViewPitch(pitch.id)}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors font-medium text-sm"
                  >
                    Sahayı Görüntüle
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Favori saha bulunamadı</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterBy !== "all" 
                ? "Arama kriterlerinize uygun favori saha bulunamadı."
                : "Henüz favori sahanız bulunmuyor."
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyFavoritePitches;