import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Notification from "../shared/Notification";
import LocationPermissionPopup from "../shared/LocationPermissionPopup";
import "../../styles/review-animations.css";

function MyComments({ user }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedReplies, setExpandedReplies] = useState({});
  const [error, setError] = useState(null);

  // Edit states
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editImages, setEditImages] = useState([]);
  const [editLoading, setEditLoading] = useState(false);
  const [closingEditId, setClosingEditId] = useState(null);

  // Delete states
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  // Notification states
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState("success");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  const [limit, setLimit] = useState(10);
  const [hasMorePages, setHasMorePages] = useState(false);

  // Error message translation function
  const translateMessage = (message) => {
    const translations = {
      "Failed to fetch":
        "Bağlantı hatası oluştu. İnternet bağlantınızı kontrol edin.",
      "Network Error": "Ağ hatası oluştu. Lütfen tekrar deneyin.",
      "You have been banned, please get contact with our customer service.":
        "Hesabınız askıya alınmıştır. Müşteri hizmetleri ile iletişime geçin.",
      "No reviews found.": "Henüz yorum yapılmamış.",
      "Please provide required data.": "Gerekli bilgileri girin.",
      "Images should be an array.": "Resimler dizisi olarak gönderilmelidir.",
      "Review not found.": "Yorum bulunamadı.",
      "You are not authorized to perform that action.":
        "Bu işlem için yetkiniz bulunmamaktadır.",
      "Invalid image format.": "Geçersiz resim formatı.",
      "Image size should not exceed 5MB.": "Resim boyutu 5MB'ı geçmemelidir.",
      "Review deleted successfully.": "Yorum başarıyla silindi.",
      "Something went wrong": "Bir şeyler ters gitti. Lütfen tekrar deneyin.",
      "Server Error": "Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.",
    };

    return (
      translations[message] ||
      "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin."
    );
  };

  // Fetch user reviews from backend
  const fetchUserReviews = async (page = 1) => {
    if (!isAuthenticated) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/v1/pitch-review/user?page=${page}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          // 404 means no reviews found - this is not an error, just empty results
          setComments([]);
          setTotalReviews(0);
          setLimit(10);
          setCurrentPage(1);
          setHasMorePages(false);
          setLoading(false);
          return;
        }

        let errorMessage = "Yorumlar yüklenirken bir hata oluştu.";
        try {
          const errorData = await response.json();
          if (errorData.msg) {
            errorMessage = errorData.msg;
          }
        } catch (parseError) {
          if (response.status === 401) {
            errorMessage = "Bu işlem için giriş yapmanız gerekir.";
          } else if (response.status === 403) {
            errorMessage =
              "You have been banned, please get contact with our customer service.";
          } else if (response.status >= 500) {
            errorMessage = "Server Error";
          }
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Process backend data to match frontend structure
      const formattedComments = data.reviews.map((review) => ({
        id: review._id,
        pitchName: review.pitch?.name || "Silinmiş Saha", // Handle null pitch case
        pitchId: review.pitch?._id || null,
        pitchContact: review.pitch?.contact || null,
        pitchRating: review.pitch?.rating || null,
        title: review.title || "",
        comment: review.comment,
        rating: review.rating,
        date: new Date(review.createdAt).toLocaleDateString("tr-TR"),
        isEditing: false,
        tempRating: review.rating,
        isVerified: review.isVerified || false,
        likes: review.likes?.length || 0,
        dislikes: review.dislikes?.length || 0,
        photos: review.photos || [],
        replies: review.replies || [],
        isEdited: review.isEdited || false,
        originalData: review,
      }));

      // If it's first page, replace comments, otherwise append
      if (page === 1) {
        setComments(formattedComments);
      } else {
        setComments((prev) => [...prev, ...formattedComments]);
      }

      // Update pagination info
      setTotalReviews(data.totalReviews);
      setLimit(data.limit);
      setCurrentPage(page);
      setHasMorePages(data.totalReviews > page * data.limit);
    } catch (error) {
      console.error("Error fetching user reviews:", error);
      setError(translateMessage(error.message));

      // On error, reset to empty state
      setComments([]);
      setTotalReviews(0);
    } finally {
      setLoading(false);
    }
  };

  // Load more reviews (pagination)
  const handleLoadMore = () => {
    if (hasMorePages && !loading) {
      fetchUserReviews(currentPage + 1);
    }
  };

  // Load reviews when component mounts or authentication status changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserReviews(1);
    } else {
      // Clear data when not authenticated
      setComments([]);
      setTotalReviews(0);
    }
  }, [isAuthenticated]);

  // Get user initials for profile picture
  const getUserInitials = (name) => {
    if (!name) return "U";
    const names = name.trim().split(" ");
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (
      names[0].charAt(0) + names[names.length - 1].charAt(0)
    ).toUpperCase();
  };

  // Handle image selection for editing
  const handleImageSelect = (event) => {
    const files = Array.from(event.target.files);
    if (files.length + editImages.length > 3) {
      alert("En fazla 3 resim yükleyebilirsiniz.");
      return;
    }

    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        alert("Resim boyutu 5MB'ı geçmemelidir.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setEditImages((prev) => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove image from edit list
  const removeEditImage = (index) => {
    setEditImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle smooth closing animation
  const handleCloseEdit = (id) => {
    setClosingEditId(id);

    // Wait for animation to complete, then actually close
    setTimeout(() => {
      setComments(
        comments.map((c) =>
          c.id === id ? { ...c, isEditing: false, tempRating: c.rating } : c
        )
      );
      setEditingCommentId(null);
      setEditImages([]);
      setClosingEditId(null);
    }, 300); // Match the slideUp animation duration
  };

  // Notification helper functions
  const showNotificationMessage = (message, type = "success") => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
  };

  const hideNotification = () => {
    setShowNotification(false);
  };

  // Handle delete review - show confirmation popup
  const handleDelete = (id) => {
    setCommentToDelete(id);
    setShowDeletePopup(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    const id = commentToDelete;
    setShowDeletePopup(false);
    setCommentToDelete(null);
    setDeleteLoading(id);

    try {
      const response = await fetch(`/api/v1/pitch-review/${id}`, {
        method: "DELETE",
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
          if (response.status === 400) {
            errorMessage = "Please provide required data.";
          } else if (response.status === 401) {
            errorMessage = "You are not authorized to perform that action.";
          } else if (response.status === 404) {
            errorMessage = "Review not found.";
          } else if (response.status >= 500) {
            errorMessage = "Server Error";
          }
        }

        throw new Error(errorMessage);
      }

      // Remove the comment from the list
      setComments(comments.filter((comment) => comment.id !== id));

      // Update total reviews count
      setTotalReviews((prevTotal) => Math.max(0, prevTotal - 1));

      // Show success notification
      showNotificationMessage("Yorum başarıyla silindi.", "success");

      console.log("Yorum başarıyla silindi:", id);
    } catch (error) {
      console.error("Error deleting review:", error);
      showNotificationMessage(translateMessage(error.message), "error");
    } finally {
      setDeleteLoading(null);
    }
  };

  // Handle delete cancellation
  const handleDeleteCancel = () => {
    setShowDeletePopup(false);
    setCommentToDelete(null);
  };

  const handleEdit = (id) => {
    const comment = comments.find((c) => c.id === id);
    setEditingCommentId(id);
    setEditImages(comment.photos.map((photo) => photo.url) || []);
    setComments(
      comments.map((comment) =>
        comment.id === id
          ? { ...comment, isEditing: true, tempRating: comment.rating }
          : comment
      )
    );
  };

  const handleSave = async (id, newComment, newRating, newTitle) => {
    setEditLoading(true);

    try {
      // Prepare images array - only send base64 strings that are new (not URLs)
      const imagesToSend = editImages.filter((img) =>
        img.startsWith("data:image/")
      );

      const requestBody = {
        title: newTitle || "",
        comment: newComment,
        rating: newRating,
        images: imagesToSend,
      };

      const response = await fetch(`/api/v1/pitch-review/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
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
            errorMessage = "Please provide required data.";
          } else if (response.status === 401) {
            errorMessage = "You are not authorized to perform that action.";
          } else if (response.status === 404) {
            errorMessage = "Review not found.";
          } else if (response.status >= 500) {
            errorMessage = "Server Error";
          }
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      const updatedReview = data.review;

      // Update the comment in the list with backend response immediately
      setComments(
        comments.map((comment) =>
          comment.id === id
            ? {
                ...comment,
                comment: updatedReview.comment,
                rating: updatedReview.rating,
                tempRating: updatedReview.rating,
                title: updatedReview.title || "",
                photos: updatedReview.photos || [],
                isEdited: updatedReview.isEdited,
                originalData: updatedReview,
              }
            : comment
        )
      );

      // Clear edit states with smooth animation after updating data
      setClosingEditId(id);

      // Wait for animation to complete, then actually close
      setTimeout(() => {
        setComments((prevComments) =>
          prevComments.map((c) =>
            c.id === id ? { ...c, isEditing: false } : c
          )
        );
        setEditingCommentId(null);
        setEditImages([]);
        setClosingEditId(null);
      }, 300);

      console.log("Yorum başarıyla güncellendi:", updatedReview);
    } catch (error) {
      console.error("Error updating review:", error);
      alert(translateMessage(error.message));
    } finally {
      setEditLoading(false);
    }
  };

  const handleRatingChange = (id, rating) => {
    setComments(
      comments.map((comment) =>
        comment.id === id ? { ...comment, tempRating: rating } : comment
      )
    );
  };

  const toggleReplies = (commentId) => {
    setExpandedReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "text-yellow-400" : "text-gray-300"
        }`}
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
          i < rating
            ? "text-yellow-400 hover:text-yellow-500"
            : "text-gray-300 hover:text-yellow-200"
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
        onClick={() => handleRatingChange(commentId, i + 1)}
        tabIndex="0"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
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

  if (loading && comments.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">
          Yorumlarım
        </h1>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">
        Yorumlarım
      </h1>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-red-600 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <span className="text-red-700 font-medium">Hata:</span>
          </div>
          <p className="text-red-600 mt-1">{error}</p>
          <button
            onClick={() => fetchUserReviews(1)}
            className="mt-2 text-sm text-red-600 hover:text-red-800 hover:cursor-pointer underline"
          >
            Tekrar dene
          </button>
        </div>
      )}

      <div className="space-y-6">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className={`border border-gray-200 rounded-lg p-6 transition-all duration-300 ${
              editingCommentId && editingCommentId !== comment.id
                ? "opacity-30 pointer-events-none"
                : ""
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {comment.pitchId ? (
                    <h3
                      className="text-lg font-semibold text-gray-900 hover:text-green-600 cursor-pointer transition-colors"
                      onClick={() =>
                        navigate(`/pitch-detail/${comment.pitchId}`)
                      }
                      title="Saha detayına git"
                    >
                      {comment.pitchName}
                    </h3>
                  ) : (
                    <h3 className="text-lg font-semibold text-gray-500">
                      {comment.pitchName}
                    </h3>
                  )}
                  {!comment.pitchId && (
                    <span className="text-xs text-red-500 italic">
                      (saha mevcut değil)
                    </span>
                  )}
                  {comment.isVerified && (
                    <span className="text-xs text-gray-500 italic">
                      (Doğrulanmış yorum)
                    </span>
                  )}
                  {comment.isEdited && (
                    <span className="text-xs text-gray-500 italic">
                      (düzenlendi)
                    </span>
                  )}
                </div>

                {comment.title && (
                  <h4 className="text-md font-medium text-gray-800 mb-1">
                    {comment.title}
                  </h4>
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
                        <svg
                          className="w-4 h-4 text-red-500 mr-1"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                        {comment.likes}
                      </div>
                    )}

                    {comment.dislikes > 0 && (
                      <div className="flex items-center text-sm text-gray-600">
                        <svg
                          className="w-4 h-4 text-gray-400 mr-1"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2.65l1.45 1.32C18.6 8.64 22 11.72 22 15.5c0 3.08-2.42 5.5-5.5 5.5-1.74 0-3.41-.81-4.5-2.09C10.91 20.19 9.24 21 7.5 21 4.42 21 2 18.58 2 15.5c0-3.78 3.4-6.86 8.55-11.54L12 2.65z" />
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
                            expandedReplies[comment.id]
                              ? "rotate-180 text-blue-600"
                              : "text-blue-500"
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
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(comment.id)}
                  disabled={deleteLoading === comment.id}
                  className="text-red-600 hover:text-red-800 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  tabIndex="0"
                >
                  {deleteLoading === comment.id ? (
                    <svg
                      className="animate-spin h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {comment.isEditing ? (
              <div
                className={`overflow-hidden ${
                  closingEditId === comment.id
                    ? "animate-slideUp"
                    : "animate-slideDown"
                }`}
              >
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

                {/* Image Upload Section */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Fotoğraflar (En fazla 3 adet)
                    </label>
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                        disabled={editImages.length >= 3}
                      />
                      <div className="flex items-center space-x-1 text-gray-600 hover:text-green-600 transition-colors">
                        <svg
                          className="w-5 h-5"
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
                        <span className="text-sm">Fotoğraf Ekle</span>
                      </div>
                    </label>
                  </div>

                  {/* Image Preview */}
                  {editImages.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {editImages.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image}
                            alt={`Preview ${index + 1}`}
                            className="w-20 h-20 object-cover rounded-md border border-gray-300"
                          />
                          <button
                            type="button"
                            onClick={() => removeEditImage(index)}
                            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      const textarea = document.getElementById(
                        `comment-${comment.id}`
                      );
                      const titleInput = document.getElementById(
                        `title-${comment.id}`
                      );
                      const newTitle = titleInput
                        ? titleInput.value
                        : comment.title;
                      handleSave(
                        comment.id,
                        textarea.value,
                        comment.tempRating,
                        newTitle
                      );
                    }}
                    disabled={editLoading}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors cursor-pointer font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    tabIndex="0"
                  >
                    {editLoading ? (
                      <div className="flex items-center">
                        <svg
                          className="animate-spin h-4 w-4 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Güncelleniyor...
                      </div>
                    ) : (
                      "Kaydet"
                    )}
                  </button>
                  <button
                    onClick={() => handleCloseEdit(comment.id)}
                    disabled={editLoading}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors cursor-pointer font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
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
                          onClick={() => window.open(photo.url, "_blank")}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Yanıtlar - Sadece açık olduğunda göster */}
                {comment.replies &&
                  comment.replies.length > 0 &&
                  expandedReplies[comment.id] && (
                    <div className="mt-4 border-t border-gray-100 pt-4 animate-fade-in">
                      <h5 className="text-sm font-medium text-gray-700 mb-3">
                        Yanıtlar:
                      </h5>
                      <div className="space-y-3">
                        {comment.replies.map((reply, index) => (
                          <div
                            key={index}
                            className="bg-green-50 rounded-lg p-3 ml-4 border-l-4 border-green-200"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                <span className="text-xs font-semibold text-white">
                                  {getUserInitials(reply.user.name)}
                                </span>
                              </div>
                              <span className="text-sm font-medium text-gray-900">
                                {reply.user.name}
                              </span>
                              {reply.isEdited && (
                                <span className="text-xs text-gray-500 italic">
                                  (düzenlendi)
                                </span>
                              )}
                              <span className="text-xs text-gray-500">
                                {new Date(reply.createdAt).toLocaleDateString(
                                  "tr-TR"
                                )}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">
                              {reply.comment}
                            </p>
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

      {/* Load More Button */}
      {hasMorePages && comments.length > 0 && (
        <div className="mt-6 text-center">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: "rgb(0, 128, 0)",
              borderRadius: "6px",
            }}
            onMouseEnter={(e) => {
              if (!loading) e.target.style.backgroundColor = "rgb(0, 100, 0)";
            }}
            onMouseLeave={(e) => {
              if (!loading) e.target.style.backgroundColor = "rgb(0, 128, 0)";
            }}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin h-4 w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Yükleniyor...
              </div>
            ) : (
              `Daha Fazla Göster (${totalReviews - comments.length} kaldı)`
            )}
          </button>
        </div>
      )}

      {comments.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Henüz Yorum Yok
          </h3>
          <p className="text-gray-600">
            Henüz hiç yorum yapmamışsınız. Sahalar hakkında yorum yapmak için
            saha detay sayfalarını ziyaret edin.
          </p>
        </div>
      )}

      {/* Notification */}
      <Notification
        message={notificationMessage}
        type={notificationType}
        isVisible={showNotification}
        onClose={hideNotification}
      />

      {/* Delete Confirmation Popup */}
      <LocationPermissionPopup
        isVisible={showDeletePopup}
        onAccept={handleDeleteConfirm}
        onDecline={handleDeleteCancel}
        title="Yorumu Sil"
        message="Bu yorumu silmek istediğinizden emin misiniz?"
        acceptText="Evet"
        declineText="Hayır"
        icon="delete"
        showInfo={false}
      />
    </div>
  );
}

export default MyComments;
