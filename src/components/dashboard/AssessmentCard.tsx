// File: src/components/dashboard/AssessmentCard.tsx
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import AbleDonuts, { type AssessmentValues } from "@/components/AbleDonuts";

type Props = {
userId: string;
};

export default async function AssessmentCard({ userId }: Props) {
const supabase = supabaseServer();

// Fetch latest assessment for this user (shallow, step-by-step)
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
.eq("user_id", userId)
.order("submission_date", { ascending: false })
.limit(1)
.maybeSingle();

// Helper: coerce % safely (numeric|string|null → number|null)
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
month: "short",
day: "2-digit",
year: "numeric",
hour: "2-digit",
minute: "2-digit",
})
: null;

return (
<section className="card">
<h2>Your A.B.L.E. Alignment</h2>

{/* Last taken timestamp (if we have a record) */}
{lastTaken && (
<div className="muted" style={{ marginTop: 6 }}>
Last taken {lastTaken}
</div>
)}

{/* Donuts or empty CTA */}
{latest ? (
<div style={{ marginTop: 12 }}>
<AbleDonuts values={donutValues} columns={4} />
</div>
) : (
<>
<div className="muted" style={{ marginTop: 6 }}>
You haven’t completed an assessment yet.
</div>
<div className="hstack" style={{ marginTop: 10 }}>
<Link href="/assessment/take" className="btn btn-primary">
Take Alignment
</Link>
</div>
</>
)}

{/* Actions */}
<div className="hstack" style={{ marginTop: 12, flexWrap: "wrap" as const }}>
<Link href="/assessment/take" className="btn btn-primary">
{latest ? "Retake Alignment" : "Take Alignment"}
</Link>
<Link href="/assessment/details" className="btn btn-ghost">
View Details
</Link>
<Link href="/assessment/history" className="btn btn-ghost">
History
</Link>
</div>

{/* Graceful error hint (doesn’t break the card) */}
{error && (
<div style={{ color: "#991b1b", marginTop: 8 }}>
Unable to load your latest result right now.
</div>
)}
</section>
);
}
