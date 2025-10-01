// File: src/components/dashboard/MessagesPreviewCard.tsx
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";

export default async function MessagesPreviewCard() {
const supabase = supabaseServer();
const { data: { user } } = await supabase.auth.getUser();

if (!user) {
return (
<section className="card">
<h2>Messages</h2>
<div className="muted">Please sign in to view your inbox.</div>
</section>
);
}

const { data, error } = await supabase
.from("messages")
.select("id, subject, sender_name, created_at, read_at")
.eq("recipient_id", user.id)
.order("created_at", { ascending: false })
.limit(3);

if (error) {
return (
<section className="card">
<h2>Messages</h2>
<div style={{ color: "#991b1b" }}>{error.message}</div>
</section>
);
}

const msgs = data ?? [];

return (
<section className="card">
<h2>Messages</h2>

{!msgs.length ? (
<div className="muted" style={{ marginTop: 6 }}>No messages yet.</div>
) : (
<div style={{ marginTop: 8 }}>
<ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
{msgs.map((m) => (
<li
key={m.id}
style={{
padding: 12,
borderTop: "1px solid var(--border)",
background: !m.read_at ? "#f9fafb" : "transparent",
display: "grid",
gridTemplateColumns: "1fr auto",
gap: 12,
alignItems: "center",
}}
>
<div>
<div style={{ fontWeight: 900 }}>{m.subject || "(no subject)"}</div>
<div className="muted" style={{ marginTop: 4 }}>
From {m.sender_name || "Coach"} • {fmtDate(m.created_at)}
{!m.read_at ? " • Unread" : ""}
</div>
</div>
<Link className="btn btn-ghost" href={`/message?id=${encodeURIComponent(m.id)}`}>
Open
</Link>
</li>
))}
</ul>

<div className="hstack" style={{ marginTop: 10 }}>
<Link className="btn btn-ghost" href="/messages">All Messages</Link>
</div>
</div>
)}
</section>
);
}

function fmtDate(iso?: string | null) {
if (!iso) return "";
const d = new Date(iso);
return d.toLocaleString(undefined, {
month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit",
});
}
