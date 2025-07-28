import { useNavigate } from "react-router-dom";

function MatchesFeature() {
  const navigate = useNavigate();

  const handleExploreMatches = () => {
    navigate("/matches");
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-100">
      <div className="flex items-center mb-4">
        <div className="bg-green-100 p-3 rounded-full mr-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 1-4 4-4s4 2 4 4c2-1 2.657-2.657 2.657-2.657A8 8 0 0117.657 18.657z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900">Maçlar</h3>
      </div>
      
      <p className="text-gray-600 mb-6 text-sm leading-relaxed">
        Çevrendeki futbol maçlarını keşfet, arkadaşlarınla takım kur veya mevcut maçlara katıl. 
        Her seviyeden oyuncuyla tanış ve futbol tutkunla oyun oyna.
      </p>

      <div className="space-y-3 mb-6">
        <div className="flex items-center text-sm text-gray-700">
          <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Yakınındaki aktif maçları gör
        </div>
        <div className="flex items-center text-sm text-gray-700">
          <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Kendi maç ilanını oluştur
        </div>
        <div className="flex items-center text-sm text-gray-700">
          <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Oyuncu profillerini incele
        </div>
      </div>

      <button
        onClick={handleExploreMatches}
        className="w-full bg-green-600 text-white py-3 px-4 rounded-md font-medium hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
        tabIndex="0"
      >
        Maçları Keşfet
      </button>
    </div>
  );
}

export default MatchesFeature; 