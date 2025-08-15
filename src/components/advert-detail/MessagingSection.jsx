import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

function MessagingSection({ messages, onSendMessage, advertId, onRefreshMessages, advert }) {
  const [newMessage, setNewMessage] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const { user } = useAuth();

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ 
        behavior: "smooth",
        block: "end",
        inline: "nearest"
      });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatMessageDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Bugün';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Dün';
    } else {
      return date.toLocaleDateString('tr-TR');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() && attachments.length === 0) return;
    if (sending) return;

    try {
      setSending(true);
      
      const messageData = {
        content: newMessage.trim(),
        type: attachments.length > 0 ? (attachments[0].type.startsWith('image/') ? 'image' : 'video') : 'text',
        attachments: attachments.length > 0 ? {
          caption: newMessage.trim() || '',
          items: attachments
        } : undefined
      };

      await onSendMessage(messageData);
      setNewMessage("");
      setAttachments([]);
      
      // Force scroll to bottom after message is sent
      setTimeout(() => {
        scrollToBottom();
      }, 200);
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Mesaj gönderilirken bir hata oluştu.');
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const file = files[0];
    const fileData = {
      url: URL.createObjectURL(file),
      name: file.name,
      mimeType: file.type
    };

    setAttachments([fileData]);
  };

  const removeAttachment = () => {
    setAttachments([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getMessageTypeIcon = (type) => {
    switch (type) {
      case 'image':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        );
      case 'video':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" clipRule="evenodd" />
          </svg>
        );
      case 'system':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatMessageDate(message.createdAt);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  const isCurrentUser = (senderId) => {
    return user && user._id === senderId;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="text-white py-3 px-4 sticky top-0 z-10 shadow-lg" style={{backgroundImage: "linear-gradient(135deg, #065f46, #10b981)"}}>
        <div className="text-left">
          <h2 className="text-lg font-bold leading-tight mb-1">{advert?.name || 'İlan Sohbeti'}</h2>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{backgroundImage: "linear-gradient(rgba(255,255,255,0.85), rgba(255,255,255,0.85)), url('https://res.cloudinary.com/dyepiphy8/image/upload/v1755275577/ChatGPT_Image_Aug_15_2025_07_32_40_PM_jhshte.png')", backgroundSize: "cover", backgroundRepeat: "no-repeat", backgroundPosition: "center", backgroundAttachment: "fixed"}}>
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <p className="text-lg mb-2">Henüz mesaj yok</p>
              <p className="text-sm">İlk mesajı siz gönderip sohbeti başlatabilirsiniz!</p>
            </div>
          </div>
        )}
        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <div key={date}>
            {/* Date separator */}
            <div className="flex items-center justify-center mb-4">
              <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                {date}
              </div>
            </div>

            {/* Messages for this date */}
            {dateMessages.map((message, index) => (
              <div key={index} className="mb-4">
                {message.type === 'system' ? (
                  <div className="flex items-center justify-center mb-2">
                    <div className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full flex items-center space-x-1">
                      {getMessageTypeIcon(message.type)}
                      <span>{message.content}</span>
                    </div>
                  </div>
                ) : (
                  <div className={`flex items-end space-x-2 ${isCurrentUser(message.sender) ? 'justify-end flex-row-reverse space-x-reverse' : 'justify-start'}`}>
                    {/* Profile picture */}
                    <img 
                      src={message.senderInfo?.profilePicture || message.user?.profilePicture || 'https://via.placeholder.com/32'} 
                      alt={message.senderInfo?.name || message.user?.name || 'User'}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                    
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      isCurrentUser(message.sender) 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 text-gray-800'
                    }`}>
                      {/* Sender name (only for non-current user messages) */}
                      {!isCurrentUser(message.sender) && (
                        <p className="text-xs text-gray-600 mb-1 font-medium">
                          {message.senderInfo?.name || message.user?.name || 'Kullanıcı'}
                        </p>
                      )}
                      
                      {/* Message content */}
                      <div className="flex items-start space-x-2">
                        {message.type !== 'text' && (
                          <div className="mt-1">
                            {getMessageTypeIcon(message.type)}
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-sm">{message.content}</p>
                          
                          {/* Attachments */}
                          {message.attachments && message.attachments.items && (
                            <div className="mt-2">
                              {message.attachments.items.map((item, idx) => (
                                <div key={idx} className="mb-2">
                                  {item.mimeType.startsWith('image/') ? (
                                    <img 
                                      src={item.url} 
                                      alt={item.name}
                                      className="max-w-full h-auto rounded-lg"
                                    />
                                  ) : item.mimeType.startsWith('video/') ? (
                                    <video 
                                      src={item.url}
                                      controls
                                      className="max-w-full h-auto rounded-lg"
                                    />
                                  ) : null}
                                  {message.attachments.caption && (
                                    <p className="text-xs mt-1 opacity-75">
                                      {message.attachments.caption}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Time */}
                      <div className={`text-xs mt-1 ${
                        isCurrentUser(message.sender) ? 'text-green-100' : 'text-gray-500'
                      }`}>
                        {formatMessageTime(message.createdAt)}
                        {message.archived && (
                          <span className="ml-2 opacity-60">(Arşivlendi)</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
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
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Mesajınızı yazın..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              rows="1"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
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
              <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
            </svg>
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
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
    </div>
  );
}

export default MessagingSection;
