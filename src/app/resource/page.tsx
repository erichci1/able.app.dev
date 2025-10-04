// File: src/app/resource/page.tsx
import Link from "next/link";
import { supabaseServer } from "../../lib/supabase/server";

type SP = Record<string, string | string[] | undefined>;
const s = (v?: string | string[] | undefined) =>
    v == null ? undefined : Array.isArray(v) ? v[0] : v;

type ResourceRow = {
    id: string;
    title: string | null;
    summary: string | null;
    url: string | null;
    created_at: string | null;
    category?: string | null;
    phase?: string | null;
};

function fmtDate(iso?: string | null) {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString(undefined, {
        month: "short",
        day: "2-digit",
        year: "numeric",
    });
}

export default async function ResourceDetailPage({
    searchParams,
}: {
    // ✅ Next 15-compatible signature
    searchParams?: Promise<SP>;
}) {
    // normalize to plain object
    const sp: SP = (await searchParams) ?? {};
    const id = s(sp.id);

    if (!id) {
        return (
            <section className="card">
                <h1>Resource</h1>
                <div className="muted" style={{ marginTop: 6 }}>
                    No resource specified.
                </div>
                <div className="hstack" style={{ marginTop: 10 }}>
                    <Link href="/resources" className="btn btn-ghost">Back to Resources</Link>
                </div>
            </section>
        );
    }

    const supabase = supabaseServer();
    const { data, error } = await supabase
        .from("resources")
        .select("id, title, summary, url, created_at, category, phase")
        .eq("id", id)
        .maybeSingle();

    if (error) {
        return (
            <section className="card">
                <h1>Resource</h1>
                <div style={{ color: "#991b1b" }}>{error.message}</div>
                <div className="hstack" style={{ marginTop: 10 }}>
                    <Link href="/resources" className="btn btn-ghost">Back to Resources</Link>
                </div>
            </section>
        );
    }

    if (!data) {
        return (
            <section className="card">
                <h1>Resource</h1>
                <div className="muted">Not found.</div>
                <div className="hstack" style={{ marginTop: 10 }}>
                    <Link href="/resources" className="btn btn-ghost">Back to Resources</Link>
                </div>
            </section>
        );
    }

    const r: ResourceRow = data;

    return (
        <>
            <section className="card">
                <h1>{r.title}</h1>
                <div className="muted" style={{ marginTop: 6 }}>
                    {fmtDate(r.created_at)}
                    {r.category ? ` • ${r.category}` : ""}
                    {r.phase ? ` • ${r.phase[0].toUpperCase()}${r.phase.slice(1)}` : ""}
                </div>
            </section>

            <section className="card">
                <h2>About this resource</h2>
                <div className="muted" style={{ marginTop: 6 }}>
                    {r.summary || "No summary provided."}
                </div>
                <div className="hstack" style={{ marginTop: 12 }}>
                    {r.url && (
                        <a className="btn btn-primary" href={r.url} target="_blank" rel="noopener noreferrer">
                            Open Resource
                        </a>
                    )}
                    <Link href="/resources" className="btn btn-ghost">
                        Back to Resources
                    </Link>
                </div>
            </section>
        </>
    );
}