import { NextResponse } from "next/server";
import configPromise from "@payload-config";
import { nanoid } from "nanoid";
import { getPayload } from "payload";

import { registerSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ errors: parsed.error.flatten() }, { status: 400 });
    }

    const payload = await getPayload({ config: configPromise });
    const { eventSlug, name, ...registration } = parsed.data;
    const eventResult = await payload.find({
      collection: "events",
      limit: 1,
      where: {
        slug: {
          equals: eventSlug,
        },
      },
    });
    const event = eventResult.docs[0];

    if (!event) {
      return NextResponse.json({ message: "Event not found." }, { status: 404 });
    }

    const participant = await payload.create({
      collection: "participants",
      data: {
        ...registration,
        displayName: name,
        event: event.id,
        firstName: name,
        registeredAt: new Date().toISOString(),
        uid: nanoid(10),
      },
    });

    const response = NextResponse.json(
      {
        participant: {
          id: participant.id,
          uid: participant.uid,
        },
      },
      { status: 201 },
    );

    // Persist a durable session so returning visitors are not asked to
    // register again. Readable client-side; the uid is a public-safe token.
    response.cookies.set("moxyParticipantUid", participant.uid, {
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 90,
      path: "/",
      sameSite: "lax",
      secure: request.url.startsWith("https://"),
    });

    return response;
  } catch (error) {
    console.error("REGISTRATION ERROR:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
