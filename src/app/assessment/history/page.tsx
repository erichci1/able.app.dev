// File: src/app/assessment/history/page.tsx
import { supabaseServerComponent } from "@/lib/supabase/server";

type SP = Record<string, string | string[] | undefined>;

export default async function AssessmentHistoryPage({
    searchParams,
}: { searchParams?: Promise<SP> }) {
    const sp = (await searchParams) ?? {};

    const supabase = supabaseServerComponent();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return <section className="card" style={{ padding: 16, margin: 16 }}>Please sign in.</section>;

    const { data: rows } = await supabase
        .from("assessment_results_2")
        .select("id, submission_date, activate_percentage, build_percentage, leverage_percentage, execute_percentage")
        .eq("user_id", user.id)
        .order("submission_date", { ascending: false })
        .limit(50);

    return (
        <main style={{ maxWidth: 1040, margin: "24px auto", padding: "0 16px" }}>
            <section className="card" style={{ padding: 16 }}>
                <h1>Assessment History</h1>
                <table style={{ width: "100%", marginTop: 12, borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ textAlign: "left", borderBottom: "1px solid var(--border)" }}>
                            <th>Date</th>
                            <th>Activate</th>
                            <th>Build</th>
                            <th>Leverage</th>
                            <th>Execute</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(rows ?? []).map(r => (
                            <tr key={r.id} style={{ borderBottom: "1px solid var(--border)" }}>
                                <td>{new Date(r.submission_date ?? "").toLocaleString()}</td>
                                <td>{r.activate_percentage ?? 0}%</td>
                                <td>{r.build_percentage ?? 0}%</td>
                                <td>{r.leverage_percentage ?? 0}%</td>
                                <td>{r.execute_percentage ?? 0}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </main>
    );
}
