"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { Send, Loader2, MessageCircle, Sparkles, Plus, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import {
  sendCoachMessage,
  applyCoachSkills,
  clearCoachChat,
} from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function CoachChat({
  initialMessages,
  suggestedPrompts,
  roleTitle,
}: {
  initialMessages: ChatMessage[];
  suggestedPrompts: string[];
  roleTitle: string | null;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [proposed, setProposed] = useState<string[]>([]);
  const [pending, startTransition] = useTransition();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pending]);

  function send(text: string) {
    const msg = text.trim();
    if (!msg || pending) return;
    setInput("");
    setProposed([]);
    setMessages((m) => [
      ...m,
      { id: `u-${Date.now()}`, role: "user", content: msg },
    ]);
    startTransition(async () => {
      const res = await sendCoachMessage(msg);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      setMessages((m) => [
        ...m,
        { id: `a-${Date.now()}`, role: "assistant", content: res.reply ?? "" },
      ]);
      if (res.proposedSkills?.length) setProposed(res.proposedSkills);
    });
  }

  function addSkills() {
    startTransition(async () => {
      const res = await applyCoachSkills(proposed);
      if (res?.error) toast.error(res.error);
      else {
        toast.success("Skills added to your profile — your map will update.");
        setProposed([]);
      }
    });
  }

  function clear() {
    startTransition(async () => {
      await clearCoachChat();
      setMessages([]);
      setProposed([]);
    });
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-3xl flex-col p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <MessageCircle className="h-6 w-6 text-primary" />
            AI Career Coach
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            A mentor who knows your graph
            {roleTitle ? ` — you're at ${roleTitle}` : ""}. Grounded in your
            position, not generic advice.
          </p>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clear} disabled={pending}>
            Clear
          </Button>
        )}
      </div>

      {/* Messages */}
      <div className="mt-4 flex-1 space-y-4 overflow-y-auto pr-1">
        {messages.length === 0 && (
          <div className="rounded-xl border border-dashed p-8 text-center">
            <Sparkles className="mx-auto h-8 w-8 text-primary" />
            <p className="mt-3 font-medium">Ask your coach anything</p>
            <p className="mt-1 text-sm text-muted-foreground">
              It answers using your real skills, role, and the career graph.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {suggestedPrompts.map((p) => (
                <button
                  key={p}
                  onClick={() => send(p)}
                  className="rounded-full border px-3 py-1.5 text-xs transition-colors hover:border-primary/50 hover:bg-accent"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                m.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "border bg-card",
              )}
            >
              {m.role === "assistant" ? (
                <div className="prose-coach space-y-2">
                  <ReactMarkdown
                    components={{
                      strong: ({ children }) => (
                        <span className="font-semibold text-foreground">{children}</span>
                      ),
                      ul: ({ children }) => (
                        <ul className="my-1 ml-4 list-disc space-y-1">{children}</ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="my-1 ml-4 list-decimal space-y-1">{children}</ol>
                      ),
                      p: ({ children }) => <p className="[&:not(:first-child)]:mt-2">{children}</p>,
                    }}
                  >
                    {m.content}
                  </ReactMarkdown>
                </div>
              ) : (
                m.content
              )}
            </div>
          </div>
        ))}

        {pending && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl border bg-card px-4 py-2.5 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
            </div>
          </div>
        )}

        {/* Proposed skill update — the closed loop */}
        {proposed.length > 0 && (
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
            <p className="text-sm font-medium">Add these skills to your profile?</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {proposed.map((s) => (
                <Badge key={s} variant="secondary" className="gap-1">
                  <Plus className="h-3 w-3" />
                  {s}
                </Badge>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <Button size="sm" onClick={addSkills} disabled={pending} className="gap-1.5">
                <Check className="h-3.5 w-3.5" /> Add to profile
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setProposed([])}>
                Dismiss
              </Button>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="mt-4 flex gap-2"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your coach…"
          disabled={pending}
        />
        <Button type="submit" disabled={pending || !input.trim()} className="gap-1.5">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
