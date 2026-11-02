// Prática baseada em evidências: hierarquia, leitura crítica, guidelines e glossário.

// As 11 recomendações consistentes das diretrizes de alta qualidade (Lin et al., BJSM 2020)
window.ONZE_RECOMENDACOES = [
  "Garantir que o cuidado seja centrado no paciente",
  "Rastrear patologias graves (red flags)",
  "Avaliar fatores psicossociais",
  "Usar exames de imagem apenas quando houver suspeita de patologia grave, falha do tratamento ou quando o resultado mudar a conduta",
  "Realizar exame físico (testes neurológicos, mobilidade, força)",
  "Avaliar o progresso do paciente com instrumentos de desfecho validados",
  "Oferecer educação/informação sobre a condição e as opções de tratamento",
  "Abordar atividade física e/ou exercício",
  "Usar terapia manual apenas como adjunto a outros tratamentos",
  "Oferecer cuidado não cirúrgico de alta qualidade antes da cirurgia",
  "Facilitar a continuidade ou o retorno ao trabalho"
];

// O que fazer / o que não fazer — síntese das diretrizes (tradução prática)
window.FACA_NAO_FACA = {
  faca: [
    ["Educação em dor e prognóstico", "Reduz medo, catastrofização e uso desnecessário de serviços. Base de praticamente todas as diretrizes."],
    ["Exercício terapêutico progressivo", "Primeira linha para dor lombar, cervical, OA, tendinopatias, DFP, ombro. Escolher o que o paciente vai FAZER (adesão > modalidade)."],
    ["Manter-se ativo / retorno gradual", "Repouso no leito piora desfechos em dor lombar e entorses."],
    ["Estratificação de risco (STarT Back, Örebro)", "Direciona intensidade do cuidado e abordagem psicologicamente informada."],
    ["Terapia manual + exercício", "Combinação melhor que terapia manual isolada (cervical, lombar, OA quadril)."],
    ["Regras de decisão clínica (Ottawa, Canadense)", "Evitam radiografias desnecessárias com segurança."],
    ["Desfechos validados (PROMs) e MCID", "Medir para saber se o paciente melhorou de forma relevante."],
    ["Critérios objetivos de retorno ao esporte", "Reduzem re-lesão (ex.: LCA: LSI ≥ 90% e ≥ 9 meses)."],
    ["Programas preventivos baseados em exercício", "FIFA 11+, nórdico, Copenhagen e treino de equilíbrio reduzem lesões."]
  ],
  nao: [
    ["Imagem de rotina para dor lombar inespecífica", "Não melhora desfechos, aumenta custos, rótulos e cirurgias."],
    ["Eletroterapia isolada (TENS, ultrassom, interferencial, ondas curtas)", "Evidência fraca ou nula para a maioria das condições musculoesqueléticas; não recomendada por NICE para lombalgia."],
    ["Repouso prolongado / imobilização prolongada", "Descondicionamento, rigidez e pior prognóstico (exceto fraturas instáveis e casos específicos)."],
    ["Tratamentos exclusivamente passivos", "Aumentam dependência; a melhora tende a não se manter."],
    ["Linguagem nocebo", "'Coluna desgastada', 'bico de papagaio', 'hérnia grave', 'joelho de 80 anos' — aumentam medo e incapacidade."],
    ["Órteses lombares e tração para lombalgia", "Não recomendadas (NICE, JOSPT)."],
    ["Artroscopia para OA de joelho / descompressão subacromial", "Não superiores a placebo/exercício em ECRs."],
    ["Corticoide como 1ª linha em tendinopatia lateral do cotovelo", "Alivia a curto prazo mas piora resultado em 1 ano."],
    ["Glucosamina/condroitina na OA", "Fortemente desaconselhadas pelo ACR 2019."]
  ],
  incerto: [
    ["Bandagem elástica (kinesio)", "Efeitos pequenos e em geral semelhantes a placebo."],
    ["Dry needling / acupuntura", "Resultados mistos; efeito pequeno e de curto prazo em algumas condições."],
    ["Ondas de choque", "Útil em fasciopatia plantar refratária e tendinopatia calcária; evidência mista em outras."],
    ["Laser de baixa intensidade", "Evidência heterogênea; algumas meta-análises positivas em tendinopatias e OA."],
    ["PRP (plasma rico em plaquetas)", "Evidência conflitante; ACR desaconselha na OA."],
    ["Liberação miofascial / ventosaterapia", "Evidência de baixa qualidade."]
  ]
};

