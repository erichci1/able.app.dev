// File: src/app/assessment/detail/page.tsx
import { supabaseServer } from "@/lib/supabase/server";

type SP = Record<string, string | string[] | undefined>;

export default async function AssessmentDetailPage({
    searchParams,
}: {
    // ✅ Next 15 compatible: can be a Promise or undefined during render/build
    searchParams?: Promise<SP>;
}) {
    // normalize to a plain object
    const sp: SP = (await searchParams) ?? {};
    const rawId = sp.id;
    const id = typeof rawId === "string" ? rawId : Array.isArray(rawId) ? rawId[0] : undefined;

    if (!id) {
        return (
            <section className="card">
                <h1>Assessment Details</h1>
                <div className="muted" style={{ marginTop: 6 }}>
                    No assessment id provided.
                </div>
            </section>
        );
    }

    const supabase = supabaseServer();
    const { data, error } = await supabase
        .from("assessment_results_2")
        .select(
            `
id,
submission_date,
activate_percentage, build_percentage, leverage_percentage, execute_percentage,
activate_wtm, build_wtm, leverage_wtm, execute_wtm,
activate_yns, build_yns, leverage_yns, execute_yns
`
        )
        .eq("id", id)
        .maybeSingle();

    if (error) {
        return (
            <section className="card">
                <h1>Assessment Details</h1>
                <div style={{ color: "#991b1b", marginTop: 8 }}>{error.message}</div>
            </section>
        );
    }

    if (!data) {
        return (
            <section className="card">
                <h1>Assessment Details</h1>
                <div className="muted" style={{ marginTop: 6 }}>
                    Assessment not found.
                </div>
            </section>
        );
    }

    // TODO: render donuts + per-pillar WTM/YNS
    return (
        <section className="card">
            <h1>Assessment Details</h1>
            <pre style={{ marginTop: 12, whiteSpace: "pre-wrap" }}>
                {JSON.stringify(data, null, 2)}
            </pre>
        </section>
    );
}
