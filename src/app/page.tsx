// File: src/app/page.tsx
import { redirect } from "next/navigation";
import { supabaseServer } from "../lib/supabase/server";

export default async function RootRedirect() {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  redirect(user ? "/dashboard" : "/auth/sign-in");
}