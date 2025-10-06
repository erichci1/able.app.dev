// File: src/app/assessment/detail/page.tsx
import { supabaseServerComponent } from "@/lib/supabase/server";

type SP = Record<string, string | string[] | undefined>;

export default async function AssessmentDetailPage({
    searchParams,
}: { searchParams?: Promise<SP> }) {
    const sp = (await searchParams) ?? {};
    const id = typeof sp.id === "string" ? sp.id : Array.isArray(sp.id) ? sp.id[0] : undefined;

    const supabase = supabaseServerComponent();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return <section className="card" style={{ padding: 16, margin: 16 }}>Please sign in.</section>;

    if (!id) return <section className="card" style={{ padding: 16, margin: 16 }}>No assessment specified.</section>;

    const { data: row, error } = await supabase
        .from("assessment_results_2")
        .select("*").eq("id", id).eq("user_id", user.id).maybeSingle();

    if (error || !row) return <section className="card" style={{ padding: 16, margin: 16 }}>Assessment not found.</section>;

    return (
        <main style={{ maxWidth: 1040, margin: "24px auto", padding: "0 16px" }}>
            <section className="card" style={{ padding: 16 }}>
                <h1>Assessment Details</h1>
                <div className="muted" style={{ marginTop: 6 }}>
                    Taken {new Date(row.submission_date ?? row.created_at).toLocaleString()}
                </div>
            </section>
        </main>
    );
}
