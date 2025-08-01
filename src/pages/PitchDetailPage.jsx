import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/shared/Header";
import Footer from "../components/shared/Footer";
import MaintenanceContactPopup from "../components/shared/MaintenanceContactPopup";
import PitchHeroSection from "../components/pitch-detail/PitchHeroSection";
import PitchAboutSection from "../components/pitch-detail/PitchAboutSection";
import PitchFeaturesSection from "../components/pitch-detail/PitchFeaturesSection";
import PitchReviewsSection from "../components/pitch-detail/PitchReviewsSection";
import PitchReservationCard from "../components/pitch-detail/PitchReservationCard";
import PitchLocationMapSection from "../components/pitch-detail/PitchLocationMapSection";
import dummyData from "../../dummydata.json";

function PitchDetailPage() {
  const { pitchId } = useParams();
  const navigate = useNavigate();
  const [pitch, setPitch] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [loading, setLoading] = useState(true);
  const [showMaintenancePopup, setShowMaintenancePopup] = useState(false);

  // Transform dummy data to pitch format (same as ReservationPage)
  const transformDummyDataToPitch = (item) => {
    const address = item.location?.address;
    const location = address
      ? `${address.district}, ${address.city}`
      : "Lokasyon bilgisi yok";

    // Generate features based on facilities
    const features = [];
    if (item.facilities?.changingRooms) features.push("Soyunma Odası");
    if (item.facilities?.showers) features.push("Duş");
    if (item.specifications?.hasLighting) features.push("Işıklandırma");
    if (item.facilities?.parking) features.push("Otopark");
    if (item.facilities?.camera) features.push("Kamera Sistemi");
    if (item.facilities?.shoeRenting) features.push("Ayakkabı Kiralama");
    if (item.facilities?.otherAmenities) {
      item.facilities.otherAmenities.forEach((amenity) => {
        if (amenity === "wifi") features.push("WiFi");
        if (amenity === "cafe") features.push("Kafeterya");
        if (amenity === "locker") features.push("Dolap");
        if (amenity === "snack bar") features.push("Snack Bar");
      });
    }

    // Surface type mapping
    const surfaceTypeMap = {
      artificial_turf: "Yapay Çim",
      natural_grass: "Doğal Çim",
      indoor_court: "Kapalı Kort",
    };

    if (
      item.specifications?.surfaceType &&
      surfaceTypeMap[item.specifications.surfaceType]
    ) {
      features.push(surfaceTypeMap[item.specifications.surfaceType]);
    }

    // Generate available hours (mock data)
    const generateAvailableHours = () => {
      const allHours = [
        "08:00",
        "09:00",
        "10:00",
        "11:00",
        "12:00",
        "13:00",
        "14:00",
        "15:00",
        "16:00",
        "17:00",
        "18:00",
        "19:00",
        "20:00",
      ];
      const randomCount = Math.floor(Math.random() * 6) + 4; // 4-9 hours
      return allHours
        .sort(() => 0.5 - Math.random())
        .slice(0, randomCount)
        .sort();
    };

    return {
      id: item.company,
      name: item.name || "İsimsiz Saha",
      description: item.description || "",
      location,
      fullAddress: address
        ? `${address.street}, ${address.neighborhood}, ${address.district}, ${address.city}`
        : "Adres bilgisi yok",
      city: address?.city || "Bilinmeyen Şehir",
      district: address?.district || "Bilinmeyen İlçe",
      price: Math.round((item.pricing?.hourlyRate || 50000) / 100), // Convert kuruş to TL
      nightPrice: Math.round((item.pricing?.nightHourlyRate || 60000) / 100),
      rating: item.rating?.averageRating || 0,
      totalReviews: item.rating?.totalReviews || 0,
      capacity: `${
        item.specifications?.recommendedCapacity?.players || 10
      } oyuncu`,
      pitchType: item.specifications?.isIndoor ? "indoor" : "outdoor",
      surfaceType: item.specifications?.surfaceType || "artificial_turf",
      hasLighting: item.specifications?.hasLighting || false,
      cameraSystem: item.facilities?.camera || false,
      shoeRental: item.facilities?.shoeRenting || false,
      image:
        item.media?.images?.find((img) => img.isPrimary)?.url ||
        item.media?.images?.[0]?.url ||
        "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=250&fit=crop",
      features,
      facilities: item.facilities || {},
      status: item.status || "active",
      refundAllowed: item.refundAllowed || false,
      availableHours: generateAvailableHours(),
      contact: item.contact || {},
      coordinates: {
        lat: item.location?.coordinates?.[1] || 41.0082,
        lng: item.location?.coordinates?.[0] || 28.9784,
      },
    };
  };

  useEffect(() => {
    try {
      // Filter out inactive pitches
      const activePitches = dummyData.filter(
        (item) => item.status !== "inactive"
      );

      // Find the pitch by ID (company field is used as ID)
      const foundPitch = activePitches.find((item) => item.company === pitchId);

      if (foundPitch) {
        const transformedPitch = transformDummyDataToPitch(foundPitch);
        setPitch(transformedPitch);

        // Show maintenance popup if pitch is under maintenance
        if (transformedPitch.status === "maintenance") {
          setShowMaintenancePopup(true);
        }
      } else {
        // Pitch not found, redirect to reservation page
        navigate("/reservation");
      }
    } catch (error) {
      console.error("Error loading pitch details:", error);
      navigate("/reservation");
    } finally {
      setLoading(false);
    }
  }, [pitchId, navigate]);

  // Render stars for rating
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasPartialStar = rating % 1 !== 0;
    const partialStarValue = rating - fullStars;
    const stars = [];

    for (let i = 0; i < 5; i++) {
      const isFullStar = i < fullStars;
      const isPartialStar = i === fullStars && hasPartialStar;

      if (isPartialStar) {
        // Partial star with gradient
        stars.push(
          <div key={i} className="relative w-5 h-5 inline-block">
            {/* Background (empty) star */}
            <img
              src="https://www.svgrepo.com/show/13695/star.svg"
              alt="Star"
              className="absolute w-5 h-5 opacity-30"
              style={{
                filter:
                  "brightness(0) saturate(100%) invert(80%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(95%) contrast(85%)",
              }}
            />
            {/* Foreground (filled) star with clip */}
            <img
              src="https://www.svgrepo.com/show/13695/star.svg"
              alt="Star"
              className="absolute w-5 h-5 opacity-100"
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
            className={`w-5 h-5 ${isFullStar ? "opacity-100" : "opacity-30"}`}
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

  const handleReservation = () => {
    if (!selectedDate || !selectedTime) {
      alert("Lütfen tarih ve saat seçiniz.");
      return;
    }

    if (pitch?.status === "maintenance") {
      alert(
        `İletişim Bilgileri:\n\nTelefon: +90 212 555 0123\nE-posta: info@sporplanet.com\n\nBu saha yakında rezervasyona açılacaktır. Detaylı bilgi için bizimle iletişime geçin.`
      );
    } else {
      alert(
        `Rezervasyon Onaylandı!\n\nSaha: ${pitch?.name}\nTarih: ${selectedDate}\nSaat: ${selectedTime}\nFiyat: ₺${pitch?.price}`
      );
    }
  };

  const handleCloseMaintenancePopup = () => {
    setShowMaintenancePopup(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Saha bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!pitch) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Saha Bulunamadı
          </h2>
          <p className="text-gray-600 mb-6">Aradığınız saha mevcut değil.</p>
          <button
            onClick={() => navigate("/reservation")}
            className="bg-[rgb(0,128,0)] text-white px-6 py-3 rounded-md hover:bg-[rgb(0,100,0)] transition-colors"
          >
            Sahalara Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <PitchHeroSection pitch={pitch} renderStars={renderStars} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* First Row: Reservation + Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Left: Reservation */}
          <div>
            <PitchReservationCard
              pitch={pitch}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              selectedTime={selectedTime}
              setSelectedTime={setSelectedTime}
              handleReservation={handleReservation}
            />
          </div>

          {/* Right: Features */}
          <div>
            <PitchFeaturesSection pitch={pitch} />
          </div>
        </div>

        {/* Second Row: Reviews + Location Map */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Left: Reviews */}
          <div>
            <PitchReviewsSection pitch={pitch} renderStars={renderStars} />
          </div>

          {/* Right: Location Map */}
          <div>
            <PitchLocationMapSection pitch={pitch} />
          </div>
        </div>

        {/* Third Row: About Section (Full Width) */}
        <div className="w-full">
          <PitchAboutSection pitch={pitch} />
        </div>
      </div>

      <Footer />

      {/* Maintenance Contact Popup */}
      <MaintenanceContactPopup
        isVisible={showMaintenancePopup}
        onClose={handleCloseMaintenancePopup}
        pitchName={pitch?.name}
        contactInfo={pitch?.contact}
      />
    </div>
  );
}

export default PitchDetailPage;
