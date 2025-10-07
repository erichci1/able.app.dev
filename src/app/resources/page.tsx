// File: src/app/resources/page.tsx
import Link from "next/link";
import { supabaseServerComponent } from "../../lib/supabase/server";

type SP = Record<string, string | string[] | undefined>;
const s = (v?: string | string[] | undefined) =>
    v == null ? undefined : Array.isArray(v) ? v[0] : v;

export default async function ResourcesPage({
    searchParams,
}: {
    searchParams?: Promise<SP>;
}) {
    const sp: SP = (await searchParams) ?? {};
    const phase = s(sp.phase) as "activate" | "build" | "leverage" | "execute" | undefined;
    const category = s(sp.category);

    const supabase = supabaseServerComponent();

    let q = supabase
        .from("resources")
        .select("id,title,summary,created_at,category,phase,url")
        .order("created_at", { ascending: false });

    if (phase) q = q.eq("phase", phase);
    if (category) q = q.eq("category", category);

    const { data, error } = await q;

    if (error) {
        return (
            <section className="card">
                <h2>Resources</h2>
                <div style={{ color: "#991b1b" }}>{error.message}</div>
            </section>
        );
    }

    const rows = data ?? [];

    return (
        <section className="card">
            <h2>Resources</h2>
            {!rows.length ? (
                <div className="muted" style={{ marginTop: 6 }}>No resources found.</div>
            ) : (
                <ul style={{ marginTop: 8 }}>
                    {rows.map((r) => (
                        <li key={r.id} style={{ padding: 12, borderTop: "1px solid var(--border)" }}>
                            <div style={{ fontWeight: 900 }}>{r.title}</div>
                            <div className="muted" style={{ marginTop: 4 }}>
                                {r.created_at ? new Date(r.created_at).toLocaleDateString() : ""}
                                {r.category ? ` • ${r.category}` : ""}
                                {r.phase ? ` • ${r.phase}` : ""}
                            </div>
                            {r.summary && <div className="muted" style={{ marginTop: 6 }}>{r.summary}</div>}
                            <div className="hstack" style={{ marginTop: 8 }}>
                                {r.url && <a className="btn btn-primary" href={r.url} target="_blank" rel="noopener noreferrer">Open</a>}
                                <Link className="btn btn-ghost" href={`/resource?id=${encodeURIComponent(r.id)}`}>Details</Link>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
