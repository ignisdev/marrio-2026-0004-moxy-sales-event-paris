"use client";

import { createContext, Fragment, type ReactNode, useContext } from "react";

import { DEFAULT_COPY, type SiteCopy, toLines } from "@/lib/copy";

const CopyContext = createContext<SiteCopy>(DEFAULT_COPY.en);

/**
 * Supplies the resolved (CMS + fallback) site copy to all guest client
 * components. Fetched once on the server in the locale layout and passed down,
 * so client components read copy without their own data fetching.
 */
export function CopyProvider({
  value,
  children,
}: {
  value: SiteCopy;
  children: ReactNode;
}) {
  return <CopyContext.Provider value={value}>{children}</CopyContext.Provider>;
}

/** Read the full site copy object in a client component. */
export function useCopy(): SiteCopy {
  return useContext(CopyContext);
}

/**
 * Render a multi-line copy value, converting "\n" into hard <br /> breaks so
 * multi-line strings lay out exactly as authored in the CMS.
 */
export function Multiline({ text }: { text: string }) {
  return (
    <>
      {toLines(text).map((line, index) => (
        <Fragment key={index}>
          {index > 0 ? <br /> : null}
          {line}
        </Fragment>
      ))}
    </>
  );
}
