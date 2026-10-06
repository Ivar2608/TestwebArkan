// ==========================================================================
// ARKANUM - Interactive Visual & Form Script Engine
// Setting: Sphäre Anubia - Labyrinth des verrückten Magiers
// ==========================================================================

// --- CONFIG & UTILS ---
// Zentrale Konfiguration (wird zum Release befüllt)
const DISCORD_INVITE_URL = ''; 

const galleryConfig = {
    folder: '', 
    files: [
        'image1.png', 'image2.png', 'image3.png', 'image4.png',
        'image5.png', 'image6.png', 'image7.png', 'image8.png'
    ] 
};

const STATE = { IDLE: 'IDLE', SURGE: 'SURGE', COOLDOWN: 'COOLDOWN' };
let currentState = STATE.IDLE;
let currentPageId = 'portal'; 
let isTransitioning = false; 

let idleTarget = 15; 
let idleCurrent = 15; 
let lastRandomChange = 0;
let currentRotation = 0; 
let mousePos = { x: -1000, y: -1000 };

// --- VÖLKER-DATENBANK DER SPHÄRE ANUBIA (KAPITEL 5) ---
const RACE_SPECS = {
    'Menschen': { minH: 1.65, maxH: 2.00, magic: ['Arkan', 'Feuer', 'Erde', 'Wasser', 'Eis', 'Luft', 'Licht', 'Schatten', 'Blut', 'Elementar'], maxMagic: 2, notes: 'Hochgradig anpassungsfähig, robust und willensstark.' },
    'Vampire': { minH: 1.60, maxH: 2.00, magic: ['Arkan', 'Feuer', 'Schatten', 'Blut'], maxMagic: 2, notes: 'Blass, Fangzähne. Verbrennen im Sonnenlicht langsam zu Asche. Lichtmagie heilt nicht, sondern verletzt schwer! Fledermausgestalt begrenzt Magie auf max. 1 Zusatzelement.' },
    'Zwerge': { minH: 1.30, maxH: 1.50, magic: ['Arkan', 'Feuer', 'Erde', 'Luft', 'Licht', 'Schatten', 'Blut'], maxMagic: 2, notes: 'Gedrungene Gestalt, meisterhafte Schmiede. Führen das Buch des Grolls. Magie selten (Stein oder Schmiedefeuer).' },
    'Halbriesen': { minH: 2.10, maxH: 2.40, magic: ['Arkan', 'Erde', 'Luft', 'Wasser', 'Eis', 'Feuer', 'Elementar'], maxMagic: 2, notes: 'Gewaltige Statur, übermenschliche Kraft. Berg- und Hügelhalbriesen.' },
    'Minotauren': { minH: 1.90, maxH: 2.30, magic: ['Arkan', 'Erde', 'Elementar'], maxMagic: 2, notes: 'Massiver Körperbau, Rinderkopf/Hörner, Hufe, Fell. Tief verbunden mit Ehre und Bräuchen.' },
    'Drachengeborene': { minH: 1.85, maxH: 2.10, magic: ['Arkan', 'Feuer', 'Erde', 'Wasser', 'Eis', 'Luft', 'Licht'], maxMagic: 2, notes: 'Schuppige Haut, Hörner, geschlitzte Iriden, teils Schweif und Flügel. Fliegen erfordert 4 Wochen Wartezeit.' },
    'Orks': { minH: 1.90, maxH: 2.20, magic: ['Arkan', 'Feuer', 'Erde', 'Wasser', 'Eis', 'Luft', 'Schatten', 'Blut', 'Elementar'], maxMagic: 2, notes: 'Groß, stämmig, Hauer, grünliche Haut. Clan-Ehre steht an oberster Stelle.' },
    'Faun / Satyr': { minH: 1.60, maxH: 1.90, magic: ['Arkan', 'Feuer', 'Erde', 'Wasser', 'Luft', 'Licht', 'Elementar'], maxMagic: 2, notes: 'Hörner, Hufe, behaarte Beine. Naturverbunden, lebensfroh, musikalisch.' },
    'Mischwesen': { minH: 1.60, maxH: 2.20, magic: ['Arkan', 'Feuer', 'Erde', 'Wasser', 'Eis', 'Luft', 'Licht', 'Schatten', 'Blut', 'Elementar'], maxMagic: 2, notes: 'Verschmolzen mit Seelentier. Vollmond-Einfluss: Balztrieb, starke Stimmungsschwankungen.' },
    'Gestaltwandler': { minH: 1.50, maxH: 2.10, magic: ['Arkan', 'Feuer', 'Erde', 'Wasser', 'Eis', 'Luft', 'Schatten'], maxMagic: 1, notes: 'Wandlung gilt als mächtiger magischer Akt (Max. 1 weitere Magieform wählbar!). In Tierform KEINERLEI Sprechen möglich!' },
    'Lykaner (Werwölfe)': { minH: 1.80, maxH: 2.10, magic: ['Arkan', 'Schatten', 'Blut'], maxMagic: 1, notes: 'Wolfshybrid bei Vollmond. STUMMES RP! Kein Sprechen, kein Öffnen von Türen/Truhen im Tierleib! Max. 1 weitere Magieform.' },
    'Succubus / Incubus': { minH: 1.60, maxH: 1.90, magic: ['Arkan', 'Blut', 'Schatten', 'Feuer'], maxMagic: 2, notes: 'Dämonische Hörner, Flügel, Schweif, übernatürliche Verführungskraft.' },
    'Halbdämon / Tiefling': { minH: 1.60, maxH: 1.90, magic: ['Arkan', 'Blut', 'Schatten', 'Feuer', 'Elementar'], maxMagic: 2, notes: 'Hörner, Schweif, auffällige Hauttöne, Klauen. Dämonisches Erbe.' },
    'Spektrale (Geister)': { minH: 1.40, maxH: 2.10, magic: ['Arkan', 'Schatten', 'Luft', 'Eis', 'Elementar'], maxMagic: 2, notes: 'Durchscheinend, schwebend, kalte Aura. Gebunden an Traumata oder Eide.' },
    'Feenwesen (Eldarin)': { minH: 1.40, maxH: 1.60, magic: ['Arkan', 'Feuer', 'Erde', 'Wasser', 'Eis', 'Luft', 'Licht', 'Schatten', 'Blut', 'Elementar'], maxMagic: 2, notes: 'Filigrane Statur, leuchtende Augen, florale Merkmale, zarte Flügel.' },
    'Goblins': { minH: 1.20, maxH: 1.40, magic: ['Arkan', 'Feuer', 'Schatten', 'Blut'], maxMagic: 2, notes: 'Spitze Ohren, scharfe Zähne, flink, gerissen, schelmisch.' },
    'Halblinge': { minH: 1.20, maxH: 1.40, magic: ['Arkan', 'Feuer', 'Erde', 'Wasser', 'Eis', 'Elementar', 'Schatten'], maxMagic: 2, notes: 'Barfuß, behaarte Füße, lockiges Haar, tapfer und stets hungrig (7 Mahlzeiten/Tag).' },
    // Elfen-Kompendium
    'Waldelfen': { minH: 1.70, maxH: 1.85, magic: ['Natur/Erde', 'Wasser', 'Arkan'], maxMagic: 2, notes: 'Isoliert in Waldsiedlungen. Unangekündigte Eindringlinge werden getötet.' },
    'Hochelfen': { minH: 1.70, maxH: 2.00, magic: ['Arkan', 'Feuer', 'Licht'], maxMagic: 2, notes: 'Hochkultur im Anubischen Rat, Magiefokus, Kristalle, Elfenstahl. Verehrung: Phönix.' },
    'Dunkelelfen': { minH: 1.70, maxH: 1.85, magic: ['Dunkel/Schatten', 'Feuer', 'Arkan'], maxMagic: 2, notes: 'Leben im Underdark. Violett-schwarze Haut. STRENG: Niemals Lichtmagie!' },
    'Astralelfen': { minH: 1.75, maxH: 2.20, magic: ['Arkan'], maxMagic: 1, notes: 'HINWEIS: Nicht als Startrasse wählbar! Man wird im RP dazu wiedergeboren. Dienen dem Grauen Meister.' },
    'Sonnenelfen': { minH: 1.65, maxH: 2.00, magic: ['Feuer', 'Licht', 'Arkan'], maxMagic: 2, notes: 'Sonnenmagie, stolze Edle der Sphäre.' },
    'Mondelfen': { minH: 1.65, maxH: 2.00, magic: ['Schatten', 'Wasser', 'Arkan'], maxMagic: 2, notes: 'Stille Wächter unter den Gestirnen.' },
    'Meereselfen': { minH: 1.65, maxH: 2.00, magic: ['Wasser', 'Eis', 'Arkan'], maxMagic: 2, notes: 'Verbunden mit den tiefen Gewässern der Sphäre.' },
    'Neue Rasse': { minH: 1.20, maxH: 2.40, magic: ['Arkan', 'Feuer', 'Erde', 'Wasser', 'Eis', 'Luft', 'Licht', 'Schatten'], maxMagic: 2, notes: 'Unbekanntes Blut. Erfordert detaillierte Beschreibung und Freigabe durch die Projektleitung.' }
};

// ==========================================================================
// ARKANUM - INTERAKTIVER VÖLKER-KODEX & EFFEKT-ENGINE
// ==========================================================================

