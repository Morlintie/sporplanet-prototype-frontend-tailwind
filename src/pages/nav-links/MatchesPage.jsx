import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "../../components/shared/Header";
import Footer from "../../components/shared/Footer";
import MatchesHero from "../../components/matches/MatchesHero";
import MatchesList from "../../components/matches/MatchesList";
import CreateAdModal from "../../components/matches/CreateAdModal";
import LocationPermissionPopup from "../../components/shared/LocationPermissionPopup";
import advertsData from "../../../adverts.v4.mock.json";

function MatchesPage() {
  const location = useLocation();
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [prefilledData, setPrefilledData] = useState(null);
  const [matches, setMatches] = useState([]);
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [isLoadingNearby, setIsLoadingNearby] = useState(false);

  // Process adverts data on component mount
  useEffect(() => {
    const processedMatches = advertsData.map(advert => {
      const startDate = new Date(advert.startsAt);
      const now = new Date();
      const isExpired = startDate < now;
      
      // Calculate participants and needed players
      const currentParticipants = advert.participants?.length || 0;
      const totalNeeded = advert.playersNeeded + advert.goalKeepersNeeded;
      const completion = totalNeeded > 0 ? Math.round((currentParticipants / totalNeeded) * 100) : 100;
      
      // Determine match type based on participants vs needed
      const matchType = currentParticipants === 0 ? "team-ads" : "player-ads";
      
      return {
        id: advert._id,
        title: advert.name,
        date: startDate.toLocaleDateString('tr-TR', { 
          weekday: 'long', 
          day: 'numeric', 
          month: 'long',
          hour: '2-digit',
          minute: '2-digit'
        }),
        location: advert.pitch?.name || advert.customPitch?.name || "Saha Belirtilmemiş",
        players: `${currentParticipants}/${totalNeeded} oyuncu`,
        completion: completion,
        status: isExpired ? "expired" : (completion >= 100 ? "full" : "available"),
        type: matchType,
        pricePerPerson: Math.round((advert.pitch?.pricing?.hourlyRate || 0) / totalNeeded) || 25,
        difficulty: "Orta Seviye", // Default difficulty
        description: `${advert.createdBy.name} tarafından oluşturuldu. ${advert.playersNeeded > 0 ? `${advert.playersNeeded} oyuncu` : ''} ${advert.goalKeepersNeeded > 0 ? `${advert.goalKeepersNeeded} kaleci` : ''} aranıyor.`,
        createdBy: advert.createdBy,
        pitch: advert.pitch,
        originalData: advert
      };
    }).filter(match => match.status !== "expired"); // Filter out expired matches
    
    setMatches(processedMatches);
  }, []);

  // Check if we should open modal from reservation
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const action = urlParams.get('action');
    
    if (action === 'create') {
      const storedData = localStorage.getItem('createListingData');
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          setPrefilledData(parsedData);
          setIsModalOpen(true);
          // Clear the stored data
          localStorage.removeItem('createListingData');
        } catch (error) {
          console.error('Error parsing stored listing data:', error);
        }
      }
    }
  }, [location.search]);



  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
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

  const handleSubmitAd = (formData) => {
    // TODO: Backend'e gönderme işlemi burada yapılacak
    console.log("New ad data:", formData);
    // Geçici olarak console'a yazdırıyoruz
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

  // Handle location permission acceptance
  const handleLocationAccept = async () => {
    setShowLocationPopup(false);
    setIsLoadingNearby(true);

    try {
      const coordinates = await getCurrentLocation();
      console.log("Kullanıcı konumu alındı:", coordinates);
      // TODO: Backend'e yakın maçları sorgula
      // await fetchNearbyMatches(coordinates);
      setIsLoadingNearby(false);
    } catch (error) {
      console.error("Konum alma hatası:", error);
      setIsLoadingNearby(false);
    }
  };

  // Handle location permission decline
  const handleLocationDecline = () => {
    setShowLocationPopup(false);
  };

  // Filter matches based on active filter and search query
  const filteredMatches = matches.filter(match => {
    const matchesFilter = activeFilter === "all" || match.type === activeFilter;
    const matchesSearch = searchQuery === "" || 
      match.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <Header />
      
      <MatchesHero />

      <MatchesList 
        matches={filteredMatches}
        onJoinMatch={handleJoinMatch}
        activeFilter={activeFilter}
        searchQuery={searchQuery}
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearchChange}
        onCreateAdClick={handleCreateAdClick}
        onNearbySearch={handleNearbySearch}
        isLoadingNearby={isLoadingNearby}
      />

      <CreateAdModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        onSubmit={handleSubmitAd}
        prefilledData={prefilledData}
      />

      {/* Location Permission Popup */}
      {showLocationPopup && (
        <LocationPermissionPopup 
          onClose={handleLocationDecline}
          onAccept={handleLocationAccept}
          message="Yakınınızdaki maçları bulabilmemiz için konum bilginizi Sporplanet ile paylaşmanıza izin vermeniz gerekmektedir."
        />
      )}
      
      <Footer />
    </div>
  );
}

export default MatchesPage;