// File: src/components/dashboard/AssessmentCard.tsx
import Link from "next/link";
import AbleDonuts, { type AssessmentValues } from "../AbleDonuts";
import { supabaseServerComponent } from "../../lib/supabase/server";

export default async function AssessmentCard() {
    const supabase = await supabaseServerComponent();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.id) {
        return (
            <section className="card">
                <h2>Your A.B.L.E. Alignment</h2>
                <div className="muted" style={{ marginTop: 6 }}>Please sign in to view your alignment.</div>
                <div className="hstack" style={{ marginTop: 10 }}>
                    <a className="btn btn-primary" href="/auth/sign-in?redirect=/dashboard">Sign In</a>
                </div>
            </section>
        );
    }

    const { data } = await supabase
        .from("assessment_results_2")
        .select("id, submission_date, activate_percentage, build_percentage, leverage_percentage, execute_percentage")
        .eq("user_id", user.id)
        .order("submission_date", { ascending: false })
        .limit(1)
        .maybeSingle();

    const donuts: AssessmentValues = {
        activate: num(data?.activate_percentage),
        build: num(data?.build_percentage),
        leverage: num(data?.leverage_percentage),
        execute: num(data?.execute_percentage),
    };

    return (
        <section className="card">
            <h2>Your A.B.L.E. Alignment</h2>
            <div className="muted" style={{ marginTop: 6 }}>
                {data?.submission_date ? `Last taken ${fmt(data.submission_date)}` : "You haven’t taken the alignment yet."}
            </div>

            <div style={{ marginTop: 12 }}>
                <AbleDonuts values={donuts} columns={4} />
            </div>

            <div className="hstack" style={{ marginTop: 12, flexWrap: "wrap" as const }}>
                <a className="btn btn-primary" href="/assessment/take">Retake Alignment</a>
                <Link className="btn btn-ghost" href="/assessment/details">View Alignment Details</Link>
                <Link className="btn btn-ghost" href="/assessment/history">History</Link>
            </div>
        </section>
    );
}

function num(v?: number | string | null) {
    if (v == null) return null;
    const n = typeof v === "string" ? parseFloat(v) : v;
    return Number.isFinite(n) ? n : null;
}
function fmt(iso?: string | null) {
    return iso ? new Date(iso).toLocaleString() : "";
}
