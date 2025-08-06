import { useState, useEffect } from "react";
import pitchReviewData from "../../../pitchreviewdummydata.json";
import "../../styles/review-animations.css";

function MyComments({ user }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedReplies, setExpandedReplies] = useState({});

  // Saha isimlerini pitch ID'sine göre map eden fonksiyon
  const getPitchName = (pitchId) => {
    const pitchNames = {
      "66b0a1c1a4f2b9c0d1123a01": "Beşiktaş Arena",
      "66b0a1c1a4f2b9c0d1123a02": "Moda Spor Sahası",
      "66b0a1c1a4f2b9c0d1123a03": "Çayyolu Kapalı Saha",
      "66b0a1c1a4f2b9c0d1123a04": "Bostanlı Sahil Sahası",
      "66b0a1c1a4f2b9c0d1123a05": "Nilüfer Pro Arena",
      "66b0a1c1a4f2b9c0d1123a06": "Lara Beach Futbol",
      "66b0a1c1a4f2b9c0d1123a07": "Adana Merkez Saha",
      "66b0a1c1a4f2b9c0d1123a08": "Ankara İndoor",
      "66b0a1c1a4f2b9c0d1123a09": "Şahinbey Spor",
      "66b0a1c1a4f2b9c0d1123a10": "Samsun City",
      "66b0a1c1a4f2b9c0d1123a11": "Mezitli Sahil",
      "66b0a1c1a4f2b9c0d1123a12": "Diyarbakır Sur",
      "66b0a1c1a4f2b9c0d1123a13": "Trabzon Doğal Çim",
      "66b0a1c1a4f2b9c0d1123a14": "Eskişehir Odunpazarı",
      "66b0a1c1a4f2b9c0d1123a22": "İstanbul Ümraniye",
      "66b0a1c1a4f2b9c0d1123a23": "İzmir Marina"
    };
    return pitchNames[pitchId] || "Bilinmeyen Saha";
  };

  useEffect(() => {
    // JSON dosyasından veriyi yükle ve formatla
    const loadComments = () => {
      setLoading(true);
      
      try {
        // JSON verisini component state formatına dönüştür
        const formattedComments = pitchReviewData
          .filter(review => !review.isDeleted && !review.archived) // Silinmiş ve arşivlenmiş yorumları filtrele
          .map(review => ({
            id: review._id,
            pitchName: getPitchName(review.pitch),
            title: review.title || "",
            comment: review.comment,
            rating: review.rating,
            date: new Date(review.createdAt).toLocaleDateString('tr-TR'),
            isEditing: false,
            tempRating: review.rating,
            isVerified: review.isVerified || false,
            likes: review.likes?.length || 0,
            dislikes: review.dislikes?.length || 0,
            photos: review.photos || [],
            replies: review.replies || [],
            isEdited: review.isEdited || false,
            originalData: review
          }));

        setComments(formattedComments);
      } catch (error) {
        console.error('Yorumlar yüklenirken hata oluştu:', error);
      } finally {
        setLoading(false);
      }
    };

    loadComments();
  }, []);

  const handleEdit = (id) => {
    setComments(comments.map(comment => 
      comment.id === id ? { ...comment, isEditing: true, tempRating: comment.rating } : comment
    ));
  };

  const handleSave = (id, newComment, newRating, newTitle) => {
    setComments(comments.map(comment => 
      comment.id === id ? { 
        ...comment, 
        comment: newComment, 
        rating: newRating,
        tempRating: newRating,
        title: newTitle || comment.title,
        isEdited: true,
        isEditing: false 
      } : comment
    ));
    
    // Gerçek uygulamada burası API çağrısı olacak
    console.log('Yorum güncellendi:', {
      id,
      comment: newComment,
      rating: newRating,
      title: newTitle
    });
  };

  const handleRatingChange = (id, rating) => {
    setComments(comments.map(comment => 
      comment.id === id ? { ...comment, tempRating: rating } : comment
    ));
  };

  const toggleReplies = (commentId) => {
    setExpandedReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
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

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">Yorumlarım</h1>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">Yorumlarım</h1>
      
      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-gray-900">{comment.pitchName}</h3>
                  {comment.isVerified && (
                    <span className="text-xs text-gray-500 italic">(Doğrulanmış yorum)</span>
                  )}
                  {comment.isEdited && (
                    <span className="text-xs text-gray-500 italic">(düzenlendi)</span>
                  )}
                </div>
                
                {comment.title && (
                  <h4 className="text-md font-medium text-gray-800 mb-1">{comment.title}</h4>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {renderStars(comment.rating)}
                    <span className="ml-2 text-sm text-gray-600">
                      {comment.date}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {comment.likes > 0 && (
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 text-red-500 mr-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                        {comment.likes}
                      </div>
                    )}
                    
                    {comment.dislikes > 0 && (
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 text-gray-400 mr-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.65l1.45 1.32C18.6 8.64 22 11.72 22 15.5c0 3.08-2.42 5.5-5.5 5.5-1.74 0-3.41-.81-4.5-2.09C10.91 20.19 9.24 21 7.5 21 4.42 21 2 18.58 2 15.5c0-3.78 3.4-6.86 8.55-11.54L12 2.65z"/>
                        </svg>
                        {comment.dislikes}
                      </div>
                    )}
                    
                    {comment.replies && comment.replies.length > 0 && (
                      <button
                        onClick={() => toggleReplies(comment.id)}
                        className="flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors cursor-pointer"
                        title="Yanıtları göster/gizle"
                      >
                        <svg
                          className={`w-4 h-4 mr-1 transition-transform duration-200 ${
                            expandedReplies[comment.id] ? "rotate-180 text-blue-600" : "text-blue-500"
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        {comment.replies.length} yanıt
                      </button>
                    )}
                  </div>
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
                {comment.title && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Başlık:
                    </label>
                    <input
                      id={`title-${comment.id}`}
                      type="text"
                      defaultValue={comment.title}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Yorum başlığı..."
                    />
                  </div>
                )}
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Yorum:
                  </label>
                  <textarea
                    id={`comment-${comment.id}`}
                    defaultValue={comment.comment}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows="3"
                    placeholder="Yorumunuzu buraya yazın..."
                  />
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      const textarea = document.getElementById(`comment-${comment.id}`);
                      const titleInput = document.getElementById(`title-${comment.id}`);
                      const newTitle = titleInput ? titleInput.value : comment.title;
                      handleSave(comment.id, textarea.value, comment.tempRating, newTitle);
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
              <div>
                <p className="text-gray-700 mb-3">{comment.comment}</p>
                
                {/* Fotoğraflar */}
                {comment.photos && comment.photos.length > 0 && (
                  <div className="mb-3">
                    <div className="flex gap-2 flex-wrap">
                      {comment.photos.map((photo, index) => (
                        <img
                          key={index}
                          src={photo.url}
                          alt={`Yorum fotoğrafı ${index + 1}`}
                          className="w-20 h-20 object-cover rounded-md border border-gray-200 hover:opacity-80 cursor-pointer transition-opacity"
                          onClick={() => window.open(photo.url, '_blank')}
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Yanıtlar - Sadece açık olduğunda göster */}
                {comment.replies && comment.replies.length > 0 && expandedReplies[comment.id] && (
                  <div className="mt-4 border-t border-gray-100 pt-4 animate-fade-in">
                    <h5 className="text-sm font-medium text-gray-700 mb-3">Yanıtlar:</h5>
                    <div className="space-y-3">
                      {comment.replies.map((reply, index) => (
                        <div key={index} className="bg-green-50 rounded-lg p-3 ml-4 border-l-4 border-green-200">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2Z"/>
                              </svg>
                            </div>
                            <span className="text-sm font-medium text-gray-900">{reply.user.name}</span>
                            {reply.isEdited && (
                              <span className="text-xs text-gray-500 italic">(düzenlendi)</span>
                            )}
                            <span className="text-xs text-gray-500">
                              {new Date(reply.createdAt).toLocaleDateString('tr-TR')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{reply.comment}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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