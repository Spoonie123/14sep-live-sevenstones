"use client";

import { useState, type ChangeEvent } from "react";
import { PersonalityData } from "./personality-types";
import { personalityExamples } from "./personality-examples";

interface Props {
  personalityData: PersonalityData;
  setPersonalityData: (data: any) => void;
  isCompleted: boolean;
  sessionId: string;
}

export default function AiGenerationPersonality({
  personalityData,
  setPersonalityData,
  isCompleted,
  sessionId,
}: Props) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateText = async () => {
    setIsGenerating(true);
    setError(null);

    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY!;
    const { neo_scores, personTitle, first_name, last_name } = personalityData;

    if (!neo_scores || !personTitle || (!first_name && !last_name)) {
      setError("Ontbrekende gegevens: Neo-scores, naam of titel ontbreken.");
      setIsGenerating(false);
      return;
    }

    // Aanspreekwijze + naam
    let displayName = "";
    let addressForm = "";
    if (personTitle === "Voornaam") {
      displayName = first_name || "";
      addressForm = "";
    } else if (personTitle === "De heer") {
      displayName = `de heer ${last_name || ""}`;
      addressForm = "de heer";
    } else if (personTitle === "Mevrouw") {
      displayName = `mevrouw ${last_name || ""}`;
      addressForm = "mevrouw";
    }

    const openingNaam =
      personTitle === "Voornaam" ? (first_name || "") : (last_name || "");
    const openingAanspreek = personTitle === "Voornaam" ? "" : addressForm;

    const scoresContext = Object.entries(neo_scores as Record<string, unknown>)
      .map(([key, value]) => `${key}: ${String(value)}`)
      .join(", ");

    // =========================
    // SYSTEM PROMPT (STRIKT) - HERZIENE EN DEFINITIEVE VERSIE
    // =========================
    const systemPrompt = `
Je schrijft Nederlandstalige, persoonlijkheidsbeschrijvingen op basis van NEO-PI.

ONONDERHANDELBARE EN STRIKTE REGELS VOOR NAUWKEURIGHEID:
0A) VEREISTE TERMINOLOGIE: Gebruik de **EXACTE** termen uit de Norm Score Interpretatie (zeer laag, laag, beneden gemiddeld, licht gemiddeld, etc.). Gebruik **UITSLUITEND** deze termen en **GEEN** synoniemen of vrije interpretaties zoals 'zelden', 'vaak', 'weinig' of 'soms' ter vervanging van de officiële bandbreedte-omschrijvingen (1-9).
0B) BIJZONDERE FACETTEN (NIET NEGEREN): 
    - Bij een score van 3 of lager op Fantasie (O1) zijn "fantasie" en "creativiteit" **STRIKT VERBODEN**. Gebruik **UITSLUITEND** "nuchter", "feitelijk" of "pragmatisch".

1) STIJL: **zakelijk en direct; professionele zinnen (12–18 woorden)**; geen adviezen; geen interpretaties; geen ontwikkeltaal.
   Houd een vaste, gortdroge cadans aan en **vermijd mini-zinnen**.
   Idiomen spaarzaam en herkenbaar; géén nieuwe metaforen; geen telegramstijl.
   Interpunctie: géén puntkomma’s; gebruik uitsluitend punten.
2) TERMINOLOGIE: gebruik “extraversie”; vermijd “extravertie”, “facet”, testnamen en cijfers.
3) STRUCTUUR: exact vijf alinea’s in vaste volgorde:
   1) Emotionele veerkracht
   2) Extraversie
   3) Openheid en onderzoekendheid
   4) Gerichtheid (op anderen vs. eigen belang)
   5) Consciëntieusheid
   Elke alinea gescheiden door precies één lege regel. Geen koppen/tags.
4) FACETDEKKING: behandel **alle** 30 aspecten beschrijvend. Groepeer gelijke band; uitschieters kort apart.
   Emotionele veerkracht móét expliciet bevatten: angst, ergernis/boosheid, somberheid/depressieve gevoelens, schaamte/verlegenheid, impulscontrole, stressbestendigheid/kwetsbaarheid.
   Gerichtheid móét expliciet bevatten: vertrouwen, openhartigheid/oprechtheid, zorgzaamheid, inschikkelijkheid/competitie, bescheidenheid, medeleven.
5) TAAL: Vertaal de scores naar concrete, professionele beschrijvingen van gedrag. Gebruik de exacte termen uit de interne normscore interpretatie. Bijvoorbeeld, voor een score van 9 beschrijf je het gedrag en gebruik je de term "zeer hoog", voor een score van 4 "licht gemiddeld". Gebruik in plaats van "ligt hoog" de beschrijving van het gedrag, zoals "neemt graag het voortouw". Vermijd de frase “wat zich uit in”.
6) OPENING (verplicht, exact): “Uit de persoonlijkheidstest komt [aanspreekwijze] [naam] naar voren als…”.
7) UITVOER: uitsluitend de uiteindelijke tekst (vijf alinea’s, één lege regel ertussen). Geen koppen, bullets of uitleg.
8) NUANCE: per domein exact 2 korte nuancezinnen met natuurlijk contrast/situatie (geen sjablonen). Vermijd onlogische tegenstellingen, zoals die tussen vrolijkheid en rust.
9) VERGELIJKINGSANKER: **per alinea minimaal één** korte vergelijking, bv. “ten opzichte van de meeste mensen…”, “vergeleken met…”, “in de meeste situaties…”.
10) VERBODEN WOORDEN: gebruik **niet** “scoort” of “score”.
11) VORM: per alinea **4–7 zinnen**. Houd je hier strikt aan.
12) CONSISTENTIE: geen tegenspraak binnen hetzelfde aspect.

--- START NEO-PI-3 CONTEXT ---
## Norm Score Interpretatie:
1 = zeer laag
2 = laag  
3 = beneden gemiddeld
4 = licht gemiddeld
5 = gemiddeld
6 = licht boven gemiddeld
7 = bovengemiddeld
8 = hoog
9 = zeer hoog

### BELANGRIJKE STRUCTUUR:
- **Hoofdtrekken** (5 stuks): Geven het GEMIDDELDE aan van alle facetten binnen dat domein
- **FACETTEN** (30 stuks): Specifieke aspecten binnen elk hoofdtrek

### Volledige Facetten en Omschrijvingen:
- **Neuroticisme (titel):** Dit brede en belangrijke domein contrasteert emotionele stabiliteit met emotionele labiliteit. Het domein Neuroticisme wordt ook wel aangeduid als gegeneraliseerde angst omdat personen die hoog op dit domein scoren sterk geneigd zijn angst of andere negatieve gevoelens te ervaren. Het domein omvat naast de geneigdheid tot onwelbevinden ook het omgaan met frustratie en stress. De term 'neuroticisme' heeft voor velen een negatieve klank. Om deze reden wordt voor dit domein vaak gekozen voor de term 'emotionele stabiliteit'.
  - **Angst (N1):** Angstige mensen zijn ongerust, gauw bang en zorgelijk, nerveus, gespannen en schrikachtig. In klinische termen is de door deze schaal gemeten angst meer manifest dan latent. De schaal meet geen specifieke angsten, maar hoogscoorders hebben vaker zulke angsten of fobieën, als ook onbepaalde angst. De score op dit facet is relatief gevoelig voor beïnvloeding door de (tijdelijke) toestand van de persoon.
  - **Ergernis (N2):** Ergernis vertegenwoordigt de neiging tot het ervaren van frustratie, boosheid en haatgevoelens. Deze schaal meet de frequentie waarmee en de mate waarin iemand boosheid en dergelijke ervaart; het uiten van die gevoelens met agressie volgt hieruit niet noodzakelijk, en hangt onder meer af van iemands positie in het domein Altruïsme.
  - **Depressie (N3):** Deze schaal meet normale individuele verschillen in de ontvankelijkheid voor depressieve gevoelens. Hoogscoorders zijn ontvankelijk voor gevoelens van schuld, verdriet, hopeloosheid en eenzaamheid. Ze zijn snel ontmoedigd en makkelijk uit het veld te slaan. Laagscoorders zijn niet per se vrolijk en opgewekt van aard, maar hebben gewoon zelden depressieve gevoelens.
  - **Schaamte (N4):** Gevoelens van schaamte en verlegenheid vormen de kern van dit facet. Mensen die hoog op het schaamtefacet scoren, voelen zich niet op hun gemak in het gezelschap van anderen. Ze voelen zich snel bekeken en beoordeeld; ze zijn gevoelig voor spot, en ontvankelijk voor gevoelens van minderwaardigheid of voor een lage zelfdunk. Schaamte is verwant aan wat vaak 'sociale angst' wordt genoemd.
  - **Impulsiviteit (N5):** Impulsiviteit verwijst naar het onvermogen om verlangens, impulsen en gevoelens te beheersen. Behoeften (bijvoorbeeld aan eten, sigaretten, bezittingen) worden als zo sterk ervaren dat het individu deze niet kan weerstaan, hoewel hij of zij het gedrag later kan betreuren. Laagscoorders vinden het gemakkelijk verleidingen te weerstaan en hebben een hoge frustratietolerantie. De term 'impulsiviteit' (zoals deze in de NEO-PI-3 gebruikt wordt) dient niet verward te worden met spontaniteit, het nemen van risico's of het zeer snel (in de tijd gezien) nemen van beslissingen.
  - **Kwetsbaarheid (N6):** Het facet Kwetsbaarheid verwijst naar het hanteren van moeilijke en stressvolle situaties. Hoogscoorders zijn stressgevoelig en voelen zich niet in staat met spanning en stresssituaties om te gaan. In crisissituaties worden ze afhankelijk, voelen ze zich hopeloos of raken ze in paniek. Zij die laag scoren ervaren zichzelf als competent en in staat moeilijke situaties te hanteren of zich er uit te redden.
- **Extraversie (titel):** Met het begrippenpaar extraversie - introversie wordt een naar buiten respectievelijk naar binnen gerichte energie, aandacht en oriëntatie aangeduid. Onderzoek ondersteunt de opvatting dat introverte mensen niet zozeer het tegenovergestelde van extraverte mensen laten zien maar de afwezigheid van uitgesproken extraverte kenmerken.
  - **Hartelijkheid (E1):** Hartelijkheid in de omgang bevordert het totstandkomen van een emotionele band tussen mensen, door de warmte en genegenheid die wordt getoond. Hartelijke mensen zijn vriendelijk en tonen in hun aandacht voor anderen dat ze echt op mensen gesteld zijn. Laagscoorders zijn meer gereserveerd, op een afstand en formeel in hun manier van doen.
  - **Sociabiliteit (E2):** Sociabiliteit is een tweede aspect van extraversie: de voorkeur in het gezelschap van anderen te verkeren. Sociabele mensen zoeken gezelschap en houden van de drukte en activiteit van grote groepen mensen. Ze worden gestimuleerd door gezelschap; contacten met anderen zijn de motor voor hun activiteiten. Laagscoorders zoeken geen gezelschap, vermijden het soms actief en prefereren het regelmatig om alleen te zijn.
  - **Dominantie (E3):** Het gedrag van hoogscoorders op deze schaal is dominant, krachtig en overheersend. Ze spreken zonder aarzeling en krijgen of nemen vaak de leiding in groepen. In gesprekken en bijeenkomsten zijn ze veel aan het woord. Laagscoorders blijven liever op de achtergrond en laten anderen het woord doen.
  - **Energie (E4):** Hoogscoorders worden gekenmerkt door een hoog tempo en krachtige bewegingen. Ze hebben steeds de behoefte bezig te zijn en stralen een gevoel van energie uit. Energieke mensen leiden een druk, vol en vaak gehaast leven waar vaart in zit. Mensen die laag scoren op deze schaal zijn kalmer en minder gedreven en ze houden van een meer ontspannen levensstijl.
  - **Avonturisme (E5):** Hoogscoorders op deze schaal hebben een hang naar opwinding, stimulering en actie. Ze houden van heldere kleuren, lawaaiige omgevingen en prikkelende sensaties. Avonturisme is verwant aan sensatie zoeken. Laagscoorders hebben weinig behoefte aan sensaties en houden van een rustig en vredig leven dat sommigen saai zouden vinden.
  - **Vrolijkheid (E6):** Hoogscoorders op deze facetschaal hebben vaak plezier en voelen zich vaak blij en gelukkig. Ze lachen veel en gemakkelijk, zijn opgewekt en optimistisch. Laagscoorders zijn niet noodzakelijkerwijs ongelukkig; ze zijn wel minder vrolijk en uitbundig in hun gedrag en ervaringen. Van alle facetten van het domein Extraversie is Vrolijkheid de beste voorspeller van een algeheel gevoel van geluk en welbevinden.
- **Openheid (titel):** De volledige naam voor dit domein is eigenlijk 'Openheid voor ervaringen', waarmee vooral een bepaalde geesteshouding wordt aangeduid. Elementen van Openheid zoals verbeeldingskracht, sensitiviteit, intellectuele nieuwsgierigheid en een onafhankelijk oordeel zijn aspecten die in veel theorieën over persoonlijkheid een rol spelen. Men is geneigd Openheid als een teken van volwassenheid en psychische gezondheid te zien. Waarde en nut van geslotenheid en openheid hangen echter sterk af van de eisen die de situatie stelt.
  - **Fantasie (O1):** Hoogscoorders op deze schaal hebben een actieve en levendige fantasie. Dagdromen is voor hen niet eenvoudigweg een ontsnapping, maar een manier om een interessant innerlijk leven te creëren. Ze ontwikkelen hun fantasieën en werken die uit, en voelen dat als een verrijking en creatieve noodzaak in hun leven. Laagscoorders zijn prozaïsch en blijven graag met beide benen op de grond staan.
  - **Esthetiek (O2):** Mensen die hoog scoren op deze schaal hebben een diepe innerlijke waardering voor kunst en schoonheid. Zij worden ontroerd door poëzie, voelen zich geheel opgenomen in muziek en worden geïntrigeerd door beeldende kunst. Hoogscoorders hebben niet per se een artistiek talent of zelfs maar wat de meeste mensen een goede smaak vinden. Laagscoorders zijn relatief ongevoelig voor kunst en schoonheid en zijn daarin weinig geïnteresseerd.
  - **Gevoelens (O3):** Openheid voor gevoelens houdt ontvankelijkheid in voor de eigen innerlijke gevoelens. De houding ten opzichte van emoties is positief; emotie wordt als een belangrijk deel van het leven gezien. Hoogscoorders ervaren een breed en genuanceerd scala aan emotionele ervaringen en voelen geluk en ongeluk sterker dan anderen. Laagscoorders hebben weinig aandacht voor hun eigen gevoelens, leven er grotendeels aan voorbij en vinden hen niet heel belangrijk.
  - **Verandering (O4):** Dit facet omvat Openheid voor verandering, voor variatie, voor nieuwe ervaringen. Die openheid is niet alleen passief, maar houdt ook de nieuwsgierigheid in naar alles wat nieuw en anders is voor de persoon, een hang naar variatie en afwisseling. Laagscoorders geven de voorkeur aan het bekende en vertrouwde, aan routine in plaats van aan verandering en variatie.
  - **Ideeën (O5):** Dit aspect van Openheid heeft betrekking op intellectuele nieuwsgierigheid. Deze trek herkent men niet alleen in een actieve interesse in intellectuele bezigheden als zodanig, maar ook in het openstaan staan voor nieuwe, onconventionele ideeën en de bereidheid die te overwegen. Hoogscoorders hebben zowel plezier in filosofische gesprekken als in ingewikkelde puzzels. Laagscoorders hebben een beperkte interesse; als ze intelligent zijn concentreren ze hun talent op een smal en afgeperkt gebied.
  - **Waarden (O6):** Openheid voor waarden houdt in dat men bereid is sociale, politieke en religieuze waarden tegen het licht te houden en te heroverwegen. Hoogscoorders kenmerken zich eerder door (al dan niet methodische) twijfel en een kritische, zoekende houding dan door zekerheden en vaste overtuigingen. Gesloten mensen neigen er toe autoriteit te accepteren; zij houden vaste waarden en tradities in ere, en zijn in die zin conservatief. Openstaan voor waarden kan gezien worden als het tegendeel van dogmatisme.
- **Altruïsme (titel):** Altruïsme vertegenwoordigt de oriëntatie van het individu op de ervaringen, belangen en doelen van anderen. De sympathieke pool van dit domein wordt vaak gezien als sociaal gewenst en psychologisch gezonder. Toch vertegenwoordigen beide polen een positieve waarde voor de persoon en de omgeving. De neiging om voor de eigen belangen op te komen is in sommige situaties van grote waarde. Een sceptische houding en kritisch denken, ook antagonistische instellingen, zijn belangrijke voorwaarden voor bijvoorbeeld wetenschappelijke vooruitgang en democratische controle. Net zoals geen van beide polen van Altruïsme intrinsiek beter is vanuit het gezichtspunt van de samenleving, zijn zij noodzakelijk beter voor de psychische gezondheid van het individu.
  - **Vertrouwen (A1):** Vertrouwen kan worden omschreven als de neiging om van andere mensen als vanzelfsprekend aan te nemen dat ze van goede wil zijn. Hoogscoorders zijn geneigd te geloven dat anderen eerlijk zijn en met de beste bedoelingen handelen. Laagscoorders hebben een sceptische instelling, en zijn meer geneigd anderen bij voorbaat als onbetrouwbaar of gevaarlijk te zien.
  - **Oprechtheid (A2):** Oprechte personen zijn eerlijk, oprecht, direct en ongekunsteld in hun sociale gedrag. Ze zijn niet berekenend in hun sociale gedrag. Laagscoorders zijn bereid anderen te manipuleren met vleierij, trucs en kleine of halve onwaarheden. Zij zien zulke tactieken als noodzakelijke sociale vaardigheden en vinden de oprechtheid van anderen vaak naïef.
  - **Zorgzaamheid (A3):** Hoogscoorders zijn onbaatzuchtig, hulpvaardig en zorgzaam voor anderen. Ze tonen een actieve bereidheid anderen te helpen en voor anderen te zorgen waar dat nodig is. Laagscoorders zijn egocentrisch, en vermijden het betrokken te raken bij andermans problemen. Zorgzaamheid is een centraal facet van het domein Altruïsme en vormt het hart van de betekenis van Altruïsme als instelling.
  - **Inschikkelijkheid (A4):** Dit facet betreft de omgang met voorziene of optredende interpersoonlijke conflicten. Hoogscoorders zijn geneigd tot toegeven, vermijden ruzie en bedwingen hun boosheid. Ze zijn zachtaardig en mild en schikken zich naar de ander als het er op aankomt. Deze bereidheid mee te werken kan gekwalificeerd worden als 'vriendelijke volgzaamheid'. Laagscoorders reageren in zulke situaties competitief en agressief, houden hun boosheid niet in maar uiten die gemakkelijk.
  - **Bescheidenheid (A5):** Hoogscoorders op deze schaal zijn bescheiden en blijven graag op de achtergrond. Dat zegt echter niets over hun zelfvertrouwen en zelfwaardering, die stevig en positief kunnen zijn. Laagscoorders vinden zichzelf beter dan anderen en worden al gauw arrogant gevonden door anderen.
  - **Medeleven (A6):** Deze facetschaal meet een houding van sympathie en bezorgdheid voor het lot van andere mensen. Hoogscoorders worden bewogen door het leed en de behoeften van anderen, zijn mild in hun oordeel over anderen, en geneigd de menselijke kant te benadrukken in allerlei maatschappelijke vraagstukken. Laagscoorders nemen een nuchter-zakelijke houding aan tegenover menselijke problemen, en zijn minder snel geroerd door een beroep op hun medeleven.
- **Consciëntieusheid (titel):** Consciëntieus gedrag houdt in: doen wat de dominante omgeving vraagt en nalaten wat daar verstorend werkt en ongewenst is. Consciëntieusheid kan echter ook slaan op het proces van doen wat moet: een proactief proces van het plannen, organiseren en uitvoeren van taken die men op zich heeft genomen. Beide varianten van Consciëntieusheid hangen sterk samen en vormen gezamenlijk een brede persoonlijkheidsdimensie die discipline en conformeren aan normen uit de omgeving als kern heeft.
  - **Doelmatigheid (C1):** Het facet Doelmatigheid verwijst naar de ervaring van mensen dat zij bekwaam, verstandig en effectief zijn inzake de opgaven die het leven hun stelt. Hoogscoorders voelen zich uitstekend tegen het leven opgewassen, terwijl laagscoorders dat gevoel nu juist missen.
  - **Ordelijkheid (C2):** Hoogscoorders op deze facetschaal zijn precies, ordelijk en systematisch en zij organiseren hun zaken goed en planmatig. Laagscoorders zijn slordig en onsystematisch; zij slagen er nauwelijks in hun taken, afspraken, plannen en bezittingen goed te organiseren.
  - **Betrouwbaarheid (C3):** Deze facetschaal meet de mate waarin iemand zich in het gedrag strikt houdt aan ethische principes en normen. Hoogscoorders zijn betrouwbaar, komen hun beloften en afspraken na, en handelen naar de plichten die hun geweten aan hen oplegt. Laagscoorders gaan met zulke zaken wat gemakkelijk of zelfs nonchalant om, en kunnen enigszins onbetrouwbaar zijn.
  - **Ambitie (C4):** Ambitie en prestatiedrang is een belangrijk onderdeel van het domein Consciëntieusheid. Hoogscoorders hebben een hoog aspiratieniveau en werken hard om hun doelen te bereiken. Ze zijn ijverig en doelgericht. Laagscoorders hebben geen sterke behoefte aan presteren en succes, zijn moeilijk tot prestaties te motiveren en weinig ambitieus.
  - **Zelfdiscipline (C5):** Zelfdiscipline is het vermogen eenmaal begonnen taken door te zetten en af te maken ondanks eventuele verveling en afleidingen. Hoogscoorders hebben het vermogen zichzelf te motiveren om het karwei af te maken. Laagscoorders beginnen eerder met uitstellen (procrastinatie), zijn sneller ontmoedigd en geven het eerder op. Zelfdiscipline onderscheidt zich van het beheersen van impulsen (één van de facetten van Neuroticisme), doordat zelfdiscipline verwijst naar een meer proactieve vasthoudendheid bij opdrachten die niet direct aantrekkelijk zijn.
  - **Bedachtzaamheid (C6):** Het facet Bedachtzaamheid slaat op de neiging tot zorgvuldig nadenken, gevolgen anticiperen en afwegen alvorens te handelen. Hoogscoorders zijn voorzichtig en gaan weloverwogen te werk. Laagscoorders zijn haastig en spontaan in beslissingen en gedrag, en spreken of handelen vaak voordat ze de gevolgen doordacht hebben.
--- EINDE NEO-PI-3 CONTEXT ---
`.trim();

    // =========================
    // USER PROMPT
    // =========================
    const userPrompt = `
Schrijf de persoonlijkheidsanalyse in de exacte stijl van de voorbeelden. 

PERSOONSDATA
- Naam (weergave): ${displayName}
- Aanspreekwijze: ${addressForm}

NORMSCORES (1–9) PER ASPECT (alleen context; niet uitschrijven):
${scoresContext}

SCHRIJFOPDRACHT:
1) Begin exact met: "Uit de persoonlijkheidstest komt ${openingAanspreek}${openingAanspreek ? " " : ""}${openingNaam} naar voren als..."
2) Lever exact vijf alinea’s, gescheiden door één lege regel. Geen koppen of tags.
3) Volg de vaste volgorde: Emotionele veerkracht → Extraversie → Openheid → Gerichtheid → Consciëntieusheid.
4) In Emotionele veerkracht en Gerichtheid de verplichte termen expliciet opnemen.
5) **Per alinea: 5–8 zinnen, minimaal één vergelijkingsanker, en exact 2 nuancezinnen** met natuurlijk contrast.
6) Vermijd de woorden “scoort” en “score”.
7) Alleen de uiteindelijke tekst met vijf alinea’s.

--- START VOORBEELDEN ---
${personalityExamples.join("\n---\n")}
--- EINDE VOORBEELDEN ---
`.trim();

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          max_tokens: 1700,
          temperature: 0.34,
          top_p: 0.9,
          presence_penalty: 0.2,
          frequency_penalty: 0.35,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API error: ${response.statusText} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      let generated: string = data.choices?.[0]?.message?.content ?? "";

      // Lichte opschoning zonder alinea’s te slopen
      generated = generated.replace(/\r\n/g, "\n");           // normaliseer
      generated = generated.replace(/;\s*/g, ". ");           // geen ;
      generated = generated.replace(                          // hoofdletter na .?!
        /([.!?])\s+([a-z\u00C0-\u024F])/g,
        (_m: string, p1: string, p2: string) => `${p1} ${p2.toUpperCase()}`
      );
      generated = generated.replace(/[ \t]{2,}/g, " ");       // extra spaties
      generated = generated.replace(/\n{3,}/g, "\n\n").trim();// >1 lege regel → 1

      setPersonalityData((prev: PersonalityData) => ({
        ...prev,
        personalityText: generated,
      }));
    } catch (err) {
      setError(`Fout bij AI generatie: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div style={{ marginTop: "32px" }}>
      <button
        onClick={handleGenerateText}
        disabled={isGenerating}
        style={{
          padding: "12px 24px",
          fontSize: "16px",
          fontWeight: "bold",
          color: "white",
          backgroundColor: "#003366",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          transition: "background-color 0.3s ease",
        }}
      >
        {isGenerating ? "🧠 Bezig met genereren..." : "🧠 Genereer Persoonlijkheidsanalyse"}
      </button>

      {error && <p style={{ color: "red", marginTop: "16px" }}>{error}</p>}

      {personalityData.personalityText && (
        <div style={{ marginTop: "16px" }}>
          <textarea
            value={personalityData.personalityText}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              setPersonalityData((prev: PersonalityData) => ({
                ...prev,
                personalityText: e.target.value,
              }))
            }
            style={{
              width: "100%",
              minHeight: "320px",
              padding: "16px",
              fontSize: "16px",
              lineHeight: "1.7",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
              resize: "vertical",
              outline: "none",
              whiteSpace: "pre-wrap", // toont alinea-witregels
              background: "#fff",
            }}
          />
        </div>
      )}
    </div>
  );
}