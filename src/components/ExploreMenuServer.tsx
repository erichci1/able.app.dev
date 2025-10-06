// File: src/components/ExploreMenuServer.tsx
import Link from "next/link";
import { supabaseServerComponent } from "@/lib/supabase/server";

export default async function ExploreMenuServer() {
  const supabase = supabaseServerComponent();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  return (
    <nav className="card" style={{ display: "flex", gap: 8, padding: 12 }}>
      <Link className="btn btn-ghost" href="/challenges">Challenges</Link>
      <Link className="btn btn-ghost" href="/audio">Audio</Link>
      <Link className="btn btn-ghost" href="/videos">Video</Link>
      <Link className="btn btn-ghost" href="/resources">Resources</Link>
    </nav>
  );
}