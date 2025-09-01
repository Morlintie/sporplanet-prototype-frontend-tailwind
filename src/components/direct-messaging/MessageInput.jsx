import { useState, useRef, useEffect } from "react";

function MessageInput({
  targetUser,
  sending,
  isChatConnected,
  onSendMessage,
  showNotification,
  onStartTyping,
  onStopTyping,
}) {
  const [newMessage, setNewMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isCurrentlyTyping, setIsCurrentlyTyping] = useState(false);
  const fileInputRef = useRef(null);

  // Handle file selection for attachments
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);

    if (files.length === 0) return;

    // Validate file count (max 3 files)
    if (selectedFiles.length + files.length > 3) {
      showNotification("Maksimum 3 dosya seçebilirsiniz", "error");
      return;
    }

    // Validate file sizes (100MB limit)
    const maxSize = 100 * 1024 * 1024; // 100MB
    const oversizedFiles = files.filter((file) => file.size > maxSize);

    if (oversizedFiles.length > 0) {
      showNotification("Dosya boyutu 100MB sınırını aşıyor", "error");
      return;
    }

    // Process files to base64 for preview
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileData = {
          id: Date.now() + Math.random(), // Unique ID
          name: file.name,
          size: file.size,
          type: file.type,
          content: e.target.result, // This will be data URL
          file: file, // Keep original file for backend upload
        };

        setSelectedFiles((prev) => [...prev, fileData]);
      };
      reader.readAsDataURL(file);
    });

    // Clear file input after processing
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Remove selected file
  const handleRemoveFile = (fileId) => {
    setSelectedFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  // Handle typing detection based on input field content
  useEffect(() => {
    const hasContent = newMessage.trim().length > 0;

    if (hasContent && !isCurrentlyTyping) {
      // User started typing (has content and wasn't typing before)
      console.log("DirectMessaging: User started typing - input has content");
      setIsCurrentlyTyping(true);
      if (onStartTyping) {
        onStartTyping();
      }
    } else if (!hasContent && isCurrentlyTyping) {
      // User stopped typing (no content and was typing before)
      console.log("DirectMessaging: User stopped typing - input is empty");
      setIsCurrentlyTyping(false);
      if (onStopTyping) {
        onStopTyping();
      }
    }
  }, [newMessage, isCurrentlyTyping, onStartTyping, onStopTyping]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if we have either message or files
    if (
      (!newMessage.trim() && selectedFiles.length === 0) ||
      sending ||
      !isChatConnected
    ) {
      return;
    }

    const messageText = newMessage.trim();
    const filesToSend = [...selectedFiles];

    // Clear form
    setNewMessage("");
    setSelectedFiles([]);

    // Reset typing state since message is being sent
    if (isCurrentlyTyping) {
      setIsCurrentlyTyping(false);
      if (onStopTyping) {
        onStopTyping();
      }
    }

    // Call parent handler
    await onSendMessage({
      content: messageText,
      files: filesToSend,
    });
  };

  return (
    <div className="bg-white border-t border-gray-200 px-4 py-4">
      <div className="max-w-4xl mx-auto">
        {/* Selected Files Preview */}
        {selectedFiles.length > 0 && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Seçilen Dosyalar ({selectedFiles.length}/3)
              </span>
            </div>
            <div className="space-y-2">
              {selectedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-2 bg-white rounded border border-gray-200"
                >
                  <div className="flex items-center space-x-3">
                    {/* File preview */}
                    {file.type.startsWith("image/") ? (
                      <img
                        src={file.content}
                        alt={file.name}
                        className="w-8 h-8 object-cover rounded"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-green-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(file.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Dosyayı kaldır"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex space-x-4">
          <div className="flex-1">
            {/* Message input */}
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`${targetUser?.name} ile mesajlaş...`}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              disabled={sending || !isChatConnected}
            />
          </div>

          {/* File attachment button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={selectedFiles.length >= 3}
            className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
              selectedFiles.length >= 3
                ? "text-gray-300 cursor-not-allowed bg-gray-100"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            }`}
            title={
              selectedFiles.length >= 3
                ? "Maksimum 3 dosya seçebilirsiniz"
                : "Dosya ekle"
            }
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.gif,.webp,.pdf,.doc,.docx,.docm,.dotx,.dotm,.mp4,.webm,.ogg,image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-word,video/*"
            onChange={handleFileSelect}
            className="hidden"
            multiple
          />

          <button
            type="submit"
            disabled={
              (!newMessage.trim() && selectedFiles.length === 0) ||
              sending ||
              !isChatConnected
            }
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2 rounded-lg transition-colors disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {sending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Gönderiliyor...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
                <span>Gönder</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default MessageInput;
