"use client";

import { useEffect } from "react";

export default function TakeAssessmentRedirectBridge() {
    useEffect(() => {
        // Redirect parent window to dashboard after form submit
        if (typeof window !== "undefined" && window.top) {
            const search = new URLSearchParams(window.location.search);
            const done = search.get("done");
            if (done === "1") {
                window.top.location.href = "/dashboard?done=1";
            }
        }
    }, []);

    return null;
}