// src/components/AppHeader.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
isAuthed: boolean;
unreadCount?: number;
displayName?: string;
};

const tabs = [
{ href: "/dashboard", label: "Dashboard" },
{ href: "/events", label: "Events" },
{ href: "/resources", label: "Resources" },
{ href: "/messages", label: "Messages" },
];

export default function AppHeader({ isAuthed, unreadCount = 0, displayName }: Props) {
const pathname = usePathname();

return (
<header className="site-header">
<nav className="navbar">
<Link href="https://www.ableframework.com" className="hstack" style={{ color:"#fff", textDecoration:"none" }}>
<span
aria-hidden
style={{
width:8, height:8, borderRadius:999,
background:"#60A5FA",
boxShadow:"0 0 0 3px rgba(96,165,250,.2)"
}}
/>
<strong>The A.B.L.E. Man</strong>
</Link>

<div className="nav-spacer" />

{/* Right side actions */}
<div className="hstack" style={{ gap: 10 }}>
{isAuthed && (
<span className="muted" style={{ color:"rgba(255,255,255,.85)" }}>
Good {greet()}, {displayName ?? "Friend"}
</span>
)}
<Link href="https://www.ableframework.com" className="btn btn-ghost">Website</Link>
{!isAuthed ? (
<Link href="/auth/sign-in" className="btn btn-primary">Sign In</Link>
) : (
<Link href="/logout" className="btn btn-primary">Logout</Link>
)}
</div>
</nav>

{/* Primary tabs */}
<div className="container">
<div className="tabs">
{tabs.map(t => {
const active = pathname?.startsWith(t.href);
const isMessages = t.href === "/messages";
return (
<Link key={t.href} href={t.href} className={`tab ${active ? "active" : ""}`}>
<span style={{ display:"inline-flex", alignItems:"center", gap:6 }}>
{t.label}
{isMessages && isAuthed && unreadCount > 0 && (
<span className="badge">{unreadCount > 99 ? "99+" : unreadCount}</span>
)}
</span>
</Link>
);
})}
</div>
</div>
</header>
);
}

function greet(){
const h = new Date().getHours();
if (h < 12) return "Morning";
if (h < 18) return "Afternoon";
return "Evening";
}

