// File: src/app/resource/page.tsx
import Link from "next/link";
import { supabaseServerComponent } from "../../lib/supabase/server";

type SP = Record<string, string | string[] | undefined>;
const s = (v?: string | string[] | undefined) => (v == null ? undefined : Array.isArray(v) ? v[0] : v);

export default async function ResourceDetailPage({ searchParams }: { searchParams?: Promise<SP> }) {
    const sp: SP = (await searchParams) ?? {};
    const id = s(sp.id);

    if (!id) {
        return (
            <main className="container" style={{ maxWidth: 960, margin: "24px auto", padding: "0 16px" }}>
                <section className="card" style={{ padding: 16 }}>
                    <h1>Resource</h1>
                    <div className="muted" style={{ marginTop: 6 }}>No resource specified.</div>
                    <div className="hstack" style={{ marginTop: 12 }}>
                        <Link className="btn btn-ghost" href="/resources">Back to Resources</Link>
                    </div>
                </section>
            </main>
        );
    }

    const supabase = await supabaseServerComponent();
    const { data, error } = await supabase
        .from("resources")
        .select("id, title, summary, url, created_at, category, phase")
        .eq("id", id)
        .maybeSingle();

    return (
        <main className="container" style={{ maxWidth: 960, margin: "24px auto", padding: "0 16px" }}>
            <section className="card" style={{ padding: 16 }}>
                {error ? (
                    <>
                        <h1>Resource</h1>
                        <div style={{ color: "#991b1b", marginTop: 8 }}>{error.message}</div>
                        <div className="hstack" style={{ marginTop: 12 }}>
                            <Link className="btn btn-ghost" href="/resources">Back to Resources</Link>
                        </div>
                    </>
                ) : !data ? (
                    <>
                        <h1>Resource</h1>
                        <div className="muted" style={{ marginTop: 6 }}>Not found or removed.</div>
                        <div className="hstack" style={{ marginTop: 12 }}>
                            <Link className="btn btn-ghost" href="/resources">Back to Resources</Link>
                        </div>
                    </>
                ) : (
                    <>
                        <h1>{data.title || "Resource"}</h1>
                        <div className="muted" style={{ marginTop: 6 }}>
                            {data.created_at ? fmtDate(data.created_at) : ""}
                            {data.category ? ` • ${data.category}` : ""}
                            {data.phase ? ` • ${cap(data.phase)}` : ""}
                        </div>
                        {data.summary && <p className="muted" style={{ marginTop: 12, whiteSpace: "pre-wrap" }}>{data.summary}</p>}
                        <div className="hstack" style={{ marginTop: 12, gap: 8, flexWrap: "wrap" as const }}>
                            {data.url && (
                                <a className="btn btn-primary" href={data.url} target="_blank" rel="noopener noreferrer">Open</a>
                            )}
                            <Link className="btn btn-ghost" href="/resources">Back to Resources</Link>
                        </div>
                    </>
                )}
            </section>
        </main>
    );
}

function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "2-digit", year: "numeric" });
}
function cap(v?: string | null) { return v ? v[0].toUpperCase() + v.slice(1) : ""; }