// Hierarquia de evidência e qualidade
window.NIVEIS_EVIDENCIA = [
  { nivel: "1a", desc: "Revisão sistemática (com meta-análise) de ensaios clínicos randomizados de alta qualidade", nota: "Ex.: Cochrane, revisões em BJSM, JOSPT. Avaliar com AMSTAR-2." },
  { nivel: "1b", desc: "Ensaio clínico randomizado (ECR) individual de alta qualidade", nota: "Avaliar com escala PEDro (≥ 6/10 = alta qualidade) e RoB 2." },
  { nivel: "2a/2b", desc: "Revisão de coortes / coorte prospectiva / ECR de baixa qualidade", nota: "Importantes para prognóstico e fatores de risco." },
  { nivel: "3", desc: "Estudos caso-controle", nota: "Úteis para condições raras." },
  { nivel: "4", desc: "Séries de casos, coortes de baixa qualidade", nota: "" },
  { nivel: "5", desc: "Opinião de especialistas, ciência básica, raciocínio fisiológico", nota: "Útil para gerar hipóteses, não para decidir." }
];
window.GRADE = [
  ["Alta", "Muito confiantes de que o efeito real está próximo da estimativa. Novas pesquisas dificilmente mudarão a conclusão."],
  ["Moderada", "Moderadamente confiantes; o efeito real provavelmente está próximo, mas pode ser substancialmente diferente."],
  ["Baixa", "Confiança limitada; o efeito real pode ser substancialmente diferente."],
  ["Muito baixa", "Pouca confiança; o efeito real provavelmente é substancialmente diferente."]
];
window.GRADE_FATORES = {
  rebaixam: ["Risco de viés", "Inconsistência (heterogeneidade)", "Evidência indireta (população/intervenção diferente)", "Imprecisão (IC amplo, amostras pequenas)", "Viés de publicação"],
  elevam: ["Grande magnitude de efeito", "Gradiente dose-resposta", "Confundidores plausíveis reduziriam o efeito"]
};

// Escala PEDro (itens 2–11 pontuam; item 1 = validade externa)
window.PEDRO = [
  "Critérios de elegibilidade especificados (não pontua)",
  "Alocação aleatória dos participantes",
  "Alocação sigilosa (oculta)",
  "Grupos semelhantes no início quanto aos principais prognósticos",
  "Cegamento de todos os participantes",
  "Cegamento de todos os terapeutas",
  "Cegamento de todos os avaliadores de pelo menos um desfecho-chave",
  "Medidas de ao menos um desfecho-chave obtidas em > 85% dos participantes alocados",
  "Análise por intenção de tratar (ou todos receberam o tratamento alocado)",
  "Comparações estatísticas entre grupos relatadas para ao menos um desfecho-chave",
  "Medidas de precisão (IC) e de variabilidade relatadas para ao menos um desfecho-chave"
];

