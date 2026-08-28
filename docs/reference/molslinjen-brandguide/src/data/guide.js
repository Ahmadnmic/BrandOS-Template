// The full guide as content pages. Written out properly rather than left as
// headline-plus-widget: the rules, specs and reasoning belong on the page.
// Facts, measurements and colour values come from Molslinjen's Brand- og
// designguide 2026; the wording here is ours.
//
// Pages that need a control to make their point are marked `interactive`
// and handled in App.jsx. Everything else is simply a page.

export const guidePages = [
  // ---------------------------------------------------------------- 01
  {
    id: "velkommen",
    chapter: "01 / Brandet",
    kicker: "01.1 / Velkommen",
    title: "Kombardo!",
    dark: true,
    blocks: [
      { type: "lead", text: "Molslinjen forbinder Danmark til lands og til vands. Denne guide samler, hvordan vi ser ud, lyder og opfører os — så vi trækker i samme retning, uanset hvem der laver materialet." },
      { type: "p", text: "Guiden er ikke en regelbog, du skal kunne udenad. Den er et opslagsværk: find kapitlet, tjek reglen, kom videre. Er du i tvivl om noget, står kontakten til brand-teamet sidst i guiden." },
      {
        type: "cards",
        numbered: true,
        items: [
          { title: "Hvem vi er", text: "Brandhierarki, platform og den kultur, der ligger bag — kapitel 01." },
          { title: "Hvad vi siger", text: "Kommunikationsplatform, budskabshus og tone of voice — kapitel 02 og 03." },
          { title: "Hvordan vi ser ud", text: "Logo, farver, typografi, grafik, billeder og lyd — kapitel 04 og 05." },
        ],
      },
      { type: "images", cols: 2, items: [
        { label: "Åbningsbillede: gæster ombord", note: "Lyst, naturligt lys, autentisk øjeblik" },
        { label: "Færge på åbent vand", note: "Kategori-asset, bruges gennemgående" },
      ] },
    ],
  },

  { interactive: "BrandStory", chapter: "01 / Brandet", label: "Manifest" },
  { interactive: "Lines", chapter: "01 / Brandet", label: "Brandhierarki" },
  { interactive: "SubBrands", chapter: "01 / Brandet", label: "Ombord" },
  { interactive: "Platform", chapter: "01 / Brandet", label: "Brandplatform" },

  {
    id: "kombardo-anden",
    chapter: "01 / Brandet",
    kicker: "01.5 / Kulturen",
    title: "Kombardo-ånden",
    dark: false,
    blocks: [
      { type: "lead", text: "\"Kom bar', du\" har lydt i velkomsten siden 1960'erne. Sammentrukket blev det til Kombardo — og det er stadig den korteste beskrivelse af, hvordan vi møder folk." },
      { type: "quote", text: "En stærk kultur skaber stærke resultater.", by: "Kombardo-ånden" },
      {
        type: "cards",
        items: [
          { title: "Imødekommende", text: "Gæsten skal føle sig ventet, ikke ekspederet. Det gælder ombord, i telefonen og i teksten på en annonce." },
          { title: "Servicemindet", text: "Vi løser tingene, før de bliver til et problem — og vi siger til, når noget ikke kan lade sig gøre." },
          { title: "Altid klar", text: "Ånden er ikke en kampagne. Den er den daglige standard, alle nye materialer skal kunne leve op til." },
        ],
      },
      { type: "note", text: "Kombardo-ånden er også vores reason to believe i budskabshuset. Når vi lover \"den smarte vej\", er det kulturen, der gør løftet troværdigt." },
    ],
  },

  // ---------------------------------------------------------------- 02
  {
    id: "brand-indsigt",
    chapter: "02 / Kommunikationsplatform",
    kicker: "02.1 / Indsigt",
    title: "Vejen man kender, føles kortere",
    dark: true,
    blocks: [
      { type: "lead", text: "Nogle af vores ruter er den eneste mulighed. Andre gange er vi oppe mod en bro — og så er det ikke kilometer, vi skal overvinde. Det er en vane." },
      { type: "p", text: "Der findes et velkendt psykologisk mønster: den rute, man plejer at tage, opleves som kortere og nemmere end den, man ikke kender. For en bilist, der altid har kørt over broen, er færgen derfor nærmest usynlig som mulighed — også når den reelt er hurtigere eller billigere." },
      { type: "p", text: "Det er hele grunden til, at vi kommunikerer, som vi gør. Vores opgave er sjældent at overbevise nogen om, at vi findes. Den er at få dem til at regne efter." },
      {
        type: "specs",
        items: [
          { k: "Barrieren", v: "Vanen, ikke prisen eller tiden" },
          { k: "Opgaven", v: "Gøre alternativet synligt og konkret" },
          { k: "Værktøjet", v: "Rutekortet — se kapitel 04" },
        ],
      },
    ],
  },

  { interactive: "Idea", chapter: "02 / Kommunikationsplatform", label: "Brand idé" },

  {
    id: "kommunikationsloefte",
    chapter: "02 / Kommunikationsplatform",
    kicker: "02.3 / Løftet",
    title: "Den smarte vej",
    dark: false,
    blocks: [
      { type: "lead", text: "Vi lover den rejsende en smartere måde at komme frem på. Smartere kan betyde hurtigere, billigere eller mere behagelig — afhængigt af hvem der rejser, og hvorfor." },
      {
        type: "cards",
        items: [
          { title: "Hurtigere", text: "Færre kilometer, kortere overfart eller en genvej, der sparer en omvej på flere timer." },
          { title: "Billigere", text: "Brændstof, broafgift og slid regnet med. Lavprisbilletter gør regnestykket endnu tydeligere." },
          { title: "Bedre", text: "Rejsetiden bliver til tid, man kan bruge på noget andet end at holde i en kø." },
        ],
      },
      { type: "p", text: "Målet er, at Molslinjen bliver synonymt med \"den smarte vej\" — og er top of mind i det sekund, en rute skal vælges. Derfor gentager vi løftet frem for at opfinde et nyt for hver kampagne." },
    ],
  },

  { interactive: "MessagingHouse", chapter: "02 / Kommunikationsplatform", label: "Budskabshus" },

  // ---------------------------------------------------------------- 03
  { interactive: "Voice", chapter: "03 / Tekst & tone-of-voice", label: "Vores stemme" },

  {
    id: "tekst-eksempler",
    chapter: "03 / Tekst & tone-of-voice",
    kicker: "03.2 / Eksempler",
    title: "Tonen i praksis",
    dark: false,
    blocks: [
      { type: "lead", text: "Samme stemme, fire kontekster. Overskriften bærer tonen; brødteksten leverer det konkrete." },
      {
        type: "cards",
        items: [
          { title: "Færgerne", text: "\"Vi har et hav af billige billetter\" — maritimt ordspil, der siger noget konkret om prisen." },
          { title: "Kombardo Expressen", text: "\"Gæt, hvem der tog den smarte vej\" — trafikjargon og et glimt i øjet." },
          { title: "B2B", text: "Samme stemme, strammere fokus: fordelen for virksomheden, ikke for ferien." },
          { title: "Internt", text: "\"Styr sikkert udenom digitale pirater\" — alvorligt emne, uformel indpakning." },
        ],
      },
      { type: "p", text: "Maritime ord og trafikjargon ligger naturligt til os, men skal doseres. Bliver billedsproget for tykt, holder folk op med at høre budskabet og begynder at høre kampagnen." },
      { type: "note", text: "Lakmusprøven: ville et erhvervsmedie eller et livsstilsmagasin bruge den formulering i en almindelig artikel? Er svaret nej, er den sandsynligvis for meget." },
    ],
  },

  // ---------------------------------------------------------------- 04
  {
    id: "kategori-assets",
    chapter: "04 / Visuel identitet",
    kicker: "04.1 / Kategori assets",
    title: "Færgen og bussen",
    dark: true,
    blocks: [
      { type: "lead", text: "Færgen er vores tydeligste genkendelsestegn. Den skal bruges aktivt — ikke gemmes væk, fordi materialet handler om noget andet." },
      {
        type: "list",
        items: [
          "Video skal åbne eller lukke med et klip af færgen.",
          "I landbaseret kommunikation gælder samme regel for Kombardo Expressens busser.",
          "Færgen kan fritlægges og bruges som grafisk element, fx i bunden af en annonce.",
          "Den behøver ikke indgå i formelle formater som brevpapir, visitkort og interne plakater.",
        ],
      },
      { type: "images", cols: 3, items: [
        { label: "Færge, fritlagt", note: "Til brug som grafisk element", ratio: "4 / 3" },
        { label: "Færge i landskab", note: "Kyst, havn eller landmærke i billedet", ratio: "4 / 3" },
        { label: "Kombardo Expressen-bus", note: "Landbaseret kommunikation", ratio: "4 / 3" },
      ] },
    ],
  },

  {
    id: "brand-assets",
    chapter: "04 / Visuel identitet",
    kicker: "04.2 / Brand assets",
    title: "Det, folk genkender os på",
    dark: false,
    blocks: [
      { type: "lead", text: "Seks aktiver bærer genkendeligheden. Jo mere konsekvent de bruges, jo mindre forklaring kræver resten af materialet." },
      {
        type: "cards",
        items: [
          { title: "Kombardo-sangen", text: "Brandets jingle. Kan gen-versioneres efter sæson, anledning og linje uden at miste kendingen." },
          { title: "Færgehornet", text: "Vores lydlogo. Åbner eller lukker musik, radiospots og anden lydkommunikation." },
          { title: "Rute-logoerne", text: "Hver linje har sit eget navnetræk sat sammen med den samme bølge." },
          { title: "Bølgen", text: "Logosymbolet — blødt, venligt og med fart på. Kan også stå alene som grafik." },
          { title: "Rutekortet", text: "Den grafiske måde at vise \"den smarte vej\" op mod alternativet." },
          { title: "De blå nuancer", text: "Havblå-familien binder alt visuelt sammen på tværs af porteføljen." },
        ],
      },
    ],
  },

  {
    id: "logo-varianter",
    chapter: "04 / Visuel identitet",
    kicker: "04.3 / Logoer",
    title: "Ét navnetræk pr. linje",
    dark: false,
    blocks: [
      { type: "lead", text: "Alle linjer deler den samme bølge, den samme skrift og den samme blå. Det er dét, der gør porteføljen til ét brand frem for otte." },
      { type: "p", text: "Får en rute et nyt navn, designes logoet efter samme princip — bølgen genbruges uændret, og navnetrækket sættes i den samme skrift. Der laves ikke varianter af selve bølgen pr. linje." },
      {
        type: "specs",
        items: [
          { k: "Færgeruter", v: "MOLSLINJEN, BORNHOLMSLINJEN, KOSTERLINJEN, ØRESUNDSLINJEN" },
          { k: "Småøer", v: "ALSLINJEN, LANGELANDSLINJEN, FANØLINJEN, SAMSØLINJEN" },
          { k: "Landbaseret", v: "KOMBARDO EXPRESSEN" },
          { k: "Navneregel", v: "Virksomheden skrives Molslinjen. Ruterne skrives med versaler." },
        ],
      },
      { type: "images", cols: 2, items: [
        { label: "Logo-oversigt, alle linjer", note: "Vektorfiler i asset-biblioteket" },
        { label: "Logo i brug på skib", note: "Placering på skrog" },
      ] },
    ],
  },

  { interactive: "LogoColors", chapter: "04 / Visuel identitet", label: "Logofarver" },

  {
    id: "logo-regler",
    chapter: "04 / Visuel identitet",
    kicker: "04.5 / Logoregler",
    title: "Logoregler",
    dark: true,
    blocks: [
      { type: "lead", text: "Reglerne er få, og de handler alle om det samme: logoet skal kunne læses, og det skal se ud, som det er tegnet." },
      {
        type: "rules",
        dos: [
          "Brug kun brand-farver.",
          "Hold kontrasten høj og læsbar i enhver baggrund.",
          "Sæt linjenavnet i hvid eller Dyb Havblå.",
          "Hold bølgen i hvid eller Havblå i linjelogoerne.",
        ],
        donts: [
          "Rotér ikke logoet.",
          "Beskær ikke logoet, så det bliver ulæseligt.",
          "Giv ikke logoet outline.",
          "Byg ikke egne farvekombinationer ud over de tre godkendte.",
        ],
      },
      { type: "note", text: "Er du i tvivl om en placering, er det læsbarheden, der afgør — ikke om der teknisk set er plads." },
    ],
  },

  {
    id: "respektafstand",
    chapter: "04 / Visuel identitet",
    kicker: "04.7 / Respektafstand",
    title: "Giv logoet luft",
    dark: false,
    blocks: [
      { type: "lead", text: "Der skal være fri plads hele vejen rundt om logoet. Ingen tekst, billedkant eller grafik må trænge ind i zonen." },
      { type: "p", text: "Frizonen skalerer med logoet: bliver mærket større, vokser afstanden tilsvarende, så forholdet holder. Det gælder både i print og digitalt." },
      { type: "note", text: "Guiden viser respektafstanden som diagram og angiver ingen talværdi i teksten. Skal du bruge et præcist mål, så få det bekræftet af brand-teamet frem for at måle efter på en skærm." },
      { type: "images", cols: 1, items: [
        { label: "Diagram: respektafstand", note: "Findes som opsætning i InDesign-dokumenterne", ratio: "16 / 7" },
      ] },
    ],
  },

  { interactive: "LogoPlacement", chapter: "04 / Visuel identitet", label: "Logoplacering" },
  { interactive: "LogoWave", chapter: "04 / Visuel identitet", label: "Bølgen" },

  {
    id: "boelgen-anvendelse",
    chapter: "04 / Visuel identitet",
    kicker: "04.9 / Bølgen som grafik",
    title: "Bølgen som grafisk element",
    dark: false,
    blocks: [
      { type: "lead", text: "Bølgen må gerne forlade logoet og blive til grafik — baggrund, tekstfelt eller formmæssigt anslag. Men den skal skaleres op og beskæres, ikke gengives i sin helhed." },
      {
        type: "list",
        items: [
          "Brug et udsnit af bølgens øverste del som baggrundsgrafik.",
          "Skalér den maksimalt op, så højst omkring halvdelen er synlig — det holder kompleksiteten nede.",
          "Formen kan bruges som ramme om et tekstfelt.",
          "Som grafisk element må den optræde i Dyb Havblå, Havblå og Hvid Slørsky.",
        ],
      },
      {
        type: "rules",
        dos: [
          "Beskær fra toppen.",
          "Lad udsnittet være roligt og genkendeligt.",
        ],
        donts: [
          "Beskær ikke, så fokus flytter til bunden af formen.",
          "Vis ikke hele bølgen i fuld størrelse som baggrund.",
        ],
      },
      { type: "note", text: "Placeres bølgen i en cirkel — favicon eller profilbillede — virker den optisk for høj, fordi formen er tung i bunden. Ryk den en anelse ned, så den ser centreret ud." },
    ],
  },

  { interactive: "Colors", chapter: "04 / Visuel identitet", label: "Farvesystemet" },
  { interactive: "ColorSplit", chapter: "04 / Visuel identitet", label: "Farvefordeling" },
  { interactive: "RouteMap", chapter: "04 / Visuel identitet", label: "Rutekortet" },
  { interactive: "Typography", chapter: "04 / Visuel identitet", label: "Typografi" },

  {
    id: "typografi-regler",
    chapter: "04 / Visuel identitet",
    kicker: "04.17 / Typografi",
    title: "Typografiregler",
    dark: true,
    blocks: [
      { type: "lead", text: "Korolev bruges hele vejen igennem — fra overskrift til brødtekst. Forskellen ligger i vægt, versalisering og luft, ikke i skriftvalg." },
      {
        type: "specs",
        items: [
          { k: "Overskrifter", v: "Bold Italic, versaler. Knibning: Metrics. Spatiering: 0. Linjeafstand = punktstørrelsen." },
          { k: "Underoverskrifter", v: "Bold, små bogstaver. Størrelse = 75% af overskriften." },
          { k: "Brødtekst", v: "Medium eller Light, små bogstaver. Spatiering: 10. Linjeafstand = skriftstørrelse × 1,5." },
          { k: "Undertekster", v: "Medium eller Light, placeret i en boks med afrundede hjørner." },
        ],
      },
      { type: "p", text: "Er en overskrift for lang til at stå i ét greb, kan sætningen brydes, så halen sættes i Bold med små bogstaver. Det giver luft uden at skifte skrift." },
      { type: "note", text: "Apostroffer i en kursiveret overskrift sættes oprejst — fx i \"Ta' den smarte vej\". Det er en detalje, men den ses." },
    ],
  },

  { interactive: "Captions", chapter: "04 / Visuel identitet", label: "Undertekster" },

  {
    id: "kombardo-grafik",
    chapter: "04 / Visuel identitet",
    kicker: "04.20 / Grafik",
    title: "Kombardo!-grafikken",
    dark: false,
    blocks: [
      { type: "lead", text: "Kombardo! kan bruges som et grafisk udråb — enten sammen med en overskrift eller alene som afsluttende signatur." },
      {
        type: "list",
        items: [
          "Sammen med tekst skaleres den til omkring 40% af bogstavernes højde.",
          "Den kan stå alene, hvor der er brug for et anslag frem for et budskab.",
          "Den må ikke beskæres, så ordet bliver ulæseligt.",
        ],
      },
      { type: "images", cols: 2, items: [
        { label: "Kombardo! sammen med overskrift", note: "Viser størrelsesforholdet" },
        { label: "Kombardo! som selvstændigt element", note: "Fx afslutning på annonce" },
      ] },
    ],
  },

  { interactive: "Components", chapter: "04 / Visuel identitet", label: "Splashes & knapper" },

  {
    id: "ikonstil",
    chapter: "04 / Visuel identitet",
    kicker: "04.23 / Ikonstil",
    title: "Ikonstil",
    dark: false,
    blocks: [
      { type: "note", text: "Guiden markerer selv dette afsnit som (TBD). Retningen er beskrevet, men stilen er ikke endeligt fastlagt — så byg ikke et komplet ikonsæt på den alene." },
      { type: "lead", text: "Retningen er enkel, moderne linjegrafik: genkendelig ved første blik, venlig i formen, uden unødige detaljer." },
      {
        type: "list",
        items: [
          "Ensartet stregtykkelse på tværs af hele sættet.",
          "Afrundede streg-ender, så udtrykket matcher bølgens bløde form.",
          "Simpelt formsprog, der også holder i små størrelser.",
          "Samme opbygning på tværs af medier, så familien hænger sammen.",
        ],
      },
      { type: "p", text: "I praksis kører molslinjen.dk allerede med et fast sæt runde, blå ikoner. Det er værd at afklare med brand-teamet, om det sæt er den gældende retning, før der tegnes nyt." },
      { type: "images", cols: 1, items: [
        { label: "Ikonsæt, endeligt", note: "Afventer at afsnittet lukkes (TBD)", ratio: "16 / 6" },
      ] },
    ],
  },

  {
    id: "illustrationer",
    chapter: "04 / Visuel identitet",
    kicker: "04.24 / Illustrationer",
    title: "Bardo & Vennerne",
    dark: true,
    blocks: [
      { type: "lead", text: "Et illustreret univers, der giver os en mere legende og fortællende stemme — særligt over for børn og familier." },
      { type: "p", text: "Universet er et supplement til den visuelle identitet, ikke en erstatning for den. Det bruges, hvor tonen må være løsere: ombord-materiale til børn, aktiviteter, sæsonindhold. Det erstatter ikke fotografi i den almindelige kommunikation." },
      { type: "images", cols: 3, items: [
        { label: "Bardo, hovedfigur", note: "Illustrationer leveres af Molslinjen", ratio: "3 / 4" },
        { label: "Vennerne", note: "Bifigurer i universet", ratio: "3 / 4" },
        { label: "Univers i brug", note: "Eksempel på anvendelse", ratio: "3 / 4" },
      ] },
    ],
  },

  { interactive: "Imagery", chapter: "04 / Visuel identitet", label: "Billedstil" },

  {
    id: "videostil",
    chapter: "04 / Visuel identitet",
    kicker: "04.29 / Videostil",
    title: "Video",
    dark: false,
    blocks: [
      { type: "lead", text: "Video følger samme look som fotografiet: naturligt lys, nordiske toner og ægte øjeblikke frem for opstillede scener." },
      {
        type: "list",
        items: [
          "Åbn eller luk altid med et klip af færgen — eller bussen i landbaseret kommunikation.",
          "Hold klippene rolige; tempoet skal komme fra indholdet, ikke fra klipningen.",
          "Brug Kombardo-sangen eller færgehornet, hvor der er lyd.",
          "Beskær til kanalens format frem for at genbruge samme udklip alle steder.",
        ],
      },
      { type: "images", cols: 3, items: [
        { label: "Åbningsklip: færge", note: "Obligatorisk åbner eller lukker", ratio: "16 / 9" },
        { label: "Sociale formater", note: "Feed, story og reel", ratio: "9 / 16" },
        { label: "Storyboard-eksempel", note: "Opbygning af kort spot", ratio: "16 / 9" },
      ] },
    ],
  },

  // ---------------------------------------------------------------- 05
  {
    id: "lyddesign",
    chapter: "05 / Lyddesign",
    kicker: "05.1 / Lyd",
    title: "Sangen og hornet",
    dark: true,
    blocks: [
      { type: "lead", text: "Lyd er et af vores stærkeste genkendelsestegn — og det eneste, der virker, uden at nogen kigger på skærmen." },
      {
        type: "cards",
        items: [
          { title: "Kombardo-sangen", text: "Brandets jingle, bygget over \"den smarte vej\". Den kan gen-versioneres efter sæson, anledning og linje, så længe kendingen består." },
          { title: "Færgehornet", text: "Vores lydlogo. Bruges som åbner eller lukker på musik, radiospots og anden lydkommunikation." },
        ],
      },
      { type: "p", text: "Brug lyden konsekvent frem for at finde ny musik til hver kampagne. Genkendelse opstår ved gentagelse — det er hele pointen med at have et lydlogo." },
      { type: "note", text: "Lydfilerne følger ikke med denne guide. De hentes i asset-biblioteket sammen med det øvrige materiale." },
    ],
  },

  // ---------------------------------------------------------------- 06
  { interactive: "AiPolicy", chapter: "06 / Brug af AI", label: "AI som værktøj" },
];
