// File: src/components/AbleDonuts.tsx
import * as React from "react";

/* -------------------------------------------------------------------------- */
/* Types & helpers */
/* -------------------------------------------------------------------------- */

export type AssessmentValues = {
    activate: number | null;
    build: number | null;
    leverage: number | null;
    execute: number | null;
};

export function classifyPct(pct: number | null) {
    if (pct == null || Number.isNaN(pct)) return { label: "—", tone: "neutral" as const };
    if (pct >= 70) return { label: "Strong", tone: "success" as const };
    if (pct >= 40) return { label: "Can improve", tone: "info" as const };
    return { label: "Needs work", tone: "warn" as const };
}

function Chip({
    tone = "info",
    children,
}: {
    tone?: "success" | "info" | "warn" | "neutral";
    children: React.ReactNode;
}) {
    const pal =
        tone === "success"
            ? { fg: "#22C55E", bg: "rgba(34,197,94,.15)", bd: "rgba(34,197,94,.35)" }
            : tone === "warn"
                ? { fg: "#F59E0B", bg: "rgba(245,158,11,.15)", bd: "rgba(245,158,11,.35)" }
                : tone === "neutral"
                    ? { fg: "#64748B", bg: "rgba(100,116,139,.12)", bd: "rgba(100,116,139,.30)" }
                    : { fg: "#60A5FA", bg: "rgba(96,165,250,.15)", bd: "rgba(96,165,250,.35)" };

    return (
        <span
            style={{
                color: pal.fg,
                background: pal.bg,
                border: `1px solid ${pal.bd}`,
                borderRadius: 999,
                padding: "3px 10px",
                fontSize: 12,
                fontWeight: 800,
                lineHeight: 1,
            }}
        >
            {children}
        </span>
    );
}

/* -------------------------------------------------------------------------- */
/* Donut */
/* -------------------------------------------------------------------------- */

type DonutProps = {
    label: string;
    pct: number | null;
    color: string;
    size?: number;
    ring?: number;
    showCaption?: boolean;
    style?: React.CSSProperties;
};

function Donut({
    label,
    pct,
    color,
    size = 120,
    ring = 12,
    showCaption = true,
    style,
}: DonutProps) {
    const r = (size - ring) / 2;
    const cx = size / 2;
    const cy = size / 2;
    const C = 2 * Math.PI * r;

    const p = pct == null || Number.isNaN(pct) ? 0 : Math.max(0, Math.min(100, Number(pct)));
    const dash = (C * p) / 100;
    const chip = classifyPct(pct);

    return (
        <div style={{ display: "grid", placeItems: "center", gap: 8, ...style }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E5E7EB" strokeWidth={ring} opacity={0.5} />
                <circle
                    cx={cx} cy={cy} r={r} fill="none"
                    stroke={color} strokeWidth={ring} strokeLinecap="round"
                    strokeDasharray={`${dash} ${C - dash}`} transform={`rotate(-90 ${cx} ${cy})`}
                />
                <circle cx={cx} cy={cy} r={r - ring * 0.5} fill="none" stroke="#FFFFFF" strokeWidth={1} opacity={0.7} />
                <text
                    x="50%" y="50%" textAnchor="middle" dominantBaseline="central"
                    fontSize={18} fontWeight={900} fill="#0f172a"
                >
                    {pct == null || Number.isNaN(pct) ? "—" : `${p.toFixed(0)}%`}
                </text>
            </svg>

            <div style={{ fontSize: 13, fontWeight: 900, color: "#0f172a" }}>{label}</div>

            {showCaption && (
                <div>
                    <Chip tone={chip.tone}>{chip.label}</Chip>
                </div>
            )}
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* AbleDonuts (A · B · L · E) */
/* -------------------------------------------------------------------------- */

type AbleDonutsProps = {
    values: AssessmentValues; // ← the only required prop
    columns?: number;
    layout?: "row" | "column";
    gap?: number;
    size?: number;
    ring?: number;
    showCaptions?: boolean;
    style?: React.CSSProperties;
};

const COLORS = {
    activate: "#2563EB", // blue
    build: "#8B5CF6", // purple
    leverage: "#22C55E", // green
    execute: "#F59E0B", // amber
};

export default function AbleDonuts({
    values,
    columns = 4,
    layout = "row",
    gap = 24,
    size = 120,
    ring = 12,
    showCaptions = true,
    style,
}: AbleDonutsProps) {
    const items = [
        { key: "activate", label: "Activate", pct: values.activate, color: COLORS.activate },
        { key: "build", label: "Build", pct: values.build, color: COLORS.build },
        { key: "leverage", label: "Leverage", pct: values.leverage, color: COLORS.leverage },
        { key: "execute", label: "Execute", pct: values.execute, color: COLORS.execute },
    ] as const;

    const grid =
        layout === "row"
            ? { display: "grid", gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap, alignItems: "start" }
            : { display: "grid", gridTemplateRows: `repeat(${items.length}, auto)`, gap, alignItems: "start" };

    return (
        <div style={{ ...grid, ...style }}>
            {items.map((it) => (
                <Donut
                    key={it.key}
                    label={it.label}
                    pct={it.pct}
                    color={it.color}
                    size={size}
                    ring={ring}
                    showCaption={showCaptions}
                />
            ))}
        </div>
    );
}
