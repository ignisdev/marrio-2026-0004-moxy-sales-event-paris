import { NextResponse } from "next/server";

export function POST() {
  return NextResponse.json(
    {
      message: "Upload URL API scaffolded. Admin auth and S3 presigning are next.",
    },
    { status: 202 },
  );
}
