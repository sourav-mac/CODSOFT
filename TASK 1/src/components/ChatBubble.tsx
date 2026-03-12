import type { ChatMessage } from "@/lib/chatbot";

const ChatBubble = ({ message }: { message: ChatMessage }) => {
  const isUser = message.sender === "user";

  return (
    <div className={`flex items-end gap-2 animate-fade-in-up ${isUser ? "flex-row-reverse" : ""}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
          🎓
        </div>
      )}
      <div
        className={`max-w-[75%] px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "bg-user text-user-foreground rounded-2xl rounded-br-sm"
            : "bg-bot text-bot-foreground rounded-2xl rounded-bl-sm"
        }`}
      >
        {message.text}
      </div>
    </div>
  );
};

export default ChatBubble;
