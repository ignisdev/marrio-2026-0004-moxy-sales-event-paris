import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ uid: string }> },
) {
  const { uid } = await params;

  return NextResponse.json({
    artworks: [],
    collected: 0,
    displayName: null,
    eventTitle: "Moxy Hotels - The Art Hunter",
    isComplete: false,
    required: 5,
    uid,
  });
}
