// File: src/components/ExploreMenuServer.tsx
import Link from "next/link";
import { supabaseServerComponent } from "../lib/supabase/server";

type Counts = { video: number; audio: number; challenge: number; resource: number };

export default async function ExploreMenuServer() {
  const supabase = await supabaseServerComponent();
  const { data: { user } } = await supabase.auth.getUser();

  let counts: Counts = { video: 0, audio: 0, challenge: 0, resource: 0 };

  if (user?.id) {
    // Optional "new since last seen" logic. If you don't store last_seen, this block is harmless.
    const { data: seenRows } = await supabase
      .from("user_content_seen") // schema: (user_id uuid, kind text, last_seen_at timestamptz)
      .select("kind, last_seen_at")
      .eq("user_id", user.id);

    const last: Record<string, string | null> = Object.create(null);
    (seenRows ?? []).forEach(r => { last[r.kind] = r.last_seen_at; });

    // Count “new” by kind (fallback if 'last_seen_at' is null = 0)
    counts.video = await countNew(supabase, "videos", last["video"]);
    counts.audio = await countNew(supabase, "audio", last["audio"]);
    counts.challenge = await countNew(supabase, "challenges", last["challenge"]);
    counts.resource = await countNew(supabase, "resources", last["resource"]);
  }

  return (
    <nav className="card" style={{ display: "flex", gap: 8, padding: 12 }}>
      <Chip href="/challenges" label="Challenges" count={counts.challenge} />
      <Chip href="/audio" label="Audio" count={counts.audio} />
      <Chip href="/videos" label="Video" count={counts.video} />
      <Chip href="/resources" label="Resources" count={counts.resource} />
      <Chip href="/messages" label="Messages" />
    </nav>
  );
}

import type { SupabaseClient } from "@supabase/supabase-js";

async function countNew(supabase: SupabaseClient, table: string, since?: string | null) {
  let q = supabase.from(table).select("id", { head: true, count: "exact" });
  if (since) q = q.gt("created_at", since);
  const { count } = await q;
  return count ?? 0;
}

function Chip({ href, label, count }: { href: string; label: string; count?: number }) {
  return (
    <Link href={href} className="btn" style={{ position: "relative" }}>
      {label}
      {!!count && (
        <span className="pill" style={{ marginLeft: 6 }}>{count}</span>
      )}
    </Link>
  );
}