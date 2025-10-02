// File: src/app/auth/sign-in/page.tsx
// SERVER COMPONENT (no "use client")

// Disable prerender/ISR for this route at build time
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import SignInClient from "./_Client";

export default function SignInPageWrapper() {
    // Rendering a Client Component from a Server Component is valid.
    // The page won't be prerendered because of the exports above.
    return <SignInClient />;
}