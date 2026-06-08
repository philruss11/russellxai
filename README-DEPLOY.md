# RussellxAI website — launch guide

A fast, self-contained static site. No build step, no server code, no database — just files. That's deliberate: it's the most secure, cheapest, and fastest way to host, and it's why the site is "cyberproof."

**Pages:** `index.html` (Home), `services.html`, `about.html`, `pricing.html`, `contact.html` — a real multi-page site with working top-nav links. **Folder to deploy:** this whole `website/` folder.

> These are plain files. ANY host on earth can serve them — a traditional web host, Cloudflare, GitHub, a VPS. Pick whichever you like; the site is identical on all of them.

---

## Recommended — Cloudflare Pages (free, real, your own domain, fast)
A genuine professional host. Free tier, global CDN, free HTTPS, and it applies the security headers from `_headers` automatically.
1. Sign in / create your account at **https://dash.cloudflare.com** (this is the part that's yours — your login, your card if you buy the domain there).
2. **Workers & Pages → Create → Pages → Upload assets** → drag the `website` folder, or connect a GitHub repo.
3. It goes live on `your-project.pages.dev`. Then **Custom domains → Set up a domain** → `russellxai.com`.
4. Easiest domain path: buy `russellxai.com` right inside Cloudflare (**Registrar**, sold at cost ~$10/yr) and it auto-connects — no DNS copying.

## Traditional web host (if you want a "normal" host like a typical business)
Hostinger, SiteGround, Bluehost, or even GoDaddy all work. After you buy a plan + domain:
1. Open the host's **File Manager** (or use FTP) and upload the **contents** of `website/` into the `public_html` folder.
2. Done — it's live on your domain. (Add the headers from `_headers` in the host's settings if it supports custom headers; the in-page `<meta>` CSP protects you regardless.)

## Other free options
- **GitHub Pages:** put the contents of `website/` in a repo → Settings → Pages → deploy from main. Live at `username.github.io/repo` + custom domain.
- **Vercel:** `npm i -g vercel`, run `vercel` from inside `website/`. `vercel.json` applies the headers.

*(A `netlify.toml` is also included so Netlify would work too — but per your call, we're using one of the above instead.)*

---

## Get a domain (so people can "look you up")
- Buy `russellxai.com` (and `.ai` if you want it) from **Cloudflare Registrar**, **Namecheap**, or **Porkbun** (~$10–15/yr). Cloudflare sells at cost.
- Point it at your host using the DNS records the host shows you. HTTPS is automatic on Netlify/Vercel/Cloudflare.
- After it's live, update these placeholder URLs (currently `https://www.russellxai.com/`) if your real domain differs:
  - `index.html` → `<link rel="canonical">`, the Open Graph / Twitter `og:url` + image URLs, and the JSON-LD `url`.
  - `sitemap.xml` and `robots.txt` → the domain.

---

## Turn on the contact form (optional — it already works without this)
Right now the **Send it to Phillip** button opens the visitor's email app pre-filled to **RussellxAI@gmail.com**. That works everywhere with no setup.

To collect submissions straight to your inbox without the visitor's email app:
1. Make a free form at **https://formspree.io** with `RussellxAI@gmail.com`.
2. Copy your form ID and replace `your-form-id` in `index.html`:
   `<form ... action="https://formspree.io/f/XXXXXXXX" ...>`
3. That's it — the JavaScript auto-detects the real endpoint and posts to it. The mailto fallback stays for anyone with JS off.

---

## After launch — so you show up when people search
1. **Google Business Profile** (most important locally): create/claim it at https://business.google.com — name *RussellxAI*, category *Business management consultant* / *Software company*, area served *Clarksville, TN*, add the website URL, email, phone, and photos. See `../marketing/launch-kit.md` for ready-to-paste copy.
2. **Google Search Console** (https://search.google.com/search-console): add the domain, then submit `https://www.russellxai.com/sitemap.xml`.
3. **Bing Webmaster Tools**: same idea, import from Search Console.
4. Drop the link everywhere your name appears: email signature, LinkedIn, Instagram bio, the outreach PDFs.

---

## Re-generate the social share image (if you change the headline)
The Open Graph image is `assets/img/og-image.png` (1200×630). To rebuild it from `assets/img/_og-source.html`:
```
& "C:\Program Files\Google\Chrome\Application\chrome.exe" --headless --disable-gpu --hide-scrollbars --window-size=1200,630 --screenshot="assets\img\og-image.png" "file:///<full-path>/assets/img/_og-source.html"
```

---

## What's in here
```
website/
  index.html             Home
  services.html          Services (detailed)
  about.html             About Phillip
  pricing.html           Pricing + FAQ
  contact.html           Contact form
  assets/css/styles.css  design system + scroll-animation styles (shared by all pages)
  assets/js/main.js      animations, count-ups, mobile menu, form (no third-party libraries)
  assets/img/*.svg       the 7 service illustrations + logo/favicon
  assets/img/og-image.png social share card
  robots.txt, sitemap.xml SEO
  _headers, netlify.toml, vercel.json  security headers for each host
```
