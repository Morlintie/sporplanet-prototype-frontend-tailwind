import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/auth-background.css";

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center">
    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
  </div>
);

// Error and Success Message Translation
const translateMessage = (message, isSuccess = false) => {
  if (isSuccess) {
    // Success message translations
    if (message.includes("Login successful")) {
      return "Giriş başarılı! Yönlendiriliyorsunuz...";
    }
    return message; // Return original if no translation found
  } else {
    // Error message translations
    if (
      message.includes("You have been banned") ||
      message.includes("please get contact with your customer service")
    ) {
      return "Hesabınız yasaklanmış. Lütfen müşteri hizmetleri ile iletişime geçin.";
    }
    if (
      message.includes("User couldn't found") ||
      message.includes("User not found")
    ) {
      return "Kullanıcı bulunamadı. E-posta adresinizi kontrol edin.";
    }
    if (
      message.includes("Your account haven't been verified yet") ||
      message.includes("haven't been verified")
    ) {
      return "Hesabınız henüz doğrulanmamış. Lütfen e-posta adresinizi kontrol edin.";
    }
    if (
      message.includes("The password is not correct") ||
      message.includes("password is not correct")
    ) {
      return "Şifre yanlış. Lütfen tekrar deneyin.";
    }
    if (message.includes("E11000") && message.includes("email")) {
      return "Bu e-posta adresi zaten kayıtlı.";
    }
    if (message.includes("Please provide email and password")) {
      return "Lütfen e-posta ve şifre bilgilerini girin.";
    }
    if (message.includes("Please provide required data")) {
      return "Lütfen gerekli bilgileri sağlayın.";
    }
    if (message.includes("Invalid credentials")) {
      return "Geçersiz giriş bilgileri.";
    }
    if (message.includes("Network Error") || message.includes("fetch")) {
      return "Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.";
    }
    if (message.includes("Internal Server Error") || message.includes("500")) {
      return "Sunucu hatası. Lütfen daha sonra tekrar deneyin.";
    }
    if (message.includes("Bad Request") || message.includes("400")) {
      return "Geçersiz istek. Lütfen bilgilerinizi kontrol edin.";
    }
    if (message.includes("Unauthorized") || message.includes("401")) {
      return "Yetkisiz erişim. Giriş bilgilerinizi kontrol edin.";
    }
    if (message.includes("Forbidden") || message.includes("403")) {
      return "Erişim yasak. Yetkiniz bulunmuyor.";
    }
    if (message.includes("Google authentication failed")) {
      return "Google ile giriş başarısız. Lütfen tekrar deneyin.";
    }
    if (message.includes("OAuth")) {
      return "Google kimlik doğrulama hatası. Lütfen tekrar deneyin.";
    }

    // If no specific translation found, return a generic error message
    return "Bir hata oluştu. Lütfen tekrar deneyin.";
  }
};

