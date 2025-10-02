// File: src/components/ExploreMenuServer.tsx
import ExploreMenu, { ExploreCounts } from "@/components/ExploreMenu";
import { supabaseServer } from "@/lib/supabase/server";

export default async function ExploreMenuServer() {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <ExploreMenu counts={{ video: 0, audio: 0, challenge: 0 }} />;

  const { data: seenRows } = await supabase.from("user_content_seen").select("kind,last_seen_at").eq("user_id", user.id);
  const seenMap = new Map<string, string>();
  (seenRows ?? []).forEach(r => seenMap.set(r.kind, r.last_seen_at));

  async function countNew(kind: "video" | "audio" | "challenge", table: "videos" | "audio" | "challenges") {
    const lastSeen = seenMap.get(kind);
    let q = supabase.from(table).select("id", { head: true, count: "exact" });
    if (lastSeen) q = q.gt("created_at", lastSeen);
    const { count } = await q;
    return count ?? 0;
  }

  const counts: ExploreCounts = {
    video: await countNew("video", "videos"),
    audio: await countNew("audio", "audio"),
    challenge: await countNew("challenge", "challenges"),
  };

  return <ExploreMenu counts={counts} />;
}
