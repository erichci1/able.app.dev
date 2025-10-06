// File: src/app/audio/page.tsx
import { supabaseServerComponent } from "../../lib/supabase/server";

type AudioRow = {
    id: string;
    title: string | null;
    summary: string | null;
    audio_url: string | null;
    created_at: string | null;
    phase?: string | null;
};

export default async function AudioPage() {
    const supabase = supabaseServerComponent();
    const { data } = await supabase
        .from("audio")
        .select("id,title,summary,audio_url,created_at,phase")
        .order("created_at", { ascending: false })
        .limit(100);

    const rows = (data ?? []) as AudioRow[];

    return (
        <main style={{ maxWidth: 1040, margin: "24px auto", padding: "0 16px" }}>
            <section className="card" style={{ padding: 16 }}>
                <h1>Audio</h1>
                {!rows.length ? (
                    <div className="muted" style={{ marginTop: 6 }}>No audio yet.</div>
                ) : (
                    <ul style={{ marginTop: 12 }}>
                        {rows.map(r => (
                            <li key={r.id} style={{ padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                                <div style={{ fontWeight: 900 }}>{r.title}</div>
                                <div className="muted">{r.summary}</div>
                                {r.audio_url && (
                                    <div style={{ marginTop: 6 }}>
                                        <audio src={r.audio_url} controls preload="none" style={{ width: "100%" }} />
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
