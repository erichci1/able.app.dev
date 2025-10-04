// File: src/components/dashboard/ResourcesPreviewCard.tsx
import Link from "next/link";
import { supabaseServer } from "../lib/supabase/server";
import type { PostgrestError } from "@supabase/supabase-js";

const PHASES = [
    { value: "all", label: "All" },
    { value: "activate", label: "Activate" },
    { value: "build", label: "Build" },
    { value: "leverage", label: "Leverage" },
    { value: "execute", label: "Execute" },
] as const;

type Phase = (typeof PHASES)[number]["value"];

type ResourceRow = {
    id: string;
    title: string | null;
    summary: string | null;
    url: string | null;
    created_at: string | null;
    category?: string | null;
    phase?: string | null;
};

export default async function ResourcesPreviewCard({ phase = "all" }: { phase?: Phase }) {
    const supabase = supabaseServer();

    async function fetchFiltered(): Promise<{ data: ResourceRow[] | null; error: PostgrestError | null }> {
        let q = supabase
            .from("resources")
            .select("id, title, summary, url, created_at, category, phase")
            .order("created_at", { ascending: false })
            .limit(3);
        if (phase !== "all") q = q.eq("phase", phase);
        return await q;
    }

    async function fetchFallback(): Promise<{ data: ResourceRow[] | null; error: PostgrestError | null }> {
        return await supabase
            .from("resources")
            .select("id, title, summary, url, created_at, category")
            .order("created_at", { ascending: false })
            .limit(3);
    }

    let data: ResourceRow[] | null = null;
    let error: PostgrestError | null = null;

    const try1 = await fetchFiltered();
    if (try1.error && /column .*phase.* does not exist/i.test(try1.error.message)) {
        const try2 = await fetchFallback();
        data = try2.data ?? [];
        error = try2.error;
    } else {
        data = try1.data ?? [];
        error = try1.error;
    }

    return (
        <section className="card">
            <div className="hstack" style={{ justifyContent: "space-between", alignItems: "center" }}>
                <h2>Resources</h2>
                <PhaseChips active={phase} />
            </div>

            {error ? (
                <div style={{ color: "#991b1b", marginTop: 8 }}>{error.message}</div>
            ) : !data?.length ? (
                <div className="muted" style={{ marginTop: 6 }}>
                    {phase === "all" ? "No resources yet." : `No ${phase} resources yet.`}
                </div>
            ) : (
                <div style={{ marginTop: 8 }}>
                    <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                        {data.map((r) => (
                            <li
                                key={r.id}
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
                                    <div style={{ fontWeight: 900 }}>{r.title}</div>
                                    <div className="muted" style={{ marginTop: 4 }}>
                                        {fmtDate(r.created_at)}
                                        {r.category ? ` • ${r.category}` : ""}
                                        {r.phase ? ` • ${label(r.phase)}` : ""}
                                    </div>
                                    {r.summary && <div className="muted" style={{ marginTop: 6 }}>{r.summary}</div>}
                                </div>
                                <div className="hstack" style={{ justifySelf: "end" }}>
                                    {r.url && (
                                        <a className="btn btn-primary" href={r.url} target="_blank" rel="noopener noreferrer">
                                            Open
                                        </a>
                                    )}
                                    <Link className="btn btn-ghost" href={`/resource?id=${encodeURIComponent(r.id)}`}>
                                        Details
                                    </Link>
                                </div>
                            </li>
                        ))}
                    </ul>

                    <div className="hstack" style={{ marginTop: 10 }}>
                        <Link className="btn btn-ghost" href="/resources">All Resources</Link>
                    </div>
                </div>
            )}
        </section>
    );
}

function PhaseChips({ active }: { active: Phase }) {
    return (
        <div className="hstack" style={{ gap: 8, flexWrap: "wrap" as const }}>
            {PHASES.map(p => {
                const is = p.value === active;
                const href = p.value === "all" ? "?" : `?phase=${p.value}`;
                return (
                    <Link
                        key={p.value}
                        href={href}
                        className="btn"
                        style={{
                            padding: "6px 10px",
                            borderRadius: 999,
                            fontWeight: 800,
                            background: is ? "#0C2D6F" : "#fff",
                            color: is ? "#fff" : "#0f172a",
                            border: "1px solid var(--border)",
                        }}
                        aria-pressed={is}
                    >
                        {p.label}
                    </Link>
                );
            })}
        </div>
    );
}

function fmtDate(iso?: string | null) {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "2-digit", year: "numeric" });
}
function label(p: string) { return p[0].toUpperCase() + p.slice(1); }
