// Structured content pulled from Molslinjen Brand- og designguide 2026.
// Kept as data so sections can render it interactively instead of as static slides.

export const colors = {
  primary: [
    {
      name: "Dyb Havblå",
      note: "Primær brandblå — brug også til pris-splashes",
      hex: "#002547",
      pantone: "295 C",
      cmyk: "90-50-0-75",
      rgb: "0-37-71",
      on: "light",
    },
    {
      name: "Hvid Slørsky",
      note: "Primær farve — brug også til pris-splashes",
      hex: "#ffffff",
      pantone: "—",
      cmyk: "0-0-0-0",
      rgb: "255-255-255",
      on: "dark",
    },
  ],
  secondary: [
    {
      name: "Havblå",
      note: "Sekundær brandblå — brug også til CTA",
      hex: "#005ba9",
      pantone: "2144 C",
      cmyk: "100-60-0-0",
      rgb: "0-91-169",
      on: "light",
    },
    {
      name: "60% af Havblå",
      note: "Bruges udelukkende som hav-farven i rutekort. Må IKKE bruges andre steder.",
      hex: "#7196ce",
      pantone: "—",
      cmyk: "—",
      rgb: "113-150-206",
      on: "light",
      restricted: true,
    },
    {
      name: "Smart Blå",
      note: "Bruges kun som CTA-farve",
      hex: "#00b5ed",
      pantone: "298 C",
      cmyk: "75-0-0-0",
      rgb: "0-181-237",
      on: "light",
      restricted: true,
    },
    {
      name: "Lavpris Orange",
      note: "Bruges kun til lavpris-splashes",
      hex: "#f18700",
      pantone: "6018 C",
      cmyk: "0-55-135-0",
      rgb: "241-135-0",
      on: "light",
      restricted: true,
    },
  ],
};

// Brand idé & kommunikationsløfte, s. 17–18.
export const brandIdea = {
  idea: "Den smarte vej",
  desc:
    "Målet er, at Molslinjen bliver synonymt med \"den smarte vej\" — og er top of mind, i det øjeblik en rute skal vælges.",
  promise:
    "Vi lover den rejsende en smartere måde at komme frem på: hurtigere, billigere eller mere oplevelsesrig end alternativet.",
};

// "Ét løfte, to mindsets" — budskabshuset, s. 20.
export const messagingHouse = {
  promise: "Den smarte vej",
  reasonToBelieve: "Kombardo-ånden",
  pillars: [
    {
      key: "genvej",
      label: "Genvej",
      desc: "Transport A→B, der sparer penge og kilometer.",
      lines: "Molslinjen, Alslinjen, Øresundslinjen, Kombardo Expressen",
    },
    {
      key: "destination",
      label: "Destination & oplevelse",
      desc: "Rejsetiden bliver til quality time.",
      lines: "Øresundslinjen, Bornholmslinjen, Langelandslinjen, Fanølinjen, Samsølinjen, Kosterlinjen, Kombardo Expressen",
    },
  ],
};

// Kernede brand-assets, s. 28–29 — det Molslinjen selv peger på som sine
// stærkeste, mest genkendelige aktiver på tværs af portefølje og medier.
export const categoryAssets = [
  { name: "Kombardo-sangen", desc: "Brandets jingle — re-versioneres efter sæson, anledning og linje." },
  { name: "Færgehornet", desc: "Lydlogoet — åbner/lukker musik, radiospots og anden lyd." },
  { name: "Rute-logoerne", desc: "Hvert rute får sit eget navnetræk sat sammen med bølgen." },
  { name: "Bølgen", desc: "Det grafiske symbol, der går igen på tværs af hele porteføljen." },
  { name: "Rutekortet", desc: "\"Den smarte vej\" visualiseret som grafisk rutekort-enhed." },
  { name: "De blå nuancer", desc: "Havblå-familien — det farvesystem, der binder alt visuelt sammen." },
];

// Logo-placering, s. 36 — bredden er altid en andel af formatets bredde,
// centreret øverst, men de faktiske safe zones for det aktuelle format
// afgør altid det endelige mål.
export const logoPlacement = [
  { key: "portrait", label: "Portræt", widthPct: 60 },
  { key: "landscape", label: "Landskab", widthPct: 25 },
];

