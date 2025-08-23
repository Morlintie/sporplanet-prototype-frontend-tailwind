import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/shared/Header";
import Footer from "../components/shared/Footer";
import MatchesFeature from "../components/home/MatchesFeature";
import ReservationFeature from "../components/home/ReservationFeature";
import TournamentFeature from "../components/home/TournamentFeature";
import { useAuth } from "../context/AuthContext";

function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState({});

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Auto-slider for hero section
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
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

  const handleLearnMore = () => {
    document.getElementById("features").scrollIntoView({ behavior: "smooth" });
  };

  const heroSlides = [
    {
      title: "Futbol Tutkun",
      subtitle: "Burada Başlıyor",
      description: "Arkadaşlarını bul, maç organize et, saha kirala. Türkiye'nin en büyük futbol topluluğuna katıl!",
      bg: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?q=80&w=1170&auto=format&fit=crop"
    },
    {
      title: "Her Gün Yeni",
      subtitle: "Maçlar ve Fırsatlar",
      description: "Binlerce oyuncu seni bekliyor. Seviyene uygun maçlar bul, yeni arkadaşlar edin!",
      bg: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1170&auto=format&fit=crop"
    },
    {
      title: "Rekabetçi Ortamda",
      subtitle: "Şampiyonluklar Kazan",
      description: "Turnuvalara katıl, ligde oyna, ödüller kazan. Futbol kariyerinde yeni bir sayfa aç!",
      bg: "https://images.unsplash.com/photo-1552318965-6e6be7484ada?q=80&w=1170&auto=format&fit=crop"
    }
  ];

  const testimonials = [
    {
      name: "Ahmet Yılmaz",
      location: "İstanbul",
      text: "SporPlanet sayesinde her hafta düzenli maç yapıyorum. Harika arkadaşlar edindim!",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face"
    },
    {
      name: "Mehmet Demir",
      location: "Ankara",
      text: "Saha rezervasyonu çok kolay, fiyatlar uygun. Kesinlikle tavsiye ederim.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face"
    },
    {
      name: "Ali Özkan",
      location: "İzmir",
      text: "Turnuva sistemleri çok iyi organize edilmiş. Gerçek bir futbol deneyimi!",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&crop=face"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Header */}
      <Header />

      {/* Hero Section - Enhanced with Slider */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Slider */}
        <div className="absolute inset-0">
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
              style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('${slide.bg}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat"
              }}
            />
          ))}
        </div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-green-400 opacity-10 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400 opacity-10 rounded-full animate-bounce" style={{ animationDuration: "3s" }}></div>
          <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-yellow-400 opacity-10 rounded-full animate-ping" style={{ animationDuration: "4s" }}></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center text-white">
            <div className="mb-8">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                {heroSlides[currentSlide].title}
                <span className="block text-green-300 bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text text-transparent">
                  {heroSlides[currentSlide].subtitle}
                </span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto text-gray-200 leading-relaxed">
                {heroSlides[currentSlide].description}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <button 
                onClick={handleGetStarted}
                className="group relative px-10 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg rounded-full shadow-2xl hover:shadow-green-500/25 transform hover:scale-105 transition-all duration-300 cursor-pointer"
              >
                <span className="relative z-10">
                  {isAuthenticated ? "Maçları Keşfet" : "Hemen Başla"}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              
              <button 
                onClick={handleLearnMore}
                className="group px-10 py-4 border-2 border-white text-white font-bold text-lg rounded-full hover:bg-white hover:text-green-700 transition-all duration-300 cursor-pointer"
              >
                Nasıl Çalışır?
                <svg className="inline-block w-5 h-5 ml-2 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>
            </div>

            {/* Slider Indicators */}
            <div className="flex justify-center space-x-3 mt-12">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide ? "bg-white scale-125" : "bg-white/50 hover:bg-white/75"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="animate-bounce">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* Features Section - Enhanced */}
      <section id="features" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100"></div>
        <div className="relative w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div 
            className={`text-center mb-20 transition-all duration-1000 ${
              isVisible.features ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
            id="features"
            data-animate
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Futbol Dünyanda
              <span className="block text-green-600 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Her Şey
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              SporPlanet ile futbol tutkunu ile ilgili tüm ihtiyaçlarını karşılayabilirsin. 
              Maç bulmadan saha kiralamaya, turnuvalara kadar!
            </p>
          </div>

          {/* Feature Cards Grid - Enhanced */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div 
              className={`transform transition-all duration-1000 delay-100 ${
                isVisible.features ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-10 scale-95"
              }`}
            >
              <MatchesFeature />
            </div>
            <div 
              className={`transform transition-all duration-1000 delay-200 ${
                isVisible.features ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-10 scale-95"
              }`}
            >
              <ReservationFeature />
            </div>
            <div 
              className={`transform transition-all duration-1000 delay-300 ${
                isVisible.features ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-10 scale-95"
              }`}
            >
              <TournamentFeature />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Enhanced with Animations */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-emerald-600 to-green-700"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#grid)" />
            </svg>
          </div>
        </div>

        <div className="relative w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div 
            className={`text-center mb-16 transition-all duration-1000 ${
              isVisible.stats ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
            id="stats"
            data-animate
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Türkiye'nin En Büyük Futbol Topluluğu
            </h2>
            <p className="text-green-100 text-lg">Binlerce oyuncu her gün bizimle futbol oynuyor</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "25K+", label: "Aktif Oyuncu", delay: "delay-100" },
              { number: "5K+", label: "Günlük Maçlar", delay: "delay-200" },
              { number: "1K+", label: "Futbol Sahası", delay: "delay-300" },
              { number: "100+", label: "Turnuva", delay: "delay-400" }
            ].map((stat, index) => (
              <div 
                key={index}
                className={`text-center transform transition-all duration-1000 ${stat.delay} ${
                  isVisible.stats ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-10 scale-95"
                }`}
              >
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 group">
                  <div className="text-4xl md:text-5xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">
                    {stat.number}
                  </div>
                  <div className="text-green-200 text-sm md:text-base">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-100">
        <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div 
            className={`text-center mb-16 transition-all duration-1000 ${
              isVisible.testimonials ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
            id="testimonials"
            data-animate
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Kullanıcılarımız Ne Diyor?
            </h2>
            <p className="text-lg text-gray-600">Binlerce mutlu kullanıcıdan sadece birkaçı</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className={`transform transition-all duration-1000 delay-${(index + 1) * 100} ${
                  isVisible.testimonials ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}
              >
                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200">
                  <div className="flex items-center mb-4">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover mr-4"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.location}</p>
                    </div>
                  </div>
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-700 leading-relaxed">"{testimonial.text}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Call to Action Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-800 via-green-600 to-emerald-600"></div>
        <div className="absolute inset-0 bg-black/30"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-float"></div>
        <div className="absolute top-1/4 right-10 w-32 h-32 bg-white/5 rounded-full animate-float" style={{ animationDelay: "1s" }}></div>
        <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-white/10 rounded-full animate-float" style={{ animationDelay: "2s" }}></div>

        <div className="relative w-full px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
          <div 
            className={`transition-all duration-1000 ${
              isVisible.cta ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
            id="cta"
            data-animate
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
              Hazır mısın?
              <span className="block text-green-200">Macera Başlasın!</span>
            </h2>
            <p className="text-xl text-green-100 mb-10 leading-relaxed">
              Binlerce futbol sever seni bekliyor. Hemen üye ol ve futbol maceran başlasın!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <button 
                onClick={handleGetStarted}
                className="group relative px-12 py-4 bg-white text-green-700 font-bold text-lg rounded-full shadow-2xl hover:shadow-white/25 transform hover:scale-105 transition-all duration-300 cursor-pointer"
              >
                <span className="relative z-10">
                  {isAuthenticated ? "Maçlara Katıl" : "Ücretsiz Üye Ol"}
                </span>
                <svg className="inline-block w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
              
              <div className="text-green-200 text-sm">
                <span className="block">✓ Ücretsiz kayıt</span>
                <span className="block">✓ Anında maç bulma</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Add custom CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(1deg); }
          66% { transform: translateY(5px) rotate(-1deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default HomePage;