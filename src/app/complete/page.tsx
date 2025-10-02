// File: src/app/complete/page.tsx
import Link from "next/link";
import ExploreMenuServer from "@/components/ExploreMenuServer";
import ProfileQuickForm from "@/components/ProfileQuickForm";
import { supabaseServer } from "@/lib/supabase/server";

type SP = Record<string, string | string[] | undefined>;
const s = (v?: string | string[] | undefined) => (v == null ? undefined : Array.isArray(v) ? v[0] : v);

export default async function CompletePage({
    searchParams,
}: {
    // ✅ Next 15 compatible: may be a Promise during build/render
    searchParams?: Promise<SP>;
}) {
    // normalize to plain object
    const sp: SP = (await searchParams) ?? {};
    const isFirst = s(sp.first) === "1";

    const supabase = supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    // Prefill profile fields for the quick form
    let initialFirstName: string | null = null;
    let initialFocus: string | null = null;
    let firstName: string | null = null;

    if (user) {
        const { data: prof } = await supabase
            .from("profiles")
            .select("first_name, full_name, focus, email")
            .eq("id", user.id)
            .maybeSingle();

        initialFirstName = prof?.first_name ?? null;
        initialFocus = prof?.focus ?? null;

        firstName =
            (prof?.first_name?.trim() ||
                (prof?.full_name ? String(prof.full_name).split(" ")[0] : "") ||
                (user.email ? String(user.email).split("@")[0] : "") ||
                "").trim() || null;
    }

    const welcomeTitle = isFirst
        ? (firstName
            ? `Welcome to The A.B.L.E. Man, ${firstName} — let’s get started.`
            : "Welcome to The A.B.L.E. Man — let’s get started.")
        : "Complete Your Profile";

    const expectCopy = isFirst
        ? "Let’s begin with a quick Alignment assessment and a few details to personalize your journey."
        : "You can update your details anytime.";

    return (
        <>
            {/* Hide Explore menu on first visit to reduce distractions */}
            {!isFirst && <ExploreMenuServer />}

            <section className="card">
                <h1>{welcomeTitle}</h1>
                <div className="muted" style={{ marginTop: 6 }}>{expectCopy}</div>
            </section>

            <section className="card" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {/* What to Expect */}
                <div>
                    <h2>What to Expect</h2>
                    <ul style={{ marginTop: 10, lineHeight: 1.6, paddingLeft: 18 }}>
                        <li><strong>Activate</strong> — clarify identity and values to anchor your decisions.</li>
                        <li><strong>Build</strong> — develop sustainable habits to support long-term goals.</li>
                        <li><strong>Leverage</strong> — apply strengths to create opportunities and momentum.</li>
                        <li><strong>Execute</strong> — maintain consistency and track progress with accountability.</li>
                    </ul>

                    <div className="hstack" style={{ marginTop: 12, flexWrap: "wrap" as const }}>
                        <Link href="/assessment/take" className="btn btn-primary">Take Alignment</Link>
                        <Link href="/dashboard" className="btn btn-ghost">Skip for now</Link>
                    </div>
                </div>

                {/* Quick Profile */}
                <div>
                    <h2>Tell us who you are</h2>
                    <div className="muted" style={{ marginTop: 6 }}>
                        Your first name helps personalize coaching guidance. You can add more later.
                    </div>
                    <div style={{ marginTop: 12 }}>
                        <ProfileQuickForm
                            initialFirstName={initialFirstName}
                            initialFocus={initialFocus}
                        />
                    </div>
                </div>
            </section>
        </>
    );
}