// File: src/app/dashboard/page.tsx
import AppHeaderServer from "../../components/AppHeaderServer";
import ExploreMenuServer from "../../components/ExploreMenuServer";

// Dashboard cards (server components)
import AssessmentCard from "../../components/dashboard/AssessmentCard";
import CoachGuidanceCard from "../../components/dashboard/CoachGuidanceCard";
import UpcomingEventsCardCalendar from "../../components/dashboard/UpcomingEventsCardCalendar";
import MessagesPreviewCard from "../../components/dashboard/MessagesPreviewCard";

export default async function DashboardPage() {
    return (
        <>
            <AppHeaderServer />
            <ExploreMenuServer />

            <main
                className="container"
                style={{
                    maxWidth: 1120,
                    margin: "24px auto",
                    padding: "0 16px",
                    display: "grid",
                    gap: 16,
                }}
            >
                {/* Hero: Alignment */}
                <section>
                    <AssessmentCard />
                </section>

                {/* Guidance + Events */}
                <section
                    style={{
                        display: "grid",
                        gap: 16,
                        gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 0.8fr)",
                        alignItems: "start",
                    }}
                >
                    <CoachGuidanceCard phase="all" />
                    <UpcomingEventsCardCalendar limit={3} showJoin showCalendar />
                </section>

                {/* Messages */}
                <section>
                    <MessagesPreviewCard />
                </section>
            </main>
        </>
    );
}
