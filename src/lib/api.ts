const API_BASE = "https://admissions-ai-mvp.onrender.com/api";

export type RawTranscriptLine = {
  role: "user" | "assistant" | "consultation";
  text: string;
  ts: string;
};

export type RawCallRow = {
  call_id: string;
  caller_phone: string;
  status: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  transcript: RawTranscriptLine[] | null;
  full_transcript: RawTranscriptLine[] | null;
  outcome: string | null;
  price_agreed: number | null;
  alastair_notes: string | null;
  recording_url: string | null;
};

export async function getCalls(): Promise<RawCallRow[]> {
  const res = await fetch(`${API_BASE}/calls`);
  if (!res.ok) throw new Error(`Failed to fetch calls: ${res.status}`);
  return res.json();
}

export async function sendInstruction(callId: string, message: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/instruct`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ call_id: callId, message }),
  });
  if (!res.ok) throw new Error(`Failed to send instruction: ${res.status}`);
  return res.json();
}

export async function updateOutcome(
  callId: string,
  payload: { outcome: string; price_agreed?: number; alastair_notes?: string },
): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/calls/${callId}/outcome`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to update outcome: ${res.status}`);
  return res.json();
}
