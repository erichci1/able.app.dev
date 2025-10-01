"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React from "react";

/**
* Controls:
* - order: new|old
* - status: all|unread|read
* - q: search subject/body
* Updates the URL (shareable) and doesn't reload the whole page.
*/
export default function MessagesFilterBar() {
const router = useRouter();
const sp = useSearchParams();

const [order, setOrder] = React.useState(sp.get("order") ?? "new");
const [status, setStatus] = React.useState(sp.get("status") ?? "all");
const [q, setQ] = React.useState(sp.get("q") ?? "");

React.useEffect(() => {
// keep UI in sync with back/forward or external nav
setOrder(sp.get("order") ?? "new");
setStatus(sp.get("status") ?? "all");
setQ(sp.get("q") ?? "");
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [sp.toString()]);

function updateURL(next: { order?: string; status?: string; q?: string }) {
const params = new URLSearchParams(sp);
if (next.order !== undefined) {
if (!next.order || next.order === "new") params.delete("order");
else params.set("order", next.order);
}
if (next.status !== undefined) {
if (!next.status || next.status === "all") params.delete("status");
else params.set("status", next.status);
}
if (next.q !== undefined) {
const trimmed = next.q.trim();
if (!trimmed) params.delete("q");
else params.set("q", trimmed);
}
const qs = params.toString();
router.push(qs ? `/messages?${qs}` : "/messages");
}

function onSubmit(e: React.FormEvent) {
e.preventDefault();
updateURL({ order, status, q });
}

function resetFilters() {
setOrder("new");
setStatus("all");
setQ("");
router.push("/messages");
}

return (
<form onSubmit={onSubmit} className="card" style={{ marginBottom: 16 }}>
<div className="hstack" style={{ gap: 12, flexWrap: "wrap" as const }}>
{/* Order */}
<div className="hstack" style={{ gap: 8 }}>
<label className="muted" htmlFor="order">Sort</label>
<select id="order" value={order} onChange={(e) => setOrder(e.target.value)} style={selectStyle}>
<option value="new">Newest first</option>
<option value="old">Oldest first</option>
</select>
</div>

{/* Status */}
<div className="hstack" style={{ gap: 8 }}>
<label className="muted" htmlFor="status">Status</label>
<select id="status" value={status} onChange={(e) => setStatus(e.target.value)} style={selectStyle}>
<option value="all">All</option>
<option value="unread">Unread</option>
<option value="read">Read</option>
</select>
</div>

{/* Search */}
<div className="hstack" style={{ gap: 8, flex: 1 }}>
<label className="muted" htmlFor="q">Search</label>
<input
id="q"
value={q}
onChange={(e) => setQ(e.target.value)}
placeholder="Subject or message text…"
style={inputStyle}
/>
</div>

{/* Actions */}
<div className="hstack" style={{ gap: 8 }}>
<button type="submit" className="btn btn-primary">Apply</button>
<button type="button" className="btn btn-ghost" onClick={resetFilters}>Reset</button>
</div>
</div>
</form>
);
}

const selectStyle: React.CSSProperties = {
border: "1px solid var(--border)",
borderRadius: 10,
padding: "8px 10px",
background: "#fff",
};

const inputStyle: React.CSSProperties = {
border: "1px solid var(--border)",
borderRadius: 10,
padding: "8px 10px",
background: "#fff",
minWidth: 220,
width: "100%",
};
