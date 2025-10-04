// File: src/app/auth/callback/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { redirect } from "next/navigation";
import { supabaseServer } from "../../../lib/supabase/server";

type SP = Record<string, string | string[] | undefined>;

export default async function AuthCallback({
  searchParams,
}: {
  searchParams?: Promise<SP>;
}) {
  // Normalize Next 15's searchParams (may be a Promise)
  const sp: SP = (await searchParams) ?? {};
  const code = typeof sp.code === "string" ? sp.code : undefined;
  const redirectRaw = typeof sp.redirect === "string" ? sp.redirect : undefined;

  const supabase = supabaseServer();

  // Exchange the one-time code for a session
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) redirect("/auth/sign-in");
  }

  // Get user after exchange
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");

  // Ensure profile exists
  await supabase.from("profiles").upsert(
    { id: user.id, email: user.email ?? null },
    { onConflict: "id" }
  );

  // Optional first-time gate (example: if no assessments yet)
  const { count } = await supabase
    .from("assessment_results_2")
    .select("id", { head: true, count: "exact" })
    .eq("user_id", user.id);
  if ((count ?? 0) === 0) redirect("/complete?first=1");

  // Respect redirect param if it’s safe
  const safeRedirect =
    redirectRaw &&
      redirectRaw.startsWith("/") &&
      !redirectRaw.startsWith("//") &&
      !redirectRaw.startsWith("/auth/")
      ? redirectRaw
      : null;

  redirect(safeRedirect || "/dashboard");
}
