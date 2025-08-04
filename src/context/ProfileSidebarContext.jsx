import { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const ProfileSidebarContext = createContext();

export const useProfileSidebar = () => {
  const context = useContext(ProfileSidebarContext);
  if (!context) {
    throw new Error("useProfileSidebar must be used within a ProfileSidebarProvider");
  }
  return context;
};

export const ProfileSidebarProvider = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("profile");
  const location = useLocation();

  // Profile ile ilgili sayfalar
  const profileRoutes = ["/profile"];

  // Route değiştiğinde sidebar'ı kontrol et
  useEffect(() => {
    const isProfileRoute = profileRoutes.some(route =>
      location.pathname.startsWith(route)
    );
    // Sadece route değiştiğinde ve profil sayfasından çıkıldığında kapat
    if (!isProfileRoute) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname]); // isSidebarOpen dependency'sini kaldırdık

  // URL'den section'ı al
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const section = urlParams.get('section');
    if (section && [
      'profile', 'friends', 'favorite-pitches', 'listings', 'reservations', 'tournaments',
      'messages', 'comments', 'invitations', 'settings'
    ].includes(section)) {
      setActiveSection(section);
    } else if (location.pathname === "/profile") {
      setActiveSection("profile");
    }
  }, [location.search, location.pathname]);

  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const setSection = (section) => setActiveSection(section);

  const value = {
    isSidebarOpen,
    activeSection,
    openSidebar,
    closeSidebar,
    toggleSidebar,
    setSection,
  };

  return (
    <ProfileSidebarContext.Provider value={value}>
      {children}
    </ProfileSidebarContext.Provider>
  );
}; 