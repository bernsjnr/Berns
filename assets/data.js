/* =========================================================
   BERNS: site data. One place to edit work, prints and prices.
   Paths are relative to the site root; site.js adds the base.
   ========================================================= */
window.BERNS = {

  /* ---------- Work ----------
     Order = recently added: newest first. The Work page stacks them in this order.
     `bg` = the project's colour, pulled from its own imagery. It colours the file on the Work page and
     the opener of the case study. `ink: true` = ink text on that colour (light colours), otherwise white.
     `summary` = one line under the title (first drafts, Berns to edit). `quote` = pull quote, lifted from the write-up.
     `cover` / `img` = still, `video` = muted loop (assets/video) with `poster`. `gallery` = extra media for the
     case study, placed between the write-up sections: { video, poster } or { img }.
     `about` = write-up for the case study (## headings). Empty = "Full write-up coming soon".
     `tags` drive the discipline filters, `folder` the second filter (The Guardian, Studio clients, Community, Personal). */
  projects: [
    { id: 'this-bed-i-made', name: 'This Bed I Made', client: "Guvna B", discipline: "Art direction, design and motion", year: '2026',
      tags: ['Animation', 'Design', 'Art direction'], folder: 'Studio clients', bg: '#A47B1C', ink: true,
      summary: "Art direction and the full visual world for Guvna B's comeback album, from the coin to the cover to the film.",
      quote: 'No one above accountability, no one beyond redemption.',
      cover: 'assets/work/this-bed-i-made-cover.webp', video: 'assets/video/this-bed-i-made.mp4', poster: 'assets/video/this-bed-i-made.jpg',
      /* Editorial case study (Nov 2026): chapters of text + media rows. See the note at the top of case.js. */
      chapters: [{"h": "The brief", "text": ["Guvna B came to me directly to lead the art direction and visual identity for This Bed I Made, his comeback album and his return to music after time away.", "Everything had to carry the weight of the record's thesis: no one above accountability, no one beyond redemption."]}, {"h": "Two faces", "text": ["I had a lot of creative freedom, so I explored several directions for the cover, the type and the wider visual language before landing on one system. The idea I kept coming back to was a coin.", "Two faces, one object. A dual-faced motif for the choice between two states, small enough to hold in your hand. I kept the faces simple so they would work at any size, from a 12 inch label to a profile picture.", "The coin was later engraved and used as a physical prop in the film."], "rows": [{"row": "full", "items": [{"img": "assets/work/tbim/coin-concept.webp", "r": 1.7778, "cap": "Coin concept 001, September 2025"}]}, {"row": "pair", "items": [{"img": "assets/work/tbim/two-faces.webp", "r": 1.0, "cap": "The two faces"}, {"img": "assets/work/tbim/coin.webp", "r": 0.9919, "cap": "The engraved coin"}]}]}, {"h": "The system", "text": ["Around the coin I built a small, quiet system: a circular wordmark that reads the title twice, a short set of lockups, and the line itself set in gold capitals.", "The typography was sourced and refined to feel weighty but considered. It had to sit on top of a painting without fighting it."], "rows": [{"row": "offset", "items": [{"img": "assets/work/tbim/lockups.webp", "r": 1.0, "cap": "Circle, wordmark, monogram and coin"}]}, {"row": "full", "bg": "#1A1A1A", "items": [{"img": "assets/work/tbim/mantra.webp", "r": 4.486}], "cap": "The line, set for print and merch"}, {"row": "palette", "cap": "Colours pulled from the painting", "colours": [["Blanket", "#C29F4C"], ["Coin", "#86693D"], ["Bottle", "#2D4547"], ["Pillow", "#B4D3D2"], ["Wall", "#7C5A5F"], ["Night", "#1E1F1C"]]}]}, {"h": "The record", "text": ["The cover is a painting, so the job was restraint. The front carries no type at all. The back carries the circle, the tracklist and the credits, pressed into the canvas like the coin.", "From there it ran into the vinyl: the 12 inch sleeve and both labels, built to the pressing plant's templates and signed off for print."], "rows": [{"row": "full", "items": [{"img": "assets/work/tbim/cover.webp", "r": 1.0, "cap": "Front cover"}]}, {"row": "pair", "items": [{"img": "assets/work/tbim/back.webp", "r": 1.0, "cap": "Back cover"}, {"img": "assets/work/tbim/side-a.webp", "r": 1.0, "cap": "Side A label"}]}, {"row": "pair", "items": [{"img": "assets/work/tbim/tracklist-early.webp", "r": 1.0, "cap": "Tracklist, an early direction"}, {"img": "assets/work/tbim/tracklist.webp", "r": 1.0, "cap": "Tracklist, the final for social"}]}, {"row": "pair", "items": [{"video": "assets/video/tbim/rotation.mp4", "poster": "assets/video/tbim/rotation.webp", "r": 1, "cap": "The sleeve, front and back"}, {"img": "assets/work/tbim/vinyl.webp", "r": 1.381, "cap": "The 12 inch"}]}]}, {"h": "The film", "text": ["The album came with a short film by Guvna B. I designed the title, the title cards, the end credits and the posters, using the same type and circle so the film and the record read as one piece of work."], "rows": [{"row": "full", "items": [{"img": "assets/work/tbim/title-card.webp", "r": 1.7778, "cap": "Title card"}]}, {"row": "trio", "items": [{"img": "assets/work/tbim/film-poster-a.webp", "r": 0.8, "cap": "Poster, option A"}, {"img": "assets/work/tbim/film-poster-b.webp", "r": 0.8, "cap": "Poster, option B"}, {"img": "assets/work/tbim/film-poster.webp", "r": 0.8, "cap": "Poster, approved"}]}, {"row": "pair", "items": [{"img": "assets/work/tbim/title.webp", "r": 1.7778, "cap": "Title design"}, {"video": "assets/video/tbim/credits.mp4", "poster": "assets/video/tbim/credits.webp", "r": 1.7778, "cap": "End credits", "bg": "#000000"}]}]}, {"h": "Live", "text": ["The release ran through three live moments: in-store sessions with Nudie Jeans in Manchester, Bristol and London, a live show at KOKO, and a screening of the film at Curzon Mayfair.", "For each one I worked through several routes before settling on a single family of posters, all cut from the painting."], "rows": [{"row": "quad", "cap": "In Store Sessions, early directions", "items": [{"img": "assets/work/tbim/iss-a.webp", "r": 0.8}, {"img": "assets/work/tbim/iss-b.webp", "r": 0.8}, {"img": "assets/work/tbim/iss-c.webp", "r": 0.8}, {"img": "assets/work/tbim/iss-d.webp", "r": 0.8}]}, {"row": "trio", "cap": "Live Show, early directions", "items": [{"img": "assets/work/tbim/live-a.webp", "r": 0.8}, {"img": "assets/work/tbim/live-b.webp", "r": 0.8}, {"img": "assets/work/tbim/live-c.webp", "r": 0.8}]}, {"row": "trio", "cap": "The final set", "items": [{"img": "assets/work/tbim/poster-iss.webp", "r": 0.8, "cap": "In Store Sessions"}, {"img": "assets/work/tbim/poster-live.webp", "r": 0.8, "cap": "Live Show"}, {"img": "assets/work/tbim/poster-film.webp", "r": 0.8, "cap": "Short Film Screening"}]}, {"row": "offset", "items": [{"img": "assets/work/tbim/screening.webp", "r": 0.8, "cap": "Curzon Mayfair screening"}]}]}, {"h": "Merch", "text": ["The merch kept the same restraint: the line in gold, the circle on the back, colours lifted from the painting.", "For the guide tee I illustrated The Correct Way to Make Your Bed, a four-step instruction sheet that takes the title literally."], "rows": [{"row": "full", "items": [{"img": "assets/work/tbim/hoodies.webp", "r": 1.5, "cap": "Hoodies, front and back"}]}, {"row": "pair", "items": [{"img": "assets/work/tbim/tee-front.webp", "r": 1.4995, "cap": "Tee, front"}, {"img": "assets/work/tbim/tee-back.webp", "r": 1.4995, "cap": "Tee, back"}]}, {"row": "pair", "items": [{"img": "assets/work/tbim/guide.webp", "r": 0.8, "cap": "The Correct Way to Make Your Bed"}, {"img": "assets/work/tbim/guide-tee.webp", "r": 1.4995, "cap": "Guide tee"}]}, {"row": "pair", "items": [{"img": "assets/work/tbim/tote.webp", "r": 1.0, "cap": "Tote"}, {"img": "assets/work/tbim/notebook.webp", "r": 1.4995, "cap": "Embossed notebook"}]}, {"row": "offset", "items": [{"img": "assets/work/tbim/bundle.webp", "r": 1.0, "cap": "The Work bundle"}]}]}, {"h": "The rollout", "text": ["Release week needed a steady flow of assets: playlist cards, reaction posts and motion for social, all in the same system."], "rows": [{"row": "pair", "items": [{"video": "assets/video/tbim/playlists.mp4", "poster": "assets/video/tbim/playlists.webp", "r": 0.5625, "cap": "Playlist adds, motion for social"}, {"img": "assets/work/tbim/comments.webp", "r": 0.5625, "cap": "Reactions, a scrapbook post"}]}, {"row": "full", "bg": "#1A1A1A", "items": [{"img": "assets/work/tbim/playlists.webp", "r": 7.28, "cap": "Added to these playlists"}]}]}, {"h": "The impact", "text": ["A strong collaboration with a three-time MOBO Award winner, delivered across every touchpoint of the release, from the coin in the film to the shirt on your back."]}],
      made: ["Coin and its two faces", "Wordmark and lockups", "Front and back cover", "12 inch sleeve and labels", "Tracklist", "Film title, title cards and end credits", "Film posters", "In-store, live show and screening posters", "Hoodies, tees, tote and notebook", "Bundles", "Social and playlist assets", "Animation"],
      credits: [["Client", "Guvna B"], ["Studio", "Berns Studios: art direction, illustration, design and motion"], ["Film", "A film by Guvna B. Written by Isaac Borquaye and Christoph Davis, directed by Christoph Davis. A Guvvy Studios and Grade A production."], ["Partners", "Nudie Jeans, KOKO, Curzon, Forward, Samaritans"]] },
    { id: 'holibobs', name: 'Holibobs', client: 'The Guardian Labs', discipline: 'Campaign', year: '2026',
      tags: ['Art direction', 'Animation'], folder: 'The Guardian', bg: '#6D5F43',
      summary: 'Art direction and animation for a summer campaign with The Guardian Labs.',
      video: 'assets/video/holibobs.mp4', poster: 'assets/video/holibobs.jpg', about: '' },
    { id: 'together', name: 'TOGETHER', client: "The Guardian", discipline: "Identity and motion", year: '',
      tags: ['Design', 'Animation'], folder: 'The Guardian', bg: '#BA241E',
      summary: 'A Black History Month campaign I started inside The Guardian, from the identity to the video series.',
      quote: 'Black History Month needed to be more than a moment.',
      img: 'assets/work/together.webp', about: "## The brief\nBlack History Month needed to be more than a moment. As the lead designer, I initiated the concept internally and was given full creative freedom to build something that felt genuinely rooted, a campaign that reflected the diversity, beauty and unity of the Black community, not just acknowledged it.\n\n## The approach\nI developed the full visual identity for the series, starting with the logo. The concept was built around rotation and scale as a design language, a visual metaphor for how different people and perspectives come together to form something unified. Pan-African colours ran throughout, chosen deliberately to echo the empowerment of Africans both on the continent and across the diaspora.\n\nWorking as the sole designer, I led the creative direction end to end, collaborating with an in-house videographer and photographer, directing all shoots, editing the full video series and creating all motion graphics and animations myself.\n\n## The execution\nThe campaign ran across multiple touchpoints: visual identity deployed across in-person food and drink pop-ups and live events; motion graphics and animation for the video series and all event visuals, including guest-facing materials coordinated directly with speakers; and a video series directed, edited and screened on displays throughout The Guardian's head office, and shared via LinkedIn.\n\nI hosted the panel event How Black-Owned Brands Stand Firm in Power and Pride, bringing together Jojo Sonubi (Recess / No Signal Radio), Melina Mavoungou (UK Black Business Show) and Sophia Tassew (KHULA).\n\n## The impact\nThe campaign reached 150+ people through live activations and extended further via LinkedIn. Internally it became a reference point, directly shaping the new creative direction of The Guardian's D&I team and influencing how they approach visual identity and video content going forward. It is still being referenced today." },
    { id: 'track-and-play', name: 'Track + Play', client: "Track + Play", discipline: "Branding, motion and web", year: '',
      tags: ['Animation', 'Design'], folder: 'Community', bg: '#0D0D0D',
      summary: 'Identity, motion and website for the community sports day I co-founded.',
      quote: 'Giving adults the chance to relive the energy and magic of school sports day.',
      video: 'assets/video/track-and-play.mp4', poster: 'assets/work/track-and-play.webp', about: "## The brief\nTrack + Play is an annual community sports day co-founded through a collaboration between BULLY THE ROADS, the running collective I founded, and Rise and Rally, a social badminton group. The brief was to build a visual identity from scratch for an event rooted in a simple idea: giving adults the chance to relive the energy and magic of school sports day, in a welcoming, genuinely competitive environment.\n\n## The approach\nThe identity centres on a logo developed across multiple iterations, arriving at Track + Play in both longform and shortform versions. The + is deliberately layered. It positions Track as an interchangeable variable, allowing the brand to flex into new territories: Football + Play, Cook + Play and beyond. A strategic decision built into the logo from day one, keeping the identity cohesive while leaving room to grow.\n\n## The execution\nThe logo animation was designed to convey energy, momentum and competitive spirit. Print extended the identity into the physical event space: banners, staff lanyards and play cards. Each piece balanced the comedic charm of adults doing a sports day with the genuine competition at its core.\n\nTo announce the launch, I animated a visual teaser and did the voiceover, collaborating with Jude Amponsah on sound design to capture the mood of the brand. Promotional social content built awareness and established a visual narrative ahead of the event. A team photoshoot rounded it out, generating excitement and a little friendly rivalry before the big day. Alongside the event assets, I built the Track + Play website, extending the identity into a digital home for the brand.\n\n## The impact\nA brand built to last beyond a single event, with the strategic flexibility to expand into new formats and audiences as Track + Play grows.\n\nCredits: Temi Ajlore, Jude Amponsah, Kente Club, Kelvin Atiasé, Emma Hardy." },
    { id: 'bully-the-roads', name: 'BULLY THE ROADS', client: 'BULLY THE ROADS', discipline: 'Identity', year: '',
      tags: ['Design', 'Art direction'], folder: 'Community', bg: '#0B3A0E',
      summary: 'Identity for the London running club I founded.',
      img: 'assets/work/bully-the-roads.webp', about: '' },
    { id: 'everyone-wants-posters', name: 'Everyone Wants Posters', client: '', discipline: 'Poster design', year: '',
      tags: ['Design'], folder: 'Personal', bg: '#D6B624', ink: true,
      summary: 'My own series of typographic posters. Some of them are in the shop.',
      img: 'assets/work/everyone-wants-posters.webp', about: '' },
    { id: 'monzo', name: 'Monzo', client: 'The Guardian Labs', discipline: 'Display campaign', year: '',
      tags: ['Design', 'Animation'], folder: 'The Guardian', bg: '#10265A',
      summary: 'A display campaign for Monzo, made with The Guardian Labs.',
      img: 'assets/work/monzo-guardian-labs.webp', about: '' },
    { id: 'va', name: 'V&A Youth Collective', client: 'V&A', discipline: 'Event design', year: '',
      tags: ['Design', 'Art direction'], folder: 'Studio clients', bg: '#84181D',
      summary: "Event design for the V&A Youth Collective's Career Insight talk with Rule of Thirds.",
      img: 'assets/work/va.webp', about: '' },
    { id: 'nteriors', name: 'NTERIORS', client: 'NTERIORS', discipline: 'Identity', year: '',
      tags: ['Design'], folder: 'Studio clients', bg: '#F5F2EA', ink: true,
      summary: 'A brand identity for NTERIORS.',
      img: 'assets/work/nteriors.webp', about: '' }
  ],

  /* ---------- Shop ----------
     PLACEHOLDER prices (from the v1 prototype). Berns to confirm.
     Price = size.price, plus size.frame when a frame is chosen. */
  sizes: [
    { id: 'a3', label: 'A3', mm: [297, 420], price: 45, frame: 50 },
    { id: 'a2', label: 'A2', mm: [420, 594], price: 70, frame: 70 },
    { id: '50x70', label: '50 × 70 cm', mm: [500, 700], price: 90, frame: 85 }
  ],
  frames: [
    { id: 'none', label: 'Unframed', swatch: '#FFFFFF' },
    { id: 'black', label: 'Black', swatch: '#1A1A1A', col: '#1E1D1B', grain: '#000000' },
    { id: 'white', label: 'White', swatch: '#F4F4F2', col: '#F2F1ED', grain: '#DCD9D2' },
    { id: 'oak', label: 'Natural oak', swatch: '#C9A77C', col: '#C9A77C', grain: '#9C7A50' }
  ],

  /* Where the Buy button sends the order. Empty = email order (static hosting, e.g. GitHub Pages).
     On Hostinger set it to 'api/checkout.php' once api/config.php holds the Stripe key. */
  checkoutEndpoint: '',

  /* Each print can hold one Stripe Payment Link per size + frame,
     keyed "<size>-<frame>", e.g. checkout: { 'a2-oak': 'https://buy.stripe.com/...' }.
     Missing link = the buy button falls back to an email order. */
  posters: [
    { id: 'mistakes-are-the-portals-of-discovery', name: "Mistakes are the portals of discovery", img: 'assets/posters/mistakes-are-the-portals-of-discovery.webp', edition: 50, checkout: {} },
    { id: 'love-god-love-people', name: "Love God, love people", img: 'assets/posters/love-god-love-people.webp', edition: 50, checkout: {} },
    { id: 'home-is-where-the-heart-is', name: "Home is where the heart is", img: 'assets/posters/home-is-where-the-heart-is.webp', edition: 50, checkout: {} },
    { id: 'dont-get-tired-of-doing-good', name: "Don't get tired of doing good", img: 'assets/posters/dont-get-tired-of-doing-good.webp', edition: 50, checkout: {} },
    { id: 'day-by-day', name: "Day by day", img: 'assets/posters/day-by-day.webp', edition: 50, checkout: {} },
    { id: 'in-gods-time', name: "In God's time", img: 'assets/posters/in-gods-time.webp', edition: 50, checkout: {} },
    { id: 'breathe', name: 'Breathe', img: 'assets/posters/breathe.webp', edition: 50, checkout: {} },
    { id: 'pause', name: 'Pause', img: 'assets/posters/pause.webp', edition: 50, checkout: {} },
    { id: 'warmth', name: 'Warmth', img: 'assets/posters/warmth.webp', edition: 50, checkout: {} },
    { id: 'rest-is-productive', name: 'Rest is productive', img: 'assets/posters/rest-is-productive.webp', edition: 50, checkout: {} },
    { id: 'breath-in-breath-out', name: 'Breath in, breath out', img: 'assets/posters/breath-in-breath-out.webp', edition: 50, checkout: {} },
    { id: 'no-5', name: 'No. 5', img: 'assets/posters/no-5.webp', edition: 50, checkout: {} }
  ],

  credits: [
    ['Guardian Black History Month', 'Host'],
    ['Wave and Dave listening party', 'Presenter'],
    ['BULLY THE ROADS events', 'Host']
  ]
};
