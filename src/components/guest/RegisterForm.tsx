"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/Button";
import { defaultEventSlug } from "@/config/constants";
import { type Locale } from "@/config/locales";
import { useCopy } from "@/components/guest/CopyProvider";
import { guestRoutes } from "@/config/routes";
import { setParticipantSession } from "@/config/storage";

type RegisterFormProps = {
  locale: Locale;
};

type RegisterResponse = {
  errors?: unknown;
  message?: string;
  participant?: {
    uid: string;
  };
};

// Full-radius input to match the pill buttons. Knockout face, uppercase — the
// uppercase + font apply to both typed text and the placeholder.
const inputClass =
  "h-[clamp(2rem,4.98dvh,2.5rem)] w-full rounded-full border-2 border-black bg-white px-[clamp(0.75rem,2.07dvh,1.25rem)] text-[clamp(0.75rem,1.66dvh,1rem)] uppercase text-black font-[family-name:var(--font-title)] placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-[#8c0980]/50";

export function RegisterForm({ locale }: RegisterFormProps) {
  const copy = useCopy();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/register", {
        body: JSON.stringify({
          name: String(formData.get("name") || "").trim(),
          eventSlug: searchParams.get("event") || defaultEventSlug,
          preferredLocale: locale,
          termsAccepted: formData.get("termsAccepted") === "on",
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      const result = (await response.json()) as RegisterResponse;

      if (!response.ok || !result.participant?.uid) {
        setError(result.message || copy.registerError);
        setIsSubmitting(false);
        return;
      }

      const eventSlug = searchParams.get("event") || defaultEventSlug;
      setParticipantSession(result.participant.uid, eventSlug);

      // Resume an in-flight scan if the user was sent here from a QR deep-link;
      // otherwise go straight to the gallery to start the quest.
      const resumeQr = searchParams.get("qr");
      router.push(
        resumeQr
          ? `${guestRoutes.scanner(locale)}?qr=${encodeURIComponent(resumeQr)}`
          : guestRoutes.gallery(locale),
      );
    } catch {
      setError(copy.networkError);
      setIsSubmitting(false);
    }
  }

  return (
    <form className="w-full w-full max-w-[298px] mx-auto flex flex-col justify-between h-full" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-[clamp(1rem,4.77dvh,46px)]">
        <p className="text-center text-base uppercase pt-4 leading-none text-white font-[family-name:var(--font-title)]">
          {copy.registerPrompt}
        </p>
        <div className="space-y-[clamp(0.25rem,0.83dvh,0.5rem)]">
          <input
            aria-label={copy.registerNamePlaceholder}
            className={inputClass}
            name="name"
            placeholder={copy.registerNamePlaceholder}
            required
            type="text"
          />
        </div>
        <label className="flex items-center gap-2 px-2 text-white">
          <input
            className="h-[clamp(1rem,2.07dvh,1.25rem)] w-[clamp(1rem,2.07dvh,1.25rem)] shrink-0 appearance-none rounded-full border-2 border-black bg-white checked:border-[#8c0980] checked:bg-[#8c0980] focus:outline-none focus:ring-2 focus:ring-[#8c0980]/50"
            name="termsAccepted"
            required
            type="checkbox"
          />
          <span className="whitespace-nowrap text-[8px] uppercase font-[family-name:var(--font-body-semibold)]">
            {copy.registerTerms}
          </span>
        </label>
        {error ? (
          <p className="rounded-md border border-red-400/50 bg-red-500/10 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col items-center gap-[clamp(0.75rem,2.07dvh,20px)]">
        <Button disabled={isSubmitting} type="submit">
          {isSubmitting ? "..." : copy.registerSubmit}
        </Button>
        <a
          href="/terms"
          className="text-white uppercase text-[0.75rem] font-[family-name:var(--font-title)] underline-offset-2 hover:underline"
        >
          {copy.registerTermsLink}
        </a>
      </div>
    </form>
  );
}
