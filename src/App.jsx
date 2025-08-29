import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ProfileSidebarProvider } from "./context/ProfileSidebarContext";
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
import UserProfilePage from "./pages/UserProfilePage";
import FollowersPage from "./pages/FollowersPage";
import FollowingPage from "./pages/FollowingPage";
import AdvertDetailPage from "./pages/AdvertDetailPage";
import PrivateInvitePage from "./pages/PrivateInvitePage";
import AnimatedProfileSidebar from "./components/profile/AnimatedProfileSidebar";
import ArchivedUserPopup from "./components/shared/ArchivedUserPopup";
import GlobalNotification from "./components/shared/GlobalNotification";

function AppContent() {
  const location = useLocation();
  const isAuthPage = location.pathname.startsWith("/auth");

  // Scroll to top whenever location changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className={`min-h-screen bg-gray-50 ${isAuthPage ? "" : "pt-16"}`}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/matches" element={<MatchesPage />} />
        <Route path="/reservation" element={<ReservationPage />} />
        <Route path="/pitch-detail/:pitchId" element={<PitchDetailPage />} />
        <Route path="/advert-detail/:advertId" element={<AdvertDetailPage />} />
        <Route path="/private-invite" element={<PrivateInvitePage />} />
        <Route path="/tournaments" element={<TournamentsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/followers" element={<FollowersPage />} />
        <Route path="/following" element={<FollowingPage />} />
        <Route path="/user/:userId" element={<UserProfilePage />} />
        <Route path="/auth/google-failure" element={<GoogleFailure />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/signup" element={<Signup />} />
        <Route path="/auth/forgot-password" element={<ForgotPassword />} />
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
      <AnimatedProfileSidebar />
      <ArchivedUserPopup />
      <GlobalNotification />
    </div>
  );
}

function App() {
  return (
    <ProfileSidebarProvider>
      <AppContent />
    </ProfileSidebarProvider>
  );
}

export default App;
