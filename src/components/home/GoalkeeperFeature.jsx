import { useNavigate } from "react-router-dom";

function GoalkeeperFeature() {
  const navigate = useNavigate();

  const handleExploreGoalkeeper = () => {
    navigate("/goalkeeper");
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-100">
      <div className="flex items-center mb-4">
        <div className="bg-orange-100 p-3 rounded-full mr-4">
          <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900">Kaleci</h3>
      </div>
      
      <p className="text-gray-600 mb-6 text-sm leading-relaxed">
        Maçın için kaleci mi arıyorsun? Kaleci Pazarımızda deneyimli kalecileri keşfet, 
        ihtiyacın olan pozisyon için uygun kaleci bul veya kaleci olarak kendini tanıt.
      </p>

      <div className="space-y-3 mb-6">
        <div className="flex items-center text-sm text-gray-700">
          <svg className="w-4 h-4 text-orange-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Deneyimli kalecileri keşfet
        </div>
        <div className="flex items-center text-sm text-gray-700">
          <svg className="w-4 h-4 text-orange-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Fiyat ve müsaitlik durumu
        </div>
        <div className="flex items-center text-sm text-gray-700">
          <svg className="w-4 h-4 text-orange-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Kaleci profili oluştur
        </div>
      </div>

      <button
        onClick={handleExploreGoalkeeper}
        className="w-full bg-orange-600 text-white py-3 px-4 rounded-md font-medium hover:bg-orange-700 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
        tabIndex="0"
      >
        Kaleci Bul
      </button>
    </div>
  );
}

export default GoalkeeperFeature; 