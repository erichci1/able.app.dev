import Link from "next/link";
import ExploreMenuServer from "@/components/ExploreMenuServer";
import { supabaseServer } from "@/lib/supabase/server";

export default async function EventsPage({
searchParams,
}: { searchParams?: Record<string, string | string[] | undefined> }) {
const view = (Array.isArray(searchParams?.view) ? searchParams?.view[0] : searchParams?.view) ?? "upcoming";
const type = (Array.isArray(searchParams?.type) ? searchParams?.type[0] : searchParams?.type) ?? "all";
const q = (Array.isArray(searchParams?.q) ? searchParams?.q[0] : searchParams?.q) ?? "";

const supabase = supabaseServer();
const nowIso = new Date().toISOString();

// types for dropdown
const { data: typesRows } = await supabase
.from("community_events")
.select("event_type")
.not("event_type", "is", null)
.order("event_type", { ascending: true });
const types = Array.from(new Set((typesRows ?? []).map(r => r.event_type).filter(Boolean))) as string[];

let query = supabase
.from("community_events")
.select("id, title, description, event_type, start_at, end_at, location, venue, meet_url, calendar_url")
.limit(100);

if (view === "upcoming") query = query.gte("start_at", nowIso).order("start_at", { ascending: true });
else if (view === "past") query = query.lt("start_at", nowIso).order("start_at", { ascending: false });
else query = query.order("start_at", { ascending: false });

if (type !== "all") query = query.eq("event_type", type);

if (q) {
const like = `%${q.replace(/%/g,"\\%").replace(/_/g,"\\_")}%`;
query = query.or(`title.ilike.${like},description.ilike.${like}`);
}

const { data, error } = await query;
const events = data ?? [];

return (
<>
<ExploreMenuServer />

<section className="card">
<h1>Events</h1>
<div className="muted" style={{ marginTop: 6 }}>
See what’s coming up next. Click an event to view details or join.
</div>
</section>

{/* your filter bar for events can sit here if you added one */}

{error ? (
<section className="card"><div style={{ color:"#991b1b" }}>{error.message}</div></section>
) : !events.length ? (
<section className="card"><div className="muted">No upcoming events.</div></section>
) : (
<section className="card" style={{ padding: 0 }}>
<ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
{events.map((ev) => (
<li key={ev.id} style={{
padding: 16, borderBottom: "1px solid var(--border)",
display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "center",
}}>
<div>
<div style={{ fontWeight: 900 }}>{ev.title || "Untitled event"}</div>
<div className="muted" style={{ marginTop: 4 }}>
{fmtDateRange(ev.start_at, ev.end_at)}
{ev.location ? ` • ${ev.location}` : ev.venue ? ` • ${ev.venue}` : ""}
{ev.event_type ? ` • ${ev.event_type}` : ""}
</div>
</div>
<div className="hstack" style={{ justifySelf: "end" }}>
{ev.meet_url ? <a className="btn btn-primary" href={ev.meet_url} target="_blank">Join</a> : null}
<Link className="btn btn-ghost" href={`/event?id=${encodeURIComponent(ev.id)}`}>Details</Link>
</div>
</li>
))}
</ul>
</section>
)}
</>
);
}

function fmtDate(iso?: string | null) {
if (!iso) return "";
const d = new Date(iso);
return d.toLocaleString(undefined, { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}
function fmtDateRange(s?: string | null, e?: string | null) {
if (!s) return "";
const a = fmtDate(s);
const b = e ? fmtDate(e) : "";
return b ? `${a} — ${b}` : a;
}
