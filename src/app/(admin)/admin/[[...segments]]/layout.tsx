import configPromise from "@payload-config";
import { handleServerFunctions, RootLayout } from "@payloadcms/next/layouts";
import "@payloadcms/next/css";
import type { ServerFunctionClientArgs } from "payload";
import type { ReactNode } from "react";

import { importMap } from "./importMap";

async function serverFunction(args: ServerFunctionClientArgs) {
  "use server";

  return handleServerFunctions({
    ...args,
    config: configPromise,
    importMap,
  });
}

export default async function AdminLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ segments: string[] }>;
}) {
  return (
    <RootLayout
      config={configPromise}
      importMap={importMap}
      serverFunction={serverFunction}
      params={params}
    >
      {children}
    </RootLayout>
  );
}
