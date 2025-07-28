import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login-background.css";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSendCode = (e) => {
    e.preventDefault();
    // Send verification code logic will be added later
    console.log("Send verification code clicked", { email });
  };

  const handleLogin = () => {
    navigate("/login");
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
                className="w-14 h-14 flex items-center justify-center rounded-full cursor-pointer"
                tabIndex="0"
                aria-label="Ana sayfaya git"
              >
                <img
                  src="https://res.cloudinary.com/dppjlhdth/image/upload/v1749137675/SporPlanet_Transparent_Logo_Planet_oqmmcp.png"
                  alt="SporPlanet Logo"
                  className="w-14 h-14 object-contain"
                />
              </button>
            </div>

            {/* Title */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Şifreni Sıfırla
              </h1>
              <p className="text-gray-600 text-sm px-4">
                E-posta adresinizi girin, size güvenli bir doğrulama kodu göndereceğiz.
              </p>
            </div>

            {/* Forgot Password Form */}
            <form onSubmit={handleSendCode}>
              {/* Email Input */}
              <div className="mb-4 flex justify-center">
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="E-posta Adresiniz"
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
                  aria-label="E-posta adresiniz"
                />
              </div>

              {/* Send Code Button */}
              <div className="flex justify-center mb-4">
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
                  aria-label="Doğrulama kodu gönder"
                >
                  Doğrulama Kodu Gönder
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
                className="text-green-500 hover:text-green-600 text-sm font-normal focus:outline-none focus:underline cursor-pointer"
                tabIndex="0"
              >
                Giriş Yap
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword; 