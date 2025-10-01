// File: src/app/assessment/history/page.tsx
import { supabaseServer } from "@/lib/supabase/server";

type AssessRow = {
    id: string;
    submission_date: string | null;
    activate_percentage: number | string | null;
    build_percentage: number | string | null;
    leverage_percentage: number | string | null;
    execute_percentage: number | string | null;
};

// minimal filter builder
type FilterBuilder<B> = {
    eq: (c: string, v: unknown) => B;
    gte: (c: string, v: unknown) => B;
    lte: (c: string, v: unknown) => B;
};

const baseFilter = <B extends FilterBuilder<B>>(q: B, userId: string, fromISO?: string, toISO?: string) => {
    let b = q.eq("user_id", userId);
    if (fromISO) b = b.gte("submission_date", fromISO);
    if (toISO) b = b.lte("submission_date", toISO);
    return b;
};

export default async function AssessmentHistoryPage({ searchParams }: { searchParams?: Record<string, string> }) {
    const supabase = supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return <div>Please sign in.</div>;

    const fromISO = searchParams?.from ?? undefined;
    const toISO = searchParams?.to ?? undefined;

    const { data: rows, error } = await baseFilter(
        supabase
            .from("assessment_results_2")
            .select("id, submission_date, activate_percentage, build_percentage, leverage_percentage, execute_percentage"),
        user.id,
        fromISO,
        toISO
    ).order("submission_date", { ascending: false });

    if (error) return <div>{error.message}</div>;

    return (
        <section>
            <h1>Assessment History</h1>
            <table>
                <tbody>
                    {rows?.map((r: AssessRow) => (
                        <tr key={String(r.id)}>
                            <td>{r.submission_date}</td>
                            <td>{r.activate_percentage}</td>
                            <td>{r.build_percentage}</td>
                            <td>{r.leverage_percentage}</td>
                            <td>{r.execute_percentage}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>
    );
}

