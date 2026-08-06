/**
 * Placeholder legal/support links — replace before submitting to the App
 * Store. App Store Connect requires a working Privacy Policy URL, and a
 * Support URL is required for every listing. Draft content for each of
 * these lives in docs/app-store/ (PRIVACY_POLICY.md, TERMS_OF_USE.md,
 * SUPPORT.md, DATA_DELETION.md) — host it, then update the URLs below.
 *
 * These are intentionally *not* silently swapped for a real-looking but
 * fake domain: an unreplaced placeholder should be obviously a placeholder,
 * not something that quietly ships pointing at a dead link.
 */
export const LEGAL_LINKS = {
  /** REQUIRED before App Store submission — App Store Connect will not
   *  accept a listing without a working privacy policy URL. */
  privacyPolicyUrl: 'https://REPLACE-ME.example.com/privacy',
  /** REQUIRED before App Store submission. */
  supportUrl: 'https://REPLACE-ME.example.com/support',
  /** Optional — only needed if you want a marketing page distinct from support. */
  marketingUrl: 'https://REPLACE-ME.example.com',
  /** Optional — only required if the app has terms beyond the default EULA. */
  termsOfUseUrl: 'https://REPLACE-ME.example.com/terms',
} as const;

export const LEGAL_LINKS_ARE_PLACEHOLDERS = Object.values(LEGAL_LINKS).some((url) =>
  url.includes('REPLACE-ME')
);
