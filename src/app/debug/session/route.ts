// File: src/app/debug/session/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function GET() {
    // ✅ Next 15: cookies() is async inside route handlers
    const cookieStore = await cookies();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            // Read-only cookie bridge (no writes in this debug endpoint)
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                set() { },
                remove() { },
            },
        }
    );

    const { data, error } = await supabase.auth.getUser();

    return NextResponse.json({
        hasUser: !!data.user,
        user: data.user ?? null,
        error: error?.message ?? null,
    });
}
