import { useState } from "react";

function InvitationMessagePopup({
  isVisible,
  onClose,
  onSend,
  selectedFriends = [],
}) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    setIsSending(true);
    try {
      // Send message (empty string if no message provided)
      await onSend(message.trim());
    } catch (error) {
      console.error("Error sending invitations:", error);
      // Error handling is done in the parent component (AdvertDetailPage)
    } finally {
      // Always close popup and reset state, regardless of success or error
      // This ensures notifications are visible to the user
      setIsSending(false);
      setMessage("");
      onClose();
    }
  };

  const handleCancel = () => {
    setMessage("");
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{
        background: "rgba(0, 0, 0, 0.3)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Davet Gönder
          </h2>

          {/* Selected Friends Summary */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">
              Seçilen arkadaşlar ({selectedFriends.length}):
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedFriends.slice(0, 3).map((friend) => (
                <span
                  key={friend._id}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                >
                  {friend.name}
                </span>
              ))}
              {selectedFriends.length > 3 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  +{selectedFriends.length - 3} daha
                </span>
              )}
            </div>
          </div>

          {/* Message Input */}
          <div className="mb-6">
            <label
              htmlFor="invitation-message"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Mesaj (İsteğe bağlı)
            </label>
            <textarea
              id="invitation-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Arkadaşlarınıza göndermek istediğiniz mesajı yazın..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              rows={4}
              maxLength={500}
              disabled={isSending}
            />
            <p className="text-xs text-gray-500 mt-1">
              {message.length}/500 karakter
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleCancel}
              disabled={isSending}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              İptal
            </button>
            <button
              onClick={handleSend}
              disabled={isSending || selectedFriends.length === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              style={{
                backgroundColor: isSending
                  ? "rgb(0, 100, 0)"
                  : "rgb(0, 128, 0)",
                borderRadius: "6px",
              }}
            >
              {isSending ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Gönderiliyor...
                </>
              ) : (
                "Gönder"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvitationMessagePopup;
