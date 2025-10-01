// File: src/app/dashboard/page.tsx
import Link from "next/link";
import ExploreMenuServer from "@/components/ExploreMenuServer";
import AbleDonuts, { AssessmentValues } from "@/components/AbleDonuts";
import WelcomeToast from "@/components/WelcomeToast";
import CoachGuidanceCard from "@/components/dashboard/CoachGuidanceCard";
import UpcomingEventsCard from "@/components/dashboard/UpcomingEventsCard";
import MessagesPreviewCard from "@/components/dashboard/MessagesPreviewCard";
import ResourcesPreviewCard from "@/components/dashboard/ResourcesPreviewCard";
import { supabaseServer } from "@/lib/supabase/server";

type Phase = "all" | "activate" | "build" | "leverage" | "execute";

export default async function DashboardPage({
searchParams,
}: {
searchParams?: Record<string, string | string[] | undefined>;
}) {
// URL flags for toasts
const firstFlag = Array.isArray(searchParams?.first) ? searchParams?.first[0] : searchParams?.first;
const doneFlag = Array.isArray(searchParams?.done) ? searchParams?.done[0] : searchParams?.done;
const showFirst = firstFlag === "1";
const showDone = doneFlag === "1";

// Phase for filtering cards (guidance, events, resources)
const phaseParam = Array.isArray(searchParams?.phase) ? searchParams?.phase[0] : searchParams?.phase;
const activePhase = (phaseParam ?? "all") as Phase;

const supabase = supabaseServer();
const { data: { user } } = await supabase.auth.getUser();

// Signed-out (still show toasts if present)
if (!user) {
return (
<>
{showFirst && (
<WelcomeToast show message="Welcome to The A.B.L.E. Man — let’s get started." stripParam="first" />
)}
{showDone && (
<WelcomeToast show message="Great job finishing your Alignment!" stripParam="done" />
)}
<ExploreMenuServer />
<section className="card">
<h2>Your A.B.L.E. Alignment</h2>
<div className="muted" style={{ marginTop: 6 }}>
Please sign in to view your dashboard.
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

// First name for dynamic toasts
const { data: prof } = await supabase
.from("profiles")
.select("first_name, full_name, email")
.eq("id", user.id)
.maybeSingle();

const firstName =
(prof?.first_name?.trim() ||
(prof?.full_name ? String(prof.full_name).split(" ")[0] : "") ||
(user.email ? String(user.email).split("@")[0] : "") ||
"").trim();

const firstMsg = firstName
? `Welcome to The A.B.L.E. Man, ${firstName} — let’s get started.`
: "Welcome to The A.B.L.E. Man — let’s get started.";
const doneMsg = firstName
? `Great job finishing your Alignment, ${firstName}!`
: "Great job finishing your Alignment!";

// Latest assessment
const { data: latest, error } = await supabase
.from("assessment_results_2")
.select(`
id,
submission_date,
activate_percentage,
build_percentage,
leverage_percentage,
execute_percentage
`)
.eq("user_id", user.id)
.order("submission_date", { ascending: false })
.limit(1)
.maybeSingle();

const toPct = (v: unknown): number | null => {
if (v === null || v === undefined) return null;
const n = typeof v === "string" ? Number(v) : (v as number);
return Number.isFinite(n) ? n : null;
};

const donutValues: AssessmentValues = latest
? {
activate: toPct(latest.activate_percentage),
build: toPct(latest.build_percentage),
leverage: toPct(latest.leverage_percentage),
execute: toPct(latest.execute_percentage),
}
: { activate: null, build: null, leverage: null, execute: null };

const lastTaken = latest?.submission_date
? new Date(latest.submission_date).toLocaleString(undefined, {
month: "short", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
})
: null;

return (
<>
{/* one-time toasts */}
{showFirst && <WelcomeToast show message={firstMsg} stripParam="first" />}
{showDone && <WelcomeToast show message={doneMsg} stripParam="done" />}

<ExploreMenuServer />

{/* Assessment */}
<section className="card">
<h2>Your A.B.L.E. Alignment</h2>
{lastTaken && <div className="muted" style={{ marginTop: 6 }}>Last taken {lastTaken}</div>}
<div style={{ marginTop: 12 }}>
<AbleDonuts values={donutValues} columns={4} />
</div>
<div className="hstack" style={{ marginTop: 12, flexWrap: "wrap" as const }}>
<Link href="/assessment/take" className="btn btn-primary">Retake Alignment</Link>
<Link href="/assessment/details" className="btn btn-ghost">View Details</Link>
<Link href="/assessment/history" className="btn btn-ghost">History</Link>
</div>
{error && (
<div style={{ color: "#991b1b", marginTop: 8 }}>
Unable to load your latest result right now.
</div>
)}
</section>

{/* Guidance (phase-aware) */}
<CoachGuidanceCard phase={activePhase} />

{/* Events (phase-aware with graceful fallback) */}
<UpcomingEventsCard phase={activePhase} />

{/* Resources (phase-aware with graceful fallback) */}
<ResourcesPreviewCard phase={activePhase} />

{/* Messages */}
<MessagesPreviewCard />
</>
);
}

