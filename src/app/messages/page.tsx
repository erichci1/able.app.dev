// File: src/app/messages/page.tsx
import Link from "next/link";
import ExploreMenuServer from "../../components/ExploreMenuServer";
import { supabaseServerComponent } from "../../lib/supabase/server";

type SP = Record<string, string | string[] | undefined>;
const s = (v?: string | string[] | undefined) =>
    v == null ? undefined : Array.isArray(v) ? v[0] : v;

export default async function MessagesPage({
    searchParams,
}: {
    searchParams?: Promise<SP>;
}) {
    const sp: SP = (await searchParams) ?? {};
    const filter = (s(sp.filter) as "all" | "unread" | "read" | undefined) ?? "all";
    const sortAsc = s(sp.sort) === "asc";

    const supabase = supabaseServerComponent();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.id) {
        return (
            <>
                <ExploreMenuServer />
                <section className="card" style={{ maxWidth: 1040, margin: "24px auto" }}>
                    <h1>Messages</h1>
                    <div className="muted" style={{ marginTop: 6 }}>
                        Please sign in to view your inbox.
                    </div>
                </section>
            </>
        );
    }

    let q = supabase
        .from("messages")
        .select("id, subject, sender_name, created_at, read_at")
        .eq("recipient_id", user.id)
        .order("created_at", { ascending: !!sortAsc });

    if (filter === "unread") q = q.is("read_at", null);
    if (filter === "read") q = q.not("read_at", "is", null);

    const { data, error } = await q;

    return (
        <>
            <ExploreMenuServer />

            <section className="card" style={{ maxWidth: 1040, margin: "24px auto" }}>
                <header className="hstack" style={{ justifyContent: "space-between", alignItems: "center" }}>
                    <h1>Messages</h1>
                    <Filters filter={filter} sort={sortAsc ? "asc" : "desc"} />
                </header>

                {error ? (
                    <div style={{ color: "#991b1b", marginTop: 8 }}>{error.message}</div>
                ) : !data?.length ? (
                    <div className="muted" style={{ marginTop: 6 }}>No messages.</div>
                ) : (
                    <ul style={{ marginTop: 8 }}>
                        {data.map((m) => (
                            <li
                                key={m.id}
                                style={{
                                    padding: 12,
                                    borderTop: "1px solid var(--border)",
                                    display: "grid",
                                    gridTemplateColumns: "1fr auto",
                                    gap: 12,
                                    alignItems: "center",
                                }}
                            >
                                <div>
                                    <div style={{ fontWeight: 900 }}>{m.subject || "(no subject)"}</div>
                                    <div className="muted" style={{ marginTop: 4 }}>
                                        From {m.sender_name ?? "Coach"} — {fmt(m.created_at)} {m.read_at ? "" : " • Unread"}
                                    </div>
                                </div>
                                <div className="hstack" style={{ gap: 8, justifySelf: "end" }}>
                                    <Link className="btn btn-ghost" href={`/message?id=${encodeURIComponent(m.id)}`}>Open</Link>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </>
    );
}

function Filters({ filter, sort }: { filter: "all" | "unread" | "read"; sort: "asc" | "desc" }) {
    const base = new URLSearchParams();
    const make = (f: string, srt: string) => {
        const p = new URLSearchParams(base);
        p.set("filter", f);
        p.set("sort", srt);
        return `?${p.toString()}`;
    };

    return (
        <div className="hstack" style={{ gap: 8, flexWrap: "wrap" as const }}>
            <a className="btn" href={make("all", sort)}>All</a>
            <a className="btn" href={make("unread", sort)}>Unread</a>
            <a className="btn" href={make("read", sort)}>Read</a>
            <span style={{ width: 12 }} />
            <a className="btn" href={make(filter, "asc")}>Oldest</a>
            <a className="btn" href={make(filter, "desc")}>Newest</a>
        </div>
    );
}

function fmt(iso?: string | null) {
    if (!iso) return "";
    return new Date(iso).toLocaleString();
}
