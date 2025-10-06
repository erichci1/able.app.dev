"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseClient } from "@/lib/supabase/client";

/** Resolves proper base URL for magic link callback */
function getBaseUrl() {
    if (typeof window !== "undefined") return window.location.origin;
    return process.env.NEXT_PUBLIC_SITE_URL || "https://dev.app.ableframework.com";
}

export default function SignInPage() {
    const router = useRouter();
    const sp = useSearchParams();
    const supa = React.useMemo(() => supabaseClient(), []);

    const [email, setEmail] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [msg, setMsg] = React.useState<string | null>(null);
    const [err, setErr] = React.useState<string | null>(null);

    // Optional ?redirect param (e.g., ?redirect=/assessment/take)
    const redirectParam = sp.get("redirect");
    const redirectQS = redirectParam ? `?redirect=${encodeURIComponent(redirectParam)}` : "";

    /** Redirect logged-in users directly to dashboard */
    React.useEffect(() => {
        (async () => {
            const { data } = await supa.auth.getUser();
            if (data.user) router.replace("/dashboard");
        })();
    }, [router, supa]);

    /** Handle magic link login */
    async function handleMagicLink(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setMsg(null);
        setErr(null);

        const callbackUrl = `${getBaseUrl()}/auth/callback${redirectQS}`;
        console.log("Using callback URL:", callbackUrl);

        const { error } = await supa.auth.signInWithOtp({
            email,
            options: { emailRedirectTo: callbackUrl },
        });

        if (error) setErr(error.message);
        else setMsg("✅ Check your email for your secure login link.");
        setLoading(false);
    }

    /** Handle Google OAuth */
    async function handleGoogle() {
        setLoading(true);
        setMsg(null);
        setErr(null);

        const callbackUrl = `${getBaseUrl()}/auth/callback${redirectQS}`;
        const { error } = await supa.auth.signInWithOAuth({
            provider: "google",
            options: { redirectTo: callbackUrl },
        });

        if (error) {
            setErr(error.message);
            setLoading(false);
        }
    }

    return (
        <div className="container" style={{ maxWidth: 520 }}>
            <section className="card" style={{ padding: 20 }}>
                <h1 style={{ fontSize: 24, fontWeight: 900 }}>Sign In</h1>
                <div className="muted" style={{ marginTop: 6 }}>
                    Use a magic link or continue with Google.
                </div>

                {/* Magic link form */}
                <form onSubmit={handleMagicLink} style={{ marginTop: 16 }} className="vstack">
                    <label htmlFor="email" className="muted" style={{ fontWeight: 700 }}>
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{
                            border: "1px solid var(--border)",
                            borderRadius: 10,
                            padding: "10px 12px",
                            background: "#fff",
                        }}
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                        style={{ width: "100%", marginTop: 8 }}
                    >
                        {loading ? "Sending link…" : "Send Magic Link"}
                    </button>
                </form>

                {/* Divider */}
                <div
                    className="hstack"
                    style={{
                        gap: 12,
                        alignItems: "center",
                        marginTop: 16,
                        color: "var(--muted)",
                    }}
                >
                    <span style={{ height: 1, background: "var(--border)", flex: 1 }} />
                    <span style={{ fontSize: 12, fontWeight: 800 }}>OR</span>
                    <span style={{ height: 1, background: "var(--border)", flex: 1 }} />
                </div>

                {/* Google button */}
                <button
                    type="button"
                    disabled={loading}
                    onClick={handleGoogle}
                    className="btn"
                    style={{
                        width: "100%",
                        marginTop: 12,
                        background: "#fff",
                        color: "#0f172a",
                        border: "1px solid var(--border)",
                    }}
                >
                    <span
                        aria-hidden
                        style={{
                            display: "inline-block",
                            width: 16,
                            height: 16,
                            borderRadius: 3,
                            marginRight: 8,
                            background:
                                "conic-gradient(#ea4335 0deg 90deg, #fbbc05 90deg 180deg, #34a853 180deg 270deg, #4285f4 270deg 360deg)",
                        }}
                    />
                    Continue with Google
                </button>

                {/* Feedback */}
                {msg && <div style={{ marginTop: 12, color: "#065f46" }}>{msg}</div>}
                {err && <div style={{ marginTop: 12, color: "#991b1b" }}>{err}</div>}
            </section>

            <section className="card" style={{ padding: 16 }}>
                <div className="muted" style={{ fontSize: 12 }}>
                    By continuing, you agree to the Terms and acknowledge the Privacy Policy.
                </div>
            </section>
        </div>
    );
}