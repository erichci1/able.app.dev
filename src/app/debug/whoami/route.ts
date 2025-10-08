// File: src/app/debug/whoami/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET() {
    const h = await headers();
    const host = h.get("host");
    const proto = h.get("x-forwarded-proto");
    const envBase = process.env.NEXT_PUBLIC_SITE_URL;
    return NextResponse.json({ host, proto, NEXT_PUBLIC_SITE_URL: envBase });
}