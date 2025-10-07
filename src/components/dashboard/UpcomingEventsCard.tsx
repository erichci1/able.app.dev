// File: src/components/dashboard/UpcomingEventsCard.tsx
import Link from "next/link";
import { supabaseServerComponent } from "../../lib/supabase/server";

type Props = {
    title?: string;
    limit?: number;
    /** inclusive start bound; default = now */
    from?: string | Date;
    /** inclusive end bound; optional */
    to?: string | Date;
    /** filter by event_type if provided */
    eventType?: string;
    /** render Join button when meet_url exists (default: true) */
    showJoin?: boolean;
    /** render Add to Calendar when calendar_url exists (default: false) */
    showCalendar?: boolean;
};

type EventRow = {
    id: string;
    title: string | null;
    start_at: string | null;
    end_at?: string | null;
    event_type?: string | null;
    location?: string | null;
    venue?: string | null;
    meet_url?: string | null;
    calendar_url?: string | null;
};

function toISO(v?: string | Date): string | undefined {
    if (!v) return undefined;
    if (typeof v === "string") return new Date(v).toISOString();
    return v.toISOString();
}

function fmtDate(iso?: string | null) {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default async function UpcomingEventsCard({
    title = "Upcoming Events",
    limit = 3,
    from,
    to,
    eventType,
    showJoin = true,
    showCalendar = false,
}: Props) {
    const supabase = await supabaseServerComponent();

    // Normalize bounds
    const fromIso = toISO(from) ?? new Date().toISOString(); // default to now
    const toIso = toISO(to);

    // Select fields based on flags
    const fields =
        "id, title, start_at, end_at, event_type, location, venue" +
        (showJoin ? ", meet_url" : "") +
        (showCalendar ? ", calendar_url" : "");

    let q = supabase
        .from("community_events")
        .select(fields)
        .gte("start_at", fromIso)
        .order("start_at", { ascending: true })
        .limit(limit);

    if (toIso) q = q.lte("start_at", toIso);
    if (eventType) q = q.eq("event_type", eventType);

    const { data, error } = await q;

    let rows: EventRow[] = [];
    if (error) {
        return (
            <section className="card">
                <h2>{title}</h2>
                <div style={{ color: "#991b1b", marginTop: 8 }}>{error.message}</div>
            </section>
        );
    }
    if (Array.isArray(data)) {
        rows = data.filter(
            (item) =>
                typeof item === "object" &&
                item !== null &&
                typeof (item as EventRow).id === "string" &&
                "title" in item &&
                "start_at" in item &&
                !("error" in item)
        ) as EventRow[];
    }

    return (
        <section className="card">
            <div className="hstack" style={{ justifyContent: "space-between", alignItems: "center" }}>
                <h2>{title}</h2>
                <Link className="btn btn-ghost" href="/events">
                    All Events
                </Link>
            </div>

            {!rows.length ? (
                <div className="muted" style={{ marginTop: 6 }}>
                    No events in this range.
                </div>
            ) : (
                <ul style={{ marginTop: 8 }}>
                    {rows.map((ev) => (
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
                                    {fmtDate(ev.start_at)}
                                    {ev.location ? ` • ${ev.location}` : ev.venue ? ` • ${ev.venue}` : ""}
                                    {ev.event_type ? ` • ${ev.event_type}` : ""}
                                </div>
                            </div>

                            <div className="hstack" style={{ justifySelf: "end", gap: 8, flexWrap: "wrap" as const }}>
                                {showJoin && ev.meet_url && (
                                    <a className="btn btn-primary" href={ev.meet_url} target="_blank" rel="noopener noreferrer">
                                        Join
                                    </a>
                                )}
                                {showCalendar && ev.calendar_url && (
                                    <a className="btn btn-ghost" href={ev.calendar_url} target="_blank" rel="noopener noreferrer">
                                        Add to Calendar
                                    </a>
                                )}
                                <Link className="btn btn-ghost" href={`/event?id=${encodeURIComponent(ev.id)}`}>
                                    Details
                                </Link>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
