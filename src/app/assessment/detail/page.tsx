// File: src/app/assessment/detail/page.tsx
import { supabaseServerComponent } from "../../../lib/supabase/server";

type SP = Record<string, string | string[] | undefined>;

export default async function AssessmentDetailPage({
    searchParams,
}: {
    searchParams?: Promise<SP>;
}) {
    const sp: SP = (await searchParams) ?? {};
    const idRaw = sp.id;
    const id = typeof idRaw === "string" ? idRaw : Array.isArray(idRaw) ? idRaw[0] : undefined;

    const supabase = supabaseServerComponent();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return (
            <section className="card">
                <h2>Alignment Details</h2>
                <div className="muted">Please sign in.</div>
            </section>
        );
    }

    const { data: row, error } = await supabase
        .from("assessment_results_2")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

    if (error) {
        return (
            <section className="card">
                <h2>Alignment Details</h2>
                <div style={{ color: "#991b1b" }}>{error.message}</div>
            </section>
        );
    }

    if (!row) {
        return (
            <section className="card">
                <h2>Alignment Details</h2>
                <div className="muted">No details available.</div>
            </section>
        );
    }

    // … your existing details UI …
    return (
        <section className="card">
            <h2>Alignment Details</h2>
            <div className="muted" style={{ marginTop: 6 }}>
                Taken {row.submission_date ? new Date(row.submission_date).toLocaleString() : "(unknown)"}
            </div>
            {/* Render your donuts/WTM/YNS/etc */}
        </section>
    );
}
