// File: src/components/ExploreMenuServer.tsx
import ExploreMenu, { ExploreCounts } from "@/components/ExploreMenu";
import { supabaseServer } from "@/lib/supabase/server";

/**
* Computes "new" counts since user last saw each section (by created_at).
* Kind keys: 'video' | 'audio' | 'challenge'
*/
export default async function ExploreMenuServer() {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  let counts: ExploreCounts = { video: 0, audio: 0, challenge: 0 };

  if (!user) return <ExploreMenu counts={counts} />;

  // fetch last_seen rows
  const { data: seenRows } = await supabase
    .from("user_content_seen")
    .select("kind, last_seen_at")
    .eq("user_id", user.id);

  const seenMap = new Map<string, string>();
  (seenRows ?? []).forEach(r => seenMap.set(r.kind, r.last_seen_at));

  async function countNew(kind: "video"|"audio"|"challenge", table: "videos"|"audio"|"challenges") {
    const lastSeen = seenMap.get(kind);
    let q = supabase.from(table).select("id", { head: true, count: "exact" });
    if (lastSeen) q = q.gt("created_at", lastSeen);
    const { count } = await q;
    return count ?? 0;
  }

  counts.video     = await countNew("video", "videos");
  counts.audio     = await countNew("audio", "audio");
  counts.challenge = await countNew("challenge", "challenges");

  return <ExploreMenu counts={counts} />;
}