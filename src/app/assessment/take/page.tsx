// File: src/app/assessment/take/page.tsx
import ExploreMenuServer from "../../../components/ExploreMenuServer";
import TakeAssessmentRedirectBridge from "../../../components/TakeAssessmentRedirectBridge";
import { supabaseServerComponent } from "../../../lib/supabase/server";

const JOTFORM = "https://form.jotform.com/250324703797157";

function buildJotformSrc(email: string, userId: string) {
    const p = new URLSearchParams();
    p.set("q12_email", email);
    p.set("q189_user_id", userId);
    return `${JOTFORM}?${p.toString()}`;
}

export default async function TakeAssessmentPage() {
    const supabase = await supabaseServerComponent();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.email) {
        return (
            <main className="container" style={{ maxWidth: 1040, margin: "24px auto", padding: "0 16px" }}>
                <section className="card" style={{ padding: 16 }}>
                    <h1>Alignment Assessment</h1>
                    <div className="muted" style={{ marginTop: 6 }}>
                        Please sign in to take the A.B.L.E. Alignment assessment.
                    </div>
                    <div className="hstack" style={{ marginTop: 12, gap: 8 }}>
                        <a className="btn btn-primary" href="/auth/sign-in?redirect=/assessment/take">Sign In</a>
                    </div>
                </section>
            </main>
        );
    }

    const src = buildJotformSrc(user.email, user.id);

    return (
        <main className="container" style={{ maxWidth: 1040, margin: "24px auto", padding: "0 16px" }}>
            <ExploreMenuServer />
            <section className="card" style={{ padding: 16, marginTop: 16 }}>
                <h1>Alignment Assessment</h1>
                <div className="muted" style={{ marginTop: 6 }}>
                    Complete your Alignment to personalize your coaching experience.
                </div>
                <div style={{ marginTop: 12, border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
                    <iframe
                        title="A.B.L.E. Alignment"
                        src={src}
                        style={{ width: "100%", height: "80vh", border: 0 }}
                        allow="clipboard-write *"
                    />
                </div>
                <TakeAssessmentRedirectBridge />
            </section>
        </main>
    );
}
