// File: src/app/auth/sign-in/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { Suspense } from "react";
import { SignInClient } from "./_Client";

export default function SignInPage() {
    return (
        <Suspense
            fallback={
                <div className="container" style={{ maxWidth: 520, margin: "24px auto" }}>
                    <section className="card" style={{ padding: 20 }}>
                        <h1 style={{ fontSize: 24, fontWeight: 900, margin: 0 }}>Sign In</h1>
                        <div className="muted" style={{ marginTop: 6 }}>Loading…</div>
                    </section>
                </div>
            }
        >
            <SignInClient />
        </Suspense>
    );
}
