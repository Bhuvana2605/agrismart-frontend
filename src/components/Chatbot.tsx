import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

interface Message {
  text: string;
  isUser: boolean;
}

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hello! I'm AgriSmart Assistant. How can I help you today?", isUser: false },
  ]);
  const [inputValue, setInputValue] = useState('');

  const handleSend = () => {
    if (!inputValue.trim()) return;

    setMessages([...messages, { text: inputValue, isUser: true }]);
    
    setTimeout(() => {
      const responses = [
        "That's a great question! Based on your soil type and weather conditions, I recommend considering crops like wheat, rice, or corn.",
        "GPS detection helps us analyze your soil composition and local weather patterns to provide accurate crop recommendations.",
        "You can view your search history by clicking on your profile icon and selecting 'Previous Searches'.",
        "Our AI model has 99.51% accuracy in crop recommendations. It analyzes NPK values, temperature, humidity, pH, and rainfall data.",
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setMessages((prev) => [...prev, { text: randomResponse, isUser: false }]);
    }, 1000);

    setInputValue('');
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-[60px] h-[60px] bg-primary rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-[1000] animate-pulse"
        aria-label="Open chatbot"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 w-[360px] h-[400px] glass-strong rounded-2xl shadow-2xl flex flex-col z-[1000]">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="text-xl">🌾</span>
              <h3 className="font-semibold">AgriSmart Assistant</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-muted rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                    message.isUser
                      ? 'bg-primary text-white rounded-br-none'
                      : 'bg-muted text-foreground rounded-bl-none'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-2 bg-background border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={handleSend}
                className="w-10 h-10 bg-primary rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors"
                aria-label="Send message"
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
