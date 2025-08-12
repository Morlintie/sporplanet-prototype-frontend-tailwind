function MatchCard({ match, onJoinMatch }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">{match.title}</h3>
          <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
            ₺{match.pricePerPerson}/kişi
          </span>
        </div>
        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
          {match.status === "full" ? "Dolu" : "Açık"}
        </span>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-gray-600">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {match.date}
        </div>
        <div className="flex items-center text-gray-600">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {match.location}
        </div>
        <div className="flex items-center text-gray-600">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
          {match.players}
        </div>
      </div>

      {/* Description */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 italic">
          {match.description}
        </p>
      </div>

      <div className="mb-4">
        {/* Rakip takım ilanları için takım büyüklüğü göster, oyuncu ilanları için progress bar */}
        {match.type === "team-ads" ? (
          <div className="text-center">
            <div className="text-lg font-semibold text-green-600 mb-1">
              {match.teamSize || match.players.split('/')[1].split(' ')[0]} kişilik takım aranıyor
            </div>
          </div>
        ) : (
          <div>
            <div className="text-sm text-gray-600 mb-1">{match.completion}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: `${match.completion}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">
          {match.difficulty}
        </span>
        {match.status === "full" ? (
          <button 
            className="bg-gray-400 text-white font-semibold py-2 px-6 rounded-md cursor-not-allowed"
            disabled
          >
            Dolu
          </button>
        ) : (
          <button 
            onClick={() => onJoinMatch(match.id)}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-md transition-colors cursor-pointer"
            tabIndex="0"
          >
            {match.type === "team-ads" ? "Maç Yap" : "Maça Katıl"}
          </button>
        )}
      </div>
    </div>
  );
}

export default MatchCard;