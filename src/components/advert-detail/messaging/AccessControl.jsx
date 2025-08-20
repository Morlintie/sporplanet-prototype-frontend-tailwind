import MessageHeader from "./MessageHeader";

// Helper function to get user initials for avatar fallback
const getInitials = (name) => {
  if (!name || typeof name !== "string") return "?";
  const cleanName = name.trim();
  if (!cleanName) return "?";

  const nameParts = cleanName.split(/[\s.]+/); // Split by space or dot
  if (nameParts.length >= 2) {
    return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
  }
  return cleanName[0]?.toUpperCase() || "?";
};

function AccessControl({ advert, message }) {
  const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Dummy messages for background blur effect
  const getDummyMessages = () => [
    {
      id: "dummy-1",
      sender: "dummy-user-1",
      content: "Merhaba! Maça katılmak istiyorum.",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      senderInfo: { name: "Ahmet K.", profilePicture: null },
    },
    {
      id: "dummy-2",
      sender: "dummy-user-2",
      content: "Ben de gelmek istiyorum, saat kaçta başlayacak?",
      createdAt: new Date(Date.now() - 3000000).toISOString(),
      senderInfo: { name: "Mehmet Y.", profilePicture: null },
    },
    {
      id: "dummy-3",
      sender: "dummy-user-3",
      content: "Harika! O zaman görüşürüz.",
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      senderInfo: { name: "Ali D.", profilePicture: null },
    },
    {
      id: "dummy-4",
      sender: "dummy-user-1",
      content: "Kaleci var mı aramızda?",
      createdAt: new Date(Date.now() - 900000).toISOString(),
      senderInfo: { name: "Ahmet K.", profilePicture: null },
    },
    {
      id: "dummy-5",
      sender: "dummy-user-4",
      content: "Ben kaleci olabilirim 🥅",
      createdAt: new Date(Date.now() - 600000).toISOString(),
      senderInfo: { name: "Fatma S.", profilePicture: null },
    },
  ];

  return (
    <div className="h-full flex flex-col relative">
      <MessageHeader advert={advert} />

      {/* Messages area with blurred background */}
      <div className="flex-1 overflow-hidden relative">
        {/* Background with dummy messages */}
        <div
          className="absolute inset-0 overflow-y-auto p-4 space-y-4"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.85), rgba(255,255,255,0.85)), url('https://res.cloudinary.com/dyepiphy8/image/upload/v1755275577/ChatGPT_Image_Aug_15_2025_07_32_40_PM_jhshte.png')",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
          }}
        >
          {/* Render dummy messages to create conversation effect */}
          {getDummyMessages().map((message, index) => (
            <div key={message.id} className="mb-4">
              <div
                className={`flex items-end space-x-2 ${
                  index % 2 === 0
                    ? "justify-start"
                    : "justify-end flex-row-reverse space-x-reverse"
                }`}
              >
                {/* Profile picture */}
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-medium">
                    {getInitials(message.senderInfo?.name)}
                  </div>
                </div>

                {/* Message bubble */}
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    index % 2 === 0
                      ? "bg-gray-200 text-gray-800"
                      : "bg-green-500 text-white"
                  }`}
                >
                  {/* Sender name */}
                  {index % 2 === 0 && (
                    <p className="text-xs text-gray-600 mb-1 font-medium">
                      {message.senderInfo?.name}
                    </p>
                  )}

                  {/* Message content */}
                  <p className="text-sm">{message.content}</p>

                  {/* Time */}
                  <div
                    className={`text-xs mt-1 ${
                      index % 2 === 0 ? "text-gray-500" : "text-green-100"
                    }`}
                  >
                    {formatMessageTime(message.createdAt)}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* More dummy messages to fill the space */}
          {getDummyMessages().map((message, index) => (
            <div key={`repeat-${message.id}`} className="mb-4">
              <div
                className={`flex items-end space-x-2 ${
                  (index + getDummyMessages().length) % 2 === 0
                    ? "justify-start"
                    : "justify-end flex-row-reverse space-x-reverse"
                }`}
              >
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-medium">
                    {getInitials(message.senderInfo?.name)}
                  </div>
                </div>
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    (index + getDummyMessages().length) % 2 === 0
                      ? "bg-gray-200 text-gray-800"
                      : "bg-blue-500 text-white"
                  }`}
                >
                  {(index + getDummyMessages().length) % 2 === 0 && (
                    <p className="text-xs text-gray-600 mb-1 font-medium">
                      {message.senderInfo?.name}
                    </p>
                  )}
                  <p className="text-sm">Evet, ben de katılacağım...</p>
                  <div
                    className={`text-xs mt-1 ${
                      (index + getDummyMessages().length) % 2 === 0
                        ? "text-gray-500"
                        : "text-blue-100"
                    }`}
                  >
                    {formatMessageTime(
                      new Date(message.createdAt).getTime() + 300000
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Blur effect overlay */}
        <div className="absolute inset-0 backdrop-blur-sm"></div>

        {/* Main overlay with access message */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center p-8 max-w-md bg-white bg-opacity-90 rounded-lg shadow-lg">
            <div className="mb-6">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Mesajları Göremezsiniz
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccessControl;

