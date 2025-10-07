// File: src/app/videos/page.tsx
import { supabaseServerComponent } from "../../lib/supabase/server";

type SP = Record<string, string | string[] | undefined>;
const s = (v?: string | string[] | undefined) => (v == null ? undefined : Array.isArray(v) ? v[0] : v);

const PHASES = ["all", "activate", "build", "leverage", "execute"] as const;
type Phase = typeof PHASES[number];

export default async function VideosPage({ searchParams }: { searchParams?: Promise<SP> }) {
    const sp: SP = (await searchParams) ?? {};
    const phase = (s(sp.phase) as Phase) ?? "all";
    const sortAsc = s(sp.sort) === "asc";
    const q = s(sp.q)?.trim();

    const supabase = await supabaseServerComponent();

    async function fetchPhaseAware() {
        let qy = supabase
            .from("videos")
            .select("id, title, summary, video_url, created_at, phase")
            .order("created_at", { ascending: !!sortAsc });
        if (phase !== "all") qy = qy.eq("phase", phase);
        if (q) qy = qy.ilike("title", `%${q}%`);
        return await qy;
    }

    async function fetchFallback() {
        let qy = supabase
            .from("videos")
            .select("id, title, summary, video_url, created_at")
            .order("created_at", { ascending: !!sortAsc });
        if (q) qy = qy.ilike("title", `%${q}%`);
        return await qy;
    }

    const try1 = await fetchPhaseAware();
    const { data, error } =
        try1.error && /column .*phase.* does not exist/i.test(try1.error.message)
            ? await fetchFallback()
            : try1;

    const rows = data ?? [];

    return (
        <main className="container" style={{ maxWidth: 1040, margin: "24px auto", padding: "0 16px" }}>
            <section className="card" style={{ padding: 16 }}>
                <header className="hstack" style={{ justifyContent: "space-between", alignItems: "center" }}>
                    <h1>Video</h1>
                    <FilterBar phase={phase} sort={sortAsc ? "asc" : "desc"} q={q} />
                </header>

                {error ? (
                    <div style={{ color: "#991b1b", marginTop: 8 }}>{error.message}</div>
                ) : !rows.length ? (
                    <div className="muted" style={{ marginTop: 6 }}>
                        {phase === "all" ? "No videos yet." : `No ${cap(phase)} videos yet.`}
                        {q ? ` Matching “${q}”.` : ""}
                    </div>
                ) : (
                    <ul style={{ marginTop: 8 }}>
                        {rows.map((r: any) => (
                            <li key={r.id} style={{ padding: 12, borderTop: "1px solid var(--border)" }}>
                                <div style={{ fontWeight: 900 }}>{r.title || "Untitled"}</div>
                                <div className="muted" style={{ marginTop: 4 }}>
                                    {fmt(r.created_at)}{" "}
                                    {("phase" in r && r.phase) ? `• ${cap(r.phase as string)}` : ""}
                                </div>
                                {r.summary && <div className="muted" style={{ marginTop: 6 }}>{r.summary}</div>}
                                {r.video_url && (
                                    <div className="hstack" style={{ gap: 8, marginTop: 8 }}>
                                        <a className="btn btn-primary" href={r.video_url} target="_blank" rel="noopener noreferrer">
                                            Watch
                                        </a>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </main>
    );
}

function FilterBar({ phase, sort, q }: { phase: Phase; sort: "asc" | "desc"; q?: string }) {
    const make = (p: Phase, srt: "asc" | "desc", qv?: string) => {
        const params = new URLSearchParams();
        params.set("phase", p);
        params.set("sort", srt);
        if (qv) params.set("q", qv);
        return `?${params.toString()}`;
    };

    return (
        <div className="hstack" style={{ gap: 8, flexWrap: "wrap" as const }}>
            {(["all", "activate", "build", "leverage", "execute"] as Phase[]).map((p) => {
                const is = p === phase;
                return (
                    <a
                        key={p}
                        href={make(p, sort, q)}
                        className="btn"
                        aria-pressed={is}
                        style={{
                            padding: "6px 10px",
                            borderRadius: 999,
                            fontWeight: 800,
                            background: is ? "#0C2D6F" : "#fff",
                            color: is ? "#fff" : "#0f172a",
                            border: "1px solid var(--border)",
                        }}
                    >
                        {cap(p)}
                    </a>
                );
            })}
            <span style={{ width: 8 }} />
            <a className="btn" href={make(phase, "asc", q)}>Oldest</a>
            <a className="btn" href={make(phase, "desc", q)}>Newest</a>
        </div>
    );
}

function cap(v: string) { return v ? v[0].toUpperCase() + v.slice(1) : ""; }
function fmt(iso?: string | null) { return iso ? new Date(iso).toLocaleString() : ""; }
