// File: src/app/assessment/history/page.tsx
import Link from "next/link";
import { supabaseServerComponent } from "../../../lib/supabase/server";

type SP = Record<string, string | string[] | undefined>;
const s = (v?: string | string[] | undefined) =>
    v == null ? undefined : Array.isArray(v) ? v[0] : v;

export default async function AssessmentHistoryPage({
    searchParams,
}: { searchParams?: Promise<SP> }) {
    const sp: SP = (await searchParams) ?? {};
    const sortAsc = s(sp.sort) === "asc";

    const supabase = await supabaseServerComponent();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.id) {
        return (
            <main className="container" style={{ maxWidth: 1040, margin: "24px auto", padding: "0 16px" }}>
                <section className="card" style={{ padding: 16 }}>
                    <h1>Alignment History</h1>
                    <div className="muted" style={{ marginTop: 6 }}>Please sign in to view your history.</div>
                    <div className="hstack" style={{ marginTop: 12 }}>
                        <a className="btn btn-primary" href="/auth/sign-in?redirect=/assessment/history">Sign In</a>
                    </div>
                </section>
            </main>
        );
    }

    const { data, error } = await supabase
        .from("assessment_results_2")
        .select("id, submission_date, activate_percentage, build_percentage, leverage_percentage, execute_percentage")
        .eq("user_id", user.id)
        .order("submission_date", { ascending: !!sortAsc })
        .limit(50);

    return (
        <main className="container" style={{ maxWidth: 1040, margin: "24px auto", padding: "0 16px" }}>
            <section className="card" style={{ padding: 16 }}>
                <div className="hstack" style={{ justifyContent: "space-between", alignItems: "center" }}>
                    <h1>Alignment History</h1>
                    <div className="hstack" style={{ gap: 8 }}>
                        <a className="btn" href="?sort=asc">Oldest</a>
                        <a className="btn" href="?sort=desc">Newest</a>
                    </div>
                </div>

                {error ? (
                    <div style={{ color: "#991b1b", marginTop: 8 }}>{error.message}</div>
                ) : !data?.length ? (
                    <div className="muted" style={{ marginTop: 6 }}>No assessments yet.</div>
                ) : (
                    <table style={{ width: "100%", marginTop: 12, borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ textAlign: "left", borderBottom: "1px solid var(--border)" }}>
                                <th>Date</th>
                                <th>Activate</th>
                                <th>Build</th>
                                <th>Leverage</th>
                                <th>Execute</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map(r => (
                                <tr key={r.id} style={{ borderBottom: "1px solid var(--border)" }}>
                                    <td>{r.submission_date ? new Date(r.submission_date).toLocaleString() : "—"}</td>
                                    <td>{fmtPct(r.activate_percentage)}</td>
                                    <td>{fmtPct(r.build_percentage)}</td>
                                    <td>{fmtPct(r.leverage_percentage)}</td>
                                    <td>{fmtPct(r.execute_percentage)}</td>
                                    <td>
                                        <Link className="btn btn-ghost" href={`/assessment/details?id=${encodeURIComponent(r.id)}`}>
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>
        </main>
    );
}

function fmtPct(v?: number | string | null) {
    if (v == null) return "—";
    const n = typeof v === "string" ? parseFloat(v) : v;
    return Number.isFinite(n) ? `${Math.round(n)}%` : "—";
}
