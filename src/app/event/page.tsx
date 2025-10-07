// File: src/app/event/page.tsx
import Link from "next/link";
import { supabaseServerComponent } from "../../lib/supabase/server";

type SP = Record<string, string | string[] | undefined>;
const s = (v?: string | string[] | undefined) => (v == null ? undefined : Array.isArray(v) ? v[0] : v);

export default async function EventDetailPage({ searchParams }: { searchParams?: Promise<SP> }) {
  const sp: SP = (await searchParams) ?? {};
  const id = s(sp.id);

  if (!id) {
    return (
      <main className="container" style={{ maxWidth: 1040, margin: "24px auto", padding: "0 16px" }}>
        <section className="card" style={{ padding: 16 }}>
          <h1>Event</h1>
          <div className="muted" style={{ marginTop: 6 }}>No event specified.</div>
          <div className="hstack" style={{ marginTop: 12 }}>
            <Link className="btn btn-ghost" href="/events">Back to Events</Link>
          </div>
        </section>
      </main>
    );
  }

  const supabase = await supabaseServerComponent();

  const { data, error } = await supabase
    .from("community_events")
    .select("id, title, description, event_type, start_at, end_at, meet_url, calendar_url, location, venue")
    .eq("id", id)
    .maybeSingle();

  return (
    <main className="container" style={{ maxWidth: 1040, margin: "24px auto", padding: "0 16px" }}>
      <section className="card" style={{ padding: 16 }}>
        {error ? (
          <>
            <h1>Event</h1>
            <div style={{ color: "#991b1b", marginTop: 8 }}>{error.message}</div>
            <div className="hstack" style={{ marginTop: 12 }}>
              <Link className="btn btn-ghost" href="/events">Back to Events</Link>
            </div>
          </>
        ) : !data ? (
          <>
            <h1>Event</h1>
            <div className="muted" style={{ marginTop: 6 }}>Not found.</div>
            <div className="hstack" style={{ marginTop: 12 }}>
              <Link className="btn btn-ghost" href="/events">Back to Events</Link>
            </div>
          </>
        ) : (
          <>
            <h1>{data.title || "Event"}</h1>
            <div className="muted" style={{ marginTop: 6 }}>
              {fmtRange(data.start_at, data.end_at)}
              {data.location ? ` • ${data.location}` : data.venue ? ` • ${data.venue}` : ""}
              {data.event_type ? ` • ${data.event_type}` : ""}
            </div>

            {data.description && <p className="muted" style={{ marginTop: 12 }}>{data.description}</p>}

            <div className="hstack" style={{ marginTop: 12, gap: 8 }}>
              {data.meet_url && (
                <a className="btn btn-primary" href={data.meet_url} target="_blank" rel="noopener noreferrer">Join</a>
              )}
              {data.calendar_url && (
                <a className="btn btn-ghost" href={data.calendar_url} target="_blank" rel="noopener noreferrer">Add to Calendar</a>
              )}
              <Link className="btn btn-ghost" href="/events">Back to Events</Link>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

function fmtRange(start?: string | null, end?: string | null) {
  if (!start) return "";
  const s = new Date(start); const e = end ? new Date(end) : null;
  const sPart = s.toLocaleString(); const ePart = e ? e.toLocaleTimeString() : "";
  return e ? `${sPart} – ${ePart}` : sPart;
}
