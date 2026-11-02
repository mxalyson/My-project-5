// Escalas, instrumentos, prescrição de exercício e casos clínicos.

window.PROMS = [
  ["NPRS / EVA (0–10)", "Dor", "2 pontos ou 30%", "Farrar 2001; Childs 2005"],
  ["Oswestry (ODI, 0–100%)", "Incapacidade lombar", "≈ 10 pontos ou 30%", "Ostelo 2008"],
  ["Roland-Morris (0–24)", "Incapacidade lombar", "≈ 5 pontos ou 30%", "Ostelo 2008"],
  ["Neck Disability Index (0–50)", "Incapacidade cervical", "≈ 5–7,5 pontos (10–15%)", "Young 2009; MacDermid 2009"],
  ["SPADI (0–100)", "Dor e incapacidade do ombro", "≈ 8–13 pontos", "Roy 2009"],
  ["QuickDASH (0–100)", "Membro superior", "≈ 8–15 pontos", "Mintken 2009; Franchignoni 2014"],
  ["LEFS (0–80)", "Membro inferior", "9 pontos", "Binkley 1999"],
  ["KOOS (0–100 por subescala)", "Joelho", "≈ 8–10 pontos", "Roos 2003"],
  ["HOOS (0–100)", "Quadril", "≈ 8–10 pontos", "Nilsdotter 2003"],
  ["PSFS (0–10)", "Função específica do paciente", "2 pontos (média) / 3 (atividade única)", "Stratford 1995; Horn 2012"],
  ["VISA-A (0–100)", "Tendinopatia do calcâneo", "≈ 6–7 pontos", "McCormack 2015"],
  ["VISA-P (0–100)", "Tendinopatia patelar", "≈ 13 pontos", "Hernandez-Sanchez 2014"],
  ["AKPS / Kujala (0–100)", "Dor femoropatelar", "≈ 8–10 pontos", "Crossley 2004"],
  ["FAAM (AVD 0–100)", "Tornozelo/pé", "8 pontos (AVD) / 9 (esporte)", "Martin 2005"],
  ["TSK-17 (17–68)", "Cinesiofobia", "> 37 = alta cinesiofobia", "Vlaeyen 1995"],
  ["PCS (0–52)", "Catastrofização", "≥ 30 = clinicamente relevante", "Sullivan 1995"],
  ["Timed Up and Go", "Mobilidade/risco de queda (idosos)", "> 13,5 s = risco aumentado de queda", "Shumway-Cook 2000"],
  ["Sentar e levantar 30 s", "Força funcional de MMII (idosos)", "Abaixo da norma para idade = risco", "Jones 1999 (Rikli & Jones)"]
];

window.STARTBACK = [
  "Nas últimas 2 semanas, minha dor nas costas se espalhou pelas pernas.",
  "Nas últimas 2 semanas, tive dor no ombro ou na nuca pelo menos uma vez.",
  "Evitei andar longas distâncias por causa da minha dor nas costas.",
  "Nas últimas 2 semanas, tenho me vestido mais devagar por causa da dor nas costas.",
  "A atividade física não é realmente segura para uma pessoa com um problema como o meu.",
  "Tenho ficado preocupado(a) por muito tempo por causa da minha dor nas costas.",
  "Sinto que minha dor nas costas é terrível e que nunca vai melhorar.",
  "Em geral, não tenho aproveitado as coisas como costumava.",
  "No geral, quanto sua dor nas costas incomodou nas últimas 2 semanas? (marque SIM se 'muito' ou 'extremamente')"
];

window.OXFORD = [
  ["0", "Nenhuma contração visível ou palpável"],
  ["1", "Contração visível/palpável sem movimento"],
  ["2", "Movimento completo sem ação da gravidade"],
  ["3", "Movimento completo contra a gravidade"],
  ["4", "Movimento contra a gravidade + resistência moderada"],
  ["5", "Força normal (resistência máxima)"]
];

