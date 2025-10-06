// File: src/app/event/page.tsx
import { supabaseServerComponent } from "@/lib/supabase/server";

type SP = Record<string, string | string[] | undefined>;
const pick = (v?: string | string[] | undefined) =>
  v == null ? undefined : Array.isArray(v) ? v[0] : v;

export default async function EventDetailPage({
  searchParams,
}: {
  searchParams?: Promise<SP>;
}) {
  const sp: SP = (await searchParams) ?? {};
  const id = pick(sp.id);

  const supabase = supabaseServerComponent();
  const { data: { user } } = await supabase.auth.getUser();

  if (!id) {
    return (
      <main style={{ maxWidth: 1040, margin: "24px auto", padding: "0 16px" }}>
        <section className="card" style={{ padding: 16 }}>
          <h1>Event</h1>
          <div className="muted" style={{ marginTop: 6 }}>
            No event specified. Open this page with a valid event id.
          </div>
        </section>
      </main>
    );
  }

  // Fetch event (public; you can also gate by roles if needed)
  const { data: ev, error } = await supabase
    .from("community_events")
    .select("id, title, description, event_type, start_at, end_at, meet_url, calendar_url")
    .eq("id", id)
    .maybeSingle();

  if (error || !ev) {
    return (
      <main style={{ maxWidth: 1040, margin: "24px auto", padding: "0 16px" }}>
        <section className="card" style={{ padding: 16 }}>
          <h1>Event</h1>
          <div className="muted" style={{ marginTop: 6 }}>
            Event not found. It may have been removed or the id is invalid.
          </div>
        </section>
      </main>
    );
  }

  const when = new Date(ev.start_at).toLocaleString();
  const whenEnd = ev.end_at ? new Date(ev.end_at).toLocaleString() : null;

  return (
    <main style={{ maxWidth: 1040, margin: "24px auto", padding: "0 16px" }}>
      <section className="card" style={{ padding: 16 }}>
        <header className="hstack" style={{ alignItems: "center", gap: 8 }}>
          <div
            aria-hidden
            style={{
              width: 28, height: 28, borderRadius: 8,
              display: "grid", placeItems: "center",
              background: "rgba(59,130,246,.12)", color: "#0f172a"
            }}
          >
            📅
          </div>
          <h1 style={{ margin: 0 }}>Event</h1>
        </header>

        <div style={{ marginTop: 16, borderTop: "1px solid var(--border)", paddingTop: 12 }}>
          <h2 style={{ fontWeight: 900, margin: 0 }}>{ev.title}</h2>

          <div className="muted" style={{ marginTop: 8 }}>
            {whenEnd ? `${when} — ${whenEnd}` : when}
            {ev.event_type ? ` • ${ev.event_type}` : ""}
          </div>

          {ev.description && (
            <p style={{ marginTop: 12 }}>{ev.description}</p>
          )}

          <div className="hstack" style={{ marginTop: 12, gap: 8, flexWrap: "wrap" as const }}>
            {ev.meet_url && (
              <a className="btn btn-primary" href={ev.meet_url} target="_blank" rel="noreferrer">
                Join Event
              </a>
            )}
            {ev.calendar_url && (
              <a className="btn btn-ghost" href={ev.calendar_url} target="_blank" rel="noreferrer">
                Add to Calendar
              </a>
            )}
            <a className="btn btn-ghost" href="/events">Back to Events</a>
          </div>
        </div>
      </section>
    </main>
  );
}