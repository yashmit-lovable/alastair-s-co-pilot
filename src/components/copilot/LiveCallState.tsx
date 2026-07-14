import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { COURSES } from "@/lib/mock-data";
import { formatDuration, formatINR, formatTime } from "@/lib/format";
import { callWs } from "@/lib/ws";
import { sendInstruction } from "@/lib/api";
import { ChevronDown, Headphones, Mic, PhoneOff, Send, Sparkles, TrendingDown, UserRound } from "lucide-react";

type Entry =
  | { kind: "caller"; id: string; time: string; text: string }
  | { kind: "ai"; id: string; time: string; text: string }
  | { kind: "consult"; id: string; time: string; question: string; reply?: string; saved?: boolean };

export function LiveCallState({
  callId,
  callerPhone,
  onEnd,
}: {
  callId: string;
  callerPhone: string;
  onEnd: () => void;
}) {
  const [seconds, setSeconds] = useState(0);
  const [entries, setEntries] = useState<Entry[]>([]);
  const feedRef = useRef<HTMLDivElement>(null);

  const [composerText, setComposerText] = useState("");
  const [composerSending, setComposerSending] = useState(false);
  const lastSentTextRef = useRef<string | null>(null);
  const entryIdRef = useRef(0);

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    // Reset feed when the active call changes.
    setEntries([]);
    setSeconds(0);
    setComposerText("");
    setComposerSending(false);
    lastSentTextRef.current = null;

    const unsubscribe = callWs.on("transcript_update", (msg) => {
      if (msg.event !== "transcript_update" || msg.call_id !== callId) return;
      const line = msg.latest_line;
      entryIdRef.current += 1;
      const id = `${entryIdRef.current}`;
      const time = (() => {
        const d = new Date(line.ts);
        return isNaN(d.getTime()) ? line.ts : formatTime(d);
      })();

      setEntries((prev) => {
        if (line.role === "consultation") {
          return [...prev, { kind: "consult", id, time, question: "", reply: line.text, saved: true }];
        }
        return [...prev, { kind: line.role === "user" ? "caller" : "ai", id, time, text: line.text }];
      });

      if (line.role === "consultation" && lastSentTextRef.current !== null && line.text === lastSentTextRef.current) {
        setComposerSending(false);
        setComposerText("");
        lastSentTextRef.current = null;
      }
    });

    return unsubscribe;
  }, [callId]);

  useEffect(() => {
    feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: "smooth" });
  }, [entries, composerSending]);

  const handleSendInstruction = async () => {
    const text = composerText.trim();
    if (!text || composerSending) return;
    setComposerSending(true);
    lastSentTextRef.current = text;
    try {
      await sendInstruction(callId, text);
    } catch {
      toast.error("Couldn't send instruction", { description: "Please try again." });
      setComposerSending(false);
      lastSentTextRef.current = null;
    }
  };

  const negotiating = entries.some((e) => e.kind === "consult" && !!e.reply);
  const course = COURSES[0];
  const callerOffer = 275000;
  const currentOffer = 300000;
  const range = course.basePrice - course.floorPrice;
  const offerPct = Math.max(0, Math.min(100, ((currentOffer - course.floorPrice) / range) * 100));

  return (
    <div className="mx-auto grid max-w-[1600px] gap-4 px-6 py-6 lg:grid-cols-[1.85fr_1fr]">
      {/* LEFT: Live feed */}
      <div className="flex min-h-[calc(100vh-140px)] flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/50">
        <div className="flex items-center justify-between border-b border-border/50 bg-gradient-to-r from-rose-500/5 to-transparent px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full border border-rose-500/40 bg-rose-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-rose-400">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500 opacity-70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-rose-500" />
              </span>
              Live
            </div>
            <span className="font-mono text-sm tabular-nums text-foreground/90">{formatDuration(seconds)}</span>
            <span className="text-border">·</span>
            <span className="font-mono text-xs text-muted-foreground">{callerPhone}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <Headphones className="h-3.5 w-3.5" />
            Alastair on private channel
            <Button variant="ghost" size="sm" onClick={onEnd} className="ml-2 h-7 gap-1.5 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300">
              <PhoneOff className="h-3.5 w-3.5" />
              End
            </Button>
          </div>
        </div>

        <div ref={feedRef} className="flex-1 space-y-3 overflow-y-auto p-6">
          {entries.map((e, i) => (
            <div key={`${e.id}-${i}-${e.kind}`} className="animate-slide-up-fade">
              {e.kind === "caller" && <CallerBubble time={e.time} text={e.text} />}
              {e.kind === "ai" && <AiBubble time={e.time} text={e.text} />}
              {e.kind === "consult" && <ConsultCard time={e.time} question={e.question} reply={e.reply} saved={e.saved} />}
            </div>
          ))}

          <div className="animate-slide-up-fade">
            <ConsultCard
              time={formatTime(new Date())}
              question=""
              sending={composerSending}
              value={composerText}
              onChangeValue={setComposerText}
              onSubmit={handleSendInstruction}
            />
          </div>

          <div className="flex items-center gap-2 pl-2 pt-1 text-xs text-muted-foreground">
            <span className="flex gap-1">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground/60 [animation-delay:0ms]" />
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground/60 [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground/60 [animation-delay:300ms]" />
            </span>
            AI listening…
          </div>
        </div>
      </div>

      {/* RIGHT: Context panel */}
      <div className="flex flex-col gap-4">
        {negotiating && (
          <Card className="animate-slide-up-fade border-amber-500/30 bg-gradient-to-b from-amber-500/5 to-transparent p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-amber-400">
                <TrendingDown className="h-3 w-3" />
                Active negotiation
              </div>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">live</span>
            </div>
            <div className="mt-3 text-sm font-medium">{course.name}</div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Caller offered</span>
                <span className="font-mono tabular-nums text-rose-300">{formatINR(callerOffer)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Current offer to caller</span>
                <span className="font-mono tabular-nums text-foreground">{formatINR(currentOffer)}</span>
              </div>

              <div className="pt-1">
                <div className="relative h-2 rounded-full bg-muted/60">
                  <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-rose-500/70 via-amber-400/70 to-emerald-500/70" style={{ width: "100%" }} />
                  <div
                    className="absolute -top-1 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-background bg-primary shadow-lg shadow-primary/40"
                    style={{ left: `${offerPct}%` }}
                  />
                </div>
                <div className="mt-2 flex justify-between text-[10px] font-mono uppercase tabular-nums text-muted-foreground">
                  <span className="text-rose-400">Floor {formatINR(course.floorPrice)}</span>
                  <span>Base {formatINR(course.basePrice)}</span>
                </div>
              </div>
            </div>
          </Card>
        )}

        <Card className="border-border/60 bg-card/60 p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              <Sparkles className="h-3 w-3 text-primary" />
              Course quick reference
            </div>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{COURSES.length}</span>
          </div>
          <div className="space-y-2">
            {COURSES.map((c, i) => (
              <Collapsible key={c.id} defaultOpen={i === 0}>
                <CollapsibleTrigger className="group flex w-full items-center justify-between rounded-lg border border-border/50 bg-background/40 px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted/40">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{c.name}</div>
                    <div className="text-[11px] text-muted-foreground">{c.duration} · {c.placementRate}% placement</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs tabular-nums text-foreground/80">{formatINR(c.basePrice)}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-1 space-y-1.5 rounded-lg border border-border/40 bg-muted/20 px-3 py-2.5 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Floor</span>
                    <span className="font-mono tabular-nums text-rose-300">{formatINR(c.floorPrice)}</span>
                  </div>
                  <ul className="space-y-1 pt-1">
                    {c.highlights.map((h) => (
                      <li key={h} className="flex items-start gap-2 text-muted-foreground">
                        <span className="mt-1 h-1 w-1 rounded-full bg-primary" />
                        {h}
                      </li>
                    ))}
                  </ul>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </Card>

        <Card className="border-border/60 bg-card/60 p-5">
          <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            <UserRound className="h-3 w-3" />
            Caller history
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">PM</div>
            <div>
              <div className="text-sm font-medium">First-time caller</div>
              <div className="text-[11px] text-muted-foreground">Landed via Google Ads · Data Science page</div>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Badge variant="outline" className="border-border/60 text-[10px] text-muted-foreground">Warm lead</Badge>
            <Badge variant="outline" className="border-border/60 text-[10px] text-muted-foreground">Price sensitive</Badge>
          </div>
        </Card>
      </div>
    </div>
  );
}

function CallerBubble({ time, text }: { time: string; text: string }) {
  return (
    <div className="flex gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border/60 bg-muted/40 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Cal
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Caller</span>
          <span className="font-mono text-[10px] tabular-nums text-muted-foreground/70">{time}</span>
        </div>
        <p className="mt-1 text-sm text-foreground/90">{text}</p>
      </div>
    </div>
  );
}

function AiBubble({ time, text }: { time: string; text: string }) {
  return (
    <div className="flex gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground shadow-md shadow-primary/30">
        AI
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-primary">Co-Pilot</span>
          <span className="font-mono text-[10px] tabular-nums text-muted-foreground/70">{time}</span>
        </div>
        <p className="mt-1 text-sm text-foreground/85">{text}</p>
      </div>
    </div>
  );
}

function ConsultCard({
  time,
  question,
  reply,
  saved,
  sending,
  value,
  onChangeValue,
  onSubmit,
}: {
  time: string;
  question: string;
  reply?: string;
  saved?: boolean;
  sending?: boolean;
  value?: string;
  onChangeValue?: (v: string) => void;
  onSubmit?: () => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/[0.06] to-transparent p-4 pl-5 animate-glow-amber">
      <div className="absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b from-amber-400 to-amber-500/40" />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-amber-400">
          <Mic className="h-3 w-3" />
          AI consulted Alastair
        </div>
        <span className="font-mono text-[10px] tabular-nums text-muted-foreground/70">{time}</span>
      </div>
      <div className="mt-3 space-y-2">
        {question && (
          <div>
            <div className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Asked</div>
            <p className="mt-0.5 text-sm text-foreground/90">"{question}"</p>
          </div>
        )}
        {reply ? (
          <div className="animate-slide-up-fade">
            <div className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Alastair replied</div>
            <p className="mt-0.5 text-sm text-foreground/90">"{reply}"</p>
          </div>
        ) : sending ? (
          <div className="flex items-center gap-2 text-xs italic text-amber-300/70">
            <span className="flex gap-0.5">
              <span className="h-1 w-1 animate-pulse rounded-full bg-amber-400 [animation-delay:0ms]" />
              <span className="h-1 w-1 animate-pulse rounded-full bg-amber-400 [animation-delay:150ms]" />
              <span className="h-1 w-1 animate-pulse rounded-full bg-amber-400 [animation-delay:300ms]" />
            </span>
            Sent — awaiting confirmation…
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Send an instruction</div>
            <Textarea
              className="min-h-[64px] resize-none border-amber-500/30 bg-background/40 text-sm placeholder:text-muted-foreground/60 focus-visible:ring-amber-500/40"
              placeholder="Tell the AI what to do next…"
              value={value ?? ""}
              onChange={(e) => onChangeValue?.(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSubmit?.();
                }
              }}
            />
            <div className="flex items-center justify-between">
              <span className="text-[10px] italic text-amber-300/70">Awaiting your response…</span>
              <Button
                size="sm"
                onClick={() => onSubmit?.()}
                disabled={!value?.trim()}
                className="h-7 gap-1.5 bg-amber-500/90 text-[11px] text-background hover:bg-amber-500"
              >
                <Send className="h-3 w-3" />
                Send
              </Button>
            </div>
          </div>
        )}
        {saved && (
          <div className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
            <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 fill-none stroke-current stroke-2">
              <path d="M2 6.5L5 9.5L10 3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Saved to knowledge base
          </div>
        )}
      </div>
    </div>
  );
}
