function MatchTypeDisplay({ advert, safeParticipants }) {
  if (advert.isRivalry?.status) {
    // Rakip Takım İlanları - Compact XvsX
    return (
      <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
        <div className="text-center">
          <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full mb-3 inline-block">
            Rakip Takım Maçı
          </span>

          <div className="bg-gradient-to-r from-red-50 to-blue-50 rounded-lg p-4 mb-3">
            <div className="flex items-center justify-center space-x-4">
              <div className="text-center">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mb-1">
                  <span className="text-white font-bold text-sm">
                    {Math.ceil(
                      ((advert.playersNeeded || 0) +
                        (advert.goalKeepersNeeded || 0)) /
                        2
                    )}
                  </span>
                </div>
              </div>

              <div className="text-center">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-1">
                  <span className="text-white font-bold text-sm">
                    {Math.ceil(
                      ((advert.playersNeeded || 0) +
                        (advert.goalKeepersNeeded || 0)) /
                        2
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } else if (advert.playersNeeded && advert.playersNeeded > 0) {
    // Oyuncu İlanları - Compact Progress Bar
    return (
      <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Oyuncu Durumu
            </span>
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
              {safeParticipants.length}/
              {(advert.playersNeeded || 0) + (advert.goalKeepersNeeded || 0)}
            </span>
          </div>

          <div className="relative">
            <div className="w-full bg-gray-200 rounded-lg h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-lg transition-all duration-300"
                style={{
                  width: `${Math.min(
                    100,
                    (safeParticipants.length /
                      ((advert.playersNeeded || 0) +
                        (advert.goalKeepersNeeded || 0))) *
                      100
                  )}%`,
                }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-green-50 rounded-md p-2 text-center">
              <p className="text-lg font-bold text-green-600">
                {safeParticipants.length}
              </p>
              <p className="text-xs text-green-700">Katılan</p>
            </div>
            <div className="bg-orange-50 rounded-md p-2 text-center">
              <p className="text-lg font-bold text-orange-600">
                {Math.max(
                  0,
                  (advert.playersNeeded || 0) +
                    (advert.goalKeepersNeeded || 0) -
                    safeParticipants.length
                )}
              </p>
              <p className="text-xs text-orange-700">Kalan</p>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    // Normal Takım Maçları - Compact X vs X
    return (
      <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-2">
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs mb-1">
                {Math.ceil(safeParticipants.length / 2)}
              </div>
            </div>
            <div className="text-sm font-bold text-gray-700">VS</div>
            <div className="text-center">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-xs mb-1">
                {Math.floor(safeParticipants.length / 2)}
              </div>
            </div>
          </div>
          <p className="text-sm font-medium text-gray-800">
            {safeParticipants.length} oyuncu
          </p>
        </div>
      </div>
    );
  }
}

export default MatchTypeDisplay;

