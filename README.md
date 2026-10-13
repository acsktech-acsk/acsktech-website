# ACSKTech website — clean responsive build

This folder contains the six-page static website and a Cloudflare Pages Function for contact/feedback email delivery.

## Pages
- `index.html` — Home
- `services.html` — Services
- `values.html` — Core Values
- `clients.html` — Esteemed Clients & Partnerships
- `feedback.html` — Feedback form
- `contact.html` — Contact/enquiry form

## Why the layout is corrected
- The header uses a properly cropped square icon rather than the full wordmark image.
- The hero uses CSS artwork only, so a large logo image cannot overlap the headline.
- Navigation and card grids have responsive breakpoints; a working mobile menu is included.
- All pages share the same header, footer, spacing system and styles.

## Publish on Cloudflare Pages
1. Extract this ZIP and upload/commit the files at the root of the GitHub repository. The `functions/` directory must be at the repository root beside `index.html`.
2. In Cloudflare Pages, make sure the project is connected to that repository and its production branch is the branch you deploy.
3. Trigger a new deployment and wait for the deployment to complete before testing the production domain.
4. Keep `acsktech.in` connected to the existing Pages project. Do not delete or replace existing DNS records unless you have confirmed the correct Pages target.

## Enable email delivery (required for automatic email)
The form uses the Pages Function route `/api/contact`. It sends email using Resend. The static pages can be deployed without these settings, but automatic email will return a helpful configuration message until these steps are complete.

1. Create/sign in to a Resend account.
2. Verify a sending domain you control in Resend (recommended: `acsktech.in`) by adding the exact DNS records Resend provides. Do not guess the DNS records; copy them from Resend.
3. Create a Resend API key.
4. In Cloudflare Dashboard → Workers & Pages → your Pages project → Settings → Variables and Secrets, add these **secrets/variables for Production**:
   - `RESEND_API_KEY` — secret, the Resend API key
   - `CONTACT_TO_EMAIL` — `acsktech@gmail.com`
   - `CONTACT_FROM_EMAIL` — a sender on the verified domain, for example `ACSKTech Website <website@acsktech.in>`
5. If you use a separate Preview environment, configure the same variables there with suitable test values.
6. Redeploy after adding/changing the variables, then submit a real test enquiry and confirm it arrives in Gmail. Check Spam and the Resend email logs if needed.

**Important:** Never put `RESEND_API_KEY` in `script.js`, HTML, a public repository, or any client-side file. Only add it as a Cloudflare secret. Email delivery cannot be fully activated from a ZIP alone because the private API key and sender-domain verification belong to your accounts.

## Suggested subdomains (optional)
- `staging.acsktech.in` — test changes separately before production.
- `portal.acsktech.in` — reserve for a future client portal.

Create/configure these only after you decide what should serve them. For a staging copy, create a separate Cloudflare Pages project or use a dedicated preview branch/domain. For a future portal, point it to the actual portal service when it exists. Do not point both names at production unless that is intentional.

## Smoke test checklist
- Open each of the six pages on desktop and mobile.
- Check the logo, nav links, CTA buttons and footer links.
- Open the mobile menu and navigate to another page.
- Submit the contact form with valid details and check for the success message and received email.
- Submit an invalid email to confirm browser validation.
- Repeat with the feedback form.
- Confirm the deployed `https://acsktech.in` and `https://www.acsktech.in` behavior in Cloudflare Pages/custom-domain settings.
