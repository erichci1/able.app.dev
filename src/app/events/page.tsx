import { supabaseServer } from "@/lib/supabase/server";

export default async function EventsPage({
    searchParams,
}: {
    searchParams?: Record<string, string | string[] | undefined>;
}) {
    const supabase = supabaseServer();

    const view = (Array.isArray(searchParams?.view) ? searchParams?.view[0] : searchParams?.view) ?? "upcoming";
    const type = (Array.isArray(searchParams?.type) ? searchParams?.type[0] : searchParams?.type) ?? "all";
    const qtxt = (Array.isArray(searchParams?.q) ? searchParams?.q[0] : searchParams?.q) ?? "";

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
    if (error) return <section className="card"><h1>Events</h1><div style={{ color: "#991b1b" }}>{error.message}</div></section>;

    const rows = data ?? [];
    return (
        <section className="card">
            <h1>Events</h1>
            <ul>
                {rows.map((ev: any) => (
                    <li key={ev.id}>
                        {ev.title} — {fmtDate(ev.start_at)}
                    </li>
                ))}
            </ul>
        </section>
    );
}

function fmtDate(iso?: string | null) {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleString(undefined, { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}
