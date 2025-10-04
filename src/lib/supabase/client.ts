// File: src/lib/supabase/client.ts
"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
* Browser-side Supabase client (for client components / hooks).
* Uses NEXT_PUBLIC_* env vars.
*/
export function supabaseClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}