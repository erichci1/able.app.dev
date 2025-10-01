import ExploreMenuServer from "@/components/ExploreMenuServer";
import { supabaseServer } from "@/lib/supabase/server";
const PHASES = ["activate","build","leverage","execute"];

export default async function ChallengesPage({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
const supabase = supabaseServer();
const { data: { user } } = await supabase.auth.getUser();
const phase = str(searchParams?.phase) ?? "all";

if (user) {
await supabase.from("user_content_seen").upsert(
{ user_id: user.id, kind: "challenge", last_seen_at: new Date().toISOString() },
{ onConflict: "user_id,kind" }
);
}

let q = supabase
.from("challenges")
.select("id, title, description, phase, created_at, week_number, difficulty, challenge_url")
.order("created_at", { ascending:false })
.limit(100);
if (phase !== "all" && PHASES.includes(phase)) q = q.eq("phase", phase as any);

const { data, error } = await q;
const rows = data ?? [];

return (
<>
<ExploreMenuServer />
<section className="card">
<h1>Challenges</h1>
<div className="muted" style={{ marginTop: 6 }}>
{phase === "all" ? "All phases" : label(phase)}
</div>
</section>

{error ? (
<section className="card"><div style={{ color:"#991b1b" }}>{error.message}</div></section>
) : !rows.length ? (
<section className="card"><div className="muted">No challenges match your filters.</div></section>
) : (
<section className="card" style={{ padding:0 }}>
<ul style={{ listStyle:"none", margin:0, padding:0 }}>
{rows.map(r => (
<li key={r.id} style={{ padding:16, borderBottom:"1px solid var(--border)", display:"grid", gridTemplateColumns:"1fr auto", gap:12 }}>
<div>
<div style={{ fontWeight:900 }}>{r.title}</div>
<div className="muted" style={{ marginTop:4 }}>
{fmtDate(r.created_at)} {r.phase ? `• ${label(r.phase)}` : ""} {r.week_number ? `• Week ${r.week_number}` : ""}
</div>
{r.description && <div className="muted" style={{ marginTop:6 }}>{r.description}</div>}
</div>
<div className="hstack" style={{ justifySelf:"end" }}>
{r.challenge_url && <a className="btn btn-primary" href={r.challenge_url} target="_blank" rel="noopener noreferrer">Open</a>}
</div>
</li>
))}
</ul>
</section>
)}
</>
);
}
function str(v?: string | string[] | null){ if(!v) return undefined; return Array.isArray(v)?v[0]:v; }
function fmtDate(iso?: string | null){ if(!iso) return ""; return new Date(iso).toLocaleDateString(undefined,{ month:"short", day:"2-digit", year:"numeric" }); }
function label(p: string){ return p[0].toUpperCase()+p.slice(1); }
