import { NextResponse } from "next/server";
import configPromise from "@payload-config";
import { getPayload } from "payload";

import { loginSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ errors: parsed.error.flatten() }, { status: 400 });
    }

    const payload = await getPayload({ config: configPromise });
    const result = await payload.find({
      collection: "participants",
      limit: 1,
      where: { email: { equals: parsed.data.email } },
    });

    const participant = result.docs[0];

    if (!participant) {
      return NextResponse.json(
        { message: "No registration found for that email." },
        { status: 404 },
      );
    }

    const response = NextResponse.json({ participant: { uid: participant.uid } }, { status: 200 });

    response.cookies.set("moxyParticipantUid", participant.uid, {
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 90,
      path: "/",
      sameSite: "lax",
      secure: request.url.startsWith("https://"),
    });

    return response;
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ message }, { status: 500 });
  }
}