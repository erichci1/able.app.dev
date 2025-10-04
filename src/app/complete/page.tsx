// File: src/app/complete/page.tsx
import Link from "next/link";
import ExploreMenuServer from "../../components/ExploreMenuServer";
import ProfileQuickForm from "../../components/ProfileQuickForm";
import { supabaseServer } from "../../lib/supabase/server";


type SP = Record<string, string | string[] | undefined>;
const s = (v?: string | string[] | undefined) =>
    v == null ? undefined : Array.isArray(v) ? v[0] : v;

export default async function CompletePage({
    searchParams,
}: {
    searchParams?: Promise<SP>;
}) {
    const sp: SP = (await searchParams) ?? {};
    const isFirst = s(sp.first) === "1";

    const supabase = supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        // Not signed in — route to sign-in so we can return to complete after
        return (
            <section className="card" style={{ maxWidth: 720, margin: "24px auto" }}>
                <h1>Complete Your Profile</h1>
                <div className="muted" style={{ marginTop: 6 }}>
                    Please sign in to continue.
                </div>
                <div className="hstack" style={{ marginTop: 12 }}>
                    <a className="btn btn-primary" href="/auth/sign-in?redirect=/complete?first=1">
                        Sign In
                    </a>
                </div>
            </section>
        );
    }

    // If user already has assessment rows, don't keep them here — go to dashboard
    const { count } = await supabase
        .from("assessment_results_2")
        .select("id", { head: true, count: "exact" })
        .eq("user_id", user.id);

    if ((count ?? 0) > 0) {
        // Already completed alignment; dashboard is the right place
        return (
            <section className="card" style={{ maxWidth: 720, margin: "24px auto" }}>
                <h1>Complete Your Profile</h1>
                <div className="muted" style={{ marginTop: 6 }}>
                    You’ve already completed your Alignment. Sending you to the dashboard…
                </div>
                <meta httpEquiv="refresh" content="1; url=/dashboard" />
            </section>
        );
    }

    // Prefill quick form fields
    let initialFirstName: string | null = null;
    let initialFocus: string | null = null;
    let firstName: string | null = null;

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
            {/* Hide Explore menu on very first visit to keep focus */}
            {!isFirst && <ExploreMenuServer />}

            <section className="card" style={{ maxWidth: 1040, margin: "24px auto", padding: "16px" }}>
                <h1>{welcomeTitle}</h1>
                <div className="muted" style={{ marginTop: 6 }}>{expectCopy}</div>
            </section>

            <section className="card" style={{ maxWidth: 1040, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
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

                {/* Quick Profile Form (in-place toast + “Take Alignment” CTA on success) */}
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