window.END_FEEL = [
  ["Ósseo (duro)", "Osso contra osso — normal na extensão do cotovelo", "Anormal: osteófito, consolidação viciosa"],
  ["Capsular (firme)", "Firme com leve elasticidade — RE do ombro, extensão do joelho", "Anormal precoce: capsulite, OA"],
  ["Elástico (tecidual)", "Estiramento muscular — flexão do quadril com joelho estendido", "Anormal: encurtamento"],
  ["Aproximação de tecidos moles", "Flexão do joelho/cotovelo", "—"],
  ["Espasmo", "Parada abrupta por defesa muscular", "Sempre anormal: lesão aguda, inflamação, instabilidade"],
  ["Vazio", "Dor impede chegar ao fim — sem resistência sentida", "Sempre anormal: bursite aguda, abscesso, fratura, tumor"],
  ["Bloqueio elástico (mola)", "Rebote", "Anormal: corpo livre, lesão meniscal"]
];

window.IRRITABILIDADE = {
  alta: ["Pouca atividade provoca dor intensa (≥ 7/10)", "Demora horas ou até o dia seguinte para aliviar", "Dor em repouso/noturna frequente", "→ Exame limitado (poucos movimentos até o primeiro sintoma), tratamento de baixa intensidade"],
  moderada: ["Atividade moderada provoca dor moderada", "Alivia em minutos a 1–2 horas", "→ Exame até o início da dor/resistência, carga moderada"],
  baixa: ["Muita atividade necessária para provocar dor", "Alivia rapidamente (segundos/minutos)", "→ Exame completo com sobrepressão e testes combinados, carga alta"]
};

window.SINSS = [
  ["Severidade (Severity)", "Intensidade da dor e quanto ela limita as atividades. Alta severidade → paciente para a atividade pela dor."],
  ["Irritabilidade (Irritability)", "Quanto de atividade provoca sintomas, quão intensos e quanto tempo levam para aliviar."],
  ["Natureza (Nature)", "Tipo de dor (nociceptiva, neuropática, nociplástica), diagnóstico provável, red/yellow flags, fatores psicossociais."],
  ["Estágio (Stage)", "Agudo (< 6 sem), subagudo (6–12 sem), crônico (> 12 sem) + fase do reparo tecidual."],
  ["Estabilidade (Stability)", "Melhorando, piorando ou estável? Sintomas progressivos exigem cautela/encaminhamento."]
];

window.TIPOS_DOR = [
  { tipo: "Nociceptiva", desc: "Dor proporcional, localizada, com padrão mecânico claro (agravantes e aliviantes consistentes), relacionada a lesão/inflamação tecidual.", conduta: "Respeitar fase de reparo, carga progressiva, controle da inflamação." },
  { tipo: "Neuropática", desc: "Lesão/doença do sistema somatossensorial: distribuição dermatomal ou de nervo periférico, queimação, choque, parestesia, alterações sensitivas (alodinia, hipoestesia). Ferramentas: DN4, LANSS, painDETECT.", conduta: "Proteger da compressão, neurodinâmica, exercício; encaminhar para medicação específica se intensa." },
  { tipo: "Nociplástica", desc: "Dor por nocicepção alterada sem evidência de lesão ou doença que a explique (Kosek et al., Pain 2021): dor difusa, desproporcional, hipersensibilidade (luz, som, toque), fadiga, sono ruim, alterações cognitivas.", conduta: "Educação em neurociência da dor, exercício gradual (pacing/graded exposure), sono, abordagem psicologicamente informada, menor foco em tecido." }
];

window.CIF = [
  ["Condição de saúde", "Diagnóstico/hipótese (ex.: tendinopatia patelar)"],
  ["Estrutura e função do corpo", "Deficiências: dor, ADM, força, edema, controle motor, sensibilidade"],
  ["Atividade", "Limitações: agachar, correr, subir escadas, dormir, vestir-se"],
  ["Participação", "Restrições: trabalho, esporte, lazer, papel familiar"],
  ["Fatores pessoais", "Crenças, medo, expectativas, idade, condicionamento, enfrentamento"],
  ["Fatores ambientais", "Trabalho, suporte social, acesso a serviços, ambiente físico, calçado/equipamento"]
];