function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Auth context
  const { login: authLogin, checkAuth } = useAuth();

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Validation state
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Google OAuth callback handler
  useEffect(() => {
    const statusCode = searchParams.get("statusCode");
    const message = searchParams.get("message");
    const userId = searchParams.get("userId");

    if (statusCode && message) {
      // Handle Google OAuth error
      setError(translateMessage(message, false));
      // Clear URL parameters
      navigate("/auth/login", { replace: true });
    } else if (userId) {
      // Handle Google OAuth success - request cookies
      handleGoogleCookieRequest(userId);
    }
  }, [searchParams, navigate]);

  // Request cookies after successful Google OAuth
  const handleGoogleCookieRequest = async (userId) => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/v1/auth/google/cookie?userId=${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || "Google authentication failed");
      }

      // Success - use AuthContext to set user data and redirect
      if (data.user) {
        authLogin(data.user);
      }

      setSuccess(translateMessage(data.msg || "Login successful", true));
      setTimeout(() => {
        navigate("/");
        // Refresh auth state after navigation to ensure consistency
        setTimeout(() => {
          checkAuth();
        }, 100);
      }, 1500);
    } catch (err) {
      console.error("Google authentication error:", err);

      // Handle network errors
      if (err.name === "TypeError" && err.message.includes("fetch")) {
        setError(translateMessage("Network Error", false));
      } else {
        setError(translateMessage(err.message, false));
      }
    } finally {
      setIsLoading(false);
      // Clear URL parameters
      navigate("/auth/login", { replace: true });
    }
  };

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const minLength = password.length >= 6;
    const hasLetterOrNumber = /[a-zA-Z0-9]/.test(password);

    return {
      isValid: minLength && hasLetterOrNumber,
      minLength,
      hasLetterOrNumber,
    };
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setError("");

    if (value && !validateEmail(value)) {
      setEmailError("Geçerli bir e-posta adresi girin");
    } else {
      setEmailError("");
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setError("");

    if (value) {
      const validation = validatePassword(value);
      if (!validation.isValid) {
        const errors = [];
        if (!validation.minLength) errors.push("En az 6 karakter");
        if (!validation.hasLetterOrNumber)
          errors.push("En az 1 harf veya rakam");

        setPasswordError(`Şifre gereksinimleri: ${errors.join(", ")}`);
      } else {
        setPasswordError("");
      }
    } else {
      setPasswordError("");
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth route
    window.location.href = "/api/v1/auth/google";
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    // Check for validation errors
    if (emailError || passwordError) {
      setError("Lütfen tüm alanları doğru şekilde doldurun");
      setIsLoading(false);
      return;
    }

    // Final validation check
    if (!validateEmail(email)) {
      setEmailError("Geçerli bir e-posta adresi girin");
      setIsLoading(false);
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setPasswordError("Şifre gereksinimlerini karşılamıyor");
      setIsLoading(false);
      return;
    }

    try {
      // Real API call to backend login endpoint
      const response = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || "Login failed");
      }

      // Check if user data is returned (user exists and login successful)
      if (data.user) {
        // Use AuthContext login function to set user data
        authLogin(data.user);

        // Success message and redirect
        setSuccess("Giriş başarılı! Yönlendiriliyorsunuz...");

        // Allow time for the auth state to propagate to all components
        setTimeout(() => {
          navigate("/");
          // Refresh auth state after navigation to ensure consistency
          setTimeout(() => {
            checkAuth();
          }, 100);
        }, 1500);
      } else {
        // Handle case where user doesn't exist
        throw new Error("User couldn't found.");
      }
    } catch (err) {
      console.error("Login error:", err);

      // Handle network errors
      if (err.name === "TypeError" && err.message.includes("fetch")) {
        setError(translateMessage("Network Error", false));
      } else {
        setError(translateMessage(err.message, false));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate("/auth/forgot-password");
  };

  const handleCreateAccount = () => {
    navigate("/auth/signup");
  };

  const handleLogoClick = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-white relative flex items-center justify-center p-4">
      {/* Right side purplish background area */}
      <div className="absolute top-0 right-0 w-full h-full background-gradient"></div>

      <div className="relative z-10 w-full flex justify-center">
        <div className="login-card-wrapper relative">
          {/* Green blur positioned behind the card */}
          <div className="background-green-blur-card"></div>

          <div className="bg-white/85 backdrop-blur-md rounded-3xl shadow-2xl p-5 w-full max-w-lg relative overflow-hidden">
            {/* Blurred effects around the card */}
            <div className="card-blur-violet"></div>
            <div className="card-blur-pink"></div>

            {/* Logo */}
            <div className="flex justify-center mb-2">
              <button
                onClick={handleLogoClick}
                className="w-20 h-20 flex items-center justify-center rounded-full cursor-pointer"
                tabIndex="0"
                aria-label="Ana sayfaya git"
              >
                <img
                  src="https://res.cloudinary.com/dppjlhdth/image/upload/v1745746418/SporPlanet_Transparent_Logo_hecyyn.png"
                  alt="SporPlanet Logo"
                  className="w-20 h-20 object-contain"
                />
              </button>
            </div>

            {/* Title */}
            <div className="text-center mb-3">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Giriş Yap
              </h1>
              <p className="text-gray-600">Hesabınıza giriş yapın</p>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm text-center">{error}</p>
              </div>
            )}
            {success && (
              <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-600 text-sm text-center">{success}</p>
              </div>
            )}

            {/* Google Login Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-4/5 mx-auto flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-md py-2 px-4 mb-3 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              tabIndex="0"
              aria-label="Google ile giriş yap"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-gray-700 font-medium">Google</span>
            </button>

            {/* Divider */}
            <div className="relative mb-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Veya</span>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin}>
              {/* Email Input */}
              <div className="mb-3 flex flex-col items-center">
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="E-posta adresi *"
                  disabled={isLoading}
                  className={`w-4/5 px-4 py-2 bg-gray-50 border rounded-md focus:outline-none focus:bg-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                    emailError
                      ? "border-red-400 focus:border-red-400"
                      : "border-gray-200 focus:border-green-400"
                  }`}
                  style={{
                    boxShadow: "none",
                  }}
                  onFocus={(e) =>
                    (e.target.style.boxShadow = emailError
                      ? "0 0 0 3px rgba(239, 68, 68, 0.2)"
                      : "0 0 0 3px rgba(34, 197, 94, 0.2)")
                  }
                  onBlur={(e) => (e.target.style.boxShadow = "none")}
                  required
                  tabIndex="0"
                  aria-label="E-posta adresi"
                />
                {emailError && (
                  <p className="text-red-500 text-xs mt-1 w-4/5 text-left">
                    {emailError}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div className="mb-3 flex flex-col items-center">
                <input
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="Şifre *"
                  disabled={isLoading}
                  className={`w-4/5 px-4 py-2 bg-gray-50 border rounded-md focus:outline-none focus:bg-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                    passwordError
                      ? "border-red-400 focus:border-red-400"
                      : "border-gray-200 focus:border-green-400"
                  }`}
                  style={{
                    boxShadow: "none",
                  }}
                  onFocus={(e) =>
                    (e.target.style.boxShadow = passwordError
                      ? "0 0 0 3px rgba(239, 68, 68, 0.2)"
                      : "0 0 0 3px rgba(34, 197, 94, 0.2)")
                  }
                  onBlur={(e) => (e.target.style.boxShadow = "none")}
                  required
                  tabIndex="0"
                  aria-label="Şifre"
                />
                {passwordError && (
                  <p className="text-red-500 text-xs mt-1 w-4/5 text-left">
                    {passwordError}
                  </p>
                )}
              </div>

              {/* Forgot Password Link */}
              <div className="text-right mb-3 w-4/5 mx-auto">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={isLoading}
                  className="text-green-500 hover:text-green-600 text-sm font-normal focus:outline-none focus:underline cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  tabIndex="0"
                >
                  Şifremi Unuttum
                </button>
              </div>

              {/* Login Button */}
              <div className="flex justify-center mb-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-4/5 bg-[rgb(0,128,0)] hover:bg-[rgb(0,100,0)] text-white font-semibold py-2 px-4 rounded-md transition-colors cursor-pointer focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  tabIndex="0"
                  aria-label="Giriş yap"
                >
                  {isLoading ? <LoadingSpinner /> : "Giriş Yap"}
                </button>
              </div>

              {/* Divider Line */}
              <div className="w-4/5 mx-auto border-t border-gray-200 mb-3"></div>
            </form>

            {/* Create Account Link */}
            <div className="text-center mt-3">
              <span className="text-gray-600 text-xs">
                Henüz bir hesabınız yok mu?{" "}
              </span>
              <button
                onClick={handleCreateAccount}
                disabled={isLoading}
                className="text-green-500 hover:text-green-600 text-sm font-normal focus:outline-none focus:underline cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                tabIndex="0"
              >
                Hesap Oluştur
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
