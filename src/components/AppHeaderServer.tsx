// File: src/components/AppHeaderServer.tsx
import Link from "next/link";
import { supabaseServerComponent } from "@/lib/supabase/server";

export default async function AppHeaderServer({ unreadCount = 0 }: { unreadCount?: number }) {
    const supabase = supabaseServerComponent();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <header className="hstack" style={{ padding: "10px 16px", gap: 12, justifyContent: "space-between" }}>
            <Link href="/" className="muted" style={{ fontWeight: 900 }}>The A.B.L.E. Man</Link>
            <nav className="hstack" style={{ gap: 16 }}>
                <Link href="/dashboard">Dashboard</Link>
                <Link href="/events">Events</Link>
                <Link href="/resources">Resources</Link>
                <Link href="/messages">
                    Messages{unreadCount > 0 ? ` (${unreadCount})` : ""}
                </Link>
            </nav>
            <div>
                {user ? (
                    <a href="/auth/sign-out" className="btn btn-ghost">Logout</a>
                ) : (
                    <a href="/auth/sign-in" className="btn btn-primary">Sign In</a>
                )}
            </div>
        </header>
    );
}
