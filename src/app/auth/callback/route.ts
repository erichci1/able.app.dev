// File: src/app/auth/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

// allow safe internal redirect only
function safeInternal(path?: string | null) {
    if (!path) return null;
    if (!path.startsWith("/")) return null;
    if (path.startsWith("//")) return null;
    if (path.startsWith("/auth/")) return null;
    return path;
}

/**
* Magic-link / OAuth callback:
* - exchanges the 'code' for a session (writes cookie)
* - routes new/returning users based on profile + assessments
*/
export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const code = url.searchParams.get("code"); // Supabase code
    const redirectParam = url.searchParams.get("redirect"); // optional & safe-only
    const supabase = createRouteHandlerClient({ cookies });

    // Must have a code
    if (!code) {
        return NextResponse.redirect(new URL("/auth/sign-in?error=missing_code", url));
    }

    // Exchange code → session cookie (only possible in route handler)
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
        console.error("[auth/callback] exchange error:", error.message);
        return NextResponse.redirect(new URL("/auth/sign-in?error=1", url));
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.redirect(new URL("/auth/sign-in?error=2", url));
    }

    // Ensure profile exists (id, email)
    await supabase.from("profiles").upsert(
        { id: user.id, email: user.email ?? null },
        { onConflict: "id" }
    );

    // Missing first_name → /complete?first=1
    const { data: profile } = await supabase
        .from("profiles")
        .select("first_name")
        .eq("id", user.id)
        .maybeSingle();

    const needsName = !profile?.first_name || profile.first_name.trim().length === 0;
    if (needsName) {
        return NextResponse.redirect(new URL("/complete?first=1", url));
    }

    // Check if any assessments exist for this user
    const { count } = await supabase
        .from("assessment_results_2")
        .select("id", { head: true, count: "exact" })
        .eq("user_id", user.id);

    const hasAssessments = (count ?? 0) > 0;

    // honor redirect= only for established users, internal-only
    const safe = safeInternal(redirectParam);
    if (safe && hasAssessments) {
        return NextResponse.redirect(new URL(safe, url));
    }

    if (!hasAssessments) {
        // let Dashboard show the welcome CTA/toast
        return NextResponse.redirect(new URL("/dashboard?first=1", url));
    }

    return NextResponse.redirect(new URL("/dashboard", url));
}
