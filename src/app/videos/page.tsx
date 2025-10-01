import { supabaseServer } from "@/lib/supabase/server";

type Phase = "all" | "activate" | "build" | "leverage" | "execute";
type VideoRow = {
    id: string;
    title: string | null;
    summary: string | null;
    video_url: string | null;
    phase?: string | null;
    created_at: string | null;
};

export default async function VideosPage({ searchParams }: { searchParams?: Record<string, string | string[]> }) {
    const supabase = supabaseServer();
    const phase = (Array.isArray(searchParams?.phase) ? searchParams?.phase[0] : searchParams?.phase) as Phase ?? "all";

    let q = supabase.from("videos").select("id,title,summary,video_url,phase,created_at").order("created_at", { ascending: false }).limit(100);
    if (phase !== "all") q = q.eq("phase", phase);

    const { data, error } = await q;
    if (error) return <div>{error.message}</div>;
    const rows: VideoRow[] = data ?? [];

    return (
        <section>
            <h1>Videos</h1>
            <ul>
                {rows.map(r => <li key={r.id}>{r.title}</li>)}
            </ul>
        </section>
    );
}