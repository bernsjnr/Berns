# BERNS — bernsds.com

Personal site for Berns (Bernard Bannor). "Berns" is the main name; Berns Studios is one section of the site. Positioning: designer and presenter, design first.

## Decisions so far
- Domain stays **bernsds.com**. Email on Zoho must keep working (don't touch MX records).
- Hand-built static HTML/CSS/JS, hosted on **Hostinger**. Moving off Cargo.
- Nav: STUDIOS / PRESENTING / SHOP / COMMUNITY / CONTACT.
- Shop sells Berns's posters. He prints, checks and posts them himself (quality control). Checkout via **Stripe Payment Links** (no cart backend).
- Shop: the posters are Berns's gradient series (Breathe, Pause, Warmth, Rest is productive, Breath in breath out, No. 5) in `assets/posters/`. The earlier 3D framed-poster viewer (three.js r128) lives in `prototype-v1.html` and can come back on the poster pages.
- Community section: BULLY THE ROADS (co-founder, London running club), Track + Play (co-founder, annual community sports day), Rule of Thirds (one third, creative collective and podcast, ruleofthirds.co.uk).
- Presenting credits: Guardian Black History Month event (host), Wave and Dave listening party (presenter), BULLY THE ROADS events (host). Formats: launches, panels, listening parties, sports events.

## Current state
`index.html` is v3 (Nov 2026). It is built from the live bernsds.com (Cargo) layout and stays close to it: white page, BERNS studios logo top left, live London clock top right, centred "Welcome" label and one-sentence intro, a two-column grid of rounded (20px) 16:9 tiles with 12px gaps, and a fixed bottom nav. Additions from Berns's references are deliberately small: a caption row under each tile (name left, discipline right), centred label + sentence heads for each section, soft fade-up reveals, smooth scroll (Lenis). Berns rejected v2 (busy gradients, moving type) as too much; it is kept as `prototype-v2.html`, and v1 as `prototype-v1.html`. Media: `assets/work/` (WebP stills), `assets/video/` (short muted 1280x720 loops with poster frames, play only on screen), `assets/posters/`.

Positioning copy: Studios is "my independent studio for design and motion" (web is part of design, not a headline service; no client-sector lists). Presenting leads with "Looking for a host?" and how Berns's world brings creativity and sport together, moderating and keeping the energy up.

Placeholders still to replace: poster prices, paper/edition specs, case-study pages, showreel, BULLY THE ROADS and Track + Play links, Instagram/LinkedIn links.

## Next steps
1. Split into real pages: `/`, `/studios`, `/presenting`, `/shop`, `/shop/<poster>`, `/community`, `/contact`.
2. Poster pages: bring back the 3D frame viewer from prototype-v1 using the real gradient posters.
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
- Luxury minimalist, typography-led, lots of white space. No drop shadows. Cards and images use 16px radius (24px for big panels). Dividers are 1px.
- Keep it calm. Gradients live in the poster artwork, not as page backgrounds. No moving or stretching type, no grain, no busy layouts. Motion is limited to soft fade-up reveals (~0.9s ease-out), gentle image zoom on hover, smooth scroll and the clock. Always respect prefers-reduced-motion.
- Live-site order of work tiles: This Bed I Made, Holibobs (Guardian Labs), TOGETHER, Track + Play, then BULLY THE ROADS, Official Visit Denmark, Everyone Wants Posters, V&A on the live site. The live site also links Nwaka Okparaeke.
- No phone number anywhere. Never "Ltd" on the site.
- Voice: first person, direct, warm, concise. No em dashes. British spelling. Intro "Hello, I'm Berns." Sign-off "Let's make something you're proud of."

## How Berns likes to work
Iterative passes, concise replies, senior-level (don't over-explain). Send full files rather than snippets.
