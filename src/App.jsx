import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ReservationPage from "./pages/nav-links/ReservationPage";
import PitchDetailPage from "./pages/PitchDetailPage";
import MatchesPage from "./pages/nav-links/MatchesPage";
import TournamentsPage from "./pages/nav-links/TournamentsPage";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import GoogleFailure from "./pages/auth/GoogleFailure";
import ProfilePage from "./pages/ProfilePage";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public Routes - No Authentication Required */}
          <Route path="/" element={<HomePage />} />
          <Route path="/matches" element={<MatchesPage />} />
          <Route path="/reservation" element={<ReservationPage />} />
          <Route path="/pitch-detail/:pitchId" element={<PitchDetailPage />} />
          <Route path="/tournaments" element={<TournamentsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          {/* Protected Routes - Require Authentication */}

          {/* Public Auth Routes */}
          <Route path="/auth/google-failure" element={<GoogleFailure />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/signup" element={<Signup />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />

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
