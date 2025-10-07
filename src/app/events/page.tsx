// File: src/app/events/page.tsx
import Link from "next/link";
import { supabaseServerComponent } from "../../lib/supabase/server";

type SP = Record<string, string | string[] | undefined>;
const s = (v?: string | string[] | undefined) => (v == null ? undefined : Array.isArray(v) ? v[0] : v);

export default async function EventsPage({ searchParams }: { searchParams?: Promise<SP> }) {
    const sp: SP = (await searchParams) ?? {};
    const view = s(sp.view) ?? "upcoming"; // "upcoming" | "past" | "all"
    const type = s(sp.type) ?? "all";
    const sortAsc = s(sp.sort) === "asc";

    const supabase = await supabaseServerComponent();

    const now = new Date().toISOString();
    let q = supabase
        .from("community_events")
        .select("id, title, description, start_at, end_at, event_type, location, venue")
        .order("start_at", { ascending: !!sortAsc });

    if (view === "upcoming") q = q.gte("start_at", now);
    if (view === "past") q = q.lt("start_at", now);
    if (type !== "all") q = q.eq("event_type", type);

    const { data, error } = await q;

    return (
        <main className="container" style={{ maxWidth: 1040, margin: "24px auto", padding: "24px" }}>
            {/* Your content goes here */}
                </main>
            );
        }
