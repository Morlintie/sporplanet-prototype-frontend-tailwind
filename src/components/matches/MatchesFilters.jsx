function MatchesFilters({
  activeFilter,
  searchQuery,
  activeDifficulty,
  onFilterChange,
  onSearchChange,
  onDifficultyChange,
  onCreateAdClick,
  onNearbySearch,
  isLoadingNearby,
}) {
  const filterOptions = [
    { value: "all", label: "Tümü" },
    { value: "team-ads", label: "Rakip Takım İlanları" },
    { value: "player-ads", label: "Oyuncu İlanları" },
  ];

  const difficultyOptions = [
    { value: "all", label: "Tüm Seviyeler" },
    { value: "beginner", label: "Başlangıç" },
    { value: "intermediate", label: "Orta" },
    { value: "advanced", label: "İleri" },
    { value: "pro", label: "Profesyonel" },
    { value: "professional", label: "Lig (oyuncu)" },
  ];

  return (
    <div className="flex flex-col lg:flex-row items-center justify-between mb-8 gap-4">
      {/* İlan Ver Button - En Başta */}
      <div className="order-1 lg:order-1">
        <button
          onClick={onCreateAdClick}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-md transition-colors cursor-pointer whitespace-nowrap text-lg"
          tabIndex="0"
        >
          + İlan Ver
        </button>
      </div>

      {/* Search Bar - Ortada */}
      <div className="order-2 lg:order-2 flex-1 max-w-md w-full">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
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
          </div>
          <input
            type="text"
            placeholder="Konum, tür, seviye arama yapın..."
            value={searchQuery}
            onChange={onSearchChange}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Buttons - Sağda */}
      <div className="order-3 lg:order-3 flex items-center gap-3">
        {/* Yakınımdakileri Bul */}
        <button
          onClick={onNearbySearch}
          disabled={isLoadingNearby}
          className="bg-[rgb(0,128,0)] hover:bg-[rgb(0,100,0)] disabled:bg-green-400 text-white font-semibold py-3 px-4 rounded-md transition-colors cursor-pointer disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 whitespace-nowrap flex items-center space-x-2"
          tabIndex="0"
        >
          {isLoadingNearby ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Aranıyor...</span>
            </>
          ) : (
            <>
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
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>Yakınımdakileri bul</span>
            </>
          )}
        </button>

        {/* Difficulty Level Dropdown */}
        <div className="relative">
          <select
            value={activeDifficulty}
            onChange={(e) => onDifficultyChange(e.target.value)}
            className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-3 pr-8 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-gray-300 focus:ring-offset-0 cursor-pointer"
          >
            {difficultyOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {/* Match Type Dropdown */}
        <div className="relative">
          <select
            value={activeFilter}
            onChange={(e) => onFilterChange(e.target.value)}
            className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-3 pr-8 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-gray-300 focus:ring-offset-0 cursor-pointer"
          >
            {filterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MatchesFilters;
