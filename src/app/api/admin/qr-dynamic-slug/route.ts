import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getPayloadClient } from "@/lib/payload";
import { buildQrDynamicUrl, generateUniqueQrDynamicSlug } from "@/lib/qrDynamicSlug";

export async function POST() {
  const payload = await getPayloadClient();
  const headerList = await headers();
  const { user } = await payload.auth({ headers: headerList });

  if (!user) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const slug = await generateUniqueQrDynamicSlug(payload);

  return NextResponse.json({ slug, url: buildQrDynamicUrl(slug) });
}
