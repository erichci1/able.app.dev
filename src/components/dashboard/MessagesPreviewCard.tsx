// File: src/components/dashboard/MessagesPreviewCard.tsx
import Link from "next/link";
import { supabaseServerComponent } from "../../lib/supabase/server";

export default async function MessagesPreviewCard() {
    const supabase = await supabaseServerComponent();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.id) {
        return (
            <section className="card">
                <h2>Messages</h2>
                <div className="muted" style={{ marginTop: 6 }}>Please sign in to view your messages.</div>
            </section>
        );
    }

    const { data, error } = await supabase
        .from("messages")
        .select("id, subject, sender_name, created_at, read_at")
        .eq("recipient_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3);

    return (
        <section className="card">
            <div className="hstack" style={{ justifyContent: "space-between", alignItems: "center" }}>
                <h2>Messages</h2>
                <Link className="btn btn-ghost" href="/messages">Inbox</Link>
            </div>

            {error ? (
                <div style={{ color: "#991b1b", marginTop: 8 }}>{error.message}</div>
            ) : !data?.length ? (
                <div className="muted" style={{ marginTop: 6 }}>No messages yet.</div>
            ) : (
                <ul style={{ marginTop: 8 }}>
                    {data.map((m) => (
                        <li key={m.id} style={{ padding: 12, borderTop: "1px solid var(--border)" }}>
                            <div style={{ fontWeight: 900 }}>{m.subject || "(no subject)"}</div>
                            <div className="muted" style={{ marginTop: 4 }}>
                                From {m.sender_name ?? "Coach"} — {fmt(m.created_at)} {m.read_at ? "" : " • Unread"}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

function fmt(iso?: string | null) { return iso ? new Date(iso).toLocaleString() : ""; }
