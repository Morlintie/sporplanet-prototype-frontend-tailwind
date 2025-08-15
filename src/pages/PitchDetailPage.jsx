import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/shared/Header";
import Footer from "../components/shared/Footer";
import MaintenanceContactPopup from "../components/shared/MaintenanceContactPopup";
import PitchHeroSection from "../components/pitch-detail/PitchHeroSection";
import PitchAboutSection from "../components/pitch-detail/PitchAboutSection";
import PitchFeaturesSection from "../components/pitch-detail/PitchFeaturesSection";
import PitchReviewsSection from "../components/pitch-detail/PitchReviewsSection";
import PitchReservationCard from "../components/pitch-detail/PitchReservationCard";
import PitchLocationMapSection from "../components/pitch-detail/PitchLocationMapSection";
import PitchVideosSection from "../components/pitch-detail/PitchVideosSection";
import PitchCommentForm from "../components/pitch-detail/PitchCommentForm";
import Notification from "../components/shared/Notification";

function PitchDetailPage() {
  const { pitchId } = useParams();
  const navigate = useNavigate();
  const [pitch, setPitch] = useState(null);
  // Hiçbir tarih otomatik seçili olmasın, kullanıcı manuel seçsin
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [loading, setLoading] = useState(true);
  const [showMaintenancePopup, setShowMaintenancePopup] = useState(false);
  const [error, setError] = useState("");

  // Scroll to top when component mounts or pitchId changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pitchId]);

  // Reviews states
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState("");
  const [totalReviews, setTotalReviews] = useState(0);
  const [currentReviewsCount, setCurrentReviewsCount] = useState(0);
  const [reviewsLimit, setReviewsLimit] = useState(5);
  const [canLoadMoreReviews, setCanLoadMoreReviews] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Booking states
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState("");
  const [occupiedSlots, setOccupiedSlots] = useState({}); // Format: { "2025-08-09": ["09:00", "19:00"] }

  // Reservation/Booking states
  const [isBooking, setIsBooking] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState("success");

  // Transform backend data to pitch format
  const transformBackendDataToPitch = (item) => {
    const address = item.location?.address;
    const location = address
      ? `${address.district}, ${address.city}`
      : "Lokasyon bilgisi yok";

    // Generate features based on facilities
    const features = [];
    if (item.facilities?.changingRooms) features.push("Soyunma Odası");
    if (item.facilities?.showers) features.push("Duş");
    if (item.specifications?.hasLighting) features.push("Işıklandırma");
    if (item.facilities?.parking) features.push("Otopark");
    if (item.facilities?.camera) features.push("Kamera Sistemi");
    if (item.facilities?.shoeRenting) features.push("Ayakkabı Kiralama");
    if (item.facilities?.otherAmenities) {
      item.facilities.otherAmenities.forEach((amenity) => {
        if (amenity === "wifi") features.push("WiFi");
        if (amenity === "cafe") features.push("Kafeterya");
        if (amenity === "locker") features.push("Dolap");
        if (amenity === "snack bar") features.push("Snack Bar");
      });
    }

    // Surface type mapping
    const surfaceTypeMap = {
      artificial_turf: "Yapay Çim",
      natural_grass: "Doğal Çim",
      indoor_court: "Kapalı Kort",
    };

    if (
      item.specifications?.surfaceType &&
      surfaceTypeMap[item.specifications.surfaceType]
    ) {
      features.push(surfaceTypeMap[item.specifications.surfaceType]);
    }

    return {
      id: item._id || item.company, // Use _id from backend, fallback to company for compatibility
      name: item.name || "İsimsiz Saha",
      description: item.description || "",
      location,
      fullAddress: address
        ? `${address.street}, ${address.neighborhood}, ${address.district}, ${address.city}`
        : "Adres bilgisi yok",
      city: address?.city || "Bilinmeyen Şehir",
      district: address?.district || "Bilinmeyen İlçe",
      price: Math.round((item.pricing?.hourlyRate || 50000) / 100), // Convert kuruş to TL
      nightPrice: Math.round((item.pricing?.nightHourlyRate || 60000) / 100),
      // Use backend rating data from /api/v1/pitch/:id - if rating is 0, default to 5.0
      rating: item.rating?.averageRating > 0 ? item.rating.averageRating : 5.0,
      totalReviews: item.rating?.totalReviews || 0,
      capacity: `${
        item.specifications?.recommendedCapacity?.players || 10
      } oyuncu`,
      pitchType: item.specifications?.isIndoor ? "indoor" : "outdoor",
      surfaceType: item.specifications?.surfaceType || "artificial_turf",
      hasLighting: item.specifications?.hasLighting || false,
      cameraSystem: item.facilities?.camera || false,
      shoeRental: item.facilities?.shoeRenting || false,
      image:
        item.media?.images?.find((img) => img.isPrimary)?.url ||
        item.media?.images?.[0]?.url ||
        "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=250&fit=crop",
      images: item.media?.images || [],
      features,
      facilities: item.facilities || {},
      status: item.status || "active",
      refundAllowed: item.refundAllowed || false,
      contact: item.contact || {},
      coordinates: {
        lat: item.location?.coordinates?.[1] || 41.0082,
        lng: item.location?.coordinates?.[0] || 28.9784,
      },
      dimensions: {
        length: item.specifications?.dimensions?.length || 30,
        width: item.specifications?.dimensions?.width || 50,
      },
      // Video data from media
      hasVideos: item.media?.videos?.length > 0,
      videos: item.media?.videos || [],
      // Availability data
      availability: item.availability || {
        unavailableSlots: ["06-07", "07-08"],
        bookedSlots: ["09-10", "14-15"],
        maintenanceSlots: [],
      },
    };
  };

  // Error message translation function
  const translateMessage = (message) => {
    const translations = {
      // Network errors
      "Failed to fetch":
        "Bağlantı hatası oluştu. İnternet bağlantınızı kontrol edin.",
      "Network Error": "Ağ hatası oluştu. Lütfen tekrar deneyin.",

      // Backend error messages
      "You have been banned, please get contact with our customer service.":
        "Hesabınız askıya alınmıştır. Müşteri hizmetleri ile iletişime geçin.",
      "Please provide required data.": "Gerekli bilgileri girin.",
      "please provide all required data": "Gerekli bilgileri girin.",
      "No pitch found.": "Saha bulunamadı. Aradığınız saha mevcut değil.",
      "Pitch not found": "Saha bulunamadı. Aradığınız saha mevcut değil.",
      "This pitch is closed for bookings": "Bu saha rezervasyona kapalıdır.",
      "This pitch is not available for bookings":
        "Bu saha rezervasyon için müsait değil.",
      "You cannot book a pitch in the past":
        "Geçmiş tarih için rezervasyon yapamazsınız.",
      "No bookings found.": "Bu saha için rezervasyon bulunamadı.",

      // Generic errors
      "Something went wrong": "Bir şeyler ters gitti. Lütfen tekrar deneyin.",
      "Server Error": "Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.",
    };

    return (
      translations[message] ||
      "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin."
    );
  };

  // Fetch pitch data from backend
  const fetchPitchData = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/v1/pitch/${pitchId}`, {
        method: "GET",
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
          if (response.status === 404) {
            errorMessage = "No pitch found.";
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
      console.log("Pitch data başarıyla alındı:", data);

      if (data.pitch) {
        const transformedPitch = transformBackendDataToPitch(data.pitch);
        setPitch(transformedPitch);

        // Show maintenance popup if pitch is under maintenance
        if (transformedPitch.status === "maintenance") {
          setShowMaintenancePopup(true);
        }
      } else {
        throw new Error("No pitch found.");
      }
    } catch (error) {
      console.error("Error fetching pitch data:", error);

      // Handle network errors
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        setError(translateMessage("Failed to fetch"));
      } else {
        const translatedError = translateMessage(error.message);
        setError(translatedError);
      }

      // Redirect to reservation page if pitch not found
      if (error.message.includes("No pitch found")) {
        navigate("/reservation");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch pitch reviews
  const fetchPitchReviews = async (page = 1) => {
    if (!pitchId) return;

    try {
      setReviewsLoading(true);
      setReviewsError("");

      const url = `/api/v1/pitch/singlePitchReviews/${pitchId}?page=${page}`;

      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      setReviews(data.pitchReviews || []);
      setTotalReviews(data.totalReviews || 0);
      setCurrentReviewsCount(data.countReviews || 0);
      setReviewsLimit(data.limitReviews || 5);
      setCurrentPage(page);

      // Check if we can load more reviews
      setCanLoadMoreReviews(data.countReviews < data.totalReviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setReviewsError(translateMessage(error.message));
    } finally {
      setReviewsLoading(false);
    }
  };

  // Load more reviews
  const loadMoreReviews = () => {
    if (canLoadMoreReviews && !reviewsLoading) {
      fetchPitchReviews(currentPage + 1);
    }
  };

  // Update a specific review in the reviews array
  const handleReviewUpdate = (updatedReview) => {
    setReviews((prevReviews) => {
      return prevReviews.map((review) => {
        if (review._id === updatedReview._id) {
          return updatedReview;
        }
        return review;
      });
    });
  };

  // Fetch pitch bookings
  const fetchPitchBookings = async () => {
    if (!pitchId) return;

    try {
      setBookingsLoading(true);
      setBookingsError("");

      const response = await fetch(
        `/api/v1/booking/public/pitch/current/${pitchId}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        let errorMessage = "Something went wrong";

        try {
          const errorData = await response.json();
          if (errorData.msg) {
            errorMessage = errorData.msg;
          }
        } catch (parseError) {
          if (response.status === 404) {
            errorMessage = "No bookings found.";
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
      console.log("Booking data başarıyla alındı:", data);

      // Process booking data and extract occupied slots
      const processedBookings = data.bookings || [];
      const occupiedSlotsMap = {};

      processedBookings.forEach((booking) => {
        if (booking.status === "pending" || booking.status === "confirmed") {
          const startDate = new Date(booking.start);

          // Format date as YYYY-MM-DD for consistency
          const dateKey = startDate.toISOString().split("T")[0];

          // Format time as HH:MM
          const timeSlot = startDate.toTimeString().slice(0, 5);

          if (!occupiedSlotsMap[dateKey]) {
            occupiedSlotsMap[dateKey] = [];
          }

          occupiedSlotsMap[dateKey].push(timeSlot);
        }
      });

      setBookings(processedBookings);
      setOccupiedSlots(occupiedSlotsMap);

      console.log("Processed occupied slots:", occupiedSlotsMap);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setBookingsError(translateMessage(error.message));
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    fetchPitchData();
  }, [pitchId]);

  // Fetch reviews when pitch data is loaded
  useEffect(() => {
    if (pitchId && !loading) {
      fetchPitchReviews(1);
    }
  }, [pitchId, loading]);

  // Fetch bookings when pitch data is loaded
  useEffect(() => {
    if (pitchId && !loading) {
      fetchPitchBookings();
    }
  }, [pitchId, loading]);

  // Render stars for rating
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasPartialStar = rating % 1 !== 0;
    const partialStarValue = rating - fullStars;
    const stars = [];

    for (let i = 0; i < 5; i++) {
      const isFullStar = i < fullStars;
      const isPartialStar = i === fullStars && hasPartialStar;

      if (isPartialStar) {
        // Partial star with gradient
        stars.push(
          <div key={i} className="relative w-5 h-5 inline-block">
            {/* Background (empty) star */}
            <img
              src="https://www.svgrepo.com/show/13695/star.svg"
              alt="Star"
              className="absolute w-5 h-5 opacity-30"
              style={{
                filter:
                  "brightness(0) saturate(100%) invert(80%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(95%) contrast(85%)",
              }}
            />
            {/* Foreground (filled) star with clip */}
            <img
              src="https://www.svgrepo.com/show/13695/star.svg"
              alt="Star"
              className="absolute w-5 h-5 opacity-100"
              style={{
                filter:
                  "brightness(0) saturate(100%) invert(78%) sepia(86%) saturate(2476%) hue-rotate(7deg) brightness(101%) contrast(107%)",
                clipPath: `inset(0 ${100 - partialStarValue * 100}% 0 0)`,
              }}
            />
          </div>
        );
      } else {
        // Full or empty star
        stars.push(
          <img
            key={i}
            src="https://www.svgrepo.com/show/13695/star.svg"
            alt="Star"
            className={`w-5 h-5 ${isFullStar ? "opacity-100" : "opacity-30"}`}
            style={{
              filter: isFullStar
                ? "brightness(0) saturate(100%) invert(78%) sepia(86%) saturate(2476%) hue-rotate(7deg) brightness(101%) contrast(107%)"
                : "brightness(0) saturate(100%) invert(80%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(95%) contrast(85%)",
            }}
          />
        );
      }
    }
    return stars;
  };

  // Tarihi görüntüleme formatına çevir (YYYY-MM-DD -> DD.MM.YYYY)
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    try {
      const [year, month, day] = dateString.split("-");
      return `${day}.${month}.${year}`;
    } catch {
      return dateString;
    }
  };

  const handleReservation = async () => {
    if (!selectedDate || !selectedTime) {
      setNotificationMessage("Lütfen tarih ve saat seçiniz.");
      setNotificationType("warning");
      setShowNotification(true);
      return;
    }

    // Check if pitch is under maintenance
    if (pitch?.status === "maintenance") {
      setNotificationMessage(
        "Bu saha bakımdadır. İletişim bilgilerimizden rezervasyon yapabilirsiniz."
      );
      setNotificationType("info");
      setShowNotification(true);
      return;
    }

    setIsBooking(true);

    try {
      // Format date and time according to backend requirements: DD.MM.YYYY-HH:MM
      // selectedDate is in YYYY-MM-DD format, selectedTime is in "HH-HH" format (e.g., "14-15")
      const [year, month, day] = selectedDate.split("-");

      // Extract only the start hour from selectedTime (e.g., "14-15" becomes "14")
      const [startHour] = selectedTime.split("-");
      const formattedTime = `${startHour}:00`;

      // Ensure zero-padding for day and month (DD.MM.YYYY-HH:MM)
      const paddedDay = day.padStart(2, "0");
      const paddedMonth = month.padStart(2, "0");
      const formattedStart = `${paddedDay}.${paddedMonth}.${year}-${formattedTime}`;

      const requestBody = {
        pitchId: pitchId,
        start: formattedStart,
      };

      console.log("Selected time slot:", selectedTime);
      console.log("Extracted start hour:", startHour);
      console.log("Formatted start date:", formattedStart);

      console.log("Sending booking request:", requestBody);

      const response = await fetch("/api/v1/booking", {
        method: "POST",
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
            errorMessage = "Giriş yapmanız gerekiyor.";
          } else if (response.status === 403) {
            errorMessage =
              "You have been banned, please get contact with our customer service.";
          } else if (response.status === 404) {
            errorMessage = "Pitch not found";
          } else if (response.status >= 500) {
            errorMessage = "Server Error";
          }
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Booking successful:", data);

      // Show success notification
      setNotificationMessage("Rezervasyon başarıyla oluşturuldu!");
      setNotificationType("success");
      setShowNotification(true);

      // Clear selected date and time
      setSelectedDate("");
      setSelectedTime("");

      // Refresh bookings to update occupied slots
      fetchPitchBookings();
    } catch (error) {
      console.error("Error creating booking:", error);

      // Handle network errors
      let translatedError;
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        translatedError = translateMessage("Failed to fetch");
      } else {
        translatedError = translateMessage(error.message);
      }

      setNotificationMessage(translatedError);
      setNotificationType("error");
      setShowNotification(true);
    } finally {
      setIsBooking(false);
    }
  };

  const handleCloseMaintenancePopup = () => {
    setShowMaintenancePopup(false);
  };

  const handleCommentSubmit = async (newReview) => {
    try {
      console.log("New review created:", newReview);

      // Add the new review to the beginning of the reviews list
      setReviews((prevReviews) => [newReview, ...prevReviews]);

      // Update the total reviews count
      setTotalReviews((prevTotal) => prevTotal + 1);
      setCurrentReviewsCount((prevCount) => prevCount + 1);

      // Show success message (optional)
      console.log("Review successfully added to the list");
    } catch (error) {
      console.error("Error handling new review:", error);
      throw error; // Re-throw to let the form handle the error
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Saha bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Hata Oluştu</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => fetchPitchData()}
            className="bg-[rgb(0,128,0)] text-white px-6 py-3 rounded-md hover:bg-[rgb(0,100,0)] transition-colors mr-4"
          >
            Tekrar Dene
          </button>
          <button
            onClick={() => navigate("/reservation")}
            className="bg-gray-500 text-white px-6 py-3 rounded-md hover:bg-gray-600 transition-colors"
          >
            Sahalara Dön
          </button>
        </div>
      </div>
    );
  }

  if (!pitch) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Saha Bulunamadı
          </h2>
          <p className="text-gray-600 mb-6">Aradığınız saha mevcut değil.</p>
          <button
            onClick={() => navigate("/reservation")}
            className="bg-[rgb(0,128,0)] text-white px-6 py-3 rounded-md hover:bg-[rgb(0,100,0)] transition-colors"
          >
            Sahalara Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <PitchHeroSection
        pitch={pitch} // Use backend pitch rating data directly (already includes rating and totalReviews)
        renderStars={renderStars}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* First & Second Row: Reservation (spans 2 rows) + Features + Location */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Left: Reservation (spans 2 rows) */}
          <div className="lg:row-span-2">
            <PitchReservationCard
              pitch={pitch}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              selectedTime={selectedTime}
              setSelectedTime={setSelectedTime}
              handleReservation={handleReservation}
              occupiedSlots={occupiedSlots}
              bookingsLoading={bookingsLoading}
              bookingsError={bookingsError}
              isBooking={isBooking}
            />
          </div>

          {/* Right Top: Features */}
          <div>
            <PitchFeaturesSection
              pitch={pitch}
              onNotification={(message, type) => {
                setNotificationMessage(message);
                setNotificationType(type);
                setShowNotification(true);
              }}
            />
          </div>

          {/* Right Bottom: Location */}
          <div>
            <PitchLocationMapSection pitch={pitch} />
          </div>
        </div>

        {/* Third Row: About + Videos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Left: About */}
          <div>
            <PitchAboutSection pitch={pitch} />
          </div>

          {/* Right: Videos */}
          <div>
            {pitch.hasVideos && pitch.videos?.length > 0 ? (
              <PitchVideosSection pitch={pitch} />
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-6 h-full flex items-center justify-center">
                <div className="text-center text-gray-500">
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
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-sm">Video bulunmuyor</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fourth Row: Reviews Section + Comment Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Reviews Section */}
          <div>
            <PitchReviewsSection
              pitch={pitch}
              renderStars={renderStars}
              reviews={reviews}
              reviewsLoading={reviewsLoading}
              reviewsError={reviewsError}
              totalReviews={totalReviews}
              currentReviewsCount={currentReviewsCount}
              canLoadMoreReviews={canLoadMoreReviews}
              onLoadMoreReviews={loadMoreReviews}
              onReviewUpdate={handleReviewUpdate}
            />
          </div>

          {/* Right: Comment Form */}
          <div>
            <PitchCommentForm
              pitch={pitch}
              onCommentSubmit={handleCommentSubmit}
              reviews={reviews}
            />
          </div>
        </div>
      </div>

      <Footer />

      {/* Maintenance Contact Popup */}
      <MaintenanceContactPopup
        isVisible={showMaintenancePopup}
        onClose={handleCloseMaintenancePopup}
        pitchName={pitch?.name}
        contactInfo={pitch?.contact}
      />

      {/* Notification */}
      <Notification
        message={notificationMessage}
        type={notificationType}
        isVisible={showNotification}
        onClose={() => setShowNotification(false)}
      />
    </div>
  );
}

export default PitchDetailPage;
