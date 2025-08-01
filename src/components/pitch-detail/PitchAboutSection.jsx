function PitchAboutSection({ pitch }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 h-full flex flex-col">
      <h2 className="text-2xl font-bold text-center mb-4" style={{ color: 'rgb(0, 128, 0)' }}>Saha Hakkında</h2>
      <div className="flex-grow flex items-center">
        <p className="text-gray-600 leading-relaxed">
          {pitch.description || "Bu saha hakkında detaylı bilgi bulunmamaktadır."}
        </p>
      </div>
    </div>
  );
}

export default PitchAboutSection;