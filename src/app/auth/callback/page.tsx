export const dynamic = "force-dynamic";
export const revalidate = 0;

import { redirect } from "next/navigation";
import { supabaseServer } from "../../../lib/supabase/server";

type SP = Record<string, string | string[] | undefined>;
const s = (v?: string | string[] | undefined) =>
  v == null ? undefined : Array.isArray(v) ? v[0] : v;

export default async function AuthCallback({
  searchParams,
}: { searchParams?: Promise<SP> }) {
  const sp: SP = (await searchParams) ?? {};
  const code = s(sp.code);
  const redirectRaw = s(sp.redirect);

  const supabase = supabaseServer();

  // Exchange the one-time code for a session
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) redirect("/auth/sign-in");
  }

  // Get user after exchange
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");

  // Ensure a profile row exists
  await supabase.from("profiles").upsert(
    { id: user.id, email: user.email ?? null },
    { onConflict: "id" }
  );

  // First-time: any assessment rows?
  const { count } = await supabase
    .from("assessment_results_2")
    .select("id", { head: true, count: "exact" })
    .eq("user_id", user.id);

  const firstTime = (count ?? 0) === 0;

  // Only allow redirect for returning users
  const safeRedirect =
    redirectRaw &&
      redirectRaw.startsWith("/") &&
      !redirectRaw.startsWith("//") &&
      !redirectRaw.startsWith("/auth/")
      ? redirectRaw
      : null;

  if (firstTime) redirect("/complete?first=1");
  redirect(safeRedirect || "/dashboard");
}