// Checklist de leitura crítica rápida
window.LEITURA_CRITICA = [
  { titulo: "1. A pergunta é clara? (PICO)", itens: ["População bem definida e parecida com seu paciente?", "Intervenção descrita com dose (frequência, intensidade, tempo, tipo — FITT)?", "Comparador adequado (placebo, cuidado usual, outra terapia)?", "Desfecho importante para o paciente (dor, função, retorno ao trabalho) e não apenas substituto (ADM, imagem)?"] },
  { titulo: "2. Os resultados são válidos?", itens: ["Randomização e alocação sigilosa?", "Avaliador cego?", "Perdas < 15% e análise por intenção de tratar?", "Tamanho amostral calculado (poder)?", "Registro prévio do protocolo (evita relato seletivo)?", "Conflitos de interesse/financiamento declarados?"] },
  { titulo: "3. Os resultados são importantes?", itens: ["Diferença entre grupos (não só dentro do grupo!)", "A diferença supera o MCID (mínima diferença clinicamente importante)?", "Intervalo de confiança 95% — é preciso? Inclui efeito trivial?", "NNT (número necessário para tratar) — quanto menor, melhor", "Tamanho de efeito (d de Cohen/SMD: 0,2 pequeno; 0,5 moderado; 0,8 grande)"] },
  { titulo: "4. Posso aplicar no meu paciente?", itens: ["Meu paciente é parecido com os do estudo?", "Tenho recursos/habilidade para aplicar a intervenção?", "Benefícios superam riscos, custos e esforço?", "Está de acordo com valores e preferências do paciente?"] }
];

// Diretrizes e fontes de alta qualidade
window.FONTES = [
  { nome: "PEDro — Physiotherapy Evidence Database", url: "https://pedro.org.au/", desc: "Base específica da fisioterapia com ECRs, revisões e diretrizes, já pontuados na escala PEDro. Tem versão em português." },
  { nome: "Cochrane Library", url: "https://www.cochranelibrary.com/", desc: "Revisões sistemáticas de alto rigor metodológico. Leia o 'Plain language summary'." },
  { nome: "JOSPT Clinical Practice Guidelines (APTA)", url: "https://www.jospt.org/cpg", desc: "Diretrizes da APTA para dor lombar, cervical, joelho, tornozelo, ombro, quadril, cotovelo, punho. Acesso livre." },
  { nome: "NICE Guidelines (Reino Unido)", url: "https://www.nice.org.uk/guidance", desc: "Diretrizes nacionais com recomendações claras do que fazer e não fazer (ex.: NG59 lombalgia, NG226 OA)." },
  { nome: "British Journal of Sports Medicine — Consensus statements", url: "https://bjsm.bmj.com/", desc: "Consensos internacionais (retorno ao esporte, DFP, dor inguinal, concussão, RED-S)." },
  { nome: "PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/", desc: "Base geral biomédica. Use filtros: Systematic Review, Randomized Controlled Trial, Practice Guideline." },
  { nome: "OARSI", url: "https://oarsi.org/", desc: "Osteoarthritis Research Society International — diretrizes de OA." },
  { nome: "IFOMPT", url: "https://www.ifompt.org/", desc: "Frameworks de segurança cervical (vascular) e red flags para fisioterapia manual." },
  { nome: "Rede Brasileira de Fisioterapia Baseada em Evidências / Brazilian Journal of Physical Therapy", url: "https://www.rbf-bjpt.org.br/", desc: "Periódico nacional de alto impacto, publica em inglês com muitos estudos brasileiros." },
  { nome: "TRIP Database", url: "https://www.tripdatabase.com/", desc: "Motor de busca que hierarquiza evidência (diretrizes e revisões primeiro)." }
];

