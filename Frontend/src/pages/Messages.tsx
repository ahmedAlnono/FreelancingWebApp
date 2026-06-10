import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { recentMessages } from "@/data";
import { cn } from "@/lib/utils";

type Msg = { id: string; from: "me" | "them"; text: string; time: string };

const seed: Record<string, Msg[]> = Object.fromEntries(recentMessages.map((m) => [m.id, [
  { id: "1", from: "them", text: m.preview, time: m.time },
  { id: "2", from: "me", text: "Sure, let me check and get back to you shortly.", time: "Just now" },
]]));

export default function Messages() {
  const [active, setActive] = useState(recentMessages[0]?.id);
  const [threads, setThreads] = useState(seed);
  const [draft, setDraft] = useState("");
  const [q, setQ] = useState("");

  const filtered = recentMessages.filter((m) => m.fromName.toLowerCase().includes(q.toLowerCase()));
  const activeThread = active ? threads[active] ?? [] : [];
  const activeMeta = recentMessages.find((m) => m.id === active);

  const send = () => {
    if (!draft.trim() || !active) return;
    setThreads((p) => ({ ...p, [active]: [...(p[active] ?? []), { id: Date.now().toString(), from: "me", text: draft, time: "Now" }] }));
    setDraft("");
  };

  return (
    <div className="container py-6">
      <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold mb-6">Messages</motion.h1>
      <Card className="overflow-hidden">
        <div className="grid md:grid-cols-[320px_1fr] h-[70vh]">
          <aside className="border-r border-border bg-secondary/30 flex flex-col">
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search conversations" className="pl-9 h-9 bg-background" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filtered.map((m) => (
                <button key={m.id} onClick={() => setActive(m.id)}
                  className={cn("w-full text-left p-4 flex gap-3 border-b border-border/60 hover:bg-accent/50", active === m.id && "bg-accent")}>
                  <Avatar><AvatarImage src={m.fromAvatar} /><AvatarFallback>{m.fromName[0]}</AvatarFallback></Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <div className="font-medium text-sm flex items-center gap-2">
                        {m.fromName} {m.unread && <span className="h-2 w-2 rounded-full bg-primary" />}
                      </div>
                      <div className="text-xs text-muted-foreground">{m.time}</div>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{m.preview}</p>
                  </div>
                </button>
              ))}
            </div>
          </aside>

          <section className="flex flex-col">
            {activeMeta ? (
              <>
                <div className="p-4 border-b flex items-center gap-3">
                  <Avatar><AvatarImage src={activeMeta.fromAvatar} /><AvatarFallback>{activeMeta.fromName[0]}</AvatarFallback></Avatar>
                  <div>
                    <div className="font-semibold">{activeMeta.fromName}</div>
                    <div className="text-xs text-muted-foreground">Active recently</div>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {activeThread.map((m) => (
                    <motion.div key={m.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                      className={cn("flex", m.from === "me" ? "justify-end" : "justify-start")}>
                      <div className={cn("max-w-[75%] rounded-2xl px-4 py-2 text-sm",
                        m.from === "me" ? "gradient-primary text-primary-foreground" : "bg-secondary")}>
                        {m.text}
                        <div className={cn("text-[10px] mt-1 opacity-70", m.from === "me" ? "text-primary-foreground" : "text-muted-foreground")}>{m.time}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="p-4 border-t flex gap-2">
                  <Input value={draft} onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") send(); }} placeholder="Type a message..." />
                  <Button onClick={send} className="gradient-primary text-primary-foreground border-0"><Send className="h-4 w-4" /></Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">Select a conversation</div>
            )}
          </section>
        </div>
      </Card>
    </div>
  );
}
