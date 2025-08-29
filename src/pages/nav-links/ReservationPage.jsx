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
import LocationPermissionPopup from "../../components/shared/LocationPermissionPopup";

function ReservationPage() {
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedCapacity, setSelectedCapacity] = useState("");
  const [selectedPitchTypes, setSelectedPitchTypes] = useState([]);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
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

  // Location permission and nearby search states
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [isNearbySearch, setIsNearbySearch] = useState(false);
  const [currentCoordinates, setCurrentCoordinates] = useState(null);

  // Transform backend data to pitch format
  const transformDummyDataToPitch = (item) => {
    // Handle different address structures from backend
    const getLocationData = () => {
      // Try different address field structures
      const address = item.address || item.location?.address || item.location;
      
      if (!address) return { location: "Lokasyon bilgisi yok", city: "Bilinmeyen Şehir", district: "Bilinmeyen İlçe" };
      
      // Build location string
      const locationParts = [];
      if (address.district) locationParts.push(address.district);
      if (address.city) locationParts.push(address.city);
      
      const location = locationParts.length > 0 ? locationParts.join(", ") : "Lokasyon bilgisi yok";
      
      return {
        location,
        city: address.city || "Bilinmeyen Şehir",
        district: address.district || "Bilinmeyen İlçe"
      };
    };

    const locationData = getLocationData();

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

    // Handle price from backend properly
    const getPriceData = () => {
      // Try different price field structures from backend
      let price = 0;
      let nightPrice = 0;

      // Check pricePerHour field (like HomePage)
      if (item.pricePerHour) {
        if (typeof item.pricePerHour === 'object' && item.pricePerHour.amount) {
          price = item.pricePerHour.amount;
        } else if (typeof item.pricePerHour === 'number' || typeof item.pricePerHour === 'string') {
          price = parseFloat(item.pricePerHour) || 0;
        }
      }
      // Check pricing.hourlyRate field (existing logic)
      else if (item.pricing?.hourlyRate) {
        // If it's in kuruş (large number), convert to TL
        const hourlyRate = item.pricing.hourlyRate;
        price = hourlyRate > 1000 ? Math.round(hourlyRate / 100) : hourlyRate;
      }
      // Check price field
      else if (item.price) {
        if (typeof item.price === 'object' && item.price.amount) {
          price = item.price.amount;
        } else if (typeof item.price === 'number' || typeof item.price === 'string') {
          price = parseFloat(item.price) || 0;
        }
      }
      // Check cost field
      else if (item.cost) {
        price = parseFloat(item.cost) || 0;
      }

      // Handle night price
      if (item.pricing?.nightHourlyRate) {
        const nightHourlyRate = item.pricing.nightHourlyRate;
        nightPrice = nightHourlyRate > 1000 ? Math.round(nightHourlyRate / 100) : nightHourlyRate;
      } else {
        // Default night price is 20% more than day price
        nightPrice = Math.round(price * 1.2);
      }

      return { price: price || 0, nightPrice: nightPrice || 0 };
    };

    const priceData = getPriceData();

    // Handle image from backend
    const getImageUrl = () => {
      // Try different image field structures
      if (item.images && Array.isArray(item.images) && item.images.length > 0) {
        return item.images[0];
      }
      if (item.image && Array.isArray(item.image) && item.image.length > 0) {
        return item.image[0];
      }
      if (item.images && typeof item.images === 'string') {
        return item.images;
      }
      if (item.image && typeof item.image === 'string') {
        return item.image;
      }
      if (item.media?.images?.find((img) => img.isPrimary)?.url) {
        return item.media.images.find((img) => img.isPrimary).url;
      }
      if (item.media?.images?.[0]?.url) {
        return item.media.images[0].url;
      }
      if (item.photos && Array.isArray(item.photos) && item.photos.length > 0) {
        return item.photos[0];
      }
      if (item.imageUrl) {
        return item.imageUrl;
      }
      return null;
    };

    return {
      id: item._id || item.id || item.company, // Use _id or id from backend, fallback to company for compatibility
      name: item.name || "İsimsiz Saha",
      description: item.description || "",
      location: locationData.location,
      city: locationData.city,
      district: locationData.district,
      price: priceData.price,
      nightPrice: priceData.nightPrice,
      // Use only real backend rating data - no fallbacks, no dummy data
      rating: item.rating?.averageRating ?? null,
      totalReviews: item.rating?.totalReviews ?? null,
      capacity: `${
        item.specifications?.recommendedCapacity?.players || 10
      } oyuncu`,
      pitchType: item.specifications?.isIndoor ? "indoor" : "outdoor",
      surfaceType: item.specifications?.surfaceType || "artificial_turf",
      hasLighting: item.specifications?.hasLighting || false,
      cameraSystem: item.facilities?.camera || false,
      shoeRental: item.facilities?.shoeRenting || false,
      image: getImageUrl(),
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
      "Please provide required data.": "Gerekli bilgileri girin.",
      "Please provide valid capacity limits": "Geçerli kapasite değeri girin.",
      "Please provide valid facility data": "Geçerli tesis bilgisi girin.",
      "Invalid pitch type selection": "Geçersiz saha tipi seçimi.",
      "Invalid camera system selection": "Geçersiz kamera sistemi seçimi.",
      "Invalid sort parameter": "Geçersiz sıralama parametresi.",
      "Sort field not supported": "Sıralama alanı desteklenmiyor.",
      "Location access denied":
        "Konum erişimi reddedildi. Lütfen tarayıcı ayarlarınızdan konum iznini etkinleştirin.",
      "Location not available":
        "Konum bilgisi alınamadı. Lütfen daha sonra tekrar deneyin.",
      "Location timeout": "Konum bilgisi alınamadı. Zaman aşımı oluştu.",
      "Invalid search query": "Geçersiz arama sorgusu.",
      "Search term too short": "Arama terimi çok kısa. En az 2 karakter girin.",

      // Generic errors
      "Something went wrong": "Bir şeyler ters gitti. Lütfen tekrar deneyin.",
      "Server Error": "Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.",
    };

    return (
      translations[message] ||
      "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin."
    );
  };

  // Build query parameters for backend filters
  const buildFilterQueryParams = (
    page = 1,
    currentSortBy = null,
    filterOverrides = {}
  ) => {
    const params = new URLSearchParams();

    // Always include page
    params.append("page", page.toString());

    // Use filterOverrides if provided, otherwise use current state
    const activeCity = filterOverrides.hasOwnProperty("selectedCity")
      ? filterOverrides.selectedCity
      : selectedCity;
    const activeDistrict = filterOverrides.hasOwnProperty("selectedDistrict")
      ? filterOverrides.selectedDistrict
      : selectedDistrict;
    const activePitchTypes = filterOverrides.hasOwnProperty(
      "selectedPitchTypes"
    )
      ? filterOverrides.selectedPitchTypes
      : selectedPitchTypes;
    const activeCameraSystems = filterOverrides.hasOwnProperty(
      "selectedCameraSystems"
    )
      ? filterOverrides.selectedCameraSystems
      : selectedCameraSystems;
    const activeRating = filterOverrides.hasOwnProperty("selectedRating")
      ? filterOverrides.selectedRating
      : selectedRating;

    // City filter (İl)
    if (activeCity) {
      params.append("city", activeCity);
    }

    // District filter (İlçe)
    if (activeDistrict) {
      params.append("district", activeDistrict);
    }

    // Pitch Type filter (isIndoor) - only send if exactly one option is selected
    if (activePitchTypes.length === 1) {
      if (activePitchTypes.includes("indoor")) {
        params.append("isIndoor", "true");
      } else if (activePitchTypes.includes("outdoor")) {
        params.append("isIndoor", "false");
      }
    }

    // Camera System filter (camera) - only send if exactly one option is selected
    if (activeCameraSystems.length === 1) {
      if (activeCameraSystems.includes("yes")) {
        params.append("camera", "true");
      } else if (activeCameraSystems.includes("no")) {
        params.append("camera", "false");
      }
    }

    // Rating filter - send as >=value format
    if (activeRating) {
      params.append("rating", `>=${activeRating}`);
    }

    // Sort filter - send as query parameter
    // Use currentSortBy if provided, otherwise use state sortBy
    const activeSortBy = currentSortBy !== null ? currentSortBy : sortBy;
    if (activeSortBy && activeSortBy !== "default") {
      let sortValue;
      switch (activeSortBy) {
        case "price-low":
          sortValue = "pricing.hourlyRate";
          break;
        case "price-high":
          sortValue = "-pricing.hourlyRate";
          break;
        case "rating":
          sortValue = "-rating.averageRating";
          break;
        case "name":
          sortValue = "name";
          break;
        default:
          // Don't send sort parameter for default or unknown values
          break;
      }
      if (sortValue) {
        params.append("sort", sortValue);
      }
    }

    return params.toString();
  };

  // Build request body for backend filters (pricing and other body filters)
  const buildFilterRequestBody = (filterOverrides = {}) => {
    const body = {};

    // Use filterOverrides if provided, otherwise use current state
    const activeMinPrice = filterOverrides.hasOwnProperty("minPrice")
      ? filterOverrides.minPrice
      : minPrice;
    const activeMaxPrice = filterOverrides.hasOwnProperty("maxPrice")
      ? filterOverrides.maxPrice
      : maxPrice;
    const activeSelectedCapacity = filterOverrides.hasOwnProperty(
      "selectedCapacity"
    )
      ? filterOverrides.selectedCapacity
      : selectedCapacity;
    const activeSelectedShoeRental = filterOverrides.hasOwnProperty(
      "selectedShoeRental"
    )
      ? filterOverrides.selectedShoeRental
      : selectedShoeRental;
    const activeSearchTerm = filterOverrides.hasOwnProperty("searchTerm")
      ? filterOverrides.searchTerm
      : searchTerm;

    // Pricing filter
    if (activeMinPrice || activeMaxPrice) {
      body.pricing = {};
      if (activeMinPrice) {
        body.pricing.lowerLimit = parseFloat(activeMinPrice);
      }
      if (activeMaxPrice) {
        body.pricing.upperLimit = parseFloat(activeMaxPrice);
      }
    }

    // Capacity filter (recommendedCapacity)
    if (activeSelectedCapacity) {
      // Extract number of players from capacity value (e.g., "10 oyuncu" → 10)
      const playersMatch = activeSelectedCapacity.match(/(\d+) oyuncu/);
      if (playersMatch) {
        const playersCount = parseInt(playersMatch[1]);
        body.recommendedCapacity = {
          players: playersCount,
        };
      }
    }

    // Facilities filter - only send if exactly one option is selected
    if (activeSelectedShoeRental.length === 1) {
      body.facilities = body.facilities || {};
      if (activeSelectedShoeRental.includes("yes")) {
        body.facilities.shoeRenting = "true";
      } else if (activeSelectedShoeRental.includes("no")) {
        body.facilities.shoeRenting = "false";
      }
    }

    // Search filter - send search term if provided
    if (activeSearchTerm && activeSearchTerm.trim()) {
      body.search = activeSearchTerm.trim();
    }

    return body;
  };

  // Fetch pitches from backend
  const fetchPitches = async (
    page = 1,
    sortValue = null,
    filterOverrides = {}
  ) => {
    console.log("🔄 [RESERVATION] Starting to fetch pitches from API...");
    console.log("🔄 [RESERVATION] Parameters:", { page, sortValue, filterOverrides });
    
    setLoading(true);
    setError("");

    try {
      const queryParams = buildFilterQueryParams(
        page,
        sortValue,
        filterOverrides
      );
      const requestBody = buildFilterRequestBody(filterOverrides);
      
      const fullUrl = `http://localhost:5000/api/v1/pitch/getAll?${queryParams}`;
      console.log("🔄 [RESERVATION] API URL:", fullUrl);
      console.log("🔄 [RESERVATION] Request body:", requestBody);

      const response = await fetch(fullUrl, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        let errorMessage = "Something went wrong";

        try {
          const errorData = await response.json();
          if (errorData.msg) {
            errorMessage = errorData.msg;
          }
        } catch (parseError) {
          console.error("Error parsing error response:", parseError);
          // If can't parse error response, use status-based messages
          if (response.status === 404) {
            errorMessage = "No pitch found.";
          } else if (response.status === 403) {
            errorMessage =
              "You have been banned, please get contact with our customer service.";
          } else if (response.status >= 500) {
            errorMessage = "Server Error";
          } else {
            errorMessage = `Backend error: ${response.status}`;
          }
        }

        console.error("Pitch fetch error:", errorMessage);
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

        // Debug: Log raw data for first few pitches
        if (activePitches.length > 0) {
          console.log("🔍 [RESERVATION] Sample pitch data from backend:", activePitches[0]);
          console.log("🔍 [RESERVATION] ALL FIELDS:", Object.keys(activePitches[0] || {}));
          console.log("🔍 [RESERVATION] Address field:", activePitches[0]?.address);
          console.log("🔍 [RESERVATION] Location field:", activePitches[0]?.location);
          console.log("🔍 [RESERVATION] Price fields:", {
            pricePerHour: activePitches[0]?.pricePerHour,
            pricing: activePitches[0]?.pricing,
            price: activePitches[0]?.price,
            cost: activePitches[0]?.cost
          });
          // Log the actual content of price fields
          if (activePitches[0]?.pricing) {
            console.log("🔍 [RESERVATION] Pricing object content:", JSON.stringify(activePitches[0].pricing, null, 2));
          }
          if (activePitches[0]?.pricePerHour) {
            console.log("🔍 [RESERVATION] PricePerHour object content:", JSON.stringify(activePitches[0].pricePerHour, null, 2));
          }
          console.log("🔍 [RESERVATION] Image fields:", {
            images: activePitches[0]?.images,
            image: activePitches[0]?.image,
            media: activePitches[0]?.media,
            photos: activePitches[0]?.photos,
            imageUrl: activePitches[0]?.imageUrl
          });
        }

        const transformedPitches = activePitches.map(transformDummyDataToPitch);
        console.log(
          `✅ [RESERVATION] Loaded ${transformedPitches.length} pitches from backend (page ${page})`
        );

        // Debug: Log transformed data for first pitch
        if (transformedPitches.length > 0) {
          console.log("🔍 [RESERVATION] Sample transformed pitch data:", transformedPitches[0]);
          console.log("🔍 [RESERVATION] Transformed price:", transformedPitches[0]?.price);
          console.log("🔍 [RESERVATION] Transformed location:", transformedPitches[0]?.location);
          console.log("🔍 [RESERVATION] Transformed image:", transformedPitches[0]?.image);
        }

        // Update pagination data from backend
        setTotalCount(data.totalCount || 0);
        setBackendLimit(data.limit || 18);

        setPitches(transformedPitches);
        setFilteredPitches(transformedPitches);
        setCurrentPage(page);
      } else {
        console.error("Invalid data structure received:", data);
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

  // Fetch nearby pitches from backend
  const fetchNearbyPitches = async (coordinates) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`http://localhost:5000/api/v1/pitch/surrounding`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ coordinates }),
      });

      if (!response.ok) {
        let errorMessage = "Something went wrong";

        try {
          const errorData = await response.json();
          errorMessage = errorData.msg || errorMessage;
        } catch (parseError) {
          console.error("Error parsing error response:", parseError);
          if (response.status >= 500) {
            errorMessage = "Server Error";
          } else if (!navigator.onLine) {
            errorMessage = "Network Error";
          }
        }

        setError(translateMessage(errorMessage));
        setFilteredPitches([]);
        setTotalCount(0);
        setBackendLimit(18);
        return;
      }

      const data = await response.json();
      console.log("Yakın sahalar başarıyla alındı:", data);

      // Transform backend data to frontend format
      const transformedPitches = data.pitches.map(transformDummyDataToPitch);

      setFilteredPitches(transformedPitches);
      setTotalCount(data.pitches.length || 0);
      setBackendLimit(data.limit || 18);
      setCurrentPage(1); // Always page 1 for nearby search (no pagination support)
      setIsNearbySearch(true);
      setCurrentCoordinates(coordinates);
    } catch (error) {
      console.error("Yakın sahalar fetch hatası:", error);
      setError(translateMessage("Network Error"));
      setFilteredPitches([]);
      setTotalCount(0);
      setBackendLimit(18);
    } finally {
      setLoading(false);
    }
  };

  // Get user's current location
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve([position.coords.longitude, position.coords.latitude]);
        },
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              reject(new Error("Location access denied"));
              break;
            case error.POSITION_UNAVAILABLE:
              reject(new Error("Location not available"));
              break;
            case error.TIMEOUT:
              reject(new Error("Location timeout"));
              break;
            default:
              reject(new Error("Location not available"));
              break;
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  };

  // Handle nearby search button click
  const handleNearbySearch = () => {
    setShowLocationPopup(true);
  };

  // Handle location permission acceptance
  const handleLocationAccept = async () => {
    setShowLocationPopup(false);
    setLoading(true);

    try {
      const coordinates = await getCurrentLocation();
      console.log("Kullanıcı konumu alındı:", coordinates);
      await fetchNearbyPitches(coordinates);
    } catch (error) {
      console.error("Konum alma hatası:", error);
      setError(translateMessage(error.message));
      setLoading(false);
    }
  };

  // Handle location permission decline
  const handleLocationDecline = () => {
    setShowLocationPopup(false);
  };

  // Load pitches from backend
  useEffect(() => {
    fetchPitches();
  }, []);

  // Apply filters function
  // Apply filters - now triggers backend fetch
  const applyFilters = (filterOverrides = {}) => {
    // Switch back to regular search when filters are applied
    setIsNearbySearch(false);
    setCurrentCoordinates(null);
    fetchPitches(1, null, filterOverrides);
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
    // Navigate to pitch detail page for all pitches
    navigate(`/pitch-detail/${pitchId}`);
  };

  const handleSearch = (currentSearchTerm = null) => {
    // If a search term is provided, update the state first
    if (currentSearchTerm !== null) {
      setSearchTerm(currentSearchTerm);
    }

    const activeSearchTerm =
      currentSearchTerm !== null ? currentSearchTerm : searchTerm;
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
      searchTerm: activeSearchTerm,
    });

    // Switch back to regular search when filters are applied
    setIsNearbySearch(false);
    setCurrentCoordinates(null);

    // Call fetchPitches directly with the current search term
    fetchPitches(1, null, { searchTerm: activeSearchTerm });
  };

  const handleSort = (sortValue) => {
    setSortBy(sortValue);
    console.log("Sıralama değişti:", sortValue);
    // Refetch pitches with new sorting from page 1, passing the sort value directly
    fetchPitches(1, sortValue);
  };

  const clearAllFilters = () => {
    // Define cleared filter values
    const clearedFilters = {
      selectedCity: "",
      selectedDistrict: "",
      minPrice: "",
      maxPrice: "",
      selectedCapacity: "",
      selectedPitchTypes: [],
      selectedCameraSystems: [],
      selectedShoeRental: [],
      selectedRating: "",
      searchTerm: "",
    };

    // Update state with cleared values
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
    // Note: Keep sortBy unchanged - only clear filter cart data, not sort

    // Reset nearby search state when clearing filters
    setIsNearbySearch(false);
    setCurrentCoordinates(null);

    // Refetch all pitches from page 1 with filters cleared but sort preserved
    // Pass cleared filter values directly to bypass state delay
    fetchPitches(1, null, clearedFilters);
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
      if (isNearbySearch && currentCoordinates) {
        // Nearby search doesn't support pagination - do nothing
        return;
      } else {
        // Regular search pagination
        fetchPitches(pageNumber);
      }
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
        onSearch={handleSearch}
        onSort={handleSort}
        onNearbySearch={handleNearbySearch}
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
        onSearch={applyFilters}
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
                {/* Nearby Search Indicator */}
                {isNearbySearch && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <svg
                        className="w-5 h-5 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <p className="text-sm text-green-800">
                        <span className="font-medium">
                          Yakınınızdaki sahalar gösteriliyor
                        </span>
                        {" - "}7 km çapında bulunan tüm sahalar
                        listelenmektedir.
                      </p>
                    </div>
                  </div>
                )}

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
                {totalPages > 1 && !isNearbySearch && (
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
              onSearch={applyFilters}
              onClearFilters={clearAllFilters}
            />
          </div>
        </div>
      </div>

      <Footer />

      {/* Location Permission Popup */}
      <LocationPermissionPopup
        isVisible={showLocationPopup}
        onAccept={handleLocationAccept}
        onDecline={handleLocationDecline}
        title="Konum İzni Gerekli"
        message="Yakınınızdaki sahaları bulabilmemiz için konum bilginizi Sporplanet ile paylaşmanıza izin vermeniz gerekmektedir."
        acceptText="Evet, İzin Veriyorum"
        declineText="Hayır, İstemiyorum"
        icon="location"
        infoTitle="Konum Bilgisi Kullanımı"
        infoMessage="Konum bilginiz sadece yakınınızdaki spor sahalarını göstermek için kullanılacak ve hiçbir şekilde saklanmayacaktır."
        showInfo={true}
      />
    </div>
  );
}

export default ReservationPage;
