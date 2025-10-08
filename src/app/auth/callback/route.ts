// File: src/app/auth/callback/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// Use your dev host for this service; in prod service set NEXT_PUBLIC_SITE_URL accordingly
const BASE = (process.env.NEXT_PUBLIC_SITE_URL || "https://app1.ableframework.com").replace(/\/$/, "");
const abs = (p: string) => `${BASE}${p.startsWith("/") ? p : `/${p}`}`;

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const redirectParam = url.searchParams.get("redirect");
    const redirectTarget =
        redirectParam && redirectParam.startsWith("/") && !redirectParam.startsWith("/auth/")
            ? redirectParam
            : "/dashboard";

    // Prepare a response we will mutate (cookies + final Location)
    const response = NextResponse.redirect(abs(code ? redirectTarget : "/auth/sign-in?error=missing_code"), 302);

    // ✅ Next 15: cookies() can be async in route handlers — await it
    const cookieStore = await cookies();

    // Create a Supabase client that READS from cookieStore and WRITES to `response`
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                set(name: string, value: string, options?: any) {
                    response.cookies.set(name, value, options as any);
                },
                remove(name: string, options?: any) {
                    response.cookies.set(name, "", { ...(options as any), maxAge: 0 });
                },
            },
        }
    );

    if (!code) {
        // Already set Location to /auth/sign-in?error=missing_code
        return response;
    }

    // Exchange the code for a session; this will trigger cookie writes onto `response`
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error || !data?.session) {
        response.headers.set("Location", abs("/auth/sign-in?error=1"));
        return response;
    }

    // (Optional) Ensure a profile row exists
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.id) {
            await supabase
                .from("profiles")
                .upsert({ id: user.id, email: user.email ?? null }, { onConflict: "id" });
        }
    } catch {
        // ignore profile creation errors
    }

    // Final redirect to requested page (absolute URL)
    response.headers.set("Location", abs(redirectTarget));
    return response;
}