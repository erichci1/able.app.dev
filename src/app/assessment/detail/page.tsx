// src/app/assessment/details/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import ExploreMenuServer from "@/components/ExploreMenuServer";
import AbleDonuts, { AssessmentValues } from "@/components/AbleDonuts";
import { supabaseServer } from "@/lib/supabase/server";

/**
* Assessment Details
* - Default: loads the latest submission for the signed-in user
* - Deep link: /assessment/details?id=<assessment_id> opens that specific submission
*/
export default async function AssessmentDetailsPage({
searchParams,
}: {
searchParams?: { id?: string };
}) {
const supabase = supabaseServer();
const { data: { user } } = await supabase.auth.getUser();

if (!user) {
return (
<>
<ExploreMenuServer />
<section className="card">
<h1>Alignment Details</h1>
<div className="muted" style={{ marginTop: 6 }}>
Please sign in to view your alignment details.
</div>
<div className="hstack" style={{ marginTop: 10 }}>
<a className="btn btn-primary" href="/auth/callback">Sign In</a>
<a className="btn btn-ghost" href="https://www.ableframework.com/getstarted" target="_blank" rel="noopener noreferrer">
Get Started
</a>
</div>
</section>
</>
);
}

const targetId = searchParams?.id?.trim();

// Build the base select (with all coaching fields)
const baseSelect = `
id,
submission_date,
activate_percentage, build_percentage, leverage_percentage, execute_percentage,
activate_wtm, build_wtm, leverage_wtm, execute_wtm,
activate_yns, build_yns, leverage_yns, execute_yns
`;

// If id provided: load that exact row and verify ownership.
// Otherwise: load latest for the current user.
let latest:
| {
id: string;
submission_date: string | null;
activate_percentage: number | string | null;
build_percentage: number | string | null;
leverage_percentage: number | string | null;
execute_percentage: number | string | null;
activate_wtm: string | null;
build_wtm: string | null;
leverage_wtm: string | null;
execute_wtm: string | null;
activate_yns: string | null;
build_yns: string | null;
leverage_yns: string | null;
execute_yns: string | null;
}
| null
| undefined;

if (targetId) {
// Specific submission by id — also ensure it belongs to the user
const { data, error } = await supabase
.from("assessment_results_2")
.select(baseSelect)
.eq("id", targetId)
.eq("user_id", user.id)
.maybeSingle();

if (error) {
return (
<>
<ExploreMenuServer />
<section className="card">
<h1>Alignment Details</h1>
<div style={{ color: "#991b1b", marginTop: 8 }}>{error.message}</div>
<div className="hstack" style={{ marginTop: 10 }}>
<Link href="/assessment/history" className="btn btn-ghost">Back to History</Link>
</div>
</section>
</>
);
}
if (!data) return notFound();
latest = data;
} else {
// Latest submission for this user
const { data, error } = await supabase
.from("assessment_results_2")
.select(baseSelect)
.eq("user_id", user.id)
.order("submission_date", { ascending: false })
.limit(1)
.maybeSingle();

if (error) {
return (
<>
<ExploreMenuServer />
<section className="card">
<h1>Alignment Details</h1>
<div style={{ color: "#991b1b", marginTop: 8 }}>{error.message}</div>
</section>
</>
);
}
if (!data) {
return (
<>
<ExploreMenuServer />
<section className="card">
<h1>Alignment Details</h1>
<div className="muted" style={{ marginTop: 6 }}>
You haven’t completed an assessment yet.
</div>
<div className="hstack" style={{ marginTop: 10 }}>
<Link href="/assessment/take" className="btn btn-primary">Take Alignment</Link>
</div>
</section>
</>
);
}
latest = data;
}

// Safe coercion for numeric/string percents
const toPct = (v: unknown): number | null => {
if (v === null || v === undefined) return null;
const n = typeof v === "string" ? Number(v) : (v as number);
return Number.isFinite(n) ? n : null;
};

const values: AssessmentValues = {
activate: toPct(latest.activate_percentage),
build: toPct(latest.build_percentage),
leverage: toPct(latest.leverage_percentage),
execute: toPct(latest.execute_percentage),
};

const lastTaken = latest.submission_date
? new Date(latest.submission_date).toLocaleString(undefined, {
month: "short", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
})
: null;

const pillars = [
{
key: "activate",
label: "Activate",
pct: values.activate,
wtm: latest.activate_wtm,
yns: latest.activate_yns,
},
{
key: "build",
label: "Build",
pct: values.build,
wtm: latest.build_wtm,
yns: latest.build_yns,
},
{
key: "leverage",
label: "Leverage",
pct: values.leverage,
wtm: latest.leverage_wtm,
yns: latest.leverage_yns,
},
{
key: "execute",
label: "Execute",
pct: values.execute,
wtm: latest.execute_wtm,
yns: latest.execute_yns,
},
] as const;

return (
<>
<ExploreMenuServer />

{/* Overview */}
<section className="card">
<h1>Alignment Details</h1>
{lastTaken && (
<div className="muted" style={{ marginTop: 6 }}>
Submission • {lastTaken}
</div>
)}

<div style={{ marginTop: 12 }}>
<AbleDonuts values={values} columns={4} />
</div>

<div className="hstack" style={{ marginTop: 12, flexWrap: "wrap" as const }}>
<Link href="/assessment/take" className="btn btn-primary">Retake Alignment</Link>
<Link href="/assessment/history" className="btn btn-ghost">History</Link>
</div>
</section>

{/* Per-pillar coaching */}
<section className="card">
<h2>Your Coaching Guidance</h2>
<div className="muted" style={{ marginTop: 6 }}>
Insights and next steps for each phase.
</div>

<div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
{pillars.map((p) => (
<div key={p.key} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 16, background: "#fff" }}>
<div style={{ fontWeight: 900, fontSize: 16 }}>{p.label}</div>
{p.pct != null && (
<div className="muted" style={{ marginTop: 4 }}>
Current score: {Math.round(p.pct)}%
</div>
)}

<div style={{ marginTop: 12 }}>
<div style={{ fontWeight: 800, marginBottom: 6 }}>What this means</div>
<div className="muted" style={{ whiteSpace: "pre-wrap" }}>
{p.wtm?.trim() ? p.wtm : "No coach guidance yet."}
</div>
</div>

<div style={{ marginTop: 12 }}>
<div style={{ fontWeight: 800, marginBottom: 6 }}>Your next steps</div>
<div className="muted" style={{ whiteSpace: "pre-wrap" }}>
{p.yns?.trim() ? p.yns : "No next steps added yet."}
</div>
</div>
</div>
))}
</div>
</section>
</>
);
}
