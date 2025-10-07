// src/app/auth/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseRoute } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const redirectParam = url.searchParams.get("redirect");

    const supabase = await supabaseRoute();

    if (!code) return NextResponse.redirect(new URL("/auth/sign-in?error=missing_code", url));

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return NextResponse.redirect(new URL("/auth/sign-in?error=1", url));

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.redirect(new URL("/auth/sign-in?error=2", url));

    // Ensure profile exists, then route
    await supabase.from("profiles").upsert({ id: user.id, email: user.email ?? null }, { onConflict: "id" });

    const safeRedirect =
        redirectParam && redirectParam.startsWith("/") && !redirectParam.startsWith("/auth/")
            ? redirectParam
            : null;

    return NextResponse.redirect(new URL(safeRedirect || "/dashboard", url));
}
