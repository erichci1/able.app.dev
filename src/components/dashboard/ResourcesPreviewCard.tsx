// File: src/components/dashboard/ResourcesPreviewCard.tsx
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";

const PHASES = [
{ value: "all", label: "All" },
{ value: "activate", label: "Activate" },
{ value: "build", label: "Build" },
{ value: "leverage", label: "Leverage" },
{ value: "execute", label: "Execute" },
];

type Phase = "all" | "activate" | "build" | "leverage" | "execute";

export default async function ResourcesPreviewCard({ phase = "all" }: { phase?: Phase }) {
const supabase = supabaseServer();

// Try a phase-filtered query first (assumes 'phase' column).
async function fetchResourcesFiltered() {
let q = supabase
.from("resources")
.select("id, title, summary, url, created_at, category, phase")
.order("created_at", { ascending: false })
.limit(3);

if (phase !== "all") q = q.eq("phase", phase);
return await q;
}

// Fallback if phase column is missing.
async function fetchResourcesFallback() {
return await supabase
.from("resources")
.select("id, title, summary, url, created_at, category")
.order("created_at", { ascending: false })
.limit(3);
}

let data: any[] | null = null;
let error: any = null;

const try1 = await fetchResourcesFiltered();
if (try1.error && /column .*phase.* does not exist/i.test(try1.error.message)) {
const try2 = await fetchResourcesFallback();
data = try2.data ?? [];
error = try2.error;
} else {
data = try1.data ?? [];
error = try1.error;
}

return (
<section className="card">
<div className="hstack" style={{ justifyContent: "space-between", alignItems:"center" }}>
<h2>Resources</h2>
<div className="hstack" style={{ gap: 8, flexWrap: "wrap" as const }}>
{PHASES.map(p => {
const active = p.value === phase;
const href = p.value === "all" ? "?" : `?phase=${p.value}`;
return (
<Link
key={p.value}
href={href}
className="btn"
style={{
padding: "6px 10px",
borderRadius: 999,
fontWeight: 800,
background: active ? "#0C2D6F" : "#fff",
color: active ? "#fff" : "#0f172a",
border: "1px solid var(--border)",
}}
aria-pressed={active}
>
{p.label}
</Link>
);
})}
</div>
</div>

{error ? (
<div style={{ color: "#991b1b", marginTop: 8 }}>{error.message}</div>
) : !data?.length ? (
<div className="muted" style={{ marginTop: 6 }}>
{phase === "all" ? "No resources yet." : `No ${phase} resources yet.`}
</div>
) : (
<div style={{ marginTop: 8 }}>
<ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
{data.map((r) => (
<li
key={r.id}
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
<div style={{ fontWeight: 900 }}>{r.title}</div>
<div className="muted" style={{ marginTop: 4 }}>
{fmtDate(r.created_at)}{r.category ? ` • ${r.category}` : ""}{r.phase ? ` • ${label(r.phase)}` : ""}
</div>
{r.summary && <div className="muted" style={{ marginTop: 6 }}>{r.summary}</div>}
</div>
<div className="hstack" style={{ justifySelf: "end" }}>
{r.url && (
<a className="btn btn-primary" href={r.url} target="_blank" rel="noopener noreferrer">
Open
</a>
)}
<Link className="btn btn-ghost" href={`/resource?id=${encodeURIComponent(r.id)}`}>
Details
</Link>
</div>
</li>
))}
</ul>

<div className="hstack" style={{ marginTop: 10 }}>
<Link className="btn btn-ghost" href="/resources">All Resources</Link>
</div>
</div>
)}
</section>
);
}

function fmtDate(iso?: string | null) {
if (!iso) return "";
return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "2-digit", year: "numeric" });
}
function label(p: string){ return p[0].toUpperCase()+p.slice(1); }
