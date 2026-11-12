/* =========================================================
   BERNS: site data. One place to edit work, prints and prices.
   Paths are relative to the site root; site.js adds the base.
   ========================================================= */
window.BERNS = {

  /* ---------- Work ----------
     `video` = short muted loop (assets/video), `img` = still.
     `about` = write-up for the project page. Empty = "Write-up to come". */
  /* Work page cards. `tags` drive the filters (Animation, Design, Art direction),
     `folder` groups them in Folders view. `bg` is the card colour around the work, `ink` = dark text on it.
     Order follows the live bernsds.com grid. */
  projects: [
    { id: 'this-bed-i-made', name: 'This Bed I Made', client: "Guvna B", discipline: "Art direction and motion", year: '2026',
      tags: ['Animation', 'Design', 'Art direction'], folder: 'Studio clients', bg: '#121A19',
      cover: 'assets/work/this-bed-i-made-cover.webp', video: 'assets/video/this-bed-i-made.mp4', poster: 'assets/video/this-bed-i-made.jpg', about: "## The brief\nGuvna B approached me directly to lead the art direction and visual identity for his comeback album, This Bed I Made, his return to music after a period away. The creative needed to carry the weight of the album's central thesis: no one above accountability, no one beyond redemption.\n\n## The approach\nWith significant creative freedom, I explored multiple directions for the album cover, typography and overall visual language before landing on the final system. The typography was sourced and refined to feel right for the record, weighty but considered.\n\nThe illustration work centred on an abstract coin design, a dual-faced motif representing the choice between two states. The coin was later engraved and used as a physical prop in the film.\n\n## The execution\nThe project spanned the full visual ecosystem of the album: front and back cover, vinyl packaging, merchandise, digital and social assets, film assets and animation. The engraved coin I illustrated became a key element in the accompanying film production.\n\n## The impact\nA strong collaboration with a three-time MOBO Award winner, delivered across every touchpoint of the release." },
    { id: 'holibobs', name: 'Holibobs', client: 'The Guardian Labs', discipline: 'Campaign', year: '2026',
      tags: ['Art direction', 'Animation'], folder: 'The Guardian', bg: '#E3B04B', ink: true,
      video: 'assets/video/holibobs.mp4', poster: 'assets/video/holibobs.jpg', about: '' },
    { id: 'together', name: 'TOGETHER', client: "The Guardian", discipline: "Identity and motion", year: '',
      tags: ['Design', 'Animation'], folder: 'The Guardian', bg: '#D02E2E',
      img: 'assets/work/together.webp', about: "## The brief\nBlack History Month needed to be more than a moment. As the lead designer, I initiated the concept internally and was given full creative freedom to build something that felt genuinely rooted, a campaign that reflected the diversity, beauty and unity of the Black community, not just acknowledged it.\n\n## The approach\nI developed the full visual identity for the series, starting with the logo. The concept was built around rotation and scale as a design language, a visual metaphor for how different people and perspectives come together to form something unified. Pan-African colours ran throughout, chosen deliberately to echo the empowerment of Africans both on the continent and across the diaspora.\n\nWorking as the sole designer, I led the creative direction end to end, collaborating with an in-house videographer and photographer, directing all shoots, editing the full video series and creating all motion graphics and animations myself.\n\n## The execution\nThe campaign ran across multiple touchpoints: visual identity deployed across in-person food and drink pop-ups and live events; motion graphics and animation for the video series and all event visuals, including guest-facing materials coordinated directly with speakers; and a video series directed, edited and screened on displays throughout The Guardian's head office, and shared via LinkedIn.\n\nI hosted the panel event How Black-Owned Brands Stand Firm in Power and Pride, bringing together Jojo Sonubi (Recess / No Signal Radio), Melina Mavoungou (UK Black Business Show) and Sophia Tassew (KHULA).\n\n## The impact\nThe campaign reached 150+ people through live activations and extended further via LinkedIn. Internally it became a reference point, directly shaping the new creative direction of The Guardian's D&I team and influencing how they approach visual identity and video content going forward. It is still being referenced today." },
    { id: 'track-and-play', name: 'Track + Play', client: "Track + Play", discipline: "Branding, motion and web", year: '',
      tags: ['Animation', 'Design'], folder: 'Community', bg: '#0B0B0B',
      video: 'assets/video/track-and-play.mp4', poster: 'assets/work/track-and-play.webp', about: "## The brief\nTrack + Play is an annual community sports day co-founded through a collaboration between BULLY THE ROADS, the running collective I founded, and Rise and Rally, a social badminton group. The brief was to build a visual identity from scratch for an event rooted in a simple idea: giving adults the chance to relive the energy and magic of school sports day, in a welcoming, genuinely competitive environment.\n\n## The approach\nThe identity centres on a logo developed across multiple iterations, arriving at Track + Play in both longform and shortform versions. The + is deliberately layered. It positions Track as an interchangeable variable, allowing the brand to flex into new territories: Football + Play, Cook + Play and beyond. A strategic decision built into the logo from day one, keeping the identity cohesive while leaving room to grow.\n\n## The execution\nThe logo animation was designed to convey energy, momentum and competitive spirit. Print extended the identity into the physical event space: banners, staff lanyards and play cards. Each piece balanced the comedic charm of adults doing a sports day with the genuine competition at its core.\n\nTo announce the launch, I animated a visual teaser and did the voiceover, collaborating with Jude Amponsah on sound design to capture the mood of the brand. Promotional social content built awareness and established a visual narrative ahead of the event. A team photoshoot rounded it out, generating excitement and a little friendly rivalry before the big day. Alongside the event assets, I built the Track + Play website, extending the identity into a digital home for the brand.\n\n## The impact\nA brand built to last beyond a single event, with the strategic flexibility to expand into new formats and audiences as Track + Play grows.\n\nCredits: Temi Ajlore, Jude Amponsah, Kente Club, Kelvin Atiasé, Emma Hardy." },
    { id: 'bully-the-roads', name: 'BULLY THE ROADS', client: 'BULLY THE ROADS', discipline: 'Identity', year: '',
      tags: ['Design', 'Art direction'], folder: 'Community', bg: '#C4573A',
      img: 'assets/work/bully-the-roads.webp', about: '' },
    { id: 'everyone-wants-posters', name: 'Everyone Wants Posters', client: '', discipline: 'Poster design', year: '',
      tags: ['Design'], folder: 'Personal', bg: '#F2C230', ink: true,
      img: 'assets/work/everyone-wants-posters.webp', about: '' },
    { id: 'monzo', name: 'Monzo', client: 'The Guardian Labs', discipline: 'Display campaign', year: '',
      tags: ['Design', 'Animation'], folder: 'The Guardian', bg: '#14233C',
      img: 'assets/work/monzo-guardian-labs.webp', about: '' },
    { id: 'va', name: 'V&A Youth Collective', client: 'V&A', discipline: 'Event design', year: '',
      tags: ['Design', 'Art direction'], folder: 'Studio clients', bg: '#E8E9EA', ink: true,
      img: 'assets/work/va.webp', about: '' },
    { id: 'nteriors', name: 'NTERIORS', client: 'NTERIORS', discipline: 'Identity', year: '',
      tags: ['Design'], folder: 'Studio clients', bg: '#F5F2EA', ink: true,
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
