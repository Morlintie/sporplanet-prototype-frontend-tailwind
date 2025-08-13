import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

function CreateAdModal({ isOpen, onClose, onSubmit, prefilledData }) {
  const { user, getUserFriends, getBookings } = useAuth();

  // Modal state - 3 steps for booking: choice -> booking-select -> booking-form, 2 steps for custom: choice -> custom
  const [step, setStep] = useState("choice");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });

  // Available bookings (pending/confirmed only)
  const [availableBookings, setAvailableBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Form data for both booking and custom pitch adverts
  const [formData, setFormData] = useState({
    // Common fields
    playersNeeded: 5,
    goalKeepersNeeded: 1,
    participants: [], // Array of friend _ids
    notes: "",
    adminAdvert: [], // Array of friend _ids who will be admins
    isRivalry: { status: false },
    level: "intermediate",

    // Custom pitch specific fields
    customPitch: {
      name: "",
      address: "",
      district: "",
      city: "",
    },
    startsAt: "",
  });

  // Modal states
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);

  // Date and time state for custom pitch
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  // Get user's friends and bookings
  const friends = getUserFriends() || [];
  const userBookings = getBookings() || [];

  // Level options
  const levelOptions = [
    { value: "beginner", label: "Başlangıç" },
    { value: "intermediate", label: "Orta" },
    { value: "advanced", label: "İleri" },
    { value: "pro", label: "Profesyonel" },
    { value: "professional", label: "Lig (oyuncu)" },
  ];

  // Error message translation
  const translateErrorMessage = (message) => {
    const errorMessages = {
      "Please provide required data.": "Gerekli bilgileri doldurun.",
      "You have been banned, please get contact with our customer service.":
        "Hesabınız askıya alınmıştır. Müşteri hizmetleri ile iletişime geçin.",
      "Booking not found": "Rezervasyon bulunamadı.",
      "Advert creation failed": "İlan oluşturulamadı.",
      "This pitch is already booked for the selected time.":
        "Bu saha seçilen saat için zaten rezerve edilmiş.",
      "Network Error": "Ağ hatası oluştu",
      "Failed to fetch": "Veri alınamadı",
      "Internal Server Error": "Sunucu hatası",
      "Bad Request": "Geçersiz istek",
      Unauthorized: "Yetki hatası",
      Forbidden: "Erişim engellendi",
      "Not Found": "Bulunamadı",
      "Too Many Requests": "Çok fazla istek",
      "Service Unavailable": "Servis kullanılamıyor",
    };

    return errorMessages[message] || message || "Bir hata oluştu";
  };

  // Initialize available bookings when modal opens
  useEffect(() => {
    if (isOpen && userBookings) {
      const availableBookings = userBookings.filter(
        (booking) =>
          booking.status === "pending" || booking.status === "confirmed"
      );
      setAvailableBookings(availableBookings);
    }
  }, [isOpen, userBookings]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      resetModalState();
    }
  }, [isOpen]);

  // Update startsAt when date or time changes for custom pitch
  useEffect(() => {
    if (selectedDate && selectedTime) {
      const [year, month, day] = selectedDate.split("-");
      const [startHour] = selectedTime.split("-");
      const paddedDay = day.padStart(2, "0");
      const paddedMonth = month.padStart(2, "0");
      const formattedDateTime = `${paddedDay}.${paddedMonth}.${year}-${startHour}:00`;

      setFormData((prev) => ({
        ...prev,
        startsAt: formattedDateTime,
      }));
    }
  }, [selectedDate, selectedTime]);

  // Reset modal state
  const resetModalState = () => {
    setStep("choice");
    setSelectedBooking(null);
    setError("");
    setNotification({ show: false, message: "", type: "" });
    setSelectedDate("");
    setSelectedTime("");
    setFormData({
      playersNeeded: 5,
      goalKeepersNeeded: 1,
      participants: [],
      notes: "",
      adminAdvert: [],
      isRivalry: { status: false },
      rivalryTeamSize: 11,
      level: "intermediate",
      customPitch: {
        name: "",
        address: "",
        district: "",
        city: "",
      },
      startsAt: "",
    });
  };

  // Handle friend selection for participants
  const handleFriendSelection = (friendId) => {
    setFormData((prev) => ({
      ...prev,
      participants: prev.participants.includes(friendId)
        ? prev.participants.filter((id) => id !== friendId)
        : [...prev.participants, friendId],
    }));
  };

  // Handle admin selection
  const handleAdminSelection = (friendId) => {
    setFormData((prev) => ({
      ...prev,
      adminAdvert: prev.adminAdvert.includes(friendId)
        ? prev.adminAdvert.filter((id) => id !== friendId)
        : [...prev.adminAdvert, friendId],
    }));
  };

  // Handle custom pitch form update
  const handleCustomPitchChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      customPitch: {
        ...prev.customPitch,
        [field]: value,
      },
    }));
  };

  // Submit advert to backend
  const submitAdvert = async () => {
    setIsSubmitting(true);
    setError("");

    try {
      let requestBody = {};

      if (step === "booking-form" && selectedBooking) {
        // Booking-based advert
        let playersNeeded, goalKeepersNeeded;

        if (formData.isRivalry.status) {
          // Rakip Takım İlanı - Takım büyüklüğüne göre otomatik hesapla
          const teamSize = formData.rivalryTeamSize || 11;
          playersNeeded = teamSize - 1; // Biri kaleci, diğerleri oyuncu
          goalKeepersNeeded = 1; // Her zaman 1 kaleci
        } else {
          // Oyuncu İlanı - Kullanıcının girdiği değerleri kullan
          playersNeeded = parseInt(formData.playersNeeded);
          goalKeepersNeeded = parseInt(formData.goalKeepersNeeded);
        }

        requestBody = {
          booking: selectedBooking._id,
          playersNeeded: playersNeeded,
          goalKeepersNeeded: goalKeepersNeeded,
          participants: formData.participants,
          notes: formData.notes,
          adminAdvert: formData.adminAdvert,
          isRivalry: formData.isRivalry,
          level: formData.level,
        };
      } else if (step === "custom") {
        // Custom pitch advert
        if (
          !formData.customPitch.name ||
          !formData.customPitch.address ||
          !formData.startsAt
        ) {
          setError("Saha adı, adres ve tarih zorunlu alanlarıdır.");
          return;
        }

        let playersNeeded, goalKeepersNeeded;

        if (formData.isRivalry.status) {
          // Rakip Takım İlanı - Takım büyüklüğüne göre otomatik hesapla
          const teamSize = formData.rivalryTeamSize || 11;
          playersNeeded = teamSize - 1; // Biri kaleci, diğerleri oyuncu
          goalKeepersNeeded = 1; // Her zaman 1 kaleci
        } else {
          // Oyuncu İlanı - Kullanıcının girdiği değerleri kullan
          playersNeeded = parseInt(formData.playersNeeded);
          goalKeepersNeeded = parseInt(formData.goalKeepersNeeded);
        }

        requestBody = {
          customPitch: {
            name: formData.customPitch.name,
            address: formData.customPitch.address,
            ...(formData.customPitch.district && {
              district: formData.customPitch.district,
            }),
            ...(formData.customPitch.city && {
              city: formData.customPitch.city,
            }),
          },
          startsAt: formData.startsAt,
          playersNeeded: playersNeeded,
          goalKeepersNeeded: goalKeepersNeeded,
          participants: formData.participants,
          notes: formData.notes,
          adminAdvert: formData.adminAdvert,
          isRivalry: formData.isRivalry,
          level: formData.level,
        };
      }

      console.log("Sending advert request:", requestBody);

      const response = await fetch("/api/v1/advert", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Advert creation failed");
      }

      const data = await response.json();
      console.log("Advert created successfully:", data);

      setNotification({
        show: true,
        message: "İlan başarıyla oluşturuldu!",
        type: "success",
      });

      // Close modal after success
      setTimeout(() => {
        onClose();
        // Refresh the page data if needed
        if (onSubmit) {
          onSubmit(data);
        }
      }, 1500);
    } catch (error) {
      console.error("Error creating advert:", error);
      setError(translateErrorMessage(error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate time slots
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

  // Get today's date in ISO format
  const getTodayISO = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">İlan Ver</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 cursor-pointer"
              tabIndex="0"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Notification */}
          {notification.show && (
            <div
              className={`mb-4 p-4 rounded-md ${
                notification.type === "success"
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {notification.message}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {/* Step 1: Choice between booking and custom pitch */}
          {step === "choice" && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  İlan türünü seçin
                </h3>
                <p className="text-gray-600 mb-6">
                  Mevcut rezervasyonunuz için mi yoksa yeni bir saha için mi
                  ilan vermek istiyorsunuz?
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Existing Booking Option */}
                <button
                  onClick={() => {
                    if (availableBookings.length > 0) {
                      setStep("booking-select");
                    } else {
                      setError(
                        "Aktif rezervasyonunuz bulunmuyor. Özel saha ilanı oluşturabilirsiniz."
                      );
                    }
                  }}
                  className="p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-left"
                >
                  <div className="text-green-600 mb-3">
                    <svg
                      className="w-8 h-8"
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
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Mevcut Rezervasyon
                  </h4>
                  <p className="text-sm text-gray-600">
                    Sahada rezervasyonunuz var ve oyuncu arıyorsunuz
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {availableBookings.length} aktif rezervasyon
                  </p>
                </button>

                {/* Custom Pitch Option */}
                <button
                  onClick={() => setStep("custom")}
                  className="p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-left"
                >
                  <div className="text-green-600 mb-3">
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Özel Saha
                  </h4>
                  <p className="text-sm text-gray-600">
                    Kendi sahanız var veya başka bir sahada oyun
                    düzenleyeceksiniz
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Booking Selection */}
          {step === "booking-select" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Rezervasyon Seçin
                </h3>
                <button
                  onClick={() => setStep("choice")}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ← Geri
                </button>
              </div>

              {/* Booking List */}
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {availableBookings.map((booking) => (
                  <div
                    key={booking._id}
                    onClick={() => {
                      setSelectedBooking(booking);
                      setStep("booking-form");
                    }}
                    className="p-4 border rounded-lg cursor-pointer transition-all hover:border-gray-300 hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {booking.pitch
                            ? typeof booking.pitch === "string"
                              ? `Saha İsmi: ${booking.pitch}`
                              : booking.pitch.name || "Saha Adı Bilinmiyor"
                            : "Saha Adı Bilinmiyor"}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {new Date(booking.start).toLocaleDateString("tr-TR", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <p className="text-xs">
                          <span className="text-gray-500">Durum: </span>
                          <span
                            className={
                              booking.status === "pending"
                                ? "text-yellow-600 font-medium"
                                : booking.status === "confirmed"
                                ? "text-green-600 font-medium"
                                : "text-gray-500"
                            }
                          >
                            {booking.status === "pending"
                              ? "Beklemede"
                              : booking.status === "confirmed"
                              ? "Onaylandı"
                              : booking.status}
                          </span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          ₺
                          {booking.price?.hourlyRate
                            ? Math.round(booking.price.hourlyRate / 100)
                            : 0}
                        </p>
                        <p className="text-xs text-gray-500">
                          {booking.totalPlayers || 0} oyuncu
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Booking Form */}
          {step === "booking-form" && selectedBooking && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  İlan Detayları
                </h3>
                <button
                  onClick={() => setStep("booking-select")}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ← Geri
                </button>
              </div>

              {/* Selected Booking Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">
                  Seçilen Rezervasyon
                </h4>
                <div className="text-sm text-gray-600">
                  <p>
                    <strong>Saha:</strong>{" "}
                    {selectedBooking.pitch
                      ? typeof selectedBooking.pitch === "string"
                        ? selectedBooking.pitch
                        : selectedBooking.pitch.name || "Saha Adı Bilinmiyor"
                      : "Saha Adı Bilinmiyor"}
                  </p>
                  <p>
                    <strong>Tarih:</strong>{" "}
                    {new Date(selectedBooking.start).toLocaleDateString(
                      "tr-TR",
                      {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </p>
                  <p>
                    <strong>Durum:</strong>{" "}
                    <span
                      className={
                        selectedBooking.status === "pending"
                          ? "text-yellow-600 font-medium"
                          : selectedBooking.status === "confirmed"
                          ? "text-green-600 font-medium"
                          : "text-gray-500"
                      }
                    >
                      {selectedBooking.status === "pending"
                        ? "Beklemede"
                        : selectedBooking.status === "confirmed"
                        ? "Onaylandı"
                        : selectedBooking.status}
                    </span>
                  </p>
                  <p>
                    <strong>Fiyat:</strong> ₺
                    {selectedBooking.price?.hourlyRate
                      ? Math.round(selectedBooking.price.hourlyRate / 100)
                      : 0}
                  </p>
                </div>
              </div>

              <BookingAdvertForm
                formData={formData}
                setFormData={setFormData}
                friends={friends}
                levelOptions={levelOptions}
                onSubmit={submitAdvert}
                isSubmitting={isSubmitting}
                onShowFriends={() => setShowFriendsModal(true)}
                onShowAdmins={() => setShowAdminModal(true)}
              />
            </div>
          )}

          {/* Step 2 for Custom Pitch: Custom Pitch Form */}
          {step === "custom" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Özel Saha İlanı
                </h3>
                <button
                  onClick={() => setStep("choice")}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ← Geri
                </button>
              </div>

              <CustomPitchAdvertForm
                formData={formData}
                setFormData={setFormData}
                friends={friends}
                levelOptions={levelOptions}
                onSubmit={submitAdvert}
                isSubmitting={isSubmitting}
                onShowFriends={() => setShowFriendsModal(true)}
                onShowAdmins={() => setShowAdminModal(true)}
                onCustomPitchChange={handleCustomPitchChange}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                selectedTime={selectedTime}
                setSelectedTime={setSelectedTime}
                generateTimeSlots={generateTimeSlots}
                getTodayISO={getTodayISO}
              />
            </div>
          )}
        </div>
      </div>

      {/* Friends Selection Modal */}
      {showFriendsModal && (
        <FriendsSelectionModal
          friends={friends}
          selectedFriends={formData.participants}
          onFriendSelect={handleFriendSelection}
          onClose={() => setShowFriendsModal(false)}
          title="Katılımcı Seç"
        />
      )}

      {/* Admin Selection Modal */}
      {showAdminModal && (
        <FriendsSelectionModal
          friends={friends.filter((friend) =>
            formData.participants.includes(friend._id)
          )}
          selectedFriends={formData.adminAdvert}
          onFriendSelect={handleAdminSelection}
          onClose={() => setShowAdminModal(false)}
          title="Admin Seç"
          subtitle="Sadece katılımcılar admin olarak seçilebilir"
        />
      )}
    </div>
  );
}

// Booking-based advert form component
function BookingAdvertForm({
  formData,
  setFormData,
  friends,
  levelOptions,
  onSubmit,
  isSubmitting,
  onShowFriends,
  onShowAdmins,
}) {
  return (
    <div className="space-y-4">
      {/* Participants */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Katılımcılar
        </label>
        <button
          type="button"
          onClick={onShowFriends}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {formData.participants.length > 0
            ? `${formData.participants.length} arkadaş seçildi`
            : "Arkadaş seç (opsiyonel)"}
        </button>
      </div>

      {/* Admin Selection */}
      {formData.participants.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Admin Yetkisi Ver
          </label>
          <button
            type="button"
            onClick={onShowAdmins}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {formData.adminAdvert.length > 0
              ? `${formData.adminAdvert.length} arkadaş admin seçildi`
              : "Admin seç (opsiyonel)"}
          </button>
        </div>
      )}

      {/* Advertisement Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          İlan Türü *
        </label>
        <div className="space-y-3">
          <label className="flex items-start">
            <input
              type="radio"
              name="advertType"
              checked={formData.isRivalry.status}
              onChange={() =>
                setFormData((prev) => ({
                  ...prev,
                  isRivalry: { status: true },
                }))
              }
              className="mr-3 mt-1"
            />
            <div>
              <span className="font-medium">Rakip Takım İlanı</span>
              <p className="text-sm text-gray-600">Rakip takım arayın</p>
            </div>
          </label>
          <label className="flex items-start">
            <input
              type="radio"
              name="advertType"
              checked={!formData.isRivalry.status}
              onChange={() =>
                setFormData((prev) => ({
                  ...prev,
                  isRivalry: { status: false },
                }))
              }
              className="mr-3 mt-1"
            />
            <div>
              <span className="font-medium">Oyuncu İlanı</span>
              <p className="text-sm text-gray-600">Takımınıza oyuncu bulun</p>
            </div>
          </label>
        </div>
      </div>

      {/* Dynamic Fields Based on Advertisement Type */}
      {formData.isRivalry.status ? (
        // Rakip Takım İlanı - Team Size Selection
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kaç Kişilik Rakip Arıyorsunuz? *
          </label>
          <select
            value={formData.rivalryTeamSize || 11}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                rivalryTeamSize: parseInt(e.target.value),
              }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          >
            <option value={5}>5 vs 5</option>
            <option value={6}>6 vs 6</option>
            <option value={7}>7 vs 7</option>
            <option value={8}>8 vs 8</option>
            <option value={9}>9 vs 9</option>
            <option value={10}>10 vs 10</option>
            <option value={11}>11 vs 11</option>
          </select>
        </div>
      ) : (
        // Oyuncu İlanı - Missing Players
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kaç Oyuncunuz Eksik? *
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Saha Oyuncusu
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={formData.playersNeeded}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, "");
                  const numValue = value === "" ? 0 : parseInt(value);
                  if (numValue <= 20) {
                    setFormData((prev) => ({
                      ...prev,
                      playersNeeded: numValue,
                    }));
                  }
                }}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kaleci
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={formData.goalKeepersNeeded}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, "");
                  const numValue = value === "" ? 0 : parseInt(value);
                  if (numValue <= 5) {
                    setFormData((prev) => ({
                      ...prev,
                      goalKeepersNeeded: numValue,
                    }));
                  }
                }}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
          </div>
        </div>
      )}

      {/* Level Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Zorluk Seviyesi *
        </label>
        <select
          value={formData.level}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, level: e.target.value }))
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        >
          {levelOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Açıklama
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, notes: e.target.value }))
          }
          rows="3"
          placeholder="Maç hakkında ek bilgiler..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
        />
      </div>

      {/* Submit Button */}
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-md font-medium transition-colors cursor-pointer"
        >
          {isSubmitting ? "İlan Oluşturuluyor..." : "İlan Ver"}
        </button>
      </div>
    </div>
  );
}

// Custom pitch advert form component
function CustomPitchAdvertForm({
  formData,
  setFormData,
  friends,
  levelOptions,
  onSubmit,
  isSubmitting,
  onShowFriends,
  onShowAdmins,
  onCustomPitchChange,
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  generateTimeSlots,
  getTodayISO,
}) {
  return (
    <div className="space-y-4">
      {/* Pitch Name (Required) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Saha Adı *
        </label>
        <input
          type="text"
          value={formData.customPitch.name}
          onChange={(e) => onCustomPitchChange("name", e.target.value)}
          placeholder="Örn: Merkez Halı Saha"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />
      </div>

      {/* Address (Required) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Adres *
        </label>
        <input
          type="text"
          value={formData.customPitch.address}
          onChange={(e) => onCustomPitchChange("address", e.target.value)}
          placeholder="Örn: Atatürk Caddesi No:15"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />
      </div>

      {/* District and City */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            İlçe
          </label>
          <input
            type="text"
            value={formData.customPitch.district}
            onChange={(e) => onCustomPitchChange("district", e.target.value)}
            placeholder="Örn: Kadıköy"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Şehir
          </label>
          <input
            type="text"
            value={formData.customPitch.city}
            onChange={(e) => onCustomPitchChange("city", e.target.value)}
            placeholder="Örn: İstanbul"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Date and Time Selection */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tarih *
          </label>
          <TurkishDatePicker
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            setSelectedTime={setSelectedTime}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Saat *
          </label>
          <select
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          >
            <option value="">Saat seçin</option>
            {generateTimeSlots().map((slot) => (
              <option key={slot.value} value={slot.value}>
                {slot.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Participants */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Katılımcılar
        </label>
        <button
          type="button"
          onClick={onShowFriends}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {formData.participants.length > 0
            ? `${formData.participants.length} arkadaş seçildi`
            : "Arkadaş seç (opsiyonel)"}
        </button>
      </div>

      {/* Admin Selection */}
      {formData.participants.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Admin Yetkisi Ver
          </label>
          <button
            type="button"
            onClick={onShowAdmins}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {formData.adminAdvert.length > 0
              ? `${formData.adminAdvert.length} arkadaş admin seçildi`
              : "Admin seç (opsiyonel)"}
          </button>
        </div>
      )}

      {/* Advertisement Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          İlan Türü *
        </label>
        <div className="space-y-3">
          <label className="flex items-start">
            <input
              type="radio"
              name="advertType"
              checked={formData.isRivalry.status}
              onChange={() =>
                setFormData((prev) => ({
                  ...prev,
                  isRivalry: { status: true },
                }))
              }
              className="mr-3 mt-1"
            />
            <div>
              <span className="font-medium">Rakip Takım İlanı</span>
              <p className="text-sm text-gray-600">Rakip takım arayın</p>
            </div>
          </label>
          <label className="flex items-start">
            <input
              type="radio"
              name="advertType"
              checked={!formData.isRivalry.status}
              onChange={() =>
                setFormData((prev) => ({
                  ...prev,
                  isRivalry: { status: false },
                }))
              }
              className="mr-3 mt-1"
            />
            <div>
              <span className="font-medium">Oyuncu İlanı</span>
              <p className="text-sm text-gray-600">Takımınıza oyuncu bulun</p>
            </div>
          </label>
        </div>
      </div>

      {/* Dynamic Fields Based on Advertisement Type */}
      {formData.isRivalry.status ? (
        // Rakip Takım İlanı - Team Size Selection
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kaç Kişilik Rakip Arıyorsunuz? *
          </label>
          <select
            value={formData.rivalryTeamSize || 11}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                rivalryTeamSize: parseInt(e.target.value),
              }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          >
            <option value={5}>5 vs 5</option>
            <option value={6}>6 vs 6</option>
            <option value={7}>7 vs 7</option>
            <option value={8}>8 vs 8</option>
            <option value={9}>9 vs 9</option>
            <option value={10}>10 vs 10</option>
            <option value={11}>11 vs 11</option>
          </select>
        </div>
      ) : (
        // Oyuncu İlanı - Missing Players
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kaç Oyuncunuz Eksik? *
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Saha Oyuncusu
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={formData.playersNeeded}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, "");
                  const numValue = value === "" ? 0 : parseInt(value);
                  if (numValue <= 20) {
                    setFormData((prev) => ({
                      ...prev,
                      playersNeeded: numValue,
                    }));
                  }
                }}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kaleci
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={formData.goalKeepersNeeded}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, "");
                  const numValue = value === "" ? 0 : parseInt(value);
                  if (numValue <= 5) {
                    setFormData((prev) => ({
                      ...prev,
                      goalKeepersNeeded: numValue,
                    }));
                  }
                }}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
          </div>
        </div>
      )}

      {/* Level Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Zorluk Seviyesi *
        </label>
        <select
          value={formData.level}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, level: e.target.value }))
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        >
          {levelOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Açıklama
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, notes: e.target.value }))
          }
          rows="3"
          placeholder="Maç hakkında ek bilgiler..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
        />
      </div>

      {/* Submit Button */}
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          onClick={onSubmit}
          disabled={
            isSubmitting ||
            !selectedDate ||
            !selectedTime ||
            !formData.customPitch.name ||
            !formData.customPitch.address
          }
          className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-md font-medium transition-colors cursor-pointer"
        >
          {isSubmitting ? "İlan Oluşturuluyor..." : "İlan Ver"}
        </button>
      </div>
    </div>
  );
}

// Turkish Date Picker Component
function TurkishDatePicker({ selectedDate, setSelectedDate, setSelectedTime }) {
  const [showCalendar, setShowCalendar] = useState(false);
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

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startDay = firstDay.getDay();
    const adjustedStartDay = startDay === 0 ? 6 : startDay - 1;

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

    // Sonraki ayın ilk günleri (gri)
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

  const todayISO = getTodayISO();
  const calendarDays = generateCalendarDays();

  return (
    <div className="relative">
      {/* Date Input */}
      <button
        type="button"
        onClick={() => setShowCalendar(!showCalendar)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        {selectedDate ? formatDateForDisplay(selectedDate) : "Tarih seçin"}
      </button>

      {/* Calendar Dropdown */}
      {showCalendar && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 w-80">
          {/* Calendar Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <svg
                className="w-5 h-5"
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
            <h3 className="text-lg font-semibold">
              {getTurkishMonth(calendarMonth)}
            </h3>
            <button
              type="button"
              onClick={() => changeMonth(1)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <svg
                className="w-5 h-5"
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
          <div className="grid grid-cols-7 gap-1 p-2 bg-gray-50">
            {getTurkishDayNames().map((dayName) => (
              <div
                key={dayName}
                className="text-center text-xs font-medium text-gray-600 py-2"
              >
                {dayName}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1 p-2">
            {calendarDays.map((dayObj, index) => {
              const isToday = dayObj.dateString === todayISO;
              const isSelected = dayObj.dateString === selectedDate;
              const isPast = dayObj.dateString < todayISO;
              const isCurrentMonth = dayObj.isCurrentMonth;

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => !isPast && handleDateSelect(dayObj.dateString)}
                  disabled={isPast}
                  className={`
                    p-2 text-sm rounded transition-colors
                    ${!isCurrentMonth ? "text-gray-400" : ""}
                    ${
                      isPast
                        ? "text-gray-300 cursor-not-allowed"
                        : "hover:bg-blue-50"
                    }
                    ${isToday ? "bg-blue-100 font-semibold" : ""}
                    ${isSelected ? "bg-green-600 text-white" : ""}
                  `}
                >
                  {dayObj.day}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {showCalendar && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowCalendar(false)}
        />
      )}
    </div>
  );
}

// Friends selection modal component
function FriendsSelectionModal({
  friends,
  selectedFriends,
  onFriendSelect,
  onClose,
  title,
  subtitle,
}) {
  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-60 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[70vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-2">
            {friends && friends.length > 0 ? (
              friends.map((friend) => (
                <div
                  key={friend._id}
                  onClick={() => onFriendSelect(friend._id)}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedFriends.includes(friend._id)
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-medium text-gray-600">
                          {friend.name?.charAt(0)?.toUpperCase() || "?"}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {friend.name || "İsimsiz"}
                        </p>
                        {friend.school && (
                          <p className="text-xs text-gray-500">
                            {friend.school}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center">
                      {friend.goalKeeper && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">
                          Kaleci
                        </span>
                      )}
                      {selectedFriends.includes(friend._id) && (
                        <svg
                          className="w-5 h-5 text-green-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">
                Arkadaş listeniz boş.
              </p>
            )}
          </div>

          <div className="flex gap-4 pt-4 mt-6 border-t">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors"
            >
              Tamam ({selectedFriends.length} seçili)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateAdModal;
