// src/app/debug/whoami/route.ts
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    const h = await headers();
    return NextResponse.json({
        host: h.get("host"),
        proto: h.get("x-forwarded-proto"),
        NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    });
}