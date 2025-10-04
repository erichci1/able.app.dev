// File: src/components/ProfileQuickForm.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

type Props = {
    initialFirstName?: string | null;
    initialFocus?: string | null;
};

export default function ProfileQuickForm({
    initialFirstName = "",
    initialFocus = "",
}: Props) {
    const supa = React.useMemo(() => supabaseClient(), []);
    const [firstName, setFirstName] = React.useState(initialFirstName ?? "");
    const [focus, setFocus] = React.useState(initialFocus ?? "");
    const [saving, setSaving] = React.useState(false);
    const [ok, setOk] = React.useState<string | null>(null);
    const [err, setErr] = React.useState<string | null>(null);

    const [showToast, setShowToast] = React.useState(false);
    const toastRef = React.useRef<HTMLDivElement | null>(null);

    React.useEffect(() => {
        if (ok) {
            setShowToast(true);
            setTimeout(() => toastRef.current?.focus(), 0);
            const t = setTimeout(() => setShowToast(false), 6000);
            return () => clearTimeout(t);
        }
    }, [ok]);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setOk(null);
        setErr(null);
        try {
            const { data: u } = await supa.auth.getUser();
            if (!u.user) {
                setErr("Please sign in again.");
                setSaving(false);
                return;
            }
            const { error } = await supa
                .from("profiles")
                .update({
                    first_name: firstName || null,
                    focus: focus || null,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", u.user.id);

            if (error) throw new Error(error.message);

            const who = (firstName || "").trim();
            setOk(`Thanks, ${who || "you"} — you're set!`);
        } catch (e: unknown) {
            setErr(e instanceof Error ? e.message : "Could not save your profile.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="vstack" style={{ gap: 12 }}>
            {/* Success toast with second CTA */}
            {showToast && ok && (
                <div
                    ref={toastRef}
                    tabIndex={-1}
                    role="status"
                    aria-live="polite"
                    className="card"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                        background: "#ecfdf5",
                        border: "1px solid rgba(5,150,105,.35)",
                        outline: "none",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#065f46" }}>
                        <span
                            aria-hidden
                            style={{
                                width: 8, height: 8, borderRadius: 999,
                                background: "#065f46",
                                boxShadow: "0 0 0 3px rgba(5,150,105,.25)",
                            }}
                        />
                        <strong>{ok}</strong>
                    </div>

                    <div className="hstack" style={{ gap: 8 }}>
                        <Link href="/assessment/take" className="btn btn-primary" prefetch={false}>
                            Take Alignment
                        </Link>
                        <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={() => setShowToast(false)}
                            aria-label="Dismiss"
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            )}

            {/* Error toast */}
            {err && (
                <div
                    role="alert"
                    className="card"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                        background: "#fef2f2",
                        border: "1px solid rgba(220,38,38,.35)",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#991b1b" }}>
                        <span
                            aria-hidden
                            style={{
                                width: 8, height: 8, borderRadius: 999,
                                background: "#991b1b",
                                boxShadow: "0 0 0 3px rgba(220,38,38,.25)",
                            }}
                        />
                        <strong>{err}</strong>
                    </div>
                    <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => setErr(null)}
                        aria-label="Dismiss error"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {/* Form */}
            <form onSubmit={onSubmit} className="vstack" style={{ gap: 10 }}>
                <label htmlFor="first_name" className="muted" style={{ fontWeight: 700 }}>
                    First name
                </label>
                <input
                    id="first_name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g., Eric"
                    className="w-full"
                    style={{
                        border: "1px solid var(--border)",
                        borderRadius: 10,
                        padding: "10px 12px",
                        background: "#fff",
                    }}
                />

                <label htmlFor="focus" className="muted" style={{ fontWeight: 700, marginTop: 6 }}>
                    Your focus (optional)
                </label>
                <input
                    id="focus"
                    value={focus}
                    onChange={(e) => setFocus(e.target.value)}
                    placeholder="e.g., Clarity, Leadership, Discipline"
                    className="w-full"
                    style={{
                        border: "1px solid var(--border)",
                        borderRadius: 10,
                        padding: "10px 12px",
                        background: "#fff",
                    }}
                />

                <button
                    type="submit"
                    disabled={saving}
                    className="btn btn-primary"
                    style={{ marginTop: 8 }}
                >
                    {saving ? "Saving…" : "Save"}
                </button>
            </form>
        </div>
    );
}
function supabaseClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    return createClient(supabaseUrl, supabaseAnonKey);
}
