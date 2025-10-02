// File: src/app/message/page.tsx
import { supabaseServer } from "@/lib/supabase/server";

type SP = Record<string, string | string[] | undefined>;

const s = (v?: string | string[] | undefined) =>
    v == null ? undefined : Array.isArray(v) ? v[0] : v;

export default async function MessageDetailPage({
    searchParams,
}: {
    searchParams?: Promise<SP>;
}) {
    const sp: SP = (await searchParams) ?? {};
    const id = s(sp.id);

    if (!id) {
        return (
            <section className="card">
                <h1>Message</h1>
                <div className="muted" style={{ marginTop: 6 }}>
                    No message id provided.
                </div>
            </section>
        );
    }

    const supabase = supabaseServer();
    const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (error) {
        return (
            <section className="card">
                <h1>Message</h1>
                <div style={{ color: "#991b1b" }}>{error.message}</div>
            </section>
        );
    }

    if (!data) {
        return (
            <section className="card">
                <h1>Message</h1>
                <div className="muted">Not found.</div>
            </section>
        );
    }

    return (
        <section className="card">
            <h1>{data.subject || "Message"}</h1>
            <div className="muted" style={{ marginTop: 6 }}>
                From: {data.sender ?? "Unknown"} •{" "}
                {data.created_at
                    ? new Date(data.created_at).toLocaleString()
                    : "Unknown date"}
            </div>
            <div style={{ marginTop: 12, whiteSpace: "pre-wrap" }}>
                {data.body ?? ""}
            </div>
        </section>
    );
}