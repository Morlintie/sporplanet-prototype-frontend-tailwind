import MatchCard from "./MatchCard";
import MatchesFilters from "./MatchesFilters";

function MatchesList({
  matches,
  onJoinMatch,
  activeFilter,
  searchQuery,
  onFilterChange,
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
            searchQuery={searchQuery}
            onFilterChange={onFilterChange}
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
