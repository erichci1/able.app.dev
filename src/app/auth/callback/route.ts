// File: src/app/auth/callback/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

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

    // Prepare the *final* redirect response up front
    const response = NextResponse.redirect(abs(code ? redirectTarget : "/auth/sign-in?error=missing_code"), 302);

    // Create a Supabase server client that reads cookies and WRITES to this response
    const cookieStore = cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                set(name: string, value: string, options?: any) {
                    response.cookies.set(name, value, options);
                },
                remove(name: string, options?: any) {
                    response.cookies.set(name, "", { ...options, maxAge: 0 });
                },
            },
        }
    );

    if (!code) return response; // already points to /auth/sign-in?error=missing_code

    // Exchange the code for a session (this will SET cookies on `response`)
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error || !data?.session) {
        response.headers.set("Location", abs("/auth/sign-in?error=1"));
        return response;
    }

    // Optional: ensure profile row exists (safe upsert)
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.id) {
            await supabase
                .from("profiles")
                .upsert({ id: user.id, email: user.email ?? null }, { onConflict: "id" });
        }
    } catch {
        // ignore profile errors
    }

    // Finalize the redirect location (already absolute)
    response.headers.set("Location", abs(redirectTarget));
    return response;
}

