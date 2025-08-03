import Header from "../components/shared/Header";
import Footer from "../components/shared/Footer";
import MatchesFeature from "../components/home/MatchesFeature";
import ReservationFeature from "../components/home/ReservationFeature";
import TournamentFeature from "../components/home/TournamentFeature";

function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section 
        className="relative text-white py-20 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')`
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
                         <h1 className="text-4xl md:text-6xl font-bold mb-6">
               Futbol Tutkun
               <span className="text-green-200"> Burada Başlıyor</span>
             </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-green-100">
              Arkadaşlarını bul, maç organize et, saha kirala. 
              Türkiye'nin en büyük futbol topluluğuna katıl!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-green-700 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-green-50 transition-colors cursor-pointer">
                Hemen Başla
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-green-700 transition-colors cursor-pointer">
                Nasıl Çalışır?
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Futbol Dünyanda Her Şey
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              SporPlanet ile futbol tutkunu ile ilgili tüm ihtiyaçlarını karşılayabilirsin. 
              Maç bulma'dan saha kiralamaya, turnuvalara kadar!
            </p>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <MatchesFeature />
            <ReservationFeature />
            <TournamentFeature />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-green-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">25K+</div>
              <div className="text-green-200">Aktif Oyuncu</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">5K+</div>
              <div className="text-green-200">Günlük Maçlar</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">1K+</div>
              <div className="text-green-200">Futbol Sahası</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">100+</div>
              <div className="text-green-200">Turnuva</div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Hazır mısın?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Binlerce futbol sever seni bekliyor. Hemen üye ol ve futbol maceran başlasın!
          </p>
          <button className="bg-green-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors cursor-pointer">
            Ücretsiz Üye Ol
          </button>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default HomePage; 