import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useWebSocket } from "../context/WebSocketContext";
import Header from "../components/shared/Header";
import Footer from "../components/shared/Footer";
import Notification from "../components/shared/Notification";
import UserProfileMain from "../components/user-profile/UserProfileMain";
import UserListings from "../components/user-profile/UserListings";
import UserPitches from "../components/user-profile/UserPitches";
import UserFriends from "../components/user-profile/UserFriends";

function UserProfilePage() {
  const { userId } = useParams();
  const { isAuthenticated, addOutgoingFriendRequest } = useAuth();
  const {
    isUserOnline,
    listenForNotificationEvent,
    removeNotificationEventListener,
  } = useWebSocket();
  const [activeSection, setActiveSection] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);

  // Notification state
  const [notification, setNotification] = useState({
    isVisible: false,
    message: "",
    type: "success",
  });

  // Show notification helper
  const showNotification = (message, type = "success") => {
    setNotification({
      isVisible: true,
      message,
      type,
    });
  };

  // Hide notification helper
  const hideNotification = () => {
    setNotification({
      ...notification,
      isVisible: false,
    });
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
      "User couldn't found.": "Kullanıcı bulunamadı.",
      "User not found.": "Kullanıcı bulunamadı.",
      "Please provide required data.": "Gerekli bilgileri girin.",
      "Please provide user credentials.": "Kullanıcı bilgilerini sağlayın.",

      // Friend request specific errors
      "This user has been banned.": "Bu kullanıcı yasaklanmıştır.",
      "Users cannot send friend requests for themselves.":
        "Kendinize arkadaşlık isteği gönderemezsiniz.",
      "You have already sent a friend request for this user.":
        "Bu kullanıcıya zaten arkadaşlık isteği gönderdiniz.",
      "You are already friends with this user.":
        "Bu kullanıcıyla zaten arkadaşsınız.",
      "You have been banned by this user":
        "Bu kullanıcı tarafından engellendiniz.",
      "You have banned that user": "Bu kullanıcıyı engellemişsiniz.",

      // Generic errors
      "Something went wrong": "Bir şeyler ters gitti. Lütfen tekrar deneyin.",
      "Server Error": "Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.",
      Unauthorized: "Yetkisiz erişim.",
    };

    return (
      translations[message] ||
      "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin."
    );
  };

  // Handle send friend request
  const handleSendFriendRequest = async (targetUserId) => {
    try {
      const response = await fetch(
        `/api/v1/user/sendFriendRequest/${targetUserId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.msg || errorData.message || "Friend request failed"
        );
      }

      const data = await response.json();
      console.log("Friend request sent successfully:", data);

      // Update AuthContext with the response data (same as other components)
      // The HTTP response contains { user: sendFriendRequest } which is the recipient user data
      if (data && data.user) {
        addOutgoingFriendRequest(data.user);
      }

      showNotification("Arkadaşlık isteği gönderildi!", "success");
    } catch (error) {
      console.error("Friend request error:", error);
      showNotification(translateMessage(error.message), "error");
    }
  };

  // Handle send message (placeholder)
  const handleSendMessage = async (targetUserId) => {
    // TODO: Implement DM functionality
    showNotification("Mesaj özelliği henüz aktif değil.", "info");
  };

  // Handle block user (placeholder)
  const handleBlockUser = async (targetUserId) => {
    // TODO: Implement block user functionality
    showNotification("Engelleme özelliği henüz aktif değil.", "info");
  };

  // Fetch user data from backend
  const fetchUserData = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/v1/user/getSingle/${id}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle different error types with Turkish messages
        let errorMessage = "Bir hata oluştu, lütfen tekrar deneyin.";

        if (response.status === 403) {
          if (data.msg?.includes("banned by that user")) {
            errorMessage = "Bu kullanıcı tarafından engellendiniz.";
          } else if (data.msg?.includes("You have banned that user")) {
            errorMessage = "Bu kullanıcıyı engellemişsiniz.";
          } else if (data.msg?.includes("been banned")) {
            errorMessage =
              "Hesabınız askıya alınmış. Müşteri hizmetleri ile iletişime geçin.";
          } else {
            errorMessage = "Bu profili görüntüleme yetkiniz bulunmuyor.";
          }
        } else if (response.status === 404) {
          errorMessage = "Kullanıcı bulunamadı.";
        } else if (response.status === 400) {
          errorMessage = "Geçersiz kullanıcı bilgileri.";
        }

        throw new Error(errorMessage);
      }

      setUserData(data.user);
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError(err.message);
      showNotification(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Fallback data for development (remove in production)
  const fallbackUserData = {
    _id: userId || "35936d28511796c6ca5c43dc",
    name: "irwinmary",
    email: "mduncan@bass.com",
    role: "user",
    phoneNumber: "+905355163714",
    description:
      "Futbol tutkunu, hafta sonları maç organize etmeyi seviyorum. İstanbul'da yaşıyorum ve her pozisyonda oynayabilirim.",
    profilePicture: {
      name: "source.jpg",
      url: "https://dummyimage.com/579x674",
    },
    age: 28,
    goalKeeper: false,
    preferredPosition: "rwb",
    jerseyNumber: 5,
    preferredFoot: "both",
    location: {
      city: "İstanbul",
      district: "Kadıköy",
    },
    friends: [
      {
        _id: "3ab62896574cbf25b002ee6d",
        name: "danielle97",
        email: "pamelaweeks@hotmail.com",
        role: "admin",
        school: "Wu-Perkins",
        age: 15,
        profilePicture: {
          name: "pattern.jpg",
          url: "https://www.lorempixel.com/988/477",
        },
        goalKeeper: true,
        location: {
          city: "İstanbul",
          district: "Bakırköy",
        },
        createdAt: "2022-09-21",
        updatedAt: "2025-04-07",
      },
      {
        _id: "16309b276fd8d2d37ae8763d",
        name: "emilygonzales",
        email: "linda16@yahoo.com",
        role: "admin",
        school: "Brown, Howard and Murray",
        age: 39,
        profilePicture: {
          name: "moment.jpg",
          url: "https://www.lorempixel.com/43/693",
        },
        goalKeeper: true,
        location: {
          city: "İstanbul",
          district: "Sarıyer",
        },
        createdAt: "2023-07-11",
        updatedAt: "2025-08-18",
      },
      {
        _id: "b534b708d8c7191f38047fb9",
        name: "jonesdonald",
        email: "beckerstephanie@yahoo.com",
        role: "companyOwner",
        school: "Wheeler, Castillo and Stone",
        age: 15,
        profilePicture: {
          name: "free.jpg",
          url: "https://placekitten.com/390/850",
        },
        goalKeeper: false,
        location: {
          city: "İstanbul",
          district: "Kadıköy",
        },
        createdAt: "2022-09-08",
        updatedAt: "2025-04-30",
      },
    ],
    favoritePitches: [
      {
        _id: "c750e654782fd1e230669fa1",
        name: "Frost PLC",
        description:
          "Quickly same court boy decision. Product seek the drive head. National concern interest life do course.",
        location: {
          address: {
            street: "Sandoval Bypass",
            neighborhood: "finally",
            city: "İstanbul",
            district: "Bakırköy",
            postalCode: "90792",
            country: "Turkey",
          },
          type: "Point",
          coordinates: [28.988888, 40.934016],
        },
        specifications: {
          dimensions: {
            length: 99,
            width: 39,
          },
          surfaceType: "natural_grass",
          isIndoor: false,
          hasLighting: false,
          recommendedCapacity: {
            players: 12,
            spectators: 3,
          },
        },
        facilities: {
          changingRooms: false,
          showers: true,
          parking: false,
          shoeRenting: false,
          camera: true,
          otherAmenities: ["cafe", "wifi"],
        },
        pricing: {
          hourlyRate: 539,
          nightHourlyRate: 1107,
          currency: "TRY",
          specialDayMultiplier: 1.5,
          weekendMultiplier: 1.3,
        },
        media: {
          images: [
            {
              url: "https://www.lorempixel.com/584/841",
              caption: "her",
              public_id: "f18af71a133ef414199a8add",
              isPrimary: true,
              size: 458279,
            },
          ],
        },
        contact: {
          phone: "+905721637575",
          email: "amanda02@carrillo.com",
          website: "http://www.jefferson-rios.com/",
        },
        rating: {
          averageRating: 3.4,
          totalReviews: 460,
        },
        refundAllowed: true,
        status: "active",
      },
    ],
    advertParticipation: [
      {
        _id: "1fe92e3a0f442fa0d8cb286f",
        createdBy: "6ba701b09e3feb836c604570",
        name: "Kadıköy Dostluk Maçı",
        startsAt: "2025-02-15T16:00:00Z",
        status: "open",
        level: "professional",
      },
      {
        _id: "1a65b2a2ee4a1061c5e7c894",
        createdBy: "98277a54e4869ed13ac96419",
        name: "Beşiktaş Rekabet Maçı",
        startsAt: "2025-02-20T19:00:00Z",
        status: "completed",
        level: "advanced",
      },
    ],
    advertWaitingList: [
      {
        _id: "c606d3728b7bb3e3ef813036",
        createdBy: "c2e4396c5360c59a97826bfb",
        name: "Üsküdar Turnuvası",
        startsAt: "2025-02-25T10:00:00Z",
        status: "open",
        level: "pro",
      },
    ],
    createdAt: "2024-07-26",
    updatedAt: "2025-01-25",
  };

  // Scroll to top when component mounts or activeSection changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeSection]);

  // Fetch user data when component mounts or userId changes
  useEffect(() => {
    if (userId) {
      fetchUserData(userId);
    } else {
      setError("Kullanıcı ID'si bulunamadı.");
      setLoading(false);
    }
  }, [userId]);

  // Set up WebSocket listener for friend requests
  useEffect(() => {
    if (isAuthenticated && listenForNotificationEvent) {
      console.log("Setting up friendRequest listener for UserProfilePage");

      const handleFriendRequest = (data) => {
        console.log("Received friendRequest event in UserProfilePage:", data);

        if (data && data.user) {
          const requesterName = data.user.name || "Bir kullanıcı";
          showNotification(
            `${requesterName} size arkadaşlık isteği gönderdi!`,
            "info"
          );
        }
      };

      // Listen for friend request events
      const cleanup = listenForNotificationEvent(
        "friendRequest",
        handleFriendRequest
      );

      // Cleanup on unmount
      return () => {
        console.log("Cleaning up friendRequest listener in UserProfilePage");
        if (cleanup) cleanup();
      };
    }
  }, [isAuthenticated, listenForNotificationEvent, showNotification]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Profil yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Profil Bulunamadı
          </h2>
          <p className="text-gray-600 mb-8">
            Aradığınız kullanıcı profili bulunamadı veya mevcut değil.
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            Geri Dön
          </button>
        </div>
      </div>
    );
  }

  // User not found or error
  if (!userData && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {error ? "Profil Yüklenemedi" : "Kullanıcı Bulunamadı"}
          </h2>
          <p className="text-gray-600 mb-8">
            {error || "Bu kullanıcı mevcut değil veya profili gizli."}
          </p>
          <div className="space-x-4">
            <button
              onClick={() => fetchUserData(userId)}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              Tekrar Dene
            </button>
            <button
              onClick={() => window.history.back()}
              className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              Geri Dön
            </button>
          </div>
        </div>

        {/* Notification */}
        <Notification
          message={notification.message}
          type={notification.type}
          isVisible={notification.isVisible}
          onClose={hideNotification}
        />
      </div>
    );
  }

  const renderMainContent = () => {
    // Use real userData if available, otherwise fallback for development
    const currentUserData = userData || fallbackUserData;

    switch (activeSection) {
      case "profile":
        return (
          <UserProfileMain
            user={currentUserData}
            onSendFriendRequest={handleSendFriendRequest}
            onSendMessage={handleSendMessage}
            onBlockUser={handleBlockUser}
          />
        );
      case "listings":
        return <UserListings user={currentUserData} />;
      case "pitches":
        return <UserPitches user={currentUserData} />;
      case "friends":
        return <UserFriends user={currentUserData} />;
      default:
        return (
          <UserProfileMain
            user={currentUserData}
            onSendFriendRequest={handleSendFriendRequest}
            onSendMessage={handleSendMessage}
            onBlockUser={handleBlockUser}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <Header />

      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 max-w-none lg:max-w-7xl lg:mx-auto">
        {/* Always show sidebar layout for UserProfilePage */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar Navigation - Always Visible */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              {/* User Basic Info */}
              <div className="text-center mb-6">
                <div className="relative w-20 h-20 mx-auto mb-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200">
                    <img
                      src={
                        (userData || fallbackUserData).profilePicture?.url ||
                        "/default-avatar.png"
                      }
                      alt={(userData || fallbackUserData).name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "/default-avatar.png";
                      }}
                    />
                  </div>

                  {/* Online Status Indicator */}
                  {isUserOnline &&
                    (userData || fallbackUserData)._id &&
                    isUserOnline((userData || fallbackUserData)._id) && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                    )}
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  {(userData || fallbackUserData).name}
                </h2>
                {(userData || fallbackUserData).location?.city ||
                (userData || fallbackUserData).location?.district ? (
                  <p className="text-gray-600 text-sm">
                    {(userData || fallbackUserData).location?.city || ""}
                    {(userData || fallbackUserData).location?.city &&
                    (userData || fallbackUserData).location?.district
                      ? ", "
                      : ""}
                    {(userData || fallbackUserData).location?.district || ""}
                  </p>
                ) : (
                  <p className="text-gray-600 text-sm">Konum belirtilmemiş</p>
                )}
                {(userData || fallbackUserData).rating && (
                  <div className="flex items-center justify-center mt-2">
                    <span className="text-yellow-500 mr-1">★</span>
                    <span className="text-gray-700 text-sm">
                      {(userData || fallbackUserData).rating}
                    </span>
                  </div>
                )}
              </div>

              {/* Navigation Menu */}
              <nav className="space-y-2 mb-6">
                <button
                  onClick={() => setActiveSection("profile")}
                  className={`w-full text-left px-4 py-3 rounded-md transition-colors flex items-center gap-3 ${
                    activeSection === "profile"
                      ? "bg-green-100 text-green-700 font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Profil
                </button>

                <button
                  onClick={() => setActiveSection("listings")}
                  className={`w-full text-left px-4 py-3 rounded-md transition-colors flex items-center gap-3 ${
                    activeSection === "listings"
                      ? "bg-green-100 text-green-700 font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
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
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <div className="flex-1">
                    <div>İlanlar</div>
                    <div className="text-xs text-gray-500">
                      Bekleyen:{" "}
                      {(userData || fallbackUserData).advertWaitingList
                        ?.length || 0}{" "}
                      • Katıldığı:{" "}
                      {(userData || fallbackUserData).advertParticipation
                        ?.length || 0}
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveSection("pitches")}
                  className={`w-full text-left px-4 py-3 rounded-md transition-colors flex items-center gap-3 ${
                    activeSection === "pitches"
                      ? "bg-green-100 text-green-700 font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
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
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  <div className="flex-1">
                    <div>Favori Sahalar</div>
                    <div className="text-xs text-gray-500">
                      {(userData || fallbackUserData).favoritePitches?.length ||
                        0}{" "}
                      saha
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveSection("friends")}
                  className={`w-full text-left px-4 py-3 rounded-md transition-colors flex items-center gap-3 ${
                    activeSection === "friends"
                      ? "bg-green-100 text-green-700 font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
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
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <div className="flex-1">
                    <div>Arkadaşlar</div>
                    <div className="text-xs text-gray-500">
                      {(userData || fallbackUserData).friends?.length || 0}{" "}
                      arkadaş
                    </div>
                  </div>
                </button>
              </nav>

              {/* User Details */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  Kullanıcı Bilgileri
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
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
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="text-gray-700">
                      {(userData || fallbackUserData).location?.city ||
                      (userData || fallbackUserData).location?.district ? (
                        <>
                          {(userData || fallbackUserData).location?.city || ""}
                          {(userData || fallbackUserData).location?.city &&
                          (userData || fallbackUserData).location?.district
                            ? ", "
                            : ""}
                          {(userData || fallbackUserData).location?.district ||
                            ""}
                        </>
                      ) : (
                        "Konum belirtilmemiş"
                      )}
                    </span>
                  </div>

                  {(userData || fallbackUserData).age && (
                    <div className="flex items-center gap-2 text-sm">
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
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-gray-700">
                        {(userData || fallbackUserData).age} yaşında
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm">
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
                        d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1m-6 0h8m-6 0v3a2 2 0 11-4 0V7m8 0v3a2 2 0 104 0V7"
                      />
                    </svg>
                    <span className="text-gray-700">
                      {(userData || fallbackUserData).role === "admin"
                        ? "Admin"
                        : (userData || fallbackUserData).role === "companyOwner"
                        ? "Şirket Sahibi"
                        : (userData || fallbackUserData).role === "banned"
                        ? "Yasaklı"
                        : "Kullanıcı"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
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
                        d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1m-6 0h8m-6 0v3a2 2 0 11-4 0V7m8 0v3a2 2 0 104 0V7"
                      />
                    </svg>
                    <span className="text-gray-700">
                      Üye:{" "}
                      {new Date(
                        (userData || fallbackUserData).createdAt
                      ).toLocaleDateString("tr-TR", {
                        year: "numeric",
                        month: "long",
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
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
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <span className="text-gray-700">
                      {(userData || fallbackUserData).friends?.length || 0}{" "}
                      arkadaş
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Always 3/4 width */}
          <div className="lg:w-3/4">
            {activeSection === "profile" ? (
              // For profile section, don't wrap in card to keep full-width design
              renderMainContent()
            ) : (
              // For other sections, wrap in card
              <div className="bg-white rounded-lg shadow-md">
                {renderMainContent()}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />

      {/* Notification */}
      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />
    </div>
  );
}

export default UserProfilePage;
