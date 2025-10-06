// File: src/app/resources/page.tsx
import { supabaseServerComponent } from "@/lib/supabase/server";
import AppHeaderServer from "@/components/AppHeaderServer";
import ExploreMenuServer from "@/components/ExploreMenuServer";

export default async function ResourcesPage() {
    const supabase = supabaseServerComponent();
    const { data: { user } } = await supabase.auth.getUser();

    const { count: unreadCount } = await supabase
        .from("messages").select("id", { head: true, count: "exact" })
        .eq("recipient_id", user?.id ?? "");

    const { data: rows } = await supabase
        .from("resources")
        .select("id,title,summary,url,category")
        .order("created_at", { ascending: false })
        .limit(50);

    return (
        <main style={{ maxWidth: 1040, margin: "24px auto", padding: "0 16px" }}>
            <AppHeaderServer unreadCount={unreadCount ?? 0} />
            <ExploreMenuServer />
            <section className="card" style={{ padding: 16, marginTop: 16 }}>
                <h1>Resources</h1>
                <ul style={{ marginTop: 12 }}>
                    {(rows ?? []).map(r => (
                        <li key={r.id} style={{ padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                            <a href={r.url} target="_blank" rel="noreferrer" style={{ fontWeight: 700 }}>
                                {r.title}
                            </a>
                            <div className="muted">{r.summary}</div>
                        </li>
                    ))}
                </ul>
            </section>
        </main>
    );
}

