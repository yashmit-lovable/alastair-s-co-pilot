import { RECENT_CALLS, OUTCOME_META } from "@/lib/mock-data";
import { formatDuration } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, Phone, TrendingUp, Clock3, PhoneIncoming } from "lucide-react";

export function StandbyState({ onOpenReview, onSimulateCall }: { onOpenReview: (id: string) => void; onSimulateCall: () => void }) {
  const converted = RECENT_CALLS.filter((c) => c.outcome === "converted").length;
  const following = RECENT_CALLS.filter((c) => c.outcome === "following_up").length;

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-10">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-border/60 bg-card/40 py-20">
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-40" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/40 blur-3xl animate-breathe" />
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground backdrop-blur">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            Waiting for incoming call
          </div>
          <h1 className="bg-gradient-to-b from-foreground to-foreground/50 bg-clip-text text-center text-6xl font-semibold tracking-tighter text-transparent md:text-7xl">
            Standing by
          </h1>
          <p className="max-w-md text-center text-sm text-muted-foreground">
            Your AI is monitoring the admissions line. You'll be connected to your private channel the moment a call comes in.
          </p>
          <Button onClick={onSimulateCall} size="lg" className="mt-2 gap-2 rounded-full bg-primary/90 shadow-lg shadow-primary/30 hover:bg-primary">
            <PhoneIncoming className="h-4 w-4" />
            Simulate incoming call
          </Button>
        </div>
      </section>

      {/* Stats */}
      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard label="Calls today" value={RECENT_CALLS.length.toString()} delta="+2 vs yesterday" icon={<Phone className="h-4 w-4" />} accent="text-foreground" />
        <StatCard label="Converted today" value={converted.toString()} delta="₹10,30,000 in fees" icon={<TrendingUp className="h-4 w-4" />} accent="text-emerald-400" />
        <StatCard label="Following up" value={following.toString()} delta="Next: today 4:00 PM" icon={<Clock3 className="h-4 w-4" />} accent="text-amber-400" />
      </section>

      {/* Recent calls */}
      <section className="mt-6">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-sm font-semibold tracking-tight">Recent calls</h2>
            <p className="text-xs text-muted-foreground">Tap a row to open the post-call review.</p>
          </div>
          <div className="text-xs text-muted-foreground">Showing 6 of 24 today</div>
        </div>

        <Card className="overflow-hidden border-border/60 bg-card/60 p-0">
          <div className="grid grid-cols-[110px_1fr_100px_140px_150px_120px] items-center gap-4 border-b border-border/50 px-5 py-3 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            <div>Time</div>
            <div>Caller</div>
            <div>Duration</div>
            <div>Decisions</div>
            <div>Outcome</div>
            <div className="text-right">Action</div>
          </div>
          <div>
            {RECENT_CALLS.map((c, i) => (
              <div
                key={c.id}
                className="group grid grid-cols-[110px_1fr_100px_140px_150px_120px] items-center gap-4 border-b border-border/40 px-5 py-4 text-sm transition-colors last:border-b-0 hover:bg-muted/30"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="font-mono text-xs text-muted-foreground tabular-nums">{c.time}</div>
                <div className="min-w-0">
                  <div className="truncate font-medium">{c.callerName ?? "Unknown"}</div>
                  <div className="truncate font-mono text-[11px] text-muted-foreground">{c.caller}</div>
                </div>
                <div className="font-mono text-xs tabular-nums text-muted-foreground">{formatDuration(c.durationSec)}</div>
                <div className="flex items-center gap-2">
                  <div className="flex h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(c.decisionPoints * 20, 100)}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground tabular-nums">{c.decisionPoints}</span>
                </div>
                <div>
                  <Badge variant="outline" className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${OUTCOME_META[c.outcome].className}`}>
                    {OUTCOME_META[c.outcome].label}
                  </Badge>
                </div>
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onOpenReview(c.id)}
                    className="gap-1 text-xs text-muted-foreground opacity-60 transition-opacity group-hover:text-foreground group-hover:opacity-100"
                  >
                    Review
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}

function StatCard({ label, value, delta, icon, accent }: { label: string; value: string; delta: string; icon: React.ReactNode; accent: string }) {
  return (
    <Card className="border-border/60 bg-card/60 p-5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">{label}</span>
        <span className="text-muted-foreground">{icon}</span>
      </div>
      <div className={`mt-3 text-4xl font-semibold tracking-tight ${accent}`}>{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{delta}</div>
    </Card>
  );
}
