import { useNavigate } from "react-router-dom";

function ReservationFeature() {
  const navigate = useNavigate();

  const handleExploreReservation = () => {
    navigate("/reservation");
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-100">
      <div className="flex items-center mb-4">
        <div className="bg-blue-100 p-3 rounded-full mr-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900">Rezervasyon</h3>
      </div>
      
      <p className="text-gray-600 mb-6 text-sm leading-relaxed">
        Kaliteli halı sahalar ve futbol tesislerini kolayca kirala. Uygun fiyatlarla, 
        istediğin zaman ve yerde sahayı rezerve et, arkadaşlarınla keyifli maçlar oyna.
      </p>

      <div className="space-y-3 mb-6">
        <div className="flex items-center text-sm text-gray-700">
          <svg className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Şehrindeği tüm sahaları gör
        </div>
        <div className="flex items-center text-sm text-gray-700">
          <svg className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Online ödeme ve rezervasyon
        </div>
        <div className="flex items-center text-sm text-gray-700">
          <svg className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Esnek iptal politikası
        </div>
      </div>

      <button
        onClick={handleExploreReservation}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        tabIndex="0"
      >
        Saha Rezerve Et
      </button>
    </div>
  );
}

export default ReservationFeature; 