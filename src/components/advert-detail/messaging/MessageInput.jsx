import { useState, useRef } from "react";
import PrivateLinkDropdown from "./PrivateLinkDropdown";

function MessageInput({
  onSendMessage,
  sending,
  advertId,
  onCreatePrivateLink,
  onSendInvitation,
  advert,
}) {
  const [newMessage, setNewMessage] = useState("");
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() && attachments.length === 0) return;
    if (sending) return;

    try {
      const messageData = {
        content: newMessage.trim(),
        type:
          attachments.length > 0
            ? attachments[0].type.startsWith("image/")
              ? "image"
              : "video"
            : "text",
        attachments:
          attachments.length > 0
            ? {
                caption: newMessage.trim() || "",
                items: attachments,
              }
            : undefined,
      };

      await onSendMessage(messageData);
      setNewMessage("");
      setAttachments([]);
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Mesaj gönderilirken bir hata oluştu.");
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const file = files[0];
    const fileData = {
      url: URL.createObjectURL(file),
      name: file.name,
      mimeType: file.type,
    };

    setAttachments([fileData]);
  };

  const removeAttachment = () => {
    setAttachments([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="border-t bg-white p-4">
      {/* Attachment preview */}
      {attachments.length > 0 && (
        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                Ek: {attachments[0].name}
              </span>
            </div>
            <button
              onClick={removeAttachment}
              className="text-red-500 hover:text-red-700"
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
        </div>
      )}

      <form
        onSubmit={handleSendMessage}
        className="flex items-center space-x-2"
      >
        <div className="flex-1">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
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
          className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
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
          accept="image/*,video/*"
          onChange={handleFileSelect}
          className="hidden"
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
