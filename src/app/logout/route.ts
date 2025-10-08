// File: src/app/logout/route.ts
import { NextResponse } from "next/server";
import { supabaseRoute } from "@/lib/supabase/server";

const BASE = (process.env.NEXT_PUBLIC_SITE_URL || "https://app1.ableframework.com").replace(/\/$/, "");
const abs = (p: string) => `${BASE}${p.startsWith("/") ? p : `/${p}`}`;

export async function GET() {
    const supabase = await supabaseRoute();
    await supabase.auth.signOut({ scope: "global" });
    return NextResponse.redirect(abs("/auth/sign-in"), 302);
}