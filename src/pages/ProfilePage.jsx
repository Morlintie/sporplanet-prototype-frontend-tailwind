import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../components/shared/Header";
import Footer from "../components/shared/Footer";
import ProfileSidebar from "../components/profile/ProfileSidebar";
import ProfileMain from "../components/profile/ProfileMain";
import MyListings from "../components/profile/MyListings";
import MyReservations from "../components/profile/MyReservations";
import MyTournaments from "../components/profile/MyTournaments";
import Messages from "../components/profile/Messages";
import MyComments from "../components/profile/MyComments";
import Invitations from "../components/profile/Invitations";
import Settings from "../components/profile/Settings";

function ProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState("profile");

  // Check URL query parameter for section
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const section = urlParams.get('section');
    if (section && ['profile', 'listings', 'reservations', 'tournaments', 'messages', 'comments', 'invitations', 'settings'].includes(section)) {
      setActiveSection(section);
    }
  }, [location.search]);

  // Mock user data - in real app this would come from context/API
  const user = {
    name: "Ahmet Yılmaz",
    email: "ahmet.yilmaz@example.com",
    profilePicture: "https://cdn.example.com/u/ahmet.yilmaz.jpg",
    position: "Sağ Kanat",
    jerseyNumber: "7",
    age: "19",
    footPreference: "Sağ Ayak",
    followers: 45,
    following: 32,
    totalMatches: 28,
    listedMatches: 12,
    participatedMatches: 16,
    totalReservations: 8,
    totalTournaments: 3
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  const renderMainContent = () => {
    switch (activeSection) {
      case "profile":
        return <ProfileMain user={user} />;
      case "listings":
        return <MyListings user={user} />;
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
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <ProfileSidebar 
              activeSection={activeSection}
              onSectionChange={handleSectionChange}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {renderMainContent()}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default ProfilePage; 