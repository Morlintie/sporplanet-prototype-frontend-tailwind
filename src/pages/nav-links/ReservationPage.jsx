import { useState } from "react";
import Header from "../../components/shared/Header";
import Footer from "../../components/shared/Footer";
import ReservationHero from "../../components/reservation/ReservationHero";
import ReservationFilters from "../../components/reservation/ReservationFilters";
import PitchList from "../../components/reservation/PitchList";
import FeaturesSection from "../../components/reservation/FeaturesSection";

function ReservationPage() {
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  // Mock data for pitches
  const pitches = [
    {
      id: 1,
      name: "Beşiktaş Spor Kompleksi",
      location: "Beşiktaş, İstanbul",
      price: 200,
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=250&fit=crop",
      features: ["Halı Saha", "Işıklandırma", "Soyunma Odası", "Otopark"],
      availableHours: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"]
    },
    {
      id: 2,
      name: "Kadıköy Futbol Sahası",
      location: "Kadıköy, İstanbul",
      price: 180,
      rating: 4.6,
      image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=250&fit=crop",
      features: ["Halı Saha", "Işıklandırma", "Soyunma Odası"],
      availableHours: ["08:00", "09:00", "10:00", "13:00", "14:00", "15:00", "16:00"]
    },
    {
      id: 3,
      name: "Şişli Premium Saha",
      location: "Şişli, İstanbul",
      price: 300,
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400&h=250&fit=crop",
      features: ["Halı Saha", "Işıklandırma", "Soyunma Odası", "Otopark", "Kafeterya"],
      availableHours: ["10:00", "11:00", "12:00", "15:00", "16:00", "17:00"]
    }
  ];

  const handleReservation = (pitchId, time) => {
    console.log(`Rezervasyon yapıldı: Saha ${pitchId}, Saat ${time}`);
    // Reservation logic will be implemented later
  };

  const handleSearch = () => {
    console.log("Arama yapıldı:", { selectedCity, selectedDate, selectedTime });
    // Search logic will be implemented later
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <ReservationHero />
      
      <ReservationFilters
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        selectedTime={selectedTime}
        setSelectedTime={setSelectedTime}
        onSearch={handleSearch}
      />
      
      <PitchList
        pitches={pitches}
        onReservation={handleReservation}
      />
      
      <FeaturesSection />
      
      <Footer />
    </div>
  );
}

export default ReservationPage; 