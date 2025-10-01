// File: src/components/TakeAssessmentRedirectBridge.tsx
"use client";

import * as React from "react";

/**
* Listens for Jotform completion postMessage and redirects the top window
* to /dashboard?done=1 so the toast appears once.
*
* Works with embedded iFrame. We whitelist jotform origins.
*/
export default function TakeAssessmentRedirectBridge() {
React.useEffect(() => {
function onMessage(e: MessageEvent) {
// Safeguard: only trust messages from Jotform domains
const origin = e.origin || "";
const isJotform =
origin.endsWith("jotform.com") ||
origin.endsWith("jotform.us") ||
origin.endsWith("jotformeu.com") ||
origin.endsWith("jotform.net");

if (!isJotform) return;

// Jotform sends various messages; look for completion/thankyou cues
// Common patterns seen in embeds include "submission-completed" or "form-submit-successful"
// To be resilient, match a few possibilities:
const data = typeof e.data === "string" ? e.data : JSON.stringify(e.data);

const looksDone =
data.includes("submission") && data.includes("complete") ||
data.includes("form-submit") && data.includes("success") ||
data.includes("thankyou") ||
data.includes("submission-completed");

if (looksDone) {
// Promote redirect to the top window
// (If Jotform thank-you already set to /dashboard?done=1, this is idempotent.)
window.top!.location.replace("/dashboard?done=1");
}
}

window.addEventListener("message", onMessage);
return () => window.removeEventListener("message", onMessage);
}, []);

return null;
}
