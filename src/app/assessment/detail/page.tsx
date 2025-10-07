// File: src/app/assessment/detail/page.tsx
import Link from "next/link";
import { supabaseServerComponent } from "../../../lib/supabase/server";

type SP = Record<string, string | string[] | undefined>;
const pick = (v?: string | string[] | undefined) =>
    v == null ? undefined : Array.isArray(v) ? v[0] : v;

export default async function AssessmentDetailPage({
    searchParams,
}: { searchParams?: Promise<SP> }) {
    const sp: SP = (await searchParams) ?? {};
    const id = pick(sp.id);

    const supabase = await supabaseServerComponent();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.id) {
        return (
            <main className="container" style={{ maxWidth: 1040, margin: "24px auto", padding: "0 16px" }}>
                <section className="card" style={{ padding: 16 }}>
                    <h1>Alignment Details</h1>
                    <div className="muted" style={{ marginTop: 6 }}>Please sign in to view your alignment.</div>
                    <div className="hstack" style={{ marginTop: 12 }}>
                        <a className="btn btn-primary" href="/auth/sign-in?redirect=/assessment/details">Sign In</a>
                    </div>
                </section>
            </main>
        );
    }

    // Fetch either the specified id or the latest one
    const baseSelect = `
id,
submission_date,
activate_percentage, build_percentage, leverage_percentage, execute_percentage,
activate_wtm, build_wtm, leverage_wtm, execute_wtm,
activate_yns, build_yns, leverage_yns, execute_yns
`;

    const { data, error } = id
        ? await supabase
            .from("assessment_results_2")
            .select(baseSelect)
            .eq("user_id", user.id)
            .eq("id", id)
            .maybeSingle()
        : await supabase
            .from("assessment_results_2")
            .select(baseSelect)
            .eq("user_id", user.id)
            .order("submission_date", { ascending: false })
            .limit(1)
            .maybeSingle();

    return (
        <main className="container" style={{ maxWidth: 1040, margin: "24px auto", padding: "0 16px" }}>
            <section className="card" style={{ padding: 16 }}>
                <div className="hstack" style={{ justifyContent: "space-between", alignItems: "center" }}>
                    <h1>Your Alignment Details</h1>
                    <div className="hstack" style={{ gap: 8 }}>
                        <a className="btn btn-primary" href="/assessment/take">Retake</a>
                        <Link className="btn btn-ghost" href="/assessment/history">History</Link>
                    </div>
                </div>

                {error ? (
                    <div style={{ color: "#991b1b", marginTop: 8 }}>{error.message}</div>
                ) : !data ? (
                    <div className="muted" style={{ marginTop: 6 }}>No assessment found.</div>
                ) : (
                    <>
                        <div className="muted" style={{ marginTop: 6 }}>
                            {data.submission_date ? `Taken ${new Date(data.submission_date).toLocaleString()}` : ""}
                        </div>

                        <div style={{ marginTop: 16, display: "grid", gap: 16 }}>
                            {renderPillar("Activate", data.activate_percentage, data.activate_wtm, data.activate_yns)}
                            {renderPillar("Build", data.build_percentage, data.build_wtm, data.build_yns)}
                            {renderPillar("Leverage", data.leverage_percentage, data.leverage_wtm, data.leverage_yns)}
                            {renderPillar("Execute", data.execute_percentage, data.execute_wtm, data.execute_yns)}
                        </div>
                    </>
                )}
            </section>
        </main>
    );
}

function renderPillar(
    label: string,
    pct?: number | string | null,
    wtm?: string | null,
    yns?: string | null
) {
    const value =
        pct == null
            ? "—"
            : typeof pct === "string"
                ? `${Math.round(parseFloat(pct))}%`
                : `${Math.round(pct)}%`;

    return (
        <div className="card" style={{ padding: 12 }}>
            <div className="hstack" style={{ justifyContent: "space-between", alignItems: "baseline" }}>
                <div style={{ fontWeight: 900 }}>{label}</div>
                <div style={{ fontWeight: 900 }}>{value}</div>
            </div>
            {wtm && (
                <>
                    <div className="muted" style={{ marginTop: 8, fontWeight: 800 }}>What this means</div>
                    <div style={{ marginTop: 4, whiteSpace: "pre-wrap" }}>{wtm}</div>
                </>
            )}
            {yns && (
                <>
                    <div className="muted" style={{ marginTop: 8, fontWeight: 800 }}>Your next steps</div>
                    <div style={{ marginTop: 4, whiteSpace: "pre-wrap" }}>{yns}</div>
                </>
            )}
        </div>
    );
}
