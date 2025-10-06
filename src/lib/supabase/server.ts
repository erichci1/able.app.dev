import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

/** Server-side client for Route Handlers / Server Components */
export function supabaseServer() {
    return createRouteHandlerClient({ cookies });
}