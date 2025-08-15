import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/shared/Header";
import Footer from "../components/shared/Footer";
import AdvertInfo from "../components/advert-detail/AdvertInfo";
import MessagingSection from "../components/advert-detail/MessagingSection";

function AdvertDetailPage() {
  const { advertId } = useParams();
  const [advert, setAdvert] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Scroll to top function
  const scrollToTop = () => {
    // Multiple methods to ensure scroll to top works
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // Force scroll position multiple times
    setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 0);
    
    setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 50);
  };

  // Disable browser scroll restoration
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    
    // Force scroll to top immediately on page load/refresh
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // Multiple aggressive scroll attempts
    const forceScrollTop = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };
    
    forceScrollTop();
    setTimeout(forceScrollTop, 10);
    setTimeout(forceScrollTop, 50);
    setTimeout(forceScrollTop, 100);
    setTimeout(forceScrollTop, 200);
    
    return () => {
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'auto';
      }
    };
  }, []);

  // Scroll to top and refresh data when component mounts or advertId changes
  useEffect(() => {
    // Clear previous data to force fresh load
    setAdvert(null);
    setMessages([]);
    setLoading(true);
    setError(null);
    
    // Immediate scroll to top
    scrollToTop();
  }, [advertId]); // Depend on advertId to refresh when URL changes

  // Prevent scrolling when loading state changes
  useEffect(() => {
    if (!loading) {
      // When loading completes, ensure we're at the top
      scrollToTop();
    }
  }, [loading]);

  // Additional scroll control for page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // When page becomes visible again, scroll to top
        setTimeout(() => scrollToTop(), 100);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Helper function to map sender IDs to user information
  const enrichMessagesWithUserInfo = (messages, advert) => {
    if (!messages) return messages;
    
    // Create a map of user IDs to user information
    const userMap = new Map();
    
    // Add creator to user map (with null check)
    if (advert && advert.createdBy && advert.createdBy._id) {
      userMap.set(advert.createdBy._id, advert.createdBy);
    }
    
    // Add all participants to user map (with null checks)
    if (advert && advert.participants && Array.isArray(advert.participants)) {
      advert.participants.forEach(participant => {
        if (participant.user && participant.user._id) {
          userMap.set(participant.user._id, participant.user);
        }
      });
    }
    
    // Add waiting list users to user map (with null checks)
    if (advert && advert.waitingList && Array.isArray(advert.waitingList)) {
      advert.waitingList.forEach(waitingUser => {
        if (waitingUser.user && waitingUser.user._id) {
          userMap.set(waitingUser.user._id, waitingUser.user);
        }
      });
    }
    
    // Mock user data for message senders (since they might not be in participants)
    const mockUsers = {
      "68347987b024a2d8571443b2": {
        _id: "68347987b024a2d8571443b2",
        name: "Ahmet Yılmaz",
        profilePicture: "https://via.placeholder.com/32/FF5722/white?text=AY"
      },
      "6841e708222bba20673cc337": {
        _id: "6841e708222bba20673cc337",
        name: "Mehmet Kaya",
        profilePicture: "https://via.placeholder.com/32/2196F3/white?text=MK"
      },
      "6841e844222bba20673cc339": {
        _id: "6841e844222bba20673cc339",
        name: "Ali Demir",
        profilePicture: "https://via.placeholder.com/32/4CAF50/white?text=AD"
      },
      "6846f236f95a3b7499dfd98b": {
        _id: "6846f236f95a3b7499dfd98b",
        name: "Fatma Özkan",
        profilePicture: "https://via.placeholder.com/32/E91E63/white?text=FO"
      },
      "688890cba69689a3ca2dd938": {
        _id: "688890cba69689a3ca2dd938",
        name: "Emre Şahin",
        profilePicture: "https://via.placeholder.com/32/9C27B0/white?text=ES"
      },
      "688892f9a69689a3ca2dd943": {
        _id: "688892f9a69689a3ca2dd943",
        name: "Zeynep Arslan",
        profilePicture: "https://via.placeholder.com/32/FF9800/white?text=ZA"
      },
      "68889962a69689a3ca2dd951": {
        _id: "68889962a69689a3ca2dd951",
        name: "Burak Çelik",
        profilePicture: "https://via.placeholder.com/32/607D8B/white?text=BC"
      },
      "6888be8982a459125acd4d42": {
        _id: "6888be8982a459125acd4d42",
        name: "Ayşe Güler",
        profilePicture: "https://via.placeholder.com/32/795548/white?text=AG"
      },
      "687243c690c09520e98cafd2": {
        _id: "687243c690c09520e98cafd2",
        name: "Oğuz Kaan",
        profilePicture: "https://via.placeholder.com/32/3F51B5/white?text=OK"
      },
      "6846df07e810518fb9e60c72": {
        _id: "6846df07e810518fb9e60c72",
        name: "Selin Yıldız",
        profilePicture: "https://via.placeholder.com/32/009688/white?text=SY"
      },
      "686e61f70d43f60e09a66ebe": {
        _id: "686e61f70d43f60e09a66ebe",
        name: "Hasan Polat",
        profilePicture: "https://via.placeholder.com/32/8BC34A/white?text=HP"
      },
      "68888d16a69689a3ca2dd931": {
        _id: "68888d16a69689a3ca2dd931",
        name: "Deniz Akar",
        profilePicture: "https://via.placeholder.com/32/CDDC39/white?text=DA"
      },
      "6888bf1f82a459125acd4d47": {
        _id: "6888bf1f82a459125acd4d47",
        name: "Murat Doğan",
        profilePicture: "https://via.placeholder.com/32/FFC107/white?text=MD"
      }
    };
    
    // Add mock users to user map
    Object.values(mockUsers).forEach(user => {
      userMap.set(user._id, user);
    });
    
    // Enrich messages with user information
    return messages.map(message => ({
      ...message,
      senderInfo: userMap.get(message.sender) || {
        _id: message.sender,
        name: "Bilinmeyen Kullanıcı",
        profilePicture: "https://via.placeholder.com/32/9E9E9E/white?text=?"
      }
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch advert data from backend API with cache-busting
        const advertResponse = await fetch(`/api/v1/advert/${advertId}?t=${Date.now()}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        if (!advertResponse.ok) {
          if (advertResponse.status === 404) {
            throw new Error('Advert not found');
          }
          throw new Error(`Backend error: ${advertResponse.status}`);
        }
        
        const advertData = await advertResponse.json();
        const foundAdvert = advertData.advert || advertData;
        
        // Fetch messages data from mock file
        const messagesResponse = await fetch('/advert_chat_messages.mock.50.json');
        if (!messagesResponse.ok) {
          throw new Error('Failed to fetch messages data');
        }
        const messagesData = await messagesResponse.json();
        
        // Filter messages for this specific advert
        const advertMessages = messagesData.filter(message => message.advert === advertId);
        
        // TEMPORARY: If no messages found, show first few messages for debugging
        if (advertMessages.length === 0) {
          // For debugging, use first 5 messages
          const debugMessages = messagesData.slice(0, 5);
          const enrichedDebugMessages = enrichMessagesWithUserInfo(debugMessages, foundAdvert);
          setAdvert(foundAdvert);
          setMessages(enrichedDebugMessages);
          setLoading(false);
          return;
        }
        
        // Enrich messages with user information
        const enrichedMessages = enrichMessagesWithUserInfo(advertMessages, foundAdvert);
        
        setAdvert(foundAdvert);
        setMessages(enrichedMessages);
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (advertId) {
      fetchData();
    }
  }, [advertId]);

  const handleSendMessage = async (messageData) => {
    try {
      // Simulate message sending with mock data
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      
      const newMessage = {
        advert: advertId,
        sender: "current-user-id", // This would be the current user's ID
        type: messageData.type,
        content: messageData.content,
        notSeenBy: [],
        isDeleted: false,
        archived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        attachments: messageData.attachments,
        senderInfo: {
          _id: "current-user-id",
          name: "Sen",
          profilePicture: "https://via.placeholder.com/32/00C851/white?text=S"
        }
      };

      setMessages(prevMessages => [...prevMessages, newMessage]);
      
    } catch (err) {
      console.error('Error sending message:', err);
      throw err; // Re-throw to let MessagingSection handle the error
    }
  };

  const handleAdvertUpdate = (updatedAdvert) => {
    setAdvert(updatedAdvert);
    
    // Re-enrich messages with updated user information
    const enrichedMessages = enrichMessagesWithUserInfo(messages, updatedAdvert);
    setMessages(enrichedMessages);
    
    // Force a complete data refresh to ensure everything is up to date
    setTimeout(() => {
      if (advertId) {
        // Clear state and trigger fresh fetch
        setLoading(true);
        // The fetchData useEffect will trigger automatically
      }
    }, 100);
  };

  // Function to refresh messages from mock data
  const refreshMessages = async () => {
    try {
      const messagesResponse = await fetch('/advert_chat_messages.mock.50.json');
      if (messagesResponse.ok) {
        const messagesData = await messagesResponse.json();
        const advertMessages = messagesData.filter(message => message.advert === advertId);
        const enrichedMessages = enrichMessagesWithUserInfo(advertMessages, advert);
        setMessages(enrichedMessages);
      }
    } catch (err) {
      console.error('Error refreshing messages:', err);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !advert) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-red-600 mb-4">
              {error === 'Advert not found' ? 'İlan Bulunamadı' : 'Hata Oluştu'}
            </h1>
            <p className="text-lg text-gray-600">
              {error === 'Advert not found' 
                ? 'Aradığınız ilan mevcut değil veya kaldırılmış olabilir.'
                : `Bir hata oluştu: ${error}`
              }
            </p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          {/* Mobile layout */}
          <div className="lg:hidden">
            <div className="space-y-6">
              {/* Advert Info on top for mobile */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <AdvertInfo advert={advert} onAdvertUpdate={handleAdvertUpdate} />
              </div>
              
              {/* Messaging below for mobile */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden h-96">
                <MessagingSection 
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  advertId={advertId}
                  onRefreshMessages={refreshMessages}
                  advert={advert}
                />
              </div>
            </div>
          </div>

          {/* Desktop layout */}
          <div className="hidden lg:grid lg:grid-cols-10 gap-6 h-[calc(100vh-8rem)]">
            {/* Left side - Advert Info (30%) */}
            <div className="lg:col-span-4 bg-white rounded-lg shadow-md overflow-hidden">
              <AdvertInfo advert={advert} onAdvertUpdate={handleAdvertUpdate} />
            </div>
            
            {/* Right side - Messaging (70%) */}
            <div className="lg:col-span-6 bg-white rounded-lg shadow-md overflow-hidden">
              <MessagingSection 
                messages={messages}
                onSendMessage={handleSendMessage}
                advertId={advertId}
                onRefreshMessages={refreshMessages}
                advert={advert}
              />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default AdvertDetailPage;