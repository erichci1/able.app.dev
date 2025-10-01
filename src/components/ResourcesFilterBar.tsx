"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React from "react";

/** Props from the server: distinct category strings */
export default function ResourcesFilterBar({ categories = [] as string[] }) {
const router = useRouter();
const sp = useSearchParams();

const [order, setOrder] = React.useState(sp.get("order") ?? "new");
const [type, setType] = React.useState(sp.get("type") ?? "all");
const [q, setQ] = React.useState(sp.get("q") ?? "");

React.useEffect(() => {
setOrder(sp.get("order") ?? "new");
setType(sp.get("type") ?? "all");
setQ(sp.get("q") ?? "");
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [sp.toString()]);

function updateURL(next: { order?: string; type?: string; q?: string }) {
const params = new URLSearchParams(sp);
if (next.order !== undefined) {
if (!next.order || next.order === "new") params.delete("order");
else params.set("order", next.order);
}
if (next.type !== undefined) {
if (!next.type || next.type === "all") params.delete("type");
else params.set("type", next.type);
}
if (next.q !== undefined) {
const trimmed = next.q.trim();
if (!trimmed) params.delete("q");
else params.set("q", trimmed);
}
router.push(params.toString() ? `/resources?${params}` : "/resources");
}

function onSubmit(e: React.FormEvent) {
e.preventDefault();
updateURL({ order, type, q });
}

function reset() {
setOrder("new");
setType("all");
setQ("");
router.push("/resources");
}

return (
<form onSubmit={onSubmit} className="card" style={{ marginBottom: 16 }}>
<div className="hstack" style={{ gap: 12, flexWrap: "wrap" as const }}>
{/* Sort */}
<div className="hstack" style={{ gap: 8 }}>
<label className="muted" htmlFor="order">Sort</label>
<select id="order" value={order} onChange={(e) => setOrder(e.target.value)} style={selectStyle}>
<option value="new">Newest first</option>
<option value="old">Oldest first</option>
</select>
</div>

{/* Category */}
<div className="hstack" style={{ gap: 8 }}>
<label className="muted" htmlFor="type">Type</label>
<select id="type" value={type} onChange={(e) => setType(e.target.value)} style={selectStyle}>
<option value="all">All</option>
{categories.map((c) => (
<option key={c} value={c}>{c}</option>
))}
</select>
</div>

{/* Search */}
<div className="hstack" style={{ gap: 8, flex: 1 }}>
<label className="muted" htmlFor="q">Search</label>
<input
id="q"
value={q}
onChange={(e) => setQ(e.target.value)}
placeholder="Title or summary…"
style={inputStyle}
/>
</div>

<div className="hstack" style={{ gap: 8 }}>
<button type="submit" className="btn btn-primary">Apply</button>
<button type="button" className="btn btn-ghost" onClick={reset}>Reset</button>
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
minWidth: 240,
width: "100%",
};