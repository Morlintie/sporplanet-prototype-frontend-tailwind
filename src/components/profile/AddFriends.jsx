import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useWebSocket } from "../../context/WebSocketContext";
import Notification from "../shared/Notification";

function AddFriends({ user }) {
  const navigate = useNavigate();
  const {
    getProfilePictureUrl,
    addOutgoingFriendRequest,
    removeOutgoingFriendRequest,
    removeFriend,
    user: currentUser,
    isUserBlockedByMe,
    isCurrentUserBlockedBy,
  } = useAuth();
  const { listenForNotificationEvent } = useWebSocket();

  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [limit, setLimit] = useState(18);
  const [count, setCount] = useState(0);

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

      // Unfriend specific errors
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

  // Helper function to filter user data for blocking
  const filterUserDataForBlocking = (userData) => {
    if (!userData) return userData;

    // Check if current user has blocked this user
    const currentUserBlockedThisUser = isUserBlockedByMe(userData._id);

    // Check if this user has blocked current user (pass the bannedProfiles array)
    const thisUserBlockedCurrentUser = isCurrentUserBlockedBy(
      userData.bannedProfiles
    );

    if (currentUserBlockedThisUser || thisUserBlockedCurrentUser) {
      // Return only basic info for blocked users
      return {
        _id: userData._id,
        name: userData.name,
        email: userData.email,
      };
    }

    return userData;
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

  const handleSearch = async (page = 1) => {
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    setCurrentPage(page);

    // Reset pagination if starting a new search (page 1)
    if (page === 1) {
      setTotalCount(0);
      setCount(0);
      setSearchResults([]);
    }

    try {
      const response = await fetch(`/api/v1/user/getMany?page=${page}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          search: searchTerm.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || errorData.message || "Search failed");
      }

      const data = await response.json();
      console.log("Search results received:", data);

      // Process the user data from backend
      const processedUsers = data.users.map((userData) => {
        const filteredUser = filterUserDataForBlocking(userData);

        // Calculate relationship status only if user is not blocked
        const isBlocked =
          isUserBlockedByMe(userData._id) ||
          isCurrentUserBlockedBy(userData.bannedProfiles);

        return {
          _id: filteredUser._id,
          name: filteredUser.name,
          email: filteredUser.email,
          avatar: getProfilePictureUrl(filteredUser.profilePicture),
          role: filteredUser.role,
          school: filteredUser.school,
          age: filteredUser.age,
          location: filteredUser.location,
          goalKeeper: filteredUser.goalKeeper,
          preferredPosition: filteredUser.preferredPosition,
          jerseyNumber: filteredUser.jerseyNumber,
          preferredFoot: filteredUser.preferredFoot,
          student: filteredUser.student,
          friends: filteredUser.friends,
          // Check if this user is already a friend or has pending request (only if not blocked)
          isFollowing: !isBlocked
            ? currentUser?.friends?.some(
                (friend) => friend._id === userData._id
              ) || false
            : false,
          isPending: !isBlocked
            ? currentUser?.selfFriendRequests?.some(
                (request) => request._id === userData._id
              ) || false
            : false,
          mutualFriends: !isBlocked
            ? userData.friends?.filter((friendId) =>
                user?.friends?.some((userFriend) => userFriend._id === friendId)
              ).length || 0
            : 0,
          createdAt: filteredUser.createdAt,
          updatedAt: filteredUser.updatedAt,
        };
      });

      setSearchResults(processedUsers);
      setTotalCount(data.totalCount);
      setLimit(data.limit);
      setCount(data.count);

      console.log(
        `Found ${data.count} users on page ${page} of ${Math.ceil(
          data.totalCount / data.limit
        )}`
      );
    } catch (error) {
      console.error("Search error:", error);

      // Handle network errors
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        showNotification(translateMessage("Failed to fetch"), "error");
      } else {
        showNotification(translateMessage(error.message), "error");
      }

      setSearchResults([]);
      setTotalCount(0);
      setCount(0);
    } finally {
      setIsSearching(false);
    }
  };

  // Calculate pagination info
  const totalPages = Math.ceil(totalCount / limit);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      handleSearch(page);
    }
  };

  // Handle user profile navigation
  const handleUserClick = (userId) => {
    navigate(`/user/${userId}`);
  };

  const handleFollowRequest = async (userId) => {
    try {
      const response = await fetch(`/api/v1/user/sendFriendRequest/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.msg || errorData.message || "Friend request failed"
        );
      }

      const data = await response.json();
      console.log("Friend request sent successfully:", data);

      // Update AuthContext with the response data (same as MyFriends.jsx)
      // The HTTP response contains { user: sendFriendRequest } which is the recipient user data
      if (data && data.user) {
        addOutgoingFriendRequest(data.user);
      }

      // Update the UI optimistically for search results
      const updatedResults = searchResults.map((user) => {
        if (user._id === userId) {
          return { ...user, isPending: true };
        }
        return user;
      });
      setSearchResults(updatedResults);
      showNotification("Arkadaşlık isteği gönderildi!", "success");
    } catch (error) {
      console.error("Friend request error:", error);
      showNotification(translateMessage(error.message), "error");
    }
  };

  const handleRevokeRequest = async (userId) => {
    try {
      const response = await fetch(
        `/api/v1/user/revokeFriendRequest/${userId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.msg || errorData.message || "Request revoke failed"
        );
      }

      const data = await response.json();
      console.log("Friend request revoked successfully:", data);

      // Update AuthContext with the response data
      if (data && data.userId) {
        removeOutgoingFriendRequest(data.userId);
      }

      // Update the UI optimistically for search results
      const updatedResults = searchResults.map((searchUser) => {
        if (searchUser._id === userId) {
          return { ...searchUser, isPending: false };
        }
        return searchUser;
      });
      setSearchResults(updatedResults);
      showNotification("Arkadaşlık isteği geri çekildi!", "success");
    } catch (error) {
      console.error("Friend request revoke error:", error);
      showNotification(translateMessage(error.message), "error");
    }
  };

  const handleUnfriend = async (userId) => {
    try {
      const response = await fetch(`/api/v1/user/removeFromFriends/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
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

      // Update AuthContext with the response data
      if (data && data.userId) {
        removeFriend(data.userId);
      }

      // Update the UI optimistically for search results
      const updatedResults = searchResults.map((searchUser) => {
        if (searchUser._id === userId) {
          return { ...searchUser, isFollowing: false };
        }
        return searchUser;
      });
      setSearchResults(updatedResults);
      showNotification("Arkadaşlıktan çıkarıldı!", "success");
    } catch (error) {
      console.error("Unfriend error:", error);
      showNotification(translateMessage(error.message), "error");
    }
  };

  const handleUnfollow = async (userId) => {
    // TODO: Implement real unfollow API
    // For now, just update the UI optimistically
    const updatedResults = searchResults.map((user) => {
      if (user._id === userId) {
        return { ...user, isFollowing: false };
      }
      return user;
    });
    setSearchResults(updatedResults);
    showNotification("Arkadaşlıktan çıkarıldı.", "info");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch(1);
    }
  };

  // WebSocket listeners for real-time updates
  useEffect(() => {
    if (listenForNotificationEvent) {
      console.log("Setting up WebSocket listeners for AddFriends");

      const handleFriendRequestRevoked = (data) => {
        console.log("Received friendRequestRevoked event in AddFriends:", data);

        if (data && data.userId) {
          // Update search results to reflect the revoked request
          setSearchResults((prevResults) =>
            prevResults.map((searchUser) => {
              if (searchUser._id === data.userId) {
                return { ...searchUser, isPending: false };
              }
              return searchUser;
            })
          );
        }
      };

      const handleFriendRequestAccepted = (data) => {
        console.log(
          "Received friendRequestAccepted event in AddFriends:",
          data
        );

        if (data && data.user) {
          // New data structure: { user: newCurrentUser }
          // data.user is the FULL user data of the person who ACCEPTED our friend request
          const acceptedUser = data.user;
          const acceptedUserId = acceptedUser._id;

          console.log("Friend request accepted by user:", acceptedUserId);
          console.log("Accepted user data:", acceptedUser);

          // Update search results to reflect the accepted request
          setSearchResults((prevResults) =>
            prevResults.map((searchUser) => {
              if (searchUser._id === acceptedUserId) {
                return { ...searchUser, isPending: false, isFollowing: true };
              }
              return searchUser;
            })
          );
        }
      };

      const handleFriendRequestRejected = (data) => {
        console.log(
          "Received friendRequestRejected event in AddFriends:",
          data
        );

        if (data && data.userId) {
          // Update search results to reflect the rejected request
          setSearchResults((prevResults) =>
            prevResults.map((searchUser) => {
              if (searchUser._id === data.userId) {
                return { ...searchUser, isPending: false };
              }
              return searchUser;
            })
          );
        }
      };

      const handleRemovedFromFriends = (data) => {
        console.log("Received removedFromFriends event in AddFriends:", data);

        if (data && data.userId) {
          // Someone removed us from their friends list
          // Update search results to reflect we're no longer friends
          setSearchResults((prevResults) =>
            prevResults.map((searchUser) => {
              if (searchUser._id === data.userId) {
                return { ...searchUser, isFollowing: false };
              }
              return searchUser;
            })
          );
        }
      };

      // Set up listeners
      const cleanupRevoked = listenForNotificationEvent(
        "friendRequestRevoked",
        handleFriendRequestRevoked
      );

      const cleanupAccepted = listenForNotificationEvent(
        "friendRequestAccepted",
        handleFriendRequestAccepted
      );

      const cleanupRejected = listenForNotificationEvent(
        "friendRequestRejected",
        handleFriendRequestRejected
      );

      const cleanupRemovedFromFriends = listenForNotificationEvent(
        "removedFromFriends",
        handleRemovedFromFriends
      );

      // Cleanup on unmount
      return () => {
        console.log("Cleaning up WebSocket listeners in AddFriends");
        if (cleanupRevoked) cleanupRevoked();
        if (cleanupAccepted) cleanupAccepted();
        if (cleanupRejected) cleanupRejected();
        if (cleanupRemovedFromFriends) cleanupRemovedFromFriends();
      };
    }
  }, [listenForNotificationEvent]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
        Arkadaş Ekle
      </h2>

      {/* Search Section */}
      <div className="mb-6">
        <div className="flex gap-3">
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
              placeholder="Kullanıcı adı veya isim ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <button
            onClick={() => handleSearch(1)}
            disabled={isSearching || !searchTerm.trim()}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold px-6 py-2 rounded-md transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center space-x-2"
            tabIndex="0"
          >
            {isSearching ? (
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
        </div>
      </div>

      {/* Search Results */}
      <div>
        {searchResults.length > 0 ? (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Arama Sonuçları ({count} / {totalCount})
            </h3>
            <div className="space-y-4">
              {searchResults.map((foundUser) => (
                <div
                  key={foundUser._id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => handleUserClick(foundUser._id)}
                >
                  <div className="flex items-center space-x-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center overflow-hidden">
                      {foundUser.avatar ? (
                        <img
                          src={foundUser.avatar}
                          alt={foundUser.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-semibold">
                          {getInitials(foundUser.name)}
                        </span>
                      )}
                    </div>

                    {/* User Info */}
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {foundUser.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {foundUser.email}
                        {foundUser.school && ` • ${foundUser.school}`}
                      </p>
                      {foundUser.location && (
                        <p className="text-xs text-gray-500">
                          {foundUser.location.city},{" "}
                          {foundUser.location.district}
                        </p>
                      )}
                      {foundUser.mutualFriends > 0 && (
                        <p className="text-xs text-green-600">
                          {foundUser.mutualFriends} ortak arkadaş
                        </p>
                      )}
                      <div className="flex items-center space-x-2 mt-1">
                        {foundUser.goalKeeper && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            Kaleci
                          </span>
                        )}
                        {foundUser.role === "admin" && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            Admin
                          </span>
                        )}
                        {foundUser.role === "companyOwner" && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                            Şirket Sahibi
                          </span>
                        )}
                        {foundUser.age && (
                          <span className="text-xs text-gray-400">
                            {foundUser.age} yaş
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div onClick={(e) => e.stopPropagation()}>
                    {foundUser.isFollowing ? (
                      <button
                        onClick={() => handleUnfriend(foundUser._id)}
                        className="bg-gray-600 hover:bg-gray-700 text-white font-semibold px-4 py-2 rounded-md transition-colors cursor-pointer text-sm"
                        tabIndex="0"
                      >
                        Arkadaşlıktan Çıkar
                      </button>
                    ) : foundUser.isPending ? (
                      <button
                        onClick={() => handleRevokeRequest(foundUser._id)}
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-md transition-colors cursor-pointer text-sm"
                        tabIndex="0"
                      >
                        İsteği Geri Çek
                      </button>
                    ) : (
                      <button
                        onClick={() => handleFollowRequest(foundUser._id)}
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-md transition-colors cursor-pointer text-sm"
                        tabIndex="0"
                      >
                        Takip Et
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <span>
                    Sayfa {currentPage} / {totalPages}
                  </span>
                  <span>•</span>
                  <span>Toplam {totalCount} kullanıcı</span>
                  <span>•</span>
                  <span>Bu sayfada {count} kullanıcı</span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!hasPrevPage || isSearching}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Önceki
                  </button>

                  {/* Page numbers */}
                  <div className="flex items-center space-x-1">
                    {(() => {
                      const pages = [];
                      const startPage = Math.max(1, currentPage - 2);
                      const endPage = Math.min(totalPages, currentPage + 2);

                      // Add first page if not in range
                      if (startPage > 1) {
                        pages.push(
                          <button
                            key={1}
                            onClick={() => handlePageChange(1)}
                            disabled={isSearching}
                            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                          >
                            1
                          </button>
                        );
                        if (startPage > 2) {
                          pages.push(
                            <span key="dots1" className="px-2 text-gray-500">
                              ...
                            </span>
                          );
                        }
                      }

                      // Add pages in range
                      for (let i = startPage; i <= endPage; i++) {
                        pages.push(
                          <button
                            key={i}
                            onClick={() => handlePageChange(i)}
                            disabled={isSearching}
                            className={`px-3 py-2 text-sm font-medium rounded-md disabled:opacity-50 ${
                              i === currentPage
                                ? "text-white bg-green-600 border border-green-600"
                                : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {i}
                          </button>
                        );
                      }

                      // Add last page if not in range
                      if (endPage < totalPages) {
                        if (endPage < totalPages - 1) {
                          pages.push(
                            <span key="dots2" className="px-2 text-gray-500">
                              ...
                            </span>
                          );
                        }
                        pages.push(
                          <button
                            key={totalPages}
                            onClick={() => handlePageChange(totalPages)}
                            disabled={isSearching}
                            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                          >
                            {totalPages}
                          </button>
                        );
                      }

                      return pages;
                    })()}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!hasNextPage || isSearching}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sonraki
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : searchTerm && !isSearching ? (
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
              Sonuç bulunamadı
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              "{searchTerm}" için herhangi bir kullanıcı bulunamadı.
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
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Arkadaş Ara
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Yeni arkadaşlar bulmak için yukarıdaki arama kutusunu kullanın.
            </p>
          </div>
        )}
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

export default AddFriends;
