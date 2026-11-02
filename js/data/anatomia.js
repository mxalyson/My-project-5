// Anatomia musculoesquelética aplicada.
// Músculos: [nome, origem, inserção, inervação (raízes), ação principal]
window.MUSCULOS = {
  "Ombro e cintura escapular": [
    ["Trapézio (superior, médio, inferior)", "Linha nucal superior, protuberância occipital externa, ligamento nucal, processos espinhosos C7–T12", "Terço lateral da clavícula, acrômio, espinha da escápula", "Nervo acessório (NC XI) + C3–C4", "Superior: elevação e rotação superior da escápula; médio: retração; inferior: depressão e rotação superior"],
    ["Levantador da escápula", "Processos transversos C1–C4", "Ângulo superior e borda medial da escápula", "Dorsal da escápula (C5) + C3–C4", "Elevação e rotação inferior da escápula"],
    ["Romboides maior e menor", "Processos espinhosos C7–T5", "Borda medial da escápula", "Dorsal da escápula (C4–C5)", "Retração, elevação e rotação inferior da escápula"],
    ["Serrátil anterior", "Face externa das costelas 1–8/9", "Face anterior da borda medial da escápula", "Torácico longo (C5–C7)", "Protração e rotação superior da escápula; mantém escápula junto ao tórax (lesão → escápula alada medial)"],
    ["Peitoral menor", "Costelas 3–5", "Processo coracoide", "Peitoral medial (C8–T1)", "Depressão, protração e inclinação anterior da escápula"],
    ["Peitoral maior", "Clavícula (medial), esterno, cartilagens costais 1–6, aponeurose do oblíquo externo", "Lábio lateral do sulco intertubercular", "Peitorais lateral e medial (C5–T1)", "Adução, rotação medial e flexão horizontal do ombro"],
    ["Deltoide", "Terço lateral da clavícula, acrômio, espinha da escápula", "Tuberosidade deltoide do úmero", "Axilar (C5–C6)", "Abdução (médio), flexão e RM (anterior), extensão e RE (posterior)"],
    ["Supraespinal", "Fossa supraespinal", "Faceta superior do tubérculo maior", "Supraescapular (C5–C6)", "Abdução (início) e compressão da cabeça umeral na glenoide"],
    ["Infraespinal", "Fossa infraespinal", "Faceta média do tubérculo maior", "Supraescapular (C5–C6)", "Rotação externa; estabilização"],
    ["Redondo menor", "Borda lateral da escápula (2/3 superiores)", "Faceta inferior do tubérculo maior", "Axilar (C5–C6)", "Rotação externa"],
    ["Subescapular", "Fossa subescapular", "Tubérculo menor do úmero", "Subescapulares superior e inferior (C5–C6)", "Rotação medial; estabilizador anterior"],
    ["Redondo maior", "Ângulo inferior da escápula", "Lábio medial do sulco intertubercular", "Subescapular inferior (C5–C7)", "Adução, extensão e RM do ombro"],
    ["Latíssimo do dorso", "Processos espinhosos T7–L5, fáscia toracolombar, crista ilíaca, costelas 9–12", "Assoalho do sulco intertubercular", "Toracodorsal (C6–C8)", "Extensão, adução e RM do ombro"],
    ["Coracobraquial", "Processo coracoide", "Terço médio da face medial do úmero", "Musculocutâneo (C5–C7)", "Flexão e adução do ombro"]
  ],
  "Braço e cotovelo": [
    ["Bíceps braquial", "Cabeça longa: tubérculo supraglenoidal; curta: processo coracoide", "Tuberosidade do rádio e aponeurose bicipital", "Musculocutâneo (C5–C6)", "Flexão do cotovelo, supinação (principal), flexão do ombro"],
    ["Braquial", "Metade distal da face anterior do úmero", "Processo coronoide e tuberosidade da ulna", "Musculocutâneo (C5–C6) + radial", "Flexão do cotovelo (flexor principal em qualquer posição)"],
    ["Braquiorradial", "Crista supracondilar lateral do úmero", "Processo estiloide do rádio", "Radial (C5–C6)", "Flexão do cotovelo em semipronação"],
    ["Tríceps braquial", "Longa: tubérculo infraglenoidal; lateral e medial: face posterior do úmero", "Olécrano", "Radial (C6–C8, principalmente C7)", "Extensão do cotovelo; cabeça longa estende o ombro"],
    ["Ancôneo", "Epicôndilo lateral", "Face lateral do olécrano", "Radial (C7–C8)", "Auxilia extensão do cotovelo"],
    ["Pronador redondo", "Epicôndilo medial e processo coronoide", "Face lateral do rádio (meio)", "Mediano (C6–C7)", "Pronação e flexão do cotovelo"],
    ["Supinador", "Epicôndilo lateral, crista do supinador da ulna", "Terço proximal do rádio", "Interósseo posterior/radial profundo (C5–C6)", "Supinação"]
  ],
  "Antebraço, punho e mão": [
    ["Flexor radial do carpo", "Epicôndilo medial (tendão flexor comum)", "Base do 2º metacarpo", "Mediano (C6–C7)", "Flexão e desvio radial do punho"],
    ["Flexor ulnar do carpo", "Epicôndilo medial e olécrano", "Pisiforme, hâmulo do hamato, base do 5º metacarpo", "Ulnar (C7–T1)", "Flexão e desvio ulnar do punho"],
    ["Palmar longo", "Epicôndilo medial", "Aponeurose palmar", "Mediano (C7–C8)", "Flexão do punho (ausente em ~15%)"],
    ["Flexor superficial dos dedos", "Epicôndilo medial, coronoide, rádio", "Falanges médias 2–5", "Mediano (C7–T1)", "Flexão das IFP e MCF"],
    ["Flexor profundo dos dedos", "Ulna (face anterior) e membrana interóssea", "Falanges distais 2–5", "Mediano (interósseo anterior: 2–3) e ulnar (4–5) (C8–T1)", "Flexão das IFD"],
    ["Flexor longo do polegar", "Rádio e membrana interóssea", "Falange distal do polegar", "Interósseo anterior (C8–T1)", "Flexão da IF do polegar"],
    ["Extensor radial longo e curto do carpo", "Crista supracondilar lateral / epicôndilo lateral", "Bases do 2º e 3º metacarpos", "Radial / interósseo posterior (C6–C7)", "Extensão e desvio radial do punho (ERCC: tendinopatia lateral)"],
    ["Extensor dos dedos", "Epicôndilo lateral", "Aparelho extensor dos dedos 2–5", "Interósseo posterior (C7–C8)", "Extensão dos dedos e punho"],
    ["Extensor ulnar do carpo", "Epicôndilo lateral e ulna", "Base do 5º metacarpo", "Interósseo posterior (C7–C8)", "Extensão e desvio ulnar do punho"],
    ["Abdutor longo do polegar", "Ulna, rádio, membrana interóssea", "Base do 1º metacarpo", "Interósseo posterior (C7–C8)", "Abdução do polegar (1º compartimento — De Quervain)"],
    ["Extensor curto do polegar", "Rádio e membrana interóssea", "Base da falange proximal do polegar", "Interósseo posterior (C7–C8)", "Extensão da MCF do polegar (1º compartimento)"],
    ["Extensor longo do polegar", "Ulna e membrana interóssea", "Falange distal do polegar", "Interósseo posterior (C7–C8)", "Extensão da IF do polegar (contorna o tubérculo de Lister)"],
    ["Abdutor curto do polegar (tenar)", "Retináculo dos flexores, escafoide, trapézio", "Falange proximal do polegar", "Mediano — ramo recorrente (C8–T1)", "Abdução do polegar (testar no túnel do carpo)"],
    ["Oponente do polegar", "Retináculo dos flexores, trapézio", "1º metacarpo", "Mediano (C8–T1)", "Oposição"],
    ["Adutor do polegar", "Capitato, 2º e 3º metacarpos", "Falange proximal do polegar", "Ulnar (C8–T1)", "Adução do polegar (sinal de Froment)"],
    ["Interósseos dorsais e palmares", "Metacarpos", "Falanges proximais e aparelho extensor", "Ulnar (C8–T1)", "Dorsais abduzem (DAB), palmares aduzem (PAD), flexão MCF + extensão IF"],
    ["Lumbricais", "Tendões do flexor profundo", "Aparelho extensor", "1–2: mediano; 3–4: ulnar (C8–T1)", "Flexão MCF + extensão IF"]
  ],
  "Coluna e tronco": [
    ["Esternocleidomastoideo", "Manúbrio e terço medial da clavícula", "Processo mastoide", "Acessório (NC XI) + C2–C3", "Unilateral: inclinação ipsilateral e rotação contralateral; bilateral: flexão cervical"],
    ["Escalenos (anterior, médio, posterior)", "Processos transversos C2–C7", "1ª costela (ant./médio) e 2ª (post.)", "Ramos ventrais C3–C8", "Inclinação cervical, elevação das costelas; plexo braquial passa entre ant. e médio"],
    ["Longo do pescoço e longo da cabeça", "Corpos e processos transversos cervicais/torácicos altos", "Atlas, occipital, corpos cervicais", "Ramos ventrais C1–C6", "Flexão craniocervical (flexores profundos)"],
    ["Suboccipitais (reto posterior maior/menor, oblíquos)", "Atlas e áxis", "Occipital e atlas", "Suboccipital (C1)", "Extensão e rotação da cabeça; propriocepção"],
    ["Eretores da espinha (iliocostal, longuíssimo, espinal)", "Sacro, crista ilíaca, processos espinhosos lombares", "Costelas, processos transversos e espinhosos, mastoide", "Ramos dorsais dos nervos espinhais", "Extensão e inclinação da coluna"],
    ["Multífido", "Sacro, processos mamilares lombares, transversos", "Processos espinhosos 2–4 níveis acima", "Ramos dorsais (medial)", "Controle segmentar e extensão; atrofia associada à dor lombar"],
    ["Quadrado lombar", "Crista ilíaca e ligamento iliolombar", "12ª costela e processos transversos L1–L4", "Ramos ventrais T12–L4", "Inclinação lateral do tronco, elevação da pelve"],
    ["Reto do abdome", "Sínfise púbica e crista púbica", "Cartilagens costais 5–7 e processo xifoide", "Intercostais T7–T12", "Flexão do tronco"],
    ["Oblíquo externo", "Costelas 5–12", "Crista ilíaca, linha alba, púbis", "T7–T12", "Unilateral: rotação contralateral; bilateral: flexão"],
    ["Oblíquo interno", "Fáscia toracolombar, crista ilíaca, ligamento inguinal", "Costelas 10–12, linha alba", "T7–L1", "Rotação ipsilateral, flexão"],
    ["Transverso do abdome", "Costelas 7–12, fáscia toracolombar, crista ilíaca, ligamento inguinal", "Linha alba, púbis", "T7–L1", "Aumento da pressão intra-abdominal, tensão na fáscia toracolombar"],
    ["Diafragma", "Xifoide, costelas 7–12, corpos L1–L3 (pilares)", "Tendão central", "Frênico (C3–C5)", "Inspiração principal"]
  ],
  "Quadril e pelve": [
    ["Iliopsoas (ilíaco + psoas maior)", "Psoas: corpos e transversos T12–L5; ilíaco: fossa ilíaca", "Trocânter menor", "Psoas: ramos L1–L3; ilíaco: femoral (L2–L3)", "Flexão do quadril; psoas estabiliza coluna lombar"],
    ["Glúteo máximo", "Ílio posterior, sacro, cóccix, ligamento sacrotuberal", "Tuberosidade glútea e trato iliotibial", "Glúteo inferior (L5–S2)", "Extensão e rotação lateral do quadril"],
    ["Glúteo médio", "Face externa do ílio (entre linhas glúteas anterior e posterior)", "Face lateral do trocânter maior", "Glúteo superior (L4–S1)", "Abdução; fibras anteriores RM; estabiliza pelve no apoio unipodal (Trendelenburg)"],
    ["Glúteo mínimo", "Face externa do ílio (entre linhas glúteas anterior e inferior)", "Face anterior do trocânter maior", "Glúteo superior (L4–S1)", "Abdução e rotação medial; estabiliza cabeça femoral"],
    ["Tensor da fáscia lata", "EIAS", "Trato iliotibial", "Glúteo superior (L4–S1)", "Flexão, abdução e RM do quadril"],
    ["Piriforme", "Face anterior do sacro", "Borda superior do trocânter maior", "Nervo para o piriforme (L5–S2)", "Rotação lateral (quadril em extensão); abdução em flexão. Nervo isquiático passa abaixo (variações)"],
    ["Gêmeos, obturador interno e externo, quadrado femoral", "Ísquio, forame obturado", "Trocânter maior / fossa trocantérica / crista intertrocantérica", "Plexo sacral (L4–S2); obturador externo: obturatório", "Rotação lateral do quadril"],
    ["Adutor longo", "Corpo do púbis", "Linha áspera (terço médio)", "Obturatório (L2–L4)", "Adução e flexão do quadril (mais lesado na dor inguinal)"],
    ["Adutor curto", "Corpo e ramo inferior do púbis", "Linha pectínea e linha áspera", "Obturatório (L2–L4)", "Adução"],
    ["Adutor magno", "Ramo do ísquio e tuberosidade isquiática", "Linha áspera e tubérculo adutor", "Obturatório (L2–L4) e tibial (porção isquiotibial L4)", "Adução e extensão do quadril"],
    ["Grácil", "Corpo e ramo inferior do púbis", "Pata de ganso (tíbia medial)", "Obturatório (L2–L3)", "Adução do quadril e flexão do joelho"],
    ["Pectíneo", "Ramo superior do púbis", "Linha pectínea do fêmur", "Femoral (L2–L3) ± obturatório", "Adução e flexão do quadril"]
  ],
  "Coxa e joelho": [
    ["Reto femoral", "EIAI e sulco supra-acetabular", "Tuberosidade da tíbia (via tendão patelar)", "Femoral (L2–L4)", "Extensão do joelho e flexão do quadril (biarticular)"],
    ["Vastos lateral, medial e intermédio", "Fêmur (linha áspera, trocânter, diáfise)", "Patela e tuberosidade da tíbia", "Femoral (L2–L4)", "Extensão do joelho; VMO contribui para estabilidade patelar medial"],
    ["Sartório", "EIAS", "Pata de ganso", "Femoral (L2–L3)", "Flexão, abdução e RL do quadril; flexão do joelho"],
    ["Bíceps femoral", "Longa: tuberosidade isquiática; curta: linha áspera", "Cabeça da fíbula", "Longa: tibial (L5–S2); curta: fibular comum (L5–S2)", "Flexão do joelho, RL da tíbia, extensão do quadril (longa) — mais lesado no sprint"],
    ["Semitendíneo", "Tuberosidade isquiática", "Pata de ganso", "Tibial (L5–S2)", "Flexão do joelho, RM da tíbia, extensão do quadril"],
    ["Semimembranoso", "Tuberosidade isquiática", "Côndilo medial da tíbia (posterior)", "Tibial (L5–S2)", "Flexão do joelho, RM, extensão do quadril (lesões tipo stretching)"],
    ["Poplíteo", "Côndilo lateral do fêmur e menisco lateral", "Tíbia posterior proximal", "Tibial (L4–S1)", "'Destrava' o joelho (RL do fêmur / RM da tíbia)"]
  ],
  "Perna, tornozelo e pé": [
    ["Tibial anterior", "Côndilo lateral e 2/3 proximais da tíbia", "Cuneiforme medial e base do 1º metatarso", "Fibular profundo (L4–L5)", "Dorsiflexão e inversão (fraqueza = pé caído — L4/L5)"],
    ["Extensor longo do hálux", "Fíbula média e membrana interóssea", "Falange distal do hálux", "Fibular profundo (L5)", "Extensão do hálux (miótomo L5)"],
    ["Extensor longo dos dedos", "Côndilo lateral da tíbia e fíbula", "Falanges média e distal 2–5", "Fibular profundo (L5–S1)", "Extensão dos dedos e dorsiflexão"],
    ["Fibulares longo e curto", "Fíbula lateral", "Longo: 1º metatarso/cuneiforme medial; curto: base do 5º metatarso", "Fibular superficial (L5–S1)", "Eversão e flexão plantar; estabilizadores laterais do tornozelo"],
    ["Gastrocnêmio", "Côndilos femorais medial e lateral", "Calcâneo (via tendão calcâneo)", "Tibial (S1–S2)", "Flexão plantar (joelho estendido) e flexão do joelho"],
    ["Sóleo", "Tíbia (linha do sóleo) e fíbula posterior", "Calcâneo (via tendão calcâneo)", "Tibial (S1–S2)", "Flexão plantar (principal em joelho fletido e na corrida)"],
    ["Tibial posterior", "Tíbia, fíbula e membrana interóssea (posterior)", "Navicular, cuneiformes, bases metatarsos 2–4", "Tibial (L4–L5)", "Inversão e flexão plantar; sustenta arco longitudinal medial (disfunção → pé plano adquirido)"],
    ["Flexor longo do hálux", "Fíbula posterior", "Falange distal do hálux", "Tibial (S2–S3)", "Flexão do hálux; suporte do arco"],
    ["Flexor longo dos dedos", "Tíbia posterior", "Falanges distais 2–5", "Tibial (S2–S3)", "Flexão dos dedos"],
    ["Intrínsecos plantares (abdutor do hálux, flexor curto dos dedos, quadrado plantar...)", "Calcâneo e fáscia plantar", "Falanges", "Plantares medial e lateral (S1–S3)", "Suporte do arco ('core do pé')"]
  ]
};

