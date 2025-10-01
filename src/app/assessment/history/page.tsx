import Link from "next/link";
import ExploreMenuServer from "@/components/ExploreMenuServer";
import AssessmentHistoryFilterBar from "@/components/AssessmentHistoryFilterBar";
import { supabaseServer } from "@/lib/supabase/server";

/**
* /assessment/history
* URL params:
* - order=new|old (default new)
* - from=YYYY-MM-DD
* - to=YYYY-MM-DD
* - page=1..N (default 1)
* - size=10|20|50 (default 10)
*/
export default async function AssessmentHistoryPage({
searchParams,
}: {
searchParams?: Record<string, string | string[] | undefined>;
}) {
const order = str(searchParams?.order) ?? "new";
const from = str(searchParams?.from) ?? "";
const to = str(searchParams?.to) ?? "";
const page = Math.max(1, Number(str(searchParams?.page) ?? "1") || 1);
const size = clamp([10,20,50], Number(str(searchParams?.size) ?? "10") || 10, 10);

const ascending = order === "old";
const supabase = supabaseServer();
const { data: { user } } = await supabase.auth.getUser();

if (!user) {
return (
<>
<ExploreMenuServer />
<section className="card">
<h1>Alignment History</h1>
<div className="muted" style={{ marginTop: 6 }}>
Please sign in to view your assessment history.
</div>
</section>
</>
);
}

// Build base filter
const baseFilter = (q: any) => {
q = q.eq("user_id", user.id);
if (from) q = q.gte("submission_date", new Date(from).toISOString());
if (to) {
const end = new Date(to);
end.setHours(23,59,59,999);
q = q.lte("submission_date", end.toISOString());
}
return q;
};

// 1) Count for pagination
const { count: total } = await baseFilter(
supabase.from("assessment_results_2").select("id", { head: true, count: "exact" })
);

const totalCount = total ?? 0;
const lastPage = Math.max(1, Math.ceil(totalCount / size));
const currentPage = Math.min(page, lastPage);

const fromIdx = (currentPage - 1) * size;
const toIdx = fromIdx + size - 1;

// 2) Fetch page rows
const { data: rows, error } = await baseFilter(
supabase
.from("assessment_results_2")
.select(`
id,
submission_date,
activate_percentage, build_percentage, leverage_percentage, execute_percentage
`)
)
.order("submission_date", { ascending })
.range(fromIdx, toIdx);

return (
<>
<ExploreMenuServer />

<section className="card">
<h1>Alignment History</h1>
<div className="muted" style={{ marginTop: 6 }}>
Review your recent assessments. Filters and sorting are shareable via URL.
</div>
</section>

{/* Filter bar */}
<AssessmentHistoryFilterBar />

{error ? (
<section className="card"><div style={{ color:"#991b1b" }}>{error.message}</div></section>
) : !rows?.length ? (
<section className="card"><div className="muted">No assessments match your filters.</div></section>
) : (
<section className="card" style={{ padding: 0, overflowX: "auto" }}>
<table style={{ width:"100%", borderCollapse:"separate", borderSpacing:0 }}>
<thead>
<tr>
<th style={th("left")}>Date</th>
<th style={th("center")}>Activate</th>
<th style={th("center")}>Build</th>
<th style={th("center")}>Leverage</th>
<th style={th("center")}>Execute</th>
<th style={th("right")}>Actions</th>
</tr>
</thead>
<tbody>
{rows.map((r: { id: any; submission_date: string | null | undefined; activate_percentage: string | number | null | undefined; build_percentage: string | number | null | undefined; leverage_percentage: string | number | null | undefined; execute_percentage: string | number | null | undefined; }, i: number) => {
const id = String(r.id); // ← safe id for key/href
return (
<tr key={id} style={{ borderTop: i === 0 ? "none" : "1px solid var(--border)" }}>
<td style={td("left")}>{fmtDateTime(r.submission_date)}</td>
<td style={td("center")}>{fmtPct(r.activate_percentage)}</td>
<td style={td("center")}>{fmtPct(r.build_percentage)}</td>
<td style={td("center")}>{fmtPct(r.leverage_percentage)}</td>
<td style={td("center")}>{fmtPct(r.execute_percentage)}</td>
<td style={td("right")}>
{/* deep link to details by id (update details page to accept ?id=) */}
<Link className="btn btn-ghost" href={`/assessment/details?id=${encodeURIComponent(id)}`}>
View
</Link>
</td>
</tr>
);
})}
</tbody>
</table>
</section>
)}

{/* Pagination */}
<section className="card" style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
<div className="muted">
Showing <strong>{rows?.length ?? 0}</strong> of <strong>{totalCount}</strong> • Page <strong>{currentPage}</strong> / {lastPage}
</div>
<div className="hstack" style={{ gap: 8 }}>
<PagerLink dir="prev" page={currentPage} lastPage={lastPage} />
<PagerLink dir="next" page={currentPage} lastPage={lastPage} />
</div>
</section>
</>
);
}

/* ---------- helpers ---------- */
function str(v?: string | string[] | null) {
if (!v) return undefined;
return Array.isArray(v) ? v[0] : v;
}
function clamp(allowed: number[], n: number, fallback: number) {
return allowed.includes(n) ? n : fallback;
}
function fmtPct(v: number | string | null | undefined) {
if (v === null || v === undefined) return "—";
const n = typeof v === "string" ? Number(v) : v;
return Number.isFinite(n) ? `${Math.round(n)}%` : "—";
}
function fmtDateTime(iso?: string | null) {
if (!iso) return "—";
const d = new Date(iso);
return d.toLocaleString(undefined, {
month:"short", day:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit"
});
}

/* table cell styles */
function th(align: "left"|"center"|"right"){
return { textAlign: align, padding: "12px 16px", color: "var(--muted)" } as React.CSSProperties;
}
function td(align: "left"|"center"|"right"){
return { textAlign: align, padding: "12px 16px" } as React.CSSProperties;
}

/* pager links computed from current URL on the client */
function PagerLink({ dir, page, lastPage }: { dir:"prev"|"next"; page:number; lastPage:number }) {
const disabled = (dir === "prev" && page <= 1) || (dir === "next" && page >= lastPage);
const href = (() => {
if (disabled) return "#";
if (typeof window === "undefined") return "#";
const params = new URLSearchParams(window.location.search);
const newPage = dir === "prev" ? page - 1 : page + 1;
params.set("page", String(newPage));
return `/assessment/history?${params}`;
})();
return (
<a className="btn btn-ghost" aria-disabled={disabled} href={href} onClick={(e) => disabled && e.preventDefault()}>
{dir === "prev" ? "← Previous" : "Next →"}
</a>
);
}