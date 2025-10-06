// File: src/app/videos/page.tsx
import { supabaseServerComponent } from "../../lib/supabase/server";

type VideoRow = {
    id: string;
    title: string | null;
    summary: string | null;
    video_url: string | null;
    created_at: string | null;
    phase?: string | null;
};

export default async function VideosPage() {
    const supabase = supabaseServerComponent();
    const { data } = await supabase
        .from("videos")
        .select("id,title,summary,video_url,created_at,phase")
        .order("created_at", { ascending: false })
        .limit(100);

    const rows = (data ?? []) as VideoRow[];

    return (
        <main style={{ maxWidth: 1040, margin: "24px auto", padding: "0 16px" }}>
            <section className="card" style={{ padding: 16 }}>
                <h1>Video</h1>
                {!rows.length ? (
                    <div className="muted" style={{ marginTop: 6 }}>No videos yet.</div>
                ) : (
                    <ul style={{ marginTop: 12 }}>
                        {rows.map(v => (
                            <li key={v.id} style={{ padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                                <div style={{ fontWeight: 900 }}>{v.title}</div>
                                <div className="muted">{v.summary}</div>
                                {v.video_url && (
                                    <div style={{ marginTop: 6 }}>
                                        <a className="btn btn-ghost" href={v.video_url} target="_blank" rel="noreferrer">Open</a>
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