const RACES_DATA = [
    {
        key: 'Menschen',
        name: 'Menschen',
        category: 'humanoid',
        categoryName: 'Humanoide',
        subtitle: 'Die Willensstarken & Schicksalsschmiede',
        icon: 'shield',
        height: '1,65m – 2,00m',
        minH: 1.65,
        maxH: 2.00,
        magic: ['Arkan', 'Feuer', 'Erde', 'Wasser', 'Eis', 'Luft', 'Licht', 'Schatten', 'Blut', 'Elementar'],
        maxMagic: 2,
        color: '#fef08a',
        secondaryColor: 'rgba(254, 240, 138, 0.35)',
        effectType: 'human',
        lore: 'Menschen sind die anpassungsfähigste und willensstärkste Spezies in den Weiten der Sphäre Anubia. Sie wissen um ihre sterbliche Verwundbarkeit gegenüber den Göttern und arkanen Mächten – und genau aus dieser Erkenntnis schöpfen sie den unbändigen Drang, ihr Schicksal selbst in die Hand zu nehmen.',
        traits: 'Vielgestaltige Statur, hohe Zähigkeit und pragmatischer Erfindergeist. Tragen keine angeborenen magischen Flüche oder Rassenmerkmale wie Hörner oder Hufe.',
        rules: 'Keine angeborenen Elementarbeschränkungen. Dürfen max. 2 freie Magiearten erlernen. Universell für jedes Handwerk und jede Fraktion geeignet.'
    },
    {
        key: 'Vampire',
        name: 'Vampire',
        category: 'dark',
        categoryName: 'Dämonen & Finsternis',
        subtitle: 'Kinder der Nacht & Bluterben',
        icon: 'moon',
        height: '1,60m – 2,00m',
        minH: 1.60,
        maxH: 2.00,
        magic: ['Arkan', 'Feuer', 'Schatten', 'Blut'],
        maxMagic: 2,
        color: '#ef4444',
        secondaryColor: 'rgba(239, 68, 68, 0.45)',
        effectType: 'vampire',
        lore: 'Uralte Wesen der Nacht mit fahler Haut, scharfen Fangzähnen und übernatürlicher Nachtsicht. Sie wandeln als Gefangene eines ewigen Blutdurstes durch die Hallen von Anubia. Sterbliche Nahrung vermag ihren Hunger niemals zu stillen; nur frisches Lebensblut erhält ihre Kraft.',
        traits: 'Blasse bis aschgraue Haut, markante Fangzähne, geschärfte Sinne im Dunkeln. Fledermausgestalt für nächtliche Kundschaft.',
        rules: 'STRENGES ROLLENSPIEL: Verbrennen im Sonnenlicht langsam zu Asche! Lichtmagie heilt Vampire NICHT, sondern fügt schwerste Verbrennungen zu. Fledermausgestalt begrenzt Magie auf max. 1 Zusatzelement. Biss überträgt den Vampirismus nur nach Absprache.'
    },
    {
        key: 'Zwerge',
        name: 'Zwerge',
        category: 'humanoid',
        categoryName: 'Humanoide & Meister',
        subtitle: 'Meisterschmiede der Berge & Hüter des Grolls',
        icon: 'hammer',
        height: '1,30m – 1,50m',
        minH: 1.30,
        maxH: 1.50,
        magic: ['Arkan', 'Feuer', 'Erde', 'Luft', 'Licht', 'Schatten', 'Blut'],
        maxMagic: 2,
        color: '#f59e0b',
        secondaryColor: 'rgba(245, 158, 11, 0.4)',
        effectType: 'dwarf',
        lore: 'Gedrungene, ungeheuer zähe Gestalten, die so schwer wie ausgewachsene Menschen wiegen. Sie sind die unangefochtenen Meister der Schmiedekunst, des Elfenbeins und der Erzgewinnung. Die Sippe und der geschworene Eid stehen über allem weltlichen Reichtum.',
        traits: 'Kräftiger Knochenbau, üppige Bärte bei Männern, traditionsreiche Flechtungen und tiefe Verbundenheit zu Granit und Stahl.',
        rules: 'Führen das Buch des Grolls: Feindschaft zu Grünhäuten und Skepsis gegenüber Elfen sind tief in der Kultur verankert. Magie ist selten (vorzugsweise Stein- oder Schmiedefeuer).'
    },
    {
        key: 'Halbriesen',
        name: 'Halbriesen',
        category: 'humanoid',
        categoryName: 'Kolosse & Urkräfte',
        subtitle: 'Kolosse der Bergmassive & Urkräfte',
        icon: 'mountain',
        height: '2,10m – 2,40m',
        minH: 2.10,
        maxH: 2.40,
        magic: ['Arkan', 'Erde', 'Luft', 'Wasser', 'Eis', 'Feuer', 'Elementar'],
        maxMagic: 2,
        color: '#94a3b8',
        secondaryColor: 'rgba(148, 163, 184, 0.4)',
        effectType: 'giant',
        lore: 'Hünehafte Wanderer mit gewaltigen Schultern und groben Zügen. Berg- und Hügelhalbriesen schöpfen ihre Kraft aus den massiven Fundamenten der Erde und trotzen selbst den stärksten Stürmen der Gebirgspässe.',
        traits: 'Übermenschliche Körpergröße und rohe Muskelkraft. Tiefe Resonanz mit den Elementen Erde und Stein.',
        rules: 'Fühlen sich in engen Höhlen und unter kleineren Völkern oft fremd. Ihre schiere Physis verlangt überlegte Handlungen im RP; kein Zerstören von Statik ohne Genehmigung.'
    },
    {
        key: 'Minotauren',
        name: 'Minotauren',
        category: 'beast',
        categoryName: 'Bestien & Krieger',
        subtitle: 'Krieger des Labyrinths & Urzeit-Kraft',
        icon: 'swords',
        height: '1,90m – 2,30m',
        minH: 1.90,
        maxH: 2.30,
        magic: ['Arkan', 'Erde', 'Elementar'],
        maxMagic: 2,
        color: '#ea580c',
        secondaryColor: 'rgba(234, 88, 12, 0.4)',
        effectType: 'minotaur',
        lore: 'Mächtige Krieger mit dem massiven Kopf eines Stiers, gewaltigen Hörnern, behuften Beinen und dichtem Fell. Viele von ihnen wurden in den endlosen Korridoren des Labyrinths geboren und kennen dessen Gefahren besser als jeder Sterbliche.',
        traits: 'Massiver Muskelapparat, spitze Hörner, Hufe, raues Fell. Hervorragender Orientierungssinn in verschlungenen Gängen.',
        rules: 'Tief gebunden an uralte Stammesgesetze, Ehre und Ahnenriten. Kämpfen mit unbändiger Urgewalt, verachten jedoch feigen Hinterhalt.'
    },
    {
        key: 'Drachengeborene',
        name: 'Drachengeborene',
        category: 'ancient',
        categoryName: 'Alte Völker & Magie',
        subtitle: 'Erben des uralten Drachenblutes',
        icon: 'flame',
        height: '1,85m – 2,10m',
        minH: 1.85,
        maxH: 2.10,
        magic: ['Arkan', 'Feuer', 'Erde', 'Wasser', 'Eis', 'Luft', 'Licht'],
        maxMagic: 2,
        color: '#f97316',
        secondaryColor: 'rgba(249, 115, 22, 0.45)',
        effectType: 'dragon',
        lore: 'Stolze Träger drakonischen Erbes mit schuppiger Haut, markantem Hornkranz und geschlitzten Pupillen. Ihr Atem birgt das Echo uralter Weltenbrände, und ihre Treue gilt den ehernen Gesetzen ihrer Vorfahren.',
        traits: 'Hornkronen, Drachenschuppen, geschlitzte Augen. Je nach Ahnenreinheit kräftiger Schweif und drakonische Schwingen.',
        rules: 'WICHTIG ZUM FLUG-RP: Wer Schwingen besitzt und fliegen möchte, unterliegt der strikten 4-Wochen-Wartezeit ab Charaktererstellung. Absolutes Kampf- und Fluchtverbot im Flug!'
    },
    {
        key: 'Orks',
        name: 'Orks',
        category: 'humanoid',
        categoryName: 'Humanoide & Krieger',
        subtitle: 'Krieger der Clan-Ehre & Grünhäute',
        icon: 'axe',
        height: '1,90m – 2,20m',
        minH: 1.90,
        maxH: 2.20,
        magic: ['Arkan', 'Feuer', 'Erde', 'Wasser', 'Eis', 'Luft', 'Schatten', 'Blut', 'Elementar'],
        maxMagic: 2,
        color: '#10b981',
        secondaryColor: 'rgba(16, 185, 129, 0.4)',
        effectType: 'orc',
        lore: 'Große, breit gebaute Krieger mit mächtigen Hauern und grünlich-grauen Hauttönen. In der Sphäre Anubia sind Orks keine hirnlosen Monster, sondern stolze Glieder strenger Clans, für die Respekt und Kampfkraft die Pfeiler der Gesellschaft bilden.',
        traits: 'Herausragende Hauer, narbenverzierte Haut, massive Muskulatur und traditionsreiche Kriegsbemalungen.',
        rules: 'Clan-Ehre steht an oberster Stelle. Äußerst empfindlich bei Provokationen; Orks vergessen niemals eine erlittene Schmach und fordern Genugtuung im Duell.'
    },
    {
        key: 'Faun / Satyr',
        name: 'Faun / Satyr',
        category: 'beast',
        categoryName: 'Natur & Bestien',
        subtitle: 'Lebensfrohe Musiker der Haine & Wälder',
        icon: 'music',
        height: '1,60m – 1,90m',
        minH: 1.60,
        maxH: 1.90,
        magic: ['Arkan', 'Feuer', 'Erde', 'Wasser', 'Luft', 'Licht', 'Elementar'],
        maxMagic: 2,
        color: '#22c55e',
        secondaryColor: 'rgba(34, 197, 94, 0.4)',
        effectType: 'faun',
        lore: 'Wesen der freien Natur mit Ziegen- oder Widderläufen, behaarten Beinen, Hufen und geschwungenen Hörnern. Sie lieben Musik, Tanz, guten Wein und die unberührten Ecken der Sphäre, fernab starrer menschlicher Gesetze.',
        traits: 'Widder- oder Ziegenhörner, Hufe, dichter Beinpelz, tierischer Schweif, geschlitzte Augen.',
        rules: 'Scheuen autoritäre Zwänge und bürokratische Stadtgesetze. Natur- und Erdmagie stehen hoch im Kurs; friedfertig, doch wehrhaft bei Schändung ihrer Haine.'
    },
    {
        key: 'Mischwesen',
        name: 'Mischwesen',
        category: 'beast',
        categoryName: 'Bestien & Wandler',
        subtitle: 'Verschmolzen mit dem Seelentier',
        icon: 'footprints',
        height: '1,60m – 2,20m',
        minH: 1.60,
        maxH: 2.20,
        magic: ['Arkan', 'Feuer', 'Erde', 'Wasser', 'Eis', 'Luft', 'Licht', 'Schatten', 'Blut', 'Elementar'],
        maxMagic: 2,
        color: '#a855f7',
        secondaryColor: 'rgba(168, 85, 247, 0.4)',
        effectType: 'beast',
        lore: 'Humanoide, deren Wesen und Physis unwiderruflich mit einem Seelentier (Wolf, Katze, Rabe, Fuchs etc.) verwoben sind. Sie besitzen geschärfte Sinne, außergewöhnliche Reflexe und instinktgetriebene Verhaltensweisen.',
        traits: 'Tierische Ohren, Schweif, Raubtieraugen, Klauen oder Schnurrhaare, passend zum gewählten Seelentier.',
        rules: 'VOLLMOND-PFLICHT: Unter dem Licht des vollen Mondes erwacht der tierische Instinkt mit voller Wucht – starker Balztrieb, emotionale Schwankungen und gesteigerte Reizbarkeit!'
    },
    {
        key: 'Gestaltwandler',
        name: 'Gestaltwandler',
        category: 'beast',
        categoryName: 'Bestien & Wandler',
        subtitle: 'Meister der vielgestaltigen Hüllen',
        icon: 'refresh-cw',
        height: 'Rassenmaß (Ungewandelt)',
        minH: 1.50,
        maxH: 2.10,
        magic: ['Arkan', 'Feuer', 'Erde', 'Wasser', 'Eis', 'Luft', 'Schatten'],
        maxMagic: 1,
        color: '#06b6d4',
        secondaryColor: 'rgba(6, 182, 212, 0.4)',
        effectType: 'shifter',
        lore: 'Mystische Wesen, die die Grenze zwischen humanoidem Geist und animalischem Fleisch auflösen können. Eine Wandlung erfordert tiefste Konzentration und zehrt an der arkanen Essenz des Wandlers.',
        traits: 'Wandelbare Knochen- und Muskelstruktur. Nimmt im transformierten Zustand exakt die Maße und Anatomie des Zieltieres an.',
        rules: 'STRENGSTE RP-REGEL: In Tierform ist KEINERLEI Sprechen möglich (weder Voice noch Chat)! Die Wandlung selbst gilt als mächtiger magischer Akt, daher darf MAXIMAL 1 weitere Magieform gewählt werden!'
    },
    {
        key: 'Lykaner (Werwölfe)',
        name: 'Lykaner (Werwölfe)',
        category: 'beast',
        categoryName: 'Bestien & Fluchträger',
        subtitle: 'Gefangene des ewigen Vollmond-Fluches',
        icon: 'skull',
        height: '1,80m – 2,10m',
        minH: 1.80,
        maxH: 2.10,
        magic: ['Arkan', 'Schatten', 'Blut'],
        maxMagic: 1,
        color: '#dc2626',
        secondaryColor: 'rgba(220, 38, 38, 0.5)',
        effectType: 'lycan',
        lore: 'Gezeichnete Seelen, deren Blut mit dem Fluch des Wolfes vergiftet ist. Bei normalem Licht wirken sie wie gewöhnliche Sterbliche, doch der Ruf des Vollmonds entreißt ihnen jegliche Beherrschung und verwandelt sie in mordende Bestien.',
        traits: 'Im Menschenleib feines Gehör und gesteigerter Fleischhunger; in Hybridform monströser Wolfskörper mit tödlichen Reißzähnen.',
        rules: 'ABSOLUT STUMMES RP: Im verwandelten Tierleib herrscht striktes Sprechverbot! Weder Voice noch Chat. Kein Öffnen von Türen, Truhen oder Inventaren mit Werkzeugen! Max. 1 weitere Magieform.'
    },
    {
        key: 'Succubus / Incubus',
        name: 'Succubus / Incubus',
        category: 'dark',
        categoryName: 'Dämonen & Finsternis',
        subtitle: 'Meister der Verführung & Seelenzehrer',
        icon: 'heart',
        height: '1,60m – 1,90m',
        minH: 1.60,
        maxH: 1.90,
        magic: ['Arkan', 'Blut', 'Schatten', 'Feuer'],
        maxMagic: 2,
        color: '#d946ef',
        secondaryColor: 'rgba(217, 70, 239, 0.4)',
        effectType: 'succubus',
        lore: 'Verführerische Dämonenwesen, die sich von den Gefühlen, Begierden und Lebensenergien sterblicher Seelen ernähren. Ihre Worte klingen wie süßes Gift, doch hinter der Makellosigkeit lauert der Abgrund des Netherreichs.',
        traits: 'Elegante dämonische Hörner, ledrige Schwingen, pfeilförmiger Schweif, betörend makellose Erscheinung.',
        rules: 'Beherrschen die Emotionen Sterblicher, leiden jedoch unter ständiger innerer Zerrissenheit. FSK 18 & striktes E-RP-Verbot in der Hauptstadt beachten!'
    },
    {
        key: 'Halbdämon / Tiefling',
        name: 'Halbdämon / Tiefling',
        category: 'dark',
        categoryName: 'Dämonen & Finsternis',
        subtitle: 'Gezeichnet vom infernalen Erbe',
        icon: 'zap',
        height: '1,60m – 1,90m',
        minH: 1.60,
        maxH: 1.90,
        magic: ['Arkan', 'Blut', 'Schatten', 'Feuer', 'Elementar'],
        maxMagic: 2,
        color: '#7c3aed',
        secondaryColor: 'rgba(124, 58, 237, 0.4)',
        effectType: 'tiefling',
        lore: 'Mischblütige Kinder sterblicher Rassen und finsterer Höllenfürsten. Sie tragen das Erbe des Schwefels im Fleisch und müssen sich zeitlebens gegen das Misstrauen ihrer Umwelt und das Flüstern ihrer Ahnen wehren.',
        traits: 'Markante Hörner verschiedenster Formen, langer Schweif, auffällige Hauttöne (rot, violett, aschgrau), Klauen und spitze Zähne.',
        rules: 'Können ihre dämonische Herkunft nicht verbergen. Begegnen oft Abscheu und Argwohn; ihr Blut pulsiert mit dunklen Magien.'
    },
    {
        key: 'Spektrale (Geister)',
        name: 'Spektrale (Geister)',
        category: 'dark',
        categoryName: 'Dämonen & Geisterwelt',
        subtitle: 'Ruhelose Schatten & Seelen des Jenseits',
        icon: 'ghost',
        height: 'Variabel (Formgebunden)',
        minH: 1.40,
        maxH: 2.10,
        magic: ['Arkan', 'Schatten', 'Luft', 'Eis', 'Elementar'],
        maxMagic: 2,
        color: '#67e8f9',
        secondaryColor: 'rgba(103, 232, 249, 0.35)',
        effectType: 'spectral',
        lore: 'Entkörperte Seelen, deren physische Hülle verging, die jedoch durch uralte Eide, ungesühnte Verbrechen oder finstere Rituale an die Hallen von Anubia gekettet blieben. Ihre Gegenwart kühlt die Luft merklich ab.',
        traits: 'Halbtransparente Erscheinung, schwebender Gang, eisige Aura, flüsternde Stimme.',
        rules: 'Feste Gegenstände können nur unter spürbarer arkaner Willensanstrengung bewegt werden. Stets gebunden an eine persönliche Tragödie oder einen unerfüllten Schwur.'
    },
    {
        key: 'Feenwesen (Eldarin)',
        name: 'Feenwesen (Eldarin)',
        category: 'ancient',
        categoryName: 'Alte Völker & Feen',
        subtitle: 'Ätherische Lichtwesen der Anderswelt',
        icon: 'sparkle',
        height: '1,40m – 1,60m',
        minH: 1.40,
        maxH: 1.60,
        magic: ['Arkan', 'Feuer', 'Erde', 'Wasser', 'Eis', 'Luft', 'Licht', 'Schatten', 'Blut', 'Elementar'],
        maxMagic: 2,
        color: '#2dd4bf',
        secondaryColor: 'rgba(45, 212, 191, 0.4)',
        effectType: 'fairy',
        lore: 'Filigrane Wesen der Anderswelt, die durch Risse im Schleier nach Anubia gelangten. Sie verkörpern die ewige Frische der Natur und betrachten die Sterblichen oft mit faszinierter, aber unberechenbarer Neugierde.',
        traits: 'Zierlicher Körperbau, leuchtende Augen, zarte Insekten- oder Blütenflügel, florale Verzierungen auf der Haut.',
        rules: 'Freigeister ohne Verständnis für kleinliche Gesetze; reagieren empfindlich auf Eisen und kalte Vernunft, schätzen jedoch Geschenke und Musik.'
    },
    {
        key: 'Goblins',
        name: 'Goblins',
        category: 'humanoid',
        categoryName: 'Humanoide & Schelme',
        subtitle: 'Gerissene Überlebenskünstler & Tüftler',
        icon: 'crosshair',
        height: '1,20m – 1,40m',
        minH: 1.20,
        maxH: 1.40,
        magic: ['Arkan', 'Feuer', 'Schatten', 'Blut'],
        maxMagic: 2,
        color: '#84cc16',
        secondaryColor: 'rgba(132, 204, 22, 0.4)',
        effectType: 'goblin',
        lore: 'Kleine, flinke und ungemein schlaue Gesellen, die in Höhlen, Sümpfen und Ruinen überleben. Was ihnen an Körperkraft fehlt, machen sie durch List, Erfindungsreichtum, Fallenbau und skrupellose Verhandlungen wett.',
        traits: 'Lange spitze Ohren, scharfe Nadelzähne, geschmeidige Hände, erdfarbene bis grüne Hauttöne.',
        rules: 'Starker Selbsterhaltungstrieb; meiden offene Ehrenkämpfe und bevorzugen Hinterhalte, Gift, Fallen und diplomatische Verwirrung.'
    },
    {
        key: 'Halblinge',
        name: 'Halblinge',
        category: 'humanoid',
        categoryName: 'Humanoide & Standhafte',
        subtitle: 'Standhafte Seelen der Gemütlichkeit & des Mutes',
        icon: 'sun',
        height: '1,20m – 1,40m',
        minH: 1.20,
        maxH: 1.40,
        magic: ['Arkan', 'Feuer', 'Erde', 'Wasser', 'Eis', 'Elementar', 'Schatten'],
        maxMagic: 2,
        color: '#fbbf24',
        secondaryColor: 'rgba(251, 191, 36, 0.4)',
        effectType: 'halfling',
        lore: 'Kleine, herzliche Geschöpfe mit behaarten Füßen, die niemals Schuhe tragen. Sie lieben gutes Essen (mindestens 7 Mahlzeiten am Tag), friedliche Tavernenabende und treue Freundschaft – zeigen in der Not jedoch ungeahnten Heldenmut.',
        traits: 'Barfüßig mit krausem Haar auf den Fußrücken, lockiges Haupthaar, rundliche Züge und ansteckendes Lachen.',
        rules: 'Ungewöhnlich hohe Willenskraft gegen Angst und geistige Manipulation; geschätzte Köche, Bierbrauer und treueste Weggefährten.'
    },
    {
        key: 'Elfen',
        name: 'Elfen-Völker',
        category: 'ancient',
        categoryName: 'Das Elfen-Kompendium',
        subtitle: 'Die Erhabenen der Alten Welt (7 Stämme)',
        icon: 'crown',
        height: '1,65m – 2,00m',
        minH: 1.65,
        maxH: 2.00,
        magic: ['Arkan', 'Feuer', 'Erde', 'Wasser', 'Eis', 'Licht', 'Schatten'],
        maxMagic: 2,
        color: '#38bdf8',
        secondaryColor: 'rgba(56, 189, 248, 0.4)',
        effectType: 'elf',
        lore: 'Die älteste Hochkultur der Sphäre Anubia. Elfen verehren niemals menschliche Götter und blicken auf Jahrtausende arkaner Meisterschaft zurück. Das Volk gliedert sich in 7 eigenständige Stämme mit völlig verschiedenen Kulturen.',
        traits: 'Spitze Ohren, makellose Züge, langlebig, hohes magisches Grundpotential. Strikte Abneigung gegen Drow-Begriffe.',
        rules: 'Öffne das Kompendium der 7 Stämme (Waldelfen, Hochelfen, Dunkelelfen, Astralelfen, Sonnenelfen, Mondelfen, Meereselfen), um die individuellen Vorgaben, Größen und Magieaffinitäten jedes Elfenstammes zu studieren!'
    }
];

