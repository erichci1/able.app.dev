// File: src/components/WelcomeToast.tsx
"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Props = {
show?: boolean; // server tells us whether to show
message?: string; // toast text
variant?: "info" | "success"; // color hint
stripParam?: string; // e.g., "first" — will be removed from URL on mount
};

export default function WelcomeToast({
show = false,
message = "Welcome! Let's get started.",
variant = "success",
stripParam = "first",
}: Props) {
const [open, setOpen] = React.useState(show);
const router = useRouter();
const sp = useSearchParams();

// On first render, if we should show because of a URL flag, strip it so it's one-time
React.useEffect(() => {
if (!open) return;
if (!stripParam) return;
const params = new URLSearchParams(sp.toString());
if (params.has(stripParam)) {
params.delete(stripParam);
router.replace(params.toString() ? `?${params}` : ".", { scroll: false });
}
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [open]);

if (!open) return null;

const bg = variant === "success" ? "#ecfdf5" : "#eff6ff";
const fg = variant === "success" ? "#065f46" : "#1d4ed8";
const bd = variant === "success" ? "rgba(5,150,105,.35)" : "rgba(29,78,216,.35)";

return (
<div
className="card"
style={{
display: "flex",
alignItems: "center",
justifyContent: "space-between",
gap: 12,
background: bg,
border: `1px solid ${bd}`,
}}
>
<div style={{ display: "flex", alignItems: "center", gap: 10, color: fg }}>
<span
aria-hidden
style={{
width: 8,
height: 8,
borderRadius: 999,
background: fg,
boxShadow: `0 0 0 3px ${bd}`,
}}
/>
<strong>{message}</strong>
</div>
<button
type="button"
onClick={() => setOpen(false)}
className="btn btn-ghost"
aria-label="Dismiss"
>
Dismiss
</button>
</div>
);
}