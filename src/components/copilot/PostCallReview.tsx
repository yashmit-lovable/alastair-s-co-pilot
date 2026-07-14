import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Call, Outcome } from "@/lib/mock-data";
import { OUTCOME_META, TRAINING_HISTORY, KB_ADDITIONS_SESSION, BEHAVIOR_CHIPS } from "@/lib/mock-data";
import { formatDuration, formatINR } from "@/lib/format";
import { updateOutcome } from "@/lib/api";
import {
  ArrowLeft, BookPlus, Brain, CalendarDays, CheckCircle2, Clock,
  Download, FileText, Mic, Phone, Save, Sparkles, Target, Wand2,
} from "lucide-react";

export function PostCallReview({ call, onBack }: { call: Call; onBack: () => void }) {
  const [tab, setTab] = useState<string>("transcript");

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-6">
      <button onClick={onBack} className="mb-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to dashboard
      </button>

      {/* Call header card */}
      <Card className="mb-5 border-border/60 bg-card/60 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
              {(call.callerName ?? "?").slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold tracking-tight">{call.callerName ?? "Unknown caller"}</h1>
                <Badge variant="outline" className={`rounded-full border px-2 py-0 text-[10px] ${OUTCOME_META[call.outcome].className}`}>
                  {OUTCOME_META[call.outcome].label}
                </Badge>
              </div>
              <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="font-mono">{call.caller}</span>
                <span className="text-border">·</span>
                <span>{call.time}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-6 text-xs">
            <Stat icon={<Clock className="h-3 w-3" />} label="Duration" value={formatDuration(call.durationSec)} />
            <Stat icon={<Mic className="h-3 w-3" />} label="Consultations" value={call.decisionPoints.toString()} />
            {call.priceAgreed && <Stat icon={<Target className="h-3 w-3" />} label="Fee agreed" value={formatINR(call.priceAgreed)} />}
          </div>
        </div>
      </Card>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid w-full max-w-lg grid-cols-3 rounded-xl bg-card/60 p-1">
          <TabsTrigger value="transcript" className="gap-1.5 rounded-lg text-xs">
            <FileText className="h-3.5 w-3.5" /> Transcript
          </TabsTrigger>
          <TabsTrigger value="train" className="gap-1.5 rounded-lg text-xs">
            <Brain className="h-3.5 w-3.5" /> Train AI
          </TabsTrigger>
          <TabsTrigger value="outcome" className="gap-1.5 rounded-lg text-xs">
            <CheckCircle2 className="h-3.5 w-3.5" /> Outcome
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transcript" className="mt-5">
          <TranscriptTab call={call} />
        </TabsContent>
        <TabsContent value="train" className="mt-5">
          <TrainTab />
        </TabsContent>
        <TabsContent value="outcome" className="mt-5">
          <OutcomeTab call={call} onSave={onBack} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
        {icon} {label}
      </div>
      <div className="mt-0.5 font-mono text-sm tabular-nums text-foreground">{value}</div>
    </div>
  );
}

