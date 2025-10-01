// File: src/components/ExploreMenu.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";

export type ExploreCounts = {
video: number;
audio: number;
challenge: number;
};

type ExploreMenuProps = {
counts?: ExploreCounts; // optional (defaults to zeros)
};

const PHASES = [
{ value: "all", label: "All" },
{ value: "activate", label: "Activate" },
{ value: "build", label: "Build" },
{ value: "leverage", label: "Leverage" },
{ value: "execute", label: "Execute" },
];

export default function ExploreMenu({ counts }: ExploreMenuProps) {
const pathname = usePathname();
const sp = useSearchParams();
const router = useRouter();

const c = counts ?? { video: 0, audio: 0, challenge: 0 };
const activePhase = sp.get("phase") ?? "all";

// Keep current phase when navigating Explore sections
const phaseSuffix = activePhase === "all" ? "" : `?phase=${encodeURIComponent(activePhase)}`;

const sections = [
{ href: "/challenges", label: "Challenges", count: c.challenge },
{ href: "/audio", label: "Audio", count: c.audio },
{ href: "/videos", label: "Video", count: c.video },
];

function setPhase(next: string) {
const params = new URLSearchParams(sp.toString());
if (next === "all") params.delete("phase");
else params.set("phase", next);
router.push(params.toString() ? `${pathname}?${params}` : pathname);
}

return (
<div className="card" style={{ display: "grid", gap: 12 }}>
{/* Sections with badge counts */}
<div className="hstack" style={{ gap: 10, flexWrap: "wrap" as const }}>
{sections.map(s => (
<Link
key={s.href}
href={`${s.href}${phaseSuffix}`}
className="btn btn-ghost"
style={{ position: "relative", fontWeight: 800 }}
>
{s.label}
{s.count > 0 && (
<span className="badge" style={{ marginLeft: 6 }}>
{s.count > 99 ? "99+" : s.count}
</span>
)}
</Link>
))}
</div>

{/* Phase chips */}
<div className="hstack" style={{ gap: 8, flexWrap: "wrap" as const }}>
{PHASES.map(p => {
const active = p.value === activePhase;
return (
<button
key={p.value}
type="button"
onClick={() => setPhase(p.value)}
className="btn"
style={{
padding: "6px 10px",
borderRadius: 999,
fontWeight: 800,
background: active ? "#0C2D6F" : "#fff",
color: active ? "#fff" : "#0f172a",
border: "1px solid var(--border)",
}}
aria-pressed={active}
>
{p.label}
</button>
);
})}
</div>
</div>
);
}
