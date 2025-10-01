import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

/** Server-side Supabase client for App Router */
export function supabaseServer() {
return createServerComponentClient({ cookies });
}