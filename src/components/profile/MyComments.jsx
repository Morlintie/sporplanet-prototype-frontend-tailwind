import { useState } from "react";

function MyComments({ user }) {
  const [comments, setComments] = useState([
    {
      id: 1,
      pitchName: "Kartal City",
      comment: "Harika bir saha, çok temiz ve bakımlı. Kesinlikle tavsiye ederim!",
      rating: 5,
      date: "2025-01-15",
      isEditing: false,
      tempRating: 5
    },
    {
      id: 2,
      pitchName: "Spor Plus",
      comment: "İyi saha ama biraz pahalı. Kalite fiyatına değer.",
      rating: 4,
      date: "2025-01-10",
      isEditing: false,
      tempRating: 4
    }
  ]);

  const handleEdit = (id) => {
    setComments(comments.map(comment => 
      comment.id === id ? { ...comment, isEditing: true, tempRating: comment.rating } : comment
    ));
  };

  const handleSave = (id, newComment, newRating) => {
    setComments(comments.map(comment => 
      comment.id === id ? { 
        ...comment, 
        comment: newComment, 
        rating: newRating,
        tempRating: newRating,
        isEditing: false 
      } : comment
    ));
  };

  const handleRatingChange = (id, rating) => {
    setComments(comments.map(comment => 
      comment.id === id ? { ...comment, tempRating: rating } : comment
    ));
  };

  const handleDelete = (id) => {
    setComments(comments.filter(comment => comment.id !== id));
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  const renderEditableStars = (rating, commentId) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-5 h-5 cursor-pointer transition-colors ${
          i < rating ? 'text-yellow-400 hover:text-yellow-500' : 'text-gray-300 hover:text-yellow-200'
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
        onClick={() => handleRatingChange(commentId, i + 1)}
        tabIndex="0"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleRatingChange(commentId, i + 1);
          }
        }}
        aria-label={`${i + 1} yıldız ver`}
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">Yorumlarım</h1>
      
      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{comment.pitchName}</h3>
                <div className="flex items-center mt-1">
                  {renderStars(comment.rating)}
                  <span className="ml-2 text-sm text-gray-600">
                    {new Date(comment.date).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(comment.id)}
                  className="text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                  tabIndex="0"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="text-red-600 hover:text-red-800 transition-colors cursor-pointer"
                  tabIndex="0"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            
            {comment.isEditing ? (
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Değerlendirme:
                  </label>
                  <div className="flex items-center space-x-1">
                    {renderEditableStars(comment.tempRating, comment.id)}
                    <span className="ml-2 text-sm text-gray-600">
                      ({comment.tempRating} / 5)
                    </span>
                  </div>
                </div>
                <textarea
                  id={`comment-${comment.id}`}
                  defaultValue={comment.comment}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows="3"
                  placeholder="Yorumunuzu buraya yazın..."
                />
                <div className="flex space-x-2 mt-3">
                  <button
                    onClick={() => {
                      const textarea = document.getElementById(`comment-${comment.id}`);
                      handleSave(comment.id, textarea.value, comment.tempRating);
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors cursor-pointer font-semibold"
                    tabIndex="0"
                  >
                    Kaydet
                  </button>
                  <button
                    onClick={() => setComments(comments.map(c => 
                      c.id === comment.id ? { ...c, isEditing: false, tempRating: c.rating } : c
                    ))}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors cursor-pointer font-semibold"
                    tabIndex="0"
                  >
                    İptal
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-700">{comment.comment}</p>
            )}
          </div>
        ))}
      </div>

      {comments.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz Yorum Yok</h3>
          <p className="text-gray-600">
            Henüz hiç yorum yapmamışsınız. Sahalar hakkında yorum yapmak için saha detay sayfalarını ziyaret edin.
          </p>
        </div>
      )}
    </div>
  );
}

export default MyComments; 