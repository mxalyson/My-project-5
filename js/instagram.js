/* Gerador de carrosséis para Instagram: conteúdo a partir de artigos (PubMed), condições do sistema ou texto livre.
   Imagens desenhadas em <canvas> e exportadas em PNG. */
(function () {
  "use strict";
  const { $, $$, esc, store, app, rotas } = window.FR;

  const FORMATOS = { retrato: [1080, 1350, "Retrato 4:5 (feed)"], quadrado: [1080, 1080, "Quadrado 1:1"], story: [1080, 1920, "Story/Reels 9:16"] };
  const TEMAS = {
    marca: window.MARCA.TEMA,
    clinico: { nome: "Clínico azul", bg: "#0f3d75", bg2: "#1e6fd9", fg: "#ffffff", acc: "#7fd1ff", sub: "#cfe3ff", card: "rgba(255,255,255,.10)" },
    claro: { nome: "Claro minimalista", bg: "#f6f8fb", bg2: "#e6eef8", fg: "#14213d", acc: "#1e6fd9", sub: "#4a5a75", card: "rgba(30,111,217,.08)" },
    verde: { nome: "Verde saúde", bg: "#0e4d3c", bg2: "#18815f", fg: "#ffffff", acc: "#a7f3c9", sub: "#d4f5e4", card: "rgba(255,255,255,.10)" },
    escuro: { nome: "Escuro + coral", bg: "#14161c", bg2: "#262a35", fg: "#f5f5f7", acc: "#ff7a59", sub: "#b9bfcc", card: "rgba(255,255,255,.07)" },
    lilas: { nome: "Lilás", bg: "#3b2a6b", bg2: "#6b4fc4", fg: "#ffffff", acc: "#ffd166", sub: "#e3dcff", card: "rgba(255,255,255,.10)" }
  };
  const TIPOS = [["capa", "Capa"], ["conteudo", "Conteúdo"], ["destaque", "Número/frase em destaque"], ["final", "Referência + chamada"]];
  const FONTE = '"Montserrat", system-ui, -apple-system, "Segoe UI", sans-serif';

  const padrao = () => ({ formato: "retrato", tema: "marca", perfil: window.MARCA.get().perfil, publico: "fisio", fonte: "", slides: [
    { tipo: "capa", titulo: "Título que prende a atenção", texto: "Subtítulo com a promessa do post" },
    { tipo: "conteudo", titulo: "O que o estudo fez", texto: "• População\n• Intervenção\n• Comparação" },
    { tipo: "destaque", titulo: "↓ 2 pontos", texto: "na dor após 12 semanas" },
    { tipo: "conteudo", titulo: "Na prática", texto: "• Mensagem 1\n• Mensagem 2" },
    { tipo: "final", titulo: "Referência", texto: "Autor et al. Revista, ano. PMID" }
  ], legenda: "", hashtags: ["fisioterapia", "fisioterapiabaseadaemevidencias"] });
  let st = Object.assign(padrao(), store.get("ig_estado", {}));
  const salvar = () => store.set("ig_estado", st);

  // ---------------------------------------------------------------- desenho
  let T_ATUAL = null; // tema em uso: define as famílias de fonte (títulos x corpo)
  const fam = peso => (T_ATUAL && (+peso >= 700 ? T_ATUAL.fTit : T_ATUAL.fCorpo)) || FONTE;
  const fonte = (peso, s) => { const f = fam(peso); return f.startsWith("italic ") ? `italic ${peso} ${s}px ${f.slice(7)}` : `${peso} ${s}px ${f}`; };
  function quebrar(ctx, texto, larg) {
    const linhas = [];
    String(texto || "").split("\n").forEach(par => {
      if (!par.trim()) { linhas.push(""); return; }
      let atual = "";
      par.split(/\s+/).forEach(p => {
        const teste = atual ? atual + " " + p : p;
        if (ctx.measureText(teste).width > larg && atual) { linhas.push(atual); atual = p; } else atual = teste;
      });
      linhas.push(atual);
    });
    return linhas;
  }
  function ajustar(ctx, texto, larg, alt, max, min, peso, lh = 1.22) {
    for (let s = max; s >= min; s -= 2) {
      ctx.font = fonte(peso, s);
      const l = quebrar(ctx, texto, larg);
      const cabe = l.every(x => ctx.measureText(x).width <= larg); // palavra longa não pode vazar
      if (cabe && l.length * s * lh <= alt) return { s, l, lh };
    }
    ctx.font = fonte(peso, min); return { s: min, l: quebrar(ctx, texto, larg), lh };
  }
  function escrever(ctx, bloco, x, y, cor, peso) {
    ctx.fillStyle = cor; ctx.font = fonte(peso, bloco.s); ctx.textBaseline = "top";
    bloco.l.forEach((ln, i) => ctx.fillText(ln, x, y + i * bloco.s * bloco.lh));
    return y + bloco.l.length * bloco.s * bloco.lh;
  }
  function pill(ctx, txt, x, y, bg, fg) {
    ctx.font = `800 30px ${FONTE}`; const w = ctx.measureText(txt).width + 44;
    ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(x, y, w, 58, 29); ctx.fill();
    ctx.fillStyle = fg; ctx.textBaseline = "middle"; ctx.fillText(txt, x + 22, y + 30); return w;
  }

  function desenhar(canvas, slide, idx, total) {
    const [W, H] = FORMATOS[st.formato]; const T = TEMAS[st.tema] || TEMAS.marca; T_ATUAL = T;
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d");
    const MK = window.MARCA;
    if (T.marca) { MK.fundo(ctx, W, H); MK.rodape(ctx, W, H - 42); }
    else {
      const g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, T.bg); g.addColorStop(1, T.bg2);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = .12; ctx.fillStyle = T.acc; ctx.beginPath(); ctx.arc(W - 90, 140, 230, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(60, H - 60, 160, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
    }
    const corTit = T.marca ? MK.ouro(ctx, 90, W - 90) : T.fg; // títulos dourados no tema da marca
    const M = 90, larg = W - 2 * M - (T.marca ? 110 : 0), topo = st.formato === "story" ? 220 : 110, base = H - (st.formato === "story" ? 260 : 150);
    // rodapé
    ctx.fillStyle = T.sub; ctx.font = `600 30px ${FONTE}`; ctx.textBaseline = "middle";
    ctx.fillText(st.perfil || "", M, base + 70);
    const pg = `${idx + 1}/${total}`; ctx.fillText(pg, W - M - ctx.measureText(pg).width, base + 70);
    ctx.fillStyle = T.acc; ctx.fillRect(M, base + 20, 80, 6);

    if (slide.tipo === "capa") {
      if (T.marca) MK.assinatura(ctx, M, topo - 20, .9);
      else pill(ctx, st.publico === "pac" ? "SAÚDE EM EVIDÊNCIA" : "BASEADO EM EVIDÊNCIAS", M, topo, T.acc, T.bg);
      const tt = ajustar(ctx, slide.titulo, larg, (base - topo - 140) * .68, 104, 52, 800, 1.12);
      let y = escrever(ctx, tt, M, topo + (T.marca ? 150 : 110), corTit, 800) + 34;
      if (T.marca) { ctx.fillStyle = MK.ouro(ctx, M, M + 420); ctx.fillRect(M, y - 10, 420, 3); y += 26; }
      const sb = ajustar(ctx, slide.texto, larg, base - y - 30, T.marca ? 58 : 46, 28, 500);
      if (T.marca) { ctx.save(); T_ATUAL = { ...T, fCorpo: 'italic ' + T.fCorpo }; }
      escrever(ctx, sb, M, y, T.sub, 500);
      if (T.marca) { ctx.restore(); T_ATUAL = T; }
      if (total > 1) { ctx.fillStyle = T.acc; ctx.font = `700 34px ${FONTE}`; ctx.textBaseline = "middle"; const a = "arraste →"; ctx.fillText(a, W - M - ctx.measureText(a).width, base - 10); }
    } else if (slide.tipo === "destaque") {
      const tt = ajustar(ctx, slide.titulo, larg, (base - topo) * .45, 190, 70, 800, 1.05);
      const sb = ajustar(ctx, slide.texto, larg, (base - topo) * .38, 56, 30, 600);
      const alturaTot = tt.l.length * tt.s * tt.lh + 40 + sb.l.length * sb.s * sb.lh;
      let y = topo + Math.max(0, (base - topo - alturaTot) / 2);
      y = escrever(ctx, tt, M, y, T.marca ? corTit : T.acc, 800) + 40; escrever(ctx, sb, M, y, T.fg, 600);
    } else if (slide.tipo === "final") {
      pill(ctx, "REFERÊNCIA", M, topo, T.card === "rgba(30,111,217,.08)" ? "#dbe8fa" : "rgba(255,255,255,.18)", T.fg);
      const tt = ajustar(ctx, slide.titulo, larg, 200, 72, 40, 800, 1.12);
      let y = escrever(ctx, tt, M, topo + 100, corTit, 800) + 26;
      const sb = ajustar(ctx, slide.texto, larg, (base - y) * .55, 40, 24, 500, 1.3);
      y = escrever(ctx, sb, M, y, T.sub, 500) + 50;
      const cta = "💾 Salve para consultar depois\n📤 Envie para um colega";
      const cb = ajustar(ctx, cta, larg - 60, base - y - 40, 40, 26, 700, 1.35);
      const h = cb.l.length * cb.s * cb.lh + 60;
      ctx.fillStyle = T.card; ctx.beginPath(); ctx.roundRect(M, y, larg, h, 28); ctx.fill();
      escrever(ctx, cb, M + 30, y + 30, T.fg, 700);
    } else {
      ctx.fillStyle = T.acc; ctx.beginPath(); ctx.arc(M + 34, topo + 34, 34, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = T.bg; ctx.font = `800 34px ${FONTE}`; ctx.textBaseline = "middle"; const n = String(idx); ctx.fillText(n, M + 34 - ctx.measureText(n).width / 2, topo + 36);
      const tt = ajustar(ctx, slide.titulo, larg, 260, 78, 42, 800, 1.12);
      let y = escrever(ctx, tt, M, topo + 100, corTit, 800) + 36;
      const sb = ajustar(ctx, slide.texto, larg - 50, base - y - 40, 50, 26, 500, 1.35);
      const h = sb.l.length * sb.s * sb.lh + 60;
      ctx.fillStyle = T.card; ctx.beginPath(); ctx.roundRect(M - 10, y - 10, larg + 20, Math.min(h, base - y), 28); ctx.fill();
      escrever(ctx, sb, M + 20, y + 20, T.fg, 500);
    }
  }

  // ---------------------------------------------------------------- fontes de conteúdo
  function deCondicao(id) {
    const c = CONDICOES.find(x => x.id === id); if (!c) return;
    const t = TECIDOS.find(x => x.id === c.tecido);
    const ev = c.evidencia[0];
    st.slides = [
      { tipo: "capa", titulo: c.nome.replace(/ — ENCAMINHAR$/, ""), texto: st.publico === "pac" ? "O que é, quanto tempo leva e o que realmente ajuda" : "Raciocínio clínico, prognóstico e conduta baseada em evidências" },
      { tipo: "conteudo", titulo: "O que é", texto: c.resumo },
      { tipo: "conteudo", titulo: "Como reconhecer", texto: Object.entries(c.achados).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k]) => "• " + rotuloAchado(k)).join("\n") },
      { tipo: "destaque", titulo: "Prognóstico", texto: c.prognostico.texto.split(". ")[0] + "." },
      { tipo: "conteudo", titulo: "Tempo de reparo do tecido", texto: t ? `${t.nome}: ${t.tempo}` : "Varia conforme o tecido e a gravidade" },
      { tipo: "conteudo", titulo: "O que ajuda", texto: c.conduta.proliferativa.slice(0, 3).map(x => "• " + x).join("\n") },
      { tipo: "conteudo", titulo: "Quando procurar avaliação médica", texto: c.encaminhar.slice(0, 3).map(x => "• " + x).join("\n") || "• Piora progressiva\n• Sintomas neurológicos" },
      { tipo: "final", titulo: "Baseado em", texto: c.evidencia.slice(0, 2).map(e => e.ref).join("\n") }
    ];
    st.legenda = `${c.nome.replace(/ — ENCAMINHAR$/, "")}: ${c.resumo.split(". ")[0]}.\n\n${c.prognostico.texto.split(". ")[0]}.\n\n✅ ${c.conduta.proliferativa[0]}\n\n📚 Fonte: ${ev ? ev.ref : "diretrizes de prática clínica"}\n\nConteúdo educativo: não substitui avaliação individual com fisioterapeuta.`;
    st.hashtags = ["fisioterapia", "fisioterapiabaseadaemevidencias", "reabilitacao", "fisioterapiaortopedica", "saude"];
  }

  async function deArtigo(pmid, usarIA) {
    const A = window.ARTIGOS; let art = A.cacheGet(pmid, "meta"); if (!art) art = await A.efetch(pmid);
    const ext = A.cacheGet(pmid, "ext"); const ref = `${art.autores[0] || ""}${art.autores.length > 1 ? " et al." : ""} ${art.titulo} ${art.revista}. ${art.ano}. PMID: ${pmid}${art.doi ? " · doi:" + art.doi : ""}`;
    if (usarIA) {
      const S = (p) => ({ type: "object", properties: p, required: Object.keys(p), additionalProperties: false });
      const r = await window.IA.chamar({ schema: S({
        slides: { type: "array", items: S({ tipo: { type: "string", enum: ["capa", "conteudo", "destaque", "final"] }, titulo: { type: "string" }, texto: { type: "string" } }) },
        legenda: { type: "string" }, hashtags: { type: "array", items: { type: "string" } } }),
        prompt: `Crie um carrossel para Instagram em português do Brasil sobre o artigo abaixo, para ${st.publico === "pac" ? "pacientes e público leigo (linguagem simples, sem jargão)" : "fisioterapeutas e estudantes (linguagem técnica, mas direta)"}.
Regras: 6 a 8 slides; o 1º do tipo "capa" com um gancho honesto (sem sensacionalismo nem promessas de cura); slides "conteudo" com no máximo 45 palavras cada e tópicos iniciados por "• "; um slide "destaque" com o principal número ou achado (título curtíssimo, ex.: "−1,8 ponto na dor") e contexto no texto, incluindo se o efeito é clinicamente relevante; um slide sobre limitações/o que o estudo NÃO mostra; o último do tipo "final" com título "Referência" e o texto exatamente: "${ref}".
Escreva com suas próprias palavras: não copie frases do artigo nem reproduza figuras. Não exagere o efeito: respeite o desenho e a certeza da evidência.
A legenda deve ter até 1.500 caracteres: gancho, resumo do estudo, o que muda na prática, limitação principal, convite para salvar/comentar, a referência e o aviso "Conteúdo educativo; não substitui avaliação individual". Hashtags: 8 a 15, sem o símbolo #, em português e minúsculas, sem acentos.
${ext ? "Dados já extraídos do artigo: " + JSON.stringify({ desenho: ext.desenho, n: ext.n_participantes, mensagem: ext.mensagem_para_pratica, resultados: ext.resultados }) : ""}

${A.textoParaIA(art, A.cacheGet(pmid, "full"))}` });
      st.slides = r.slides; st.legenda = r.legenda; st.hashtags = r.hashtags.map(h => h.replace(/^#/, ""));
      return;
    }
    const d = A.classificar(art.tipos, art.titulo);
    st.slides = [
      { tipo: "capa", titulo: ext?.titulo_pt || "O que diz este estudo?", texto: `${d.nome} · ${art.revista} (${art.ano})` },
      { tipo: "conteudo", titulo: "O estudo", texto: ext ? `• ${ext.populacao} (n = ${ext.n_participantes})\n• ${ext.intervencao}\n• Comparado com: ${ext.comparador}` : "• Quem participou\n• O que foi feito\n• Comparado com o quê" },
      { tipo: "destaque", titulo: ext?.resultados?.[0]?.resultado?.slice(0, 40) || "Resultado principal", texto: ext?.resultados?.[0] ? `${ext.resultados[0].desfecho} (${ext.resultados[0].momento})` : "Escreva aqui o contexto do número" },
      { tipo: "conteudo", titulo: "Na prática", texto: ext ? ext.o_que_importa.slice(0, 3).map(x => "• " + x).join("\n") : "• Mensagem para a prática" },
      { tipo: "conteudo", titulo: "Cuidado ao interpretar", texto: ext ? (ext.cuidado_ao_interpretar.slice(0, 3).map(x => "• " + x).join("\n") || "• Veja as limitações do estudo") : "• Limitações do estudo" },
      { tipo: "final", titulo: "Referência", texto: ref }
    ];
    st.legenda = ext ? `${ext.titulo_pt}\n\n${ext.mensagem_para_pratica}\n\n📚 ${ref}\n\nConteúdo educativo; não substitui avaliação individual.` : `📚 ${ref}\n\nConteúdo educativo; não substitui avaliação individual.`;
    st.hashtags = ["fisioterapia", "fisioterapiabaseadaemevidencias", "ciencia", "reabilitacao"];
  }

  // ---------------------------------------------------------------- tela
  function viewInstagram(pmidInicial) {
    const salvos = Object.values(window.ARTIGOS.bib());
    app.innerHTML = `<h1>📸 Posts para Instagram</h1>
      <p class="muted">Crie carrosséis a partir de artigos do PubMed, das condições do sistema ou de texto livre. Edite os textos, escolha o visual e baixe as imagens em PNG.</p>
      <div class="grid-2" style="align-items:start">
        <div>
          <div class="card" id="igFonte"><h3>1. Conteúdo</h3>
            <div class="form-grid">
              <div><label>Origem</label><select id="igOrigem"><option value="artigo">Artigo (PMID ou biblioteca)</option><option value="cond">Condição do sistema</option><option value="livre">Texto livre</option></select></div>
              <div><label>Público</label><select id="igPublico"><option value="fisio" ${st.publico === "fisio" ? "selected" : ""}>Fisioterapeutas/estudantes</option><option value="pac" ${st.publico === "pac" ? "selected" : ""}>Pacientes/público geral</option></select></div>
            </div>
            <div id="igOrigArt"><label>Artigo</label><select id="igBib"><option value="">— escolher da biblioteca —</option>${salvos.map(a => `<option value="${a.pmid}">${esc(a.titulo.slice(0, 90))}</option>`).join("")}</select>
              <label>ou PMID</label><input type="text" id="igPmid" value="${esc(pmidInicial || "")}" placeholder="ex.: 30170971"></div>
            <div id="igOrigCond" hidden><label>Condição</label><select id="igCond">${CONDICOES.map(c => `<option value="${c.id}">${esc(c.nome)}</option>`).join("")}</select></div>
            <div class="row" style="margin-top:10px"><button class="btn" id="igGerar">${window.IA.temIA() ? "✨ Gerar com IA" : "Gerar a partir do modelo"}</button>${window.IA.temIA() ? `<button class="btn sec" id="igGerarSem">Gerar sem IA</button>` : `<a class="tag warn" href="#/ia">Configure a IA para textos automáticos de artigos</a>`}</div>
            <div id="igMsg"></div></div>
          <div class="card" id="igVisual"><h3>2. Visual</h3><div class="form-grid">
            <div><label>Formato</label><select id="igFormato">${Object.entries(FORMATOS).map(([k, v]) => `<option value="${k}" ${k === st.formato ? "selected" : ""}>${v[2]}</option>`).join("")}</select></div>
            <div><label>Tema</label><select id="igTema">${Object.entries(TEMAS).map(([k, v]) => `<option value="${k}" ${k === st.tema ? "selected" : ""}>${v.nome}</option>`).join("")}</select></div>
            <div><label>Seu @ ou nome</label><input type="text" id="igPerfil" value="${esc(st.perfil)}"></div></div></div>
          <div class="card"><h3>3. Textos dos slides</h3><div id="igSlides"></div><button class="btn sec peq" id="igAdd">+ Slide</button></div>
          <div class="card"><h3>4. Legenda</h3><textarea id="igLegenda" style="min-height:180px">${esc(st.legenda)}</textarea>
            <label>Hashtags (separadas por espaço, sem #)</label><input type="text" id="igTags" value="${esc(st.hashtags.join(" "))}">
            <div id="igConta" class="muted"></div><div class="row" style="margin-top:8px"><button class="btn" id="igCopiar">Copiar legenda + hashtags</button></div></div>
        </div>
        <div><div class="card"><div class="row" style="justify-content:space-between"><h3 style="margin:0">Prévia</h3><button class="btn" id="igBaixarTodos">⬇ Baixar todas (PNG)</button></div>
          <div id="igPrev" class="ig-prev"></div></div>
          <div class="aviso"><b>Boas práticas:</b> confira os números com o artigo, cite a fonte, não reproduza figuras/tabelas protegidas e evite promessas de cura. Siga o Código de Ética e as normas de publicidade do COFFITO.</div></div>
      </div>`;
    const origem = () => $("#igOrigem").value;
    const trocaOrigem = () => { $("#igOrigArt").hidden = origem() !== "artigo"; $("#igOrigCond").hidden = origem() !== "cond"; };
    $("#igOrigem").addEventListener("change", trocaOrigem);
    if (pmidInicial) $("#igOrigem").value = "artigo"; trocaOrigem();
    $("#igBib").addEventListener("change", e => { if (e.target.value) $("#igPmid").value = e.target.value; });

    const gerar = async usarIA => {
      st.publico = $("#igPublico").value; const msg = $("#igMsg");
      try {
        if (origem() === "cond") deCondicao($("#igCond").value);
        else if (origem() === "livre") { st.slides = padrao().slides; st.legenda = ""; }
        else {
          const p = $("#igPmid").value.trim(); if (!/^\d+$/.test(p)) { msg.innerHTML = `<div class="aviso">Informe um PMID válido ou escolha um artigo da biblioteca.</div>`; return; }
          msg.innerHTML = `<div class="info">${usarIA ? "Criando o carrossel com IA…" : "Montando a partir do modelo…"}</div>`;
          await deArtigo(p, usarIA);
          if (!usarIA && !window.ARTIGOS.cacheGet(p, "ext")) msg.innerHTML = `<div class="aviso">Modelo preenchido com o que foi possível. Para textos completos, faça a extração do artigo (aba "Extrair") ou use a IA.</div>`;
          else msg.innerHTML = "";
        }
        if (origem() !== "artigo") msg.innerHTML = "";
        salvar(); editores(); legenda(); render();
      } catch (e) { msg.innerHTML = `<div class="alerta">${esc(e.message)}</div>`; }
    };
    $("#igGerar").addEventListener("click", () => gerar(window.IA.temIA()));
    $("#igGerarSem")?.addEventListener("click", () => gerar(false));
    $("#igVisual").addEventListener("change", () => { st.formato = $("#igFormato").value; st.tema = $("#igTema").value; salvar(); render(); });
    $("#igPerfil").addEventListener("input", e => { st.perfil = e.target.value; salvar(); render(); });

    function editores() {
      $("#igSlides").innerHTML = st.slides.map((s, i) => `<details ${i < 1 ? "open" : ""} data-s="${i}"><summary>Slide ${i + 1} · ${esc(s.titulo.slice(0, 40))}</summary>
        <div class="form-grid"><div><label>Tipo</label><select data-f="tipo">${TIPOS.map(([k, l]) => `<option value="${k}" ${k === s.tipo ? "selected" : ""}>${l}</option>`).join("")}</select></div></div>
        <label>Título</label><input type="text" data-f="titulo" value="${esc(s.titulo)}"><label>Texto (use "• " para tópicos)</label><textarea data-f="texto">${esc(s.texto)}</textarea>
        <div class="row" style="margin-top:6px"><button class="btn sec peq" data-mv="-1">↑</button><button class="btn sec peq" data-mv="1">↓</button><button class="btn peq perigo" data-del="1">Excluir</button></div></details>`).join("");
    }
    $("#igSlides").addEventListener("input", e => {
      const d = e.target.closest("[data-s]"), f = e.target.dataset.f; if (!d || !f) return;
      st.slides[+d.dataset.s][f] = e.target.value; salvar(); render();
    });
    $("#igSlides").addEventListener("click", e => {
      const d = e.target.closest("[data-s]"); if (!d) return; const i = +d.dataset.s;
      if (e.target.dataset.del) { st.slides.splice(i, 1); }
      else if (e.target.dataset.mv) { const j = i + +e.target.dataset.mv; if (j < 0 || j >= st.slides.length) return; [st.slides[i], st.slides[j]] = [st.slides[j], st.slides[i]]; }
      else return;
      salvar(); editores(); render();
    });
    $("#igAdd").addEventListener("click", () => { st.slides.splice(Math.max(0, st.slides.length - 1), 0, { tipo: "conteudo", titulo: "Novo slide", texto: "• Tópico" }); salvar(); editores(); render(); });

    function legenda() { $("#igLegenda").value = st.legenda; $("#igTags").value = st.hashtags.join(" "); conta(); }
    const textoFinal = () => st.legenda.trim() + "\n\n" + st.hashtags.filter(Boolean).map(h => "#" + h).join(" ");
    function conta() {
      const n = textoFinal().length, h = st.hashtags.filter(Boolean).length;
      $("#igConta").innerHTML = `${n}/2.200 caracteres · ${h}/30 hashtags ${n > 2200 || h > 30 ? `<span class="tag bad">acima do limite do Instagram</span>` : ""}`;
    }
    $("#igLegenda").addEventListener("input", e => { st.legenda = e.target.value; salvar(); conta(); });
    $("#igTags").addEventListener("input", e => { st.hashtags = e.target.value.split(/[\s,]+/).map(h => h.replace(/^#/, "")).filter(Boolean); salvar(); conta(); });
    $("#igCopiar").addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(textoFinal()); $("#igCopiar").textContent = "Copiado ✓"; }
      catch (e) { $("#igLegenda").select(); $("#igCopiar").textContent = "Selecione e copie (Ctrl+C)"; }
      setTimeout(() => { const b = $("#igCopiar"); if (b) b.textContent = "Copiar legenda + hashtags"; }, 2000);
    });

    let pendente = null;
    function render() {
      cancelAnimationFrame(pendente);
      pendente = requestAnimationFrame(() => {
        const box = $("#igPrev"); if (!box) return;
        while (box.children.length > st.slides.length) box.lastChild.remove();
        st.slides.forEach((s, i) => {
          let fig = box.children[i];
          if (!fig) { fig = document.createElement("figure"); fig.innerHTML = `<canvas></canvas><figcaption><button class="btn sec peq" data-dl="${i}">⬇ PNG ${i + 1}</button></figcaption>`; box.appendChild(fig); }
          desenhar(fig.querySelector("canvas"), s, i, st.slides.length);
        });
      });
    }
    const baixarPNG = i => new Promise(res => {
      const c = $$("#igPrev canvas")[i];
      c.toBlob(b => { const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = `post-${String(i + 1).padStart(2, "0")}.png`; a.click(); setTimeout(res, 350); }, "image/png");
    });
    $("#igPrev").addEventListener("click", e => { const b = e.target.closest("[data-dl]"); if (b) baixarPNG(+b.dataset.dl); });
    $("#igBaixarTodos").addEventListener("click", async () => { for (let i = 0; i < st.slides.length; i++) await baixarPNG(i); });

    editores(); legenda();
    (document.fonts ? Promise.all([window.MARCA.pronto, "800 40px Montserrat", "600 40px 'Josefin Sans'", "700 40px 'Josefin Sans'", "400 40px 'Josefin Sans'", "600 40px 'Cormorant Garamond'", "italic 500 40px 'Cormorant Garamond'"].map(f => typeof f === "string" ? document.fonts.load(f) : f)).catch(() => {}) : Promise.resolve()).then(render);
    if (pmidInicial && !st.slides.some(s => s.texto.includes(pmidInicial))) $("#igMsg").innerHTML = `<div class="info">Artigo ${esc(pmidInicial)} selecionado. Clique em gerar.</div>`;
  }

  rotas.instagram = viewInstagram;
  // usado pelo "Kit do artigo" (planejamento de conteúdo)
  window.IG = { async gerarDeArtigo(pmid, usarIA) { await deArtigo(pmid, usarIA); salvar(); } };
})();
