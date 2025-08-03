import { useState } from "react";
import { useNavigate } from "react-router-dom";

function MyReservations({ user }) {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("all");

  // Mock reservation data with more details
  const reservations = [
    {
      id: 1,
      pitchName: "Kartal City",
      pitchImage: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=250&fit=crop",
      date: "2025-01-25",
      time: "19:00",
      duration: "2 saat",
      status: "active",
      price: 1200,
      location: "Kartal, İstanbul",
      capacity: "11v11",
      pitchType: "indoor",
      cameraSystem: true,
      shoeRental: false,
      rating: 4.5,
      totalReviews: 127,
      isExpired: false
    },
    {
      id: 2,
      pitchName: "Spor Plus",
      pitchImage: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop",
      date: "2025-01-20",
      time: "20:00",
      duration: "1.5 saat",
      status: "completed",
      price: 900,
      location: "Kadıköy, İstanbul",
      capacity: "7v7",
      pitchType: "outdoor",
      cameraSystem: false,
      shoeRental: true,
      rating: 4.2,
      totalReviews: 89,
      isExpired: true
    },
    {
      id: 3,
      pitchName: "Dream Saha",
      pitchImage: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=250&fit=crop",
      date: "2025-01-30",
      time: "18:00",
      duration: "2 saat",
      status: "active",
      price: 1000,
      location: "Beşiktaş, İstanbul",
      capacity: "5v5",
      pitchType: "indoor",
      cameraSystem: true,
      shoeRental: true,
      rating: 4.8,
      totalReviews: 203,
      isExpired: false
    },
    {
      id: 4,
      pitchName: "Futbol Akademi",
      pitchImage: "https://images.unsplash.com/photo-1552318965-6e6be7484ada?w=400&h=250&fit=crop",
      date: "2025-01-15",
      time: "21:00",
      duration: "1 saat",
      status: "cancelled",
      price: 800,
      location: "Şişli, İstanbul",
      capacity: "6v6",
      pitchType: "outdoor",
      cameraSystem: false,
      shoeRental: false,
      rating: 3.9,
      totalReviews: 45,
      isExpired: true
    }
  ];

  const filteredReservations = reservations.filter(reservation => {
    if (activeFilter === "all") return true;
    return reservation.status === activeFilter;
  });

  const getStatusInfo = (status) => {
    switch (status) {
      case "active":
        return { text: "Aktif", color: "bg-green-100 text-green-800" };
      case "completed":
        return { text: "Tamamlandı", color: "bg-gray-100 text-gray-800" };
      case "cancelled":
        return { text: "İptal", color: "bg-red-100 text-red-800" };
      case "refunded":
        return { text: "İade", color: "bg-yellow-100 text-yellow-800" };
      default:
        return { text: "Bilinmiyor", color: "bg-gray-100 text-gray-800" };
    }
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
                filter:
                  "brightness(0) saturate(100%) invert(80%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(95%) contrast(85%)",
              }}
            />
            {/* Foreground (filled) star with clip */}
            <img
              src="https://www.svgrepo.com/show/13695/star.svg"
              alt="Star"
              className="absolute w-4 h-4 opacity-100"
              style={{
                filter:
                  "brightness(0) saturate(100%) invert(78%) sepia(86%) saturate(2476%) hue-rotate(7deg) brightness(101%) contrast(107%)",
                clipPath: `inset(0 ${100 - partialStarValue * 100}% 0 0)`,
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
            className={`w-4 h-4 ${isFullStar ? "opacity-100" : "opacity-30"}`}
            style={{
              filter: isFullStar
                ? "brightness(0) saturate(100%) invert(78%) sepia(86%) saturate(2476%) hue-rotate(7deg) brightness(101%) contrast(107%)"
                : "brightness(0) saturate(100%) invert(80%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(95%) contrast(85%)",
            }}
          />
        );
      }
    }
    return stars;
  };

  const handleCreateListing = (reservation) => {
    // Navigate to matches page with pre-filled data
    const listingData = {
      title: `${reservation.pitchName} - ${reservation.capacity} Oyuncu Aranıyor`,
      date: reservation.date,
      time: reservation.time,
      duration: reservation.duration,
      location: reservation.location,
      price: Math.ceil(reservation.price / 22), // Divide by number of players
      pitchName: reservation.pitchName,
      pitchImage: reservation.pitchImage,
      capacity: reservation.capacity,
      pitchType: reservation.pitchType
    };
    
    // Store in localStorage for matches page to use
    localStorage.setItem('createListingData', JSON.stringify(listingData));
    navigate('/matches?action=create');
  };

  const handleViewDetails = (reservation) => {
    // Navigate to pitch detail page
    navigate(`/pitch-detail/${reservation.id}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Rezervasyonlarım</h1>
      
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-green-50 p-6 rounded-lg">
          <div className="text-3xl font-bold text-green-600">{user.totalReservations}</div>
          <div className="text-sm text-gray-600">Toplam Rezervasyon</div>
        </div>
        <div className="bg-blue-50 p-6 rounded-lg">
          <div className="text-3xl font-bold text-blue-600">3</div>
          <div className="text-sm text-gray-600">Aktif</div>
        </div>
        <div className="bg-purple-50 p-6 rounded-lg">
          <div className="text-3xl font-bold text-purple-600">5</div>
          <div className="text-sm text-gray-600">Tamamlanan</div>
        </div>
        <div className="bg-orange-50 p-6 rounded-lg">
          <div className="text-3xl font-bold text-orange-600">1</div>
          <div className="text-sm text-gray-600">İptal</div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveFilter("all")}
          className={`px-6 py-2 rounded-full font-medium transition-colors cursor-pointer ${
            activeFilter === "all"
              ? "bg-green-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          tabIndex="0"
        >
          Tümü
        </button>
        <button
          onClick={() => setActiveFilter("active")}
          className={`px-6 py-2 rounded-full font-medium transition-colors cursor-pointer ${
            activeFilter === "active"
              ? "bg-green-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          tabIndex="0"
        >
          Aktif
        </button>
        <button
          onClick={() => setActiveFilter("completed")}
          className={`px-6 py-2 rounded-full font-medium transition-colors cursor-pointer ${
            activeFilter === "completed"
              ? "bg-green-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          tabIndex="0"
        >
          Tamamlanan
        </button>
        <button
          onClick={() => setActiveFilter("cancelled")}
          className={`px-6 py-2 rounded-full font-medium transition-colors cursor-pointer ${
            activeFilter === "cancelled"
              ? "bg-green-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          tabIndex="0"
        >
          İptal
        </button>
      </div>

      {/* Reservation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReservations.map((reservation) => {
          const statusInfo = getStatusInfo(reservation.status);
          const isActiveAndNotExpired = reservation.status === "active" && !reservation.isExpired;
          
          return (
            <div key={reservation.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
              {/* Pitch Image */}
              <div className="relative h-48 bg-gray-200">
                <img
                  src={reservation.pitchImage}
                  alt={reservation.pitchName}
                  className="w-full h-full object-cover object-center"
                  onError={(e) => {
                    console.log("Image failed to load:", reservation.pitchImage);
                    e.target.src =
                      "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=250&fit=crop";
                  }}
                />
                {/* Status Badge */}
                <div className="absolute top-3 left-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
                  >
                    {statusInfo.text}
                  </span>
                </div>
                {/* Expired Badge */}
                {reservation.isExpired && (
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Süresi Doldu
                    </span>
                  </div>
                )}
              </div>

              {/* Pitch Info */}
              <div className="p-4 flex-grow flex flex-col">
                {/* Rating Badge */}
                {reservation.rating !== null && reservation.totalReviews !== null && (
                  <div className="flex items-center gap-1 mb-2">
                    {renderStars(reservation.rating)}
                    <span className="text-sm font-medium text-gray-700 ml-1">
                      {reservation.rating}
                    </span>
                    {reservation.totalReviews > 0 && (
                      <span className="text-xs text-gray-500 ml-1">
                        ({reservation.totalReviews})
                      </span>
                    )}
                  </div>
                )}

                {/* Pitch Name */}
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {reservation.pitchName}
                </h3>

                <div className="flex items-center gap-1 mb-2">
                  <img
                    src="https://www.svgrepo.com/show/486721/location.svg"
                    alt="Location"
                    className="w-4 h-4 flex-shrink-0"
                  />
                  <p className="text-gray-600 text-sm">{reservation.location}</p>
                </div>

                {/* Reservation Details */}
                <div className="mb-3 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">→</span>
                    <span className="text-sm text-gray-600">
                      {new Date(reservation.date).toLocaleDateString('tr-TR')} - {reservation.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">→</span>
                    <span className="text-sm text-gray-600">{reservation.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">→</span>
                    <span className="text-sm text-gray-600">{reservation.capacity}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">→</span>
                    <span className="text-sm text-gray-600">
                      {reservation.pitchType === "indoor" ? "Kapalı Saha" : "Açık Saha"}
                    </span>
                  </div>
                </div>

                {/* Spacer to push buttons to bottom */}
                <div className="flex-grow"></div>

                {/* Price and Buttons Section */}
                <div className="mt-auto">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xl font-bold text-gray-900">
                      ₺{reservation.price}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewDetails(reservation)}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors cursor-pointer"
                      tabIndex="0"
                    >
                      Detaylar
                    </button>
                    
                    {isActiveAndNotExpired && (
                      <button
                        onClick={() => handleCreateListing(reservation)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors cursor-pointer"
                        tabIndex="0"
                      >
                        İlana Koy
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredReservations.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Rezervasyon Bulunamadı</h3>
          <p className="text-gray-600">
            Seçilen filtreye uygun rezervasyon bulunamadı.
          </p>
        </div>
      )}
    </div>
  );
}

export default MyReservations; 