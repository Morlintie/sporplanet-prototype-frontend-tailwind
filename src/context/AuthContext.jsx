import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [followerCount, setFollowerCount] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showArchivedUserPopup, setShowArchivedUserPopup] = useState(false);
  const [unseenMessages, setUnseenMessages] = useState({});
  const [participantAdverts, setParticipantAdverts] = useState([]);
  const [currentViewingAdvertId, setCurrentViewingAdvertId] = useState(null);

  // Friend request viewing state
  const [isViewingFriendRequests, setIsViewingFriendRequests] = useState(false);

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

      // Account recovery messages
      "User is no longer deleted or archived.":
        "Hesabınız başarıyla geri yüklendi.",
      "Account recovery failed": "Hesap geri yükleme başarısız",
      "Logout successful.": "Başarıyla çıkış yapıldı.",

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

  // Fetch unseen messages for authenticated user
  const fetchUnseenMessages = async () => {
    try {
      const response = await fetch("/api/v1/advert-chat/unseen", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Unseen messages fetched successfully:", data);
        setUnseenMessages(data.messages || {});
        setParticipantAdverts(data.adverts || []);
      } else {
        // Handle error cases
        const errorData = await response.json();
        console.error("Failed to fetch unseen messages:", errorData);
        // Don't show error to user for this, just log it
        setUnseenMessages({});
        setParticipantAdverts([]);
      }
    } catch (error) {
      console.error("Error fetching unseen messages:", error);
      // Don't show error to user for this, just log it
      setUnseenMessages({});
      setParticipantAdverts([]);
    }
  };

  // Check user authentication status
  const checkAuth = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/v1/user/show", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("User authenticated successfully:", data);

        if (data.user) {
          setUser(data.user);
          setFollowerCount(data.followerCount || 0);
          setIsAuthenticated(true);

          // Check if user is archived (isDeleted: true and archived: true)
          if (data.user.isDeleted === true && data.user.archived === true) {
            setShowArchivedUserPopup(true);
          }

          // Fetch unseen messages for authenticated user
          await fetchUnseenMessages();
        } else {
          setUser(null);
          setFollowerCount(0);
          setIsAuthenticated(false);
          setUnseenMessages({});
          setParticipantAdverts([]);
        }
      } else {
        // Handle different error cases
        if (response.status === 404) {
          // User not found - not an error, just not authenticated
          console.log("User not authenticated");
          setUser(null);
          setFollowerCount(0);
          setIsAuthenticated(false);
        } else if (response.status === 403) {
          // User is banned
          try {
            const errorData = await response.json();
            setError(
              translateMessage(
                errorData.msg ||
                  "You have been banned, please get contact with our customer service."
              )
            );
          } catch {
            setError(
              translateMessage(
                "You have been banned, please get contact with our customer service."
              )
            );
          }
          setUser(null);
          setFollowerCount(0);
          setIsAuthenticated(false);
        } else {
          // Other server errors - don't show to user, just log
          console.error("Auth check failed with status:", response.status);
          setUser(null);
          setFollowerCount(0);
          setIsAuthenticated(false);
        }
      }
    } catch (error) {
      console.error("Auth check error:", error);

      // Only set error for network issues, not for authentication failures
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        setError(translateMessage("Failed to fetch"));
      }

      setUser(null);
      setFollowerCount(0);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Call logout endpoint to clear server-side tokens and cookies
      const response = await fetch("/api/v1/auth/logout", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Logout successful:", data.msg || "User logged out");
      } else {
        console.warn(
          "Logout endpoint returned error, clearing local state anyway"
        );
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Even if logout API fails, we still clear local state
    } finally {
      // Always clear local authentication state
      setUser(null);
      setFollowerCount(0);
      setIsAuthenticated(false);
      setError(null);
      setLoading(false);
      setUnseenMessages({});
      setParticipantAdverts([]);

      console.log("User authentication state cleared");
    }
  };

  // Login function (for after successful authentication)
  const login = async (userData, followerCount = 0) => {
    setUser(userData);
    setFollowerCount(followerCount);
    setIsAuthenticated(true);
    setError(null);
    setLoading(false);
    console.log("User logged in successfully:", userData);

    // Fetch unseen messages after login
    await fetchUnseenMessages();
  };

  // Update user data (for profile updates)
  const updateUser = (userData) => {
    setUser(userData);
  };

  // Account recovery functions
  const handleAccountRecovery = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/v1/auth/deletionMind", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Update user state to reflect recovery
        setUser((prev) => ({ ...prev, isDeleted: false, archived: false }));
        setShowArchivedUserPopup(false);

        // Show success notification
        setError(null);
        return { success: true, message: translateMessage(data.message) };
      } else {
        const errorData = await response.json();
        const errorMessage = translateMessage(
          errorData.msg || errorData.message || "Account recovery failed"
        );
        setError(errorMessage);
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      console.error("Account recovery error:", error);
      const errorMessage = translateMessage("Network Error");
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const handleAccountRecoveryDecline = async () => {
    try {
      setLoading(true);
      // Call logout endpoint
      const response = await fetch("/api/v1/auth/logout", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Logout successful:", data.msg || "User logged out");
      } else {
        console.warn(
          "Logout endpoint returned error, clearing local state anyway"
        );
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clear local authentication state
      setUser(null);
      setFollowerCount(0);
      setIsAuthenticated(false);
      setError(null);
      setLoading(false);
      setShowArchivedUserPopup(false);
      setUnseenMessages({});
      setParticipantAdverts([]);
      console.log("User authentication state cleared");
    }
  };

  const closeArchivedUserPopup = () => {
    setShowArchivedUserPopup(false);
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Helper functions to check user roles and permissions
  const isAdmin = () => {
    return user?.role === "admin";
  };

  const isCompanyOwner = () => {
    return user?.role === "companyOwner";
  };

  const isUser = () => {
    return user?.role === "user";
  };

  const isBanned = () => {
    return user?.role === "banned";
  };

  const isUserValid = () => {
    return user?.isValid === true;
  };

  const isUserArchived = () => {
    return user?.archived === true;
  };

  // Helper functions to access user data
  const getUserFriends = () => {
    return user?.friends || [];
  };

  const getFriendRequests = () => {
    return user?.friendRequests || [];
  };

  const getSelfFriendRequests = () => {
    return user?.selfFriendRequests || [];
  };

  const getFavoritePitches = () => {
    return user?.favoritePitches || [];
  };

  const getBookings = () => {
    return user?.bookings || [];
  };

  const getAdvertParticipation = () => {
    return user?.advertParticipation || [];
  };

  const getAdvertWaitingList = () => {
    return user?.advertWaitingList || [];
  };

  const getRecentlySearchedUsers = () => {
    return user?.recentlySearchedUser || [];
  };

  const getRecentlySearchedPitches = () => {
    return user?.recentlySearchedPitch || [];
  };

  const getBannedProfiles = () => {
    return user?.bannedProfiles || [];
  };

  // Helper function to get profile picture URL (handles both string and object formats)
  const getProfilePictureUrl = (profilePicture) => {
    if (!profilePicture) return null;
    if (typeof profilePicture === "string") return profilePicture;
    if (typeof profilePicture === "object" && profilePicture.url)
      return profilePicture.url;
    return null;
  };

  // Helper function to get user's profile picture URL
  const getUserProfilePictureUrl = () => {
    return getProfilePictureUrl(user?.profilePicture);
  };

  // Calculate total unseen messages count
  const getTotalUnseenCount = () => {
    return Object.values(unseenMessages).reduce(
      (total, count) => total + count,
      0
    );
  };

  // Refresh unseen messages (can be called from components)
  const refreshUnseenMessages = async () => {
    if (isAuthenticated) {
      await fetchUnseenMessages();
    }
  };

  // Clear unseen messages for a specific advert (when user visits advert page)
  const clearUnseenMessagesForAdvert = (advertId) => {
    if (advertId && unseenMessages[advertId]) {
      setUnseenMessages((prev) => {
        const updated = { ...prev };
        delete updated[advertId];
        return updated;
      });
      console.log(`Cleared unseen messages for advert: ${advertId}`);
    }
  };

  // Set currently viewing advert (to track when to mark messages as seen)
  const setCurrentlyViewingAdvert = (advertId) => {
    setCurrentViewingAdvertId(advertId);
    // When user starts viewing an advert, clear its unseen messages
    if (advertId) {
      clearUnseenMessagesForAdvert(advertId);
    }
    console.log(`User now viewing advert: ${advertId}`);
  };

  // Friend request viewing state management
  const setCurrentlyViewingFriendRequests = (isViewing) => {
    setIsViewingFriendRequests(isViewing);

    // When user starts viewing pending friend requests, mark all as seen
    if (isViewing && user?.friendRequests) {
      markAllFriendRequestsAsSeen();
    }
  };

  // Calculate unseen friend requests count
  const getUnseenFriendRequestsCount = () => {
    if (!user?.friendRequests) return 0;

    return user.friendRequests.filter((request) => !request.seen).length;
  };

  // Update follower count (+1 when user accepts someone's friend request)
  const incrementFollowerCount = () => {
    setFollowerCount((prevCount) => prevCount + 1);
    console.log("Follower count incremented by 1");
  };

  // Decrement follower count (-1 when someone unfriends the user)
  const decrementFollowerCount = () => {
    setFollowerCount((prevCount) => Math.max(0, prevCount - 1));
    console.log("Follower count decremented by 1");
  };

  // Remove friend from user's friends array (when user unfriends someone)
  const removeFriend = useCallback((friendUserId) => {
    if (!friendUserId) return;

    setUser((prevUser) => {
      if (!prevUser) return prevUser;

      console.log("Removing user from friends list:", friendUserId);
      return {
        ...prevUser,
        friends: (prevUser.friends || []).filter(
          (friend) => friend._id !== friendUserId
        ),
      };
    });
  }, []);

  // Remove current user from someone else's friends (when someone unfriends us)
  const removeFromFriendsList = useCallback((unfrienderUserId) => {
    if (!unfrienderUserId) return;

    // This doesn't affect our friends array, but decrements our follower count
    // since someone removed us from their friends list
    decrementFollowerCount();
    console.log(
      "We were removed from someone's friends list:",
      unfrienderUserId
    );
  }, []);

  // Mark all friend requests as seen (when user views the pending tab)
  const markAllFriendRequestsAsSeen = async () => {
    if (!user?.friendRequests || user.friendRequests.length === 0) return;

    // Check if there are any unseen requests to avoid unnecessary API calls
    const unseenRequests = user.friendRequests.filter(
      (request) => !request.seen
    );
    if (unseenRequests.length === 0) {
      console.log("No unseen friend requests to mark as seen");
      return;
    }

    try {
      console.log(
        `Marking ${unseenRequests.length} friend requests as seen in database`
      );

      // Update local state immediately for better UX
      setUser((prevUser) => ({
        ...prevUser,
        friendRequests: prevUser.friendRequests.map((request) => ({
          ...request,
          seen: true,
        })),
      }));

      // Make API call to mark requests as seen in database
      const response = await fetch("/api/v1/user/markAllFriendRequests", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.msg ||
            errorData.message ||
            "Failed to mark friend requests as seen"
        );
      }

      const data = await response.json();
      console.log("Backend response:", data.message);
      console.log("All friend requests marked as seen in database");
    } catch (error) {
      console.error("Error marking friend requests as seen:", error);

      // Revert local state if API call failed
      setUser((prevUser) => ({
        ...prevUser,
        friendRequests: prevUser.friendRequests.map((request, index) => {
          // Only revert the ones that were originally unseen
          const wasUnseen = unseenRequests.some(
            (unseenReq) => unseenReq.user._id === request.user._id
          );
          if (wasUnseen) {
            return {
              ...request,
              seen: false,
            };
          }
          return request;
        }),
      }));

      // Handle network errors with Turkish translation
      let errorMessage =
        "Arkadaşlık istekleri okundu olarak işaretlenirken hata oluştu.";

      if (error.name === "TypeError" && error.message.includes("fetch")) {
        errorMessage =
          "Bağlantı hatası oluştu. İnternet bağlantınızı kontrol edin.";
      } else if (error.message.includes("Failed to fetch")) {
        errorMessage =
          "Bağlantı hatası oluştu. İnternet bağlantınızı kontrol edin.";
      } else if (error.message.includes("Network Error")) {
        errorMessage = "Ağ hatası oluştu. Lütfen tekrar deneyin.";
      } else if (error.message.includes("Unauthorized")) {
        errorMessage = "Yetkisiz erişim.";
      } else if (error.message.includes("Server Error")) {
        errorMessage =
          "Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.";
      }

      // Show error notification (this would need to be implemented if we want to show errors)
      console.error("Translated error message:", errorMessage);
    }
  };

  // Add unseen message for an advert (called when newMessage received via WebSocket)
  const addUnseenMessageForAdvert = (advertId) => {
    // Only increment if user is not currently viewing this specific advert
    if (advertId && advertId !== currentViewingAdvertId) {
      // Check if user is actually a participant of this advert
      const isParticipant = participantAdverts.some(
        (advert) => advert._id === advertId
      );

      if (isParticipant) {
        setUnseenMessages((prev) => ({
          ...prev,
          [advertId]: (prev[advertId] || 0) + 1,
        }));
        console.log(`Added unseen message for advert: ${advertId}`);
      } else {
        console.log(
          `User is not a participant of advert: ${advertId}, not adding unseen message`
        );
      }
    } else if (advertId === currentViewingAdvertId) {
      console.log(
        `User is currently viewing advert: ${advertId}, not marking as unseen`
      );
    }
  };

  // Friend request management functions
  const addOutgoingFriendRequest = (recipientUser) => {
    if (!user || !recipientUser) return;

    setUser((prevUser) => {
      if (!prevUser) return prevUser;

      // Check if request already exists
      const exists = prevUser.selfFriendRequests?.some(
        (req) => req._id === recipientUser._id
      );
      if (exists) {
        console.log(
          "Outgoing friend request already exists for user:",
          recipientUser.name
        );
        return prevUser;
      }

      console.log(
        "Adding outgoing friend request to AuthContext for user:",
        recipientUser.name
      );
      return {
        ...prevUser,
        selfFriendRequests: [
          ...(prevUser.selfFriendRequests || []),
          recipientUser,
        ],
      };
    });
  };

  const addIncomingFriendRequest = useCallback((senderUser) => {
    if (!senderUser) return;

    setUser((prevUser) => {
      if (!prevUser) return prevUser;

      // Check if request already exists
      const exists = prevUser.friendRequests?.some(
        (req) => req.user._id === senderUser._id
      );
      if (exists) {
        console.log(
          "Incoming friend request already exists from user:",
          senderUser.name
        );
        return prevUser;
      }

      console.log(
        "Adding incoming friend request to AuthContext from user:",
        senderUser.name
      );
      const newFriendRequest = {
        user: senderUser,
        seen: false,
      };

      return {
        ...prevUser,
        friendRequests: [...(prevUser.friendRequests || []), newFriendRequest],
      };
    });
  }, []);

  const removeOutgoingFriendRequest = (recipientUserId) => {
    if (!user || !recipientUserId) return;

    setUser((prevUser) => {
      if (!prevUser) return prevUser;

      console.log(
        "Removing outgoing friend request from AuthContext for user:",
        recipientUserId
      );
      return {
        ...prevUser,
        selfFriendRequests: (prevUser.selfFriendRequests || []).filter(
          (req) => req._id !== recipientUserId
        ),
      };
    });
  };

  const removeIncomingFriendRequest = useCallback((senderUserId) => {
    if (!senderUserId) return;

    setUser((prevUser) => {
      if (!prevUser) return prevUser;

      console.log(
        "Removing incoming friend request from AuthContext from user:",
        senderUserId
      );
      return {
        ...prevUser,
        friendRequests: (prevUser.friendRequests || []).filter(
          (req) => req.user._id !== senderUserId
        ),
      };
    });
  }, []);

  const acceptFriendRequest = (senderUserId) => {
    if (!user || !senderUserId) return;

    setUser((prevUser) => {
      if (!prevUser) return prevUser;

      console.log(
        "Accepting friend request and removing from incoming requests for user:",
        senderUserId
      );

      // Remove from incoming friend requests only
      // Note: We don't add to friends array because according to the backend logic,
      // only the sender gets added to our friends array, not vice versa
      return {
        ...prevUser,
        friendRequests: (prevUser.friendRequests || []).filter(
          (req) => req.user._id !== senderUserId
        ),
      };
    });
  };

  const addFriend = useCallback((friendUser) => {
    if (!friendUser) return;

    setUser((prevUser) => {
      if (!prevUser) return prevUser;

      // Check if friend already exists
      const exists = prevUser.friends?.some(
        (friend) => friend._id === friendUser._id
      );
      if (exists) {
        console.log("User already in friends list:", friendUser.name);
        return prevUser;
      }

      console.log("Adding user to friends list:", friendUser.name);
      return {
        ...prevUser,
        friends: [...(prevUser.friends || []), friendUser],
      };
    });
  }, []);

  const removeFriendRequest = useCallback((userId) => {
    if (!userId) return;

    setUser((prevUser) => {
      if (!prevUser) return prevUser;

      console.log(
        "Removing friend request (accepted/rejected) for user:",
        userId
      );

      // Remove from selfFriendRequests (outgoing requests)
      return {
        ...prevUser,
        selfFriendRequests: (prevUser.selfFriendRequests || []).filter(
          (req) => req._id !== userId
        ),
      };
    });
  }, []);

  const value = {
    // Core state
    user,
    followerCount,
    isAuthenticated,
    loading,
    error,
    showArchivedUserPopup,

    // Unseen messages state
    unseenMessages,
    participantAdverts,
    currentViewingAdvertId,
    getTotalUnseenCount,
    refreshUnseenMessages,
    clearUnseenMessagesForAdvert,
    setCurrentlyViewingAdvert,
    addUnseenMessageForAdvert,

    // Friend request viewing and unseen management
    isViewingFriendRequests,
    setCurrentlyViewingFriendRequests,
    getUnseenFriendRequestsCount,
    markAllFriendRequestsAsSeen,

    // Follower count management
    incrementFollowerCount,
    decrementFollowerCount,

    // Friend management
    removeFriend,
    removeFromFriendsList,

    // Friend request management
    addOutgoingFriendRequest,
    addIncomingFriendRequest,
    removeOutgoingFriendRequest,
    removeIncomingFriendRequest,
    acceptFriendRequest,
    addFriend,
    removeFriendRequest,

    // Actions
    checkAuth,
    login,
    logout,
    updateUser,
    clearError,
    handleAccountRecovery,
    handleAccountRecoveryDecline,
    closeArchivedUserPopup,

    // Permission helpers
    isAdmin,
    isCompanyOwner,
    isUser,
    isBanned,
    isUserValid,
    isUserArchived,

    // Data helpers
    getUserFriends,
    getFriendRequests,
    getSelfFriendRequests,
    getFavoritePitches,
    getBookings,
    getAdvertParticipation,
    getAdvertWaitingList,
    getRecentlySearchedUsers,
    getRecentlySearchedPitches,
    getBannedProfiles,
    getProfilePictureUrl,
    getUserProfilePictureUrl,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
