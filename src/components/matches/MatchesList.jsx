import MatchCard from "./MatchCard";
import MatchesFilters from "./MatchesFilters";

function MatchesList({
  matches,
  onJoinMatch,
  activeFilter,
  activeDifficulty,
  searchQuery,
  onFilterChange,
  onDifficultyChange,
  onSearchChange,
  onCreateAdClick,
  onNearbySearch,
  isLoadingNearby,
  // Backend integration props
  isLoading,
  error,
  currentPage,
  totalMatches,
  limit,
  hasMore,
  onLoadMore,
  showLoadingSpinner,
  showErrorDisplay,
  LoadingSpinner,
  ErrorDisplay,
  // Pagination props
  totalPages,
  indexOfFirstMatch,
  indexOfLastMatch,
  onPageChange,
  getPageNumbers,
}) {
  return (
    <section className="py-16 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-none lg:max-w-7xl lg:mx-auto">
        <div className="text-center mb-8 w-full">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Maç İlanları
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            {totalMatches || matches.length} maç bulundu
            {totalPages > 1 && (
              <span className="ml-2">
                (Sayfa {currentPage} / {totalPages})
              </span>
            )}
          </p>

          {/* Filters moved here */}
          <MatchesFilters
            activeFilter={activeFilter}
            activeDifficulty={activeDifficulty}
            searchQuery={searchQuery}
            onFilterChange={onFilterChange}
            onDifficultyChange={onDifficultyChange}
            onSearchChange={onSearchChange}
            onCreateAdClick={onCreateAdClick}
            onNearbySearch={onNearbySearch}
            isLoadingNearby={isLoadingNearby}
          />
        </div>

        {/* Content Area - Show loading/error states or match cards */}
        {showLoadingSpinner ? (
          <LoadingSpinner />
        ) : showErrorDisplay ? (
          <ErrorDisplay />
        ) : matches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-md w-full text-center">
              <div className="text-gray-400 mb-4">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Maç Bulunamadı
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {activeFilter === "all"
                  ? "Henüz hiç maç ilanı yok. İlk maç ilanını sen oluştur!"
                  : activeFilter === "team-ads"
                  ? "Rakip takım ilanı bulunamadı. Farklı filtreler deneyebilirsin."
                  : activeFilter === "player-ads"
                  ? "Oyuncu ilanı bulunamadı. Farklı filtreler deneyebilirsin."
                  : "Arama kriterlerine uygun maç bulunamadı. Farklı filtreler deneyebilirsin."}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={onCreateAdClick}
                  className="bg-[rgb(0,128,0)] hover:bg-[rgb(0,100,0)] text-white font-semibold py-2 px-4 rounded-md transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  tabIndex="0"
                >
                  + İlan Ver
                </button>
                {(activeFilter !== "all" ||
                  activeDifficulty !== "all" ||
                  searchQuery) && (
                  <button
                    onClick={() => {
                      onFilterChange("all");
                      onDifficultyChange("all");
                      onSearchChange({ target: { value: "" } });
                    }}
                    className="border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    tabIndex="0"
                  >
                    Tüm Maçları Göster
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Match Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 w-full">
              {matches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  onJoinMatch={onJoinMatch}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8">
                {/* Mobile Pagination Info */}
                <div className="sm:hidden text-center mb-4">
                  <p className="text-sm text-gray-600">
                    Sayfa {currentPage} / {totalPages} - Toplam {totalMatches}{" "}
                    maç
                  </p>
                </div>

                {/* Pagination Controls */}
                <div className="flex justify-center">
                  <nav className="flex items-center space-x-1 sm:space-x-2">
                    {/* Previous Button */}
                    <button
                      onClick={() => onPageChange(currentPage - 1)}
                      disabled={currentPage === 1 || isLoading}
                      className={`px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                        currentPage === 1 || isLoading
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                      }`}
                    >
                      <span className="hidden sm:inline">Önceki</span>
                      <span className="sm:hidden">‹</span>
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center space-x-1">
                      {getPageNumbers().map((pageNumber, index) => (
                        <button
                          key={index}
                          onClick={() =>
                            typeof pageNumber === "number" &&
                            onPageChange(pageNumber)
                          }
                          disabled={typeof pageNumber !== "number" || isLoading}
                          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center justify-center ${
                            pageNumber === currentPage
                              ? "bg-[rgb(0,128,0)] text-white shadow-md"
                              : typeof pageNumber === "number"
                              ? "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 hover:border-gray-400"
                              : "bg-transparent text-gray-400 cursor-default"
                          } ${
                            isLoading ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                        >
                          {pageNumber}
                        </button>
                      ))}
                    </div>

                    {/* Next Button */}
                    <button
                      onClick={() => onPageChange(currentPage + 1)}
                      disabled={currentPage === totalPages || isLoading}
                      className={`px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                        currentPage === totalPages || isLoading
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                      }`}
                    >
                      <span className="hidden sm:inline">Sonraki</span>
                      <span className="sm:hidden">›</span>
                    </button>
                  </nav>
                </div>

                {/* Desktop Pagination Info */}
                <div className="hidden sm:block text-center mt-4">
                  <p className="text-sm text-gray-600">
                    Gösterilen: {indexOfFirstMatch}-{indexOfLastMatch} /{" "}
                    {totalMatches} maç
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

export default MatchesList;
