// File: src/app/auth/callback/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { supabaseRoute } from "@/lib/supabase/server";

const BASE = (process.env.NEXT_PUBLIC_SITE_URL || "https://app1.ableframework.com").replace(/\/$/, "");
const abs = (p: string) => `${BASE}${p.startsWith("/") ? p : `/${p}`}`;

export async function GET(req: NextRequest) {
    const supabase = await supabaseRoute();

    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const redirectParam = url.searchParams.get("redirect");
    const redirectTarget =
        redirectParam && redirectParam.startsWith("/") && !redirectParam.startsWith("/auth/")
            ? redirectParam
            : "/dashboard";

    if (!code) return NextResponse.redirect(abs("/auth/sign-in?error=missing_code"), 302);

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return NextResponse.redirect(abs("/auth/sign-in?error=1"), 302);

    return NextResponse.redirect(abs(redirectTarget), 302);
}
