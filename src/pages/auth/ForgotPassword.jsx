import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
    if (message.includes("Your verification email has been sent")) {
      return "Doğrulama e-postası gönderildi! E-posta kutunuzu kontrol edin.";
    }
    if (message.includes("Your password has been successfully changed")) {
      return "Şifreniz başarıyla değiştirildi! Yeni şifrenizle giriş yapabilirsiniz.";
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
    if (message.includes("Please provide required data")) {
      return "Lütfen gerekli bilgileri sağlayın.";
    }
    if (message.includes("Please provide all requested data")) {
      return "Lütfen tüm gerekli bilgileri sağlayın.";
    }
    if (message.includes("Both passwords have to match")) {
      return "Şifreler birbiriyle eşleşmelidir.";
    }
    if (message.includes("New password cannot be same as old password")) {
      return "Yeni şifre eski şifrenizle aynı olamaz.";
    }
    if (
      message.includes("You are not authorized") ||
      message.includes("not authorized")
    ) {
      return "Doğrulama kodu yanlış veya süresi dolmuş.";
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

    // If no specific translation found, return a generic error message
    return "Bir hata oluştu. Lütfen tekrar deneyin.";
  }
};

function ForgotPassword() {
  const navigate = useNavigate();

  // Step management
  const [currentStep, setCurrentStep] = useState("email"); // email, verification, password

  // Email step state
  const [email, setEmail] = useState("");

  // Verification step state
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
  const [paramId, setParamId] = useState("");

  // Password reset step state
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showRedirectSpinner, setShowRedirectSpinner] = useState(false);

  // Validation state
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  // Countdown timer effect
  useEffect(() => {
    if (currentStep === "verification" && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentStep, timeLeft]);

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

  const handleNewPasswordChange = (e) => {
    const value = e.target.value;
    setNewPassword(value);
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
    if (confirmNewPassword && value !== confirmNewPassword) {
      setConfirmPasswordError("Şifreler eşleşmiyor");
    } else {
      setConfirmPasswordError("");
    }
  };

  const handleConfirmNewPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmNewPassword(value);
    setError("");

    if (value && value !== newPassword) {
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

  const handleSendCode = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    // Check for validation errors
    if (emailError) {
      setError("Lütfen geçerli bir e-posta adresi girin");
      setIsLoading(false);
      return;
    }

    // Final validation check
    if (!validateEmail(email)) {
      setEmailError("Geçerli bir e-posta adresi girin");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/v1/auth/forgot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || "Forgot password failed");
      }

      // Success - show verification card
      setUserId(data.userId);
      setSuccess(translateMessage(data.msg, true));
      setCurrentStep("verification");
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
      setError("Doğrulama kodunuzun süresi doldu. Lütfen tekrar deneyin.");
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
      const response = await fetch("/api/v1/auth/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          code: codeString,
          userId: userId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || "Verification failed");
      }

      // Success - show password reset form
      setParamId(data.param);
      setSuccess("Doğrulama başarılı! Şimdi yeni şifrenizi belirleyin.");
      setCurrentStep("password");
    } catch (err) {
      setError(translateMessage(err.message, false));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    // Check for validation errors
    if (passwordError || confirmPasswordError) {
      setError("Lütfen tüm alanları doğru şekilde doldurun");
      setIsLoading(false);
      return;
    }

    // Final validation check
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      setPasswordError("Şifre gereksinimlerini karşılamıyor");
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setConfirmPasswordError("Şifreler eşleşmiyor");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/v1/auth/reset/${paramId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          newPassword: newPassword,
          newPasswordBackup: confirmNewPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || "Password reset failed");
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

  const handleBackToEmail = () => {
    setCurrentStep("email");
    setVerificationCode(["", "", "", "", "", ""]);
    setError("");
    setSuccess("");
    setTimeLeft(300);
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

            {currentStep === "email" && (
              // Email Step
              <>
                {/* Title */}
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Şifreni Sıfırla
                  </h1>
                  <p className="text-gray-600 text-sm px-4">
                    E-posta adresinizi girin, size güvenli bir doğrulama kodu
                    göndereceğiz.
                  </p>
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

                {/* Forgot Password Form */}
                <form onSubmit={handleSendCode}>
                  {/* Email Input */}
                  <div className="mb-4 flex flex-col items-center">
                    <input
                      type="email"
                      value={email}
                      onChange={handleEmailChange}
                      placeholder="E-posta Adresiniz"
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
                      aria-label="E-posta adresiniz"
                    />
                    {emailError && (
                      <p className="text-red-500 text-xs mt-1 w-4/5 text-left">
                        {emailError}
                      </p>
                    )}
                  </div>

                  {/* Send Code Button */}
                  <div className="flex justify-center mb-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-3/4 bg-[rgb(0,128,0)] hover:bg-[rgb(0,100,0)] text-white font-semibold py-2 px-4 rounded-md transition-colors cursor-pointer focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      tabIndex="0"
                      aria-label="Doğrulama kodu gönder"
                    >
                      {isLoading ? <LoadingSpinner /> : "Doğrulama Kodu Gönder"}
                    </button>
                  </div>

                  {/* Divider Line */}
                  <div className="w-4/5 mx-auto border-t border-gray-200 mb-4"></div>
                </form>

                {/* Login Link */}
                <div className="text-center mt-4">
                  <span className="text-gray-600 text-xs">
                    Şifreni hatırladın mı?{" "}
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
            )}

            {currentStep === "verification" && (
              // Verification Step (Same as Signup)
              <>
                {/* Title */}
                <div className="text-center mb-3">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    E-posta Doğrulama
                  </h1>
                  <p className="text-gray-600">
                    E-posta adresinize gönderilen 6 haneli doğrulama kodunu
                    girin
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
                      Doğrulama kodunuzun süresi doldu. Lütfen tekrar deneyin.
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
                      className="w-3/4 bg-[rgb(0,128,0)] hover:bg-[rgb(0,100,0)] text-white font-semibold py-2 px-4 rounded-md transition-colors cursor-pointer focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      tabIndex="0"
                      aria-label="Doğrula"
                    >
                      {isLoading ? <LoadingSpinner /> : "Doğrula"}
                    </button>
                  </div>

                  {/* Divider Line */}
                  <div className="w-4/5 mx-auto border-t border-gray-200 mb-3"></div>
                </form>

                {/* Back to Email Link */}
                <div className="text-center mt-3">
                  <button
                    onClick={handleBackToEmail}
                    disabled={isLoading}
                    className="text-green-500 hover:text-green-600 text-sm font-normal focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    tabIndex="0"
                  >
                    ← E-posta adresini değiştir
                  </button>
                </div>
              </>
            )}

            {currentStep === "password" && (
              // Password Reset Step
              <>
                {/* Title */}
                <div className="text-center mb-3">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Yeni Şifre Belirle
                  </h1>
                  <p className="text-gray-600">
                    Hesabınız için yeni bir şifre belirleyin
                  </p>
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

                {/* Password Reset Form */}
                <form onSubmit={handlePasswordReset}>
                  {/* New Password Input */}
                  <div className="mb-3 flex flex-col items-center">
                    <input
                      type="password"
                      value={newPassword}
                      onChange={handleNewPasswordChange}
                      placeholder="Yeni Şifre *"
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
                      aria-label="Yeni şifre"
                    />
                    {passwordError && (
                      <p className="text-red-500 text-xs mt-1 w-4/5 text-left">
                        {passwordError}
                      </p>
                    )}
                  </div>

                  {/* Confirm New Password Input */}
                  <div className="mb-3 flex flex-col items-center">
                    <input
                      type="password"
                      value={confirmNewPassword}
                      onChange={handleConfirmNewPasswordChange}
                      placeholder="Yeni Şifre Tekrar *"
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
                      aria-label="Yeni şifre tekrar"
                    />
                    {confirmPasswordError && (
                      <p className="text-red-500 text-xs mt-1 w-4/5 text-left">
                        {confirmPasswordError}
                      </p>
                    )}
                  </div>

                  {/* Reset Password Button */}
                  <div className="flex justify-center mb-3">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-3/4 bg-[rgb(0,128,0)] hover:bg-[rgb(0,100,0)] text-white font-semibold py-2 px-4 rounded-md transition-colors cursor-pointer focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      tabIndex="0"
                      aria-label="Şifreyi değiştir"
                    >
                      {isLoading ? <LoadingSpinner /> : "Şifreyi Değiştir"}
                    </button>
                  </div>

                  {/* Divider Line */}
                  <div className="w-4/5 mx-auto border-t border-gray-200 mb-3"></div>
                </form>

                {/* Login Link */}
                <div className="text-center mt-3">
                  <button
                    onClick={handleLogin}
                    disabled={isLoading}
                    className="text-green-500 hover:text-green-600 text-sm font-normal focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    tabIndex="0"
                  >
                    ← Giriş sayfasına dön
                  </button>
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

export default ForgotPassword;
