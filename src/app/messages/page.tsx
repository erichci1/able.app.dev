// File: src/app/messages/page.tsx
import Link from "next/link";
import { supabaseServer } from "../../lib/supabase/server";

type MessageRow = {
    id: string;
    subject: string | null;
    sender: string | null;
    created_at: string | null;
    is_read?: boolean | null;
};

type SP = Record<string, string | string[] | undefined>;
const s = (v?: string | string[] | undefined) =>
    v == null ? undefined : Array.isArray(v) ? v[0] : v;

function fmtDate(iso?: string | null) {
    if (!iso) return "";
    return new Date(iso).toLocaleString(undefined, {
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default async function MessagesPage({
    searchParams,
}: {
    searchParams?: Promise<SP>;
}) {
    // ✅ normalize Promise<SP> to object
    const sp: SP = (await searchParams) ?? {};
    const filter = s(sp.filter) ?? "all"; // all | unread | read
    const qtxt = s(sp.q) ?? "";

    const supabase = supabaseServer();
    let q = supabase
        .from("messages")
        .select("id, subject, sender, created_at, is_read")
        .order("created_at", { ascending: false })
        .limit(50);

    if (filter === "unread") q = q.eq("is_read", false);
    if (filter === "read") q = q.eq("is_read", true);

    if (qtxt) {
        const like = `%${qtxt.replace(/%/g, "\\%").replace(/_/g, "\\_")}%`;
        q = q.or(`subject.ilike.${like},sender.ilike.${like}`);
    }

    const { data, error } = await q;

    if (error) {
        return (
            <section className="card">
                <h1>Messages</h1>
                <div style={{ color: "#991b1b" }}>{error.message}</div>
            </section>
        );
    }

    const rows: MessageRow[] = data ?? [];

    return (
        <section className="card">
            <h1>Messages</h1>
            {!rows.length ? (
                <div className="muted" style={{ marginTop: 6 }}>
                    {filter === "unread"
                        ? "No unread messages."
                        : filter === "read"
                            ? "No read messages."
                            : "No messages yet."}
                </div>
            ) : (
                <ul style={{ marginTop: 8 }}>
                    {rows.map((m) => (
                        <li key={m.id} style={{ marginBottom: 6 }}>
                            <Link href={`/message?id=${m.id}`}>
                                <strong>{m.subject || "(no subject)"}</strong>
                            </Link>{" "}
                            — {m.sender ?? "Unknown"} • {fmtDate(m.created_at)}
                            {m.is_read ? "" : " • Unread"}
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}