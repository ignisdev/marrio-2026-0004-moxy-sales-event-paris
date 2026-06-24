"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { useCopy } from "@/components/guest/CopyProvider";
import { Button } from "@/components/ui/Button";
import { defaultEventSlug } from "@/config/constants";
import { type Locale } from "@/config/locales";
import { guestRoutes } from "@/config/routes";
import { setParticipantSession } from "@/config/storage";

const inputClass =
  "h-10 w-full rounded-full border-2 border-black bg-white px-5 text-base uppercase text-black font-[family-name:var(--font-title)] placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-[#8c0980]/50";

type LoginResponse = {
  message?: string;
  participant?: { uid: string };
};

export function LoginForm({ locale }: { locale: Locale }) {
  const copy = useCopy();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/login", {
        body: JSON.stringify({ email: String(formData.get("email") || "").trim() }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      const result = (await response.json()) as LoginResponse;

      if (!response.ok || !result.participant?.uid) {
        setError(result.message || copy.loginNotFound);
        setIsSubmitting(false);
        return;
      }

      setParticipantSession(result.participant.uid, defaultEventSlug);
      router.push(guestRoutes.gallery(locale));
    } catch {
      setError(copy.networkError);
      setIsSubmitting(false);
    }
  }

  return (
    <form className="mx-auto w-full max-w-[298px] space-y-2 text-left" onSubmit={handleSubmit}>
      <input
        aria-label={copy.loginEmailPlaceholder}
        className={inputClass}
        name="email"
        placeholder={copy.loginEmailPlaceholder}
        required
        type="email"
      />
      {error ? (
        <p className="rounded-md border border-red-400/50 bg-red-500/10 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      <div className="flex justify-center pt-2">
        <Button disabled={isSubmitting} type="submit">
          {isSubmitting ? "..." : copy.loginContinue}
        </Button>
      </div>
    </form>
  );
}
