import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Header() {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleLogin = () => {
    navigate("/auth/login");
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // Dark mode logic will be implemented later
    console.log("Dark mode toggled:", !isDarkMode);
  };

  const navLinks = [
    { name: "Maç İlanları", path: "/matches" },
    { name: "Halısaha Rezervasyonu", path: "/reservation" },
    { name: "Kaleciler", path: "/goalkeeper" },
    { name: "Turnuvalar", path: "/tournaments" },
  ];

  const handleNavClick = (path) => {
    navigate(path);
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

          {/* Right Side - Login & Dark Mode */}
          <div className="flex items-center space-x-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
              tabIndex="0"
              aria-label="Dark mode toggle"
            >
              {isDarkMode ? (
                // Sun icon for light mode
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                // Moon icon for dark mode
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Login Button */}
            <button
              onClick={handleLogin}
              className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
              tabIndex="0"
            >
              Giriş Yap
            </button>

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2 rounded-md hover:bg-gray-100 transition-colors">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header; 