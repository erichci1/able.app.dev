// File: src/lib/supabase/server.ts
import { cookies } from "next/headers";
import {
    createServerComponentClient,
    createRouteHandlerClient,
} from "@supabase/auth-helpers-nextjs";

/** For Server Components (layout.tsx, page.tsx, server components) */
export function supabaseServerComponent() {
    return createServerComponentClient({ cookies });
}

// For Route Handlers (e.g., src/app/[...]/route.ts)
export function supabaseRoute() {
    return createRouteHandlerClient({ cookies });
}