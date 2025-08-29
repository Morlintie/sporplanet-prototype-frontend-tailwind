import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useWebSocket } from "../context/WebSocketContext";
import Header from "../components/shared/Header";
import Footer from "../components/shared/Footer";
import Notification from "../components/shared/Notification";

function FollowingPage() {
  const navigate = useNavigate();
  const { getProfilePictureUrl, user, isAuthenticated, removeFriend } =
    useAuth();
  const { isUserOnline, listenForNotificationEvent } = useWebSocket();

  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [followingUsers, setFollowingUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [limit, setLimit] = useState(18);
  const [hasSearched, setHasSearched] = useState(false);

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
      isVisible: false,
      message: "",
      type: "success",
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
      "No followed users found.": "Takip edilen kullanıcı bulunamadı.",

      // RemoveFromFriends specific errors
      "You are not friends with that user.":
        "Bu kullanıcıyla arkadaş değilsiniz.",
      "Unfriend failed": "Arkadaşlıktan çıkarma başarısız.",

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

  const getInitials = (name) => {
    if (!name) return "?";
    const nameParts = name.split(" ").filter((part) => part.length > 0);
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }
    return (
      nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)
    ).toUpperCase();
  };

  // Fetch following users from backend
  const fetchFollowingUsers = async (
    page = 1,
    searchQuery = "",
    isLoadMore = false
  ) => {
    try {
      if (isLoadMore) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
        setHasSearched(true);
      }

      // Build query parameters
      const params = new URLSearchParams();
      if (searchQuery.trim()) {
        params.append("search", searchQuery.trim());
      }
      if (page > 1) {
        params.append("page", page.toString());
      }

      const queryString = params.toString();
      const url = `/api/v1/user/getFollowedUsers${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.msg ||
            errorData.message ||
            "Failed to fetch following users"
        );
      }

      const data = await response.json();
      console.log("Following users fetched successfully:", data);

      // Process the following users data
      const processedFollowingUsers = data.followedUsers.map(
        (followingUser) => ({
          _id: followingUser._id,
          name: followingUser.name,
          email: followingUser.email,
          avatar: getProfilePictureUrl(followingUser.profilePicture),
          role: followingUser.role,
          school: followingUser.school,
          age: followingUser.age,
          location: followingUser.location,
          goalKeeper: followingUser.goalKeeper,
          friends: followingUser.friends || [], // Array of friend IDs
          mutualFriendsCount: 0, // We'll calculate this
          createdAt: followingUser.createdAt,
          updatedAt: followingUser.updatedAt,
        })
      );

      // Calculate mutual friends count for each following user
      const followingUsersWithMutualFriends = processedFollowingUsers.map(
        (followingUser) => {
          if (user?.friends && followingUser.friends) {
            const mutualCount = user.friends.filter((userFriend) =>
              followingUser.friends.includes(userFriend._id)
            ).length;
            return { ...followingUser, mutualFriendsCount: mutualCount };
          }
          return followingUser;
        }
      );

      if (isLoadMore) {
        // Append to existing following users for "Daha Fazla" functionality
        setFollowingUsers((prevFollowingUsers) => [
          ...prevFollowingUsers,
          ...followingUsersWithMutualFriends,
        ]);
      } else {
        // Replace following users for new search or initial load
        setFollowingUsers(followingUsersWithMutualFriends);
      }

      setTotalCount(data.totalCount);
      setLimit(data.limit);
      setCurrentPage(page);

      console.log(
        `Loaded ${data.count} following users on page ${page}. Total: ${data.totalCount}`
      );
    } catch (error) {
      console.error("Error fetching following users:", error);

      // Handle 404 (No following users found) gracefully - don't show error notification
      if (error.message.includes("No followed users found")) {
        // Just set empty state, don't show error notification
        if (!isLoadMore) {
          setFollowingUsers([]);
          setTotalCount(0);
        }
      } else {
        // Handle other errors with notifications
        if (error.name === "TypeError" && error.message.includes("fetch")) {
          showNotification(translateMessage("Failed to fetch"), "error");
        } else {
          showNotification(translateMessage(error.message), "error");
        }

        // Reset following users on error if not loading more
        if (!isLoadMore) {
          setFollowingUsers([]);
          setTotalCount(0);
        }
      }
    } finally {
      if (isLoadMore) {
        setIsLoadingMore(false);
      } else {
        setIsLoading(false);
      }
    }
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchFollowingUsers(1, searchTerm, false);
  };

  // Handle load more
  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    fetchFollowingUsers(nextPage, searchTerm, true);
  };

  // Handle user profile navigation
  const handleUserClick = (userId) => {
    navigate(`/user/${userId}`);
  };

  // Handle remove from friends (unfriend) - Same as UserProfilePage and AddFriends
  const handleUnfriend = async (userId) => {
    try {
      const response = await fetch(`/api/v1/user/removeFromFriends/${userId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.msg || errorData.message || "Unfriend failed"
        );
      }

      const data = await response.json();
      console.log("User unfriended successfully:", data);

      // Handle HTTP response: { userId: id }
      if (data && data.userId) {
        // Update local state - remove the user from the following list
        setFollowingUsers((prevFollowingUsers) =>
          prevFollowingUsers.filter(
            (followingUser) => followingUser._id !== data.userId
          )
        );

        // Update total count
        setTotalCount((prevCount) => Math.max(0, prevCount - 1));

        // Update AuthContext - this will also:
        // - Remove from friends array (decrement "Takip Ettiklerim")
        // - Update buttons in UserProfileMain.jsx and AddFriends.jsx
        // - Remove from "Çevrimiçi" and "Tümü" fields in MyFriends.jsx
        if (removeFriend) {
          removeFriend(data.userId);
        }

        showNotification("Arkadaşlıktan çıkarıldı!", "success");
      } else {
        console.log("No userId in response:", data);
      }
    } catch (error) {
      console.error("Unfriend error:", error);
      showNotification(translateMessage(error.message), "error");
    }
  };

  // Check if there are more following users to load
  const hasMoreFollowingUsers = followingUsers.length < totalCount;

  // Load initial following users on component mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchFollowingUsers(1, "", false);
    }
  }, [isAuthenticated]);

  // WebSocket listeners for real-time updates
  useEffect(() => {
    if (isAuthenticated && listenForNotificationEvent) {
      console.log("Setting up WebSocket listeners for FollowingPage");

      const handleRemovedFromFriends = (data) => {
        console.log(
          "Received removedFromFriends event in FollowingPage:",
          data
        );

        if (data && data.userId) {
          // Someone removed us from their friends list
          // Update the following list to remove that user
          setFollowingUsers((prevFollowingUsers) =>
            prevFollowingUsers.filter(
              (followingUser) => followingUser._id !== data.userId
            )
          );

          // Update total count
          setTotalCount((prevCount) => Math.max(0, prevCount - 1));

          // Note: AuthContext updates are handled globally in WebSocketContext
          // The user who removed us will be removed from our friends array there
        }
      };

      // Set up listener for removedFromFriends event
      const cleanupRemovedFromFriends = listenForNotificationEvent(
        "removedFromFriends",
        handleRemovedFromFriends
      );

      // Cleanup on unmount
      return () => {
        console.log("Cleaning up WebSocket listeners in FollowingPage");
        if (cleanupRemovedFromFriends) cleanupRemovedFromFriends();
      };
    }
  }, [isAuthenticated, listenForNotificationEvent]);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Giriş Gerekli
          </h2>
          <p className="text-gray-600 mb-8">
            Takip ettiklerinizi görmek için giriş yapmanız gerekiyor.
          </p>
          <button
            onClick={() => navigate("/auth/login")}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            Giriş Yap
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Takip Ettiklerim
              </h1>
              <p className="text-gray-600 mt-2">
                Takip ettiğiniz kullanıcıları görüntüleyin
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600">
                {user?.friends?.length || 0}
              </div>
              <div className="text-sm text-gray-500">Toplam Takip</div>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Takip ettiklerinizi ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold px-6 py-2 rounded-md transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center space-x-2"
              tabIndex="0"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Aranıyor...</span>
                </>
              ) : (
                <>
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
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <span>Ara</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Following Users List */}
        <div className="bg-white rounded-lg shadow-md">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">
                  Takip ettikleriniz yükleniyor...
                </p>
              </div>
            </div>
          ) : followingUsers.length > 0 ? (
            <div>
              {/* Results Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {searchTerm
                    ? `"${searchTerm}" için arama sonuçları`
                    : "Tüm Takip Ettiklerim"}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {followingUsers.length} / {totalCount} kullanıcı gösteriliyor
                </p>
              </div>

              {/* Following Users Grid */}
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {followingUsers.map((followingUser) => (
                    <div
                      key={followingUser._id}
                      className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => handleUserClick(followingUser._id)}
                    >
                      <div className="flex items-center space-x-4">
                        {/* Avatar with Online Status */}
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center overflow-hidden">
                            {followingUser.avatar ? (
                              <img
                                src={followingUser.avatar}
                                alt={followingUser.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-white font-semibold">
                                {getInitials(followingUser.name)}
                              </span>
                            )}
                          </div>
                          {/* Online Status */}
                          {isUserOnline && isUserOnline(followingUser._id) && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                          )}
                        </div>

                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 truncate">
                            {followingUser.name}
                          </h4>
                          <p className="text-sm text-gray-600 truncate">
                            {followingUser.email}
                          </p>
                          {followingUser.location && (
                            <p className="text-xs text-gray-500 truncate">
                              {followingUser.location.city},{" "}
                              {followingUser.location.district}
                            </p>
                          )}
                          {followingUser.mutualFriendsCount > 0 && (
                            <p className="text-xs text-green-600">
                              {followingUser.mutualFriendsCount} ortak arkadaş
                            </p>
                          )}
                        </div>

                        {/* Unfriend Button */}
                        <div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent navigation to user profile
                              handleUnfriend(followingUser._id);
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white text-xs font-medium px-3 py-1.5 rounded-md transition-colors cursor-pointer"
                            tabIndex="0"
                            aria-label={`${followingUser.name} kullanıcısını arkadaşlıktan çıkar`}
                          >
                            Arkadaşlıktan Çıkar
                          </button>
                        </div>
                      </div>

                      {/* User Tags */}
                      <div className="flex items-center space-x-2 mt-3">
                        {followingUser.goalKeeper && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            Kaleci
                          </span>
                        )}
                        {followingUser.role === "admin" && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            Admin
                          </span>
                        )}
                        {followingUser.role === "companyOwner" && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                            Şirket Sahibi
                          </span>
                        )}
                        {followingUser.age && (
                          <span className="text-xs text-gray-400">
                            {followingUser.age} yaş
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Load More Button */}
                {hasMoreFollowingUsers && (
                  <div className="mt-8 text-center">
                    <button
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold px-8 py-3 rounded-md transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
                      tabIndex="0"
                    >
                      {isLoadingMore ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Yükleniyor...</span>
                        </>
                      ) : (
                        <span>Daha Fazla</span>
                      )}
                    </button>
                    <p className="text-sm text-gray-500 mt-2">
                      {followingUsers.length} / {totalCount} kullanıcı
                      gösteriliyor
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : hasSearched ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {searchTerm
                  ? "Sonuç bulunamadı"
                  : "Takip edilen kullanıcı bulunamadı"}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm
                  ? `"${searchTerm}" için herhangi bir kullanıcı bulunamadı.`
                  : "Henüz hiç kullanıcı takip etmiyorsunuz."}
              </p>
            </div>
          ) : (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
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
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Takip Ettiklerinizi Keşfedin
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Yukarıdaki arama kutusunu kullanarak takip ettiklerinizi arayın.
              </p>
            </div>
          )}
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

export default FollowingPage;
