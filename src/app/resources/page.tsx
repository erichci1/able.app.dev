import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";

type ResourceRow = {
    id: string;
    title: string | null;
    summary: string | null;
    url: string | null;
    created_at: string | null;
    category?: string | null;
    phase?: string | null;
};

export default async function ResourcesPage({
    searchParams,
}: {
    searchParams?: Record<string, string | string[] | undefined>;
}) {
    const supabase = supabaseServer();

    const order = (Array.isArray(searchParams?.order) ? searchParams?.order[0] : searchParams?.order) ?? "new";
    const type = (Array.isArray(searchParams?.type) ? searchParams?.type[0] : searchParams?.type) ?? "all"; // category filter
    const qtxt = (Array.isArray(searchParams?.q) ? searchParams?.q[0] : searchParams?.q) ?? "";

    const ascending = order === "old";

    // fetch categories for UI if you need them (not required for query)
    // const { data: catRows } = await supabase.from("resources").select("category").not("category","is",null);

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
    if (error) return <section className="card"><h1>Resources</h1><div style={{ color: "#991b1b" }}>{error.message}</div></section>;

    const rows: ResourceRow[] = data ?? [];

    return (
        <section className="card">
            <h1>Resources</h1>
            <ul>
                {rows.map(r => (
                    <li key={r.id}>
                        <strong>{r.title}</strong> — {fmtDate(r.created_at)} {r.category ? `• ${r.category}` : ""}
                        {r.url && <> — <Link href={r.url} target="_blank">Open</Link></>}
                    </li>
                ))}
            </ul>
        </section>
    );
}

function fmtDate(iso?: string | null) {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "2-digit", year: "numeric" });
}