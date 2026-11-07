/* =========================================================
   BERNS: site data. One place to edit work, prints and prices.
   Paths are relative to the site root; site.js adds the base.
   ========================================================= */
window.BERNS = {

  /* ---------- Studios: work ----------
     Order follows the live bernsds.com grid.
     `video` = short muted loop (assets/video), `img` = still.
     `about` = write-up for the project page. Empty = "Write-up to come". */
  projects: [
    { id: 'this-bed-i-made', name: 'This Bed I Made', client: 'Savvy Studios', discipline: 'Title design', year: '2026',
      video: 'assets/video/this-bed-i-made.mp4', poster: 'assets/video/this-bed-i-made.jpg', about: '' },
    { id: 'holibobs', name: 'Holibobs', client: 'The Guardian Labs', discipline: 'Campaign', year: '2026',
      video: 'assets/video/holibobs.mp4', poster: 'assets/video/holibobs.jpg', about: '' },
    { id: 'together', name: 'TOGETHER', client: 'Guardian Advertising', discipline: 'Identity and motion', year: '',
      img: 'assets/work/together.webp', about: '' },
    { id: 'track-and-play', name: 'Track + Play', client: 'Track + Play', discipline: 'Logo animation', year: '',
      video: 'assets/video/track-and-play.mp4', poster: 'assets/video/track-and-play.jpg', about: '' },
    { id: 'everyone-wants-posters', name: 'Everyone Wants Posters', client: '', discipline: 'Poster design', year: '',
      img: 'assets/work/everyone-wants-posters.webp', about: '' },
    { id: 'nteriors', name: 'NTERIORS', client: 'NTERIORS', discipline: 'Identity', year: '',
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
