// File: src/app/auth/callback/page.tsx
import { redirect } from "next/navigation";
import { supabaseServer } from "../../../lib/supabase/server";

type SP = Record<string, string | string[] | undefined>;

export default async function AuthCallbackPage({
    searchParams,
}: {
    searchParams?: Promise<SP>;
}) {
    // Normalize search params for Next 15 async typing
    const sp: SP = (await searchParams) ?? {};
    const code =
        typeof sp.code === "string"
            ? sp.code
            : Array.isArray(sp.code)
                ? sp.code[0]
                : undefined;

    // If no code present, redirect safely
    if (!code) {
        redirect("/auth/sign-in");
    }

    const supabase = supabaseServer();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
        console.error("Supabase session exchange failed:", error.message);
        redirect("/auth/sign-in?error=1");
    }

    // Fetch profile to decide where to go next
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/sign-in");
    }

    // Check if user has a first name
    const { data: profile } = await supabase
        .from("profiles")
        .select("first_name")
        .eq("id", user.id)
        .maybeSingle();

    if (!profile?.first_name) {
        // New or incomplete user → Complete page
        redirect("/complete?first=1");
    }

    // Otherwise → Dashboard
    redirect("/dashboard");
}
