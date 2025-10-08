"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseClient } from "@/lib/supabase/client";

type Mode = "magic" | "google";

/** Environment-safe base URL */
const getBaseUrl = () => {
    if (typeof window !== "undefined") return window.location.origin;
    return (process.env.NEXT_PUBLIC_SITE_URL || "https://app1.ableframework.com").replace(/\/$/, "");
};

/** Parse `#access_token=…&refresh_token=…` into an object */
function parseHash(hash: string): Record<string, string> {
    const out: Record<string, string> = {};
    const h = hash.startsWith("#") ? hash.slice(1) : hash;
    for (const part of h.split("&")) {
        const [k, v] = part.split("=");
        if (k) out[decodeURIComponent(k)] = decodeURIComponent(v ?? "");
    }
    return out;
}

export function SignInClient() {
    const router = useRouter();
    const sp = useSearchParams();
    const supa = React.useMemo(() => supabaseClient(), []);

    // optional redirect from Framer etc.
    const redirectParam = sp.get("redirect");
    const redirectQS = redirectParam ? `?redirect=${encodeURIComponent(redirectParam)}` : "";

    const [mode, setMode] = React.useState<Mode>("magic");
    const [email, setEmail] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [msg, setMsg] = React.useState<string | null>(null);
    const [err, setErr] = React.useState<string | null>(
        sp.get("error") && sp.get("error") !== "0"
            ? "Your previous link was invalid or expired. Please try again."
            : null
    );

    // 1) If we arrived from a magic-link with HASH TOKENS, consume them here
    React.useEffect(() => {
        if (typeof window === "undefined") return;
        if (!window.location.hash) return;

        const params = parseHash(window.location.hash);
        const access_token = params["access_token"];
        const refresh_token = params["refresh_token"];

        const finish = async () => {
            try {
                if (access_token && refresh_token) {
                    const { error } = await supa.auth.setSession({ access_token, refresh_token });
                    if (error) {
                        setErr(error.message);
                        return;
                    }
                    // Clear the hash so we don't try again on back/refresh
                    window.history.replaceState(null, "", window.location.pathname + window.location.search);
                    // Route after session
                    if (redirectParam && redirectParam.startsWith("/") && !redirectParam.startsWith("/auth/")) {
                        router.replace(redirectParam);
                    } else {
                        router.replace("/dashboard");
                    }
                }
            } catch (e: any) {
                setErr(e?.message ?? "Could not finalize sign-in.");
            }
        };

        void finish();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 2) Already signed in? Skip the form
    React.useEffect(() => {
        (async () => {
            const { data } = await supa.auth.getUser();
            if (data.user) router.replace("/dashboard");
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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

    const HelperLine = () => {
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
    };

    return (
        <div className="container" style={{ maxWidth: 520, margin: "24px auto" }}>
            <section className="card" style={{ padding: 20 }}>
                <h1 style={{ fontSize: 24, fontWeight: 900, margin: 0 }}>Sign In</h1>
                <div className="muted" style={{ marginTop: 6 }}>
                    {mode === "magic"
                        ? "Use a magic link to sign in with your email."
                        : "Continue with Google to sign in."}
                </div>

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
