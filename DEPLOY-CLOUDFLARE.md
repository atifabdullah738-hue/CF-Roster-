# Deploy to Cloudflare Pages (free plan) — beginner guide

Nothing here has been done for you: **no site has been published, no DNS changed, and nothing was merged.** Follow the steps when you are ready.
(The Cloudflare dashboard changes its wording from time to time; if a label differs slightly, pick the closest one.)

## What this project is
- Framework: **Astro 7**, fully **static** (HTML/CSS/JS + images). No server code, no database, no paid APIs.
- Needs **Node.js 22.12 or newer** while *building* (Cloudflare does the build; you don't install anything).
- Build command: `npm run build`  ·  Output directory: `dist`  ·  Root directory: `/` (repository root).

## Before you start (5 minutes)
1. A free **Cloudflare account** (https://dash.cloudflare.com/sign-up).
2. Your GitHub repository `atifabdullah738-hue/CF-Roster-` (already contains the website on branch `claude/youthful-hamilton-4qkcsl`).
3. **Important — which branch:** the website lives on the branch above, **not** on `main` (`main` still holds the old roster page and has no `package.json`, so a build from `main` would fail).
   Either (a) choose that branch as the *production branch* in step 6, or (b) merge the pull request first and then use `main`. Merging is your decision.

## Steps
1. Log in to Cloudflare → left menu **Workers & Pages** → **Create** → **Pages** tab → **Connect to Git**.
2. Choose **GitHub**, click **Add account / Install** and allow Cloudflare Pages to access **only** the repository `CF-Roster-`.
3. Select the repository `CF-Roster-` → **Begin setup**.
4. **Project name:** e.g. `asif-builders`. Your free address will be **`https://asif-builders.pages.dev`** (the name you type here becomes the subdomain; if taken, Cloudflare adds a suffix — read it on the success page).
5. **Production branch:** type/select `claude/youthful-hamilton-4qkcsl` (or `main` if you merged).
6. **Build settings:**
   | Setting | Value |
   | --- | --- |
   | Framework preset | **Astro** |
   | Build command | `npm run build` |
   | Build output directory | `dist` |
   | Root directory | *(leave blank)* |
7. **Environment variables** (Add variable — set for *Production*; add the same for *Preview* if you want previews to work fully):
   | Name | Value | Why |
   | --- | --- | --- |
   | `NODE_VERSION` | `22.12.0` | Astro 7 needs Node ≥ 22.12 (also pinned in `.nvmrc`) |
   | `SITE_URL` | `https://asif-builders.pages.dev` *(your real address)* | Used for canonical links, social previews, `sitemap-index.xml`, `robots.txt`. If you forget it, Cloudflare's build URL is used as a fallback. |
   | `PUBLIC_FORM_ENDPOINT` | *(see "Make the inquiry form work" below)* | Without it the form tells visitors their inquiry was **not** sent and offers WhatsApp |
   | `PUBLIC_FORM_ACCESS_KEY` | *(only for Web3Forms)* | Public key of that service (public by design) |
   | `PUBLIC_MAP_EMBED_URL` | *(optional)* Google Maps embed URL | Shows your office map on the Contact page |
8. Click **Save and Deploy**. The first build takes ~1–3 minutes. When it finishes, open your `*.pages.dev` address and check the pages.
9. Every later `git push` to the production branch redeploys automatically. Other branches / pull requests get their own *preview* URLs.

> ⚠️ Once connected, Cloudflare publishes the site (and preview deployments) at **publicly reachable URLs**. Connect the repository only when you want it online.

## Make the inquiry form work (free options)
The form posts JSON to the address in `PUBLIC_FORM_ENDPOINT`. **It has not been tested against a real service** (none is configured); the automated tests use a mock server.
- **Formspree** (https://formspree.io, free tier): create a form → copy its URL `https://formspree.io/f/xxxxxxxx` → set it as `PUBLIC_FORM_ENDPOINT`. Leave `PUBLIC_FORM_ACCESS_KEY` empty.
- **Web3Forms** (https://web3forms.com, free tier): get an access key by email → set `PUBLIC_FORM_ENDPOINT=https://api.web3forms.com/submit` and `PUBLIC_FORM_ACCESS_KEY=<your key>`.
- After setting variables, **redeploy** (Deployments → Retry/Redeploy), then submit one real test inquiry from the live site and confirm it arrives in your inbox. Only then is the form "working".
- Free-tier limits and spam rules belong to those services and can change — check their pricing pages. Until configured, the form is honest: it says the inquiry was not sent and offers a pre-filled WhatsApp message.

## Custom domain (optional, not free: the domain itself costs money)
Pages → your project → **Custom domains** → **Set up a custom domain**. If the domain's DNS is on Cloudflare it is automatic; otherwise Cloudflare shows the DNS record to add at your registrar. **Do not do this until you are ready**; then update `SITE_URL` to the new address and redeploy. HTTPS certificates are free and automatic.

## Free-plan limits & anything that could cost money (check Cloudflare's pricing page for current numbers)
- Pages free plan: ~500 builds/month, 1 build at a time, 20,000 files and 25 MiB per file per deployment. This site: ~240 files, largest file ≈ 1 MB. Static bandwidth is not metered.
- **Not used (so no cost):** Pages Functions/Workers, KV/D1/R2, Images transformation, Analytics add-ons. Don't enable them without checking pricing.
- Image optimisation happens at **build time** (sharp), not on Cloudflare's paid image service.
- Costs you may choose later: a custom domain name (~yearly registry fee), paid form-service tiers if you exceed free limits.

## Optional: deploy without GitHub (direct upload)
```bash
npm ci && npm run build
npx wrangler pages deploy dist --project-name asif-builders   # asks you to log in to Cloudflare in the browser
```

## After deploying — quick checklist
- Open every page on your phone; tap the call and WhatsApp buttons.
- Submit a test inquiry (see above) and confirm it arrives.
- Replace the placeholder testimonials, add your real address, and swap the **Concept render** images for real photos (`PHOTO-GUIDE.md`).
- Submit `https://<your-site>/sitemap-index.xml` in Google Search Console (free).
