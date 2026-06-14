// The Void Killer - Parasite Bestiary Database and Gallery View

import { playerState, savePlayerState, updateBestiaryCount } from './gamification.js';

export const PARASITES = [
  {
    id: "plasmodium_falciparum",
    name: "Plasmodium falciparum",
    rarity: "rare",
    transmission: "Bite of female Anopheles mosquito",
    fact: "Causes malignant tertian malaria. Sequesters in capillaries by presenting PfEMP1 proteins on RBC knobs, causing cerebral malaria and organ failure.",
    stats: { host: 4, transmission: 4, lethality: 5 },
    svg: `<svg viewBox="0 0 120 120" width="100%" height="100%" stroke="#8b1a1a" fill="none" stroke-width="2">
      <circle cx="60" cy="60" r="45" stroke="#a39580" stroke-width="3" stroke-dasharray="2 2" />
      <path d="M60,20 C85,20 100,35 100,60 C100,85 85,100 60,100 C35,100 20,85 20,60 C20,35 35,20 60,20 Z" stroke="#8c2317" stroke-width="2" />
      <circle cx="48" cy="48" r="8" stroke="#c9a84c" />
      <circle cx="53" cy="45" r="2" fill="#8b1a1a" />
      <path d="M72,35 C88,48 88,72 72,85 C78,75 78,45 72,35 Z" fill="#c9a84c" stroke="#8b1a1a" />
      <circle cx="76" cy="60" r="3" fill="#8b1a1a" />
    </svg>`
  },
  {
    id: "toxoplasma_gondii",
    name: "Toxoplasma gondii",
    rarity: "common",
    transmission: "Ingestion of oocysts from cat feces or bradyzoites in undercooked meat",
    fact: "An obligate intracellular parasite that manipulates rodent behavior to lose fear of cats, its definitive host. Causes life-threatening encephalitis in AIDS patients.",
    stats: { host: 5, transmission: 4, lethality: 2 },
    svg: `<svg viewBox="0 0 120 120" width="100%" height="100%" stroke="#8f6f21" fill="none" stroke-width="2">
      <circle cx="60" cy="60" r="48" stroke="#a39580" stroke-width="1.5" />
      <g transform="translate(40, 40)">
        <path d="M0,5 C10,-10 25,-10 30,10 C20,15 10,15 0,5 Z" fill="rgba(201,168,76,0.1)" stroke="#c9a84c" />
        <circle cx="22" cy="4" r="2" fill="#8b1a1a" />
      </g>
      <g transform="translate(50, 65) rotate(120)">
        <path d="M0,5 C10,-10 25,-10 30,10 C20,15 10,15 0,5 Z" fill="rgba(201,168,76,0.1)" stroke="#c9a84c" />
        <circle cx="22" cy="4" r="2" fill="#8b1a1a" />
      </g>
    </svg>`
  },
  {
    id: "taenia_solium",
    name: "Taenia solium",
    rarity: "rare",
    transmission: "Ingestion of oncospheres in undercooked pork (tapeworm) or fecal-oral egg ingestion (cysticercosis)",
    fact: "Eggs hatch in the gut, cross the mucosa, and migrate to muscles and brain. Renders fluid-filled cysticerci, triggering epilepsy and hydrocephalus (neurocysticercosis).",
    stats: { host: 3, transmission: 3, lethality: 4 },
    svg: `<svg viewBox="0 0 120 120" width="100%" height="100%" stroke="#8b1a1a" fill="none" stroke-width="2">
      <path d="M60,20 C40,20 40,45 45,70 L52,110 L68,110 L75,70 C80,45 80,20 60,20 Z" stroke="#c9a84c" stroke-width="2" />
      <circle cx="60" cy="22" r="5" stroke="#8b1a1a" />
      <path d="M56,22 L52,18 M64,22 L68,18 M60,17 L60,11 M58,19 L55,14 M62,19 L65,14" stroke="#8b1a1a" stroke-width="1.5" />
      <circle cx="49" cy="42" r="6" stroke="#c9a84c" />
      <circle cx="71" cy="42" r="6" stroke="#c9a84c" />
      <circle cx="60" cy="55" r="7" stroke="#c9a84c" />
      <line x1="50" y1="90" x2="70" y2="90" stroke="#705b29" />
      <line x1="51" y1="100" x2="69" y2="100" stroke="#705b29" />
    </svg>`
  },
  {
    id: "trypanosoma_brucei",
    name: "Trypanosoma brucei",
    rarity: "legendary",
    transmission: "Bite of infected tsetse fly (Glossina genus)",
    fact: "Evades the host immune system through constant Variant Surface Glycoprotein (VSG) gene switching. Crosses the blood-brain barrier to cause Human African Trypanosomiasis (sleeping sickness).",
    stats: { host: 3, transmission: 3, lethality: 5 },
    svg: `<svg viewBox="0 0 120 120" width="100%" height="100%" stroke="#8b1a1a" fill="none" stroke-width="2">
      <path d="M15,100 C30,95 45,85 55,70 C65,55 70,30 90,20 C100,15 110,12 112,8" stroke="#c9a84c" stroke-width="3" stroke-linecap="round" />
      <path d="M15,100 C20,90 28,95 35,85 C42,75 48,82 55,70 C62,58 65,62 72,48 C79,34 82,38 90,20" stroke="#8b1a1a" stroke-width="1.5" />
      <circle cx="28" cy="91" r="3" fill="#8b1a1a" />
      <ellipse cx="60" cy="58" rx="5" ry="8" fill="#c9a84c" stroke="#8b1a1a" />
    </svg>`
  },
  {
    id: "leishmania_donovani",
    name: "Leishmania donovani",
    rarity: "legendary",
    transmission: "Bite of infected female phlebotomine sandfly",
    fact: "Causes Visceral Leishmaniasis (Kala-Azar), multiplying inside splenic and hepatic macrophages. Almost 100% fatal within 2 years if untreated.",
    stats: { host: 4, transmission: 3, lethality: 5 },
    svg: `<svg viewBox="0 0 120 120" width="100%" height="100%" stroke="#c9a84c" fill="none" stroke-width="2">
      <path d="M60,10 C90,8 110,30 110,60 C110,90 90,110 60,110 C30,110 10,90 10,60 C10,30 30,12 60,10 Z" stroke="#a39580" stroke-width="1.5" stroke-dasharray="4 4" />
      <path d="M75,40 C95,45 90,75 75,80 C60,85 62,60 70,50 Z" fill="#8b1a1a" opacity="0.3" stroke="#8b1a1a" />
      <g transform="translate(25, 30)">
        <ellipse cx="5" cy="5" rx="4" ry="6" stroke="#c9a84c" transform="rotate(30)" />
        <circle cx="4" cy="4" r="1.5" fill="#8b1a1a" />
        <line x1="5" y1="5" x2="5" y2="10" stroke="#8b1a1a" />
      </g>
      <g transform="translate(35, 75)">
        <ellipse cx="5" cy="5" rx="4" ry="6" stroke="#c9a84c" transform="rotate(-45)" />
        <circle cx="4" cy="4" r="1.5" fill="#8b1a1a" />
        <line x1="5" y1="5" x2="3" y2="10" stroke="#8b1a1a" />
      </g>
      <g transform="translate(50, 20)">
        <ellipse cx="5" cy="5" rx="4" ry="6" stroke="#c9a84c" transform="rotate(80)" />
        <circle cx="5" cy="5" r="1.5" fill="#8b1a1a" />
      </g>
    </svg>`
  },
  {
    id: "schistosoma_mansoni",
    name: "Schistosoma mansoni",
    rarity: "rare",
    transmission: "Cercariae skin penetration in fresh water containing Biomphalaria snails",
    fact: "Adult worms live in pairs inside mesenteric venules. Female rests in male's gynecophoral canal. Spined eggs cause granulating tissue responses in liver and bowel.",
    stats: { host: 4, transmission: 4, lethality: 3 },
    svg: `<svg viewBox="0 0 120 120" width="100%" height="100%" stroke="#8b1a1a" fill="none" stroke-width="2">
      <path d="M25,80 C20,60 30,30 55,25 C75,22 95,40 95,65 C95,90 75,98 50,92 C40,90 35,80 32,70" stroke="#c9a84c" stroke-width="5" stroke-linecap="round" />
      <path d="M31,71 C30,62 36,37 53,32 C68,30 87,42 87,63 C87,83 71,90 51,84" stroke="#8b1a1a" stroke-width="1.5" stroke-linecap="round" />
      <circle cx="25" cy="80" r="3" fill="#c9a84c" />
    </svg>`
  },
  {
    id: "strongyloides_stercoralis",
    name: "Strongyloides stercoralis",
    rarity: "common",
    transmission: "Filariform larvae penetrate intact human skin from soil",
    fact: "Capable of autoinfection, where rhabditiform larvae mature in the gut and re-penetrate intestinal mucosa. Can lead to hyperinfection syndrome in immunocompromised hosts.",
    stats: { host: 2, transmission: 3, lethality: 4 },
    svg: `<svg viewBox="0 0 120 120" width="100%" height="100%" stroke="#c9a84c" fill="none" stroke-width="2">
      <path d="M15,20 C35,20 20,55 55,55 C90,55 75,90 105,90" stroke="#c9a84c" stroke-width="2.5" stroke-linecap="round" />
      <path d="M17,20 L30,20" stroke="#8b1a1a" stroke-width="1" />
      <circle cx="33" cy="20" r="2" fill="#8b1a1a" />
      <path d="M98,90 L105,90" stroke="#705b29" stroke-width="1" />
    </svg>`
  },
  {
    id: "echinococcus_granulosus",
    name: "Echinococcus granulosus",
    rarity: "rare",
    transmission: "Ingestion of tapeworm eggs from dog feces",
    fact: "Produces unilocular hydatid cysts filled with highly immunogenic fluid. Cyst rupture triggers fatal anaphylactic shock. Requires surgical excision under cover of scolicides.",
    stats: { host: 4, transmission: 2, lethality: 4 },
    svg: `<svg viewBox="0 0 120 120" width="100%" height="100%" stroke="#8b1a1a" fill="none" stroke-width="2">
      <circle cx="60" cy="60" r="45" stroke="#c9a84c" stroke-width="2" />
      <circle cx="60" cy="60" r="41" stroke="#a39580" stroke-width="1" stroke-dasharray="3 3" />
      <g transform="translate(45, 45)">
        <circle cx="0" cy="0" r="10" stroke="#8b1a1a" />
        <circle cx="-3" cy="-3" r="1" fill="#8b1a1a" />
        <circle cx="3" cy="-2" r="1.5" fill="#8b1a1a" />
        <circle cx="0" cy="3" r="1" fill="#8b1a1a" />
      </g>
      <g transform="translate(75, 70)">
        <circle cx="0" cy="0" r="8" stroke="#8b1a1a" />
        <circle cx="-2" cy="1" r="1.2" fill="#8b1a1a" />
        <circle cx="2" cy="-2" r="1" fill="#8b1a1a" />
      </g>
    </svg>`
  },
  {
    id: "entamoeba_histolytica",
    name: "Entamoeba histolytica",
    rarity: "common",
    transmission: "Ingestion of mature cysts from contaminated food or water",
    fact: "Causes amebic dysentery and liver abscesses. Secretes pore-forming peptides to lyse host tissue. Trophozoite cells contain ingested RBCs in cytosome.",
    stats: { host: 3, transmission: 4, lethality: 3 },
    svg: `<svg viewBox="0 0 120 120" width="100%" height="100%" stroke="#8f6f21" fill="none" stroke-width="2">
      <path d="M40,20 C55,10 75,25 90,20 C105,25 110,45 100,65 C108,85 85,108 65,95 C45,105 20,95 25,70 C10,50 20,30 40,20 Z" stroke="#c9a84c" stroke-width="2" />
      <circle cx="65" cy="50" r="10" stroke="#8b1a1a" />
      <circle cx="65" cy="50" r="2" fill="#8b1a1a" />
      <circle cx="58" cy="46" r="1" fill="#8b1a1a" />
      <circle cx="72" cy="46" r="1" fill="#8b1a1a" />
      <circle cx="61" cy="56" r="1" fill="#8b1a1a" />
      <circle cx="69" cy="56" r="1" fill="#8b1a1a" />
      <circle cx="42" cy="40" r="5" fill="rgba(139,26,26,0.3)" stroke="#8b1a1a" />
      <circle cx="48" cy="72" r="4" fill="rgba(139,26,26,0.3)" stroke="#8b1a1a" />
      <circle cx="82" cy="75" r="5" fill="rgba(139,26,26,0.3)" stroke="#8b1a1a" />
    </svg>`
  },
  {
    id: "giardia_lamblia",
    name: "Giardia lamblia",
    rarity: "common",
    transmission: "Ingestion of fecal-contaminated cysts in mountain streams or water supplies",
    fact: "Adheres to duodenal brush border using a microtubular ventral sucking disk. Induces malabsorption and steatorrhea without tissue invasion. Styled with a classic 'smiley face' layout.",
    stats: { host: 3, transmission: 4, lethality: 1 },
    svg: `<svg viewBox="0 0 120 120" width="100%" height="100%" stroke="#c9a84c" fill="none" stroke-width="2">
      <path d="M60,15 C35,15 35,65 52,95 L60,112 L68,95 C85,65 85,15 60,15 Z" stroke="#c9a84c" stroke-width="2.5" />
      <path d="M45,45 C45,30 75,30 75,45 C75,55 45,55 45,45 Z" stroke="#a39580" stroke-width="1.5" />
      <circle cx="52" cy="40" r="5" stroke="#8b1a1a" />
      <circle cx="52" cy="40" r="2.5" fill="#8b1a1a" />
      <circle cx="68" cy="40" r="5" stroke="#8b1a1a" />
      <circle cx="68" cy="40" r="2.5" fill="#8b1a1a" />
      <path d="M60,112 C62,118 65,120 70,120 M60,112 C58,118 55,120 50,120" stroke="#705b29" />
      <path d="M48,80 C38,88 28,90 20,88 M72,80 C82,88 92,90 100,88" stroke="#705b29" />
      <path d="M44,52 C30,55 22,58 18,52 M76,52 C90,55 98,58 102,52" stroke="#705b29" />
    </svg>`
  }
];

