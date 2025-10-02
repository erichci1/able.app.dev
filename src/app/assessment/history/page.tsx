// File: src/app/assessment/history/page.tsx
import { supabaseServer } from "@/lib/supabase/server";

type AssessRow = {
    id: string;
    submission_date: string | null;
    activate_percentage: number | string | null;
    build_percentage: number | string | null;
    leverage_percentage: number | string | null;
    execute_percentage: number | string | null;
};

type SP = Record<string, string | string[] | undefined>;

function toISODateEndOfDay(d: string) {
    const end = new Date(d);
    end.setHours(23, 59, 59, 999);
    return end.toISOString();
}
function s(v?: string | string[] | undefined) {
    if (v == null) return undefined;
    return Array.isArray(v) ? v[0] : v;
}

export default async function AssessmentHistoryPage({
    searchParams,
}: {
    // ✅ Next 15 compatible: may be a Promise at render/build time
    searchParams?: Promise<SP>;
}) {
    // normalize to plain object
    const sp: SP = (await searchParams) ?? {};

    const orderParam = s(sp.order) ?? "new"; // new|old
    const fromParam = s(sp.from) ?? "";
    const toParam = s(sp.to) ?? "";
    const pageParam = Number(s(sp.page) ?? "1") || 1;
    const sizeParam = Number(s(sp.size) ?? "10") || 10;

    const ascending = orderParam === "old";
    const page = Math.max(1, pageParam);
    const size = [10, 20, 50].includes(sizeParam) ? sizeParam : 10;
    const fromIdx = (page - 1) * size;
    const toIdx = fromIdx + size - 1;

    const supabase = supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return <section className="card">Please sign in.</section>;

    // ----- COUNT (build inline: shallow inference)
    let countQ = supabase
        .from("assessment_results_2")
        .select("id", { head: true, count: "exact" })
        .eq("user_id", user.id);

    if (fromParam) countQ = countQ.gte("submission_date", new Date(fromParam).toISOString());
    if (toParam) countQ = countQ.lte("submission_date", toISODateEndOfDay(toParam));

    const { count } = await countQ;
    const totalCount: number = count ?? 0;

    const lastPage = Math.max(1, Math.ceil(totalCount / size));
    const current = Math.min(page, lastPage);

    // ----- ROWS (same shallow pattern)
    let rowsQ = supabase
        .from("assessment_results_2")
        .select(`
id,
submission_date,
activate_percentage,
build_percentage,
leverage_percentage,
execute_percentage
`)
        .eq("user_id", user.id);

    if (fromParam) rowsQ = rowsQ.gte("submission_date", new Date(fromParam).toISOString());
    if (toParam) rowsQ = rowsQ.lte("submission_date", toISODateEndOfDay(toParam));

    rowsQ = rowsQ.order("submission_date", { ascending }).range(fromIdx, toIdx);

    const { data: rows, error } = await rowsQ;
    if (error) {
        return (
            <section className="card">
                <h1>Alignment History</h1>
                <div style={{ color: "#991b1b", marginTop: 8 }}>{error.message}</div>
            </section>
        );
    }

    const list = (rows ?? []) as AssessRow[];

    return (
        <>
            <section className="card">
                <h1>Alignment History</h1>
                <div className="muted" style={{ marginTop: 6 }}>
                    Review your recent assessments. Filters and sorting are shareable via URL.
                </div>
            </section>

            <section className="card" style={{ padding: 0, overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
                    <thead>
                        <tr>
                            <Th>Date</Th>
                            <Th align="center">Activate</Th>
                            <Th align="center">Build</Th>
                            <Th align="center">Leverage</Th>
                            <Th align="center">Execute</Th>
                            <Th align="right">Actions</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.map((r, i) => {
                            const id = String(r.id);
                            return (
                                <tr key={id} style={{ borderTop: i === 0 ? "none" : "1px solid var(--border)" }}>
                                    <Td>{fmtDateTime(r.submission_date)}</Td>
                                    <Td align="center">{fmtPct(r.activate_percentage)}</Td>
                                    <Td align="center">{fmtPct(r.build_percentage)}</Td>
                                    <Td align="center">{fmtPct(r.leverage_percentage)}</Td>
                                    <Td align="center">{fmtPct(r.execute_percentage)}</Td>
                                    <Td align="right">
                                        <a className="btn btn-ghost" href={`/assessment/details?id=${encodeURIComponent(id)}`}>View</a>
                                    </Td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </section>

            <section className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div className="muted">
                    Showing <strong>{list.length}</strong> of <strong>{totalCount}</strong> • Page <strong>{current}</strong> / {lastPage}
                </div>
                <div className="hstack" style={{ gap: 8 }}>
                    <Pager dir="prev" page={current} last={lastPage} />
                    <Pager dir="next" page={current} last={lastPage} />
                </div>
            </section>
        </>
    );
}

/* ---- helpers ---- */
function fmtPct(v: number | string | null | undefined) {
    if (v == null) return "—";
    const n = typeof v === "string" ? Number(v) : v;
    return Number.isFinite(n) ? `${Math.round(n)}%` : "—";
}
function fmtDateTime(iso?: string | null) {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
        month: "short", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
    });
}
function Th({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "center" | "right" }) {
    return <th style={{ textAlign: align, padding: "12px 16px", color: "var(--muted)" }}>{children}</th>;
}
function Td({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "center" | "right" }) {
    return <td style={{ textAlign: align, padding: "12px 16px" }}>{children}</td>;
}
function Pager({ dir, page, last }: { dir: "prev" | "next"; page: number; last: number }) {
    const disabled = (dir === "prev" && page <= 1) || (dir === "next" && page >= last);
    const href = buildHref(dir, page);
    return (
        <a className="btn btn-ghost" aria-disabled={disabled} href={disabled ? "#" : href} onClick={(e) => disabled && e.preventDefault()}>
            {dir === "prev" ? "← Previous" : "Next →"}
        </a>
    );
}
function buildHref(dir: "prev" | "next", page: number) {
    if (typeof window === "undefined") return "#";
    const params = new URLSearchParams(window.location.search);
    params.set("page", String(dir === "prev" ? page - 1 : page + 1));
    return `?${params.toString()}`;
}
