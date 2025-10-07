// File: src/components/dashboard/UpcomingEventsCardCalendar.tsx
import Link from "next/link";
import { supabaseServerComponent } from "../../lib/supabase/server";

type Props = {
    /** max events to show (default 3) */
    limit?: number;
    /** filter events that start on/after this ISO string (default now) */
    since?: string;
    /** show the “Join” button when a meet_url exists (default true) */
    showJoin?: boolean;
    /** show the “Add to Calendar” button when a calendar_url exists (default true) */
    showCalendar?: boolean;
};

export default async function UpcomingEventsCardCalendar({
    limit = 3,
    since = new Date().toISOString(),
    showJoin = true,
    showCalendar = true,
}: Props) {
    const supabase = await supabaseServerComponent();

    const { data, error } = await supabase
        .from("community_events")
        .select(
            "id, title, description, event_type, start_at, end_at, meet_url, calendar_url"
        )
        .gte("start_at", since)
        .order("start_at", { ascending: true })
        .limit(limit);

    function fmtRange(start_at: string, end_at: string): import("react").ReactNode {
        const start = new Date(start_at);
        const end = new Date(end_at);

        const sameDay =
            start.getFullYear() === end.getFullYear() &&
            start.getMonth() === end.getMonth() &&
            start.getDate() === end.getDate();

        const dateOptions: Intl.DateTimeFormatOptions = {
            year: "numeric",
            month: "short",
            day: "numeric",
        };
        const timeOptions: Intl.DateTimeFormatOptions = {
            hour: "2-digit",
            minute: "2-digit",
        };

        if (sameDay) {
            return (
                <>
                    {start.toLocaleDateString(undefined, dateOptions)}{" "}
                    {start.toLocaleTimeString(undefined, timeOptions)}–{end.toLocaleTimeString(undefined, timeOptions)}
                </>
            );
        } else {
            return (
                <>
                    {start.toLocaleDateString(undefined, dateOptions)}{" "}
                    {start.toLocaleTimeString(undefined, timeOptions)} –{" "}
                    {end.toLocaleDateString(undefined, dateOptions)}{" "}
                    {end.toLocaleTimeString(undefined, timeOptions)}
                </>
            );
        }
    }
    return (
        <section className="card">
            <div
                className="hstack"
                style={{ justifyContent: "space-between", alignItems: "center" }}
            >
                <h2>Upcoming Events</h2>
                <Link className="btn btn-ghost" href="/events">
                    All events
                </Link>
            </div>

            {error ? (
                <div style={{ color: "#991b1b", marginTop: 8 }}>{error.message}</div>
            ) : !data?.length ? (
                <div className="muted" style={{ marginTop: 6 }}>
                    No upcoming events.
                </div>
            ) : (
                <ul style={{ marginTop: 8 }}>
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
                                <div style={{ fontWeight: 900 }}>{ev.title}</div>
                                <div className="muted" style={{ marginTop: 4 }}>
                                    {fmtRange(ev.start_at, ev.end_at)}{" "}
                                    {ev.event_type ? `• ${ev.event_type}` : ""}
                                </div>
                                {ev.description && (
                                    <div className="muted" style={{ marginTop: 6 }}>
                                        {ev.description}
                                    </div>
                                )}
                            </div>

                            <div className="hstack" style={{ gap: 8, justifySelf: "end" }}>
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
                                        className="btn btn-ghost"
                                        href={ev.calendar_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Add to Calendar
                                    </a>
                                )}

                                <Link
                                    className="btn btn-ghost"
                                                            href={`/event?id=${encodeURIComponent(ev.id)}`}
                                                        >
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
