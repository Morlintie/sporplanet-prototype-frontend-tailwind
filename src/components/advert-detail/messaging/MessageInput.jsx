import { useState, useRef, useCallback, useEffect } from "react";
import PrivateLinkDropdown from "./PrivateLinkDropdown";

function MessageInput({
  onSendMessage,
  sending,
  advertId,
  onCreatePrivateLink,
  onSendInvitation,
  advert,
  onStartTyping,
  onStopTyping,
}) {
  const [newMessage, setNewMessage] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Handle typing stop
  const handleTypingStop = useCallback(() => {
    if (isTyping && onStopTyping) {
      setIsTyping(false);
      onStopTyping();
    }

    // Clear timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, [isTyping, onStopTyping]);

  // Handle typing start
  const handleTypingStart = useCallback(() => {
    if (!isTyping && onStartTyping) {
      setIsTyping(true);
      onStartTyping();
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      handleTypingStop();
    }, 3000);
  }, [isTyping, onStartTyping, handleTypingStop]);

  // Handle message input change
  const handleMessageChange = (e) => {
    const value = e.target.value;
    setNewMessage(value);

    // Handle typing events
    if (value.trim() !== "") {
      handleTypingStart();
    } else {
      handleTypingStop();
    }
  };

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() && attachments.length === 0) return;
    if (sending) return;

    try {
      let messageData = {};

      if (attachments.length > 0) {
        // Send files with proper attachments structure for backend
        messageData = {
          attachments: {
            caption: newMessage.trim() || null, // Text becomes caption when files are present
            items: attachments.map((file) => ({
              content: file.content, // Base64 data
            })),
          },
        };
      } else {
        // Send text-only message
        if (!newMessage.trim()) {
          return; // Don't send empty messages
        }
        messageData = {
          content: newMessage.trim(),
        };
      }

      console.log("MessageInput sending data:", messageData);

      await onSendMessage(messageData);
      setNewMessage("");
      setAttachments([]);

      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Stop typing when message is sent
      handleTypingStop();
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Mesaj gönderilirken bir hata oluştu.");
    }
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Check cumulative file limit (existing + new files should not exceed 3)
    const totalFiles = attachments.length + files.length;
    if (totalFiles > 3) {
      alert(
        `En fazla 3 dosya seçebilirsiniz. Şu anda ${
          attachments.length
        } dosya seçili, ${3 - attachments.length} dosya daha ekleyebilirsiniz.`
      );
      return;
    }

    // Allowed file types
    const allowedTypes = [
      // Images
      'image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp',
      // Documents  
      'application/pdf', 
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      // Videos
      'video/mp4', 'video/webm', 'video/ogg'
    ];

    try {
      const filePromises = files.map((file) => {
        return new Promise((resolve, reject) => {
          // Check file type
          if (!allowedTypes.includes(file.type)) {
            reject(new Error(`Desteklenmeyen dosya türü: ${file.name}. Desteklenen türler: PNG, JPG, GIF, WebP, PDF, DOC, DOCX, MP4, WebM, OGG`));
            return;
          }

          // Check file size (max 100MB)
          const maxSize = 100 * 1024 * 1024; // 100MB in bytes
          if (file.size > maxSize) {
            reject(new Error(`Dosya çok büyük: ${file.name}. Maksimum dosya boyutu 100MB.`));
            return;
          }

          const reader = new FileReader();
          reader.onload = () => {
            const fileData = {
              url: URL.createObjectURL(file), // For preview
              name: file.name,
              mimeType: file.type,
              size: file.size,
              content: reader.result, // Base64 data including data:mime/type;base64, prefix
            };
            resolve(fileData);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

      const processedFiles = await Promise.all(filePromises);

      // ADD files to existing attachments instead of replacing them
      setAttachments((prevAttachments) => [
        ...prevAttachments,
        ...processedFiles,
      ]);
      console.log("Files processed and added to upload queue:", processedFiles);
    } catch (error) {
      console.error("Error processing files:", error);
      alert(`Dosya işlenirken hata oluştu: ${error.message}`);
    }
  };

  const removeAttachment = () => {
    setAttachments([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeIndividualFile = (indexToRemove) => {
    setAttachments((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="border-t bg-white p-3 sm:p-4">
      {/* Mobile-optimized Attachment Preview */}
      {attachments.length > 0 && (
        <div className="mb-3 p-2 sm:p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm text-gray-600 font-medium">
              {attachments.length}/3 dosya seçildi
              {attachments.length < 3 && (
                <span className="text-green-600 ml-1 sm:ml-2 hidden sm:inline">
                  ({3 - attachments.length} dosya daha ekleyebilirsiniz)
                </span>
              )}
            </span>
            <button
              onClick={removeAttachment}
              className="text-red-500 hover:text-red-700 p-1 rounded"
              title="Tüm dosyaları kaldır"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {/* Mobile-optimized File previews */}
          <div className="space-y-2">
            {attachments.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-white rounded border"
              >
                <div className="flex items-center space-x-2 min-w-0 flex-1">
                  {/* File type icon */}
                  <div className="flex-shrink-0">
                    {file.mimeType.startsWith("image/") ? (
                      <div className="w-6 h-6 rounded flex items-center justify-center" style={{backgroundColor: '#dcfce7'}}>
                        <svg className="w-3 h-3" style={{color: '#16a34a'}} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                      </div>
                    ) : file.mimeType.startsWith("video/") ? (
                      <div className="w-6 h-6 rounded flex items-center justify-center" style={{backgroundColor: '#dcfce7'}}>
                        <svg className="w-3 h-3" style={{color: '#16a34a'}} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" clipRule="evenodd" />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded flex items-center justify-center" style={{backgroundColor: '#dcfce7'}}>
                        <svg className="w-3 h-3" style={{color: '#16a34a'}} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  {/* File info */}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                
                {/* Remove individual file button */}
                <button
                  type="button"
                  onClick={() => removeIndividualFile(index)}
                  className="text-red-500 hover:text-red-700 p-1 ml-2 flex-shrink-0"
                  title="Bu dosyayı kaldır"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mobile-optimized Input Form */}
      <form onSubmit={handleSendMessage} className="flex flex-col sm:flex-row gap-2 sm:gap-2">
        {/* Text input - full width on mobile */}
        <div className="flex-1">
          <textarea
            value={newMessage}
            onChange={handleMessageChange}
            placeholder="Mesajınızı yazın..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-sm"
            rows="1"
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />
        </div>

        {/* Mobile-optimized Action buttons */}
        <div className="flex items-center gap-2">
          {/* File attachment button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={attachments.length >= 3}
            className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
              attachments.length >= 3
                ? "text-gray-300 cursor-not-allowed bg-gray-100"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            }`}
            title={
              attachments.length >= 3
                ? "Maksimum 3 dosya seçebilirsiniz"
                : "Dosya ekle"
            }
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.gif,.webp,.pdf,.doc,.docx,.mp4,.webm,.ogg,image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,video/*"
            onChange={handleFileSelect}
            className="hidden"
            multiple
          />

          {/* Private Link Dropdown - hidden on mobile if too cramped */}
          <div className="hidden sm:block">
            <PrivateLinkDropdown
              advertId={advertId}
              onCreatePrivateLink={onCreatePrivateLink}
              onSendInvitation={onSendInvitation}
              advert={advert}
            />
          </div>

          {/* Send button - optimized for mobile */}
          <button
            type="submit"
            disabled={(!newMessage.trim() && attachments.length === 0) || sending}
            className="px-3 py-2 sm:px-6 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1 sm:gap-2 flex-shrink-0"
          >
            {sending ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                <span className="text-xs sm:text-sm">Gönder...</span>
              </>
            ) : (
              <>
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
                <span className="text-xs sm:text-sm">Gönder</span>
              </>
            )}
          </button>
        </div>

        {/* Mobile Private Link Dropdown - shown below on mobile */}
        <div className="sm:hidden">
          <PrivateLinkDropdown
            advertId={advertId}
            onCreatePrivateLink={onCreatePrivateLink}
            onSendInvitation={onSendInvitation}
            advert={advert}
          />
        </div>
      </form>
    </div>
  );
}

export default MessageInput;