function MatchesFilters({ 
  activeFilter, 
  searchQuery, 
  onFilterChange, 
  onSearchChange,
  onCreateAdClick 
}) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => onFilterChange("all")}
          className={`px-6 py-2 rounded-full font-medium transition-colors cursor-pointer ${
            activeFilter === "all"
              ? "bg-green-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          tabIndex="0"
        >
          Tümü
        </button>
        <button
          onClick={() => onFilterChange("team-ads")}
          className={`px-6 py-2 rounded-full font-medium transition-colors cursor-pointer ${
            activeFilter === "team-ads"
              ? "bg-green-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          tabIndex="0"
        >
          Rakip Takım İlanları
        </button>
        <button
          onClick={() => onFilterChange("player-ads")}
          className={`px-6 py-2 rounded-full font-medium transition-colors cursor-pointer ${
            activeFilter === "player-ads"
              ? "bg-green-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          tabIndex="0"
        >
          Oyuncu İlanları
        </button>
      </div>
      
      <div className="flex gap-4 w-full sm:w-auto">
        <div className="flex-1 sm:flex-none">
          <input
            type="text"
            placeholder="Konum, tür, seviye arama yapın..."
            value={searchQuery}
            onChange={onSearchChange}
            className="w-full sm:w-80 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <button 
          onClick={onCreateAdClick}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-md transition-colors cursor-pointer whitespace-nowrap"
          tabIndex="0"
        >
          + İlan Ver
        </button>
      </div>
    </div>
  );
}

export default MatchesFilters;