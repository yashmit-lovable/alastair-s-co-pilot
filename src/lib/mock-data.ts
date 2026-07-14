export type Outcome = "converted" | "following_up" | "not_interested" | "wrong_number" | "hung_up";

export type FeedEntry = {
  id: string;
  type: "caller" | "ai" | "consultation";
  text: string;
  question?: string;
  reply?: string;
  saved?: boolean;
  timestamp: string;
};

export type Call = {
  id: string;
  time: string;
  timestamp: Date;
  caller: string;
  callerName?: string;
  durationSec: number;
  decisionPoints: number;
  outcome: Outcome;
  priceAgreed?: number;
  transcript: FeedEntry[];
};

export type Course = {
  id: string;
  name: string;
  duration: string;
  basePrice: number;
  floorPrice: number;
  placementRate: number;
  highlights: string[];
};

export const COURSES: Course[] = [
  {
    id: "c1",
    name: "PG Diploma in Data Science",
    duration: "12 months",
    basePrice: 350000,
    floorPrice: 285000,
    placementRate: 94,
    highlights: ["IIT-certified faculty", "Capstone with Fortune 500", "Avg CTC ₹12.4 LPA"],
  },
  {
    id: "c2",
    name: "Executive MBA — Finance",
    duration: "18 months",
    basePrice: 625000,
    floorPrice: 540000,
    placementRate: 88,
    highlights: ["Weekend format", "IIM alumni network", "GMAT optional"],
  },
  {
    id: "c3",
    name: "Advanced Cert. in Digital Marketing",
    duration: "6 months",
    basePrice: 125000,
    floorPrice: 95000,
    placementRate: 91,
    highlights: ["Google & Meta certified", "Live client project", "100% placement assistance"],
  },
  {
    id: "c4",
    name: "MS in AI & Machine Learning",
    duration: "24 months",
    basePrice: 875000,
    floorPrice: 720000,
    placementRate: 96,
    highlights: ["Stanford curriculum", "US immersion week", "Avg CTC ₹18.2 LPA"],
  },
];

