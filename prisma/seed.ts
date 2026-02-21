import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

/* ================================================================
   EVALORA – Full Seed Script
   Creates auth users, profiles, subjects, notes, short-notes,
   papers, quizzes (with questions), relationships, and progress.
   ================================================================ */

const pool = new Pool({ connectionString: process.env.DIRECT_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ─── Deterministic UUIDs so we can reference across data ─────────
function uuid(index: number) {
  return `00000000-0000-4000-a000-${String(index).padStart(12, "0")}`;
}

const IDS = {
  admin001: uuid(1),
  student001: uuid(10),
  student002: uuid(11),
  student003: uuid(12),
  student004: uuid(13),
  student005: uuid(14),
  teacher001: uuid(20),
  parent001: uuid(30),
  parent002: uuid(31),
  parent003: uuid(32),
  parent004: uuid(33),
  parent005: uuid(34),
};

// ─── User definitions ────────────────────────────────────────────
const USERS = [
  { id: IDS.admin001, email: "admin001@gmail.com", firstName: "Rajitha", lastName: "Fernando", role: "ADMIN" as const },
  { id: IDS.student001, email: "student001@gmail.com", firstName: "Kasun", lastName: "Perera", role: "STUDENT" as const },
  { id: IDS.student002, email: "student002@gmail.com", firstName: "Amaya", lastName: "Silva", role: "STUDENT" as const },
  { id: IDS.student003, email: "student003@gmail.com", firstName: "Dinesh", lastName: "Jayawardena", role: "STUDENT" as const },
  { id: IDS.student004, email: "student004@gmail.com", firstName: "Nethmi", lastName: "Bandara", role: "STUDENT" as const },
  { id: IDS.student005, email: "student005@gmail.com", firstName: "Tharindu", lastName: "Wijesinghe", role: "STUDENT" as const },
  { id: IDS.teacher001, email: "teacher001@gmail.com", firstName: "Sanduni", lastName: "Jayasuriya", role: "TEACHER" as const },
  { id: IDS.parent001, email: "parent001@gmail.com", firstName: "Mahinda", lastName: "Perera", role: "PARENT" as const },
  { id: IDS.parent002, email: "parent002@gmail.com", firstName: "Kumari", lastName: "Silva", role: "PARENT" as const },
  { id: IDS.parent003, email: "parent003@gmail.com", firstName: "Nimal", lastName: "Jayawardena", role: "PARENT" as const },
  { id: IDS.parent004, email: "parent004@gmail.com", firstName: "Padma", lastName: "Bandara", role: "PARENT" as const },
  { id: IDS.parent005, email: "parent005@gmail.com", firstName: "Ranjith", lastName: "Wijesinghe", role: "PARENT" as const },
];

// ─── 10 History Topics ───────────────────────────────────────────
const TOPICS = [
  "Ancient Civilizations of Sri Lanka",
  "Medieval Kingdoms of Sri Lanka",
  "Colonial Era in Sri Lanka",
  "Independence Movement of Sri Lanka",
  "Ancient Egypt and Mesopotamia",
  "Greek and Roman Civilizations",
  "World War I",
  "World War II",
  "Industrial Revolution",
  "Cold War Era",
];

// ─── Notes content (teacher) ─────────────────────────────────────
const TEACHER_NOTES: { title: string; topic: string; content: string }[] = [
  {
    title: "Ancient Civilizations of Sri Lanka - Complete Study Guide",
    topic: TOPICS[0],
    content: `# Ancient Civilizations of Sri Lanka

## 1. Introduction
Sri Lanka's ancient history stretches back over 2,500 years, with archaeological evidence of human habitation dating to approximately 125,000 years ago. The island's strategic position in the Indian Ocean made it a crossroads of trade and cultural exchange.

## 2. Prehistoric Sri Lanka
- **Balangoda Man** (Homo sapiens balangodensis): The earliest known inhabitants, dating to around 34,000 BCE.
- Stone tools, cave paintings, and burial sites found in Fa Hien Cave (Pahiyangala) and Batadomba-lena.
- Transition from hunter-gatherer societies to early agricultural communities around 5,000 BCE.

## 3. The Arrival of the Sinhalese
- According to the Mahavamsa (Great Chronicle), **Prince Vijaya** arrived from North India around 543 BCE.
- He established the first Sinhalese kingdom in **Tambapanni** (modern-day Mannar region).
- The blending of North Indian settlers with indigenous Yaksha and Naga populations.

## 4. The Anuradhapura Kingdom (377 BCE - 1017 CE)
### 4.1 Founding
- King **Pandukabhaya** (437-367 BCE) established Anuradhapura as the capital.
- Developed sophisticated urban planning with reservoirs, monasteries, and palaces.

### 4.2 Introduction of Buddhism
- **Arahat Mahinda**, son of Emperor Ashoka, brought Buddhism to Sri Lanka in 247 BCE.
- King **Devanampiya Tissa** embraced Buddhism, building the **Thuparamaya** - Sri Lanka's first dagoba.
- The sacred **Sri Maha Bodhi** (a sapling from the original Bodhi Tree) was brought by **Sanghamitta**.

### 4.3 Hydraulic Civilization
- Construction of massive irrigation tanks (wewa): **Minneriya**, **Parakrama Samudra**, **Kalawewa**.
- Advanced canal systems spanning hundreds of kilometers.
- The **bisokotuwa** (valve pit) - an engineering marvel for water regulation.

### 4.4 Key Rulers
| Ruler | Period | Achievements |
|-------|--------|--------------|
| Dutugemunu | 161-137 BCE | United the island, built Ruwanwelisaya |
| Valagamba | 103-89 BCE | Built Abhayagiri Monastery |
| Mahasena | 274-301 CE | Built Jetavanaramaya, largest brick structure |
| Dhatusena | 455-473 CE | Built Kalawewa tank |

## 5. Cultural Achievements
- **Architecture**: Dagobas (stupas), moonstones, guard stones, and Isurumuniya rock carvings.
- **Literature**: The Mahavamsa and Dipavamsa chronicles, Pali literature.
- **Art**: Sigiriya frescoes, bronze sculptures, and intricate carvings.

## 6. Decline
- Repeated invasions from South Indian Chola dynasty.
- Internal power struggles and shifting of capitals.
- The destruction of Anuradhapura by Chola forces in 993 CE.

## Key Terms
- **Mahavamsa**: The Great Chronicle of Sri Lankan history
- **Dagoba/Stupa**: Buddhist shrine containing sacred relics
- **Wewa**: Artificial irrigation reservoir
- **Bisokotuwa**: Ingenious water valve pit system`,
  },
  {
    title: "Medieval Kingdoms of Sri Lanka - Comprehensive Notes",
    topic: TOPICS[1],
    content: `# Medieval Kingdoms of Sri Lanka

## 1. The Polonnaruwa Kingdom (1017-1232 CE)

### 1.1 Rise of Polonnaruwa
- After the fall of Anuradhapura to the Cholas, the capital shifted to Polonnaruwa.
- **Vijayabahu I** (1055-1110 CE) liberated Sri Lanka from Chola rule in 1070 CE.
- Restored Buddhism and rebuilt monasteries destroyed during Chola occupation.

### 1.2 The Golden Age - King Parakramabahu I (1153-1186 CE)
- Known as "Parakramabahu the Great."
- Famous quote: "Not even a drop of water that flows from the sky should be allowed to reach the sea without being useful to man."
- Built the massive **Parakrama Samudra** (Sea of Parakrama) reservoir.

### 1.3 Architectural Marvels
- **Vatadage**: Circular relic house with stunning stone carvings.
- **Gal Vihara**: Four magnificent Buddha statues carved from a single granite rock.
- **Lankatilaka**: A massive image house built in brick.

### 1.4 Decline of Polonnaruwa
- The **Kalinga Magha invasion** (1215 CE) devastated the kingdom.
- Capital shifted southward to Dambadeniya.

## 2. The Drift South (1232-1505)
- Dambadeniya Kingdom (1232-1283): Founded by **Vijayabahu III**.
- Gampola Kingdom (1341-1408): Capital in the central highlands.
- Kotte Kingdom (1412-1597): **Parakramabahu VI** - last king to unite the entire island.

## 3. The Kandyan Kingdom (1469-1815)
- Founded by **Senasammata Vikramabahu** in the central highlands.
- Successfully resisted Portuguese and Dutch invasions for over 300 years.
- **Vimaladharmasuriya I** moved the Tooth Relic to Kandy.
- **Sri Vikrama Rajasinha** (1798-1815) was the last king.
- Signed the **Kandyan Convention** on March 2, 1815, ceding the kingdom to the British.`,
  },
  {
    title: "Colonial Era in Sri Lanka - Detailed Study Notes",
    topic: TOPICS[2],
    content: `# Colonial Era in Sri Lanka (1505-1948)

## 1. Portuguese Period (1505-1658)
- In 1505, **Lourenco de Almeida** arrived in Colombo accidentally.
- Interest in cinnamon trade and Indian Ocean control.
- Built fortifications in Colombo, Galle, and Negombo.
- Converted many locals to Roman Catholicism.
- Introduced new crops: tobacco, cashew, and guava.

## 2. Dutch Period (1658-1796)
- The Dutch allied with the Kandyan Kingdom to expel the Portuguese.
- Introduced **Roman-Dutch Law**, still influences Sri Lankan law today.
- Built the iconic **Galle Fort** (now a UNESCO World Heritage Site).
- Developed canal systems (Hamilton Canal, Dutch Canal).
- Monopolized the cinnamon trade.

## 3. British Period (1796-1948)
### 3.1 Acquisition
- British took over Dutch territories in 1796 during the Napoleonic Wars.
- Sri Lanka became a **Crown Colony** in 1802 under the Treaty of Amiens.
- Conquered the **Kandyan Kingdom** in 1815 through the Kandyan Convention.

### 3.2 Plantation Economy
- Introduction of **coffee** plantations in the 1830s.
- After the coffee blight of 1869, shifted to **tea, rubber, and coconut**.
- Brought Tamil laborers from South India.
- Built roads and railways.

### 3.3 Administrative Reforms
- **Colebrooke-Cameron Reforms** (1833): Unified administration.
- Development of an English-educated elite class.

### 3.4 Resistance Movements
- **Great Rebellion of 1818** (Uva-Wellassa Uprising).
- **Matale Rebellion of 1848**: Protests against new taxes.
- Growth of Buddhist revivalism and temperance movements.`,
  },
  {
    title: "Independence Movement of Sri Lanka - Study Guide",
    topic: TOPICS[3],
    content: `# Independence Movement of Sri Lanka

## 1. Early Political Organizations
- **Ceylon National Congress** (1919): Founded by Sir Ponnambalam Arunachalam and F.R. Senanayake.
- **Temperance Movement**: Led by Buddhist leaders including **Anagarika Dharmapala**.
- **1915 Riots**: Led to harsh British crackdowns, fueling anti-colonial sentiment.

## 2. Constitutional Reforms
- **Manning Reforms** (1924): Increased elected members.
- **Donoughmore Commission** (1931): Introduced **universal adult suffrage** - Sri Lanka was the second country in Asia to achieve this.
- **Soulbury Commission** (1947): Recommended dominion status.

## 3. Key Leaders
- **D.S. Senanayake** (1884-1952): "Father of the Nation." First Prime Minister.
- **S.W.R.D. Bandaranaike**: Founded the Sri Lanka Freedom Party.
- **A.E. Goonesinha**: Labor leader who fought for workers' rights.

## 4. Independence Day - February 4, 1948
- Ceylon gained independence as a **Dominion** within the British Commonwealth.
- Power transferred peacefully.
- D.S. Senanayake became the first Prime Minister.

## 5. Challenges After Independence
- Ethnic tensions between Sinhalese and Tamil communities.
- Citizenship Act of 1948 disenfranchised Indian Tamil plantation workers.
- Sinhala Only Act of 1956.`,
  },
  {
    title: "Ancient Egypt and Mesopotamia - Complete Notes",
    topic: TOPICS[4],
    content: `# Ancient Egypt and Mesopotamia

## 1. Mesopotamia - The Cradle of Civilization
- Located between the **Tigris** and **Euphrates** rivers (modern-day Iraq).
- "Mesopotamia" means "land between the rivers."
- **Sumerians** (c. 4500-1900 BCE): Invented **cuneiform** writing, the wheel, the plow, and the sailboat.
- Built city-states: **Ur, Uruk, Eridu, Lagash**.
- **Ziggurat**: Stepped temple towers.
- **Hammurabi** (1792-1750 BCE): Created the **Code of Hammurabi** - 282 laws. "An eye for an eye."
- **Nebuchadnezzar II** built the **Hanging Gardens of Babylon**.
- **Assyrian Empire**: Known for military prowess. **Library of Ashurbanipal** at Nineveh.

## 2. Ancient Egypt
- Centered on the **Nile River**. Annual flooding enabled agriculture.
- "Gift of the Nile" - **Herodotus**.
- **King Narmer (Menes)** unified Upper and Lower Egypt around 3100 BCE.
- **Old Kingdom** (2686-2181 BCE): Great Pyramids of Giza, Great Sphinx.
- **Middle Kingdom** (2055-1650 BCE): Trade expansion and cultural flourishing.
- **New Kingdom** (1550-1070 BCE): Hatshepsut, Akhenaten, Tutankhamun, Ramesses II.
- **Achievements**: Hieroglyphics, papyrus, mummification, medicine, astronomy.
- **Rosetta Stone**: Key to deciphering hieroglyphics (discovered 1799).`,
  },
  {
    title: "Greek and Roman Civilizations - Study Notes",
    topic: TOPICS[5],
    content: `# Greek and Roman Civilizations

## 1. Ancient Greece
- **Athens**: Birthplace of democracy. **Pericles** led during Golden Age.
- **Sparta**: Military-focused. Rigorous training (agoge) from age 7.
- **Persian Wars** (499-449 BCE): Marathon, Thermopylae (300 Spartans), Salamis.
- **Philosophy**: Socrates, Plato, Aristotle.
- **Architecture**: Parthenon, Doric/Ionic/Corinthian columns.
- **Olympics**: Athletic competitions since 776 BCE.
- **Alexander the Great** (356-323 BCE): Conquered from Egypt to India. Spread Hellenistic culture.

## 2. Ancient Rome
- **Republic** (509-27 BCE): Senate, Tribunes, Twelve Tables.
- **Punic Wars** (264-146 BCE): Three wars against Carthage. Hannibal crossed Alps.
- **Julius Caesar**: Conquered Gaul, became dictator, assassinated on Ides of March.
- **Augustus**: First Emperor, began Pax Romana (200 years of peace).
- **Achievements**: Roads, aqueducts, Colosseum, concrete, legal systems.
- **Latin**: Evolved into Romance languages.
- **Fall of Rome** (476 CE): Military overextension, economic troubles, barbarian invasions.
- **Byzantine Empire** (Eastern) survived until 1453 CE.`,
  },
  {
    title: "World War I - Comprehensive Study Notes",
    topic: TOPICS[6],
    content: `# World War I (1914-1918)

## 1. Causes - M.A.I.N.
- **Militarism**: Arms race between European powers.
- **Alliances**: Triple Alliance (Germany, Austria-Hungary, Italy) vs Triple Entente (France, Russia, Britain).
- **Imperialism**: Competition for colonies.
- **Nationalism**: Pan-Slavism, "Powder Keg of Europe" (Balkans).

## 2. The Spark
- June 28, 1914: Archduke **Franz Ferdinand** assassinated in Sarajevo by **Gavrilo Princip**.
- Alliance system pulled in all major powers.

## 3. Major Features
- **Western Front**: Trench warfare from Belgium to Switzerland. Battles: Marne, Verdun, Somme.
- **New Technologies**: Machine guns, poison gas, tanks, aircraft, U-boats.
- **1917 - US Entry**: Provoked by submarine warfare and Zimmermann Telegram.
- **1917 - Russian Revolution**: Russia withdrew.

## 4. End of the War
- November 11, 1918: Armistice signed.

## 5. Treaty of Versailles (1919)
- **War Guilt Clause** (Article 231): Germany accepted full blame.
- **Reparations**: Germany ordered to pay massive damages.
- **Military restrictions**: Army limited to 100,000 troops.
- **League of Nations** established.
- Casualties: ~10 million military, ~7 million civilian deaths.`,
  },
  {
    title: "World War II - Complete Study Notes",
    topic: TOPICS[7],
    content: `# World War II (1939-1945)

## 1. Causes
- Treaty of Versailles resentment.
- Rise of **Hitler** (Germany), **Mussolini** (Italy), **Imperial Japan**.
- **Appeasement**: Munich Agreement (1938) allowed Germany to annex Sudetenland.
- September 1, 1939: Germany invaded Poland using **Blitzkrieg**.

## 2. Major Events in Europe
- Fall of France (1940), **Battle of Britain** (RAF vs Luftwaffe).
- **Operation Barbarossa** (1941): Germany invaded USSR.
- **Battle of Stalingrad** (1942-43): Soviet victory, major turning point.
- **D-Day** (June 6, 1944): Allied invasion of Normandy.
- V-E Day (May 8, 1945).

## 3. The Pacific Theater
- **Pearl Harbor** (Dec 7, 1941): US entered the war.
- **Battle of Midway** (1942): Pacific turning point.
- **Atomic bombs**: Hiroshima (Aug 6) and Nagasaki (Aug 9, 1945).
- V-J Day (August 15, 1945).

## 4. The Holocaust
- 6 million Jews murdered. Camps: Auschwitz, Treblinka, Dachau.
- **Nuremberg Trials**: Nazi leaders prosecuted.

## 5. Aftermath
- 70-85 million deaths. **United Nations** (1945).
- Europe divided: Western (democratic) and Eastern (communist) blocs.
- **Marshall Plan** and beginning of the Cold War.`,
  },
  {
    title: "Industrial Revolution - Comprehensive Study Notes",
    topic: TOPICS[8],
    content: `# The Industrial Revolution (c. 1760-1840)

## 1. Why Britain?
- Natural resources (coal, iron), colonial empire, agricultural revolution, political stability, capital.

## 2. Key Inventions
- **Textile**: Spinning Jenny (Hargreaves), Water Frame (Arkwright), Power Loom (Cartwright).
- **Steam Power**: James Watt improved the steam engine (1769).
- **Transportation**: Stephenson's Rocket (1829), railways, steamships.
- **Iron/Steel**: Abraham Darby (coke smelting), Bessemer Process (1856).

## 3. Social Impact
- **Urbanization**: Massive migration to cities. Overcrowded, unsanitary conditions.
- **Working Conditions**: 14-16 hour days, child labor (ages 5+), dangerous machinery.
- Rise of middle class and working class.

## 4. Reform Movements
- **Factory Acts** (1833, 1844, 1847): Limited child labor.
- **Trade Unions**: Workers organized for better conditions.
- **Karl Marx**: Communist Manifesto (1848).

## 5. Second Industrial Revolution (c. 1870-1914)
- Electricity (Edison, Tesla), automobiles (Benz, Ford), telephone (Bell).
- Assembly line mass production.`,
  },
  {
    title: "Cold War Era - Detailed Study Notes",
    topic: TOPICS[9],
    content: `# The Cold War Era (1947-1991)

## 1. Origins
- Geopolitical tension between **USA** (capitalism) and **USSR** (communism).
- "Cold" because no direct military conflict between superpowers.
- **Iron Curtain**: Churchill's 1946 speech described division of Europe.

## 2. Key Events
- **Truman Doctrine** (1947): Contain communism.
- **Marshall Plan** (1948): $13 billion to rebuild Western Europe.
- **Berlin Blockade/Airlift** (1948-49): USSR blocked West Berlin; allies airlifted supplies.
- **Korean War** (1950-53): Ended at 38th parallel.
- **Cuban Missile Crisis** (1962): Closest to nuclear war. Kennedy vs Khrushchev.
- **Vietnam War** (1955-75): US supported South Vietnam. Over 58,000 Americans killed.
- **Berlin Wall** (1961-1989): Built to prevent East Germans fleeing.

## 3. Arms Race and Space Race
- Nuclear weapons: MAD (Mutually Assured Destruction).
- SALT I (1972), SALT II (1979), INF Treaty (1987).
- **Sputnik** (1957), Gagarin (1961), Moon landing (1969).

## 4. End of the Cold War
- **Gorbachev**: Glasnost (openness), Perestroika (restructuring).
- Berlin Wall fell November 9, 1989.
- USSR dissolved December 25, 1991 into 15 republics.`,
  },
];

// ─── Admin notes (same topics, different content) ────────────────
const ADMIN_NOTES: { title: string; topic: string; content: string }[] = TOPICS.map((topic, i) => ({
  title: `${topic} - Admin Reference Material`,
  topic,
  content: `# ${topic} - Administrative Reference Material\n\nThis is the official reference material compiled by the administration for Grade 10 History students.\n\n## Overview\n${getAdminNoteContent(i)}\n\n## Study Tips\n- Review the key terms at the end of each section.\n- Create timeline charts for chronological events.\n- Practice MCQ questions from the quiz section.\n- Discuss important events with your study group.\n\n## Assessment Notes\nThis topic will be covered in both term tests and the final examination. Focus on:\n- Key dates and figures\n- Cause and effect relationships\n- Significance of major events\n- Comparison between different periods/civilizations`,
}));

function getAdminNoteContent(topicIndex: number): string {
  const contents = [
    "The ancient civilizations of Sri Lanka represent one of the oldest continuous civilizations in South Asia. Students should focus on the Anuradhapura period (377 BCE - 1017 CE), the introduction of Buddhism in 247 BCE by Arahat Mahinda, the development of the hydraulic civilization with advanced irrigation systems like Minneriya and Kalawewa tanks, and the cultural achievements including the construction of massive dagobas. Key rulers to remember: Pandukabhaya, Devanampiya Tissa, Dutugemunu, and Dhatusena.",
    "The medieval period saw the shift from Anuradhapura to Polonnaruwa following Chola invasions. King Vijayabahu I liberated the island in 1070 CE. The golden age under Parakramabahu I brought the construction of Parakrama Samudra and the Gal Vihara. After Polonnaruwa's decline, capitals drifted south through Dambadeniya, Gampola, and Kotte. The Kandyan Kingdom in the central highlands resisted colonial powers for over 300 years until the Kandyan Convention of 1815.",
    "Three European powers colonized Sri Lanka: Portuguese (1505-1658), Dutch (1658-1796), and British (1796-1948). The Portuguese introduced Catholicism and controlled cinnamon trade. The Dutch established Roman-Dutch Law and built the Galle Fort. The British unified the island, introduced plantation agriculture (coffee, then tea), built railways, and implemented the Colebrooke-Cameron Reforms of 1833. Major resistance movements include the 1818 Uva-Wellassa Uprising and the 1848 Matale Rebellion.",
    "Sri Lanka's path to independence was largely peaceful and constitutional. Key milestones include the formation of the Ceylon National Congress (1919), the Donoughmore Commission granting universal suffrage in 1931, and the Soulbury Commission of 1947. D.S. Senanayake, known as the Father of the Nation, became the first Prime Minister when Ceylon gained independence on February 4, 1948, as a Dominion within the British Commonwealth.",
    "Ancient Egypt flourished along the Nile River, unified by King Narmer around 3100 BCE. The civilization is divided into Old Kingdom (pyramids), Middle Kingdom (trade expansion), and New Kingdom (golden age). Mesopotamia, between the Tigris and Euphrates, gave rise to Sumerians (cuneiform, wheel), Babylonians (Code of Hammurabi), and Assyrians. Both civilizations made foundational contributions to writing, law, architecture, and governance.",
    "Greek civilization gave birth to democracy in Athens under Pericles, produced great philosophers (Socrates, Plato, Aristotle), and developed drama, architecture, and the Olympic Games. Alexander the Great spread Greek culture across a vast empire. Rome evolved from a republic with the Senate to an empire under Augustus, achieving the Pax Romana. Roman contributions include engineering (roads, aqueducts), law, and Latin language. The Western Roman Empire fell in 476 CE.",
    "World War I (1914-1918) was caused by militarism, alliances, imperialism, and nationalism (M.A.I.N.). The assassination of Archduke Franz Ferdinand sparked the conflict. It featured trench warfare on the Western Front and introduced new weapons (machine guns, poison gas, tanks). The US entered in 1917. The war ended with the Treaty of Versailles (1919), which imposed harsh terms on Germany including war guilt, reparations, and military restrictions.",
    "World War II (1939-1945) resulted from the Treaty of Versailles resentment, the rise of totalitarian regimes (Hitler, Mussolini), and the failure of appeasement. Key events include the Fall of France, Battle of Britain, Operation Barbarossa, D-Day, and the atomic bombings of Hiroshima and Nagasaki. The Holocaust saw 6 million Jews murdered. The war resulted in 70-85 million deaths and led to the formation of the United Nations and the beginning of the Cold War.",
    "The Industrial Revolution began in Britain around 1760 due to natural resources, colonial markets, and agricultural improvements. Key inventions include the spinning jenny, steam engine (James Watt), and power loom. Steam-powered transportation (railways, steamships) transformed trade. Social impacts included urbanization, poor working conditions, child labor, and the rise of the middle class. Reform movements led to Factory Acts and trade unions.",
    "The Cold War (1947-1991) was a geopolitical struggle between the capitalist US and communist USSR. Key events include the Truman Doctrine, Marshall Plan, Berlin Blockade, Korean War, Cuban Missile Crisis, and Vietnam War. The arms race and space race were defining features. Gorbachev's glasnost and perestroika reforms, the fall of the Berlin Wall (1989), and the dissolution of the USSR (1991) ended the Cold War era.",
  ];
  return contents[topicIndex] || "";
}

// ─── Quiz questions per topic (20 each) ─────────────────────────
const ALL_QUIZ_QUESTIONS: Record<string, { text: string; options: string[]; answer: string }[]> = {
  [TOPICS[0]]: [
    { text: "Who is considered the earliest known inhabitant of Sri Lanka?", options: ["Balangoda Man", "Vijaya", "Pandukabhaya", "Ravana"], answer: "Balangoda Man" },
    { text: "According to the Mahavamsa, when did Prince Vijaya arrive in Sri Lanka?", options: ["543 BCE", "247 BCE", "377 BCE", "1017 CE"], answer: "543 BCE" },
    { text: "Who established Anuradhapura as the capital?", options: ["Pandukabhaya", "Vijaya", "Dutugemunu", "Devanampiya Tissa"], answer: "Pandukabhaya" },
    { text: "Who brought Buddhism to Sri Lanka?", options: ["Arahat Mahinda", "Sanghamitta", "Emperor Ashoka", "Buddha"], answer: "Arahat Mahinda" },
    { text: "In what year was Buddhism introduced to Sri Lanka?", options: ["247 BCE", "543 BCE", "377 BCE", "161 BCE"], answer: "247 BCE" },
    { text: "What is the name of Sri Lanka's first dagoba?", options: ["Thuparamaya", "Ruwanwelisaya", "Jetavanaramaya", "Abhayagiri"], answer: "Thuparamaya" },
    { text: "The Sri Maha Bodhi was brought to Sri Lanka by whom?", options: ["Sanghamitta", "Arahat Mahinda", "Emperor Ashoka", "Vijaya"], answer: "Sanghamitta" },
    { text: "What is a bisokotuwa?", options: ["A water valve pit", "A type of dagoba", "A royal palace", "A Buddhist scripture"], answer: "A water valve pit" },
    { text: "Which king built the Ruwanwelisaya?", options: ["Dutugemunu", "Mahasena", "Dhatusena", "Valagamba"], answer: "Dutugemunu" },
    { text: "The Jetavanaramaya was built by which king?", options: ["Mahasena", "Dutugemunu", "Pandukabhaya", "Dhatusena"], answer: "Mahasena" },
    { text: "What does 'Mahavamsa' mean?", options: ["Great Chronicle", "Great Kingdom", "Great Temple", "Great Victory"], answer: "Great Chronicle" },
    { text: "Which king built the Kalawewa tank?", options: ["Dhatusena", "Dutugemunu", "Mahasena", "Valagamba"], answer: "Dhatusena" },
    { text: "The Anuradhapura Kingdom lasted approximately how many years?", options: ["About 1400 years", "About 500 years", "About 200 years", "About 800 years"], answer: "About 1400 years" },
    { text: "Which dynasty destroyed Anuradhapura in 993 CE?", options: ["Chola dynasty", "Pandya dynasty", "Pallava dynasty", "Mughal dynasty"], answer: "Chola dynasty" },
    { text: "The Sigiriya frescoes are examples of ancient Sri Lankan:", options: ["Art", "Architecture", "Engineering", "Literature"], answer: "Art" },
    { text: "What cave has evidence of the earliest Sri Lankan inhabitants?", options: ["Fa Hien Cave", "Dambulla Cave", "Sigiriya Cave", "Ravana Cave"], answer: "Fa Hien Cave" },
    { text: "Valagamba built which famous monastery?", options: ["Abhayagiri Monastery", "Thuparamaya", "Jetavanaramaya", "Isurumuniya"], answer: "Abhayagiri Monastery" },
    { text: "King Devanampiya Tissa was the ruler during which significant event?", options: ["Introduction of Buddhism", "Building of Sigiriya", "Chola invasion", "Portuguese arrival"], answer: "Introduction of Buddhism" },
    { text: "The Dipavamsa is a:", options: ["Historical chronicle", "Religious text", "Legal code", "Medical manual"], answer: "Historical chronicle" },
    { text: "What is a wewa in ancient Sri Lanka?", options: ["Irrigation reservoir", "Buddhist temple", "Royal court", "Trade route"], answer: "Irrigation reservoir" },
  ],
  [TOPICS[1]]: [
    { text: "Who liberated Sri Lanka from Chola rule?", options: ["Vijayabahu I", "Parakramabahu I", "Nissanka Malla", "Kalinga Magha"], answer: "Vijayabahu I" },
    { text: "In what year was Sri Lanka liberated from Chola rule?", options: ["1070 CE", "1017 CE", "1153 CE", "1215 CE"], answer: "1070 CE" },
    { text: "Who is known as Parakramabahu the Great?", options: ["Parakramabahu I", "Parakramabahu II", "Vijayabahu I", "Parakramabahu VI"], answer: "Parakramabahu I" },
    { text: "The Gal Vihara features how many Buddha statues?", options: ["Four", "Three", "Two", "Five"], answer: "Four" },
    { text: "What material were the Gal Vihara statues carved from?", options: ["Granite rock", "Marble", "Limestone", "Sandstone"], answer: "Granite rock" },
    { text: "Who invaded Polonnaruwa in 1215 CE?", options: ["Kalinga Magha", "Chola forces", "Portuguese", "Dutch"], answer: "Kalinga Magha" },
    { text: "After Polonnaruwa, the capital moved to:", options: ["Dambadeniya", "Kandy", "Kotte", "Gampola"], answer: "Dambadeniya" },
    { text: "Who was the last king to unite the entire island?", options: ["Parakramabahu VI", "Parakramabahu I", "Vijayabahu I", "Sri Vikrama Rajasinha"], answer: "Parakramabahu VI" },
    { text: "The Kandyan Kingdom was established in:", options: ["Central highlands", "Coastal lowlands", "Northern peninsula", "Eastern plains"], answer: "Central highlands" },
    { text: "Who was the last king of the Kandyan Kingdom?", options: ["Sri Vikrama Rajasinha", "Vimaladharmasuriya I", "Rajadhi Rajasinha", "Keerthi Sri Rajasinha"], answer: "Sri Vikrama Rajasinha" },
    { text: "The Kandyan Convention was signed in:", options: ["1815", "1796", "1658", "1505"], answer: "1815" },
    { text: "The Temple of the Tooth is located in:", options: ["Kandy", "Colombo", "Anuradhapura", "Polonnaruwa"], answer: "Kandy" },
    { text: "Who moved the Tooth Relic to Kandy?", options: ["Vimaladharmasuriya I", "Sri Vikrama Rajasinha", "Parakramabahu I", "Vijayabahu I"], answer: "Vimaladharmasuriya I" },
    { text: "The Parakrama Samudra is a:", options: ["Massive reservoir", "Buddhist temple", "Palace complex", "Military fortress"], answer: "Massive reservoir" },
    { text: "The Vatadage in Polonnaruwa is a:", options: ["Circular relic house", "Rectangular image house", "Monastery", "Royal palace"], answer: "Circular relic house" },
    { text: "The Rankoth Vehera is the largest what in Polonnaruwa?", options: ["Dagoba", "Image house", "Monastery", "Palace"], answer: "Dagoba" },
    { text: "The Gampola Kingdom existed during which centuries?", options: ["14th-15th century", "12th-13th century", "16th-17th century", "10th-11th century"], answer: "14th-15th century" },
    { text: "The Dambadeniya Kingdom was founded by:", options: ["Vijayabahu III", "Parakramabahu I", "Bhuvanekabahu I", "Nissanka Malla"], answer: "Vijayabahu III" },
    { text: "The Kandyan Kingdom resisted colonizers for:", options: ["Over 300 years", "About 100 years", "About 50 years", "Over 500 years"], answer: "Over 300 years" },
    { text: "Parakramabahu I's famous quote is about:", options: ["Water conservation", "Military power", "Religious devotion", "Trade expansion"], answer: "Water conservation" },
  ],
  [TOPICS[2]]: [
    { text: "When did the Portuguese first arrive in Sri Lanka?", options: ["1505", "1498", "1602", "1658"], answer: "1505" },
    { text: "Who was the Portuguese explorer that first arrived?", options: ["Lourenco de Almeida", "Vasco da Gama", "Pedro Cabral", "Magellan"], answer: "Lourenco de Almeida" },
    { text: "What was the primary Portuguese interest in Sri Lanka?", options: ["Cinnamon trade", "Gold mining", "Silk production", "Diamond mining"], answer: "Cinnamon trade" },
    { text: "The Dutch allied with whom to expel the Portuguese?", options: ["Kandyan Kingdom", "Mughal Empire", "British Empire", "French"], answer: "Kandyan Kingdom" },
    { text: "In what year did the Dutch take control?", options: ["1658", "1505", "1796", "1602"], answer: "1658" },
    { text: "Roman-Dutch Law was introduced by which colonial power?", options: ["Dutch", "Portuguese", "British", "French"], answer: "Dutch" },
    { text: "The Galle Fort was primarily built by:", options: ["Dutch", "Portuguese", "British", "Kandyans"], answer: "Dutch" },
    { text: "When did the British take over from the Dutch?", options: ["1796", "1815", "1802", "1658"], answer: "1796" },
    { text: "Sri Lanka became a British Crown Colony in:", options: ["1802", "1796", "1815", "1833"], answer: "1802" },
    { text: "The Colebrooke-Cameron Reforms were introduced in:", options: ["1833", "1815", "1848", "1802"], answer: "1833" },
    { text: "After the coffee blight of 1869, Sri Lanka shifted to:", options: ["Tea", "Rubber", "Rice", "Sugarcane"], answer: "Tea" },
    { text: "The Great Rebellion of 1818 is also known as:", options: ["Uva-Wellassa Uprising", "Matale Rebellion", "Kandy Uprising", "Colombo Rebellion"], answer: "Uva-Wellassa Uprising" },
    { text: "Tamil laborers were brought for:", options: ["Plantation work", "Military service", "Administrative roles", "Construction"], answer: "Plantation work" },
    { text: "What forced labor system did the Portuguese impose?", options: ["Rajakariya", "Corvee", "Encomienda", "Slavery"], answer: "Rajakariya" },
    { text: "The Kandyan Convention ceded the kingdom to:", options: ["The British", "The Dutch", "The Portuguese", "The French"], answer: "The British" },
    { text: "The Matale Rebellion occurred in:", options: ["1848", "1818", "1833", "1815"], answer: "1848" },
    { text: "The Treaty of Amiens established Sri Lanka as a:", options: ["Crown Colony", "Protectorate", "Dominion", "Free state"], answer: "Crown Colony" },
    { text: "VOC stands for:", options: ["Dutch East India Company", "Portuguese Trade Union", "British Colonial Office", "French Trading Company"], answer: "Dutch East India Company" },
    { text: "What infrastructure did the British build?", options: ["Railways and roads", "Airports", "Universities", "Hospitals only"], answer: "Railways and roads" },
    { text: "Which religion did the Portuguese spread?", options: ["Catholicism", "Protestantism", "Buddhism", "Hinduism"], answer: "Catholicism" },
  ],
  [TOPICS[3]]: [
    { text: "When was the Ceylon National Congress founded?", options: ["1919", "1931", "1948", "1905"], answer: "1919" },
    { text: "Who is the 'Father of the Nation' of Sri Lanka?", options: ["D.S. Senanayake", "S.W.R.D. Bandaranaike", "Arunachalam", "Dharmapala"], answer: "D.S. Senanayake" },
    { text: "When did Ceylon gain independence?", options: ["February 4, 1948", "January 26, 1950", "August 15, 1947", "July 4, 1948"], answer: "February 4, 1948" },
    { text: "The Donoughmore Commission introduced:", options: ["Universal adult suffrage", "Provincial councils", "Presidential system", "Federal system"], answer: "Universal adult suffrage" },
    { text: "In what year was universal suffrage introduced?", options: ["1931", "1948", "1919", "1947"], answer: "1931" },
    { text: "The Soulbury Constitution was drafted in:", options: ["1947", "1948", "1931", "1919"], answer: "1947" },
    { text: "Ceylon gained independence as a:", options: ["Dominion", "Republic", "Kingdom", "Free state"], answer: "Dominion" },
    { text: "The 1915 riots were between:", options: ["Muslims and Buddhists", "Tamils and Sinhalese", "British and locals", "Hindus and Christians"], answer: "Muslims and Buddhists" },
    { text: "Anagarika Dharmapala was associated with:", options: ["Buddhist revivalism", "Tamil nationalism", "Communist movement", "Labor movement"], answer: "Buddhist revivalism" },
    { text: "The Manning Reforms were introduced in:", options: ["1924", "1919", "1931", "1833"], answer: "1924" },
    { text: "S.W.R.D. Bandaranaike founded which party?", options: ["Sri Lanka Freedom Party", "United National Party", "Tamil Congress", "Communist Party"], answer: "Sri Lanka Freedom Party" },
    { text: "The Soulbury Constitution established:", options: ["Parliamentary system", "Presidential system", "Federal system", "Monarchy"], answer: "Parliamentary system" },
    { text: "A.E. Goonesinha was primarily a:", options: ["Labor leader", "Military commander", "Religious leader", "Diplomat"], answer: "Labor leader" },
    { text: "The Citizenship Act of 1948 affected:", options: ["Indian Tamil workers", "Sinhalese farmers", "Muslim traders", "British settlers"], answer: "Indian Tamil workers" },
    { text: "The Sinhala Only Act was passed in:", options: ["1956", "1948", "1972", "1931"], answer: "1956" },
    { text: "The Donoughmore Commission replaced the Legislative Council with:", options: ["State Council", "Parliament", "Senate", "People's Assembly"], answer: "State Council" },
    { text: "Ceylon was the ___ country in Asia to achieve universal suffrage.", options: ["Second", "First", "Third", "Fourth"], answer: "Second" },
    { text: "D.S. Senanayake focused on:", options: ["Agricultural development", "Military expansion", "Industrial revolution", "Space technology"], answer: "Agricultural development" },
    { text: "Who represented the British Crown at independence?", options: ["Duke of Gloucester", "King George VI", "Queen Elizabeth", "Prince Philip"], answer: "Duke of Gloucester" },
    { text: "Independence was achieved through:", options: ["Peaceful means", "Armed revolution", "Military coup", "Foreign intervention"], answer: "Peaceful means" },
  ],
  [TOPICS[4]]: [
    { text: "Where was Mesopotamia located?", options: ["Between Tigris and Euphrates", "Along the Nile", "Near the Indus", "Along the Yellow River"], answer: "Between Tigris and Euphrates" },
    { text: "What does 'Mesopotamia' mean?", options: ["Land between the rivers", "Land of the pharaohs", "Fertile valley", "Desert kingdom"], answer: "Land between the rivers" },
    { text: "The Sumerians invented which writing system?", options: ["Cuneiform", "Hieroglyphics", "Alphabetic script", "Pictographs"], answer: "Cuneiform" },
    { text: "Who created the Code of Hammurabi?", options: ["Hammurabi", "Gilgamesh", "Sargon", "Nebuchadnezzar"], answer: "Hammurabi" },
    { text: "The Code of Hammurabi contained how many laws?", options: ["282", "100", "500", "50"], answer: "282" },
    { text: "What is a ziggurat?", options: ["Stepped temple tower", "Egyptian pyramid", "Roman colosseum", "Greek temple"], answer: "Stepped temple tower" },
    { text: "Egyptian civilization was centered on which river?", options: ["Nile River", "Tigris River", "Euphrates River", "Indus River"], answer: "Nile River" },
    { text: "Who unified Upper and Lower Egypt?", options: ["King Narmer", "Khufu", "Ramesses II", "Tutankhamun"], answer: "King Narmer" },
    { text: "The Great Pyramids are located at:", options: ["Giza", "Luxor", "Cairo", "Alexandria"], answer: "Giza" },
    { text: "What was Hatshepsut known for?", options: ["Being a female pharaoh", "Building the largest pyramid", "Military conquests", "Inventing hieroglyphics"], answer: "Being a female pharaoh" },
    { text: "Akhenaten introduced worship of:", options: ["Aten", "Ra", "Osiris", "Anubis"], answer: "Aten" },
    { text: "When was Tutankhamun's tomb discovered?", options: ["1922", "1899", "1945", "1850"], answer: "1922" },
    { text: "The Rosetta Stone helped decipher:", options: ["Hieroglyphics", "Cuneiform", "Sanskrit", "Latin"], answer: "Hieroglyphics" },
    { text: "Papyrus was made from:", options: ["Nile reeds", "Tree bark", "Animal skin", "Cotton"], answer: "Nile reeds" },
    { text: "The Hanging Gardens were built by:", options: ["Nebuchadnezzar II", "Hammurabi", "Sargon", "Alexander"], answer: "Nebuchadnezzar II" },
    { text: "The Library of Ashurbanipal was in:", options: ["Nineveh", "Babylon", "Ur", "Memphis"], answer: "Nineveh" },
    { text: "Which pharaoh signed the first peace treaty?", options: ["Ramesses II", "Khufu", "Akhenaten", "Hatshepsut"], answer: "Ramesses II" },
    { text: "The Sumerians used which number base?", options: ["Base-60", "Base-10", "Base-12", "Base-20"], answer: "Base-60" },
    { text: "Who called Egypt the 'Gift of the Nile'?", options: ["Herodotus", "Plato", "Aristotle", "Homer"], answer: "Herodotus" },
    { text: "Mummification was practiced for:", options: ["Preserving the dead", "Medical research", "Religious punishment", "Trade purposes"], answer: "Preserving the dead" },
  ],
  [TOPICS[5]]: [
    { text: "Where was democracy born?", options: ["Athens", "Sparta", "Rome", "Corinth"], answer: "Athens" },
    { text: "Who led Athens during its Golden Age?", options: ["Pericles", "Alexander", "Socrates", "Leonidas"], answer: "Pericles" },
    { text: "Sparta was known for its focus on:", options: ["Military training", "Philosophy", "Trade", "Art"], answer: "Military training" },
    { text: "The Battle of Marathon was fought between:", options: ["Athens and Persia", "Sparta and Athens", "Rome and Carthage", "Greece and Egypt"], answer: "Athens and Persia" },
    { text: "How many Spartans fought at Thermopylae?", options: ["300", "500", "1000", "100"], answer: "300" },
    { text: "Who was NOT a Greek philosopher?", options: ["Cicero", "Socrates", "Plato", "Aristotle"], answer: "Cicero" },
    { text: "Alexander the Great was king of:", options: ["Macedonia", "Athens", "Sparta", "Thebes"], answer: "Macedonia" },
    { text: "The Parthenon is an example of Greek:", options: ["Architecture", "Literature", "Music", "Mathematics"], answer: "Architecture" },
    { text: "The Olympic Games began in:", options: ["776 BCE", "490 BCE", "323 BCE", "146 BCE"], answer: "776 BCE" },
    { text: "Alexander the Great founded:", options: ["Alexandria", "Athens", "Antioch", "Sparta"], answer: "Alexandria" },
    { text: "The Roman Republic was governed by:", options: ["The Senate", "A single king", "The army", "Priests"], answer: "The Senate" },
    { text: "The Twelve Tables were:", options: ["First written Roman laws", "Military strategies", "Trade agreements", "Religious texts"], answer: "First written Roman laws" },
    { text: "Hannibal crossed the Alps with:", options: ["Elephants", "Horses only", "Chariots", "Ships"], answer: "Elephants" },
    { text: "Julius Caesar was assassinated on:", options: ["Ides of March", "Ides of June", "New Year's Day", "Winter solstice"], answer: "Ides of March" },
    { text: "The first Roman Emperor was:", options: ["Augustus", "Julius Caesar", "Nero", "Caligula"], answer: "Augustus" },
    { text: "Pax Romana lasted approximately:", options: ["200 years", "50 years", "500 years", "100 years"], answer: "200 years" },
    { text: "Latin evolved into:", options: ["Romance languages", "Germanic languages", "Slavic languages", "Celtic languages"], answer: "Romance languages" },
    { text: "The Western Roman Empire fell in:", options: ["476 CE", "1453 CE", "300 CE", "100 CE"], answer: "476 CE" },
    { text: "The Punic Wars were between Rome and:", options: ["Carthage", "Greece", "Egypt", "Persia"], answer: "Carthage" },
    { text: "The Eastern Roman Empire is also known as:", options: ["Byzantine Empire", "Ottoman Empire", "Holy Roman Empire", "Frankish Empire"], answer: "Byzantine Empire" },
  ],
  [TOPICS[6]]: [
    { text: "What does M.A.I.N. stand for?", options: ["Militarism, Alliances, Imperialism, Nationalism", "Military, Arms, Industry, Navy", "Monarchy, Aggression, Invasion, Nationalism", "Money, Arms, Intelligence, Navy"], answer: "Militarism, Alliances, Imperialism, Nationalism" },
    { text: "Who was assassinated to spark WWI?", options: ["Archduke Franz Ferdinand", "Kaiser Wilhelm II", "Tsar Nicholas II", "King George V"], answer: "Archduke Franz Ferdinand" },
    { text: "The assassination took place in:", options: ["Sarajevo", "Vienna", "Berlin", "Belgrade"], answer: "Sarajevo" },
    { text: "The Triple Alliance included Germany, Austria-Hungary, and:", options: ["Italy", "France", "Russia", "Britain"], answer: "Italy" },
    { text: "The Triple Entente included France, Russia, and:", options: ["Britain", "Italy", "USA", "Japan"], answer: "Britain" },
    { text: "Trench warfare was characteristic of:", options: ["Western Front", "Eastern Front", "Pacific Front", "African Front"], answer: "Western Front" },
    { text: "Tanks were first used at:", options: ["Battle of the Somme", "Battle of Verdun", "Battle of Marne", "Battle of Gallipoli"], answer: "Battle of the Somme" },
    { text: "What provoked US entry into WWI?", options: ["Submarine warfare and Zimmermann Telegram", "Attack on US soil", "Alliance with France", "Economic interests"], answer: "Submarine warfare and Zimmermann Telegram" },
    { text: "The Russian Revolution caused Russia to:", options: ["Withdraw from the war", "Increase attacks", "Switch sides", "Invade Germany"], answer: "Withdraw from the war" },
    { text: "The armistice was signed on:", options: ["November 11, 1918", "November 11, 1917", "June 28, 1919", "August 15, 1918"], answer: "November 11, 1918" },
    { text: "Article 231 is known as:", options: ["War Guilt Clause", "Peace Clause", "Alliance Clause", "Trade Clause"], answer: "War Guilt Clause" },
    { text: "The League of Nations was established to:", options: ["Maintain world peace", "Punish Germany", "Expand British Empire", "Control trade"], answer: "Maintain world peace" },
    { text: "The Balkans were called:", options: ["Powder Keg of Europe", "Heart of Europe", "Crossroads of Civilization", "Shield of Europe"], answer: "Powder Keg of Europe" },
    { text: "Which weapon caused horrific trench casualties?", options: ["Poison gas", "Swords", "Cavalry", "Catapults"], answer: "Poison gas" },
    { text: "Germany's navy used which weapon extensively?", options: ["U-boats", "Aircraft carriers", "Battleships only", "Torpedo boats"], answer: "U-boats" },
    { text: "Approximately how many military died in WWI?", options: ["10 million", "1 million", "50 million", "100 million"], answer: "10 million" },
    { text: "The Treaty limited Germany's army to:", options: ["100,000 troops", "500,000 troops", "1 million troops", "50,000 troops"], answer: "100,000 troops" },
    { text: "Which country did NOT join the League of Nations?", options: ["United States", "Britain", "France", "Italy"], answer: "United States" },
    { text: "The Battle of Verdun was between:", options: ["France and Germany", "Britain and Germany", "Russia and Germany", "USA and Germany"], answer: "France and Germany" },
    { text: "WWI was also known as:", options: ["The Great War", "The People's War", "The Colonial War", "The Revolution War"], answer: "The Great War" },
  ],
  [TOPICS[7]]: [
    { text: "When did World War II begin?", options: ["September 1, 1939", "September 1, 1941", "December 7, 1941", "June 6, 1944"], answer: "September 1, 1939" },
    { text: "What tactic did Germany use to invade Poland?", options: ["Blitzkrieg", "Trench warfare", "Guerrilla warfare", "Naval blockade"], answer: "Blitzkrieg" },
    { text: "The Munich Agreement allowed Germany to annex:", options: ["Sudetenland", "Poland", "Austria", "France"], answer: "Sudetenland" },
    { text: "Who said 'peace for our time'?", options: ["Neville Chamberlain", "Winston Churchill", "Franklin Roosevelt", "Charles de Gaulle"], answer: "Neville Chamberlain" },
    { text: "The Battle of Stalingrad was won by:", options: ["Soviet Union", "Germany", "Britain", "United States"], answer: "Soviet Union" },
    { text: "D-Day occurred on:", options: ["June 6, 1944", "June 6, 1943", "December 7, 1941", "May 8, 1945"], answer: "June 6, 1944" },
    { text: "Pearl Harbor was attacked on:", options: ["December 7, 1941", "September 1, 1939", "June 6, 1944", "August 6, 1945"], answer: "December 7, 1941" },
    { text: "Hiroshima was bombed on:", options: ["August 6, 1945", "August 9, 1945", "May 8, 1945", "September 2, 1945"], answer: "August 6, 1945" },
    { text: "V-E Day was:", options: ["May 8, 1945", "August 15, 1945", "September 2, 1945", "June 6, 1944"], answer: "May 8, 1945" },
    { text: "How many Jews were murdered in the Holocaust?", options: ["6 million", "1 million", "10 million", "3 million"], answer: "6 million" },
    { text: "Which was NOT a concentration camp?", options: ["Bastogne", "Auschwitz", "Treblinka", "Dachau"], answer: "Bastogne" },
    { text: "Operation Barbarossa was the invasion of:", options: ["Soviet Union", "France", "Poland", "Britain"], answer: "Soviet Union" },
    { text: "The Battle of Midway was a turning point in:", options: ["The Pacific Theater", "The European Theater", "The African Campaign", "The Eastern Front"], answer: "The Pacific Theater" },
    { text: "Who ordered the use of atomic bombs?", options: ["Harry Truman", "Franklin Roosevelt", "Dwight Eisenhower", "Douglas MacArthur"], answer: "Harry Truman" },
    { text: "The Nuremberg Trials prosecuted:", options: ["Nazi war criminals", "Japanese generals", "Italian fascists", "Soviet spies"], answer: "Nazi war criminals" },
    { text: "Estimated total deaths in WWII:", options: ["70-85 million", "10-20 million", "30-40 million", "100-120 million"], answer: "70-85 million" },
    { text: "The United Nations was established in:", options: ["1945", "1919", "1948", "1939"], answer: "1945" },
    { text: "The Marshall Plan provided:", options: ["Economic aid to rebuild Europe", "Military weapons", "Food to Africa", "Loans to Japan"], answer: "Economic aid to rebuild Europe" },
    { text: "Hitler committed suicide on:", options: ["April 30, 1945", "May 8, 1945", "March 15, 1945", "January 30, 1945"], answer: "April 30, 1945" },
    { text: "The Battle of Britain was fought in:", options: ["The air", "On the ground", "At sea", "In trenches"], answer: "The air" },
  ],
  [TOPICS[8]]: [
    { text: "The Industrial Revolution began in:", options: ["Britain", "France", "Germany", "United States"], answer: "Britain" },
    { text: "When did it approximately begin?", options: ["1760", "1800", "1700", "1850"], answer: "1760" },
    { text: "Who improved the steam engine?", options: ["James Watt", "Thomas Edison", "James Hargreaves", "George Stephenson"], answer: "James Watt" },
    { text: "The Spinning Jenny was invented by:", options: ["James Hargreaves", "Richard Arkwright", "Samuel Crompton", "Edmund Cartwright"], answer: "James Hargreaves" },
    { text: "George Stephenson is famous for:", options: ["The steam locomotive", "The spinning mule", "The power loom", "The cotton gin"], answer: "The steam locomotive" },
    { text: "The Bessemer Process produced:", options: ["Steel", "Cotton", "Coal", "Glass"], answer: "Steel" },
    { text: "Which was NOT a reason Britain led?", options: ["Tropical climate", "Natural resources", "Colonial empire", "Political stability"], answer: "Tropical climate" },
    { text: "What was the Enclosure Movement?", options: ["Consolidation of farms into private land", "Building of city walls", "Closing of factories", "Restricting trade"], answer: "Consolidation of farms into private land" },
    { text: "Child labor involved children as young as:", options: ["5 years old", "10 years old", "12 years old", "8 years old"], answer: "5 years old" },
    { text: "The Factory Acts aimed to:", options: ["Limit child labor and working hours", "Increase production", "Close factories", "Lower wages"], answer: "Limit child labor and working hours" },
    { text: "Karl Marx co-authored:", options: ["The Communist Manifesto", "The Wealth of Nations", "The Social Contract", "On Liberty"], answer: "The Communist Manifesto" },
    { text: "The first public railway connected:", options: ["Stockton and Darlington", "London and Birmingham", "Liverpool and Manchester", "Edinburgh and Glasgow"], answer: "Stockton and Darlington" },
    { text: "Thomas Edison invented:", options: ["The light bulb", "The steam engine", "The telephone", "The power loom"], answer: "The light bulb" },
    { text: "Alexander Graham Bell invented:", options: ["The telephone", "The telegraph", "The radio", "The light bulb"], answer: "The telephone" },
    { text: "Henry Ford is known for:", options: ["Assembly line production", "Inventing the automobile", "Building railways", "Steam improvements"], answer: "Assembly line production" },
    { text: "Urbanization means:", options: ["People moving to cities", "Cities being destroyed", "Farming improvements", "Rural development"], answer: "People moving to cities" },
    { text: "The Chartist Movement demanded:", options: ["Universal male suffrage", "Child labor", "Longer hours", "Lower taxes"], answer: "Universal male suffrage" },
    { text: "Abraham Darby's contribution was:", options: ["Smelting iron with coke", "The steam engine", "The first railway", "The spinning jenny"], answer: "Smelting iron with coke" },
    { text: "The cotton gin was invented by:", options: ["Eli Whitney", "James Watt", "Richard Arkwright", "Edmund Cartwright"], answer: "Eli Whitney" },
    { text: "The Second Industrial Revolution began around:", options: ["1870", "1760", "1900", "1800"], answer: "1870" },
  ],
  [TOPICS[9]]: [
    { text: "The Cold War was between:", options: ["USA and USSR", "USA and China", "Britain and USSR", "France and USA"], answer: "USA and USSR" },
    { text: "Why was it called the 'Cold War'?", options: ["No direct military conflict", "Fought in cold regions", "Involved cold weapons", "It was short-lived"], answer: "No direct military conflict" },
    { text: "The Truman Doctrine aimed to:", options: ["Contain communism", "Spread communism", "End capitalism", "Isolate America"], answer: "Contain communism" },
    { text: "The Marshall Plan provided approximately:", options: ["$13 billion", "$1 billion", "$50 billion", "$5 billion"], answer: "$13 billion" },
    { text: "The Berlin Wall was built in:", options: ["1961", "1945", "1989", "1947"], answer: "1961" },
    { text: "The Berlin Wall fell in:", options: ["1989", "1991", "1985", "1961"], answer: "1989" },
    { text: "The Cuban Missile Crisis occurred in:", options: ["1962", "1950", "1975", "1989"], answer: "1962" },
    { text: "Which war ended at the 38th parallel?", options: ["Korean War", "Vietnam War", "Gulf War", "Falklands War"], answer: "Korean War" },
    { text: "Sputnik was the first:", options: ["Artificial satellite", "Human in space", "Moon landing", "Space station"], answer: "Artificial satellite" },
    { text: "Who was the first human in space?", options: ["Yuri Gagarin", "Neil Armstrong", "John Glenn", "Buzz Aldrin"], answer: "Yuri Gagarin" },
    { text: "Neil Armstrong landed on the Moon in:", options: ["1969", "1961", "1972", "1957"], answer: "1969" },
    { text: "MAD stands for:", options: ["Mutually Assured Destruction", "Military Arms Defense", "Massive Atomic Deployment", "Multiple Alliance Defense"], answer: "Mutually Assured Destruction" },
    { text: "Glasnost means:", options: ["Openness", "Restructuring", "Revolution", "Democracy"], answer: "Openness" },
    { text: "Perestroika means:", options: ["Restructuring", "Openness", "Freedom", "Revolution"], answer: "Restructuring" },
    { text: "The USSR officially dissolved in:", options: ["1991", "1989", "1985", "1945"], answer: "1991" },
    { text: "The Soviet leader during dissolution was:", options: ["Mikhail Gorbachev", "Leonid Brezhnev", "Nikita Khrushchev", "Joseph Stalin"], answer: "Mikhail Gorbachev" },
    { text: "The Vietnam War ended in:", options: ["1975", "1968", "1980", "1973"], answer: "1975" },
    { text: "The Iron Curtain speech was given by:", options: ["Winston Churchill", "Harry Truman", "Joseph Stalin", "Eisenhower"], answer: "Winston Churchill" },
    { text: "NATO was formed to:", options: ["Defend against Soviet expansion", "Promote trade", "Spread communism", "Colonize Africa"], answer: "Defend against Soviet expansion" },
    { text: "How many republics formed from the USSR?", options: ["15", "10", "20", "12"], answer: "15" },
  ],
};

// ─── Short note content helpers ──────────────────────────────────
function getTeacherShortNote(i: number): string {
  const notes = [
    "Key Points: Ancient Sri Lanka\n- Balangoda Man - earliest inhabitants (~34,000 BCE)\n- Prince Vijaya - arrived 543 BCE, founded first kingdom\n- Anuradhapura Kingdom (377 BCE-1017 CE) - longest-ruling capital\n- Buddhism introduced 247 BCE by Arahat Mahinda\n- Sri Maha Bodhi - oldest historically documented tree\n- Hydraulic civilization - Minneriya, Kalawewa tanks\n- Key rulers: Pandukabhaya, Devanampiya Tissa, Dutugemunu, Dhatusena\n- Ruwanwelisaya, Jetavanaramaya - iconic dagobas\n- Decline: Chola invasions, fall in 993 CE",
    "Key Points: Medieval Sri Lanka\n- Polonnaruwa Kingdom (1017-1232 CE)\n- Vijayabahu I freed Sri Lanka from Cholas (1070 CE)\n- Parakramabahu I - Golden Age ruler\n- Gal Vihara - 4 Buddha statues from single rock\n- Parakrama Samudra - massive reservoir\n- After Polonnaruwa: Dambadeniya, Gampola, Kotte, Kandy\n- Kandyan Kingdom - resisted colonizers 300+ years\n- Last king: Sri Vikrama Rajasinha\n- Kandyan Convention 1815 - ceded to British",
    "Key Points: Colonial Era\n- Portuguese (1505-1658): Cinnamon trade, Catholicism\n- Dutch (1658-1796): Roman-Dutch Law, Galle Fort, VOC\n- British (1796-1948): Crown Colony (1802), tea plantations\n- Kandyan Convention 1815 unified island under British rule\n- Colebrooke-Cameron Reforms 1833 - modernized administration\n- Coffee to Tea shift after 1869 blight\n- Tamil plantation workers brought from South India\n- Key uprisings: 1818 Uva-Wellassa, 1848 Matale",
    "Key Points: Independence Movement\n- Ceylon National Congress founded 1919\n- Anagarika Dharmapala - Buddhist revivalism\n- 1915 Riots - fueled anti-colonial sentiment\n- Donoughmore Commission 1931 - universal suffrage\n- Soulbury Commission 1947 - independence constitution\n- Independence: February 4, 1948 as Dominion\n- D.S. Senanayake - Father of the Nation\n- Peaceful transition, no armed struggle\n- Challenges: ethnic tensions, language policies",
    "Key Points: Egypt and Mesopotamia\n- Mesopotamia = land between rivers (Tigris and Euphrates)\n- Sumerians: cuneiform, wheel, base-60 math\n- Hammurabi's Code - 282 laws, eye for an eye\n- Egypt: Nile River, pharaohs, pyramids\n- King Narmer unified Egypt ~3100 BCE\n- Old Kingdom = pyramids; New Kingdom = golden age\n- Hatshepsut, Akhenaten, Tutankhamun, Ramesses II\n- Hieroglyphics decoded via Rosetta Stone (1799)\n- Both civilizations: writing, law, architecture foundations",
    "Key Points: Greece and Rome\n- Athens = democracy, Pericles' Golden Age\n- Sparta = military focus, agoge training\n- Persian Wars: Marathon, Thermopylae, Salamis\n- Philosophers: Socrates, Plato, Aristotle\n- Alexander the Great spread Hellenistic culture\n- Roman Republic: Senate, Twelve Tables\n- Punic Wars vs Carthage (Hannibal)\n- Augustus = first emperor, Pax Romana\n- Roman legacy: law, roads, Latin to Romance languages\n- Western Rome fell 476 CE; Byzantine survived to 1453",
    "Key Points: World War I\n- Causes: M.A.I.N. (Militarism, Alliances, Imperialism, Nationalism)\n- Spark: Assassination of Franz Ferdinand (1914)\n- Triple Alliance vs Triple Entente\n- Western Front = trench warfare\n- New weapons: machine guns, poison gas, tanks, U-boats\n- US entered 1917; Russia withdrew 1917\n- Armistice: November 11, 1918\n- Treaty of Versailles: War Guilt, reparations, military limits\n- ~10 million military deaths",
    "Key Points: World War II\n- Causes: Versailles resentment, totalitarianism, appeasement\n- Started Sept 1, 1939 - Germany invaded Poland (Blitzkrieg)\n- Key battles: Stalingrad, El Alamein, D-Day (June 6, 1944)\n- Holocaust: 6 million Jews murdered\n- Pearl Harbor (Dec 7, 1941) brought US into war\n- Atomic bombs: Hiroshima and Nagasaki (Aug 1945)\n- V-E Day: May 8, 1945; V-J Day: Aug 15, 1945\n- ~70-85 million total deaths\n- UN established 1945; Cold War began",
    "Key Points: Industrial Revolution\n- Began Britain ~1760; spread globally\n- Why Britain: coal, iron, colonies, stability, innovation\n- Textile: Spinning Jenny, Water Frame, Power Loom\n- James Watt - improved steam engine\n- Railways: Stephenson's Rocket (1829)\n- Bessemer Process - mass steel production\n- Social: urbanization, child labor, poor conditions\n- Reform: Factory Acts, trade unions, Chartists\n- 2nd revolution: electricity, automobiles, telephone\n- Marx: Communist Manifesto (1848)",
    "Key Points: Cold War\n- USA (capitalism) vs USSR (communism), 1947-1991\n- Truman Doctrine - contain communism\n- Marshall Plan - $13B to rebuild Europe\n- Berlin Wall: built 1961, fell 1989\n- Crises: Berlin Blockade, Korean War, Cuba, Vietnam\n- Arms Race and Space Race (Sputnik 1957, Moon 1969)\n- MAD - Mutually Assured Destruction\n- Gorbachev: glasnost + perestroika\n- USSR dissolved Dec 25, 1991 into 15 republics\n- US became sole superpower",
  ];
  return notes[i] || "";
}

function getAdminShortNote(i: number): string {
  const notes = [
    "Exam Focus: Ancient Sri Lanka\nDates: Vijaya (543 BCE), Buddhism (247 BCE), Anuradhapura fall (993 CE)\nPeople: Vijaya, Pandukabhaya, Devanampiya Tissa, Arahat Mahinda, Dutugemunu, Dhatusena\nPlaces: Anuradhapura, Thuparamaya, Ruwanwelisaya, Minneriya, Sigiriya\nConcepts: hydraulic civilization, bisokotuwa, dagoba\nDocuments: Mahavamsa, Dipavamsa",
    "Exam Focus: Medieval Sri Lanka\nDates: Chola liberation (1070), Polonnaruwa golden age (1153-1186), Kalinga Magha invasion (1215), Kandyan Convention (1815)\nPeople: Vijayabahu I, Parakramabahu I, Parakramabahu VI, Sri Vikrama Rajasinha\nPlaces: Polonnaruwa, Gal Vihara, Parakrama Samudra, Dambadeniya, Kotte, Kandy\nConcepts: drift south, Tooth Relic, Kandyan resistance",
    "Exam Focus: Colonial Sri Lanka\nTimeline: Portuguese 1505-1658, Dutch 1658-1796, British 1796-1948\nKey events: Crown Colony 1802, Kandyan Convention 1815, Colebrooke-Cameron 1833, Coffee blight 1869\nPortuguese: cinnamon, Catholicism, rajakariya\nDutch: Roman-Dutch Law, Galle Fort, VOC\nBritish: tea plantations, railways, Tamil labor\nUprisings: 1818 and 1848",
    "Exam Focus: Independence\nOrganizations: Ceylon National Congress (1919), SLFP\nCommissions: Manning (1924), Donoughmore (1931), Soulbury (1947)\nMilestone: Universal suffrage 1931 (2nd in Asia)\nIndependence: Feb 4, 1948 as Dominion\nLeaders: D.S. Senanayake, Anagarika Dharmapala, S.W.R.D. Bandaranaike\nPost-independence: Citizenship Act 1948, Sinhala Only Act 1956",
    "Exam Focus: Egypt and Mesopotamia\nMesopotamia: Tigris/Euphrates, Sumerians, cuneiform, Hammurabi's Code (282 laws)\nEgypt: Nile, pharaohs, pyramids of Giza, Sphinx\nKey rulers: Narmer, Khufu, Hatshepsut, Akhenaten, Tutankhamun, Ramesses II\nAchievements: writing, irrigation, law, medicine, astronomy\nRosetta Stone (1799) - decoded hieroglyphics",
    "Exam Focus: Greece and Rome\nGreece: democracy (Athens), military (Sparta), philosophy, Olympics (776 BCE)\nWars: Persian Wars, Peloponnesian War, Alexander's conquests\nRome: Republic to Empire, Senate, Twelve Tables, Pax Romana\nPunic Wars: Rome vs Carthage, Hannibal's Alpine crossing\nKey figures: Pericles, Socrates, Plato, Aristotle, Alexander, Caesar, Augustus\nFall: 476 CE (West), Byzantine survived to 1453",
    "Exam Focus: World War I\nCauses: M.A.I.N. acronym\nSpark: Franz Ferdinand assassination, Sarajevo, June 28, 1914\nAlliances: Triple Alliance vs Triple Entente\nKey battles: Marne, Verdun, Somme\nNew tech: machine guns, poison gas, tanks, U-boats, aircraft\nEnd: Armistice Nov 11, 1918\nTreaty of Versailles: War Guilt (Art. 231), reparations, League of Nations",
    "Exam Focus: World War II\nCauses: Versailles, totalitarianism, appeasement, Munich Agreement\nStart: Sept 1, 1939 (Poland invasion)\nTurning points: Stalingrad, El Alamein, D-Day, Midway\nHolocaust: 6M Jews killed, Nuremberg Trials\nEnd: V-E Day May 8, V-J Day Aug 15, 1945\nAtomic bombs: Hiroshima (Aug 6), Nagasaki (Aug 9)\nAftermath: UN (1945), Marshall Plan, Cold War begins",
    "Exam Focus: Industrial Revolution\nWhen/Where: ~1760, Britain first\nWhy Britain: coal, iron, colonies, stability, capital\nKey inventions: Spinning Jenny, steam engine (Watt), railways (Stephenson)\nSocial impact: urbanization, factory system, child labor\nReforms: Factory Acts, trade unions, Chartist Movement\n2nd revolution (~1870): electricity, automobiles, telephone\nThinkers: Adam Smith, Karl Marx",
    "Exam Focus: Cold War\nSuperpowers: USA vs USSR (1947-1991)\nPolicies: Truman Doctrine, Marshall Plan, containment\nCrises: Berlin Blockade/Wall, Korean War, Cuban Missiles, Vietnam\nRaces: Arms (MAD concept) and Space (Sputnik, Apollo 11)\nEnd: Gorbachev's glasnost/perestroika, Berlin Wall falls 1989, USSR dissolves 1991\nTreaties: SALT I, SALT II, INF Treaty",
  ];
  return notes[i] || "";
}

// ─── Main seed function ──────────────────────────────────────────
async function main() {
  console.log("Cleaning existing data...");

  // First delete auth users (and let cascade handle trigger-created data)
  const emails = USERS.map((u) => u.email);
  // Delete content and relationships first (no FK to auth)
  await prisma.quizAttempt.deleteMany();
  await prisma.paperAttempt.deleteMany();
  await prisma.studentProgress.deleteMany();
  await prisma.quizQuestion.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.paper.deleteMany();
  await prisma.noteAttachment.deleteMany();
  await prisma.note.deleteMany();
  await prisma.shortNote.deleteMany();
  await prisma.teacherStudentLink.deleteMany();
  await prisma.parentStudentLink.deleteMany();
  await prisma.relationshipRequest.deleteMany();
  await prisma.studentDetails.deleteMany();
  await prisma.teacherDetails.deleteMany();
  await prisma.parentDetails.deleteMany();
  await prisma.adminDetails.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.subject.deleteMany();

  // Now delete auth users
  await pool.query(
    `DELETE FROM auth.identities WHERE provider_id IN (
      SELECT id::text FROM auth.users WHERE email = ANY($1)
    )`,
    [emails]
  );
  await pool.query(`DELETE FROM auth.users WHERE email = ANY($1)`, [emails]);

  // ─── 1. Create Auth Users via raw SQL ───────────────────────────
  console.log("Creating auth users...");

  for (const user of USERS) {
    const userMeta = JSON.stringify({
      sub: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      email_verified: true,
      phone_verified: false,
    });
    await pool.query(
      `INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password,
        email_confirmed_at, created_at, updated_at,
        confirmation_token, recovery_token, email_change_token_new,
        email_change,
        raw_app_meta_data, raw_user_meta_data
      ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        $1::uuid, 'authenticated', 'authenticated', $2,
        crypt('654321', gen_salt('bf')),
        now(), now(), now(), '', '', '',
        '',
        '{"provider":"email","providers":["email"]}',
        $3::jsonb
      )`,
      [user.id, user.email, userMeta]
    );
    await pool.query(
      `INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id,
        last_sign_in_at, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1::uuid,
        jsonb_build_object('sub', $1::text, 'email', $2::text,
          'email_verified', false, 'phone_verified', false),
        'email', $1, now(), now(), now()
      )`,
      [user.id, user.email]
    );
    console.log(`  + ${user.email} (${user.role})`);
  }

  // ─── 2. Create Profiles (upsert in case trigger auto-created them) ──
  console.log("Creating profiles...");
  for (const user of USERS) {
    await prisma.profile.upsert({
      where: { id: user.id },
      update: { email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
      create: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
    });
  }

  // ─── 3. Role-specific details (upsert in case trigger created them) ──
  console.log("Creating role details...");

  // Delete any trigger-created details first, then recreate with proper data
  await prisma.adminDetails.deleteMany({ where: { id: IDS.admin001 } });
  await prisma.adminDetails.create({ data: { id: IDS.admin001, department: "Administration" } });

  const studentIds = [IDS.student001, IDS.student002, IDS.student003, IDS.student004, IDS.student005];
  for (const sid of studentIds) {
    await prisma.studentDetails.deleteMany({ where: { id: sid } });
    await prisma.studentDetails.create({ data: { id: sid, grade: "Grade 10", dob: new Date("2010-03-15") } });
  }

  await prisma.teacherDetails.deleteMany({ where: { id: IDS.teacher001 } });
  await prisma.teacherDetails.create({ data: { id: IDS.teacher001, subject: "History", employeeId: "TCH001", department: "Social Sciences" } });

  const parentIds = [IDS.parent001, IDS.parent002, IDS.parent003, IDS.parent004, IDS.parent005];
  const parentPhones = ["0771234567", "0772345678", "0773456789", "0774567890", "0775678901"];
  const parentRels = ["Father", "Mother", "Father", "Mother", "Father"];
  for (let i = 0; i < parentIds.length; i++) {
    await prisma.parentDetails.deleteMany({ where: { id: parentIds[i] } });
    await prisma.parentDetails.create({ data: { id: parentIds[i], phoneNumber: parentPhones[i], relationship: parentRels[i] } });
  }

  // ─── 4. Relationships ──────────────────────────────────────────
  console.log("Creating relationships...");
  for (const sid of studentIds) {
    await prisma.teacherStudentLink.create({ data: { teacherId: IDS.teacher001, studentId: sid } });
  }
  for (let i = 0; i < 5; i++) {
    await prisma.parentStudentLink.create({ data: { parentId: parentIds[i], studentId: studentIds[i] } });
  }

  // ─── 5. Subject ────────────────────────────────────────────────
  console.log("Creating History subject...");
  const history = await prisma.subject.upsert({
    where: { code: "HIST" },
    update: { name: "History" },
    create: { name: "History", code: "HIST" },
  });

  // ─── 6. Notes ──────────────────────────────────────────────────
  console.log("Creating notes...");
  for (const note of TEACHER_NOTES) {
    await prisma.note.create({
      data: { title: note.title, subjectId: history.id, topic: note.topic, content: note.content, visibility: "STUDENTS_ONLY", status: "APPROVED", createdById: IDS.teacher001 },
    });
  }
  for (const note of ADMIN_NOTES) {
    await prisma.note.create({
      data: { title: note.title, subjectId: history.id, topic: note.topic, content: note.content, visibility: "STUDENTS_ONLY", status: "APPROVED", createdById: IDS.admin001 },
    });
  }

  // ─── 7. Short Notes ────────────────────────────────────────────
  console.log("Creating short notes...");
  for (let i = 0; i < TOPICS.length; i++) {
    await prisma.shortNote.create({
      data: { title: `${TOPICS[i]} - Quick Revision`, subjectId: history.id, topic: TOPICS[i], content: getTeacherShortNote(i), status: "APPROVED", createdById: IDS.teacher001 },
    });
    await prisma.shortNote.create({
      data: { title: `${TOPICS[i]} - Summary Card`, subjectId: history.id, topic: TOPICS[i], content: getAdminShortNote(i), status: "APPROVED", createdById: IDS.admin001 },
    });
  }

  // ─── 8. Papers (MCQ only) ─────────────────────────────────────
  console.log("Creating papers...");
  const paperTerms: Array<"TERM_1" | "TERM_2" | "TERM_3" | "MID_YEAR" | "END_OF_YEAR"> = ["TERM_1", "TERM_2", "TERM_3", "MID_YEAR", "END_OF_YEAR"];
  const paperTitles = ["Term 1 Examination", "Term 2 Examination", "Term 3 Examination", "Mid-Year Examination", "End of Year Examination"];
  for (let i = 0; i < 5; i++) {
    await prisma.paper.create({
      data: {
        title: `History ${paperTitles[i]} - 2025`, subjectId: history.id, term: paperTerms[i], grade: "Grade 10", year: 2025,
        duration: 60 + i * 15, isModel: false, mcqCount: 40, mcqMarks: 1, essayCount: 0, essayMarks: 0, totalMarks: 40, passPercentage: 35,
        instructions: `This paper contains 40 MCQ questions. Each carries 1 mark. Time: ${60 + i * 15} minutes.`,
        status: "APPROVED", createdById: IDS.teacher001,
      },
    });
  }
  for (let i = 0; i < 5; i++) {
    await prisma.paper.create({
      data: {
        title: `Grade 10 History Model Paper ${i + 1}`, subjectId: history.id, term: paperTerms[i], grade: "Grade 10", year: 2025,
        duration: 90, isModel: true, mcqCount: 50, mcqMarks: 1, essayCount: 0, essayMarks: 0, totalMarks: 50, passPercentage: 35,
        instructions: `Model paper with 50 MCQ questions. Each carries 1 mark. Total time: 90 minutes.`,
        status: "APPROVED", createdById: IDS.admin001,
      },
    });
  }

  // ─── 9. Quizzes with Questions ─────────────────────────────────
  console.log("Creating quizzes with questions...");
  for (const topic of TOPICS) {
    const questions = ALL_QUIZ_QUESTIONS[topic];
    if (!questions || questions.length === 0) continue;

    // Teacher quiz
    await prisma.quiz.create({
      data: {
        title: `${topic} - Practice Quiz`, subjectId: history.id, topic, type: "TOPIC_BASED", duration: 30, status: "APPROVED", createdById: IDS.teacher001,
        questions: { create: questions.map((q, idx) => ({ text: q.text, type: "MCQ" as const, points: 1, options: q.options, correctAnswer: q.answer, order: idx })) },
      },
    });
    // Admin quiz
    await prisma.quiz.create({
      data: {
        title: `${topic} - Assessment Quiz`, subjectId: history.id, topic, type: "TOPIC_BASED", duration: 25, status: "APPROVED", createdById: IDS.admin001,
        questions: { create: questions.map((q, idx) => ({ text: q.text, type: "MCQ" as const, points: 1, options: q.options, correctAnswer: q.answer, order: idx })) },
      },
    });
    console.log(`  + Quizzes for: ${topic}`);
  }

  // ─── 10. Historical Locations (Map Search) ─────────────────────
  console.log("Creating historical locations...");
  await prisma.location.deleteMany();
  const LOCATIONS = [
    { name: "Anuradhapura", latitude: 8.3114, longitude: 80.4037, description: "Ancient capital of Sri Lanka (377 BCE - 1017 CE)", category: "ancient_city" },
    { name: "Polonnaruwa", latitude: 7.9403, longitude: 81.0188, description: "Medieval capital of Sri Lanka (1017 - 1232 CE)", category: "ancient_city" },
    { name: "Sigiriya", latitude: 7.9570, longitude: 80.7603, description: "5th-century rock fortress built by King Kashyapa", category: "fortress" },
    { name: "Kandy", latitude: 7.2906, longitude: 80.6337, description: "Last royal capital; home of the Temple of the Tooth Relic", category: "kingdom" },
    { name: "Galle Fort", latitude: 6.0269, longitude: 80.2170, description: "Dutch colonial fort, UNESCO World Heritage Site", category: "colonial_fort" },
    { name: "Dambulla", latitude: 7.8675, longitude: 80.6517, description: "Cave temple complex with ancient Buddhist paintings", category: "temple" },
    { name: "Mihintale", latitude: 8.3503, longitude: 80.5114, description: "Birthplace of Buddhism in Sri Lanka (247 BCE)", category: "temple" },
    { name: "Yapahuwa", latitude: 7.8167, longitude: 80.3167, description: "13th-century rock fortress and capital", category: "fortress" },
    { name: "Dambadeniya", latitude: 7.4667, longitude: 80.1833, description: "Capital after Polonnaruwa era (1232–1283 CE)", category: "ancient_city" },
    { name: "Kotte", latitude: 6.8914, longitude: 79.9006, description: "Capital of the Kingdom of Kotte (1412–1597 CE)", category: "kingdom" },
    { name: "Ruwanwelisaya", latitude: 8.3486, longitude: 80.3964, description: "Great stupa built by King Dutugemunu in Anuradhapura", category: "temple" },
    { name: "Jetavanaramaya", latitude: 8.3536, longitude: 80.4000, description: "Once the tallest brick structure in the world", category: "temple" },
    { name: "Thuparamaya", latitude: 8.3564, longitude: 80.3953, description: "First dagoba built in Sri Lanka after Buddhism arrived", category: "temple" },
    { name: "Colombo", latitude: 6.9271, longitude: 79.8612, description: "Commercial capital; Portuguese, Dutch, and British colonial hub", category: "colonial_fort" },
    { name: "Gampola", latitude: 7.1633, longitude: 80.5733, description: "Capital of Sri Lanka in the 14th century", category: "kingdom" },
    { name: "Tissamaharama", latitude: 6.2839, longitude: 81.2878, description: "Ancient kingdom in southern Sri Lanka (Ruhuna)", category: "ancient_city" },
    { name: "Abhayagiri Monastery", latitude: 8.3636, longitude: 80.3986, description: "Major Buddhist monastery founded by King Valagamba", category: "temple" },
    { name: "Minneriya", latitude: 8.0333, longitude: 80.8833, description: "Ancient reservoir built by King Mahasena (3rd century CE)", category: "reservoir" },
    { name: "Parakrama Samudra", latitude: 7.9333, longitude: 81.0000, description: "Massive reservoir built by King Parakramabahu I", category: "reservoir" },
    { name: "Kalawewa", latitude: 8.0333, longitude: 80.5333, description: "Ancient reservoir built by King Dhatusena (5th century CE)", category: "reservoir" },
  ];
  for (const loc of LOCATIONS) {
    await prisma.location.create({ data: loc });
  }
  console.log(`  + ${LOCATIONS.length} historical locations created`);

  // ─── 11. Student Progress ──────────────────────────────────────
  console.log("Creating student progress records...");
  for (const sid of studentIds) {
    await prisma.studentProgress.create({
      data: { studentId: sid, quizzesCompleted: 0, papersAttempted: 0, averageScore: 0, studyStreak: 0, totalPoints: 0, totalLearningMin: 0, topicsMastered: 0 },
    });
  }

  console.log("\nSeeding complete!");
  console.log("-------------------------------------------");
  console.log("Accounts created (all passwords: 654321):");
  for (const u of USERS) {
    console.log(`   ${u.email.padEnd(28)} ${u.role.padEnd(10)} ${u.firstName} ${u.lastName}`);
  }
  console.log("-------------------------------------------");
  console.log(`Subject: History (10 topics)`);
  console.log(`Notes: ${TEACHER_NOTES.length} (teacher) + ${ADMIN_NOTES.length} (admin) = ${TEACHER_NOTES.length + ADMIN_NOTES.length}`);
  console.log(`Short Notes: ${TOPICS.length * 2} (${TOPICS.length} teacher + ${TOPICS.length} admin)`);
  console.log(`Papers: 5 (teacher) + 5 (admin) = 10`);
  console.log(`Quizzes: ${TOPICS.length} (teacher) + ${TOPICS.length} (admin) = ${TOPICS.length * 2} (20 questions each)`);
  console.log(`Relationships: 5 teacher-student + 5 parent-student = 10`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
