import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProfileSidebar } from "../context/ProfileSidebarContext";
import { useAuth } from "../context/AuthContext";
import Header from "../components/shared/Header";
import Footer from "../components/shared/Footer";
import ProfileMain from "../components/profile/ProfileMain";
import MyFriends from "../components/profile/MyFriends";
import MyFavoritePitches from "../components/profile/MyFavoritePitches";

import MyListings from "../components/profile/MyListings";
import MyReservations from "../components/profile/MyReservations";
import MyTournaments from "../components/profile/MyTournaments";
import Messages from "../components/profile/Messages";
import MyComments from "../components/profile/MyComments";
import Invitations from "../components/profile/Invitations";
import Settings from "../components/profile/Settings";
import AddFriends from "../components/profile/AddFriends";
import BlockedUsers from "../components/profile/BlockedUsers";

function ProfilePage() {
  const navigate = useNavigate();
  const { activeSection } = useProfileSidebar();
  const { user, loading, isAuthenticated, isLoggingOut } = useAuth();

  // Scroll to top when component mounts or activeSection changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeSection]);

  // Redirect to home when not authenticated and not logging out
  useEffect(() => {
    if (!loading && !isAuthenticated && !user && !isLoggingOut) {
      navigate("/");
    }
  }, [isAuthenticated, user, loading, isLoggingOut, navigate]);

  // Logout state
  if (isLoggingOut) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Çıkış yapılıyor...</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Profil yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Not authenticated state - redirect to home instead of showing login prompt
  if (!isAuthenticated || !user) {
    // Redirect to home page instead of showing login screen
    navigate("/");
    return null;
  }

  const renderMainContent = () => {
    switch (activeSection) {
      case "profile":
        return <ProfileMain user={user} />;
      case "friends":
        return <MyFriends user={user} />;
      case "add-friends":
        return <AddFriends user={user} />;
      case "blocked-users":
        return <BlockedUsers user={user} />;
      case "favorite-pitches":
        return <MyFavoritePitches />;

      case "listings":
        return <MyListings />;
      case "reservations":
        return <MyReservations user={user} />;
      case "tournaments":
        return <MyTournaments user={user} />;
      case "messages":
        return <Messages user={user} />;
      case "comments":
        return <MyComments user={user} />;
      case "invitations":
        return <Invitations user={user} />;
      case "settings":
        return <Settings user={user} />;
      default:
        return <ProfileMain user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <Header />

      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 max-w-none lg:max-w-7xl lg:mx-auto">
        <div className="flex flex-col w-full">
          {/* Main Content */}
          <div className="flex-1 w-full">{renderMainContent()}</div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default ProfilePage;
