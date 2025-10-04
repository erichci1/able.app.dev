// src/components/AppHeaderServer.tsx
import AppHeader from "../components/AppHeader";
import { supabaseServer } from "../lib/supabase/server";

/**
* Server wrapper:
* - gets user (SSR)
* - unread message count (RLS-aware)
* - light display name (from profiles if available, fallback to email/local-part)
*/
export default async function AppHeaderServer() {
const supabase = supabaseServer();
const { data: { user } } = await supabase.auth.getUser();

let unread = 0;
let displayName: string | undefined;

if (user) {
// unread count
const { count } = await supabase
.from("messages")
.select("id", { head: true, count: "exact" })
.eq("recipient_id", user.id)
.is("read_at", null);
unread = count ?? 0;

// try profiles for name
const { data: prof } = await supabase
.from("profiles")
.select("first_name, full_name")
.eq("id", user.id)
.maybeSingle();

if (prof?.first_name) displayName = prof.first_name as string;
else if (prof?.full_name) displayName = String(prof.full_name).split(" ")[0];
else if (user.email) displayName = String(user.email).split("@")[0];
}

return (
<AppHeader
isAuthed={!!user}
unreadCount={unread}
displayName={displayName}
/>
);
}
