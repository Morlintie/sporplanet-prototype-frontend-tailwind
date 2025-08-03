import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import AuthRequiredPopup from "../shared/AuthRequiredPopup";
import "../../styles/review-animations.css";

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
  onReviewUpdate,
}) {
  // State for managing expanded replies
  const [expandedReplies, setExpandedReplies] = useState({});

  // State for managing reply forms
  const [replyForms, setReplyForms] = useState({});

  // State for reply input values
  const [replyTexts, setReplyTexts] = useState({});

  // State for auth required popup
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [authPopupActionType, setAuthPopupActionType] = useState("default");

  // Auth context
  const { user, isAuthenticated } = useAuth();

  // Error message translation function
  const translateMessage = (message) => {
    const translations = {
      // Network errors
      "Failed to fetch":
        "Bağlantı hatası oluştu. İnternet bağlantınızı kontrol edin.",
      "Network Error": "Ağ hatası oluştu. Lütfen tekrar deneyin.",

      // Backend error messages
      "Please provide required data.": "Gerekli bilgileri girin.",
      "Please provide all required data.": "Tüm gerekli bilgileri girin.",
      "Review not found.": "Yorum bulunamadı.",
      "You have been banned, please get contact with our customer service.":
        "Hesabınız askıya alınmıştır. Müşteri hizmetleri ile iletişime geçin.",

      // Generic errors
      "Something went wrong": "Bir şeyler ters gitti. Lütfen tekrar deneyin.",
      "Server Error": "Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.",
      Unauthorized: "Bu işlemi yapmak için giriş yapmalısınız.",
    };

    return (
      translations[message] ||
      "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin."
    );
  };
  // Helper function to format date with more detailed format
  const formatDate = (dateString) => {
    if (!dateString) return "Tarih bilinmiyor";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Geçersiz tarih";

      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      // Show relative time for recent reviews
      if (diffDays === 0) {
        return "Bugün";
      } else if (diffDays === 1) {
        return "Dün";
      } else if (diffDays < 7) {
        return `${diffDays} gün önce`;
      } else {
        return date.toLocaleDateString("tr-TR", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }
    } catch (error) {
      return "Tarih bilinmiyor";
    }
  };

  // Helper function to get user initials for avatar fallback
  const getInitials = (name) => {
    if (!name || typeof name !== "string") return "?";
    const cleanName = name.trim();
    if (!cleanName) return "?";

    const nameParts = cleanName.split(/[\s.]+/); // Split by space or dot
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return cleanName[0]?.toUpperCase() || "?";
  };

  // Filter out deleted reviews and handle edge cases
  const activeReviews = (reviews || []).filter((review) => {
    return review && !review.isDeleted && review.user;
  });

  // Helper to safely get array length
  const getArrayLength = (arr) => {
    return Array.isArray(arr) ? arr.length : 0;
  };

  // Helper to get display rating
  const getDisplayRating = (review) => {
    if (!review) return 0;
    return typeof review.rating === "number" ? review.rating : 0;
  };

  // Helper to check if user is verified
  const isUserVerified = (review) => {
    return review && review.isVerified === true;
  };

  // Helper to check if review is edited
  const isReviewEdited = (review) => {
    return review && review.isEdited === true;
  };

  // Helper to safely get likes/dislikes count
  const getLikesCount = (review) => {
    return getArrayLength(review?.likes);
  };

  const getDislikesCount = (review) => {
    return getArrayLength(review?.dislikes);
  };

  const getRepliesCount = (review) => {
    return getArrayLength(review?.replies);
  };

  // Auth popup handlers
  const showAuthRequiredPopup = (actionType) => {
    setAuthPopupActionType(actionType);
    setShowAuthPopup(true);
  };

  const hideAuthRequiredPopup = () => {
    setShowAuthPopup(false);
    setAuthPopupActionType("default");
  };

  // Check if user has already liked a review
  const hasUserLikedReview = (review) => {
    if (!isAuthenticated || !user?._id) return false;
    return review?.likes?.includes(user._id) || false;
  };

  // Check if user has already disliked a review
  const hasUserDislikedReview = (review) => {
    if (!isAuthenticated || !user?._id) return false;
    return review?.dislikes?.includes(user._id) || false;
  };

  // Handlers for interactions
  const handleLike = async (reviewId) => {
    if (!isAuthenticated || !user?._id) {
      showAuthRequiredPopup("like");
      return;
    }

    try {
      const response = await fetch(`/api/v1/pitch-review/like/${reviewId}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        let errorMessage = "Something went wrong";

        try {
          const errorData = await response.json();
          if (errorData.msg) {
            errorMessage = errorData.msg;
          }
        } catch (parseError) {
          if (response.status === 401) {
            errorMessage = "Unauthorized";
          } else if (response.status === 403) {
            errorMessage =
              "You have been banned, please get contact with our customer service.";
          } else if (response.status === 404) {
            errorMessage = "Review not found.";
          } else if (response.status >= 500) {
            errorMessage = "Server Error";
          }
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Update the review in the parent component
      if (data.review && onReviewUpdate) {
        onReviewUpdate(data.review);
      }

      console.log("Review liked/unliked successfully:", data);
    } catch (error) {
      console.error("Error liking review:", error);

      // Handle network errors
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        alert(translateMessage("Failed to fetch"));
      } else {
        alert(translateMessage(error.message));
      }
    }
  };

  const handleDislike = async (reviewId) => {
    if (!isAuthenticated || !user?._id) {
      showAuthRequiredPopup("dislike");
      return;
    }

    try {
      const response = await fetch(`/api/v1/pitch-review/dislike/${reviewId}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        let errorMessage = "Something went wrong";

        try {
          const errorData = await response.json();
          if (errorData.msg) {
            errorMessage = errorData.msg;
          }
        } catch (parseError) {
          if (response.status === 401) {
            errorMessage = "Unauthorized";
          } else if (response.status === 403) {
            errorMessage =
              "You have been banned, please get contact with our customer service.";
          } else if (response.status === 404) {
            errorMessage = "Review not found.";
          } else if (response.status >= 500) {
            errorMessage = "Server Error";
          }
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Update the review in the parent component
      if (data.review && onReviewUpdate) {
        onReviewUpdate(data.review);
      }

      console.log("Review disliked/undisliked successfully:", data);
    } catch (error) {
      console.error("Error disliking review:", error);

      // Handle network errors
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        alert(translateMessage("Failed to fetch"));
      } else {
        alert(translateMessage(error.message));
      }
    }
  };

  const toggleReplies = (reviewId) => {
    setExpandedReplies((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId],
    }));
  };

  const showReplyForm = (reviewId) => {
    setReplyForms((prev) => ({
      ...prev,
      [reviewId]: true,
    }));
  };

  const hideReplyForm = (reviewId) => {
    setReplyForms((prev) => ({
      ...prev,
      [reviewId]: false,
    }));
    setReplyTexts((prev) => ({
      ...prev,
      [reviewId]: "",
    }));
  };

  const handleReplyTextChange = (reviewId, text) => {
    setReplyTexts((prev) => ({
      ...prev,
      [reviewId]: text,
    }));
  };

  const handleReplySubmit = async (reviewId) => {
    if (!isAuthenticated || !user?._id) {
      showAuthRequiredPopup("reply");
      return;
    }

    const replyText = replyTexts[reviewId]?.trim();
    if (!replyText) {
      alert("Yorum boş olamaz.");
      return;
    }

    try {
      const response = await fetch(`/api/v1/pitch-review/reply/${reviewId}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          comment: replyText,
        }),
      });

      if (!response.ok) {
        let errorMessage = "Something went wrong";

        try {
          const errorData = await response.json();
          if (errorData.msg) {
            errorMessage = errorData.msg;
          }
        } catch (parseError) {
          if (response.status === 400) {
            errorMessage = "Please provide all required data.";
          } else if (response.status === 401) {
            errorMessage = "Unauthorized";
          } else if (response.status === 403) {
            errorMessage =
              "You have been banned, please get contact with our customer service.";
          } else if (response.status === 404) {
            errorMessage = "Review not found.";
          } else if (response.status >= 500) {
            errorMessage = "Server Error";
          }
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Update the review in the parent component
      if (data.review && onReviewUpdate) {
        onReviewUpdate(data.review);
      }

      console.log("Reply submitted successfully:", data);

      // Hide form and clear text
      hideReplyForm(reviewId);

      // Automatically expand replies to show the new reply
      setExpandedReplies((prev) => ({
        ...prev,
        [reviewId]: true,
      }));
    } catch (error) {
      console.error("Error submitting reply:", error);

      // Handle network errors
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        alert(translateMessage("Failed to fetch"));
      } else {
        alert(translateMessage(error.message));
      }
    }
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
                      className="w-10 h-10 rounded-full object-cover bg-gray-100"
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
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {review.user?.name || "Anonim Kullanıcı"}
                        </h4>
                        {isUserVerified(review) && (
                          <span
                            className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            title="Doğrulanmış kullanıcı"
                          >
                            <svg
                              className="w-3 h-3 mr-0.5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Doğrulanmış
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formatDate(review.createdAt)}
                        {isReviewEdited(review) && (
                          <span className="ml-1 text-gray-400 italic">
                            • düzenlendi
                          </span>
                        )}
                        {review.updatedAt &&
                          review.updatedAt !== review.createdAt && (
                            <span
                              className="ml-1 text-gray-400"
                              title={`Son güncelleme: ${formatDate(
                                review.updatedAt
                              )}`}
                            >
                              • {formatDate(review.updatedAt)}
                            </span>
                          )}
                      </p>
                    </div>
                    <div className="flex items-center ml-4">
                      {renderStars(getDisplayRating(review))}
                      <span className="ml-1 text-sm text-gray-600 font-medium">
                        {getDisplayRating(review).toFixed(1)}
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

                  {/* Review Photos */}
                  {getArrayLength(review.photos) > 0 && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center mb-3">
                        <svg
                          className="w-4 h-4 text-gray-600 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <p className="text-xs font-medium text-gray-700">
                          Fotoğraflar ({getArrayLength(review.photos)})
                        </p>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {review.photos.map((photo, index) => {
                          if (!photo || !photo.url) return null;

                          return (
                            <div
                              key={photo.public_id || `photo-${index}`}
                              className="cursor-pointer"
                              onClick={() => {
                                window.open(photo.url, "_blank");
                              }}
                            >
                              <img
                                src={photo.url}
                                alt={`Yorum fotoğrafı ${index + 1}`}
                                className="w-full h-16 rounded object-cover border border-gray-300"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  e.target.nextElementSibling.style.display =
                                    "flex";
                                }}
                              />
                              <div
                                className="w-full h-16 rounded border border-gray-300 bg-gray-100 flex items-center justify-center"
                                style={{ display: "none" }}
                              >
                                <svg
                                  className="w-6 h-6 text-gray-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z"
                                  />
                                </svg>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {getArrayLength(review.photos) > 4 && (
                        <p className="text-xs text-gray-500 mt-2 text-center">
                          Fotoğrafları büyütmek için tıklayın
                        </p>
                      )}
                    </div>
                  )}

                  {/* Interactive Engagement Actions (Likes/Dislikes) */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center space-x-4">
                      {/* Like Button */}
                      <button
                        onClick={() => handleLike(review._id)}
                        className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm review-interaction like-button focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 ${
                          hasUserLikedReview(review)
                            ? "bg-green-100 text-green-800 border border-green-300"
                            : "hover:bg-green-50 text-green-600"
                        }`}
                        title={
                          hasUserLikedReview(review)
                            ? "Beğeniyi geri al"
                            : "Beğen"
                        }
                      >
                        <svg
                          className="w-4 h-4"
                          fill={
                            hasUserLikedReview(review) ? "currentColor" : "none"
                          }
                          stroke={
                            hasUserLikedReview(review) ? "none" : "currentColor"
                          }
                          strokeWidth={hasUserLikedReview(review) ? 0 : 2}
                          viewBox="0 0 20 20"
                        >
                          <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                        </svg>
                        <span className="font-medium">
                          {getLikesCount(review)}
                        </span>
                      </button>

                      {/* Dislike Button */}
                      <button
                        onClick={() => handleDislike(review._id)}
                        className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm review-interaction dislike-button focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 ${
                          hasUserDislikedReview(review)
                            ? "bg-red-100 text-red-800 border border-red-300"
                            : "hover:bg-red-50 text-red-600"
                        }`}
                        title={
                          hasUserDislikedReview(review)
                            ? "Beğenmemeyi geri al"
                            : "Beğenme"
                        }
                      >
                        <svg
                          className="w-4 h-4 transform rotate-180"
                          fill={
                            hasUserDislikedReview(review)
                              ? "currentColor"
                              : "none"
                          }
                          stroke={
                            hasUserDislikedReview(review)
                              ? "none"
                              : "currentColor"
                          }
                          strokeWidth={hasUserDislikedReview(review) ? 0 : 2}
                          viewBox="0 0 20 20"
                        >
                          <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                        </svg>
                        <span className="font-medium">
                          {getDislikesCount(review)}
                        </span>
                      </button>
                    </div>

                    {/* Reply Actions */}
                    <div className="flex items-center space-x-3">
                      {/* Reply Count (only show if there are replies) */}
                      {getRepliesCount(review) > 0 && (
                        <button
                          onClick={() => toggleReplies(review._id)}
                          className="flex items-center space-x-1 text-xs text-gray-600 hover:text-green-600 review-interaction reply-toggle"
                          title="Cevapları göster/gizle"
                        >
                          <svg
                            className={`w-3 h-3 transition-transform duration-200 ${
                              expandedReplies[review._id] ? "rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                          <span className="font-medium">
                            {getRepliesCount(review)} Yorum
                          </span>
                        </button>
                      )}

                      {/* Reply Button */}
                      <button
                        onClick={() => {
                          if (!isAuthenticated) {
                            showAuthRequiredPopup("reply");
                            return;
                          }
                          showReplyForm(review._id);
                        }}
                        className="flex items-center space-x-1 text-xs px-2 py-1 rounded transition-colors text-gray-600 hover:text-green-600 hover:bg-green-50"
                        title="Bu yorumu yanıtla"
                      >
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                          />
                        </svg>
                        <span className="font-medium">Cevap ver</span>
                      </button>
                    </div>
                  </div>

                  {/* Collapsible Replies Section */}
                  {getRepliesCount(review) > 0 &&
                    expandedReplies[review._id] && (
                      <div className="mt-4 space-y-3 animate-fade-in">
                        <div className="ml-6 space-y-3">
                          {review.replies.map((reply, index) => {
                            if (!reply || !reply.user) return null;

                            return (
                              <div
                                key={reply._id || index}
                                className="bg-green-50 rounded-lg p-3 border-l-4 border-green-200 reply-item"
                                style={{ animationDelay: `${index * 100}ms` }}
                              >
                                <div className="flex items-start space-x-3">
                                  {/* Reply User Avatar */}
                                  <div className="flex-shrink-0">
                                    {reply.user?.profilePicture ? (
                                      <img
                                        src={reply.user.profilePicture}
                                        alt={reply.user?.name || "Anonim"}
                                        className="w-7 h-7 rounded-full object-cover border-2 border-white shadow-sm"
                                        onError={(e) => {
                                          e.target.style.display = "none";
                                          e.target.nextSibling.style.display =
                                            "flex";
                                        }}
                                      />
                                    ) : null}
                                    <div
                                      className={`w-7 h-7 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-medium border-2 border-white shadow-sm ${
                                        reply.user?.profilePicture
                                          ? "hidden"
                                          : "flex"
                                      }`}
                                    >
                                      {getInitials(reply.user?.name)}
                                    </div>
                                  </div>

                                  {/* Reply Content */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <span className="text-xs font-medium text-gray-900 truncate">
                                        {reply.user?.name || "Anonim"}
                                      </span>
                                      {reply.user?.email?.includes("admin") ||
                                      reply.user?.email?.includes("destek") ? (
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                          <svg
                                            className="w-2.5 h-2.5 mr-0.5"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                          >
                                            <path
                                              fillRule="evenodd"
                                              d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z"
                                              clipRule="evenodd"
                                            />
                                          </svg>
                                          Saha Temsilcisi
                                        </span>
                                      ) : null}
                                    </div>
                                    <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
                                      <span>{formatDate(reply.createdAt)}</span>
                                      {reply.isEdited === true && (
                                        <span className="italic text-gray-400">
                                          • düzenlendi{" "}
                                          {reply.updatedAt &&
                                          reply.updatedAt !== reply.createdAt
                                            ? formatDate(reply.updatedAt)
                                            : ""}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                      {reply.comment ||
                                        "Yorum içeriği bulunmuyor."}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  {/* Reply Form */}
                  {replyForms[review._id] && (
                    <div className="mt-4 animate-slide-down">
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-start space-x-3">
                          {/* Current User Avatar */}
                          <div className="flex-shrink-0">
                            {user?.profilePicture ? (
                              <img
                                src={user.profilePicture}
                                alt={user?.name || "Kullanıcı"}
                                className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  e.target.nextSibling.style.display = "flex";
                                }}
                              />
                            ) : null}
                            <div
                              className={`w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-medium border-2 border-white shadow-sm ${
                                user?.profilePicture ? "hidden" : "flex"
                              }`}
                            >
                              {getInitials(user?.name || "Kullanıcı")}
                            </div>
                          </div>

                          {/* Reply Form Content */}
                          <div className="flex-1">
                            <div className="mb-3">
                              <label
                                htmlFor={`reply-${review._id}`}
                                className="block text-sm font-medium text-gray-700 mb-2"
                              >
                                Yoruma cevap yazın
                              </label>
                              <textarea
                                id={`reply-${review._id}`}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                                placeholder="Cevabınızı buraya yazın..."
                                value={replyTexts[review._id] || ""}
                                onChange={(e) =>
                                  handleReplyTextChange(
                                    review._id,
                                    e.target.value
                                  )
                                }
                              />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-end space-x-3">
                              <button
                                onClick={() => hideReplyForm(review._id)}
                                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                              >
                                İptal
                              </button>
                              <button
                                onClick={() => handleReplySubmit(review._id)}
                                disabled={!replyTexts[review._id]?.trim()}
                                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                Gönder
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
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

      {/* Auth Required Popup */}
      <AuthRequiredPopup
        isVisible={showAuthPopup}
        onClose={hideAuthRequiredPopup}
        actionType={authPopupActionType}
      />
    </div>
  );
}

export default PitchReviewsSection;
