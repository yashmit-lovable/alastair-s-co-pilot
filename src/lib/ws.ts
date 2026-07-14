const WS_URL = "wss://admissions-ai-mvp.onrender.com";

export type WsEvent =
  | { event: "call_started"; call_id: string; caller_phone: string }
  | {
      event: "transcript_update";
      call_id: string;
      latest_line: { role: "user" | "assistant" | "consultation"; text: string; ts: string };
    }
  | {
      event: "call_ended";
      call_id: string;
      full_transcript: { role: "user" | "assistant" | "consultation"; text: string; ts: string }[];
      duration_seconds: number;
    };

export type ConnectionStatus = "connected" | "connecting" | "disconnected";

type EventName = WsEvent["event"];
type EventCallback = (msg: WsEvent) => void;
type StatusCallback = (status: ConnectionStatus) => void;

class CallWsClient {
  private socket: WebSocket | null = null;
  private listeners = new Map<EventName, Set<EventCallback>>();
  private statusListeners = new Set<StatusCallback>();
  private status: ConnectionStatus = "connecting";
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectDelay = 2000;
  private manuallyClosed = false;

  connect() {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }
    this.manuallyClosed = false;
    this.setStatus("connecting");

    try {
      this.socket = new WebSocket(WS_URL);
    } catch {
      this.scheduleReconnect();
      return;
    }

    this.socket.addEventListener("open", () => {
      this.reconnectDelay = 2000;
      this.setStatus("connected");
    });

    this.socket.addEventListener("message", (ev) => {
      try {
        const data = JSON.parse(ev.data) as WsEvent;
        const set = this.listeners.get(data.event);
        set?.forEach((cb) => cb(data));
      } catch {
        // ignore malformed messages
      }
    });

    this.socket.addEventListener("close", () => {
      this.setStatus("disconnected");
      if (!this.manuallyClosed) this.scheduleReconnect();
    });

    this.socket.addEventListener("error", () => {
      this.socket?.close();
    });
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, this.reconnectDelay);
    this.reconnectDelay = Math.min(this.reconnectDelay * 1.5, 15000);
  }

  private setStatus(status: ConnectionStatus) {
    this.status = status;
    this.statusListeners.forEach((cb) => cb(status));
  }

  getStatus(): ConnectionStatus {
    return this.status;
  }

  onStatusChange(cb: StatusCallback): () => void {
    this.statusListeners.add(cb);
    return () => this.statusListeners.delete(cb);
  }

  on(event: EventName, cb: EventCallback): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(cb);
    return () => this.listeners.get(event)?.delete(cb);
  }

  disconnect() {
    this.manuallyClosed = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.socket?.close();
  }
}

export const callWs = new CallWsClient();
