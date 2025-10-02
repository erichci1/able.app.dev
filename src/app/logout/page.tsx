// File: src/app/logout/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export default async function LogoutPage() {
    const supabase = supabaseServer();
    await supabase.auth.signOut();
    // Choose where to land post-logout:
    redirect("/auth/sign-in"); // or: redirect("https://www.ableframework.com")
}