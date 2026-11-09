# BERNS — bernsds.com

Personal site for Berns (Bernard Bannor). "Berns" is the main name; Berns Studios is one section of the site. Positioning: designer and presenter, design first.

## Decisions so far
- Domain stays **bernsds.com**. Email on Zoho must keep working (don't touch MX records).
- Hand-built static HTML/CSS/JS, hosted on **Hostinger**. Moving off Cargo.
- Nav (v9, Nov 2026): HOME / WORK / ABOUT / SHOP / CONTACT, in a full-screen menu behind MENU. Presenting and Community to be folded in later.
- Shop sells Berns's posters. He prints, checks and posts them himself (quality control). Checkout via **Stripe Payment Links** (no cart backend).
- Shop: 12 prints in `assets/posters/` (listed in `assets/data.js`): Mistakes are the portals of discovery, Love God love people, Home is where the heart is, Don't get tired of doing good, Day by day, In God's time, plus the gradient series (Breathe, Pause, Warmth, Rest is productive, Breath in breath out, No. 5). The six typographic posters are only 620px wide for now; swap in high-res files when Berns sends them.
- Community section: BULLY THE ROADS (co-founder, London running club), Track + Play (co-founder, annual community sports day), Rule of Thirds (one third, creative collective and podcast, ruleofthirds.co.uk).
- Presenting credits: Guardian Black History Month event (host), Wave and Dave listening party (presenter), BULLY THE ROADS events (host). Formats: launches, panels, listening parties, sports events.

## Current state
**v9 rebuild (Nov 2026): starting from scratch, page by page.** Home and About are done; Work, Shop and Contact still run the old v7 code (`site.css`/`site.js`) until each is rebuilt.
- About (`about/index.html`): an Apple-style scroll journey, bio in third person (Berns's call, more professional), greeting in first person. 1) Hello: pinned scene, "Hey, what's good?" / "I'M BERNS." fade up on load, then as you scroll they fade away and the one-line bio appears word by word ("...multidisciplinary designer and presenter working between culture, sport and community", highlights as on Home). 2) Designer (white ground): The Guardian logo + Product Designer, and the Berns Studios logo (kept small) + Brand and motion linking to Work. No boxes (Berns didn't like them). 3) Presenter (ink): a HOSTED FOR strip of logos with a mono caption each (The Guardian / Black History Month, Wave and Dave / listening party, Rule of Thirds / podcast and live, BULLY THE ROADS / run club events, Track + Play / sports day), kept as light proof instead of a credits list, and a booking button. 4) Community (Berns Blue): BULLY THE ROADS (founder), Track + Play (co-founder), Rule of Thirds (one third), each with its logo, no boxes; columns size to content with one even gap (equal columns left Rule of Thirds stranded). 5) Close: "Time to bring your ideas to life." + email + Studio enquiry / Presenting booking mailto buttons. The page colour eases between chapters (`data-ground` = ink/white/blue on each section). MENU, clock and battery stay fixed on a band in the page colour once scrolled. Three draggable photo placeholders (one per chapter, kept inside their chapter via `data-bounds`).
- Logos live in `assets/logos/` as SVGs recoloured to `currentColor` (inlined in the HTML so they follow the ground): berns-studios, the-guardian (Wikimedia Commons, The Guardian 2018 masthead), bully-the-roads, track-and-play (stacked symbol) and track-and-play-inline, rule-of-thirds, wave-and-dave. The club and RoT logos come from Berns's iCloud (Creative Projects > BULLY THE ROADS / TRACK + PLAY / Rule of Thirds).
- Prints (Nov 2026, Berns's call): every photo on Home and About is a straight portrait print at 272:316, no rotation at all, drag to move only. Images are pre-cropped to that ratio. Presenter photo: `assets/img/berns-hosting-bhm.webp` (Berns seated under the "Hosted by Bernard Bannor" slide at the Guardian Advertising BHM panel).
- Designer photo: `assets/img/berns-smile.webp` (Berns smiling, orange curtain, cropped to head and torso).
- Community photos: `assets/img/btr-run-club.webp` and `assets/img/track-and-play-sports-day.webp` (centre of the stand with the IT'S TIME TO PLAY banner), side by side beside the intro, above the logos. All About photos are in.
- Phones (About): prints open or close their chapter, alternating: Designer photo on top (`.photo--top`), Presenter photo at the bottom (`.photo--bottom`), Community run club on top and sports day at the bottom. Desktop keeps them beside the text.
- Phones (About): one type scale, everything centred. Label 12 mono, chapter title Scale 9.3vw, lede 24, body 16, item names 22, meta 11 mono. Hosted-for logos in a 2-column grid.
- New shared files: `assets/core.css` and `assets/core.js`, linked with `?v=N` (bump N on every change so browsers drop the cached copy) (top bar, live date and time, battery, full-screen menu, rotatable photo, pixel cursor). Rebuilt pages use these only, not site.css/site.js.
- Home (`index.html`, from Berns's Illustrator artboard): ink ground, one screen. BERNARD BANNOR top left in Scale (wdth 125, wght 900); (ALSO KNOWN AS 'BERNS') in mono fades in under it on hover/focus; on touch screens the first tap on the name shows it for 3.5s and a second tap follows the link. Top right: visitor's local date and time with seconds in Space Mono Bold (Google Fonts, stand-in until Berns picks a mono; time only on phones), a battery icon (real level via navigator.getBattery; Chrome/Edge/Android only, full battery shown elsewhere), MENU in Scale. Centre: portrait in a white frame. Drag to move it anywhere (its middle always stays on screen). Arrow keys nudge it, double-click puts it back. Bottom: "A designer and presenter working between culture, sport and community." in NHG Display Bold with designer/presenter on Berns Blue highlights (Berns's call, overrides the accent-only rule here), READ MORE in mono to about/.
- Menu: MENU opens a full-screen Berns Blue takeover (clip from top, 250ms ease-out, items stagger in), MENU + becomes CLOSE − (the plus bar turns flat), Esc closes. Items in Scale with mono numbers, current page underlined.
- Layout is drawn at 1600x900 and scales by `--u` (fits width or height, whichever is tighter). Below 760px the bar stacks (time, battery, MENU above the name).
- Cursor: same classic pixel set, now 75% size (crisp on retina: 3 device px per art pixel).

### Before v9
Multi-page static site (v3, Nov 2026), built from the live bernsds.com (Cargo) layout: white page, BERNS studios logo top left, live London clock top right, centred label + one-sentence heads, two-column grid of rounded (20px) 16:9 tiles with captions, fixed bottom nav. Berns rejected v2 (busy gradients, moving type) as too much; v1 and v2 are kept as `prototype-v1.html` and `prototype-v2.html` for reference only.

Opening page (`index.html`, v8, Nov 2026, from Berns's hand sketch): one Berns Blue screen, no scrolling. Bar shows HOME / WORK / ABOUT / SHOP / CONTACT spread across (no name in the bar on this page). Left: rounded white panel with Berns cut out (`assets/img/berns-cutout.webp`, background removed with rembg isnet), his head breaking out above the panel's top edge (the photo is layered twice: once clipped inside the panel, once clipped to the part above it). Right: BERNARD BANNOR in Scale, a rule, "A designer and presenter working between culture, sport and community." and a white READ MORE pill to About. Stacks on phones. The older poster (.poster) and draggable-photo code is still in the files, unused.

Top bar (all pages, replaces the old BERNS studios logo header, London clock and bottom nav): solid white, BERNARD BANNOR left, WORK / ABOUT / SHOP / CONTACT right. On the home page it starts as a Berns Blue band with white nav over the poster, then turns white and BERNARD BANNOR rises into it once the poster has scrolled away. Every nav item is its own page: WORK = studios/, ABOUT = about/ (bio, links to Studios, Presenting and Community), SHOP = shop/, CONTACT = contact/.

Inner pages (v7, Nov 2026): the opening page's feel carried through, using two references Berns sent (Marameo: blue panel left, huge stacked words right with a photo floating on top; Artworld: flowing name index, detail pages with a slim info column). Shared pieces in site.css/site.js:
- `.split`: sticky Berns Blue `.split-panel` on the left (page title in Scale, auto-fitted to one line; centred `.split-say` line in NHG Display; `.corner` details bottom left and right) and `.split-list` on the right.
- `.stack`: huge stacked Scale words with small superscript labels. `.names`: flowing Artworld-style index, alternating NHG Display Bold and Light. Work builds its stack from `data-stack="projects"`, Shop its index from `data-names="posters"`.
- `.float`: a photo floating in the middle of the list. Shows the item you hover, or the one in the middle of the screen as you scroll (phones). Items opt in with `data-img` (and `data-video`).
- Project page (`studios/project.html`): slim sticky info column (label, name, client/discipline/year, write-up) beside big media, then NEXT PROJECT as a big Scale link.
- `.contact` is now a Berns Blue band with a Scale headline and white buttons; Contact page is a full blue screen.
Shop print page is unchanged apart from the shared bar and contact band.

Portrait (old home, unused now): a photo pinned to a noteboard. Drag it anywhere with mouse or finger, it swings as it moves and stays where dropped (double-click resets; resets on reload). Also turns up to ~7deg as you scroll through the hero. Swing and turn are off for reduced motion.

Cursor (all pages, desktop and phone): the classic pixel set Berns picked (rw-designer.com "Classic" teaser), cropped into `assets/cursor/` (arrow, hand, hourglass at 2x pixels, `image-rendering:pixelated`). Arrow by default, pointing hand on links, buttons and the draggable photo, hourglass until the page has loaded. Desktop hides the system cursor; on phones it jumps to wherever you touch and follows your finger. Logic in `assets/site.js`.

Pages (relative links, works on GitHub Pages under /Berns/ and on Hostinger):
- `index.html` opening page (poster + floating photo only).
- `about/index.html` about: blue panel (hello line) beside a full-frame photo, then the bio Berns wrote (third person, with a presenting paragraph added), contact.
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
- Voice: first person, direct, warm, concise. No em dashes. British spelling. Intro "Hello, I'm Berns." Sign-off "Time to bring your ideas to life." (Berns dropped "Let's make something you're proud of", Nov 2026). Bios in third person.

## How Berns likes to work
Iterative passes, concise replies, senior-level (don't over-explain). Send full files rather than snippets.
