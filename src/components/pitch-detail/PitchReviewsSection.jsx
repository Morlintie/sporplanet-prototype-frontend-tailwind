function PitchReviewsSection({
  pitch,
  renderStars,
  reviews,
  reviewsLoading,
  reviewsError,
  totalReviews,
  currentReviewsCount,
  canLoadMoreReviews,
  onLoadMoreReviews,
}) {
  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "Tarih bilinmiyor";
    const date = new Date(dateString);
    return date.toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Helper function to get user initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return "?";
    const nameParts = name.split(" ");
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return name[0]?.toUpperCase() || "?";
  };

  // Filter out deleted reviews (backend should handle this, but just in case)
  const activeReviews = reviews.filter((review) => !review.isDeleted);

  // Helper to safely get array length
  const getArrayLength = (arr) => {
    return Array.isArray(arr) ? arr.length : 0;
  };

  // Helper to check if review is archived
  const isArchived = (review) => {
    return review.archived === true;
  };

  // Helper to get display rating (archived rating if archived, otherwise normal rating)
  const getDisplayRating = (review) => {
    if (isArchived(review) && review.archivedRating) {
      return review.archivedRating;
    }
    return review.rating || 0;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2
        className="text-2xl font-bold text-center mb-6"
        style={{ color: "rgb(0, 128, 0)" }}
      >
        Yorumlar {totalReviews > 0 && `(${totalReviews})`}
      </h2>

      {/* Loading State */}
      {reviewsLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Yorumlar yükleniyor...</p>
        </div>
      )}

      {/* Error State */}
      {reviewsError && (
        <div className="text-center py-8 text-red-500">
          <svg
            className="w-12 h-12 mx-auto mb-3 text-red-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm">{reviewsError}</p>
        </div>
      )}

      {/* No Reviews State */}
      {!reviewsLoading && !reviewsError && activeReviews.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <svg
            className="w-12 h-12 mx-auto mb-3 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <p>Henüz yorum yapılmamış</p>
          <p className="text-xs mt-1">İlk yorumu siz yapın!</p>
        </div>
      )}

      {/* Reviews List */}
      {!reviewsLoading && !reviewsError && activeReviews.length > 0 && (
        <div className="space-y-6">
          {activeReviews.map((review) => (
            <div
              key={review._id}
              className="border-b border-gray-100 pb-6 last:border-b-0"
            >
              {/* Review Header */}
              <div className="flex items-start space-x-3">
                {/* User Avatar */}
                <div className="flex-shrink-0">
                  {review.user?.profilePicture ? (
                    <img
                      src={review.user.profilePicture}
                      alt={review.user.name}
                      className="w-10 h-10 rounded-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className={`w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-medium ${
                      review.user?.profilePicture ? "hidden" : "flex"
                    }`}
                  >
                    {getInitials(review.user?.name)}
                  </div>
                </div>

                {/* Review Content */}
                <div className="flex-1 min-w-0">
                  {/* User Info & Rating */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {review.user?.name || "Anonim Kullanıcı"}
                        {review.isVerified === true && (
                          <span
                            className="ml-1 text-blue-500"
                            title="Doğrulanmış"
                          >
                            ✓
                          </span>
                        )}
                        {isArchived(review) && (
                          <span
                            className="ml-1 text-orange-500 text-xs"
                            title="Arşivlenen yorum"
                          >
                            📁
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {formatDate(review.createdAt)}
                        {review.isEdited === true && (
                          <span className="ml-1 text-gray-400">
                            (düzenlendi)
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center">
                      {renderStars(getDisplayRating(review))}
                      <span className="ml-1 text-sm text-gray-600">
                        {getDisplayRating(review).toFixed(1)}
                        {isArchived(review) &&
                          review.rating !== review.archivedRating && (
                            <span className="text-xs text-orange-500 ml-1">
                              (orijinal: {review.rating.toFixed(1)})
                            </span>
                          )}
                      </span>
                    </div>
                  </div>

                  {/* Review Title */}
                  {review.title && (
                    <h5 className="text-sm font-semibold text-gray-800 mt-1">
                      {review.title}
                    </h5>
                  )}

                  {/* Review Comment */}
                  <p className="text-sm text-gray-700 mt-2">
                    {review.comment || "Yorum içeriği bulunmuyor."}
                  </p>

                  {/* Archived Review Notice */}
                  {isArchived(review) && (
                    <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-700">
                      <span className="font-medium">📁 Arşivlenen yorum:</span>{" "}
                      Bu yorum arşivlenmiştir ve puanı güncellenmiş olabilir.
                    </div>
                  )}

                  {/* Review Photos */}
                  {getArrayLength(review.photos) > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-600 mb-2">
                        Fotoğraflar ({getArrayLength(review.photos)})
                      </p>
                      <div className="flex space-x-2 flex-wrap gap-2">
                        {review.photos.map((photo, index) => (
                          <img
                            key={photo.public_id || index}
                            src={photo.url}
                            alt={`Yorum fotoğrafı ${index + 1}`}
                            className="w-16 h-16 rounded object-cover cursor-pointer hover:opacity-80 transition-opacity border border-gray-200"
                            onClick={() => {
                              // TODO: Implement photo lightbox
                              window.open(photo.url, "_blank");
                            }}
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Likes/Dislikes */}
                  <div className="flex items-center space-x-4 mt-3">
                    {getArrayLength(review.likes) > 0 && (
                      <button className="flex items-center space-x-1 text-xs text-gray-500 hover:text-green-600 transition-colors">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L9 7v13m-3-4h-.01M7 16h-.01"
                          />
                        </svg>
                        <span>{getArrayLength(review.likes)}</span>
                      </button>
                    )}
                    {getArrayLength(review.dislikes) > 0 && (
                      <button className="flex items-center space-x-1 text-xs text-gray-500 hover:text-red-600 transition-colors">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L15 17V4m-3 4h.01M13 8h.01"
                          />
                        </svg>
                        <span>{getArrayLength(review.dislikes)}</span>
                      </button>
                    )}
                  </div>

                  {/* Replies */}
                  {getArrayLength(review.replies) > 0 && (
                    <div className="mt-4 ml-4 space-y-3">
                      <h6 className="text-xs font-medium text-gray-600 mb-2">
                        Cevaplar ({getArrayLength(review.replies)})
                      </h6>
                      {review.replies.map((reply, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-start space-x-2">
                            <div className="flex-shrink-0">
                              {reply.user?.profilePicture ? (
                                <img
                                  src={reply.user.profilePicture}
                                  alt={reply.user?.name || "Anonim"}
                                  className="w-6 h-6 rounded-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                    e.target.nextSibling.style.display = "flex";
                                  }}
                                />
                              ) : null}
                              <div
                                className={`w-6 h-6 rounded-full bg-gray-400 text-white flex items-center justify-center text-xs ${
                                  reply.user?.profilePicture ? "hidden" : "flex"
                                }`}
                              >
                                {getInitials(reply.user?.name)}
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-medium text-gray-900">
                                  {reply.user?.name || "Anonim"}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {formatDate(reply.createdAt)}
                                  {reply.isEdited === true && (
                                    <span className="ml-1 text-gray-400">
                                      (düzenlendi)
                                    </span>
                                  )}
                                </span>
                              </div>
                              <p className="text-xs text-gray-700 mt-1">
                                {reply.comment || "Yorum içeriği yok"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Load More Button */}
          {canLoadMoreReviews && (
            <div className="text-center pt-4">
              <button
                onClick={onLoadMoreReviews}
                disabled={reviewsLoading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {reviewsLoading ? (
                  <span className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Yükleniyor...</span>
                  </span>
                ) : (
                  `Daha fazla göster (${Math.max(
                    0,
                    (totalReviews || 0) - (currentReviewsCount || 0)
                  )}+ daha)`
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PitchReviewsSection;
