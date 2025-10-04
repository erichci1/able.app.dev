// File: src/app/dashboard/page.tsx
import ExploreMenuServer from "../../components/ExploreMenuServer";
import { supabaseServer } from "../../lib/supabase/server";

// Dashboard cards (be sure these exist at these paths)
// If you don't have one yet, comment it out temporarily.
import AssessmentCard from "../../components/dashboard/AssessmentCard";
import CoachGuidanceCard from "../../components/dashboard/CoachGuidanceCard";
import UpcomingEventsCard from "../../components/dashboard/UpcomingEventsCard";
import MessagesPreviewCard from "../../components/dashboard/MessagesPreviewCard";
// import ResourcesPreviewCard from "@/components/dashboard/ResourcesPreviewCard"; // optional

export default async function DashboardPage() {
    const supabase = supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    // Signed-out: keep it simple
    if (!user) {
        return (
            <>
                <ExploreMenuServer />
                <section className="card" style={{ maxWidth: 1040, margin: "24px auto", padding: "16px" }}>
                    <h1>Dashboard</h1>
                    <div className="muted" style={{ marginTop: 6 }}>
                        Please sign in to view your dashboard.
                    </div>
                    <div className="hstack" style={{ marginTop: 10 }}>
                        <a className="btn btn-primary" href="/auth/sign-in">Sign In</a>
                    </div>
                </section>
            </>
        );
    }

    return (
        <>
            <ExploreMenuServer />

            <main
                style={{
                    maxWidth: 1040,
                    margin: "24px auto",
                    padding: "0 16px",
                    display: "grid",
                    gap: 16,
                }}
            >
                {/* ✅ Only AssessmentCard needs userId */}
                <AssessmentCard userId={user.id} />

                {/* ❗ Do NOT pass userId to these — they don't accept it */}
                <CoachGuidanceCard /> {/* If your version supports phase, pass phase={"all"} (default) */}
                <UpcomingEventsCard />
                {/* <ResourcesPreviewCard /> */}
                <MessagesPreviewCard />
            </main>
        </>
    );
}
