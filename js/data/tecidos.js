// Fases do reparo tecidual e comportamento por tecido.
// Prazos são aproximados (variam com idade, tamanho da lesão, vascularização, comorbidades, carga).
window.FASES = [
  {
    id: "inflamatoria",
    nome: "Fase inflamatória (aguda)",
    cor: "#e05a47",
    dias: "0 – 5/7 dias",
    biologia: [
      "Hemostasia: vasoconstrição, agregação plaquetária e formação do coágulo de fibrina (matriz provisória).",
      "Liberação de mediadores (histamina, bradicinina, prostaglandinas, citocinas IL-1, IL-6, TNF-α).",
      "Vasodilatação e aumento de permeabilidade → edema; migração de neutrófilos (24–48 h) e macrófagos (48–96 h).",
      "Macrófagos M1 fagocitam detritos; transição para M2 libera fatores de crescimento (PDGF, TGF-β, VEGF) que iniciam a proliferação.",
      "Sensibilização periférica dos nociceptores — a dor é protetora e esperada."
    ],
    sinais: ["Dor em repouso e/ou noturna", "Calor e rubor local", "Edema / derrame", "Dor antes da resistência (end-feel vazio/espasmo)", "Alta irritabilidade"],
    objetivos: ["Proteger sem imobilizar em excesso", "Controlar dor e edema", "Manter função das regiões adjacentes", "Educar sobre o processo e prognóstico"],
    conduta: [
      "PEACE (Dubois & Esculier, BJSM 2020): Proteção 1–3 dias, Elevação, Evitar anti-inflamatórios de rotina (podem atrasar o reparo), Compressão, Educação.",
      "Movimento ativo leve dentro de limite de dor tolerável (dor ≤ 3/10 que cede rápido).",
      "Crioterapia: alívio analgésico de curto prazo; efeito no reparo é incerto — usar para conforto, não como tratamento principal.",
      "Exercícios isométricos submáximos e de regiões não lesadas; manutenção cardiovascular.",
      "Evitar: alongamento agressivo, carga máxima, massagem profunda sobre o local, calor nas primeiras 48–72 h."
    ],
    alerta: "Se sinais inflamatórios não reduzirem após ~7–10 dias, reavalie: infecção, fratura não diagnosticada, doença inflamatória sistêmica, síndrome compartimental, TVP."
  },
  {
    id: "proliferativa",
    nome: "Fase proliferativa (subaguda / reparo)",
    cor: "#e3a33b",
    dias: "≈ 3/5 dias – 3/6 semanas",
    biologia: [
      "Fibroblastos proliferam e sintetizam colágeno tipo III (fibras finas, desorganizadas, mecanicamente fracas).",
      "Angiogênese e formação de tecido de granulação.",
      "Miofibroblastos promovem contração da ferida.",
      "A resistência tênsil do tecido ainda é baixa (≈ 15–30% do normal) — vulnerável a sobrecarga.",
      "Carga mecânica progressiva começa a orientar as fibras (mecanotransdução)."
    ],
    sinais: ["Dor ao movimento/carga, não mais em repouso", "Edema residual diminuindo", "Dor coincide com a resistência (end-feel)", "Irritabilidade moderada"],
    objetivos: ["Introduzir carga progressiva e controlada", "Restaurar ADM", "Iniciar ganho de força e controle motor", "Evitar recidiva por sobrecarga precoce"],
    conduta: [
      "Exercício terapêutico progressivo: isométrico → isotônico concêntrico/excêntrico com carga baixa-moderada.",
      "Mobilização articular e de tecidos moles conforme tolerância; ADM ativa e ativo-assistida.",
      "Monitorar resposta em 24 h (regra das 24 h): dor ≤ 5/10 durante e retorno ao basal até a manhã seguinte = carga aceitável.",
      "Propriocepção e controle neuromuscular inicial.",
      "LOVE (BJSM 2020): Carga (Load), Otimismo, Vascularização (aeróbico), Exercício."
    ],
    alerta: "Sobrecarga nesta fase gera aumento de dor > 24 h, edema recorrente e piora da função — reduza volume/intensidade, não pare totalmente."
  },
  {
    id: "remodelacao",
    nome: "Fase de remodelação / maturação (crônica do reparo)",
    cor: "#3b9b6d",
    dias: "≈ 3 semanas – 12/18 meses",
    biologia: [
      "Substituição progressiva do colágeno III por colágeno tipo I (fibras espessas, organizadas e alinhadas à linha de força).",
      "Aumento de ligações cruzadas (cross-links) → ganho de resistência tênsil.",
      "Diminuição da celularidade e vascularização.",
      "O tecido raramente volta a 100% das propriedades originais (ligamentos ≈ 50–80% após 1 ano).",
      "Adaptação depende diretamente do estímulo mecânico (Lei de Wolff / Davis)."
    ],
    sinais: ["Sem sinais inflamatórios", "Dor apenas em altas cargas/fim de ADM ou ausente", "Resistência antes da dor", "Baixa irritabilidade"],
    objetivos: ["Fortalecimento com cargas altas", "Treino de potência, velocidade e específico do esporte/tarefa", "Retorno à atividade/esporte com critérios objetivos", "Prevenção de recidiva"],
    conduta: [
      "Treino de força com carga alta (≥ 70–85% de 1RM, 6–12 repetições) e progressão de volume.",
      "Pliometria, agilidade, mudança de direção e gestos específicos.",
      "Testes funcionais para alta: simetria de força (LSI ≥ 90%), hop tests, questionários de função e prontidão psicológica.",
      "Gestão de carga de treino (aumentos graduais; evitar picos súbitos)."
    ],
    alerta: "Dor persistente desproporcional à lesão após o tempo de reparo esperado sugere mecanismos nociplásticos/sensibilização central ou fatores psicossociais — adapte a abordagem (educação em neurociência da dor, exposição gradual)."
  }
];

