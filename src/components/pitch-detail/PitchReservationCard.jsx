import { useNavigate } from "react-router-dom";
import { useState } from "react";

function PitchReservationCard({
  pitch,
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  handleReservation,
  occupiedSlots,
  bookingsLoading,
  bookingsError,
  isBooking = false,
}) {
  const navigate = useNavigate();
  const [showCalendar, setShowCalendar] = useState(false);
  // Bugünün tarihi ile başlat, saat 12:00'da ayarla (timezone sorunlarını önle)
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date();
    return new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      12,
      0,
      0
    );
  });

  // Tarihi görüntüleme formatına çevir (YYYY-MM-DD -> DD.MM.YYYY)
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    try {
      // String'i doğrudan bölerek timezone sorunlarını önle
      const [year, month, day] = dateString.split("-");
      return `${day}.${month}.${year}`;
    } catch {
      return "";
    }
  };

  // Türkçe ay isimleri
  const getTurkishMonth = (date) => {
    return date.toLocaleDateString("tr-TR", { month: "long", year: "numeric" });
  };

  // Türkçe gün isimleri (kısaltılmış)
  const getTurkishDayNames = () => {
    return ["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pz"];
  };

  // Local date formatını kullan (timezone sorunlarını önler)
  const formatDateToISO = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Bugünün tarihini güvenli şekilde al
  const getTodayISO = () => {
    const today = new Date();
    return formatDateToISO(
      new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0, 0)
    );
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
        dateString: formatDateToISO(date),
      });
    }

    // Bu ayın günleri
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      days.push({
        day,
        isCurrentMonth: true,
        date,
        dateString: formatDateToISO(date),
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
        dateString: formatDateToISO(date),
      });
    }

    return days;
  };

  // Tarih seçildiğinde
  const handleDateSelect = (dateString) => {
    setSelectedDate(dateString);
    setSelectedTime("");
    setShowCalendar(false);
  };

  // Ay değiştir
  const changeMonth = (direction) => {
    setCalendarMonth((prev) => {
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
      const currentHourLabel = hour.toString().padStart(2, "0");
      const nextHourLabel = nextHour.toString().padStart(2, "0");

      timeSlots.push({
        value: `${currentHourLabel}-${nextHourLabel}`,
        label: `${currentHourLabel}:00 - ${nextHourLabel}:00`,
      });
    }
    return timeSlots;
  };

  // Gece saati olup olmadığını kontrol et (18:00-06:00 arası)
  const isNightTime = (timeSlot) => {
    const [startHour] = timeSlot.split("-").map((h) => parseInt(h));
    return startHour >= 18 || startHour < 6;
  };

  // Güncel fiyatı al (gece saati seçilmişse gece fiyatı)
  const getCurrentPrice = () => {
    if (selectedTime && isNightTime(selectedTime)) {
      return pitch.nightPrice || pitch.price;
    }
    return pitch.price;
  };

  // Saat slotunun rezervasyona uygun olup olmadığını kontrol et
  const isTimeSlotAvailable = (timeSlot) => {
    if (!selectedDate) return false;

    // Get static availability data from pitch (maintenance slots, etc.)
    const availability = pitch?.availability || {};
    const unavailableSlots = availability.unavailableSlots || [];
    const maintenanceSlots = availability.maintenanceSlots || [];

    // Check static availability first
    if (
      unavailableSlots.includes(timeSlot) ||
      maintenanceSlots.includes(timeSlot)
    ) {
      return false;
    }

    // Check real booking data from backend
    const occupiedSlotsForDate = occupiedSlots[selectedDate] || [];

    // Convert timeSlot (e.g., "09-10") to hour format (e.g., "09:00")
    const [startHour] = timeSlot.split("-");
    const startTime = `${startHour}:00`;

    // Check if this time slot is occupied by a real booking
    if (occupiedSlotsForDate.includes(startTime)) {
      return false;
    }

    return true;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 border border-gray-100 h-full flex flex-col">
      {/* Main Content */}
      <div className="flex-grow">
        <h2
          className="text-2xl font-bold text-center mb-6"
          style={{ color: "rgb(0, 128, 0)" }}
        >
          Rezervasyon Yap
        </h2>

        {/* Date Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tarih Seç
          </label>
          <div className="relative">
            {/* Clickable Display Area - Tüm alan tıklanabilir */}
            <div
              onClick={() => setShowCalendar(!showCalendar)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white cursor-pointer flex items-center justify-between hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 select-none"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setShowCalendar(!showCalendar);
                }
              }}
            >
              <span
                className={
                  selectedDate ? "text-gray-900 font-medium" : "text-gray-500"
                }
              >
                {selectedDate
                  ? formatDateForDisplay(selectedDate)
                  : "Tarih seçmek için buraya tıklayın"}
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
                    <svg
                      className="w-5 h-5 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
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
                    <svg
                      className="w-5 h-5 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>

                {/* Day Names */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {getTurkishDayNames().map((dayName) => (
                    <div
                      key={dayName}
                      className="text-center text-xs font-semibold text-gray-500 py-2"
                    >
                      {dayName}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1">
                  {generateCalendarDays().map((dayObj, index) => {
                    const today = getTodayISO();
                    const isToday = dayObj.dateString === today;
                    const isSelected = dayObj.dateString === selectedDate;
                    // Geçmiş tarihleri kontrol et (bugünden önceki tüm tarihler)
                    const isPast = dayObj.dateString < today;
                    const isDisabled = isPast;

                    return (
                      <button
                        key={index}
                        onClick={() =>
                          !isDisabled && handleDateSelect(dayObj.dateString)
                        }
                        disabled={isDisabled}
                        className={`
                        p-3 text-sm rounded transition-colors
                        ${
                          !dayObj.isCurrentMonth
                            ? "text-gray-300 hover:bg-gray-50"
                            : isSelected
                            ? "bg-[rgb(0,128,0)] text-white font-semibold"
                            : isToday
                            ? "bg-blue-100 text-blue-600 font-semibold"
                            : isDisabled
                            ? "text-gray-300 cursor-not-allowed"
                            : "text-gray-700 hover:bg-gray-100"
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
                    className="text-sm text-[rgb(0,128,0)] hover:text-[rgb(0,100,0)] font-medium"
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

        {/* Booking Status Feedback */}
        {bookingsLoading && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <p className="text-sm text-blue-800">
                Rezervasyon durumu kontrol ediliyor...
              </p>
            </div>
          </div>
        )}

        {bookingsError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              ⚠️ Rezervasyon durumu alınamadı: {bookingsError}
            </p>
          </div>
        )}

        {/* Time Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Saat Seç
            {selectedDate && !bookingsLoading && (
              <span className="text-xs text-gray-500 ml-1">
                ({formatDateForDisplay(selectedDate)} için mevcut saatler)
              </span>
            )}
          </label>
          <div className="grid grid-cols-4 gap-4">
            {generateTimeSlots().map((timeSlot) => {
              const isAvailable = isTimeSlotAvailable(timeSlot.value);
              const isSelected = selectedTime === timeSlot.value;

              return (
                <button
                  key={timeSlot.value}
                  onClick={() => isAvailable && setSelectedTime(timeSlot.value)}
                  disabled={!isAvailable}
                  className={`
                                                              px-2 py-4 text-sm font-medium rounded-md transition-all duration-200 border relative
                               ${
                                 isSelected && isAvailable
                                   ? "bg-[rgb(0,128,0)] text-white border-[rgb(0,128,0)] shadow-md"
                                   : isAvailable
                                   ? `bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400 ${
                                       isNightTime(timeSlot.value)
                                         ? "text-blue-700"
                                         : "text-gray-700"
                                     }`
                                   : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-50"
                               }
                             `}
                >
                  {isNightTime(timeSlot.value) &&
                    isAvailable &&
                    !isSelected && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">🌙</span>
                      </div>
                    )}
                  <div className="text-xs leading-tight">
                    {timeSlot.value.split("-")[0]}:00
                  </div>
                  <div className="text-xs leading-tight">
                    {timeSlot.value.split("-")[1]}:00
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Maintenance Warning */}
      {pitch.status === "maintenance" && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-800 text-sm font-medium">
            ⚠️ Bu saha şu anda bakımda
          </p>
          <p className="text-yellow-700 text-sm mt-1">
            Yakında rezervasyona açılacak
          </p>
        </div>
      )}

      {/* Price and Action Section */}
      <div className="mt-auto pt-4">
        {/* Price */}
        <div className="mb-4 flex items-center justify-center space-x-2">
          <span className="text-3xl font-bold text-gray-700">Fiyat:</span>
          <div className="text-3xl font-bold text-gray-900">
            ₺{getCurrentPrice()}
          </div>
          {selectedTime && isNightTime(selectedTime) && (
            <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              🌙 Gece
            </span>
          )}
        </div>

        {/* Night Time Warning */}
        {selectedTime && isNightTime(selectedTime) && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-blue-800 text-sm font-medium flex items-center">
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a8.973 8.973 0 005.354-1.646z"
                />
              </svg>
              🌙 Gece saati seçtiniz
            </p>
            <p className="text-blue-700 text-sm mt-1">
              Gece tarifesi: ₺{getCurrentPrice()}
              {pitch.nightPrice !== pitch.price && (
                <span className="text-gray-600 ml-1">
                  (Gündüz: ₺{pitch.price})
                </span>
              )}
            </p>
          </div>
        )}

        {/* Reservation Button */}
        <button
          onClick={handleReservation}
          disabled={pitch.status !== "active" || isBooking}
          className={`w-full py-3 px-4 rounded-md font-semibold transition-colors flex items-center justify-center ${
            pitch.status === "active" && !isBooking
              ? "bg-[rgb(0,128,0)] hover:bg-[rgb(0,100,0)] text-white"
              : pitch.status === "maintenance"
              ? "bg-gray-100 border border-gray-300 text-gray-500 cursor-not-allowed"
              : isBooking
              ? "bg-[rgb(0,100,0)] text-white cursor-not-allowed"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {isBooking ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
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
              Rezervasyon Yapılıyor...
            </>
          ) : pitch.status === "active" ? (
            "Rezervasyon Yap"
          ) : pitch.status === "maintenance" ? (
            "Rezervasyon Yap"
          ) : (
            "Rezervasyon Yapılamaz"
          )}
        </button>

        {/* Back to Pitches */}
        <button
          onClick={() => navigate("/reservation")}
          className="w-full mt-3 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Sahalara Dön
        </button>
      </div>
    </div>
  );
}

export default PitchReservationCard;
