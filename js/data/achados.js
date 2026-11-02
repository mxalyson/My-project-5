// Achados clínicos (história + exame) usados pelo motor de raciocínio.
window.REGIOES = [
  { id: "lombar", nome: "Coluna lombar / pelve" },
  { id: "cervical", nome: "Coluna cervical" },
  { id: "ombro", nome: "Ombro" },
  { id: "cotovelo", nome: "Cotovelo" },
  { id: "punho", nome: "Punho e mão" },
  { id: "quadril", nome: "Quadril e coxa" },
  { id: "joelho", nome: "Joelho" },
  { id: "tornozelo", nome: "Tornozelo e pé" }
];

window.ACHADOS = {
  geral: {
    titulo: "História geral",
    itens: {
      trauma: "Início traumático (evento definido)",
      insidioso: "Início insidioso / gradual",
      carga: "Aumento recente de carga/treino/atividade",
      jovem: "Idade < 35 anos",
      meia: "Idade 35–55 anos",
      idoso: "Idade > 55 anos",
      esporte: "Pratica esporte / atividade de impacto",
      mecanica: "Dor varia com movimento/postura (comportamento mecânico)",
      aquece: "Dor melhora ao aquecer e piora depois / na manhã seguinte",
      edema: "Edema / derrame",
      noturna: "Dor noturna",
      rigidez_curta: "Rigidez matinal < 30 min",
      rigidez_longa: "Rigidez matinal > 30 min",
      parestesia: "Formigamento / dormência",
      fraqueza: "Fraqueza percebida"
    }
  },
  lombar: {
    titulo: "Lombar / pelve",
    itens: {
      l_local: "Dor lombar sem irradiação abaixo do joelho",
      l_irradiada: "Dor irradiada abaixo do joelho (padrão dermatomal)",
      l_tosse: "Piora com tosse / espirro / Valsalva",
      l_sentado: "Piora sentado / em flexão",
      l_caminhar: "Dor/peso nas pernas ao caminhar que alivia ao sentar ou flexionar",
      l_extensao: "Piora com extensão",
      l_slr: "SLR / Slump positivo",
      l_deficit: "Déficit neurológico (força, reflexo ou sensibilidade)",
      l_sij: "Dor unilateral abaixo de L5 / sobre a EIPS",
      l_gestacao: "Gestação / pós-parto",
      l_centraliza: "Centralização / preferência direcional com movimentos repetidos",
      l_melhora_exerc: "Melhora com exercício e NÃO com repouso",
      l_hiperext: "Esporte com hiperextensão repetida (ginástica, dança, críquete)"
    }
  },
  cervical: {
    titulo: "Cervical",
    itens: {
      c_local: "Dor cervical local com limitação de movimento",
      c_irradiada: "Dor irradiada para o membro superior",
      c_spurling: "Spurling / ULTT / distração positivos",
      c_cefaleia: "Cefaleia unilateral que inicia na região suboccipital",
      c_mov_cefaleia: "Cefaleia provocada por postura/movimento do pescoço",
      c_chicote: "Mecanismo em chicote (ex.: colisão automobilística)",
      c_rotacao: "Rotação cervical reduzida (< 60°) / teste de flexão-rotação +"
    }
  },
  ombro: {
    titulo: "Ombro",
    itens: {
      o_arco: "Arco doloroso (60–120°)",
      o_lateral: "Dor anterolateral do ombro / região do deltoide",
      o_overhead: "Piora com atividades acima da cabeça",
      o_fraqueza_re: "Fraqueza em rotação externa / elevação",
      o_queda: "Queda / trauma sobre o ombro",
      o_rigidez: "Perda de ADM ATIVA e PASSIVA (principalmente RE)",
      o_metab: "Diabetes / doença tireoidiana",
      o_apreensao: "Sensação de instabilidade / luxação prévia",
      o_ac: "Dor localizada na articulação acromioclavicular",
      o_aducao: "Dor na adução horizontal (cross-body)"
    }
  },
  cotovelo: {
    titulo: "Cotovelo",
    itens: {
      co_lateral: "Dor no epicôndilo lateral",
      co_preensao: "Dor ao preensão / levantar objetos com o punho",
      co_medial: "Dor no epicôndilo medial"
    }
  },
  punho: {
    titulo: "Punho / mão",
    itens: {
      p_noturna: "Parestesia noturna nos dedos 1–3 (acorda e 'sacode a mão')",
      p_phalen: "Phalen / Tinel positivo",
      p_radial: "Dor no lado radial do punho (base do polegar)",
      p_finkelstein: "Finkelstein positivo",
      p_bebe: "Pós-parto / cuidado com bebê / uso repetitivo do polegar"
    }
  },
  quadril: {
    titulo: "Quadril / coxa",
    itens: {
      q_inguinal: "Dor inguinal",
      q_lateral: "Dor lateral sobre o trocânter maior",
      q_deitar: "Dor ao deitar sobre o lado",
      q_rm: "Perda de rotação medial / rigidez de quadril",
      q_fadir: "FADIR positivo / dor em flexão profunda",
      q_adutor: "Dor na região dos adutores / púbis ao chutar ou mudar de direção",
      q_isquio: "Dor súbita posterior da coxa em sprint ou alongamento",
      q_unipodal: "Dor ao subir escadas / apoio unipodal"
    }
  },
  joelho: {
    titulo: "Joelho",
    itens: {
      j_anterior: "Dor anterior / retropatelar difusa",
      j_agachar: "Piora ao agachar, escadas, sentar por longo tempo",
      j_estalo: "Estalo audível + derrame rápido (< 2 h)",
      j_falseio: "Falseio / instabilidade",
      j_rotacao: "Mecanismo rotacional com pé fixo / desaceleração",
      j_valgo: "Mecanismo em valgo / impacto lateral",
      j_medial: "Dor na face medial",
      j_interlinha: "Dor à palpação da interlinha articular",
      j_bloqueio: "Bloqueio / travamento / sensação de prender",
      j_crepitacao: "Crepitação",
      j_polo: "Dor localizada no polo inferior da patela",
      j_salto: "Esportes com salto (vôlei, basquete)"
    }
  },
  tornozelo: {
    titulo: "Tornozelo / pé",
    itens: {
      t_inversao: "Entorse em inversão",
      t_lateral: "Dor / edema lateral (região do LTFA)",
      t_aquiles: "Dor no tendão calcâneo 2–6 cm acima da inserção",
      t_manha: "Dor nos primeiros passos da manhã",
      t_calcanhar: "Dor plantar medial do calcanhar",
      t_corrida: "Corredor",
      t_pedrada: "Sensação de 'pedrada' na panturrilha / não fica na ponta do pé"
    }
  }
};

