# BERNS — bernsds.com

Personal site for Berns (Bernard Bannor). "Berns" is the main name; Berns Studios is one section of the site. Positioning: designer and presenter, design first.

## Decisions so far
- Domain stays **bernsds.com**. Email on Zoho must keep working (don't touch MX records).
- Hand-built static HTML/CSS/JS, hosted on **Hostinger**. Moving off Cargo.
- Nav: STUDIOS / PRESENTING / SHOP / COMMUNITY / CONTACT.
- Shop sells Berns's posters. He prints, checks and posts them himself (quality control). Checkout via **Stripe Payment Links** (no cart backend).
- Shop: 12 prints in `assets/posters/` (listed in `assets/data.js`): Mistakes are the portals of discovery, Love God love people, Home is where the heart is, Don't get tired of doing good, Day by day, In God's time, plus the gradient series (Breathe, Pause, Warmth, Rest is productive, Breath in breath out, No. 5). The six typographic posters are only 620px wide for now; swap in high-res files when Berns sends them.
- Community section: BULLY THE ROADS (co-founder, London running club), Track + Play (co-founder, annual community sports day), Rule of Thirds (one third, creative collective and podcast, ruleofthirds.co.uk).
- Presenting credits: Guardian Black History Month event (host), Wave and Dave listening party (presenter), BULLY THE ROADS events (host). Formats: launches, panels, listening parties, sports events.

## Current state
Multi-page static site (v3, Nov 2026), built from the live bernsds.com (Cargo) layout: white page, BERNS studios logo top left, live London clock top right, centred label + one-sentence heads, two-column grid of rounded (20px) 16:9 tiles with captions, fixed bottom nav. Berns rejected v2 (busy gradients, moving type) as too much; v1 and v2 are kept as `prototype-v1.html` and `prototype-v2.html` for reference only.

Home hero (v4, Nov 2026) is built from Berns's artboard "Website for Berns Studios.ai": WORK / ABOUT / SHOP / CONTACT across the top (Scale VF Medium), a small square-cornered colour portrait centred (`assets/img/berns-portrait.webp`, cropped so his head sits near the top), BERNARD BANNOR in Scale (wdth 125, wght 900) with "A designer and presenter working between culture, sport and community." and READ MORE (Space Mono Bold, Google Fonts, home only). The hero fills the window on every device and the name/intro row always sits at the bottom of it.

Top bar (all pages, replaces the old BERNS studios logo header, London clock and bottom nav): solid white, BERNARD BANNOR left, WORK / ABOUT / SHOP / CONTACT right. On the home page it takes over from the hero on scroll: once the hero nav leaves, the bar appears and the nav slides from its spread-out hero positions to the right; once the hero name leaves, BERNARD BANNOR rises into the bar. ABOUT goes to the About block on the home page, which links Studios, Presenting and Community.

Portrait (home): turns up to ~7deg as you scroll through the hero, eased; off for reduced motion.

Cursor (all pages, mouse/trackpad only): Berns Blue dot that breathes gently, pulses a little deeper with a soft ripple ring while scrolling, and grows ~4.5x over links, tiles and the portrait. Lives in `assets/site.js` and the end of `assets/site.css`. Respects prefers-reduced-motion. This is the one place blue is used beyond hover and selection.

Pages (relative links, works on GitHub Pages under /Berns/ and on Hostinger):
- `index.html` home: intro, 4 work tiles, previews of Studios, Presenting and Shop, contact.
- `studios/index.html` all work, what I do, how a project runs (six steps from the Client Guide). `studios/project.html?p=<id>` is the case-study template (client, discipline, year, hero media, write-up, next projects).
- `presenting/index.html`, `community/index.html`, `contact/index.html`.
- `shop/index.html` print grid. `shop/print.html?p=<id>` product page: Print / On the wall / Turn it views (three.js r128 3D, loaded only on that page), size and frame options, live price, buy button.

Shared files: `assets/site.css` (all styles), `assets/site.js` (injects logo, header, clock, bottom nav; reveals; videos play only on screen; Lenis smooth scroll), `assets/data.js` (projects, posters, sizes, frames, prices, credits: edit content here), `assets/print.js` (product page + 3D). Each page sets `<body data-base="../" data-page="shop">`. Media: `assets/work/` (WebP stills), `assets/video/` (muted 1280x720 loops + poster frames), `assets/posters/`.

AR ("View in your room" on the print page): on phones it exports the chosen print, size and frame as a GLB in the browser (three.js GLTFExporter) and opens it with `<model-viewer>` (iPhone: Quick Look, converted to USDZ automatically; Android: WebXR), placed on a wall at real size. On computers it shows a QR code that opens the same print, size and frame on a phone (`?s=` and `?f=` URL params). Needs testing on a real iPhone and Android phone.

Header and bottom nav sit on soft eased white fades with a light blur (no hard bands). Berns found the earlier straight white gradient too harsh.

Shop flow: each poster in `data.js` has `checkout: {}`. Add a Stripe Payment Link per combo, keyed `<size>-<frame>` (e.g. `'a2-oak'`), and the button becomes "Buy now" and opens Stripe. With no link it says "Order by email" and opens a pre-filled email with the print, size, frame and price. Prices are PLACEHOLDERS from v1 (A3 £45, A2 £70, 50x70 £90; frame +£50/+£70/+£85) until Berns confirms.

Positioning copy: Studios is "my independent studio for design and motion" (web is part of design, not a headline service; no client-sector lists). Presenting leads with "Looking for a host?" and how Berns's world brings creativity and sport together, moderating and keeping the energy up.

Placeholders still to replace: poster prices and Stripe links, project write-ups (`about` in data.js), years/clients where blank, Official Visit Denmark and Nwaka Okparaeke projects, paper/edition specs, case-study pages, showreel, BULLY THE ROADS and Track + Play links, Instagram/LinkedIn links.

## Next steps
1. Done: real pages and the print page with 3D views.
2. Write-ups and more images for each project page.
3. Wire each size/frame combo to a Stripe Payment Link.
4. Contact and booking forms (Hostinger PHP mail or a form service), routed Studio vs Presenting.
5. Studios case-study template, Presenting page with showreel.
6. Deploy to Hostinger, point bernsds.com at it, then cancel Cargo.

## Brand (2026 identity) — follow exactly
- Source of truth: the 2026 Brand Kit in iCloud (Berns Studios > Branding > 2026 Brand Kit): `Berns Studios Type.css`, logo SVGs, and the Client Guide, Design Agreement, Invoice and email signature templates. Match those.
- Colours: Berns Blue `#080CDF`, ink `#1A1A1A` (never #000), white, grey-1 `#8A9095`, grey-2 `#E8E9EA` (rules, hover), grey-3 `#F1F2F3` (boxes, image backgrounds). Old blue #0E50C8 is retired. Paper and stone are not in the kit; don't use them.
- Blue is an accent only on the site (button hover, text selection). No blue text on ink, and never a blue logo.
- Logo: the BERNS studios logo artwork (SVG symbol from the kit templates, `fill:currentColor`). Black (ink) or white ONLY. Never blue, anywhere. Don't rebuild it from live type.
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