const ELVEN_SUBRACES_DATA = [
    {
        key: 'Waldelfen',
        name: 'Waldelfen',
        category: 'ancient',
        categoryName: 'Elfen-Kompendium',
        subtitle: 'Unbarmherzige Hüter der geheimen Haine',
        icon: 'trees',
        height: '1,70m – 1,85m',
        minH: 1.70,
        maxH: 1.85,
        magic: ['Natur/Erde', 'Wasser', 'Arkan'],
        maxMagic: 2,
        color: '#16a34a',
        secondaryColor: 'rgba(22, 163, 74, 0.4)',
        effectType: 'wood_elf',
        lore: 'Die kleinste Elfenpartei in Anubia; vor Jahrtausenden durch Kriege stark dezimiert. Sie leben extrem isoliert in getarnten Waldrefugien. Unangekündigte Eindringlinge werden gnadenlos getötet und an den Grenzen aufgespießt. Nur wenige Gesandte vertreten ihren Stamm im Anubischen Rat.',
        traits: 'Geschmeidige Statur, erdfarbene Kleidung, meisterhafter Umgang mit Jagdbögen und Pflanzengiften.',
        rules: 'Verehrung mannigfacher Natur- und Urwesen. Fremde in ihren Hainen gelten automatisch als Bedrohung; Diplomatie erfordert Geduld.'
    },
    {
        key: 'Hochelfen',
        name: 'Hochelfen',
        category: 'ancient',
        categoryName: 'Elfen-Kompendium',
        subtitle: 'Aristokraten des Phönix & Elfenstahls',
        icon: 'sparkles',
        height: '1,70m – 2,00m',
        minH: 1.70,
        maxH: 2.00,
        magic: ['Arkan', 'Feuer', 'Licht'],
        maxMagic: 2,
        color: '#facc15',
        secondaryColor: 'rgba(250, 204, 21, 0.4)',
        effectType: 'high_elf',
        lore: 'Hochkultur mit strengen Adelsstrukturen, Magiefokus, Resonanz-Kristallen und feinstem Elfenstahl. Sie stellen die stärkste und einflussreichste Fraktion im Anubischen Rat dar und bewahren das antike Wissen.',
        traits: 'Erhabene Haltung, gold- oder silberblondes Haar, prunkvolle Roben und makellose Kristallklingen.',
        rules: 'Verehrung des heiligen Phönix – die Ewige Flamme, die alle Finsternis verzehrt. Pflichtbewusst, stolz und unerbittlich gegen Verderbnis.'
    },
    {
        key: 'Dunkelelfen',
        name: 'Dunkelelfen',
        category: 'ancient',
        categoryName: 'Elfen-Kompendium',
        subtitle: 'Schattenfürsten des Underdark (Ausdrücklich KEIN Drow)',
        icon: 'eye-off',
        height: '1,70m – 1,85m',
        minH: 1.70,
        maxH: 1.85,
        magic: ['Schatten', 'Feuer', 'Arkan'],
        maxMagic: 2,
        color: '#7e22ce',
        secondaryColor: 'rgba(126, 34, 206, 0.45)',
        effectType: 'dark_elf',
        lore: 'Leben in den finsteren Gewölben des Underdark. Violett-schwarze Haut, schneeweißes Haar und im Dunkeln glimmende Iriden zeichnen sie aus. Ihre Gesellschaft gliedert sich in kriegerische Stämme und matriarchalische Königinnen-Kulte.',
        traits: 'Violett-schwarze Haut, schneeweißes Haar, an Dunkelheit gewöhnte Augen.',
        rules: 'STRENGSTES GESETZ: Dunkelelfen dürfen NIEMALS Lichtmagie erlernen oder anwenden! Der Begriff "Drow" ist auf ARKANUM verboten. Verehren den Anuben-Kult (Schakal) oder uralte Spinnenentitäten.'
    },
    {
        key: 'Astralelfen',
        name: 'Astralelfen',
        category: 'ancient',
        categoryName: 'Elfen-Kompendium',
        subtitle: 'Diener des Grauen Meisters (RP-Sonderform)',
        icon: 'orbit',
        height: '1,75m – 2,20m',
        minH: 1.75,
        maxH: 2.20,
        magic: ['Arkan'],
        maxMagic: 1,
        color: '#38bdf8',
        secondaryColor: 'rgba(56, 189, 248, 0.4)',
        effectType: 'astral_elf',
        lore: 'Künstlich durch arkan-alchemistische Rituale erschaffene Wesen mit elfischen Anteilen. Ranghohe Vertreter besitzen Hörner, Schweif und Schwingen. Sie dienen dem ominösen Grauen Meister im Grauen Orden.',
        traits: 'Schimmernde Haut mit Sternenmustern, Hörner, Schweif und astrale Flügel bei höheren Rängen.',
        rules: 'WICHTIGER LORE-HINWEIS: NICHT als Startrasse wählbar! Man wird im aktiven RP durch rituelle Weihen dazu wiedergeboren. Nur reine Arkanmagie erlaubt. Zwingende Absprache mit der Projektleitung.'
    },
    {
        key: 'Sonnenelfen',
        name: 'Sonnenelfen',
        category: 'ancient',
        categoryName: 'Elfen-Kompendium',
        subtitle: 'Ritter des lodernden Mittagslichts',
        icon: 'sun-medium',
        height: '1,65m – 2,00m',
        minH: 1.65,
        maxH: 2.00,
        magic: ['Feuer', 'Licht', 'Arkan'],
        maxMagic: 2,
        color: '#f59e0b',
        secondaryColor: 'rgba(245, 158, 11, 0.4)',
        effectType: 'sun_elf',
        lore: 'Hüter der antiken Sonnenheiligtümer. Ihre goldene Haut und bronzefarbenen Haare spiegeln die Hitze des Tages wider. Bekannt für strahlende Rüstungen und unnachgiebige Entschlossenheit.',
        traits: 'Bronzene bis goldene Hauttöne, bernsteinfarbene Augen, sonnengeschmiedete Ornamente.',
        rules: 'Ihre Magie erreicht in hellen Tagesstunden ihren Zenit. Feindschaft zu Schattengewölben und lichtscheuem Gezücht.'
    },
    {
        key: 'Mondelfen',
        name: 'Mondelfen',
        category: 'ancient',
        categoryName: 'Elfen-Kompendium',
        subtitle: 'Stille Wächter unter den Gestirnen',
        icon: 'moon-star',
        height: '1,65m – 2,00m',
        minH: 1.65,
        maxH: 2.00,
        magic: ['Schatten', 'Wasser', 'Arkan'],
        maxMagic: 2,
        color: '#93c5fd',
        secondaryColor: 'rgba(147, 197, 253, 0.4)',
        effectType: 'moon_elf',
        lore: 'Geheimnisvolle Kundschafter und Sternendeuter, die im sanften Schein der Monde wandeln. Sie hüten antike Sternenkarten und navigieren zielsicher durch die finstersten Labyrinthe.',
        traits: 'Alabasterweiße bis zartblaue Haut, silbriges Haar, nachtaktive Sinne.',
        rules: 'Verschwiegen und bedächtig. Ihre Riten und Wahrsagungen finden vorzugsweise unter freiem Nachthimmel statt.'
    },
    {
        key: 'Meereselfen',
        name: 'Meereselfen',
        category: 'ancient',
        categoryName: 'Elfen-Kompendium',
        subtitle: 'Kinder der Tiefenströmungen & Grotten',
        icon: 'waves',
        height: '1,65m – 2,00m',
        minH: 1.65,
        maxH: 2.00,
        magic: ['Wasser', 'Eis', 'Arkan'],
        maxMagic: 2,
        color: '#0284c7',
        secondaryColor: 'rgba(2, 132, 199, 0.4)',
        effectType: 'sea_elf',
        lore: 'Eng verbunden mit den unterirdischen Seen, gefluteten Grotten und ewigen Wassern der Sphäre Anubia. Sie sprechen mit den Kreaturen der Tiefe und nutzen die flüssigen Ströme als Reisewege.',
        traits: 'Aquamarin- bis türkisschimmernde Haut, schwimmhautartige Finger, flossenähnliche Zierde an den Ohren.',
        rules: 'Unübertroffene Meisterschaft im Wasser- und Eis-RP; meiden langwierige Aufenthalte in extrem trockenen Wüstengebieten.'
    }
];

const ALL_RACES_MAP = {};
RACES_DATA.forEach(r => { ALL_RACES_MAP[r.key] = r; });
ELVEN_SUBRACES_DATA.forEach(r => { ALL_RACES_MAP[r.key] = r; });

const MAIN_RACE_KEYS = RACES_DATA.map(r => r.key);
const ELVEN_SUBRACE_KEYS = ELVEN_SUBRACES_DATA.map(r => r.key);
const ALL_RACE_KEYS = [...MAIN_RACE_KEYS, ...ELVEN_SUBRACE_KEYS];

let currentModalRaceKey = null;

