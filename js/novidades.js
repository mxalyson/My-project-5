/* Novidades científicas: temas acompanhados no PubMed, contagem de artigos novos desde a última visita e resumo semanal. */
(function () {
  "use strict";
  const { $, $$, esc, store, app, rotas } = window.FR;
  const PRESETS = [
    ["Pilates", "pilates[tiab] AND (pain OR rehabilitation OR exercise OR function)"],
    ["Dor lombar", "low back pain[tiab] AND (exercise OR physiotherapy OR physical therapy)"],
    ["Dor cervical", "neck pain[tiab] AND (exercise OR manual therapy OR physiotherapy)"],
    ["Ombro / manguito", "(rotator cuff OR shoulder pain)[tiab] AND (exercise OR rehabilitation)"],
    ["LCA", "anterior cruciate ligament[tiab] AND rehabilitation[tiab]"],
    ["Dor femoropatelar", "patellofemoral pain[tiab]"],
    ["Osteoartrite", "osteoarthritis[tiab] AND (exercise OR physiotherapy)"],
    ["Tendinopatias", "tendinopathy[tiab] AND (exercise OR loading)"],
    ["Idosos e quedas", "falls[tiab] AND older adults[tiab] AND exercise[tiab]"],
    ["Gestação e pós-parto", "(pregnancy OR postpartum)[tiab] AND (exercise OR pelvic girdle pain OR diastasis)"]
  ];
  const TIPOS_PADRAO = ["sr", "ma", "rct", "gl"];
  const temas = () => store.get("alertas_temas", []);
  const salvarTemas = l => store.set("alertas_temas", l);
  const ymd = d => { const x = new Date(d); return `${x.getFullYear()}/${String(x.getMonth() + 1).padStart(2, "0")}/${String(x.getDate()).padStart(2, "0")}`; };

  function termo(t) {
    const F = window.ARTIGOS.FILTROS; const tipos = F.filter(f => (t.tipos || TIPOS_PADRAO).includes(f[0])).map(f => f[2]);
    return `(${t.query})${tipos.length ? ` AND (${tipos.join(" OR ")})` : ""}`;
  }
  // Busca artigos adicionados ao PubMed desde a última visita (data de entrada no Entrez)
  async function novos(t, comDetalhes) {
    const desde = t.visto || new Date(Date.now() - 30 * 864e5).toISOString();
    const u = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&retmode=json&retmax=20&sort=pub_date&datetype=edat&mindate=${ymd(desde)}&maxdate=3000&term=${encodeURIComponent(termo(t))}&tool=fisioraciocinio`;
    const r = await fetch(u); if (!r.ok) throw new Error("PubMed indisponível");
    const j = await r.json(); const ids = j.esearchresult.idlist || []; const total = +j.esearchresult.count || 0;
    return { total, docs: comDetalhes ? await window.ARTIGOS.esummary(ids) : [] };
  }
  async function verificarTodos(comDetalhes) {
    const out = {};
    for (const t of temas()) { try { out[t.id] = await novos(t, comDetalhes); } catch (e) { out[t.id] = { erro: e.message, total: 0, docs: [] }; } await new Promise(r => setTimeout(r, 380)); } // respeita o limite do NCBI (3 req/s)
    const soma = Object.values(out).reduce((s, x) => s + (x.total || 0), 0);
    store.set("alertas_contagem", { soma, quando: new Date().toISOString() }); badge(soma);
    return out;
  }
  function badge(n) {
    const a = document.querySelector('.sidebar a[data-r="novidades"]'); if (!a) return;
    let b = a.querySelector(".nbadge"); if (!b) { b = document.createElement("span"); b.className = "nbadge"; a.appendChild(b); }
    b.textContent = n > 0 ? (n > 99 ? "99+" : n) : ""; b.hidden = !n;
  }

  function view() {
    const ts = temas();
    app.innerHTML = `<h1>🔔 Novidades científicas</h1>
      <p class="muted">Acompanhe temas no PubMed: o sistema mostra o que entrou de novo desde a sua última visita (por padrão, revisões sistemáticas, meta-análises, ensaios clínicos e diretrizes).</p>
      <div class="card"><h3>Seus temas</h3>${ts.length ? "" : `<p class="muted">Nenhum tema ainda. Adicione um sugerido ou crie o seu.</p>`}
        <div class="row">${PRESETS.filter(p => !ts.some(t => t.nome === p[0])).map(p => `<button class="btn sec peq" data-preset="${esc(p[0])}">+ ${esc(p[0])}</button>`).join("")}</div>
        <details style="margin-top:8px"><summary>Criar tema personalizado</summary><div class="form-grid"><div><label>Nome</label><input type="text" id="ntNome" placeholder="ex.: Fasciopatia plantar"></div><div><label>Busca (em inglês)</label><input type="text" id="ntQuery" placeholder="plantar fasciitis OR plantar heel pain"></div></div>
          <div class="row">${window.ARTIGOS.FILTROS.filter(f => TIPOS_PADRAO.includes(f[0])).map(f => `<label class="check"><input type="checkbox" data-nt="${f[0]}" checked> ${f[1]}</label>`).join("")}</div><button class="btn peq" id="ntCriar">Adicionar</button></details></div>
      <div class="row"><button class="btn" id="nvVerificar">🔄 Verificar novidades agora</button>${ts.length && window.IA.temIA() ? `<button class="btn sec" id="nvResumo">✨ Resumo da semana com IA</button>` : ""}</div>
      <div id="nvResumoOut"></div><div id="nvLista">${ts.map(t => `<div class="card" data-t="${t.id}"><div class="row" style="justify-content:space-between"><b>${esc(t.nome)}</b><span class="muted" style="font-size:.8rem">desde ${t.visto ? new Date(t.visto).toLocaleDateString("pt-BR") : "últimos 30 dias"}</span></div><div class="nvRes muted">Clique em "Verificar novidades".</div>
        <div class="row" style="margin-top:6px"><button class="btn peq sec" data-visto="${t.id}">✓ Marcar como visto</button><button class="btn peq perigo" data-del="${t.id}">Remover tema</button></div></div>`).join("")}</div>`;
    let ultimo = null;
    const verificar = async () => {
      $("#nvVerificar").disabled = true; $$(".nvRes").forEach(d => { d.textContent = "Buscando…"; });
      ultimo = await verificarTodos(true); $("#nvVerificar").disabled = false;
      temas().forEach(t => {
        const r = ultimo[t.id], box = $(`[data-t="${t.id}"] .nvRes`); if (!box) return;
        if (r.erro) { box.innerHTML = `<span class="tag bad">${esc(r.erro)}</span>`; return; }
        box.classList.remove("muted");
        box.innerHTML = r.total ? `<p><span class="tag ok">${r.total} novo(s)</span>${r.total > 20 ? " (mostrando 20 mais recentes)" : ""}</p>` + r.docs.map(d => `<div style="padding:4px 0;border-bottom:1px solid var(--border)">${window.ARTIGOS.badgeDesenho(d.tipos, d.titulo)} <a href="#/artigo/${d.pmid}">${esc(d.titulo)}</a> <small class="muted">· ${esc(d.revista)} · ${esc(d.ano)}</small></div>`).join("") : `<span class="muted">Nada novo desde a última visita.</span>`;
      });
    };
    $("#nvVerificar").addEventListener("click", verificar);
    app.addEventListener("click", function h(e) {
      if (!document.body.contains($("#nvLista"))) { app.removeEventListener("click", h); return; }
      const p = e.target.dataset.preset; if (p) { const x = PRESETS.find(q => q[0] === p); salvarTemas([...temas(), { id: "t" + Date.now().toString(36), nome: x[0], query: x[1], tipos: TIPOS_PADRAO }]); view(); return; }
      if (e.target.id === "ntCriar") { const nome = $("#ntNome").value.trim(), query = $("#ntQuery").value.trim(); if (!nome || !query) return alert("Preencha nome e busca."); salvarTemas([...temas(), { id: "t" + Date.now().toString(36), nome, query, tipos: $$("[data-nt]").filter(x => x.checked).map(x => x.dataset.nt) }]); view(); return; }
      if (e.target.dataset.visto) { salvarTemas(temas().map(t => t.id === e.target.dataset.visto ? { ...t, visto: new Date().toISOString() } : t)); view(); return; }
      if (e.target.dataset.del && confirm("Remover este tema?")) { salvarTemas(temas().filter(t => t.id !== e.target.dataset.del)); view(); }
    });
    $("#nvResumo")?.addEventListener("click", async () => {
      const out = $("#nvResumoOut"); out.innerHTML = `<div class="info">Buscando e resumindo…</div>`;
      try {
        if (!ultimo) ultimo = await verificarTodos(true);
        const itens = temas().flatMap(t => (ultimo[t.id]?.docs || []).slice(0, 8).map(d => `- [${t.nome}] ${d.titulo} (${d.revista}, ${d.ano}; tipo: ${d.tipos.join(", ")}; PMID ${d.pmid})`));
        if (!itens.length) { out.innerHTML = `<div class="info">Nenhuma novidade para resumir.</div>`; return; }
        const txt = await window.IA.chamar({ effort: "low", maxTokens: 6000, prompt: `Abaixo estão títulos de artigos recém-indexados no PubMed nos temas que um fisioterapeuta acompanha. Com base APENAS nos títulos e tipos de estudo, organize um resumo da semana em português do Brasil: por tema, destaque de 1 a 3 artigos que parecem mais relevantes para a prática (priorize diretrizes, revisões sistemáticas e ensaios clínicos), dizendo em uma frase por que vale abrir cada um e citando o PMID. Deixe claro que é uma triagem pelos títulos, sem leitura dos artigos. Seja breve.\n\n<artigo>\n${itens.join("\n")}\n</artigo>` });
        out.innerHTML = `<div class="card"><h3>Resumo da semana (triagem pelos títulos)</h3>${txt.split(/\n+/).map(l => `<p>${esc(l).replace(/PMID:? ?(\d+)/g, '<a href="#/artigo/$1">PMID $1</a>')}</p>`).join("")}</div>`;
      } catch (e) { out.innerHTML = `<div class="alerta">${esc(e.message)}</div>`; }
    });
  }

  rotas.novidades = view;
  // Verificação automática ao abrir o app (no máximo 1 vez a cada 12 h), sem bloquear a interface
  window.addEventListener("load", () => {
    const c = store.get("alertas_contagem", null); if (c) badge(c.soma);
    if (!temas().length || !navigator.onLine) return;
    if (c && Date.now() - new Date(c.quando) < 12 * 36e5) return;
    setTimeout(() => verificarTodos(false).catch(() => {}), 3000);
  });
})();
