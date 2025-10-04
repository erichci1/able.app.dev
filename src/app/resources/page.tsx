// File: src/app/resources/page.tsx
import Link from "next/link";
import { supabaseServer } from "../../lib/supabase/server";

type ResourceRow = {
    id: string;
    title: string | null;
    summary: string | null;
    url: string | null;
    created_at: string | null;
    category?: string | null;
    phase?: string | null;
};
type SP = Record<string, string | string[] | undefined>;
const s = (v?: string | string[] | undefined) => (v == null ? undefined : Array.isArray(v) ? v[0] : v);

function fmtDate(iso?: string | null) {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "2-digit", year: "numeric" });
}

export default async function ResourcesPage({
    searchParams,
}: {
    searchParams?: Promise<SP>;
}) {
    const sp: SP = (await searchParams) ?? {};
    const order = s(sp.order) ?? "new"; // new|old
    const type = s(sp.type) ?? "all"; // category
    const qtxt = s(sp.q) ?? "";

    const ascending = order === "old";
    const supabase = supabaseServer();

    let q = supabase
        .from("resources")
        .select("id, title, summary, url, created_at, category, phase")
        .order("created_at", { ascending })
        .limit(100);

    if (type !== "all") q = q.eq("category", type);

    if (qtxt) {
        const like = `%${qtxt.replace(/%/g, "\\%").replace(/_/g, "\\_")}%`;
        q = q.or(`title.ilike.${like},summary.ilike.${like}`);
    }

    const { data, error } = await q;
    if (error) {
        return (
            <section className="card">
                <h1>Resources</h1>
                <div style={{ color: "#991b1b" }}>{error.message}</div>
            </section>
        );
    }

    const rows: ResourceRow[] = data ?? [];

    return (
        <section className="card">
            <h1>Resources</h1>
            {!rows.length ? (
                <div className="muted" style={{ marginTop: 6 }}>
                    {type === "all" ? "No resources yet." : `No resources for ${type} yet.`}
                </div>
            ) : (
                <ul>
                    {rows.map((r) => (
                        <li key={r.id}>
                            <strong>{r.title}</strong> — {fmtDate(r.created_at)} {r.category ? `• ${r.category}` : ""}
                            {r.url && (
                                <>
                                    {" "}
                                    — <Link href={r.url} target="_blank">Open</Link>
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
