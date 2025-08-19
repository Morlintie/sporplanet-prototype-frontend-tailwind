import { createContext, useContext, useState, useEffect } from "react";

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showArchivedUserPopup, setShowArchivedUserPopup] = useState(false);
  const [unseenMessages, setUnseenMessages] = useState({});
  const [participantAdverts, setParticipantAdverts] = useState([]);

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

      // Unseen messages errors
      "Please provide required data": "Gerekli bilgileri sağlayın.",
      "No unseen messages found": "Okunmamış mesaj bulunamadı.",
      "Failed to fetch unseen messages": "Okunmamış mesajlar alınamadı.",

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
          setIsAuthenticated(true);

          // Check if user is archived (isDeleted: true and archived: true)
          if (data.user.isDeleted === true && data.user.archived === true) {
            setShowArchivedUserPopup(true);
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        // Handle different error cases
        if (response.status === 404) {
          // User not found - not an error, just not authenticated
          console.log("User not authenticated");
          setUser(null);
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
          setIsAuthenticated(false);
        } else {
          // Other server errors - don't show to user, just log
          console.error("Auth check failed with status:", response.status);
          setUser(null);
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
      setIsAuthenticated(false);
      setError(null);
      setLoading(false);

      console.log("User authentication state cleared");
    }
  };

  // Login function (for after successful authentication)
  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    setError(null);
    setLoading(false);
    console.log("User logged in successfully:", userData);
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
      setIsAuthenticated(false);
      setError(null);
      setLoading(false);
      setShowArchivedUserPopup(false);
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

  // Fetch unseen messages for authenticated user
  const fetchUnseenMessages = async () => {
    if (!isAuthenticated || !user || !user._id) {
      console.log("User not authenticated, skipping unseen messages fetch");
      return;
    }

    try {
      console.log("Fetching unseen messages for user:", user._id);

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

        // Update unseen messages state
        setUnseenMessages(data.messages || {});
        setParticipantAdverts(data.adverts || []);

        console.log("Unseen messages by advert:", data.messages);
        console.log("Participant adverts:", data.adverts);
      } else {
        // Handle different error cases
        if (response.status === 404) {
          // No unseen messages found - not an error, just empty
          console.log("No unseen messages found");
          setUnseenMessages({});
          setParticipantAdverts([]);
        } else if (response.status === 401) {
          // User unauthorized - don't show error, just clear data
          console.log("User unauthorized for unseen messages");
          setUnseenMessages({});
          setParticipantAdverts([]);
        } else if (response.status === 400) {
          // Bad request - log but don't show error to user
          console.error("Bad request for unseen messages");
          setUnseenMessages({});
          setParticipantAdverts([]);
        } else {
          // Other server errors - log but don't show to user
          console.error(
            "Failed to fetch unseen messages, status:",
            response.status
          );
          setUnseenMessages({});
          setParticipantAdverts([]);
        }
      }
    } catch (error) {
      console.error("Error fetching unseen messages:", error);

      // Only show error for network issues, not for authentication failures
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        console.error("Network error fetching unseen messages");
      }

      // Clear states on error
      setUnseenMessages({});
      setParticipantAdverts([]);
    }
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

  // Helper functions for unseen messages
  const getUnseenMessagesCount = () => {
    return Object.values(unseenMessages).reduce(
      (total, count) => total + count,
      0
    );
  };

  const getUnseenMessagesForAdvert = (advertId) => {
    return unseenMessages[advertId] || 0;
  };

  const updateUnseenMessages = (newUnseenMessages) => {
    setUnseenMessages(newUnseenMessages || {});
  };

  const markAdvertMessagesAsSeen = (advertId) => {
    setUnseenMessages((prev) => {
      const updated = { ...prev };
      delete updated[advertId];
      return updated;
    });
  };

  const addUnseenMessage = (advertId) => {
    setUnseenMessages((prev) => ({
      ...prev,
      [advertId]: (prev[advertId] || 0) + 1,
    }));
  };

  const value = {
    // Core state
    user,
    isAuthenticated,
    loading,
    error,
    showArchivedUserPopup,
    unseenMessages,
    participantAdverts,

    // Actions
    checkAuth,
    login,
    logout,
    updateUser,
    clearError,
    handleAccountRecovery,
    handleAccountRecoveryDecline,
    closeArchivedUserPopup,
    fetchUnseenMessages,

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
    getProfilePictureUrl,
    getUserProfilePictureUrl,

    // Unseen messages helpers
    getUnseenMessagesCount,
    getUnseenMessagesForAdvert,
    updateUnseenMessages,
    markAdvertMessagesAsSeen,
    addUnseenMessage,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
