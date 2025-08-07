import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function ProfileMain({ user }) {
  const [showAllPitches, setShowAllPitches] = useState(false);
  const navigate = useNavigate();
  const { getFavoritePitches, getRecentlySearchedPitches } = useAuth();

  const handleFollowClick = (type) => {
    console.log(`Clicked on ${type}`);
    navigate("/profile?section=friends");
  };

  const handleEditProfile = () => {
    navigate("/profile?section=settings");
  };

  // Get user's recently searched pitches from auth context
  const recentlySearchedPitches = getRecentlySearchedPitches().map(pitch => ({
    id: pitch._id,
    name: pitch.name,
    image: "https://res.cloudinary.com/dppjlhdth/image/upload/v1745746418/SporPlanet_Transparent_Logo_hecyyn.png",
    location: `${pitch.location.address.neighborhood}, ${pitch.location.address.city}`,
    rating: pitch.rating?.averageRating || 0,
    lastVisited: "Son görüntülenen"
  }));

  const pitchesToShow = showAllPitches ? recentlySearchedPitches : recentlySearchedPitches.slice(0, 3);

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      {/* Header Section - Profile Photo, Stats */}
      <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 mb-8">
        {/* Profile Photo */}
        <div className="relative">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
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
            <div className={`w-full h-full flex items-center justify-center text-4xl font-bold text-gray-500 ${user.profilePicture ? "hidden" : "flex"}`}>
              {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
          </div>
          <button 
            onClick={handleEditProfile}
            className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition-colors cursor-pointer" 
            tabIndex="0"
            title="Profili düzenle"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        </div>

        {/* Stats Row */}
        <div className="flex-1 flex justify-center items-center">
          <div className="flex space-x-12 lg:space-x-16 pt-6">
            <button
              onClick={() => handleFollowClick('followers')}
              className="text-center hover:text-green-600 transition-colors cursor-pointer"
              tabIndex="0"
            >
              <div className="text-3xl lg:text-4xl font-bold text-gray-900">{user.followers}</div>
              <div className="text-base lg:text-lg text-gray-600 font-medium">Takip Edenler</div>
            </button>
            <button
              onClick={() => handleFollowClick('following')}
              className="text-center hover:text-green-600 transition-colors cursor-pointer"
              tabIndex="0"
            >
              <div className="text-3xl lg:text-4xl font-bold text-gray-900">{user.following}</div>
              <div className="text-base lg:text-lg text-gray-600 font-medium">Takip Ettiklerim</div>
            </button>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-gray-900 flex items-center justify-center">
                <svg className="w-7 h-7 lg:w-8 lg:h-8 text-red-500 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                {getFavoritePitches().length}
              </div>
              <div className="text-base lg:text-lg text-gray-600 font-medium">
                <button 
                  onClick={() => navigate("/profile?section=favorite-pitches")}
                  className="hover:text-green-600 transition-colors"
                >
                  Favorilerim
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <hr className="border-gray-200 mb-8" />

      {/* Verilerim Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">Verilerim</h2>
        <div className="flex justify-between items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <div className="text-sm text-gray-500">Mevki</div>
              <div className="font-medium text-gray-900">{user.preferredPosition || "Belirtilmemiş"}</div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div>
              <div className="text-sm text-gray-500">Forma Numarası</div>
              <div className="font-medium text-gray-900">{user.jerseyNumber || "Belirtilmemiş"}</div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-sm text-gray-500">Yaş</div>
              <div className="font-medium text-gray-900">{user.age || "Belirtilmemiş"}</div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
            </div>
            <div>
              <div className="text-sm text-gray-500">Ayak Tercihi</div>
              <div className="font-medium text-gray-900">{user.preferredFoot === 'both' ? 'Her İki Ayak' : user.preferredFoot === 'left' ? 'Sol Ayak' : user.preferredFoot === 'right' ? 'Sağ Ayak' : 'Belirtilmemiş'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <hr className="border-gray-200 mb-8" />

      {/* İstatistikler Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">İstatistikler</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-indigo-50 rounded-lg">
            <div className="text-2xl font-bold text-indigo-600">{user.friends?.length || 0}</div>
            <div className="text-sm text-gray-600">Arkadaş</div>
          </div>
          <div className="text-center p-4 bg-teal-50 rounded-lg">
            <div className="text-2xl font-bold text-teal-600">{user.followers?.length || 0}</div>
            <div className="text-sm text-gray-600">Takip Eden</div>
          </div>
          <div className="text-center p-4 bg-pink-50 rounded-lg">
            <div className="text-2xl font-bold text-pink-600">{user.following?.length || 0}</div>
            <div className="text-sm text-gray-600">Takip Ettiği</div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <hr className="border-gray-200 mb-8" />

      {/* En Son Ziyaret Ettiğim Sahalar */}
      <div>
        <h2 className="text-xl font-bold text-center text-gray-900 mb-6">En Son Ziyaret Ettiğim Sahalar</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pitchesToShow.map((pitch) => (
            <div key={pitch.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                <img 
                  src={pitch.image} 
                  alt={pitch.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{pitch.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{pitch.location}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    <span className="text-sm text-gray-600">{pitch.rating}</span>
                  </div>
                  <span className="text-xs text-gray-500">{pitch.lastVisited}</span>
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
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Henüz saha aramadınız</h3>
            <p className="mt-1 text-sm text-gray-500">Aradığınız sahalar burada görünecek.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfileMain; 