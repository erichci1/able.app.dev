// src/app/assessment/take/page.tsx
import ExploreMenuServer from "@/components/ExploreMenuServer";
import { supabaseServer } from '@/lib/supabase/server';
import TakeAssessmentRedirectBridge from "@/components/TakeAssessmentRedirectBridge";

const JOTFORM = 'https://form.jotform.com/250324703797157';

export default async function TakeAssessment() {
const supabase = supabaseServer();
const { data: { user } } = await supabase.auth.getUser();
const email = user?.email ?? "";
const uid = user?.id ?? "";

const src = email && uid
? `${JOTFORM}?q12_email=${encodeURIComponent(email)}&q189_user_id=${encodeURIComponent(uid)}`
: null;

return (
<>
{/* Listen for Jotform completion and promote to top-level redirect */}
<TakeAssessmentRedirectBridge />

{/* (Optional) You can hide Explore menu on first-time if you like */}
<ExploreMenuServer />

<section className="card">
<h1>ABLE Alignment Assessment</h1>
</section>

{!src ? (
<section className="card"><div className="muted">We couldn’t detect your session. Please sign in again.</div></section>
) : (
<section className="card" style={{ padding: 0 }}>
<iframe title="ABLE Assessment" src={src} width="100%" height={900} style={{ border: 0, borderRadius: "var(--radius)" }} />
<div style={{ padding: 12 }}>
<a className="btn btn-ghost" href={src} target="_blank" rel="noopener noreferrer">
Open in new tab
</a>
</div>
</section>
)}
</>
);
}
