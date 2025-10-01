import Link from "next/link";
import ExploreMenuServer from "@/components/ExploreMenuServer";
import { supabaseServer } from "@/lib/supabase/server";

export default async function MessagesPage({
searchParams,
}: { searchParams?: Record<string, string | string[] | undefined> }) {
const orderParam = str(searchParams?.order) ?? "new";
const statusParam = str(searchParams?.status) ?? "all";
const qParam = str(searchParams?.q) ?? "";
const ascending = orderParam === "old";

const supabase = supabaseServer();
const { data: { user } } = await supabase.auth.getUser();

if (!user) {
return (
<>
<ExploreMenuServer />
<section className="card">
<h1>Messages</h1>
<div className="muted" style={{ marginTop: 6 }}>Please sign in to view your inbox.</div>
</section>
</>
);
}

let query = supabase
.from("messages")
.select("id, subject, body, sender_name, created_at, read_at")
.eq("recipient_id", user.id);

if (statusParam === "unread") query = query.is("read_at", null);
else if (statusParam === "read") query = query.not("read_at", "is", null);

if (qParam) {
const like = `%${qParam.replace(/%/g,"\\%").replace(/_/g,"\\_")}%`;
query = query.or(`subject.ilike.${like},body.ilike.${like}`);
}

query = query.order("created_at", { ascending }).limit(100);

const { data, error } = await query;
const msgs = data ?? [];

return (
<>
<ExploreMenuServer />

<section className="card">
<h1>Messages</h1>
<div className="muted" style={{ marginTop: 6 }}>
Sort, filter and search your inbox. The URL updates so you can share the view.
</div>
</section>

{/* (If you added MessagesFilterBar, render it here) */}

{error ? (
<section className="card"><div style={{ color: "#991b1b" }}>{error.message}</div></section>
) : !msgs.length ? (
<section className="card"><div className="muted">No messages.</div></section>
) : (
<section className="card" style={{ padding: 0 }}>
<ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
{msgs.map((m) => (
<li key={m.id} style={{
padding: 16, borderBottom: "1px solid var(--border)",
display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "center",
background: !m.read_at ? "#f9fafb" : "transparent",
}}>
<div>
<div style={{ fontWeight: 900 }}>{m.subject || "(no subject)"}</div>
<div className="muted" style={{ marginTop: 4 }}>
From {m.sender_name || "Coach"} • {fmtDate(m.created_at)}{!m.read_at ? " • Unread" : ""}
</div>
{m.body && (
<div className="muted" style={{ marginTop: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
{m.body}
</div>
)}
</div>
<Link className="btn btn-ghost" href={`/message?id=${encodeURIComponent(m.id)}`}>Open</Link>
</li>
))}
</ul>
</section>
)}
</>
);
}

function str(v?: string | string[] | null) { if (!v) return undefined; return Array.isArray(v) ? v[0] : v; }
function fmtDate(iso?: string | null) { if (!iso) return ""; const d = new Date(iso);
return d.toLocaleString(undefined, { month:"short", day:"2-digit", hour:"2-digit", minute:"2-digit" }); }