// Ossos com acidentes de interesse clínico
window.OSSOS = [
  { regiao: "Coluna", itens: [
    ["Atlas (C1)", "Sem corpo; massas laterais articulam com côndilos occipitais (flexão/extensão — 'sim')."],
    ["Áxis (C2)", "Dente (odontoide) — pivô da rotação C1-C2 (~50% da rotação cervical — 'não')."],
    ["Vértebras cervicais C3–C7", "Forame transverso (artéria vertebral C6–C1), articulações uncovertebrais, processo espinhoso bífido; C7 = proeminente."],
    ["Vértebras torácicas", "Fóveas costais; facetas no plano frontal (favorecem rotação)."],
    ["Vértebras lombares", "Corpos grandes; facetas no plano sagital (favorecem flexão/extensão); pars interarticularis (espondilólise)."],
    ["Sacro e cóccix", "Articulação sacroilíaca (superfície auricular); EIPS no nível de S2."]
  ]},
  { regiao: "Membro superior", itens: [
    ["Clavícula", "Fratura mais comum no terço médio; articulações esternoclavicular e acromioclavicular."],
    ["Escápula", "Acrômio, coracoide, espinha, glenoide, tubérculos supra/infraglenoidal; ângulo inferior ≈ T7."],
    ["Úmero", "Tubérculos maior e menor, sulco intertubercular (cabeça longa do bíceps), colo cirúrgico (nervo axilar), sulco do radial (diáfise), epicôndilos."],
    ["Rádio", "Cabeça (fratura em queda), tuberosidade (bíceps), tubérculo de Lister, estiloide radial; fratura distal = Colles."],
    ["Ulna", "Olécrano, coronoide, incisura troclear, estiloide ulnar."],
    ["Carpo", "Fileira proximal: escafoide, semilunar, piramidal, pisiforme; distal: trapézio, trapezoide, capitato, hamato. Escafoide: risco de necrose (tabaqueira anatômica)."],
    ["Metacarpos e falanges", "Fratura do boxeador = colo do 5º metacarpo."]
  ]},
  { regiao: "Membro inferior", itens: [
    ["Pelve (ílio, ísquio, púbis)", "EIAS, EIAI, crista ilíaca, tuberosidade isquiática (isquiotibiais), sínfise púbica, acetábulo."],
    ["Fêmur", "Cabeça, colo (ângulo de inclinação ~125°, anteversão ~15°), trocânter maior (glúteos) e menor (iliopsoas), linha áspera, côndilos, tubérculo adutor."],
    ["Patela", "Maior sesamoide; aumenta braço de alavanca do quadríceps."],
    ["Tíbia", "Platô tibial, tuberosidade (tendão patelar), tubérculo de Gerdy (trato iliotibial), maléolo medial."],
    ["Fíbula", "Cabeça (bíceps femoral, LCL; nervo fibular comum contorna o colo), maléolo lateral."],
    ["Tarso", "Tálus (sem inserções musculares, risco de necrose), calcâneo, navicular (fratura por estresse de alto risco), cuboide, cuneiformes."],
    ["Metatarsos e falanges", "Base do 5º metatarso (fibular curto — fratura de Jones na junção metáfise-diáfise tem risco de pseudoartrose)."]
  ]}
];

