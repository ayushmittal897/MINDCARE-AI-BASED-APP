import { Send } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageBubble, type ChatMessage } from "./MessageBubble";

const seed: ChatMessage[] = [
  { id: "1", role: "assistant", content: "Hi — I’m here to listen. What’s on your mind today?" },
];

export function ChatWindow() {
  const [messages, setMessages] = useState<ChatMessage[]>(seed);
  const [input, setInput] = useState("");

  function send() {
    const text = input.trim();
    if (!text) return;
    const user: ChatMessage = { id: crypto.randomUUID(), role: "user", content: text };
    const reply: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "Thanks for sharing. In production this connects to your clinician-approved assistant model.",
    };
    setMessages((m) => [...m, user, reply]);
    setInput("");
  }

  return (
    <Card className="flex h-[420px] flex-col">
      <CardHeader className="border-b border-border py-3">
        <CardTitle className="text-base">Support chat (UI shell)</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3 overflow-hidden p-0">
        <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-3">
          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))}
        </div>
        <div className="flex gap-2 border-t border-border p-3">
          <Input placeholder="Type a message…" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} />
          <Button type="button" size="icon" onClick={send} aria-label="Send">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
