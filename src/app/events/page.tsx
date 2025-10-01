import { supabaseServer } from "@/lib/supabase/server";

export default async function EventsPage() {
    const supabase = supabaseServer();
    const { data, error } = await supabase.from("community_events").select("id,title,start_at").order("start_at");
    if (error) return <div>{error.message}</div>;

    const rows = data ?? [];

    return (
        <section>
            <h1>Events</h1>
            <ul>
                {rows.map(r => (
                    <li key={r.id}>
                        {r.title} – {r.start_at}
                    </li>
                ))}
            </ul>
        </section>
    );
}