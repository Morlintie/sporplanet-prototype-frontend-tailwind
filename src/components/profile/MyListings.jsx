import { useState } from "react";

function MyListings({ user }) {
  const [activeFilter, setActiveFilter] = useState("all");

  // Mock match data
  const matches = [
    {
      id: 1,
      title: "Kadıköy Sabah Maçı",
      date: "2025-01-15",
      location: "Kartal City",
      status: "completed",
      participants: 8,
      maxParticipants: 10,
      price: 25
    },
    {
      id: 2,
      title: "Beşiktaş Akşam Maçı",
      date: "2025-01-20",
      location: "Spor Plus",
      status: "upcoming",
      participants: 5,
      maxParticipants: 12,
      price: 30
    },
    {
      id: 3,
      title: "Şişli Dostluk Maçı",
      date: "2025-01-10",
      location: "Dream Saha",
      status: "completed",
      participants: 10,
      maxParticipants: 10,
      price: 20
    }
  ];

  const filteredMatches = matches.filter(match => {
    if (activeFilter === "all") return true;
    if (activeFilter === "past") return match.status === "completed";
    if (activeFilter === "present") return match.status === "upcoming";
    return true;
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">İlanlarım</h1>
      
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-green-50 p-6 rounded-lg">
          <div className="text-3xl font-bold text-green-600">{user.totalMatches}</div>
          <div className="text-sm text-gray-600">Toplam Maç</div>
        </div>
        <div className="bg-blue-50 p-6 rounded-lg">
          <div className="text-3xl font-bold text-blue-600">{user.listedMatches}</div>
          <div className="text-sm text-gray-600">İlan Verdiğim</div>
        </div>
        <div className="bg-purple-50 p-6 rounded-lg">
          <div className="text-3xl font-bold text-purple-600">{user.participatedMatches}</div>
          <div className="text-sm text-gray-600">Katıldığım</div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveFilter("all")}
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
          onClick={() => setActiveFilter("present")}
          className={`px-6 py-2 rounded-full font-medium transition-colors cursor-pointer ${
            activeFilter === "present"
              ? "bg-green-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          tabIndex="0"
        >
          Güncel
        </button>
        <button
          onClick={() => setActiveFilter("past")}
          className={`px-6 py-2 rounded-full font-medium transition-colors cursor-pointer ${
            activeFilter === "past"
              ? "bg-green-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          tabIndex="0"
        >
          Geçmiş
        </button>
      </div>

      {/* Match Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMatches.map((match) => (
          <div key={match.id} className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{match.title}</h3>
              <span className={`text-sm font-medium px-2 py-1 rounded ${
                match.status === "completed" 
                  ? "bg-gray-500 text-white" 
                  : "bg-green-500 text-white"
              }`}>
                {match.status === "completed" ? "Tamamlandı" : "Güncel"}
              </span>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-gray-600">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{new Date(match.date).toLocaleDateString('tr-TR')}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{match.location}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <span>{match.participants}/{match.maxParticipants} oyuncu</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-green-600">₺{match.price}</span>
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors cursor-pointer" tabIndex="0">
                Detaylar
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredMatches.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz İlan Yok</h3>
          <p className="text-gray-600">
            Henüz hiç maç ilanı oluşturmamışsınız. İlk ilanınızı oluşturmak için maç ilanları sayfasını ziyaret edin.
          </p>
        </div>
      )}
    </div>
  );
}

export default MyListings; 