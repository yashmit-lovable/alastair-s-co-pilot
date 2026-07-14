import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { TopNav } from "@/components/copilot/TopNav";
import { StandbyState } from "@/components/copilot/StandbyState";
import { LiveCallState } from "@/components/copilot/LiveCallState";
import { PostCallReview } from "@/components/copilot/PostCallReview";
import { RECENT_CALLS } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Admissions Co-Pilot — Dashboard" },
      { name: "description", content: "AI-assisted admissions call intelligence for institutional leaders." },
    ],
  }),
  component: Index,
});

type AppState =
  | { view: "standby" }
  | { view: "live" }
  | { view: "review"; callId: string };

function Index() {
  const [state, setState] = useState<AppState>({ view: "standby" });

  const openReview = useCallback((id: string) => setState({ view: "review", callId: id }), []);
  const goStandby = useCallback(() => setState({ view: "standby" }), []);

  const simulateCall = useCallback(() => {
    toast("Incoming call", { description: "+91 98214 55021 · Priya Menon" });
    setState({ view: "live" });
  }, []);

  const endCall = useCallback(() => {
    toast.success("Call ended", { description: "Opening post-call review…" });
    // Open review for the most recent (first) mock call
    setState({ view: "review", callId: RECENT_CALLS[0].id });
  }, []);

  const call = state.view === "review" ? RECENT_CALLS.find((c) => c.id === state.callId) ?? RECENT_CALLS[0] : null;

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="animate-slide-up-fade" key={state.view}>
        {state.view === "standby" && <StandbyState onOpenReview={openReview} onSimulateCall={simulateCall} />}
        {state.view === "live" && <LiveCallState onEnd={endCall} />}
        {state.view === "review" && call && <PostCallReview call={call} onBack={goStandby} />}
      </main>
    </div>
  );
}
