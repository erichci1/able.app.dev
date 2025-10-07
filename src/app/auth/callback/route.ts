// File: src/app/auth/callback/route.ts
import { NextResponse } from "next/server";
import { supabaseRoute } from "../../../lib/supabase/server";

export async function GET(req: Request) {
    const supabase = await supabaseRoute();

    // Parse the URL to keep ?redirect=/something
    const url = new URL(req.url);
    const redirectParam = url.searchParams.get("redirect");

    // Supabase will set the session via cookies on exchange (if code is valid)
    // If there was an error from Supabase, surface it in dev; otherwise continue.
    const error = url.searchParams.get("error");
    if (error) {
        // common: otp_expired, access_denied
        return NextResponse.redirect(
            new URL(`/auth/sign-in?error=1`, url.origin), { status: 307 }
        );
    }

    // Basic "first-time" detection:
    // If the user has no profile row (or first_name is null), route to /complete?first=1
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.redirect(new URL("/auth/sign-in?error=1", url.origin));
    }

    const { data: prof } = await supabase
        .from("profiles")
        .select("first_name")
        .eq("id", user.id)
        .maybeSingle();

    const hasFirst = !!(prof?.first_name && prof.first_name.trim().length > 0);

    if (!hasFirst) {
        const dest = new URL("/complete?first=1", url.origin);
        if (redirectParam) dest.searchParams.set("redirect", redirectParam);
        return NextResponse.redirect(dest);
    }

    // If there was a redirect request, honor it, else go to the dashboard
    const dest = new URL(redirectParam || "/dashboard", url.origin);
    return NextResponse.redirect(dest);
}