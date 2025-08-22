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
    console.log("MessageInput: handleTypingStop called", {
      isTyping,
      hasOnStopTyping: !!onStopTyping,
    });

    if (isTyping && onStopTyping) {
      console.log("MessageInput: Stopping typing, calling onStopTyping");
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
    console.log("MessageInput: handleTypingStart called", {
      isTyping,
      hasOnStartTyping: !!onStartTyping,
    });

    if (!isTyping && onStartTyping) {
      console.log("MessageInput: Starting typing, calling onStartTyping");
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
    console.log("MessageInput: handleMessageChange called", {
      value,
      trimmedLength: value.trim().length,
      currentIsTyping: isTyping,
    });

    setNewMessage(value);

    // Handle typing events
    if (value.trim() !== "") {
      // User is typing
      console.log("MessageInput: Input has content, calling handleTypingStart");
      handleTypingStart();
    } else {
      // Input is empty, stop typing
      console.log("MessageInput: Input is empty, calling handleTypingStop");
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

    // Validate file types using hex signatures
    const supportedTypes = {
      png: "89504E47",
      jpg: "FFD8FF",
      gif: "47494638",
      webp: "52494646",
      pdf: "25504446",
      doc: "D0CF11E0",
      docx: "504B0304",
      mp4: "00000018",
      webm: "1A45DFA3",
      ogg: "4F676753",
    };

    try {
      const filePromises = files.map((file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            // Validate file type using hex signature
            const arrayBuffer = reader.result;
            const uint8Array = new Uint8Array(arrayBuffer.slice(0, 8));
            const hexSignature = Array.from(uint8Array)
              .map((byte) => byte.toString(16).padStart(2, "0").toUpperCase())
              .join("");

            let isValidType = false;
            for (const [type, signature] of Object.entries(supportedTypes)) {
              if (hexSignature.startsWith(signature)) {
                isValidType = true;
                break;
              }
            }

            if (!isValidType) {
              reject(new Error(`Desteklenmeyen dosya türü: ${file.name}`));
              return;
            }

            // Re-read as data URL for base64 content
            const dataReader = new FileReader();
            dataReader.onload = () => {
              const fileData = {
                url: URL.createObjectURL(file), // For preview
                name: file.name,
                mimeType: file.type,
                size: file.size,
                content: dataReader.result, // Base64 data including data:mime/type;base64, prefix
              };
              resolve(fileData);
            };
            dataReader.onerror = reject;
            dataReader.readAsDataURL(file);
          };
          reader.onerror = reject;
          reader.readAsArrayBuffer(file); // Read as array buffer first for hex validation
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
    <div className="border-t bg-white p-4">
      {/* WhatsApp-style Attachment Preview */}
      {attachments.length > 0 && (
        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-600 font-medium">
              {attachments.length}/3 dosya seçildi
              {attachments.length < 3 && (
                <span className="text-green-600 ml-2">
                  ({3 - attachments.length} dosya daha ekleyebilirsiniz)
                </span>
              )}
            </span>
            <button
              onClick={removeAttachment}
              className="text-red-500 hover:text-red-700 p-1 rounded"
              title="Tüm dosyaları kaldır"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {/* File previews grid - WhatsApp style */}
          <div className="grid grid-cols-3 gap-2">
            {attachments.map((file, index) => (
              <div
                key={index}
                className="relative group bg-white rounded-lg border-2 border-gray-200 overflow-hidden aspect-square"
              >
                {/* Remove individual file button */}
                <button
                  onClick={() => removeIndividualFile(index)}
                  className="absolute top-1 right-1 z-10 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  title="Bu dosyayı kaldır"
                >
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {/* File preview content */}
                <div className="w-full h-full flex flex-col">
                  {/* Image/Video preview */}
                  {file.mimeType.startsWith("image/") ? (
                    <div className="flex-1 bg-gray-100">
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : file.mimeType.startsWith("video/") ? (
                    <div className="flex-1 bg-gray-800 relative">
                      <video
                        src={file.url}
                        className="w-full h-full object-cover"
                        muted
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black bg-opacity-50 rounded-full p-2">
                          <svg
                            className="w-6 h-6 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Document file icon */
                    <div className="flex-1 bg-blue-50 flex flex-col items-center justify-center p-2">
                      <svg
                        className="w-8 h-8 text-blue-500 mb-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-xs text-blue-600 font-medium">
                        {file.mimeType.includes("pdf")
                          ? "PDF"
                          : file.mimeType.includes("word")
                          ? "DOC"
                          : file.mimeType.includes("document")
                          ? "DOC"
                          : "FILE"}
                      </span>
                    </div>
                  )}

                  {/* File info footer */}
                  <div className="bg-gray-800 bg-opacity-80 text-white p-1">
                    <div className="text-xs truncate font-medium">
                      {file.name}
                    </div>
                    <div className="text-xs text-gray-300">
                      {formatFileSize(file.size)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <form
        onSubmit={handleSendMessage}
        className="flex items-center space-x-2"
      >
        <div className="flex-1">
          <textarea
            value={newMessage}
            onChange={handleMessageChange}
            placeholder="Mesajınızı yazın..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            rows="1"
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />
        </div>

        {/* File attachment button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={attachments.length >= 3}
          className={`p-2 transition-colors ${
            attachments.length >= 3
              ? "text-gray-300 cursor-not-allowed"
              : "text-gray-500 hover:text-gray-700"
          }`}
          title={
            attachments.length >= 3
              ? "Maksimum 3 dosya seçebilirsiniz"
              : "Dosya ekle"
          }
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
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
          accept=".png,.jpg,.jpeg,.gif,.webp,.pdf,.doc,.docx,.mp4,.webm,.ogg,image/png,image/jpeg,image/gif,image/webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,video/mp4,video/webm,audio/ogg"
          onChange={handleFileSelect}
          className="hidden"
          multiple
        />

        {/* Private Link Dropdown */}
        <PrivateLinkDropdown
          advertId={advertId}
          onCreatePrivateLink={onCreatePrivateLink}
          onSendInvitation={onSendInvitation}
          advert={advert}
        />

        {/* Send button */}
        <button
          type="submit"
          disabled={(!newMessage.trim() && attachments.length === 0) || sending}
          className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 min-w-[100px]"
        >
          {sending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span className="text-sm">Gönderiliyor</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
              <span className="text-sm">Gönder</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default MessageInput;