// Tempos de reparo e particularidades por tecido.
window.TECIDOS = [
  {
    id: "musculo", nome: "Músculo esquelético",
    vascular: "Alta", tempo: "Grau I: 1–3 sem · Grau II: 3–8 sem · Grau III/tendão intramuscular: 2–4+ meses",
    particularidades: [
      "Regeneração via células satélites; risco de cicatriz fibrosa se imobilizado em excesso ou se re-lesionado.",
      "Classificação BAMIC (British Athletics Muscle Injury Classification): 0–4 + a/b/c (miofascial, musculotendínea, intratendínea). Lesões 'c' (envolvendo tendão) têm retorno mais lento e maior recidiva.",
      "Mobilização precoce (após 2–5 dias) melhora alinhamento das fibras.",
      "Isquiotibiais: alongamento ativo/excêntrico (protocolo Askling L-protocol) reduz tempo de retorno vs. convencional.",
      "Miosite ossificante: evitar massagem vigorosa e calor em contusões grandes na fase aguda."
    ],
    carga: "Isometria precoce sem dor → excêntrico progressivo → força em comprimento longo → velocidade/sprint."
  },
  {
    id: "tendao", nome: "Tendão",
    vascular: "Baixa", tempo: "Tendinopatia: 12 semanas a 6+ meses de carga progressiva · Ruptura reparada: 6–12 meses",
    particularidades: [
      "Modelo do continuum (Cook & Purdam 2009): tendinopatia reativa → desorganização (disrepair) → degenerativa. Útil didaticamente para guiar carga.",
      "Tendinopatia NÃO é processo inflamatório clássico — 'tendinite' é termo geralmente inadequado em quadros crônicos.",
      "O tendão responde à CARGA: repouso total descondiciona; carga excessiva/súbita irrita.",
      "Dor de tendão é tipicamente localizada, dependente de carga e com 'aquecimento' (melhora durante a atividade, piora depois/na manhã seguinte).",
      "Compressão (ex.: dorsiflexão no Aquiles insercional, adução no glúteo médio) é provocativa — evitar na fase inicial."
    ],
    carga: "Isometria (analgesia variável) → isotônico lento e pesado (HSR) → armazenamento de energia (pliometria) → retorno ao esporte. Acompanhe dor 24 h."
  },
  {
    id: "ligamento", nome: "Ligamento",
    vascular: "Baixa a moderada (LCA intra-articular: muito baixa)", tempo: "Grau I: 1–3 sem · Grau II: 3–6 sem · Grau III: 6–12 sem (extra-articular); LCA reconstruído: 9–12+ meses para retorno ao esporte",
    particularidades: [
      "Ligamentos extra-articulares (LCM, LTFA) cicatrizam bem com tratamento funcional.",
      "LCA não cicatriza bem por baixa vascularização e ambiente sinovial — decisão entre reconstrução ou reabilitação (ver KANON trial).",
      "Tecido cicatricial tem menor resistência e propriocepção — treino neuromuscular é essencial para prevenção de recidiva (entorse de tornozelo: recidiva até ~30–40%).",
      "Mobilização precoce protegida > imobilização prolongada (exceto casos específicos)."
    ],
    carga: "Proteção relativa (órtese funcional) → ADM → força e propriocepção → agilidade e esporte."
  },
  {
    id: "osso", nome: "Osso",
    vascular: "Alta", tempo: "Membros superiores: 6–8 sem · Inferiores: 8–12 sem · Escafoide/colo do tálus/colo femoral: risco de necrose/pseudoartrose",
    particularidades: [
      "Fases: hematoma → calo mole (2–3 sem) → calo duro (6–12 sem) → remodelação (meses a anos).",
      "Consolidação clínica (sem dor à palpação/carga) precede a radiológica completa.",
      "Fraturas por estresse de alto risco (colo femoral lado tensão, navicular, 5º metatarso base, tíbia anterior) exigem conduta mais conservadora.",
      "Fatores que atrasam: tabagismo, diabetes, AINEs em altas doses, desnutrição, RED-S (deficiência energética relativa), corticoides.",
      "Carga controlada estimula consolidação — siga liberação ortopédica para carga."
    ],
    carga: "Respeitar estabilidade da fixação/fratura → carga parcial progressiva → total → impacto."
  },
  {
    id: "cartilagem", nome: "Cartilagem articular",
    vascular: "Avascular", tempo: "Capacidade de reparo muito limitada; procedimentos (microfratura) exigem 6–12 meses de proteção e progressão",
    particularidades: [
      "Nutrição por difusão do líquido sinovial — depende de carga cíclica (compressão/descompressão).",
      "Lesões de espessura parcial não cicatrizam espontaneamente; total podem formar fibrocartilagem.",
      "Na osteoartrite, o exercício e o controle de peso são tratamentos de primeira linha (OARSI, NICE).",
      "Dor na OA não se correlaciona bem com o grau radiológico."
    ],
    carga: "Movimento cíclico sem impacto (bicicleta, hidro) → fortalecimento → progressão funcional."
  },
  {
    id: "menisco", nome: "Menisco / fibrocartilagem",
    vascular: "Zona vermelha (1/3 periférico) vascular; zona branca (interna) avascular", tempo: "Lesão degenerativa conservadora: 8–12 sem · Sutura: 4–6 meses",
    particularidades: [
      "Lesões degenerativas em > 40–45 anos: exercício é tão eficaz quanto artroscopia (meniscectomia parcial) — vários ECRs (ex.: Kise et al., BMJ 2016; FIDELITY).",
      "Bloqueio verdadeiro (joelho travado) sugere alça de balde → encaminhar.",
      "Sutura meniscal: restrições de flexão com carga nas primeiras semanas conforme cirurgião."
    ],
    carga: "Controle de edema → ADM → força de quadríceps/quadril → progressão funcional."
  },
  {
    id: "nervo", nome: "Nervo periférico",
    vascular: "Moderada (vasa nervorum sensível à compressão)", tempo: "Neuropraxia: dias a 12 sem · Axonotmese: regeneração ≈ 1 mm/dia (≈ 2,5 cm/mês) · Neurotmese: cirúrgica",
    particularidades: [
      "Classificação de Seddon (neuropraxia, axonotmese, neurotmese) e Sunderland (graus I–V).",
      "Sinal de Tinel progressivo distalmente indica regeneração.",
      "Neurodinâmica: técnicas de deslizamento (sliders) são menos provocativas que tensionadores (tensioners).",
      "Radiculopatia: maioria melhora com tratamento conservador em 6–12 semanas; déficit motor progressivo = encaminhar.",
      "Dor neuropática: queimação, choque, alodinia, distribuição dermatomal/periférica."
    ],
    carga: "Proteção da compressão → neurodinâmica suave (sliders) → exercício geral e funcional."
  },
  {
    id: "disco", nome: "Disco intervertebral",
    vascular: "Avascular (exceto anel externo)", tempo: "Hérnias discais: reabsorção espontânea frequente (sequestros têm maior taxa de regressão), melhora clínica em 6–12 sem",
    particularidades: [
      "Achados de imagem (protrusão, degeneração) são muito prevalentes em assintomáticos (Brinjikji et al., AJNR 2015) — não supervalorizar.",
      "Fenômeno de centralização (McKenzie/MDT) associado a melhor prognóstico.",
      "Síndrome da cauda equina é emergência — triagem obrigatória."
    ],
    carga: "Educação + manter atividade → preferência direcional (se presente) → exercício geral progressivo."
  }
];

