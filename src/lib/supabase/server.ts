// src/lib/supabase/server.ts
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function supabaseServerComponent() {
    const cookieStore = await cookies(); // Readonly in RSC

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                // NOTE: Do NOT provide set/remove in RSC; Next.js disallows it.
            },
        }
    );
}


export async function supabaseRoute() {
    const cookieStore = await cookies(); // RequestCookies (mutable in route handlers)

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                set(name: string, value: string, options?: CookieOptions) {
                    cookieStore.set({
                        name,
                        value,
                        ...options,
                    });
                },
                remove(name: string, options?: CookieOptions) {
                    cookieStore.set({
                        name,
                        value: "",
                        ...options,
                        maxAge: 0, // expire now
                    });
                },
            },
        }
    );
}