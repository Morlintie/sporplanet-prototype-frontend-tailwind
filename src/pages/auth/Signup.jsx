import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../../styles/auth-background.css";
import PopupSpinner from "../../components/shared/PopupSpinner";

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
    if (message.includes("Account successfully created")) {
      return "Hesabınız başarıyla oluşturuldu! Doğrulama kodu için e-posta kutunuzu kontrol edin.";
    }
    if (message.includes("Your account has been verified")) {
      return "Hesabınız başarıyla doğrulandı!";
    }
    return message; // Return original if no translation found
  } else {
    // Error message translations
    if (message.includes("Both password have to match")) {
      return "Şifreler birbiriyle eşleşmelidir.";
    }
    if (message.includes("E11000") && message.includes("email")) {
      return "Bu e-posta adresi zaten kayıtlı. Lütfen farklı bir e-posta adresi kullanın.";
    }
    if (message.includes("duplicate key") && message.includes("email")) {
      return "Bu e-posta adresi zaten kayıtlı. Lütfen farklı bir e-posta adresi kullanın.";
    }
    if (message.includes("Please provide required data")) {
      return "Lütfen gerekli bilgileri sağlayın.";
    }
    if (message.includes("Verification code's date has been expired")) {
      return "Doğrulama kodunuzun süresi doldu.";
    }
    if (message.includes("Validation code does not match")) {
      return "Doğrulama kodu eşleşmiyor. Lütfen tekrar deneyin.";
    }
    if (message.includes("User not found")) {
      return "Kullanıcı bulunamadı.";
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
    if (message.includes("Registration failed")) {
      return "Kayıt işlemi başarısız. Lütfen tekrar deneyin.";
    }
    if (message.includes("Verification failed")) {
      return "Doğrulama işlemi başarısız. Lütfen tekrar deneyin.";
    }
    if (message.includes("Google authentication failed")) {
      return "Google ile giriş başarısız. Lütfen tekrar deneyin.";
    }
    if (message.includes("OAuth")) {
      return "Google kimlik doğrulama hatası. Lütfen tekrar deneyin.";
    }
    if (message.includes("unauthorized")) {
      return "Yetkisiz erişim. Lütfen tekrar giriş yapmayı deneyin.";
    }

    // If no specific translation found, return a generic error message
    return "Bir hata oluştu. Lütfen tekrar deneyin.";
  }
};

