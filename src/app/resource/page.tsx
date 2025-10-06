// File: src/app/resource/page.tsx
import { supabaseServerComponent } from "../../lib/supabase/server";

type SP = Record<string, string | string[] | undefined>;
const pick = (v?: string | string[] | undefined) => v == null ? undefined : Array.isArray(v) ? v[0] : v;

export default async function ResourceDetailPage({ searchParams }: { searchParams?: Promise<SP> }) {
    const sp: SP = (await searchParams) ?? {};
    const id = pick(sp.id);

    const supabase = supabaseServerComponent();

    if (!id) {
        return (
            <main style={{ maxWidth: 1040, margin: "24px auto", padding: "0 16px" }}>
                <section className="card" style={{ padding: 16 }}>
                    <h1>Resource</h1>
                    <div className="muted">No resource specified.</div>
                </section>
            </main>
        );
    }

    const { data: r } = await supabase
        .from("resources")
        .select("id,title,summary,url,created_at,category,phase")
        .eq("id", id)
        .maybeSingle();

    if (!r) {
        return (
            <main style={{ maxWidth: 1040, margin: "24px auto", padding: "0 16px" }}>
                <section className="card" style={{ padding: 16 }}>
                    <h1>Resource</h1>
                    <div className="muted">Not found.</div>
                </section>
            </main>
        );
    }

    return (
        <main style={{ maxWidth: 1040, margin: "24px auto", padding: "0 16px" }}>
            <section className="card" style={{ padding: 16 }}>
                <h1>{r.title}</h1>
                <div className="muted" style={{ marginTop: 6 }}>
                    {r.created_at ? new Date(r.created_at).toLocaleDateString() : ""}
                    {r.category ? ` • ${r.category}` : ""}
                    {r.phase ? ` • ${r.phase}` : ""}
                </div>
                {r.summary && <p style={{ marginTop: 12 }}>{r.summary}</p>}
                {r.url && (
                    <div className="hstack" style={{ marginTop: 12, gap: 8 }}>
                        <a className="btn btn-primary" href={r.url} target="_blank" rel="noreferrer">Open</a>
                        <a className="btn btn-ghost" href="/resources">Back</a>
                    </div>
                )}
            </section>
        </main>
    );
}
