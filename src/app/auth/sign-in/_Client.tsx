// File: src/app/auth/sign-in/_Client.tsx
"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseClient } from "../../../lib/supabase/client";

/** Base URL for callback: current origin in browser; env in SSR */
function getBaseUrl() {
    if (typeof window !== "undefined") return window.location.origin;
    return process.env.NEXT_PUBLIC_SITE_URL || "https://dev.app.ableframework.com";
}
/** Allow only safe internal redirect paths */
function safeInternal(path?: string | null) {
    if (!path) return null;
    if (!path.startsWith("/")) return null;
    if (path.startsWith("//")) return null;
    if (path.startsWith("/auth/")) return null;
    return path;
}
const SignInClient = () => {
    return (
        <div>
            {/* Sign-in form UI */}
            <h2>Sign In Form</h2>
        </div>
    );
};

export default SignInClient;