// File: src/app/debug/session/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function GET() {
    const cookieStore = cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get: (name) => cookieStore.get(name)?.value,
                // read-only for server components; route handler can set, but here we just inspect
                set: () => { },
                remove: () => { },
            },
        }
    );
    const { data: { user }, error } = await supabase.auth.getUser();
    const cookieNames = cookieStore.getAll().map((c) => c.name);
    return NextResponse.json({ user, hasUser: !!user, error: error?.message ?? null, cookies: cookieNames });
}
