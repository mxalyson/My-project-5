/* Artigos: busca no PubMed (NCBI E-utilities), dados de acesso aberto e texto completo (Europe PMC),
   avaliação crítica, tradução e extração. */
(function () {
  "use strict";
  const { $, $$, esc, store, tabs, lista, app, rotas } = window.FR;
  const EUTILS = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/";
  const EPMC = "https://www.ebi.ac.uk/europepmc/webservices/rest/";
  const TOOL = "&tool=fisioraciocinio";

  // ---------------------------------------------------------------- armazenamento
  const bib = () => store.get("bib_artigos", {});
  const salvarBib = b => store.set("bib_artigos", b);
  const cacheGet = (pmid, k) => store.get(`art_${k}_${pmid}`, null);
  const cacheSet = (pmid, k, v) => {
    try { localStorage.setItem(`art_${k}_${pmid}`, JSON.stringify(v)); return true; }
    catch (e) { return false; } // cota do navegador cheia
  };

  // ---------------------------------------------------------------- PubMed
  const FILTROS = [
    ["sr", "Revisão sistemática", "systematic review[pt]"],
    ["ma", "Meta-análise", "meta-analysis[pt]"],
    ["rct", "Ensaio clínico randomizado", "randomized controlled trial[pt]"],
    ["gl", "Diretriz (guideline)", "(guideline[pt] OR practice guideline[pt])"],
    ["free", "Texto completo gratuito", "free full text[sb]"],
    ["y5", "Últimos 5 anos", '"last 5 years"[dp]'],
    ["y10", "Últimos 10 anos", '"last 10 years"[dp]'],
    ["hum", "Humanos", "humans[mh]"]
  ];

  // ---------------------------------------------------------------- rede resiliente
  // O PubMed (NCBI) às vezes fica fora do ar ou limita requisições (3/s); nesses casos a resposta pode vir
  // sem cabeçalho CORS ("Failed to fetch"). Tentamos de novo e, se persistir, usamos o Europe PMC,
  // que indexa os mesmos registros do PubMed (MEDLINE).
  const esperar = ms => new Promise(r => setTimeout(r, ms));
  async function obter(url, tipo = "json", tentativas = 3) {
    let ultimo;
    for (let i = 0; i < tentativas; i++) {
      try {
        const r = await fetch(url);
        if (r.status === 429 || r.status >= 500) throw new Error("HTTP " + r.status);
        if (!r.ok) throw new Error("HTTP " + r.status);
        const dado = tipo === "json" ? await r.json() : await r.text();
        if (tipo === "json" && dado && dado.esearchresult && dado.esearchresult.ERROR) throw new Error("PubMed: " + dado.esearchresult.ERROR.slice(0, 80));
        if (tipo === "json" && dado && dado.error) throw new Error("PubMed: " + String(dado.error).slice(0, 80));
        return dado;
      } catch (e) { ultimo = e; if (i < tentativas - 1) await esperar(700 * (i + 1)); }
    }
    throw ultimo;
  }
  const semTags = s => String(s || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

  async function esearch(term, retstart = 0, sort = "relevance") {
    const u = `${EUTILS}esearch.fcgi?db=pubmed&retmode=json&retmax=20&retstart=${retstart}&sort=${sort === "date" ? "pub_date" : "relevance"}&term=${encodeURIComponent(term)}${TOOL}`;
    const j = await obter(u); return { ids: j.esearchresult.idlist || [], total: +j.esearchresult.count || 0, traducao: j.esearchresult.querytranslation };
  }
  async function esummary(ids) {
    if (!ids.length) return [];
    const j = await obter(`${EUTILS}esummary.fcgi?db=pubmed&retmode=json&id=${ids.join(",")}${TOOL}`);
    return ids.map(id => j.result[id]).filter(Boolean).map(d => ({
      pmid: d.uid, titulo: d.title, revista: d.fulljournalname || d.source, ano: (d.pubdate || "").slice(0, 4),
      autores: (d.authors || []).map(a => a.name), tipos: d.pubtype || [],
      pmcid: ((d.articleids || []).find(a => a.idtype === "pmc") || {}).value || "",
      doi: ((d.articleids || []).find(a => a.idtype === "doi") || {}).value || ""
    }));
  }
  // ---- Europe PMC (reserva)
  const EPMC_TIPOS = { sr: 'PUB_TYPE:"systematic review"', ma: 'PUB_TYPE:"meta-analysis"', rct: 'PUB_TYPE:"randomized controlled trial"', gl: '(PUB_TYPE:"guideline" OR PUB_TYPE:"practice guideline")' };
  function consultaEpmc(q, filtros, desde) {
    const ano = new Date().getFullYear();
    const tipos = filtros.filter(f => EPMC_TIPOS[f]).map(f => EPMC_TIPOS[f]);
    const partes = [`(${q})`, "SRC:MED"];
    if (tipos.length) partes.push(`(${tipos.join(" OR ")})`);
    if (filtros.includes("free")) partes.push("OPEN_ACCESS:y");
    if (filtros.includes("y5")) partes.push(`FIRST_PDATE:[${ano - 5}-01-01 TO ${ano + 1}-12-31]`);
    else if (filtros.includes("y10")) partes.push(`FIRST_PDATE:[${ano - 10}-01-01 TO ${ano + 1}-12-31]`);
    if (desde) partes.push(`FIRST_IDATE:[${desde} TO ${ano + 1}-12-31]`);
    return partes.join(" AND ");
  }
  const docEpmc = r => ({
    pmid: r.pmid || "", titulo: semTags(r.title), revista: r.journalInfo?.journal?.title || r.journalTitle || r.journalInfo?.journal?.isoabbreviation || "",
    ano: String(r.pubYear || ""), autores: (r.authorList?.author || []).map(a => a.fullName || [a.lastName, a.initials].filter(Boolean).join(" ")).filter(Boolean),
    tipos: r.pubTypeList?.pubType || [], pmcid: r.pmcid || "", doi: r.doi || ""
  });
  async function epmcBusca(consulta, cursor = "*", sort = "relevance", tamanho = 20) {
    const u = `${EPMC}search?format=json&resultType=core&pageSize=${tamanho}&cursorMark=${encodeURIComponent(cursor)}${sort === "date" ? "&sort=P_PDATE_D%20desc" : ""}&query=${encodeURIComponent(consulta)}`;
    const j = await obter(u);
    return { total: +j.hitCount || 0, docs: (j.resultList?.result || []).filter(r => r.pmid).map(docEpmc), proximo: j.nextCursorMark };
  }
  async function epmcArtigo(pmid) {
    const j = await obter(`${EPMC}search?query=EXT_ID:${pmid}%20AND%20SRC:MED&format=json&resultType=core`);
    const r = (j.resultList?.result || [])[0]; if (!r) throw new Error("Artigo não encontrado.");
    const d = docEpmc(r);
    // resumo estruturado vem como <h4>Rótulo</h4>texto
    const html = String(r.abstractText || ""); const resumo = [];
    if (/<h4>/i.test(html)) html.split(/<h4>/i).slice(1).forEach(parte => { const [rot, ...resto] = parte.split(/<\/h4>/i); resumo.push({ rotulo: semTags(rot), texto: semTags(resto.join(" ")) }); });
    else if (html) resumo.push({ rotulo: "", texto: semTags(html) });
    return { pmid, titulo: d.titulo, revista: d.revista, ano: d.ano, autores: d.autores, resumo, tipos: d.tipos,
      mesh: (r.meshHeadingList?.meshHeading || []).map(m => m.descriptorName), palavras: r.keywordList?.keyword || [], doi: d.doi, pmcid: d.pmcid, fonte: "Europe PMC" };
  }
  async function efetchPubmed(pmid) {
    const txt = await obter(`${EUTILS}efetch.fcgi?db=pubmed&retmode=xml&id=${pmid}${TOOL}`, "text");
    const x = new DOMParser().parseFromString(txt, "text/xml");
    const t = sel => x.querySelector(sel)?.textContent?.trim() || "";
    if (!t("ArticleTitle")) throw new Error("Resposta vazia do PubMed");
    const resumo = $$("Abstract AbstractText", x).map(a => ({ rotulo: a.getAttribute("Label") || "", texto: a.textContent.trim() }));
    const ids = {}; $$("PubmedData ArticleIdList ArticleId", x).forEach(a => { ids[a.getAttribute("IdType")] = a.textContent.trim(); });
    return {
      pmid, titulo: t("ArticleTitle"), revista: t("Journal Title"), ano: t("JournalIssue PubDate Year") || t("JournalIssue PubDate MedlineDate").slice(0, 4) || t("ArticleDate Year"),
      autores: $$("AuthorList Author", x).map(a => [a.querySelector("LastName")?.textContent, a.querySelector("Initials")?.textContent].filter(Boolean).join(" ") || a.querySelector("CollectiveName")?.textContent || "").filter(Boolean),
      resumo, tipos: $$("PublicationType", x).map(p => p.textContent.trim()), mesh: $$("MeshHeading DescriptorName", x).map(m => m.textContent.trim()),
      palavras: $$("KeywordList Keyword", x).map(k => k.textContent.trim()), doi: ids.doi || "", pmcid: ids.pmc || "", fonte: "PubMed"
    };
  }
  async function efetch(pmid) {
    try { return await efetchPubmed(pmid); }
    catch (e) { return await epmcArtigo(pmid); } // PubMed fora do ar → Europe PMC
  }
  // Busca unificada: PubMed primeiro; se falhar, Europe PMC
  async function pesquisar({ q, termoPubmed, filtros, sort, inicio = 0, cursor = "*" }) {
    try {
      const r = await esearch(termoPubmed, inicio, sort); const docs = await esummary(r.ids);
      return { fonte: "PubMed", total: r.total, docs, traducao: r.traducao };
    } catch (e) {
      const consulta = consultaEpmc(q, filtros);
      const r = await epmcBusca(consulta, cursor, sort);
      return { fonte: "Europe PMC", total: r.total, docs: r.docs, traducao: consulta, proximo: r.proximo, erroPubmed: e.message };
    }
  }
  async function epmcInfo(pmid) {
    try {
      const r = await fetch(`${EPMC}search?query=EXT_ID:${pmid}%20AND%20SRC:MED&format=json&resultType=core`);
      const d = (await r.json()).resultList.result[0] || {};
      return { aberto: d.isOpenAccess === "Y", pmcid: d.pmcid || "", licenca: d.license || "", citacoes: d.citedByCount || 0 };
    } catch (e) { return { aberto: false }; }
  }
  async function textoCompleto(pmcid) {
    const r = await fetch(`${EPMC}${pmcid}/fullTextXML`);
    if (!r.ok) throw new Error("Texto completo não disponível no Europe PMC.");
    const x = new DOMParser().parseFromString(await r.text(), "text/xml");
    const body = x.querySelector("body"); if (!body) throw new Error("Texto completo sem corpo estruturado.");
    const secoes = [];
    const visitar = (el, prefixo) => {
      const titulo = el.querySelector(":scope > title")?.textContent.trim() || prefixo || "Texto";
      const paragrafos = $$(":scope > p", el).map(p => p.textContent.replace(/\s+/g, " ").trim()).filter(Boolean);
      if (paragrafos.length) secoes.push({ titulo, texto: paragrafos.join("\n\n") });
      $$(":scope > sec", el).forEach(s => visitar(s, ""));
    };
    const soltos = $$(":scope > p", body).map(p => p.textContent.replace(/\s+/g, " ").trim()).filter(Boolean);
    if (soltos.length) secoes.push({ titulo: "Texto", texto: soltos.join("\n\n") });
    $$(":scope > sec", body).forEach(s => visitar(s, ""));
    return secoes;
  }

  // ---------------------------------------------------------------- classificação do desenho e nível de evidência
  function classificar(tipos, texto) {
    const t = tipos.join(" | ").toLowerCase(), s = (texto || "").toLowerCase();
    if (/guideline/.test(t) || /clinical practice guideline|consensus statement/.test(s)) return { id: "gl", nome: "Diretriz / consenso", nivel: "Síntese (avaliar com AGREE II)", cor: "ok" };
    if (/meta-analysis/.test(t) || /meta-analys/.test(s)) return { id: "ma", nome: "Revisão sistemática com meta-análise", nivel: "1a", cor: "ok" };
    if (/systematic review/.test(t) || /systematic review/.test(s)) return { id: "sr", nome: "Revisão sistemática", nivel: "1a", cor: "ok" };
    if (/randomized controlled trial/.test(t) || /randomi[sz]ed (controlled |clinical )?trial/.test(s)) return { id: "rct", nome: "Ensaio clínico randomizado", nivel: "1b (depende da qualidade)", cor: "ok" };
    if (/clinical trial/.test(t)) return { id: "ct", nome: "Ensaio clínico (não randomizado?)", nivel: "2b", cor: "warn" };
    if (/cohort|prospective|longitudinal/.test(s) || /observational/.test(t)) return { id: "coorte", nome: "Estudo observacional / coorte", nivel: "2b", cor: "warn" };
    if (/case-control|case control/.test(s)) return { id: "cc", nome: "Caso-controle", nivel: "3", cor: "warn" };
    if (/cross-sectional/.test(s)) return { id: "transv", nome: "Transversal", nivel: "4 (intervenção) / útil para acurácia", cor: "warn" };
    if (/case reports?/.test(t) || /case report|case series/.test(s)) return { id: "caso", nome: "Relato / série de casos", nivel: "4", cor: "bad" };
    if (/review/.test(t)) return { id: "rn", nome: "Revisão narrativa", nivel: "5 (opinião estruturada)", cor: "bad" };
    return { id: "?", nome: "Desenho não identificado", nivel: "verificar", cor: "" };
  }
  const badgeDesenho = (tipos, titulo) => { const c = classificar(tipos, titulo); return `<span class="tag ${c.cor}">${esc(c.nome)}</span>`; };

  // ---------------------------------------------------------------- triagem automática da qualidade (sem IA)
  const REGRAS_PEDRO = [
    [2, "Alocação aleatória", /randomi[sz]/i],
    [3, "Alocação sigilosa", /conceal|sealed (opaque )?envelope|opaque envelope|central(ly|ized)? (randomi|allocat)|web-based randomi/i],
    [4, "Grupos semelhantes no início", /baseline (characteristics |data )?(were |was )?(similar|comparable|balanced)|no (significant )?differences? (between groups )?at baseline/i],
    [5, "Participantes cegos", /double[- ]blind|(participants|patients|subjects) (were |was )?(blind|masked)|sham|placebo/i],
    [6, "Terapeutas cegos", /triple[- ]blind|(therapist|clinician|physiotherapist)s? (were |was )?(blind|masked)/i],
    [7, "Avaliadores cegos", /(assessor|evaluator|examiner|outcome assessor)s? (were |was )?(blind|masked)|blinded (outcome )?(assessor|evaluat|assessment)|single[- ]blind|assessor[- ]blind/i],
    [8, "Seguimento > 85%", /(\b[0-9]|1[0-4])(\.\d+)? ?% (were )?(lost|drop|attrition)|follow-up rate of (8[5-9]|9\d|100)|retention (rate )?(of )?(8[5-9]|9\d)/i],
    [9, "Intenção de tratar", /intention[- ]to[- ]treat|\bITT\b/i],
    [10, "Comparação entre grupos", /between[- ]group|group (x|×|by) time|interaction|compared (with|to) (the )?(control|placebo|sham)|mean difference/i],
    [11, "Medidas de precisão e variabilidade", /95 ?% ?(CI|confidence)|confidence interval|standard deviation|\bSD\b|±/i]
  ];
  const REGRAS_RS = [
    ["Protocolo registrado (PROSPERO/OSF)", /PROSPERO|CRD\d{6,}|osf\.io|registered protocol/i],
    ["Busca em ≥ 2 bases de dados", /(MEDLINE|PubMed|EMBASE|CINAHL|PEDro|Cochrane|Web of Science|Scopus|SPORTDiscus).*(MEDLINE|PubMed|EMBASE|CINAHL|PEDro|Cochrane|Web of Science|Scopus|SPORTDiscus)/is],
    ["Avaliação do risco de viés dos estudos", /risk of bias|RoB ?2|PEDro scale|Cochrane (risk|tool)|quality assessment/i],
    ["Certeza da evidência (GRADE)", /GRADE|certainty of (the )?evidence|quality of (the )?evidence/i],
    ["Heterogeneidade avaliada", /heterogeneity|I\s?2|I²/i],
    ["Seleção/extração em duplicidade", /two (independent )?(reviewers|authors)|independently (screened|extracted|assessed)|in duplicate/i]
  ];
  function triagem(art, texto) {
    const c = classificar(art.tipos, art.titulo + " " + texto);
    const achar = re => { const m = texto.match(re); if (!m) return null; const i = Math.max(0, m.index - 70); return "…" + texto.slice(i, m.index + m[0].length + 70).replace(/\s+/g, " ") + "…"; };
    const itens = (c.id === "sr" || c.id === "ma" ? REGRAS_RS.map(([n, re]) => [n, re]) : REGRAS_PEDRO.map(([, n, re]) => [n, re]))
      .map(([nome, re]) => ({ nome, trecho: achar(re) }));
    const nMatch = texto.match(/(?:n ?= ?|total of |included |enrolled |recruited |randomi[sz]ed )(\d{2,6})(?: (?:participants|patients|subjects|individuals|adults|people|athletes|runners|women|men|studies|trials|RCTs))?/i);
    const reg = texto.match(/NCT\d{8}|ACTRN\d{14}|ISRCTN\d{8}|CRD\d{6,}|RBR-\w{6,}|DRKS\d{8}/);
    const seguimento = [...new Set((texto.match(/\b\d{1,3}[- ](?:week|month|year)s?\b/gi) || []).map(s => s.toLowerCase()))].slice(0, 6);
    const alertas = [];
    if (/pilot|feasibility/i.test(art.titulo + texto)) alertas.push("Estudo piloto/de viabilidade: não foi desenhado para testar eficácia.");
    if (nMatch && +nMatch[1] < 40 && !/studies|trials|RCTs/i.test(nMatch[0])) alertas.push(`Amostra pequena (n ≈ ${nMatch[1]}): resultados imprecisos e risco de superestimar efeitos.`);
    if (c.id === "rct" && !reg) alertas.push("Registro do ensaio não encontrado no texto disponível: risco de relato seletivo de desfechos.");
    if (art.ano && +art.ano < new Date().getFullYear() - 10) alertas.push("Publicado há mais de 10 anos: procure revisões/diretrizes mais recentes.");
    if (c.id === "rn") alertas.push("Revisão narrativa: sem método sistemático — útil para contexto, não para decidir conduta.");
    if (!/95 ?% ?(CI|confidence)|confidence interval/i.test(texto)) alertas.push("Intervalo de confiança não encontrado: difícil julgar a precisão e a relevância clínica.");
    return { desenho: c, itens, n: nMatch ? nMatch[1] : "", registro: reg ? reg[0] : "", seguimento, alertas };
  }

  // Extração simples a partir do resumo estruturado
  function extracaoSimples(art) {
    const mapa = { objetivo: /background|objective|purpose|aim|introduction|context|question/i, metodos: /method|design|setting|participant|intervention|patient|data source|study selection|eligib/i, resultados: /result|finding|main outcome/i, conclusao: /conclusion|interpretation|implication|significance|clinical relevance/i };
    const out = { objetivo: [], metodos: [], resultados: [], conclusao: [] };
    if (art.resumo.length > 1 && art.resumo.some(r => r.rotulo)) {
      art.resumo.forEach(r => { const k = Object.keys(mapa).find(k => mapa[k].test(r.rotulo)) || "metodos"; out[k].push(r.texto); });
    } else {
      const frases = art.resumo.map(r => r.texto).join(" ").split(/(?<=\.)\s+(?=[A-Z])/);
      const n = frases.length;
      out.objetivo = frases.slice(0, Math.min(2, n)); out.conclusao = frases.slice(-2); out.resultados = frases.slice(2, -2).filter(f => /\d/.test(f)); out.metodos = frases.slice(2, -2).filter(f => !/\d/.test(f));
    }
    const todo = art.resumo.map(r => r.texto).join(" ");
    const numeros = todo.split(/(?<=\.)\s+/).filter(f => /95 ?% ?CI|confidence interval|p ?[<=>] ?0[.,]\d|SMD|mean difference|odds ratio|risk ratio|\bMD\b/i.test(f));
    return { ...out, numeros };
  }

  // ---------------------------------------------------------------- schemas para a IA
  const S = (props) => ({ type: "object", properties: props, required: Object.keys(props), additionalProperties: false });
  const str = { type: "string" }, arrStr = { type: "array", items: { type: "string" } };
  const SCHEMA_EXTRACAO = S({
    titulo_pt: str, pergunta_pico: str, desenho: str, populacao: str, n_participantes: str,
    intervencao: str, dose_fitt: str, comparador: str, desfechos: arrStr, seguimento: str,
    resultados: { type: "array", items: S({ desfecho: str, momento: str, resultado: str, ic_95: str, clinicamente_importante: { type: "string", enum: ["sim", "não", "incerto"] } }) },
    conclusao_autores: str, mensagem_para_pratica: str, o_que_importa: arrStr, o_que_nao_importa: arrStr, cuidado_ao_interpretar: arrStr,
    termos_tecnicos: { type: "array", items: S({ termo_en: str, traducao: str, explicacao: str }) }
  });
  const SCHEMA_AVALIACAO = S({
    desenho: str, nivel_evidencia: str, base_da_analise: { type: "string", enum: ["resumo", "texto completo"] }, ferramenta_usada: str,
    itens: { type: "array", items: S({ criterio: str, julgamento: { type: "string", enum: ["sim", "não", "incerto"] }, justificativa: str }) },
    risco_de_vies_global: { type: "string", enum: ["baixo", "algumas preocupações", "alto"] },
    certeza_grade_estimada: { type: "string", enum: ["alta", "moderada", "baixa", "muito baixa", "não se aplica"] },
    pontos_fortes: arrStr, limitacoes: arrStr, relevancia_clinica: str, aplicabilidade: str, veredito: str
  });

  function textoParaIA(art, completo) {
    const resumo = art.resumo.map(r => (r.rotulo ? r.rotulo + ": " : "") + r.texto).join("\n");
    const corpo = completo ? "\n\nTEXTO COMPLETO (acesso aberto):\n" + completo.map(s => "## " + s.titulo + "\n" + s.texto).join("\n\n") : "";
    return `<artigo>\nTÍTULO: ${art.titulo}\nREVISTA: ${art.revista} (${art.ano})\nTIPO DE PUBLICAÇÃO: ${art.tipos.join(", ")}\nRESUMO:\n${resumo}${corpo}\n</artigo>`;
  }

  // ---------------------------------------------------------------- telas
  function viewArtigos() {
    app.innerHTML = `<h1>📰 Artigos científicos</h1>
      <p class="muted">Busque no PubMed, avalie a qualidade, traduza e extraia o que importa para a prática. ${window.IA.temIA() ? `<span class="tag ok">IA ativa</span>` : `<a class="tag warn" href="#/ia">IA desativada — configurar</a>`}</p>
      ${tabs("tabArt", [["busca", "Buscar no PubMed"], ["bib", `Biblioteca (${Object.keys(bib()).length})`]], "busca", (k, el) => k === "busca" ? viewBusca(el) : viewBib(el))}`;
  }

  function viewBusca(el) {
    const st = store.get("art_busca", { q: "", filtros: ["sr", "y10"], sort: "relevance" });
    el.innerHTML = `<div class="card" id="pmForm">
        <label>Termos de busca (em inglês funciona melhor)</label>
        <div class="row" style="flex-wrap:nowrap"><input type="search" id="pmQ" value="${esc(st.q)}" placeholder="ex.: patellofemoral pain exercise therapy"><button class="btn" id="pmBuscar">Buscar</button></div>
        <div class="row" style="margin-top:6px">${FILTROS.map(([k, l]) => `<label class="check"><input type="checkbox" data-pf="${k}" ${st.filtros.includes(k) ? "checked" : ""}> ${l}</label>`).join("")}
          <select id="pmSort" style="max-width:200px"><option value="relevance">Mais relevantes</option><option value="date" ${st.sort === "date" ? "selected" : ""}>Mais recentes</option></select></div>
        <details><summary>Ajuda: pergunta clínica em português → busca em inglês</summary>
          <label>Escreva a pergunta clínica</label><textarea id="pmPergunta" placeholder="ex.: Exercícios de quadril reduzem a dor em mulheres com dor femoropatelar?"></textarea>
          <div class="row"><button class="btn sec peq" id="pmTraduzQ">${window.IA.temIA() ? "Gerar busca com IA" : "Sugerir termos (glossário)"}</button></div><div id="pmQOut"></div></details>
      </div><div id="pmRes"></div>`;
    const termo = () => {
      const q = $("#pmQ").value.trim(); const f = $$("[data-pf]", el).filter(x => x.checked).map(x => x.dataset.pf);
      store.set("art_busca", { q, filtros: f, sort: $("#pmSort").value });
      const fs = FILTROS.filter(x => f.includes(x[0])); const tipos = fs.filter(x => ["sr", "ma", "rct", "gl"].includes(x[0])).map(x => x[2]); const outros = fs.filter(x => !["sr", "ma", "rct", "gl"].includes(x[0])).map(x => x[2]);
      return [q && `(${q})`, tipos.length && `(${tipos.join(" OR ")})`, ...outros].filter(Boolean).join(" AND ");
    };
    let cursores = ["*"]; // paginação do Europe PMC (por cursor)
    const pareceIngles = q => !/[ãõçáéíóúâêô]|\b(dor|de|do|da|em|com|para|tratamento|exercicio|exercício|joelho|ombro|coluna|lombar|quadril|tornozelo)\b/i.test(q);
    const buscar = async (inicio = 0, pagina = 0) => {
      const t = termo(); const q = $("#pmQ").value.trim(); if (!q) { $("#pmRes").innerHTML = `<p class="muted">Digite os termos de busca.</p>`; return; }
      const filtros = $$("[data-pf]", el).filter(x => x.checked).map(x => x.dataset.pf);
      if (pagina === 0) cursores = ["*"];
      $("#pmRes").innerHTML = `<div class="info">Buscando…</div>`;
      try {
        const r = await pesquisar({ q, termoPubmed: t, filtros, sort: $("#pmSort").value, inicio, cursor: cursores[pagina] || "*" });
        if (r.proximo) cursores[pagina + 1] = r.proximo;
        const ini = r.fonte === "PubMed" ? inicio : pagina * 20;
        const salvos = bib();
        const temMais = ini + 20 < r.total;
        $("#pmRes").innerHTML = `${r.fonte !== "PubMed" ? `<div class="aviso">O PubMed está instável ou fora do ar neste momento, então os resultados vêm do <b>Europe PMC</b>, que reúne os mesmos artigos do PubMed (MEDLINE).</div>` : ""}
          <p class="muted">${r.total.toLocaleString("pt-BR")} resultados${r.docs.length ? ` · mostrando ${ini + 1}–${ini + r.docs.length}` : ""} · fonte: ${r.fonte}</p>
          ${!r.total ? `<div class="aviso">Nenhum artigo encontrado.${pareceIngles(q) ? " Tente desmarcar alguns filtros (ex.: tipo de estudo ou período)." : " As bases de artigos funcionam em <b>inglês</b>: tente, por exemplo, <i>low back pain pilates</i> em vez de <i>dor lombar pilates</i>, ou use a ajuda abaixo da busca."}</div>` : ""}
          ${r.docs.map(d => `<div class="card"><div class="row" style="justify-content:space-between"><span>${badgeDesenho(d.tipos, d.titulo)}${d.pmcid ? `<span class="tag ok">PMC (texto disponível)</span>` : ""}${salvos[d.pmid] ? `<span class="tag">★ na biblioteca</span>` : ""}</span><small class="muted">PMID ${d.pmid}</small></div>
            <h3 style="margin:.4rem 0"><a href="#/artigo/${d.pmid}">${esc(d.titulo)}</a></h3>
            <small class="muted">${esc(d.autores.slice(0, 3).join(", "))}${d.autores.length > 3 ? " et al." : ""} · <i>${esc(d.revista)}</i> · ${esc(d.ano)}</small></div>`).join("")}
          <div class="row">${ini > 0 ? `<button class="btn sec" data-pag="${inicio - 20}" data-pg="${pagina - 1}">← Anteriores</button>` : ""}${temMais ? `<button class="btn sec" data-pag="${inicio + 20}" data-pg="${pagina + 1}">Próximos →</button>` : ""}</div>
          <details><summary>Consulta enviada</summary><code style="font-size:.8rem">${esc(r.traducao || t)}</code></details>`;
      } catch (e) {
        $("#pmRes").innerHTML = `<div class="alerta"><b>Não foi possível buscar agora.</b> O PubMed e o Europe PMC não responderam (${esc(e.message)}). Verifique a internet e tente de novo em alguns minutos.</div><button class="btn sec" id="pmTentar">Tentar de novo</button>`;
        $("#pmTentar").addEventListener("click", () => buscar(inicio, pagina));
      }
    };
    $("#pmBuscar").addEventListener("click", () => buscar(0));
    $("#pmQ").addEventListener("keydown", e => { if (e.key === "Enter") buscar(0); });
    $("#pmRes").addEventListener("click", e => { const b = e.target.closest("[data-pag]"); if (b) { buscar(+b.dataset.pag, +b.dataset.pg); window.scrollTo(0, 0); } });
    $("#pmTraduzQ").addEventListener("click", async () => {
      const p = $("#pmPergunta").value.trim(); if (!p) return;
      if (!window.IA.temIA()) {
        const n = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
        const achados = GLOSSARIO.filter(g => g[0].split(/ \/ |\//).some(t => n(p).includes(n(t.trim()))));
        $("#pmQOut").innerHTML = achados.length ? `<div class="info">Termos sugeridos: ${achados.map(g => `<button class="tag" data-termo="${esc(g[1].split(" / ")[0])}">${esc(g[1])}</button>`).join(" ")}<br><small>Clique para adicionar à busca.</small></div>` : `<div class="aviso">Nenhum termo do glossário encontrado. Configure a IA para converter perguntas livres.</div>`;
        return;
      }
      $("#pmQOut").innerHTML = `<div class="info">Gerando estratégia de busca…</div>`;
      try {
        const r = await window.IA.chamar({ effort: "low", maxTokens: 4000, schema: S({ pico: str, busca_pubmed: str, explicacao: str }),
          prompt: `Converta a pergunta clínica abaixo em uma estratégia de busca para o PubMed em inglês, usando termos MeSH e sinônimos com OR dentro de cada conceito e AND entre conceitos de PICO (normalmente P e I). Não inclua filtros de tipo de estudo nem de data. Pergunta: "${p}"` });
        $("#pmQOut").innerHTML = `<div class="info"><b>PICO:</b> ${esc(r.pico)}<br><b>Busca:</b> <code>${esc(r.busca_pubmed)}</code><br><small>${esc(r.explicacao)}</small><br><button class="btn peq" id="pmUsar">Usar esta busca</button></div>`;
        $("#pmUsar").addEventListener("click", () => { $("#pmQ").value = r.busca_pubmed; buscar(0); });
      } catch (e) { $("#pmQOut").innerHTML = `<div class="alerta">${esc(e.message)}</div>`; }
    });
    $("#pmQOut").addEventListener("click", e => { const b = e.target.closest("[data-termo]"); if (b) $("#pmQ").value = ($("#pmQ").value + " " + b.dataset.termo).trim(); });
    if (st.q) buscar(0);
  }

  function viewBib(el) {
    const b = bib(); const itens = Object.values(b).sort((x, y) => (y.salvo || "").localeCompare(x.salvo || ""));
    el.innerHTML = itens.length ? `<div class="row"><button class="btn sec peq" id="bibExp">Exportar biblioteca (.json)</button><button class="btn sec peq" id="bibMd">Exportar resumos (.md)</button></div>
      ${itens.map(a => `<div class="card"><div class="row" style="justify-content:space-between"><span>${badgeDesenho(a.tipos || [], a.titulo)}${a.ext ? `<span class="tag ok">extraído</span>` : ""}${a.aval ? `<span class="tag ok">avaliado</span>` : ""}</span>
        <span class="row"><a class="btn peq" href="#/artigo/${a.pmid}">Abrir</a><a class="btn peq sec" href="#/instagram/${a.pmid}">📸 Post</a><a class="btn peq sec" href="#/reels/${a.pmid}">🎬 Reels</a><button class="btn peq perigo" data-rm="${a.pmid}">Remover</button></span></div>
        <h3 style="margin:.4rem 0">${esc(a.ext?.titulo_pt || a.titulo)}</h3><small class="muted">${esc(a.revista)} · ${esc(a.ano)} · PMID ${a.pmid}</small>
        ${a.ext?.mensagem_para_pratica ? `<p><b>Na prática:</b> ${esc(a.ext.mensagem_para_pratica)}</p>` : ""}${a.notas ? `<p class="muted">📝 ${esc(a.notas)}</p>` : ""}</div>`).join("")}`
      : `<p class="muted">Nenhum artigo salvo. Busque no PubMed e clique em "★ Salvar na biblioteca".</p>`;
    el.addEventListener("click", e => {
      const r = e.target.closest("[data-rm]"); if (r && confirm("Remover da biblioteca?")) { const x = bib(); delete x[r.dataset.rm]; salvarBib(x); viewBib(el); }
    });
    $("#bibExp", el)?.addEventListener("click", () => baixar("biblioteca-fisio.json", JSON.stringify(bib(), null, 2), "application/json"));
    $("#bibMd", el)?.addEventListener("click", () => baixar("biblioteca-fisio.md", Object.values(bib()).map(markdownArtigo).join("\n\n---\n\n"), "text/markdown"));
  }

  function markdownArtigo(a) {
    const e = a.ext;
    return `## ${a.titulo}\n${a.autores?.slice(0, 3).join(", ") || ""} — *${a.revista}* (${a.ano}). PMID ${a.pmid}${a.doi ? " · doi:" + a.doi : ""}\n` +
      (e ? `\n**Título (PT):** ${e.titulo_pt}\n\n**PICO:** ${e.pergunta_pico}\n\n**Desenho:** ${e.desenho} · **n:** ${e.n_participantes}\n\n**Intervenção:** ${e.intervencao} (${e.dose_fitt})\n\n**Resultados:**\n${e.resultados.map(r => `- ${r.desfecho} (${r.momento}): ${r.resultado} ${r.ic_95} — clinicamente importante: ${r.clinicamente_importante}`).join("\n")}\n\n**Na prática:** ${e.mensagem_para_pratica}\n\n**O que importa:**\n${e.o_que_importa.map(x => "- " + x).join("\n")}\n` : "") +
      (a.aval ? `\n**Avaliação:** risco de viés ${a.aval.risco_de_vies_global}; certeza ${a.aval.certeza_grade_estimada}. ${a.aval.veredito}\n` : "") + (a.notas ? `\n**Notas:** ${a.notas}\n` : "");
  }
  function baixar(nome, conteudo, tipo) { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([conteudo], { type: tipo })); a.download = nome; a.click(); }

  // ---------------------------------------------------------------- página do artigo
  async function viewArtigo(pmid) {
    if (!/^\d+$/.test(pmid || "")) { app.innerHTML = `<p>PMID inválido. <a href="#/artigos">Voltar</a></p>`; return; }
    app.innerHTML = `<p><a href="#/artigos">← Artigos</a></p><div class="info">Carregando artigo do PubMed…</div>`;
    let art;
    try { art = cacheGet(pmid, "meta") || await efetch(pmid); cacheSet(pmid, "meta", art); }
    catch (e) { app.innerHTML = `<p><a href="#/artigos">← Artigos</a></p><div class="alerta">${esc(e.message)}</div>`; return; }
    const oa = await epmcInfo(pmid); art.pmcid = art.pmcid || oa.pmcid;
    const desenho = classificar(art.tipos, art.titulo + " " + art.resumo.map(r => r.texto).join(" "));
    const naBib = () => !!bib()[pmid];
    app.innerHTML = `<p><a href="#/artigos">← Artigos</a></p>
      <div class="row"><span class="tag ${desenho.cor}">${esc(desenho.nome)}</span><span class="tag">Nível: ${esc(desenho.nivel)}</span>${oa.aberto ? `<span class="tag ok">Acesso aberto ${oa.licenca ? "· " + esc(oa.licenca.toUpperCase()) : ""}</span>` : `<span class="tag">Sem acesso aberto ao texto completo</span>`}${oa.citacoes ? `<span class="tag">Citado ${oa.citacoes}×</span>` : ""}</div>
      <h1 style="margin-top:8px">${esc(art.titulo)}</h1>
      <p class="muted">${esc(art.autores.slice(0, 6).join(", "))}${art.autores.length > 6 ? " et al." : ""} · <i>${esc(art.revista)}</i> · ${esc(art.ano)} · PMID ${pmid}</p>
      <div class="row no-print"><button class="btn" id="artSalvar">${naBib() ? "★ Na biblioteca" : "☆ Salvar na biblioteca"}</button>
        <a class="btn sec" target="_blank" rel="noopener" href="https://pubmed.ncbi.nlm.nih.gov/${pmid}/">PubMed ↗</a>
        ${art.doi ? `<a class="btn sec" target="_blank" rel="noopener" href="https://doi.org/${esc(art.doi)}">DOI ↗</a>` : ""}
        ${art.pmcid ? `<a class="btn sec" target="_blank" rel="noopener" href="https://pmc.ncbi.nlm.nih.gov/articles/${esc(art.pmcid)}/">PMC ↗</a>` : ""}
        <a class="btn sec" href="#/instagram/${pmid}">📸 Criar post</a><a class="btn sec" href="#/reels/${pmid}">🎬 Criar Reels</a></div>
      ${tabs("tabArtigo", [["resumo", "Resumo + tradução"], ["completo", "Texto completo"], ["avaliar", "Avaliar qualidade"], ["extrair", "Extrair o que importa"], ["notas", "Notas"]], "resumo", (k, el) => {
        ({ resumo: tabResumo, completo: tabCompleto, avaliar: tabAvaliar, extrair: tabExtrair, notas: tabNotas })[k](el, art, oa);
      }, true)}`;
    $("#artSalvar").addEventListener("click", () => {
      const b = bib(); if (b[pmid]) { delete b[pmid]; } else { b[pmid] = { pmid, titulo: art.titulo, revista: art.revista, ano: art.ano, autores: art.autores, tipos: art.tipos, doi: art.doi, salvo: new Date().toISOString(), ext: cacheGet(pmid, "ext"), aval: cacheGet(pmid, "aval") }; }
      salvarBib(b); $("#artSalvar").textContent = naBib() ? "★ Na biblioteca" : "☆ Salvar na biblioteca";
    });
  }
  // atualiza o registro da biblioteca, se o artigo estiver salvo
  function atualizaBib(pmid, campo, valor) { const b = bib(); if (b[pmid]) { b[pmid][campo] = valor; salvarBib(b); } }

  const iaAviso = () => window.IA.temIA() ? "" : `<div class="aviso">A IA não está configurada — usando recursos automáticos básicos. <a href="#/ia">Configurar IA</a> para tradução completa e análise aprofundada.</div>`;

  function tabResumo(el, art) {
    const tr = cacheGet(art.pmid, "trResumo");
    const original = art.resumo.length ? art.resumo.map(r => `<p>${r.rotulo ? `<b>${esc(r.rotulo)}:</b> ` : ""}${esc(r.texto)}</p>`).join("") : `<p class="muted">Este registro não tem resumo no PubMed.</p>`;
    const textoResumo = art.resumo.map(r => (r.rotulo ? r.rotulo + ": " : "") + r.texto).join("\n\n");
    el.innerHTML = `${iaAviso()}<div class="grid-2"><div class="card"><h3>Original (inglês)</h3>${original}
        ${art.mesh.length ? `<p><small class="muted">MeSH: ${esc(art.mesh.slice(0, 12).join("; "))}</small></p>` : ""}</div>
      <div class="card"><h3>Tradução (português)</h3><div id="trBox">${tr ? tr.split(/\n\n+/).map(p => `<p>${esc(p)}</p>`).join("") : `<p class="muted">Ainda não traduzido.</p>`}</div>
        <div class="row no-print">${window.IA.temIA() ? `<button class="btn" id="trIA">${tr ? "Traduzir novamente" : "Traduzir com IA"}</button>` : ""}
        ${textoResumo ? `<a class="btn sec" target="_blank" rel="noopener" href="https://translate.google.com/?sl=en&tl=pt&op=translate&text=${encodeURIComponent(textoResumo.slice(0, 4800))}">Google Tradutor ↗</a>` : ""}</div></div></div>`;
    $("#trIA", el)?.addEventListener("click", async () => {
      const box = $("#trBox", el); box.innerHTML = ""; let acc = "";
      try {
        const t = await window.IA.chamar({ prompt: `Traduza integralmente para o português do Brasil o resumo científico abaixo. Mantenha os rótulos das seções traduzidos, todos os números, unidades, siglas estatísticas (IC 95%, DMP, SMD, RR) e termos técnicos corretos em fisioterapia. Não resuma nem comente. Responda apenas com a tradução, separando seções por linha em branco.\n\n<artigo>\n${textoResumo}\n</artigo>`, onText: s => { acc += s; box.textContent = acc; } });
        cacheSet(art.pmid, "trResumo", t); box.innerHTML = t.split(/\n\n+/).map(p => `<p>${esc(p)}</p>`).join("");
      } catch (e) { box.innerHTML = `<div class="alerta">${esc(e.message)}</div>`; }
    });
  }

  async function tabCompleto(el, art, oa) {
    if (!oa.aberto || !art.pmcid) {
      el.innerHTML = `<div class="aviso"><b>Texto completo indisponível para tradução.</b> Este artigo não está em acesso aberto no Europe PMC. Por respeito aos direitos autorais, a tradução completa é feita apenas em artigos de acesso aberto (licenças Creative Commons). Você ainda pode traduzir o resumo, avaliar e extrair a partir dele, ou acessar o artigo pela editora/biblioteca da sua instituição.</div>
        <div class="row">${art.doi ? `<a class="btn sec" target="_blank" rel="noopener" href="https://doi.org/${esc(art.doi)}">Página da editora ↗</a>` : ""}<a class="btn sec" target="_blank" rel="noopener" href="https://scholar.google.com/scholar?q=${encodeURIComponent(art.titulo)}">Procurar versão gratuita (Google Scholar) ↗</a></div>`;
      return;
    }
    el.innerHTML = `<div class="info">Carregando texto completo do Europe PMC…</div>`;
    let secoes;
    try { secoes = cacheGet(art.pmid, "full") || await textoCompleto(art.pmcid); cacheSet(art.pmid, "full", secoes); }
    catch (e) { el.innerHTML = `<div class="alerta">${esc(e.message)}</div>`; return; }
    const trs = cacheGet(art.pmid, "trFull") || {};
    const total = secoes.reduce((s, x) => s + x.texto.length, 0);
    el.innerHTML = `${iaAviso()}<div class="sucesso">Artigo em acesso aberto${oa.licenca ? ` (licença ${esc(oa.licenca.toUpperCase())})` : ""}. ${secoes.length} seções · ~${Math.round(total / 1000)} mil caracteres. Cite sempre a fonte original ao reutilizar.</div>
      <div class="row no-print">${window.IA.temIA() ? `<button class="btn" id="trTudo">Traduzir todas as seções</button>` : ""}<label class="check"><input type="checkbox" id="mostraOrig" checked> Mostrar original ao lado</label>
        <button class="btn sec peq" id="baixaTr">Baixar tradução (.md)</button></div><div id="trProg"></div>
      <div id="secs">${secoes.map((s, i) => `<details ${i < 2 ? "open" : ""} data-i="${i}"><summary>${esc(s.titulo)}</summary><div class="grid-2 sec-grid">
        <div class="orig">${s.texto.split("\n\n").map(p => `<p>${esc(p)}</p>`).join("")}</div>
        <div class="trad">${trs[i] ? trs[i].split(/\n\n+/).map(p => `<p>${esc(p)}</p>`).join("") : `<p class="muted">Não traduzida.</p>`}${window.IA.temIA() ? `<button class="btn peq sec no-print" data-tr="${i}">${trs[i] ? "Retraduzir" : "Traduzir esta seção"}</button>` : ""}</div></div></details>`).join("")}</div>`;
    const traduzir = async i => {
      const alvo = $(`details[data-i="${i}"] .trad`, el); alvo.innerHTML = ""; let acc = "";
      const t = await window.IA.chamar({ maxTokens: 32000, prompt: `Traduza integralmente para o português do Brasil a seção "${secoes[i].titulo}" de um artigo científico de acesso aberto. Preserve todos os números, estatísticas, referências entre colchetes e termos técnicos de fisioterapia. Não resuma, não omita frases e não acrescente comentários. Responda apenas com a tradução, mantendo a divisão em parágrafos com linha em branco.\n\n<artigo>\n${secoes[i].texto}\n</artigo>`, onText: s => { acc += s; alvo.textContent = acc; } });
      trs[i] = t; if (!cacheSet(art.pmid, "trFull", trs)) $("#trProg", el).innerHTML = `<div class="aviso">Armazenamento do navegador cheio: a tradução não ficará salva. Baixe o .md.</div>`;
      alvo.innerHTML = t.split(/\n\n+/).map(p => `<p>${esc(p)}</p>`).join("");
    };
    el.addEventListener("click", async e => {
      const b = e.target.closest("[data-tr]"); if (!b) return;
      b.disabled = true; try { await traduzir(+b.dataset.tr); } catch (err) { b.insertAdjacentHTML("afterend", `<div class="alerta">${esc(err.message)}</div>`); }
    });
    $("#trTudo", el)?.addEventListener("click", async () => {
      const bt = $("#trTudo", el); bt.disabled = true;
      for (let i = 0; i < secoes.length; i++) {
        if (trs[i]) continue;
        $("#trProg", el).innerHTML = `<div class="info">Traduzindo seção ${i + 1} de ${secoes.length}: ${esc(secoes[i].titulo)}…</div>`;
        $(`details[data-i="${i}"]`, el).open = true;
        try { await traduzir(i); } catch (err) { $("#trProg", el).innerHTML = `<div class="alerta">${esc(err.message)}</div>`; bt.disabled = false; return; }
      }
      $("#trProg", el).innerHTML = `<div class="sucesso">Tradução concluída.</div>`; bt.disabled = false;
    });
    $("#mostraOrig", el).addEventListener("change", e => $$(".orig", el).forEach(o => { o.style.display = e.target.checked ? "" : "none"; }));
    $("#baixaTr", el).addEventListener("click", () => baixar(`traducao-${art.pmid}.md`, `# ${art.titulo}\n\n${art.revista} (${art.ano}). PMID ${art.pmid}. Licença: ${oa.licenca || "ver original"}. Tradução não oficial gerada por IA para estudo.\n\n` + secoes.map((s, i) => `## ${s.titulo}\n\n${trs[i] || "(não traduzida)"}`).join("\n\n"), "text/markdown"));
  }

  function tabAvaliar(el, art) {
    const full = cacheGet(art.pmid, "full");
    const texto = art.resumo.map(r => r.texto).join(" ") + " " + (full ? full.map(s => s.texto).join(" ") : "");
    const tri = triagem(art, texto); const salvo = cacheGet(art.pmid, "aval"); const marc = cacheGet(art.pmid, "avalManual") || {};
    const ehRS = tri.desenho.id === "sr" || tri.desenho.id === "ma";
    el.innerHTML = `${iaAviso()}<div class="grid-2"><div class="card"><h3>Triagem automática</h3>
        <p><b>Desenho:</b> ${esc(tri.desenho.nome)} · <b>Nível:</b> ${esc(tri.desenho.nivel)}</p>
        <p><b>Amostra:</b> ${esc(tri.n || "não identificada")} · <b>Registro:</b> ${esc(tri.registro || "não encontrado")} · <b>Tempos citados:</b> ${esc(tri.seguimento.join(", ") || "—")}</p>
        <p class="muted">Analisado: ${full ? "texto completo" : "apenas o resumo (abra a aba Texto completo, se disponível, e volte aqui)"}.</p>
        ${tri.alertas.map(a => `<div class="aviso">${esc(a)}</div>`).join("")}</div>
      <div class="card" id="chk"><h3>${ehRS ? "Checklist de revisão sistemática (base AMSTAR-2)" : "Critérios da escala PEDro"}</h3>
        <p class="muted">O sistema marca o que encontrou no texto. Confira e ajuste manualmente.</p>
        ${tri.itens.map((it, i) => `<label class="check"><input type="checkbox" data-av="${i}" ${(marc[i] ?? !!it.trecho) ? "checked" : ""}> <span><b>${esc(it.nome)}</b>${it.trecho ? `<br><small class="muted">${esc(it.trecho)}</small>` : `<br><small class="muted">não encontrado no texto</small>`}</span></label>`).join("")}
        <div id="avScore"></div></div></div>
      <div class="card"><h3>Avaliação crítica aprofundada (IA)</h3><div id="avIA">${salvo ? htmlAval(salvo) : `<p class="muted">Gera julgamento item a item (PEDro / RoB 2 / AMSTAR-2 conforme o desenho), risco de viés, certeza estimada (GRADE), forças, limitações e aplicabilidade clínica.</p>`}</div>
        ${window.IA.temIA() ? `<button class="btn no-print" id="avBtn">${salvo ? "Avaliar novamente" : "Avaliar com IA"}</button>` : ""}</div>`;
    const score = () => {
      const n = $$("[data-av]", el).filter(x => x.checked).length, tot = tri.itens.length;
      $$("[data-av]", el).forEach(x => { marc[x.dataset.av] = x.checked; }); cacheSet(art.pmid, "avalManual", marc);
      const cls = ehRS ? (n >= 5 ? "sucesso" : n >= 3 ? "aviso" : "alerta") : (n >= 6 ? "sucesso" : n >= 4 ? "aviso" : "alerta");
      $("#avScore", el).innerHTML = `<div class="${cls}"><b>${n}/${tot}</b> ${ehRS ? "critérios atendidos" : "pontos PEDro (itens 2–11)"} — ${ehRS ? (n >= 5 ? "boa confiança metodológica" : n >= 3 ? "confiança moderada" : "baixa confiança") : (n >= 6 ? "alta qualidade (≥ 6)" : n >= 4 ? "qualidade regular" : "baixa qualidade")}. <small>Triagem automática — confirme lendo o artigo.</small></div>`;
    };
    $("#chk", el).addEventListener("change", score); score();
    $("#avBtn", el)?.addEventListener("click", async () => {
      $("#avIA", el).innerHTML = `<div class="info">Analisando o artigo… (pode levar até 1–2 minutos)</div>`;
      try {
        const r = await window.IA.chamar({ effort: "high", schema: SCHEMA_AVALIACAO, prompt: `Faça a avaliação crítica do artigo abaixo para um fisioterapeuta. Escolha a ferramenta adequada ao desenho: escala PEDro (itens 2 a 11) para ensaios clínicos, AMSTAR-2 (itens principais) para revisões sistemáticas, AGREE II (domínios) para diretrizes, ou checklist apropriado (ex.: Newcastle-Ottawa, QUADAS-2) para outros desenhos. Para cada item, dê o julgamento e uma justificativa curta baseada no texto. Estime o risco de viés global e a certeza da evidência (GRADE) para o desfecho principal. Em "relevancia_clinica", compare os efeitos com a mínima diferença clinicamente importante quando possível. Em "veredito", diga em 2-3 frases se e como isso deve mudar a prática.\n\n${textoParaIA(art, full)}` });
        cacheSet(art.pmid, "aval", r); atualizaBib(art.pmid, "aval", r); $("#avIA", el).innerHTML = htmlAval(r);
      } catch (e) { $("#avIA", el).innerHTML = `<div class="alerta">${esc(e.message)}</div>`; }
    });
  }
  function htmlAval(r) {
    const cor = { sim: "ok", "não": "bad", incerto: "warn" };
    return `<p><span class="tag">${esc(r.desenho)}</span><span class="tag">Nível ${esc(r.nivel_evidencia)}</span><span class="tag">${esc(r.ferramenta_usada)}</span><span class="tag">Base: ${esc(r.base_da_analise)}</span></p>
      <div class="row"><span class="tag ${r.risco_de_vies_global === "baixo" ? "ok" : r.risco_de_vies_global === "alto" ? "bad" : "warn"}">Risco de viés: ${esc(r.risco_de_vies_global)}</span><span class="tag">Certeza (GRADE): ${esc(r.certeza_grade_estimada)}</span></div>
      <div class="tabela-wrap" style="margin-top:8px"><table><tr><th>Critério</th><th>Julgamento</th><th>Justificativa</th></tr>${r.itens.map(i => `<tr><td>${esc(i.criterio)}</td><td><span class="tag ${cor[i.julgamento] || ""}">${esc(i.julgamento)}</span></td><td>${esc(i.justificativa)}</td></tr>`).join("")}</table></div>
      <div class="grid-2"><div><h3>Pontos fortes</h3>${lista(r.pontos_fortes)}</div><div><h3>Limitações</h3>${lista(r.limitacoes)}</div></div>
      <p><b>Relevância clínica:</b> ${esc(r.relevancia_clinica)}</p><p><b>Aplicabilidade:</b> ${esc(r.aplicabilidade)}</p><div class="info"><b>Veredito:</b> ${esc(r.veredito)}</div>
      <p><small class="muted">Avaliação gerada por IA como apoio — confirme lendo o artigo.</small></p>`;
  }

  function tabExtrair(el, art) {
    const full = cacheGet(art.pmid, "full"); const salvo = cacheGet(art.pmid, "ext"); const simples = extracaoSimples(art);
    el.innerHTML = `${iaAviso()}<div class="card"><h3>Extração rápida (a partir do resumo)</h3><table>
        <tr><th>Objetivo</th><td>${esc(simples.objetivo.join(" ") || "—")}</td></tr><tr><th>Métodos</th><td>${esc(simples.metodos.join(" ") || "—")}</td></tr>
        <tr><th>Resultados</th><td>${esc(simples.resultados.join(" ") || "—")}</td></tr><tr><th>Conclusão dos autores</th><td>${esc(simples.conclusao.join(" ") || "—")}</td></tr></table>
        ${simples.numeros.length ? `<h3>Frases com estatísticas</h3>${lista(simples.numeros)}` : ""}
        <p class="muted">Dica: compare as diferenças entre grupos com o MCID em <a href="#/evidencias">Evidências → Interpretar resultados</a>.</p></div>
      <div class="card"><h3>Extração estruturada (IA): PICO, dose, resultados, o que importa</h3><div id="extIA">${salvo ? htmlExt(salvo) : `<p class="muted">Extrai PICO, dose (FITT), resultados com IC 95% e relevância clínica, o que importa e o que não importa para a prática, e um mini-glossário dos termos técnicos.</p>`}</div>
        <div class="row no-print">${window.IA.temIA() ? `<button class="btn" id="extBtn">${salvo ? "Extrair novamente" : "Extrair com IA"}</button>` : ""}${salvo ? `<button class="btn sec" id="extMd">Baixar (.md)</button>` : ""}</div></div>`;
    $("#extBtn", el)?.addEventListener("click", async () => {
      $("#extIA", el).innerHTML = `<div class="info">Extraindo informações…</div>`;
      try {
        const r = await window.IA.chamar({ schema: SCHEMA_EXTRACAO, prompt: `Extraia do artigo abaixo as informações que um fisioterapeuta precisa para decidir a conduta. Em "dose_fitt" descreva frequência, intensidade, tempo/duração e tipo do programa. Em "resultados" liste as diferenças ENTRE grupos (ou efeitos combinados, em revisões) com o IC 95% quando houver e julgue se superam a mínima diferença clinicamente importante. Em "o_que_importa" liste de 3 a 5 mensagens úteis para a prática; em "o_que_nao_importa" liste detalhes ou achados que não deveriam mudar a conduta (ex.: diferenças só dentro do grupo, desfechos substitutos, efeitos abaixo do MCID). Em "termos_tecnicos" explique de 3 a 6 termos em inglês do artigo.\n\n${textoParaIA(art, full)}` });
        cacheSet(art.pmid, "ext", r); atualizaBib(art.pmid, "ext", r); tabExtrair(el, art);
      } catch (e) { $("#extIA", el).innerHTML = `<div class="alerta">${esc(e.message)}</div>`; }
    });
    $("#extMd", el)?.addEventListener("click", () => baixar(`extracao-${art.pmid}.md`, markdownArtigo({ ...art, ext: salvo, aval: cacheGet(art.pmid, "aval") }), "text/markdown"));
  }
  function htmlExt(r) {
    const cor = { sim: "ok", "não": "bad", incerto: "warn" };
    return `<h3>${esc(r.titulo_pt)}</h3><table>
      <tr><th>Pergunta (PICO)</th><td>${esc(r.pergunta_pico)}</td></tr><tr><th>Desenho</th><td>${esc(r.desenho)}</td></tr>
      <tr><th>População</th><td>${esc(r.populacao)} · n = ${esc(r.n_participantes)}</td></tr><tr><th>Intervenção</th><td>${esc(r.intervencao)}</td></tr>
      <tr><th>Dose (FITT)</th><td>${esc(r.dose_fitt)}</td></tr><tr><th>Comparador</th><td>${esc(r.comparador)}</td></tr>
      <tr><th>Desfechos</th><td>${esc(r.desfechos.join("; "))}</td></tr><tr><th>Seguimento</th><td>${esc(r.seguimento)}</td></tr></table>
      <h3>Resultados</h3><div class="tabela-wrap"><table><tr><th>Desfecho</th><th>Momento</th><th>Resultado</th><th>IC 95%</th><th>Clinicamente importante?</th></tr>${r.resultados.map(x => `<tr><td>${esc(x.desfecho)}</td><td>${esc(x.momento)}</td><td>${esc(x.resultado)}</td><td>${esc(x.ic_95)}</td><td><span class="tag ${cor[x.clinicamente_importante]}">${esc(x.clinicamente_importante)}</span></td></tr>`).join("")}</table></div>
      <p><b>Conclusão dos autores:</b> ${esc(r.conclusao_autores)}</p><div class="sucesso"><b>Mensagem para a prática:</b> ${esc(r.mensagem_para_pratica)}</div>
      <div class="grid-2"><div><h3 style="color:var(--ok)">✅ O que importa</h3>${lista(r.o_que_importa)}</div><div><h3 style="color:var(--danger)">⛔ O que não importa</h3>${lista(r.o_que_nao_importa)}</div></div>
      ${r.cuidado_ao_interpretar.length ? `<h3>⚠️ Cuidado ao interpretar</h3>${lista(r.cuidado_ao_interpretar)}` : ""}
      <h3>Termos técnicos</h3><table>${r.termos_tecnicos.map(t => `<tr><th>${esc(t.termo_en)}</th><td><b>${esc(t.traducao)}</b> — ${esc(t.explicacao)}</td></tr>`).join("")}</table>`;
  }

  function tabNotas(el, art) {
    const b = bib()[art.pmid];
    el.innerHTML = `<div class="card"><label>Suas notas sobre o artigo</label><textarea id="notaTxt" style="min-height:160px">${esc(b?.notas || cacheGet(art.pmid, "notas") || "")}</textarea>
      <p class="muted">Salvo automaticamente${b ? " na biblioteca" : ""}.</p></div>`;
    $("#notaTxt", el).addEventListener("input", e => { cacheSet(art.pmid, "notas", e.target.value); atualizaBib(art.pmid, "notas", e.target.value); });
  }

  rotas.artigos = viewArtigos;
  rotas.artigo = viewArtigo;
  window.ARTIGOS = { efetch, epmcInfo, classificar, extracaoSimples, cacheGet, bib, textoParaIA, esearch, esummary, FILTROS, badgeDesenho, obter, consultaEpmc, epmcBusca };
})();
