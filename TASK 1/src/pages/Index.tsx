import { useState, useRef, useEffect, type FormEvent } from "react";
import { Send } from "lucide-react";
import { getBotResponse, isExitMessage, type ChatMessage } from "@/lib/chatbot";
import ChatBubble from "@/components/ChatBubble";
import TypingIndicator from "@/components/TypingIndicator";
import QuickChips from "@/components/QuickChips";

const WELCOME: ChatMessage = {
  id: "welcome",
  text: "Hello! Welcome to the College Information Chatbot. Ask me about admission, courses, fees, hostel, timings, or contact info!",
  sender: "bot",
};

const Index = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [ended, setEnded] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const sendMessage = (text: string) => {
    if (!text.trim() || ended) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), text: text.trim(), sender: "user" };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    setTimeout(() => {
      const reply = getBotResponse(text);
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), text: reply, sender: "bot" }]);
      setTyping(false);
      if (isExitMessage(text)) setEnded(true);
    }, 800);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-lg flex flex-col h-[600px] rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-primary text-primary-foreground px-5 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center text-lg">
            🎓
          </div>
          <div>
            <h1 className="font-semibold text-base">College FAQ Bot</h1>
            <p className="text-xs opacity-80">Ask me anything about the college</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-chat">
          {messages.map((msg) => (
            <ChatBubble key={msg.id} message={msg} />
          ))}
          {typing && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Quick chips */}
        {!ended && <QuickChips onSelect={sendMessage} />}

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 p-3 border-t border-border bg-card">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={ended ? "Chat ended" : "Type your question..."}
            disabled={ended}
            className="flex-1 bg-secondary text-secondary-foreground rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || ended}
            className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Index;
