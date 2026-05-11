import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Phone, Video, Info } from "lucide-react";

const mockConversations = [
  {
    id: 1,
    name: "Elara Vance",
    avatar: "https://images.unsplash.com/photo-1506863530036-1efeddceb993?auto=format&fit=crop&w=100&q=80",
    lastMessage: "See you soon!",
    timestamps: "2:30 PM",
    messages: [
      {
        id: 1,
        sender: "host",
        text: "Hello! Welcome to The Glass Pavilion. Looking forward to hosting you!",
        time: "10:15 AM",
      },
      {
        id: 2,
        sender: "user",
        text: "Hi! Thank you so much. We're excited to visit!",
        time: "10:20 AM",
      },
      {
        id: 3,
        sender: "host",
        text: "Great! Check-in is at 3 PM. I'll send you the key code in the morning.",
        time: "10:25 AM",
      },
      {
        id: 4,
        sender: "user",
        text: "Perfect! Thank you for the details.",
        time: "10:30 AM",
      },
      {
        id: 5,
        sender: "host",
        text: "See you soon!",
        time: "2:30 PM",
      },
    ],
  },
  {
    id: 2,
    name: "Julian Morgan",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80",
    lastMessage: "Champagne recommendations?",
    timestamps: "Today",
    messages: [
      {
        id: 1,
        sender: "host",
        text: "Welcome! I saw your note about the anniversary. Congratulations!",
        time: "11:00 AM",
      },
      {
        id: 2,
        sender: "user",
        text: "Thank you! We're celebrating our 10th, any local champagne recommendations?",
        time: "11:05 AM",
      },
      {
        id: 3,
        sender: "host",
        text: "Absolutely! I have some great suggestions from local winemakers. I'll email you a list.",
        time: "11:10 AM",
      },
      {
        id: 4,
        sender: "user",
        text: "That's wonderful, thank you!",
        time: "11:15 AM",
      },
    ],
  },
  {
    id: 3,
    name: "Marcus Thorne",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=100&q=80",
    lastMessage: "Looking forward to it!",
    timestamps: "Yesterday",
    messages: [
      {
        id: 1,
        sender: "host",
        text: "Hi Marcus! Ready for your stay at Urban Loft Studio?",
        time: "3:20 PM",
      },
      {
        id: 2,
        sender: "user",
        text: "Absolutely! Looking forward to it!",
        time: "3:25 PM",
      },
    ],
  },
];

export function MessagesSection({ selectedGuestName } = {}) {
  const [selectedConversation, setSelectedConversation] = useState(0);
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState(mockConversations[0].messages);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (selectedGuestName) {
      const conversationIndex = mockConversations.findIndex(
        (conv) => conv.name.toLowerCase() === selectedGuestName.toLowerCase()
      );
      if (conversationIndex !== -1) {
        setSelectedConversation(conversationIndex);
      }
    }
  }, [selectedGuestName]);

  useEffect(() => {
    setMessages(mockConversations[selectedConversation].messages);
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      sender: "user",
      text: messageInput,
      time: new Date().toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages([...messages, newMessage]);
    setMessageInput("");

    // Simulate host response
    setTimeout(() => {
      const response = {
        id: messages.length + 2,
        sender: "host",
        text: "Gracias por tu mensaje. Te responderé pronto.",
        time: new Date().toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, response]);
    }, 1500);
  };

  const currentConversation = mockConversations[selectedConversation];

  return (
    <div className="messagesSection">
      <div className="conversationsList">
        <div className="conversationsHeader">
          <h2>Mensajes</h2>
          <p className="conversationsCount">
            {mockConversations.length} conversaciones
          </p>
        </div>
        <div className="conversationsItems">
          {mockConversations.map((conversation, index) => (
            <button
              key={conversation.id}
              className={`conversationItem ${
                selectedConversation === index ? "active" : ""
              }`}
              onClick={() => setSelectedConversation(index)}
              type="button"
            >
              <img
                src={conversation.avatar}
                alt={conversation.name}
                className="conversationAvatar"
              />
              <div className="conversationInfo">
                <h4>{conversation.name}</h4>
                <p className="conversationPreview">{conversation.lastMessage}</p>
              </div>
              <span className="conversationTime">{conversation.timestamps}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="chatWindow">
        <div className="chatHeader">
          <div className="chatHeaderLeft">
            <img
              src={currentConversation.avatar}
              alt={currentConversation.name}
            />
            <div>
              <h3>{currentConversation.name}</h3>
              <p>Activo ahora</p>
            </div>
          </div>
          <div className="chatHeaderActions">
            <button type="button" aria-label="Iniciar llamada">
              <Phone size={18} />
            </button>
            <button type="button" aria-label="Iniciar video">
              <Video size={18} />
            </button>
            <button type="button" aria-label="Información">
              <Info size={18} />
            </button>
          </div>
        </div>

        <div className="chatMessages">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`chatMessage ${message.sender === "user" ? "sent" : "received"}`}
            >
              <div className="messageBubble">
                <p>{message.text}</p>
                <span className="messageTime">{message.time}</span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="chatInput">
          <button type="button" aria-label="Adjuntar archivo">
            <Paperclip size={18} />
          </button>
          <input
            type="text"
            placeholder="Escribe un mensaje..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <button
            type="button"
            onClick={handleSendMessage}
            disabled={!messageInput.trim()}
            aria-label="Enviar mensaje"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
