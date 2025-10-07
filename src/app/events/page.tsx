// File: src/app/events/page.tsx
import Link from "next/link";
import { supabaseServerComponent } from "../../lib/supabase/server";

export default async function EventsListPage() {
    const supabase = supabaseServerComponent();

    const { data, error } = await supabase
        .from("community_events")
        .select("id,title,start_at,end_at,event_type,location,venue")
        .order("start_at", { ascending: true });

    if (error) {
        return (
            <section className="card">
                <h2>Events</h2>
                <div style={{ color: "#991b1b" }}>{error.message}</div>
            </section>
        );
    }

    const rows = data ?? [];

    return (
        <section className="card">
            <h2>Events</h2>
            {!rows.length ? (
                <div className="muted" style={{ marginTop: 6 }}>No events found.</div>
            ) : (
                <ul style={{ marginTop: 8 }}>
                    {rows.map((ev) => (
                        <li key={ev.id} style={{ padding: 12, borderTop: "1px solid var(--border)" }}>
                            <div style={{ fontWeight: 900 }}>{ev.title || "Untitled"}</div>
                            <div className="muted" style={{ marginTop: 4 }}>
                                {ev.start_at ? new Date(ev.start_at).toLocaleString() : ""}
                                {ev.location ? ` • ${ev.location}` : ev.venue ? ` • ${ev.venue}` : ""}
                                {ev.event_type ? ` • ${ev.event_type}` : ""}
                            </div>
                            <div className="hstack" style={{ marginTop: 8 }}>
                                <Link className="btn btn-ghost" href={`/event?id=${encodeURIComponent(ev.id)}`}>Details</Link>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
