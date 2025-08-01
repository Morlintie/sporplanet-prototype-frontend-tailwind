import { useState } from "react";

function CreateAdModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    type: "team-ads",
    title: "",
    date: "",
    time: "",
    location: "",
    maxPlayers: "",
    currentPlayers: "",
    pricePerPerson: "",
    difficulty: "Orta Seviye",
    description: ""
  });

  const [showCalendar, setShowCalendar] = useState(false);
  // Bugünün tarihi ile başlat, saat 12:00'da ayarla (timezone sorunlarını önle)
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0, 0);
  });

  // Tarihi görüntüleme formatına çevir (YYYY-MM-DD -> DD.MM.YYYY)
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    try {
      const [year, month, day] = dateString.split('-');
      return `${day}.${month}.${year}`;
    } catch {
      return '';
    }
  };

  // Türkçe ay isimleri
  const getTurkishMonth = (date) => {
    return date.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
  };

  // Türkçe gün isimleri (kısaltılmış)
  const getTurkishDayNames = () => {
    return ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'];
  };

  // Local date formatını kullan (timezone sorunlarını önler)
  const formatDateToISO = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Bugünün tarihini güvenli şekilde al
  const getTodayISO = () => {
    const today = new Date();
    return formatDateToISO(new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0, 0));
  };

  // Ayın günlerini oluştur
  const generateCalendarDays = () => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    
    // Ayın ilk günü
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Ayın ilk günü hangi gün (Pazartesi = 1, Pazar = 0)
    const startDay = firstDay.getDay();
    const adjustedStartDay = startDay === 0 ? 6 : startDay - 1; // Pazartesiyi 0 yap
    
    const days = [];
    
    // Önceki ayın son günleri (gri)
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = adjustedStartDay - 1; i >= 0; i--) {
      const day = prevMonth.getDate() - i;
      const date = new Date(year, month - 1, day);
      days.push({
        day,
        isCurrentMonth: false,
        date,
        dateString: formatDateToISO(date)
      });
    }
    
    // Bu ayın günleri
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      days.push({
        day,
        isCurrentMonth: true,
        date,
        dateString: formatDateToISO(date)
      });
    }
    
    // Sonraki ayın ilk günleri (gri) - toplamda 42 gün (6 hafta)
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        day,
        isCurrentMonth: false,
        date,
        dateString: formatDateToISO(date)
      });
    }
    
    return days;
  };

  // Tarih seçildiğinde
  const handleDateSelect = (dateString) => {
    setFormData(prev => ({
      ...prev,
      date: dateString,
      time: "" // Tarih değiştiğinde saati sıfırla
    }));
    setShowCalendar(false);
  };

  // Ay değiştir
  const changeMonth = (direction) => {
    setCalendarMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + direction);
      return newMonth;
    });
  };

  // Saat aralıklarını oluştur (0-1, 1-2, ... 23-00)
  const generateTimeSlots = () => {
    const timeSlots = [];
    for (let hour = 0; hour < 24; hour++) {
      const nextHour = hour === 23 ? 0 : hour + 1;
      const currentHourLabel = hour.toString().padStart(2, '0');
      const nextHourLabel = nextHour.toString().padStart(2, '0');
      
      timeSlots.push({
        value: `${currentHourLabel}-${nextHourLabel}`,
        label: `${currentHourLabel}:00 - ${nextHourLabel}:00`
      });
    }
    return timeSlots;
  };

  // Saat slotunun seçilebilir olup olmadığını kontrol et
  const isTimeSlotAvailable = (timeSlot) => {
    if (!formData.date) return false;
    
    const today = getTodayISO();
    const selectedDate = formData.date;
    
    // Geçmiş tarihleri engelle
    if (selectedDate < today) return false;
    if (selectedDate > today) return true; // Gelecek tarihlerde tüm saatler OK
    
    // Bugün seçilmişse, geçmiş saatleri engelle
    if (selectedDate === today) {
      const [startHour] = timeSlot.split('-').map(h => parseInt(h));
      const now = new Date();
      const currentHour = now.getHours();
      return startHour >= currentHour;
    }
    
    return true;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Form validation
    if (!formData.date || !formData.time) {
      alert("Lütfen tarih ve saat seçiniz!");
      return;
    }
    
    // Format the time for submission (convert "09-10" to readable format)
    const timeFormatted = formData.time.split('-').map(h => `${h}:00`).join(' - ');
    
    const submissionData = {
      ...formData,
      timeFormatted: timeFormatted,
      dateFormatted: formatDateForDisplay(formData.date)
    };
    
    onSubmit(submissionData);
    
    // Reset form
    setFormData({
      type: "team-ads",
      title: "",
      date: "",
      time: "",
      location: "",
      maxPlayers: "",
      currentPlayers: "",
      pricePerPerson: "",
      difficulty: "Orta Seviye",
      description: ""
    });
    setShowCalendar(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">İlan Ver</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 cursor-pointer"
              tabIndex="0"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* İlan Türü */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                İlan Türü
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="team-ads">Rakip Takım İlanı</option>
                <option value="player-ads">Oyuncu İlanı</option>
              </select>
            </div>

            {/* Başlık */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                İlan Başlığı
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Örn: 5v5 Akşam Maçı"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            {/* Tarih Seçimi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tarih Seç
              </label>
              <div className="relative">
                {/* Clickable Display Area */}
                <div 
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white cursor-pointer flex items-center justify-between hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 select-none"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setShowCalendar(!showCalendar);
                    }
                  }}
                >
                  <span className={formData.date ? "text-gray-900 font-medium" : "text-gray-500"}>
                    {formData.date ? formatDateForDisplay(formData.date) : "Tarih seçmek için buraya tıklayın"}
                  </span>
                  
                  {/* Calendar Icon */}
                  <svg 
                    className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" 
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
                </div>

                {/* Custom Turkish Calendar */}
                {showCalendar && (
                  <div className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-4 w-full min-w-[280px]">
                    {/* Calendar Header */}
                    <div className="flex items-center justify-between mb-4">
                      <button
                        onClick={() => changeMonth(-1)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        type="button"
                      >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      
                      <h3 className="text-lg font-semibold text-gray-900 capitalize">
                        {getTurkishMonth(calendarMonth)}
                      </h3>
                      
                      <button
                        onClick={() => changeMonth(1)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        type="button"
                      >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>

                    {/* Day Names */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {getTurkishDayNames().map((dayName) => (
                        <div key={dayName} className="text-center text-xs font-semibold text-gray-500 py-2">
                          {dayName}
                        </div>
                      ))}
                    </div>

                    {/* Calendar Days */}
                    <div className="grid grid-cols-7 gap-1">
                      {generateCalendarDays().map((dayObj, index) => {
                        const today = getTodayISO();
                        const isToday = dayObj.dateString === today;
                        const isSelected = dayObj.dateString === formData.date;
                        // Geçmiş tarihleri kontrol et (bugünden önceki tüm tarihler)
                        const isPast = dayObj.dateString < today;
                        const isDisabled = isPast;

                        return (
                          <button
                            key={index}
                            onClick={() => !isDisabled && handleDateSelect(dayObj.dateString)}
                            disabled={isDisabled}
                            className={`
                              p-3 text-sm rounded transition-colors
                              ${!dayObj.isCurrentMonth 
                                ? 'text-gray-300 hover:bg-gray-50' 
                                : isSelected
                                ? 'bg-green-600 text-white font-semibold'
                                : isToday
                                ? 'bg-blue-100 text-blue-600 font-semibold'
                                : isDisabled
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-gray-700 hover:bg-gray-100'
                              }
                            `}
                            type="button"
                          >
                            {dayObj.day}
                          </button>
                        );
                      })}
                    </div>

                    {/* Today Button */}
                    <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between">
                      <button
                        onClick={() => {
                          const today = getTodayISO();
                          handleDateSelect(today);
                        }}
                        className="text-sm text-green-600 hover:text-green-700 font-medium"
                        type="button"
                      >
                        Bugün
                      </button>
                      <button
                        onClick={() => setShowCalendar(false)}
                        className="text-sm text-gray-500 hover:text-gray-700"
                        type="button"
                      >
                        Kapat
                      </button>
                    </div>
                  </div>
                )}

                {/* Click Outside Handler */}
                {showCalendar && (
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowCalendar(false)}
                  />
                )}
              </div>
            </div>

            {/* Saat Seçimi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Saat Seç
              </label>
              <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-2">
                {generateTimeSlots().map((timeSlot) => {
                  const isAvailable = isTimeSlotAvailable(timeSlot.value);
                  const isSelected = formData.time === timeSlot.value;
                  
                  return (
                    <button
                      key={timeSlot.value}
                      onClick={() => isAvailable && setFormData(prev => ({ ...prev, time: timeSlot.value }))}
                      disabled={!isAvailable}
                      className={`
                        px-2 py-3 text-xs font-medium rounded-md transition-all duration-200 border
                        ${isSelected && isAvailable
                          ? 'bg-green-600 text-white border-green-600 shadow-md' 
                          : isAvailable
                          ? 'bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400 text-gray-700'
                          : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-50'
                        }
                      `}
                      type="button"
                    >
                      <div className="text-xs leading-tight">
                        {timeSlot.value.split('-')[0]}:00
                      </div>
                      <div className="text-xs leading-tight">
                        {timeSlot.value.split('-')[1]}:00
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Lokasyon */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lokasyon
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Örn: Özdemir Halı Saha"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            {/* Oyuncu Sayıları */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mevcut Oyuncu
                </label>
                <input
                  type="number"
                  name="currentPlayers"
                  value={formData.currentPlayers}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Toplam Oyuncu
                </label>
                <input
                  type="number"
                  name="maxPlayers"
                  value={formData.maxPlayers}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            </div>

            {/* Fiyat ve Zorluk */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fiyat (₺/kişi)
                </label>
                <input
                  type="number"
                  name="pricePerPerson"
                  value={formData.pricePerPerson}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="25"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zorluk Seviyesi
                </label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="Başlangıç">Başlangıç</option>
                  <option value="Orta Seviye">Orta Seviye</option>
                  <option value="İleri Seviye">İleri Seviye</option>
                  <option value="Profesyonel">Profesyonel</option>
                  <option value="Her Seviye">Her Seviye</option>
                </select>
              </div>
            </div>

            {/* Açıklama */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Açıklama
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                placeholder="İlan detaylarını yazın..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                required
              ></textarea>
            </div>

            {/* Butonlar */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md font-medium transition-colors cursor-pointer"
                tabIndex="0"
              >
                İptal
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors cursor-pointer"
                tabIndex="0"
              >
                İlan Ver
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateAdModal;