import { useState } from "react";

function MyTournaments({ user }) {
  const [selectedTournament, setSelectedTournament] = useState("all");

  // Mock tournament data
  const tournaments = [
    {
      id: 1,
      name: "İstanbul Ligi 2025",
      teamRanking: 3,
      matchesWon: 8,
      matchesLost: 2,
      goalsScored: 25,
      goalsConceded: 12,
      yellowCards: 5,
      redCards: 0,
      personalGoals: 12,
      personalAssists: 8,
      personalYellowCards: 2,
      personalRedCards: 0
    },
    {
      id: 2,
      name: "Kadıköy Kupası",
      teamRanking: 1,
      matchesWon: 5,
      matchesLost: 0,
      goalsScored: 18,
      goalsConceded: 5,
      yellowCards: 3,
      redCards: 0,
      personalGoals: 7,
      personalAssists: 4,
      personalYellowCards: 1,
      personalRedCards: 0
    }
  ];

  const selectedTournamentData = tournaments.find(t => t.id === parseInt(selectedTournament)) || tournaments[0];

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">Turnuvalarım</h1>
      
      {/* Tournament Selection */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Turnuva Seçin
        </label>
        <select
          value={selectedTournament}
          onChange={(e) => setSelectedTournament(e.target.value)}
          className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="all">Tüm Turnuvalar</option>
          {tournaments.map((tournament) => (
            <option key={tournament.id} value={tournament.id}>
              {tournament.name}
            </option>
          ))}
        </select>
      </div>

      {/* Team Statistics */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Takım İstatistikleri</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{selectedTournamentData.teamRanking}</div>
            <div className="text-sm text-gray-600">Takım Sıralaması</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{selectedTournamentData.matchesWon}</div>
            <div className="text-sm text-gray-600">Kazanılan Maç</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{selectedTournamentData.matchesLost}</div>
            <div className="text-sm text-gray-600">Kaybedilen Maç</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{selectedTournamentData.goalsScored}</div>
            <div className="text-sm text-gray-600">Atılan Gol</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{selectedTournamentData.goalsConceded}</div>
            <div className="text-sm text-gray-600">Yenen Gol</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{selectedTournamentData.yellowCards}</div>
            <div className="text-sm text-gray-600">Sarı Kart</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{selectedTournamentData.redCards}</div>
            <div className="text-sm text-gray-600">Kırmızı Kart</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-gray-600">{selectedTournamentData.matchesWon + selectedTournamentData.matchesLost}</div>
            <div className="text-sm text-gray-600">Toplam Maç</div>
          </div>
        </div>
      </div>

      {/* Personal Statistics */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Kişisel İstatistikler</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{selectedTournamentData.personalGoals}</div>
            <div className="text-sm text-gray-600">Attığım Gol</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{selectedTournamentData.personalAssists}</div>
            <div className="text-sm text-gray-600">Asist</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{selectedTournamentData.personalYellowCards}</div>
            <div className="text-sm text-gray-600">Sarı Kart</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{selectedTournamentData.personalRedCards}</div>
            <div className="text-sm text-gray-600">Kırmızı Kart</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyTournaments; 