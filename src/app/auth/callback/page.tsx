// File: src/app/auth/callback/page.tsx
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
* Handles Supabase magic link & OAuth callback
* Creates session cookie and redirects accordingly.
*/
export default async function AuthCallbackPage({
    searchParams,
}: {
    searchParams?: Record<string, string | string[] | undefined>;
}) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: cookieStore }
    );

    const code = searchParams?.code as string | undefined;
    const redirectParam = searchParams?.redirect as string | undefined;

    if (!code) {
        console.warn("Missing auth code; redirecting to sign-in.");
        redirect("/auth/sign-in");
    }

    // 🔑 Exchange the code for a valid session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
        console.error("Auth callback error:", error.message);
        redirect("/auth/sign-in");
    }

    // ✅ New user → no first_name yet → send to /complete?first=1
    // ✅ Returning user → straight to /dashboard
    const { data: profile } = await supabase
        .from("profiles")
        .select("first_name")
        .eq("id", data.user.id)
        .maybeSingle();

    if (!profile?.first_name) {
        redirect("/complete?first=1");
    }

    // Optional: if a redirect param is present (from sign-in page), honor it.
    if (redirectParam) {
        redirect(redirectParam.startsWith("/") ? redirectParam : `/${redirectParam}`);
    }

    // Default → Dashboard
    redirect("/dashboard");
}
