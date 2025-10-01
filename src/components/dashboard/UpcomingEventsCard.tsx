// File: src/components/dashboard/UpcomingEventsCard.tsx
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";

// Shared phases
const PHASES = [
{ value: "all", label: "All" },
{ value: "activate", label: "Activate" },
{ value: "build", label: "Build" },
{ value: "leverage", label: "Leverage" },
{ value: "execute", label: "Execute" },
];

type Phase = "all" | "activate" | "build" | "leverage" | "execute";

export default async function UpcomingEventsCard({ phase = "all" }: { phase?: Phase }) {
const supabase = supabaseServer();
const nowIso = new Date().toISOString();

// Try a filtered query (assuming a `phase` column). If that fails because the column
// doesn't exist, fallback to unfiltered.
async function fetchEventsFiltered() {
let q = supabase
.from("community_events")
.select("id, title, event_type, start_at, end_at, location, venue, meet_url, calendar_url, phase")
.gte("start_at", nowIso)
.order("start_at", { ascending: true })
.limit(3);

if (phase !== "all") q = q.eq("phase", phase);
return await q;
}

async function fetchEventsFallback() {
return await supabase
.from("community_events")
.select("id, title, event_type, start_at, end_at, location, venue, meet_url, calendar_url")
.gte("start_at", nowIso)
.order("start_at", { ascending: true })
.limit(3);
}

let data: any[] | null = null;
let error: any = null;

// First try filtered
const try1 = await fetchEventsFiltered();
if (try1.error && /column .*phase.* does not exist/i.test(try1.error.message)) {
// Fallback: no phase column
const try2 = await fetchEventsFallback();
data = try2.data ?? [];
error = try2.error;
} else {
data = try1.data ?? [];
error = try1.error;
}

return (
<section className="card">
<div className="hstack" style={{ justifyContent: "space-between", alignItems:"center" }}>
<h2>Upcoming Events</h2>
{/* Phase chips as relative links (stay on current page, changing only ?phase=) */}
<div className="hstack" style={{ gap: 8, flexWrap: "wrap" as const }}>
{PHASES.map(p => {
const active = p.value === phase;
const href = p.value === "all" ? "?" : `?phase=${p.value}`;
return (
<Link
key={p.value}
href={href}
className="btn"
style={{
padding: "6px 10px",
borderRadius: 999,
fontWeight: 800,
background: active ? "#0C2D6F" : "#fff",
color: active ? "#fff" : "#0f172a",
border: "1px solid var(--border)",
}}
aria-pressed={active}
>
{p.label}
</Link>
);
})}
</div>
</div>

{error ? (
<div style={{ color: "#991b1b", marginTop: 8 }}>{error.message}</div>
) : !data?.length ? (
<div className="muted" style={{ marginTop: 6 }}>
{phase === "all" ? "No upcoming events." : `No upcoming ${phase} events.`}
</div>
) : (
<div style={{ marginTop: 8 }}>
<ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
{data.map((ev) => (
<li
key={ev.id}
style={{
padding: 12,
borderTop: "1px solid var(--border)",
display: "grid",
gridTemplateColumns: "1fr auto",
gap: 12,
alignItems: "center",
}}
>
<div>
<div style={{ fontWeight: 900 }}>{ev.title || "Untitled event"}</div>
<div className="muted" style={{ marginTop: 4 }}>
{fmtDateRange(ev.start_at, ev.end_at)}
{ev.location ? ` • ${ev.location}` : ev.venue ? ` • ${ev.venue}` : ""}
{ev.event_type ? ` • ${ev.event_type}` : ""}
</div>
</div>
<div className="hstack" style={{ justifySelf: "end" }}>
{ev.meet_url ? (
<a className="btn btn-primary" href={ev.meet_url} target="_blank" rel="noopener noreferrer">
Join
</a>
) : null}
<Link className="btn btn-ghost" href={`/event?id=${encodeURIComponent(ev.id)}`}>
Details
</Link>
</div>
</li>
))}
</ul>

<div className="hstack" style={{ marginTop: 10 }}>
<Link className="btn btn-ghost" href="/events">All Events</Link>
</div>
</div>
)}
</section>
);
}

function fmtDate(iso?: string | null) {
if (!iso) return "";
const d = new Date(iso);
return d.toLocaleString(undefined, {
month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit",
});
}
function fmtDateRange(s?: string | null, e?: string | null) {
if (!s) return "";
const a = fmtDate(s);
const b = e ? fmtDate(e) : "";
return b ? `${a} — ${b}` : a;
}