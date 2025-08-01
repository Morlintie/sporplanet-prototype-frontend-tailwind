import { useState } from 'react';

function PitchReviewsSection({ pitch, renderStars }) {
  const [visibleReviews, setVisibleReviews] = useState(3);
  
  // Get reviews from pitch data
  const allReviews = pitch?.reviews || [];

  const handleLoadMore = () => {
    setVisibleReviews(prev => Math.min(prev + 3, allReviews.length));
  };

  const hasMoreReviews = visibleReviews < allReviews.length;
  const remainingReviews = allReviews.length - visibleReviews;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold text-center mb-4" style={{ color: 'rgb(0, 128, 0)' }}>
        Yorumlar ({allReviews.length})
      </h2>
      
      <div className="space-y-4">
        {allReviews.slice(0, visibleReviews).map((review) => (
          <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-[rgb(0,128,0)] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {review.avatar}
              </div>
              <div className="flex-grow">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-900">{review.userName}</p>
                  <span className="text-xs text-gray-500">{review.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  {renderStars(review.rating)}
                  <span className="text-sm text-gray-600 ml-1">
                    ({review.rating})
                  </span>
                </div>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed">
              {review.comment}
            </p>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {allReviews.length > 3 && (
        <div className="mt-6 text-center">
          <button
            onClick={handleLoadMore}
            disabled={!hasMoreReviews}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              hasMoreReviews
                ? 'bg-[rgb(0,128,0)] hover:bg-[rgb(0,100,0)] text-white'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            {hasMoreReviews 
              ? `Daha Fazla Göster (${remainingReviews} kaldı)`
              : 'Tüm Yorumlar Gösteriliyor'
            }
          </button>
        </div>
      )}
    </div>
  );
}

export default PitchReviewsSection;