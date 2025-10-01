"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React from "react";

/**
* Props:
* - types: unique list of event_type strings (from server)
*/
export default function EventFilterBar({ types }: { types: string[] }) {
const router = useRouter();
const sp = useSearchParams();

// derive current values from the URL
const [view, setView] = React.useState(sp.get("view") ?? "upcoming"); // upcoming | past | all
const [type, setType] = React.useState(sp.get("type") ?? "all");
const [q, setQ] = React.useState(sp.get("q") ?? "");

React.useEffect(() => {
// If user hits back/forward, keep UI in sync with URL
setView(sp.get("view") ?? "upcoming");
setType(sp.get("type") ?? "all");
setQ(sp.get("q") ?? "");
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [sp.toString()]);

function updateURL(next: { view?: string; type?: string; q?: string }) {
const params = new URLSearchParams(sp);
if (next.view !== undefined) {
if (!next.view || next.view === "upcoming") params.delete("view");
else params.set("view", next.view);
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
const qs = params.toString();
router.push(qs ? `/events?${qs}` : "/events");
}

function onSubmit(e: React.FormEvent) {
e.preventDefault();
updateURL({ view, type, q });
}

function resetFilters() {
setView("upcoming");
setType("all");
setQ("");
router.push("/events");
}

return (
<form onSubmit={onSubmit} className="card" style={{ marginBottom: 16 }}>
<div className="hstack" style={{ gap: 12, flexWrap: "wrap" as const }}>
{/* View selector */}
<div className="hstack" style={{ gap: 8 }}>
<label className="muted" htmlFor="view">View</label>
<select
id="view"
value={view}
onChange={(e) => setView(e.target.value)}
style={selectStyle}
>
<option value="upcoming">Upcoming</option>
<option value="past">Past</option>
<option value="all">All</option>
</select>
</div>

{/* Type selector */}
<div className="hstack" style={{ gap: 8 }}>
<label className="muted" htmlFor="type">Type</label>
<select
id="type"
value={type}
onChange={(e) => setType(e.target.value)}
style={selectStyle}
>
<option value="all">All</option>
{types.map((t) => (
<option key={t} value={t}>{t}</option>
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
placeholder="Title or description…"
style={inputStyle}
/>
</div>

{/* Actions */}
<div className="hstack" style={{ gap: 8 }}>
<button type="submit" className="btn btn-primary">Apply</button>
<button type="button" className="btn btn-ghost" onClick={resetFilters}>
Reset
</button>
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
