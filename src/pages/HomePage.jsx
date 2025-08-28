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

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll("[data-animate]");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/matches");
    } else {
      navigate("/auth/signup");
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

  // Fetch matches from backend
  const fetchMatches = async () => {
    try {
      console.log("Fetching matches from API...");
      const response = await fetch("/api/v1/advert/getAll", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Matches API response status:", response.status);

      if (!response.ok) {
        throw new Error("Failed to fetch matches");
      }

      const data = await response.json();
      console.log("Matches data received:", data);
      
      // API response'u kontrol et ve doğru field'ı kullan
      const matchesData = data.adverts || data.data || data || [];
      setMatches(matchesData.slice(0, 3)); // İlk 3 tanesini al
      console.log("Matches set:", matchesData.slice(0, 3));
    } catch (err) {
      console.error("Error fetching matches:", err);
      setError("Maçlar yüklenemedi");
    }
  };

  // Fetch pitches from backend
  const fetchPitches = async () => {
    try {
      console.log("Fetching pitches from API...");
      const response = await fetch("/api/v1/pitch/getAll", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Pitches API response status:", response.status);

      if (!response.ok) {
        throw new Error("Failed to fetch pitches");
      }

      const data = await response.json();
      console.log("Pitches data received:", data);
      
      // API response'u kontrol et ve doğru field'ı kullan
      const pitchesData = data.pitches || data.data || data || [];
      setPitches(pitchesData.slice(0, 3)); // İlk 3 tanesini al
      console.log("Pitches set:", pitchesData.slice(0, 3));
    } catch (err) {
      console.error("Error fetching pitches:", err);
      setError("Sahalar yüklenemedi");
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

      {/* Hero Section - Shortened and Simplified */}
      <section className="relative bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 py-20 pt-24 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" 
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            Futbol Tutkun
            <span className="block text-green-300">Burada Başlıyor</span>
          </h1>
          <p className="text-xl sm:text-2xl mb-8 max-w-3xl mx-auto text-green-100 leading-relaxed">
            Arkadaşlarını bul, maç organize et, saha kirala. Türkiye'nin en büyük futbol topluluğuna katıl!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={handleGetStarted}
              className="px-8 py-3 bg-white text-green-700 font-semibold rounded-full hover:bg-green-50 transform hover:scale-105 transition-all duration-300 shadow-lg"
            >
              {isAuthenticated ? "Maçları Keşfet" : "Hemen Başla"}
            </button>
          </div>
        </div>
      </section>

      {/* Features Introduction Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              Futbol Dünyanda
              <span className="block text-green-600">Her Şey Burada</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              SporPlanet ile futbol tutkunu ile ilgili tüm ihtiyaçlarını karşılayabilirsin
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Match Feature */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Maç İlanları</h3>
              <p className="text-gray-600 mb-6">
                Binlerce oyuncu seni bekliyor. Seviyene uygun maçlar bul, takım arkadaşları edin!
              </p>
              <button 
                onClick={() => navigate("/matches")}
                className="text-green-600 font-semibold hover:text-green-700 flex items-center"
              >
                Maçları Gör
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>

            {/* Reservation Feature */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Saha Rezervasyonu</h3>
              <p className="text-gray-600 mb-6">
                Türkiye'nin her yerinden binlerce saha. Kolayca rezervasyon yap, hemen oyna!
              </p>
              <button 
                onClick={() => navigate("/reservation")}
                className="text-blue-600 font-semibold hover:text-blue-700 flex items-center"
              >
                Sahaları Gör
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>

            {/* Tournament Feature */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-blue-200">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Turnuvalar</h3>
              <p className="text-gray-600 mb-6">
                Rekabetçi turnuvalara katıl, şampiyonluklar kazan ve futbol kariyerinde yüksel!
              </p>
              <button 
                onClick={() => navigate("/tournaments")}
                className="text-blue-600 font-semibold hover:text-blue-700 flex items-center"
              >
                Turnuvaları Gör
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Matches Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {matches.slice(0, 3).map((match) => (
                <div 
                  key={match._id || match.id} 
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                  onClick={() => navigate(`/advert-detail/${match._id || match.id}`)}
                >
                  <div 
                    className="h-32 bg-cover bg-center relative"
                    style={{
                      backgroundImage: match.matchType === "team" 
                        ? `url('/images/takım.png')` 
                        : `url('/images/oyuncu.png')`
                    }}
                  >
                    <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        match.matchType === 'team' 
                          ? 'bg-green-500 text-white' 
                          : 'bg-blue-500 text-white'
                      }`}>
                        {match.matchType === 'team' ? '👥 Takım Arıyor' : '👤 Oyuncu Arıyor'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="font-bold text-gray-900 mb-3 line-clamp-2">
                      {match.name || "Maç İlanı"}
                    </h3>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-600 text-sm">
                        <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        <span className="truncate">
                          {match.address?.district && match.address?.city 
                            ? `${match.address.district}, ${match.address.city}`
                            : "Konum Belirtilmemiş"}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-gray-600 text-sm">
                        <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="truncate">
                          {match.startsAt 
                            ? new Date(match.startsAt).toLocaleDateString("tr-TR") + " • " +
                              new Date(match.startsAt).toLocaleTimeString("tr-TR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "Tarih Belirtilmemiş"}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-gray-600 text-sm">
                        <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="truncate">
                          {match.playersNeeded || match.goalKeepersNeeded 
                            ? `${(match.playersNeeded || 0) + (match.goalKeepersNeeded || 0)} kişi arıyor`
                            : "Oyuncu sayısı belirtilmemiş"}
                        </span>
                      </div>
                    </div>
                    
                    <button className="w-full bg-green-500 text-white py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors">
                      Detayları Gör
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
          <div className="text-center mb-12">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {pitches.slice(0, 3).map((pitch) => (
                <div 
                  key={pitch._id || pitch.id} 
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                  onClick={() => navigate(`/pitch-detail/${pitch._id || pitch.id}`)}
                >
                  <div className="h-48 bg-gradient-to-r from-green-400 to-blue-500 relative overflow-hidden">
                    {pitch.images && pitch.images.length > 0 ? (
                      <img 
                        src={pitch.images[0]} 
                        alt={pitch.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
                        <svg className="w-16 h-16 text-white/50" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-gray-900 line-clamp-1">
                        {pitch.name || "Saha Adı"}
                      </h3>
                      {pitch.rating && (
                        <div className="flex items-center">
                          <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-sm font-semibold">{pitch.rating}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center text-gray-600 text-sm mb-4">
                      <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      <span className="truncate">
                        {pitch.address?.district && pitch.address?.city 
                          ? `${pitch.address.district}, ${pitch.address.city}`
                          : "Konum Belirtilmemiş"}
                      </span>
                    </div>
                    
                    {pitch.features && pitch.features.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {pitch.features.slice(0, 3).map((feature, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            {feature}
                          </span>
                        ))}
                        {pitch.features.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{pitch.features.length - 3} daha
                          </span>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-green-600 font-bold text-lg">
                        {pitch.pricePerHour ? `₺${pitch.pricePerHour}/saat` : "Fiyat Belirtilmemiş"}
                      </span>
                      <button className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors">
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
      <section className="py-16 bg-gradient-to-br from-blue-800 via-indigo-800 to-blue-900 relative overflow-hidden">
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