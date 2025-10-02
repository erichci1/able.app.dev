// File: src/app/auth/callback/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export default async function AuthCallback({
  searchParams,
}: { searchParams?: { code?: string; redirect?: string } }) {
  const supabase = supabaseServer();

  // Exchange the one-time code for a session
  if (searchParams?.code) {
    const { error } = await supabase.auth.exchangeCodeForSession(searchParams.code);
    if (error) redirect("/auth/sign-in");
  }

  // Get the user after exchange
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");

  // Ensure profile exists
  await supabase.from("profiles").upsert({ id: user.id, email: user.email ?? null }, { onConflict: "id" });

  // First-time gate (0 assessments ⇒ /complete)
  const { count } = await supabase
    .from("assessment_results_2")
    .select("id", { head: true, count: "exact" })
    .eq("user_id", user.id);
  const firstTime = (count ?? 0) === 0;
  if (firstTime) redirect("/complete?first=1");

  // Honor redirect (internal paths only)
  const raw = (searchParams?.redirect || "").trim();
  const safeRedirect =
    raw && raw.startsWith("/") && !raw.startsWith("//") && !raw.startsWith("/auth/")
      ? raw
      : null;
  redirect(safeRedirect || "/dashboard");
}
