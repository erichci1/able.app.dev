// File: src/components/dashboard/CoachGuidanceCard.tsx
import Link from "next/link";
import { supabaseServerComponent } from "../../lib/supabase/server";

type Phase = "all" | "activate" | "build" | "leverage" | "execute";

export default async function CoachGuidanceCard({ phase = "all" }: { phase?: Phase }) {
    const supabase = supabaseServerComponent();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.id) {
        return (
            <section className="card">
                <h2>Coach Guidance</h2>
                <div className="muted" style={{ marginTop: 6 }}>Please sign in to view guidance.</div>
            </section>
        );
    }

    let q = supabase
        .from("coach_recommendations")
        .select("id, title, content, created_at, phase, pinned")
        .eq("user_id", user.id)
        .order("pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(3);

    if (phase !== "all") q = q.eq("phase", phase);

    const { data, error } = await q;

    return (
        <section className="card">
            <div className="hstack" style={{ justifyContent: "space-between", alignItems: "center" }}>
                <h2>Coach Guidance</h2>
                <PhaseChips active={phase} />
            </div>

            {error ? (
                <div style={{ color: "#991b1b", marginTop: 8 }}>{error.message}</div>
            ) : !data?.length ? (
                <div className="muted" style={{ marginTop: 6 }}>
                    {phase === "all" ? "No guidance yet." : `No ${cap(phase)} guidance yet.`}
                </div>
            ) : (
                <ul style={{ marginTop: 8 }}>
                    {data.map((r) => (
                        <li key={r.id} style={{ padding: 12, borderTop: "1px solid var(--border)" }}>
                            <div className="hstack" style={{ gap: 8, alignItems: "baseline" }}>
                                {r.pinned ? <span className="pill" style={{ background: "#0C2D6F", color: "#fff" }}>Pinned</span> : null}
                                <div style={{ fontWeight: 900 }}>{r.title || "Recommendation"}</div>
                            </div>
                            <div className="muted" style={{ marginTop: 4 }}>
                                {fmt(r.created_at)} {r.phase ? `• ${cap(r.phase)}` : ""}
                            </div>
                            <div style={{ marginTop: 8, whiteSpace: "pre-wrap" }}>{r.content}</div>
                        </li>
                    ))}
                </ul>
            )}

            <div className="hstack" style={{ marginTop: 10 }}>
                <Link className="btn btn-ghost" href="/resources">See more</Link>
            </div>
        </section>
    );
}

function PhaseChips({ active }: { active: Phase }) {
    const make = (p: Phase) => {
        const s = new URLSearchParams(); s.set("phase", p); return `?${s.toString()}`;
    };
    return (
        <div className="hstack" style={{ gap: 8, flexWrap: "wrap" as const }}>
            {(["all", "activate", "build", "leverage", "execute"] as Phase[]).map((p) => {
                const is = p === active;
                return (
                    <a
                        key={p}
                        href={make(p)}
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

function cap(v: string) { return v ? v[0].toUpperCase() + v.slice(1) : ""; }
function fmt(iso?: string | null) { return iso ? new Date(iso).toLocaleString() : ""; }