function renderRaceCatalog(filter = 'all') {
    const grid = document.getElementById('race-catalog-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    const filtered = filter === 'all' 
        ? RACES_DATA 
        : RACES_DATA.filter(r => r.category === filter);
        
    filtered.forEach(race => {
        const card = document.createElement('div');
        card.className = 'race-tile cursor-pointer p-4 rounded-sm flex flex-col justify-between';
        card.style.setProperty('--race-glow', race.secondaryColor || 'rgba(0, 229, 255, 0.25)');
        card.style.setProperty('--race-glow-solid', race.color || '#00e5ff');
        card.onclick = (e) => openRaceDetails(race.key, e);
        
        const isElvenHub = race.key === 'Elfen';
        
        card.innerHTML = `
            <div>
                <div class="w-11 h-11 mx-auto rounded-full border border-white/20 flex items-center justify-center mb-3 bg-black/60 shadow-[0_0_12px_rgba(255,255,255,0.08)] transition-transform group-hover:scale-110" style="color: ${race.color};">
                    <i data-lucide="${race.icon}" class="w-5 h-5"></i>
                </div>
                <h4 class="font-magic text-white text-base text-center tracking-wider mb-1 line-clamp-1">${race.name}</h4>
                <span class="text-[11px] font-magic text-center block mb-1 font-semibold" style="color: ${race.color};">${race.height}</span>
                <span class="text-[11px] text-slate-400 font-lore text-center block line-clamp-1 italic">${race.subtitle}</span>
                ${isElvenHub ? `
                    <div class="mt-2 text-center">
                        <span class="inline-flex items-center gap-1 text-[9px] font-magic px-1.5 py-0.5 rounded bg-cyan-950/70 border border-cyan-400/40 text-cyan-300">
                            <i data-lucide="sparkles" class="w-2.5 h-2.5"></i> 7 Stämme Kodex
                        </span>
                    </div>
                ` : ''}
            </div>
            <div class="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-magic text-slate-400">
                <span class="truncate max-w-[85px]">${isElvenHub ? '7 Stämme' : race.magic.slice(0, 2).join(', ')}</span>
                <span class="hover:text-white uppercase tracking-wider flex items-center gap-0.5 ${isElvenHub ? 'text-cyan-300 font-semibold' : ''}">
                    ${isElvenHub ? 'Kompendium' : 'Details'} <i data-lucide="chevron-right" class="w-3 h-3"></i>
                </span>
            </div>
        `;
        grid.appendChild(card);
    });
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function filterRaceCatalog(category) {
    document.querySelectorAll('.race-filter-btn').forEach(btn => {
        if (btn.dataset.filter === category) {
            btn.classList.remove('bg-black/60', 'text-slate-300', 'border', 'border-white/15');
            btn.classList.add('bg-white', 'text-black', 'font-semibold');
        } else {
            btn.classList.add('bg-black/60', 'text-slate-300', 'border', 'border-white/15');
            btn.classList.remove('bg-white', 'text-black', 'font-semibold');
        }
    });
    renderRaceCatalog(category);
}

function openRaceDetails(raceKey, event) {
    playRaceEffect(raceKey, event ? event.currentTarget : null);
    setTimeout(() => {
        showRaceModal(raceKey);
    }, 140);
}

function playRaceEffect(raceKey, sourceEl) {
    const race = ALL_RACES_MAP[raceKey];
    if (!race) return;

    if (sourceEl) {
        sourceEl.classList.add('race-tile-pulse');
        setTimeout(() => sourceEl.classList.remove('race-tile-pulse'), 250);
    }

    const stage = document.getElementById('race-effect-stage');
    if (!stage) return;

    let originX = window.innerWidth / 2;
    let originY = window.innerHeight / 2;
    if (sourceEl) {
        const rect = sourceEl.getBoundingClientRect();
        originX = rect.left + rect.width / 2;
        originY = rect.top + rect.height / 2;
    }

    // 1. Screen Vignette Flash
    const vignette = document.createElement('div');
    vignette.className = 'effect-vignette';
    vignette.style.setProperty('--vignette-color', race.secondaryColor || 'rgba(0, 229, 255, 0.3)');
    stage.appendChild(vignette);
    setTimeout(() => vignette.remove(), 480);

    // 2. Shockwave Ring
    const shockwave = document.createElement('div');
    shockwave.className = 'effect-shockwave';
    shockwave.style.left = `${originX}px`;
    shockwave.style.top = `${originY}px`;
    shockwave.style.width = '140px';
    shockwave.style.height = '140px';
    shockwave.style.setProperty('--effect-color', race.color || '#00e5ff');
    stage.appendChild(shockwave);
    setTimeout(() => shockwave.remove(), 550);

    // 3. Dynamic Particles
    const particles = getRaceParticleSymbols(race.effectType);
    const particleCount = 14;

    for (let i = 0; i < particleCount; i++) {
        const p = document.createElement('div');
        p.className = 'effect-particle';
        p.style.left = `${originX}px`;
        p.style.top = `${originY}px`;
        p.style.color = race.color || '#ffffff';
        p.style.textShadow = `0 0 10px ${race.color}`;

        const angle = (i / particleCount) * Math.PI * 2 + (Math.random() * 0.4 - 0.2);
        const distance = 80 + Math.random() * 120;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        const rot = Math.floor(Math.random() * 360) + 'deg';
        const dur = (0.4 + Math.random() * 0.25).toFixed(2) + 's';

        p.style.setProperty('--tx', `${tx}px`);
        p.style.setProperty('--ty', `${ty}px`);
        p.style.setProperty('--rot', rot);
        p.style.setProperty('--dur', dur);

        p.innerHTML = particles[Math.floor(Math.random() * particles.length)];

        stage.appendChild(p);
        setTimeout(() => p.remove(), 650);
    }
}

function getRaceParticleSymbols(effectType) {
    switch (effectType) {
        case 'vampire': return ['🩸', '🦇', '✦', '•'];
        case 'dragon': return ['🔥', '✨', '▲', '•'];
        case 'dwarf': return ['⚒️', '⚡', '✦', '•'];
        case 'giant': return ['⛰️', '✦', '▪', '•'];
        case 'minotaur': return ['⚔️', '🔥', '✦', '•'];
        case 'orc': return ['🪓', '⚡', '✦', '•'];
        case 'faun': return ['🍃', '🌿', '🎵', '✦'];
        case 'beast': return ['🐾', '🌙', '✦', '•'];
        case 'shifter': return ['💠', '✦', '✧', '•'];
        case 'lycan': return ['🐺', '🩸', '🌕', '✦'];
        case 'succubus': return ['🖤', '✨', '💜', '✦'];
        case 'tiefling': return ['🔥', '⚡', '✦', '•'];
        case 'spectral': return ['❄️', '💨', '✧', '•'];
        case 'fairy': return ['✨', '🌸', '💫', '✦'];
        case 'goblin': return ['🪙', '⚡', '✦', '•'];
        case 'halfling': return ['🍺', '🍞', '✨', '✦'];
        case 'elf': return ['👑', '✨', '💎', '✦', '✧'];
        case 'wood_elf': return ['🍃', '🏹', '🌿', '✦'];
        case 'high_elf': return ['🦅', '✨', '☀️', '✦'];
        case 'dark_elf': return ['🕷️', '🌑', '🔮', '✦'];
        case 'astral_elf': return ['🌌', '⭐', '✨', '✦'];
        case 'sun_elf': return ['☀️', '✨', '🔥', '✦'];
        case 'moon_elf': return ['🌙', '⭐', '✧', '✦'];
        case 'sea_elf': return ['🌊', '💧', '🐚', '✦'];
        case 'human':
        default: return ['✨', '🛡️', '✦', '•'];
    }
}

function showRaceModal(raceKey) {
    const race = ALL_RACES_MAP[raceKey];
    if (!race) return;
    currentModalRaceKey = raceKey;

    const modal = document.getElementById('race-modal');
    if (!modal) return;

    const iconContainer = document.getElementById('modal-icon-container');
    const modalIcon = document.getElementById('modal-icon');
    const headerBg = document.getElementById('modal-header-bg');
    const standardView = document.getElementById('modal-standard-view');
    const elfenHubView = document.getElementById('modal-elfen-hub-view');
    const subraceBackBanner = document.getElementById('modal-subrace-back-banner');
    const modalSelectBtn = document.getElementById('modal-select-btn');

    if (iconContainer) {
        iconContainer.style.borderColor = race.color || '#00e5ff';
        iconContainer.style.boxShadow = `0 0 25px ${race.secondaryColor || 'rgba(0, 229, 255, 0.4)'}`;
        iconContainer.style.color = race.color || '#00e5ff';
    }
    if (modalIcon) {
        modalIcon.setAttribute('data-lucide', race.icon || 'shield');
    }
    if (headerBg) {
        headerBg.style.background = `linear-gradient(to bottom, ${race.secondaryColor || 'rgba(255,255,255,0.05)'} 0%, rgba(5,5,8,0.95) 100%)`;
    }

    document.getElementById('modal-title').innerText = race.name;
    document.getElementById('modal-subtitle').innerText = race.subtitle;
    document.getElementById('modal-category').innerText = race.categoryName || 'Sphäre Anubia';

    const isElvenHub = (raceKey === 'Elfen');
    const isElvenSubrace = ELVEN_SUBRACE_KEYS.includes(raceKey);

    if (isElvenHub) {
        // HIDE STANDARD VIEW, SHOW ELFEN HUB
        if (standardView) standardView.classList.add('hidden');
        if (elfenHubView) elfenHubView.classList.remove('hidden');

        // Render the 7 sub-races in modal-elven-subraces-grid
        const elvenGrid = document.getElementById('modal-elven-subraces-grid');
        if (elvenGrid) {
            elvenGrid.innerHTML = '';
            ELVEN_SUBRACES_DATA.forEach(sub => {
                const tile = document.createElement('div');
                tile.className = 'race-tile cursor-pointer p-4 rounded-sm flex flex-col justify-between';
                tile.style.setProperty('--race-glow', sub.secondaryColor || 'rgba(0, 229, 255, 0.3)');
                tile.style.setProperty('--race-glow-solid', sub.color || '#00e5ff');
                tile.onclick = (e) => openRaceDetails(sub.key, e);

                const isSpecial = sub.key === 'Astralelfen';
                const isDark = sub.key === 'Dunkelelfen';

                tile.innerHTML = `
                    <div>
                        <div class="flex items-center justify-between gap-2 mb-2">
                            <div class="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center bg-black/60 shadow-[0_0_10px_rgba(255,255,255,0.06)]" style="color: ${sub.color};">
                                <i data-lucide="${sub.icon}" class="w-4 h-4"></i>
                            </div>
                            <span class="text-[11px] font-magic font-semibold" style="color: ${sub.color};">${sub.height}</span>
                        </div>
                        <h4 class="font-magic text-white text-base tracking-wider mb-0.5">${sub.name}</h4>
                        <p class="text-[11px] text-slate-400 font-lore line-clamp-1 italic mb-2">${sub.subtitle}</p>
                        
                        ${isSpecial ? `<span class="inline-block text-[10px] font-magic text-amber-300 bg-amber-950/40 border border-amber-500/40 px-2 py-0.5 rounded mb-2">RP-Sonderform</span>` : ''}
                        ${isDark ? `<span class="inline-block text-[10px] font-magic text-purple-300 bg-purple-950/40 border border-purple-500/40 px-2 py-0.5 rounded mb-2">Kein Drow • Licht-Tabu</span>` : ''}
                    </div>

                    <div class="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-magic">
                        <span class="text-slate-400 truncate max-w-[100px]">${sub.magic.slice(0, 2).join(', ')}</span>
                        <span class="text-cyan-300 hover:text-white uppercase tracking-wider flex items-center gap-0.5">
                            Ergründen <i data-lucide="chevron-right" class="w-3 h-3"></i>
                        </span>
                    </div>
                `;
                elvenGrid.appendChild(tile);
            });
        }

        if (modalSelectBtn) {
            modalSelectBtn.innerHTML = `<i data-lucide="sparkles" class="w-4 h-4 text-cyan-400"></i> <span>Stamm oben wählen</span>`;
            modalSelectBtn.className = 'px-6 py-2.5 bg-white/10 text-cyan-200 border border-cyan-400/30 uppercase tracking-widest rounded flex items-center gap-2 cursor-default';
            modalSelectBtn.onclick = null;
        }
    } else {
        // STANDARD OR SUB-RACE VIEW
        if (standardView) standardView.classList.remove('hidden');
        if (elfenHubView) elfenHubView.classList.add('hidden');

        if (subraceBackBanner) {
            if (isElvenSubrace) {
                subraceBackBanner.classList.remove('hidden');
            } else {
                subraceBackBanner.classList.add('hidden');
            }
        }

        document.getElementById('modal-height').innerText = race.height;
        document.getElementById('modal-magic-count').innerText = `Max. ${race.maxMagic} Affinität${race.maxMagic > 1 ? 'en' : ''}`;
        
        const statusEl = document.getElementById('modal-status');
        if (statusEl) {
            if (race.key === 'Astralelfen') {
                statusEl.innerText = 'RP-Sonderform (Keine Startrasse)';
                statusEl.className = 'text-amber-400 font-semibold';
            } else {
                statusEl.innerText = 'Frei wählbare Startrasse';
                statusEl.className = 'text-white font-semibold';
            }
        }

        document.getElementById('modal-lore').innerText = race.lore;
        document.getElementById('modal-traits').innerText = race.traits;
        document.getElementById('modal-rules').innerText = race.rules;

        const magicPillsContainer = document.getElementById('modal-magic-pills');
        if (magicPillsContainer) {
            magicPillsContainer.innerHTML = race.magic.map(m => {
                return `<span class="px-2.5 py-1 text-xs font-magic rounded bg-white/5 border border-white/15 text-slate-200">${m}</span>`;
            }).join('');
        }

        if (modalSelectBtn) {
            modalSelectBtn.innerHTML = `<i data-lucide="feather" class="w-4 h-4 text-black"></i> <span>${race.name} im Charakterbogen wählen</span>`;
            modalSelectBtn.className = 'px-6 py-2.5 bg-white text-black font-semibold hover:bg-cyan-300 transition-colors uppercase tracking-widest rounded flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.2)]';
            modalSelectBtn.onclick = selectCurrentRaceInCharGen;
        }
    }

    modal.classList.add('modal-open');
    document.body.style.overflow = 'hidden';

    // Scroll modal body to top smoothly on page switch
    const modalBody = document.getElementById('modal-body');
    if (modalBody) {
        modalBody.scrollTop = 0;
    }

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function closeRaceModal() {
    const modal = document.getElementById('race-modal');
    if (modal) {
        modal.classList.remove('modal-open');
    }
    document.body.style.overflow = '';
}

function handleRaceModalBackdrop(event) {
    if (event.target.id === 'race-modal') {
        closeRaceModal();
    }
}

function navigateRaceModal(direction) {
    if (!currentModalRaceKey) return;

    // If viewing an Elven subrace, cycle within elven subraces
    if (ELVEN_SUBRACE_KEYS.includes(currentModalRaceKey)) {
        const curIdx = ELVEN_SUBRACE_KEYS.indexOf(currentModalRaceKey);
        let nextIdx = curIdx + direction;
        if (nextIdx < 0) nextIdx = ELVEN_SUBRACE_KEYS.length - 1;
        if (nextIdx >= ELVEN_SUBRACE_KEYS.length) nextIdx = 0;
        const nextRaceKey = ELVEN_SUBRACE_KEYS[nextIdx];
        playRaceEffect(nextRaceKey, null);
        showRaceModal(nextRaceKey);
        return;
    }

    // Otherwise cycle within the 18 main races
    const curIdx = MAIN_RACE_KEYS.indexOf(currentModalRaceKey);
    if (curIdx === -1) return;

    let nextIdx = curIdx + direction;
    if (nextIdx < 0) nextIdx = MAIN_RACE_KEYS.length - 1;
    if (nextIdx >= MAIN_RACE_KEYS.length) nextIdx = 0;

    const nextRaceKey = MAIN_RACE_KEYS[nextIdx];
    playRaceEffect(nextRaceKey, null);
    showRaceModal(nextRaceKey);
}

function selectCurrentRaceInCharGen() {
    if (!currentModalRaceKey) return;
    
    let targetRace = currentModalRaceKey;
    if (targetRace === 'Elfen') targetRace = 'Hochelfen';

    closeRaceModal();
    switchPage('char');

    const raceSelect = document.getElementById('charRace');
    if (raceSelect) {
        raceSelect.value = targetRace;
        onRaceChange();
    }

    const charPage = document.getElementById('char');
    if (charPage) {
        charPage.scrollTop = 0;
    }
}

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeRaceModal();
        closeArchetypeModal();
    }
});

// ==========================================================================
// ARKANUM - ARCHETYP-CURSOR-SYSTEM & WEB AUDIO SYNTHESIZER
// ==========================================================================

class ArkanumAudioFX {
    constructor() {
        this.ctx = null;
        this.muted = false;
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) this.ctx = new AudioCtx();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    // Zauber-Klang: Wuchtiger magischer Einschlag (Sub-Bass Thump + Arkane Resonanz + Kristalliner Glanz)
    playMageSpell() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;

            // 1. Einschlag-Wucht (Tieffrequenter Thump)
            const subOsc = this.ctx.createOscillator();
            const subGain = this.ctx.createGain();
            subOsc.type = 'triangle';
            subOsc.frequency.setValueAtTime(190, now);
            subOsc.frequency.exponentialRampToValueAtTime(36, now + 0.16);

            subGain.gain.setValueAtTime(0.08, now);
            subGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.17);

            subOsc.connect(subGain);
            subGain.connect(this.ctx.destination);
            subOsc.start(now);
            subOsc.stop(now + 0.17);

            // 2. Arkane Resonanz (Bandpass-gefilterter Magie-Burst)
            const spellOsc = this.ctx.createOscillator();
            const spellGain = this.ctx.createGain();
            const spellFilter = this.ctx.createBiquadFilter();

            spellOsc.type = 'sine';
            spellOsc.frequency.setValueAtTime(860, now);
            spellOsc.frequency.exponentialRampToValueAtTime(240, now + 0.24);

            spellFilter.type = 'bandpass';
            spellFilter.frequency.setValueAtTime(1150, now);
            spellFilter.frequency.exponentialRampToValueAtTime(420, now + 0.24);
            spellFilter.Q.value = 4.0;

            spellGain.gain.setValueAtTime(0.065, now);
            spellGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

            spellOsc.connect(spellFilter);
            spellFilter.connect(spellGain);
            spellGain.connect(this.ctx.destination);
            spellOsc.start(now);
            spellOsc.stop(now + 0.25);

            // 3. Kristalline Funken-Obertöne
            const sparkOsc = this.ctx.createOscillator();
            const sparkGain = this.ctx.createGain();
            sparkOsc.type = 'sine';
            sparkOsc.frequency.setValueAtTime(1520, now);
            sparkOsc.frequency.exponentialRampToValueAtTime(680, now + 0.12);

            sparkGain.gain.setValueAtTime(0.04, now);
            sparkGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);

            sparkOsc.connect(sparkGain);
            sparkGain.connect(this.ctx.destination);
            sparkOsc.start(now);
            sparkOsc.stop(now + 0.13);
        } catch (e) {
            // Audio-Context erfordert ggf. User Gesture
        }
    }

    // Barbaren-Klang: Metall das aufeinanderschlägt (Klingen-Clang mit scharfem Attack & singendem Stahl)
    playBarbarianStrike() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;

            // 1. Scharfer metallischer Initial-Attack (Treffer-Transiente)
            const clickOsc = this.ctx.createOscillator();
            const clickGain = this.ctx.createGain();
            clickOsc.type = 'square';
            clickOsc.frequency.setValueAtTime(3400, now);
            clickOsc.frequency.exponentialRampToValueAtTime(850, now + 0.025);

            clickGain.gain.setValueAtTime(0.075, now);
            clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);

            clickOsc.connect(clickGain);
            clickGain.connect(this.ctx.destination);
            clickOsc.start(now);
            clickOsc.stop(now + 0.025);

            // 2. Hoher singender Stahl-Klang (1840 Hz Inharmonische Resonanz)
            const ring1 = this.ctx.createOscillator();
            const ringGain1 = this.ctx.createGain();
            ring1.type = 'triangle';
            ring1.frequency.setValueAtTime(1860, now);
            ring1.frequency.exponentialRampToValueAtTime(1400, now + 0.20);

            ringGain1.gain.setValueAtTime(0.07, now);
            ringGain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

            ring1.connect(ringGain1);
            ringGain1.connect(this.ctx.destination);
            ring1.start(now);
            ring1.stop(now + 0.22);

            // 3. Mittlere metallische Körper-Resonanz (840 Hz, Resonanzfilter)
            const ring2 = this.ctx.createOscillator();
            const ringGain2 = this.ctx.createGain();
            const filter2 = this.ctx.createBiquadFilter();

            ring2.type = 'sawtooth';
            ring2.frequency.setValueAtTime(880, now);
            ring2.frequency.exponentialRampToValueAtTime(580, now + 0.17);

            filter2.type = 'bandpass';
            filter2.frequency.setValueAtTime(1350, now);
            filter2.Q.value = 5.5; // Sehr resonanter Metall-Q-Faktor

            ringGain2.gain.setValueAtTime(0.07, now);
            ringGain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.19);

            ring2.connect(filter2);
            filter2.connect(ringGain2);
            ringGain2.connect(this.ctx.destination);
            ring2.start(now);
            ring2.stop(now + 0.19);

            // 4. Schwerer Eisen-Körper (Aufschlag-Masse der Axt)
            const thud = this.ctx.createOscillator();
            const thudGain = this.ctx.createGain();
            thud.type = 'triangle';
            thud.frequency.setValueAtTime(170, now);
            thud.frequency.exponentialRampToValueAtTime(50, now + 0.13);

            thudGain.gain.setValueAtTime(0.08, now);
            thudGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

            thud.connect(thudGain);
            thudGain.connect(this.ctx.destination);
            thud.start(now);
            thud.stop(now + 0.14);
        } catch (e) {
            // Audio-Context erfordert ggf. User Gesture
        }
    }
}

