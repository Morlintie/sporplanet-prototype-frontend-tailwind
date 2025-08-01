import { useNavigate } from "react-router-dom";

function PitchReservationCard({
  pitch,
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  handleReservation,
}) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Rezervasyon Yap</h2>

      {/* Price */}
      <div className="mb-6">
        <div className="text-3xl font-bold text-gray-900">₺{pitch.price}</div>
        {pitch.nightPrice && pitch.nightPrice !== pitch.price && (
          <div className="text-lg text-gray-600">Gece: ₺{pitch.nightPrice}</div>
        )}
      </div>

      {/* Date Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tarih Seç
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          min={new Date().toISOString().split("T")[0]}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Time Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Saat Seç
        </label>
        <select
          value={selectedTime}
          onChange={(e) => setSelectedTime(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="">Saat seçiniz</option>
          {pitch.availableHours.map((hour) => (
            <option key={hour} value={hour}>
              {hour}
            </option>
          ))}
        </select>
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

      {/* Reservation Button */}
      <button
        onClick={handleReservation}
        disabled={pitch.status !== "active"}
        className={`w-full py-3 px-4 rounded-md font-semibold transition-colors ${
          pitch.status === "active"
            ? "bg-[rgb(0,128,0)] hover:bg-[rgb(0,100,0)] text-white"
            : pitch.status === "maintenance"
            ? "bg-gray-100 border border-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        {pitch.status === "active"
          ? "Rezervasyon Yap"
          : pitch.status === "maintenance"
          ? "Rezervasyon Yap"
          : "Rezervasyon Yapılamaz"}
      </button>

      {/* Back to Pitches */}
      <button
        onClick={() => navigate("/reservation")}
        className="w-full mt-3 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
      >
        Sahalara Dön
      </button>
    </div>
  );
}

export default PitchReservationCard;
