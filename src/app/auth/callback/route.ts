// File: src/app/auth/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseRoute } from "@/lib/supabase/server";

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

    const supabase = supabaseRoute();

    if (!code) {
        return NextResponse.redirect(new URL("/auth/sign-in?error=missing_code", url));
    }

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
        console.error("[auth/callback] exchange error:", error.message);
        return NextResponse.redirect(new URL("/auth/sign-in?error=1", url));
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.redirect(new URL("/auth/sign-in?error=2", url));
    }

    // ensure profile row
    await supabase.from("profiles").upsert(
        { id: user.id, email: user.email ?? null },
        { onConflict: "id" }
    );

    // first time? go to complete
    const { data: profile } = await supabase
        .from("profiles").select("first_name").eq("id", user.id).maybeSingle();

    if (!profile?.first_name) {
        return NextResponse.redirect(new URL("/complete?first=1", url));
    }

    // assessments?
    const { count } = await supabase
        .from("assessment_results_2")
        .select("id", { head: true, count: "exact" })
        .eq("user_id", user.id);

    const hasAssessments = (count ?? 0) > 0;
    const safe = safeInternal(redirectParam);

    if (safe && hasAssessments) return NextResponse.redirect(new URL(safe, url));
    if (!hasAssessments) return NextResponse.redirect(new URL("/dashboard?first=1", url));
    return NextResponse.redirect(new URL("/dashboard", url));
}
