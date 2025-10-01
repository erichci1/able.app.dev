import Link from "next/link";
import { notFound } from "next/navigation";
import ExploreMenuServer from "@/components/ExploreMenuServer";
import { supabaseServer } from "@/lib/supabase/server";

export default async function EventDetailPage({
searchParams,
}: { searchParams: { id?: string } }) {
const id = searchParams?.id;
if (!id) {
return (
<>
<ExploreMenuServer />
<section className="card">
<h1>Event</h1>
<div className="muted">No event specified. Open this page with a valid event id.</div>
<div className="hstack" style={{ marginTop: 10 }}>
<Link className="btn btn-ghost" href="/events">Back to Events</Link>
</div>
</section>
</>
);
}

const supabase = supabaseServer();
const { data, error } = await supabase
.from("community_events")
.select([
"id","title","description","event_type","start_at","end_at",
"location","venue","cover_image_url","meet_url","calendar_url",
"capacity","price","tags"
].join(","))
.eq("id", id)
.maybeSingle();

if (error) {
return (
<>
<ExploreMenuServer />
<section className="card">
<h1>Event</h1>
<div style={{ color: "#991b1b" }}>{error.message}</div>
<div className="hstack" style={{ marginTop: 10 }}>
<Link className="btn btn-ghost" href="/events">Back to Events</Link>
</div>
</section>
</>
);
}

if (!data) return notFound();

// Define the expected event type
type Event = {
  id: string;
  title?: string;
  description?: string;
  event_type?: string;
  start_at?: string;
  end_at?: string;
  location?: string;
  venue?: string;
  cover_image_url?: string;
  meet_url?: string;
  calendar_url?: string;
  capacity?: number;
  price?: number;
  tags?: string[];
};

// Type guard to ensure data is of type Event
function isEvent(obj: any): obj is Event {
  return obj && typeof obj === "object" && typeof obj.id === "string";
}

if (!isEvent(data)) {
  return (
    <>
      <ExploreMenuServer />
      <section className="card">
        <h1>Event</h1>
        <div style={{ color: "#991b1b" }}>Invalid event data received.</div>
        <div className="hstack" style={{ marginTop: 10 }}>
          <Link className="btn btn-ghost" href="/events">Back to Events</Link>
        </div>
      </section>
    </>
  );
}

const ev = data;

return (
<>
<ExploreMenuServer />
<section className="card">
<h1 style={{ marginBottom: 6 }}>{ev.title || "Untitled event"}</h1>
<div className="muted">
{fmtDateRange(ev.start_at, ev.end_at)}
{ev.location ? ` • ${ev.location}` : ev.venue ? ` • ${ev.venue}` : ""}
{ev.event_type ? ` • ${ev.event_type}` : ""}
</div>

{ev.cover_image_url ? (
<div style={{ marginTop: 12, borderRadius: "var(--radius)", overflow: "hidden", border: "1px solid var(--border)" }}>
<img src={ev.cover_image_url} alt="" style={{ width:"100%", height:"auto", display:"block" }} />
</div>
) : null}

<div className="hstack" style={{ marginTop: 12, flexWrap: "wrap" as const }}>
{ev.meet_url && <a className="btn btn-primary" href={ev.meet_url} target="_blank">Join Event</a>}
{ev.calendar_url && <a className="btn btn-ghost" href={ev.calendar_url} target="_blank">Add to Calendar</a>}
<Link className="btn btn-ghost" href="/events">Back to Events</Link>
</div>
</section>

<section className="card">
<h2>Details & actions</h2>
<div className="muted" style={{ marginTop: 6 }}>
{ev.description ? <div style={{ whiteSpace: "pre-wrap" }}>{ev.description}</div> : "No description provided."}
</div>
<div className="vstack" style={{ marginTop: 12 }}>
<InfoRow label="Type" value={ev.event_type} />
<InfoRow label="Location" value={ev.location || ev.venue} />
<InfoRow label="Capacity" value={fmtCapacity(ev.capacity)} />
<InfoRow label="Price" value={fmtPrice(ev.price)} />
</div>
</section>
</>
);
}

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
if (value === null || value === undefined || value === "") return null;
return (
<div className="hstack" style={{ justifyContent: "space-between", borderTop:"1px dashed var(--border)", paddingTop: 10 }}>
<div className="muted" style={{ minWidth: 120 }}>{label}</div>
<div>{String(value)}</div>
</div>
);
}
function fmtCapacity(n?: number | null) { if (n == null) return "—"; return `${n} seats`; }
function fmtPrice(n?: number | null) { if (n == null) return "—"; if (n === 0) return "Free";
try { return new Intl.NumberFormat(undefined, { style:"currency", currency:"USD" }).format(n); }
catch { return `$${n}`; } }
function fmtDate(iso?: string | null) { if (!iso) return ""; const d = new Date(iso);
return d.toLocaleString(undefined, { month:"short", day:"2-digit", hour:"2-digit", minute:"2-digit" }); }
function fmtDateRange(s?: string | null, e?: string | null) {
if (!s) return ""; const a = fmtDate(s); const b = e ? fmtDate(e) : ""; return b ? `${a} — ${b}` : a; }