// Bandeiras vermelhas (patologia grave). Baseado em Finucane et al., JOSPT 2020 e IFOMPT.
window.RED_FLAGS = [
  { grupo: "Síndrome da cauda equina (EMERGÊNCIA)", acao: "Encaminhar imediatamente ao pronto-socorro.", itens: [
    "Anestesia em sela (períneo, região genital/anal)",
    "Retenção ou incontinência urinária / alteração recente da micção",
    "Incontinência fecal / perda de tônus anal",
    "Disfunção sexual de início recente",
    "Déficit neurológico bilateral ou progressivo em MMII"
  ]},
  { grupo: "Neoplasia / câncer", acao: "Encaminhar ao médico com urgência (dias).", itens: [
    "História prévia de câncer (principal fator!)",
    "Perda de peso inexplicada",
    "Dor noturna constante, não mecânica, que não alivia com posição",
    "Idade > 50 anos com dor de início recente sem causa",
    "Falha do tratamento conservador após 4–6 semanas"
  ]},
  { grupo: "Infecção", acao: "Encaminhar ao médico com urgência.", itens: [
    "Febre / calafrios / mal-estar sistêmico",
    "Uso de drogas injetáveis, imunossupressão, cirurgia/procedimento invasivo recente",
    "Infecção recente (urinária, pele)",
    "Articulação quente, vermelha e muito dolorosa (artrite séptica)"
  ]},
  { grupo: "Fratura", acao: "Solicitar avaliação médica / imagem (usar regras de Ottawa / Canadense).", itens: [
    "Trauma significativo (ou trauma leve em idoso/osteoporose)",
    "Uso prolongado de corticoide",
    "Idade > 70 anos / osteoporose",
    "Dor à palpação óssea pontual / incapacidade de carga"
  ]},
  { grupo: "Vascular / cardiopulmonar", acao: "Emergência se sinais agudos.", itens: [
    "Dor torácica, dispneia, sudorese (síndrome coronariana)",
    "Dor abdominal/lombar pulsátil (aneurisma de aorta)",
    "Panturrilha edemaciada, quente, dolorosa (TVP) — Wells",
    "Sinais 5D 3N (tontura, diplopia, disartria, disfagia, drop attacks, nistagmo, náusea, dormência facial)",
    "Cefaleia súbita e intensa 'a pior da vida' / dor cervical aguda incomum"
  ]},
  { grupo: "Mielopatia cervical", acao: "Encaminhar ao médico (neurocirurgia/ortopedia).", itens: [
    "Alteração da marcha / desequilíbrio",
    "Perda de destreza das mãos (abotoar, escrever)",
    "Hoffmann, Babinski, clônus, hiperreflexia",
    "Parestesia bilateral de mãos/pés"
  ]},
  { grupo: "Doença inflamatória sistêmica", acao: "Encaminhar ao reumatologista (não urgente).", itens: [
    "Rigidez matinal > 30–60 min que melhora com movimento",
    "Dor lombar crônica iniciada antes dos 45 anos, despertar na 2ª metade da noite",
    "Múltiplas articulações acometidas / edema simétrico de pequenas articulações",
    "Uveíte, psoríase, doença inflamatória intestinal, entesite, dactilite",
    "Boa resposta a AINEs"
  ]},
  { grupo: "Síndrome compartimental", acao: "EMERGÊNCIA cirúrgica.", itens: [
    "Dor desproporcional após trauma/fratura/gesso",
    "Dor ao estiramento passivo dos músculos do compartimento",
    "Parestesia, palidez, compartimento tenso"
  ]}
];

// Bandeiras amarelas (psicossociais) e outras.
window.YELLOW_FLAGS = [
  "Crença de que a dor é perigosa / indica dano grave",
  "Catastrofização (\"isso nunca vai melhorar\", \"vou ficar paralisado\")",
  "Medo do movimento / cinesiofobia, comportamento de evitação",
  "Humor deprimido, ansiedade, estresse elevado",
  "Expectativa de que tratamento passivo resolverá (\"só preciso de alguém que arrume\")",
  "Baixa autoeficácia",
  "Problemas no trabalho, insatisfação, conflitos, litígio/compensação",
  "Isolamento social, falta de suporte",
  "Distúrbios do sono",
  "Experiências prévias negativas com tratamentos"
];
window.OUTRAS_FLAGS = [
  { cor: "Azul", desc: "Percepções sobre o trabalho (estresse, carga, apoio do chefe)" },
  { cor: "Preta", desc: "Sistema/contexto: políticas de afastamento, legislação, condições de trabalho, sistema de saúde" },
  { cor: "Laranja", desc: "Transtornos psiquiátricos (depressão maior, transtorno de personalidade) — encaminhar" }
];
