import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/shared/Header";
import Footer from "../components/shared/Footer";
import { useAuth } from "../context/AuthContext";
import Notification from "../components/shared/Notification";

function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isVisible, setIsVisible] = useState({});
  
  // Real data states
  const [matches, setMatches] = useState([]);
  const [pitches, setPitches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Hero background images rotation
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const heroImages = [
    '/images/homepage-hero-2.avif',
    '/images/hompage-hero-1.avif',
    '/images/homepage-hero-3.avif'
  ];
  
  // Notification state
  const [notification, setNotification] = useState({
    isVisible: false,
    message: "",
    type: "success",
  });

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Hero image rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % heroImages.length
      );
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [heroImages.length]);

  // Enhanced Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
            
            // Add scroll animation classes
            entry.target.classList.add('animate-fade-in-up');
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }
        });
      },
      { 
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px' // Trigger animation earlier
      }
    );

    const elements = document.querySelectorAll("[data-animate]");
    elements.forEach((el) => {
      // Set initial state for animations
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleGetStarted = () => {
    // Scroll to features section
    const featuresSection = document.getElementById('features-section');
    if (featuresSection) {
      featuresSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // Notification helper functions
  const showNotification = (message, type = "success") => {
    setNotification({
      isVisible: true,
      message,
      type,
    });
  };

  const closeNotification = () => {
    setNotification({
      isVisible: false,
      message: "",
      type: "success",
    });
  };

  // Transform backend data to pitch format (from ReservationPage)
  const transformPitchData = (item) => {
    // Handle different address structures from backend
    const getLocationData = () => {
      // Try different address field structures
      const address = item.address || item.location?.address || item.location;
      
      if (!address) return { 
        fullLocation: "Lokasyon bilgisi yok", 
        cityDistrict: "Konum Belirtilmemiş",
        city: "Bilinmeyen Şehir", 
        district: "Bilinmeyen İlçe" 
      };
      
      // If address is a string, use it directly for full location
      if (typeof address === 'string' && address.trim()) {
        // Try to extract city from the string (usually last part after '/')
        const parts = address.split('/').map(part => part.trim());
        const city = parts.length > 1 ? parts[parts.length - 1] : "";
        const district = parts.length > 2 ? parts[parts.length - 2] : "";
        
        return { 
          fullLocation: address, // Full address with street info
          cityDistrict: city && district ? `${district}, ${city}` : (city || address),
          city: city || "Bilinmeyen Şehir", 
          district: district || "Bilinmeyen İlçe" 
        };
      }
      
      // Build location strings from object
      const fullLocationParts = [];
      const cityDistrictParts = [];
      
      // Add street/detailed info for full location
      if (address.street) fullLocationParts.push(address.street);
      if (address.neighborhood) fullLocationParts.push(address.neighborhood);
      if (address.district) {
        fullLocationParts.push(address.district);
        cityDistrictParts.push(address.district);
      }
      if (address.city) {
        fullLocationParts.push(address.city);
        cityDistrictParts.push(address.city);
      }
      
      const fullLocation = fullLocationParts.length > 0 ? fullLocationParts.join(", ") : "Lokasyon bilgisi yok";
      const cityDistrict = cityDistrictParts.length > 0 ? cityDistrictParts.join(", ") : "Konum Belirtilmemiş";
      
      return {
        fullLocation, // Full address with street details
        cityDistrict, // Only city and district for maps
        city: address.city || "Bilinmeyen Şehir",
        district: address.district || "Bilinmeyen İlçe"
      };
    };

    const locationData = getLocationData();

    // Handle price from backend properly (all values come in kuruş, divide by 100 for TL)
    const getPriceData = () => {
      // Try different price field structures from backend
      let priceInKurus = 0;

      // Check pricePerHour field
      if (item.pricePerHour) {
        if (typeof item.pricePerHour === 'object' && item.pricePerHour.amount) {
          priceInKurus = item.pricePerHour.amount;
        } else if (typeof item.pricePerHour === 'number' || typeof item.pricePerHour === 'string') {
          priceInKurus = parseFloat(item.pricePerHour) || 0;
        }
      }
      // Check pricing.hourlyRate field
      else if (item.pricing?.hourlyRate) {
        priceInKurus = item.pricing.hourlyRate;
      }
      // Check price field
      else if (item.price) {
        if (typeof item.price === 'object' && item.price.amount) {
          priceInKurus = item.price.amount;
        } else if (typeof item.price === 'number' || typeof item.price === 'string') {
          priceInKurus = parseFloat(item.price) || 0;
        }
      }
      // Check cost field
      else if (item.cost) {
        priceInKurus = parseFloat(item.cost) || 0;
      }

      // Convert kuruş to TL by dividing by 100
      return Math.round(priceInKurus / 100) || 0;
    };

    const price = getPriceData();

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
      _id: item._id || item.id,
      name: item.name || "İsimsiz Saha",
      address: locationData,
      pricePerHour: price,
      rating: item.rating?.averageRating ?? null,
      totalReviews: item.rating?.totalReviews ?? null,
      features: item.features || [],
      images: getImageUrl() ? [getImageUrl()] : [],
      image: getImageUrl()
    };
  };

  // Fetch matches from backend
  const fetchMatches = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/v1/advert/getAll?page=1&limit=3", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }

      const data = await response.json();
      const matchesData = data.adverts || data.data || data || [];
      const validMatches = matchesData.filter(match => match && (match._id || match.id));
      
      setMatches(validMatches.slice(0, 3)); // İlk 3 ilanı göster
    } catch (err) {
      console.error("Error fetching matches:", err);
      setError(`Maçlar yüklenemedi: ${err.message}`);
      showNotification("Maçlar yüklenirken bir hata oluştu", "error");
    }
  };

  // Fetch pitches from backend
  const fetchPitches = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/v1/pitch/getAll?page=1&limit=3", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }

      const data = await response.json();
      const pitchesData = data.pitches || data.data || data || [];
      const validPitches = pitchesData.filter(pitch => pitch && (pitch._id || pitch.id));
      
      // Transform pitches using ReservationPage logic
      const transformedPitches = validPitches.slice(0, 3).map(transformPitchData);
      setPitches(transformedPitches);
    } catch (err) {
      console.error("Error fetching pitches:", err);
      setError(`Sahalar yüklenemedi: ${err.message}`);
      showNotification("Sahalar yüklenirken bir hata oluştu", "error");
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchMatches(), fetchPitches()]);
      } catch (err) {
        console.error("Error loading homepage data:", err);
        showNotification("Veriler yüklenirken hata oluştu", "error");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Header */}
      <Header />

      {/* Hero Section with Background Images */}
      <section className="relative py-20 pt-24 overflow-hidden min-h-[600px] flex items-center">
        {/* Background Images Slideshow */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60 z-10"></div>
          
          {/* Multiple background images with crossfade effect */}
          {heroImages.map((image, index) => (
            <div 
              key={index}
              className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-2000 ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                backgroundImage: `url('${image}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            ></div>
          ))}
          
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30 z-10"></div>
        </div>

        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" 
              style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <div className="p-8 sm:p-12">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 drop-shadow-lg">
            Futbol Tutkun
              <span className="block bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                Burada Başlıyor
              </span>
          </h1>
            <p className="text-xl sm:text-2xl mb-8 max-w-3xl mx-auto text-gray-100 leading-relaxed drop-shadow-md">
            Arkadaşlarını bul, maç organize et, saha kirala. Türkiye'nin en büyük futbol topluluğuna katıl!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={handleGetStarted}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold rounded-full hover:from-green-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl border border-white/20 flex items-center gap-2"
            >
                Hemen Başla
                
            </button>
          </div>
        </div>
        </div>


      </section>

      {/* Features Introduction Section */}
      <section id="features-section" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Futbol Dünyasında Her Şey Burada
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              SporPlanet ile futbol tutkunu ile ilgili tüm ihtiyaçlarını karşıla
              </p>
            </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Match Feature */}
            <div 
              className="group bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-green-200 transform hover:-translate-y-2 relative overflow-hidden"
              data-animate
              id="match-feature"
            >
              {/* Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-green-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                                 <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg mx-auto">
                  <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
              </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-green-600 transition-colors text-center sm:text-left">
                  Maç İlanları
                </h3>
                
                <p className="text-gray-600 mb-6 leading-relaxed text-center sm:text-left">
                  <span className="font-semibold text-green-600">Binlerce oyuncu</span> seni bekliyor! 
                  Seviyene uygun maçlar bul, yeni arkadaşlar edin ve futbol tutkunu paylaş.
                </p>

                {/* Stats */}
                <div className="flex items-center justify-between mb-6 p-3 bg-green-50 rounded-xl">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">1000+</div>
                    <div className="text-xs text-gray-600">Aktif Oyuncu</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">50+</div>
                    <div className="text-xs text-gray-600">Günlük Maç</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">7/24</div>
                    <div className="text-xs text-gray-600">Aktif Sistem</div>
                  </div>
                </div>
                
              <button 
                onClick={() => navigate("/matches")}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                  Maçları Keşfet
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
              </div>
            </div>

            {/* Reservation Feature */}
            <div 
              className="group bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-blue-200 transform hover:-translate-y-2 relative overflow-hidden"
              data-animate
              id="reservation-feature"
            >
              {/* Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                                 <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg mx-auto">
                   <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                     <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" fill="rgba(255,255,255,0.1)"/>
                     <circle cx="12" cy="12" r="2" stroke="currentColor" fill="currentColor"/>
                     <line x1="12" y1="4" x2="12" y2="20" stroke="currentColor"/>
                     <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor"/>
                     <rect x="2" y="8" width="4" height="8" rx="1" stroke="currentColor" fill="none"/>
                     <rect x="18" y="8" width="4" height="8" rx="1" stroke="currentColor" fill="none"/>
                     <rect x="2" y="10" width="2" height="4" rx="0.5" stroke="currentColor" fill="rgba(255,255,255,0.2)"/>
                     <rect x="20" y="10" width="2" height="4" rx="0.5" stroke="currentColor" fill="rgba(255,255,255,0.2)"/>
                   </svg>
               </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors text-center sm:text-left">
                  Saha Rezervasyonu
                </h3>
                
                <p className="text-gray-600 mb-6 leading-relaxed text-center sm:text-left">
                  <span className="font-semibold text-blue-600">Türkiye'nin her yerinden</span> binlerce saha! 
                  Kolayca rezervasyon yap, anında onayla ve hemen oynamaya başla.
                </p>

                {/* Stats */}
                <div className="flex items-center justify-between mb-6 p-3 bg-blue-50 rounded-xl">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">500+</div>
                    <div className="text-xs text-gray-600">Saha</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">81</div>
                    <div className="text-xs text-gray-600">Şehir</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">7/24</div>
                    <div className="text-xs text-gray-600">Rezervasyon</div>
                  </div>
                </div>
                
              <button 
                onClick={() => navigate("/reservation")}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                  Sahaları Keşfet
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
              </div>
            </div>

            {/* Tournament Feature */}
            <div 
              className="group bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-indigo-200 transform hover:-translate-y-2 relative overflow-hidden"
              data-animate
              id="tournament-feature"
            >
              {/* Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                                 <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg mx-auto">
                   <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                     <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                     <path d="M12 6.5l1.5 3h3.5l-2.5 2 1 3.5-3-2-3 2 1-3.5-2.5-2h3.5z" fill="rgba(255,255,255,0.3)"/>
                   </svg>
               </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-indigo-600 transition-colors text-center sm:text-left">
                  Turnuvalar
                </h3>
                
                <p className="text-gray-600 mb-6 leading-relaxed text-center sm:text-left">
                  <span className="font-semibold text-indigo-600">Rekabetçi turnuvalara</span> katıl! 
                  Şampiyonluklar kazan, ödüller al ve futbol kariyerinde zirveye çık.
                </p>

                {/* Stats */}
                <div className="flex items-center justify-between mb-6 p-3 bg-indigo-50 rounded-xl">
                  <div className="text-center">
                    <div className="text-lg font-bold text-indigo-600">Yakında</div>
                    <div className="text-xs text-gray-600">Turnuvalar</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-indigo-600">Ödüller</div>
                    <div className="text-xs text-gray-600">Kazanç</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-indigo-600">Prestij</div>
                    <div className="text-xs text-gray-600">Başarı</div>
                  </div>
                </div>
                
                <button
                onClick={() => navigate("/tournaments")}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center opacity-75 cursor-not-allowed"
                  disabled
                >
                  Çok Yakında
                  <svg className="w-5 h-5 ml-2 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Matches Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12" data-animate id="matches-header">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Popüler Maç İlanları</h2>
            <p className="text-lg text-gray-600">Şu anda en çok ilgi gören maçlar</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                  <div className="h-2 bg-gray-200"></div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-6 bg-gray-200 rounded w-24"></div>
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded mb-4"></div>
                    <div className="space-y-2 mb-4">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" data-animate id="matches-grid">
              {matches.slice(0, 3).map((match, index) => (
                <div 
                  key={match._id || match.id} 
                  className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-green-200 transform hover:-translate-y-1 cursor-pointer"
                  onClick={() => navigate(`/advert-detail/${match._id || match.id}`)}
                  data-animate 
                  id={`match-card-${index}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="relative overflow-hidden">
                    <div 
                      className="h-48 relative transition-transform duration-300 group-hover:scale-105"
                    >
                      {/* Full Background Image */}
                      <div 
                        className="absolute inset-0 bg-cover"
                        style={{
                          backgroundImage: (match.matchType === "team" || match.isRivalry?.status) 
                            ? `url('/images/takım.png')` 
                            : `url('/images/oyuncu.png')`,
                          backgroundSize: 'cover',
                          backgroundPosition: (match.matchType === "team" || match.isRivalry?.status) 
                            ? 'center' 
                            : 'top center',
                          backgroundRepeat: 'no-repeat'
                        }}
                      />
                      
                      {/* Subtle Overlay for Better Text Readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent"></div>
                      
                      {/* Match Type Badge */}
                      <div className="absolute top-4 left-4">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm ${
                          (match.matchType === 'team' || match.isRivalry?.status) 
                            ? 'bg-green-500/90 text-white' 
                            : 'bg-blue-500/90 text-white'
                        }`}>
                          {(match.matchType === 'team' || match.isRivalry?.status) ? '👥 Takım Arıyor' : '👤 Oyuncu Arıyor'}
                        </span>
                      </div>

                      {/* Players Needed Badge */}
                      {(match.playersNeeded || match.goalKeepersNeeded) && (
                        <div className="absolute bottom-4 right-4">
                          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-white/90 text-gray-800 backdrop-blur-sm">
                            🏃‍♂️ {(match.playersNeeded || 0) + (match.goalKeepersNeeded || 0)} kişi arıyor
                          </span>
            </div>
                      )}
          </div>
        </div>
                  
                  <div className="p-6">
                    <h3 className="font-bold text-gray-900 text-lg mb-3 line-clamp-2 group-hover:text-green-600 transition-colors">
                      {match.name || "Maç İlanı"}
                    </h3>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-gray-600 text-sm">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
          </div>
                        <span className="truncate font-medium">
                          {(() => {
                            // Handle address as string (from backend) or object
                            if (typeof match.address === 'string' && match.address.trim()) {
                              return match.address;
                            } else if (match.address?.district && match.address?.city) {
                              return `${match.address.district}, ${match.address.city}`;
                            } else if (match.location) {
                              return match.location;
                            } else {
                              return "Konum Belirtilmemiş";
                            }
                          })()}
                        </span>
        </div>

                      <div className="flex items-start text-gray-600 text-sm">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">
                            {match.startsAt 
                              ? new Date(match.startsAt).toLocaleDateString("tr-TR")
                              : "Tarih Belirtilmemiş"}
                          </div>
                          {match.startsAt && (
                            <div className="text-xs text-gray-500 mt-1">
                              {(() => {
                                const startTime = new Date(match.startsAt).toLocaleTimeString("tr-TR", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                });
                                // Calculate end time (assuming 1 hour duration if not specified)
                                const endDate = new Date(match.startsAt);
                                endDate.setHours(endDate.getHours() + (match.duration || 1));
                                const endTime = endDate.toLocaleTimeString("tr-TR", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                });
                                return `${startTime} - ${endTime}`;
                              })()}
                            </div>
                          )}
                        </div>
                      </div>
          </div>

                    <button className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-[1.02] shadow-md hover:shadow-lg">
                      Detayları Görüntüle
                    </button>
                  </div>
                </div>
              ))}
              </div>
          )}

          <div className="text-center">
            <button 
              onClick={() => navigate("/matches")}
              className="px-8 py-3 bg-green-500 text-white font-semibold rounded-full hover:bg-green-600 transition-colors"
            >
              Tüm Maçları Gör
            </button>
          </div>
        </div>
      </section>

      {/* Dynamic Reservations Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12" data-animate id="pitches-header">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Popüler Sahalar</h2>
            <p className="text-lg text-gray-600">En çok tercih edilen futbol sahaları</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="h-6 bg-gray-200 rounded w-32"></div>
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                      <div className="h-6 bg-gray-200 rounded w-24"></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                      <div className="h-10 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" data-animate id="pitches-grid">
              {pitches.slice(0, 3).map((pitch, index) => (
                <div 
                  key={pitch._id || pitch.id} 
                  className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200 transform hover:-translate-y-1 cursor-pointer"
                  onClick={() => navigate(`/pitch-detail/${pitch._id || pitch.id}`)}
                  data-animate 
                  id={`pitch-card-${index}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="relative overflow-hidden">
                    <div className="h-56 relative transition-transform duration-300 group-hover:scale-105">
                      {pitch.image ? (
                        <>
                          <img 
                            src={pitch.image} 
                            alt={pitch.name || 'Saha Fotoğrafı'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                          
                          {/* Fallback for broken images */}
                          <div className="w-full h-full bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 items-center justify-center relative hidden">
                            <div className="absolute inset-0 bg-black/10"></div>
                            <div className="text-center text-white/80 z-10">
                              <svg className="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                              </svg>
                              <p className="text-sm font-medium">Fotoğraf Yüklenemedi</p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-full h-full bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 flex items-center justify-center relative">
                            <div className="absolute inset-0 bg-black/10"></div>
                            <div className="text-center text-white/80 z-10">
                              <svg className="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                              </svg>
                              <p className="text-sm font-medium">Fotoğraf Yok</p>
                            </div>
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                        </>
                      )}
                      
                      {/* Rating Badge */}
                      {pitch.rating && (
                        <div className="absolute top-4 right-4">
                          <div className="flex items-center bg-white/90 backdrop-blur-sm px-2.5 py-1.5 rounded-full">
                            <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-sm font-semibold text-gray-800">
                              {typeof pitch.rating === 'object' ? pitch.rating.averageRating || '0.0' : pitch.rating}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="mb-4">
                      <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {pitch.name || "Saha Adı"}
                      </h3>
                    </div>
                    
                                          <div 
                        className="flex items-center text-gray-600 text-sm mb-4 cursor-pointer hover:text-blue-600 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Use full address for Google Maps (with street details)
                          const fullAddress = pitch.address?.fullLocation || pitch.address?.cityDistrict || pitch.name;
                          
                          if (fullAddress) {
                            window.open(`https://maps.google.com/maps?q=${encodeURIComponent(fullAddress)}`, '_blank');
                          }
                        }}
                      >
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                          <svg className="w-4 h-4 text-gray-500 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                        </div>
                        <span className="truncate font-medium">
                          {pitch.address?.cityDistrict || 'Konum Belirtilmemiş'}
                        </span>
                      </div>
                    
                    {pitch.features && pitch.features.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {pitch.features.slice(0, 3).map((feature, index) => (
                          <span key={index} className="inline-flex items-center px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200">
                            {feature}
                          </span>
                        ))}
                        {pitch.features.length > 3 && (
                          <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                            +{pitch.features.length - 3} özellik
                          </span>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-2xl font-bold text-blue-600">
                          ₺{pitch.pricePerHour || 0}
                        </span>
                        <span className="text-sm text-gray-500">saat başına</span>
                      </div>
                      <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-[1.02] shadow-md hover:shadow-lg">
                        Rezerve Et
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              </div>
          )}

          <div className="text-center">
            <button 
              onClick={() => navigate("/reservation")}
              className="px-8 py-3 bg-blue-500 text-white font-semibold rounded-full hover:bg-blue-600 transition-colors"
            >
              Tüm Sahaları Gör
            </button>
          </div>
        </div>
      </section>

      {/* Tournament System Explanation */}
      <section className="py-16 bg-gradient-to-br from-blue-800 via-indigo-800 to-blue-900 relative overflow-hidden" data-animate id="tournament-section">
        {/* Champions League Stars Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10">
            <svg className="w-8 h-8 text-white animate-pulse" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="absolute top-32 right-20">
            <svg className="w-6 h-6 text-white animate-pulse" style={{animationDelay: '1s'}} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="absolute bottom-20 left-1/4">
            <svg className="w-5 h-5 text-white animate-pulse" style={{animationDelay: '2s'}} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center text-white mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Turnuva Sistemi
              <span className="block text-blue-200 text-lg font-normal mt-2">⭐ Şampiyonlar Ligi Seviyesinde ⭐</span>
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Profesyonel turnuva deneyimi ile futbol kariyerinde yeni zirvelere çık
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Step 1 */}
            <div className="text-center text-white">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-white/30">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="text-lg font-bold mb-3">Takım Oluştur</h3>
              <p className="text-blue-100 text-sm">
                Arkadaşlarınla birlikte takımını oluştur veya mevcut takımlara katıl
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center text-white">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-white/30">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="text-lg font-bold mb-3">Turnuvaya Katıl</h3>
              <p className="text-blue-100 text-sm">
                Seviyene uygun turnuvaları seç ve takımınla birlikte kayıt ol
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center text-white">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-white/30">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="text-lg font-bold mb-3">Maçlara Çık</h3>
              <p className="text-blue-100 text-sm">
                Otomatik eşleşme sistemi ile rakip takımlarla karşılaş ve mücadele et
              </p>
            </div>

            {/* Step 4 */}
            <div className="text-center text-white">
              <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-white/50">
                <span className="text-2xl font-bold text-blue-900">4</span>
              </div>
              <h3 className="text-lg font-bold mb-3">🏆 Şampiyon Ol</h3>
              <p className="text-blue-100 text-sm">
                Şampiyonluklar kazan, altın rozetler topla ve futbol kariyerinde ilerle
              </p>
            </div>
          </div>

          {/* Tournament Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-yellow-900" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-3">Ödül Sistemi</h3>
              <p className="text-blue-100 text-sm">
                Şampiyon takımlara özel ödüller, rozetler ve başarı sertifikaları
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-500 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-3">Canlı Skor Tablosu</h3>
              <p className="text-blue-100 text-sm">
                Maç sonuçlarını takip et, puan tablosunu görüntüle ve sıralamayı izle
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-400 to-blue-500 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-3">İstatistik Takibi</h3>
              <p className="text-blue-100 text-sm">
                Oyuncu ve takım istatistiklerini detaylı bir şekilde takip et
              </p>
            </div>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center px-8 py-4 bg-white/10 text-white rounded-full text-lg font-semibold cursor-not-allowed opacity-75 border border-white/30">
              <svg className="w-6 h-6 mr-2 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              ⭐ Çok Yakında ⭐
            </div>
          </div>
        </div>
      </section>



      {/* Footer */}
      <Footer />

      {/* Notification */}
      <Notification
        isVisible={notification.isVisible}
        message={notification.message}
        type={notification.type}
        onClose={closeNotification}
      />
    </div>
  );
}

export default HomePage;