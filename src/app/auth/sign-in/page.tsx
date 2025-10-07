// File: src/app/auth/sign-in/page.tsx
const dynamicSetting = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import dynamic from "next/dynamic";

// Load the client-only component (no SSR)
const SignInClient = dynamic(() => import("./_Client"), { ssr: false });

export default function SignInPageWrapper() {
    return <SignInClient />;
}