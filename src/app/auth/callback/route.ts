import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

function safeInternal(path?: string | null) {
    if (!path) return null;
    if (!path.startsWith("/")) return null;
    if (path.startsWith("//")) return null;
    if (path.startsWith("/auth/")) return null;
    return path;
}

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const redirectParam = url.searchParams.get("redirect");

    const supabase = createRouteHandlerClient({ cookies });

    if (!code) {
        return NextResponse.redirect(new URL("/auth/sign-in?error=missing_code", url));
    }

    // Exchange code for session and write cookies
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
        console.error("[auth/callback] exchange error:", error.message);
        // Supabase will also sometimes add ?error=... back to sign-in; keep ours simple.
        return NextResponse.redirect(new URL("/auth/sign-in?error=1", url));
    }

    // Get the user after exchange
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.redirect(new URL("/auth/sign-in?error=2", url));
    }

    // Ensure profile exists
    await supabase.from("profiles").upsert(
        { id: user.id, email: user.email ?? null },
        { onConflict: "id" }
    );

    // If the user has no first_name, go to complete
    const { data: profile } = await supabase
        .from("profiles")
        .select("first_name")
        .eq("id", user.id)
        .maybeSingle();

    const needsName = !profile?.first_name || profile.first_name.trim().length === 0;
    if (needsName) {
        return NextResponse.redirect(new URL("/complete?first=1", url));
    }

    // If assessments exist, allow safe redirect
    const { count } = await supabase
        .from("assessment_results_2")
        .select("id", { head: true, count: "exact" })
        .eq("user_id", user.id);

    const hasAssessments = (count ?? 0) > 0;
    const safe = safeInternal(redirectParam);

    if (safe && hasAssessments) {
        return NextResponse.redirect(new URL(safe, url));
    }

    if (!hasAssessments) {
        return NextResponse.redirect(new URL("/dashboard?first=1", url));
    }

    return NextResponse.redirect(new URL("/dashboard", url));
}