export const closing = {
  line: "...OG TAK FOR TUREN.",
};

// Brand platform, s. 13 — "Den smarte vej".
export const platform = {
  ambition: "Vi vil være den rejsendes foretrukne valg.",
  position: "Den smarte vej",
  target: "Primært erhvervs- og fritidsrejsende, der kører bil i de relevante regioner.",
  values: [
    { name: "Servicemindet", desc: "Kundefokus, der optimerer rejseoplevelsen hele vejen." },
    { name: "Nytænkende", desc: "Finder nye, smartere måder at forbinde landsdele på." },
    { name: "Effektiv", desc: "Få folk hurtigt og problemfrit fra A til B." },
    { name: "Kompetent", desc: "Professionel drift, man kan stole på." },
  ],
};

// Onboard sub-brands, s. 10–11 — hver har sin egen guide som appendiks.
export const subBrands = [
  { name: "Mollys", line: "Molslinjen", desc: "Sandwich, burger, frugt, softice og kiosk." },
  { name: "Barista's", line: "Molslinjen", desc: "Espressobar med paninier, kager og croissanter." },
  { name: "Restauranten", line: "Molslinjen", desc: "Buffet og à la carte." },
  { name: "Aurora", line: "Wine & Dine", desc: "Skandinavisk-inspireret køkken, sæsonbuffet, smörgåsbord." },
  { name: "Libitum", line: "Social Dining, Tycho Brahe", desc: "Fælles ad-libitum-spisekoncept." },
  { name: "Shopping", line: "Øresundslinjen", desc: "Beauty, parfume, slik og drikkevarer." },
];

// Billed- og videostil, s. 66–73 — fem kontekster, hver med egne regler.
// `photo` er hentet direkte fra molslinjen.dk's forside (cdn.molslinjen.dk) —
// kun udfyldt hvor et reelt billede fra sitet matcher konteksten. De øvrige
// er ikke gættet på; hent dem fra brand.molslinjen.dk i stedet.
export const imageryCategories = [
  {
    key: "eksteriør",
    label: "Eksteriør",
    rules: [
      "Færge, destination og landskab tydeligt i billedet",
      "Kystlinjer, havne og landmærker der forankrer stedet",
      "Naturligt, dokumentarisk, klare farver, roligt dagslys",
    ],
    photo: {
      url: "https://cdn.molslinjen.dk/q2zlcs1o/biler-fra-faergen-600x600-m.jpg?rmode=crop&scale=both&format=webp&width=724&height=420&quality=81",
      alt: "Biler, herunder en Audi og en Volvo, der kører af en færge.",
    },
  },
  {
    key: "mad",
    label: "Mad ombord",
    rules: [
      "Autentiske, sanselige madmomenter tæt på og i øjenhøjde",
      "Naturligt lys, synlig tekstur, friske farver",
      "Spontant og imperfekt frem for opstillet",
    ],
  },
  {
    key: "interiør",
    label: "Interiør",
    rules: [
      "Moderne nordisk, imødekommende stemning",
      "Arkitektur, materialer og udsigt i fokus",
      "Mennesker må optræde diskret og naturligt",
    ],
    photo: {
      url: "https://cdn.molslinjen.dk/chwbatsr/band-paa-daek_400x255.jpg?rmode=crop&scale=both&format=webp&width=724&height=420&quality=81",
      alt: "Band på dæk",
    },
  },
  {
    key: "internt",
    label: "Internt",
    rules: [
      "Autentiske, varme portrætter af medarbejdere i naturlige omgivelser",
      "Rolige, dæmpede farver",
      "Det grønne uniformsstof må ikke bruges i denne billedtype",
    ],
  },
  {
    key: "b2b",
    label: "B2B",
    rules: [
      "Professionel tilstedeværelse, autentiske arbejdssituationer",
      "Balancér spontane øjeblikke med ren komposition",
      "Fremhæv gerne fordelene ved færgerejsen — udsigten, kaffen, komforten",
    ],
  },
];

