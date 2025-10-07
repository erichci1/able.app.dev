// File: src/app/auth/sign-in/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { Suspense } from "react";
// If './_Client' exports SignInClient as default:
import SignInClient from "./_Client";
import React from "react";
// Ensure your ./_Client.tsx file contains a SignInClient component, for example:
//
// const SignInClient = () => {
//     // Your sign-in form/component logic here
//     return (
//         <div>
//             {/* Sign-in form UI */}
//             <h2>Sign In Form</h2>
//         </div>
//     );
// };
//
// export default SignInClient;

// Or, update './_Client.tsx' to export SignInClient as a named export if not already:

export default function SignInPage() {
    return (
        <Suspense fallback={
            <div className="container" style={{ maxWidth: 520, margin: "24px auto" }}>
                <section className="card" style={{ padding: 20 }}>
                    <h1 style={{ fontSize: 24, fontWeight: 900, margin: 0 }}>Sign In</h1>
                    <div className="muted" style={{ marginTop: 6 }}>Loading…</div>
                </section>
            </div>
        }>
            <SignInClient />
        </Suspense>
    );
}
