import { useState, useEffect } from "react";
import bookingsData from "../../../bookings.previous.mock.v3[1].json";

function MyReservations({ user }) {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // JSON verisini işleyip component state'ine çevir ve mantıklı durumları belirle
    const processedReservations = bookingsData.map(booking => {
      const startDate = new Date(booking.start);
      const now = new Date();
      const timeDiff = startDate.getTime() - now.getTime();
      const hoursDiff = timeDiff / (1000 * 3600);
      
      // Rezervasyon durumunu yeniden belirle
      let finalStatus = booking.status;
      
      // Eğer rezervasyon süresi geçmişse ve tamamlanmamışsa
      if (startDate < now) {
        if (booking.status === 'confirmed') {
          finalStatus = 'completed'; // Onaylanıp süresi geçenler -> Tamamlandı
        } else if (booking.status === 'pending') {
          finalStatus = 'cancelled'; // Onay bekleyen süresi geçenler -> İptal edildi
        }
        // cancelled zaten cancelled kalır
        // completed zaten completed kalır
      }
      
      return {
        id: booking._id,
        pitchName: booking.pitch.name,
        pitchId: booking.pitch._id,
        date: startDate.toLocaleDateString('tr-TR'),
                  time: `${startDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}-${new Date(startDate.getTime() + 1 * 60 * 60 * 1000).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`,
        originalStatus: booking.status, // Orijinal durumu sakla
        status: finalStatus, // Yeni hesaplanan durum
        price: booking.price.total,
        currency: booking.price.currency,
        location: `${booking.pitch.location.address.district}, ${booking.pitch.location.address.city}`,
        fullAddress: `${booking.pitch.location.address.street}, ${booking.pitch.location.address.neighborhood}, ${booking.pitch.location.address.district}/${booking.pitch.location.address.city}`,
        players: booking.totalPlayers,
        notes: booking.notes || "",
        bookedBy: booking.bookedBy.name,
        pitchRating: booking.pitch.rating.averageRating,
        totalReviews: booking.pitch.rating.totalReviews,
        facilities: booking.pitch.facilities,
        specifications: booking.pitch.specifications,
        contact: booking.pitch.contact,
        createdAt: new Date(booking.createdAt).toLocaleDateString('tr-TR'),
        updatedAt: new Date(booking.updatedAt).toLocaleDateString('tr-TR'),
        refundAllowed: booking.pitch.refundAllowed,
        paymentMethod: booking.price.method,
        paid: booking.price.paid,
        paidAt: booking.price.paidAt ? new Date(booking.price.paidAt).toLocaleDateString('tr-TR') : null,
        startDateTime: startDate,
        canCancel: (finalStatus === 'pending') || (finalStatus === 'confirmed' && hoursDiff > 48),
        isExpired: startDate < now,
        hoursDiff: hoursDiff,
        company: booking.company,
        cancelInfo: booking.cancel || null,
        cancelReason: booking.cancel?.reason || null
      };
    });
    
    setReservations(processedReservations);
  }, []);

  const tabs = [
    { id: "all", label: "Tümü", count: reservations.length },
    { id: "pending", label: "Onay Bekleyen", count: reservations.filter(r => r.status === "pending").length },
    { id: "confirmed", label: "Onaylandı", count: reservations.filter(r => r.status === "confirmed").length },
    { id: "completed", label: "Tamamlandı", count: reservations.filter(r => r.status === "completed").length },
    { id: "cancelled", label: "İptal Edildi", count: reservations.filter(r => r.status === "cancelled").length }
  ];

  const filteredReservations = reservations.filter(reservation => {
    let matchesTab = false;
    
    if (activeTab === "all") {
      matchesTab = true;
    } else {
      matchesTab = reservation.status === activeTab;
    }
    
    const matchesSearch = reservation.pitchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reservation.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getStatusColor = (reservation) => {
    switch (reservation.status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "confirmed": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (reservation) => {
    switch (reservation.status) {
      case "pending": return "Onay Bekleyen";
      case "confirmed": return "Onaylandı";
      case "completed": return "Tamamlandı";
      case "cancelled": return "İptal Edildi";
      default: return "Bilinmiyor";
    }
  };

  const getStatusExplanation = (reservation) => {
    // Orijinal durum ile yeni durum farklıysa açıklama göster
    if (reservation.originalStatus !== reservation.status) {
      if (reservation.originalStatus === 'confirmed' && reservation.status === 'completed') {
        return "Onaylanmış rezervasyon süresi geçtiği için tamamlandı olarak işaretlendi";
      } else if (reservation.originalStatus === 'pending' && reservation.status === 'cancelled') {
        return "Onay bekleyen rezervasyon süresi geçtiği için iptal edildi";
      }
    }
    return null;
  };

  const handleCancelReservation = async (reservationId) => {
    setLoading(true);
    try {
      // Backend API call would go here
      // await cancelReservation(reservationId);
      
      // For now, just update the local state
      setReservations(prev => 
        prev.map(res => 
          res.id === reservationId 
            ? { ...res, status: 'cancelled', canCancel: false }
            : res
        )
      );
      
      alert('Rezervasyon başarıyla iptal edildi.');
    } catch (error) {
      alert('Rezervasyon iptal edilirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const getSurfaceTypeText = (surfaceType) => {
    switch (surfaceType) {
      case "artificial_turf": return "Sentetik Çim";
      case "natural_grass": return "Doğal Çim";
      case "concrete": return "Beton";
      default: return surfaceType;
    }
  };

  const getPaymentMethodText = (method) => {
    switch (method) {
      case "wallet": return "Cüzdan";
      case "card": return "Kart";
      case "cash": return "Nakit";
      default: return method;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Rezervasyonlarım</h2>
        <div className="text-sm text-gray-500">
          Toplam {reservations.length} rezervasyon
        </div>
        </div>
      
      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Saha adı veya konum ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => (
        <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-white text-green-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              activeTab === tab.id ? "bg-green-100 text-green-600" : "bg-gray-200 text-gray-600"
            }`}>
              {tab.count}
            </span>
        </button>
        ))}
      </div>

      {/* Reservations List */}
      <div className="space-y-4">
        {filteredReservations.map((reservation) => (
          <div key={reservation.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="mb-3">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{reservation.pitchName}</h3>
                  <hr className="border-gray-300 mt-1 mb-2" />
                  <div className="flex items-center space-x-4 text-base font-semibold text-gray-700 italic">
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{reservation.date}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{reservation.time}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation)}`}>
                    {getStatusText(reservation)}
                  </span>
                  {getStatusExplanation(reservation) && (
                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded max-w-48 text-right">
                      {getStatusExplanation(reservation)}
                    </span>
                  )}
                  {reservation.status === 'confirmed' && reservation.hoursDiff <= 48 && reservation.hoursDiff > 0 && (
                    <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                      48 saat kuralı: İptal edilemez
                    </span>
                  )}
                  {!reservation.paid && (
                    <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                      Ödeme Bekleniyor
                    </span>
                  )}
                  {reservation.cancelReason && (
                    <div className="mt-2 p-3 bg-red-50 rounded-lg border-l-4 border-red-400 max-w-64">
                      <p className="text-sm text-red-700">
                        <span className="font-medium">İptal Nedeni:</span> {reservation.cancelReason}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

                                    {/* Para ve oyuncu bilgisi */}
            <div className="mb-3 flex flex-col space-y-2">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/a/af/Turkish_lira_symbol_black.svg" 
                    alt="Turkish Lira" 
                    className="w-4 h-4 text-green-600"
                  />
                  <span className="font-semibold text-green-600">{reservation.price} {reservation.currency}</span>
                  {!reservation.paid && (
                    <span className="text-xs text-red-600">(Ödenmedi)</span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="text-sm text-gray-600">{reservation.players} oyuncu</span>
                </div>
              </div>


              {/* Not kısmı tek satırda */}
            {reservation.notes && (
              <div className="mb-3 mx-4 p-2 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                <p className="text-sm text-blue-700 truncate">
                  <span className="font-medium">Saha Sahibine Not:</span> {reservation.notes}
                </p>
              </div>
            )}
              
              {/* Butonlar sağ tarafta */}
              <div className="flex space-x-2 justify-end">
                                        <button
                  onClick={() => window.open(`/pitch-detail/${reservation.pitchId}`, '_blank')}
                  className="px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Saha Detayı
                </button>
                    
                {reservation.canCancel && (
                  <button 
                    onClick={() => {
                      if (window.confirm('Bu rezervasyonu iptal etmek istediğinizden emin misiniz?')) {
                        handleCancelReservation(reservation.id);
                      }
                    }}
                    disabled={loading}
                    className="px-4 py-2 text-sm text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'İptal Ediliyor...' : 'İptal Et'}
                  </button>
                )}
                
                                {reservation.status === "completed" && (
                  <button 
                    onClick={() => window.open(`/pitch-detail/${reservation.pitchId}`, '_blank')}
                    className="px-4 py-2 text-sm text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors"
                  >
                    Tekrar Rezerve Et
                  </button>
                )}
                
                                {(reservation.status === "pending" || reservation.status === "confirmed") && (
                      <button
                    onClick={() => window.open(`/matches?create=true&pitchId=${reservation.pitchId}&date=${reservation.date}&time=${reservation.time}`, '_blank')}
                    className="px-4 py-2 text-sm text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors"
                  >
                    İlan Koy
                  </button>
                )}
                
                {/* Fatura butonu - sadece ödenmiş rezervasyonlarda */}
                {reservation.paid && (
                  <button 
                    onClick={() => window.open(`/invoice/${reservation.id}`, '_blank')}
                    className="px-3 py-1 text-xs text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                  >
                    📄 Faturam
                  </button>
                )}
              </div>
            </div>

            

            {/* Saha İletişim */}
              {reservation.contact.phone && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="font-medium">Saha İletişim:</span>
                    <a 
                      href={`tel:${reservation.contact.phone}`}
                      className="text-green-600 hover:text-green-700 font-medium transition-colors"
                    >
                      {reservation.contact.phone}
                    </a>
                  </div>
                </div>
              )}
          </div>
        ))}
      </div>

      {filteredReservations.length === 0 && (
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Rezervasyon bulunamadı</h3>
          <p className="mt-1 text-sm text-gray-500">
            {activeTab === "all" ? "Henüz hiç rezervasyon yapmamışsınız." : `${getStatusText(activeTab)} rezervasyon bulunamadı.`}
          </p>
        </div>
      )}
    </div>
  );
}

export default MyReservations; 