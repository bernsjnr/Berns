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
`index.html` is a single-file prototype: homepage + shop view switched by hash (`#shop`). It uses the Adobe Fonts kit only (stand-ins removed Nov 2026). Work images live in `assets/work/` as 1200px WebP, taken from iCloud Berns Studios > Portfolio.

Positioning copy: Studios is "my independent studio for design and motion" (web is part of design, not a headline service; no client-sector lists). Presenting leads with "Looking for a host?" and how Berns's world brings creativity and sport together, moderating and keeping the energy up.

Placeholders still to replace: poster artwork (canvas-drawn mock-ups), prices, paper/edition specs, case-study pages, showreel, BULLY THE ROADS and Track + Play links, Instagram/LinkedIn links.

## Next steps
1. Split into real pages: `/`, `/studios`, `/presenting`, `/shop`, `/shop/<poster>`, `/community`, `/contact`.
2. Replace canvas posters with Berns's real poster files (high-res JPG/WebP as three.js textures).
3. Wire each size/frame combo to a Stripe Payment Link.
4. Contact and booking forms (Hostinger PHP mail or a form service), routed Studio vs Presenting.
5. Studios case-study template, Presenting page with showreel.
6. Deploy to Hostinger, point bernsds.com at it, then cancel Cargo.

## Brand (2026 identity) — follow exactly
- Source of truth: the 2026 Brand Kit in iCloud (Berns Studios > Branding > 2026 Brand Kit): `Berns Studios Type.css`, logo SVGs, and the Client Guide, Design Agreement, Invoice and email signature templates. Match those.
- Colours: Berns Blue `#080CDF`, ink `#1A1A1A` (never #000), white, grey-1 `#8A9095`, grey-2 `#E8E9EA` (rules, hover), grey-3 `#F1F2F3` (boxes, image backgrounds). Old blue #0E50C8 is retired. Paper and stone are not in the kit; don't use them.
- Blue is the signature: full ground for covers/footers/dividers and the Berns Studios panel; elsewhere an accent only. No blue text on ink.
- Logo: the BERNS studios logo artwork (SVG symbol from the kit templates, `fill:currentColor`), white on blue. Don't rebuild it from live type.
- Text is solid ink on light, solid white on blue/ink. Never grey or faded.
- Fonts (Adobe Fonts kit `https://use.typekit.net/tdx4jgk.css`, web project BERNS; never download the font files):
  - The kit has no domain list. It loads on any site and on a local file (tested Nov 2026, Safari engine and Chrome). Nothing to set up for bernsds.com.
  - After changing fonts in the Adobe project, press Save Changes to republish. The kit CSS shows `last_published` at the top.
  - It won't load inside a Claude artifact (blocked by the viewer). Preview by opening `index.html` locally instead.
  - Kit contents: `scale-variable` (wght 200-900, wdth 50-175, set width with `font-variation-settings`), `neue-haas-grotesk-display` 400 (this is 45 Light) and 700, `neue-haas-grotesk-text` 400 and 700, all with italics.
  - Titles: `scale-variable`, uppercase, `wdth 125, wght 700` (kit value)
  - Wordmark: BERNS in Scale at `wdth 125, wght 900`; "studios" in NHG Text Bold lowercase
  - Headings: `neue-haas-grotesk-display` 700
  - Body: `neue-haas-grotesk-text` 400, 17px
  - Labels: `neue-haas-grotesk-text` 700, uppercase, letter-spacing 0.16em
- Luxury minimalist, typography-led, lots of white space. No gradients, no drop shadows. Panels use 12px radius. Dividers are 1px ink.
- Motion 150-250ms, ease-out, no bounces.
- No phone number anywhere. Never "Ltd" on the site.
- Voice: first person, direct, warm, concise. No em dashes. British spelling. Intro "Hello, I'm Berns." Sign-off "Let's make something you're proud of."

## How Berns likes to work
Iterative passes, concise replies, senior-level (don't over-explain). Send full files rather than snippets.
