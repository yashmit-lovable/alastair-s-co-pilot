import type { Call, FeedEntry, Outcome } from "@/lib/mock-data";
import type { RawCallRow, RawTranscriptLine } from "@/lib/api";
import { formatTime } from "@/lib/format";

function lineToFeedEntry(line: RawTranscriptLine, index: number): FeedEntry {
  const timestamp = (() => {
    const d = new Date(line.ts);
    return isNaN(d.getTime()) ? line.ts : formatTime(d);
  })();

  if (line.role === "consultation") {
    return {
      id: `${index}`,
      type: "consultation",
      text: "",
      question: "",
      reply: line.text,
      saved: true,
      timestamp,
    };
  }

  return {
    id: `${index}`,
    type: line.role === "user" ? "caller" : "ai",
    text: line.text,
    timestamp,
  };
}

function isValidOutcome(value: string | null): value is Outcome {
  return (
    value === "converted" ||
    value === "following_up" ||
    value === "not_interested" ||
    value === "wrong_number" ||
    value === "hung_up"
  );
}

export function rowToCall(row: RawCallRow): Call {
  const transcriptSource =
    row.status === "ended" || row.full_transcript?.length ? row.full_transcript ?? row.transcript ?? [] : row.transcript ?? [];

  const transcript = transcriptSource.map(lineToFeedEntry);
  const decisionPoints = transcriptSource.filter((l) => l.role === "consultation").length;

  let durationSec = row.duration_seconds ?? 0;
  if (!durationSec && row.started_at && row.ended_at) {
    const start = new Date(row.started_at).getTime();
    const end = new Date(row.ended_at).getTime();
    if (!isNaN(start) && !isNaN(end) && end > start) {
      durationSec = Math.round((end - start) / 1000);
    }
  }

  const startedAt = new Date(row.started_at);

  return {
    id: row.call_id,
    time: !isNaN(startedAt.getTime()) ? formatTime(startedAt) : "",
    timestamp: !isNaN(startedAt.getTime()) ? startedAt : new Date(),
    caller: row.caller_phone,
    callerName: undefined,
    durationSec,
    decisionPoints,
    outcome: isValidOutcome(row.outcome) ? row.outcome : "following_up",
    priceAgreed: row.price_agreed ?? undefined,
    transcript,
  };
}
