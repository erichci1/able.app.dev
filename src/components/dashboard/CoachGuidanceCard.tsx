// File: src/components/dashboard/CoachGuidanceCard.tsx
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";

const PHASES = [
{ value: "all", label: "All" },
{ value: "activate", label: "Activate" },
{ value: "build", label: "Build" },
{ value: "leverage", label: "Leverage" },
{ value: "execute", label: "Execute" },
];

export default async function CoachGuidanceCard({
phase = "all",
}: {
phase?: "all" | "activate" | "build" | "leverage" | "execute";
}) {
const supabase = supabaseServer();
const { data: { user } } = await supabase.auth.getUser();

if (!user) {
return (
<section className="card">
<h2>Coach Guidance</h2>
<div className="muted">Please sign in to see your guidance.</div>
</section>
);
}

// Build query: global (user_id is null) + personal (user_id = auth.uid())
let q = supabase
.from("coach_recommendations")
.select("id, title, content, phase, pinned, created_at")
.or(`user_id.eq.${user.id},user_id.is.null`)
.order("pinned", { ascending: false })
.order("created_at", { ascending: false })
.limit(6);

if (phase !== "all") {
q = q.eq("phase", phase);
}

const { data: recs, error } = await q;

return (
<section className="card">
<div className="hstack" style={{ justifyContent: "space-between", alignItems:"center" }}>
<h2>Coach Guidance</h2>
{/* Phase chips as relative links (stay on current page, changing only ?phase=) */}
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
) : !recs || recs.length === 0 ? (
<div className="muted" style={{ marginTop: 8 }}>
{phase === "all"
? "Your coach will leave guidance here."
: `No guidance for ${phase[0].toUpperCase() + phase.slice(1)} yet.`}
</div>
) : (
<div className="vstack" style={{ marginTop: 12, gap: 12 }}>
{recs.map((r, i) => (
<div
key={r.id}
style={{
borderTop: i === 0 ? "none" : "1px solid var(--border)",
paddingTop: i === 0 ? 0 : 8,
}}
>
<div className="hstack" style={{ justifyContent:"space-between", alignItems:"center" }}>
<strong>{r.title || "Guidance"}</strong>
{r.phase && <span className="badge">{r.phase}</span>}
</div>
<div className="muted" style={{ marginTop: 4, whiteSpace: "pre-wrap" }}>
{r.content}
</div>
</div>
))}
</div>
)}

<div className="hstack" style={{ marginTop: 12 }}>
<Link href="/assessment/details" className="btn btn-ghost">View Details</Link>
</div>
</section>
);
}