// Prescrição de exercício (ACSM / NSCA)
window.PRESCRICAO = [
  ["Resistência muscular", "< 50–67% 1RM", "15–25", "2–3", "< 30–60 s", "RPE 5–6"],
  ["Força (iniciante/reabilitação)", "60–70% 1RM", "8–12", "1–3", "1–2 min", "RIR 2–4"],
  ["Hipertrofia", "67–85% 1RM", "6–12", "3–6", "30–90 s", "RIR 0–3"],
  ["Força máxima", "≥ 85% 1RM", "≤ 6", "2–6", "2–5 min", "RIR 1–3"],
  ["Potência", "30–60% 1RM (alta velocidade)", "3–6", "3–5", "2–5 min", "Máxima velocidade intencional"],
  ["Isometria analgésica (tendão)", "~70% CVM", "4–5 × 30–45 s", "—", "2 min", "Dor ≤ 3/10"],
  ["HSR (heavy slow resistance)", "15RM → 6RM progressivo", "15 → 6", "3–4", "2–3 min", "3 s concêntrico + 3 s excêntrico"]
];

window.REGRA_DOR = [
  "Durante o exercício: dor até 5/10 é aceitável (modelo de monitoramento da dor — Silbernagel et al. 2007).",
  "Após o exercício: a dor deve voltar ao nível basal até a manhã seguinte (regra das 24 h).",
  "Ao longo das semanas: a dor não deve aumentar progressivamente.",
  "Se os critérios forem violados: reduzir a carga (volume, intensidade ou amplitude), não suspender toda a atividade.",
  "Exceções: em condições neurológicas com déficit, pós-operatório e fraturas, seguir parâmetros específicos (dor não é guia confiável)."
];

window.RETORNO_ESPORTE = [
  ["Retorno à participação", "Treina, mas modificado/restrito; ainda não está pronto para competir."],
  ["Retorno ao esporte", "Volta ao esporte, mas ainda abaixo do desempenho desejado."],
  ["Retorno ao desempenho", "Atua no nível prévio ou superior."]
];
window.RETORNO_CRITERIOS = [
  "Dor mínima ou ausente nas atividades do esporte",
  "Edema/derrame ausente",
  "ADM completa ou funcional",
  "Força simétrica: LSI (índice de simetria entre membros) ≥ 90% (isocinético ou dinamômetro)",
  "Testes de salto (hop tests): LSI ≥ 90%",
  "Testes de agilidade e de gesto específico do esporte sem compensação",
  "Prontidão psicológica (ex.: ACL-RSI, I-PRRS)",
  "Tempo biológico mínimo respeitado (ex.: LCA ≥ 9 meses)",
  "Exposição progressiva a cargas de treino (taxa de aumento controlada)",
  "Decisão compartilhada (atleta, fisioterapeuta, médico, treinador) — modelo StARRT (Ardern et al., BJSM 2016)"
];

