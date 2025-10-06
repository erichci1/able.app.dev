// File: src/app/dashboard/page.tsx
import { supabaseServerComponent } from "@/lib/supabase/server";
import ExploreMenuServer from "@/components/ExploreMenuServer";
import AppHeaderServer from "@/components/AppHeaderServer";

export default async function DashboardPage() {
    const supabase = supabaseServerComponent();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return (
            <main style={{ maxWidth: 960, margin: "24px auto" }}>
                <AppHeaderServer />
                <section className="card" style={{ padding: 16, marginTop: 16 }}>
                    <h1>Dashboard</h1>
                    <div className="muted">Please sign in to view your dashboard.</div>
                </section>
            </main>
        );
    }

    // Example: compute unread
    const { count: unreadCount } = await supabase
        .from("messages")
        .select("id", { head: true, count: "exact" })
        .eq("recipient_id", user.id)
        .is("read_at", null);

    return (
        <main style={{ maxWidth: 1040, margin: "24px auto", padding: "0 16px" }}>
            <AppHeaderServer unreadCount={unreadCount ?? 0} />
            <ExploreMenuServer />
            <section className="card" style={{ padding: 16, marginTop: 16 }}>
                <h2>Your A.B.L.E. Alignment</h2>
                <div className="muted" style={{ marginTop: 6 }}>
                    Welcome back! View your latest assessment, guidance, events and messages.
                </div>
            </section>
        </main>
    );
}

