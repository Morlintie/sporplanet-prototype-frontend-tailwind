import { useState, useEffect } from "react";
import dummyData from "../../../dummydata.json";

function ReservationFilters({
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
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState({});
  const [capacityOptions, setCapacityOptions] = useState([]);

  // Extract unique cities, districts and capacities from dummy data
  useEffect(() => {
    try {
      // Filter out inactive pitches first
      const activePitches = dummyData.filter(item => item.status !== 'inactive');
      console.log(`Processing filters from ${activePitches.length} active pitches (${dummyData.length - activePitches.length} inactive excluded)`);
      
      // Extract cities
      const uniqueCities = [...new Set(activePitches.map(item => item.location?.address?.city).filter(Boolean))];
      console.log(`Found ${uniqueCities.length} unique cities:`, uniqueCities);
      setCities(uniqueCities.sort());

      // Extract districts grouped by city
      const districtsMap = {};
      activePitches.forEach(item => {
        const city = item.location?.address?.city;
        const district = item.location?.address?.district;
        if (city && district) {
          if (!districtsMap[city]) {
            districtsMap[city] = new Set();
          }
          districtsMap[city].add(district);
        }
      });

      // Convert sets to arrays and sort
      const districtsObj = {};
      Object.keys(districtsMap).forEach(city => {
        districtsObj[city] = [...districtsMap[city]].sort();
      });
      setDistricts(districtsObj);

      // Generate capacity options from 5v5 to 11v11
      const capacityOpts = [
        { value: "", label: "Tüm Kapasiteler" },
        { value: "10 oyuncu", label: "5v5 (10 oyuncu)" },
        { value: "12 oyuncu", label: "6v6 (12 oyuncu)" },
        { value: "14 oyuncu", label: "7v7 (14 oyuncu)" },
        { value: "16 oyuncu", label: "8v8 (16 oyuncu)" },
        { value: "18 oyuncu", label: "9v9 (18 oyuncu)" },
        { value: "20 oyuncu", label: "10v10 (20 oyuncu)" },
        { value: "22 oyuncu", label: "11v11 (22 oyuncu)" }
      ];
      setCapacityOptions(capacityOpts);

    } catch (error) {
      console.error("Error processing dummy data for filters:", error);
      // Fallback values
      setCities([]);
      setDistricts({});
      setCapacityOptions([
        { value: "", label: "Tüm Kapasiteler" },
        { value: "10 oyuncu", label: "5v5 (10 oyuncu)" },
        { value: "12 oyuncu", label: "6v6 (12 oyuncu)" },
        { value: "14 oyuncu", label: "7v7 (14 oyuncu)" },
        { value: "16 oyuncu", label: "8v8 (16 oyuncu)" },
        { value: "18 oyuncu", label: "9v9 (18 oyuncu)" },
        { value: "20 oyuncu", label: "10v10 (20 oyuncu)" },
        { value: "22 oyuncu", label: "11v11 (22 oyuncu)" }
      ]);
    }
  }, []);

  // Checkbox handlers
  const handlePitchTypeChange = (type) => {
    if (selectedPitchTypes.includes(type)) {
      setSelectedPitchTypes(selectedPitchTypes.filter((t) => t !== type));
    } else {
      setSelectedPitchTypes([...selectedPitchTypes, type]);
    }
  };

  const handleCameraSystemChange = (system) => {
    if (selectedCameraSystems.includes(system)) {
      setSelectedCameraSystems(
        selectedCameraSystems.filter((s) => s !== system)
      );
    } else {
      setSelectedCameraSystems([...selectedCameraSystems, system]);
    }
  };

  const handleShoeRentalChange = (rental) => {
    if (selectedShoeRental.includes(rental)) {
      setSelectedShoeRental(selectedShoeRental.filter((r) => r !== rental));
    } else {
      setSelectedShoeRental([...selectedShoeRental, rental]);
    }
  };

  // İl değiştiğinde ilçeyi sıfırla
  const handleCityChange = (city) => {
    setSelectedCity(city);
    setSelectedDistrict(""); // İlçeyi sıfırla
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 h-fit">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Filtreler</h3>

      <div className="space-y-6">
        {/* City Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            İl
          </label>
          <select
            value={selectedCity}
            onChange={(e) => handleCityChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
          >
            <option value="">İl Seçin</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* District Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            İlçe
          </label>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            disabled={!selectedCity}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm ${
              !selectedCity
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : ""
            }`}
          >
            <option value="">
              {selectedCity ? "İlçe Seçin" : "Önce İl Seçin"}
            </option>
            {selectedCity &&
              districts[selectedCity]?.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
          </select>
        </div>

        {/* Price Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fiyat Aralığı
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <input
                type="number"
                placeholder="Min ₺"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
            </div>
            <div>
              <input
                type="number"
                placeholder="Max ₺"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Capacity Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Saha Kapasitesi
          </label>
          <select
            value={selectedCapacity}
            onChange={(e) => setSelectedCapacity(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
          >
            {capacityOptions.map((capacity) => (
              <option key={capacity.value} value={capacity.value}>
                {capacity.label}
              </option>
            ))}
          </select>
        </div>

        {/* Pitch Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
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
              <span className="ml-2 text-sm text-gray-700">Kapalı Saha</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={selectedPitchTypes.includes("outdoor")}
                onChange={() => handlePitchTypeChange("outdoor")}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
              />
              <span className="ml-2 text-sm text-gray-700">Açık Saha</span>
            </label>
          </div>
        </div>

        {/* Camera System Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
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
              <span className="ml-2 text-sm text-gray-700">
                Kamera Sistemi Var
              </span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={selectedCameraSystems.includes("no")}
                onChange={() => handleCameraSystemChange("no")}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
              />
              <span className="ml-2 text-sm text-gray-700">
                Kamera Sistemi Yok
              </span>
            </label>
          </div>
        </div>

        {/* Shoe Rental Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
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
              <span className="ml-2 text-sm text-gray-700">
                Ayakkabı Kiralama Var
              </span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={selectedShoeRental.includes("no")}
                onChange={() => handleShoeRentalChange("no")}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
              />
              <span className="ml-2 text-sm text-gray-700">
                Ayakkabı Kiralama Yok
              </span>
            </label>
          </div>
        </div>

        {/* Rating Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Minimum Puan
          </label>
          <select
            value={selectedRating}
            onChange={(e) => setSelectedRating(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
          >
            <option value="">Tüm Puanlar</option>
            <option value="4.5">4.5+ ⭐</option>
            <option value="4.0">4.0+ ⭐</option>
            <option value="3.5">3.5+ ⭐</option>
            <option value="3.0">3.0+ ⭐</option>
          </select>
        </div>

        {/* Apply Filters Button */}
        <button
          onClick={onSearch}
          className="w-full bg-[rgb(0,128,0)] text-white py-2 px-4 rounded-md hover:bg-[rgb(0,100,0)] transition-colors font-semibold cursor-pointer text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          tabIndex="0"
        >
          Filtreleri Uygula
        </button>

        {/* Clear Filters */}
        <button
          onClick={onClearFilters}
          className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors font-medium cursor-pointer text-sm"
          tabIndex="0"
        >
          Filtreleri Temizle
        </button>
      </div>
    </div>
  );
}

export default ReservationFilters;