// Casos clínicos para treino de raciocínio
window.CASOS = [
  {
    titulo: "Corredora com dor no joelho",
    texto: "Mulher, 24 anos, corredora amadora, aumentou o volume de 20 para 45 km/semana em 1 mês para uma meia maratona. Dor difusa anterior no joelho direito, pior ao descer escadas, agachar e após ficar sentada no cinema. Sem trauma, sem derrame, sem falseio. Agachamento unipodal reproduz a dor (5/10). Lachman e McMurray negativos.",
    perguntas: [
      { p: "Qual a hipótese mais provável?", op: ["Lesão meniscal", "Dor femoropatelar", "Ruptura do LCA", "Tendinopatia patelar"], c: 1, exp: "Dor anterior difusa, piora com atividades que aumentam a carga femoropatelar (escadas, agachar, sentar longo tempo), associada a aumento súbito de carga. Agachamento é o teste mais sensível para DFP." },
      { p: "Qual fator do caso é o principal provável desencadeante?", op: ["Idade", "Aumento rápido de volume de treino", "Sexo feminino", "Uso de tênis"], c: 1, exp: "Aumento de mais de 100% no volume em 1 mês: erro de gestão de carga. A educação sobre carga é central." },
      { p: "Qual conduta tem MAIOR suporte das diretrizes?", op: ["Ultrassom terapêutico + repouso total", "Exercício combinado de quadril e joelho + educação sobre carga", "Infiltração de corticoide", "Artroscopia"], c: 1, exp: "JOSPT CPG 2019 e consenso de 2016: exercícios de quadril e joelho com forte recomendação; eletroterapia não recomendada." }
    ]
  },
  {
    titulo: "Pedreiro com dor lombar irradiada",
    texto: "Homem, 42 anos, pedreiro. Há 10 dias, ao levantar um saco de cimento, iniciou dor lombar e, depois de 2 dias, dor irradiada para face lateral da perna e dorso do pé esquerdo, pior que a dor lombar. Piora ao sentar e ao tossir. SLR esquerdo positivo a 40° com aumento pela dorsiflexão. Fraqueza 4/5 na extensão do hálux. Sem alterações urinárias ou perineais.",
    perguntas: [
      { p: "Qual raiz está provavelmente acometida?", op: ["L3", "L4", "L5", "S1"], c: 2, exp: "Dermátomo de face lateral da perna e dorso do pé + miótomo de extensão do hálux = L5 (comum na hérnia L4-L5 posterolateral)." },
      { p: "Qual pergunta é OBRIGATÓRIA neste caso e foi corretamente realizada?", op: ["Histórico familiar de câncer", "Sintomas de cauda equina (sela, esfíncteres)", "Prática de esportes", "Tipo de colchão"], c: 1, exp: "Na radiculopatia, triagem de cauda equina é obrigatória e deve ser documentada. Oriente o paciente a procurar emergência se surgirem sinais." },
      { p: "Qual o prognóstico mais adequado de comunicar?", op: ["Precisará de cirurgia", "A maioria melhora em semanas a poucos meses com tratamento conservador", "Nunca mais poderá trabalhar com carga", "A hérnia não regride"], c: 1, exp: "A maioria das radiculopatias por hérnia melhora em 6–12 semanas; hérnias frequentemente regridem. Monitorar a força a cada sessão." }
    ]
  },
  {
    titulo: "Jogador de futebol com entorse",
    texto: "Homem, 19 anos, entorse em inversão há 2 dias durante jogo. Edema e equimose lateral; caminha com claudicação mas consegue dar 4 passos. Sem dor à palpação nos maléolos posteriores, base do 5º metatarso ou navicular. Já teve 2 entorses no mesmo tornozelo.",
    perguntas: [
      { p: "Segundo as regras de Ottawa, ele precisa de radiografia?", op: ["Sim", "Não"], c: 1, exp: "Nenhum critério positivo (sem dor óssea nos pontos específicos e capaz de dar 4 passos). Sn ≈ 0,98: fratura improvável." },
      { p: "Em que fase do reparo ele provavelmente está?", op: ["Inflamatória", "Proliferativa", "Remodelação"], c: 0, exp: "48 h após a lesão com edema e equimose: fase inflamatória. Aplicar PEACE e carga conforme tolerância." },
      { p: "Qual intervenção mais reduz o risco de nova entorse (recidiva)?", op: ["Gelo por 6 semanas", "Treino neuromuscular/equilíbrio + órtese/bandagem no retorno", "Repouso de 4 semanas", "Laser"], c: 1, exp: "Treino proprioceptivo/neuromuscular e uso de órtese/bandagem reduzem recidivas (Vuurberg 2018; Doherty 2017). Histórico de entorses prévias é fator de risco." }
    ]
  },
  {
    titulo: "Mulher com ombro rígido",
    texto: "Mulher, 52 anos, diabética tipo 2. Há 3 meses, dor no ombro esquerdo sem trauma, muito pior à noite. Perda importante de RE ativa E passiva (20° vs 80° do outro lado), abdução também limitada. Radiografia normal. Dor intensa (8/10) ao fim da ADM, demorando horas para aliviar.",
    perguntas: [
      { p: "Qual a hipótese mais provável?", op: ["Tendinopatia do manguito", "Capsulite adesiva", "Ruptura do manguito", "Instabilidade"], c: 1, exp: "Perda de ADM ativa e passiva com padrão capsular (RE > abdução), radiografia normal, mulher 40–65 anos, diabética." },
      { p: "Qual a irritabilidade e como isso influencia a conduta?", op: ["Baixa — alongamento intenso", "Alta — técnicas de baixa intensidade, controle da dor, considerar injeção", "Moderada — cirurgia"], c: 1, exp: "Dor intensa que demora horas para aliviar = alta irritabilidade (fase dolorosa). Alongamento agressivo tende a piorar; corticoide intra-articular é eficaz nessa fase." }
    ]
  },
  {
    titulo: "Idoso com dor nas pernas ao caminhar",
    texto: "Homem, 71 anos. Há 1 ano, dor e sensação de peso nas duas pernas após caminhar 200 m, que alivia quando se senta ou inclina para frente apoiado no carrinho de supermercado. Pulsos pediosos presentes. Sem alteração esfincteriana.",
    perguntas: [
      { p: "Hipótese principal?", op: ["Claudicação vascular", "Estenose do canal lombar", "Hérnia discal aguda", "OA de quadril"], c: 1, exp: "Claudicação neurogênica: alívio com flexão/sentar (não apenas parar), pulsos presentes, idoso." },
      { p: "Qual exercício costuma ser mais bem tolerado?", op: ["Caminhada em descida", "Bicicleta ergométrica", "Extensões lombares repetidas", "Corrida"], c: 1, exp: "Bicicleta mantém o tronco em flexão (abre o canal), permitindo treino aeróbico com menos sintomas." }
    ]
  },
  {
    titulo: "Dor lombar com rigidez matinal",
    texto: "Homem, 29 anos. Dor lombar há 8 meses, insidiosa, que acorda de madrugada; rigidez matinal de 1 h e meia que melhora com exercício e piora com repouso. Teve episódio de olho vermelho e doloroso há 1 ano. Melhora muito com anti-inflamatório.",
    perguntas: [
      { p: "Qual a conduta mais adequada?", op: ["Tratar como dor lombar inespecífica apenas", "Encaminhar ao reumatologista e manter exercício", "Solicitar repouso", "Manipulação lombar diária"], c: 1, exp: "Características de dor lombar inflamatória + uveíte: suspeita de espondiloartrite axial. Exercício é parte do tratamento, mas o diagnóstico e o tratamento medicamentoso precoces mudam o prognóstico." }
    ]
  },
  {
    titulo: "Corredor com dor no calcâneo",
    texto: "Homem, 38 anos, corredor. Dor no tendão calcâneo direito ~4 cm acima da inserção há 3 meses. Rigidez nos primeiros passos da manhã. A dor diminui após 10 min de corrida, mas está pior no dia seguinte. Espessamento palpável. Thompson negativo.",
    perguntas: [
      { p: "Qual a hipótese e o principal tratamento?", op: ["Ruptura — imobilização", "Tendinopatia da porção média — programa de carga progressiva (excêntrico ou HSR)", "Fasciopatia plantar — palmilha", "Bursite — repouso"], c: 1, exp: "Dor na porção média (2–6 cm), comportamento de 'aquecimento', rigidez matinal. JOSPT CPG 2018: exercícios de carga com forte recomendação." },
      { p: "Ele pode continuar correndo?", op: ["Não, repouso absoluto", "Sim, se a dor ≤ 5/10 durante e retornar ao basal na manhã seguinte", "Sim, sem qualquer limite"], c: 1, exp: "Modelo de monitoramento da dor (Silbernagel 2007): manter atividade dentro de limites não prejudicou a recuperação." }
    ]
  }
];
