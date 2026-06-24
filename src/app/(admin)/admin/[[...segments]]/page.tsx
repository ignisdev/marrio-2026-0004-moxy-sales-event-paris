import configPromise from "@payload-config";
import { generatePageMetadata, RootPage } from "@payloadcms/next/views";

import { importMap } from "./importMap";

type Args = {
  params: Promise<{ segments?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const normalizeParams = (params: Args["params"]): Promise<{ segments: string[] }> =>
  params.then(({ segments }) => ({ segments: segments ?? [] }));

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