export const RECENT_CALLS: Call[] = [
  {
    id: "call_9821",
    time: "10:42 AM",
    timestamp: new Date(Date.now() - 1000 * 60 * 24),
    caller: "+91 98214 55021",
    callerName: "Priya Menon",
    durationSec: 8 * 60 + 12,
    decisionPoints: 3,
    outcome: "converted",
    priceAgreed: 310000,
    transcript: [
      { id: "1", type: "caller", text: "Hi, I saw your ad for the Data Science program.", timestamp: "10:42:04" },
      { id: "2", type: "ai", text: "Introduced the PG Diploma in Data Science, covered format and duration.", timestamp: "10:42:22" },
      { id: "3", type: "caller", text: "What about the fees? ₹3.5L feels a bit steep for me right now.", timestamp: "10:44:10" },
      { id: "4", type: "consultation", text: "", question: "Sir, caller is asking for a discount on Data Science — how low can I go?", reply: "Offer ₹3,10,000 with an EMI plan. Mention placement guarantee.", saved: true, timestamp: "10:44:48" },
      { id: "5", type: "ai", text: "Offered ₹3,10,000 with 12-month EMI and placement guarantee.", timestamp: "10:45:30" },
      { id: "6", type: "caller", text: "That works. What's the next step to enroll?", timestamp: "10:47:02" },
      { id: "7", type: "ai", text: "Shared enrollment link and confirmed onboarding call for Friday.", timestamp: "10:47:44" },
    ],
  },
  {
    id: "call_9820",
    time: "10:14 AM",
    timestamp: new Date(Date.now() - 1000 * 60 * 55),
    caller: "+91 90042 71188",
    callerName: "Rahul Iyer",
    durationSec: 5 * 60 + 34,
    decisionPoints: 2,
    outcome: "following_up",
    transcript: [
      { id: "1", type: "caller", text: "Do you have anything for someone from a non-tech background?", timestamp: "10:14:12" },
      { id: "2", type: "ai", text: "Recommended Digital Marketing certification.", timestamp: "10:14:28" },
      { id: "3", type: "consultation", text: "", question: "Sir, caller wants a payment plan under ₹15k/month. What's the lowest EMI we've approved?", reply: "We can do ₹12,500/month over 10 months for repeat leads. This is a fresh lead — go with ₹14,000.", saved: true, timestamp: "10:16:03" },
      { id: "4", type: "ai", text: "Proposed ₹14,000/month EMI plan; caller wants to discuss with family.", timestamp: "10:17:22" },
    ],
  },
  {
    id: "call_9819",
    time: "09:48 AM",
    timestamp: new Date(Date.now() - 1000 * 60 * 82),
    caller: "+91 88220 04412",
    callerName: "Anonymous",
    durationSec: 42,
    decisionPoints: 0,
    outcome: "wrong_number",
    transcript: [
      { id: "1", type: "caller", text: "Sorry, wrong number.", timestamp: "09:48:10" },
    ],
  },
  {
    id: "call_9818",
    time: "09:33 AM",
    timestamp: new Date(Date.now() - 1000 * 60 * 97),
    caller: "+91 97889 22110",
    callerName: "Vikram Sethi",
    durationSec: 3 * 60 + 18,
    decisionPoints: 1,
    outcome: "not_interested",
    transcript: [
      { id: "1", type: "caller", text: "Already enrolled elsewhere, thanks.", timestamp: "09:33:04" },
    ],
  },
  {
    id: "call_9817",
    time: "09:12 AM",
    timestamp: new Date(Date.now() - 1000 * 60 * 118),
    caller: "+91 99870 66451",
    callerName: "Sneha Kapoor",
    durationSec: 12 * 60 + 4,
    decisionPoints: 5,
    outcome: "converted",
    priceAgreed: 720000,
    transcript: [
      { id: "1", type: "caller", text: "I want to understand your MS in AI program in detail.", timestamp: "09:12:00" },
      { id: "2", type: "ai", text: "Walked through curriculum, US immersion, and placement track record.", timestamp: "09:12:18" },
      { id: "3", type: "consultation", text: "", question: "Sir, caller is comparing us with ISB Hyderabad. Any positioning I should use?", reply: "Emphasize the Stanford curriculum and 96% placement rate. ISB doesn't have this depth in AI.", saved: true, timestamp: "09:14:22" },
      { id: "4", type: "ai", text: "Positioned Stanford curriculum and 96% placement vs alternatives.", timestamp: "09:15:00" },
    ],
  },
  {
    id: "call_9816",
    time: "08:45 AM",
    timestamp: new Date(Date.now() - 1000 * 60 * 145),
    caller: "+91 96547 20081",
    callerName: "Deepak Rao",
    durationSec: 24,
    decisionPoints: 0,
    outcome: "hung_up",
    transcript: [],
  },
];

export const TRAINING_HISTORY = [
  { id: "t1", date: "Today, 10:52 AM", instruction: "Always mention EMI options before quoting full fee for the Digital Marketing cert." },
  { id: "t2", date: "Yesterday", instruction: "When caller says 'expensive', pause and ask about their goals before defending the price." },
  { id: "t3", date: "2 days ago", instruction: "Lead with placement rate and avg CTC for MS in AI enquiries." },
  { id: "t4", date: "Last week", instruction: "Never commit to a discount above 20% without consulting Alastair." },
];

export const KB_ADDITIONS_SESSION = [
  { id: "k1", title: "Fintech Foundations Cert.", category: "Course", added: "Just now" },
  { id: "k2", title: "MS AI — sibling discount 5%", category: "Pricing", added: "3 min ago" },
];

export const BEHAVIOR_CHIPS = [
  "Be softer on price objections",
  "Mention placement rate earlier",
  "Don't rush to close",
  "Acknowledge their concern first",
  "Offer EMI before quoting full fee",
];

export const OUTCOME_META: Record<Outcome, { label: string; className: string }> = {
  converted: { label: "Converted", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  following_up: { label: "Following Up", className: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  not_interested: { label: "Not Interested", className: "bg-rose-500/15 text-rose-400 border-rose-500/30" },
  wrong_number: { label: "Wrong Number", className: "bg-slate-500/15 text-slate-400 border-slate-500/30" },
  hung_up: { label: "Hung Up Early", className: "bg-zinc-700/40 text-zinc-400 border-zinc-600/40" },
};
