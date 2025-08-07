import { useProfileSidebar } from "../../context/ProfileSidebarContext";
import { useFavorites } from "../../context/FavoritesContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import AuthRequiredPopup from "../shared/AuthRequiredPopup";

function AnimatedProfileSidebar() {
  const { isSidebarOpen, closeSidebar, activeSection, setSection } =
    useProfileSidebar();
  const { favorites } = useFavorites();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showAuthPopup, setShowAuthPopup] = useState(false);

  const menuItems = [
    { id: "profile", label: "Profilim", icon: "user", path: "/profile" },
    {
      id: "friends",
      label: "Arkadaşlarım",
      icon: "friends",
      path: "/profile?section=friends",
      badge: "12",
    },
    {
      id: "favorite-pitches",
      label: "Favorilerim",
      icon: "heart",
      path: "/profile?section=favorite-pitches",
    },
    {
      id: "listings",
      label: "İlanlarım",
      icon: "list",
      path: "/profile?section=listings",
    },
    {
      id: "reservations",
      label: "Rezervasyonlarım",
      icon: "calendar",
      path: "/profile?section=reservations",
    },
    {
      id: "tournaments",
      label: "Turnuvalarım",
      icon: "trophy",
      path: "/profile?section=tournaments",
    },
    {
      id: "messages",
      label: "Mesajlar",
      icon: "message",
      path: "/profile?section=messages",
    },
    {
      id: "comments",
      label: "Yorumlarım",
      icon: "comment",
      path: "/profile?section=comments",
    },
    {
      id: "invitations",
      label: "Davetlerim",
      icon: "mail",
      path: "/profile?section=invitations",
    },
  ];

  const settingsItem = {
    id: "settings",
    label: "Ayarlar",
    icon: "settings",
    path: "/profile?section=settings",
  };

  const getIcon = (iconName) => {
    switch (iconName) {
      case "user":
        return (
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
        );
      case "friends":
        return (
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
        );
      case "heart":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        );
      case "eye":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        );
      case "list":
        return (
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
        );
      case "calendar":
        return (
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
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        );
      case "trophy":
        return (
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
              d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 3.143L13 21l-2.286-6.857L5 12l5.714-3.143L13 3z"
            />
          </svg>
        );
      case "message":
        return (
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
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        );
      case "comment":
        return (
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
              d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
            />
          </svg>
        );
      case "mail":
        return (
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
              d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        );
      case "settings":
        return (
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
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const getAuthMessage = (itemId) => {
    const messages = {
      profile: "Profilinize ulaşabilmek için giriş yapın",
      friends: "Arkadaşlarınızı görebilmek için giriş yapın",
      "favorite-pitches": "Favorilerinize erişebilmek için giriş yapın",
      listings: "İlanlarınızı görebilmek için giriş yapın",
      reservations: "Rezervasyonlarınıza erişebilmek için giriş yapın",
      tournaments: "Turnuvalarınızı görebilmek için giriş yapın",
      messages: "Mesajlarınıza erişebilmek için giriş yapın",
      comments: "Yorumlarınızı görebilmek için giriş yapın",
      invitations: "Davetlerinizi görebilmek için giriş yapın",
      settings: "Ayarlarınıza erişebilmek için giriş yapın",
    };
    return messages[itemId] || "Bu işlemi yapabilmek için giriş yapın";
  };

  const handleMenuItemClick = (item) => {
    console.log("Menu item clicked:", item);

    if (!isAuthenticated) {
      setShowAuthPopup(true);
      return;
    }

    setSection(item.id);
    navigate(item.path);
  };

  return (
    <>
      {isSidebarOpen && (
        <div
          className="fixed top-16 right-0 left-0 bottom-0  z-20 transition-opacity duration-300"
          onClick={closeSidebar}
        />
      )}
      <div

        className={`fixed top-16 right-0 h-[calc(100vh-4rem)] w-full sm:w-80 md:w-80 lg:w-80 max-w-sm bg-white shadow-2xl z-40 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header - Fixed*/}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900">Profil Menüsü</h2>
          <button
            onClick={closeSidebar}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
            tabIndex="0"
            aria-label="Menüyü kapat"
          >
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>


        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto scroll-smooth">
          <nav className="px-4 py-2 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleMenuItemClick(item)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors cursor-pointer ${
                  activeSection === item.id
                    ? "bg-green-50 text-green-700 border-l-4 border-green-600"
                    : "text-gray-700 hover:bg-gray-50 hover:text-green-600"
                }`}
                tabIndex="0"
              >
                <div className="flex items-center space-x-3">
                  <span
                    className={`${
                      activeSection === item.id
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    {getIcon(item.icon)}
                  </span>
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.badge && item.id !== "favorite-pitches" && (
                  <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}

            {/* Ayarlar - Ayrı bölüm */}
            <div className="pt-4 mt-4 border-t border-gray-200">
              <button
                onClick={() => handleMenuItemClick(settingsItem)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors cursor-pointer ${
                  activeSection === settingsItem.id
                    ? "bg-green-50 text-green-700 border-l-4 border-green-600"
                    : "text-gray-700 hover:bg-gray-50 hover:text-green-600"
                }`}
                tabIndex="0"
              >
                <span
                  className={`${
                    activeSection === settingsItem.id
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                >
                  {getIcon(settingsItem.icon)}

                </span>
                <span className="font-medium">{settingsItem.label}</span>
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* Auth Required Popup */}
      <AuthRequiredPopup
        isVisible={showAuthPopup}
        onClose={() => setShowAuthPopup(false)}
        customMessage={getAuthMessage(activeSection)}
      />
    </>
  );
}

export default AnimatedProfileSidebar;
