// File: src/lib/supabase/client.ts
"use client";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

/** For Client Components / hooks */
export function supabaseClient() {
    return createClientComponentClient();
}