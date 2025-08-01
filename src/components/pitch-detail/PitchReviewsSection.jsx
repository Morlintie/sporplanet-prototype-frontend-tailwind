import { useState } from 'react';

function PitchReviewsSection({ pitch, renderStars }) {
  const [visibleReviews, setVisibleReviews] = useState(3);
  
  // Mock reviews data - gerçek projede API'den gelecek
  const allReviews = [
    {
      id: 1,
      userName: "Ahmet Yılmaz",
      rating: 4.8,
      comment: "Harika bir saha, temiz ve bakımlı. Kesinlikle tavsiye ederim.",
      avatar: "A",
      date: "2024-01-15"
    },
    {
      id: 2,
      userName: "Mehmet Kaya",
      rating: 4.5,
      comment: "Çok güzel bir saha, aydınlatması da çok iyi. Tekrar geleceğim.",
      avatar: "M",
      date: "2024-01-12"
    },
    {
      id: 3,
      userName: "Fatma Demir",
      rating: 5.0,
      comment: "Mükemmel! Soyunma odaları temiz, duşlar sıcak. Çok memnun kaldık.",
      avatar: "F",
      date: "2024-01-10"
    },
    {
      id: 4,
      userName: "Ali Özkan",
      rating: 4.2,
      comment: "Güzel saha ama park yeri biraz sıkıntılı. Genel olarak memnunum.",
      avatar: "A",
      date: "2024-01-08"
    },
    {
      id: 5,
      userName: "Zeynep Çelik",
      rating: 4.7,
      comment: "Çok profesyonel bir işletme. Saha kalitesi ve hizmet süper.",
      avatar: "Z",
      date: "2024-01-05"
    },
    {
      id: 6,
      userName: "Burak Aslan",
      rating: 4.0,
      comment: "İyi bir saha, fiyatları da makul. Arkadaşlarla keyifli vakit geçirdik.",
      avatar: "B",
      date: "2024-01-03"
    },
    {
      id: 7,
      userName: "Elif Şahin",
      rating: 4.9,
      comment: "Harika bir deneyim! Saha çok temiz, personel çok ilgili.",
      avatar: "E",
      date: "2024-01-01"
    },
    {
      id: 8,
      userName: "Okan Türk",
      rating: 4.3,
      comment: "Güzel saha, sadece soyunma odaları biraz küçük. Genel olarak iyi.",
      avatar: "O",
      date: "2023-12-28"
    },
    {
      id: 9,
      userName: "Seda Avcı",
      rating: 4.6,
      comment: "Çok beğendik! Kesinlikle tekrar geleceğiz. Tavsiye ederim.",
      avatar: "S",
      date: "2023-12-25"
    },
    {
      id: 10,
      userName: "Emre Koç",
      rating: 4.4,
      comment: "Kaliteli bir saha. Rezervasyon sistemi de çok pratik.",
      avatar: "E",
      date: "2023-12-22"
    }
  ];

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