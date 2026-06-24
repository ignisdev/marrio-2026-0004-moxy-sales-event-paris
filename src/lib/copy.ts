import type { Locale } from "../config/locales.ts";

/**
 * Every piece of user-facing copy in the guest experience. All of it is editable
 * in the CMS via the `site-copy` global (localized per locale). The values here
 * are the baked-in defaults / fallback used when the global is missing a value,
 * so the app always renders sensible text even before the CMS is seeded.
 *
 * Multi-line fields use "\n" to mark hard line breaks. Heading fields use one
 * line per row of the Moxy HeadingBox. Use `toLines()` to split either.
 */
export type SiteCopy = {
  // Moxy HeadingBox titles — one line per row.
  headingArtHunter: string;
  headingHowToPlay: string;
  headingPixelPerfect: string;
  headingRegister: string;

  // Landing / "Play" intro.
  landingIntro: string;
  landingPlayOn: string;
  landingRegisterCta: string;

  // How-to-play steps.
  step1: string;
  step2: string;
  step3: string;
  step4: string;

  // Register form.
  registerPrompt: string;
  registerNamePlaceholder: string;
  registerPhonePlaceholder: string;
  registerEmailPlaceholder: string;
  registerTerms: string;
  registerTermsLink: string;
  registerSubmit: string;
  registerError: string;

  // Gallery.
  galleryTitle: string;
  galleryYouHaveFound: string;
  galleryScanArtwork: string;
  galleryTapToOpen: string;

  // Gallery completion takeover.
  completeCongrats: string;
  completeGallery: string;
  completeClaim: string;
  completeBack: string;

  // Header / account menu.
  navYourGallery: string;
  navAccount: string;
  navRegister: string;
  navSignIn: string;

  // In-app scanner.
  scannerStartLabel: string;
  scannerFound: string;
  scannerGoToGallery: string;
  scannerUnlocked: string;
  scannerOpening: string;
  scannerStop: string;
  scannerSaving: string;
  scannerCameraDenied: string;
  revealPlay: string;
  revealTapForSound: string;

  // Login.
  loginHeading: string;
  loginPrompt: string;
  loginEmailPlaceholder: string;
  loginContinue: string;
  loginNewHere: string;
  loginRegisterLink: string;
  loginNotFound: string;

  // Public progress / shareable link.
  shareCopied: string;
  shareCopyHint: string;

  // Shared.
  networkError: string;
  lockedArtworkAlt: string;

  // /complete route page.
  rewardEligible: string;
  completeTitle: string;
  completeVerifyNote: string;
  completeViewGallery: string;
};

export const SITE_COPY_GLOBAL_SLUG = "site-copy";

