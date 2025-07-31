import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Header() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleLogin = () => {
    navigate("/auth/login");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navLinks = [
    { name: "Maç İlanları", path: "/matches" },
    { name: "Halısaha Rezervasyonu", path: "/reservation" },
    { name: "Kaleciler", path: "/goalkeeper" },
    { name: "Turnuvalar", path: "/tournaments" },
  ];

  const handleNavClick = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false); // Close mobile menu when navigating
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
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

          {/* Navigation Links - Center */}
          <nav className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavClick(link.path)}
                className="text-gray-700 hover:text-green-600 px-3 py-2 text-sm font-medium transition-colors cursor-pointer focus:outline-none focus:text-green-600"
                tabIndex="0"
              >
                {link.name}
              </button>
            ))}
          </nav>

          {/* Right Side - Auth Buttons */}
          <div className="flex items-center space-x-4">
            {/* Auth Buttons - Hidden on Mobile */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Login Button */}
              <button
                onClick={handleLogin}
                className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
                tabIndex="0"
              >
                Giriş Yap
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
              tabIndex="0"
              aria-label="Mobil menüyü aç/kapat"
            >
              {isMobileMenuOpen ? (
                // X icon when menu is open
                <svg
                  className="w-6 h-6 text-gray-600 dark:text-gray-400"
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
              ) : (
                // Hamburger icon when menu is closed
                <svg
                  className="w-6 h-6 text-gray-600 dark:text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Content */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Navigation Links */}
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => handleNavClick(link.path)}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded-md transition-colors cursor-pointer focus:outline-none focus:text-green-600 focus:bg-gray-50"
                  tabIndex="0"
                >
                  {link.name}
                </button>
              ))}

              {/* Divider */}
              <div className="border-t border-gray-200 my-2"></div>

              {/* Auth Buttons for Mobile */}
              <div className="space-y-2">
                {/* Login Button */}
                <button
                  onClick={() => {
                    handleLogin();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full px-3 py-2 text-base font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500"
                  tabIndex="0"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1"
                    />
                  </svg>
                  Giriş Yap
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
