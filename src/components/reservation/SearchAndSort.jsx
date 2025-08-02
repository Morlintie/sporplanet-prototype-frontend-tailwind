import { useRef } from "react";

function SearchAndSort({
  onSearch,
  onSort,
  onNearbySearch,
  sortBy,
  searchTerm,
  setSearchTerm,
}) {
  const searchTimeoutRef = useRef(null);

  const sortOptions = [
    { value: "default", label: "Varsayılan" },
    { value: "price-low", label: "Fiyat (Düşükten Yükseğe)" },
    { value: "price-high", label: "Fiyat (Yüksekten Düşüğe)" },
    { value: "rating", label: "Puan" },
    { value: "name", label: "İsim" },
  ];

  const handleSearchChange = (e) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Trigger search after a short delay to avoid too many calls
    searchTimeoutRef.current = setTimeout(() => {
      onSearch(newSearchTerm);
    }, 300);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      // Clear any pending timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      onSearch(searchTerm);
    }
  };

  return (
    <section className="py-4 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search Bar and Location Button */}
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Saha ara..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
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
              </div>
            </div>

            {/* Nearby Places Button */}
            <button
              onClick={onNearbySearch}
              className="bg-[rgb(0,128,0)] hover:bg-[rgb(0,100,0)] text-white font-semibold py-2 px-4 rounded-md transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 whitespace-nowrap"
              tabIndex="0"
            >
              Yakınımdakileri bul
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Sırala:</label>
            <select
              value={sortBy}
              onChange={(e) => onSort(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white min-w-[200px]"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SearchAndSort;
