function PitchReviewsSection({ pitch, renderStars }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Yorumlar ({pitch.totalReviews})
      </h2>
      <div className="space-y-4">
        {/* Mock reviews */}
        {[1, 2, 3].map((_, index) => (
          <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                U
              </div>
              <div>
                <p className="font-medium text-gray-900">Kullanıcı {index + 1}</p>
                <div className="flex items-center gap-1">
                  {renderStars(4 + index * 0.3)}
                </div>
              </div>
            </div>
            <p className="text-gray-600">
              Harika bir saha, temiz ve bakımlı. Kesinlikle tavsiye ederim.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PitchReviewsSection;