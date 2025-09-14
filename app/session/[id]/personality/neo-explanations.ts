// neo-explanations.ts

export const neoExplanations = {
    normScores: `
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
  `,
  
    structuur: `
  ### BELANGRIJKE STRUCTUUR:
  - **Hoofdtrekken** (5 stuks): Geven het GEMIDDELDE aan van alle facetten binnen dat domein
  - **FACETTEN** (30 stuks): Specifieke aspecten binnen elk hoofdtrek
  `,
  
    hoofdtrekken: {
      neuroticisme: {
        titel: "Neuroticisme",
        omschrijving: "Dit brede en belangrijke domein contrasteert emotionele stabiliteit met emotionele labiliteit. Het domein Neuroticisme wordt ook wel aangeduid als gegeneraliseerde angst omdat personen die hoog op dit domein scoren sterk geneigd zijn angst of andere negatieve gevoelens te ervaren. Het domein omvat naast de geneigdheid tot onwelbevinden ook het omgaan met frustratie en stress. De term 'neuroticisme' heeft voor velen een negatieve klank. Om deze reden wordt voor dit domein vaak gekozen voor de term 'emotionele stabiliteit'.",
        facetten: {
          N1: "Angst: Angstige mensen zijn ongerust, gauw bang en zorgelijk, nerveus, gespannen en schrikachtig. In klinische termen is de door deze schaal gemeten angst meer manifest dan latent. De schaal meet geen specifieke angsten, maar hoogscoorders hebben vaker zulke angsten of fobieën, als ook onbepaalde angst. De score op dit facet is relatief gevoelig voor beïnvloeding door de (tijdelijke) toestand van de persoon.",
          N2: "Ergernis: Ergernis vertegenwoordigt de neiging tot het ervaren van frustratie, boosheid en haatgevoelens. Deze schaal meet de frequentie waarmee en de mate waarin iemand boosheid en dergelijke ervaart; het uiten van die gevoelens met agressie volgt hieruit niet noodzakelijk, en hangt onder meer af van iemands positie in het domein Altruïsme.",
          N3: "Depressie: Deze schaal meet normale individuele verschillen in de ontvankelijkheid voor depressieve gevoelens. Hoogscoorders zijn ontvankelijk voor gevoelens van schuld, verdriet, hopeloosheid en eenzaamheid. Ze zijn snel ontmoedigd en makkelijk uit het veld te slaan. Laagscoorders zijn niet per se vrolijk en opgewekt van aard, maar hebben gewoon zelden depressieve gevoelens.",
          N4: "Schaamte: Gevoelens van schaamte en verlegenheid vormen de kern van dit facet. Mensen die hoog op het schaamtefacet scoren, voelen zich niet op hun gemak in het gezelschap van anderen. Ze voelen zich snel bekeken en beoordeeld; ze zijn gevoelig voor spot, en ontvankelijk voor gevoelens van minderwaardigheid of voor een lage zelfdunk. Schaamte is verwant aan wat vaak 'sociale angst' wordt genoemd.",
          N5: "Impulsiviteit: Impulsiviteit verwijst naar het onvermogen om verlangens, impulsen en gevoelens te beheersen. Behoeften (bijvoorbeeld aan eten, sigaretten, bezittingen) worden als zo sterk ervaren dat het individu deze niet kan weerstaan, hoewel hij of zij het gedrag later kan betreuren. Laagscoorders vinden het gemakkelijk verleidingen te weerstaan en hebben een hoge frustratietolerantie. De term 'impulsiviteit' (zoals deze in de NEO-PI-3 gebruikt wordt) dient niet verward te worden met spontaniteit, het nemen van risico's of het zeer snel (in de tijd gezien) nemen van beslissingen.",
          N6: "Kwetsbaarheid: Het facet Kwetsbaarheid verwijst naar het hanteren van moeilijke en stressvolle situaties. Hoogscoorders zijn stressgevoelig en voelen zich niet in staat met spanning en stresssituaties om te gaan. In crisissituaties worden ze afhankelijk, voelen ze zich hopeloos of raken ze in paniek. Zij die laag scoren ervaren zichzelf als competent en in staat moeilijke situaties te hanteren of zich er uit te redden.",
        },
      },
      extraversie: {
        titel: "Extraversie",
        omschrijving: "Met het begrippenpaar extraversie - introversie wordt een naar buiten respectievelijk naar binnen gerichte energie, aandacht en oriëntatie aangeduid. Onderzoek ondersteunt de opvatting dat introverte mensen niet zozeer het tegenovergestelde van extraverte mensen laten zien maar de afwezigheid van uitgesproken extraverte kenmerken.",
        facetten: {
          E1: "Hartelijkheid: Hartelijkheid in de omgang bevordert het totstandkomen van een emotionele band tussen mensen, door de warmte en genegenheid die wordt getoond. Hartelijke mensen zijn vriendelijk en tonen in hun aandacht voor anderen dat ze echt op mensen gesteld zijn. Laagscoorders zijn meer gereserveerd, op een afstand en formeel in hun manier van doen.",
          E2: "Sociabiliteit: Sociabiliteit is een tweede aspect van extraversie: de voorkeur in het gezelschap van anderen te verkeren. Sociabele mensen zoeken gezelschap en houden van de drukte en activiteit van grote groepen mensen. Ze worden gestimuleerd door gezelschap; contacten met anderen zijn de motor voor hun activiteiten. Laagscoorders zoeken geen gezelschap, vermijden het soms actief en prefereren het regelmatig om alleen te zijn.",
          E3: "Dominantie: Het gedrag van hoogscoorders op deze schaal is dominant, krachtig en overheersend. Ze spreken zonder aarzeling en krijgen of nemen vaak de leiding in groepen. In gesprekken en bijeenkomsten zijn ze veel aan het woord. Laagscoorders blijven liever op de achtergrond en laten anderen het woord doen.",
          E4: "Energie: Hoogscoorders worden gekenmerkt door een hoog tempo en krachtige bewegingen. Ze hebben steeds de behoefte bezig te zijn en stralen een gevoel van energie uit. Energieke mensen leiden een druk, vol en vaak gehaast leven waar vaart in zit. Mensen die laag scoren op deze schaal zijn kalmer en minder gedreven en ze houden van een meer ontspannen levensstijl.",
          E5: "Avonturisme: Hoogscoorders op deze schaal hebben een hang naar opwinding, stimulering en actie. Ze houden van heldere kleuren, lawaaiige omgevingen en prikkelende sensaties. Avonturisme is verwant aan sensatie zoeken. Laagscoorders hebben weinig behoefte aan sensaties en houden van een rustig en vredig leven dat sommigen saai zouden vinden.",
          E6: "Vrolijkheid: Hoogscoorders op deze facetschaal hebben vaak plezier en voelen zich vaak blij en gelukkig. Ze lachen veel en gemakkelijk, zijn opgewekt en optimistisch. Laagscoorders zijn niet noodzakelijkerwijs ongelukkig; ze zijn wel minder vrolijk en uitbundig in hun gedrag en ervaringen. Van alle facetten van het domein Extraversie is Vrolijkheid de beste voorspeller van een algeheel gevoel van geluk en welbevinden.",
        },
      },
      openheid: {
        titel: "Openheid",
        omschrijving: "De volledige naam voor dit domein is eigenlijk 'Openheid voor ervaringen', waarmee vooral een bepaalde geesteshouding wordt aangeduid. Elementen van Openheid zoals verbeeldingskracht, sensitiviteit, intellectuele nieuwsgierigheid en een onafhankelijk oordeel zijn aspecten die in veel theorieën over persoonlijkheid een rol spelen. Men is geneigd Openheid als een teken van volwassenheid en psychische gezondheid te zien. Waarde en nut van geslotenheid en openheid hangen echter sterk af van de eisen die de situatie stelt.",
        facetten: {
          O1: "Fantasie: Hoogscoorders op deze schaal hebben een actieve en levendige fantasie. Dagdromen is voor hen niet eenvoudigweg een ontsnapping, maar een manier om een interessant innerlijk leven te creëren. Ze ontwikkelen hun fantasieën en werken die uit, en voelen dat als een verrijking en creatieve noodzaak in hun leven. Laagscoorders zijn prozaïsch en blijven graag met beide benen op de grond staan.",
          O2: "Esthetiek: Mensen die hoog scoren op deze schaal hebben een diepe innerlijke waardering voor kunst en schoonheid. Zij worden ontroerd door poëzie, voelen zich geheel opgenomen in muziek en worden geïntrigeerd door beeldende kunst. Hoogscoorders hebben niet per se een artistiek talent of zelfs maar wat de meeste mensen een goede smaak vinden. Laagscoorders zijn relatief ongevoelig voor kunst en schoonheid en zijn daarin weinig geïnteresseerd.",
          O3: "Gevoelens: Openheid voor gevoelens houdt ontvankelijkheid in voor de eigen innerlijke gevoelens. De houding ten opzichte van emoties is positief; emotie wordt als een belangrijk deel van het leven gezien. Hoogscoorders ervaren een breed en genuanceerd scala aan emotionele ervaringen en voelen geluk en ongeluk sterker dan anderen. Laagscoorders hebben weinig aandacht voor hun eigen gevoelens, leven er grotendeels aan voorbij en vinden hen niet heel belangrijk.",
          O4: "Verandering: Dit facet omvat Openheid voor verandering, voor variatie, voor nieuwe ervaringen. Die openheid is niet alleen passief, maar houdt ook de nieuwsgierigheid in naar alles wat nieuw en anders is voor de persoon, een hang naar variatie en afwisseling. Laagscoorders geven de voorkeur aan het bekende en vertrouwde, aan routine in plaats van aan verandering en variatie.",
          O5: "Ideeën: Dit aspect van Openheid heeft betrekking op intellectuele nieuwsgierigheid. Deze trek herkent men niet alleen in een actieve interesse in intellectuele bezigheden als zodanig, maar ook in het openstaan staan voor nieuwe, onconventionele ideeën en de bereidheid die te overwegen. Hoogscoorders hebben zowel plezier in filosofische gesprekken als in ingewikkelde puzzels. Laagscoorders hebben een beperkte interesse; als ze intelligent zijn concentreren ze hun talent op een smal en afgeperkt gebied.",
          O6: "Waarden: Openheid voor waarden houdt in dat men bereid is sociale, politieke en religieuze waarden tegen het licht te houden en te heroverwegen. Hoogscoorders kenmerken zich eerder door (al dan niet methodische) twijfel en een kritische, zoekende houding dan door zekerheden en vaste overtuigingen. Gesloten mensen neigen er toe autoriteit te accepteren; zij houden vaste waarden en tradities in ere, en zijn in die zin conservatief. Openstaan voor waarden kan gezien worden als het tegendeel van dogmatisme.",
        },
      },
      altruisme: {
        titel: "Altruïsme",
        omschrijving: "Altruïsme vertegenwoordigt de oriëntatie van het individu op de ervaringen, belangen en doelen van anderen. De sympathieke pool van dit domein wordt vaak gezien als sociaal gewenst en psychologisch gezonder. Toch vertegenwoordigen beide polen een positieve waarde voor de persoon en de omgeving. De neiging om voor de eigen belangen op te komen is in sommige situaties van grote waarde. Een sceptische houding en kritisch denken, ook antagonistische instellingen, zijn belangrijke voorwaarden voor bijvoorbeeld wetenschappelijke vooruitgang en democratische controle. Net zoals geen van beide polen van Altruïsme intrinsiek beter is vanuit het gezichtspunt van de samenleving, zijn zij noodzakelijk beter voor de psychische gezondheid van het individu.",
        facetten: {
          A1: "Vertrouwen: Vertrouwen kan worden omschreven als de neiging om van andere mensen als vanzelfsprekend aan te nemen dat ze van goede wil zijn. Hoogscoorders zijn geneigd te geloven dat anderen eerlijk zijn en met de beste bedoelingen handelen. Laagscoorders hebben een sceptische instelling, en zijn meer geneigd anderen bij voorbaat als onbetrouwbaar of gevaarlijk te zien.",
          A2: "Oprechtheid: Oprechte personen zijn eerlijk, oprecht, direct en ongekunsteld in hun sociale gedrag. Ze zijn niet berekenend in hun sociale gedrag. Laagscoorders zijn bereid anderen te manipuleren met vleierij, trucs en kleine of halve onwaarheden. Zij zien zulke tactieken als noodzakelijke sociale vaardigheden en vinden de oprechtheid van anderen vaak naïef.",
          A3: "Zorgzaamheid: Hoogscoorders zijn onbaatzuchtig, hulpvaardig en zorgzaam voor anderen. Ze tonen een actieve bereidheid anderen te helpen en voor anderen te zorgen waar dat nodig is. Laagscoorders zijn egocentrisch, en vermijden het betrokken te raken bij andermans problemen. Zorgzaamheid is een centraal facet van het domein Altruïsme en vormt het hart van de betekenis van Altruïsme als instelling.",
          A4: "Inschikkelijkheid: Dit facet betreft de omgang met voorziene of optredende interpersoonlijke conflicten. Hoogscoorders zijn geneigd tot toegeven, vermijden ruzie en bedwingen hun boosheid. Ze zijn zachtaardig en mild en schikken zich naar de ander als het er op aankomt. Deze bereidheid mee te werken kan gekwalificeerd worden als 'vriendelijke volgzaamheid'. Laagscoorders reageren in zulke situaties competitief en agressief, houden hun boosheid niet in maar uiten die gemakkelijk.",
          A5: "Bescheidenheid: Hoogscoorders op deze schaal zijn bescheiden en blijven graag op de achtergrond. Dat zegt echter niets over hun zelfvertrouwen en zelfwaardering, die stevig en positief kunnen zijn. Laagscoorders vinden zichzelf beter dan anderen en worden al gauw arrogant gevonden door anderen.",
          A6: "Medeleven: Deze facetschaal meet een houding van sympathie en bezorgdheid voor het lot van andere mensen. Hoogscoorders worden bewogen door het leed en de behoeften van anderen, zijn mild in hun oordeel over anderen, en geneigd de menselijke kant te benadrukken in allerlei maatschappelijke vraagstukken. Laagscoorders nemen een nuchter-zakelijke houding aan tegenover menselijke problemen, en zijn minder snel geroerd door een beroep op hun medeleven.",
        },
      },
      conscientieusheid: {
        titel: "Consciëntieusheid",
        omschrijving: "Consciëntieus gedrag houdt in: doen wat de dominante omgeving vraagt en nalaten wat daar verstorend werkt en ongewenst is. Consciëntieusheid kan echter ook slaan op het proces van doen wat moet: een proactief proces van het plannen, organiseren en uitvoeren van taken die men op zich heeft genomen. Beide varianten van Consciëntieusheid hangen sterk samen en vormen gezamenlijk een brede persoonlijkheidsdimensie die discipline en conformeren aan normen uit de omgeving als kern heeft.",
        facetten: {
          C1: "Doelmatigheid: Het facet Doelmatigheid verwijst naar de ervaring van mensen dat zij bekwaam, verstandig en effectief zijn inzake de opgaven die het leven hun stelt. Hoogscoorders voelen zich uitstekend tegen het leven opgewassen, terwijl laagscoorders dat gevoel nu juist missen.",
          C2: "Ordelijkheid: Hoogscoorders op deze facetschaal zijn precies, ordelijk en systematisch en zij organiseren hun zaken goed en planmatig. Laagscoorders zijn slordig en onsystematisch; zij slagen er nauwelijks in hun taken, afspraken, plannen en bezittingen goed te organiseren.",
          C3: "Betrouwbaarheid: Deze facetschaal meet de mate waarin iemand zich in het gedrag strikt houdt aan ethische principes en normen. Hoogscoorders zijn betrouwbaar, komen hun beloften en afspraken na, en handelen naar de plichten die hun geweten aan hen oplegt. Laagscoorders gaan met zulke zaken wat gemakkelijk of zelfs nonchalant om, en kunnen enigszins onbetrouwbaar zijn.",
          C4: "Ambitie: Ambitie en prestatiedrang is een belangrijk onderdeel van het domein Consciëntieusheid. Hoogscoorders hebben een hoog aspiratieniveau en werken hard om hun doelen te bereiken. Ze zijn ijverig en doelgericht. Laagscoorders hebben geen sterke behoefte aan presteren en succes, zijn moeilijk tot prestaties te motiveren en weinig ambitieus.",
          C5: "Zelfdiscipline: Zelfdiscipline is het vermogen eenmaal begonnen taken door te zetten en af te maken ondanks eventuele verveling en afleidingen. Hoogscoorders hebben het vermogen zichzelf te motiveren om het karwei af te maken. Laagscoorders beginnen eerder met uitstellen (procrastinatie), zijn sneller ontmoedigd en geven het eerder op. Zelfdiscipline onderscheidt zich van het beheersen van impulsen (één van de facetten van Neuroticisme), doordat zelfdiscipline verwijst naar een meer proactieve vasthoudendheid bij opdrachten die niet direct aantrekkelijk zijn.",
          C6: "Bedachtzaamheid: Het facet Bedachtzaamheid slaat op de neiging tot zorgvuldig nadenken, gevolgen anticiperen en afwegen alvorens te handelen. Hoogscoorders zijn voorzichtig en gaan weloverwogen te werk. Laagscoorders zijn haastig en spontaan in beslissingen en gedrag, en spreken of handelen vaak voordat ze de gevolgen doordacht hebben.",
        },
      },
    },
  };