import { useState } from "react";
import "../styles/login-background.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleGoogleLogin = () => {
    // Google login logic will be added later
    console.log("Google login clicked");
  };

  const handleLogin = (e) => {
    e.preventDefault();
    // Login logic will be added later
    console.log("Login clicked", { email, password });
  };

  const handleForgotPassword = () => {
    // Forgot password logic will be added later
    console.log("Forgot password clicked");
  };

  const handleCreateAccount = () => {
    // Create account navigation will be added later
    console.log("Create account clicked");
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
              <div className="w-14 h-14 flex items-center justify-center">
                <img
                  src="https://res.cloudinary.com/dppjlhdth/image/upload/v1749137675/SporPlanet_Transparent_Logo_Planet_oqmmcp.png"
                  alt="SporPlanet Logo"
                  className="w-14 h-14 object-contain"
                />
              </div>
            </div>

            {/* Title */}
            <div className="text-center mb-3">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Giriş Yap
              </h1>
              <p className="text-gray-600">Hesabınıza giriş yapın</p>
            </div>

            {/* Google Login Button */}
            <button
              onClick={handleGoogleLogin}
              className="w-4/5 mx-auto flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-md py-2 px-4 mb-3 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
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
              <div className="mb-3 flex justify-center">
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="E-posta adresi *"
                  className="w-4/5 px-4 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:border-green-400 focus:bg-white transition-all duration-200"
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
                  aria-label="E-posta adresi"
                />
              </div>

              {/* Password Input */}
              <div className="mb-3 flex justify-center">
                <input
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="Şifre *"
                  className="w-4/5 px-4 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:border-green-400 focus:bg-white transition-all duration-200"
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
                  aria-label="Şifre"
                />
              </div>

              {/* Forgot Password Link */}
              <div className="text-right mb-3">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-green-500 hover:text-green-600 text-sm font-normal focus:outline-none focus:underline cursor-pointer"
                  tabIndex="0"
                >
                  Şifremi Unuttum
                </button>
              </div>

              {/* Login Button */}
              <div className="flex justify-center mb-3">
                <button
                  type="submit"
                  className="w-4/5 text-white font-semibold py-2 px-4 rounded-md transition-colors focus:outline-none cursor-pointer"
                  style={{
                    backgroundColor: "rgb(0, 128, 0)",
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.backgroundColor = "rgb(0, 100, 0)")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.backgroundColor = "rgb(0, 128, 0)")
                  }
                  tabIndex="0"
                  aria-label="Giriş yap"
                >
                  Giriş Yap
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
                className="text-green-500 hover:text-green-600 text-sm font-normal focus:outline-none focus:underline cursor-pointer"
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
