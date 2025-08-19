import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Header from "../../components/shared/Header";
import Footer from "../../components/shared/Footer";
import MatchesHero from "../../components/matches/MatchesHero";
import MatchesList from "../../components/matches/MatchesList";
import CreateAdModal from "../../components/matches/CreateAdModal";
import LocationPermissionPopup from "../../components/shared/LocationPermissionPopup";

function MatchesPage() {
  const location = useLocation();
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeDifficulty, setActiveDifficulty] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [prefilledData, setPrefilledData] = useState(null);
  const [matches, setMatches] = useState([]);
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [isLoadingNearby, setIsLoadingNearby] = useState(false);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Backend integration states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalMatches, setTotalMatches] = useState(0);
  const [limit, setLimit] = useState(18);
  const [hasMore, setHasMore] = useState(true);

  // Ref for search debouncing
  const searchTimeoutRef = useRef(null);

  // Turkish error message translation
  const translateErrorMessage = (message) => {
    const errorMessages = {
      "No adverts found": "İlan bulunamadı",
      "No adverts found in vicinity": "Yakınınızda maç bulunamadı",
      "Please provide valid coordinates": "Geçerli konum bilgileri sağlayın",
      "Failed to fetch vicinity adverts": "Yakınımdaki maçlar alınamadı",
      "Network Error": "Ağ hatası oluştu",
      "Failed to fetch": "Veri alınamadı",
      "Internal Server Error": "Sunucu hatası",
      "Bad Request": "Geçersiz istek",
      Unauthorized: "Yetki hatası",
      Forbidden: "Erişim engellendi",
      "Not Found": "Bulunamadı",
      "Too Many Requests": "Çok fazla istek",
      "Service Unavailable": "Servis kullanılamıyor",
      "Location not available": "Konum bilgisi alınamadı",
    };

    return errorMessages[message] || message || "Bir hata oluştu";
  };

  // Fetch adverts from backend
  const fetchAdverts = async (page = 1, filterOverrides = {}) => {
    setIsLoading(true);
    setError("");

    try {
      // Build request body based on active filter or overrides
      const requestBody = {};

      // Get the current filter value (from overrides or state)
      const currentFilter = filterOverrides.hasOwnProperty("activeFilter")
        ? filterOverrides.activeFilter
        : activeFilter;

      // Get the current search query (from overrides or state)
      const currentSearchQuery = filterOverrides.hasOwnProperty("searchQuery")
        ? filterOverrides.searchQuery
        : searchQuery;

      // Get the current difficulty level (from overrides or state)
      const currentDifficulty = filterOverrides.hasOwnProperty(
        "activeDifficulty"
      )
        ? filterOverrides.activeDifficulty
        : activeDifficulty;

      // Set isRivalry field based on filter
      if (currentFilter === "team-ads") {
        requestBody.isRivalry = { status: true };
      } else if (currentFilter === "player-ads") {
        requestBody.isRivalry = { status: false };
      }
      // For "all" filter, don't include isRivalry field at all

      // Add search field if there's a search query
      if (currentSearchQuery && currentSearchQuery.trim() !== "") {
        requestBody.search = currentSearchQuery.trim();
      }

      // Add level field if a specific difficulty is selected
      if (currentDifficulty && currentDifficulty !== "all") {
        requestBody.level = currentDifficulty;
      }

      const response = await fetch(`/api/v1/advert/getAll?page=${page}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Handle 404 specifically - clear matches and show no results
        if (response.status === 404) {
          setMatches([]);
          setTotalMatches(0);
          setCurrentPage(1);
          setHasMore(false);
          setIsLoading(false);
          return; // Exit early, don't throw error for 404
        }

        throw new Error(errorData.msg || "Failed to fetch adverts");
      }

      const data = await response.json();
      const { adverts, total, limit, count } = data;

      // Process the adverts data to match our frontend format
      const processedMatches = adverts.map((advert) => {
        const startDate = new Date(advert.startsAt);
        const now = new Date();
        const isExpired = startDate < now;

        // Calculate participants and needed players
        const currentParticipants = advert.participants?.length || 0;
        const totalNeeded = advert.playersNeeded + advert.goalKeepersNeeded;
        const completion =
          totalNeeded > 0
            ? Math.round((currentParticipants / totalNeeded) * 100)
            : 100;

        // Determine match type based on participants vs needed
        // Determine match type based on rivalry status from backend
        const isRivalryStatus = advert.isRivalry?.status || false;
        const matchType = isRivalryStatus ? "team-ads" : "player-ads";

        // Get pitch image from backend structure
        const pitchImages = advert.pitch?.media?.images || [];
        const primaryImage = pitchImages.find((img) => img.isPrimary);
        const firstImage = pitchImages[0];
        const pitchImage = primaryImage?.url || firstImage?.url || null;

        // Get pitch location information from backend structure
        const pitchLocation = advert.pitch?.location?.address
          ? `${advert.pitch.location.address.district}, ${advert.pitch.location.address.city}`
          : "Konum Belirtilmemiş";

        // Get pitch rating from backend structure
        const pitchRating = advert.pitch?.rating?.averageRating || null;
        const totalReviews = advert.pitch?.rating?.totalReviews || 0;

        // Get pitch specifications from backend structure
        const pitchSpecs = advert.pitch?.specifications || {};
        const isIndoor = pitchSpecs.isIndoor || false;
        const hasLighting = pitchSpecs.hasLighting || false;

        // Get pitch facilities from backend structure
        const pitchFacilities = advert.pitch?.facilities || {};
        const hasChangingRooms = pitchFacilities.changingRooms || false;
        const hasShowers = pitchFacilities.showers || false;
        const hasParking = pitchFacilities.parking || false;

        // Calculate price per person from backend structure
        let pricePerPerson = 0;
        if (advert.customPitch && advert.customPitch.price) {
          // Özel saha - direkt kişi başı fiyat
          pricePerPerson = advert.customPitch.price;
        } else if (
          advert.booking &&
          advert.booking.price &&
          advert.booking.totalPlayers
        ) {
          // Rezervasyon - toplam fiyatı kişi sayısına böl ve kuruştan TL'ye çevir
          const hourlyRate = advert.booking.price.hourlyRate || 0;
          const totalPlayers = advert.booking.totalPlayers || 1;
          pricePerPerson = Math.round(hourlyRate / totalPlayers / 100); // Kuruş -> TL
        } else if (advert.booking && advert.booking.price) {
          // Booking var ama totalPlayers yok - playersNeeded + goalKeepersNeeded kullan
          const hourlyRate = advert.booking.price.hourlyRate || 0;
          const estimatedPlayers = totalNeeded || 1;
          pricePerPerson = Math.round(hourlyRate / estimatedPlayers / 100); // Kuruş -> TL
        } else if (advert.pitch?.pricing?.hourlyRate) {
          // Eski sistem - pitch pricing
          const hourlyRate = advert.pitch.pricing.hourlyRate || 0;
          pricePerPerson =
            totalNeeded > 0 ? Math.round(hourlyRate / totalNeeded) : 0;
        } else {
          // Fallback - default değer
          pricePerPerson = 50;
        }

        // Get level information and translate to Turkish
        const levelLabels = {
          beginner: "Başlangıç",
          intermediate: "Orta",
          advanced: "İleri",
          pro: "Profesyonel",
          professional: "Lig (oyuncu)",
        };
        const difficulty = levelLabels[advert.level] || "Orta Seviye";

        // Get status information and translate to Turkish
        const statusLabels = {
          open: "Açık",
          full: "Dolu",
          cancelled: "İptal Edildi",
          expired: "Süresi Doldu",
          completed: "Tamamlandı",
        };
        const statusText = statusLabels[advert.status] || "Bilinmiyor";

        // Get rivalry information from backend structure
        const isRivalry = advert.isRivalry?.status || false;
        const rivalryAgreed = advert.isRivalry?.agreed || false;

        // Get admin advert information from backend structure
        const isAdminAdvert =
          advert.adminAdvert && advert.adminAdvert.length > 0;

        // Get pitch coordinates for location-based features
        const pitchCoordinates = advert.pitch?.location?.coordinates || null;

        return {
          id: advert._id,
          title: advert.name,
          date: startDate.toLocaleDateString("tr-TR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            hour: "2-digit",
            minute: "2-digit",
          }),
          location:
            advert.customPitch?.name ||
            advert.pitch?.name ||
            "Saha Belirtilmemiş",
          locationDetails: pitchLocation,
          players: `${currentParticipants}/${totalNeeded} oyuncu`,
          completion: completion,
          status: isExpired
            ? "expired"
            : completion >= 100
            ? "full"
            : "available",
          statusText: statusText,
          type: matchType,
          pricePerPerson: pricePerPerson,
          difficulty: difficulty,
          description:
            advert.notes ||
            `${
              advert.createdBy?.name || "Bilinmeyen kullanıcı"
            } tarafından oluşturuldu. ${
              advert.playersNeeded > 0 ? `${advert.playersNeeded} oyuncu` : ""
            } ${
              advert.goalKeepersNeeded > 0
                ? `${advert.goalKeepersNeeded} kaleci`
                : ""
            } aranıyor.`,
          createdBy: advert.createdBy,
          pitch: {
            ...advert.pitch,
            location: {
              ...advert.pitch?.location,
              coordinates: pitchCoordinates,
            },
          },
          pitchImage: pitchImage,
          pitchRating: pitchRating,
          totalReviews: totalReviews,
          isIndoor: isIndoor,
          hasLighting: hasLighting,
          hasChangingRooms: hasChangingRooms,
          hasShowers: hasShowers,
          hasParking: hasParking,
          isRivalry: isRivalry,
          rivalryAgreed: rivalryAgreed,
          teamSize: advert.rivalryTeamSize || 11,
          isAdminAdvert: isAdminAdvert,
          waitingList: advert.waitingList || [],
          originalData: advert,
        };
      });

      // For page-based pagination, replace data completely for each page
      setMatches(processedMatches);

      setCurrentPage(page);
      setTotalMatches(total);
      setLimit(limit);
      setHasMore(page * limit < total);
    } catch (error) {
      console.error("Error fetching adverts:", error);
      setError(translateErrorMessage(error.message));
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch adverts on component mount
  useEffect(() => {
    fetchAdverts(1);
  }, []);

  // Cleanup search timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Handle pagination - load more matches (for "Load More" button - if needed)
  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      fetchAdverts(currentPage + 1);
    }
  };

  // Handle page change for pagination buttons
  const handlePageChange = (pageNumber) => {
    if (pageNumber !== currentPage && !isLoading) {
      fetchAdverts(pageNumber, { activeFilter, activeDifficulty, searchQuery });
      // Scroll to top when page changes
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Calculate pagination info
  const totalPages = totalMatches > 0 ? Math.ceil(totalMatches / limit) : 0;
  const indexOfFirstMatch =
    totalMatches > 0 ? (currentPage - 1) * limit + 1 : 0;
  const indexOfLastMatch =
    totalMatches > 0 ? Math.min(currentPage * limit, totalMatches) : 0;

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

  // Check if we should open modal from reservation
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const action = urlParams.get("action");

    if (action === "create") {
      const storedData = localStorage.getItem("createListingData");
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          setPrefilledData(parsedData);
          setIsModalOpen(true);
          // Clear the stored data
          localStorage.removeItem("createListingData");
        } catch (error) {
          console.error("Error parsing stored listing data:", error);
        }
      }
    }
  }, [location.search]);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    // Reset pagination state when filter changes
    setCurrentPage(1);
    setTotalMatches(0);
    setHasMore(true);
    // Fetch data with new filter starting from page 1
    fetchAdverts(1, { activeFilter: filter });
  };

  const handleDifficultyChange = (difficulty) => {
    setActiveDifficulty(difficulty);
    // Reset pagination state when difficulty filter changes
    setCurrentPage(1);
    setTotalMatches(0);
    setHasMore(true);
    // Fetch data with new difficulty filter starting from page 1
    fetchAdverts(1, { activeDifficulty: difficulty });
  };

  const handleSearchChange = (e) => {
    const newSearchQuery = e.target.value;
    setSearchQuery(newSearchQuery);

    // Debounce search - wait 500ms after user stops typing
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      // Reset pagination state when search changes
      setCurrentPage(1);
      setTotalMatches(0);
      setHasMore(true);
      // Fetch data with new search query starting from page 1
      fetchAdverts(1, {
        activeFilter,
        activeDifficulty,
        searchQuery: newSearchQuery,
      });
    }, 500);
  };

  const handleJoinMatch = (matchId) => {
    // Handle match join logic
    console.log("Joining match:", matchId);
  };

  const handleCreateAdClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmitAd = (data) => {
    console.log("Advert created successfully:", data);
    // Refresh the matches data to show the new advert
    fetchAdverts(1, { activeFilter, activeDifficulty, searchQuery });
  };

  // Get user's current location (same as reservation page)
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

  // Handle nearby matches search (same pattern as reservation page)
  const handleNearbySearch = () => {
    setShowLocationPopup(true);
  };

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Handle location permission acceptance
  const handleLocationAccept = async () => {
    setShowLocationPopup(false);
    setIsLoadingNearby(true);
    setError("");

    // Reset pagination state for vicinity search
    setCurrentPage(1);
    setTotalMatches(0);
    setHasMore(false);

    try {
      const coordinates = await getCurrentLocation();
      console.log("Kullanıcı konumu alındı:", coordinates);

      // Call backend API for vicinity adverts
      const response = await fetch("/api/v1/advert/vicinity", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          coordinates: coordinates, // [longitude, latitude]
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Handle 404 specifically - clear matches and show no results
        if (response.status === 404) {
          setMatches([]);
          setTotalMatches(0);
          setCurrentPage(1);
          setHasMore(false);
          setIsLoadingNearby(false);
          return; // Exit early, don't throw error for 404
        }

        throw new Error(errorData.msg || "Failed to fetch vicinity adverts");
      }

      const data = await response.json();
      const { adverts, count } = data;

      // Process the vicinity adverts data using the same format as fetchAdverts
      const processedMatches = adverts.map((advert) => {
        const startDate = new Date(advert.startsAt);
        const now = new Date();
        const isExpired = startDate < now;

        // Calculate participants and needed players
        const currentParticipants = advert.participants?.length || 0;
        const totalNeeded = advert.playersNeeded + advert.goalKeepersNeeded;
        const completion =
          totalNeeded > 0
            ? Math.round((currentParticipants / totalNeeded) * 100)
            : 100;

        // Determine match type based on participants vs needed
        // Determine match type based on rivalry status from backend
        const isRivalryStatus = advert.isRivalry?.status || false;
        const matchType = isRivalryStatus ? "team-ads" : "player-ads";

        // Get pitch image from backend structure
        const pitchImages = advert.pitch?.media?.images || [];
        const primaryImage = pitchImages.find((img) => img.isPrimary);
        const firstImage = pitchImages[0];
        const pitchImage = primaryImage?.url || firstImage?.url || null;

        // Get pitch location information from backend structure
        const pitchLocation = advert.pitch?.location?.address
          ? `${advert.pitch.location.address.district}, ${advert.pitch.location.address.city}`
          : "Konum Belirtilmemiş";

        // Get pitch rating from backend structure
        const pitchRating = advert.pitch?.rating?.averageRating || null;
        const totalReviews = advert.pitch?.rating?.totalReviews || 0;

        // Get pitch specifications from backend structure
        const pitchSpecs = advert.pitch?.specifications || {};
        const isIndoor = pitchSpecs.isIndoor || false;
        const hasLighting = pitchSpecs.hasLighting || false;

        // Get pitch facilities from backend structure
        const pitchFacilities = advert.pitch?.facilities || {};
        const hasChangingRooms = pitchFacilities.changingRooms || false;
        const hasShowers = pitchFacilities.showers || false;
        const hasParking = pitchFacilities.parking || false;

        // Calculate price per person from backend structure
        let pricePerPerson = 0;
        if (advert.customPitch && advert.customPitch.price) {
          // Özel saha - direkt kişi başı fiyat
          pricePerPerson = advert.customPitch.price;
        } else if (
          advert.booking &&
          advert.booking.price &&
          advert.booking.totalPlayers
        ) {
          // Rezervasyon - toplam fiyatı kişi sayısına böl ve kuruştan TL'ye çevir
          const hourlyRate = advert.booking.price.hourlyRate || 0;
          const totalPlayers = advert.booking.totalPlayers || 1;
          pricePerPerson = Math.round(hourlyRate / totalPlayers / 100); // Kuruş -> TL
        } else if (advert.booking && advert.booking.price) {
          // Booking var ama totalPlayers yok - playersNeeded + goalKeepersNeeded kullan
          const hourlyRate = advert.booking.price.hourlyRate || 0;
          const estimatedPlayers = totalNeeded || 1;
          pricePerPerson = Math.round(hourlyRate / estimatedPlayers / 100); // Kuruş -> TL
        } else if (advert.pitch?.pricing?.hourlyRate) {
          // Eski sistem - pitch pricing
          const hourlyRate = advert.pitch.pricing.hourlyRate || 0;
          pricePerPerson =
            totalNeeded > 0 ? Math.round(hourlyRate / totalNeeded) : 0;
        } else {
          // Fallback - default değer
          pricePerPerson = 50;
        }

        // Get level information and translate to Turkish
        const levelLabels = {
          beginner: "Başlangıç",
          intermediate: "Orta",
          advanced: "İleri",
          pro: "Profesyonel",
          professional: "Lig (oyuncu)",
        };
        const difficulty = levelLabels[advert.level] || "Orta Seviye";

        // Get status information and translate to Turkish
        const statusLabels = {
          open: "Açık",
          full: "Dolu",
          cancelled: "İptal Edildi",
          expired: "Süresi Doldu",
          completed: "Tamamlandı",
        };
        const statusText = statusLabels[advert.status] || "Bilinmiyor";

        // Get rivalry information from backend structure
        const isRivalry = advert.isRivalry?.status || false;
        const rivalryAgreed = advert.isRivalry?.agreed || false;

        // Get admin advert information from backend structure
        const isAdminAdvert =
          advert.adminAdvert && advert.adminAdvert.length > 0;

        // Get pitch coordinates for location-based features
        const pitchCoordinates = advert.pitch?.location?.coordinates || null;

        return {
          id: advert._id,
          title: advert.name,
          date: startDate.toLocaleDateString("tr-TR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            hour: "2-digit",
            minute: "2-digit",
          }),
          location:
            advert.customPitch?.name ||
            advert.pitch?.name ||
            "Saha Belirtilmemiş",
          locationDetails: pitchLocation,
          players: `${currentParticipants}/${totalNeeded} oyuncu`,
          completion: completion,
          status: isExpired
            ? "expired"
            : completion >= 100
            ? "full"
            : "available",
          statusText: statusText,
          type: matchType,
          pricePerPerson: pricePerPerson,
          difficulty: difficulty,
          description:
            advert.notes ||
            `${
              advert.createdBy?.name || "Bilinmeyen kullanıcı"
            } tarafından oluşturuldu. ${
              advert.playersNeeded > 0 ? `${advert.playersNeeded} oyuncu` : ""
            } ${
              advert.goalKeepersNeeded > 0
                ? `${advert.goalKeepersNeeded} kaleci`
                : ""
            } aranıyor.`,
          createdBy: advert.createdBy,
          pitch: {
            ...advert.pitch,
            location: {
              ...advert.pitch?.location,
              coordinates: pitchCoordinates,
            },
          },
          pitchImage: pitchImage,
          pitchRating: pitchRating,
          totalReviews: totalReviews,
          isIndoor: isIndoor,
          hasLighting: hasLighting,
          hasChangingRooms: hasChangingRooms,
          hasShowers: hasShowers,
          hasParking: hasParking,
          isRivalry: isRivalry,
          rivalryAgreed: rivalryAgreed,
          teamSize: advert.rivalryTeamSize || 11,
          isAdminAdvert: isAdminAdvert,
          waitingList: advert.waitingList || [],
          originalData: advert,
        };
      });

      // Update matches to show only nearby ones from backend
      setMatches(processedMatches);
      setTotalMatches(count);
      setCurrentPage(1);
      setHasMore(false); // Nearby search doesn't support pagination
      setIsLoadingNearby(false);
    } catch (error) {
      console.error("Yakınımdaki maçlar alma hatası:", error);
      setError(translateErrorMessage(error.message));
      setIsLoadingNearby(false);
    }
  };

  // Handle location permission decline
  const handleLocationDecline = () => {
    setShowLocationPopup(false);
  };

  // Get match statistics for display
  const getMatchStatistics = () => {
    const totalMatches = matches.length;
    const openMatches = matches.filter(
      (match) => match.status === "available"
    ).length;
    const fullMatches = matches.filter(
      (match) => match.status === "full"
    ).length;
    const cancelledMatches = matches.filter(
      (match) => match.statusText === "İptal Edildi"
    ).length;
    const rivalryMatches = matches.filter((match) => match.isRivalry).length;

    return {
      total: totalMatches,
      open: openMatches,
      full: fullMatches,
      cancelled: cancelledMatches,
      rivalry: rivalryMatches,
    };
  };

  // Get enhanced match details for display
  const getEnhancedMatchDetails = (match) => {
    const details = {
      ...match,
      // Add pitch features summary
      pitchFeatures: [
        match.isIndoor && "Kapalı Saha",
        match.hasLighting && "Aydınlatma",
        match.hasChangingRooms && "Soyunma Odası",
        match.hasShowers && "Duş",
        match.hasParking && "Otopark",
      ]
        .filter(Boolean)
        .join(" • "),

      // Add participant details from backend structure
      participantDetails:
        match.originalData.participants
          ?.map((p) => p.user?.name || "Bilinmeyen")
          .join(", ") || "Henüz katılımcı yok",

      // Add waiting list details from backend structure
      waitingListDetails:
        match.originalData.waitingList
          ?.map((w) => w.user?.name || "Bilinmeyen")
          .join(", ") || "Bekleme listesi yok",

      // Add creator details from backend structure
      creatorDetails: `${match.createdBy?.name || "Bilinmeyen kullanıcı"}${
        match.createdBy?.school ? ` (${match.createdBy.school})` : ""
      }${match.createdBy?.age ? `, ${match.createdBy.age} yaşında` : ""}`,

      // Add pitch contact info from backend structure
      pitchContact: match.pitch?.contact
        ? {
            phone: match.pitch.contact.phone,
            email: match.pitch.contact.email,
            website: match.pitch.contact.website,
          }
        : null,

      // Add pitch dimensions and surface type from backend
      pitchDimensions: match.pitch?.specifications?.dimensions
        ? `${match.pitch.specifications.dimensions.length}x${match.pitch.specifications.dimensions.width}m`
        : null,

      surfaceType: match.pitch?.specifications?.surfaceType || null,

      // Add pricing details from backend
      hourlyRate: match.pitch?.pricing?.hourlyRate || null,
      nightHourlyRate: match.pitch?.pricing?.nightHourlyRate || null,
      currency: match.pitch?.pricing?.currency || "TRY",
    };

    return details;
  };

  // Reset matches to show all matches (useful after nearby search)
  const resetToAllMatches = () => {
    setCurrentPage(1);
    setError("");
    fetchAdverts(1, { activeFilter, activeDifficulty, searchQuery });
  };

  // Since both filtering and search are now done server-side, use matches directly
  const filteredMatches = matches;

  // Get filtered matches by various criteria
  const getFilteredMatchesByCriteria = (criteria) => {
    switch (criteria) {
      case "rivalry":
        return matches.filter((match) => match.isRivalry);
      case "admin":
        return matches.filter((match) => match.isAdminAdvert);
      case "indoor":
        return matches.filter((match) => match.isIndoor);
      case "lighting":
        return matches.filter((match) => match.hasLighting);
      case "changingRooms":
        return matches.filter((match) => match.hasChangingRooms);
      case "showers":
        return matches.filter((match) => match.hasShowers);
      case "parking":
        return matches.filter((match) => match.hasParking);
      case "beginner":
        return matches.filter((match) => match.difficulty === "Başlangıç");
      case "intermediate":
        return matches.filter((match) => match.difficulty === "Orta");
      case "advanced":
        return matches.filter((match) => match.difficulty === "İleri");
      case "pro":
        return matches.filter((match) => match.difficulty === "Profesyonel");
      default:
        return matches;
    }
  };

  // Sort matches by various criteria
  const sortMatchesByCriteria = (matchesToSort, sortBy) => {
    const sortedMatches = [...matchesToSort];

    switch (sortBy) {
      case "date":
        return sortedMatches.sort(
          (a, b) =>
            new Date(a.originalData.startsAt) -
            new Date(b.originalData.startsAt)
        );
      case "dateDesc":
        return sortedMatches.sort(
          (a, b) =>
            new Date(b.originalData.startsAt) -
            new Date(a.originalData.startsAt)
        );
      case "price":
        return sortedMatches.sort(
          (a, b) => a.pricePerPerson - b.pricePerPerson
        );
      case "priceDesc":
        return sortedMatches.sort(
          (a, b) => b.pricePerPerson - a.pricePerPerson
        );
      case "difficulty":
        const difficultyOrder = {
          Başlangıç: 1,
          Orta: 2,
          İleri: 3,
          Profesyonel: 4,
        };
        return sortedMatches.sort(
          (a, b) =>
            difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
        );
      case "difficultyDesc":
        const difficultyOrderDesc = {
          Başlangıç: 1,
          Orta: 2,
          İleri: 3,
          Profesyonel: 4,
        };
        return sortedMatches.sort(
          (a, b) =>
            difficultyOrderDesc[b.difficulty] -
            difficultyOrderDesc[a.difficulty]
        );
      case "rating":
        return sortedMatches.sort(
          (a, b) => (a.pitchRating || 0) - (b.pitchRating || 0)
        );
      case "ratingDesc":
        return sortedMatches.sort(
          (a, b) => (b.pitchRating || 0) - (a.pitchRating || 0)
        );
      case "participants":
        return sortedMatches.sort((a, b) => {
          const aParticipants = a.originalData.participants?.length || 0;
          const bParticipants = b.originalData.participants?.length || 0;
          return aParticipants - bParticipants;
        });
      case "participantsDesc":
        return sortedMatches.sort((a, b) => {
          const aParticipants = a.originalData.participants?.length || 0;
          const bParticipants = b.originalData.participants?.length || 0;
          return bParticipants - aParticipants;
        });
      default:
        return sortedMatches;
    }
  };

  // Get match analytics for insights
  const getMatchAnalytics = () => {
    const totalMatches = matches.length;
    const totalParticipants = matches.reduce(
      (sum, match) => sum + (match.originalData.participants?.length || 0),
      0
    );
    const totalWaitingList = matches.reduce(
      (sum, match) => sum + (match.originalData.waitingList?.length || 0),
      0
    );
    const averagePrice =
      matches.length > 0
        ? Math.round(
            matches.reduce((sum, match) => sum + match.pricePerPerson, 0) /
              matches.length
          )
        : 0;

    // Get most popular locations
    const locationCounts = {};
    matches.forEach((match) => {
      const location = match.locationDetails;
      locationCounts[location] = (locationCounts[location] || 0) + 1;
    });
    const popularLocations = Object.entries(locationCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([location, count]) => ({ location, count }));

    // Get difficulty distribution
    const difficultyCounts = {};
    matches.forEach((match) => {
      difficultyCounts[match.difficulty] =
        (difficultyCounts[match.difficulty] || 0) + 1;
    });

    // Get facility usage
    const facilityCounts = {
      indoor: matches.filter((match) => match.isIndoor).length,
      lighting: matches.filter((match) => match.hasLighting).length,
      changingRooms: matches.filter((match) => match.hasChangingRooms).length,
      showers: matches.filter((match) => match.hasShowers).length,
      parking: matches.filter((match) => match.hasParking).length,
    };

    return {
      totalMatches,
      totalParticipants,
      totalWaitingList,
      averagePrice,
      popularLocations,
      difficultyCounts,
      facilityCounts,
    };
  };

  // Export match data for external use
  const exportMatchData = (format = "json") => {
    const exportData = matches.map((match) => {
      const enhancedDetails = getEnhancedMatchDetails(match);
      return {
        id: match.id,
        title: match.title,
        date: match.originalData.startsAt,
        location: match.location,
        locationDetails: match.locationDetails,
        players: match.players,
        status: match.statusText,
        difficulty: match.difficulty,
        pricePerPerson: match.pricePerPerson,
        description: match.description,
        creator: enhancedDetails.creatorDetails,
        pitchFeatures: enhancedDetails.pitchFeatures,
        participants: enhancedDetails.participantDetails,
        waitingList: enhancedDetails.waitingListDetails,
        pitchRating: match.pitchRating,
        totalReviews: match.totalReviews,
        isRivalry: match.isRivalry,
        isAdminAdvert: match.isAdminAdvert,
        // Additional backend fields
        playersNeeded: match.originalData.playersNeeded,
        goalKeepersNeeded: match.originalData.goalKeepersNeeded,
        notes: match.originalData.notes,
        pitchDimensions: enhancedDetails.pitchDimensions,
        surfaceType: enhancedDetails.surfaceType,
        hourlyRate: enhancedDetails.hourlyRate,
        currency: enhancedDetails.currency,
        createdBy: match.originalData.createdBy?.name,
        createdBySchool: match.originalData.createdBy?.school,
        createdByAge: match.originalData.createdBy?.age,
      };
    });

    if (format === "json") {
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `matches-${new Date().toISOString().split("T")[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } else if (format === "csv") {
      const headers = Object.keys(exportData[0]).join(",");
      const rows = exportData.map((row) =>
        Object.values(row)
          .map((value) => `"${value}"`)
          .join(",")
      );
      const csvContent = [headers, ...rows].join("\n");
      const dataBlob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `matches-${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  // Get personalized match recommendations based on user preferences
  const getMatchRecommendations = (userPreferences = {}) => {
    const {
      preferredDifficulty,
      preferredLocation,
      preferredPrice,
      preferredTime,
    } = userPreferences;

    let recommendations = [...matches];

    // Filter by difficulty if specified
    if (preferredDifficulty) {
      recommendations = recommendations.filter(
        (match) => match.difficulty === preferredDifficulty
      );
    }

    // Filter by location if specified
    if (preferredLocation) {
      recommendations = recommendations.filter((match) =>
        match.locationDetails
          .toLowerCase()
          .includes(preferredLocation.toLowerCase())
      );
    }

    // Filter by price if specified
    if (preferredPrice) {
      recommendations = recommendations.filter(
        (match) => match.pricePerPerson <= preferredPrice
      );
    }

    // Filter by time if specified (e.g., morning, afternoon, evening)
    if (preferredTime) {
      recommendations = recommendations.filter((match) => {
        const matchTime = new Date(match.originalData.startsAt).getHours();
        switch (preferredTime) {
          case "morning":
            return matchTime >= 6 && matchTime < 12;
          case "afternoon":
            return matchTime >= 12 && matchTime < 18;
          case "evening":
            return matchTime >= 18 || matchTime < 6;
          default:
            return true;
        }
      });
    }

    // Sort by relevance score
    recommendations.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      // Higher rating = higher score
      scoreA += (a.pitchRating || 0) * 10;
      scoreB += (b.pitchRating || 0) * 10;

      // More participants = higher score (more social)
      scoreA += (a.originalData.participants?.length || 0) * 2;
      scoreB += (b.originalData.participants?.length || 0) * 2;

      // Rivalry matches get bonus
      if (a.isRivalry) scoreA += 20;
      if (b.isRivalry) scoreB += 20;

      // Admin adverts get bonus
      if (a.isAdminAdvert) scoreA += 15;
      if (b.isAdminAdvert) scoreB += 15;

      return scoreB - scoreA;
    });

    return recommendations.slice(0, 10); // Return top 10 recommendations
  };

  // Loading spinner component - matches ReservationPage.jsx design
  const LoadingSpinner = () => (
    <div className="col-span-full text-center py-12">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mb-4"></div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Maçlar yükleniyor...
        </h3>
        <p className="text-gray-500">Lütfen bekleyin, veriler getiriliyor.</p>
      </div>
    </div>
  );

  // Error display component
  const ErrorDisplay = () => (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full text-center">
        <div className="text-red-500 mb-4">
          <svg
            className="w-12 h-12 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-red-700 mb-2">
          Maçlar Yüklenemedi
        </h3>
        <p className="text-sm text-red-600 mb-4">{error}</p>
        <button
          onClick={() => fetchAdverts(1)}
          className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md transition-colors cursor-pointer"
          disabled={isLoading}
        >
          {isLoading ? "Yeniden Yükleniyor..." : "Tekrar Dene"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <Header />

      <MatchesHero />

      <MatchesList
        matches={filteredMatches}
        onJoinMatch={handleJoinMatch}
        activeFilter={activeFilter}
        activeDifficulty={activeDifficulty}
        searchQuery={searchQuery}
        onFilterChange={handleFilterChange}
        onDifficultyChange={handleDifficultyChange}
        onSearchChange={handleSearchChange}
        onCreateAdClick={handleCreateAdClick}
        onNearbySearch={handleNearbySearch}
        onResetToAll={resetToAllMatches}
        isLoadingNearby={isLoadingNearby}
        statistics={getMatchStatistics()}
        getEnhancedDetails={getEnhancedMatchDetails}
        getFilteredByCriteria={getFilteredMatchesByCriteria}
        sortByCriteria={sortMatchesByCriteria}
        analytics={getMatchAnalytics()}
        onExportData={exportMatchData}
        getRecommendations={getMatchRecommendations}
        // Backend integration props
        isLoading={isLoading}
        error={error}
        currentPage={currentPage}
        totalMatches={totalMatches}
        limit={limit}
        hasMore={hasMore}
        onLoadMore={handleLoadMore}
        // Show loading spinner during any loading operation
        showLoadingSpinner={isLoading}
        showErrorDisplay={error && matches.length === 0}
        LoadingSpinner={LoadingSpinner}
        ErrorDisplay={ErrorDisplay}
        // Pagination props
        totalPages={totalPages}
        indexOfFirstMatch={indexOfFirstMatch}
        indexOfLastMatch={indexOfLastMatch}
        onPageChange={handlePageChange}
        getPageNumbers={getPageNumbers}
      />

      <CreateAdModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitAd}
        prefilledData={prefilledData}
      />

      {/* Location Permission Popup */}
      <LocationPermissionPopup
        isVisible={showLocationPopup}
        onDecline={handleLocationDecline}
        onAccept={handleLocationAccept}
        title="Konum İzni Gerekli"
        message="Yakınınızdaki maçları bulabilmemiz için konum bilginizi Sporplanet ile paylaşmanıza izin vermeniz gerekmektedir."
        acceptText="Evet, İzin Veriyorum"
        declineText="Hayır, İstemiyorum"
        icon="location"
        infoTitle="Konum Bilgisi Kullanımı"
        infoMessage="Konum bilginiz sadece yakınınızdaki maçları göstermek için kullanılacak ve hiçbir şekilde saklanmayacaktır."
        showInfo={true}
      />

      <Footer />
    </div>
  );
}

export default MatchesPage;
