import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { license_key } = await req.json();

    if (!license_key) {
      return NextResponse.json({ valid: false, error: "No license key provided" });
    }

    const res = await fetch("https://api.gumroad.com/v2/licenses/verify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        product_permalink: "clawconfig",
        license_key: license_key,
      }),
    });

    const data = await res.json();

    return NextResponse.json({
      valid: data.success === true,
      uses: data.uses,
    });
  } catch {
    return NextResponse.json({ valid: false, error: "Verification failed" }, { status: 500 });
  }
}
