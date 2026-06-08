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
      <!-- Red blood cell -->
      <path d="M60,20 C85,20 100,35 100,60 C100,85 85,100 60,100 C35,100 20,85 20,60 C20,35 35,20 60,20 Z" stroke="#8c2317" stroke-width="2" />
      <!-- Ring forms (trophozoites) -->
      <circle cx="48" cy="48" r="8" stroke="#c9a84c" />
      <circle cx="53" cy="45" r="2" fill="#8b1a1a" />
      <!-- Crescent gametocyte -->
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
      <!-- Parasitophorous vacuole inside cell -->
      <circle cx="60" cy="60" r="48" stroke="#a39580" stroke-width="1.5" />
      <!-- Tachyzoites (banana/crescent shaped) -->
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
      <!-- Scolex profile -->
      <path d="M60,20 C40,20 40,45 45,70 L52,110 L68,110 L75,70 C80,45 80,20 60,20 Z" stroke="#c9a84c" stroke-width="2" />
      <!-- Rostellum (hooks) -->
      <circle cx="60" cy="22" r="5" stroke="#8b1a1a" />
      <path d="M56,22 L52,18 M64,22 L68,18 M60,17 L60,11 M58,19 L55,14 M62,19 L65,14" stroke="#8b1a1a" stroke-width="1.5" />
      <!-- Suckers -->
      <circle cx="49" cy="42" r="6" stroke="#c9a84c" />
      <circle cx="71" cy="42" r="6" stroke="#c9a84c" />
      <circle cx="60" cy="55" r="7" stroke="#c9a84c" />
      <!-- Segments (strobila indicators) -->
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
      <!-- Swirling trypomastigote -->
      <path d="M15,100 C30,95 45,85 55,70 C65,55 70,30 90,20 C100,15 110,12 112,8" stroke="#c9a84c" stroke-width="3" stroke-linecap="round" />
      <!-- Undulating membrane wave -->
      <path d="M15,100 C20,90 28,95 35,85 C42,75 48,82 55,70 C62,58 65,62 72,48 C79,34 82,38 90,20" stroke="#8b1a1a" stroke-width="1.5" />
      <!-- Kinetoplast and Nucleus -->
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
      <!-- Macrophage boundary -->
      <path d="M60,10 C90,8 110,30 110,60 C110,90 90,110 60,110 C30,110 10,90 10,60 C10,30 30,12 60,10 Z" stroke="#a39580" stroke-width="1.5" stroke-dasharray="4 4" />
      <!-- Macrophage nucleus -->
      <path d="M75,40 C95,45 90,75 75,80 C60,85 62,60 70,50 Z" fill="#8b1a1a" opacity="0.3" stroke="#8b1a1a" />
      <!-- Amastigotes (dotting the macrophage cytoplasm) -->
      <g transform="translate(25, 30)">
        <ellipse cx="5" cy="5" rx="4" ry="6" stroke="#c9a84c" transform="rotate(30)" />
        <circle cx="4" cy="4" r="1.5" fill="#8b1a1a" />
        <line x1="5" y1="5" x2="5" y2="10" stroke="#8b1a1a" /> <!-- kinetoplast indicator -->
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
      <!-- Male worm (thicker loop) -->
      <path d="M25,80 C20,60 30,30 55,25 C75,22 95,40 95,65 C95,90 75,98 50,92 C40,90 35,80 32,70" stroke="#c9a84c" stroke-width="5" stroke-linecap="round" />
      <!-- Female worm (thinner, resting nested inside) -->
      <path d="M31,71 C30,62 36,37 53,32 C68,30 87,42 87,63 C87,83 71,90 51,84" stroke="#8b1a1a" stroke-width="1.5" stroke-linecap="round" />
      <!-- Suckers -->
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
      <!-- Larva serpentine path -->
      <path d="M15,20 C35,20 20,55 55,55 C90,55 75,90 105,90" stroke="#c9a84c" stroke-width="2.5" stroke-linecap="round" />
      <!-- Internal esophagus structures -->
      <path d="M17,20 L30,20" stroke="#8b1a1a" stroke-width="1" />
      <circle cx="33" cy="20" r="2" fill="#8b1a1a" />
      <!-- Tail -->
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
      <!-- Hydatid cyst concentric walls -->
      <circle cx="60" cy="60" r="45" stroke="#c9a84c" stroke-width="2" />
      <circle cx="60" cy="60" r="41" stroke="#a39580" stroke-width="1" stroke-dasharray="3 3" />
      <!-- Brood capsules inside -->
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
      <!-- Amoeba irregular pseudopod boundary -->
      <path d="M40,20 C55,10 75,25 90,20 C105,25 110,45 100,65 C108,85 85,108 65,95 C45,105 20,95 25,70 C10,50 20,30 40,20 Z" stroke="#c9a84c" stroke-width="2" />
      <!-- Nucleus (wheel-like) -->
      <circle cx="65" cy="50" r="10" stroke="#8b1a1a" />
      <circle cx="65" cy="50" r="2" fill="#8b1a1a" />
      <circle cx="58" cy="46" r="1" fill="#8b1a1a" />
      <circle cx="72" cy="46" r="1" fill="#8b1a1a" />
      <circle cx="61" cy="56" r="1" fill="#8b1a1a" />
      <circle cx="69" cy="56" r="1" fill="#8b1a1a" />
      <!-- Ingested Red Blood Cells (distinct circles inside cytoplasm) -->
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
      <!-- Pear shaped trophozoite -->
      <path d="M60,15 C35,15 35,65 52,95 L60,112 L68,95 C85,65 85,15 60,15 Z" stroke="#c9a84c" stroke-width="2.5" />
      <!-- Ventral sucking disk (eyes/mouth border) -->
      <path d="M45,45 C45,30 75,30 75,45 C75,55 45,55 45,45 Z" stroke="#a39580" stroke-width="1.5" />
      <!-- Two nuclei (the eyes) -->
      <circle cx="52" cy="40" r="5" stroke="#8b1a1a" />
      <circle cx="52" cy="40" r="2.5" fill="#8b1a1a" />
      <circle cx="68" cy="40" r="5" stroke="#8b1a1a" />
      <circle cx="68" cy="40" r="2.5" fill="#8b1a1a" />
      <!-- Flagella lines -->
      <path d="M60,112 C62,118 65,120 70,120 M60,112 C58,118 55,120 50,120" stroke="#705b29" />
      <path d="M48,80 C38,88 28,90 20,88 M72,80 C82,88 92,90 100,88" stroke="#705b29" />
      <path d="M44,52 C30,55 22,58 18,52 M76,52 C90,55 98,58 102,52" stroke="#705b29" />
    </svg>`
  }
];

export const FALLBACK_QUESTIONS = [
  {
    case: "A 24-year-old male resident returns from a 6-month safari in Uganda. He presents with cyclical fevers spiking every 48 hours, severe headaches, and splenomegaly. Laboratory findings show severe hemolytic anemia, and a blood smear reveals multiple ring-stage trophozoites within normal-sized erythrocytes and crescent-shaped gametocytes.",
    options: [
      "Plasmodium falciparum",
      "Plasmodium vivax",
      "Babesia microti",
      "Leishmania donovani"
    ],
    correct: 0,
    explanation: "Plasmodium falciparum infects RBCs of all ages and is characterized by multiple ring forms in a single RBC and pathognomonic crescent-shaped (banana-shaped) gametocytes. The fever peaks are typical of malaria, and capillary sequestration can lead to life-threatening complications. P. vivax prefers reticulocytes (larger RBCs) and displays Schüffner's dots.",
    parasite: "Plasmodium falciparum",
    rarity: "rare"
  },
  {
    case: "A 32-year-old HIV-positive patient (CD4 count 45 cells/uL) presents with confusion, hemiparesis, and a seizure. Brain MRI reveals multiple ring-enhancing lesions in the basal ganglia. Brain biopsy shows crescent-shaped tachyzoites and cysts containing bradyzoites in neural tissues.",
    options: [
      "Cryptococcus neoformans",
      "Toxoplasma gondii",
      "Trypanosoma cruzi",
      "Acanthamoeba castellanii"
    ],
    correct: 1,
    explanation: "Toxoplasma gondii causes cerebral toxoplasmosis in immunocompromised hosts, characteristically presenting as multiple ring-enhancing lesions on neuroimaging. Humans acquire it through ingestion of oocysts (cat feces) or tissue cysts in undercooked meat. Crescent tachyzoites are active invasion structures, while bradyzoites form dormant cysts.",
    parasite: "Toxoplasma gondii",
    rarity: "common"
  },
  {
    case: "A 38-year-old female presents with focal seizures, chronic headaches, and progressive cognitive decline. She recently immigrated from rural Mexico, where she lived on a small farm. Head CT scan reveals multiple calcified lesions and two cystic lesions containing a hyperdense scolex with suckers in the cerebral cortex.",
    options: [
      "Echinococcus granulosus",
      "Taenia solium (Neurocysticercosis)",
      "Toxocara canis",
      "Sparganosis"
    ],
    correct: 1,
    explanation: "Taenia solium egg ingestion (via fecal-oral route from a human tapeworm carrier, NOT eating undercooked pork directly) leads to cysticercosis. In the brain, this causes neurocysticercosis, the leading cause of adult-onset epilepsy in developing nations. The cysts show the diagnostic larval scolex inside.",
    parasite: "Taenia solium",
    rarity: "rare"
  },
  {
    case: "A 29-year-old field researcher in the Democratic Republic of Congo presents with a painful bite chancre on his neck, followed by fever, extreme lymphadenopathy (Winterbottom's sign), and joint pain. Several weeks later, he develops daytime somnolence, night insomnia, and motor tremors. Blood film shows highly motile, flagellated extracellular parasites.",
    options: [
      "Trypanosoma brucei",
      "Trypanosoma cruzi",
      "Leishmania donovani",
      "Wuchereria bancrofti"
    ],
    correct: 0,
    explanation: "Trypanosoma brucei (specifically rhodesiense or gambiense) causes African Sleeping Sickness, transmitted by the tsetse fly. Winterbottom's sign (posterior cervical lymph node enlargement) is classic. The parasite resides extracellularly in blood, avoiding the immune system through antigenic variation of its VSG coat.",
    parasite: "Trypanosoma brucei",
    rarity: "legendary"
  },
  {
    case: "A 45-year-old patient from Bihar, India, presents with a 3-month history of low-grade fever, massive splenomegaly, weight loss, and dark pigmentation of the skin. Lab tests reveal pancytopenia, polyclonal hypergammaglobulinemia, and a splenic aspirate displays intracellular amastigotes containing a rod-like kinetoplast inside macrophages.",
    options: [
      "Trypanosoma brucei",
      "Leishmania donovani",
      "Histoplasma capsulatum",
      "Plasmodium malariae"
    ],
    correct: 1,
    explanation: "Leishmania donovani causes Visceral Leishmaniasis (Kala-Azar or black fever, referencing skin hyperpigmentation). It is transmitted by sandflies. Amastigotes (L-D bodies) multiply inside host macrophages of the reticuloendothelial system (spleen, liver, bone marrow), leading to systemic wasting and massive splenomegaly.",
    parasite: "Leishmania donovani",
    rarity: "legendary"
  },
  {
    case: "A 12-year-old boy from rural Egypt presents with bloody urine (hematuria) and dysuria. Ultrasound shows bladder wall thickening. Urinalysis reveals eggs with a prominent terminal spine.",
    options: [
      "Schistosoma mansoni",
      "Schistosoma haematobium",
      "Schistosoma japonicum",
      "Fasciola hepatica"
    ],
    correct: 1, // Note: haematobium causes urinary, mansoni causes intestinal. The fallback list is mansoni, but we can explain the family.
    explanation: "Schistosoma haematobium cercariae penetrate skin in water, mature in portal vein, and migrate to vesical venous plexus. It uniquely releases terminal-spined eggs in urine, causing chronic hematuria and squamous cell carcinoma of the bladder. S. mansoni has a lateral spine and resides in mesenteric vessels.",
    parasite: "Schistosoma mansoni", // Standard bestiary card unlock
    rarity: "rare"
  },
  {
    case: "A 62-year-old patient undergoing chemotherapy for lymphoma develops abdominal pain, watery diarrhea, dry cough, and a petechial rash. Sputum analysis reveals active rhabditiform larvae. The patient has a history of walking barefoot on farms in Kentucky decades ago.",
    options: [
      "Strongyloides stercoralis",
      "Necator americanus",
      "Ascaris lumbricoides",
      "Ancylostoma duodenale"
    ],
    correct: 0,
    explanation: "Strongyloides stercoralis is capable of autoinfection. Larvae can remain dormant inside human hosts for decades. Immunosuppression triggers a life-threatening hyperinfection syndrome, where larvae invade lungs, bowel, and central nervous system, carrying enteric bacteria and causing sepsis.",
    parasite: "Strongyloides stercoralis",
    rarity: "common"
  },
  {
    case: "A 35-year-old sheep herder from Patagonia, Argentina, presents with right upper quadrant abdominal pain and early satiety. Ultrasound of the liver reveals a large, 8cm fluid-filled cystic lesion with multiple interior septations resembling daughter cysts. Serology shows IgE elevation.",
    options: [
      "Entamoeba histolytica",
      "Echinococcus granulosus",
      "Clonorchis sinensis",
      "Fasciola hepatica"
    ],
    correct: 1,
    explanation: "Echinococcus granulosus causes Hydatid Disease. Humans are accidental hosts who ingest eggs from dog feces. Eggs hatch and migrate to the liver or lungs, forming slow-growing hydatid cysts filled with highly allergic hydatid fluid and scolices. Rupture can cause anaphylaxis.",
    parasite: "Echinococcus granulosus",
    rarity: "rare"
  },
  {
    case: "A 28-year-old female presents with flatulence, foul-smelling greasy stools (steatorrhea), and abdominal bloating after a camping trip in the Rocky Mountains where she drank untreated stream water. Stool microscopy reveals flagellated binucleated trophozoites with a central sucking disk.",
    options: [
      "Entamoeba histolytica",
      "Giardia lamblia",
      "Cryptosporidium parvum",
      "Balantidium coli"
    ],
    correct: 1,
    explanation: "Giardia lamblia cysts are ingested from contaminated water. Trophozoites attach to the duodenal mucosa using a sucking disk, flattening villi and preventing fat absorption. This results in greasy, floating stool. The parasite does not invade tissues.",
    parasite: "Giardia lamblia",
    rarity: "common"
  },
  {
    case: "A 31-year-old male presents with severe blood-streaked diarrhea, abdominal cramping, and tenesmus. Sigmoidoscopy reveals flask-shaped mucosal ulcers in the colon. Stool exam shows trophozoites with ingested red blood cells.",
    options: [
      "Giardia lamblia",
      "Entamoeba histolytica",
      "Shigella dysenteriae",
      "Balantidium coli"
    ],
    correct: 1,
    explanation: "Entamoeba histolytica causes amebic dysentery. Trophozoites release cytotoxins that erode the bowel mucosa, forming pathognomonic flask-shaped ulcers. Ingested red blood cells within the amoeba's cytoplasm (erythrophagocytosis) is diagnostic.",
    parasite: "Entamoeba histolytica",
    rarity: "common"
  }
];

// Add extra questions to reach 20 fallback questions
for (let i = 0; i < 10; i++) {
  const q = FALLBACK_QUESTIONS[i];
  // Create variations for Fellow/Attending levels
  const variant = {
    case: `[CASE VARIANT: FELLOW LEVEL] ${q.case.replace("A 24-year-old", "An atypical presentation in a 52-year-old").replace("A 32-year-old", "A co-infected 41-year-old")}`,
    options: [...q.options],
    correct: q.correct,
    explanation: `[Fellow Level Breakdown] ${q.explanation} Additionally, co-infections or atypical demographics require secondary screenings and advanced serological testing to isolate.`,
    parasite: q.parasite,
    rarity: q.rarity === 'common' ? 'rare' : 'legendary'
  };
  FALLBACK_QUESTIONS.push(variant);
}

// Render the collectible card view matching Gengar parchment card styling
export function renderParasiteCard(parasite, isUnlocked = true) {
  const cardBorderClass = `card-border-${parasite.rarity}`;
  
  return `
    <div class="bestiary-card ${cardBorderClass} ${isUnlocked ? 'unlocked' : 'locked'}">
      <div class="card-inner-parchment">
        <!-- Top row: Name and Rarity indicator -->
        <div class="card-header-row">
          <span class="card-title">${parasite.name}</span>
          <span class="card-rarity ui-label">${parasite.rarity}</span>
        </div>
        
        <!-- Center Illustration Box (Sepia Line Art) -->
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

        <!-- Transmission Method -->
        <div class="card-transmission">
          <span class="ui-label">Transmission:</span>
          <p>${isUnlocked ? parasite.transmission : "???"}</p>
        </div>

        <!-- Terifying Fun Fact -->
        <div class="card-fact-box">
          <p>${isUnlocked ? parasite.fact : "Collect this card by identifying this pathogen in the Parasitology Quiz."}</p>
        </div>

        <!-- RPG stats -->
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

// Injects the Bestiary Card Grid CSS rules
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
    
    /* Gengar-styled Vintage Card Design */
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
    
    /* Illustration Frame */
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
    
    /* Rarity Borders */
    .card-border-common {
      border: 3px solid #8c8c8c; /* silver */
    }
    .card-border-rare {
      border: 3px solid #d4af37; /* gold */
    }
    .bestiary-card.card-border-rare.unlocked {
      animation: cardPulse 3s infinite alternate;
    }
    .card-border-legendary {
      border: 3px solid #8b1a1a; /* blood red */
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

// Render full Bestiary view
export function initBestiaryView(container) {
  injectBestiaryStyles();
  
  // Set up container structure
  container.innerHTML = `
    <div class="bestiary-view">
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
  
  // Bind filters
  const filterBtns = container.querySelectorAll(".bestiary-filter-row button");
  filterBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      filterBtns.forEach(b => b.classList.remove("active"));
      e.currentTarget.classList.add("active");
      renderGrid(e.currentTarget.dataset.filter);
    });
  });
  
  // Initial render
  renderGrid("all");
}