// Expanded 30 PhD-Level clinical vignettes (3 per parasite)
const BASE_QUESTIONS = [
  // 1. Plasmodium falciparum
  {
    case: "Ein 24-jähriger Tourist kehrt von einer Safari in Kenia zurück. Er klagt über zyklisches Fieber alle 48 Stunden, Verwirrung und Anämie. Im Blutausstrich zeigen sich multiple zarte Ringformen in nicht vergrößerten Erythrozyten sowie sichelförmige Gametozyten.",
    options: ["Plasmodium falciparum", "Plasmodium vivax", "Babesia microti", "Leishmania donovani"],
    correct: 0,
    explanation: "Die Kombination aus feinen Ringen, multipler Infektion pro Zelle und bananenförmigen (sichelförmigen) Gametozyten ist pathognomonisch für Plasmodium falciparum, den Erreger der Malaria tropica.",
    parasite: "Plasmodium falciparum",
    rarity: "rare"
  },
  {
    case: "Ein Patient mit rezidivierenden Fieberschüben nach Westafrika-Aufenthalt entwickelt dunklen Urin (Hämoglobinurie) und akutes Nierenversagen (Schwarzwasserfieber). Im Labor zeigt sich eine massive intravasale Hämolyse.",
    options: ["Plasmodium falciparum", "Schistosoma haematobium", "Leptospira interrogans", "Trypanosoma brucei"],
    correct: 0,
    explanation: "Schwarzwasserfieber ist eine gefürchtete Komplikation der Malaria tropica (P. falciparum), bei der es zu einer akuten intravasalen Hämolyse mit konsekutiver Hämoglobinurie kommt.",
    parasite: "Plasmodium falciparum",
    rarity: "rare"
  },
  {
    case: "Eine schwangere Patientin in Nigeria stellt sich mit schwerer Anämie vor. Die Plazenta-Histologie zeigt eine Sequestrierung von Erythrozyten in den intervillösen Räumen, die mit Knöpfen auf ihrer Oberfläche an Plazenta-Rezeptoren binden.",
    options: ["Plasmodium falciparum", "Toxoplasma gondii", "Listeria monocytogenes", "Cytomegalievirus"],
    correct: 0,
    explanation: "Plasmodium falciparum verklebt über PfEMP1-Proteine an den Erythrozyten-Knobs (capillary sequestration) in der Plazenta, was zu plazentarer Malaria führt.",
    parasite: "Plasmodium falciparum",
    rarity: "rare"
  },
  
  // 2. Toxoplasma gondii
  {
    case: "Ein HIV-Patient mit einer CD4-Zellzahl von 40/uL stellt sich mit Verwirrtheit, Hemiparese und Krampfanfällen vor. Das MRT des Gehirns zeigt multiple ringangereicherte Läsionen in den Basalganglien.",
    options: ["Toxoplasma gondii", "Cryptococcus neoformans", "JC-Virus", "Aspergillus fumigatus"],
    correct: 0,
    explanation: "Toxoplasma gondii reaktiviert bei schwerer Immunschwäche und verursacht nekrotisierende Enzephalitis, die radiologisch typischerweise als ringangereicherte Herde imponiert.",
    parasite: "Toxoplasma gondii",
    rarity: "common"
  },
  {
    case: "Ein Neugeborenes zeigt bei der Geburt die klassische Trias aus Hydrozephalus, intrakraniellen Verkalkungen und Chorioretinitis. Die Mutter hatte während der Schwangerschaft rohes Hackfleisch verzehrt.",
    options: ["Toxoplasma gondii", "Zytomegalievirus", "Rötelnvirus", "Treponema pallidum"],
    correct: 0,
    explanation: "Dies ist die klassische Sabin-Trias der konnatalen Toxoplasmose, übertragen durch Erstinfektion der Mutter via oozystenhaltigen Katzenkot oder bradyzoitenhaltiges rohes Fleisch.",
    parasite: "Toxoplasma gondii",
    rarity: "common"
  },
  {
    case: "Eine junge Tiermedizinstudentin entwickelt nach dem Reinigen von Katzengehegen Fieber und schmerzlose Lymphknotenschwellungen nuchal. Ein Blutbild zeigt atypische Lymphozyten. Serologisch steigt der IgG-Titer an.",
    options: ["Toxoplasma gondii", "Epstein-Barr-Virus", "Bartonella henselae", "Cytomegalievirus"],
    correct: 0,
    explanation: "Die akute Toxoplasmose beim Immunkompetenten verläuft meist asymptomatisch oder als mildes lymphomononukleotisches Syndrom (Piringer-Kuchinka-Lymphadenitis) mit Bevorzugung nuchaler Lymphknoten.",
    parasite: "Toxoplasma gondii",
    rarity: "common"
  },

  // 3. Taenia solium
  {
    case: "Ein 35-jähriger Einwanderer aus Ecuador stellt sich mit neu aufgetretenen epileptischen Anfällen vor. Ein CT zeigt mehrere zystische Läsionen im Cortex, in denen jeweils ein kleiner verkalkter Knoten (der Skolex) sichtbar ist.",
    options: ["Taenia solium (Neurozystizerkose)", "Echinococcus granulosus", "Toxocara canis", "Paragonimus westermani"],
    correct: 0,
    explanation: "Durch orale Aufnahme von Eiern der Taenia solium (fäkal-oral) entwickeln Menschen Zystizerkose. Setzen sich die Larven im ZNS ab, entsteht die Neurozystizerkose, Hauptursache für Epilepsie in Endemiegebieten.",
    parasite: "Taenia solium",
    rarity: "rare"
  },
  {
    case: "Nach dem Verzehr von unzureichend gegartem Schweinefleisch scheidet ein Patient bandförmige Segmente (Proglottiden) mit dem Stuhl aus. Er klagt über leichten Hunger und Bauchschmerzen. Der Skolex besitzt vier Saugnäpfe und Haken.",
    options: ["Taenia solium (Bandwurm)", "Taenia saginata", "Diphyllobothrium latum", "Hymenolepis nana"],
    correct: 0,
    explanation: "Der Verzehr von zystizerkenhaltigem Schweinefleisch führt zur intestinalen Taeniasis solium (Bandwurminfektion). T. solium besitzt im Gegensatz zu T. saginata einen bewaffneten Skolex (mit Haken).",
    parasite: "Taenia solium",
    rarity: "rare"
  },
  {
    case: "Ein Patient klagt über derbe, schmerzlose Knoten unter der Haut an Armen und Oberschenkeln. Eine Biopsie zeigt Zysten, in denen ein invaginierter Skolex mit doppelter Hakenkrone schwimmt.",
    options: ["Taenia solium (Zystizerkose)", "Onchocerca volvulus", "Dracunculus medinensis", "Trichinella spiralis"],
    correct: 0,
    explanation: "Subkutane Zystizerkose entsteht durch Ansiedlung von Taenia solium-Larven im Bindegewebe nach Eiaufnahme, diagnostiziert durch histologischen Nachweis von Hakenkrone und Skolex.",
    parasite: "Taenia solium",
    rarity: "rare"
  },

  // 4. Trypanosoma brucei
  {
    case: "Ein Biologe klagt nach einem Tsetsefliegen-Stich in Tansania über ein schmerzhaftes Ulkus (Schanker) an der Einstichstelle, gefolgt von Fieber und einer Schwellung der hinteren Halslymphknoten (Winterbottom-Zeichen).",
    options: ["Trypanosoma brucei", "Trypanosoma cruzi", "Leishmania donovani", "Wuchereria bancrofti"],
    correct: 0,
    explanation: "Die afrikanische Schlafkrankheit (T. brucei) beginnt mit einem Trypanosomen-Schanker und führt in der hämolyphatischen Phase zur typischen Lymphadenitis am Hals (Winterbottom-Zeichen).",
    parasite: "Trypanosoma brucei",
    rarity: "legendary"
  },
  {
    case: "Ein Patient in Angola leidet unter extremer Tagesmüdigkeit, nächtlicher Schlaflosigkeit, Apathie und neurologischen Tremoren. Im Liquor finden sich erhöhte Proteine und einzellige extrazelluläre Flagellaten.",
    options: ["Trypanosoma brucei", "Toxoplasma gondii", "Naegleria fowleri", "Cryptococcus neoformans"],
    correct: 0,
    explanation: "In Phase II (meningoenzephalitische Phase) überwindet Trypanosoma brucei die Blut-Hirn-Schranke und stört den zirkadianen Rhythmus massiv, was der Krankheit ihren Namen gibt.",
    parasite: "Trypanosoma brucei",
    rarity: "legendary"
  },
  {
    case: "Im Labor isolieren Sie Blutparasiten, die ständige Antigenvariationen vollziehen, indem sie ihre Glykoproteinschicht (VSG) wechseln, was zu periodischen Fieberschüben führt.",
    options: ["Trypanosoma brucei", "Plasmodium falciparum", "Borrelia recurrentis", "Leishmania donovani"],
    correct: 0,
    explanation: "Trypanosoma brucei besitzt über 1000 Gene für Variable Surface Glycoproteins (VSG). Durch ständigen Wechsel entkommt der Parasit der humoralen Immunantwort.",
    parasite: "Trypanosoma brucei",
    rarity: "legendary"
  },

  // 5. Leishmania donovani
  {
    case: "Ein Patient aus Indien leidet unter chronischem Fieber, drastischem Gewichtsverlust, einer tiefen Dunkelfärbung der Haut (Kala-Azar) und massiver Splenomegaly. Ein Milzaspirat zeigt intrazelluläre amastigote Stadien in Makrophagen.",
    options: ["Leishmania donovani", "Trypanosoma brucei", "Histoplasma capsulatum", "Schistosoma mansoni"],
    correct: 0,
    explanation: "Leishmania donovani verursacht die viszeral Leishmaniose (Kala-Azar, 'schwarzer Tod'). Amastigote Erreger (Leishman-Donovan-Körperchen) vermehren sich im mononukleär-phagozytären System.",
    parasite: "Leishmania donovani",
    rarity: "legendary"
  },
  {
    case: "Ein Jahr nach erfolgreicher Behandlung einer viszeralen Leishmaniose entwickelt ein Patient multiple knötchenartige Hautveränderungen im Gesicht, die histologisch zahlreiche amastigote Stadien ohne viszeralen Befall enthalten.",
    options: ["Post-Kala-Azar-Dermal-Leishmaniose (PKDL)", "Lepra lepromatosa", "Sarkoidose", "Kutane Tuberkulose"],
    correct: 0,
    explanation: "Die Post-Kala-Azar-Dermal-Leishmaniose (PKDL) ist eine dermatologische Spätfolge von L. donovani, vor allem in Ostafrika und Indien, reich an infektiösen Parasiten.",
    parasite: "Leishmania donovani",
    rarity: "legendary"
  },
  {
    case: "Ein HIV-Patient klagt über Panzytopenie, Fieber und Durchfall. Die Duodenalbiopsie zeigt ovale, 2-4 Mikrometer große Strukturen mit einem stäbchenförmigen Kinetoplasten in der Lamina propria.",
    options: ["Leishmania donovani", "Toxoplasma gondii", "Cryptosporidium parvum", "Histoplasma capsulatum"],
    correct: 0,
    explanation: "Bei opportunistischen Leishmania donovani-Infektionen können atypische viszerale Verläufe mit Befall des gesamten GI-Trakts auftreten, nachgewiesen durch Kinetoplasten-Darstellung.",
    parasite: "Leishmania donovani",
    rarity: "legendary"
  },

  // 6. Schistosoma mansoni
  {
    case: "Ein Patient klagt über blutigen Durchfall und Bauchschmerzen. Im Stuhl finden sich ovale Eier mit einem auffälligen, großen lateralen Dorn. Er hatte zuvor in Süßwasserseen in Brasilien gebadet.",
    options: ["Schistosoma mansoni", "Schistosoma haematobium", "Fasciola hepatica", "Clonorchis sinensis"],
    correct: 0,
    explanation: "Schistosoma mansoni-Eier haben einen charakteristischen lateralen (seitlichen) Dorn. Die Zerkarien penetrieren die Haut im Süßwasser, die adulten Würmer leben im Pfortadersystem.",
    parasite: "Schistosoma mansoni",
    rarity: "rare"
  },
  {
    case: "Drei Wochen nach dem Baden im Malawisee entwickelt ein Tourist juckende Hautausschläge, gefolgt von Fieber, Husten, Gelenkschmerzen und einer ausgeprägten Eosinophilie (Katayama-Fieber).",
    options: ["Akute Schistosomiasis (Katayama-Fieber)", "Larva migrans cutanea", "Leptospirose", "Strongyloidiasis"],
    correct: 0,
    explanation: "Das Katayama-Fieber ist die systemische immunologische Reaktion (Immunkomplex-Krankheit) auf die Eiablage junger Pärchenegel (Schistosoma spp.) kurz nach Infektion.",
    parasite: "Schistosoma mansoni",
    rarity: "rare"
  },
  {
    case: "Ein Patient mit chronischer Schistosomiasis entwickelt Ösophagusvarizenblutungen und eine ausgeprägte Splenomegalie. Die Leberbiopsie zeigt eine periportale Fibrose (Symmers-Fibrose) ohne Leberzellnekrosen.",
    options: ["Schistosoma mansoni", "Echinococcus multilocularis", "Clonorchis sinensis", "Entamoeba histolytica"],
    correct: 0,
    explanation: "Die chronische Eiablage von S. mansoni in den Pfortaderästen führt zu Granulomen und konsekutiver Symmers-Pipe-Stem-Fibrose, was präsinusoidalen Pfortaderhochdruck auslöst.",
    parasite: "Schistosoma mansoni",
    rarity: "rare"
  },

  // 7. Strongyloides stercoralis
  {
    case: "Ein älterer Krebspatient unter hochdosierter Steroidtherapie entwickelt Fieber, gramnegative Sepsis und Husten. Im Sputum und Stuhl finden sich fadenförmige rhabditiforme Larven. Er war vor 40 Jahren Soldat in Vietnam.",
    options: ["Strongyloides stercoralis (Hyperinfektion)", "Ascaris lumbricoides", "Necator americanus", "Wuchereria bancrofti"],
    correct: 0,
    explanation: "Strongyloides stercoralis kann durch Autoinfektion jahrzehntelang im Darm überleben. Unter Immunsuppression kommt es zum Hyperinfektionssyndrom mit Streuung der Larven und bakterieller Translokation.",
    parasite: "Strongyloides stercoralis",
    rarity: "common"
  },
  {
    case: "Ein Gärtner klagt über einen juckenden, sich schnell bewegenden (mehrere Zentimeter pro Stunde) schlangenlinienartigen Ausschlag im Gesäßbereich (Larva currens).",
    options: ["Strongyloides stretcoralis (Larva currens)", "Ancylostoma braziliense (Larva migrans)", "Dracunculus medinensis", "Dermatobia hominis"],
    correct: 0,
    explanation: "Die Larva currens ('laufende Larve') ist typisch für Strongyloides stercoralis und entsteht durch die schnelle Migration autoinfektiöser filariformer Larven in der Perianalhaut.",
    parasite: "Strongyloides stercoralis",
    rarity: "common"
  },
  {
    case: "Stuhluntersuchungen bei einem Patienten mit chronischem wässrigem Durchfall und Malabsorption zeigen freibewegliche rhabditiforme Larven mit kurzem Ösophagus, aber keine Wurmeier.",
    options: ["Strongyloides stercoralis", "Ancylostoma duodenale", "Trichuris trichiura", "Enterobius vermicularis"],
    correct: 0,
    explanation: "Im Gegensatz zu Hakenwürmern, bei denen Eier ausgeschieden werden, schlüpfen Strongyloides-Larven bereits in der Darmwand, weshalb im Stuhl lebende Larven nachgewiesen werden.",
    parasite: "Strongyloides stercoralis",
    rarity: "common"
  },

  // 8. Echinococcus granulosus
  {
    case: "Ein Schafzüchter stellt sich mit dumpfen Bauchschmerzen vor. Ein Ultraschall zeigt eine glatte, mehrkammrige Zyste in der Leber mit radiärer Speichenstruktur (Tochterzysten). Die Zystenwand ist zweischichtig verkalkt.",
    options: ["Echinococcus granulosus (Zystische Echinokokkose)", "Echinococcus multilocularis", "Entamoeba histolytica", "Fasciola hepatica"],
    correct: 0,
    explanation: "Echinococcus granulosus (Hundebandwurm) bildet langsam wachsende, dickwandige zystische Läsionen (Hydatiden) mit innerer Sprossung von Tochterzysten.",
    parasite: "Echinococcus granulosus",
    rarity: "rare"
  },
  {
    case: "Ein Patient hustet plötzlich große Mengen salziger Flüssigkeit aus, die winzige Haken und Zystenmembranen enthält. Im Röntgenbild zeigt sich eine rundliche Verschattung in der rechten Lunge.",
    options: ["Echinococcus granulosus (Lungenhydatide)", "Paragonimus westermani", "Aspergillom", "Tuberkulöse Kaverne"],
    correct: 0,
    explanation: "Hydatiden können sich auch in der Lunge ansiedeln. Bei Ruptur in die Bronchien kommt es zur Aushustung von Zysteninhalt (Vomica).",
    parasite: "Echinococcus granulosus",
    rarity: "rare"
  },
  {
    case: "Während einer Leberbiopsie einer unklaren Zyste entwickelt der Patient plötzlich Atemnot, generalisierte Urtikaria und einen anaphylaktischen Schock.",
    options: ["Echinococcus granulosus (Zystenruptur)", "Entamoeba histolytica Abszess", "Clonorchis Zystenperforation", "Reaktion auf Lokalanästhetika"],
    correct: 0,
    explanation: "Die Hydatidenflüssigkeit von E. granulosus ist extrem immunogen. Bei Punktion oder Ruptur droht ein lebensgefährlicher anaphylaktischer Schock. Zysten sollten daher operiert werden (PAIR-Methode).",
    parasite: "Echinococcus granulosus",
    rarity: "rare"
  },

  // 9. Entamoeba histolytica
  {
    case: "Ein Rückkehrer aus den Tropen leidet unter blutigen Schleimstühlen, Tenesmen und krampfartigen Bauchschmerzen. In der Koloskopie zeigen sich flask-shaped (flaschenförmige) Ulzera. Der Stuhlbefund zeigt Trophozoiten mit erythrozytären Einschlüssen.",
    options: ["Entamoeba histolytica", "Shigella dysenteriae", "Giardia lamblia", "Campylobacter jejuni"],
    correct: 0,
    explanation: "Entamoeba histolytica verursacht Amöbenruhr. Trophozoiten dringen mittels Proteasen in die Submukosa ein und erzeugen flaschenförmige Ulzera. Einschlüsse von Erythrozyten (Erythrophagozytose) beweisen die Pathogenität.",
    parasite: "Entamoeba histolytica",
    rarity: "common"
  },
  {
    case: "Ein Patient klagt über rechtsseitigen Oberbauchschmerz und Fieber. Im CT zeigt sich ein Solitärabszess im rechten Leberlappen. Bei der Punktion entleert sich schokoladenbraune, geruchlose Flüssigkeit ('Anchois-Paste').",
    options: ["Entamoeba histolytica (Amöbenleberabszess)", "Pyogener Leberabszess", "Echinococcus granulosus", "Clonorchis sinensis"],
    correct: 0,
    explanation: "Der Amöbenleberabszess entsteht durch hämatogene Streuung über die Pfortader. Das Punktat besteht aus nekrotischem Lebergewebe ohne echten Eiter und ähnelt Sardellenpaste.",
    parasite: "Entamoeba histolytica",
    rarity: "common"
  },
  {
    case: "Stuhlproben eines asymptomatischen Patienten zeigen runde, 12 Mikrometer große Zysten mit exakt vier Kernen und stäbchenförmigen Chromatoidkörpern.",
    options: ["Entamoeba histolytica", "Giardia lamblia", "Entamoeba coli", "Iodamoeba bütschlii"],
    correct: 0,
    explanation: "Zysten von E. histolytica besitzen im reifen Zustand vier Kerne und abgerundete Chromatoidkörperchen (Zigarrenform). Sie dienen der fäkal-oralen Übertragung.",
    parasite: "Entamoeba histolytica",
    rarity: "common"
  },

  // 10. Giardia lamblia
  {
    case: "Ein Wanderer trinkt aus einem klaren Gebirgsbach in den Rocky Mountains. Eine Woche später klagt er über heftige Blähungen, Bauchkrämpfe und voluminösen, fettigen, übelriechenden Durchfall (Steatorrhö), der auf dem Wasser schwimmt.",
    options: ["Giardia lamblia", "Cryptosporidium parvum", "Entamoeba histolytica", "Vibrio cholerae"],
    correct: 0,
    explanation: "Giardia lamblia besiedelt das Duodenum. Die Trophozoiten heften sich an den Bürstensaum und verursachen ein Malabsorptionssyndrom mit Fettstühlen (Steatorrhö) durch Gallensalz-Deaktivierung.",
    parasite: "Giardia lamblia",
    rarity: "common"
  },
  {
    case: "Bei einem Kind mit chronischer Giardiasis kommt es zu anhaltendem Gewichtsverlust und einer neu erworbenen Laktoseintoleranz aufgrund von Zottenatrophie im Dünndarm.",
    options: ["Giardia lamblia", "Zöliakie", "Rotavirus-Infektion", "Strongyloides stercoralis"],
    correct: 0,
    explanation: "Die chronische Anheftung der Giardia-Saugscheiben schädigt die Mikrovilli, führt zu Zottenatrophie und sekundärem Enzymmangel (z.B. Laktasemangel), was die Laktoseintoleranz auslöst.",
    parasite: "Giardia lamblia",
    rarity: "common"
  },
  {
    case: "Mehrere Kinder einer Kindertagesstätte entwickeln wässrigen Durchfall. Im Stuhlpräparat zeigen sich tropfenförmige Trophozoiten mit zwei Kernen ('Brillen-Optik') und vier Flagellenpaaren.",
    options: ["Giardia lamblia", "Trichomonas vaginalis", "Chilomastix mesnili", "Balantidium coli"],
    correct: 0,
    explanation: "Die Trophozoiten von Giardia lamblia sind birnen- oder tropfenförmig, besitzen zwei symmetrische Kerne (was ihnen ein gesichtsähnliches Aussehen gibt) und bewegen sich taumelnd wie fallende Blätter.",
    parasite: "Giardia lamblia",
    rarity: "common"
  }
];

