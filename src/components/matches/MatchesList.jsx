import MatchCard from "./MatchCard";
import MatchesFilters from "./MatchesFilters";

function MatchesList({ 
  matches, 
  onJoinMatch, 
  activeFilter, 
  searchQuery, 
  onFilterChange, 
  onSearchChange,
  onCreateAdClick 
}) {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Maç İlanları
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            {matches.length} maç bulundu
          </p>
          
          {/* Filters moved here */}
          <MatchesFilters 
            activeFilter={activeFilter}
            searchQuery={searchQuery}
            onFilterChange={onFilterChange}
            onSearchChange={onSearchChange}
            onCreateAdClick={onCreateAdClick}
          />
        </div>

        {/* Match Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {matches.map((match) => (
            <MatchCard 
              key={match.id} 
              match={match} 
              onJoinMatch={onJoinMatch} 
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default MatchesList;