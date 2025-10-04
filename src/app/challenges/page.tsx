// File: src/app/challenges/page.tsx
import { supabaseServer } from "../../lib/supabase/server";

type Phase = "all" | "activate" | "build" | "leverage" | "execute";
type ChallengeRow = {
    id: string;
    title: string | null;
    description: string | null;
    week_number?: number | null;
    difficulty?: string | null;
    challenge_url?: string | null;
    phase?: string | null;
    created_at: string | null;
};
type SP = Record<string, string | string[] | undefined>;
const s = (v?: string | string[] | undefined) => (v == null ? undefined : Array.isArray(v) ? v[0] : v);

export default async function ChallengesPage({
    searchParams,
}: {
    searchParams?: Promise<SP>;
}) {
    const sp: SP = (await searchParams) ?? {};
    const phase = (s(sp.phase) as Phase) ?? "all";

    const supabase = supabaseServer();

    let q = supabase
        .from("challenges")
        .select("id, title, description, week_number, difficulty, challenge_url, phase, created_at")
        .order("created_at", { ascending: false })
        .limit(100);

    if (phase !== "all") q = q.eq("phase", phase);

    const { data, error } = await q;
    if (error) {
        return (
            <section className="card">
                <h1>Challenges</h1>
                <div style={{ color: "#991b1b" }}>{error.message}</div>
            </section>
        );
    }

    const rows: ChallengeRow[] = data ?? [];
    return (
        <section className="card">
            <h1>Challenges</h1>
            {!rows.length ? (
                <div className="muted" style={{ marginTop: 6 }}>
                    {phase === "all" ? "No challenges yet." : `No ${phase} challenges yet.`}
                </div>
            ) : (
                <ul>{rows.map((r) => <li key={r.id}>{r.title}</li>)}</ul>
            )}
        </section>
    );
}