// Plexos e nervos periféricos
window.NERVOS = [
  ["Axilar (C5–C6)", "Deltoide, redondo menor", "Face lateral do ombro ('insígnia do sargento')", "Luxação anterior do ombro, fratura do colo cirúrgico"],
  ["Musculocutâneo (C5–C7)", "Coracobraquial, bíceps, braquial", "Face lateral do antebraço", "Raramente lesado isoladamente"],
  ["Radial (C5–T1)", "Tríceps, braquiorradial, extensores de punho e dedos, supinador", "Dorso da mão (1ª comissura)", "Fratura da diáfise do úmero ('mão caída'), 'paralisia do sábado'; interósseo posterior no supinador (arcada de Frohse)"],
  ["Mediano (C6–T1)", "Flexores do antebraço (exceto FUC e metade ulnar do FPD), tenares laterais, lumbricais 1–2", "Face palmar dos dedos 1–3 e metade radial do 4º", "Túnel do carpo; pronador redondo; 'mão de bênção' (lesão alta)"],
  ["Ulnar (C8–T1)", "FUC, FPD 4–5, hipotênares, interósseos, adutor do polegar, lumbricais 3–4", "Dedo mínimo e metade ulnar do 4º", "Túnel cubital (cotovelo), canal de Guyon; 'mão em garra'; sinal de Froment"],
  ["Torácico longo (C5–C7)", "Serrátil anterior", "—", "Escápula alada medial (carregar peso no ombro, cirurgia axilar)"],
  ["Supraescapular (C5–C6)", "Supraespinal, infraespinal", "—", "Incisura supraescapular / espinoglenoidal (atletas overhead)"],
  ["Femoral (L2–L4)", "Quadríceps, sartório, ilíaco, pectíneo", "Face anterior da coxa; safeno: face medial da perna", "Reflexo patelar (L4); Teste de Ely/PKB (tensão neural)"],
  ["Obturatório (L2–L4)", "Adutores, grácil, obturador externo", "Face medial da coxa", "Cirurgia pélvica, parto"],
  ["Cutâneo femoral lateral (L2–L3)", "—", "Face anterolateral da coxa", "Meralgia parestésica (cintos apertados, obesidade, gestação)"],
  ["Glúteo superior (L4–S1)", "Glúteos médio e mínimo, TFL", "—", "Marcha de Trendelenburg"],
  ["Glúteo inferior (L5–S2)", "Glúteo máximo", "—", "Dificuldade para subir escadas/levantar"],
  ["Isquiático (L4–S3)", "Isquiotibiais; divide-se em tibial e fibular comum", "—", "Fratura/luxação posterior do quadril, injeção glútea"],
  ["Tibial (L4–S3)", "Flexores plantares, tibial posterior, flexores dos dedos, intrínsecos plantares", "Planta do pé (via plantares)", "Túnel do tarso"],
  ["Fibular comum (L4–S2)", "Fibular profundo: dorsiflexores; superficial: fibulares", "Profundo: 1º espaço interdigital; superficial: dorso do pé", "Colo da fíbula (cruzar pernas, gesso, joelho varo traumático) → pé caído"],
  ["Sural (S1–S2)", "—", "Borda lateral do pé", "Fratura do 5º metatarso, biópsia"]
];

