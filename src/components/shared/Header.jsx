import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useProfileSidebar } from "../../context/ProfileSidebarContext";

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef(null);

  // Auth context
  const { user, isAuthenticated, loading, logout, getProfilePictureUrl } =
    useAuth();
  const { openSidebar, toggleSidebar } = useProfileSidebar();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogoClick = () => {
    window.scrollTo(0, 0);
    navigate("/");
  };

  const handleLogin = () => {
    window.scrollTo(0, 0);
    navigate("/auth/login");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleProfileClick = () => {
    console.log("Profile button clicked");
    toggleSidebar();
  };

  const handleLogout = async () => {
    await logout();
    window.scrollTo(0, 0);
    navigate("/auth/login");
  };

  // Generate initials from user name
  const getInitials = (name) => {
    if (!name) return "U";
    const nameParts = name.split(/[\s.]+/).filter((part) => part.length > 0);
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }
    return (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase();
  };

  const navLinks = [
    { name: "Maç İlanları", path: "/matches" },
    { name: "Halısaha Rezervasyonu", path: "/reservation" },
    { name: "Turnuvalar", path: "/tournaments" },
  ];

  const handleNavClick = (path) => {
    window.scrollTo(0, 0);
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-200/50" 
          : "bg-white/90 backdrop-blur-md"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-18">
          {/* Logo - Left */}
          <div className="flex-shrink-0">
            <button
              onClick={handleLogoClick}
              className="flex items-center hover:opacity-80 transition-opacity cursor-pointer"
              tabIndex="0"
              aria-label="Ana sayfaya git"
            >
              <img
                src="https://res.cloudinary.com/dppjlhdth/image/upload/v1745746418/SporPlanet_Transparent_Logo_hecyyn.png"
                alt="SporPlanet Logo"
                className="w-16 h-16 object-contain"
              />
            </button>
          </div>

          {/* Navigation Links - Modern Pills Style */}
          <nav className="hidden lg:flex items-center space-x-1 bg-gray-50/80 backdrop-blur-sm rounded-full p-1.5 border border-gray-200/50">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <button
                  key={link.name}
                  onClick={() => handleNavClick(link.path)}
                  className={`relative px-5 py-2.5 text-sm font-medium rounded-full transition-all duration-300 cursor-pointer focus:outline-none whitespace-nowrap ${
                    isActive
                      ? "text-white bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg shadow-green-500/25"
                      : "text-gray-700 hover:text-green-600 hover:bg-white/80"
                  }`}
                  tabIndex="0"
                >
                  {link.name}
                  {isActive && (
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 opacity-20 blur-lg"></div>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {/* Desktop Auth Section */}
            <div className="hidden md:flex items-center space-x-3">
              {!loading && isAuthenticated && user ? (
                // Authenticated User Profile
                <div className="flex items-center space-x-3">

                  <button
                    onClick={handleProfileClick}
                    className="flex items-center space-x-3 px-3 py-2 rounded-full hover:bg-gray-100/80 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500/50 cursor-pointer group"
                    tabIndex="0"
                    aria-label="Profil menüsünü aç"
                  >
                    <div className="relative">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center overflow-hidden ring-2 ring-white shadow-md group-hover:shadow-lg transition-all duration-300">
                        {getProfilePictureUrl(user.profilePicture) ? (
                          <img
                            src={getProfilePictureUrl(user.profilePicture)}
                            alt={user.name || "Profil"}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div
                          className={`w-full h-full flex items-center justify-center text-white font-semibold text-xs ${
                            getProfilePictureUrl(user.profilePicture)
                              ? "hidden"
                              : "flex"
                          }`}
                        >
                          {getInitials(user.name)}
                        </div>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full animate-pulse"></div>
                    </div>
                    <div className="hidden lg:block text-left">
                      <div className="text-sm font-medium text-gray-900 max-w-28 truncate">
                        {user.name || "Kullanıcı"}
                      </div>
                      <div className="text-xs text-gray-500">Profilim</div>
                    </div>
                    <svg
                      className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </button>
                </div>
              ) : !loading ? (
                // Login Button for Non-Authenticated Users
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleLogin}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-green-600 transition-colors duration-300 cursor-pointer focus:outline-none rounded-full"
                    tabIndex="0"
                  >
                    Giriş
                  </button>
                  <button
                    onClick={() => {
                      window.scrollTo(0, 0);
                      navigate("/auth/signup");
                    }}
                    className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-medium rounded-full hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:ring-offset-2"
                    tabIndex="0"
                  >
                    Kayıt Ol
                  </button>
                </div>
              ) : (
                // Loading state
                <div className="flex items-center space-x-2 px-4 py-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-green-500 border-t-transparent"></div>
                  <span className="text-sm text-gray-500">Yükleniyor...</span>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2.5 rounded-xl hover:bg-gray-100/80 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500/50 cursor-pointer group"
              tabIndex="0"
              aria-label="Mobil menüyü aç/kapat"
            >
              <div className="relative w-5 h-5">
                <div
                  className={`absolute top-0 left-0 w-5 h-0.5 bg-gray-600 rounded-full transition-all duration-300 origin-center ${
                    isMobileMenuOpen ? "rotate-45 translate-y-2" : ""
                  }`}
                />
                <div
                  className={`absolute top-2 left-0 w-5 h-0.5 bg-gray-600 rounded-full transition-all duration-300 ${
                    isMobileMenuOpen ? "opacity-0" : ""
                  }`}
                />
                <div
                  className={`absolute top-4 left-0 w-5 h-0.5 bg-gray-600 rounded-full transition-all duration-300 origin-center ${
                    isMobileMenuOpen ? "-rotate-45 -translate-y-2" : ""
                  }`}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Enhanced Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-xl">
            <div className="px-6 py-6 space-y-4">
              {/* Navigation Links */}
              <div className="space-y-2">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <button
                      key={link.name}
                      onClick={() => handleNavClick(link.path)}
                      className={`flex items-center w-full px-4 py-3 text-left rounded-xl transition-all duration-300 cursor-pointer focus:outline-none group ${
                        isActive
                          ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                          : "text-gray-700 hover:bg-gray-100/80 hover:text-green-600"
                      }`}
                      tabIndex="0"
                    >
                      <span className="font-medium">{link.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200/50"></div>

              {/* Mobile Auth Section */}
              <div className="space-y-3">
                {!loading && isAuthenticated && user ? (
                  // Authenticated User Mobile Section
                  <>
                    {/* User Profile Card */}
                    <div className="flex items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200/50">
                      <div className="relative mr-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center overflow-hidden">
                          {getProfilePictureUrl(user.profilePicture) ? (
                            <img
                              src={getProfilePictureUrl(user.profilePicture)}
                              alt={user.name || "Profil"}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "flex";
                              }}
                            />
                          ) : null}
                          <div
                            className={`w-full h-full flex items-center justify-center text-white font-semibold text-sm ${
                              getProfilePictureUrl(user.profilePicture)
                                ? "hidden"
                                : "flex"
                            }`}
                          >
                            {getInitials(user.name)}
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {user.name || "Kullanıcı"}
                        </p>
                        <p className="text-xs text-gray-600 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    {/* User Actions */}
                    <button
                      onClick={() => {
                        openSidebar();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-100/80 hover:text-green-600 rounded-xl transition-all duration-300 cursor-pointer focus:outline-none group"
                      tabIndex="0"
                    >
                      <svg
                        className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span className="font-medium">Profilim</span>
                    </button>

                    <button
                      onClick={() => {
                        window.scrollTo(0, 0);
                        navigate("/profile?section=settings");
                        openSidebar();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-100/80 hover:text-green-600 rounded-xl transition-all duration-300 cursor-pointer focus:outline-none group"
                      tabIndex="0"
                    >
                      <svg
                        className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span className="font-medium">Ayarlar</span>
                    </button>

                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 cursor-pointer focus:outline-none group"
                      tabIndex="0"
                    >
                      <svg
                        className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      <span className="font-medium">Çıkış Yap</span>
                    </button>
                  </>
                ) : !loading ? (
                  // Login/Signup Buttons for Non-Authenticated Users
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        handleLogin();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center justify-center w-full px-4 py-3 text-gray-700 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300 cursor-pointer focus:outline-none"
                      tabIndex="0"
                    >
                      <span>Giriş Yap</span>
                    </button>
                    <button
                      onClick={() => {
                        window.scrollTo(0, 0);
                        navigate("/auth/signup");
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center justify-center w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg cursor-pointer focus:outline-none"
                      tabIndex="0"
                    >
                      <span>Kayıt Ol</span>
                    </button>
                  </div>
                ) : (
                  // Loading state for mobile
                  <div className="flex items-center justify-center px-4 py-6">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-green-500 border-t-transparent mr-3"></div>
                    <span className="text-gray-500">Yükleniyor...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;