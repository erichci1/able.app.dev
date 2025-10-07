// File: src/components/AppHeaderServer.tsx
import Link from "next/link";
import { supabaseServerComponent } from "../lib/supabase/server";

export default async function AppHeaderServer() {
    const supabase = await supabaseServerComponent();
    const { data: { user } } = await supabase.auth.getUser();

    // Unread count (only when signed in)
    let unread = 0;
    if (user?.id) {
        const { count } = await supabase
            .from("messages")
            .select("id", { head: true, count: "exact" })
            .eq("recipient_id", user.id)
            .is("read_at", null);
        unread = count ?? 0;
    }

    return (
        <header className="card" style={{ padding: 12, borderRadius: 0 }}>
            <div className="hstack" style={{ justifyContent: "space-between", alignItems: "center" }}>
                <Link href="/dashboard" className="brand" style={{ textDecoration: "none", fontWeight: 900 }}>
                    The A.B.L.E. Man
                </Link>

                <nav className="hstack" aria-label="Primary" style={{ gap: 16 }}>
                    <Link className="btn btn-ghost" href="/dashboard">Dashboard</Link>
                    <Link className="btn btn-ghost" href="/events">Events</Link>
                    <Link className="btn btn-ghost" href="/resources">Resources</Link>
                    <Link className="btn btn-ghost" href="/messages">
                        Messages{unread ? <span className="pill" style={{ marginLeft: 6 }}>{unread}</span> : null}
                    </Link>
                </nav>

                <div className="hstack" style={{ gap: 8 }}>
                    <a className="btn btn-ghost" href="https://www.ableframework.com" target="_blank" rel="noopener noreferrer">
                        Website
                    </a>
                    {user?.id ? (
                        <a className="btn btn-primary" href="/logout">Logout</a>
                    ) : (
                        <a className="btn btn-primary" href="/auth/sign-in">Sign In</a>
                    )}
                </div>
            </div>
        </header>
    );
}
