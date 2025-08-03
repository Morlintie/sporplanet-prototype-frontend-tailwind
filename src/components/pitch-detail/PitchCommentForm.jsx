import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import AuthRequiredPopup from "../shared/AuthRequiredPopup";

function PitchCommentForm({ pitch, onCommentSubmit, reviews = [] }) {
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showAuthPopup, setShowAuthPopup] = useState(false);

  const { user, isAuthenticated } = useAuth();

  // Check if user already has a review for this pitch
  const hasUserReviewed = () => {
    if (!isAuthenticated || !user?._id || !reviews.length) {
      return false;
    }

    return reviews.some(
      (review) =>
        review.user?._id === user._id ||
        review.user?.id === user._id ||
        review.user === user._id
    );
  };

  // Handle auth popup close
  const handleCloseAuthPopup = () => {
    setShowAuthPopup(false);
  };

  // Error message translation function
  const translateMessage = (message) => {
    const translations = {
      // Network errors
      "Failed to fetch":
        "Bağlantı hatası oluştu. İnternet bağlantınızı kontrol edin.",
      "Network Error": "Ağ hatası oluştu. Lütfen tekrar deneyin.",

      // Backend error messages
      "Pitch not found.": "Saha bulunamadı.",
      "Photos should be an array.": "Fotoğraflar dizi formatında olmalıdır.",
      "You can only upload up to 3 photos.":
        "En fazla 3 fotoğraf yükleyebilirsiniz.",
      "Invalid photo format.": "Geçersiz fotoğraf formatı.",
      "Image size should not exceed 5MB.":
        "Fotoğraf boyutu 5MB'yi geçmemelidir.",
      "You have been banned, please get contact with our customer service.":
        "Hesabınız askıya alınmıştır. Müşteri hizmetleri ile iletişime geçin.",
      "Please provide required data.": "Gerekli bilgileri girin.",

      // Generic errors
      "Something went wrong": "Bir şeyler ters gitti. Lütfen tekrar deneyin.",
      "Server Error": "Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.",
      Unauthorized: "Bu işlem için giriş yapmalısınız.",
    };

    return (
      translations[message] ||
      "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin."
    );
  };

  // Convert file to base64
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle file selection
  const handleFileSelection = (event) => {
    const files = Array.from(event.target.files);

    // Filter for image files only
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    // Limit to 3 images (backend requirement)
    const limitedFiles = imageFiles.slice(0, 3);

    setSelectedFiles(limitedFiles);
    setError(""); // Clear any previous errors
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Check authentication
    if (!isAuthenticated || !user?._id) {
      setShowAuthPopup(true);
      return;
    }

    // Check if user already has a review for this pitch
    if (hasUserReviewed()) {
      setError(
        "Bu saha için zaten yorum yapmışsınız. Her saha için sadece bir yorum yapabilirsiniz."
      );
      return;
    }

    // Validate required fields
    if (!title.trim() || !comment.trim() || rating === 0) {
      setError("Lütfen başlık, yorum ve puan alanlarını doldurun.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert photos to base64
      let base64Photos = [];
      if (selectedFiles.length > 0) {
        if (selectedFiles.length > 3) {
          throw new Error("You can only upload up to 3 photos.");
        }

        // Convert all files to base64
        const photoPromises = selectedFiles.map(convertFileToBase64);
        base64Photos = await Promise.all(photoPromises);
      }

      // Prepare request body
      const requestBody = {
        pitchId: pitch.id,
        rating,
        title: title.trim(),
        comment: comment.trim(),
        photos: base64Photos,
      };

      // Make API call
      const response = await fetch("/api/v1/pitch-review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
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
          if (response.status === 401) {
            errorMessage = "Unauthorized";
          } else if (response.status === 404) {
            errorMessage = "Pitch not found.";
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
      console.log("Review created successfully:", data);

      // Call parent component's callback with the new review
      if (data.review && onCommentSubmit) {
        await onCommentSubmit(data.review);
      }

      // Reset form after successful submission
      setTitle("");
      setComment("");
      setRating(0);
      setSelectedFiles([]);

      // Clear file input
      const fileInput = document.getElementById("photo-upload");
      if (fileInput) {
        fileInput.value = "";
      }

      setError(""); // Clear any errors
    } catch (error) {
      console.error("Error submitting review:", error);

      // Handle network errors
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        setError(translateMessage("Failed to fetch"));
      } else {
        setError(translateMessage(error.message));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render star for rating
  const renderRatingStar = (index) => {
    const isActive = index < (hoveredRating || rating);

    return (
      <button
        key={index}
        type="button"
        className="focus:outline-none transition-transform hover:scale-110"
        onMouseEnter={() => setHoveredRating(index + 1)}
        onMouseLeave={() => setHoveredRating(0)}
        onClick={() => setRating(index + 1)}
        disabled={isSubmitting}
      >
        <svg
          className={`w-6 h-6 transition-colors ${
            isActive ? "text-yellow-400" : "text-gray-300"
          }`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      </button>
    );
  };

  // Check if user already reviewed this pitch
  const userAlreadyReviewed = hasUserReviewed();

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3
        className="text-xl font-bold mb-3 text-center"
        style={{ color: "rgb(0, 128, 0)" }}
      >
        Yorum Yap
      </h3>

      {/* Show message if user already reviewed */}
      {isAuthenticated && userAlreadyReviewed ? (
        <div className="text-center py-8">
          <div className="mb-4">
            <svg
              className="w-16 h-16 mx-auto text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            Yorumunuz Kayıtlı
          </h4>
          <p className="text-gray-600 text-sm leading-relaxed">
            Bu saha için daha önce yorum yapmışsınız. Her saha için sadece bir
            yorum yapabilirsiniz.
          </p>
        </div>
      ) : (
        <>
          {/* Error Display */}
          {error && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-2">
            {/* Title Input */}
            <div>
              <label
                htmlFor="comment-title"
                className="block text-xs font-medium text-gray-700 mb-1"
              >
                Başlık
              </label>
              <input
                type="text"
                id="comment-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Yorumunuz için bir başlık yazın..."
                disabled={isSubmitting}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                maxLength={100}
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {title.length}/100
              </div>
            </div>

            {/* Comment Input */}
            <div>
              <label
                htmlFor="comment-text"
                className="block text-xs font-medium text-gray-700 mb-1"
              >
                Yorum
              </label>
              <textarea
                id="comment-text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Sahaya dair deneyimlerinizi paylaşın..."
                disabled={isSubmitting}
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors resize-vertical disabled:opacity-50 disabled:cursor-not-allowed"
                maxLength={500}
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {comment.length}/500
              </div>
            </div>

            {/* Rating Stars and Photo Upload */}
            <div className="flex items-center justify-between">
              {/* Stars on the left */}
              <div className="flex items-center space-x-1">
                {[0, 1, 2, 3, 4].map(renderRatingStar)}
                <span className="ml-2 text-xs text-gray-600">
                  {rating > 0 ? `${rating}/5` : "Puan seçin"}
                </span>
              </div>

              {/* Gallery icon on the right */}
              <div className="flex items-center">
                {/* Hidden file input */}
                <input
                  type="file"
                  id="photo-upload"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelection}
                  className="hidden"
                  disabled={isSubmitting}
                />

                {/* Gallery icon as label */}
                <label
                  htmlFor="photo-upload"
                  className={`inline-flex items-center justify-center w-8 h-8 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors ${
                    isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <svg
                    className="w-4 h-4 text-gray-400"
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
                </label>
              </div>
            </div>

            {/* Selected files info (only show if files are selected) */}
            {selectedFiles.length > 0 && (
              <div className="text-xs text-gray-600">
                {selectedFiles.length}/3 fotoğraf seçildi
                <div className="text-xs text-gray-500 mt-1 truncate">
                  {selectedFiles.map((file, index) => (
                    <span key={index}>
                      {file.name}
                      {index < selectedFiles.length - 1 && ", "}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  !title.trim() ||
                  !comment.trim() ||
                  rating === 0
                }
                className="px-6 py-2 text-sm bg-[rgb(0,128,0)] text-white font-semibold rounded-md hover:bg-[rgb(0,100,0)] transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Gönderiliyor...
                  </div>
                ) : (
                  "Yorumu Gönder"
                )}
              </button>
            </div>
          </form>

          {/* Auth Required Popup */}
          <AuthRequiredPopup
            isVisible={showAuthPopup}
            onClose={handleCloseAuthPopup}
            actionType="comment"
            customMessage="Yorum yapabilmek için giriş yapmalısınız"
          />
        </>
      )}
    </div>
  );
}

export default PitchCommentForm;
