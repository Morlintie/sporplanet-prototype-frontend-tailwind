import { useNavigate } from "react-router-dom";
import "../../styles/google-failure-background.css";

const GoogleFailure = () => {
  const navigate = useNavigate();

  const handleGoogleRetry = () => {
    // Google OAuth retry logic
    console.log("Google ile tekrar giriş deneniyor...");
  };

  const handleEmailLogin = () => {
    navigate("/auth/login");
  };

  const handleSignup = () => {
    navigate("/auth/signup");
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  return (
    <div className="google-failure-background">
      <div className="flex items-center justify-center min-h-screen p-4 overflow-visible">
        <div className="relative failure-card-container">
          <div className="failure-card-blur w-full max-w-xl rounded-3xl p-5 text-center overflow-hidden">
            {/* Logo */}
            <div className="mb-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-3">
                {/* SporPlanet Logo */}
                <img
                  src="https://res.cloudinary.com/dppjlhdth/image/upload/v1745746418/SporPlanet_Transparent_Logo_hecyyn.png"
                  alt="SporPlanet Logo"
                  className="w-20 h-20 object-contain"
                />
              </div>
            </div>

            {/* Error Icon */}
            <div className="mb-4">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-red-500 rounded-full">
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-label="Hata ikonu"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Google ile Giriş Başarısız
            </h1>

            {/* Description */}
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              Google hesabınız ile giriş yapma işlemi tamamlanamadı. Bu durum
              geçici bir bağlantı sorunu veya hesap ayarlarınızdan kaynaklı
              olabilir.
            </p>

            {/* Action Buttons */}
            <div className="space-y-3 mb-6">
              {/* Google Retry Button */}
              <button
                onClick={handleGoogleRetry}
                className="failure-button-blur w-5/6 mx-auto flex items-center justify-center gap-3 bg-[rgb(0,128,0)] hover:bg-[rgb(0,100,0)] text-white font-semibold py-3 px-5 rounded-md transition-colors cursor-pointer"
                tabIndex={0}
                aria-label="Google ile tekrar giriş yapmayı deneyin"
                onKeyDown={(e) => e.key === "Enter" && handleGoogleRetry()}
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google ile tekrar giriş yapmayı deneyin
              </button>

              {/* Email Login Button */}
              <button
                onClick={handleEmailLogin}
                className="failure-button-blur w-5/6 mx-auto flex items-center justify-center gap-3 bg-[rgb(0,128,0)] hover:bg-[rgb(0,100,0)] text-white font-semibold py-3 px-5 rounded-md transition-colors cursor-pointer"
                tabIndex={0}
                aria-label="E-posta ve şifre ile giriş yapın"
                onKeyDown={(e) => e.key === "Enter" && handleEmailLogin()}
              >
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
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                E-posta ve şifre ile giriş yapın
              </button>

              {/* Signup Button */}
              <button
                onClick={handleSignup}
                className="failure-button-blur w-5/6 mx-auto flex items-center justify-center gap-3 bg-[rgb(0,128,0)] hover:bg-[rgb(0,100,0)] text-white font-semibold py-3 px-5 rounded-md transition-colors cursor-pointer"
                tabIndex={0}
                aria-label="Henüz hesabınız yoksa ücretsiz kaydolun"
                onKeyDown={(e) => e.key === "Enter" && handleSignup()}
              >
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
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
                Henüz hesabınız yoksa ücretsiz kaydolun
              </button>
            </div>

            {/* Back to Home Link */}
            <div className="text-sm text-gray-500">
              Sorun devam ediyorsa{" "}
              <button
                onClick={handleBackToHome}
                className="text-green-600 hover:text-green-700 font-medium cursor-pointer transition-colors duration-200"
                tabIndex={0}
                aria-label="Ana sayfaya dönün"
                onKeyDown={(e) => e.key === "Enter" && handleBackToHome()}
              >
                ana sayfaya
              </button>{" "}
              dönün veya destek ekibimizle iletişime geçin.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleFailure;
