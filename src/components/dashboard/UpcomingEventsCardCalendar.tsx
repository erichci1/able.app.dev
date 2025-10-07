// File: src/components/dashboard/UpcomingEventsCardCalendar.tsx
import Link from "next/link";

export type EventRow = {
    id: string;
    title: string | null;
    start_at: string | null;
    end_at?: string | null;
    event_type?: string | null;
    cover_image_url?: string | null;
    venue?: string | null;
    location?: string | null;
    capacity?: number | null;
    price?: number | null;
    tags?: string[] | null;
    meet_url?: string | null;
    calendar_url?: string | null;
};

type Props = {
    events: EventRow[]; // the rows to show
    limit?: number; // default 3
    since?: string; // optional filter hint (not used here, but accepted for parity)
    showJoin?: boolean; // show "Join" if meet_url exists
    showCalendar?: boolean; // show "Add to Calendar" if calendar_url exists
};

export default function UpcomingEventsCardCalendar({
    events,
    limit = 3,
    showJoin = false,
    showCalendar = false,
}: Props) {
    const list = (events ?? []).slice(0, limit);

    return (
        <section className="card">
            <div className="hstack" style={{ justifyContent: "space-between", alignItems: "center" }}>
                <h2>Upcoming Events</h2>
                <Link className="btn btn-ghost" href="/events">All events</Link>
            </div>

            {!list.length ? (
                <div className="muted" style={{ marginTop: 6 }}>No upcoming events.</div>
            ) : (
                <div style={{ marginTop: 8 }}>
                    <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                        {list.map((ev) => (
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
                                    <div style={{ fontWeight: 900 }}>{ev.title || "Event"}</div>
                                    <div className="muted" style={{ marginTop: 4 }}>
                                        {fmtRange(ev.start_at, ev.end_at)}
                                        {ev.event_type ? ` • ${ev.event_type}` : ""}
                                        {ev.venue ? ` • ${ev.venue}` : ev.location ? ` • ${ev.location}` : ""}
                                    </div>
                                </div>

                                <div className="hstack" style={{ justifySelf: "end", gap: 8, flexWrap: "wrap" as const }}>
                                    {showJoin && ev.meet_url && (
                                        <a
                                            className="btn btn-primary"
                                            href={ev.meet_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Join
                                        </a>
                                    )}
                                    {showCalendar && ev.calendar_url && (
                                        <a
                                            className="btn"
                                            href={ev.calendar_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Add to calendar
                                        </a>
                                    )}
                                    <Link className="btn btn-ghost" href={`/event?id=${encodeURIComponent(ev.id)}`}>
                                        Details
                                    </Link>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </section>
    );
}

function fmtRange(start?: string | null, end?: string | null) {
    if (!start) return "";
    const s = new Date(start);
    const e = end ? new Date(end) : null;
    const sameDay = e && s.toDateString() === e.toDateString();

    const date = s.toLocaleDateString(undefined, { month: "short", day: "2-digit" });
    const st = s.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    if (!e) return `${date} ${st}`;
    const et = e.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    if (sameDay) return `${date}, ${st} — ${et}`;
    const date2 = e.toLocaleDateString(undefined, { month: "short", day: "2-digit" });
    return `${date}, ${st} — ${date2}, ${et}`;
}
