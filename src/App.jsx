import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Home Route */}
          <Route
            path="/"
            element={
              <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Welcome to SporPlanet
                  </h1>
                  <p className="text-lg text-gray-600">
                    Your Sports Universe Awaits
                  </p>
                </div>
              </div>
            }
          />

          {/* Login Route */}
          <Route path="/login" element={<Login />} />

          {/* Signup Route */}
          <Route path="/signup" element={<Signup />} />

          {/* Forgot Password Route */}
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* 404 Not Found Route */}
          <Route
            path="*"
            element={
              <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-red-600 mb-4">
                    404 - Page Not Found
                  </h1>
                  <p className="text-lg text-gray-600">
                    The page you're looking for doesn't exist
                  </p>
                </div>
              </div>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
