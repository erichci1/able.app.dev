// File: src/app/event/page.tsx
import { supabaseServerComponent } from "../../lib/supabase/server";

type SP = Record<string, string | string[] | undefined>;

export default async function EventDetailPage({ searchParams }: { searchParams?: Promise<SP> }) {
  const sp: SP = (await searchParams) ?? {};
  const idRaw = sp.id;
  const id = typeof idRaw === "string" ? idRaw : Array.isArray(idRaw) ? idRaw[0] : undefined;

  const supabase = supabaseServerComponent();

  if (!id) {
    return (
      <section className="card">
        <h2>Event</h2>
        <div className="muted">No event specified.</div>
      </section>
    );
  }

  const { data: ev, error } = await supabase
    .from("community_events")
    .select("id,title,description,start_at,end_at,event_type,location,venue,meet_url,calendar_url")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return (
      <section className="card">
        <h2>Event</h2>
        <div style={{ color: "#991b1b" }}>{error.message}</div>
      </section>
    );
  }

  if (!ev) {
    return (
      <section className="card">
        <h2>Event</h2>
        <div className="muted">Event not found.</div>
      </section>
    );
  }

  return (
    <section className="card">
      <h2>{ev.title || "Event"}</h2>
      <div className="muted" style={{ marginTop: 6 }}>
        {ev.start_at ? new Date(ev.start_at).toLocaleString() : ""}
        {ev.location ? ` • ${ev.location}` : ev.venue ? ` • ${ev.venue}` : ""}
        {ev.event_type ? ` • ${ev.event_type}` : ""}
      </div>
      {ev.description && (
        <div style={{ marginTop: 10, whiteSpace: "pre-wrap" }}>
          {ev.description}
        </div>
      )}
      <div className="hstack" style={{ marginTop: 12, gap: 8 }}>
        {ev.meet_url && (
          <a className="btn btn-primary" href={ev.meet_url} target="_blank" rel="noopener noreferrer">
            Join
          </a>
        )}
        {ev.calendar_url && (
          <a className="btn btn-ghost" href={ev.calendar_url} target="_blank" rel="noopener noreferrer">
            Add to Calendar
          </a>
        )}
      </div>
    </section>
  );
}
