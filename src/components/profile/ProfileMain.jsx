function ProfileMain({ user }) {
  const handleFollowClick = (type) => {
    console.log(`Clicked on ${type}`);
    // TODO: Implement follow/following functionality
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* User Photo and Stats */}
        <div className="flex flex-col items-center lg:items-start space-y-6">
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
            <button className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition-colors cursor-pointer" tabIndex="0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          </div>

          {/* Follow/Following Stats */}
          <div className="flex space-x-8">
            <button
              onClick={() => handleFollowClick('followers')}
              className="text-center hover:text-green-600 transition-colors cursor-pointer"
              tabIndex="0"
            >
              <div className="text-2xl font-bold text-gray-900">{user.followers}</div>
              <div className="text-sm text-gray-600 underline">Takip Edilenler</div>
            </button>
            <button
              onClick={() => handleFollowClick('following')}
              className="text-center hover:text-green-600 transition-colors cursor-pointer"
              tabIndex="0"
            >
              <div className="text-2xl font-bold text-gray-900">{user.following}</div>
              <div className="text-sm text-gray-600 underline">Takip Ettiklerim</div>
            </button>
          </div>
        </div>

        {/* User Details */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">{user.name}</h1>
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Verilerim</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Mevkim</div>
                  <div className="font-medium text-gray-900">{user.position}</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Forma Numaram</div>
                  <div className="font-medium text-gray-900">{user.jerseyNumber}</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Yaş</div>
                  <div className="font-medium text-gray-900">{user.age}</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Ayak Tercihim</div>
                  <div className="font-medium text-gray-900">{user.footPreference}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Hızlı İstatistikler</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{user.totalMatches}</div>
            <div className="text-sm text-gray-600">Toplam Maç</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{user.listedMatches}</div>
            <div className="text-sm text-gray-600">İlan Verdiğim</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{user.participatedMatches}</div>
            <div className="text-sm text-gray-600">Katıldığım</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{user.totalReservations}</div>
            <div className="text-sm text-gray-600">Rezervasyon</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileMain; 