function Signup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Signup form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Verification state
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [userId, setUserId] = useState("");
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showRedirectSpinner, setShowRedirectSpinner] = useState(false);

  // Validation state
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  // Check for Google OAuth userId parameter
  useEffect(() => {
    const userIdFromGoogle = searchParams.get("userId");
    if (userIdFromGoogle) {
      // User came from Google OAuth, show verification card immediately
      setUserId(userIdFromGoogle);
      setShowVerification(true);
      setTimeLeft(300); // Set 5 minutes timer
      setSuccess(
        "Google hesabınız ile kayıt işlemi tamamlandı! Doğrulama kodu için e-posta kutunuzu kontrol edin."
      );
    }
  }, [searchParams]);

  // Countdown timer effect
  useEffect(() => {
    if (showVerification && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showVerification, timeLeft]);

  // Format time for display
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
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

  const handleFullNameChange = (e) => {
    setFullName(e.target.value);
    setError("");
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

    // Also validate confirm password if it exists
    if (confirmPassword && value !== confirmPassword) {
      setConfirmPasswordError("Şifreler eşleşmiyor");
    } else {
      setConfirmPasswordError("");
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    setError("");

    if (value && value !== password) {
      setConfirmPasswordError("Şifreler eşleşmiyor");
    } else {
      setConfirmPasswordError("");
    }
  };

  const handleVerificationCodeChange = (index, value) => {
    const digit = value.replace(/\D/g, ""); // Only allow digits
    if (digit.length <= 1) {
      const newCode = [...verificationCode];
      newCode[index] = digit;
      setVerificationCode(newCode);
      setError("");

      // Auto-focus next input
      if (digit && index < 5) {
        const nextInput = document.getElementById(`code-input-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace to move to previous input
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-input-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
        const newCode = [...verificationCode];
        newCode[index - 1] = "";
        setVerificationCode(newCode);
      }
    }
  };

  const handleGoogleSignup = () => {
    // Redirect to backend Google OAuth route
    window.location.href = "/api/v1/auth/google";
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    // Check for validation errors
    if (emailError || passwordError || confirmPasswordError) {
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

    if (password !== confirmPassword) {
      setConfirmPasswordError("Şifreler eşleşmiyor");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: fullName,
          email: email,
          password: password,
          backupPassword: confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || "Registration failed");
      }

      // Success - show verification card
      setUserId(data.userId);
      setSuccess(translateMessage(data.msg, true));
      setShowVerification(true);
      setTimeLeft(300); // Reset timer to 5 minutes
    } catch (err) {
      setError(translateMessage(err.message, false));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async (e) => {
    e.preventDefault();

    if (timeLeft <= 0) {
      setError(
        "Doğrulama kodunuzun süresi doldu. Lütfen müşteri hizmetleri ile iletişime geçin."
      );
      return;
    }

    const codeString = verificationCode.join("");
    if (codeString.length !== 6) {
      setError("Lütfen 6 haneli doğrulama kodunu girin.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/v1/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          validationNumber: codeString,
          userId: userId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || "Verification failed");
      }

      // Success - show message then redirect to login
      setSuccess(translateMessage(data.msg, true));

      // Show success message for 1 second, then show popup spinner
      setTimeout(() => {
        setShowRedirectSpinner(true);
      }, 1000);

      // Redirect after total 3 seconds
      setTimeout(() => {
        navigate("/auth/login");
      }, 3000);
    } catch (err) {
      setError(translateMessage(err.message, false));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    navigate("/auth/login");
  };

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleBackToSignup = () => {
    setShowVerification(false);
    setVerificationCode(["", "", "", "", "", ""]);
    setError("");
    setSuccess("");
    setTimeLeft(300);
    setUserId("");

    // Clear URL parameters
    navigate("/auth/signup", { replace: true });
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

            {!showVerification ? (
              // Signup Card
              <>
                {/* Title */}
                <div className="text-center mb-3">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Hesap Oluştur
                  </h1>
                  <p className="text-gray-600">Futbol maceranız başlasın</p>
                </div>

                {/* Error/Success Messages */}
                {error && (
                  <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-600 text-sm text-center">{error}</p>
                  </div>
                )}
                {success && (
                  <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-green-600 text-sm text-center">
                      {success}
                    </p>
                  </div>
                )}

                {/* Google Signup Button */}
                <button
                  onClick={handleGoogleSignup}
                  disabled={isLoading}
                  className="w-4/5 mx-auto flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-md py-2 px-4 mb-3 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  tabIndex="0"
                  aria-label="Google ile kayıt ol"
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

                {/* Signup Form */}
                <form onSubmit={handleSignup}>
                  {/* Full Name Input */}
                  <div className="mb-3 flex justify-center">
                    <input
                      type="text"
                      value={fullName}
                      onChange={handleFullNameChange}
                      placeholder="Ad Soyad *"
                      disabled={isLoading}
                      className="w-4/5 px-4 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:border-green-400 focus:bg-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        boxShadow: "none",
                      }}
                      onFocus={(e) =>
                        (e.target.style.boxShadow =
                          "0 0 0 3px rgba(34, 197, 94, 0.2)")
                      }
                      onBlur={(e) => (e.target.style.boxShadow = "none")}
                      required
                      tabIndex="0"
                      aria-label="Ad Soyad"
                    />
                  </div>

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

                  {/* Confirm Password Input */}
                  <div className="mb-3 flex flex-col items-center">
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={handleConfirmPasswordChange}
                      placeholder="Şifre tekrar *"
                      disabled={isLoading}
                      className={`w-4/5 px-4 py-2 bg-gray-50 border rounded-md focus:outline-none focus:bg-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                        confirmPasswordError
                          ? "border-red-400 focus:border-red-400"
                          : "border-gray-200 focus:border-green-400"
                      }`}
                      style={{
                        boxShadow: "none",
                      }}
                      onFocus={(e) =>
                        (e.target.style.boxShadow = confirmPasswordError
                          ? "0 0 0 3px rgba(239, 68, 68, 0.2)"
                          : "0 0 0 3px rgba(34, 197, 94, 0.2)")
                      }
                      onBlur={(e) => (e.target.style.boxShadow = "none")}
                      required
                      tabIndex="0"
                      aria-label="Şifre tekrar"
                    />
                    {confirmPasswordError && (
                      <p className="text-red-500 text-xs mt-1 w-4/5 text-left">
                        {confirmPasswordError}
                      </p>
                    )}
                  </div>

                  {/* Signup Button */}
                  <div className="flex justify-center mb-3">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-4/5 bg-[rgb(0,128,0)] hover:bg-[rgb(0,100,0)] text-white font-semibold py-2 px-4 rounded-md transition-colors cursor-pointer focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      tabIndex="0"
                      aria-label="Kayıt ol"
                    >
                      {isLoading ? <LoadingSpinner /> : "Kayıt Ol"}
                    </button>
                  </div>

                  {/* Divider Line */}
                  <div className="w-4/5 mx-auto border-t border-gray-200 mb-3"></div>
                </form>

                {/* Login Link */}
                <div className="text-center mt-3">
                  <span className="text-gray-600 text-xs">
                    Zaten bir hesabınız var mı?{" "}
                  </span>
                  <button
                    onClick={handleLogin}
                    disabled={isLoading}
                    className="text-green-500 hover:text-green-600 text-sm font-normal focus:outline-none focus:underline cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    tabIndex="0"
                  >
                    Giriş Yap
                  </button>
                </div>
              </>
            ) : (
              // Verification Card
              <>
                {/* Title */}
                <div className="text-center mb-3">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    E-posta Doğrulama
                  </h1>
                  <p className="text-gray-600">
                    {searchParams.get("userId")
                      ? "Google hesabınızla kayıt işlemi tamamlandı. E-posta adresinize gönderilen 6 haneli doğrulama kodunu girin"
                      : "E-posta adresinize gönderilen 6 haneli doğrulama kodunu girin"}
                  </p>
                </div>

                {/* Timer Display */}
                {timeLeft > 0 ? (
                  <div className="text-center mb-3">
                    <p className="text-sm text-gray-600">
                      Kalan süre:{" "}
                      <span className="font-semibold text-green-600">
                        {formatTime(timeLeft)}
                      </span>
                    </p>
                  </div>
                ) : (
                  <div className="text-center mb-3">
                    <p className="text-sm text-red-600 font-semibold">
                      Doğrulama kodunuzun süresi doldu. Müşteri hizmetleri ile
                      iletişime geçin.
                    </p>
                  </div>
                )}

                {/* Error/Success Messages */}
                {error && (
                  <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-600 text-sm text-center">{error}</p>
                  </div>
                )}
                {success && (
                  <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-green-600 text-sm text-center">
                      {success}
                    </p>
                  </div>
                )}

                {/* Verification Form */}
                <form onSubmit={handleVerification}>
                  {/* Verification Code Input */}
                  <div className="mb-4 flex justify-center">
                    <div className="flex gap-2 w-4/5 justify-center">
                      {verificationCode.map((digit, index) => (
                        <input
                          key={index}
                          id={`code-input-${index}`}
                          type="text"
                          value={digit}
                          onChange={(e) =>
                            handleVerificationCodeChange(index, e.target.value)
                          }
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          disabled={isLoading || timeLeft <= 0}
                          maxLength="1"
                          className="w-12 h-12 text-center text-lg font-bold bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:border-green-400 focus:bg-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{
                            boxShadow: "none",
                          }}
                          onFocus={(e) =>
                            (e.target.style.boxShadow =
                              "0 0 0 3px rgba(34, 197, 94, 0.2)")
                          }
                          onBlur={(e) => (e.target.style.boxShadow = "none")}
                          tabIndex="0"
                          aria-label={`Doğrulama kodu ${index + 1}. hane`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Verify Button */}
                  <div className="flex justify-center mb-3">
                    <button
                      type="submit"
                      disabled={
                        isLoading ||
                        timeLeft <= 0 ||
                        verificationCode.join("").length !== 6
                      }
                      className="w-4/5 bg-[rgb(0,128,0)] hover:bg-[rgb(0,100,0)] text-white font-semibold py-2 px-4 rounded-md transition-colors cursor-pointer focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      tabIndex="0"
                      aria-label="Doğrula"
                    >
                      {isLoading ? <LoadingSpinner /> : "Doğrula"}
                    </button>
                  </div>

                  {/* Divider Line */}
                  <div className="w-4/5 mx-auto border-t border-gray-200 mb-3"></div>
                </form>

                {/* Back to Signup Link */}
                <div className="text-center mt-3">
                  {searchParams.get("userId") ? (
                    <button
                      onClick={() => navigate("/auth/login")}
                      disabled={isLoading}
                      className="text-green-500 hover:text-green-600 text-sm font-normal focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      tabIndex="0"
                    >
                      ← Giriş sayfasına dön
                    </button>
                  ) : (
                    <button
                      onClick={handleBackToSignup}
                      disabled={isLoading}
                      className="text-green-500 hover:text-green-600 text-sm font-normal focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      tabIndex="0"
                    >
                      ← Kayıt sayfasına dön
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Popup Spinner for Redirect */}
      <PopupSpinner
        isVisible={showRedirectSpinner}
        message="Giriş sayfasına yönlendiriliyorsunuz..."
      />
    </div>
  );
}

export default Signup;
