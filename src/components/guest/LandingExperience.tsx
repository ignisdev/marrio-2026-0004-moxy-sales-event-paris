"use client";

import { type ReactNode, useState } from "react";

import { Multiline, useCopy } from "@/components/guest/CopyProvider";
import { HeadingBox } from "@/components/guest/HeadingBox";
import { Reveal } from "@/components/guest/Reveal";
import { Button, LinkButton } from "@/components/ui/Button";
import { defaultEventSlug } from "@/config/constants";
import { type Locale } from "@/config/locales";
import { guestRoutes } from "@/config/routes";
import { toLines } from "@/lib/copy";

/**
 * The landing experience: a "Play" intro that swaps to a "How to play" panel
 * (same three-row Moxy header) when Play is tapped, then on to registration.
 */
export function LandingExperience({ locale }: { locale: Locale }) {
  const copy = useCopy();
  const [section, setSection] = useState<"play" | "howToPlay">("play");
  const registerHref = `${guestRoutes.register(locale)}?event=${defaultEventSlug}`;

  const howToPlaySteps: ReactNode[] = [
    copy.step1,
    copy.step2,
    <Multiline key="step3" text={copy.step3} />,
    <Multiline key="step4" text={copy.step4} />,
  ];

  const headingRows = toLines(copy.headingArtHunter);

  return (
    <Reveal className="flex flex-1 flex-col" key={section}>
      {section === "play" ? (
        <div className="flex flex-1 flex-col text-center">
          <div className="pt-[10.58dvh]">
            <div className="mx-auto w-[79.46%]">
              <HeadingBox rows={headingRows} />
            </div>
          </div>
          <div className="flex-1" />
          <div className="-mx-5 -mb-5 aspect-[448/324] bg-black px-5 py-[clamp(1rem,3dvh,1.5rem)] text-center flex flex-col items-center justify-evenly">
            <div className="max-w-[280px] mx-auto space-y-4 text-[1.2rem] font-normal leading-1 font-[family-name:var(--font-title)] uppercase">
              {toLines(copy.landingIntro).map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
            <Button onClick={() => setSection("howToPlay")} type="button">
              {copy.landingPlayOn}
            </Button>
          </div>
        </div>
      ) : (
        <div className="relative flex flex-1 flex-col text-center">
          <div className="relative z-10 pt-[10.58dvh]">
            <div className="mx-auto w-[79.46%]">
              <HeadingBox rows={toLines(copy.headingHowToPlay)} highlightLast="char" />
            </div>
          </div>
          <div className="absolute -bottom-5 -left-5 -right-5 h-[63.28dvh] bg-black px-5 pt-[clamp(3rem,9.54dvh,92px)] pb-[clamp(1.5rem,4.77dvh,46px)] flex flex-col items-center overflow-y-auto">
            <div className="mx-auto w-[62.5%] font-[family-name:var(--font-body-normal)]">
              {howToPlaySteps.map((step, index) => (
                <div
                  key={index}
                  className="flex items-center gap-[1.66dvh] border-t border-[#8c0980] py-[1.66dvh] last:border-b"
                >
                  <div className="flex h-[5.19dvh] w-[5.19dvh] flex-shrink-0 items-center justify-center rounded-full bg-[#8c0980] text-white text-[2.07dvh] font-bold font-[family-name:var(--font-title)]">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <span className="text-left text-white leading-none uppercase font-[family-name:var(--font-title)] [font-size:clamp(0.875rem,2.32dvh,1.4rem)]">
                    {step}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-[clamp(2rem,6.43dvh,62px)]">
              <LinkButton href={registerHref}>{copy.landingRegisterCta}</LinkButton>
            </div>
          </div>
        </div>
      )}
    </Reveal>
  );
}
