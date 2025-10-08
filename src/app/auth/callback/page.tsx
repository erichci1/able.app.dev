"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseClient } from "@/lib/supabase/client";

/**
* Client callback:
* - Works for magic link (#access_token) and PKCE (?code=) flows
* - Exchanges the URL for a real cookie session
* - Redirects to /dashboard or ?redirect=...
*/
export default function AuthCallbackPage() {
    const router = useRouter();
    const sp = useSearchParams();
    const supa = React.useMemo(() => supabaseClient(), []);

    React.useEffect(() => {
        (async () => {
            try {
                // Supabase will inspect current URL (hash or query) and create session
                const { data, error } = await supa.auth.exchangeCodeForSession();

                if (error) {
                    console.error("[auth/callback] exchange error:", error);
                    router.replace("/auth/sign-in?error=1");
                    return;
                }

                // Optional passthrough from ?redirect=/some/path
                const redirect = sp.get("redirect");
                router.replace(redirect || "/dashboard");
            } catch (e) {
                console.error("[auth/callback] unexpected error:", e);
                router.replace("/auth/sign-in?error=1");
            }
        })();
    }, [router, sp, supa]);

    return (
        <div className="container" style={{ maxWidth: 520, margin: "24px auto" }}>
            <section className="card" style={{ padding: 16 }}>
                <b>Signing you in…</b>
            </section>
        </div>
    );
}
