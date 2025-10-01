import { supabaseServer } from "@/lib/supabase/server";

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

export default async function ChallengesPage({ searchParams }: { searchParams?: Record<string, string | string[]> }) {
    const supabase = supabaseServer();
    const phase = (Array.isArray(searchParams?.phase) ? searchParams?.phase[0] : searchParams?.phase) as Phase ?? "all";

    let q = supabase.from("challenges").select("id,title,description,week_number,difficulty,challenge_url,phase,created_at").order("created_at", { ascending: false }).limit(100);
    if (phase !== "all") q = q.eq("phase", phase);

    const { data, error } = await q;
    if (error) return <div>{error.message}</div>;
    const rows: ChallengeRow[] = data ?? [];

    return (
        <section>
            <h1>Challenges</h1>
            <ul>
                {rows.map(r => <li key={r.id}>{r.title}</li>)}
            </ul>
        </section>
    );
}
