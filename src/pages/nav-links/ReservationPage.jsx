import { useState, useEffect } from "react";
import Header from "../../components/shared/Header";
import Footer from "../../components/shared/Footer";
import ReservationHero from "../../components/reservation/ReservationHero";
import SearchAndSort from "../../components/reservation/SearchAndSort";
import ReservationFilters from "../../components/reservation/ReservationFilters";
import PitchList from "../../components/reservation/PitchList";

function ReservationPage() {
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedCapacity, setSelectedCapacity] = useState("");
  const [selectedPitchTypes, setSelectedPitchTypes] = useState([]);
  const [selectedCameraSystems, setSelectedCameraSystems] = useState([]);
  const [selectedRating, setSelectedRating] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [filteredPitches, setFilteredPitches] = useState([]);

  // Mock data for pitches
  const pitches = [
    {
      id: 1,
      name: "Beşiktaş Spor Kompleksi",
      location: "Beşiktaş, İstanbul",
      city: "İstanbul",
      district: "Beşiktaş",
      price: 200,
      rating: 4.8,
      capacity: "7v7",
      pitchType: "indoor",
      cameraSystem: true,
      image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=250&fit=crop",
      features: ["Halı Saha", "Işıklandırma", "Soyunma Odası", "Otopark"],
      availableHours: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"]
    },
    {
      id: 2,
      name: "Kadıköy Futbol Sahası",
      location: "Kadıköy, İstanbul",
      city: "İstanbul",
      district: "Kadıköy",
      price: 180,
      rating: 4.6,
      capacity: "6v6",
      pitchType: "outdoor",
      cameraSystem: false,
      image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=250&fit=crop",
      features: ["Halı Saha", "Işıklandırma", "Soyunma Odası"],
      availableHours: ["08:00", "09:00", "10:00", "13:00", "14:00", "15:00", "16:00"]
    },
    {
      id: 3,
      name: "Şişli Premium Saha",
      location: "Şişli, İstanbul",
      city: "İstanbul",
      district: "Şişli",
      price: 300,
      rating: 4.9,
      capacity: "8v8",
      pitchType: "indoor",
      cameraSystem: true,
      image: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400&h=250&fit=crop",
      features: ["Halı Saha", "Işıklandırma", "Soyunma Odası", "Otopark", "Kafeterya"],
      availableHours: ["10:00", "11:00", "12:00", "15:00", "16:00", "17:00"]
    },
    {
      id: 4,
      name: "Gaziosmanpaşa Arena",
      location: "Gaziosmanpaşa, İstanbul",
      city: "İstanbul",
      district: "Gaziosmanpaşa",
      price: 220,
      rating: 4.5,
      capacity: "7v7",
      pitchType: "outdoor",
      cameraSystem: true,
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop",
      features: ["Halı Saha", "Işıklandırma", "Soyunma Odası"],
      availableHours: ["09:00", "10:00", "11:00", "14:00", "15:00"]
    },
    {
      id: 5,
      name: "Ataşehir Spor Merkezi",
      location: "Ataşehir, İstanbul",
      city: "İstanbul",
      district: "Ataşehir",
      price: 250,
      rating: 4.7,
      capacity: "11v11",
      pitchType: "outdoor",
      cameraSystem: false,
      image: "https://images.unsplash.com/photo-1590077428593-a55bb07c4665?w=400&h=250&fit=crop",
      features: ["Halı Saha", "Işıklandırma", "Soyunma Odası", "Otopark", "Duş"],
      availableHours: ["08:00", "09:00", "10:00", "13:00", "14:00", "15:00"]
    },
    {
      id: 6,
      name: "Maltepe Futbol Sahası",
      location: "Maltepe, İstanbul",
      city: "İstanbul",
      district: "Maltepe",
      price: 170,
      rating: 4.3,
      capacity: "5v5",
      pitchType: "indoor",
      cameraSystem: false,
      image: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=400&h=250&fit=crop",
      features: ["Halı Saha", "Işıklandırma"],
      availableHours: ["09:00", "10:00", "11:00", "16:00", "17:00"]
    }
  ];

  // Initialize filtered pitches on component mount
  useEffect(() => {
    setFilteredPitches(pitches);
  }, []);

  // Apply filters function
  const applyFilters = () => {
    let filtered = [...pitches];

    // City filter
    if (selectedCity) {
      filtered = filtered.filter(pitch => pitch.city === selectedCity);
    }

    // District filter
    if (selectedDistrict) {
      filtered = filtered.filter(pitch => pitch.district === selectedDistrict);
    }

    // Price range filter
    if (minPrice) {
      filtered = filtered.filter(pitch => pitch.price >= parseInt(minPrice));
    }
    if (maxPrice) {
      filtered = filtered.filter(pitch => pitch.price <= parseInt(maxPrice));
    }

    // Capacity filter
    if (selectedCapacity) {
      filtered = filtered.filter(pitch => pitch.capacity === selectedCapacity);
    }

    // Pitch type filter
    if (selectedPitchTypes.length > 0) {
      filtered = filtered.filter(pitch => selectedPitchTypes.includes(pitch.pitchType));
    }

    // Camera system filter
    if (selectedCameraSystems.length > 0) {
      filtered = filtered.filter(pitch => {
        const hasCameraSystem = pitch.cameraSystem;
        return selectedCameraSystems.some(system => 
          (system === "yes" && hasCameraSystem) || (system === "no" && !hasCameraSystem)
        );
      });
    }

    // Rating filter
    if (selectedRating) {
      filtered = filtered.filter(pitch => pitch.rating >= parseFloat(selectedRating));
    }

    // Search term filter
    if (searchTerm) {
      filtered = filtered.filter(pitch => 
        pitch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pitch.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    if (sortBy !== "default") {
      filtered = sortPitches(filtered, sortBy);
    }

    setFilteredPitches(filtered);
  };

  // Sort function
  const sortPitches = (pitchesToSort, sortType) => {
    const sorted = [...pitchesToSort];
    
    switch (sortType) {
      case "price-low":
        return sorted.sort((a, b) => a.price - b.price);
      case "price-high":
        return sorted.sort((a, b) => b.price - a.price);
      case "rating":
        return sorted.sort((a, b) => b.rating - a.rating);
      case "name":
        return sorted.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
      default:
        return sorted;
    }
  };

  const handleReservation = (pitchId) => {
    console.log(`Rezervasyon yapıldı: Saha ${pitchId}`);
    // Reservation logic will be implemented later
  };

  const handleSearch = () => {
    console.log("Filtreleme uygulanıyor:", { 
      selectedCity,
      selectedDistrict,
      minPrice,
      maxPrice,
      selectedCapacity,
      selectedPitchTypes,
      selectedCameraSystems,
      selectedRating,
      searchTerm 
    });
    applyFilters();
  };

  const handleSort = (sortValue) => {
    setSortBy(sortValue);
    console.log("Sıralama değişti:", sortValue);
    // Apply sorting immediately
    const sorted = sortPitches(filteredPitches, sortValue);
    setFilteredPitches(sorted);
  };

  const clearAllFilters = () => {
    setSelectedCity("");
    setSelectedDistrict("");
    setMinPrice("");
    setMaxPrice("");
    setSelectedCapacity("");
    setSelectedPitchTypes([]);
    setSelectedCameraSystems([]);
    setSelectedRating("");
    setSearchTerm("");
    setSortBy("default");
    
    // Tüm sahaları göster
    setTimeout(() => {
      setFilteredPitches(pitches);
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <ReservationHero />
      
      {/* Header Section - Centered */}
      <div className="py-6 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Mevcut Sahalar
            </h2>
            <p className="text-gray-600 text-lg">
              {filteredPitches.length} saha bulundu
            </p>
          </div>
        </div>
      </div>
      
      <SearchAndSort
        onSearch={applyFilters}
        onSort={handleSort}
        sortBy={sortBy}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
      
      {/* Main Content - Two Column Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Pitch List */}
          <div className="lg:w-3/4">            
            {filteredPitches.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.469-1.009-5.927-2.616M15 17H9m6-2a9 9 0 11-6-8.448 9 9 0 016 8.448z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Saha bulunamadı
                </h3>
                <p className="text-gray-500">
                  Arama kriterlerinizi değiştirerek tekrar deneyin.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredPitches.map((pitch) => (
                <div key={pitch.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Pitch Image */}
                  <div className="relative h-48 bg-gray-200">
                    <img
                      src={pitch.image}
                      alt={pitch.name}
                      className="w-full h-full object-cover"
                    />
                    {/* Rating Badge */}
                    <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-full shadow-sm">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <svg 
                            key={i} 
                            className={`w-4 h-4 ${i < Math.floor(pitch.rating) ? 'text-yellow-400' : 'text-gray-300'}`} 
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
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
                    
                    <p className="text-gray-600 text-sm mb-3">{pitch.location}</p>

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
                      </div>
                      
                      <button 
                        onClick={() => handleReservation(pitch.id)}
                        className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors cursor-pointer"
                        tabIndex="0"
                      >
                        Rezervasyon Yap
                      </button>
                    </div>
                  </div>
                </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Right Column - Filters Sidebar */}
          <div className="lg:w-1/4">
            <ReservationFilters
              selectedCity={selectedCity}
              setSelectedCity={setSelectedCity}
              selectedDistrict={selectedDistrict}
              setSelectedDistrict={setSelectedDistrict}
              minPrice={minPrice}
              setMinPrice={setMinPrice}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              selectedCapacity={selectedCapacity}
              setSelectedCapacity={setSelectedCapacity}
              selectedPitchTypes={selectedPitchTypes}
              setSelectedPitchTypes={setSelectedPitchTypes}
              selectedCameraSystems={selectedCameraSystems}
              setSelectedCameraSystems={setSelectedCameraSystems}
              selectedRating={selectedRating}
              setSelectedRating={setSelectedRating}
              onSearch={handleSearch}
              onClearFilters={clearAllFilters}
            />
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

export default ReservationPage; 