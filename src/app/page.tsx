// File: src/app/page.tsx
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

// Always send the root to the right place.
// If you want to force sign-in first, this check is handy.
export default async function RootRedirect() {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  // If you prefer unauthenticated users to see the sign-in page first, use next line:
  // if (!user) redirect("/auth/sign-in");

  // Otherwise let /dashboard show the signed-out card (your current behavior).
  redirect("/dashboard");
}
