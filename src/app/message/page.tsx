// File: src/app/message/page.tsx
import Link from "next/link";
import { supabaseServerComponent } from "../../lib/supabase/server";

type SP = Record<string, string | string[] | undefined>;
const s = (v?: string | string[] | undefined) =>
    v == null ? undefined : Array.isArray(v) ? v[0] : v;

export default async function MessageDetailPage({
    searchParams,
}: {
    searchParams?: Promise<SP>;
}) {
    const sp: SP = (await searchParams) ?? {};
    const id = s(sp.id);

    const supabase = await supabaseServerComponent();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.id) {
        return (
            <section className="card" style={{ maxWidth: 1040, margin: "24px auto" }}>
                <h1>Message</h1>
                <div className="muted" style={{ marginTop: 6 }}>Please sign in to view messages.</div>
                <div className="hstack" style={{ marginTop: 10 }}>
                    <a className="btn btn-primary" href="/auth/sign-in?redirect=/messages">Sign In</a>
                </div>
            </section>
        );
    }

    if (!id) {
        return (
            <section className="card" style={{ maxWidth: 1040, margin: "24px auto" }}>
                <h1>Message</h1>
                <div className="muted" style={{ marginTop: 6 }}>No message specified.</div>
                <div className="hstack" style={{ marginTop: 10 }}>
                    <Link className="btn btn-ghost" href="/messages">Back to Messages</Link>
                </div>
            </section>
        );
    }

    const { data, error } = await supabase
        .from("messages")
        .select("id, subject, sender_name, created_at, read_at, content")
        .eq("id", id)
        .eq("recipient_id", user.id)
        .maybeSingle();

    return (
        <section className="card" style={{ maxWidth: 1040, margin: "24px auto" }}>
            <div className="hstack" style={{ justifyContent: "space-between", alignItems: "center" }}>
                <h1>Message</h1>
                <Link className="btn btn-ghost" href="/messages">Back to Messages</Link>
            </div>

            {error ? (
                <div style={{ color: "#991b1b", marginTop: 8 }}>{error.message}</div>
            ) : !data ? (
                <div className="muted" style={{ marginTop: 6 }}>Message not found.</div>
            ) : (
                <article style={{ marginTop: 12 }}>
                    <div style={{ fontWeight: 900, fontSize: 18 }}>{data.subject || "(no subject)"}</div>
                    <div className="muted" style={{ marginTop: 4 }}>
                        From {data.sender_name ?? "Coach"} — {fmt(data.created_at)} {data.read_at ? "" : " • Unread"}
                    </div>
                    <div style={{ marginTop: 12, whiteSpace: "pre-wrap" }}>
                        {data.content || "(no content)"}
                    </div>
                </article>
            )}
        </section>
    );
}

function fmt(iso?: string | null) {
    if (!iso) return "";
    return new Date(iso).toLocaleString();
}