// Dermátomos, miótomos e reflexos
window.NEURO_SEG = [
  ["C4", "Topo do ombro", "Elevação da escápula (encolher ombros)", "—"],
  ["C5", "Face lateral do braço (deltoide)", "Abdução do ombro", "Bicipital (C5–C6)"],
  ["C6", "Face lateral do antebraço, polegar e indicador", "Flexão do cotovelo / extensão do punho", "Braquiorradial (C6)"],
  ["C7", "Dedo médio", "Extensão do cotovelo / flexão do punho", "Tricipital (C7)"],
  ["C8", "Dedos anular e mínimo, borda ulnar do antebraço", "Flexão dos dedos / extensão do polegar", "—"],
  ["T1", "Face medial do braço", "Abdução/adução dos dedos (interósseos)", "—"],
  ["T4", "Linha mamilar", "—", "—"],
  ["T10", "Umbigo", "—", "—"],
  ["L1", "Região inguinal", "Flexão do quadril", "—"],
  ["L2", "Face anterior/medial da coxa proximal", "Flexão do quadril", "—"],
  ["L3", "Face anterior/medial da coxa distal e joelho", "Extensão do joelho", "Patelar (L3–L4)"],
  ["L4", "Face medial da perna e maléolo medial", "Dorsiflexão do tornozelo", "Patelar (L4)"],
  ["L5", "Face lateral da perna, dorso do pé e hálux", "Extensão do hálux", "Isquiotibiais mediais (L5) — pouco confiável"],
  ["S1", "Borda lateral do pé, planta, calcanhar", "Flexão plantar / eversão", "Aquileu (S1)"],
  ["S2", "Face posterior da coxa", "Flexão do joelho", "—"],
  ["S3–S5", "Região perianal (sela)", "Esfíncteres", "Anal / bulbocavernoso — CAUDA EQUINA"]
];

