function PitchAboutSection({ pitch }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Saha Hakkında</h2>
      <p className="text-gray-600 leading-relaxed">
        {pitch.description || "Bu saha hakkında detaylı bilgi bulunmamaktadır."}
      </p>
    </div>
  );
}

export default PitchAboutSection;