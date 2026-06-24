import configPromise from "@payload-config";
import { generatePageMetadata, RootPage } from "@payloadcms/next/views";

import { importMap } from "./importMap";

type Args = {
  params: Promise<{ segments: string[] }>;
  searchParams: Promise<Record<string, string | string[]>>;
};

export const generateMetadata = async ({ params, searchParams }: Args) => {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  return generatePageMetadata({ config: configPromise, params: resolvedParams, searchParams: resolvedSearchParams });
}

export default async function AdminPage({ params, searchParams }: Args) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  return RootPage({
    config: configPromise,
    importMap,
    params: resolvedParams,
    searchParams: resolvedSearchParams,
  });
}
