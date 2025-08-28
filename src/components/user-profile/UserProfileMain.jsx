import { useState } from "react";
import { useWebSocket } from "../../context/WebSocketContext";

function UserProfileMain({ user }) {
  const { isUserOnline } = useWebSocket();
  const [showAllPitches, setShowAllPitches] = useState(false);

  if (!user) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">
          Kullanıcı bilgileri yüklenemedi.
        </div>
      </div>
    );
  }

  // Backend mevki kodlarını Türkçe'ye çevir
  const positionLabels = {
    cb: "Stoper",
    rb: "Sağ Bek",
    lb: "Sol Bek",
    rwb: "Sağ Kanat Bek",
    lwb: "Sol Kanat Bek",
    dm: "Ön Libero",
    cm: "Merkez Orta Saha",
    rw: "Sağ Kanat",
    lw: "Sol Kanat",
    st: "Forvet",
    gk: "Kaleci",
  };

  // Get user's favorite pitches from user data
  const favoritePitches = user.favoritePitches || [];

  const processedPitches = favoritePitches.map((pitch) => {
    // Primary image selection logic - prioritize isPrimary, then first image
    const primaryImage = pitch.media?.images?.find((img) => img.isPrimary);
    const firstImage = pitch.media?.images?.[0];
    const imageUrl = primaryImage?.url || firstImage?.url;

    return {
      id: pitch._id,
      name: pitch.name,
      image: imageUrl,
      location: `${pitch.location?.address?.neighborhood || ""}, ${
        pitch.location?.address?.city || ""
      }`,
      rating: pitch.rating?.averageRating || 0,
      totalReviews: pitch.rating?.totalReviews || 0,
      price: `${pitch.pricing?.hourlyRate || "N/A"}₺/saat`,
      category: pitch.category || "Futbol",
      features: [
        ...(pitch.facilities?.changingRooms ? ["Soyunma Odası"] : []),
        ...(pitch.facilities?.showers ? ["Duş"] : []),
        ...(pitch.facilities?.parking ? ["Otopark"] : []),
        ...(pitch.specifications?.hasLighting ? ["Işıklandırma"] : []),
        ...(pitch.specifications?.isIndoor ? ["Kapalı"] : ["Açık"]),
        ...(pitch.facilities?.camera ? ["Kamera"] : []),
        ...(pitch.facilities?.shoeRenting ? ["Ayakkabı Kiralama"] : []),
      ],
    };
  });

  const pitchesToShow = showAllPitches
    ? processedPitches
    : processedPitches.slice(0, 3);

  return (
    <div className="bg-white rounded-lg shadow-md w-full overflow-hidden">
      {/* Banner: Avatar + Temel Bilgiler */}
      <div
        className="relative rounded-t-lg overflow-hidden w-full"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.35)), url('https://images.pexels.com/photos/114296/pexels-photo-114296.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
          <div className="flex flex-col lg:flex-row items-center lg:items-end gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-28 h-28 lg:w-32 lg:h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center ring-4 ring-white">
                {user.profilePicture?.url ? (
                  <img
                    src={user.profilePicture.url}
                    alt={user.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className={`w-full h-full flex items-center justify-center text-4xl font-bold text-gray-500 ${
                    user.profilePicture?.url ? "hidden" : "flex"
                  }`}
                >
                  {user.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </div>
              </div>

              {/* Online Status Indicator */}
              {isUserOnline && user._id && isUserOnline(user._id) && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 border-4 border-white rounded-full"></div>
              )}
            </div>

            {/* Temel Bilgiler */}
            <div className="flex-1 text-center lg:text-left text-white">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <h1 className="text-2xl lg:text-3xl font-bold">{user.name}</h1>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0 items-center">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                        />
                      </svg>
                      İstek Yolla
                    </button>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      Mesaj
                    </button>
                  </div>

                  {/* Block User Icon - Tiny and Subtle */}
                  <button
                    className="bg-red-500/80 hover:bg-red-600 text-white p-2 rounded-full transition-colors group"
                    title="Kullanıcıyı Engelle"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="mt-2 flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4 justify-center lg:justify-start text-sm lg:text-base">
                <span className="inline-flex items-center bg-white/20 backdrop-blur px-3 py-1 rounded-full">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  {positionLabels[user.preferredPosition] ||
                    "Mevki Belirtilmemiş"}
                </span>
                <span className="inline-flex items-center bg-white/20 backdrop-blur px-3 py-1 rounded-full">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586"
                    />
                  </svg>
                  Forma #{user.jerseyNumber || "-"}
                </span>
                <span className="inline-flex items-center bg-white/20 backdrop-blur px-3 py-1 rounded-full">
                  <svg
                    className="w-4 h-4 mr-1"
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
                  {user.age || "Yaş Yok"}
                </span>
                <span className="inline-flex items-center bg-white/20 backdrop-blur px-3 py-1 rounded-full">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 11l5-5m0 0l5 5m-5-5v12"
                    />
                  </svg>
                  {user.preferredFoot === "both"
                    ? "Her İki Ayak"
                    : user.preferredFoot === "left"
                    ? "Sol Ayak"
                    : user.preferredFoot === "right"
                    ? "Sağ Ayak"
                    : "Belirtilmemiş"}
                </span>
              </div>
              {user.description && (
                <p className="mt-3 text-white/90 text-sm lg:text-base max-w-2xl">
                  {user.description}
                </p>
              )}

              {/* Additional User Info */}
              <div className="mt-3 flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4 justify-center lg:justify-start text-sm lg:text-base">
                {user.location && (
                  <span className="inline-flex items-center bg-white/20 backdrop-blur px-3 py-1 rounded-full">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {user.location.district}, {user.location.city}
                  </span>
                )}
                {user.role && user.role !== "user" && (
                  <span
                    className={`inline-flex items-center backdrop-blur px-3 py-1 rounded-full ${
                      user.role === "admin"
                        ? "bg-purple-500/20"
                        : user.role === "companyOwner"
                        ? "bg-yellow-500/20"
                        : user.role === "banned"
                        ? "bg-red-500/20"
                        : "bg-white/20"
                    }`}
                  >
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 14l9-5-9-5-9 5 9 5z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                      />
                    </svg>
                    {user.role === "admin"
                      ? "Admin"
                      : user.role === "companyOwner"
                      ? "Şirket Sahibi"
                      : user.role === "banned"
                      ? "Yasaklı"
                      : "Kullanıcı"}
                  </span>
                )}
                {user.phoneNumber && (
                  <span className="inline-flex items-center bg-white/20 backdrop-blur px-3 py-1 rounded-full">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    {user.phoneNumber}
                  </span>
                )}
              </div>
            </div>

            {/* Favorilerim Badge - Sağ Üst */}
            <div className="absolute top-4 right-4">
              <div className="bg-white/20 backdrop-blur text-white px-3 py-2 rounded-full flex items-center space-x-2">
                <svg
                  className="w-5 h-5 text-red-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                <span className="text-sm font-medium">
                  {favoritePitches.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Hakkımda Section - Üst Kısım */}
        <div className="mb-8">
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold text-gray-900">Hakkında</h2>
            </div>
            {user.description ? (
              <p className="text-gray-700 leading-relaxed">
                {user.description}
              </p>
            ) : (
              <p className="text-gray-500 italic">
                Bu kullanıcı henüz bir açıklama eklememış.
              </p>
            )}
          </div>
        </div>

        {/* İstatistikler Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
            İstatistikler
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-100 border border-gray-200 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-gray-900">
                {user.advertWaitingList?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Bekleyen İlan</div>
            </div>
            <div className="text-center p-4 bg-gray-100 border border-gray-200 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-gray-900">
                {user.advertParticipation?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Katıldığı İlan</div>
            </div>
            <div className="text-center p-4 bg-gray-100 border border-gray-200 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-gray-900">
                {user.friends?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Arkadaş Sayısı</div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-gray-200 mb-8" />

        {/* Favori Sahalar */}
        <div>
          <h2 className="text-xl font-bold text-center text-gray-900 mb-6">
            Favori Sahalar
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pitchesToShow.map((pitch) => (
              <div
                key={pitch.id}
                className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative">
                  <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                    {pitch.image ? (
                      <img
                        src={pitch.image}
                        alt={pitch.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className={`w-full h-full flex items-center justify-center bg-gray-100 ${
                        pitch.image ? "hidden" : "flex"
                      }`}
                      style={{ display: pitch.image ? "none" : "flex" }}
                    >
                      <div className="text-center">
                        <svg
                          className="w-12 h-12 text-gray-400 mx-auto mb-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <p className="text-xs text-gray-500">Fotoğraf Yok</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {pitch.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2 flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {pitch.location}
                  </p>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <svg
                        className="w-4 h-4 text-yellow-400 mr-1"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      <span className="text-sm text-gray-600">
                        {pitch.rating > 0 ? pitch.rating : "N/A"}
                        {pitch.totalReviews > 0 && (
                          <span className="text-xs text-gray-500 ml-1">
                            ({pitch.totalReviews})
                          </span>
                        )}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-green-600">
                      {pitch.price}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {pitch.features.slice(0, 3).map((feature, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded"
                      >
                        {feature}
                      </span>
                    ))}
                    {pitch.features.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded">
                        +{pitch.features.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {processedPitches.length > 3 && (
            <div className="text-center mt-6">
              <button
                onClick={() => setShowAllPitches(!showAllPitches)}
                className="text-green-600 hover:text-green-700 font-medium text-sm transition-colors"
              >
                {showAllPitches ? "Daha Az Göster" : "Daha Fazla Gör"}
              </button>
            </div>
          )}

          {processedPitches.length === 0 && (
            <div className="text-center py-8">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Henüz favori saha yok
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Bu kullanıcı henüz hiç saha favorilerine eklememiş.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserProfileMain;