// Glossário PT → EN (termos de busca / MeSH) para ajudar na leitura e na busca de artigos
window.GLOSSARIO = [
  ["Dor lombar", "Low back pain", "Low Back Pain [MeSH]"],
  ["Ciática / radiculopatia", "Sciatica / radiculopathy", "Sciatica; Radiculopathy"],
  ["Cervicalgia", "Neck pain", "Neck Pain"],
  ["Ombro doloroso / manguito rotador", "Shoulder pain / rotator cuff", "Shoulder Pain; Rotator Cuff Injuries"],
  ["Capsulite adesiva", "Frozen shoulder / adhesive capsulitis", "Bursitis (MeSH antigo); adhesive capsulitis"],
  ["Tendinopatia", "Tendinopathy", "Tendinopathy"],
  ["Entorse de tornozelo", "Ankle sprain", "Ankle Injuries; Sprains and Strains"],
  ["Ruptura do LCA", "Anterior cruciate ligament injury", "Anterior Cruciate Ligament Injuries"],
  ["Dor femoropatelar", "Patellofemoral pain", "Patellofemoral Pain Syndrome"],
  ["Osteoartrite / artrose", "Osteoarthritis", "Osteoarthritis, Knee; Osteoarthritis, Hip"],
  ["Fasciíte plantar", "Plantar fasciitis / plantar heel pain", "Fasciitis, Plantar"],
  ["Exercício terapêutico", "Exercise therapy", "Exercise Therapy"],
  ["Terapia manual", "Manual therapy / musculoskeletal manipulation", "Musculoskeletal Manipulations"],
  ["Fortalecimento / treino resistido", "Resistance training / strength training", "Resistance Training"],
  ["Educação em neurociência da dor", "Pain neuroscience education", "pain education"],
  ["Ensaio clínico randomizado", "Randomized controlled trial (RCT)", "Randomized Controlled Trial [pt]"],
  ["Revisão sistemática", "Systematic review", "Systematic Review [pt]"],
  ["Diretriz de prática clínica", "Clinical practice guideline", "Practice Guideline [pt]"],
  ["Mínima diferença clinicamente importante", "Minimal clinically important difference (MCID)", "Minimal Clinically Important Difference"],
  ["Intervalo de confiança", "Confidence interval (CI)", "—"],
  ["Número necessário para tratar", "Number needed to treat (NNT)", "Numbers Needed To Treat"],
  ["Sensibilidade / especificidade", "Sensitivity / specificity", "Sensitivity and Specificity"],
  ["Razão de verossimilhança", "Likelihood ratio (LR+/LR−)", "—"],
  ["Desfecho relatado pelo paciente", "Patient-reported outcome measure (PROM)", "Patient Reported Outcome Measures"],
  ["Retorno ao esporte", "Return to sport (RTS)", "Return to Sport"],
  ["Cinesiofobia / medo-evitação", "Kinesiophobia / fear-avoidance", "Fear; Avoidance Learning"],
  ["Catastrofização", "Pain catastrophizing", "Catastrophization"],
  ["Dor nociplástica / sensibilização central", "Nociplastic pain / central sensitization", "Central Nervous System Sensitization"],
  ["Prognóstico", "Prognosis", "Prognosis"],
  ["Cuidado usual", "Usual care", "—"],
  ["Viés", "Bias (selection, performance, detection, attrition, reporting)", "Bias"],
  ["Cegamento", "Blinding / masking", "—"],
  ["Alocação sigilosa", "Concealed allocation", "—"],
  ["Intenção de tratar", "Intention-to-treat analysis (ITT)", "Intention to Treat Analysis"]
];

// Fundamentos de estatística aplicada ao diagnóstico
window.ESTATISTICA = [
  ["Sensibilidade (Sn)", "Proporção de doentes com teste positivo. Sn alta + teste NEGATIVO → descarta (SnNout)."],
  ["Especificidade (Sp)", "Proporção de não doentes com teste negativo. Sp alta + teste POSITIVO → confirma (SpPin)."],
  ["LR+ = Sn / (1 − Sp)", "> 10: grande aumento na probabilidade; 5–10 moderado; 2–5 pequeno; 1–2 mínimo."],
  ["LR− = (1 − Sn) / Sp", "< 0,1: grande redução; 0,1–0,2 moderada; 0,2–0,5 pequena; 0,5–1 mínima."],
  ["Probabilidade pré-teste", "Prevalência na sua população + história clínica. O teste MODIFICA essa probabilidade (nomograma de Fagan)."],
  ["Clusters de testes", "Combinações de achados aumentam a acurácia mais do que testes isolados."],
  ["Confiabilidade (ICC/Kappa)", "Kappa > 0,6 bom; ICC > 0,75 bom. Um teste não confiável não pode ser válido."],
  ["MCID", "Menor mudança que o paciente percebe como importante. Use para julgar melhora individual e relevância de estudos."]
];
