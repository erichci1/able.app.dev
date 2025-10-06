// File: src/app/challenges/page.tsx
import { supabaseServerComponent } from "../../lib/supabase/server";

type ChallengeRow = {
    id: string;
    title: string | null;
    description: string | null;
    week_number?: number | null;
    difficulty?: string | null;
    challenge_url?: string | null;
    created_at: string | null;
    phase?: string | null;
};

export default async function ChallengesPage() {
    const supabase = supabaseServerComponent();
    const { data } = await supabase
        .from("challenges")
        .select("id,title,description,challenge_url,week_number,difficulty,phase,created_at")
        .order("created_at", { ascending: false })
        .limit(100);

    const rows = (data ?? []) as ChallengeRow[];

    return (
        <main style={{ maxWidth: 1040, margin: "24px auto", padding: "0 16px" }}>
            <section className="card" style={{ padding: 16 }}>
                <h1>Challenges</h1>
                {!rows.length ? (
                    <div className="muted" style={{ marginTop: 6 }}>No challenges yet.</div>
                ) : (
                    <ul style={{ marginTop: 12 }}>
                        {rows.map(c => (
                            <li key={c.id} style={{ padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                                <div style={{ fontWeight: 900 }}>{c.title}</div>
                                {c.description && <div className="muted">{c.description}</div>}
                                {c.challenge_url && (
                                    <div style={{ marginTop: 6 }}>
                                        <a className="btn btn-ghost" href={c.challenge_url} target="_blank" rel="noreferrer">
                                            Open
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
