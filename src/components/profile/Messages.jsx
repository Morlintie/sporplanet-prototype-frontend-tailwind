import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";

function Messages() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("group");
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);

  // Mock data - replace with real API calls
  const [groupMessages] = useState([
    {
      id: 1,
      advertTitle: "Kadıköy'de Halısaha Maçı",
      lastMessage: "Maç yarın saat 19:00'da başlayacak, hazır olun!",
      lastMessageTime: "2 saat önce",
      unreadCount: 3,
      participants: 8,
      isActive: true
    },
    {
      id: 2,
      advertTitle: "Beşiktaş Parkı Futbol",
      lastMessage: "Kaleci arıyoruz, var mı katılmak isteyen?",
      lastMessageTime: "5 saat önce",
      unreadCount: 0,
      participants: 12,
      isActive: true
    },
    {
      id: 3,
      advertTitle: "Cumartesi Turnuvası",
      lastMessage: "Kayıtlar kapandı, teşekkürler!",
      lastMessageTime: "1 gün önce",
      unreadCount: 0,
      participants: 16,
      isActive: false
    }
  ]);

  const [individualMessages] = useState([
    {
      id: 1,
      name: "Ahmet Yılmaz",
      lastMessage: "Maça gelecek misin?",
      lastMessageTime: "1 saat önce",
      unreadCount: 2,
      isOnline: true
    },
    {
      id: 2,
      name: "Mehmet Kaya",
      lastMessage: "Kaleci pozisyonu boş mu?",
      lastMessageTime: "3 saat önce",
      unreadCount: 0,
      isOnline: false
    },
    {
      id: 3,
      name: "Fatma Demir",
      lastMessage: "Turnuva için takım kuruyoruz",
      lastMessageTime: "1 gün önce",
      unreadCount: 1,
      isOnline: true
    }
  ]);

  const [currentMessages] = useState([
    {
      id: 1,
      senderId: "user1",
      senderName: "Ahmet Yılmaz",
      message: "Merhaba arkadaşlar, yarınki maç için hazır mısınız?",
      timestamp: "14:30"
    },
    {
      id: 2,
      senderId: currentUser?._id,
      senderName: "Sen",
      message: "Evet, hazırım! Saat kaçta buluşuyoruz?",
      timestamp: "14:32"
    },
    {
      id: 3,
      senderId: "user2",
      senderName: "Mehmet Kaya",
      message: "19:00'da sahada buluşalım",
      timestamp: "14:35"
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    console.log("Sending message:", message);
    setMessage("");
  };

  const getInitials = (name) => {
    if (!name) return "?";
    const nameParts = name.trim().split(" ");
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return name[0]?.toUpperCase() || "?";
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
          </svg>
          <h2 className="text-xl font-semibold text-gray-900">Mesajlarım</h2>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("group")}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === "group"
                ? "bg-white text-green-600 shadow-sm"
                : "text-gray-700 hover:text-gray-900"
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
              </svg>
              <span>Grup</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("individual")}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === "individual"
                ? "bg-white text-green-600 shadow-sm"
                : "text-gray-700 hover:text-gray-900"
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
              </svg>
              <span>Bireysel</span>
            </div>
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Messages List */}
        <div className="w-2/5 border-r border-gray-200 flex flex-col">
          <div className="flex-1 overflow-y-auto">
            {activeTab === "group" ? (
              <div className="divide-y divide-gray-100">
                {groupMessages.map((group) => (
                  <div
                    key={group.id}
                    onClick={() => setSelectedConversation(group)}
                    className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                      selectedConversation?.id === group.id ? "bg-green-50 border-r-2 border-green-600" : ""
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {getInitials(group.advertTitle)}
                        </div>
                        {group.isActive && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-gray-900 truncate">
                            {group.advertTitle}
                          </h4>
                          {group.unreadCount > 0 && (
                            <span className="bg-green-600 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                              {group.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 truncate mt-0.5">
                          {group.lastMessage}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-500">{group.lastMessageTime}</span>
                          <div className="flex items-center text-xs text-gray-500">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                            </svg>
                            {group.participants}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {individualMessages.map((person) => (
                  <div
                    key={person.id}
                    onClick={() => setSelectedConversation(person)}
                    className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                      selectedConversation?.id === person.id ? "bg-green-50 border-r-2 border-green-600" : ""
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {getInitials(person.name)}
                        </div>
                        {person.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-gray-900 truncate">
                            {person.name}
                          </h4>
                          {person.unreadCount > 0 && (
                            <span className="bg-blue-600 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                              {person.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 truncate mt-0.5">
                          {person.lastMessage}
                        </p>
                        <span className="text-xs text-gray-500 mt-1 block">{person.lastMessageTime}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-3 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold ${
                      activeTab === "group" ? "bg-green-600" : "bg-blue-600"
                    }`}>
                      {getInitials(selectedConversation.advertTitle || selectedConversation.name)}
                    </div>
                    {((activeTab === "individual" && selectedConversation.isOnline) || 
                      (activeTab === "group" && selectedConversation.isActive)) && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 border border-white rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      {selectedConversation.advertTitle || selectedConversation.name}
                    </h3>
                    <p className="text-xs text-gray-600">
                      {activeTab === "group" 
                        ? `${selectedConversation.participants} katılımcı`
                        : selectedConversation.isOnline ? "Çevrimiçi" : "Çevrimdışı"
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {currentMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderId === currentUser?._id ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`flex items-end space-x-2 max-w-xs ${
                      msg.senderId === currentUser?._id ? "flex-row-reverse space-x-reverse" : ""
                    }`}>
                      {msg.senderId !== currentUser?._id && (
                        <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-medium">
                          {getInitials(msg.senderName)}
                        </div>
                      )}
                      <div>
                        <div className={`rounded-lg px-3 py-2 ${
                          msg.senderId === currentUser?._id
                            ? "bg-green-600 text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}>
                          {msg.senderId !== currentUser?._id && (
                            <p className="text-xs font-medium mb-1 opacity-75">{msg.senderName}</p>
                          )}
                          <p className="text-sm">{msg.message}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 px-1">{msg.timestamp}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-3 border-t border-gray-200">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Mesajınızı yazın..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    disabled={!message.trim()}
                    className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
                    </svg>
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
                <h3 className="text-sm font-medium text-gray-900 mb-1">Bir sohbet seçin</h3>
                <p className="text-xs text-gray-600">Mesajlaşmaya başlamak için soldan bir grup veya kişi seçin</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Messages;
