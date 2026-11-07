# BERNS — bernsds.com

Personal site for Berns (Bernard Bannor). "Berns" is the main name; Berns Studios is one section of the site. Positioning: designer and presenter, design first.

## Decisions so far
- Domain stays **bernsds.com**. Email on Zoho must keep working (don't touch MX records).
- Hand-built static HTML/CSS/JS, hosted on **Hostinger**. Moving off Cargo.
- Nav: STUDIOS / PRESENTING / SHOP / COMMUNITY / CONTACT.
- Shop sells Berns's posters. He prints, checks and posts them himself (quality control). Checkout via **Stripe Payment Links** (no cart backend).
- Shop page shows each poster in 3D: framed on a wall with a bench for scale, plus a free-rotate mode showing the back of the frame (signed/numbered label). Built with three.js r128 + OrbitControls.
- Community section: BULLY THE ROADS (co-founder, London running club), Track + Play (co-founder, annual community sports day), Rule of Thirds (one third, creative collective and podcast, ruleofthirds.co.uk).
- Presenting credits: Guardian Black History Month event (host), Wave and Dave listening party (presenter), BULLY THE ROADS events (host). Formats: launches, panels, listening parties, sports events.

## Current state
Split into real static pages, no build step. Root-relative paths, so serve from the site root (`python3 -m http.server`).

- Pages: `/`, `/studios/`, `/presenting/`, `/shop/`, `/shop/<poster>/` (feel, duality, smooth, motion), `/community/`, `/contact/`. Each is `<folder>/index.html`; header and footer are duplicated per page, so edit all when they change.
- `assets/css/site.css`: all styles, brand tokens at the top.
- `assets/js/site.js`: giant wordmark fit (home) and copy-email.
- `assets/js/posters.js`: poster list, canvas-drawn placeholder artwork, example sizes/frames/prices, poster cards.
- `assets/js/shop.js`: poster page options, buy button and the three.js 3D view.
- `assets/js/links.js`: Stripe Payment Links, keyed `poster:size:frame`. Empty for now; the buy button falls back to a mailto enquiry until a link exists.
- Google Font stand-ins removed. Fonts come only from the Typekit kit (add bernsds.com to the kit's domains).

Placeholders still to replace: poster artwork, prices, paper/edition specs, project images, showreel, BULLY THE ROADS and Track + Play links, Instagram/LinkedIn links (removed from the footer until the URLs exist).

## Next steps
1. Replace canvas posters with Berns's real poster files (high-res JPG/WebP as three.js textures).
2. Create the Stripe Payment Links and paste them into `assets/js/links.js`.
3. Contact and booking forms (Hostinger PHP mail or a form service), routed Studio vs Presenting. Currently mailto buttons.
4. Studios case-study template, Presenting page with showreel.
5. Add per-page social/OG images, a favicon, `sitemap.xml` and `robots.txt`.
6. Deploy to Hostinger, point bernsds.com at it, then cancel Cargo.

## Brand (2026 identity) — follow exactly
- Colours: Berns Blue `#080CDF`, ink `#1A1A1A` (never #000), paper `#F3F1EC`, stone `#D6D2C8`, white. Old blue #0E50C8 and old greys are retired.
- Blue is the signature: full ground for covers/footers/dividers; elsewhere an accent only. No blue text on ink.
- Text is solid ink on light, solid white on blue/ink. Never grey or faded.
- Fonts (Adobe Fonts kit `https://use.typekit.net/tdx4jgk.css`, add bernsds.com to the kit's domains; never download the font files):
  - Titles: `scale-variable`, bold, uppercase, wide (wdth ~150-175)
  - Wordmark: BERNS in Scale at `wdth 125, wght 900`; "studios" in NHG Text Bold lowercase
  - Headings: `neue-haas-grotesk-display` 700
  - Body: `neue-haas-grotesk-text` 400
  - Labels: `neue-haas-grotesk-text` 700, uppercase, letter-spacing 0.16em
- Luxury minimalist, typography-led, lots of white space. No gradients, no drop shadows. Panels use 12px radius. Dividers are 1px ink.
- Motion 150-250ms, ease-out, no bounces.
- No phone number anywhere. Never "Ltd" on the site.
- Voice: first person, direct, warm, concise. No em dashes. British spelling. Intro "Hello, I'm Berns." Sign-off "Let's make something you're proud of."

## How Berns likes to work
Iterative passes, concise replies, senior-level (don't over-explain). Send full files rather than snippets.
