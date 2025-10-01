import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";

/** Browser-side Supabase client */
export const supabaseClient = () => createBrowserSupabaseClient();