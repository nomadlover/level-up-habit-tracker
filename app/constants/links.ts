/**
 * LEVEL UP - Legal & Compliance Configuration Constants
 * 
 * Update these URLs with your hosted privacy policy and terms before 
 * publishing your production build to the Google Play Console.
 */

// Host this on GitHub Pages, Vercel, Notion, or your custom domain
export const PRIVACY_POLICY_URL = process.env.NEXT_PUBLIC_PRIVACY_POLICY_URL || 'https://levelup.app/privacy';

// Terms of Service URL
export const TERMS_OF_SERVICE_URL = process.env.NEXT_PUBLIC_TERMS_OF_SERVICE_URL || 'https://levelup.app/terms';

// App Store / Play Store Version Details
export const APP_VERSION = '1.0.0-beta.1';
export const BUILD_NUMBER = '1';

// Play Store Developer & In-App Support Email (defaults to verified owner support email)
export const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'anandshivam1209@gmail.com';

// Beta Feedback Portal: Uses custom form URL if configured, otherwise falls back to pre-formatted email report
export const FEEDBACK_URL = process.env.NEXT_PUBLIC_FEEDBACK_URL ||
  `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`[LEVEL UP Beta Feedback] v${APP_VERSION}`)}&body=${encodeURIComponent(
`--- LEVEL UP BETA FEEDBACK REPORT ---
Type: [Bug Report / Feature Suggestion / Feedback]

Summary:
[Brief description of what happened or what you suggest]

Steps to Reproduce (if bug):
1. [First Step]
2. [Second Step]
3. [Third Step]

Observed Behavior:
[What actually happened]

Expected Behavior:
[What you expected to happen]

Device & Android / OS Version:
[e.g. Android 14 / Pixel 7 / Web]

App Version:
LEVEL UP v${APP_VERSION} (Build ${BUILD_NUMBER})
-------------------------------------`
  )}`;