export const DEFAULT_COPY: Record<Locale, SiteCopy> = {
  en: {
    headingArtHunter: "THE\nART\nHUNTER",
    headingHowToPlay: "HOW\nTO\nPLAY",
    headingPixelPerfect: "PIXEL\nPERFECT!",
    headingRegister: "You're\nSO\nMOXY",

    landingIntro: "Can you hunt down all 5\npixelated artworks\nhidden around the Moxy?",
    landingPlayOn: "Play On",
    landingRegisterCta: "Register",

    step1: "Register your name",
    step2: "Locate the artworks",
    step3: "Scan the QR codes to\nreveal the unexpected",
    step4: "Complete the Moxy\nGallery to receive\nyour reward!",

    registerPrompt: "Register your name",
    registerNamePlaceholder: "Name",
    registerPhonePlaceholder: "Phone number",
    registerEmailPlaceholder: "Email",
    registerTerms: "I agree to and understand the terms & conditions",
    registerTermsLink: "Terms & Conditions",
    registerSubmit: "Submit",
    registerError: "Registration failed. Please check your details and try again.",

    galleryTitle: "The Gallery",
    galleryYouHaveFound: "YOU HAVE FOUND",
    galleryScanArtwork: "Scan Artwork",
    galleryTapToOpen: "Tap to open camera",

    completeCongrats: "Congratulations!",
    completeGallery: "You've completed\nthe gallery!",
    completeClaim: "Locate your Moxy brand ambassador\nto claim your reward.",
    completeBack: "Back to gallery",

    navYourGallery: "Your gallery",
    navAccount: "Account",
    navRegister: "Register",
    navSignIn: "Sign in",

    scannerStartLabel: "Start scanning",
    scannerFound: "Found an artwork?\nScan the QR code and\nreveal the unexpected",
    scannerGoToGallery: "Go to gallery",
    scannerUnlocked: "Artwork unlocked",
    scannerOpening: "Opening artwork…",
    scannerStop: "Stop",
    scannerSaving: "Saving scan…",
    scannerCameraDenied: "Camera permission denied.",
    revealPlay: "Play",
    revealTapForSound: "Tap for sound",

    loginHeading: "Welcome\nBACK",
    loginPrompt: "Enter your email to continue",
    loginEmailPlaceholder: "Email",
    loginContinue: "Continue",
    loginNewHere: "New here?",
    loginRegisterLink: "Register",
    loginNotFound: "No registration found. Please register first.",

    shareCopied: "Copied!",
    shareCopyHint: "Tap to copy your link",

    networkError: "Network error. Please check your connection.",
    lockedArtworkAlt: "Locked artwork",

    rewardEligible: "Reward eligible",
    completeTitle: "Gallery complete",
    completeVerifyNote:
      "Completion and reward eligibility will be verified server-side from scan data.",
    completeViewGallery: "View gallery",
  },
  fr: {
    headingArtHunter: "LE\nCHASSEUR\nD’ART",
    headingHowToPlay: "COMMENT\nJOUER ?",
    headingPixelPerfect: "PIXEL\nPERFECT !",
    headingRegister: "You're\nSO\nMOXY",

    landingIntro: "Sauras-tu retrouver\nles 5 œuvres pixélisées\ncachées au Moxy ?",
    landingPlayOn: "Continuer",
    landingRegisterCta: "S’inscrire",

    step1: "Tape ton nom",
    step2: "Trouve les œuvres",
    step3: "Scanne les QR codes et\ndécouvre ce qu’ils cachent",
    step4: "Complète la galerie Moxy\npour gagner ta récompense !",

    registerPrompt: "Tape ton nom",
    registerNamePlaceholder: "Nom",
    registerPhonePlaceholder: "Téléphone",
    registerEmailPlaceholder: "E-mail",
    registerTerms: "J’accepte et je comprends les conditions générales",
    registerTermsLink: "Conditions générales",
    registerSubmit: "Valider",
    registerError: "Échec de l’inscription. Vérifie tes informations et réessaie.",

    galleryTitle: "La Galerie",
    galleryYouHaveFound: "TU EN AS TROUVÉ",
    galleryScanArtwork: "Scanne une œuvre",
    galleryTapToOpen: "Touche pour ouvrir l’appareil photo",

    completeCongrats: "Félicitations !",
    completeGallery: "Tu as complété\nla galerie.",
    completeClaim: "Retrouve ton ambassadeur Moxy\npour récupérer ta récompense.",
    completeBack: "Retour à la galerie",

    navYourGallery: "Ta galerie",
    navAccount: "Compte",
    navRegister: "S’inscrire",
    navSignIn: "Se connecter",

    scannerStartLabel: "Lancer le scan",
    scannerFound: "Tu as trouvé une œuvre ?\nScanne le QR code et\ndécouvre ce qu’il cache",
    scannerGoToGallery: "Accéder à la galerie",
    scannerUnlocked: "Œuvre débloquée",
    scannerOpening: "Ouverture de l’œuvre…",
    scannerStop: "Arrêter",
    scannerSaving: "Enregistrement du scan…",
    scannerCameraDenied: "Accès à la caméra refusé.",
    revealPlay: "Lecture",
    revealTapForSound: "Touche pour le son",

    loginHeading: "Bon\nRETOUR",
    loginPrompt: "Entre ton e-mail pour continuer",
    loginEmailPlaceholder: "E-mail",
    loginContinue: "Continuer",
    loginNewHere: "Nouveau ici ?",
    loginRegisterLink: "S’inscrire",
    loginNotFound: "Aucune inscription trouvée. Inscris-toi d’abord.",

    shareCopied: "Copié !",
    shareCopyHint: "Touchez pour copier votre lien",

    networkError: "Erreur réseau. Vérifie ta connexion.",
    lockedArtworkAlt: "Œuvre verrouillée",

    rewardEligible: "Récompense éligible",
    completeTitle: "Galerie terminée",
    completeVerifyNote:
      "La complétion et l’éligibilité à la récompense seront vérifiées côté serveur à partir des données de scan.",
    completeViewGallery: "Voir la galerie",
  },
};

/** Ordered list of copy keys — single source of truth for the CMS schema + seed. */
export const COPY_KEYS = Object.keys(DEFAULT_COPY.en) as (keyof SiteCopy)[];

/** Split a multi-line / heading copy value into its individual lines. */
export function toLines(value: string): string[] {
  return value.split("\n");
}

/**
 * Overlay CMS values onto the defaults: a CMS value wins only when it is a
 * non-empty string, so a blank/missing field falls back to the default copy.
 */
export function mergeCopy(
  defaults: SiteCopy,
  overrides: Partial<Record<keyof SiteCopy, unknown>> | null | undefined,
): SiteCopy {
  if (!overrides) {
    return defaults;
  }
  const result = { ...defaults };
  for (const key of COPY_KEYS) {
    const value = overrides[key];
    if (typeof value === "string" && value.trim() !== "") {
      result[key] = value;
    }
  }
  return result;
}
