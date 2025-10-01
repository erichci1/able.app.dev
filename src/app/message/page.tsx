import Link from "next/link";
import { notFound } from "next/navigation";
import ExploreMenuServer from "@/components/ExploreMenuServer";
import { supabaseServer } from "@/lib/supabase/server";

export default async function MessageDetailPage({
searchParams,
}: { searchParams: { id?: string } }) {
const id = searchParams?.id;
if (!id) {
return (
<>
<ExploreMenuServer />
<section className="card">
<h1>Message</h1>
<div className="muted">No message specified.</div>
<Link href="/messages" className="btn btn-ghost" style={{ marginTop: 10 }}>Back to Messages</Link>
</section>
</>
);
}

const supabase = supabaseServer();
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
return (
<>
<ExploreMenuServer />
<section className="card">
<h1>Message</h1>
<div className="muted">Please sign in to view this message.</div>
</section>
</>
);
}

const { data, error } = await supabase
.from("messages")
.select("id, subject, body, sender_name, created_at, read_at")
.eq("id", id)
.eq("recipient_id", user.id)
.maybeSingle();

if (error) {
return (
<>
<ExploreMenuServer />
<section className="card">
<h1>Message</h1>
<div style={{ color:"#991b1b" }}>{error.message}</div>
<Link href="/messages" className="btn btn-ghost" style={{ marginTop: 10 }}>Back to Messages</Link>
</section>
</>
);
}

if (!data) return notFound();

// mark as read on open (best effort)
if (!data.read_at) {
await supabase
.from("messages")
.update({ read_at: new Date().toISOString() })
.eq("id", data.id)
.eq("recipient_id", user.id);
}

const m = data;

return (
<>
<ExploreMenuServer />
<section className="card">
<h1>{m.subject || "(no subject)"}</h1>
<div className="muted" style={{ marginTop: 6 }}>
From {m.sender_name || "Coach"} • {fmtDate(m.created_at)}
</div>
</section>

<section className="card">
<h2>Message</h2>
<div style={{ marginTop: 6, whiteSpace: "pre-wrap" }}>{m.body || "(empty message)"}</div>
</section>

<div className="hstack" style={{ marginTop: 12 }}>
<Link href="/messages" className="btn btn-ghost">Back to Messages</Link>
</div>
</>
);
}
function fmtDate(iso?: string | null) { if (!iso) return ""; const d = new Date(iso);
return d.toLocaleString(undefined, { month:"short", day:"2-digit", hour:"2-digit", minute:"2-digit" }); }