// Ikoner hentet direkte fra molslinjen.dk's forside. Guiden markerer selv
// ikonstilen som "(TBD)" — men i praksis kører sitet allerede med et fast,
// rundt, blåt ikonsæt. Endnu en kilde-uoverensstemmelse værd at flage.
export const liveIcons = [
  { label: "Find vej", url: "https://cdn.molslinjen.dk/3mup4bew/find_vej_til_faergen_80x80px.png?rmode=crop&scale=both&format=webp&width=160&height=160&quality=81" },
  { label: "Mødetider", url: "https://cdn.molslinjen.dk/in3omvuc/moedetider_80x80px.png?rmode=crop&scale=both&format=webp&width=160&height=160&quality=81" },
  { label: "Parkering", url: "https://cdn.molslinjen.dk/jynacnce/parkering_80x80px.png?rmode=crop&scale=both&format=webp&width=160&height=160&quality=81" },
  { label: "Hittegods", url: "https://cdn.molslinjen.dk/g3nn4iop/hittegods_80x80px.png?rmode=crop&scale=both&format=webp&width=160&height=160&quality=81" },
  { label: "Handicap", url: "https://cdn.molslinjen.dk/i2khqr0t/handicap_daarligt_gaaende_80x80px.png?rmode=crop&scale=both&format=webp&width=160&height=160&quality=81" },
  { label: "Kæledyr", url: "https://cdn.molslinjen.dk/5wnh4yob/kaeledyr_med_ombord_80x80px.png?rmode=crop&scale=both&format=webp&width=160&height=160&quality=81" },
];

// Grafiske elementer ud over bølgen og rutekortet, s. 28–29, 59, 65.
export const graphicDevices = [
  {
    name: "Kombardo!-grafikken",
    desc: "Kan bruges sammen med overskrifter eller stå alene som et grafisk udråb. Sammen med tekst skaleres den til ca. 40% af bogstavernes højde — og må aldrig beskæres, så teksten bliver ulæselig.",
  },
  {
    name: "Kategori-assets",
    desc: "Færgen og Kombardo Expressen-bussen er brandets stærkeste genkendelsesassets. Video skal altid åbne eller lukke med et klip af færgen (eller bussen ved landbaseret kommunikation).",
  },
  {
    name: "Bardo & Vennerne",
    desc: "Et illustreret univers til den mere legende, fortællende kommunikation — et supplement til det øvrige visuelle udtryk, ikke en erstatning.",
  },
];

export const aiPolicy = {
  summary:
    "AI må bruges som kreativt værktøj til idéudvikling og udforskning af muligheder — men det færdige resultat skal altid kurateres, forfines og kvalitetstjekkes af mennesker. AI må aldrig stå alene som afsender.",
  disclosure:
    "Ved publicering af AI-genereret eller AI-manipuleret indhold skal de til enhver tid gældende retningslinjer for transparens/mærkning følges.",
};

export const lines = [
  {
    key: "molslinjen",
    name: "Molslinjen",
    tag: "Hovedbrand",
    route: "Odden–Ebeltoft · Odden–Aarhus",
    desc: "Den smarte vej, der sparer de rejsende for 200 km bag rattet på en retur mellem Øst- og Vestdanmark.",
    mindset: "genvej",
  },
  {
    key: "oresundslinjen",
    name: "Øresundslinjen",
    tag: "Linje",
    route: "Helsingør–Helsingborg",
    desc: "Den korteste og hurtigste måde at krydse Øresund på, døgnet rundt — og den grønne omstillings frontløber i færgetrafikken.",
    mindset: "begge",
  },
  {
    key: "bornholmslinjen",
    name: "Bornholmslinjen",
    tag: "Linje",
    route: "Bornholm ↔ Danmark, Sverige, Tyskland",
    desc: "Forbinder Bornholm med Danmark, Sverige og Tyskland.",
    mindset: "destination",
  },
  {
    key: "kosterlinjen",
    name: "Kosterlinjen",
    tag: "Linje",
    route: "Strömstad–Kosterøerne",
    desc: "En vigtig helårsforbindelse for beboere, erhvervsliv og besøgende i skærgården.",
    mindset: "destination",
  },
  {
    key: "smaoer",
    name: "Al-, Langelands-, Fanø- & Samsølinjen",
    tag: "Linjer",
    route: "Danmarks småøer ↔ fastlandet",
    desc: "Forbinder Danmarks småøer med fastlandet eller skaber genveje gennem landet.",
    mindset: "destination",
  },
  {
    key: "kombardo",
    name: "Kombardo Expressen",
    tag: "Lynbusser",
    route: "Jylland · Sjælland · Bornholm · Sverige",
    desc: "Lynbusser der forbinder landsdele med et hav af daglige afgange året rundt.",
    mindset: "begge",
    variant: true,
  },
];

