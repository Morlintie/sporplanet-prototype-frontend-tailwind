import { useState } from "react";
import Header from "../../components/shared/Header";
import Footer from "../../components/shared/Footer";
import MatchesHero from "../../components/matches/MatchesHero";
import MatchesList from "../../components/matches/MatchesList";
import CreateAdModal from "../../components/matches/CreateAdModal";

function MatchesPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Dummy match data
  const matches = [
    // Rakip Takım İlanları - Takım tamamlanmış, rakip arıyor
    {
      id: 1,
      title: "İleri Seviye 5v5 Maçı",
      date: "Bugün, 19:00",
      location: "Özdemir Halı Saha",
      players: "5/5 oyuncu",
      completion: 100,
      status: "available",
      type: "team-ads",
      pricePerPerson: 25,
      difficulty: "İleri Seviye",
      description: "Takımımız tam kadro. Zorlu bir maç için rakip takım arıyoruz."
    },
    {
      id: 2,
      title: "Profesyonel 11v11 Maçı",
      date: "Cumartesi, 14:00",
      location: "Cennet Park Saha",
      players: "11/11 oyuncu",
      completion: 100,
      status: "available",
      type: "team-ads",
      pricePerPerson: 40,
      difficulty: "Profesyonel",
      description: "Deneyimli takımımız kaliteli rakip arıyor."
    },
    {
      id: 3,
      title: "Orta Seviye 7v7 Maçı",
      date: "Pazar, 16:00",
      location: "Spor Plus Saha",
      players: "7/7 oyuncu",
      completion: 100,
      status: "available",
      type: "team-ads",
      pricePerPerson: 30,
      difficulty: "Orta Seviye",
      description: "Keyifli bir maç için orta seviye takım aranıyor."
    },
    
    // Oyuncu İlanları - Takıma oyuncu arayan ilanlar
    {
      id: 4,
      title: "5v5 Takımına Oyuncu",
      date: "Bugün, 20:00",
      location: "Özdemir Halı Saha",
      players: "3/5 oyuncu",
      completion: 60,
      status: "available",
      type: "player-ads",
      pricePerPerson: 25,
      difficulty: "Başlangıç",
      description: "Arkadaş canlısı takımımıza 2 oyuncu arıyoruz."
    },
    {
      id: 5,
      title: "11v11 Kaleci Aranıyor",
      date: "Cumartesi, 10:00",
      location: "Futbol Akademi",
      players: "10/11 oyuncu",
      completion: 91,
      status: "available",
      type: "player-ads",
      pricePerPerson: 35,
      difficulty: "Orta Seviye",
      description: "Sadece kaleci arıyoruz. Diğer pozisyonlar dolu."
    },
    {
      id: 6,
      title: "7v7 Hücum Oyuncusu",
      date: "Pazar, 18:00",
      location: "Dream Saha",
      players: "5/7 oyuncu",
      completion: 71,
      status: "available",
      type: "player-ads",
      pricePerPerson: 28,
      difficulty: "İleri Seviye",
      description: "Hücum hattına 2 teknik oyuncu arıyoruz."
    },
    {
      id: 7,
      title: "Antrenman Grubu",
      date: "Pazartesi, 19:30",
      location: "Spor Center",
      players: "8/12 oyuncu",
      completion: 67,
      status: "available",
      type: "player-ads",
      pricePerPerson: 20,
      difficulty: "Her Seviye",
      description: "Haftalık antrenman grubuna katılmak isteyenler."
    },
    {
      id: 8,
      title: "8v8 Dostluk Maçı",
      date: "Cumartesi, 15:00",
      location: "Yeşil Alan Saha",
      players: "8/8 oyuncu",
      completion: 100,
      status: "full",
      type: "player-ads",
      pricePerPerson: 22,
      difficulty: "Orta Seviye",
      description: "DOLU - Dostluk maçımız için liste tamamlandı."
    }
  ];

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleJoinMatch = (matchId) => {
    // Handle match join logic
    console.log("Joining match:", matchId);
  };

  const handleCreateAdClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmitAd = (formData) => {
    // TODO: Backend'e gönderme işlemi burada yapılacak
    console.log("New ad data:", formData);
    // Geçici olarak console'a yazdırıyoruz
  };

  // Filter matches based on active filter
  const filteredMatches = matches.filter(match => {
    if (activeFilter === "all") return true;
    return match.type === activeFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <MatchesHero />

      <MatchesList 
        matches={filteredMatches}
        onJoinMatch={handleJoinMatch}
        activeFilter={activeFilter}
        searchQuery={searchQuery}
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearchChange}
        onCreateAdClick={handleCreateAdClick}
      />

      <CreateAdModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitAd}
      />
      
      <Footer />
    </div>
  );
}

export default MatchesPage;