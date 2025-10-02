// File: src/app/audio/page.tsx
import { supabaseServer } from "@/lib/supabase/server";

type Phase = "all" | "activate" | "build" | "leverage" | "execute";
type AudioRow = {
    id: string;
    title: string | null;
    summary: string | null;
    audio_url: string | null;
    phase?: string | null;
    created_at: string | null;
};
type SP = Record<string, string | string[] | undefined>;

function s(v?: string | string[] | undefined) {
    if (v == null) return undefined;
    return Array.isArray(v) ? v[0] : v;
}

export default async function AudioPage({
    searchParams,
}: {
    searchParams?: Promise<SP>;
}) {
    const sp: SP = (await searchParams) ?? {};
    const phase = (s(sp.phase) as Phase) ?? "all";

    const supabase = supabaseServer();

    let q = supabase
        .from("audio")
        .select("id, title, summary, audio_url, phase, created_at")
        .order("created_at", { ascending: false })
        .limit(100);

    if (phase !== "all") q = q.eq("phase", phase);

    const { data, error } = await q;
    if (error) {
        return (
            <section className="card">
                <h1>Audio</h1>
                <div style={{ color: "#991b1b" }}>{error.message}</div>
            </section>
        );
    }

    const rows: AudioRow[] = data ?? [];
    return (
        <section className="card">
            <h1>Audio</h1>
            {!rows.length ? (
                <div className="muted" style={{ marginTop: 6 }}>
                    {phase === "all" ? "No audio yet." : `No ${phase} audio yet.`}
                </div>
            ) : (
                <ul>{rows.map((r) => <li key={r.id}>{r.title}</li>)}</ul>
            )}
        </section>
    );
}