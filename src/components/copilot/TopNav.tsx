import { useEffect, useState } from "react";
import { Radio, Sparkles } from "lucide-react";

export function TopNav() {
  const [now, setNow] = useState(new Date());
  const [connected] = useState(true);
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const dateStr = now.toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long",
  });
  const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/30">
            <Sparkles className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="text-sm font-semibold tracking-tight">Admissions Co-Pilot</span>
          <span className="ml-2 rounded-md border border-border/60 bg-muted/40 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            v2.4
          </span>
        </div>

        <div className="hidden items-center gap-2 text-xs text-muted-foreground md:flex">
          <span className="font-medium text-foreground/80">{dateStr}</span>
          <span className="text-border">·</span>
          <span className="font-mono tabular-nums">{timeStr}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1.5 text-xs">
            <span className="relative flex h-1.5 w-1.5">
              <span className={`absolute inline-flex h-full w-full rounded-full ${connected ? "bg-emerald-400" : "bg-rose-500"} animate-ping opacity-60`} />
              <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${connected ? "bg-emerald-400" : "bg-rose-500"}`} />
            </span>
            <Radio className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">{connected ? "Live" : "Reconnecting…"}</span>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary/40 to-primary/10 text-xs font-semibold text-primary-foreground">
            AK
          </div>
        </div>
      </div>
    </header>
  );
}