// "Ét løfte, to mindsets" — messaging house, s. 20.
export const mindsets = {
  genvej: {
    label: "Genvej",
    desc: "Transport fra A til B, der sparer penge og kilometer.",
  },
  destination: {
    label: "Destination & oplevelse",
    desc: "Rejsetiden bliver til quality time.",
  },
  begge: {
    label: "Genvej + destination",
    desc: "Rummer begge mindsets, afhængig af hvem der rejser.",
  },
};

export const voice = [
  {
    trait: "Ligefrem",
    on: "Vi taler, som mennesker taler til hinanden — uformelt hverdagssprog, der siger tingene, som de er.",
    off: "Vi henvender os hermed til rejsende med henblik på optimering af overfartsoplevelsen.",
  },
  {
    trait: "Positiv med glimt i øjet",
    on: "Kom bar', du — vi har set dig fra broen.",
    off: "Vi gør opmærksom på, at der forekommer ventetid i myldretiden.",
  },
  {
    trait: "Aldrig platter",
    on: "Kombardo! Ta' den smarte vej.",
    off: "Bliv del af en revolutionerende rejseoplevelse, der for altid vil ændre din hverdag.",
  },
];

// Tone-dial: brand voice is always the left side, s. 23.
export const voiceDial = [
  { left: "Uformel", right: "Formel" },
  { left: "Enkel", right: "Kompleks" },
  { left: "Skandinavisk", right: "International" },
  { left: "For alle", right: "For de få" },
  { left: "Folkelig", right: "Akademisk" },
  { left: "Nytænkende", right: "Nostalgisk" },
];

// Real example headline/copy pairs, by context, s. 24. Litmus test from the
// guide: would a business paper or a fashion magazine run this phrase?
export const voiceExamples = [
  {
    context: "Færgerne",
    headline: "VI HAR ET HAV AF BILLIGE BILLETTER",
    copy: "Få lavprisbilletter fra xx,-",
  },
  {
    context: "Kombardo Expressen",
    headline: "GÆT, HVEM DER TOG DEN SMARTE VEJ",
    copy: "‘Shotgun!’ Book dit favoritsæde hjemmefra.",
  },
  {
    context: "B2B",
    headline: "OG TA' DEN SMARTE VEJ",
    copy: "Kør slæden ombord.",
  },
  {
    context: "Internt",
    headline: "STYR SIKKERT UDENOM DIGITALE PIRATER",
    copy: "Husk Moxso-sikkerhedstræningen — én lækage kan sænke hele skuden.",
  },
];

// Colors actually rendered on molslinjen.dk (inspected live, 2026-08-27) —
// notably different from the printed guide's Pantone-derived hex values.
// Kept separate and clearly labeled rather than silently merged into the
// documented palette above, since the two sources disagree and only
// Molslinjen can say which one is current.
export const liveObserved = {
  primaryDark: "#001651",
  ctaMint: "#16f6a5",
  secondaryIndigo: "#1f299c",
  note:
    "Live-farverne matcher ikke 1:1 med guidens Pantone-værdier (fx #001651 vs. Dyb Havblås #002547), og CTA-farven på knapper er en mintgrøn (#16f6a5), der slet ikke findes i den printede guide. Bekræft med Molslinjen, hvilken kilde der er gældende, før dette bruges i en leverance.",
};

export const typeScale = [
  { label: "Display", size: "clamp(2.6rem, 6vw, 5rem)", sample: "Kombardo!" },
  { label: "H2", size: "clamp(2rem, 4.2vw, 3.2rem)", sample: "Den smarte vej" },
  { label: "H3", size: "1.6rem", sample: "Farvesystemet" },
  { label: "Lead", size: "1.15rem", sample: "Blå er ikke bare en farve for os." },
  { label: "Body", size: "1rem", sample: "Korolev bruges som gennemgående typografi i Molslinjens kommunikation." },
];
