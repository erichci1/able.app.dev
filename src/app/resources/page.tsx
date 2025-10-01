import Link from "next/link";
import ExploreMenuServer from "@/components/ExploreMenuServer";
import { supabaseServer } from "@/lib/supabase/server";
import ResourcesFilterBar from "@/components/ResourcesFilterBar";

export default async function ResourcesPage({
searchParams,
}: { searchParams?: Record<string, string | string[] | undefined> }) {
const order = str(searchParams?.order) ?? "new";
const type = str(searchParams?.type) ?? "all";
const q = str(searchParams?.q) ?? "";
const ascending = order === "old";

const supabase = supabaseServer();

const { data: catRows } = await supabase
.from("resources")
.select("category")
.not("category", "is", null)
.order("category", { ascending: true });
const categories = Array.from(new Set((catRows ?? []).map(r => r.category).filter(Boolean))) as string[];

let query = supabase.from("resources").select("id, title, summary, url, created_at, category");

if (type !== "all") query = query.eq("category", type);
if (q) {
const like = `%${q.replace(/%/g,"\\%").replace(/_/g,"\\_")}%`;
query = query.or(`title.ilike.${like},summary.ilike.${like}`);
}
query = query.order("created_at", { ascending }).limit(100);

const { data, error } = await query;
const rows = data ?? [];

return (
<>
<ExploreMenuServer />
<section className="card">
<h1>Resources</h1>
<div className="muted" style={{ marginTop: 6 }}>
Browse curated resources. Filter by type, search, and share the link.
</div>
</section>

<ResourcesFilterBar categories={categories} />

{error ? (
<section className="card"><div style={{ color:"#991b1b" }}>{error.message}</div></section>
) : !rows.length ? (
<section className="card"><div className="muted">No resources match your filters.</div></section>
) : (
<section className="card" style={{ padding: 0 }}>
<ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
{rows.map((r) => (
<li key={r.id} style={{
padding: 16, borderBottom: "1px solid var(--border)",
display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "center",
}}>
<div>
<div style={{ fontWeight: 900 }}>{r.title}</div>
<div className="muted" style={{ marginTop: 4 }}>
{fmtDate(r.created_at)}{r.category ? ` • ${r.category}` : ""}
</div>
{r.summary && <div className="muted" style={{ marginTop: 6 }}>{r.summary}</div>}
</div>
<div className="hstack" style={{ justifySelf: "end" }}>
{r.url && <a className="btn btn-primary" href={r.url} target="_blank" rel="noopener noreferrer">Open</a>}
<Link className="btn btn-ghost" href={`/resource?id=${encodeURIComponent(r.id)}`}>Details</Link>
</div>
</li>
))}
</ul>
</section>
)}
</>
);
}
function str(v?: string | string[] | null) { if (!v) return undefined; return Array.isArray(v) ? v[0] : v; }
function fmtDate(iso?: string | null) { if (!iso) return ""; return new Date(iso).toLocaleDateString(undefined,{ month:"short", day:"2-digit", year:"numeric" }); }
