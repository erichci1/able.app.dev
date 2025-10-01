"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React from "react";

/** Sort bar for messages: newest first (default) or oldest first */
export default function MessagesSortBar() {
const router = useRouter();
const sp = useSearchParams();

const [order, setOrder] = React.useState(sp.get("order") ?? "new"); // new | old

React.useEffect(() => {
setOrder(sp.get("order") ?? "new");
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [sp.toString()]);

function updateURL(nextOrder: string) {
const params = new URLSearchParams(sp);
if (!nextOrder || nextOrder === "new") params.delete("order");
else params.set("order", nextOrder);
const qs = params.toString();
router.push(qs ? `/messages?${qs}` : "/messages");
}

function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
const val = e.target.value;
setOrder(val);
updateURL(val);
}

return (
<div className="card" style={{ marginBottom: 16 }}>
<div className="hstack" style={{ gap: 12, flexWrap: "wrap" as const }}>
<label className="muted" htmlFor="order">Sort</label>
<select id="order" value={order} onChange={onChange} style={selectStyle}>
<option value="new">Newest first</option>
<option value="old">Oldest first</option>
</select>
</div>
</div>
);
}

const selectStyle: React.CSSProperties = {
border: "1px solid var(--border)",
borderRadius: 10,
padding: "8px 10px",
background: "#fff",
};