// Artrocinemática: padrão capsular e posições
window.ARTICULACOES = [
  ["Glenoumeral", "Esferoide (convexo sobre côncavo: rola e desliza em sentidos opostos)", "RE > Abdução > RM", "Repouso: 55° abdução, 30° adução horizontal · Travamento: abdução máxima + RE"],
  ["Acromioclavicular", "Plana", "Dor nos extremos de ADM", "Repouso: braço ao lado · Travamento: abdução 90°"],
  ["Umeroulnar (cotovelo)", "Gínglimo", "Flexão > Extensão", "Repouso: 70° flexão, 10° supinação · Travamento: extensão + supinação"],
  ["Radiocarpal (punho)", "Elipsoide", "Flexão = Extensão", "Repouso: neutro com leve desvio ulnar · Travamento: extensão + desvio radial"],
  ["Coxofemoral", "Esferoide", "RM > Flexão > Abdução (> extensão)", "Repouso: 30° flexão, 30° abdução, leve RL · Travamento: extensão + RM + abdução"],
  ["Tibiofemoral (joelho)", "Gínglimo modificado (côncavo sobre convexo: rola e desliza no mesmo sentido — tíbia)", "Flexão > Extensão", "Repouso: 25° flexão · Travamento: extensão + RL da tíbia"],
  ["Talocrural (tornozelo)", "Gínglimo", "Flexão plantar > Dorsiflexão", "Repouso: 10° flexão plantar · Travamento: dorsiflexão máxima"],
  ["Subtalar", "Plana/complexa", "Inversão (varo) > eversão", "Repouso: neutro · Travamento: supinação"],
  ["Facetárias cervicais e lombares", "Planas", "Inclinação = rotação > extensão (lombar: inclinação e rotação igualmente limitadas > extensão)", "Travamento: extensão"]
];
