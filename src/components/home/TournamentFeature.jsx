import { useNavigate } from "react-router-dom";

function TournamentFeature() {
  const navigate = useNavigate();

  const handleExploreTournament = () => {
    navigate("/tournaments");
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-100">
      <div className="flex items-center mb-4">
        <div className="bg-purple-100 p-3 rounded-full mr-4">
          <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900">Turnuva ve Ligler</h3>
      </div>
      
      <p className="text-gray-600 mb-6 text-sm leading-relaxed">
        Rekabetçi ortamda oyna! Düzenli turnuvalara katıl, lig maçlarında takımını temsil et. 
        Şampiyonluklar kazan, ödüller kazan ve futbol kariyerinde yeni bir sayfa aç.
      </p>

      <div className="space-y-3 mb-6">
        <div className="flex items-center text-sm text-gray-700">
          <svg className="w-4 h-4 text-purple-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Haftalık ve aylık turnuvalar
        </div>
        <div className="flex items-center text-sm text-gray-700">
          <svg className="w-4 h-4 text-purple-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Lig tabloları ve sıralamalar
        </div>
        <div className="flex items-center text-sm text-gray-700">
          <svg className="w-4 h-4 text-purple-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Ödüller ve madalyalar
        </div>
      </div>

      <button
        onClick={handleExploreTournament}
        className="w-full bg-purple-600 text-white py-3 px-4 rounded-md font-medium hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
        tabIndex="0"
      >
        Turnuvalara Katıl
      </button>
    </div>
  );
}

export default TournamentFeature; 