import { useState } from "react";

function MobileFilters({
  selectedCity,
  setSelectedCity,
  selectedDistrict,
  setSelectedDistrict,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  selectedCapacity,
  setSelectedCapacity,
  selectedPitchTypes,
  setSelectedPitchTypes,
  selectedCameraSystems,
  setSelectedCameraSystems,
  selectedShoeRental,
  setSelectedShoeRental,
  selectedRating,
  setSelectedRating,
  onSearch,
  onClearFilters,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const handlePitchTypeChange = (type) => {
    setSelectedPitchTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleCameraSystemChange = (system) => {
    setSelectedCameraSystems((prev) =>
      prev.includes(system)
        ? prev.filter((s) => s !== system)
        : [...prev, system]
    );
  };

  const handleShoeRentalChange = (rental) => {
    setSelectedShoeRental((prev) =>
      prev.includes(rental)
        ? prev.filter((r) => r !== rental)
        : [...prev, rental]
    );
  };

  return (
    <div className="bg-gray-50 border-t border-b border-gray-200 py-4 lg:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg border border-gray-200">
          {/* Mobile Dropdown Header (only on mobile) */}
          <div className="sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
            >
              <h3 className="text-lg font-semibold text-gray-900">Filtreler</h3>
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
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
            </button>
          </div>

          {/* Tablet+ Static Header (tablet and up) */}
          <div className="hidden sm:flex lg:hidden items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Filtreler</h3>
            <button
              onClick={onClearFilters}
              className="bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors font-medium cursor-pointer text-sm"
              tabIndex="0"
            >
              Temizle
            </button>
          </div>

          {/* Filter Content */}
          <div
            className={`
              overflow-hidden transition-all duration-300 ease-out
              sm:overflow-visible sm:max-h-none sm:opacity-100
              ${isOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"}
            `}
          >
            <div className="p-4 sm:pt-0">
              {/* Mobile Clear Button */}
              <div className="sm:hidden mb-4 flex justify-end">
                <button
                  onClick={onClearFilters}
                  className="bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors font-medium cursor-pointer text-sm"
                  tabIndex="0"
                >
                  Temizle
                </button>
              </div>

              {/* Filter Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {/* Location Filters */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Şehir
                    </label>
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-sm"
                    >
                      <option value="">Tüm Şehirler</option>
                      <option value="İstanbul">İstanbul</option>
                      <option value="Ankara">Ankara</option>
                      <option value="İzmir">İzmir</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      İlçe
                    </label>
                    <select
                      value={selectedDistrict}
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-sm"
                      disabled={!selectedCity}
                    >
                      <option value="">Tüm İlçeler</option>
                      {selectedCity === "İstanbul" && (
                        <>
                          <option value="Beşiktaş">Beşiktaş</option>
                          <option value="Kadıköy">Kadıköy</option>
                          <option value="Şişli">Şişli</option>
                          <option value="Gaziosmanpaşa">Gaziosmanpaşa</option>
                          <option value="Ataşehir">Ataşehir</option>
                          <option value="Maltepe">Maltepe</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                {/* Price and Capacity */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Min Fiyat
                      </label>
                      <input
                        type="number"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        placeholder="₺"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Max Fiyat
                      </label>
                      <input
                        type="number"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        placeholder="₺"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kapasite
                    </label>
                    <select
                      value={selectedCapacity}
                      onChange={(e) => setSelectedCapacity(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-sm"
                    >
                      <option value="">Tüm Kapasiteler</option>
                      <option value="5v5">5v5</option>
                      <option value="6v6">6v6</option>
                      <option value="7v7">7v7</option>
                      <option value="8v8">8v8</option>
                      <option value="11v11">11v11</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Checkbox Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                {/* Pitch Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Saha Tipi
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedPitchTypes.includes("indoor")}
                        onChange={() => handlePitchTypeChange("indoor")}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                      />
                      <span className="ml-2 text-sm text-gray-700">Kapalı</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedPitchTypes.includes("outdoor")}
                        onChange={() => handlePitchTypeChange("outdoor")}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                      />
                      <span className="ml-2 text-sm text-gray-700">Açık</span>
                    </label>
                  </div>
                </div>

                {/* Camera System */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kamera Sistemi
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCameraSystems.includes("yes")}
                        onChange={() => handleCameraSystemChange("yes")}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                      />
                      <span className="ml-2 text-sm text-gray-700">Var</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCameraSystems.includes("no")}
                        onChange={() => handleCameraSystemChange("no")}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                      />
                      <span className="ml-2 text-sm text-gray-700">Yok</span>
                    </label>
                  </div>
                </div>

                {/* Shoe Rental */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ayakkabı Kiralama
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedShoeRental.includes("yes")}
                        onChange={() => handleShoeRentalChange("yes")}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                      />
                      <span className="ml-2 text-sm text-gray-700">Var</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedShoeRental.includes("no")}
                        onChange={() => handleShoeRentalChange("no")}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                      />
                      <span className="ml-2 text-sm text-gray-700">Yok</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Rating Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Puan
                </label>
                <select
                  value={selectedRating}
                  onChange={(e) => setSelectedRating(e.target.value)}
                  className="w-full sm:w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-sm"
                >
                  <option value="">Tüm Puanlar</option>
                  <option value="4.5">4.5+ ⭐</option>
                  <option value="4.0">4.0+ ⭐</option>
                  <option value="3.5">3.5+ ⭐</option>
                  <option value="3.0">3.0+ ⭐</option>
                </select>
              </div>

              {/* Apply Button */}
              <button
                onClick={onSearch}
                className="w-full bg-[rgb(0,128,0)] text-white py-2 px-4 rounded-md hover:bg-[rgb(0,100,0)] transition-colors font-semibold cursor-pointer text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                tabIndex="0"
              >
                Filtreleri Uygula
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MobileFilters;
