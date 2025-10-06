// File: src/app/messages/page.tsx
import { supabaseServerComponent } from "@/lib/supabase/server";
import AppHeaderServer from "@/components/AppHeaderServer";
import ExploreMenuServer from "@/components/ExploreMenuServer";

export default async function MessagesPage() {
    const supabase = supabaseServerComponent();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return (
            <main style={{ maxWidth: 960, margin: "24px auto" }}>
                <AppHeaderServer />
                <section className="card" style={{ padding: 16, marginTop: 16 }}>
                    <h1>Messages</h1>
                    <div className="muted">Please sign in to view your inbox.</div>
                </section>
            </main>
        );
    }

    const { count: unreadCount } = await supabase
        .from("messages").select("id", { head: true, count: "exact" })
        .eq("recipient_id", user.id).is("read_at", null);

    const { data: items } = await supabase
        .from("messages")
        .select("id,subject,sender_name,created_at,read_at")
        .eq("recipient_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

    return (
        <main style={{ maxWidth: 1040, margin: "24px auto", padding: "0 16px" }}>
            <AppHeaderServer unreadCount={unreadCount ?? 0} />
            <ExploreMenuServer />
            <section className="card" style={{ padding: 16, marginTop: 16 }}>
                <h1>Messages</h1>
                <ul style={{ marginTop: 12 }}>
                    {(items ?? []).map(m => (
                        <li key={m.id} style={{ padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                            <a href={`/message?id=${encodeURIComponent(m.id)}`} style={{ fontWeight: 700 }}>
                                {m.subject || "(no subject)"}
                            </a>
                            <div className="muted">
                                From {m.sender_name ?? "Coach"} — {new Date(m.created_at).toLocaleString()}
                            </div>
                        </li>
                    ))}
                </ul>
            </section>
        </main>
    );
}