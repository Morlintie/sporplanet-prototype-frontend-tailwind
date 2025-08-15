import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function AdvertInfo({ advert, onAdvertUpdate }) {
  const [showAllParticipants, setShowAllParticipants] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const endDate = new Date(date.getTime() + 60 * 60 * 1000); // 1 saat sonrası
    
    const dateStr = date.toLocaleDateString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const startTime = date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const endTime = endDate.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return `${dateStr} ${startTime}-${endTime}`;
  };

  const handleJoinAdvert = async (e) => {
    e.preventDefault(); // Prevent any default form behavior
    e.stopPropagation(); // Stop event bubbling
    
    if (isJoining) return;
    
    // Store current scroll position
    const currentScrollY = window.scrollY;
    
    try {
      setIsJoining(true);
      
      const response = await fetch(`/api/v1/advert/${advert._id}/join`, {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('İlana katılım başarısız oldu');
      }

      const result = await response.json();
      
      // Update the advert data with the new participant information
      if (result.success && result.advert) {
        // Call parent component to update advert data
        if (onAdvertUpdate) {
          onAdvertUpdate(result.advert);
        } else {
          // Fallback: reload page if callback not available
          window.location.reload();
        }
        
        // Restore scroll position after update
        setTimeout(() => {
          window.scrollTo(0, currentScrollY);
        }, 100);
      }
    } catch (err) {
      console.error('Error joining advert:', err);
      alert('İlana katılırken bir hata oluştu: ' + err.message);
      
      // Restore scroll position on error too
      setTimeout(() => {
        window.scrollTo(0, currentScrollY);
      }, 100);
    } finally {
      setIsJoining(false);
    }
  };

  // Check if current user is already a participant
  const isCurrentUserParticipant = user && advert.participants && Array.isArray(advert.participants) && 
    advert.participants.some(participant => participant.user && participant.user._id === user._id);

  // Check if current user is the creator
  const isCurrentUserCreator = user && advert.createdBy && advert.createdBy._id === user._id;

  const isParticipant = isCurrentUserParticipant;
  const isCreator = isCurrentUserCreator;



  const safeParticipants = advert.participants && Array.isArray(advert.participants) ? advert.participants : [];
  
  const participantsToShow = showAllParticipants 
    ? safeParticipants 
    : safeParticipants.slice(0, 6);

  const remainingCount = safeParticipants.length - 6;

  return (
    <div className="h-full flex flex-col">
      {/* Header - Sticky - Compact Design */}
      <div className="text-white py-3 px-4 sticky top-0 z-10 shadow-lg" style={{backgroundImage: "linear-gradient(135deg, #065f46, #10b981)"}}>
        <div className="flex items-center justify-between">
          <div className="text-left">
            {/* Match Name */}
            <h1 className="text-lg font-bold leading-tight mb-1">
              {advert.name}
            </h1>
          </div>
          
          {/* Status Badge - Right Side */}
          <div className="flex items-center space-x-1">
            <div className={`w-1.5 h-1.5 rounded-full ${
              advert.status === 'active' ? 'bg-green-300' :
              advert.status === 'full' ? 'bg-yellow-300' : 'bg-red-300'
            }`}></div>
            <span className="text-xs opacity-90 capitalize">
              {advert.status === 'active' ? 'Aktif' :
               advert.status === 'full' ? 'Dolu' : 'İptal'}
            </span>
          </div>
        </div>
      </div>

      {/* Maç Detayları - Compact Design */}
      <div className="bg-white px-4 py-3  sticky top-[56px] z-10 shadow-sm">
        <div className="max-w-lg mx-auto">
          {/* Date, Time & Venue in one box */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Date & Time */}
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500">Tarih & Saat</p>
                  <p className="text-sm font-semibold text-gray-900">{formatDate(advert.startsAt)}</p>
                </div>
              </div>

              {/* Venue */}
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500">Saha</p>
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {advert.pitch?.name || advert.customPitch?.name || 'Halısaha Belirtilmemiş'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* İlan Veren Bilgisi - Compact */}
        <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">İlan Veren</span>
            {isCreator && (
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                Siz
              </span>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img 
                src={advert.createdBy?.profilePicture || 'https://via.placeholder.com/48'} 
                alt={advert.createdBy?.name || 'Kullanıcı'}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-100"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
            </div>
            <div className="flex-1">
              <button 
                onClick={() => {
                  if (advert.createdBy?._id) {
                    window.scrollTo(0, 0);
                    navigate(`/profile?userId=${advert.createdBy._id}`);
                  }
                }}
                className="font-medium text-gray-900 hover:text-green-600 text-sm transition-colors cursor-pointer text-left"
              >
                {advert.createdBy?.name || 'İsimsiz Kullanıcı'}
              </button>
            </div>
          </div>
        </div>

        {/* Maç Türüne Göre Display */}
        {advert.isRivalry?.status ? (
          // Rakip Takım İlanları - Compact XvsX
          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
            <div className="text-center">
              <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full mb-3 inline-block">
                Rakip Takım Maçı
              </span>
              
              <div className="bg-gradient-to-r from-red-50 to-blue-50 rounded-lg p-4 mb-3">
                <div className="flex items-center justify-center space-x-4">
                  <div className="text-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mb-1">
                      <span className="text-white font-bold text-sm">
                        {Math.ceil(((advert.playersNeeded || 0) + (advert.goalKeepersNeeded || 0)) / 2)}
                      </span>
                    </div>

                  </div>
                  

                  
                  <div className="text-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-1">
                      <span className="text-white font-bold text-sm">
                        {Math.ceil(((advert.playersNeeded || 0) + (advert.goalKeepersNeeded || 0)) / 2)}
                      </span>
                    </div>

                  </div>
                </div>
              </div>
              

            </div>
          </div>
        ) : (advert.playersNeeded && advert.playersNeeded > 0) ? (
          // Oyuncu İlanları - Compact Progress Bar
          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Oyuncu Durumu</span>
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                  {safeParticipants.length}/{(advert.playersNeeded || 0) + (advert.goalKeepersNeeded || 0)}
                </span>
              </div>
              
              <div className="relative">
                <div className="w-full bg-gray-200 rounded-lg h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-lg transition-all duration-300" 
                    style={{
                      width: `${Math.min(100, (safeParticipants.length / ((advert.playersNeeded || 0) + (advert.goalKeepersNeeded || 0))) * 100)}%`
                    }}
                  ></div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-green-50 rounded-md p-2 text-center">
                  <p className="text-lg font-bold text-green-600">{safeParticipants.length}</p>
                  <p className="text-xs text-green-700">Katılan</p>
                </div>
                <div className="bg-orange-50 rounded-md p-2 text-center">
                  <p className="text-lg font-bold text-orange-600">
                    {Math.max(0, (advert.playersNeeded || 0) + (advert.goalKeepersNeeded || 0) - safeParticipants.length)}
                  </p>
                  <p className="text-xs text-orange-700">Kalan</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Normal Takım Maçları - Compact X vs X
          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-3 mb-2">
                <div className="text-center">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs mb-1">
                    {Math.ceil(safeParticipants.length / 2)}
                  </div>
                </div>
                <div className="text-sm font-bold text-gray-700">VS</div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-xs mb-1">
                    {Math.floor(safeParticipants.length / 2)}
                  </div>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-800">
                {safeParticipants.length} oyuncu
              </p>
            </div>
          </div>
        )}

        {/* Katılımcılar - Compact Accordion */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div 
            className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition-colors" 
            onClick={() => setShowAllParticipants(!showAllParticipants)}
          >
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">
                Katılımcılar ({safeParticipants.length})
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
                {safeParticipants.length}
              </span>
              <svg 
                className={`w-4 h-4 text-gray-600 transition-transform duration-300 ${showAllParticipants ? 'rotate-180' : ''}`} 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          
          <div className={`transition-all duration-300 ease-in-out overflow-hidden ${showAllParticipants ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="overflow-y-auto max-h-[350px]">
            <div className="p-3 pt-0">
              {safeParticipants.length > 0 ? (
                <div className="space-y-2">
                  {participantsToShow.map((participant, index) => {
                    const user = participant.user || {};
                    return (
                      <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <img 
                              src={user.profilePicture || 'https://via.placeholder.com/40'} 
                              alt={user.name || 'Kullanıcı'}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            {user.goalKeeper && (
                              <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <a 
                                href={`/profile/${user._id}`} 
                                className="font-medium text-blue-600 hover:text-blue-800 text-sm truncate cursor-pointer hover:underline"
                              >
                                {user.name || 'İsimsiz Kullanıcı'}
                              </a>
                              {user.goalKeeper && (
                                <span className="bg-green-100 text-green-800 text-xs font-medium px-1.5 py-0.5 rounded">
                                  K
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-xs text-gray-500">
                              {participant.joinedAt ? new Date(participant.joinedAt).toLocaleDateString('tr-TR') : '-'}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                  </svg>
                  <p className="text-gray-600">Henüz katılımcı yok</p>
                  <p className="text-xs text-gray-500 mt-1">İlk katılan kişi siz olun!</p>
                </div>
              )}
            </div>
            </div>
          </div>
        </div>

      </div>

      {/* Join Button - Sticky Bottom */}
      <div 
        className="sticky bottom-0 bg-white p-4  shadow-lg z-10" 
        style={{ scrollMarginBottom: '0px' }}
        onFocus={(e) => e.preventDefault()}
      >
        {isCreator ? (
          <div className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-4 px-6 rounded-xl text-center shadow-lg">
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              <span>Bu sizin ilanınız</span>
            </div>
          </div>
        ) : isParticipant ? (
          <div className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-4 px-6 rounded-xl text-center shadow-lg">
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Maça Katıldınız</span>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleJoinAdvert}
            disabled={isJoining}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center space-x-3"
          >
            {isJoining ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                <span className="text-lg">Katılıyor...</span>
              </>
            ) : (
              <>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                <span className="text-lg">Maça Katıl</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export default AdvertInfo;

