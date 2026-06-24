import { redirect } from "next/navigation";

export default async function PublicProgressNoLocalePage({
  params,
}: {
  params: Promise<{ uid: string }>;
}) {
  const { uid } = await params;
  redirect(`/en/u/${uid}`);
}
