"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

/** Returns a Supabase client that stores PKCE + session in cookies (client side). */
export function supabaseClient() {
    return createClientComponentClient();
}