const sfxEngine = new ArkanumAudioFX();

function triggerCursorClickEffect(e) {
    // Mobilgeräte & Touch ignorieren
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    // Nur bei primärem Klick (Linksklick) auslösen
    if (e.button !== 0) return;

    // Prüfen ob ein flüchtiger Geist in Treffernähe getroffen wurde
    checkGhostClickHit(e.clientX, e.clientY);

    const archetype = localStorage.getItem('arkanum_cursor_archetype');
    if (!archetype || archetype === 'default') return;

    const fx = document.createElement('div');
    fx.className = 'cursor-click-fx';
    fx.style.left = `${e.clientX}px`;
    fx.style.top = `${e.clientY}px`;

    if (archetype === 'mage') {
        fx.classList.add('fx-mage-burst');
        sfxEngine.playMageSpell();
    } else if (archetype === 'barbarian') {
        fx.classList.add('fx-barbarian-slash');
        sfxEngine.playBarbarianStrike();
    }

    document.body.appendChild(fx);
    setTimeout(() => fx.remove(), 400);
}

window.addEventListener('pointerdown', triggerCursorClickEffect);

function initCursorArchetype() {
    const saved = localStorage.getItem('arkanum_cursor_archetype');
    const modal = document.getElementById('archetype-modal');

    // Nur auf Desktops mit Mauszeiger anbieten
    const hasMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!hasMouse) return;

    if (!saved || saved === 'null') {
        applyCursorClass(null);
        updateFooterCursorUI('default');
        if (modal) modal.classList.remove('hidden');
    } else {
        applyCursorClass(saved);
        updateFooterCursorUI(saved);
    }
}

function openArchetypeModal() {
    const modal = document.getElementById('archetype-modal');
    if (modal) {
        modal.classList.remove('hidden');
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
}

function closeArchetypeModal() {
    const modal = document.getElementById('archetype-modal');
    if (modal) modal.classList.add('hidden');
}

function handleArchetypeModalBackdrop(event) {
    if (event.target.id === 'archetype-modal') {
        closeArchetypeModal();
    }
}

function setCursorArchetype(type) {
    if (!type || type === 'null') {
        resetCursorArchetype();
    } else {
        localStorage.setItem('arkanum_cursor_archetype', type);
        applyCursorClass(type);
        updateFooterCursorUI(type);

        // Audio initialisieren (Browser-User-Gesture)
        sfxEngine.init();
        if (type === 'mage') sfxEngine.playMageSpell();
        if (type === 'barbarian') sfxEngine.playBarbarianStrike();
    }

    closeArchetypeModal();
}

function resetCursorArchetype() {
    localStorage.removeItem('arkanum_cursor_archetype');
    applyCursorClass(null);
    updateFooterCursorUI('default');
}

function resetAllLocalData() {
    try {
        localStorage.removeItem('arkanumProtocolAccepted');
        localStorage.removeItem('hasEnteredArkanum');
        localStorage.removeItem('visitCount');
        localStorage.removeItem('arkanum_char_draft');
        localStorage.removeItem('arkanum_cursor_archetype');
        localStorage.removeItem('arkanum_ghost_kills');
        ghostKills = 0;
        updateGhostScoreUI();
        applyCursorClass(null);
        updateFooterCursorUI('default');
    } catch (e) {
        console.error('Fehler beim Zurücksetzen der lokalen Daten:', e);
    }
    location.reload();
}

window.resetAllLocalData = resetAllLocalData;
window.resetCursorArchetype = resetCursorArchetype;

window.addEventListener('storage', (e) => {
    if (e.key === 'arkanum_cursor_archetype' || e.key === null) {
        initCursorArchetype();
    }
    if (e.key === 'arkanum_ghost_kills' || e.key === null) {
        ghostKills = parseInt(localStorage.getItem('arkanum_ghost_kills') || '0');
        updateGhostScoreUI();
    }
});

// ==========================================================================
// ARKANUM - EASTER EGG: FLÜCHTIGE GEISTER & SEELEN-ZÄHLER
// ==========================================================================

let ghostKills = parseInt(localStorage.getItem('arkanum_ghost_kills') || '0');
let activeGhosts = [];
let ghostIdCounter = 0;
let lastGhostSpawnTime = performance.now();
let nextGhostSpawnDelay = 3500; // Erster Geist nach 3.5 Sekunden

function updateGhostScoreUI() {
    const badge = document.getElementById('footer-ghost-badge');
    const countEl = document.getElementById('footer-ghost-count');
    if (!badge || !countEl) return;

    if (ghostKills >= 1) {
        badge.classList.remove('hidden');
        badge.classList.add('flex');
        countEl.innerText = ghostKills.toString();
        if (typeof lucide !== 'undefined') lucide.createIcons();
    } else {
        badge.classList.add('hidden');
        badge.classList.remove('flex');
    }
}

function incrementGhostKill() {
    ghostKills++;
    localStorage.setItem('arkanum_ghost_kills', ghostKills.toString());
    updateGhostScoreUI();
}

function spawnSoulScorePopup(x, y) {
    const popup = document.createElement('div');
    popup.className = 'ghost-score-popup';
    popup.innerText = '+1 Geist gebannt';
    popup.style.left = `${x}px`;
    popup.style.top = `${y}px`;
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 850);
}

class ArcaneGhost {
    constructor(id, container) {
        this.id = id;
        this.container = container;
        this.width = 38;
        this.height = 46;
        this.isAlive = true;
        this.fleeSpeed = 0;
        this.facing = 1;
        this.spawn();
    }

    spawn() {
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        // Streng innerhalb des sichtbaren Blickfeldes (Viewport) erzeugen
        const minX = 60;
        const maxX = Math.max(minX + 40, vw - 100);
        const minY = 95;  // Unterhalb der Navigationsleiste
        const maxY = Math.max(minY + 40, vh - 95); // Oberhalb der Fußzeile

        this.x = minX + Math.random() * (maxX - minX);
        this.y = minY + Math.random() * (maxY - minY);
        this.angle = Math.random() * Math.PI * 2; // Beliebige Startrichtung

        this.baseSpeed = Math.random() * 0.45 + 0.65; // Ruhige, schwebende Geschwindigkeit (0.65 - 1.1 px)
        this.turnTimer = Math.random() * 150 + 90;
        this.turnRate = 0;

        // Lebensdauer: 22 - 34 Sekunden rein im Blickfeld, danach sanftes Ausblenden
        this.lifespan = 22000 + Math.random() * 12000;
        this.spawnTime = performance.now();
        this.isFading = false;

        this.el = document.createElement('div');
        this.el.className = 'arcane-ghost cursor-pointer';
        this.el.setAttribute('role', 'button');
        this.el.setAttribute('title', 'Flüchtiger Geist (Klicke mit Stab oder Axt zum Verbannen)');
        this.el.innerHTML = `
            <div class="ghost-inner">
                <svg class="ghost-svg w-9 h-11 overflow-visible" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <radialGradient id="ghostGlow_${this.id}" cx="50%" cy="40%" r="50%">
                            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95"/>
                            <stop offset="35%" stop-color="#fecaca" stop-opacity="0.85"/>
                            <stop offset="70%" stop-color="#f87171" stop-opacity="0.5"/>
                            <stop offset="100%" stop-color="#ef4444" stop-opacity="0.15"/>
                        </radialGradient>
                        <filter id="ghostRedGlow_${this.id}" x="-30%" y="-30%" width="160%" height="160%">
                            <feDropShadow dx="0" dy="0" stdDeviation="2.2" flood-color="#ef4444" flood-opacity="0.85"/>
                        </filter>
                    </defs>
                    <!-- Geist-Körper mit markantem roten Rand (Rot umrandet) -->
                    <path d="M16 3 C8 3 4 10 4 18 C4 26 7 28 8 36 C10 32 12 34 16 37 C20 34 22 32 24 36 C25 28 28 26 28 18 C28 10 24 3 16 3 Z" 
                          fill="url(#ghostGlow_${this.id})" 
                          stroke="#ef4444" 
                          stroke-width="2.2" 
                          stroke-linejoin="round"
                          filter="url(#ghostRedGlow_${this.id})"/>
                    <!-- Augenhöhlen & glimmende rote Pupillen mit Lichtglanz -->
                    <ellipse cx="11.5" cy="15" rx="2" ry="2.7" fill="#150505" stroke="#ef4444" stroke-width="0.8"/>
                    <ellipse cx="20.5" cy="15" rx="2" ry="2.7" fill="#150505" stroke="#ef4444" stroke-width="0.8"/>
                    <circle cx="12" cy="14.5" r="1.1" fill="#ff2222"/>
                    <circle cx="21" cy="14.5" r="1.1" fill="#ff2222"/>
                    <circle cx="12.4" cy="14.1" r="0.4" fill="#ffffff"/>
                    <circle cx="21.4" cy="14.1" r="0.4" fill="#ffffff"/>
                    <!-- Roter Seelenkern / Rune -->
                    <polygon points="16,21 18.5,25 16,29 13.5,25" fill="#ef4444" fill-opacity="0.8" stroke="#ff8888" stroke-width="0.7"/>
                </svg>
            </div>
        `;

        this.el.addEventListener('pointerdown', (e) => {
            e.stopPropagation();
            this.vanquish(e.clientX, e.clientY);
        });

        this.container.appendChild(this.el);
        this.render();
    }

    update() {
        if (!this.isAlive) return;

        // Lebensdauer im Blickfeld prüfen (sanftes Ausblenden vor Zerstörung)
        const age = performance.now() - this.spawnTime;
        if (age > this.lifespan - 2200 && !this.isFading) {
            this.isFading = true;
            const inner = this.el.querySelector('.ghost-inner');
            if (inner) inner.classList.add('ghost-fading');
        }
        if (age >= this.lifespan) {
            this.destroy();
            return;
        }

        // 1. Richtungswechsel (Wandering-Logik)
        this.turnTimer--;
        if (this.turnTimer <= 0) {
            this.turnRate = (Math.random() - 0.5) * 0.035; // sanfte Richtungsänderung
            this.turnTimer = Math.random() * 160 + 100;
        }
        this.angle += this.turnRate;

        // 2. Maus-Ausweich-KI (Evasion)
        const centerX = this.x + 19;
        const centerY = this.y + 23;
        const distToMouse = Math.hypot(centerX - mousePos.x, centerY - mousePos.y);
        const evasionRadius = 115;
        let isFleeing = false;

        if (distToMouse < evasionRadius && mousePos.x > 0 && mousePos.y > 0) {
            isFleeing = true;
            const fleeAngle = Math.atan2(centerY - mousePos.y, centerX - mousePos.x);
            // Schnelle Ausweichdrehung weg vom Cursor
            const diff = Math.atan2(Math.sin(fleeAngle - this.angle), Math.cos(fleeAngle - this.angle));
            this.angle += diff * 0.18;
            this.fleeSpeed = Math.min(this.fleeSpeed + 0.38, 3.2); // Beschleunigungsschub beim Ausweichen
        } else {
            this.fleeSpeed = Math.max(this.fleeSpeed - 0.07, 0);
        }

        const currentSpeed = this.baseSpeed + this.fleeSpeed;
        let nextX = this.x + Math.cos(this.angle) * currentSpeed;
        let nextY = this.y + Math.sin(this.angle) * currentSpeed;

        // 3. Strikte Begrenzung auf das Sichtfeld (Viewport Confinement & Wall Deflection)
        // Die Geister können NIEMALS das Blickfeld verlassen!
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const minX = 25;
        const maxX = Math.max(minX + 30, vw - 65);
        const minY = 85;   // Unterhalb der Navigationsleiste
        const maxY = Math.max(minY + 30, vh - 75);  // Oberhalb der Statusleiste

        let bounced = false;
        if (nextX <= minX) {
            nextX = minX;
            if (Math.cos(this.angle) < 0) {
                this.angle = Math.PI - this.angle;
                bounced = true;
            }
        } else if (nextX >= maxX) {
            nextX = maxX;
            if (Math.cos(this.angle) > 0) {
                this.angle = Math.PI - this.angle;
                bounced = true;
            }
        }

        if (nextY <= minY) {
            nextY = minY;
            if (Math.sin(this.angle) < 0) {
                this.angle = -this.angle;
                bounced = true;
            }
        } else if (nextY >= maxY) {
            nextY = maxY;
            if (Math.sin(this.angle) > 0) {
                this.angle = -this.angle;
                bounced = true;
            }
        }

        if (bounced) {
            // Leichte zufällige Streuung beim Abprallen für organische Flugbahnen
            this.angle += (Math.random() - 0.5) * 0.2;
        }

        // Winkel normalisieren
        this.angle = Math.atan2(Math.sin(this.angle), Math.cos(this.angle));

        this.x = nextX;
        this.y = nextY;

        // Blickrichtung zur Flugrichtung
        if (Math.cos(this.angle) < -0.15) this.facing = -1;
        else if (Math.cos(this.angle) > 0.15) this.facing = 1;

        if (isFleeing) {
            this.el.classList.add('ghost-fleeing');
        } else {
            this.el.classList.remove('ghost-fleeing');
        }

        this.render();
    }

    render() {
        if (!this.el) return;
        this.el.style.transform = `translate3d(${this.x}px, ${this.y}px, 0) scaleX(${this.facing})`;
    }

