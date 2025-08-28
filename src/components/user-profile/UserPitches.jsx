import { useState } from "react";

function UserPitches({ user }) {
  if (!user) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">
          Kullanıcı bilgileri yüklenemedi.
        </div>
      </div>
    );
  }

  const pitches = user.favoritePitches || [];

  const getSurfaceTypeText = (surfaceType) => {
    const surfaceMap = {
      natural_grass: "Doğal Çim",
      artificial_grass: "Sentetik Çim",
      concrete: "Beton",
      parquet: "Parke",
      clay: "Toprak",
    };
    return surfaceMap[surfaceType] || surfaceType;
  };

  const formatPrice = (price, currency = "TRY") => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={i} className="text-yellow-400">
          ★
        </span>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <span key="half" className="text-yellow-400">
          ☆
        </span>
      );
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="text-gray-300">
          ☆
        </span>
      );
    }

    return stars;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {user.name} - Favori Sahaları
        </h1>
        <p className="text-gray-600">
          Bu kullanıcının favori olarak eklediği futbol sahaları
        </p>
      </div>

      {/* Pitches */}
      {pitches.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Henüz Favori Saha Yok
          </h3>
          <p className="text-gray-600">
            Bu kullanıcı henüz hiç saha favorilerine eklememiş.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {pitches.map((pitch) => (
            <div
              key={pitch._id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Image */}
              {pitch.media?.images && pitch.media.images.length > 0 && (
                <div className="h-48 bg-gray-200">
                  <img
                    src={pitch.media.images[0].url}
                    alt={pitch.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
              )}

              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {pitch.name}
                    </h3>
                    {pitch.description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {pitch.description}
                      </p>
                    )}
                  </div>
                  {pitch.rating && (
                    <div className="ml-4 text-right">
                      <div className="flex items-center gap-1 mb-1">
                        {renderStars(pitch.rating.averageRating)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {pitch.rating.averageRating} (
                        {pitch.rating.totalReviews} değerlendirme)
                      </div>
                    </div>
                  )}
                </div>

                {/* Location */}
                {pitch.location?.address && (
                  <div className="flex items-start gap-2 mb-4">
                    <svg
                      className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div className="text-sm text-gray-600">
                      <div className="font-medium">
                        {pitch.location.address.district},{" "}
                        {pitch.location.address.city}
                      </div>
                      <div>
                        {pitch.location.address.street},{" "}
                        {pitch.location.address.neighborhood}
                      </div>
                    </div>
                  </div>
                )}

                {/* Specifications */}
                {pitch.specifications && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {pitch.specifications.dimensions && (
                      <div className="text-center bg-blue-50 rounded-lg p-3">
                        <div className="text-sm font-medium text-blue-900">
                          {pitch.specifications.dimensions.length}x
                          {pitch.specifications.dimensions.width}m
                        </div>
                        <div className="text-xs text-blue-600">Boyut</div>
                      </div>
                    )}
                    {pitch.specifications.surfaceType && (
                      <div className="text-center bg-green-50 rounded-lg p-3">
                        <div className="text-sm font-medium text-green-900">
                          {getSurfaceTypeText(pitch.specifications.surfaceType)}
                        </div>
                        <div className="text-xs text-green-600">Zemin</div>
                      </div>
                    )}
                    {pitch.specifications.recommendedCapacity && (
                      <div className="text-center bg-purple-50 rounded-lg p-3">
                        <div className="text-sm font-medium text-purple-900">
                          {pitch.specifications.recommendedCapacity.players}{" "}
                          kişi
                        </div>
                        <div className="text-xs text-purple-600">Kapasite</div>
                      </div>
                    )}
                    {pitch.pricing && (
                      <div className="text-center bg-yellow-50 rounded-lg p-3">
                        <div className="text-sm font-medium text-yellow-900">
                          {formatPrice(
                            pitch.pricing.hourlyRate,
                            pitch.pricing.currency
                          )}
                        </div>
                        <div className="text-xs text-yellow-600">Saatlik</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Facilities */}
                {pitch.facilities && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Özellikler
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {pitch.specifications?.isIndoor && (
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                          Kapalı Saha
                        </span>
                      )}
                      {pitch.specifications?.hasLighting && (
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                          Aydınlatma
                        </span>
                      )}
                      {pitch.facilities.changingRooms && (
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                          Soyunma Odası
                        </span>
                      )}
                      {pitch.facilities.showers && (
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                          Duş
                        </span>
                      )}
                      {pitch.facilities.parking && (
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                          Otopark
                        </span>
                      )}
                      {pitch.facilities.camera && (
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                          Kamera
                        </span>
                      )}
                      {pitch.facilities.otherAmenities &&
                        pitch.facilities.otherAmenities.map((amenity) => (
                          <span
                            key={amenity}
                            className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                          >
                            {amenity}
                          </span>
                        ))}
                    </div>
                  </div>
                )}

                {/* Contact */}
                {pitch.contact && (
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    {pitch.contact.phone && (
                      <div className="flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                        <span>{pitch.contact.phone}</span>
                      </div>
                    )}
                    {pitch.contact.email && (
                      <div className="flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                        <span>{pitch.contact.email}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserPitches;
