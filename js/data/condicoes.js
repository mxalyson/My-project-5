// Condições musculoesqueléticas: hipóteses, raciocínio, prognóstico e conduta por fase.
// "achados": pesos que favorecem a hipótese. "contra": achados que a tornam menos provável.
// Conduta organizada por fase do reparo: inflamatoria (aguda) / proliferativa (subaguda) / remodelacao (crônica/retorno).
window.CONDICOES = [
  // =============================== LOMBAR ===============================
  {
    id: "lbp_inespecifica", nome: "Dor lombar inespecífica (mecânica)", regiao: "lombar", tecido: "disco",
    resumo: "Dor lombar sem causa patoanatômica específica identificável (≈ 90% dos casos). Diagnóstico após triagem de red flags e radiculopatia. Classificar por tempo: aguda < 6 sem, subaguda 6–12 sem, crônica > 12 sem.",
    achados: { l_local: 4, mecanica: 3, insidioso: 1, carga: 1, l_centraliza: 1, meia: 1 },
    contra: { l_irradiada: 2, l_deficit: 3, l_caminhar: 2, rigidez_longa: 2, l_melhora_exerc: 2 },
    testes: ["repetidos", "prone_instab", "slr"],
    diferencial: ["Radiculopatia lombar", "Estenose lombar", "Dor sacroilíaca", "Espondiloartrite axial", "Dor visceral referida (renal, aorta, ginecológica)", "Fratura vertebral por fragilidade"],
    encaminhar: ["Qualquer red flag", "Déficit neurológico progressivo", "Ausência de melhora em 4–6 semanas com sinais atípicos"],
    prognostico: {
      texto: "Favorável na fase aguda: grande melhora nas primeiras 6 semanas, porém ~1/3 mantém dor em 1 ano e recorrências são comuns. Fatores psicossociais predizem cronificação melhor que achados físicos ou de imagem.",
      bom: ["Primeiro episódio", "Baixo medo-evitação", "Expectativa positiva de recuperação", "Centralização dos sintomas", "Retorno precoce às atividades/trabalho"],
      ruim: ["STarT Back alto risco", "Catastrofização, depressão", "Dor irradiada associada", "Afastamento prolongado do trabalho", "Episódios prévios / cronicidade", "Baixa autoeficácia"]
    },
    conduta: {
      inflamatoria: ["Educação: tranquilizar, dor ≠ dano, prognóstico favorável, evitar imagem desnecessária", "Manter-se ativo; evitar repouso no leito", "Calor superficial pode ajudar a curto prazo", "Terapia manual/manipulação como adjunto (efeito pequeno)", "Exercício na preferência direcional, se houver"],
      proliferativa: ["Exercício terapêutico progressivo (qualquer modalidade: controle motor, pilates, força, aeróbico — efeitos semelhantes)", "Triagem STarT Back para estratificar intensidade do cuidado", "Reduzir medo-evitação com exposição gradual"],
      remodelacao: ["Crônica: exercício + abordagem psicologicamente informada (terapia cognitivo-funcional, educação em neurociência da dor)", "Atividade gradual (graded activity) com metas funcionais", "Retorno ao trabalho como objetivo terapêutico", "Evitar: eletroterapia isolada (TENS, ultrassom), órteses lombares, tração isolada"]
    },
    evidencia: [
      { ref: "NICE NG59 — Low back pain and sciatica in over 16s (2016, atualizado 2020)", msg: "Recomenda: estratificação de risco, educação, exercício, terapia manual SOMENTE junto com exercício, abordagem psicológica em quem tem barreiras. NÃO recomenda: TENS, ultrassom, tração, órteses, acupuntura, imagem de rotina, paracetamol isolado, opioides para dor crônica." },
      { ref: "George SZ et al. JOSPT 2021 — CPG Low Back Pain (Revision 2021)", msg: "Exercício (força/resistência, coordenação/estabilização, aeróbico) e educação em neurociência da dor recomendados para dor crônica; terapia manual com recomendação moderada na aguda e crônica." },
      { ref: "Foster NE et al. Lancet 2018 — Prevention and treatment of low back pain", msg: "Diretrizes convergem: autogerenciamento, atividade física, exercício e terapias psicológicas; a prática real ainda usa demais imagem, opioides e cirurgia." },
      { ref: "Hayden JA et al. Cochrane 2021 — Exercise therapy for chronic low back pain", msg: "Exercício reduz dor (moderada certeza) comparado a nenhum tratamento/cuidado usual, com efeito clinicamente relevante pequeno a moderado." },
      { ref: "Hill JC et al. Lancet 2011 — STarT Back trial", msg: "Cuidado estratificado (baixo, médio, alto risco) melhorou incapacidade e reduziu custos." }
    ],
    desfechos: ["Oswestry (ODI)", "Roland-Morris", "STarT Back", "NPRS", "PSFS"]
  },
  {
    id: "radiculopatia_lombar", nome: "Radiculopatia lombar (hérnia discal / 'ciática')", regiao: "lombar", tecido: "nervo",
    resumo: "Dor irradiada no território de uma raiz (mais comum L5 e S1), frequentemente pior na perna que nas costas, com ou sem déficit neurológico. Causa mais comum: hérnia discal em adultos de 30–50 anos.",
    achados: { l_irradiada: 5, l_slr: 4, l_tosse: 2, l_sentado: 2, parestesia: 2, l_deficit: 3, meia: 1 },
    contra: { l_caminhar: 2, idoso: 1, l_local: 2 },
    testes: ["slr", "slr_cruzado", "slump", "repetidos"],
    diferencial: ["Estenose lombar (foraminal)", "Dor referida somática (facetária/SIJ não ultrapassa joelho de forma dermatomal)", "Neuropatia periférica (fibular, diabética)", "Síndrome do piriforme / dor glútea profunda", "Cauda equina (bilateral + esfíncteres)"],
    encaminhar: ["Sinais de cauda equina — EMERGÊNCIA", "Déficit motor progressivo ou grave (ex.: pé caído)", "Dor intratável apesar de analgesia adequada após 6–12 semanas (avaliação cirúrgica)"],
    prognostico: {
      texto: "A maioria melhora em 6–12 semanas; hérnias (especialmente extrusões/sequestros) frequentemente regridem espontaneamente. Cirurgia acelera alívio da dor na perna, mas resultados em 1–2 anos são semelhantes ao conservador na maioria (Peul et al., NEJM 2007).",
      bom: ["Centralização", "Hérnia extrusa/sequestrada (maior reabsorção)", "Baixa catastrofização", "Melhora rápida nas primeiras semanas"],
      ruim: ["Periferalização persistente", "Déficit neurológico importante", "Alta intensidade de dor na perna inicial", "Fatores psicossociais desfavoráveis", "Duração longa dos sintomas"]
    },
    conduta: {
      inflamatoria: ["Educação: prognóstico favorável, evitar repouso", "Posições de alívio; preferência direcional (MDT) se houver centralização", "Neurodinâmica suave com sliders se não irritável", "Analgesia conforme médico"],
      proliferativa: ["Exercício progressivo geral + específico", "Mobilização neural (sliders → tensioners)", "Manter atividade e retorno gradual ao trabalho", "Monitorar sinais neurológicos a cada sessão"],
      remodelacao: ["Fortalecimento global e de tronco/MMII", "Condicionamento aeróbico", "Considerar avaliação cirúrgica se dor incapacitante > 6–12 sem com correlação clínica-imagem"]
    },
    evidencia: [
      { ref: "NICE NG59 (2016/2020)", msg: "Mesmas recomendações da dor lombar; considerar descompressão espinhal quando o tratamento conservador falhou e há achados de imagem concordantes." },
      { ref: "Peul WC et al. NEJM 2007 — Surgery vs prolonged conservative treatment for sciatica", msg: "Cirurgia precoce acelerou recuperação, mas em 1 ano os resultados foram semelhantes." },
      { ref: "Brinjikji W et al. AJNR 2015", msg: "Achados degenerativos de disco são muito prevalentes em assintomáticos (protrusão em ~30% aos 20 anos e ~ 40% aos 50) — imagem deve ser interpretada com o quadro clínico." }
    ],
    desfechos: ["ODI", "Sciatica Bothersomeness Index", "NPRS perna/costas", "Exame neurológico seriado"]
  },
  {
    id: "estenose_lombar", nome: "Estenose do canal lombar (claudicação neurogênica)", regiao: "lombar", tecido: "nervo",
    resumo: "Estreitamento do canal central/lateral com compressão neural. Típica de > 60 anos: dor/peso/parestesia nas pernas ao caminhar ou ficar em pé, aliviada ao sentar ou flexionar o tronco ('sinal do carrinho de supermercado').",
    achados: { l_caminhar: 5, idoso: 3, l_extensao: 2, parestesia: 1, l_irradiada: 1 },
    contra: { jovem: 3, l_sentado: 2, l_tosse: 1 },
    testes: ["slr", "repetidos"],
    diferencial: ["Claudicação vascular (alivia ao parar, mesmo em pé; pulsos diminuídos)", "OA de quadril", "Neuropatia periférica", "Mielopatia"],
    encaminhar: ["Déficit progressivo", "Cauda equina", "Suspeita de doença arterial periférica (índice tornozelo-braquial)"],
    prognostico: {
      texto: "Curso geralmente estável ao longo de anos; ~1/3 melhora, 1/2 fica estável e minoria piora. Fisioterapia e cirurgia tiveram resultados semelhantes em 2 anos (Delitto et al., 2015).",
      bom: ["Boa tolerância a exercício em flexão", "Ausência de déficit motor"],
      ruim: ["Comorbidades múltiplas", "Distância de caminhada muito curta", "Depressão"]
    },
    conduta: {
      inflamatoria: ["Educação sobre posições de alívio (flexão)", "Bicicleta ergométrica / caminhada em esteira inclinada", "Mobilização em flexão"],
      proliferativa: ["Exercícios em flexão, fortalecimento de quadril e tronco", "Treino de marcha com intervalos", "Terapia manual + exercício"],
      remodelacao: ["Programa de condicionamento aeróbico contínuo", "Treino de equilíbrio (risco de queda)"]
    },
    evidencia: [
      { ref: "Delitto A et al. Ann Intern Med 2015", msg: "Descompressão cirúrgica vs fisioterapia: desfechos semelhantes em 2 anos; taxa de cruzamento para cirurgia alta." },
      { ref: "Schneider MJ et al. Spine 2019 (RCT)", msg: "Programa com terapia manual + exercício melhorou sintomas e caminhada a curto prazo mais que cuidado médico." }
    ],
    desfechos: ["Swiss Spinal Stenosis Questionnaire (ZCQ)", "Teste de caminhada auto-cadenciada / 6 min", "ODI"]
  },
  {
    id: "sij", nome: "Dor sacroilíaca (articulação sacroilíaca / cintura pélvica)", regiao: "lombar", tecido: "ligamento",
    resumo: "Dor unilateral abaixo de L5, sobre o sulco sacral/EIPS (sinal do dedo de Fortin), podendo irradiar para glúteo e coxa posterior. Comum na gestação/pós-parto e após trauma.",
    achados: { l_sij: 5, l_gestacao: 3, trauma: 1, mecanica: 1 },
    contra: { l_centraliza: 3, l_irradiada: 2, l_deficit: 2 },
    testes: ["sij_cluster", "faber", "repetidos"],
    diferencial: ["Dor lombar discogênica com referência", "Espondiloartrite (sacroiliíte inflamatória)", "Tendinopatia glútea", "Patologia de quadril"],
    encaminhar: ["Sinais inflamatórios (sacroiliíte)", "Dor pélvica pós-parto com incapacidade grave persistente"],
    prognostico: {
      texto: "Dor de cintura pélvica na gestação resolve na maioria até 3 meses pós-parto; persistência associa-se a dor intensa precoce e fatores psicossociais.",
      bom: ["Início na gestação com boa função", "Ausência de dor lombar prévia"],
      ruim: ["Alta intensidade e múltiplos testes positivos", "Catastrofização"]
    },
    conduta: {
      inflamatoria: ["Educação e ajustes de carga", "Cinto pélvico pode aliviar sintomas a curto prazo", "Exercícios de controle motor leves"],
      proliferativa: ["Fortalecimento de glúteos, adutores, transverso/oblíquos", "Exercício específico de estabilização (Stuge et al., 2004 pós-parto)"],
      remodelacao: ["Treino funcional (levantar, carregar, correr)", "Progressão de força"]
    },
    evidencia: [
      { ref: "Laslett M et al. Man Ther 2005", msg: "Cluster de provocação (≥ 3/5) tem boa acurácia comparado a bloqueio anestésico." },
      { ref: "Stuge B et al. Spine 2004 (RCT)", msg: "Exercícios de estabilização específicos melhoraram dor e função na dor pélvica pós-parto." }
    ],
    desfechos: ["Pelvic Girdle Questionnaire", "ODI", "ASLR (Active Straight Leg Raise)"]
  },
  {
    id: "espondilolise", nome: "Espondilólise / espondilolistese (jovem atleta)", regiao: "lombar", tecido: "osso",
    resumo: "Fratura por estresse da pars interarticularis (geralmente L5), comum em adolescentes em esportes de hiperextensão e rotação. Dor lombar unilateral à extensão.",
    achados: { l_hiperext: 5, jovem: 3, l_extensao: 3, esporte: 2, l_local: 1 },
    contra: { idoso: 3, l_irradiada: 1 },
    testes: ["repetidos"],
    diferencial: ["Dor lombar inespecífica", "Hérnia discal do adolescente", "Tumor ósseo (osteoma osteoide — dor noturna aliviada por AINE)"],
    encaminhar: ["Suspeita clínica: solicitar avaliação médica e imagem (RM preferida em jovens)", "Listese progressiva ou sintomas neurológicos"],
    prognostico: {
      texto: "Lesões agudas unilaterais têm boa taxa de consolidação com afastamento do gesto provocativo; retorno ao esporte em ~3–6 meses na maioria.",
      bom: ["Diagnóstico precoce", "Lesão unilateral, estágio inicial"],
      ruim: ["Defeito bilateral crônico (pseudoartrose)", "Listese de alto grau"]
    },
    conduta: {
      inflamatoria: ["Afastar de extensão/rotação provocativa", "Manter condicionamento sem dor"],
      proliferativa: ["Controle motor de tronco, força de quadril", "Flexibilidade de isquiotibiais e flexores do quadril"],
      remodelacao: ["Reintrodução gradual de extensão e gesto esportivo", "Retorno quando sem dor e com força adequada"]
    },
    evidencia: [
      { ref: "Selhorst M et al. 2020 / revisões em atletas jovens", msg: "Tratamento conservador com retorno gradual é a base; evidência em geral de baixa qualidade." }
    ],
    desfechos: ["ODI / Micheli Functional Scale", "Retorno ao esporte"]
  },
  {
    id: "axspa", nome: "Espondiloartrite axial (dor lombar inflamatória) — ENCAMINHAR", regiao: "lombar", tecido: "ligamento",
    resumo: "Dor lombar crônica (> 3 meses) iniciada antes dos 45 anos, com rigidez matinal prolongada, melhora com exercício e piora com repouso, despertar na 2ª metade da noite. Não é condição mecânica — requer diagnóstico reumatológico.",
    achados: { rigidez_longa: 4, l_melhora_exerc: 4, jovem: 2, noturna: 2, insidioso: 1 },
    contra: { mecanica: 2, trauma: 2, idoso: 2 },
    testes: [],
    diferencial: ["Dor lombar inespecífica", "Hiperostose esquelética idiopática difusa (DISH)"],
    encaminhar: ["Encaminhar ao reumatologista (critérios ASAS) — atraso diagnóstico médio ainda é de vários anos"],
    prognostico: { texto: "Com tratamento medicamentoso (AINE, biológicos) + exercício, a função é bem preservada. Atraso diagnóstico piora o prognóstico.", bom: ["Diagnóstico precoce", "Exercício regular"], ruim: ["Tabagismo", "Atraso diagnóstico", "Inatividade"] },
    conduta: {
      inflamatoria: ["Encaminhamento + exercício de mobilidade"],
      proliferativa: ["Exercício supervisionado: mobilidade, força, aeróbico, postura"],
      remodelacao: ["Programa contínuo de exercício (recomendação forte ASAS-EULAR)"]
    },
    evidencia: [{ ref: "Ramiro S et al. ASAS-EULAR recommendations, Ann Rheum Dis 2023", msg: "Educação, exercício regular e cessação do tabagismo são recomendados para todos; fisioterapia supervisionada preferível a exercício domiciliar." }],
    desfechos: ["BASFI", "BASDAI", "BASMI"]
  },

  // =============================== CERVICAL ===============================
  {
    id: "cervicalgia", nome: "Dor cervical com déficit de mobilidade (inespecífica)", regiao: "cervical", tecido: "ligamento",
    resumo: "Dor cervical central/unilateral com limitação de movimento, sem sinais neurológicos, frequentemente com dor referida para ombro/escápula.",
    achados: { c_local: 5, mecanica: 3, insidioso: 1, meia: 1 },
    contra: { c_irradiada: 2, c_chicote: 1, parestesia: 2 },
    testes: ["craniocervical", "vbi_ifomt", "flexao_rotacao"],
    diferencial: ["Radiculopatia cervical", "Cefaleia cervicogênica", "Mielopatia", "Patologia vascular cervical", "Dor de ombro referida"],
    encaminhar: ["Sinais de mielopatia", "Sinais vasculares (5D 3N)", "Instabilidade cervical superior (artrite reumatoide, Down, trauma)"],
    prognostico: { texto: "A maioria melhora em semanas, mas cerca de 50% ainda relata algum sintoma após 1 ano.", bom: ["Início recente", "Baixa incapacidade inicial", "Boa expectativa"], ruim: ["Episódios prévios", "Comorbidade de dor lombar", "Fatores psicossociais"] },
    conduta: {
      inflamatoria: ["Educação, manter-se ativo", "Mobilização/manipulação torácica e cervical", "Exercícios de ADM"],
      proliferativa: ["Terapia manual + exercício (combinação superior)", "Exercícios de flexores profundos, escapulotorácicos"],
      remodelacao: ["Fortalecimento cervical e de MMSS progressivo", "Ergonomia + pausas ativas", "Abordagem biopsicossocial se crônico"]
    },
    evidencia: [{ ref: "Blanpied PR et al. JOSPT 2017 — Neck Pain CPG (Revision 2017)", msg: "Mobilização/manipulação torácica e cervical + exercícios cervicais/escapulares para dor com déficit de mobilidade; na crônica, combinar terapia manual, exercício e educação." }],
    desfechos: ["Neck Disability Index (NDI)", "NPRS", "PSFS"]
  },
  {
    id: "radiculopatia_cervical", nome: "Radiculopatia cervical", regiao: "cervical", tecido: "nervo",
    resumo: "Dor irradiada em território radicular (mais comum C6 e C7), com parestesia e possível déficit motor/reflexo. Causas: hérnia discal (jovens) ou estenose foraminal por espondilose (mais velhos).",
    achados: { c_irradiada: 5, c_spurling: 4, parestesia: 2, fraqueza: 1, c_rotacao: 1 },
    contra: { c_cefaleia: 2 },
    testes: ["spurling", "ultt1", "distracao"],
    diferencial: ["Síndrome do túnel do carpo / neuropatias periféricas (double crush)", "Dor de ombro com referência", "Mielopatia", "Síndrome do desfiladeiro torácico", "Tumor de Pancoast (ápice pulmonar — tabagista, dor no ombro/braço, Horner)"],
    encaminhar: ["Déficit motor progressivo", "Sinais de mielopatia", "Dor intratável > 6–12 sem"],
    prognostico: { texto: "Curso favorável na maioria: melhora significativa em 4–6 meses; 80–90% melhoram sem cirurgia.", bom: ["Melhora inicial com distração", "Idade < 54 anos (Cleland 2007 cluster)"], ruim: ["Déficit motor importante", "Longa duração"] },
    conduta: {
      inflamatoria: ["Posições de alívio, educação", "Colar cervical apenas curto prazo (se necessário)", "Mobilização neural suave (sliders)"],
      proliferativa: ["Tração mecânica intermitente + exercício (evidência mista)", "Terapia manual torácica", "Exercício de flexores profundos e escapulares"],
      remodelacao: ["Fortalecimento progressivo", "Retorno gradual às atividades"]
    },
    evidencia: [{ ref: "Blanpied PR et al. JOSPT 2017", msg: "Exercício combinado com mobilização e/ou tração intermitente para radiculopatia." }, { ref: "Wainner RS et al. Spine 2003", msg: "Cluster de 4 testes (ULTT1, rotação < 60°, distração, Spurling) com alta probabilidade pós-teste se 4/4." }],
    desfechos: ["NDI", "NPRS braço", "Exame neurológico"]
  },
  {
    id: "cefaleia_cervicogenica", nome: "Cefaleia cervicogênica", regiao: "cervical", tecido: "ligamento",
    resumo: "Cefaleia unilateral sem troca de lado, iniciando na região suboccipital, desencadeada por movimentos/postura do pescoço, com redução de mobilidade de C1-C3.",
    achados: { c_cefaleia: 5, c_mov_cefaleia: 4, c_rotacao: 3, c_local: 1 },
    contra: { c_irradiada: 2 },
    testes: ["flexao_rotacao", "craniocervical", "vbi_ifomt"],
    diferencial: ["Enxaqueca (náusea, fotofobia, aura, pulsátil)", "Cefaleia tensional (bilateral, em aperto)", "Cefaleia secundária grave (súbita, febre, déficit neurológico, > 50 anos de início novo)", "Dissecção arterial cervical"],
    encaminhar: ["Cefaleia súbita intensa, alterações neurológicas, sinais vasculares", "Padrão novo em > 50 anos"],
    prognostico: { texto: "Boa resposta a terapia manual + exercício, com efeitos mantidos em 12 meses.", bom: ["Teste de flexão-rotação positivo", "Componente mecânico claro"], ruim: ["Sobreposição com enxaqueca", "Uso excessivo de analgésicos (cefaleia por abuso de medicação)"] },
    conduta: {
      inflamatoria: ["Mobilização C1-C2 (SNAG de flexão-rotação)", "Educação postural"],
      proliferativa: ["Exercícios de flexão craniocervical", "Fortalecimento escapular"],
      remodelacao: ["Fortalecimento cervical progressivo e autocuidado"]
    },
    evidencia: [{ ref: "Jull G et al. Spine 2002 (RCT)", msg: "Terapia manual + exercício reduziram frequência e intensidade da cefaleia com efeito mantido em 12 meses." }],
    desfechos: ["Headache Impact Test (HIT-6)", "Diário de cefaleia", "NDI"]
  },
  {
    id: "whiplash", nome: "Distúrbio associado ao chicote (WAD)", regiao: "cervical", tecido: "ligamento",
    resumo: "Dor cervical após mecanismo de aceleração-desaceleração (colisões). Classificação de Quebec (0–IV). Alto risco de cronificação quando dor intensa inicial e fatores psicológicos.",
    achados: { c_chicote: 6, trauma: 3, c_local: 2, c_cefaleia: 1 },
    contra: { insidioso: 3 },
    testes: ["canadense", "vbi_ifomt", "craniocervical"],
    diferencial: ["Fratura cervical (Regra Canadense)", "Lesão ligamentar instável", "Concussão associada", "Lesão vascular"],
    encaminhar: ["Regra Canadense positiva", "Sinais neurológicos (WAD III/IV)", "Sinais de concussão"],
    prognostico: { texto: "~50% mantêm sintomas após 1 ano. Preditores: dor/incapacidade inicial alta (NDI > 30%), hiperalgesia ao frio, sintomas de estresse pós-traumático.", bom: ["Baixa dor inicial", "Retorno precoce às atividades"], ruim: ["NDI inicial alto", "Hiperalgesia ao frio", "Estresse pós-traumático", "Litígio/compensação"] },
    conduta: {
      inflamatoria: ["Educação tranquilizadora, manter atividade", "Evitar colar cervical", "Exercícios de ADM precoces"],
      proliferativa: ["Exercício cervical e escapular progressivo"],
      remodelacao: ["Abordagem psicologicamente informada se alto risco", "Treino sensório-motor (reposicionamento, equilíbrio)"]
    },
    evidencia: [{ ref: "Blanpied PR et al. JOSPT 2017; Sterling M et al.", msg: "Educação, exercício e manter atividade; identificar precocemente preditores de mau prognóstico." }],
    desfechos: ["NDI", "IES-R (estresse pós-traumático)", "NPRS"]
  },

  // =============================== OMBRO ===============================
  {
    id: "subacromial", nome: "Dor no ombro relacionada ao manguito rotador (síndrome subacromial / tendinopatia)", regiao: "ombro", tecido: "tendao",
    resumo: "Dor anterolateral do ombro em elevação e rotação externa, arco doloroso, sem perda de ADM passiva. O termo 'impacto' vem sendo substituído por 'dor relacionada ao manguito rotador' (Lewis 2016).",
    achados: { o_arco: 4, o_lateral: 3, o_overhead: 3, insidioso: 1, carga: 1, meia: 1, o_fraqueza_re: 1 },
    contra: { o_rigidez: 4, o_apreensao: 2 },
    testes: ["hawkins", "neer", "arco", "lag_re", "drop_arm"],
    diferencial: ["Ruptura do manguito", "Capsulite adesiva (perda de ADM passiva)", "Dor cervical referida", "Artropatia AC", "Instabilidade (jovem atleta overhead)", "Tendinopatia calcária"],
    encaminhar: ["Pseudoparalisia aguda após trauma (ruptura aguda — avaliação cirúrgica precoce em jovens ativos)", "Sem melhora após 3–6 meses de exercício adequado"],
    prognostico: { texto: "Exercício é tão eficaz quanto cirurgia de descompressão; melhora gradual em 6–12 semanas, mas ~40–50% ainda referem sintomas aos 6–12 meses.", bom: ["Curta duração", "Baixa dor inicial", "Alta expectativa"], ruim: ["Longa duração", "Dor cervical associada", "Alta dor/incapacidade inicial", "Fatores psicossociais"] },
    conduta: {
      inflamatoria: ["Educação: carga relativa (não repouso)", "Isometria de RE/abdução", "Modificar atividades acima da cabeça temporariamente"],
      proliferativa: ["Fortalecimento progressivo de manguito e escapulares (3x/sem, 12 sem)", "Carga com dor aceitável (≤ 3–5/10)", "Terapia manual como adjunto"],
      remodelacao: ["Fortalecimento com cargas altas, elevação completa", "Treino funcional/esportivo"]
    },
    evidencia: [
      { ref: "Beard DJ et al. Lancet 2018 (CSAW) e Paavola M et al. BMJ 2018 (FIMPACT)", msg: "Descompressão subacromial artroscópica não foi superior à cirurgia placebo — NÃO recomendar cirurgia como 1ª linha." },
      { ref: "Diercks R et al. Acta Orthop 2014 (Diretriz holandesa)", msg: "Exercício como base; injeção de corticoide pode ajudar a curto prazo." },
      { ref: "Lewis J. Man Ther 2016", msg: "Testes de 'impacto' não identificam estrutura; usar procedimento de modificação de sintomas e foco em carga." }
    ],
    desfechos: ["SPADI", "QuickDASH", "NPRS", "PSFS"]
  },
  {
    id: "ruptura_manguito", nome: "Ruptura do manguito rotador", regiao: "ombro", tecido: "tendao",
    resumo: "Pode ser traumática (jovens, queda) ou degenerativa (> 60 anos, frequentemente assintomática). Fraqueza em RE/elevação e lag signs positivos.",
    achados: { o_fraqueza_re: 5, idoso: 3, o_queda: 2, o_lateral: 1, noturna: 1, o_arco: 1 },
    contra: { jovem: 2, o_rigidez: 2 },
    testes: ["lag_re", "drop_arm", "bellypress", "arco"],
    diferencial: ["Tendinopatia do manguito sem ruptura", "Radiculopatia C5 (fraqueza de abdução/RE)", "Lesão do nervo supraescapular/axilar", "Capsulite adesiva"],
    encaminhar: ["Ruptura traumática aguda em paciente jovem/ativo (cirurgia precoce em ≤ 3 semanas pode ser indicada)", "Pseudoparalisia"],
    prognostico: { texto: "Rupturas degenerativas: fisioterapia com resultados semelhantes ao reparo em 1–2 anos (Kukkonen 2015); risco de progressão do tamanho da ruptura ao longo de anos.", bom: ["Ruptura pequena/parcial", "Atrofia gordurosa mínima"], ruim: ["Ruptura grande/maciça", "Atrofia gordurosa (Goutallier ≥ 3)", "Tabagismo"] },
    conduta: {
      inflamatoria: ["Controle da dor, ADM ativo-assistida", "Educação"],
      proliferativa: ["Fortalecimento de deltoide anterior (compensa manguito em rupturas maciças) e escapulares", "Fortalecimento do manguito residual"],
      remodelacao: ["Treino funcional", "Pós-reparo: seguir protocolo (proteção 4–6 sem, força a partir de 12 sem)"]
    },
    evidencia: [{ ref: "Kukkonen J et al. Bone Joint J 2015 (RCT)", msg: "Rupturas não traumáticas do supraespinal: fisioterapia isolada ≈ reparo cirúrgico em 1 ano." }],
    desfechos: ["WORC", "SPADI", "Constant-Murley"]
  },
  {
    id: "capsulite", nome: "Capsulite adesiva (ombro congelado)", regiao: "ombro", tecido: "ligamento",
    resumo: "Perda progressiva de ADM ATIVA e PASSIVA (RE mais afetada) com radiografia normal, entre 40–65 anos, mais em mulheres e diabéticos. Fases: dolorosa (congelamento) → rígida (congelado) → descongelamento.",
    achados: { o_rigidez: 6, o_metab: 3, meia: 2, noturna: 2, insidioso: 1 },
    contra: { jovem: 3, o_apreensao: 2 },
    testes: ["rotacao_ext_passiva"],
    diferencial: ["OA glenoumeral (radiografia)", "Luxação posterior não diagnosticada (perda de RE após trauma/convulsão!)", "Tendinopatia calcária", "Tumor (dor noturna, perda de peso)"],
    encaminhar: ["Radiografia para excluir OA/luxação posterior", "Dor intensa — injeção de corticoide intra-articular é eficaz na fase dolorosa"],
    prognostico: { texto: "Autolimitada em muitos, porém pode durar 1–3 anos e parte mantém alguma limitação. Diabetes associa-se a curso mais longo.", bom: ["Tratamento precoce na fase dolorosa"], ruim: ["Diabetes", "Bilateral", "Fase dolorosa intensa e longa"] },
    conduta: {
      inflamatoria: ["Fase dolorosa (alta irritabilidade): alongamento leve, sem agressividade; analgesia; considerar injeção de corticoide", "Educação sobre a história natural"],
      proliferativa: ["Fase rígida: mobilização articular (posterior/inferior), alongamento progressivo de maior intensidade", "Exercícios domiciliares de ADM"],
      remodelacao: ["Descongelamento: fortalecimento e função"]
    },
    evidencia: [{ ref: "Kelley MJ et al. JOSPT 2013 — Adhesive capsulitis CPG", msg: "Corticoide intra-articular + mobilização/exercício; intensidade guiada pela irritabilidade." }, { ref: "Challoumas D et al. JAMA Netw Open 2020", msg: "Corticoide intra-articular precoce associado a fisioterapia teve melhores resultados de curto prazo." }],
    desfechos: ["SPADI", "ADM passiva de RE", "NPRS noturna"]
  },
  {
    id: "instabilidade_ombro", nome: "Instabilidade glenoumeral anterior", regiao: "ombro", tecido: "ligamento",
    resumo: "Traumática (luxação anterior com lesão de Bankart) ou atraumática/multidirecional (hiperfrouxidão). Jovens com luxação traumática têm alto risco de recidiva.",
    achados: { o_apreensao: 6, jovem: 3, trauma: 2, esporte: 2, o_overhead: 1 },
    contra: { idoso: 2, o_rigidez: 3 },
    testes: ["apreensao", "obrien"],
    diferencial: ["Lesão SLAP", "Dor subacromial em atleta overhead", "Lesão de manguito associada (> 40 anos com luxação!)", "Lesão do nervo axilar"],
    encaminhar: ["Luxação traumática em jovem atleta (< 25 anos) — discutir estabilização cirúrgica", "Luxação em > 40 anos: avaliar manguito e nervo axilar"],
    prognostico: { texto: "Recidiva após 1ª luxação traumática em < 20 anos pode chegar a 70–90% com tratamento conservador; menor em idades maiores.", bom: ["Idade > 30 anos", "Instabilidade atraumática com bom controle muscular"], ruim: ["< 20 anos", "Esportes de contato/overhead", "Perda óssea glenoidal"] },
    conduta: {
      inflamatoria: ["Proteção relativa curta (sling 1–3 sem conforme dor)", "Isometria de manguito"],
      proliferativa: ["Fortalecimento de manguito e escapulares, controle neuromuscular em posições progressivas"],
      remodelacao: ["Exercícios em posição de apreensão com carga, pliometria de MMSS", "Retorno ao esporte por critérios"]
    },
    evidencia: [{ ref: "Watson L et al. / revisões de instabilidade atraumática", msg: "Programas de controle motor (ex.: Watson program) para instabilidade atraumática." }],
    desfechos: ["WOSI", "Teste CKCUEST"]
  },
  {
    id: "ac", nome: "Lesão / artropatia acromioclavicular", regiao: "ombro", tecido: "ligamento",
    resumo: "Lesão traumática (queda sobre o ombro — classificação de Rockwood I–VI) ou degenerativa/osteólise (levantadores de peso). Dor localizada no topo do ombro.",
    achados: { o_ac: 6, o_aducao: 4, o_queda: 2, trauma: 1 },
    contra: { o_rigidez: 2 },
    testes: ["obrien"],
    diferencial: ["Fratura de clavícula", "Dor subacromial", "Dor cervical referida"],
    encaminhar: ["Rockwood IV–VI (cirúrgico)", "Deformidade importante"],
    prognostico: { texto: "Tipos I–II: boa recuperação em 2–6 semanas; tipo III controverso (conservador geralmente primeiro).", bom: ["Grau I–II"], ruim: ["Grau alto", "Atividade com carga pesada acima da cabeça"] },
    conduta: { inflamatoria: ["Proteção relativa, sling por conforto", "ADM sem dor"], proliferativa: ["Fortalecimento escapular e de manguito"], remodelacao: ["Retorno progressivo à carga e esporte"] },
    evidencia: [{ ref: "Revisões Cochrane sobre lesões AC", msg: "Evidência insuficiente para superioridade da cirurgia em lesões tipo III." }],
    desfechos: ["QuickDASH", "SPADI"]
  },

  // =============================== COTOVELO / PUNHO ===============================
  {
    id: "epicondilalgia", nome: "Tendinopatia lateral do cotovelo (epicondilalgia lateral)", regiao: "cotovelo", tecido: "tendao",
    resumo: "Dor no epicôndilo lateral ao preensão e extensão resistida do punho, relacionada à carga no ERCC. Pico entre 35–54 anos.",
    achados: { co_lateral: 6, co_preensao: 4, meia: 2, carga: 1, insidioso: 1 },
    contra: { co_medial: 3, parestesia: 2 },
    testes: ["cozen"],
    diferencial: ["Radiculopatia C6/C7 e dor referida cervical", "Síndrome do túnel radial", "Instabilidade posterolateral (LCUL)", "Plica sinovial", "OA radiocapitelar"],
    encaminhar: ["Bloqueio mecânico, instabilidade", "Falha após 6–12 meses"],
    prognostico: { texto: "Autolimitada na maioria em 6–12 meses; corticoide tem melhora rápida mas maior recorrência e PIOR resultado em 1 ano (Coombes 2013).", bom: ["Lado não dominante", "Curta duração"], ruim: ["Trabalho manual pesado", "Dor cervical/ombro associada", "Alta dor inicial", "Injeção de corticoide"] },
    conduta: {
      inflamatoria: ["Educação: modificação de carga, prognóstico", "Isometria de extensores de punho", "Órtese de contraforça (alívio curto prazo)"],
      proliferativa: ["Exercício isotônico progressivo (concêntrico/excêntrico) de extensores de punho, supinadores", "Terapia manual: mobilização com movimento (MWM) do cotovelo"],
      remodelacao: ["Fortalecimento com cargas altas e preensão funcional", "Ajustes ergonômicos no trabalho"]
    },
    evidencia: [{ ref: "Lucado AM et al. JOSPT 2022 — Lateral Elbow Pain CPG", msg: "Exercício resistido e educação; terapia manual adjunta; ondas de choque e laser com evidência limitada/mista." }, { ref: "Coombes BK et al. JAMA 2013 (RCT)", msg: "Corticoide piorou desfechos em 1 ano e aumentou recorrência vs placebo." }],
    desfechos: ["PRTEE", "Pain-free grip", "QuickDASH"]
  },
  {
    id: "tunel_carpo", nome: "Síndrome do túnel do carpo", regiao: "punho", tecido: "nervo",
    resumo: "Compressão do nervo mediano no carpo: parestesia nos dedos 1–3 (e metade radial do 4º), noturna, aliviada ao sacudir a mão. Mais comum em mulheres, gestação, diabetes, hipotireoidismo.",
    achados: { p_noturna: 6, p_phalen: 4, parestesia: 3, meia: 1, fraqueza: 1 },
    contra: { c_irradiada: 2, p_radial: 2 },
    testes: ["phalen", "tinel_carpo", "ultt1"],
    diferencial: ["Radiculopatia C6/C7", "Síndrome do pronador", "Neuropatia periférica (diabética)", "Síndrome do desfiladeiro torácico"],
    encaminhar: ["Atrofia tenar / fraqueza do abdutor curto do polegar", "Sintomas constantes ou falha do conservador (descompressão cirúrgica)", "Eletroneuromiografia para casos moderados/graves"],
    prognostico: { texto: "Leve/moderada: boa resposta a órtese noturna e corticoide; grave ou com atrofia: cirurgia apresenta melhores resultados.", bom: ["Sintomas intermitentes", "Curta duração", "Gestação (resolve pós-parto)"], ruim: ["Sintomas constantes", "Atrofia tenar", "Idade > 50 anos e longa duração"] },
    conduta: {
      inflamatoria: ["Órtese de punho em posição neutra à noite", "Educação: evitar flexão/extensão sustentadas"],
      proliferativa: ["Técnicas de deslizamento neural e tendíneo", "Terapia manual (mobilização do carpo, tecidos moles) — Fernández-de-las-Peñas 2017 vs cirurgia"],
      remodelacao: ["Fortalecimento de mão e punho", "Pós-cirúrgico: ADM precoce, dessensibilização da cicatriz"]
    },
    evidencia: [{ ref: "Erickson M et al. JOSPT 2019 — Carpal Tunnel Syndrome CPG", msg: "Órtese, terapia manual e técnicas neurodinâmicas para curto prazo; ultrassom terapêutico e laser não recomendados de rotina." }],
    desfechos: ["Boston Carpal Tunnel Questionnaire", "Diagrama de mão de Katz", "Monofilamentos"]
  },
  {
    id: "dequervain", nome: "Tenossinovite de De Quervain", regiao: "punho", tecido: "tendao",
    resumo: "Tendinopatia do 1º compartimento extensor (abdutor longo e extensor curto do polegar). Comum em pós-parto e uso repetitivo do polegar.",
    achados: { p_radial: 5, p_finkelstein: 5, p_bebe: 3 },
    contra: { p_noturna: 2 },
    testes: ["finkelstein"],
    diferencial: ["Rizartrose (OA trapeziometacarpal — teste de grind)", "Síndrome de intersecção", "Fratura de escafoide (tabaqueira anatômica após queda!)", "Neuropatia do ramo superficial do radial (Wartenberg)"],
    encaminhar: ["Dor na tabaqueira anatômica após queda (escafoide)", "Falha conservador — injeção de corticoide (alta eficácia)"],
    prognostico: { texto: "Boa resposta a órtese de polegar + modificação de atividade; injeção de corticoide resolve a maioria.", bom: ["Curta duração"], ruim: ["Septo no 1º compartimento", "Uso intenso contínuo"] },
    conduta: { inflamatoria: ["Órtese em espica de polegar", "Modificação ergonômica (pegar o bebê)"], proliferativa: ["Exercício isométrico → isotônico de polegar e punho"], remodelacao: ["Fortalecimento funcional"] },
    evidencia: [{ ref: "Ashraf MO, Devadoss VG. Eur J Orthop Surg Traumatol 2014 (meta-análise)", msg: "Injeção de corticoide tem alta taxa de sucesso; combinar com órtese." }],
    desfechos: ["PRWE", "QuickDASH"]
  },

  // =============================== QUADRIL ===============================
  {
    id: "oa_quadril", nome: "Osteoartrite de quadril", regiao: "quadril", tecido: "cartilagem",
    resumo: "Dor inguinal/coxa anterior com rigidez matinal < 1 h, perda de rotação medial e flexão, idade > 50 anos. Diagnóstico clínico (NICE: > 45 anos, dor articular de atividade, rigidez < 30 min).",
    achados: { q_inguinal: 4, q_rm: 5, idoso: 3, rigidez_curta: 2, mecanica: 1, insidioso: 1 },
    contra: { jovem: 3, rigidez_longa: 2, trauma: 1 },
    testes: ["rm_quadril", "faber", "fadir"],
    diferencial: ["Radiculopatia L2-L4 / dor lombar referida", "Tendinopatia glútea", "Fratura por estresse do colo femoral", "Necrose avascular da cabeça femoral (corticoide, álcool)", "Hérnia inguinal"],
    encaminhar: ["Dor/incapacidade grave refratária (artroplastia)", "Suspeita de necrose avascular ou fratura"],
    prognostico: { texto: "Progressão lenta e variável; exercício e educação (ex.: GLA:D) reduzem dor ~20–30% e adiam/evitam cirurgia em parte dos casos.", bom: ["Adesão ao exercício", "Controle de peso", "Boa força de abdutores"], ruim: ["Dor intensa inicial", "Perda acentuada de ADM", "Comorbidades", "Obesidade"] },
    conduta: {
      inflamatoria: ["Crise: reduzir carga temporariamente, exercício na água/bicicleta", "Educação sobre a doença (não é 'desgaste' inevitável)"],
      proliferativa: ["Fortalecimento de quadril (abdutores, extensores) e quadríceps", "Terapia manual como adjunto"],
      remodelacao: ["Treino neuromuscular (programa GLA:D), aeróbico", "Perda de peso se sobrepeso", "Bengala no lado contralateral se necessário"]
    },
    evidencia: [{ ref: "Bannuru RR et al. OARSI 2019; Kolasinski SL et al. ACR 2019; NICE NG226 2022", msg: "Exercício, educação e controle de peso são o núcleo do tratamento; não recomendar ultrassom, TENS isolado, glucosamina." }, { ref: "Cibulka MT et al. JOSPT 2017 — Hip OA CPG", msg: "Terapia manual + exercício e educação." }],
    desfechos: ["HOOS", "WOMAC", "Timed Up and Go", "30s Chair Stand"]
  },
  {
    id: "tendinopatia_glutea", nome: "Tendinopatia glútea (síndrome dolorosa do trocânter maior)", regiao: "quadril", tecido: "tendao",
    resumo: "Dor lateral do quadril sobre o trocânter, ao deitar de lado, subir escadas e ficar em apoio unipodal. Mais comum em mulheres > 40 anos. Compressão (adução) é provocativa.",
    achados: { q_lateral: 5, q_deitar: 4, q_unipodal: 3, meia: 2, insidioso: 1 },
    contra: { q_inguinal: 2, q_rm: 2 },
    testes: ["trendelenburg", "ober", "faber"],
    diferencial: ["OA de quadril (dor inguinal, perda de RM)", "Dor lombar referida (L5)", "Meralgia parestésica (nervo cutâneo lateral)", "Fratura por estresse"],
    encaminhar: ["Ruptura de glúteo médio com fraqueza importante e falha conservadora"],
    prognostico: { texto: "Educação + exercício superou corticoide e 'esperar' em 52 semanas (LEAP).", bom: ["Adesão ao programa", "Redução de cargas compressivas"], ruim: ["Longa duração", "Múltiplas injeções", "Obesidade"] },
    conduta: {
      inflamatoria: ["Educação: evitar adução (cruzar pernas, quadril 'pendurado' em pé, deitar sobre o lado sem travesseiro entre os joelhos)", "Isometria de abdutores"],
      proliferativa: ["Fortalecimento progressivo de abdutores em posições sem compressão", "Controle de pelve em apoio unipodal"],
      remodelacao: ["Fortalecimento com carga alta e funcional (step-up, corrida)"]
    },
    evidencia: [{ ref: "Mellor R et al. BMJ 2018 (LEAP trial)", msg: "Educação + exercício > corticoide > esperar, em 8 e 52 semanas." }],
    desfechos: ["VISA-G", "NPRS ao deitar"]
  },
  {
    id: "ifa", nome: "Síndrome do impacto femoroacetabular / lesão labral", regiao: "quadril", tecido: "cartilagem",
    resumo: "Dor inguinal relacionada a movimento/posição em jovens ativos, com morfologia CAM ou PINCER e sinais clínicos (Warwick Agreement: sintomas + sinais + imagem).",
    achados: { q_inguinal: 4, q_fadir: 5, jovem: 3, esporte: 2, mecanica: 1 },
    contra: { idoso: 3, q_lateral: 2 },
    testes: ["fadir", "faber"],
    diferencial: ["Dor inguinal relacionada aos adutores/iliopsoas", "Fratura por estresse do colo femoral (corredores — URGENTE)", "Displasia do quadril", "Hérnia esportiva"],
    encaminhar: ["Dor inguinal em corredor com dor noturna/carga (fratura por estresse do colo)", "Falha do conservador com morfologia significativa"],
    prognostico: { texto: "Artroscopia teve pequena vantagem sobre cuidado conservador (UK FASHIoN), mas fisioterapia é primeira linha para muitos.", bom: ["Sem lesão condral avançada"], ruim: ["Alterações degenerativas", "Displasia associada"] },
    conduta: { inflamatoria: ["Evitar flexão profunda + rotação medial provocativa", "Educação"], proliferativa: ["Fortalecimento de quadril e tronco, controle motor"], remodelacao: ["Retorno ao esporte com progressão; considerar artroscopia se falha"] },
    evidencia: [{ ref: "Griffin DR et al. BJSM 2016 (Warwick Agreement)", msg: "Diagnóstico exige tríade: sintomas, sinais clínicos e achados de imagem." }, { ref: "Griffin DR et al. Lancet 2018 (UK FASHIoN)", msg: "Artroscopia com melhora modestamente maior que cuidado conservador em 12 meses." }],
    desfechos: ["iHOT-33 / iHOT-12", "HAGOS"]
  },
  {
    id: "virilha_adutores", nome: "Dor inguinal relacionada aos adutores (Doha)", regiao: "quadril", tecido: "tendao",
    resumo: "Dor na região dos adutores com dor à palpação e à adução resistida, comum em futebol e esportes com chute e mudança de direção. Doha Agreement: adutores, iliopsoas, inguinal, púbica.",
    achados: { q_adutor: 6, esporte: 3, jovem: 2, carga: 1 },
    contra: { idoso: 2, q_rm: 2 },
    testes: ["fadir"],
    diferencial: ["IFA do quadril", "Dor púbica (osteíte)", "Hérnia inguinal", "Fratura por estresse"],
    encaminhar: ["Avulsão aguda (adutor longo) com hematoma importante"],
    prognostico: { texto: "Boa resposta a programa de fortalecimento ativo (Hölmich 1999).", bom: ["Início recente"], ruim: ["Longa duração", "Múltiplas entidades da classificação de Doha"] },
    conduta: { inflamatoria: ["Isometria de adução (squeeze)"], proliferativa: ["Fortalecimento progressivo de adutores (Copenhagen) e core"], remodelacao: ["Retorno com corrida, chute e mudanças de direção graduais"] },
    evidencia: [{ ref: "Weir A et al. BJSM 2015 (Doha Agreement)", msg: "Taxonomia padronizada da dor inguinal em atletas." }, { ref: "Harøy J et al. BJSM 2019 (RCT)", msg: "Programa Copenhagen Adductor reduziu prevalência de problemas inguinais em ~41% em jogadores de futebol." }],
    desfechos: ["HAGOS", "Força de adução (squeeze test)"]
  },
  {
    id: "isquiotibiais", nome: "Lesão muscular de isquiotibiais", regiao: "quadril", tecido: "musculo",
    resumo: "Dor súbita na face posterior da coxa durante sprint (bíceps femoral, cabeça longa) ou alongamento extremo (semimembranoso — tipo 'stretching', retorno mais lento).",
    achados: { q_isquio: 6, trauma: 3, esporte: 2, jovem: 1 },
    contra: { insidioso: 2, idoso: 1 },
    testes: [],
    diferencial: ["Avulsão proximal (equimose extensa, gap palpável — encaminhar)", "Dor referida lombar/neural", "Tendinopatia proximal dos isquiotibiais"],
    encaminhar: ["Suspeita de avulsão proximal (cirurgia precoce indicada)"],
    prognostico: { texto: "Retorno típico 2–8 semanas (BAMIC 1–3a/b); lesões intratendíneas (c) e tipo stretching levam mais. Recidiva ~15–30%, principalmente nas primeiras semanas após o retorno.", bom: ["Dor ao alongamento leve na avaliação inicial", "Lesão miofascial"], ruim: ["Lesão intratendínea", "Lesão prévia", "Grande perda de ADM inicial (> 20°)", "Dias para caminhar sem dor > 1"] },
    conduta: {
      inflamatoria: ["PEACE; caminhada sem dor; isometria submáxima", "Evitar alongamento agressivo nos primeiros dias"],
      proliferativa: ["Protocolo L (Askling): exercícios em alongamento ativo", "Excêntrico progressivo, carga em comprimento longo", "Corrida progressiva"],
      remodelacao: ["Nórdico, sprints progressivos até velocidade máxima", "Critérios de retorno: força simétrica, Askling H-test negativo, sprint máximo sem dor"]
    },
    evidencia: [{ ref: "Askling CM et al. BJSM 2013 (RCT)", msg: "L-protocol reduziu tempo de retorno vs C-protocol convencional." }, { ref: "van Dyk N et al. BJSM 2019 (meta-análise)", msg: "Exercício nórdico reduz incidência de lesão de isquiotibiais em ~50%." }],
    desfechos: ["Askling H-test", "Força excêntrica (NordBord)", "Tempo de retorno"]
  },

  // =============================== JOELHO ===============================
  {
    id: "dfp", nome: "Dor femoropatelar", regiao: "joelho", tecido: "cartilagem",
    resumo: "Dor anterior/retropatelar difusa, agravada por atividades que aumentam carga na articulação femoropatelar (agachar, escadas, corrida, sentar longos períodos). Comum em adolescentes e jovens ativos.",
    achados: { j_anterior: 5, j_agachar: 5, jovem: 2, carga: 2, insidioso: 1, esporte: 1 },
    contra: { j_estalo: 3, edema: 2, j_bloqueio: 2, idoso: 1 },
    testes: ["step_down"],
    diferencial: ["Tendinopatia patelar (dor localizada no polo inferior)", "Doença de Osgood-Schlatter / Sinding-Larsen (adolescentes)", "Instabilidade patelar", "Plica sinovial", "OA femoropatelar (> 40 anos)", "Dor referida do quadril (epífise femoral em adolescente!)"],
    encaminhar: ["Adolescente com dor no joelho e alteração da marcha/ADM do quadril (escorregamento epifisário)", "Derrame significativo/bloqueio"],
    prognostico: { texto: "Frequentemente persistente: ~50% ainda têm dor após 5–8 anos. Exercício combinado quadril + joelho melhora a curto e médio prazo.", bom: ["Início recente", "Baixa intensidade"], ruim: ["Longa duração (> 2 meses)", "Dor mais intensa", "Pior função inicial"] },
    conduta: {
      inflamatoria: ["Educação: gestão de carga (não repouso), explicar o modelo de envelope de função", "Ajustar volume de corrida/escadas"],
      proliferativa: ["Exercício combinado de quadril (abdutores/rotadores laterais) e joelho (quadríceps)", "Bandagem patelar/órteses plantares como adjunto de curto prazo"],
      remodelacao: ["Força com carga alta, progressão para corrida/salto", "Retreino de marcha na corrida (aumento de cadência)"]
    },
    evidencia: [{ ref: "Willy RW et al. JOSPT 2019 — Patellofemoral Pain CPG", msg: "Exercício de quadril + joelho (forte recomendação); órteses de pé e bandagem a curto prazo; NÃO recomenda eletroterapia, laser, dry needling." }, { ref: "Crossley KM et al. BJSM 2016 (Consensus)", msg: "Exercício é o pilar; combinar intervenções de curto prazo com plano de longo prazo." }],
    desfechos: ["AKPS (Kujala)", "KOOS-PF", "NPRS"]
  },
  {
    id: "lca", nome: "Ruptura do ligamento cruzado anterior (LCA)", regiao: "joelho", tecido: "ligamento",
    resumo: "Mecanismo sem contato (desaceleração, mudança de direção, aterrissagem em valgo) com estalo, derrame rápido (hemartrose < 2 h) e falseio. Lesões associadas: menisco, LCM, contusão óssea.",
    achados: { j_estalo: 6, j_rotacao: 4, j_falseio: 4, trauma: 3, edema: 2, esporte: 2, jovem: 1 },
    contra: { insidioso: 4, idoso: 1 },
    testes: ["lachman", "pivot", "gaveta_ant", "ottawa_joelho"],
    diferencial: ["Luxação patelar (mecanismo semelhante, apreensão patelar)", "Lesão meniscal", "Fratura (Ottawa)", "Lesão do LCP", "Lesão multiligamentar (pulsos distais!)"],
    encaminhar: ["Ortopedia para decisão de tratamento", "Bloqueio mecânico (alça de balde associada)", "Lesão multiligamentar / suspeita vascular-nervosa — URGENTE"],
    prognostico: { texto: "Reabilitação inicial com reconstrução tardia opcional teve resultados semelhantes à reconstrução precoce em 2 e 5 anos (KANON). Após reconstrução, retorno ao nível prévio ~55–65%; re-ruptura alta em jovens retornando ao esporte de pivô. Risco elevado de OA a longo prazo.", bom: ["Cumprir critérios de retorno (reduz re-lesão em ~84% — Grindem 2016)", "Retorno ≥ 9 meses", "Boa força de quadríceps (LSI ≥ 90%)"], ruim: ["< 20 anos e esporte de pivô", "Retorno precoce", "Medo de re-lesão (ACL-RSI baixo)", "Lesões associadas (menisco, cartilagem)"] },
    conduta: {
      inflamatoria: ["Controle de derrame, ativação do quadríceps (inibição artrogênica), extensão completa precoce", "Pré-reabilitação antes da cirurgia: ADM total e força"],
      proliferativa: ["Fortalecimento de quadríceps (CCA progressiva a partir de ~4–6 sem pós-op conforme enxerto) e isquiotibiais", "Treino neuromuscular, corrida a partir de ~3 meses com critérios"],
      remodelacao: ["Pliometria, agilidade, esporte específico", "Retorno ao esporte por critérios: LSI ≥ 90% força e hop tests, ≥ 9 meses, IKDC, ACL-RSI"]
    },
    evidencia: [{ ref: "Frobell RB et al. NEJM 2010 (KANON trial)", msg: "Reabilitação + reconstrução tardia opcional ≈ reconstrução precoce em 2 anos; ~60% não precisaram de reconstrução." }, { ref: "Grindem H et al. BJSM 2016 (Delaware-Oslo)", msg: "Retorno ≥ 9 meses e simetria de quadríceps reduziram significativamente re-lesões." }, { ref: "Filbay SR, Grindem H. Best Pract Res Clin Rheumatol 2019", msg: "Recomendações baseadas em evidência para o manejo da ruptura do LCA." }],
    desfechos: ["IKDC", "KOOS", "ACL-RSI", "Hop tests", "Isocinético"]
  },
  {
    id: "lcm", nome: "Entorse do ligamento colateral medial (LCM)", regiao: "joelho", tecido: "ligamento",
    resumo: "Mecanismo em valgo (impacto lateral), dor medial e dor/abertura ao estresse em valgo a 30°. Graus I–III. Cicatriza bem com tratamento conservador funcional.",
    achados: { j_valgo: 6, j_medial: 4, trauma: 3, edema: 1, esporte: 1 },
    contra: { insidioso: 3, j_estalo: 1 },
    testes: ["valgo", "lachman", "ottawa_joelho"],
    diferencial: ["Lesão meniscal medial", "Lesão associada de LCA (abertura em 0°)", "Fratura epifisária em adolescentes", "Bursite da pata de ganso"],
    encaminhar: ["Abertura em extensão total (lesão combinada)", "Lesão grau III com instabilidade multiligamentar"],
    prognostico: { texto: "Grau I: ~1–3 sem · Grau II: ~3–6 sem · Grau III isolado: 6–12 sem, geralmente conservador.", bom: ["Lesão isolada", "Grau baixo"], ruim: ["Lesões associadas", "Lesão distal (inserção tibial) — pode cicatrizar pior"] },
    conduta: { inflamatoria: ["PEACE, órtese articulada (grau II–III), carga conforme tolerância", "ADM precoce"], proliferativa: ["Força de quadríceps/isquiotibiais/quadril, propriocepção"], remodelacao: ["Agilidade, mudanças de direção, esporte"] },
    evidencia: [{ ref: "Logerstedt DS et al. JOSPT 2017 — Knee Ligament Sprain CPG", msg: "Tratamento funcional com órtese e exercício progressivo para lesões do LCM." }],
    desfechos: ["KOOS", "IKDC"]
  },
  {
    id: "menisco", nome: "Lesão meniscal", regiao: "joelho", tecido: "menisco",
    resumo: "Traumática (jovens, rotação com pé fixo) ou degenerativa (> 40 anos, mínimo trauma). Dor na interlinha, derrame tardio (6–24 h), sensação de prender; bloqueio verdadeiro sugere alça de balde.",
    achados: { j_interlinha: 5, j_bloqueio: 3, j_rotacao: 2, edema: 1, meia: 1, j_medial: 1 },
    contra: { j_anterior: 2 },
    testes: ["mcmurray", "thessaly", "dor_interlinha", "ottawa_joelho"],
    diferencial: ["OA de joelho", "Lesão do LCM", "Corpo livre", "Plica", "Contusão óssea"],
    encaminhar: ["Joelho bloqueado (não estende)", "Lesão traumática reparável em jovem (zona vermelha)"],
    prognostico: { texto: "Lesões degenerativas: exercício ≈ meniscectomia; muitos sintomas de 'prender' também melhoram com exercício. Meniscectomia aumenta risco de OA.", bom: ["Lesão degenerativa sem bloqueio"], ruim: ["Bloqueio verdadeiro", "OA avançada associada"] },
    conduta: { inflamatoria: ["Controle de derrame, ADM"], proliferativa: ["Fortalecimento de quadríceps e quadril, treino neuromuscular (12 sem)"], remodelacao: ["Progressão funcional/esporte; pós-sutura seguir restrições do cirurgião"] },
    evidencia: [{ ref: "Kise NJ et al. BMJ 2016 (RCT)", msg: "Exercício supervisionado de 12 semanas ≈ meniscectomia parcial em 2 anos em lesões degenerativas (35–60 anos)." }, { ref: "Logerstedt DS et al. JOSPT 2018 — Meniscal and Articular Cartilage Lesions CPG", msg: "Exercício supervisionado e progressivo; carga precoce." }],
    desfechos: ["KOOS", "WOMET", "Lysholm"]
  },
  {
    id: "oa_joelho", nome: "Osteoartrite de joelho", regiao: "joelho", tecido: "cartilagem",
    resumo: "Dor articular relacionada à atividade em > 45 anos, rigidez matinal < 30 min, crepitação, possível derrame e deformidade. Diagnóstico clínico — radiografia não é necessária para iniciar tratamento.",
    achados: { idoso: 4, j_crepitacao: 3, rigidez_curta: 3, mecanica: 2, j_medial: 1, edema: 1, insidioso: 1 },
    contra: { jovem: 4, rigidez_longa: 2, j_estalo: 2 },
    testes: ["dor_interlinha", "step_down"],
    diferencial: ["Artrite inflamatória (rigidez longa, múltiplas articulações)", "Gota/pseudogota (crise aguda, calor)", "Lesão meniscal degenerativa", "Dor referida do quadril", "Artrite séptica"],
    encaminhar: ["Articulação quente e vermelha com febre (séptica)", "Dor grave refratária — avaliação para artroplastia"],
    prognostico: { texto: "Progressão variável; muitos permanecem estáveis. Exercício e educação reduzem dor com efeito semelhante a anti-inflamatórios; mesmo candidatos à artroplastia melhoram com programa estruturado (Skou 2015).", bom: ["Adesão ao exercício", "Perda de peso (≥ 5–10%)", "Força de quadríceps"], ruim: ["Obesidade", "Mau alinhamento varo/valgo", "Fraqueza de quadríceps", "Dor bilateral, depressão"] },
    conduta: {
      inflamatoria: ["Crise: reduzir carga, gelo/calor por conforto, exercício sem impacto (bicicleta, água)", "Educação: 'dor não é dano', movimento é seguro"],
      proliferativa: ["Fortalecimento de quadríceps, isquiotibiais, quadril (2–3x/sem)", "Exercício neuromuscular (GLA:D)", "Terapia manual como adjunto"],
      remodelacao: ["Atividade aeróbica regular (150 min/sem)", "Perda de peso", "Joelheira/órtese de descarga em casos selecionados"]
    },
    evidencia: [{ ref: "Bannuru RR et al. OARSI 2019 / Kolasinski SL et al. ACR 2019 / NICE NG226 2022", msg: "Exercício + educação + controle de peso como núcleo. ACR desaconselha fortemente glucosamina, condroitina, TENS e PRP (falta de evidência); artroscopia NÃO indicada para OA." }, { ref: "Skou ST et al. NEJM 2015", msg: "Programa não cirúrgico de 12 sem trouxe melhora clinicamente relevante; ~2/3 do grupo não cirúrgico não fizeram artroplastia em 1 ano." }],
    desfechos: ["KOOS / WOMAC", "30s Chair Stand", "Teste de caminhada de 40 m", "Timed Up and Go"]
  },
  {
    id: "tendinopatia_patelar", nome: "Tendinopatia patelar ('joelho do saltador')", regiao: "joelho", tecido: "tendao",
    resumo: "Dor localizada no polo inferior da patela, dependente de carga, em atletas de salto. Dor aumenta com a demanda de armazenamento de energia (salto > agachamento > caminhada).",
    achados: { j_polo: 6, j_salto: 4, aquece: 3, jovem: 2, carga: 2, esporte: 1 },
    contra: { j_estalo: 3, edema: 2, idoso: 2 },
    testes: ["step_down"],
    diferencial: ["Dor femoropatelar (dor difusa)", "Sinding-Larsen-Johansson (adolescente)", "Bursite infrapatelar / coxim gorduroso de Hoffa"],
    encaminhar: ["Ruptura (perda de extensão ativa)"],
    prognostico: { texto: "Tratamento lento: 12 semanas a > 6 meses; recorrências comuns se a carga do esporte não for gerida.", bom: ["Início recente", "Gestão de carga"], ruim: ["Longa duração", "Continuar saltando com dor alta"] },
    conduta: {
      inflamatoria: ["Reduzir carga de salto (não parar tudo)", "Isometria de quadríceps (ex.: 5 × 45 s a 70% CVM) para analgesia"],
      proliferativa: ["Isotônico pesado e lento (HSR): leg press, agachamento, extensão, 3x/sem", "Monitorar com teste de agachamento unipodal em declive (dor 24 h)"],
      remodelacao: ["Armazenamento de energia: saltos progressivos", "Retorno ao esporte gradual"]
    },
    evidencia: [{ ref: "Malliaras P et al. JOSPT 2015", msg: "Programa de carga em 4 estágios (isométrico → isotônico → energia → esporte)." }, { ref: "Kongsgaard M et al. Scand J Med Sci Sports 2009 (RCT)", msg: "HSR com bons resultados clínicos e melhor satisfação que excêntrico isolado e corticoide em 6 meses." }],
    desfechos: ["VISA-P", "Dor no agachamento em declive"]
  },

  // =============================== TORNOZELO / PÉ ===============================
  {
    id: "entorse_tornozelo", nome: "Entorse lateral do tornozelo", regiao: "tornozelo", tecido: "ligamento",
    resumo: "Mecanismo em inversão + flexão plantar; LTFA é o mais lesado, seguido do LCF. Lesão musculoesquelética mais comum no esporte, com alta taxa de recidiva e instabilidade crônica (até ~40%).",
    achados: { t_inversao: 6, t_lateral: 4, trauma: 3, edema: 2, esporte: 1 },
    contra: { insidioso: 4 },
    testes: ["ottawa_tornozelo", "gaveta_tornozelo", "squeeze"],
    diferencial: ["Fratura (maléolo, 5º metatarso, navicular) — Ottawa", "Entorse alta (sindesmose — retorno 2x mais lento)", "Lesão osteocondral do tálus (dor profunda persistente)", "Lesão dos fibulares (subluxação)", "Fratura do processo lateral do tálus/anterior do calcâneo"],
    encaminhar: ["Ottawa positiva", "Suspeita de lesão da sindesmose instável", "Dor/edema persistentes > 6 sem (lesão osteocondral)"],
    prognostico: { texto: "Maioria melhora em 2–6 semanas, porém até 40% evoluem com sintomas residuais/instabilidade crônica. Treino neuromuscular reduz recidivas.", bom: ["Tratamento funcional precoce", "Treino de equilíbrio por ≥ 3 meses"], ruim: ["Entorse prévia", "Retorno precoce sem treino", "Lesão da sindesmose", "Incapacidade de saltar 2 semanas após a lesão"] },
    conduta: {
      inflamatoria: ["PEACE; carga conforme tolerância com órtese/bandagem", "Exercícios de ADM, controle de edema", "AINEs: evitar de rotina (PEACE)"],
      proliferativa: ["Tratamento funcional > imobilização (exceto grave: imobilização curta < 10 dias)", "Treino de equilíbrio e propriocepção, força de fibulares", "Terapia manual para dorsiflexão"],
      remodelacao: ["Saltos, agilidade, esporte; órtese/bandagem no retorno se entorse prévia", "Manter programa preventivo (ex.: 3 meses)"]
    },
    evidencia: [{ ref: "Vuurberg G et al. BJSM 2018 — Ankle sprain guideline update", msg: "Tratamento funcional com exercício; órtese para prevenção de recidiva; imagem apenas se Ottawa positiva; cirurgia não é 1ª linha." }, { ref: "Martin RL et al. JOSPT 2021 — Lateral Ankle Sprain CPG", msg: "Carga precoce, suporte externo, exercício terapêutico, terapia manual." }, { ref: "Doherty C et al. BJSM 2017", msg: "Exercício e órtese reduzem recidiva; evidência fraca para modalidades passivas." }],
    desfechos: ["FAAM", "CAIT (instabilidade crônica)", "Y-Balance", "Weight-bearing lunge test"]
  },
  {
    id: "aquiles", nome: "Tendinopatia do calcâneo (Aquiles) — porção média", regiao: "tornozelo", tecido: "tendao",
    resumo: "Dor e rigidez 2–6 cm acima da inserção, pior pela manhã e ao iniciar atividade, que melhora ao aquecer e piora após. Comum em corredores e > 30 anos. Forma insercional tem dor na inserção e piora com dorsiflexão.",
    achados: { t_aquiles: 6, aquece: 3, t_corrida: 3, t_manha: 2, carga: 2, meia: 1, insidioso: 1 },
    contra: { t_pedrada: 4, trauma: 2 },
    testes: ["arc_aquiles", "thompson"],
    diferencial: ["Ruptura do tendão calcâneo (Thompson!)", "Bursite retrocalcânea / Haglund", "Paratendinopatia", "Uso de fluoroquinolonas (risco de ruptura)", "Doença inflamatória (entesite bilateral)"],
    encaminhar: ["Suspeita de ruptura", "Tendinopatia bilateral com sinais inflamatórios"],
    prognostico: { texto: "Programas de carga de 12 semanas mostram bons resultados; recuperação completa pode levar 6–12 meses.", bom: ["Adesão ao programa", "Gestão de carga com monitoramento de dor"], ruim: ["Longa duração", "Forma insercional (mais difícil)", "Fatores metabólicos (diabetes, obesidade)"] },
    conduta: {
      inflamatoria: ["Reduzir picos de carga, manter atividade tolerável (modelo de monitoramento de dor — Silbernagel)", "Isometria de flexores plantares", "Elevação de calcanhar temporária"],
      proliferativa: ["Excêntrico (Alfredson) ou HSR — ambos eficazes", "Fortalecimento de sóleo e gastrocnêmio com carga progressiva"],
      remodelacao: ["Pliometria, saltos, corrida progressiva", "Insercional: evitar dorsiflexão (não descer abaixo do degrau)"]
    },
    evidencia: [{ ref: "Martin RL et al. JOSPT 2018 — Midportion Achilles Tendinopathy CPG", msg: "Exercícios de carga (excêntrico/HSR) com forte recomendação; educação sobre carga." }, { ref: "Beyer R et al. AJSM 2015 (RCT)", msg: "HSR ≈ excêntrico, com melhor satisfação/adesão." }, { ref: "Silbernagel KG et al. AJSM 2007", msg: "Continuar atividade com monitoramento de dor (≤ 5/10) não prejudicou resultados." }],
    desfechos: ["VISA-A", "Heel raise endurance test"]
  },
  {
    id: "ruptura_aquiles", nome: "Ruptura do tendão calcâneo — ENCAMINHAR", regiao: "tornozelo", tecido: "tendao",
    resumo: "Sensação de 'pedrada' ou chute na panturrilha durante arrancada/salto, gap palpável, incapacidade de ficar na ponta do pé unipodal. Thompson positivo. Até 20% são inicialmente não diagnosticadas.",
    achados: { t_pedrada: 7, trauma: 3, meia: 2, esporte: 1 },
    contra: { insidioso: 3 },
    testes: ["thompson"],
    diferencial: ["Lesão do gastrocnêmio medial ('tennis leg')", "TVP", "Tendinopatia do calcâneo"],
    encaminhar: ["Encaminhar ao ortopedista prontamente (tratamento funcional não cirúrgico ou cirúrgico)"],
    prognostico: { texto: "Tratamento funcional não cirúrgico acelerado ≈ cirurgia em re-ruptura quando com reabilitação adequada (Willits 2010; Ochen 2019). Déficit de força de flexores plantares é comum a longo prazo.", bom: ["Reabilitação funcional precoce"], ruim: ["Alongamento do tendão (perda de força)", "Diagnóstico tardio"] },
    conduta: { inflamatoria: ["Imobilização em equino / bota funcional conforme médico"], proliferativa: ["Carga precoce protegida na bota, redução gradual das cunhas"], remodelacao: ["Fortalecimento de panturrilha intenso, corrida ~ 4–6 meses, esporte 9–12 meses"] },
    evidencia: [{ ref: "Ochen Y et al. BMJ 2019 (meta-análise)", msg: "Cirurgia reduziu re-ruptura vs não cirúrgico, mas com mais complicações; com reabilitação funcional precoce a diferença diminui." }],
    desfechos: ["ATRS", "Heel rise height"]
  },
  {
    id: "fasciopatia", nome: "Fasciopatia plantar (dor plantar do calcanhar)", regiao: "tornozelo", tecido: "tendao",
    resumo: "Dor na inserção medial da fáscia plantar no calcâneo, pior nos primeiros passos da manhã e após repouso. Fatores: IMC elevado, ficar muito tempo em pé, redução de dorsiflexão, corrida.",
    achados: { t_calcanhar: 6, t_manha: 5, meia: 1, carga: 1, t_corrida: 1 },
    contra: { parestesia: 2, trauma: 2 },
    testes: ["windlass"],
    diferencial: ["Fratura por estresse do calcâneo (squeeze do calcâneo)", "Síndrome do túnel do tarso / neuropatia de Baxter (parestesia)", "Atrofia do coxim gorduroso", "Espondiloartrite (entesite)"],
    encaminhar: ["Dor com carga progressiva e squeeze do calcâneo positivo (fratura por estresse)"],
    prognostico: { texto: "Autolimitada na maioria em 6–12 meses; ~80% resolvem em 1 ano. Educação + alongamento + fortalecimento aceleram melhora.", bom: ["Curta duração", "Baixo IMC"], ruim: ["Obesidade", "Longa duração", "Bilateral"] },
    conduta: {
      inflamatoria: ["Educação, redução de carga, calçado adequado", "Alongamento específico da fáscia e panturrilha", "Bandagem antipronação (curto prazo)"],
      proliferativa: ["Fortalecimento com carga alta (elevação de calcanhar com toalha sob os dedos — Rathleff)", "Órteses plantares pré-fabricadas (curto prazo)"],
      remodelacao: ["Progressão de carga e retorno à corrida", "Ondas de choque para casos refratários"]
    },
    evidencia: [{ ref: "Koc TA et al. JOSPT 2023 — Plantar Heel Pain CPG (Revision 2023)", msg: "Terapia manual, alongamento, bandagem, órteses, educação e ondas de choque com recomendações; exercícios de fortalecimento recomendados." }, { ref: "Rathleff MS et al. Scand J Med Sci Sports 2015 (RCT)", msg: "Treino de força com carga alta melhorou função mais rápido que alongamento isolado em 3 meses." }],
    desfechos: ["FFI (Foot Function Index)", "FAAM", "NPRS primeiros passos"]
  }
];

// Motor de raciocínio: calcula probabilidade relativa de cada condição.
window.rankearHipoteses = function (regiao, achadosSelecionados) {
  const sel = new Set(achadosSelecionados);
  const lista = window.CONDICOES.filter(c => !regiao || c.regiao === regiao).map(c => {
    const pesos = Object.entries(c.achados);
    const max = pesos.reduce((s, [, w]) => s + w, 0);
    let pontos = 0; const presentes = [], ausentes = [], contra = [];
    pesos.forEach(([k, w]) => { if (sel.has(k)) { pontos += w; presentes.push(k); } else ausentes.push([k, w]); });
    Object.entries(c.contra || {}).forEach(([k, w]) => { if (sel.has(k)) { pontos -= w; contra.push(k); } });
    const pct = Math.max(0, Math.round((pontos / max) * 100));
    ausentes.sort((a, b) => b[1] - a[1]);
    return { c, pct, presentes, ausentes: ausentes.map(a => a[0]), contra };
  });
  return lista.sort((a, b) => b.pct - a.pct);
};

window.rotuloAchado = function (k) {
  for (const g of Object.values(window.ACHADOS)) if (g.itens[k]) return g.itens[k];
  return k;
};
