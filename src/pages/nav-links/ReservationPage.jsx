import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/shared/Header";
import Footer from "../../components/shared/Footer";
import ReservationHero from "../../components/reservation/ReservationHero";
import SearchAndSort from "../../components/reservation/SearchAndSort";
import ReservationFilters from "../../components/reservation/ReservationFilters";
import MobileFilters from "../../components/reservation/MobileFilters";
import PitchList from "../../components/reservation/PitchList";
import PitchCard from "../../components/reservation/PitchCard";

function ReservationPage() {
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedCapacity, setSelectedCapacity] = useState("");
  const [selectedPitchTypes, setSelectedPitchTypes] = useState([]);
  const [selectedCameraSystems, setSelectedCameraSystems] = useState([]);
  const [selectedShoeRental, setSelectedShoeRental] = useState([]);
  const [selectedRating, setSelectedRating] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [filteredPitches, setFilteredPitches] = useState([]);
  const [pitches, setPitches] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pitchesPerPage] = useState(18);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [backendLimit, setBackendLimit] = useState(18);

  // Transform dummy data to pitch format
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
        item.media?.images?.[0]?.url,
      features,
      facilities: item.facilities || {},
      status: item.status || "active",
      refundAllowed: item.refundAllowed || false,
      availableHours: generateAvailableHours(),
    };
  };

  // Error message translation function
  const translateMessage = (message) => {
    const translations = {
      // Network errors
      "Failed to fetch":
        "Bağlantı hatası oluştu. İnternet bağlantınızı kontrol edin.",
      "Network Error": "Ağ hatası oluştu. Lütfen tekrar deneyin.",

      // Backend error messages
      "You have been banned, please get contact with our customer service.":
        "Hesabınız askıya alınmıştır. Müşteri hizmetleri ile iletişime geçin.",
      "Please provide valid pricing limits": "Geçerli fiyat aralığı girin.",
      "Please provide a valid rating query.": "Geçerli bir puan sorgusu girin.",
      "Rating cannot be greater than 5.": "Puan 5'ten büyük olamaz.",
      "No pitch found.":
        "Saha bulunamadı. Arama kriterlerinizi değiştirerek tekrar deneyin.",

      // Generic errors
      "Something went wrong": "Bir şeyler ters gitti. Lütfen tekrar deneyin.",
      "Server Error": "Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.",
    };

    return (
      translations[message] ||
      "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin."
    );
  };

  // Fetch pitches from backend
  const fetchPitches = async (page = 1) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/v1/pitch?page=${page}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        let errorMessage = "Something went wrong";

        try {
          const errorData = await response.json();
          if (errorData.msg) {
            errorMessage = errorData.msg;
          }
        } catch (parseError) {
          // If can't parse error response, use status-based messages
          if (response.status === 404) {
            errorMessage = "No pitch found.";
          } else if (response.status === 403) {
            errorMessage =
              "You have been banned, please get contact with our customer service.";
          } else if (response.status >= 500) {
            errorMessage = "Server Error";
          }
        }

        throw new Error(errorMessage);
      }

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error("Error parsing response JSON:", jsonError);
        throw new Error("Server Error");
      }

      if (data.pitches && Array.isArray(data.pitches)) {
        // Filter out inactive pitches before transforming
        const activePitches = data.pitches.filter(
          (item) => item.status !== "inactive"
        );
        console.log(
          `Filtering pitches: ${activePitches.length} active / ${
            data.pitches.length
          } total (${
            data.pitches.length - activePitches.length
          } inactive filtered out)`
        );

        const transformedPitches = activePitches.map(transformDummyDataToPitch);
        console.log(
          `Loaded ${transformedPitches.length} pitches from backend (page ${page})`
        );

        // Update pagination data from backend
        setTotalCount(data.totalCount || 0);
        setBackendLimit(data.limit || 18);

        setPitches(transformedPitches);
        setFilteredPitches(transformedPitches);
        setCurrentPage(page);
      } else {
        throw new Error("No pitch found.");
      }
    } catch (error) {
      console.error("Error fetching pitches:", error);

      // Handle network errors
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        setError(translateMessage("Failed to fetch"));
      } else {
        const translatedError = translateMessage(error.message);
        setError(translatedError);
      }

      setPitches([]);
      setFilteredPitches([]);
    } finally {
      setLoading(false);
    }
  };

  // Load pitches from backend
  useEffect(() => {
    fetchPitches();
  }, []);

  // Apply filters function
  // Apply filters - now triggers backend fetch
  const applyFilters = () => {
    // For now, just refetch from page 1 with current filters
    // TODO: Implement backend filtering in next step
    fetchPitches(1);
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
        return sorted.sort((a, b) => a.name.localeCompare(b.name, "tr"));
      default:
        return sorted;
    }
  };

  const handleReservation = (pitchId) => {
    // Find the pitch to check its status
    const pitch = currentPitches.find((p) => p.id === pitchId);

    if (pitch?.status === "maintenance") {
      // For maintenance pitches, show contact info
      alert(
        `İletişim Bilgileri:\n\nTelefon: +90 212 555 0123\nE-posta: info@sporplanet.com\n\nBu saha yakında rezervasyona açılacaktır. Detaylı bilgi için bizimle iletişime geçin.`
      );
      console.log(`İletişim talebi: Saha ${pitchId} (Bakımda)`);
    } else {
      // Normal reservation logic
      console.log(`Rezervasyon yapıldı: Saha ${pitchId}`);
      alert(`Rezervasyon başarılı! Saha ID: ${pitchId}`);
    }
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
      selectedShoeRental,
      selectedRating,
      searchTerm,
    });
    applyFilters();
  };

  const handleSort = (sortValue) => {
    setSortBy(sortValue);
    console.log("Sıralama değişti:", sortValue);
    // TODO: Implement backend sorting in next step
    // For now, just refetch from page 1
    fetchPitches(1);
  };

  const clearAllFilters = () => {
    setSelectedCity("");
    setSelectedDistrict("");
    setMinPrice("");
    setMaxPrice("");
    setSelectedCapacity("");
    setSelectedPitchTypes([]);
    setSelectedCameraSystems([]);
    setSelectedShoeRental([]);
    setSelectedRating("");
    setSearchTerm("");
    setSortBy("default");

    // Refetch all pitches from page 1
    fetchPitches(1);
  };

  // Pagination logic (backend-driven)
  const currentPitches = filteredPitches; // Backend already provides paginated data
  const totalPages = totalCount > 0 ? Math.ceil(totalCount / backendLimit) : 0;
  const indexOfFirstPitch =
    totalCount > 0 ? (currentPage - 1) * backendLimit + 1 : 0;
  const indexOfLastPitch =
    totalCount > 0 ? Math.min(currentPage * backendLimit, totalCount) : 0;

  // Change page
  const handlePageChange = (pageNumber) => {
    if (pageNumber !== currentPage) {
      fetchPitches(pageNumber);
      // Scroll to top when page changes
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than or equal to maxVisiblePages
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Show first page
      pageNumbers.push(1);

      if (currentPage > 3) {
        pageNumbers.push("...");
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pageNumbers.includes(i)) {
          pageNumbers.push(i);
        }
      }

      if (currentPage < totalPages - 2) {
        pageNumbers.push("...");
      }

      // Show last page
      if (!pageNumbers.includes(totalPages)) {
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
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
              {totalCount} saha bulundu
              {totalPages > 1 && (
                <span className="ml-2">
                  (Sayfa {currentPage} / {totalPages})
                </span>
              )}
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

      {/* Mobile Filters - Show only on mobile and tablet */}
      <MobileFilters
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
        selectedShoeRental={selectedShoeRental}
        setSelectedShoeRental={setSelectedShoeRental}
        selectedRating={selectedRating}
        setSelectedRating={setSelectedRating}
        onSearch={handleSearch}
        onClearFilters={clearAllFilters}
      />

      {/* Main Content - Two Column Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Pitch List */}
          <div className="lg:w-3/4">
            {loading ? (
              <div className="col-span-full text-center py-12">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mb-4"></div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Sahalar yükleniyor...
                  </h3>
                  <p className="text-gray-500">
                    Lütfen bekleyin, veriler getiriliyor.
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="col-span-full text-center py-12">
                <div className="text-red-400 mb-4">
                  <svg
                    className="w-16 h-16 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Hata Oluştu
                </h3>
                <p className="text-gray-500 mb-4">{error}</p>
                <button
                  onClick={() => fetchPitches(1)}
                  className="bg-[rgb(0,128,0)] text-white px-4 py-2 rounded-md hover:bg-[rgb(0,100,0)] transition-colors font-semibold"
                >
                  Tekrar Dene
                </button>
              </div>
            ) : currentPitches.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg
                    className="w-16 h-16 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.469-1.009-5.927-2.616M15 17H9m6-2a9 9 0 11-6-8.448 9 9 0 016 8.448z"
                    />
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
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {currentPitches.map((pitch) => (
                    <PitchCard
                      key={pitch.id}
                      pitch={pitch}
                      onReservation={handleReservation}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8">
                    {/* Mobile Pagination Info */}
                    <div className="sm:hidden text-center mb-4">
                      <p className="text-sm text-gray-600">
                        Sayfa {currentPage} / {totalPages} - Toplam {totalCount}{" "}
                        saha
                      </p>
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex justify-center">
                      <nav className="flex items-center space-x-1 sm:space-x-2">
                        {/* Previous Button */}
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className={`px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                            currentPage === 1
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                          }`}
                        >
                          <span className="hidden sm:inline">Önceki</span>
                          <span className="sm:hidden">‹</span>
                        </button>

                        {/* Page Numbers */}
                        <div className="flex items-center space-x-1">
                          {getPageNumbers().map((pageNumber, index) => (
                            <button
                              key={index}
                              onClick={() =>
                                typeof pageNumber === "number" &&
                                handlePageChange(pageNumber)
                              }
                              disabled={typeof pageNumber !== "number"}
                              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center justify-center ${
                                pageNumber === currentPage
                                  ? "bg-[rgb(0,128,0)] text-white shadow-md"
                                  : typeof pageNumber === "number"
                                  ? "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 hover:border-gray-400"
                                  : "bg-transparent text-gray-400 cursor-default"
                              }`}
                            >
                              {pageNumber}
                            </button>
                          ))}
                        </div>

                        {/* Next Button */}
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className={`px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                            currentPage === totalPages
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                          }`}
                        >
                          <span className="hidden sm:inline">Sonraki</span>
                          <span className="sm:hidden">›</span>
                        </button>
                      </nav>
                    </div>

                    {/* Desktop Pagination Info */}
                    <div className="hidden sm:block text-center mt-4">
                      <p className="text-sm text-gray-600">
                        Gösterilen: {indexOfFirstPitch}-{indexOfLastPitch} /{" "}
                        {totalCount} saha
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right Column - Filters Sidebar - Hide on mobile and tablet */}
          <div className="hidden lg:block lg:w-1/4">
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
              selectedShoeRental={selectedShoeRental}
              setSelectedShoeRental={setSelectedShoeRental}
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
