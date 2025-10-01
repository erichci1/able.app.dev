// File: src/app/auth/callback/page.tsx
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export default async function AuthCallback({
  searchParams,
}: {
  searchParams?: { code?: string; redirect?: string; state?: string };
}) {
  const supabase = supabaseServer();

  // 1) Exchange the one-time code for a session (Magic Link & OAuth)
  const code = searchParams?.code;
  if (code) {
    const { error: exErr } = await supabase.auth.exchangeCodeForSession(code);
    if (exErr) {
      // Code might be expired/invalid
      redirect("/auth/sign-in");
    }
  }

  // 2) Read session (now the cookie should be set)
  const { data: { user }, error } = await supabase.auth.getUser();
  if (!user || error) {
    redirect("/auth/sign-in");
  }

  // 3) Ensure profile exists
  const { data: profRow } = await supabase
    .from("profiles")
    .upsert({ id: user.id, email: user.email ?? null }, { onConflict: "id" })
    .select("id, assessment_taken")
    .maybeSingle();

  // 4) First-time gate based on assessments
  const { count: assessCount } = await supabase
    .from("assessment_results_2")
    .select("id", { head: true, count: "exact" })
    .eq("user_id", user.id);

  const hasAnyAssessments = (assessCount ?? 0) > 0;

  // mirror a flag if you keep it in profiles
  if (profRow && profRow.assessment_taken !== hasAnyAssessments) {
    await supabase
      .from("profiles")
      .update({ assessment_taken: hasAnyAssessments })
      .eq("id", user.id);
  }

  // 5) Sanitize redirect (internal paths only)
  const raw = (searchParams?.redirect || "").trim();
  const safeRedirect =
    raw && raw.startsWith("/") && !raw.startsWith("//") && !raw.startsWith("/auth/")
      ? raw
      : null;

  // 6) Redirect
  if (!hasAnyAssessments) {
    redirect("/complete?first=1");                 // first-time onboarding
  } else {
    redirect(safeRedirect || "/dashboard");        // returning path or dashboard
  }
}
