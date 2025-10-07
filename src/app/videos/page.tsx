// File: src/app/videos/page.tsx
import ExploreMenuServer from "../../components/ExploreMenuServer";
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

    const supabase = supabaseServerComponent();

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
        <>
            <ExploreMenuServer />

            <section className="card" style={{ maxWidth: 1040, margin: "24px auto" }}>
                <header className="hstack" style={{ justifyContent: "space-between", alignItems: "center" }}>
                    <h1>Video</h1>
                    <div className="hstack" style={{ gap: 8, flexWrap: "wrap" as const }}>
                        <PhaseChips active={phase} />
                        <SortChips phase={phase} sort={sortAsc ? "asc" : "desc"} q={q} />
                    </div>
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
                        {rows.map((row) => (
                            <li
                                key={row.id}
                                style={{
                                    padding: 12,
                                    borderTop: "1px solid var(--border)",
                                    display: "grid",
                                    gridTemplateColumns: "1fr auto",
                                    gap: 12,
                                    alignItems: "center",
                                }}
                            >
                                <div>
                                    <div style={{ fontWeight: 900 }}>{row.title || "Untitled"}</div>
                                    <div className="muted" style={{ marginTop: 4 }}>
                                        {fmt(row.created_at)}{" "}
                                        {"phase" in row && (row as any).phase ? `• ${cap((row as any).phase as string)}` : ""}
                                    </div>
                                    {row.summary && <div className="muted" style={{ marginTop: 6 }}>{row.summary}</div>}
                                </div>
                                <div className="hstack" style={{ gap: 8, justifySelf: "end" }}>
                                    {row.video_url && (
                                        <a className="btn btn-primary" href={row.video_url!} target="_blank" rel="noopener noreferrer">
                                            Watch
                                        </a>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </>
    );
}

function PhaseChips({ active }: { active: Phase }) {
    return (
        <div className="hstack" style={{ gap: 8, flexWrap: "wrap" as const }}>
            {["all", "activate", "build", "leverage", "execute"].map((p) => {
                const params = new URLSearchParams(); params.set("phase", p);
                const href = `?${params.toString()}`;
                const is = p === active;
                return (
                    <a
                        key={p}
                        href={href}
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
        </div>
    );
}

function SortChips({ phase, sort, q }: { phase: Phase; sort: "asc" | "desc"; q?: string }) {
    const make = (srt: "asc" | "desc") => {
        const p = new URLSearchParams();
        p.set("phase", phase);
        p.set("sort", srt);
        if (q) p.set("q", q);
        return `?${p.toString()}`;
    };
    return (
        <div className="hstack" style={{ gap: 8 }}>
            <a className="btn" href={make("asc")}>Oldest</a>
            <a className="btn" href={make("desc")}>Newest</a>
        </div>
    );
}

function cap(v: string) { return v ? v[0].toUpperCase() + v.slice(1) : ""; }
function fmt(iso?: string | null) { return iso ? new Date(iso).toLocaleString() : ""; }