    vanquish(clickX, clickY) {
        if (!this.isAlive) return;
        this.isAlive = false;

        const posX = clickX || (this.x + 19);
        const posY = clickY || (this.y + 23);

        // Klickeffekt & Sound des gewählten Cursors
        const archetype = localStorage.getItem('arkanum_cursor_archetype');
        const fx = document.createElement('div');
        fx.className = 'cursor-click-fx';
        fx.style.left = `${posX}px`;
        fx.style.top = `${posY}px`;

        if (archetype === 'barbarian') {
            fx.classList.add('fx-barbarian-slash');
            sfxEngine.playBarbarianStrike();
        } else {
            fx.classList.add('fx-mage-burst');
            sfxEngine.playMageSpell();
        }
        document.body.appendChild(fx);
        setTimeout(() => fx.remove(), 400);

        // Seelen-Punkte-Popup (+1)
        spawnSoulScorePopup(posX, posY);

        // Bannungs-Animation auf .ghost-inner
        const inner = this.el.querySelector('.ghost-inner');
        if (inner) inner.classList.add('ghost-vanquished');
        setTimeout(() => this.destroy(), 440);

        // Zähler erhöhen
        incrementGhostKill();
    }

    destroy() {
        this.isAlive = false;
        if (this.el && this.el.parentNode) {
            this.el.parentNode.removeChild(this.el);
        }
    }
}

function spawnArcaneGhost() {
    const container = document.getElementById('ghost-container');
    if (!container) return;
    ghostIdCounter++;
    const ghost = new ArcaneGhost(ghostIdCounter, container);
    activeGhosts.push(ghost);
}

function updateGhosts(timestamp) {
    const container = document.getElementById('ghost-container');
    if (!container) return;

    if (timestamp - lastGhostSpawnTime > nextGhostSpawnDelay) {
        if (activeGhosts.length < 2) {
            spawnArcaneGhost();
        }
        lastGhostSpawnTime = timestamp;
        nextGhostSpawnDelay = 12000 + Math.random() * 14000; // alle 12 - 26 Sekunden
    }

    for (let i = activeGhosts.length - 1; i >= 0; i--) {
        const ghost = activeGhosts[i];
        if (ghost.isAlive) {
            ghost.update();
        } else {
            activeGhosts.splice(i, 1);
        }
    }
}

function checkGhostClickHit(clickX, clickY) {
    for (let i = 0; i < activeGhosts.length; i++) {
        const g = activeGhosts[i];
        if (g.isAlive) {
            const dist = Math.hypot(g.x + 19 - clickX, g.y + 23 - clickY);
            if (dist < 46) {
                g.vanquish(clickX, clickY);
                return true;
            }
        }
    }
    return false;
}

function applyCursorClass(type) {
    document.body.classList.remove('cursor-mage', 'cursor-barbarian');
    if (type === 'mage') {
        document.body.classList.add('cursor-mage');
    } else if (type === 'barbarian') {
        document.body.classList.add('cursor-barbarian');
    }
    const aura = document.getElementById('cursor-aura');
    if (aura) {
        if (!type || type === 'null') {
            aura.classList.remove('aura-active');
            aura.style.display = 'none';
        } else {
            aura.style.display = 'block';
        }
    }
}

function updateFooterCursorUI(type) {
    const iconEl = document.getElementById('footer-cursor-icon');
    const labelEl = document.getElementById('footer-cursor-label');
    if (!iconEl) return;

    if (type === 'mage') {
        iconEl.setAttribute('data-lucide', 'wand-2');
        if (labelEl) labelEl.innerText = 'Arkanist';
    } else if (type === 'barbarian') {
        iconEl.setAttribute('data-lucide', 'axe');
        if (labelEl) labelEl.innerText = 'Krieger';
    } else {
        iconEl.setAttribute('data-lucide', 'mouse-pointer');
        if (labelEl) labelEl.innerText = 'Standard';
    }
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// --- DUAL-CANVAS PARTIKELSYSTEM (KAPITEL 3.1) ---
// Layer 1: Astralische Rauchschwaden (Ambient Mist)
// Layer 2: Mana-Cyan Runenfunken (Mana Motes)
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let mistParticles = [];
let manaMotes = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        resizeCanvas();
        initParticles();
    }, 150);
});

let cursorAuraEl = null;

window.addEventListener('mousemove', (e) => {
    mousePos.x = e.clientX;
    mousePos.y = e.clientY;

    if (!cursorAuraEl) {
        cursorAuraEl = document.getElementById('cursor-aura');
    }
    if (cursorAuraEl && (document.body.classList.contains('cursor-mage') || document.body.classList.contains('cursor-barbarian'))) {
        // Hotspot Offset: Mana-Kristallspitze / Axtschneide liegt bei (e.clientX + 2, e.clientY + 2)
        cursorAuraEl.style.transform = `translate3d(${e.clientX + 2}px, ${e.clientY + 2}px, 0) translate(-50%, -50%)`;

        // Prüfen, ob Maus über klickbaren Elementen schwebt
        const target = e.target;
        if (target && target.closest) {
            const isClickable = target.closest('a, button, [role="button"], [onclick], .cursor-pointer, [class*="cursor-pointer"], summary, select, label, .race-tile, .holo-card, .arcane-ghost, .nav-btn, input, [tabindex]:not([tabindex="-1"])');
            if (isClickable) {
                cursorAuraEl.classList.add('aura-active');
            } else {
                cursorAuraEl.classList.remove('aura-active');
            }
        }
    }
});

window.addEventListener('mouseleave', () => {
    mousePos.x = -1000;
    mousePos.y = -1000;
    if (cursorAuraEl) {
        cursorAuraEl.classList.remove('aura-active');
        cursorAuraEl.style.transform = 'translate3d(-100px, -100px, 0)';
    }
});

resizeCanvas();

// Layer 1: Ambient Astral Mist (weiche, großflächige Nebelschwaden)
class AstralMist {
    constructor() {
        this.reset(true);
    }
    reset(initial = false) {
        this.x = Math.random() * canvas.width;
        this.y = initial ? Math.random() * canvas.height : canvas.height + 100;
        this.radius = Math.random() * 80 + 70; // 70px - 150px
        this.speedY = -(Math.random() * 0.10 + 0.04); // Sehr langsame, erhabene Aufwärtsdrift
        this.speedX = (Math.random() - 0.5) * 0.15;
        this.baseOpacity = Math.random() * 0.045 + 0.025; // 0.025 - 0.07
        this.opacity = this.baseOpacity;
        this.sineOffset = Math.random() * Math.PI * 2;
        this.sineSpeed = Math.random() * 0.003 + 0.0015;
    }
    update(timestamp) {
        this.x += this.speedX + Math.sin(timestamp * this.sineSpeed + this.sineOffset) * 0.2;
        this.y += this.speedY;

        if (this.y < -this.radius * 2) {
            this.reset(false);
        }
    }
    draw() {
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        gradient.addColorStop(0, `rgba(56, 189, 248, ${this.opacity * 1.3})`);
        gradient.addColorStop(0.5, `rgba(6, 182, 212, ${this.opacity * 0.7})`);
        gradient.addColorStop(1, 'rgba(2, 6, 23, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Layer 2: Mana Motes / Runenfunken (scharfe Cyan- & Silber-Punkte mit Magnetresonanz)
class ManaMote {
    constructor() {
        this.reset(true);
    }
    reset(initial = false) {
        this.x = Math.random() * canvas.width;
        this.y = initial ? Math.random() * canvas.height : canvas.height + 20;
        this.radius = Math.random() * 1.5 + 0.8; // 0.8px - 2.3px
        this.speedY = -(Math.random() * 0.42 + 0.16); // Beruhigte, majestätisch langsame Aufwärtsdrift
        this.speedX = (Math.random() - 0.5) * 0.28;
        this.opacity = Math.random() * 0.6 + 0.4;
        this.isSilver = Math.random() > 0.6;
        this.color = this.isSilver ? `rgba(255, 255, 255, ${this.opacity})` : `rgba(0, 229, 255, ${this.opacity})`;
        this.glowColor = this.isSilver ? `rgba(203, 213, 225, ${this.opacity * 0.35})` : `rgba(0, 229, 255, ${this.opacity * 0.45})`;
        this.spiralAngle = Math.random() * Math.PI * 2;
        this.spiralSpeed = (Math.random() - 0.5) * 0.02;
        this.spiralRadius = Math.random() * 10 + 4;
    }
    update() {
        this.spiralAngle += this.spiralSpeed;
        this.x += this.speedX + Math.cos(this.spiralAngle) * 0.15;
        this.y += this.speedY;

        // Sanfte magnetische Resonanz zur Maus
        const dx = mousePos.x - this.x;
        const dy = mousePos.y - this.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 180 && dist > 10) {
            const force = (180 - dist) / 180 * 0.3;
            this.x += (dx / dist) * force;
            this.y += (dy / dist) * force;
        }

        if (this.y < -15 || this.x < -20 || this.x > canvas.width + 20) {
            this.reset(false);
        }
    }
    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = this.glowColor;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 3.5, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initParticles() {
    mistParticles = [];
    manaMotes = [];
    const isMobile = window.innerWidth < 768;
    const mistCount = isMobile ? 18 : 36;
    const moteCount = isMobile ? 50 : 130;

    for (let i = 0; i < mistCount; i++) {
        mistParticles.push(new AstralMist());
    }
    for (let i = 0; i < moteCount; i++) {
        manaMotes.push(new ManaMote());
    }
}
initParticles();

function drawParticles(timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Layer 1: Nebelschwaden
    mistParticles.forEach(p => {
        p.update(timestamp);
        p.draw();
    });

    // Layer 2: Mana Motes
    manaMotes.forEach(p => {
        p.update();
        p.draw();
    });
}

// --- ROUTING SYSTEM & HASH URLS ---
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash && document.getElementById(hash) && localStorage.getItem('hasEnteredArkanum') === 'true') {
        if (hash !== currentPageId) switchPage(hash, true);
    }
});

function initRouting() {
    const hasEntered = localStorage.getItem('hasEnteredArkanum') === 'true';
    const nav = document.getElementById('main-nav');
    const footer = document.getElementById('main-footer');
    const portalPage = document.getElementById('portal');
    const homePage = document.getElementById('home');
    const welcomeTitle = document.getElementById('welcome-title');
    
    let visits = parseInt(localStorage.getItem('visitCount') || '0');

    if (!hasEntered) {
        nav.style.display = 'none';
        footer.style.display = 'none';
        portalPage.style.display = 'flex';
        portalPage.classList.add('page-active');
        homePage.style.display = 'none';
        homePage.classList.remove('page-active');
        currentPageId = 'portal';
    } else {
        nav.style.display = 'flex'; 
        footer.style.display = 'flex';
        portalPage.style.display = 'none';
        portalPage.classList.remove('page-active');
        
        let targetHash = window.location.hash.replace('#', '');
        if (!targetHash || !document.getElementById(targetHash) || targetHash === 'portal') {
            targetHash = 'home';
        }
        
        const startPage = document.getElementById(targetHash) || homePage;
        startPage.style.display = 'block';
        startPage.classList.add('page-active');
        currentPageId = targetHash;
        
        visits++;
        localStorage.setItem('visitCount', visits);
        
        if (welcomeTitle) {
            welcomeTitle.innerText = visits > 1 ? "Willkommen zurück in ARKANUM" : "Willkommen in den Hallen von ARKANUM";
        }
        
        updateNavButtons(targetHash);
    }
}

function updateNavButtons(targetId) {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        if (btn.dataset.target === targetId) {
            btn.classList.add('text-white', 'border-cyan-400', 'bg-white/5'); 
            btn.classList.remove('text-slate-400', 'border-transparent', 'text-gray-400');
        } else {
            btn.classList.remove('text-white', 'border-cyan-400', 'bg-white/5'); 
            btn.classList.add('text-slate-400', 'border-transparent');
        }
    });
}

// --- PORTAL ENTRY: DAS ERWACHEN DES ARKANEN SIEGELS (KAPITEL 3.2) ---
function enterArkanum() {
    if (currentState !== STATE.IDLE || isTransitioning) return;
    
    currentState = STATE.SURGE;
    isTransitioning = true;
    
    const loader = document.getElementById('rift-loader');
    const sigilStage = document.getElementById('loader-sigil-stage');
    const shockwave = document.getElementById('sigil-shockwave');
    const loaderText = document.getElementById('loader-text');
    const nav = document.getElementById('main-nav');
    const footer = document.getElementById('main-footer');
    
    document.querySelectorAll('.rift-sidebar').forEach(p => p.classList.add('system-surge'));
    
    // Phase 1: Fokus & Erwachen
    loader.classList.add('active');
    if (shockwave) shockwave.classList.remove('shockwave-active');
    if (sigilStage) sigilStage.style.transform = 'scale(0.85)';
    if (loaderText) loaderText.style.opacity = '1';

    // Phase 2: Beschleunigte Rotation & Glyphen-Übersteuerung
    setTimeout(() => {
        if (sigilStage) {
            sigilStage.style.transition = 'transform 1.8s cubic-bezier(0.2, 0.8, 0.2, 1), filter 1.8s ease';
            sigilStage.style.transform = 'scale(1.25)';
            sigilStage.style.filter = 'drop-shadow(0 0 35px #00e5ff) drop-shadow(0 0 70px #ffffff)';
        }
        loader.classList.add('animate-shake');
    }, 1800);

    // Phase 3: Kritischer Schock & Druckwelle (scale 35)
    setTimeout(() => {
        if (shockwave) {
            shockwave.classList.add('shockwave-active');
        }
        if (loaderText) {
            loaderText.style.transition = 'opacity 0.25s ease';
            loaderText.style.opacity = '0';
        }
    }, 3100);

    // Umschalten zur Hauptwelt
    setTimeout(() => {
        const portal = document.getElementById('portal');
        const home = document.getElementById('home');
        
        portal.classList.remove('page-active');
        portal.style.display = 'none';
        
        home.style.display = 'block';
        requestAnimationFrame(() => home.classList.add('page-active'));
        
        nav.style.display = 'flex';
        footer.style.display = 'flex';
        
        currentPageId = 'home';
        window.location.hash = '#home';
        
        localStorage.setItem('hasEnteredArkanum', 'true');
        localStorage.setItem('visitCount', '1');
        
        const welcomeTitle = document.getElementById('welcome-title');
        if (welcomeTitle) welcomeTitle.innerText = "Willkommen in den Hallen von ARKANUM";
        
        updateNavButtons('home');
        loader.classList.remove('animate-shake'); 
        startCooldown(); 
    }, 3600);

    // Loader ausblenden
    setTimeout(() => {
        loader.style.transition = 'opacity 1s ease-out, visibility 1s ease-out';
        loader.classList.remove('active');
        
        setTimeout(() => {
            isTransitioning = false;
            if (sigilStage) sigilStage.style.transform = 'scale(1)';
        }, 1100);
    }, 4200); 
}

// Rückwärtskompatibler Alias
function enterRift() {
    enterArkanum();
}

