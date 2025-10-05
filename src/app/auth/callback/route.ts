import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

function isSafeInternal(path?: string | null) {
if (!path) return null;
if (!path.startsWith("/")) return null;
if (path.startsWith("//")) return null;
if (path.startsWith("/auth/")) return null;
return path;
}

export async function GET(req: NextRequest) {
const url = new URL(req.url);
const code = url.searchParams.get("code");
const redirectRaw = url.searchParams.get("redirect");

const supabase = createRouteHandlerClient({ cookies });

if (code) {
const { error } = await supabase.auth.exchangeCodeForSession(code);
if (error) return NextResponse.redirect(new URL("/auth/sign-in", url));
}

const { data: { user } } = await supabase.auth.getUser();
if (!user) return NextResponse.redirect(new URL("/auth/sign-in", url));

await supabase.from("profiles").upsert(
{ id: user.id, email: user.email ?? null },
{ onConflict: "id" }
);

const { data: profile } = await supabase
.from("profiles")
.select("first_name")
.eq("id", user.id)
.maybeSingle();

const needsName =
!profile || !profile.first_name || profile.first_name.trim().length === 0;

const safeRedirect = isSafeInternal(redirectRaw);

if (needsName) {
return NextResponse.redirect(new URL("/complete?first=1", url));
}

const { count } = await supabase
.from("assessment_results_2")
.select("id", { head: true, count: "exact" })
.eq("user_id", user.id);

const hasAssessments = (count ?? 0) > 0;

if (safeRedirect && hasAssessments) {
return NextResponse.redirect(new URL(safeRedirect, url));
}

if (!hasAssessments) {
return NextResponse.redirect(new URL("/dashboard?first=1", url));
}

return NextResponse.redirect(new URL("/dashboard", url));
}
