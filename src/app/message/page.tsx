// File: src/app/message/page.tsx
import { supabaseServerComponent } from "../../lib/supabase/server";

type SP = Record<string, string | string[] | undefined>;
const pick = (v?: string | string[] | undefined) => v == null ? undefined : Array.isArray(v) ? v[0] : v;

export default async function MessageDetailPage({ searchParams }: { searchParams?: Promise<SP> }) {
    const sp: SP = (await searchParams) ?? {};
    const id = pick(sp.id);

    const supabase = supabaseServerComponent();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !id) {
        return (
            <main style={{ maxWidth: 1040, margin: "24px auto", padding: "0 16px" }}>
                <section className="card" style={{ padding: 16 }}>
                    <h1>Message</h1>
                    <div className="muted" style={{ marginTop: 6 }}>No message specified or not signed in.</div>
                </section>
            </main>
        );
    }

    const { data: msg } = await supabase
        .from("messages")
        .select("id,subject,body,sender_name,created_at,read_at")
        .eq("id", id)
        .eq("recipient_id", user.id)
        .maybeSingle();

    if (!msg) {
        return (
            <main style={{ maxWidth: 1040, margin: "24px auto", padding: "0 16px" }}>
                <section className="card" style={{ padding: 16 }}>
                    <h1>Message</h1>
                    <div className="muted" style={{ marginTop: 6 }}>Message not found.</div>
                </section>
            </main>
        );
    }

    return (
        <main style={{ maxWidth: 1040, margin: "24px auto", padding: "0 16px" }}>
            <section className="card" style={{ padding: 16 }}>
                <h1>{msg.subject || "Message"}</h1>
                <div className="muted" style={{ marginTop: 6 }}>
                    From {msg.sender_name ?? "Coach"} — {new Date(msg.created_at).toLocaleString()}
                </div>
                <div style={{ marginTop: 12, whiteSpace: "pre-wrap" }}>{msg.body ?? ""}</div>
            </section>
        </main>
    );
}