// Helper to expand and compile 90 final questions: 3 difficulties of the 30 base questions
export const FALLBACK_QUESTIONS = [];

// Compile the questions into Resident, Fellow, and Attending categories
BASE_QUESTIONS.forEach((q, idx) => {
  // 1. Resident (Classic presentations, clear clues)
  FALLBACK_QUESTIONS.push({
    ...q,
    id: `q_res_${idx}`,
    difficulty: "Resident",
    case: `[Resident] ${q.case} (Klinischer Hinweis: Achte auf die geographische Herkunft und die typische Mikroskopie).`
  });
  
  // 2. Fellow (More similar symptoms, fewer direct clues)
  const fellowClues = q.case
    .replace(" sichelförmige Gametozyten", "")
    .replace(" Sabin-Trias", "")
    .replace(" lateralen Dorn", " Dornen")
    .replace(" flask-shaped (flaschenförmige) Ulzera", " ulzerierende Läsionen")
    .replace(" 'Brillen-Optik'", "");
    
  FALLBACK_QUESTIONS.push({
    ...q,
    id: `q_fel_${idx}`,
    difficulty: "Fellow",
    case: `[Fellow] ${fellowClues}`,
    explanation: `[Fellow Level Analyse] ${q.explanation} Differenzialdiagnostisch müssen ähnliche Krankheitserreger ausgeschlossen werden.`
  });
  
  // 3. Attending (Atypical presentation, complex co-infections, zero clues)
  const attendingClues = q.case
    .replace("sichelförmige Gametozyten", "atypische Einschlusskörperchen")
    .replace("Sabin-Trias", "unspezifische neurologische Symptome")
    .replace(" lateralen Dorn", "")
    .replace(" flask-shaped (flaschenförmige) Ulzera", "")
    .replace(" 'Brillen-Optik'", "")
    .replace(" ringangereicherte Läsionen in den Basalganglien", "unspezifische Signalstörungen im Kortex");
    
  FALLBACK_QUESTIONS.push({
    ...q,
    id: `q_att_${idx}`,
    difficulty: "Attending",
    case: `[Attending] Atypische Manifestation bei immunkompromittiertem Wirt. ${attendingClues}`,
    explanation: `[Attending Level Experten-Review] ${q.explanation} Aufgrund der atypischen Ausprägung ist ein molekularbiologischer Nachweis (PCR) oder Gewebebiopsie indiziert.`
  });
});

