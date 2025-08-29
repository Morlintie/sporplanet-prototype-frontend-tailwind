import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

function Invitations({ user }) {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState("requests"); // incoming, requests - başlangıçta katılma istekleri göster
  const [activeFilter, setActiveFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 18;
  const { user: authUser } = useAuth();

  // Fetch invitations from backend
  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        setLoading(true);
        setError(null);

        // Mock data for development - replace with actual API call
        const mockResponse = await fetch('/invitations.json');
        if (!mockResponse.ok) {
          throw new Error('Failed to fetch invitations');
        }
        
        const allInvitations = await mockResponse.json();
        
        // DEV MODE: Show all reservations as invitations for development/testing
        // Convert reservation data to invitation format
        const pitchNames = [
          "Olimpia Spor Kompleksi", "Fenerbahçe Futbol Sahası", "Galatasaray Akademi", 
          "Beşiktaş Spor Merkezi", "Kadıköy City Futbol", "Şişli Premium Saha",
          "Kartal Sport Center", "Maltepe Futbol Kulübü", "Ataşehir Arena",
          "Üsküdar Spor Tesisi", "Beyoğlu Football Club", "Fatih Halı Saha"
        ];
        
        const locations = [
          "Kadıköy, İstanbul", "Beşiktaş, İstanbul", "Şişli, İstanbul", 
          "Kartal, İstanbul", "Maltepe, İstanbul", "Ataşehir, İstanbul",
          "Üsküdar, İstanbul", "Beyoğlu, İstanbul", "Fatih, İstanbul"
        ];

        // Son 15 tanesini katılma isteği (DEV_USER_12345), geri kalanını gelen davet yap
        const userInvitations = allInvitations.map((reservation, index) => {
          // Son 15 eleman katılma isteği (bookedBy: DEV_USER_12345), geri kalanı gelen davet
          const isIncomingInvitation = reservation.bookedBy !== "DEV_USER_12345";
          
          return {
            _id: `inv_${index + 1}`,
            advert: reservation.pitch,
            sender: reservation.bookedBy,
            recipient: "DEV_USER_12345", // All go to dev user
            role: Math.random() > 0.8 ? "goalkeeper" : "player",
            message: reservation.notes || `${reservation.totalPlayers} kişilik maça katıl! Saha ücreti kişi başı ${Math.round(reservation.price.total / reservation.totalPlayers)} TL.`,
            
            // Davet türü ve durumu
            type: isIncomingInvitation ? "incoming" : "request", // incoming = gelen davet, request = katılma isteği
            status: isIncomingInvitation 
              ? (Math.random() > 0.7 ? "pending" : Math.random() > 0.5 ? "accepted" : "declined")
              : (reservation.status === "pending" ? "pending" : 
                 reservation.status === "confirmed" ? "accepted" : 
                 reservation.status === "completed" ? "accepted" : 
                 reservation.status === "cancelled" ? "declined" : "pending"),
            
            seen: Math.random() > 0.5,
            createdAt: reservation.start,
            respondedAt: reservation.price.paidAt || null,
            
            // Additional fields for display
            pitchName: pitchNames[index % pitchNames.length],
            location: locations[index % locations.length],
            totalPlayers: reservation.totalPlayers,
            pricePerPerson: Math.round(reservation.price.total / reservation.totalPlayers),
            currency: reservation.price.currency,
            startTime: reservation.start
          };
        });
        
                // Sort by start time (newest first)
        const sortedInvitations = userInvitations.sort((a, b) => 
          new Date(b.startTime) - new Date(a.startTime)
        );

        setInvitations(sortedInvitations);

        // TODO: Replace with actual backend API call
        // const response = await fetch(`/api/v1/invitations/user/${authUser?._id}`, {
        //   method: 'GET',
        //   credentials: 'include',
        //   headers: {
        //     'Content-Type': 'application/json',
        //   }
        // });
        
        // if (!response.ok) {
        //   throw new Error('Failed to fetch invitations');
        // }
        
        // const data = await response.json();
        // setInvitations(data.invitations || []);

      } catch (err) {
        console.error('Error fetching invitations:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (authUser?._id) {
      fetchInvitations();
    }
  }, [authUser]);

  // Helper function to get sender name (mock data)
  const getSenderName = (senderId) => {
    // Mock user names - in real app, you'd fetch from user service
    const mockUsers = {
      "683478f0b024a2d8571443a6": "Mehmet Kaya",
      "6834791eb024a2d8571443aa": "Ali Yılmaz", 
      "68347987b024a2d8571443b2": "Ahmet Demir",
      "6834844b99d801bea2941af4": "Emre Özkan",
      "683484fe99d801bea2941afe": "Murat Çelik",
      "6834855899d801bea2941b03": "Serkan Aydın",
      "68348a184b03bb982551fcd9": "Burak Yıldız",
      "6841e3c7222bba20673cc335": "Kemal Arslan",
      "6841e708222bba20673cc337": "Fatih Kara",
      "6841e844222bba20673cc339": "Oğuz Şen",
      "6841eb43222bba20673cc33b": "Tolga Erdem",
      "6841ec99222bba20673cc33f": "Can Özgür",
      "68430876038f4a6a09967d67": "Deniz Aktaş",
      "6846df07e810518fb9e60c72": "Hakan Polat",
      "6846f236f95a3b7499dfd98b": "Barış Koç",
      "686e61f70d43f60e09a66ebe": "Cem Tunç",
      "687243c690c09520e98cafd2": "Volkan Güneş",
      "68777bee3c1f5c1e3fa38001": "Erkan Demir",
      "DEV_USER_12345": "Sen (Dev User)" // Katılma istekleri için
    };
    return mockUsers[senderId] || "Bilinmeyen Kullanıcı";
  };

  // Handle accept invitation
  const handleAccept = async (invitationId) => {
    try {
      // Update local state immediately
      setInvitations(invitations.map(inv => 
        inv._id === invitationId ? { ...inv, status: "accepted", respondedAt: new Date().toISOString() } : inv
      ));

      // TODO: API call to accept invitation
      // const response = await fetch(`/api/v1/invitations/${invitationId}/accept`, {
      //   method: 'PUT',
      //   credentials: 'include',
      //   headers: { 'Content-Type': 'application/json' }
      // });
      
    } catch (err) {
      console.error('Error accepting invitation:', err);
      // Revert on error
    setInvitations(invitations.map(inv => 
        inv._id === invitationId ? { ...inv, status: "pending" } : inv
      ));
    }
  };

  // Handle decline invitation
  const handleDecline = async (invitationId) => {
    try {
      // Update local state immediately
      setInvitations(invitations.map(inv => 
        inv._id === invitationId ? { ...inv, status: "declined", respondedAt: new Date().toISOString() } : inv
      ));

      // TODO: API call to decline invitation
      // const response = await fetch(`/api/v1/invitations/${invitationId}/decline`, {
      //   method: 'PUT',
      //   credentials: 'include',
      //   headers: { 'Content-Type': 'application/json' }
      // });
      
    } catch (err) {
      console.error('Error declining invitation:', err);
      // Revert on error
    setInvitations(invitations.map(inv => 
        inv._id === invitationId ? { ...inv, status: "pending" } : inv
      ));
    }
  };

  // Filter invitations based on section and status
  const filteredInvitations = invitations.filter((invitation) => {
    // Önce bölüme göre filtrele (Gelen Davetler vs Katılma İstekleri)
    if (invitation.type !== activeSection) return false;
    
    // Sonra status'e göre filtrele
    if (activeFilter === "all") return true;
    return invitation.status === activeFilter;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredInvitations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedInvitations = filteredInvitations.slice(startIndex, endIndex);

  // Reset pagination when filter or section changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, activeSection]);


  // Get role display text
  const getRoleText = (role) => {
    switch (role) {
      case "player":
        return "Oyuncu";
      case "goalkeeper":
        return "Kaleci";
      default:
        return role || "Oyuncu";
    }
  };

  // Format date and time
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('tr-TR'),
      time: date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    };
  };

  // Format start time with end time (1 hour later)
  const formatGameTime = (startTime) => {
    const start = new Date(startTime);
    const end = new Date(start.getTime() + 60 * 60 * 1000); // Add 1 hour
    return {
      date: start.toLocaleDateString('tr-TR'),
      time: `${start.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}-${end.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`
    };
  };

  // Calculate statistics for current section
  const currentSectionInvitations = invitations.filter(inv => inv.type === activeSection);
  const stats = {
    total: currentSectionInvitations.length,
    pending: currentSectionInvitations.filter(inv => inv.status === 'pending').length,
    accepted: currentSectionInvitations.filter(inv => inv.status === 'accepted').length,
    declined: currentSectionInvitations.filter(inv => inv.status === 'declined').length,
    expired: currentSectionInvitations.filter(inv => inv.status === 'expired').length,
    cancelled: currentSectionInvitations.filter(inv => inv.status === 'cancelled').length
  };

  // Calculate section counts for navigation
  const sectionCounts = {
    incoming: invitations.filter(inv => inv.type === 'incoming').length,
    requests: invitations.filter(inv => inv.type === 'request').length
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
    <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 md:p-6">
      <h2 className="text-lg sm:text-xl text-center font-bold text-gray-900 mb-2 sm:mb-0">
        Davetlerim
      </h2>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6">
        <div className="text-xs sm:text-sm text-gray-500 flex justify-end">
          Toplam {stats.total} {activeSection === 'incoming' ? 'gelen davet' : 'katılma isteği'}
        </div>
      </div>

      {/* Section Navigation */}
      <div className="flex justify-center gap-3 mb-6">
        <button
          onClick={() => setActiveSection("incoming")}
          className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer ${
            activeSection === "incoming"
              ? "bg-green-600 text-white shadow-md"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span>Gelen Davetler</span>
          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-bold ${
            activeSection === "incoming"
              ? "bg-white text-green-600"
              : "bg-gray-300 text-gray-600"
          }`}>
            {sectionCounts.incoming}
          </span>
        </button>
        
        <button
          onClick={() => setActiveSection("requests")}
          className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer ${
            activeSection === "requests"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
          <span>Katılma İstekleri</span>
          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-bold ${
            activeSection === "requests"
              ? "bg-white text-blue-600"
              : "bg-gray-300 text-gray-600"
          }`}>
            {sectionCounts.requests}
          </span>
        </button>
      </div>

      {/* Loading Display */}
      {loading && invitations.length === 0 && (
        <div className="mb-6 text-center py-8">
          <div className="inline-flex items-center">
            <svg
              className="animate-spin h-5 w-5 text-green-600 mr-2"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span className="text-gray-600">Davetler yükleniyor...</span>
          </div>
        </div>
      )}

      {/* Tabs - MyReservations style */}
      <div className="flex flex-wrap justify-center gap-1 mb-4 sm:mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveFilter("all")}
          className={`flex items-center justify-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap hover:cursor-pointer ${
            activeFilter === "all"
              ? "bg-white text-green-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <span>Tümü</span>
          <span
            className={`px-1.5 sm:px-2 py-0.5 rounded-full text-xs ${
              activeFilter === "all"
                ? "bg-green-100 text-green-600"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {stats.total}
          </span>
        </button>
        <button
          onClick={() => setActiveFilter("pending")}
          className={`flex items-center justify-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap hover:cursor-pointer ${
            activeFilter === "pending"
              ? "bg-white text-green-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <span>Beklemede</span>
          <span
            className={`px-1.5 sm:px-2 py-0.5 rounded-full text-xs ${
              activeFilter === "pending"
                ? "bg-green-100 text-green-600"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {stats.pending}
          </span>
        </button>
        <button
          onClick={() => setActiveFilter("accepted")}
          className={`flex items-center justify-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap hover:cursor-pointer ${
            activeFilter === "accepted"
              ? "bg-white text-green-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <span>Kabul Edildi</span>
          <span
            className={`px-1.5 sm:px-2 py-0.5 rounded-full text-xs ${
              activeFilter === "accepted"
                ? "bg-green-100 text-green-600"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {stats.accepted}
          </span>
        </button>
        <button
          onClick={() => setActiveFilter("declined")}
          className={`flex items-center justify-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap hover:cursor-pointer ${
            activeFilter === "declined"
              ? "bg-white text-green-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <span>Reddedildi</span>
          <span
            className={`px-1.5 sm:px-2 py-0.5 rounded-full text-xs ${
              activeFilter === "declined"
                ? "bg-green-100 text-green-600"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {stats.declined}
          </span>
        </button>
      </div>
      
            {/* Invitations List - MyReservations style */}
      <div className="space-y-3 sm:space-y-4">
        {paginatedInvitations.map((invitation) => {
          
          const gameTime = formatGameTime(invitation.startTime);
          const senderName = getSenderName(invitation.sender);
          
          return (
            <div
              key={invitation._id}
              className="relative border-2 border-gray-200 rounded-lg p-4 sm:p-4 md:p-5 lg:p-6 shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden"
              style={{
                backgroundImage: 'url(/images/mesajlaşma.png)',
                backgroundSize: '100% 100%',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              {/* Very light overlay for readability */}
              <div className="absolute inset-0 bg-white/80 rounded-lg"></div>
              
              {/* Content */}
              <div className="relative z-10">
              <div className="mb-4 sm:mb-3">
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-3 sm:mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-base sm:text-lg">
                      {invitation.pitchName} - {invitation.type === 'incoming' ? 'Gelen Davet' : 'Katılma İsteği'}
                    </h3>
                    <hr className="border-gray-300 mt-1 mb-2" />
                    
                    {/* Saha ve Konum Bilgisi */}
                    <div className="flex flex-col gap-2 mb-3">
                      <div className="flex items-center space-x-2">
                        <svg
                          className="w-3 h-3 sm:w-4 sm:h-4 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                        <span className="text-sm text-gray-600 font-medium">
                          📍 {invitation.location}
                        </span>
                </div>
                      
                      <div className="flex items-center space-x-2">
                        <svg
                          className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        <span className="text-sm text-gray-600 font-medium">
                          👥 {invitation.totalPlayers} Kişilik Oyun
                </span>
              </div>
              
                      <div className="flex items-center space-x-2">
                        <svg
                          className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                          />
                  </svg>
                        <span className="text-sm font-bold text-green-600">
                          💰 {invitation.pricePerPerson} {invitation.currency} / Kişi
                        </span>
                      </div>
                </div>
                    
                    {/* Tarih ve Saat */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 text-sm sm:text-base font-semibold text-gray-700 italic">
                      <div className="flex items-center space-x-1">
                        <svg
                          className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                  </svg>
                        <span>{gameTime.date}</span>
                </div>
                      <div className="flex items-center space-x-1">
                        <svg
                          className="w-3 h-3 sm:w-4 sm:h-4 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                  </svg>
                        <span>{gameTime.time}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col lg:items-end space-y-2 mt-3 lg:mt-0">
                    
                    {invitation.seen && (
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                        ✅ Görüldü
                      </span>
                    )}
                    {invitation.respondedAt && (
                      <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                        📅 Ödendi: {formatDateTime(invitation.respondedAt).date}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Sender/Receiver and Message Info */}
              <div className="mb-3 sm:mb-3 flex flex-col space-y-3 sm:space-y-2">
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span className="font-semibold text-gray-600 text-sm sm:text-base">
                    {invitation.type === 'incoming' ? `Gönderen: ${senderName}` : `İstek Sahibi: ${senderName}`}
                  </span>
                </div>

                {invitation.message && (
                  <div className="mb-3 p-2 sm:mb-3 mx-0 p-3 sm:p-2 bg-blue-50/60 rounded-lg border-l-4 border-blue-400/70">
                    <p className="text-xs sm:text-sm text-blue-700">
                      <span className="font-medium">Mesaj:</span> {invitation.message}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap sm:flex-nowrap gap-2 sm:space-x-2 justify-start sm:justify-end">
                  {/* Gelen Davetler için Onay/Red butonları */}
                  {invitation.type === 'incoming' && invitation.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleAccept(invitation._id)}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 hover:cursor-pointer transition-colors flex-1 sm:flex-none"
                      >
                         Kabul Et
                  </button>
                  <button
                        onClick={() => handleDecline(invitation._id)}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 hover:cursor-pointer transition-colors flex-1 sm:flex-none"
                  >
                         Reddet
                  </button>
                    </>
                  )}
                  
                  
                  
                  {/* Katılma İstekleri için sadece durum gösterimi */}
                  {invitation.type === 'request' && (
                    <div className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg ${
                      invitation.status === 'pending' ? 'text-yellow-700 bg-yellow-100' :
                      invitation.status === 'accepted' ? 'text-green-700 bg-green-100' :
                      invitation.status === 'declined' ? 'text-red-700 bg-red-100' :
                      'text-gray-500 bg-gray-200'
                    }`}>
                      {statusInfo.icon} {statusInfo.text}
                      {invitation.status === 'pending' && <span className="ml-2 text-xs">(Cevap Bekleniyor)</span>}
                    </div>
                  )}
                </div>
              </div>
              </div> {/* Content wrapper end */}
            </div>
          );
        })}
      </div>

      {/* Load More Button - MyReservations style */}
      {totalPages > 1 && paginatedInvitations.length > 0 && currentPage < totalPages && (
        <div className="mt-4 sm:mt-6 text-center">
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={loading}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            style={{
              backgroundColor: "rgb(0, 128, 0)",
              borderRadius: "6px",
            }}
            onMouseEnter={(e) => {
              if (!loading) e.target.style.backgroundColor = "rgb(0, 100, 0)";
            }}
            onMouseLeave={(e) => {
              if (!loading) e.target.style.backgroundColor = "rgb(0, 128, 0)";
            }}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin h-3 w-3 sm:h-4 sm:w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
            </svg>
                Yükleniyor...
              </div>
            ) : (
              `Daha Fazla Göster (${
                filteredInvitations.length - paginatedInvitations.length
              } kaldı)`
            )}
          </button>
          </div>
      )}

      {/* Empty State - MyReservations style */}
      {filteredInvitations.length === 0 && !loading && (
        <div className="text-center py-6 sm:py-8">
          <svg
            className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {activeSection === 'incoming' ? 'Gelen davet' : 'Katılma isteği'} bulunamadı
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            {activeFilter === "all"
              ? (activeSection === 'incoming' 
                  ? "Henüz hiç gelen davet almamışsınız." 
                  : "Henüz hiç katılma isteği göndermemişsiniz.")
              : `${activeFilter === "pending" ? "Bekleyen" : activeFilter === "accepted" ? "Kabul edilen" : activeFilter === "declined" ? "Reddedilen" : "Bu kategoride"} ${activeSection === 'incoming' ? 'gelen davet' : 'katılma isteği'} bulunamadı.`}
          </p>
        </div>
      )}
    </div>
  );
}

export default Invitations; 