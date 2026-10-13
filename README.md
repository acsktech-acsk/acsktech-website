# ACSKTech 6-Page Website

Static HTML/CSS/JavaScript website for ACSKTech Salesforce Consultancy Services.

## Pages
1. Home (`index.html`)
2. Services (`services.html`)
3. Core Values (`values.html`)
4. Esteemed Clients (`clients.html`)
5. Feedback (`feedback.html`)
6. Contact (`contact.html`)

## Contact form setup (Cloudflare Pages + Resend)

The contact form now posts to the Cloudflare Pages Function at `/api/contact`. It will **not send email until the environment variables and sender domain are configured**.

1. Create/sign in to Resend at https://resend.com/.
2. Add and verify the sending domain `acsktech.in` in Resend. Add the exact DNS records Resend shows to the authoritative DNS provider for your domain. Do not delete or replace existing website or mail records.
3. In Cloudflare, open **Workers & Pages → your Pages project → Settings → Variables and Secrets** (wording may vary).
4. Add these variables for **Production**:
   - `RESEND_API_KEY` — create this as a **secret**, not a plain-text variable.
   - `CONTACT_TO_EMAIL` — `acsktech@gmail.com`
   - `CONTACT_FROM_EMAIL` — `ACSKTech Website <website@acsktech.in>` (use a sender address on the verified domain).
5. Add the same variables to **Preview** only if you want the form to send from preview deployments. Prefer leaving email disabled on previews to avoid test submissions.
6. Trigger a new deployment after adding the variables.
7. Test the form on `https://acsktech.in/contact` with a real test enquiry. Confirm it arrives in Gmail and check Spam/Promotions if necessary.

Never place the Resend API key in `script.js`, HTML, or any publicly accessible file. The function validates inputs, limits payload size, includes a basic honeypot, and replies with a success/error message. This is basic spam mitigation, not a full CAPTCHA or rate-limit system.

Until the Resend setup is complete, the form intentionally displays a configuration/error message and offers the direct email fallback. Do not treat a successful browser-side submit as proof of email delivery; verify receipt in Gmail.

## Cloudflare Pages deployment

This project uses a root-level static site and a Pages Function. In your existing Cloudflare Pages project:
- Framework preset: **None**
- Build command: leave blank
- Build output directory: `/` or the project root as supported by the Pages setup
- Ensure `functions/api/contact.js` is included in the repository root.

Commit/push these files to the connected GitHub branch, then wait for the Pages deployment to complete. Test the production domain after deployment.

## Subdomains (configure in Cloudflare Pages; not configured automatically by these files)

Keep `acsktech.in` as production.

### `staging.acsktech.in`
Recommended: create a `staging` branch in GitHub and configure a Pages preview deployment for that branch. In the Pages project, open **Custom domains** and add `staging.acsktech.in` to the branch/preview deployment if the dashboard offers branch-specific custom domains. Follow the exact DNS instructions Cloudflare displays. If branch-specific domains are not available in your setup, create a separate Pages project connected to the `staging` branch instead.

### `portal.acsktech.in`
Reserve this for a future portal. Do not point it at the production site unless that is the intended experience. When ready, create a separate app/Pages project for the portal, add `portal.acsktech.in` as its custom domain, and apply the DNS records Cloudflare instructs you to add.

Important: add custom domains through **Workers & Pages → your project → Custom domains** as well as following the DNS setup. A DNS record by itself may not activate a Cloudflare Pages custom domain. Preserve all existing MX/TXT mail records.

## Logo and branding
- `acsktech-logo.jpeg` is the supplied full logo.
- `acsktech-logo-mark.jpg` is a cropped mark used in the site navigation and favicon.
- Client names and testimonials should only be published once approved for public use.

## Domain
The existing `CNAME` file contains `acsktech.in`. Keep it only if your deployment workflow requires it; Cloudflare Pages custom-domain configuration is managed in the Cloudflare dashboard.
