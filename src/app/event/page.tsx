import { supabaseServer } from "@/lib/supabase/server";
import Image from "next/image";

type EventRow = {
  id: string;
  title: string | null;
  description: string | null;
  cover_image_url?: string | null;
};

export default async function EventPage({ searchParams }: { searchParams?: Record<string, string> }) {
  const supabase = supabaseServer();
  const id = searchParams?.id ?? "";
  try {
    const { data, error } = await supabase.from("community_events").select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return <div>Event not found.</div>;
    const ev: EventRow = data;
    return (
      <section>
        <h1>{ev.title}</h1>
        <p>{ev.description}</p>
        {ev.cover_image_url && (
          <Image src={ev.cover_image_url} alt="" width={1200} height={630} style={{ width: "100%", height: "auto" }} />
        )}
      </section>
    );
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unexpected error";
    return <div style={{ color: "red" }}>{msg}</div>;
  }
}
