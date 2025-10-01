import Link from "next/link";
import { notFound } from "next/navigation";
import ExploreMenuServer from "@/components/ExploreMenuServer";
import { supabaseServer } from "@/lib/supabase/server";

export default async function ResourceDetailPage({
searchParams,
}: { searchParams: { id?: string } }) {
const id = searchParams?.id;
if (!id) {
return (
<>
<ExploreMenuServer />
<section className="card">
<h1>Resource</h1>
<div className="muted">No resource specified.</div>
<div className="hstack" style={{ marginTop: 10 }}>
<Link href="/resources" className="btn btn-ghost">Back to Resources</Link>
</div>
</section>
</>
);
}

const supabase = supabaseServer();
const { data, error } = await supabase
.from("resources")
.select("id, title, summary, url, created_at, category")
.eq("id", id)
.maybeSingle();

if (error) {
return (
<>
<ExploreMenuServer />
<section className="card">
<h1>Resource</h1>
<div style={{ color: "#991b1b" }}>{error.message}</div>
<div className="hstack" style={{ marginTop: 10 }}>
<Link href="/resources" className="btn btn-ghost">Back to Resources</Link>
</div>
</section>
</>
);
}

if (!data) return notFound();
const r = data;

return (
<>
<ExploreMenuServer />
<section className="card">
<h1>{r.title}</h1>
<div className="muted" style={{ marginTop: 6 }}>
{fmtDate(r.created_at)}{r.category ? ` • ${r.category}` : ""}
</div>
</section>

<section className="card">
<h2>About this resource</h2>
<div className="muted" style={{ marginTop: 6 }}>{r.summary || "No summary provided."}</div>
<div className="hstack" style={{ marginTop: 12 }}>
{r.url && <a className="btn btn-primary" href={r.url} target="_blank" rel="noopener noreferrer">Open Resource</a>}
<Link href="/resources" className="btn btn-ghost">Back to Resources</Link>
</div>
</section>
</>
);
}
function fmtDate(iso?: string | null){ if(!iso) return ""; return new Date(iso).toLocaleDateString(undefined,{ month:"short", day:"2-digit", year:"numeric" }); }
