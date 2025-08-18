import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

function MyListings({ user }) {
  const [activeSection, setActiveSection] = useState("myAdverts"); // myAdverts, joinedAdverts, waitingRequests
  const [allAdverts, setAllAdverts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 18;
  const { user: authUser } = useAuth();

  // Fetch user adverts from backend
  useEffect(() => {
    const fetchUserAdverts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Mock data for development - replace with actual API call
        const mockResponse = await fetch('/advert.for.profil.json');
        if (!mockResponse.ok) {
          throw new Error('Failed to fetch user adverts');
        }
        
        const mockData = await mockResponse.json();
        setAllAdverts(mockData.adverts || []);
        setCurrentUser(mockData.user || null);

        // TODO: Replace with actual backend API call
        // const response = await fetch(`/api/v1/user/${authUser?._id}/adverts`, {
        //   method: 'GET',
        //   credentials: 'include',
        //   headers: {
        //     'Content-Type': 'application/json',
        //   }
        // });
        
        // if (!response.ok) {
        //   throw new Error('Failed to fetch user adverts');
        // }
        
        // const data = await response.json();
        // setAdverts(data.adverts || []);

      } catch (err) {
        console.error('Error fetching user adverts:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAdverts();
  }, [authUser]);

  // Helper function to get status label and color
  const getAdvertStatus = (advert) => {
    const now = new Date();
    const startDate = new Date(advert.startsAt);
    
    if (advert.isDeleted || advert.archived) {
      return { label: 'Silindi', color: 'bg-red-500 text-white', status: 'deleted' };
    }
    
    if (advert.status === 'cancelled') {
      return { label: 'İptal Edildi', color: 'bg-orange-500 text-white', status: 'cancelled' };
    }
    
    if (advert.status === 'full') {
      return { label: 'Dolu', color: 'bg-blue-500 text-white', status: 'full' };
    }
    
    if (startDate < now) {
      return { label: 'Tamamlandı', color: 'bg-gray-500 text-white', status: 'completed' };
    }
    
    if (advert.status === 'open') {
      return { label: 'Açık', color: 'bg-green-500 text-white', status: 'open' };
    }
    
    return { label: 'Bilinmeyen', color: 'bg-gray-400 text-white', status: 'unknown' };
  };



  // Helper function to get pitch name
  const getPitchName = (advert) => {
    if (advert.customPitch) {
      return advert.customPitch.name;
    }
    return 'Saha Bilgisi Yok'; // In real app, you'd fetch pitch details by ID
  };

  // Helper function to get address
  const getAddress = (advert) => {
    if (advert.address) {
      return `${advert.address.district}, ${advert.address.city}`;
    }
    return 'Adres Bilgisi Yok';
  };

  // Helper function to check if it's a rivalry match
  const isRivalryMatch = (advert) => {
    return advert.isRivalry && advert.isRivalry.status;
  };

  // Helper function to get adverts by section
  const getAdvertsBySection = () => {
    if (!currentUser || !allAdverts.length) return [];
    
    const userId = currentUser._id;
    
    switch (activeSection) {
      case "myAdverts":
        // İlanlarım - createdBy ID'si eşleşenler
        return allAdverts.filter(advert => advert.createdBy === userId);
      
      case "joinedAdverts":
        // Katıldığım İlanlar - participants içinde olanlar (ama kendi oluşturmadıkları)
        return allAdverts.filter(advert => {
          const isParticipant = advert.participants && 
            advert.participants.some(participant => participant.user === userId);
          const isNotCreator = advert.createdBy !== userId;
          return isParticipant && isNotCreator;
        });
      
      case "waitingRequests":
        // Bekleyenler ve İstekler - waitingList'te olanlar
        return allAdverts.filter(advert => {
          return advert.waitingList && 
            advert.waitingList.some(waiting => waiting.user === userId);
        });
      
      default:
        return [];
    }
  };

  // Get adverts for current section
  const sectionAdverts = getAdvertsBySection();

  // Calculate pagination
  const totalPages = Math.ceil(sectionAdverts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAdverts = sectionAdverts.slice(startIndex, endIndex);

  // Reset pagination when section changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeSection]);



  // Calculate counts for all sections
  const sectionCounts = {
    myAdverts: allAdverts.filter(advert => advert.createdBy === currentUser?._id).length,
    joinedAdverts: allAdverts.filter(advert => {
      const isParticipant = advert.participants && 
        advert.participants.some(participant => participant.user === currentUser?._id);
      const isNotCreator = advert.createdBy !== currentUser?._id;
      return isParticipant && isNotCreator;
    }).length,
    waitingRequests: allAdverts.filter(advert => {
      return advert.waitingList && 
        advert.waitingList.some(waiting => waiting.user === currentUser?._id);
    }).length
  };

  // Handle navigation to advert detail
  const handleViewDetails = (advertId) => {
    window.scrollTo(0, 0);
    window.location.href = `/advert-detail/${advertId}`;
  };

  // Loading state
  if (loading) {
  return (
    <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
          </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Veriler Yüklenemedi
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }



  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
        İlanlarım
      </h1>

      {/* Section Navigation */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <button
          onClick={() => {
            setActiveSection("myAdverts");
            setCurrentPage(1);
          }}
          className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
            activeSection === "myAdverts"
              ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg transform scale-105"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          İlanlarım
          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-bold ${
            activeSection === "myAdverts"
              ? "bg-white text-green-600"
              : "bg-green-500 text-white"
          }`}>
            {sectionCounts.myAdverts}
          </span>
        </button>
        
        <button
          onClick={() => {
            setActiveSection("joinedAdverts");
            setCurrentPage(1);
          }}
          className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
            activeSection === "joinedAdverts"
              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Katıldığım İlanlar
          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-bold ${
            activeSection === "joinedAdverts"
              ? "bg-white text-blue-600"
              : "bg-blue-500 text-white"
          }`}>
            {sectionCounts.joinedAdverts}
          </span>
        </button>
        
        <button
          onClick={() => {
            setActiveSection("waitingRequests");
            setCurrentPage(1);
          }}
          className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
            activeSection === "waitingRequests"
              ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg transform scale-105"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Bekleyenler ve İstekler
          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-bold ${
            activeSection === "waitingRequests"
              ? "bg-white text-orange-600"
              : "bg-orange-500 text-white"
          }`}>
            {sectionCounts.waitingRequests}
          </span>
        </button>
      </div>

      



      {/* Advert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {paginatedAdverts.map((advert, index) => {
          const status = getAdvertStatus(advert);
          const totalParticipants = advert.participants?.length || 0;
          const totalNeeded = (advert.playersNeeded || 0) + (advert.goalKeepersNeeded || 0);
          
          // Get waiting request status for waitingRequests section
          const waitingInfo = activeSection === "waitingRequests" && advert.waitingList 
            ? advert.waitingList.find(waiting => waiting.user === currentUser?._id)
            : null;
          
          // Determine background image based on advert type
          const isRivalryTeam = isRivalryMatch(advert);
          const backgroundImage = isRivalryTeam 
            ? 'linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), url(https://res.cloudinary.com/dyepiphy8/image/upload/v1755089552/ChatGPT_Image_Aug_13_2025_03_32_46_PM_o6yrq8.png)'
            : 'linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), url(https://res.cloudinary.com/dyepiphy8/image/upload/v1755090617/20250813_1607_Anonim_Futbolcunun_Pozu_simple_compose_01k2hrk1akf9b89nqc967haa0x_pan6au.png)';

          return (
            <div
              key={index}
              className={`rounded-xl p-6 hover:shadow-lg transition-all duration-300 border-2 bg-cover bg-center bg-no-repeat h-[480px] flex flex-col ${
                activeSection === "waitingRequests" 
                  ? "border-orange-200 hover:border-orange-300"
                  : activeSection === "joinedAdverts"
                  ? "border-blue-200 hover:border-blue-300"
                  : "border-gray-200 hover:border-green-300"
              }`}
              style={{
                backgroundImage: backgroundImage
              }}
            >
              {/* Header with status */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 truncate mb-1">
                    {advert.name}
              </h3>
                  
                  {/* Waiting status for waitingRequests section */}
                  {activeSection === "waitingRequests" && waitingInfo && (
                    <div className="flex items-center text-orange-600 text-sm mb-2">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <span>
                        {waitingInfo.seen ? "İstek Görüldü" : "İstek Bekliyor"}
                        {waitingInfo.requestedAt && (
                          <span className="ml-1 text-gray-500">
                            - {new Date(waitingInfo.requestedAt).toLocaleDateString('tr-TR')}
                          </span>
                        )}
              </span>
            </div>
                  )}
                  
                  {/* Joined status for joinedAdverts section */}
                  {activeSection === "joinedAdverts" && (
                    <div className="flex items-center text-blue-600 text-sm mb-2">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Katılım Onaylandı</span>
                    </div>
                  )}
                  
                  {isRivalryMatch(advert) && (
                    <div className="flex items-center text-red-600 text-sm mb-2">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                </svg>
                      <span>Rakip Takım Maçı</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${status.color}`}>
                    {status.label}
                  </span>
                  {activeSection === "waitingRequests" && waitingInfo && (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      waitingInfo.seen 
                        ? "bg-green-100 text-green-700" 
                        : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {waitingInfo.seen ? "Görüldü" : "Bekliyor"}
                    </span>
                  )}
                </div>
              </div>

              {/* Match Details */}
              <div className="space-y-3 mb-4 flex-1">
                <div className="flex items-center text-gray-600 text-sm">
                  <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-1 4h6m-6 0V9a1 1 0 00-1-1H9a1 1 0 00-1 1v2m0 0H2m6 0h8m-8 0v6a1 1 0 001 1h6a1 1 0 001-1v-6" />
                  </svg>
                  <span className="truncate">{new Date(advert.startsAt).toLocaleDateString('tr-TR')}</span>
                </div>
                
                <div className="flex items-center text-gray-600 text-sm">
                  <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="truncate">{new Date(advert.startsAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                
                <div className="flex items-center text-gray-600 text-sm">
                  <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="truncate">{getPitchName(advert)}</span>
                </div>
                
                <div className="flex items-center text-gray-600 text-sm">
                  <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="truncate">{getAddress(advert)}</span>
                </div>

                <div className="flex items-center text-gray-600 text-sm">
                  <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                  <span>{totalParticipants}/{totalNeeded} oyuncu</span>
              </div>

                {/* Level badge */}
                <div className="flex items-center text-gray-600 text-sm">
                  <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                  <span className="capitalize">
                    {advert.level === 'beginner' && 'Başlangıç'}
                    {advert.level === 'intermediate' && 'Orta'}
                    {advert.level === 'advanced' && 'İleri'}
                    {advert.level === 'pro' && 'Profesyonel'}
                    {advert.level === 'professional' && 'Profesyonel'}
                    {!['beginner', 'intermediate', 'advanced', 'pro', 'professional'].includes(advert.level) && advert.level}
                </span>
              </div>

                {/* Progress bar for participants - only for non-rivalry matches */}
                {!isRivalryTeam && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Katılımcılar</span>
                      <span>{totalParticipants}/{totalNeeded}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          totalParticipants >= totalNeeded ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min((totalParticipants / totalNeeded) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {advert.notes && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-xs text-gray-700 line-clamp-2">
                      <span className="font-medium">Not: </span>
                      {advert.notes}
                    </p>
                  </div>
                )}
            </div>

              {/* Action Button */}
              <div className="flex justify-end mt-auto">
              <button
                  onClick={() => handleViewDetails(advert._id || `temp-${index}`)}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                tabIndex="0"
              >
                  Detayları Görüntüle
              </button>
            </div>
          </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-8">
          {/* Previous Button */}
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentPage === 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Page Numbers */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => setCurrentPage(pageNum)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentPage === pageNum
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {pageNum}
            </button>
          ))}

          {/* Next Button */}
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentPage === totalPages
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {/* Page Info */}
      {sectionAdverts.length > 0 && (
        <div className="text-center text-gray-600 text-sm mt-4">
          Gösterilen: {startIndex + 1}-{Math.min(endIndex, sectionAdverts.length)} / {sectionAdverts.length} ilan
        </div>
      )}

      {/* Empty State */}
      {sectionAdverts.length === 0 && (
        <div className="text-center py-16">
          <div className="text-gray-400 mb-6">
            {activeSection === "myAdverts" && (
              <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            )}
            {activeSection === "joinedAdverts" && (
              <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            )}
            {activeSection === "waitingRequests" && (
              <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            )}
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            {activeSection === "myAdverts" && "Henüz İlan Yok"}
            {activeSection === "joinedAdverts" && "Henüz Katıldığınız İlan Yok"}
            {activeSection === "waitingRequests" && "Bekleyen İsteğiniz Yok"}
          </h3>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            {activeSection === "myAdverts" && 
              "Henüz hiç maç ilanı oluşturmamışsınız. İlk ilanınızı oluşturmak için maç ilanları sayfasını ziyaret edin."
            }
            {activeSection === "joinedAdverts" && 
              "Henüz hiçbir maç ilanına katılmamışsınız. Mevcut ilanları incelemek için maç ilanları sayfasını ziyaret edin."
            }
            {activeSection === "waitingRequests" && 
              "Henüz hiçbir maç ilanında bekleme listesinde değilsiniz. Dolu olan maçlara katılım isteği gönderebilirsiniz."
            }
          </p>
          {(activeSection === "myAdverts" || activeSection === "joinedAdverts") && (
            <button
              onClick={() => {
                window.scrollTo(0, 0);
                window.location.href = '/matches';
              }}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
            >
              {activeSection === "myAdverts" ? "İlan Oluştur" : "İlanları İncele"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default MyListings;
