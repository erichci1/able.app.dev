"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React from "react";

/**
* Controls shareable filters for /assessment/history
* - order=new|old
* - from=YYYY-MM-DD
* - to=YYYY-MM-DD
* - size=10|20|50
* Resets page to 1 on filter changes.
*/
export default function AssessmentHistoryFilterBar() {
const router = useRouter();
const sp = useSearchParams();

const [order, setOrder] = React.useState(sp.get("order") ?? "new");
const [from, setFrom] = React.useState(sp.get("from") ?? "");
const [to, setTo] = React.useState(sp.get("to") ?? "");
const [size, setSize] = React.useState(sp.get("size") ?? "10");

React.useEffect(() => {
setOrder(sp.get("order") ?? "new");
setFrom(sp.get("from") ?? "");
setTo(sp.get("to") ?? "");
setSize(sp.get("size") ?? "10");
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [sp.toString()]);

function updateURL(next: { order?: string; from?: string; to?: string; size?: string }) {
const params = new URLSearchParams(sp);

if (next.order !== undefined) {
if (!next.order || next.order === "new") params.delete("order");
else params.set("order", next.order);
}
if (next.from !== undefined) {
const v = next.from.trim();
if (!v) params.delete("from"); else params.set("from", v);
}
if (next.to !== undefined) {
const v = next.to.trim();
if (!v) params.delete("to"); else params.set("to", v);
}
if (next.size !== undefined) {
if (!next.size || next.size === "10") params.delete("size");
else params.set("size", next.size);
}

// whenever filters change, reset page to 1
params.delete("page");

const qs = params.toString();
router.push(qs ? `/assessment/history?${qs}` : "/assessment/history");
}

function onSubmit(e: React.FormEvent) {
e.preventDefault();
updateURL({ order, from, to, size });
}

function onReset() {
router.push("/assessment/history");
}

return (
<form onSubmit={onSubmit} className="card" style={{ marginBottom: 16 }}>
<div className="hstack" style={{ gap: 12, flexWrap: "wrap" as const }}>
{/* Order */}
<div className="hstack" style={{ gap: 8 }}>
<label className="muted" htmlFor="order">Sort</label>
<select id="order" value={order} onChange={(e) => setOrder(e.target.value)} style={select}>
<option value="new">Newest first</option>
<option value="old">Oldest first</option>
</select>
</div>

{/* From */}
<div className="hstack" style={{ gap: 8 }}>
<label className="muted" htmlFor="from">From</label>
<input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} style={input} />
</div>

{/* To */}
<div className="hstack" style={{ gap: 8 }}>
<label className="muted" htmlFor="to">To</label>
<input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} style={input} />
</div>

{/* Size */}
<div className="hstack" style={{ gap: 8 }}>
<label className="muted" htmlFor="size">Page size</label>
<select id="size" value={size} onChange={(e) => setSize(e.target.value)} style={select}>
<option value="10">10</option>
<option value="20">20</option>
<option value="50">50</option>
</select>
</div>

{/* Actions */}
<div className="hstack" style={{ gap: 8 }}>
<button type="submit" className="btn btn-primary">Apply</button>
<button type="button" className="btn btn-ghost" onClick={onReset}>Reset</button>
</div>
</div>
</form>
);
}

const select: React.CSSProperties = {
border: "1px solid var(--border)",
borderRadius: 10,
padding: "8px 10px",
background: "#fff",
};

const input: React.CSSProperties = {
border: "1px solid var(--border)",
borderRadius: 10,
padding: "8px 10px",
background: "#fff",
};