// File: src/app/complete/page.tsx
import Link from "next/link";
import { supabaseServerComponent } from "@/lib/supabase/server";
import ExploreMenuServer from "@/components/ExploreMenuServer";
import ProfileQuickForm from "@/components/ProfileQuickForm";

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

    const supabase = supabaseServerComponent();
    const { data: { user } } = await supabase.auth.getUser();

    // Not signed-in — send back to sign-in (and return to complete)
    if (!user) {
        return (
            <main style={{ maxWidth: 1040, margin: "24px auto", padding: "0 16px" }}>
                <section className="card" style={{ padding: 16 }}>
                    <h1>Complete Your Profile</h1>
                    <div className="muted" style={{ marginTop: 6 }}>
                        Please sign in to continue.
                    </div>
                    <div className="hstack" style={{ marginTop: 12, gap: 8 }}>
                        <a className="btn btn-primary" href="/auth/sign-in?redirect=/complete?first=1">
                            Sign In
                        </a>
                    </div>
                </section>
            </main>
        );
    }

    // If assessments exist already, we don't keep him here — go to dashboard
    const { count: assessCount } = await supabase
        .from("assessment_results_2")
        .select("id", { head: true, count: "exact" })
        .eq("user_id", user.id);

    if ((assessCount ?? 0) > 0) {
        return (
            <main style={{ maxWidth: 1040, margin: "24px auto", padding: "0 16px" }}>
                <section className="card" style={{ padding: 16 }}>
                    <h1>Complete Your Profile</h1>
                    <div className="muted" style={{ marginTop: 6 }}>
                        You’ve already completed your Alignment. Sending you to the dashboard…
                    </div>
                    <meta httpEquiv="refresh" content="1; url=/dashboard" />
                </section>
            </main>
        );
    }

    // Prefill fields from profile
    const { data: prof } = await supabase
        .from("profiles")
        .select("first_name, full_name, focus, email")
        .eq("id", user.id)
        .maybeSingle();

    const initialFirstName = prof?.first_name ?? null;
    const initialFocus = prof?.focus ?? null;

    const firstName =
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
        <main style={{ maxWidth: 1040, margin: "24px auto", padding: "0 16px" }}>
            {/* Hide Explore menu on very first visit to keep focus */}
            {!isFirst && <ExploreMenuServer />}

            <section className="card" style={{ padding: 16, marginTop: 16 }}>
                <h1>{welcomeTitle}</h1>
                <div className="muted" style={{ marginTop: 6 }}>{expectCopy}</div>
            </section>

            <section
                className="card"
                style={{
                    padding: 16,
                    marginTop: 16,
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                }}
            >
                {/* What to Expect */}
                <div>
                    <h2>What to Expect</h2>
                    <ul style={{ marginTop: 10, lineHeight: 1.6, paddingLeft: 18 }}>
                        <li><strong>Activate</strong> — clarify identity and values to anchor your decisions.</li>
                        <li><strong>Build</strong> — develop sustainable habits to support long-term goals.</li>
                        <li><strong>Leverage</strong> — apply strengths to create opportunities and momentum.</li>
                        <li><strong>Execute</strong> — maintain consistency and track progress with accountability.</li>
                    </ul>
                    <div className="hstack" style={{ marginTop: 12, gap: 8, flexWrap: "wrap" as const }}>
                        <Link href="/assessment/take" className="btn btn-primary">Take Alignment</Link>
                        <Link href="/dashboard" className="btn btn-ghost">Skip for now</Link>
                    </div>
                </div>

                {/* Quick Profile Form (toast + CTA fires on save) */}
                <div>
                    <h2>Tell us who you are</h2>
                    <div className="muted" style={{ marginTop: 6 }}>
                        Your first name helps personalize coaching guidance. You can add more later.
                    </div>
                    <div style={{ marginTop: 12 }}>
                        <ProfileQuickForm
                            initialFirstName={initialFirstName}
                            initialFocus={initialFocus}
                            redirectAfterSave="/dashboard?first=1"
                        />
                    </div>
                </div>
            </section>
        </main>
    );
}