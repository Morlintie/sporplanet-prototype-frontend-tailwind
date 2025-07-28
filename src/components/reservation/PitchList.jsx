import PitchCard from "./PitchCard";

function PitchList({ pitches, onReservation }) {
  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Mevcut Sahalar
          </h2>
          <p className="text-gray-600">
            {pitches.length} saha bulundu
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {pitches.map((pitch) => (
            <PitchCard
              key={pitch.id}
              pitch={pitch}
              onReservation={onReservation}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default PitchList; 