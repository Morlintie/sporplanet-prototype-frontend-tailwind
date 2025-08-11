import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function ProfileMain({ user }) {
  const [showAllPitches, setShowAllPitches] = useState(false);
  const navigate = useNavigate();
  const {
    getFavoritePitches,
    getRecentlySearchedPitches,
    getUserFriends,
    getFriendRequests,
    getSelfFriendRequests,
  } = useAuth();

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

  const handleFollowClick = (type) => {
    console.log(`Clicked on ${type}`);
    navigate("/profile?section=friends");
  };

  const handleEditProfile = () => {
    navigate("/profile?section=settings");
  };

  // Get user's recently searched pitches from auth context
  const recentlySearchedPitches = getRecentlySearchedPitches().map((pitch) => ({
    id: pitch._id,
    name: pitch.name,
    image:
      pitch.media?.images?.[0]?.url ||
      "https://res.cloudinary.com/dppjlhdth/image/upload/v1745746418/SporPlanet_Transparent_Logo_hecyyn.png",
    location: `${pitch.location.address.district}, ${pitch.location.address.city}`,
    rating: pitch.rating?.averageRating || 0,
    lastVisited: "Son görüntülenen",
  }));

  const pitchesToShow = showAllPitches
    ? recentlySearchedPitches
    : recentlySearchedPitches.slice(0, 3);

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
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
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
                    user.profilePicture ? "hidden" : "flex"
                  }`}
                >
                  {user.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </div>
              </div>
            </div>

            {/* Temel Bilgiler */}
            <div className="flex-1 text-center lg:text-left text-white">
              <h1 className="text-2xl lg:text-3xl font-bold">{user.name}</h1>
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
                {user.school && (
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
                        d="M12 14l9-5-9-5-9 5 9 5z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                      />
                    </svg>
                    {user.school}
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
              <button
                onClick={() => navigate("/profile?section=favorite-pitches")}
                className="bg-white/20 backdrop-blur text-white px-3 py-2 rounded-full hover:bg-white/30 transition-colors cursor-pointer flex items-center space-x-2"
                tabIndex="0"
              >
                <svg
                  className="w-5 h-5 text-red-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                <span className="text-sm font-medium">
                  {getFavoritePitches().length}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Hakkımda Section - Üst Kısım */}
        <div className="mb-8">
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold text-gray-900">Hakkımda</h2>
              <button
                onClick={() => navigate("/profile?section=settings")}
                className="text-sm text-green-600 hover:text-green-700 transition-colors cursor-pointer"
                tabIndex="0"
              >
                Düzenle
              </button>
            </div>
            {user.description ? (
              <p className="text-gray-700 leading-relaxed">
                {user.description}
              </p>
            ) : (
              <p className="text-gray-500 italic">
                Henüz bir açıklama eklemediniz. Kendinizi tanıtmak için bir
                açıklama ekleyin.
              </p>
            )}
          </div>
        </div>

        {/* Hesap Durumu Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
            Hesap Durumu
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-100 border border-gray-200 rounded-lg shadow-sm">
              <div className="text-lg font-semibold text-gray-900 mb-2">
                {user.role === "admin"
                  ? "Yönetici"
                  : user.role === "companyOwner"
                  ? "Şirket Sahibi"
                  : user.role === "user"
                  ? "Kullanıcı"
                  : "Bilinmeyen"}
              </div>
              <div className="text-sm text-gray-600">Hesap Türü</div>
            </div>
            <div className="text-center p-4 bg-gray-100 border border-gray-200 rounded-lg shadow-sm">
              <div className="text-lg font-semibold text-gray-900 mb-2">
                {user.goalKeeper ? "Evet" : "Hayır"}
              </div>
              <div className="text-sm text-gray-600">Kaleci mi?</div>
            </div>
            {user.student && (
              <div className="text-center p-4 bg-gray-100 border border-gray-200 rounded-lg shadow-sm">
                <div className="text-lg font-semibold text-gray-900 mb-2">
                  {user.student.status === "confirmed"
                    ? "Onaylandı"
                    : user.student.status === "pending"
                    ? "Beklemede"
                    : user.student.status === "declined"
                    ? "Reddedildi"
                    : "Bilinmiyor"}
                </div>
                <div className="text-sm text-gray-600">Öğrenci Durumu</div>
              </div>
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
                {user.advertParticipation?.length || 0}
              </div>
              <div className="text-sm text-gray-600">İlana Katıldı</div>
            </div>
            <div className="text-center p-4 bg-gray-100 border border-gray-200 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-gray-900">
                {user.advertWaitingList?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Bekleme Listesi</div>
            </div>
            <div className="text-center p-4 bg-gray-100 border border-gray-200 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-gray-900">
                {user.bookings?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Rezervasyon Yaptı</div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-gray-200 mb-8" />

        {/* Sosyal Bağlantılar Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
            Sosyal Bağlantılar
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-100 border border-gray-200 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-gray-900">
                {user.friends?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Arkadaş</div>
            </div>
            <div className="text-center p-4 bg-gray-100 border border-gray-200 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-gray-900">
                {user.friendRequests?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Gelen İstek</div>
            </div>
            <div className="text-center p-4 bg-gray-100 border border-gray-200 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-gray-900">
                {user.selfFriendRequests?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Gönderilen İstek</div>
            </div>
            <div className="text-center p-4 bg-gray-100 border border-gray-200 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-gray-900">
                {user.bannedProfiles?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Engellenen</div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-gray-200 mb-8" />

        {/* Saha Bilgileri Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
            Saha Bilgileri
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <div className="text-center p-4 bg-gray-100 border border-gray-200 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-gray-900">
                {user.favoritePitches?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Favori Saha</div>
            </div>
            <div className="text-center p-4 bg-gray-100 border border-gray-200 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-gray-900">
                {user.recentlySearchedPitch?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Son Aranan Saha</div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-gray-200 mb-8" />

        {/* Hesap Bilgileri Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
            Hesap Bilgileri
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gray-100 border border-gray-200 rounded-lg shadow-sm">
              <div className="text-lg font-semibold text-gray-900 mb-2">
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("tr-TR")
                  : "Bilinmiyor"}
              </div>
              <div className="text-sm text-gray-600">Hesap Oluşturulma</div>
            </div>
            <div className="text-center p-4 bg-gray-100 border border-gray-200 rounded-lg shadow-sm">
              <div className="text-lg font-semibold text-gray-900 mb-2">
                {user.updatedAt
                  ? new Date(user.updatedAt).toLocaleDateString("tr-TR")
                  : "Bilinmiyor"}
              </div>
              <div className="text-sm text-gray-600">Son Güncelleme</div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-gray-200 mb-8" />

        {/* Son Aranan Sahalar */}
        <div>
          <h2 className="text-xl font-bold text-center text-gray-900 mb-6">
            Son Aranan Sahalar
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pitchesToShow.map((pitch) => (
              <div
                key={pitch.id}
                className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                  <img
                    src={pitch.image}
                    alt={pitch.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src =
                        "https://res.cloudinary.com/dppjlhdth/image/upload/v1745746418/SporPlanet_Transparent_Logo_hecyyn.png";
                    }}
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {pitch.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{pitch.location}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <svg
                        className="w-4 h-4 text-yellow-400 mr-1"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      <span className="text-sm text-gray-600">
                        {pitch.rating}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {pitch.lastVisited}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {recentlySearchedPitches.length > 3 && (
            <div className="text-center mt-6">
              <button
                onClick={() => setShowAllPitches(!showAllPitches)}
                className="text-green-600 hover:text-green-700 font-medium text-sm transition-colors"
              >
                {showAllPitches ? "Daha Az Göster" : "Daha Fazla Gör"}
              </button>
            </div>
          )}

          {recentlySearchedPitches.length === 0 && (
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
                Henüz saha aramadınız
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Aradığınız sahalar burada görünecek.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfileMain;
