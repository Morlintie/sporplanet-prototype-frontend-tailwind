function AdvertDetails({ advert }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const endDate = new Date(date.getTime() + 60 * 60 * 1000); // 1 saat sonrası

    const dateStr = date.toLocaleDateString("tr-TR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const startTime = date.toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const endTime = endDate.toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return `${dateStr} ${startTime}-${endTime}`;
  };

  return (
    <div className="bg-white px-4 py-3 sticky top-[56px] z-10 shadow-sm">
      <div className="max-w-lg mx-auto">
        {/* Date, Time & Venue in one box */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Date & Time */}
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500">
                  Tarih & Saat
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatDate(advert.startsAt)}
                </p>
              </div>
            </div>

            {/* Venue */}
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500">Saha</p>
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {advert.pitch?.name ||
                    advert.customPitch?.name ||
                    "Halısaha Belirtilmemiş"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdvertDetails;

