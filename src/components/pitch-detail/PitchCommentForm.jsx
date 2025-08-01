import { useState } from 'react';

function PitchCommentForm({ pitch, onCommentSubmit }) {
  const [formData, setFormData] = useState({
    rating: 0,
    comment: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRatingClick = (rating) => {
    setFormData(prev => ({
      ...prev,
      rating
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.comment.trim() || formData.rating === 0) {
      alert('Lütfen yorum yazın ve bir puan verin.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newComment = {
        id: Date.now(),
        name: 'Anonim Kullanıcı',
        rating: formData.rating,
        comment: formData.comment.trim(),
        date: new Date().toLocaleDateString('tr-TR'),
        verified: false
      };

      if (onCommentSubmit) {
        onCommentSubmit(newComment);
      }

      // Reset form
      setFormData({
        rating: 0,
        comment: ''
      });

      alert('Yorumunuz başarıyla gönderildi! İncelendikten sonra yayınlanacaktır.');
    } catch (error) {
      alert('Yorum gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating, isInteractive = false) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= (isInteractive ? (hoveredRating || formData.rating) : rating);
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => isInteractive && handleRatingClick(i)}
          onMouseEnter={() => isInteractive && setHoveredRating(i)}
          onMouseLeave={() => isInteractive && setHoveredRating(0)}
          className={`w-6 h-6 ${isInteractive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
          disabled={!isInteractive}
        >
          <svg
            className={`w-full h-full ${
              isFilled ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        </button>
      );
    }
    return stars;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-2xl font-bold mb-6 text-center" style={{ color: 'rgb(0, 128, 0)' }}>
        Yorum Yap
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Puanınız *
          </label>
          <div className="flex items-center space-x-1">
            {renderStars(formData.rating, true)}
            <span className="ml-3 text-sm text-gray-600">
              {formData.rating > 0 ? `${formData.rating}/5` : 'Puan verin'}
            </span>
          </div>
        </div>

        {/* Comment Textarea */}
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
            Yorumunuz *
          </label>
          <textarea
            id="comment"
            name="comment"
            value={formData.comment}
            onChange={handleInputChange}
            placeholder="Sahaya dair deneyiminizi paylaşın..."
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-vertical"
            required
          />
          <div className="text-right text-xs text-gray-500 mt-1">
            {formData.comment.length}/500
          </div>
        </div>

        {/* Info Text */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-blue-800 text-sm">
            <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Yorumunuz moderasyon sonrası yayınlanacaktır. Lütfen saygılı bir dil kullanın.
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-[rgb(0,128,0)] hover:bg-[rgb(0,100,0)] text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Gönderiliyor...</span>
              </div>
            ) : (
              'Yorum Gönder'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PitchCommentForm;