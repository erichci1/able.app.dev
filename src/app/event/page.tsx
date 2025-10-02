// File: src/app/event/page.tsx
import { supabaseServer } from "@/lib/supabase/server";
import Image from "next/image";

type EventRow = {
  id: string;
  title: string | null;
  description: string | null;
  cover_image_url?: string | null;
  start_at?: string | null;
  end_at?: string | null;
  event_type?: string | null;
  location?: string | null;
  venue?: string | null;
};

export default async function EventPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const supabase = supabaseServer();
  const id = (Array.isArray(searchParams?.id) ? searchParams?.id[0] : searchParams?.id) ?? "";

  try {
    const { data, error } = await supabase
      .from("community_events")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return <section className="card">Event not found.</section>;

    const ev: EventRow = data;

    return (
      <section className="card">
        <h1>{ev.title || "Untitled event"}</h1>
        {ev.start_at && <div className="muted" style={{ marginTop: 6 }}>{fmtDateRange(ev.start_at, ev.end_at ?? null)}{ev.location ? ` • ${ev.location}` : ev.venue ? ` • ${ev.venue}` : ""}{ev.event_type ? ` • ${ev.event_type}` : ""}</div>}
        {ev.cover_image_url && (
          <div style={{ marginTop: 12, borderRadius: "var(--radius)", overflow: "hidden", border: "1px solid var(--border)" }}>
            <Image src={ev.cover_image_url} alt="" width={1200} height={630} style={{ width: "100%", height: "auto" }} />
          </div>
        )}
        {ev.description && <p className="muted" style={{ marginTop: 12, whiteSpace: "pre-wrap" }}>{ev.description}</p>}
      </section>
    );
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unexpected error";
    return <section className="card"><h1>Event</h1><div style={{ color: "#991b1b" }}>{msg}</div></section>;
  }
}

function fmtDate(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString(undefined, { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}
function fmtDateRange(s?: string | null, e?: string | null) {
  if (!s) return "";
  const a = fmtDate(s);
  const b = e ? fmtDate(e) : "";
  return b ? `${a} — ${b}` : a;
}