// --- NORMAL MENU NAVIGATION ---
function switchPage(targetId, fromHashChange = false) {
    if (isTransitioning || targetId === currentPageId) return;
    
    if (!fromHashChange && localStorage.getItem('hasEnteredArkanum') === 'true') {
        history.pushState(null, null, '#' + targetId);
    }

    isTransitioning = true;
    const currentPage = document.getElementById(currentPageId);
    const targetPage = document.getElementById(targetId);

    updateNavButtons(targetId);

    // Sanfter Lichtimpuls an den Rand-Fäden
    document.querySelectorAll('.rift-sidebar').forEach(el => el.classList.add('system-surge'));

    if (currentPage) {
        currentPage.style.transition = 'opacity 0.18s ease-out, transform 0.18s ease-out';
        currentPage.style.opacity = '0';
        currentPage.style.transform = 'scale(0.99)';

        setTimeout(() => {
            currentPage.classList.remove('page-active');
            currentPage.style.display = 'none';

            if (targetPage) {
                targetPage.style.display = 'block';
                targetPage.scrollTop = 0;
                targetPage.style.opacity = '0';
                targetPage.style.transform = 'scale(1.01)';

                requestAnimationFrame(() => {
                    targetPage.classList.add('page-active');
                    targetPage.style.transition = 'opacity 0.22s ease-in, transform 0.22s ease-in';
                    targetPage.style.opacity = '1';
                    targetPage.style.transform = 'scale(1)';
                });
            }
            currentPageId = targetId;

            // Re-render Icons falls nötig
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }

            setTimeout(() => {
                document.querySelectorAll('.rift-sidebar').forEach(el => el.classList.remove('system-surge'));
                isTransitioning = false;
            }, 200);
        }, 180);
    } else {
        if (targetPage) {
            targetPage.style.display = 'block';
            targetPage.scrollTop = 0;
            targetPage.classList.add('page-active');
            targetPage.style.opacity = '1';
            targetPage.style.transform = 'scale(1)';
        }
        currentPageId = targetId;
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        document.querySelectorAll('.rift-sidebar').forEach(el => el.classList.remove('system-surge'));
        isTransitioning = false;
    }
}

// --- DER ARKANE RESONATOR (KAPITEL 3.4) ---
function updateLoop(timestamp) {
    if (!isTabActive) return; 

    drawParticles(timestamp);
    updateGhosts(timestamp);
    if (currentState === STATE.IDLE) {
        updateIdle(timestamp);
    }
    animationFrameId = requestAnimationFrame(updateLoop);
}

function updateIdle(timestamp) {
    if (timestamp - lastRandomChange > 2400 + Math.random() * 3000) {
        if (Math.random() > 0.78) {
            idleTarget = 55 + Math.random() * 45; 
        } else {
            idleTarget = 12 + Math.random() * 18; 
        }
        lastRandomChange = timestamp;
    }

    const jitter = Math.sin(timestamp / 350) * 1.8;
    const activeTarget = idleTarget + jitter;
    idleCurrent += (activeTarget - idleCurrent) * 0.025; 
    updateUI(idleCurrent);
}

function updateUI(value) {
    const compass = document.getElementById('rune-compass');
    const riftValText = document.getElementById('rift-val');
    const container = document.getElementById('rune-container');

    if (riftValText) {
        if (value > 65) {
            riftValText.innerText = "Kritisch";
            riftValText.className = "text-white font-bold drop-shadow-[0_0_8px_#ffffff]";
            if (container) container.classList.add('animate-shake');
        } else if (value > 30) {
            riftValText.innerText = "Fluktuierend";
            riftValText.className = "text-cyan-400 font-semibold drop-shadow-[0_0_6px_#00e5ff]";
            if (container) container.classList.remove('animate-shake');
        } else {
            riftValText.innerText = "Ruhig";
            riftValText.className = "text-sky-300";
            if (container) container.classList.remove('animate-shake');
        }
    }

    if (compass) {
        currentRotation += (value * 0.04); 
        compass.style.transform = `rotate(${currentRotation}deg) scale(${1 + (value / 350)}) translateZ(0)`;
    }
}

function startCooldown() {
    currentState = STATE.COOLDOWN;
    document.querySelectorAll('.rift-sidebar').forEach(p => p.classList.remove('system-surge'));

    let startVal = 100;
    const endVal = 15; 
    let startTime = performance.now();

    function animateCooldown(timestamp) {
        if (currentState !== STATE.COOLDOWN) return;

        const progress = timestamp - startTime;
        const percent = Math.min(progress / 1400, 1);
        const ease = 1 - Math.pow(1 - percent, 3);
        const currentVal = startVal - ((startVal - endVal) * ease);
        
        idleCurrent = currentVal;
        updateUI(currentVal); 

        if (progress < 1400) {
            requestAnimationFrame(animateCooldown);
        } else {
            currentState = STATE.IDLE;
            idleCurrent = 15; 
            idleTarget = 15; 
            lastRandomChange = performance.now();
        }
    }
    requestAnimationFrame(animateCooldown);
}

// --- TAB-VISIBILITY ---
let animationFrameId;
let isTabActive = true;

document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        isTabActive = false;
        cancelAnimationFrame(animationFrameId); 
    } else {
        isTabActive = true;
        lastRandomChange = performance.now(); 
        updateLoop(performance.now()); 
    }
});

// --- DYNAMISCHE VÖLKER-LOGIK & KÖRPERGRÖSSEN-VALIDIERUNG (KAPITEL 5) ---
function onRaceChange() {
    const raceSelect = document.getElementById('charRace');
    const selectedRace = raceSelect.value;
    const heightSlider = document.getElementById('charHeight');
    const heightDisplay = document.getElementById('heightDisplay');
    const raceInfoBox = document.getElementById('race-info-box');
    const customContainer = document.getElementById('customRaceContainer');
    const magicLimitWarning = document.getElementById('magic-limit-warning');

    const spec = RACE_SPECS[selectedRace] || { minH: 1.20, maxH: 2.40, magic: [], maxMagic: 2, notes: '' };

    // Slider Limits anpassen
    heightSlider.min = spec.minH;
    heightSlider.max = spec.maxH;
    heightSlider.step = "0.01";

    let currentVal = parseFloat(heightSlider.value);
    if (isNaN(currentVal) || currentVal < spec.minH) currentVal = spec.minH;
    if (currentVal > spec.maxH) currentVal = spec.maxH;
    heightSlider.value = currentVal.toFixed(2);
    
    if (heightDisplay) {
        heightDisplay.innerText = `${currentVal.toFixed(2)}m (Erlaubt: ${spec.minH.toFixed(2)}m - ${spec.maxH.toFixed(2)}m)`;
    }

    // Info-Box anzeigen
    if (raceInfoBox) {
        if (spec.notes) {
            raceInfoBox.classList.remove('hidden');
            raceInfoBox.innerHTML = `
                <div class="text-sm border-l-2 border-cyan-400 pl-4 py-1 text-slate-300">
                    <span class="text-cyan-300 font-bold">${selectedRace}:</span> ${spec.notes}
                    <div class="mt-1 text-xs text-slate-400"><strong class="text-slate-300">Magie-Affinitäten:</strong> ${spec.magic.join(', ') || 'Keine Einschränkung'} (Max. ${spec.maxMagic} Magieart${spec.maxMagic > 1 ? 'en' : ''})</div>
                </div>
            `;
        } else {
            raceInfoBox.classList.add('hidden');
        }
    }

    // Custom Race Box
    if (customContainer) {
        if (selectedRace === 'Neue Rasse') {
            customContainer.classList.remove('hidden');
        } else {
            customContainer.classList.add('hidden');
        }
    }

    // Astralelfen RP-Warnung
    if (selectedRace === 'Astralelfen') {
        alert("Hinweis zur Lore: Astralelfen sind nicht als Startrasse wählbar! Man wird im RP dazu 'wiedergeboren' (Grauer Meister / Grauer Orden). Bitte stimme dieses Konzept zwingend mit dem Team ab.");
    }

    // Magiearten auf Kompatibilität prüfen
    validateMagicHarmony();
}

function updateHeightDisplay(val) {
    const raceSelect = document.getElementById('charRace');
    const spec = RACE_SPECS[raceSelect.value] || { minH: 1.20, maxH: 2.40 };
    const display = document.getElementById('heightDisplay');
    const num = parseFloat(val);
    if (display) {
        display.innerText = `${num.toFixed(2)}m (Erlaubt: ${spec.minH.toFixed(2)}m - ${spec.maxH.toFixed(2)}m)`;
    }
}

// --- MAGIEKONZEPT DYNAMISCHE LOGIK (KAPITEL 7.2 & 8.1) ---
function toggleMagicSection() {
    const magicSelect = document.getElementById('charHasMagic');
    const magicContainer = document.getElementById('magicConceptContainer');
    const isMagic = magicSelect.value === 'Ja';

    if (magicContainer) {
        if (isMagic) {
            magicContainer.classList.remove('hidden');
        } else {
            magicContainer.classList.add('hidden');
        }
    }
}

function validateMagicHarmony() {
    const race = document.getElementById('charRace').value;
    const mag1 = document.getElementById('charMagic1').value;
    const mag2 = document.getElementById('charMagic2').value;
    const warningBox = document.getElementById('magic-harmony-warning');
    const isMagic = document.getElementById('charHasMagic').value === 'Ja';

    if (!isMagic) {
        if (warningBox) warningBox.classList.add('hidden');
        return true;
    }

    const spec = RACE_SPECS[race];
    let warnings = [];

    // Wandler / Lykaner / Vampir Limit (max 1 Magie)
    if (spec && spec.maxMagic === 1 && mag1 !== 'Keine Magie' && mag2 !== 'Keine Magie') {
        warnings.push(`⚠️ ${race} dürfen als gewandeltes Wesen maximal EINE zusätzliche Magieart wählen!`);
    }

    // Gegensätzliche Elemente
    const isWaterFire = (mag1 === 'Feuer' && mag2 === 'Wasser') || (mag1 === 'Wasser' && mag2 === 'Feuer');
    const isLightShadow = (mag1 === 'Licht' && mag2 === 'Schatten') || (mag1 === 'Schatten' && mag2 === 'Licht');

    if (isWaterFire) {
        warnings.push('⛔ Gegensätzliche Elemente verboten: Feuer und Wasser heben sich auf und dürfen nicht kombiniert werden!');
    }
    if (isLightShadow) {
        warnings.push('⛔ Gegensätzliche Elemente verboten: Licht und Schatten schließen sich logisch aus!');
    }

    // Dunkelelfen Licht-Verbot
    if (race === 'Dunkelelfen' && (mag1 === 'Licht' || mag2 === 'Licht')) {
        warnings.push('⛔ Dunkelelfen dürfen unter keinen Umständen Lichtmagie wirken oder beherrschen!');
    }

    if (warningBox) {
        if (warnings.length > 0) {
            warningBox.classList.remove('hidden');
            warningBox.innerHTML = warnings.join('<br>');
        } else {
            warningBox.classList.add('hidden');
        }
    }

    return warnings.length === 0;
}

// --- FIELD INFO MODAL ---
const fieldInfos = {
    name: { title: "Name der Seele", text: "Der Name oder Rufname deines Charakters in der Sphäre Anubia mitsamt Titeln, falls vorhanden." },
    geschlecht: { title: "Geschlecht", text: "Männlich, Weiblich oder Divers. Bestimmt die körperliche Grundform." },
    alter: { title: "Gezeichnete Jahre (Alter)", text: "Mindestens 18 Jahre! Wähle das Alter passend zu deinem Volk (Elfen können Jahrhunderte alt sein, Menschen altern normal)." },
    groesse: { title: "Körpergröße (ToT-Engine)", text: "Muss exakt im Rahmen deines Volkes liegen. ToT-Skalierungen außerhalb des Limits sind ungültig." },
    rasse: { title: "Blutlinie (Volk)", text: "Eines der 18 offiziellen Völker der Sphäre Anubia. Jedes Volk besitzt klare Stärken, Schwächen und Magieaffinitäten." },
    attachments: { title: "Benötigte Attachments & Shapeshifts", text: "Gib hier an, welche ToT-Attachments (Hörner, Flügel, Schweif, Ohren) oder Verwandlungsformen (Tiermodelle) dein Charakter zwingend benötigt." },
    hauptberuf: { title: "Säule 1: Monopolberuf", text: "Genau EIN Hauptberuf mit exklusiven Rezepten. Wechsel nur einmalig nach mindestens 4 Wochen intensiver Lernphase im RP!" },
    nebenberuf: { title: "Säule 2: Freier RP-Beruf", text: "Zur freien rollenspielerischen Vertiefung ohne feste Engine-Monopole." },
    heiler: { title: "Sonderrolle Heiler", text: "Da Heiler unverzichtbar für das 4-Phasen-Knockout-System sind, darf dieser Beruf IMMER zusätzlich erlernt und ausgeübt werden!" },
    staerken: { title: "Geist & Standhaftigkeit (Mind. 3 Stärken)", text: "Mindestens 3 charakterliche und physische Stärken, die dein Wesen im Labyrinth auszeichnen." },
    schwaechen: { title: "Sterblichkeit & Makel (Mind. 3 Schwächen)", text: "Mindestens 3 markante Schwächen, Ängste oder Gebrechen. Unbesiegbare Charaktere sind streng verboten!" },
    waffen: { title: "Waffenbeherrschung (Maximal 3)", text: "Maximal 3 Waffengattungen, die dein Charakter meisterhaft führt (z.B. Langschwert, Schild, Jagdbogen)." },
    vorgeschichte: { title: "Chronik & Motivation", text: "Woher stammt dein Charakter in Anubia (oder durch welchen arkanen Riss kam er)? Warum wagt er das tödliche Abenteuer im Labyrinth des verrückten Magiers?" },
    magiekonzept: { title: "Magiekonzept", text: "Erfordert genaue Ausarbeitung. Max. 2 Elemente, keine Gegensätze, und zwingend negative Begleiterscheinungen bei Erschöpfung!" },
    begleiter: { title: "Negative Begleiterscheinungen", text: "Magiewirken kostet Kraft! Beschreibe Kopfschmerzen, Schwindel, Mangelerscheinungen oder Bewusstlosigkeit bei Überanstrengung." },
    ziele: { title: "Vision & Ziele (Optional)", text: "Langfristige Wünsche, geplante Allianzen oder persönliche Prüfungen für das Rollenspiel." },
    steam: { title: "Aura-Signatur (Steam64)", text: "Die exakt 17-stellige numerische Steam64-ID zur Whitelist-Verifizierung." },
    discord: { title: "Rufname (Discord Tag)", text: "Dein exakter Discord-Nutzername, um dir Rollen und Tickets zuweisen zu können." },
    neueRasse: { title: "Vergessenes Blut", text: "Beschreibe Herkunft, Anatomie und Besonderheiten deines unberücksichtigten Volkes. Erfordert Teamgenehmigung." }
};

function openInfo(key) {
    const data = fieldInfos[key];
    if (!data) return;
    document.getElementById('info-modal-title').innerText = data.title;
    document.getElementById('info-modal-text').innerText = data.text;
    const modal = document.getElementById('field-info-modal');
    modal.classList.remove('hidden-modal', 'pointer-events-none');
    modal.classList.add('opacity-100', 'pointer-events-auto');
}

function closeInfoModal() {
    const modal = document.getElementById('field-info-modal');
    modal.classList.remove('opacity-100', 'pointer-events-auto');
    modal.classList.add('hidden-modal', 'pointer-events-none');
}

// --- UTILS: MOBILE MENÜ & IP-KOPIEREN ---
function toggleMobile() {
    const menu = document.getElementById('mobile-menu');
    if (menu.classList.contains('opacity-0')) { 
        menu.classList.remove('opacity-0', 'pointer-events-none'); 
        menu.classList.add('opacity-100', 'pointer-events-auto'); 
    } else { 
        menu.classList.add('opacity-0', 'pointer-events-none'); 
        menu.classList.remove('opacity-100', 'pointer-events-auto'); 
    }
}

function navigateFromMobile(targetId) {
    if (currentState !== STATE.IDLE || isTransitioning) return; 
    if (targetId === currentPageId) {
        toggleMobile();
        return;
    }
    switchPage(targetId);
    setTimeout(() => {
        const menu = document.getElementById('mobile-menu');
        if (menu && menu.classList.contains('opacity-100')) {
            menu.classList.add('opacity-0', 'pointer-events-none');
            menu.classList.remove('opacity-100', 'pointer-events-auto');
        }
    }, 350); 
}

