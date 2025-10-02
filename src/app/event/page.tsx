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
type SP = Record<string, string | string[] | undefined>;
const s = (v?: string | string[] | undefined) => (v == null ? undefined : Array.isArray(v) ? v[0] : v);

function fmtDate(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString(undefined, { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}
function fmtRange(sIso?: string | null, eIso?: string | null) {
  if (!sIso) return "";
  const a = fmtDate(sIso);
  const b = eIso ? fmtDate(eIso) : "";
  return b ? `${a} — ${b}` : a;
}

export default async function EventDetailPage({
  searchParams,
}: {
  searchParams?: Promise<SP>;
}) {
  const sp: SP = (await searchParams) ?? {};
  const id = s(sp.id);

  const supabase = supabaseServer();

  if (!id) {
    return (
      <section className="card">
        <h1>Event</h1>
        <div className="muted">No event specified.</div>
      </section>
    );
  }

  const { data, error } = await supabase
    .from("community_events")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return (
      <section className="card">
        <h1>Event</h1>
        <div style={{ color: "#991b1b" }}>{error.message}</div>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="card">
        <h1>Event</h1>
        <div className="muted">Not found.</div>
      </section>
    );
  }

  const ev: EventRow = data;

  return (
    <section className="card">
      <h1>{ev.title || "Untitled event"}</h1>
      {(ev.start_at || ev.location || ev.venue || ev.event_type) && (
        <div className="muted" style={{ marginTop: 6 }}>
          {fmtRange(ev.start_at ?? null, ev.end_at ?? null)}
          {ev.location ? ` • ${ev.location}` : ev.venue ? ` • ${ev.venue}` : ""}
          {ev.event_type ? ` • ${ev.event_type}` : ""}
        </div>
      )}
      {ev.cover_image_url && (
        <div style={{ marginTop: 12, borderRadius: "var(--radius)", overflow: "hidden", border: "1px solid var(--border)" }}>
          <Image src={ev.cover_image_url} alt="" width={1200} height={630} style={{ width: "100%", height: "auto" }} />
        </div>
      )}
      {ev.description && (
        <p className="muted" style={{ marginTop: 12, whiteSpace: "pre-wrap" }}>
          {ev.description}
        </p>
      )}
    </section>
  );
}

