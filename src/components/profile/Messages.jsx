import { useState } from "react";

function Messages({ user }) {
  const [activeTab, setActiveTab] = useState("group");

  // Mock message data
  const groupChats = [
    {
      id: 1,
      name: "Kadıköy Maç Grubu",
      lastMessage: "Yarın 19:00'da buluşuyoruz",
      lastSender: "Mehmet",
      unreadCount: 3,
      timestamp: "14:30",
    },
    {
      id: 2,
      name: "Beşiktaş Takımı",
      lastMessage: "Hafta sonu turnuva var",
      lastSender: "Ali",
      unreadCount: 0,
      timestamp: "12:15",
    },
  ];

  const individualChats = [
    {
      id: 1,
      name: "Ahmet Yılmaz",
      lastMessage: "Maça katılacak mısın?",
      unreadCount: 1,
      timestamp: "15:45",
    },
    {
      id: 2,
      name: "Mehmet Kaya",
      lastMessage: "Saha rezervasyonu yaptım",
      unreadCount: 0,
      timestamp: "10:20",
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">
        Mesajlar
      </h1>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab("group")}
          className={`px-6 py-3 font-medium transition-colors cursor-pointer border-b-2 ${
            activeTab === "group"
              ? "border-green-600 text-green-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
          tabIndex="0"
        >
          Grup Sohbetleri
        </button>
        <button
          onClick={() => setActiveTab("individual")}
          className={`px-6 py-3 font-medium transition-colors cursor-pointer border-b-2 ${
            activeTab === "individual"
              ? "border-green-600 text-green-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
          tabIndex="0"
        >
          Bireysel Sohbetler
        </button>
      </div>

      {/* Chat List */}
      <div className="space-y-4">
        {activeTab === "group"
          ? groupChats.map((chat) => (
              <div
                key={chat.id}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-gray-900">{chat.name}</h3>
                    <span className="text-sm text-gray-500">
                      {chat.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">{chat.lastSender}:</span>{" "}
                    {chat.lastMessage}
                  </p>
                </div>

                {chat.unreadCount > 0 && (
                  <div className="ml-4">
                    <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {chat.unreadCount}
                    </span>
                  </div>
                )}
              </div>
            ))
          : individualChats.map((chat) => (
              <div
                key={chat.id}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-gray-900">{chat.name}</h3>
                    <span className="text-sm text-gray-500">
                      {chat.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {chat.lastMessage}
                  </p>
                </div>

                {chat.unreadCount > 0 && (
                  <div className="ml-4">
                    <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {chat.unreadCount}
                    </span>
                  </div>
                )}
              </div>
            ))}
      </div>

      {(activeTab === "group" && groupChats.length === 0) ||
      (activeTab === "individual" && individualChats.length === 0) ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Henüz Mesaj Yok
          </h3>
          <p className="text-gray-600">
            {activeTab === "group"
              ? "Henüz grup sohbetiniz bulunmuyor."
              : "Henüz bireysel sohbetiniz bulunmuyor."}
          </p>
        </div>
      ) : null}
    </div>
  );
}

export default Messages;
