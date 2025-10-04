// File: src/app/events/page.tsx
import { supabaseServer } from "../../lib/supabase/server";

type EventRow = {
    id: string;
    title: string | null;
    event_type: string | null;
    start_at: string | null;
    end_at: string | null;
    location?: string | null;
    venue?: string | null;
    meet_url?: string | null;
    calendar_url?: string | null;
};
type SP = Record<string, string | string[] | undefined>;
const s = (v?: string | string[] | undefined) => (v == null ? undefined : Array.isArray(v) ? v[0] : v);

function fmtDate(iso?: string | null) {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleString(undefined, { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export default async function EventsPage({
    searchParams,
}: {
    searchParams?: Promise<SP>;
}) {
    const sp: SP = (await searchParams) ?? {};
    const view = s(sp.view) ?? "upcoming"; // upcoming | past | all
    const type = s(sp.type) ?? "all";
    const qtxt = s(sp.q) ?? "";

    const supabase = supabaseServer();
    const nowIso = new Date().toISOString();

    let q = supabase
        .from("community_events")
        .select("id, title, event_type, start_at, end_at, location, venue, meet_url, calendar_url")
        .limit(100);

    if (view === "upcoming") q = q.gte("start_at", nowIso).order("start_at", { ascending: true });
    else if (view === "past") q = q.lt("start_at", nowIso).order("start_at", { ascending: false });
    else q = q.order("start_at", { ascending: false });

    if (type !== "all") q = q.eq("event_type", type);

    if (qtxt) {
        const like = `%${qtxt.replace(/%/g, "\\%").replace(/_/g, "\\_")}%`;
        q = q.or(`title.ilike.${like},description.ilike.${like}`);
    }

    const { data, error } = await q;
    if (error) {
        return (
            <section className="card">
                <h1>Events</h1>
                <div style={{ color: "#991b1b" }}>{error.message}</div>
            </section>
        );
    }

    const rows: EventRow[] = data ?? [];

    return (
        <section className="card">
            <h1>Events</h1>
            {!rows.length ? (
                <div className="muted" style={{ marginTop: 6 }}>
                    {view === "upcoming" ? "No upcoming events." : "No events found."}
                </div>
            ) : (
                <ul style={{ marginTop: 8 }}>
                    {rows.map((ev) => (
                        <li key={ev.id}>
                            <strong>{ev.title || "Untitled event"}</strong> — {fmtDate(ev.start_at)}
                            {ev.location ? ` • ${ev.location}` : ev.venue ? ` • ${ev.venue}` : ""}
                            {ev.event_type ? ` • ${ev.event_type}` : ""}
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}