// Estimador de fase: retorna fase provável a partir de dias e sinais.
window.estimarFase = function (dias, sinais) {
  // sinais: {repouso, calor, edema, noturna, irritabilidade:'alta'|'moderada'|'baixa'}
  let scoreInf = 0, scorePro = 0, scoreRem = 0;
  if (dias <= 5) scoreInf += 3; else if (dias <= 21) scorePro += 3; else scoreRem += 3;
  if (dias > 3 && dias <= 42) scorePro += 1;
  if (sinais.repouso) scoreInf += 2;
  if (sinais.calor) scoreInf += 2;
  if (sinais.edema) { scoreInf += 1; scorePro += 1; }
  if (sinais.noturna) scoreInf += 1;
  if (sinais.irritabilidade === "alta") scoreInf += 2;
  if (sinais.irritabilidade === "moderada") scorePro += 2;
  if (sinais.irritabilidade === "baixa") scoreRem += 2;
  const arr = [["inflamatoria", scoreInf], ["proliferativa", scorePro], ["remodelacao", scoreRem]].sort((a, b) => b[1] - a[1]);
  let obs = [];
  if (dias > 42 && (sinais.calor || sinais.repouso)) obs.push("Sinais inflamatórios persistindo além de 6 semanas: investigar causa (infecção, doença reumática, reagudização por sobrecarga, fratura não identificada).");
  if (dias > 90 && sinais.irritabilidade === "alta") obs.push("Dor de alta irritabilidade além do tempo esperado de reparo: considerar dor nociplástica / sensibilização central e fatores psicossociais.");
  return { fase: arr[0][0], obs };
};
