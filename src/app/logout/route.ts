// File: src/app/logout/route.ts
import { NextResponse } from "next/server";
import { supabaseRoute } from "../../lib/supabase/server";

export async function GET() {
    const supabase = supabaseRoute();
    await supabase.auth.signOut(); // clears cookies via route-handler cookies()

    // Send them to sign-in (optionally could keep ?redirect=)
    return NextResponse.redirect(new URL("/auth/sign-in", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"));
}