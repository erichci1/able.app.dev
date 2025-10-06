// File: src/app/events/page.tsx
import { supabaseServerComponent } from "@/lib/supabase/server";
import AppHeaderServer from "@/components/AppHeaderServer";
import ExploreMenuServer from "@/components/ExploreMenuServer";

type SP = Record<string, string | string[] | undefined>;

export default async function EventsPage({
    searchParams,
}: { searchParams?: Promise<SP> }) {
    const sp = (await searchParams) ?? {};
    const supabase = supabaseServerComponent();
    const { data: { user } } = await supabase.auth.getUser();

    const { count: unreadCount } = await supabase
        .from("messages").select("id", { head: true, count: "exact" })
        .eq("recipient_id", user?.id ?? "");

    const { data: events } = await supabase
        .from("community_events")
        .select("id,title,description,start_at,event_type")
        .order("start_at", { ascending: true })
        .limit(20);

    return (
        <main style={{ maxWidth: 1040, margin: "24px auto", padding: "0 16px" }}>
            <AppHeaderServer unreadCount={unreadCount ?? 0} />
            <ExploreMenuServer />
            <section className="card" style={{ padding: 16, marginTop: 16 }}>
                <h1>Events</h1>
                <div className="muted">Upcoming events.</div>
                <ul style={{ marginTop: 12 }}>
                    {(events ?? []).map(ev => (
                        <li key={ev.id} style={{ padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                            <div style={{ fontWeight: 700 }}>{ev.title}</div>
                            <div className="muted">{ev.description}</div>
                        </li>
                    ))}
                </ul>
            </section>
        </main>
    );
}
