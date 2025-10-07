"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseClient } from "@/lib/supabase/client";

type Mode = "magic" | "google";

/** ✅ Environment-safe Base URL Resolver */
const getBaseUrl = () => {
    // Browser client-side always uses current domain
    if (typeof window !== "undefined") return window.location.origin;

    // Render / production fallback
    if (process.env.NEXT_PUBLIC_SITE_URL)
        return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, ""); // trim trailing slash just in case

    // Development fallback
    return "http://localhost:3000";
};

export function SignInClient() {
    const router = useRouter();
    const sp = useSearchParams();
    const supa = React.useMemo(() => supabaseClient(), []);

    const redirectParam = sp.get("redirect");
    const redirectQS = redirectParam ? `?redirect=${encodeURIComponent(redirectParam)}` : "";

    const spError = sp.get("error");
    const initialErr =
        spError && spError !== "0"
            ? "Your previous link was invalid or expired. Please try again."
            : null;

    const [mode, setMode] = React.useState<Mode>("magic");
    const [email, setEmail] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [msg, setMsg] = React.useState<string | null>(null);
    const [err, setErr] = React.useState<string | null>(initialErr);

    // ✅ Skip sign-in if already authenticated
    React.useEffect(() => {
        (async () => {
            const { data } = await supa.auth.getUser();
            if (data.user) router.replace("/dashboard");
        })();
    }, [router, supa]);

    // ✅ Always compute the right callback URL
    const callbackUrl = `${getBaseUrl()}/auth/callback${redirectQS}`;

    async function handleMagicLink(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setErr(null);
        setMsg(null);

        const { error } = await supa.auth.signInWithOtp({
            email,
            options: { emailRedirectTo: callbackUrl },
        });

        if (error) setErr(error.message);
        else setMsg("Check your email for your secure login link.");
        setLoading(false);
    }

    async function handleGoogle() {
        setLoading(true);
        setErr(null);
        setMsg(null);

        const { error } = await supa.auth.signInWithOAuth({
            provider: "google",
            options: { redirectTo: callbackUrl },
        });

        if (error) {
            setErr(error.message);
            setLoading(false);
        }
    }

    /** Small toggle text to switch between Magic Link & Google */
    function HelperLine() {
        const linkStyle: React.CSSProperties = {
            fontWeight: 800,
            textDecoration: "underline",
            cursor: "pointer",
            color: "#0f172a",
        };
        return (
            <div className="muted" style={{ fontSize: 13, marginTop: 10 }}>
                {mode === "magic" ? (
                    <>
                        Already have an account?{" "}
                        <a onClick={() => setMode("google")} style={linkStyle}>
                            Use Google
                        </a>
                        .
                    </>
                ) : (
                    <>
                        Prefer email instead?{" "}
                        <a onClick={() => setMode("magic")} style={linkStyle}>
                            Send a Magic Link
                        </a>
                        .
                    </>
                )}
            </div>
        );
    }

    return (
        <div className="container" style={{ maxWidth: 520, margin: "24px auto" }}>
            <section className="card" style={{ padding: 20 }}>
                <h1 style={{ fontSize: 24, fontWeight: 900, margin: 0 }}>Sign In</h1>
                <div className="muted" style={{ marginTop: 6 }}>
                    {mode === "magic"
                        ? "Use a magic link to sign in with your email."
                        : "Continue with Google to sign in."}
                </div>

                {/* Magic Link */}
                {mode === "magic" && (
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
                        <HelperLine />
                    </form>
                )}

                {/* Google */}
                {mode === "google" && (
                    <div style={{ marginTop: 16 }}>
                        <button
                            type="button"
                            disabled={loading}
                            onClick={handleGoogle}
                            className="btn"
                            style={{
                                width: "100%",
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
                        <HelperLine />
                    </div>
                )}

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
