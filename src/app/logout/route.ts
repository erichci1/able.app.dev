// File: src/app/logout/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// Use your environment base; fallback to your dev host for this service
const BASE = (process.env.NEXT_PUBLIC_SITE_URL || "https://app1.ableframework.com").replace(/\/$/, "");
const abs = (p: string) => `${BASE}${p.startsWith("/") ? p : `/${p}`}`;

async function handleLogout(req: NextRequest) {
    const url = new URL(req.url);
    // Optional: where to send him after logout (default: /auth/sign-in)
    const redirectParam = url.searchParams.get("redirect");
    const dest = redirectParam && redirectParam.startsWith("/")
        ? redirectParam
        : "/auth/sign-in";

    // Prepare a response we will mutate (so Set-Cookie is emitted with the 302)
    const res = NextResponse.redirect(abs(dest), 302);

    // Next 15: cookies() may be async in route handlers
    const cookieStore = await cookies();

    // Bridge cookie reads from request and writes onto the response
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                set(name: string, value: string, options?: any) {
                    res.cookies.set(name, value, options as any);
                },
                remove(name: string, options?: any) {
                    res.cookies.set(name, "", { ...(options as any), maxAge: 0, path: "/" });
                },
            },
        }
    );

    // Ask Supabase to clear its session (will write clearing Set-Cookie into `res`)
    try {
        await supabase.auth.signOut();
    } catch {
        // ignore signOut errors, we still hard-clear known cookies below
    }

    // Belt-and-suspenders: remove any leftover sb-* cookies and custom mirrors
    for (const c of cookieStore.getAll()) {
        if (c.name.startsWith("sb-") || c.name === "ableman.auth") {
            res.cookies.set(c.name, "", { maxAge: 0, path: "/" });
        }
    }

    return res;
}

export async function GET(req: NextRequest) {
    return handleLogout(req);
}

export async function POST(req: NextRequest) {
    return handleLogout(req);
}
