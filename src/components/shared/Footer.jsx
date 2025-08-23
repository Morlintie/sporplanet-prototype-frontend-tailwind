import { useNavigate } from "react-router-dom";

function Footer() {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    window.scrollTo(0, 0);
    navigate("/");
  };

  const handleNavClick = (href) => {
    if (href.startsWith('/')) {
      window.scrollTo(0, 0);
      navigate(href);
    } else {
      window.open(href, '_blank');
    }
  };

  const socialLinks = [
    {
      name: "Facebook",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      href: "https://facebook.com/sporplanet",
      color: "hover:text-blue-400"
    },
    {
      name: "Twitter",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
      ),
      href: "https://twitter.com/sporplanet",
      color: "hover:text-sky-400"
    },
    {
      name: "Instagram",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
      href: "https://instagram.com/sporplanet",
      color: "hover:text-pink-400"
    },
    {
      name: "LinkedIn",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
      href: "https://linkedin.com/company/sporplanet",
      color: "hover:text-blue-500"
    },
    {
      name: "YouTube",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      ),
      href: "https://youtube.com/@sporplanet",
      color: "hover:text-red-500"
    },
    {
      name: "TikTok",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-.88-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
        </svg>
      ),
      href: "https://tiktok.com/@sporplanet",
      color: "hover:text-black"
    }
  ];

  const quickLinks = [
    { name: "Maç İlanları", href: "/matches", icon: "⚽" },
    { name: "Saha Rezervasyonu", href: "/reservation", icon: "🏟️" },
    { name: "Turnuvalar", href: "/tournaments", icon: "🏆" },
    { name: "Profil", href: "/profile", icon: "👤" }
  ];

  const companyLinks = [
    { name: "Hakkımızda", href: "/about" },
    { name: "Kariyer", href: "/careers" },
    { name: "Blog", href: "/blog" },
    { name: "Basın Kiti", href: "/press" },
    { name: "Yatırımcılar", href: "/investors" }
  ];

  const supportLinks = [
    { name: "Yardım Merkezi", href: "/help" },
    { name: "İletişim", href: "/contact" },
    { name: "SSS", href: "/faq" },
    { name: "Canlı Destek", href: "/live-support" },
    { name: "Durum Sayfası", href: "/status" }
  ];

  const legalLinks = [
    { name: "Gizlilik Politikası", href: "/privacy" },
    { name: "Kullanım Şartları", href: "/terms" },
    { name: "Çerez Politikası", href: "/cookies" },
    { name: "KVKK", href: "/kvkk" },
    { name: "Güvenlik", href: "/security" }
  ];


  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 60 60" fill="none">
          <defs>
            <pattern id="footerPattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle cx="30" cy="30" r="2" fill="currentColor" />
              <circle cx="10" cy="10" r="1" fill="currentColor" />
              <circle cx="50" cy="10" r="1" fill="currentColor" />
              <circle cx="10" cy="50" r="1" fill="currentColor" />
              <circle cx="50" cy="50" r="1" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#footerPattern)" />
        </svg>
      </div>

      {/* Floating Football Elements */}
      <div className="absolute top-10 left-10 w-16 h-16 opacity-10 animate-bounce" style={{ animationDuration: "3s" }}>
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-green-400">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
        </svg>
      </div>
      <div className="absolute top-1/4 right-20 w-12 h-12 opacity-10 animate-pulse" style={{ animationDelay: "1s" }}>
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-blue-400">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      </div>
      <div className="absolute bottom-20 left-1/4 w-10 h-10 opacity-10 animate-spin" style={{ animationDuration: "8s" }}>
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-yellow-400">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Logo and Description */}
            <div>
              <button
                onClick={handleLogoClick}
                className="group flex items-center mb-4 hover:opacity-80 transition-all duration-300 cursor-pointer"
                tabIndex="0"
                aria-label="Ana sayfaya git"
              >
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2 rounded-lg mr-2 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <img
                    src="https://res.cloudinary.com/dppjlhdth/image/upload/v1748956267/White_SporPlanet_Logo_yauoso.png"
                    alt="SporPlanet Logo"
                    className="w-6 h-6 object-contain"
                  />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  SporPlanet
                </span>
              </button>
              
              <p className="text-gray-400 text-sm leading-relaxed">
                Türkiye'nin en büyük futbol topluluğu. Maç bul, arkadaş edin, futbol oyna.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-sm font-semibold mb-4 text-green-400">Hızlı Erişim</h3>
              <ul className="space-y-2">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <button
                      onClick={() => handleNavClick(link.href)}
                      className="text-gray-400 hover:text-white transition-colors text-sm cursor-pointer"
                    >
                      {link.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h3 className="text-sm font-semibold mb-4 text-green-400">Destek</h3>
              <ul className="space-y-2">
                {supportLinks.slice(0, 4).map((link) => (
                  <li key={link.name}>
                    <button
                      onClick={() => handleNavClick(link.href)}
                      className="text-gray-400 hover:text-white transition-colors text-sm cursor-pointer"
                    >
                      {link.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h3 className="text-sm font-semibold mb-4 text-green-400">Yasal</h3>
              <ul className="space-y-2">
                {legalLinks.slice(0, 4).map((link) => (
                  <li key={link.name}>
                    <button
                      onClick={() => handleNavClick(link.href)}
                      className="text-gray-400 hover:text-white transition-colors text-sm cursor-pointer"
                    >
                      {link.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Simple Bottom Bar - Social Media & Copyright */}
        <div className="border-t border-gray-700/50 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} SporPlanet. Tüm hakları saklıdır.
            </p>
            
            {/* Social Media Links */}
            <div className="flex space-x-3">
              {socialLinks.map((social) => (
                <button
                  key={social.name}
                  onClick={() => handleNavClick(social.href)}
                  className={`p-2 bg-gray-800 rounded-full text-gray-400 transition-all duration-300 hover:scale-110 ${social.color}`}
                  aria-label={social.name}
                  title={social.name}
                >
                  {social.icon}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 p-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 z-50 group"
        aria-label="Yukarı çık"
      >
        <svg className="w-5 h-5 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </footer>
  );
}

export default Footer;