function TranscriptTab({ call }: { call: Call }) {
  return (
    <Card className="border-border/60 bg-card/60 p-0">
      <div className="flex items-center justify-between border-b border-border/50 px-5 py-3">
        <div className="text-xs text-muted-foreground">Full transcript · {call.transcript.length} entries</div>
        <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs" onClick={() => toast.success("Transcript exported")}>
          <Download className="h-3.5 w-3.5" />
          Export
        </Button>
      </div>
      <ScrollArea className="h-[560px]">
        <div className="space-y-4 p-6">
          {call.transcript.length === 0 && <div className="py-12 text-center text-sm text-muted-foreground">No transcript entries.</div>}
          {call.transcript.map((e) => (
            <div key={e.id} className="animate-slide-up-fade">
              {e.type === "caller" && (
                <div className="flex gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border/60 bg-muted/40 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Cal</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Caller</span>
                      <span className="font-mono text-[10px] tabular-nums text-muted-foreground/70">{e.timestamp}</span>
                    </div>
                    <p className="mt-1 text-sm text-foreground/90">{e.text}</p>
                  </div>
                </div>
              )}
              {e.type === "ai" && (
                <div className="flex gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground shadow-md shadow-primary/30">AI</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-widest text-primary">Co-Pilot</span>
                      <span className="font-mono text-[10px] tabular-nums text-muted-foreground/70">{e.timestamp}</span>
                    </div>
                    <p className="mt-1 text-sm text-foreground/85">{e.text}</p>
                  </div>
                </div>
              )}
              {e.type === "consultation" && (
                <div className="relative overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/[0.06] to-transparent p-4 pl-5">
                  <div className="absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b from-amber-400 to-amber-500/40" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-amber-400">
                      <Mic className="h-3 w-3" /> AI → Alastair
                    </div>
                    <span className="font-mono text-[10px] tabular-nums text-muted-foreground/70">{e.timestamp}</span>
                  </div>
                  <div className="mt-3 space-y-2 text-sm">
                    <div>
                      <div className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Asked</div>
                      <p className="mt-0.5">"{e.question}"</p>
                    </div>
                    <div>
                      <div className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Alastair replied</div>
                      <p className="mt-0.5">"{e.reply}"</p>
                    </div>
                    {e.saved && (
                      <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                        <CheckCircle2 className="h-2.5 w-2.5" /> Saved to knowledge base
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}

function TrainTab() {
  const [category, setCategory] = useState("Course");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [behavior, setBehavior] = useState("");

  const toggleChip = (c: string) =>
    setSelectedChips((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* Knowledge base */}
      <Card className="border-border/60 bg-card/60 p-5">
        <div className="mb-4 flex items-center gap-2">
          <BookPlus className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold tracking-tight">Add to knowledge base</h3>
        </div>

        <div className="space-y-3">
          <div>
            <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="mt-1 bg-background/40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Course">Course</SelectItem>
                <SelectItem value="Pricing">Pricing</SelectItem>
                <SelectItem value="Policy">Policy</SelectItem>
                <SelectItem value="Negotiation Rule">Negotiation Rule</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Title</Label>
            <Input className="mt-1 bg-background/40" placeholder="e.g. Fintech Foundations Cert." value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Content or bullet points</Label>
            <Textarea className="mt-1 min-h-[110px] bg-background/40" placeholder="- 9 month duration&#10;- Base fee ₹1,50,000&#10;- Placement partners: HDFC, ICICI…" value={content} onChange={(e) => setContent(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-1.5" onClick={() => toast.success("AI is refining your notes…", { description: "Draft ready in a moment." })}>
              <Wand2 className="h-3.5 w-3.5" /> Refine with AI
            </Button>
            <Button className="flex-1 gap-1.5 bg-primary/90 hover:bg-primary" onClick={() => { toast.success("Saved to knowledge base"); setTitle(""); setContent(""); }}>
              <Save className="h-3.5 w-3.5" /> Save entry
            </Button>
          </div>
        </div>

        <Separator className="my-5 bg-border/50" />

        <div>
          <div className="mb-2 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Added this session</div>
          <div className="space-y-1.5">
            {KB_ADDITIONS_SESSION.map((k) => (
              <div key={k.id} className="flex items-center justify-between rounded-lg border border-border/40 bg-background/30 px-3 py-2 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                  <span className="font-medium">{k.title}</span>
                  <Badge variant="outline" className="border-border/60 text-[9px] text-muted-foreground">{k.category}</Badge>
                </div>
                <span className="text-[10px] text-muted-foreground">{k.added}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Behavior training */}
      <Card className="border-border/60 bg-card/60 p-5">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold tracking-tight">Behavior training</h3>
        </div>

        <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">What should the AI do differently next time?</Label>
        <Textarea className="mt-1 min-h-[90px] bg-background/40" placeholder="e.g. When caller says the fee is too high, don't defend the price immediately — ask about their goals first." value={behavior} onChange={(e) => setBehavior(e.target.value)} />

        <div className="mt-3">
          <div className="mb-2 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Quick chips</div>
          <div className="flex flex-wrap gap-1.5">
            {BEHAVIOR_CHIPS.map((c) => (
              <button
                key={c}
                onClick={() => toggleChip(c)}
                className={`rounded-full border px-2.5 py-1 text-[11px] transition-all ${
                  selectedChips.includes(c)
                    ? "border-primary/60 bg-primary/15 text-primary"
                    : "border-border/60 bg-background/40 text-muted-foreground hover:border-border hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <Button
          className="mt-4 w-full gap-1.5 bg-primary/90 hover:bg-primary"
          onClick={() => { toast.success("Training instruction saved"); setBehavior(""); setSelectedChips([]); }}
        >
          <Brain className="h-3.5 w-3.5" /> Train AI
        </Button>

        <Separator className="my-5 bg-border/50" />

        <div>
          <div className="mb-2 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Recent training</div>
          <div className="space-y-2">
            {TRAINING_HISTORY.map((t) => (
              <div key={t.id} className="rounded-lg border border-border/40 bg-background/30 px-3 py-2.5">
                <div className="text-xs text-foreground/90">{t.instruction}</div>
                <div className="mt-1 text-[10px] text-muted-foreground">{t.date}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

function OutcomeTab({ call, onSave }: { call: Call; onSave: () => void }) {
  const [outcome, setOutcome] = useState<Outcome>(call.outcome);
  const [price, setPrice] = useState(call.priceAgreed?.toString() ?? "");
  const [followUp, setFollowUp] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  return (
    <div className="mx-auto max-w-2xl">
      <Card className="border-border/60 bg-card/60 p-6">
        <div className="mb-5 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold tracking-tight">Log call outcome</h3>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Outcome</Label>
            <Select value={outcome} onValueChange={(v) => setOutcome(v as Outcome)}>
              <SelectTrigger className="mt-1 bg-background/40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="converted">Converted</SelectItem>
                <SelectItem value="following_up">Following Up</SelectItem>
                <SelectItem value="not_interested">Not Interested</SelectItem>
                <SelectItem value="wrong_number">Wrong Number</SelectItem>
                <SelectItem value="hung_up">Hung Up Early</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {outcome === "converted" && (
            <div className="animate-slide-up-fade">
              <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Fee agreed</Label>
              <div className="relative mt-1">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-muted-foreground">₹</span>
                <Input
                  className="bg-background/40 pl-7 font-mono tabular-nums"
                  placeholder="3,10,000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
              <div className="mt-1 text-[10px] text-muted-foreground">Indian format · e.g. 3,50,000</div>
            </div>
          )}

          {outcome === "following_up" && (
            <div className="animate-slide-up-fade">
              <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Follow-up date</Label>
              <div className="relative mt-1">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="date"
                  className="bg-background/40 pl-9"
                  value={followUp}
                  onChange={(e) => setFollowUp(e.target.value)}
                />
              </div>
            </div>
          )}

          <div>
            <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Notes</Label>
            <Textarea className="mt-1 min-h-[110px] bg-background/40" placeholder="Anything to remember about this caller for next time…" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          <Button
            className="mt-2 h-11 w-full gap-2 bg-primary text-sm font-semibold shadow-lg shadow-primary/25 hover:bg-primary/90"
            disabled={saving}
            onClick={async () => {
              setSaving(true);
              try {
                await updateOutcome(call.id, {
                  outcome,
                  price_agreed: outcome === "converted" && price ? Number(price.replace(/,/g, "")) : undefined,
                  alastair_notes: notes || undefined,
                });
                toast.success("Outcome logged", { description: `Marked as ${OUTCOME_META[outcome].label}` });
                onSave();
              } catch {
                toast.error("Couldn't save outcome", { description: "Please try again." });
              } finally {
                setSaving(false);
              }
            }}
          >
            <Save className="h-4 w-4" />
            Save & close
          </Button>

          <div className="flex items-center justify-center gap-2 pt-2 text-[10px] text-muted-foreground">
            <Phone className="h-3 w-3" />
            Return to standby
          </div>
        </div>
      </Card>
    </div>
  );
}
