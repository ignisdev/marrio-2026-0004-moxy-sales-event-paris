import configPromise from "@payload-config";
import { generatePageMetadata, RootPage } from "@payloadcms/next/views";

import { importMap } from "./importMap";

type Args = {
  params: Promise<{ segments?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// A trailing slash on /admin (or a /admin/ redirect target) makes Next match the
// catch-all with segments:[""] rather than []. Payload renders [""] as an unknown
// route and bounces to login, producing a post-login redirect loop. Dropping empty
// segments collapses /admin/ back to the dashboard index.
const normalizeParams = (params: Args["params"]): Promise<{ segments: string[] }> =>
  params.then(({ segments }) => ({ segments: (segments ?? []).filter(Boolean) }));

const normalizeSearchParams = (
  searchParams: Args["searchParams"],
): Promise<Record<string, string | string[]>> =>
  searchParams.then((resolved) =>
    Object.fromEntries(
      Object.entries(resolved).filter(([, value]) => value !== undefined),
    ) as Record<string, string | string[]>,
  );

export const generateMetadata = async ({ params, searchParams }: Args) => {
  return generatePageMetadata({
    config: configPromise,
    params: normalizeParams(params),
    searchParams: normalizeSearchParams(searchParams),
  });
}

export default async function AdminPage({ params, searchParams }: Args) {
  return RootPage({
    config: configPromise,
    importMap,
    params: normalizeParams(params),
    searchParams: normalizeSearchParams(searchParams),
  });
}
