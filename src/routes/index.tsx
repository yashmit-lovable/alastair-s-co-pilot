import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { TopNav } from "@/components/copilot/TopNav";
import { StandbyState } from "@/components/copilot/StandbyState";
import { LiveCallState } from "@/components/copilot/LiveCallState";
import { PostCallReview } from "@/components/copilot/PostCallReview";
import { RECENT_CALLS, type Call } from "@/lib/mock-data";
import { getCalls } from "@/lib/api";
import { callWs } from "@/lib/ws";
import { rowToCall } from "@/lib/calls";

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
  | { view: "live"; callId: string; callerPhone: string }
  | { view: "review"; callId: string };

function Index() {
  const [state, setState] = useState<AppState>({ view: "standby" });
  const [calls, setCalls] = useState<Call[]>(RECENT_CALLS);

  const refreshCalls = useCallback(async () => {
    try {
      const rows = await getCalls();
      setCalls(rows.map(rowToCall));
    } catch {
      // Keep whatever calls we already have (mock fallback on first load).
    }
  }, []);

  useEffect(() => {
    refreshCalls();
  }, [refreshCalls]);

  useEffect(() => {
    callWs.connect();

    const unsubStarted = callWs.on("call_started", (msg) => {
      if (msg.event !== "call_started") return;
      setState({ view: "live", callId: msg.call_id, callerPhone: msg.caller_phone });
    });

    const unsubEnded = callWs.on("call_ended", (msg) => {
      if (msg.event !== "call_ended") return;
      const row = {
        call_id: msg.call_id,
        caller_phone: "",
        status: "ended",
        started_at: new Date(Date.now() - msg.duration_seconds * 1000).toISOString(),
        ended_at: new Date().toISOString(),
        duration_seconds: msg.duration_seconds,
        transcript: msg.full_transcript,
        full_transcript: msg.full_transcript,
        outcome: null,
        price_agreed: null,
        alastair_notes: null,
        recording_url: null,
      };
      setCalls((prev) => {
        const mapped = rowToCall(row);
        const existingIdx = prev.findIndex((c) => c.id === mapped.id);
        if (existingIdx >= 0) {
          const next = [...prev];
          next[existingIdx] = mapped;
          return next;
        }
        return [mapped, ...prev];
      });
      toast.success("Call ended", { description: "Opening post-call review…" });
      setState({ view: "review", callId: msg.call_id });
      // Refresh from the server in the background to pick up authoritative fields.
      refreshCalls();
    });

    return () => {
      unsubStarted();
      unsubEnded();
    };
  }, [refreshCalls]);

  const openReview = useCallback((id: string) => setState({ view: "review", callId: id }), []);
  const goStandby = useCallback(() => setState({ view: "standby" }), []);

  const simulateCall = useCallback(() => {
    toast("Incoming call", { description: "+91 98214 55021 · Priya Menon" });
    setState({ view: "live", callId: "sim-call", callerPhone: "+91 98214 55021" });
  }, []);

  const endCall = useCallback(() => {
    toast.success("Call ended", { description: "Opening post-call review…" });
    // Open review for the most recent (first) call
    setState({ view: "review", callId: calls[0]?.id ?? RECENT_CALLS[0].id });
  }, [calls]);

  const call = state.view === "review" ? calls.find((c) => c.id === state.callId) ?? RECENT_CALLS.find((c) => c.id === state.callId) ?? RECENT_CALLS[0] : null;

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="animate-slide-up-fade" key={state.view}>
        {state.view === "standby" && <StandbyState calls={calls} onOpenReview={openReview} onSimulateCall={simulateCall} />}
        {state.view === "live" && (
          <LiveCallState callId={state.callId} callerPhone={state.callerPhone} onEnd={endCall} />
        )}
        {state.view === "review" && call && <PostCallReview call={call} onBack={goStandby} />}
      </main>
    </div>
  );
}
