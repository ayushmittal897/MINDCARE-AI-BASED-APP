import { cn } from "@/lib/utils";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  moodTag?: string;
}

interface Props {
  message: ChatMessage;
}

export function MessageBubble({ message }: Props) {
  const isUser = message.role === "user";
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm",
          isUser ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md bg-muted text-foreground",
        )}
      >
        <p>{message.content}</p>
        {message.moodTag && <p className="mt-1 text-[10px] opacity-80">Tag: {message.moodTag}</p>}
      </div>
    </div>
  );
}
