import { createContext, useContext, useState, useEffect } from "react";

const FavoritesContext = createContext();

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
};

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  // Mock favori sahalar - gerçek uygulamada API'den gelecek
  const mockFavorites = [
    {
      id: "0000000000000000000017e1",
      name: "Bağcılar Merkez",
      location: {
        address: {
          street: "Bağcılar Merkez Cd. No:27",
          neighborhood: "Yıldız",
          city: "İstanbul",
          district: "Bağcılar",
          postalCode: "34683",
          country: "Turkey"
        }
      },
      rating: {
        averageRating: 4.9,
        totalReviews: 105
      },
      pricing: {
        hourlyRate: 1800,
        currency: "TRY"
      },
      specifications: {
        surfaceType: "artificial_turf",
        isIndoor: false,
        hasLighting: true
      },
      facilities: {
        changingRooms: true,
        showers: true,
        parking: true,
        shoeRenting: true,
        camera: false,
        otherAmenities: ["cafe", "wifi"]
      },
      addedAt: new Date("2024-01-15"),
      category: "Halı Saha"
    },
    {
      id: "0000000000000000000017db",
      name: "Pendik Marina",
      location: {
        address: {
          street: "Pendik Marina Cd. No:32",
          neighborhood: "Barbaros",
          city: "İstanbul",
          district: "Pendik",
          postalCode: "34715",
          country: "Turkey"
        }
      },
      rating: {
        averageRating: 3.3,
        totalReviews: 250
      },
      pricing: {
        hourlyRate: 1300,
        currency: "TRY"
      },
      specifications: {
        surfaceType: "natural_grass",
        isIndoor: false,
        hasLighting: true
      },
      facilities: {
        changingRooms: true,
        showers: true,
        parking: true,
        shoeRenting: false,
        camera: false,
        otherAmenities: ["cafe", "wifi"]
      },
      addedAt: new Date("2024-01-10"),
      category: "Çim Saha"
    }
  ];

  useEffect(() => {
    // Sayfa yüklendiğinde favori sahaları getir
    // Gerçek uygulamada bu API çağrısı olacak
    setFavorites(mockFavorites);
  }, []);

  const addToFavorites = async (pitch) => {
    setLoading(true);
    try {
      // Backend API call would go here
      // await addPitchToFavorites(pitch.id);
      
      const newFavorite = {
        ...pitch,
        addedAt: new Date(),
        category: pitch.specifications?.surfaceType === "natural_grass" ? "Çim Saha" : "Halı Saha"
      };
      
      setFavorites(prev => [...prev, newFavorite]);
      return true;
    } catch (error) {
      console.error("Error adding to favorites:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeFromFavorites = async (pitchId) => {
    setLoading(true);
    try {
      // Backend API call would go here
      // await removePitchFromFavorites(pitchId);
      
      setFavorites(prev => prev.filter(fav => fav.id !== pitchId));
      return true;
    } catch (error) {
      console.error("Error removing from favorites:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const isFavorite = (pitchId) => {
    return favorites.some(fav => fav.id === pitchId);
  };

  const toggleFavorite = async (pitch) => {
    if (isFavorite(pitch.id)) {
      return await removeFromFavorites(pitch.id);
    } else {
      return await addToFavorites(pitch);
    }
  };

  const value = {
    favorites,
    loading,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};