async function copyServerName() {
    const serverName = 'ARKANUM – [GER] Conan Voice RP';
    const msg = document.getElementById('ip-msg'); 
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(serverName);
        } else {
            const el = document.createElement('textarea');
            el.value = serverName;
            el.style.position = 'absolute';
            el.style.left = '-9999px';
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
        }
        if (msg) { 
            msg.innerText = "In den Geist geschrieben! (ARKANUM – [GER] Conan Voice RP)";
            msg.className = "text-sm font-magic tracking-widest text-cyan-400 opacity-100 h-5 transition-opacity uppercase";
            setTimeout(() => msg.style.opacity = '0', 3000); 
        }
    } catch (err) {
        if (msg) { 
            msg.innerText = "Fehler beim Kopieren!";
            msg.className = "text-sm font-magic tracking-widest text-red-400 opacity-100 h-5 transition-opacity uppercase";
            setTimeout(() => msg.style.opacity = '0', 3000); 
        }
    }
}

function copyIP() {
    copyServerName();
}

function val(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
}

// --- CHARAKTERKONZEPT DISCORD EXPORT (KAPITEL 8.2) ---
async function copyCharacter() {
    const steamId = val('steamID');
    const discordTag = val('discordID');
    const charName = val('charName');
    const charAge = val('charAge');
    const charGender = val('charGender') || 'Unbestimmt';
    const charHeight = val('charHeight') || '1.75';
    let raceValue = val('charRace');
    const charAttachments = val('charAttachments') || 'Keine';
    const charMainProf = val('charMainProf') || 'Kein Hauptberuf';
    const charSubProf = val('charSubProf') || 'Kein Nebenberuf';
    const charHealer = val('charHealer') || 'Nein';
    const s1 = val('charStrength1');
    const s2 = val('charStrength2');
    const s3 = val('charStrength3');
    const w1 = val('charWeakness1');
    const w2 = val('charWeakness2');
    const w3 = val('charWeakness3');
    const weapon1 = val('charWeapon1') || 'Keine';
    const weapon2 = val('charWeapon2') || 'Keine';
    const weapon3 = val('charWeapon3') || 'Keine';
    const charStory = val('charStory');
    const isMagic = val('charHasMagic') === 'Ja';
    const magicKnown = val('charMagicKnown') || 'Nein';
    const magicLearn = val('charMagicLearn') || 'Nein';
    const magic1 = val('charMagic1') || 'Keine Magie';
    const magic2 = val('charMagic2') || 'Keine Magie';
    const magicExhaustion = val('charMagicExhaustion');
    const charGoals = val('charGoals') || 'Keine besonderen Vorstellungen angegeben';

    const msg = document.getElementById('copy-msg');

    // 1. Basis-Pflichtfeld-Prüfung
    if (!charName || !steamId) {
        showCopyMessage(">> Bitte fülle mindestens deinen Charakter-Namen und deine Steam-ID aus. <<", true);
        return;
    }

    // 2. Steam64-ID Prüfung (Exakt 17 Ziffern)
    if (!/^\d{17}$/.test(steamId)) {
        showCopyMessage(">> Die Steam64-ID muss exakt 17 Ziffern lang sein! <<", true);
        return;
    }

    // 3. Alter-Prüfung (Mindestens 18 Jahre)
    const ageNum = parseInt(charAge, 10);
    if (isNaN(ageNum) || ageNum < 18) {
        showCopyMessage(">> Das Mindestalter deines Charakters beträgt 18 Jahre (FSK 18)! <<", true);
        return;
    }

    // 4. Stärken & Schwächen (Mindestens 3)
    if (!s1 || !s2 || !s3) {
        showCopyMessage(">> Bitte trage mindestens 3 individuelle Stärken deines Charakters ein! <<", true);
        return;
    }
    if (!w1 || !w2 || !w3) {
        showCopyMessage(">> Bitte trage mindestens 3 Schwächen deines Charakters ein (Kein Gott-RP)! <<", true);
        return;
    }

    // 5. Magie-Harmonie-Prüfung
    if (isMagic) {
        if (!validateMagicHarmony()) {
            showCopyMessage(">> Dein Magiekonzept verstößt gegen die Element-Harmonie oder Völkerregeln! <<", true);
            return;
        }
        if (!magicExhaustion) {
            showCopyMessage(">> Bitte beschreibe die negativen Begleiterscheinungen beim Wirken von Magie! <<", true);
            return;
        }
    }

    if (raceValue === 'Neue Rasse') {
        raceValue = `Unbekanntes Blut (${val('charCustomRaceDesc')})`;
    }

    // EXAKTER MARKDOWN-TABELLENEXPORT AUS KAPITEL 8.2
    const outputMarkdown = `# [image]
# Charakterkonzept
Allgemeine Informationen
| | |
| :- | :- |
| Name | ${charName} |
| Geschlecht | ${charGender} |
| Alter | ${charAge} Jahre |
| Größe | ${parseFloat(charHeight).toFixed(2)}m |
| Rasse/Volk | ${raceValue} |
| Magisch begabt? (Wenn ja, Magiekonzept ausfüllen) | ${isMagic ? 'Ja' : 'Nein'} |

Aussehen
| | |
| :- | :- |
| Besondere Merkmale | ${val('charFeatures') || 'Keine Besonderheiten'} |
| Benötigte Attachments, Shapeshift etc. | ${charAttachments} |

Handwerk
| | |
| :- | :- |
| Hauptberuf (Engine Beruf) | ${charMainProf} |
| Nebenberuf (RP Beruf) | ${charSubProf} |
| Heilkunde (Zusatzausbildung) | ${charHealer} |

Stärken deines Charakters (Mindestens 3)
| |
| :- |
| 1. ${s1} |
| 2. ${s2} |
| 3. ${s3} |

Schwächen deines Charakters (Mindestens 3)
| |
| :- |
| 1. ${w1} |
| 2. ${w2} |
| 3. ${w3} |

Welche Waffen beherrscht dein Charakter (Maximal 3)
| | | |
| :- | :- | :- |
| ${weapon1} | ${weapon2} | ${weapon3} |

Kleine Vorgeschichte + warum dein Charakter dieses Abenteuer auf sich nimmt
| | |
| :- | :- |
| ${charStory || 'Keine Vorgeschichte hinterlegt.'} | |

Magiekonzept
Allgemeine Informationen
| | |
| :- | :- |
| Beherrscht Magie bereits? | ${isMagic ? magicKnown : 'Nein'} |
| Muss Magie erst lernen? | ${isMagic ? magicLearn : 'Nein'} |

Magiearten
| | |
| :- | :- |
| Magieart 1 (Primär) | ${isMagic ? magic1 : 'Keine Magie'} |
| Magieart 2 (Sekundär) | ${isMagic ? magic2 : 'Keine Magie'} |

Negative Begleiterscheinungen wenn viel und/oder sehr starke Magie gewirkt wird
| |
| :- |
| ${isMagic ? magicExhaustion : 'Keine Magie'} |

Besondere Vorstellungen/Ideen/Ziele für den Char *Optional*
| |
| :- |
| ${charGoals} |

--- IDENTIFIKATION & STEAM ---
Steam64-ID: ${steamId}
Discord-Tag: ${discordTag || 'Nicht angegeben'}
# [image]`;

    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(outputMarkdown);
        } else {
            const el = document.createElement('textarea');
            el.value = outputMarkdown;
            el.style.position = 'absolute';
            el.style.left = '-9999px';
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
        }
        showCopyMessage(">> Inschrift erfolgreich in den Geist kopiert! Reiche dein Ticket im Support ein. <<", false);
    } catch (err) {
        showCopyMessage(">> Kopieren fehlgeschlagen. Bitte markiere den Text manuell. <<", true);
        console.error("Clipboard Error:", err);
    }
}

function showCopyMessage(text, isError) {
    const msg = document.getElementById('copy-msg');
    if (!msg) return;
    msg.innerText = text;
    msg.className = isError 
        ? "text-center text-red-400 font-magic tracking-widest text-base sm:text-lg mt-6 opacity-100 transition-opacity"
        : "text-center text-cyan-400 font-magic tracking-widest text-base sm:text-lg mt-6 opacity-100 transition-opacity drop-shadow-[0_0_8px_#00e5ff]";
    setTimeout(() => {
        msg.style.opacity = '0';
    }, 5500);
}

// --- AUTO-SAVE FÜR DIE SEELEN-INSCHRIFT (LOCALSTORAGE) ---
const charFormFields = [
    'steamID', 'discordID', 'charName', 'charGender', 'charAge', 'charHeight',
    'charRace', 'charFeatures', 'charAttachments', 'charCustomRaceDesc',
    'charMainProf', 'charSubProf', 'charHealer',
    'charStrength1', 'charStrength2', 'charStrength3',
    'charWeakness1', 'charWeakness2', 'charWeakness3',
    'charWeapon1', 'charWeapon2', 'charWeapon3',
    'charStory', 'charHasMagic', 'charMagicKnown', 'charMagicLearn',
    'charMagic1', 'charMagic2', 'charMagicExhaustion', 'charGoals'
];

function saveCharacterDraft() {
    const draftData = {};
    charFormFields.forEach(id => {
        const el = document.getElementById(id);
        if (el) draftData[id] = el.value;
    });
    localStorage.setItem('arkanum_char_draft', JSON.stringify(draftData));
}

function loadCharacterDraft() {
    const savedDraft = localStorage.getItem('arkanum_char_draft');
    if (savedDraft) {
        try {
            const draftData = JSON.parse(savedDraft);
            charFormFields.forEach(id => {
                const el = document.getElementById(id);
                if (el && draftData[id] !== undefined) {
                    el.value = draftData[id];
                }
            });
            onRaceChange();
            toggleMagicSection();
            validateMagicHarmony();
        } catch (e) {
            console.error("Die arkanen Schriftrollen konnten nicht entziffert werden:", e);
        }
    }
    
    charFormFields.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', () => {
                saveCharacterDraft();
                if (id === 'charMagic1' || id === 'charMagic2' || id === 'charRace') validateMagicHarmony();
            });
            el.addEventListener('change', () => {
                saveCharacterDraft();
                if (id === 'charRace') onRaceChange();
                if (id === 'charHasMagic') toggleMagicSection();
                validateMagicHarmony();
            });
        }
    });
}

function clearCharacterDraft() {
    if (!confirm("Bist du sicher, dass du deinen gesamten Entwurf in das Void werfen möchtest? Dies kann nicht rückgängig gemacht werden.")) {
        return;
    }
    localStorage.removeItem('arkanum_char_draft');
    charFormFields.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (el.tagName === 'SELECT') el.selectedIndex = 0;
            else el.value = '';
        }
    });
    onRaceChange();
    toggleMagicSection();
    showCopyMessage(">> Die Inschrift wurde vom arkanen Nebel verweht. <<", true);
}

// --- GALERIE RENDERER (GEWÖLBE) ---
function renderGallery() {
    const grid = document.getElementById('gallery-grid');
    if (!grid) return;
    grid.innerHTML = ''; 

    if (galleryConfig.files.length === 0) {
        grid.className = "flex flex-col items-center justify-center min-h-[380px] w-full col-span-3 text-center p-12 border border-dashed border-cyan-900 bg-black/60";
        grid.innerHTML = `
            <div class="relative mb-6">
                <i data-lucide="hourglass" class="w-16 h-16 text-cyan-800 absolute top-0 left-0 blur-sm animate-pulse"></i>
                <i data-lucide="hourglass" class="w-16 h-16 text-cyan-400 relative z-10 opacity-80"></i>
            </div>
            <h3 class="font-magic text-3xl text-cyan-300 mb-3 tracking-[0.2em] uppercase text-glow-mana">Das Gewölbe formt sich neu</h3>
            <p class="font-lore text-slate-400 text-xl italic">Der Magier ordnet die Dimensionen des Labyrinths...</p>
        `;
        if (typeof lucide !== 'undefined') { lucide.createIcons(); }
        return;
    }

    grid.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6";

    galleryConfig.files.forEach((filename, index) => {
        const card = document.createElement('div');
        card.className = 'holo-card rounded-sm cursor-pointer group shadow-lg'; 
        card.style.animationDelay = `${index * 0.08}s`; 
        const title = filename.split('.')[0].replace(/[-_]/g, ' '); 
        const imgSrc = galleryConfig.folder ? `${galleryConfig.folder}${filename}` : filename;

        card.onclick = () => openImageModal(imgSrc, title);

        card.innerHTML = `
            <div class="relative w-full h-[220px] overflow-hidden bg-black/70">
                <img src="${imgSrc}" alt="${title}" loading="lazy" class="holo-img" onerror="this.onerror=null; this.src='https://placehold.co/600x400/030712/38bdf8?text=Labyrinth+Kammer';">
                <div class="absolute inset-0 bg-cyan-500/0 group-hover:bg-cyan-500/20 transition-colors duration-400 flex items-center justify-center z-20">
                    <i data-lucide="zoom-in" class="text-white w-10 h-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-[0_0_12px_rgba(0,229,255,0.9)]"></i>
                </div>
            </div>
            <div class="p-3 bg-black/80 border-t border-cyan-900/40 flex justify-between items-center">
                <span class="font-magic text-xs text-slate-300 tracking-widest uppercase">Gewölbe Kammer #${index + 1}</span>
                <i data-lucide="sparkles" class="w-3.5 h-3.5 text-cyan-400 opacity-60"></i>
            </div>
        `;
        grid.appendChild(card);
    });
    
    if (typeof lucide !== 'undefined') { lucide.createIcons(); }
}

function openImageModal(src, title) {
    const modal = document.getElementById('image-modal');
    const img = document.getElementById('modal-img');
    if (img) img.src = src;
    if (modal) {
        modal.classList.remove('hidden-modal', 'pointer-events-none');
        modal.classList.add('opacity-100', 'pointer-events-auto');
    }
}

function closeImageModal() {
    const modal = document.getElementById('image-modal');
    if (modal) {
        modal.classList.remove('opacity-100', 'pointer-events-auto');
        modal.classList.add('hidden-modal', 'pointer-events-none');
        setTimeout(() => { 
            const img = document.getElementById('modal-img');
            if (img) img.src = ''; 
        }, 300);
    }
}

// --- COOKIE BANNER ---
const cookieBanner = document.getElementById('rift-cookie-banner');
setTimeout(() => {
    if (!localStorage.getItem('arkanumProtocolAccepted')) {
        if (cookieBanner) {
            cookieBanner.classList.remove('hidden');
            requestAnimationFrame(() => { cookieBanner.classList.remove('translate-y-[150%]'); });
        }
    }
}, 1200);

function acceptCookies() {
    localStorage.setItem('arkanumProtocolAccepted', 'true');
    if (cookieBanner) {
        cookieBanner.classList.add('translate-y-[150%]');
        setTimeout(() => { cookieBanner.classList.add('hidden'); }, 600);
    }
}

// --- INITIALISIERUNG ---
document.addEventListener('DOMContentLoaded', () => { 
    initRouting(); 
    initCursorArchetype();
    updateGhostScoreUI();
    renderGallery(); 
    renderRaceCatalog();
    loadCharacterDraft(); 
    requestAnimationFrame(updateLoop); 
    if (typeof lucide !== 'undefined') { lucide.createIcons(); }
});