export function renderParasiteCard(parasite, isUnlocked = true) {
  const cardBorderClass = `card-border-${parasite.rarity}`;
  
  return `
    <div class="bestiary-card ${cardBorderClass} ${isUnlocked ? 'unlocked' : 'locked'}">
      <div class="card-inner-parchment">
        <div class="card-header-row">
          <span class="card-title">${parasite.name}</span>
          <span class="card-rarity ui-label">${parasite.rarity}</span>
        </div>
        
        <div class="card-art-frame">
          ${isUnlocked ? parasite.svg : `
            <div class="card-locked-silhouette">
              <svg viewBox="0 0 100 100" width="80" height="80">
                <circle cx="50" cy="50" r="40" fill="none" stroke="var(--border-gold-dim)" stroke-width="2" stroke-dasharray="4 4"/>
                <text x="50" y="55" fill="var(--border-gold-dim)" font-family="Cinzel" font-size="10" text-anchor="middle">LOCKED</text>
              </svg>
            </div>
          `}
        </div>

        <div class="card-transmission">
          <span class="ui-label">Transmission:</span>
          <p>${isUnlocked ? parasite.transmission : "???"}</p>
        </div>

        <div class="card-fact-box">
          <p>${isUnlocked ? parasite.fact : "Sammle diese Karte, indem du den Pathogen im Parasitology Quiz korrekt diagnostizierst."}</p>
        </div>

        <div class="card-stats-row">
          <div class="stat-col">
            <span class="ui-label">Host</span>
            <div class="stat-dots">${isUnlocked ? renderStatDots(parasite.stats.host) : '???'}</div>
          </div>
          <div class="stat-col">
            <span class="ui-label">Vector</span>
            <div class="stat-dots">${isUnlocked ? renderStatDots(parasite.stats.transmission) : '???'}</div>
          </div>
          <div class="stat-col">
            <span class="ui-label">Fatality</span>
            <div class="stat-dots">${isUnlocked ? renderStatDots(parasite.stats.lethality) : '???'}</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderStatDots(value) {
  let dots = "";
  for (let i = 1; i <= 5; i++) {
    if (i <= value) {
      dots += `<span class="dot active"></span>`;
    } else {
      dots += `<span class="dot"></span>`;
    }
  }
  return dots;
}

function injectBestiaryStyles() {
  const styleId = "bestiary-card-styles";
  if (document.getElementById(styleId)) return;
  
  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = `
    .bestiary-view {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .bestiary-filter-row {
      display: flex;
      justify-content: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }
    .bestiary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 2rem;
    }
    
    .bestiary-card {
      background-color: #dfd2bb;
      color: #2c2118;
      border: 1px solid #c0b093;
      padding: 10px;
      font-family: 'EB Garamond', serif;
      box-shadow: 0 4px 15px rgba(0,0,0,0.5);
      position: relative;
      transition: all 0.3s ease;
      min-height: 440px;
      display: flex;
      flex-direction: column;
    }
    
    .bestiary-card.locked {
      filter: grayscale(1) sepia(0.5) brightness(0.6);
      opacity: 0.75;
    }
    
    .card-inner-parchment {
      border: 1px solid #7c6853;
      padding: 12px;
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      height: 100%;
    }
    
    .card-header-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      border-bottom: 2px solid #5a4b3d;
      padding-bottom: 4px;
    }
    .card-title {
      font-family: 'Cinzel', serif;
      font-weight: 800;
      font-size: 1.15rem;
      color: #2c2118;
    }
    .card-rarity {
      font-size: 0.65rem;
      color: #7a2b2b;
      font-weight: bold;
    }
    
    .card-art-frame {
      height: 170px;
      background-color: #faf5eb;
      border: 2px solid #8e7861;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 5px;
      margin: 2px 0;
      position: relative;
      overflow: hidden;
    }
    
    .card-locked-silhouette {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100%;
    }
    
    .card-border-common {
      border: 3px solid #8c8c8c;
    }
    .card-border-rare {
      border: 3px solid #d4af37;
    }
    .bestiary-card.card-border-rare.unlocked {
      animation: cardPulse 3s infinite alternate;
    }
    .card-border-legendary {
      border: 3px solid #8b1a1a;
    }
    .bestiary-card.card-border-legendary.unlocked {
      animation: legendaryFlicker 6s infinite;
    }
    
    @keyframes cardPulse {
      0% { box-shadow: 0 4px 15px rgba(0,0,0,0.5); }
      100% { box-shadow: 0 0 15px rgba(212, 175, 55, 0.4); }
    }
    @keyframes legendaryFlicker {
      0%, 19.99%, 22%, 62.99%, 64%, 64.99%, 70%, 100% { border-color: #8b1a1a; box-shadow: 0 4px 15px rgba(139,26,26,0.6); }
      20%, 21.99%, 63%, 63.99%, 65%, 69.99% { border-color: #ff3333; box-shadow: 0 0 25px rgba(255,51,51,0.8); }
    }
    
    .card-transmission {
      font-size: 0.8rem;
      line-height: 1.3;
      border-bottom: 1px solid #ab9780;
      padding-bottom: 4px;
    }
    .card-transmission .ui-label {
      font-size: 0.65rem;
      color: #615040;
      margin-bottom: 2px;
      display: block;
    }
    
    .card-fact-box {
      font-size: 0.85rem;
      line-height: 1.35;
      font-style: italic;
      color: #4a3e32;
      flex-grow: 1;
    }
    
    .card-stats-row {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 5px;
      border-top: 1px solid #5a4b3d;
      padding-top: 6px;
      text-align: center;
    }
    .stat-col {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .stat-col .ui-label {
      font-size: 0.6rem;
      color: #6a5a4a;
      margin-bottom: 3px;
    }
    .stat-dots {
      display: flex;
      gap: 2px;
    }
    .stat-dots .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: #bfaea2;
      border: 1px solid #7c6853;
      display: inline-block;
    }
    .stat-dots .dot.active {
      background-color: #8b1a1a;
    }
  `;
  document.head.appendChild(style);
}

export function initBestiaryView(container) {
  injectBestiaryStyles();
  
  const unlockedCount = playerState.cardCollection.length;
  
  // Track achievements check for full bestiary
  updateBestiaryCount(unlockedCount);

  container.innerHTML = `
    <div class="bestiary-view">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span class="leitner-status-badge">Bestiary: ${unlockedCount} / 10 Specimens Discovered</span>
      </div>
      <div class="bestiary-filter-row">
        <button class="btn-stone active" data-filter="all">All</button>
        <button class="btn-stone" data-filter="common">Common</button>
        <button class="btn-stone" data-filter="rare">Rare</button>
        <button class="btn-stone" data-filter="legendary">Legendary</button>
      </div>
      <div class="bestiary-grid" id="bestiary-cards-grid"></div>
    </div>
  `;
  
  const grid = document.getElementById("bestiary-cards-grid");
  
  function renderGrid(filter = "all") {
    grid.innerHTML = "";
    PARASITES.forEach(p => {
      if (filter !== "all" && p.rarity !== filter) return;
      const isUnlocked = playerState.cardCollection.includes(p.id);
      grid.innerHTML += renderParasiteCard(p, isUnlocked);
    });
  }
  
  const filterBtns = container.querySelectorAll(".bestiary-filter-row button");
  filterBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      filterBtns.forEach(b => b.classList.remove("active"));
      e.currentTarget.classList.add("active");
      renderGrid(e.currentTarget.dataset.filter);
    });
  });
  
  renderGrid("all");
}
