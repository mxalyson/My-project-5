/* Reels: roteiro falado + editor animado (canvas 1080x1920) + teleprompter/gravação de voz + exportação de vídeo, SRT e roteiro. */
(function () {
  "use strict";
  const { $, $$, esc, store, app, rotas } = window.FR;
  const W = 1080, H = 1920, FPS = 30;
  const FONTE = '"Montserrat", system-ui, -apple-system, "Segoe UI", sans-serif';
  // Zona segura: a interface do Instagram cobre o topo, a base e a lateral direita.
  const SAFE = { top: 250, bottom: 420, left: 90, right: 150 };
  const TEMAS = {
    clinico: { nome: "Clínico azul", bg: "#0b2f5c", bg2: "#1e6fd9", fg: "#ffffff", acc: "#7fd1ff", sub: "#cfe3ff" },
    escuro: { nome: "Escuro + coral", bg: "#101218", bg2: "#262a35", fg: "#f5f5f7", acc: "#ff7a59", sub: "#b9bfcc" },
    verde: { nome: "Verde saúde", bg: "#0b3f31", bg2: "#18815f", fg: "#ffffff", acc: "#a7f3c9", sub: "#d4f5e4" },
    lilas: { nome: "Lilás", bg: "#2e2157", bg2: "#6b4fc4", fg: "#ffffff", acc: "#ffd166", sub: "#e3dcff" },
    claro: { nome: "Claro", bg: "#f4f7fb", bg2: "#dde8f7", fg: "#14213d", acc: "#1e6fd9", sub: "#4a5a75" }
  };
  const TIPOS = [["gancho", "Gancho (abertura)"], ["fala", "Explicação"], ["dado", "Número/achado"], ["lista", "Lista"], ["alerta", "Cuidado/limitação"], ["cta", "Chamada final"], ["referencia", "Referência"]];
  const RITMOS = { lento: 2.2, normal: 2.6, rapido: 3.0 }; // palavras por segundo em PT-BR

  const padrao = () => ({ tema: "clinico", perfil: "@seuperfil", ritmo: "normal", legendas: true, alvo: 45, publico: "fisio", titulo: "", cenas: [], legenda: "", hashtags: [], dicas: [], audioNome: "" });
  let st = Object.assign(padrao(), store.get("reels_estado", {}));
  const salvar = () => store.set("reels_estado", st);
  let audioBlob = null; // voz gravada/importada (somente nesta sessão)

  // ---------------------------------------------------------------- tempo
  const palavras = s => (String(s || "").trim().match(/\S+/g) || []).length;
  const duracaoAuto = c => Math.max(2.2, +(palavras(c.fala) / RITMOS[st.ritmo] + 0.5).toFixed(1));
  const dur = c => c.dur && c.dur > 0 ? c.dur : duracaoAuto(c);
  const total = () => st.cenas.reduce((s, c) => s + dur(c), 0);
  function cenaEm(t) { let acc = 0; for (let i = 0; i < st.cenas.length; i++) { const d = dur(st.cenas[i]); if (t < acc + d) return { i, t0: acc, local: t - acc, d }; acc += d; } const i = st.cenas.length - 1; return { i, t0: acc - dur(st.cenas[i]), local: dur(st.cenas[i]), d: dur(st.cenas[i]) }; }
  // legendas: blocos de até ~5 palavras distribuídos pelo tempo da cena (proporcional ao tamanho)
  function blocosLegenda(c, d) {
    const ws = String(c.fala || "").replace(/\*/g, "").split(/\s+/).filter(Boolean); if (!ws.length) return [];
    const blocos = []; let atual = [];
    ws.forEach(w => { atual.push(w); if (atual.length >= 5 || /[.!?…,;:]$/.test(w) && atual.length >= 3) { blocos.push(atual.join(" ")); atual = []; } });
    if (atual.length) blocos.push(atual.join(" "));
    const pesos = blocos.map(b => b.length + 6), soma = pesos.reduce((a, b) => a + b, 0); let t = 0;
    return blocos.map((b, i) => { const ini = t; t += d * pesos[i] / soma; return { ini, fim: t, txt: b }; });
  }

  // ---------------------------------------------------------------- desenho
  const ease = x => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
  function quebrar(ctx, texto, larg) {
    const linhas = [];
    String(texto || "").split("\n").forEach(par => {
      let atual = "";
      par.split(/\s+/).filter(Boolean).forEach(p => { const t = atual ? atual + " " + p : p; if (ctx.measureText(t.replace(/\*/g, "")).width > larg && atual) { linhas.push(atual); atual = p; } else atual = t; });
      if (atual) linhas.push(atual);
    });
    return linhas;
  }
  function ajustar(ctx, texto, larg, alt, max, min, peso, lh = 1.15) {
    for (let s = max; s >= min; s -= 3) {
      ctx.font = `${peso} ${s}px ${FONTE}`; const l = quebrar(ctx, texto, larg);
      const cabe = l.every(x => ctx.measureText(x.replace(/\*/g, "")).width <= larg); // palavra longa não pode vazar
      if (cabe && l.length * s * lh <= alt) return { s, l, lh, peso };
    }
    ctx.font = `${peso} ${min}px ${FONTE}`; return { s: min, l: quebrar(ctx, texto, larg), lh, peso };
  }
  // escreve linha com *destaque* em outra cor
  function linhaRica(ctx, ln, x, y, cor, corAcc, alinhar) {
    const partes = ln.split(/(\*[^*]+\*)/).filter(Boolean);
    const larg = partes.reduce((s, p) => s + ctx.measureText(p.replace(/\*/g, "")).width, 0);
    let cx = alinhar === "center" ? x - larg / 2 : x;
    partes.forEach(p => { const dest = /^\*.*\*$/.test(p); const tx = p.replace(/\*/g, ""); ctx.fillStyle = dest ? corAcc : cor; ctx.fillText(tx, cx, y); cx += ctx.measureText(tx).width; });
  }
  // continua destaque entre linhas quebradas no meio de *...*
  function normalizaDestaque(linhas) { let aberto = false; return linhas.map(l => { let s = (aberto ? "*" : "") + l; const n = (l.match(/\*/g) || []).length; if (n % 2) aberto = !aberto; if (aberto) s += "*"; return s; }); }
  function bloco(ctx, b, x, y, cor, corAcc, alinhar, prog, escalonar = true) {
    ctx.font = `${b.peso} ${b.s}px ${FONTE}`; ctx.textBaseline = "top";
    normalizaDestaque(b.l).forEach((ln, i) => {
      const p = escalonar ? ease((prog - i * 0.08) * 1.6) : 1;
      ctx.save(); ctx.globalAlpha *= p; ctx.translate(0, (1 - p) * 40);
      linhaRica(ctx, ln, x, y + i * b.s * b.lh, cor, corAcc, alinhar); ctx.restore();
    });
    return y + b.l.length * b.s * b.lh;
  }
  function pill(ctx, txt, x, y, bg, fg) { ctx.font = `800 34px ${FONTE}`; const w = ctx.measureText(txt).width + 50; ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(x, y, w, 66, 33); ctx.fill(); ctx.fillStyle = fg; ctx.textBaseline = "middle"; ctx.fillText(txt, x + 25, y + 34); }

  function fundo(ctx, T, t) {
    const g = ctx.createLinearGradient(0, 0, W * .4, H); g.addColorStop(0, T.bg); g.addColorStop(1, T.bg2); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = .13; ctx.fillStyle = T.acc;
    ctx.beginPath(); ctx.arc(W - 120 + Math.sin(t * .4) * 60, 380 + Math.cos(t * .3) * 80, 330, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(140 + Math.cos(t * .35) * 50, H - 520 + Math.sin(t * .25) * 70, 240, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }

  function quadro(ctx, t) {
    const T = TEMAS[st.tema] || TEMAS.clinico; fundo(ctx, T, t);
    if (!st.cenas.length) return;
    const { i, local, d } = cenaEm(t); const c = st.cenas[i];
    const entrada = ease(local / .45), saida = i < st.cenas.length - 1 ? 1 - ease((local - (d - .25)) / .25) : 1;
    const x = SAFE.left, larg = W - SAFE.left - SAFE.right, topo = SAFE.top, base = H - SAFE.bottom;
    const areaAlt = (st.legendas ? base - 260 : base) - topo;
    ctx.save(); ctx.globalAlpha = saida;
    const zoom = 1 + .025 * (local / d); ctx.translate(W / 2, H / 2); ctx.scale(zoom, zoom); ctx.translate(-W / 2, -H / 2);
    const txt = c.texto_tela || "";
    if (c.tipo === "gancho") {
      const b = ajustar(ctx, txt, larg, areaAlt * .7, 130, 64, 800, 1.08);
      const h = b.l.length * b.s * b.lh; bloco(ctx, b, x, topo + (areaAlt - h) / 2 - 40, T.fg, T.acc, "left", local / .9);
      ctx.globalAlpha = saida * entrada; ctx.fillStyle = T.acc; ctx.fillRect(x, topo + (areaAlt + h) / 2, 160 * entrada, 12);
    } else if (c.tipo === "dado") {
      const [num, ...resto] = txt.split("\n"); const bN = ajustar(ctx, num, larg, areaAlt * .42, 230, 90, 800, 1.0);
      const bR = ajustar(ctx, resto.join(" ") || "", larg, areaAlt * .35, 70, 38, 700);
      const hT = bN.l.length * bN.s + 50 + bR.l.length * bR.s * bR.lh; let y = topo + (areaAlt - hT) / 2;
      ctx.save(); const sc = .7 + .3 * ease(local / .5); ctx.translate(x, y); ctx.scale(sc, sc); ctx.globalAlpha = saida * entrada; bloco(ctx, bN, 0, 0, T.acc, T.fg, "left", 1, false); ctx.restore();
      y += bN.l.length * bN.s + 50; bloco(ctx, bR, x, y, T.fg, T.acc, "left", (local - .35) / .8);
    } else if (c.tipo === "lista") {
      const itens = txt.split("\n").filter(Boolean); const passo = Math.max(.5, (d - 1) / Math.max(1, itens.length));
      const tam = Math.min(68, Math.floor(areaAlt / (itens.length * 2.4)));
      let y = topo + 40;
      itens.forEach((it, k) => {
        const p = ease((local - .3 - k * passo) / .4); if (p <= 0) return;
        const b = ajustar(ctx, it.replace(/^[•\-]\s*/, ""), larg - 90, areaAlt / itens.length - 30, tam, 34, 700, 1.15);
        ctx.save(); ctx.globalAlpha = saida * p; ctx.translate((1 - p) * -60, 0);
        ctx.fillStyle = T.acc; ctx.beginPath(); ctx.arc(x + 22, y + b.s * .6, 18, 0, Math.PI * 2); ctx.fill();
        const yy = bloco(ctx, b, x + 70, y, T.fg, T.acc, "left", 1, false); ctx.restore();
        y = yy + 46;
      });
    } else if (c.tipo === "alerta") {
      pill(ctx, "⚠ ATENÇÃO", x, topo + 20, T.acc, T.bg);
      const b = ajustar(ctx, txt, larg, areaAlt - 180, 92, 44, 800, 1.12); const h = b.l.length * b.s * b.lh;
      bloco(ctx, b, x, topo + 140 + Math.max(0, (areaAlt - 180 - h) / 2), T.fg, T.acc, "left", local / .8);
    } else if (c.tipo === "cta") {
      const b = ajustar(ctx, txt || "Salva esse vídeo 💾", larg, areaAlt * .5, 110, 52, 800, 1.1); const h = b.l.length * b.s * b.lh;
      const y0 = topo + (areaAlt - h) / 2 - 80; bloco(ctx, b, W / 2 - 30, y0, T.fg, T.acc, "center", local / .7);
      ctx.globalAlpha = saida * ease((local - .6) / .4); ctx.font = `700 52px ${FONTE}`; ctx.fillStyle = T.acc; ctx.textAlign = "center"; ctx.fillText(st.perfil || "", W / 2 - 30, y0 + h + 70); ctx.textAlign = "left";
    } else if (c.tipo === "referencia") {
      pill(ctx, "📚 FONTE", x, topo + 20, "rgba(255,255,255,.18)", T.fg);
      const b = ajustar(ctx, txt, larg, areaAlt - 200, 60, 30, 600, 1.3); bloco(ctx, b, x, topo + 150, T.sub, T.acc, "left", local / .7);
    } else {
      const b = ajustar(ctx, txt, larg, areaAlt * .75, 100, 46, 800, 1.12); const h = b.l.length * b.s * b.lh;
      bloco(ctx, b, x, topo + (areaAlt - h) / 2, T.fg, T.acc, "left", local / .8);
    }
    ctx.restore();
    // legenda (o que é falado)
    if (st.legendas && c.fala) {
      const bl = blocosLegenda(c, d).find(b => local >= b.ini && local < b.fim) || null;
      if (bl) {
        ctx.font = `800 54px ${FONTE}`; const linhas = quebrar(ctx, bl.txt, larg + 40); const hh = linhas.length * 66 + 40; const yb = base - 40 - hh;
        let mw = 0; linhas.forEach(l => { mw = Math.max(mw, ctx.measureText(l).width); });
        ctx.fillStyle = "rgba(0,0,0,.55)"; ctx.beginPath(); ctx.roundRect(W / 2 - 30 - mw / 2 - 30, yb, mw + 60, hh, 22); ctx.fill();
        ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.textBaseline = "top"; linhas.forEach((l, k) => ctx.fillText(l, W / 2 - 30, yb + 22 + k * 66)); ctx.textAlign = "left";
      }
    }
    // barra de progresso e assinatura
    const tt = total(); ctx.fillStyle = "rgba(255,255,255,.25)"; ctx.fillRect(0, 0, W, 10); ctx.fillStyle = T.acc; ctx.fillRect(0, 0, W * Math.min(1, t / tt), 10);
    ctx.globalAlpha = .85; ctx.fillStyle = T.sub; ctx.font = `700 34px ${FONTE}`; ctx.textBaseline = "middle"; ctx.fillText(st.perfil || "", SAFE.left, 170); ctx.globalAlpha = 1;
  }

  // ---------------------------------------------------------------- roteiro sem IA (modelos naturais)
  const um = a => a[Math.floor(Math.random() * a.length)];
  const curto = (s, n = 10) => { const w = String(s || "").replace(/\s*\([^)]*\)/g, "").split(/\s+/); return w.slice(0, n).join(" ") + (w.length > n ? "…" : ""); };
  function roteiroArtigo(art, ext) {
    const autor = (art.autores[0] || "").split(" ")[0];
    const ref = `${autor}${art.autores.length > 1 ? " et al." : ""}, ${art.revista}, ${art.ano}`;
    if (!ext) return [
      { tipo: "gancho", fala: "Separei um estudo que vale a pena você conhecer… e já te conto se ele muda alguma coisa na prática.", texto_tela: "Esse estudo *muda* sua prática?" },
      { tipo: "fala", fala: "Escreva aqui, com suas palavras, o que os pesquisadores fizeram: quem participou e o que foi comparado.", texto_tela: "O que eles fizeram" },
      { tipo: "dado", fala: "E o principal resultado foi… (complete com o achado principal).", texto_tela: "Resultado\nprincipal" },
      { tipo: "fala", fala: "Na prática, isso quer dizer… (sua mensagem para o paciente ou para o colega).", texto_tela: "Na *prática*" },
      { tipo: "cta", fala: "Salva esse vídeo pra consultar depois e manda pra quem precisa ver isso.", texto_tela: "Salva e *compartilha* 💾" },
      { tipo: "referencia", fala: "", texto_tela: ref + "\nPMID " + art.pmid, dur: 2.5 }];
    const r0 = ext.resultados?.[0] || {};
    const relevancia = { sim: "E não é só diferença no papel: é uma melhora que o paciente sente.", "não": "Mas olha o detalhe: essa diferença é pequena… talvez o paciente nem perceba.", incerto: "Agora, calma: ainda não dá pra cravar que essa diferença muda a vida do paciente." }[r0.clinicamente_importante] || "";
    return [
      { tipo: "gancho", fala: um([`Será que ${curto(ext.intervencao, 7).toLowerCase()} funciona mesmo? Um estudo foi atrás dessa resposta.`, `Se você atende ${curto(ext.populacao, 6).toLowerCase()}, presta atenção nesse estudo.`, `Tem um estudo novo que mexe direto com a forma de tratar ${curto(ext.populacao, 5).toLowerCase()}.`]), texto_tela: "Isso *funciona* mesmo?" },
      { tipo: "fala", fala: `Eles acompanharam ${ext.n_participantes} pessoas: ${curto(ext.populacao, 12).toLowerCase()}. Uma parte fez ${curto(ext.intervencao, 10).toLowerCase()}… a outra, ${curto(ext.comparador, 8).toLowerCase()}.`, texto_tela: `${ext.n_participantes} pacientes\n*${curto(ext.intervencao, 5)}*` },
      { tipo: "dado", fala: `O resultado? ${curto(r0.resultado, 12)} em ${curto(r0.desfecho, 6).toLowerCase()}, depois de ${curto(r0.momento, 5)}.`, texto_tela: `${curto(r0.resultado, 4)}\n${curto(r0.desfecho, 6)}` },
      ...(relevancia ? [{ tipo: "fala", fala: relevancia, texto_tela: r0.clinicamente_importante === "sim" ? "Diferença *real*" : "Diferença *pequena*?" }] : []),
      { tipo: "fala", fala: `Então, na prática: ${ext.mensagem_para_pratica}`, texto_tela: "Na *prática*" },
      ...(ext.cuidado_ao_interpretar?.[0] ? [{ tipo: "alerta", fala: `Só um porém… ${ext.cuidado_ao_interpretar[0]}`, texto_tela: curto(ext.cuidado_ao_interpretar[0], 9) }] : []),
      { tipo: "cta", fala: um(["Salva esse vídeo pra consultar depois… e manda pra aquele colega que precisa ver isso.", "Se isso te ajudou, salva e compartilha com quem atende esse tipo de paciente."]), texto_tela: "Salva e *compartilha* 💾" },
      { tipo: "referencia", fala: "", texto_tela: ref + "\nPMID " + art.pmid, dur: 2.5 }];
  }
  function roteiroCondicao(c) {
    const pac = st.publico === "pac"; const nome = c.nome.replace(/ — ENCAMINHAR$/, "").replace(/\s*\(.*\)$/, "");
    return [
      { tipo: "gancho", fala: pac ? `Você sente ${nome.toLowerCase()}? Então presta atenção nessas três coisas.` : `Três coisas que todo fisio precisa saber sobre ${nome.toLowerCase()}.`, texto_tela: `${nome}:\n3 coisas que *importam*` },
      { tipo: "fala", fala: `Primeiro: o que é. ${c.resumo.split(". ")[0]}.`, texto_tela: "1. O que *é*" },
      { tipo: "fala", fala: `Segundo: o prognóstico. ${c.prognostico.texto.split(". ")[0]}.`, texto_tela: "2. Quanto tempo *leva*" },
      { tipo: "lista", fala: `E terceiro: o que realmente ajuda. ${c.conduta.proliferativa.slice(0, 2).join(". ")}.`, texto_tela: c.conduta.proliferativa.slice(0, 3).map(x => "• " + curto(x, 7)).join("\n") },
      { tipo: "alerta", fala: `Agora, atenção: procure avaliação se tiver ${(c.encaminhar[0] || "piora progressiva ou sintomas neurológicos").toLowerCase()}.`, texto_tela: curto(c.encaminhar[0] || "Piora progressiva", 9) },
      { tipo: "cta", fala: "Salva esse vídeo e manda pra quem precisa ver isso.", texto_tela: "Salva e *compartilha* 💾" },
      { tipo: "referencia", fala: "", texto_tela: c.evidencia.slice(0, 2).map(e => e.ref).join("\n"), dur: 3 }];
  }

  async function roteiroIA(fonteTexto) {
    const S = p => ({ type: "object", properties: p, required: Object.keys(p), additionalProperties: false });
    const s = { type: "string" };
    const r = await window.IA.chamar({ effort: "high", schema: S({
      titulo: s, cenas: { type: "array", items: S({ tipo: { type: "string", enum: TIPOS.map(t => t[0]) }, fala: s, texto_tela: s }) },
      legenda: s, hashtags: { type: "array", items: s }, dicas_gravacao: { type: "array", items: s } }),
      prompt: `Escreva o roteiro de um Reels de cerca de ${st.alvo} segundos (aprox. ${Math.round(st.alvo * RITMOS[st.ritmo])} palavras faladas no total) para ${st.publico === "pac" ? "pacientes e público leigo" : "fisioterapeutas e estudantes"}, explicando o conteúdo abaixo.

Como deve soar (MUITO importante): como alguém conversando com um colega no corredor da clínica, não como texto lido.
- Frases curtas (até ~15 palavras), uma ideia por cena. Ritmo variado: algumas frases bem curtas.
- Linguagem oral brasileira natural: "pra", "tá", "olha só", "sabe aquele paciente que…", perguntas retóricas pontuais. Use "…" para marcar pausas naturais.
- Explique o porquê, com um exemplo concreto do dia a dia${st.publico === "pac" ? " do paciente" : " do consultório"}.
- Números escritos do jeito que se fala, no máximo 2 números no vídeo inteiro, sempre com contexto ("quase dois pontos a menos de dor numa escala de zero a dez").
- Proibido: "Olá pessoal", "Neste vídeo vamos falar", "Em conclusão", ler listas de siglas, jargão empilhado, tom de propaganda, promessas de cura, exagerar o efeito além do que o estudo mostra.
Estrutura: 1ª cena "gancho" que prende em até 3 segundos (curiosidade, contradição ou pergunta); depois contexto do estudo; o achado principal (cena "dado"); se é relevante na prática; uma limitação honesta (cena "alerta"); a mensagem prática; cena "cta" com chamada natural (salvar/compartilhar/comentar); última cena "referencia" com fala VAZIA e texto_tela com autor et al., revista, ano.
"texto_tela": no máximo 8 palavras, complementa a fala (não repete tudo), pode marcar UMA palavra-chave com *asteriscos*. Para cenas "dado", primeira linha = o número/achado curto, segunda linha = o que ele significa. Para "lista", itens separados por quebra de linha começando com "• ".
Escreva tudo com suas próprias palavras; não copie frases do artigo.
"legenda": até 1.200 caracteres, natural, com a referência e o aviso "Conteúdo educativo; não substitui avaliação individual". "hashtags": 8 a 12, sem #, minúsculas, sem acento. "dicas_gravacao": 3 a 5 dicas específicas deste roteiro (onde enfatizar, onde pausar, expressão).

${fonteTexto}` });
    return r;
  }

  // ---------------------------------------------------------------- tela
  function viewReels(pmidInicial) {
    const salvos = Object.values(window.ARTIGOS.bib());
    app.innerHTML = `<h1>🎬 Reels a partir de artigos</h1>
      <p class="muted">Gera um roteiro natural para você falar, monta o vídeo animado (9:16) com textos e legendas, e exporta para você colocar a sua voz por cima — ou grave a voz aqui mesmo, lendo o teleprompter.</p>
      <div class="grid-2" style="align-items:start">
        <div>
          <div class="card" id="rFonte"><h3>1. Conteúdo e roteiro</h3><div class="form-grid">
            <div><label>Origem</label><select id="rOrigem"><option value="artigo">Artigo (PMID ou biblioteca)</option><option value="cond">Condição do sistema</option><option value="livre">Roteiro em branco</option></select></div>
            <div><label>Público</label><select id="rPublico"><option value="fisio" ${st.publico === "fisio" ? "selected" : ""}>Fisioterapeutas/estudantes</option><option value="pac" ${st.publico === "pac" ? "selected" : ""}>Pacientes/público geral</option></select></div>
            <div><label>Duração alvo</label><select id="rAlvo">${[30, 45, 60, 90].map(s => `<option value="${s}" ${+st.alvo === s ? "selected" : ""}>${s} s</option>`).join("")}</select></div>
            <div><label>Seu ritmo de fala</label><select id="rRitmo">${[["lento", "Calmo"], ["normal", "Normal"], ["rapido", "Rápido"]].map(([k, l]) => `<option value="${k}" ${st.ritmo === k ? "selected" : ""}>${l}</option>`).join("")}</select></div></div>
            <div id="rOrigArt"><label>Artigo</label><select id="rBib"><option value="">— escolher da biblioteca —</option>${salvos.map(a => `<option value="${a.pmid}">${esc((a.ext?.titulo_pt || a.titulo).slice(0, 90))}</option>`).join("")}</select>
              <label>ou PMID</label><input type="text" id="rPmid" value="${esc(pmidInicial || "")}" placeholder="ex.: 42784051"></div>
            <div id="rOrigCond" hidden><label>Condição</label><select id="rCond">${CONDICOES.map(c => `<option value="${c.id}">${esc(c.nome)}</option>`).join("")}</select></div>
            <div class="row" style="margin-top:10px"><button class="btn" id="rGerar">${window.IA.temIA() ? "✨ Gerar roteiro com IA" : "Gerar roteiro (modelo)"}</button>${window.IA.temIA() ? `<button class="btn sec" id="rGerarSem">Gerar sem IA</button>` : ""}</div>
            <div id="rMsg"></div></div>
          <div class="card"><h3>2. Cenas (fala + texto na tela)</h3><p class="muted">Edite à vontade. Use <code>*palavra*</code> para destacar no vídeo e "…" para pausas. A duração é calculada pelo seu ritmo de fala — ou defina manualmente.</p>
            <div id="rCenas"></div><button class="btn sec peq" id="rAdd">+ Cena</button></div>
          <div class="card" id="rVisual"><h3>3. Visual</h3><div class="form-grid">
            <div><label>Tema</label><select id="rTema">${Object.entries(TEMAS).map(([k, v]) => `<option value="${k}" ${k === st.tema ? "selected" : ""}>${v.nome}</option>`).join("")}</select></div>
            <div><label>Seu @</label><input type="text" id="rPerfil" value="${esc(st.perfil)}"></div></div>
            <label class="check"><input type="checkbox" id="rLeg" ${st.legendas ? "checked" : ""}> Legendas na tela com o texto falado (recomendado: ~85% assiste sem som)</label></div>
          <div class="card"><h3>4. Legenda do post</h3><textarea id="rLegenda" style="min-height:140px">${esc(st.legenda)}</textarea>
            <label>Hashtags</label><input type="text" id="rTags" value="${esc(st.hashtags.join(" "))}"><div class="row" style="margin-top:8px"><button class="btn sec" id="rCopiar">Copiar legenda</button></div></div>
        </div>
        <div style="position:sticky;top:70px">
          <div class="card"><div class="row" style="justify-content:space-between"><h3 style="margin:0">Prévia 9:16</h3><span class="tag" id="rDur"></span></div>
            <canvas id="rCanvas" width="${W}" height="${H}" style="width:100%;max-width:340px;display:block;margin:10px auto;border-radius:12px;box-shadow:var(--shadow)"></canvas>
            <input type="range" id="rSeek" min="0" max="1000" value="0" style="width:100%">
            <div class="row" style="justify-content:center"><button class="btn" id="rPlay">▶ Reproduzir</button><button class="btn sec" id="rTele">🎙 Teleprompter / gravar voz</button></div></div>
          <div class="card"><h3>5. Exportar</h3>
            <div class="row"><button class="btn" id="rExport">⬇ Exportar vídeo</button><label class="check"><input type="checkbox" id="rComVoz" ${audioBlob ? "checked" : ""} ${audioBlob ? "" : "disabled"}> Incluir voz gravada</label></div>
            <div class="row" style="margin-top:6px"><button class="btn sec peq" id="rSrt">Legendas (.srt)</button><button class="btn sec peq" id="rTxt">Roteiro com tempos (.txt)</button><button class="btn sec peq" id="rCapa">Capa (.png)</button>
              <label class="btn sec peq" style="cursor:pointer">🎵 Importar áudio<input type="file" id="rAudio" accept="audio/*" hidden></label></div>
            <div id="rExpMsg"></div>
            <p class="muted" style="font-size:.82rem">O vídeo é gravado em tempo real (leva a duração do Reels). Mantenha esta aba visível. Sai em MP4 quando o navegador permite (Chrome/Edge recentes); se sair em WebM, converta no CapCut ou em <i>cloudconvert</i>. No CapCut/InShot, importe o vídeo e coloque sua voz — os tempos das cenas seguem o roteiro.</p></div>
          ${st.dicas.length ? `<div class="card"><h3>🎙 Dicas para gravar</h3>${FR.lista(st.dicas)}</div>` : ""}
        </div>
      </div>
      <div id="rTeleBox" class="tele" hidden></div>`;

    const canvas = $("#rCanvas"), ctx = canvas.getContext("2d");
    let t = 0, tocando = false, raf = 0, inicio = 0;
    const desenhar = () => { quadro(ctx, t); $("#rSeek").value = Math.round(1000 * t / Math.max(.1, total())); };
    const atualizaDur = () => { const d = total(); $("#rDur").textContent = `${d.toFixed(1)} s · ${st.cenas.length} cenas`; $("#rDur").className = "tag " + (d > 90 ? "bad" : Math.abs(d - st.alvo) <= 8 ? "ok" : "warn"); };
    const loop = () => { t = (performance.now() - inicio) / 1000; if (t >= total()) { t = total(); parar(); } desenhar(); if (tocando) raf = requestAnimationFrame(loop); };
    const tocar = () => { if (!st.cenas.length) return; if (t >= total()) t = 0; inicio = performance.now() - t * 1000; tocando = true; $("#rPlay").textContent = "⏸ Pausar"; loop(); };
    function parar() { tocando = false; cancelAnimationFrame(raf); const b = $("#rPlay"); if (b) b.textContent = "▶ Reproduzir"; }
    $("#rPlay").addEventListener("click", () => tocando ? parar() : tocar());
    $("#rSeek").addEventListener("input", e => { parar(); t = total() * e.target.value / 1000; desenhar(); });

    const origem = () => $("#rOrigem").value;
    const trocaOrigem = () => { $("#rOrigArt").hidden = origem() !== "artigo"; $("#rOrigCond").hidden = origem() !== "cond"; };
    $("#rOrigem").addEventListener("change", trocaOrigem); trocaOrigem();
    $("#rBib").addEventListener("change", e => { if (e.target.value) $("#rPmid").value = e.target.value; });
    $("#rFonte").addEventListener("change", e => { if (["rPublico", "rAlvo", "rRitmo"].includes(e.target.id)) { st.publico = $("#rPublico").value; st.alvo = +$("#rAlvo").value; st.ritmo = $("#rRitmo").value; salvar(); editores(); atualizaDur(); desenhar(); } });

    async function gerar(usarIA) {
      const msg = $("#rMsg"); parar();
      try {
        msg.innerHTML = `<div class="info">${usarIA ? "Escrevendo o roteiro… (até 1 minuto)" : "Montando o roteiro…"}</div>`;
        if (origem() === "livre") { st.cenas = [{ tipo: "gancho", fala: "Comece com uma pergunta ou uma contradição que prenda a atenção.", texto_tela: "Seu *gancho* aqui" }, { tipo: "fala", fala: "Explique uma ideia por cena, com frases curtas.", texto_tela: "Uma ideia por cena" }, { tipo: "cta", fala: "Salva esse vídeo e manda pra quem precisa ver.", texto_tela: "Salva e *compartilha* 💾" }]; st.dicas = []; }
        else if (origem() === "cond") {
          const c = CONDICOES.find(x => x.id === $("#rCond").value);
          if (usarIA) { const r = await roteiroIA(`<artigo>\nCONTEÚDO (base do sistema, baseado em diretrizes):\n${JSON.stringify({ nome: c.nome, resumo: c.resumo, prognostico: c.prognostico, conduta: c.conduta, encaminhar: c.encaminhar, evidencias: c.evidencia })}\n</artigo>`); aplicar(r); }
          else { st.cenas = roteiroCondicao(c); st.dicas = []; st.legenda = `${c.nome}: o que é, quanto tempo leva e o que ajuda.\n\n📚 ${c.evidencia[0]?.ref || ""}\n\nConteúdo educativo; não substitui avaliação individual.`; st.hashtags = ["fisioterapia", "fisioterapiabaseadaemevidencias", "reabilitacao"]; }
        } else {
          const p = $("#rPmid").value.trim(); if (!/^\d+$/.test(p)) { msg.innerHTML = `<div class="aviso">Informe um PMID ou escolha um artigo da biblioteca.</div>`; return; }
          const A = window.ARTIGOS; let art = A.cacheGet(p, "meta"); if (!art) { art = await A.efetch(p); }
          const ext = A.cacheGet(p, "ext");
          if (usarIA) { const r = await roteiroIA((ext ? "DADOS EXTRAÍDOS: " + JSON.stringify(ext) + "\n\n" : "") + A.textoParaIA(art, A.cacheGet(p, "full"))); aplicar(r); }
          else {
            st.cenas = roteiroArtigo(art, ext); st.dicas = [];
            st.legenda = ext ? `${ext.titulo_pt}\n\n${ext.mensagem_para_pratica}\n\n📚 ${art.autores[0] || ""} et al. ${art.revista}, ${art.ano}. PMID ${p}\n\nConteúdo educativo; não substitui avaliação individual.` : "";
            st.hashtags = ["fisioterapia", "fisioterapiabaseadaemevidencias", "ciencia"];
            if (!ext) { msg.innerHTML = `<div class="aviso">Este artigo ainda não foi extraído — o roteiro veio com lacunas para você completar. Faça a extração na página do artigo (aba "Extrair") ou use a IA.</div>`; fim(); return; }
          }
        }
        msg.innerHTML = ""; fim();
      } catch (e) { msg.innerHTML = `<div class="alerta">${esc(e.message)}</div>`; }
      function fim() { salvar(); viewReels(origem() === "artigo" ? $("#rPmid").value.trim() : ""); }
    }
    function aplicar(r) { st.cenas = r.cenas.map(c => ({ ...c, dur: c.tipo === "referencia" ? 2.5 : 0 })); st.legenda = r.legenda; st.hashtags = r.hashtags.map(h => h.replace(/^#/, "")); st.dicas = r.dicas_gravacao; st.titulo = r.titulo; }
    $("#rGerar").addEventListener("click", () => gerar(window.IA.temIA()));
    $("#rGerarSem")?.addEventListener("click", () => gerar(false));

    function editores() {
      let acc = 0;
      $("#rCenas").innerHTML = st.cenas.map((c, i) => { const ini = acc; acc += dur(c); return `<details ${i < 2 ? "open" : ""} data-c="${i}"><summary>${i + 1}. ${esc(TIPOS.find(x => x[0] === c.tipo)?.[1] || c.tipo)} <small class="muted">· ${ini.toFixed(1)}–${acc.toFixed(1)} s</small></summary>
        <div class="form-grid"><div><label>Tipo de cena</label><select data-f="tipo">${TIPOS.map(([k, l]) => `<option value="${k}" ${k === c.tipo ? "selected" : ""}>${l}</option>`).join("")}</select></div>
          <div><label>Duração (s) — 0 = automática (${duracaoAuto(c)} s)</label><input type="number" step="0.1" min="0" data-f="dur" value="${c.dur || 0}"></div></div>
        <label>🎙 Fala (o que você vai dizer)</label><textarea data-f="fala">${esc(c.fala)}</textarea>
        <label>🖼 Texto na tela</label><textarea data-f="texto_tela" style="min-height:50px">${esc(c.texto_tela)}</textarea>
        <div class="row" style="margin-top:6px"><button class="btn sec peq" data-ir="1">▶ Ver cena</button><button class="btn sec peq" data-mv="-1">↑</button><button class="btn sec peq" data-mv="1">↓</button><button class="btn peq perigo" data-del="1">Excluir</button></div></details>`; }).join("") || `<p class="muted">Gere um roteiro acima.</p>`;
    }
    $("#rCenas").addEventListener("input", e => {
      const d = e.target.closest("[data-c]"), f = e.target.dataset.f; if (!d || !f) return;
      const c = st.cenas[+d.dataset.c]; c[f] = f === "dur" ? +e.target.value : e.target.value; salvar(); atualizaDur(); desenhar();
      if (f === "dur" || f === "fala") { const s = d.querySelector("summary small"); let acc = 0; st.cenas.slice(0, +d.dataset.c).forEach(x => { acc += dur(x); }); s.textContent = `· ${acc.toFixed(1)}–${(acc + dur(c)).toFixed(1)} s`; }
    });
    $("#rCenas").addEventListener("change", e => { if (e.target.dataset.f === "tipo") { st.cenas[+e.target.closest("[data-c]").dataset.c].tipo = e.target.value; salvar(); desenhar(); } });
    $("#rCenas").addEventListener("click", e => {
      const d = e.target.closest("[data-c]"); if (!d) return; const i = +d.dataset.c;
      if (e.target.dataset.ir) { parar(); t = st.cenas.slice(0, i).reduce((s, c) => s + dur(c), 0); tocar(); return; }
      if (e.target.dataset.del) st.cenas.splice(i, 1);
      else if (e.target.dataset.mv) { const j = i + +e.target.dataset.mv; if (j < 0 || j >= st.cenas.length) return; [st.cenas[i], st.cenas[j]] = [st.cenas[j], st.cenas[i]]; }
      else return;
      salvar(); editores(); atualizaDur(); desenhar();
    });
    $("#rAdd").addEventListener("click", () => { st.cenas.splice(Math.max(0, st.cenas.length - 1), 0, { tipo: "fala", fala: "Nova fala…", texto_tela: "Novo texto", dur: 0 }); salvar(); editores(); atualizaDur(); });
    $("#rVisual").addEventListener("input", () => { st.tema = $("#rTema").value; st.perfil = $("#rPerfil").value; st.legendas = $("#rLeg").checked; salvar(); desenhar(); });
    $("#rVisual").addEventListener("change", () => { st.tema = $("#rTema").value; st.legendas = $("#rLeg").checked; salvar(); desenhar(); });
    $("#rLegenda").addEventListener("input", e => { st.legenda = e.target.value; salvar(); });
    $("#rTags").addEventListener("input", e => { st.hashtags = e.target.value.split(/[\s,]+/).map(h => h.replace(/^#/, "")).filter(Boolean); salvar(); });
    $("#rCopiar").addEventListener("click", async () => { try { await navigator.clipboard.writeText(st.legenda + "\n\n" + st.hashtags.map(h => "#" + h).join(" ")); $("#rCopiar").textContent = "Copiado ✓"; } catch (e) { $("#rLegenda").select(); } });

    // ------------------------------------------------ exportações de texto
    const tc = s => { const ms = Math.round(s * 1000); const p = (n, l = 2) => String(n).padStart(l, "0"); return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`; };
    const baixar = (nome, blob) => { const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = nome; a.click(); };
    $("#rSrt").addEventListener("click", () => {
      let acc = 0, n = 1, out = "";
      st.cenas.forEach(c => { const d = dur(c); blocosLegenda(c, d).forEach(b => { out += `${n++}\n${tc(acc + b.ini)} --> ${tc(acc + b.fim)}\n${b.txt}\n\n`; }); acc += d; });
      baixar("reels-legendas.srt", new Blob([out], { type: "text/plain" }));
    });
    $("#rTxt").addEventListener("click", () => {
      let acc = 0; const linhas = st.cenas.map((c, i) => { const ini = acc; acc += dur(c); return `[${ini.toFixed(1)}s – ${acc.toFixed(1)}s] CENA ${i + 1} (${c.tipo})\n🎙 ${c.fala || "(sem fala)"}\n🖼 ${String(c.texto_tela).replace(/\*/g, "").replace(/\n/g, " / ")}`; });
      baixar("reels-roteiro.txt", new Blob([`ROTEIRO — ${st.titulo || "Reels"}\nDuração: ${total().toFixed(1)} s\n\n${linhas.join("\n\n")}\n\n${st.dicas.length ? "DICAS PARA GRAVAR:\n" + st.dicas.map(d => "- " + d).join("\n") + "\n\n" : ""}LEGENDA:\n${st.legenda}\n\n${st.hashtags.map(h => "#" + h).join(" ")}`], { type: "text/plain" }));
    });
    $("#rCapa").addEventListener("click", () => { const c = document.createElement("canvas"); c.width = W; c.height = H; quadro(c.getContext("2d"), .9); c.toBlob(b => baixar("reels-capa.png", b), "image/png"); });
    $("#rAudio").addEventListener("change", e => { const f = e.target.files[0]; if (!f) return; audioBlob = f; st.audioNome = f.name; viewReels(pmidInicial); setTimeout(() => ajustarAoAudio(), 50); });

    // ------------------------------------------------ exportação de vídeo
    $("#rExport").addEventListener("click", async () => {
      if (!st.cenas.length) return; parar();
      if (!window.MediaRecorder || !canvas.captureStream) { $("#rExpMsg").innerHTML = `<div class="alerta">Seu navegador não suporta gravação de vídeo. Use Chrome ou Edge no computador.</div>`; return; }
      const tipos = ["video/mp4;codecs=avc1.42E01E,mp4a.40.2", "video/mp4;codecs=avc1", "video/mp4", "video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"];
      const mime = tipos.find(m => MediaRecorder.isTypeSupported(m)) || "";
      const stream = canvas.captureStream(FPS);
      let actx = null, fonteAudio = null;
      if ($("#rComVoz").checked && audioBlob) {
        actx = new AudioContext(); const buf = await actx.decodeAudioData(await audioBlob.arrayBuffer());
        fonteAudio = actx.createBufferSource(); fonteAudio.buffer = buf; const dest = actx.createMediaStreamDestination(); fonteAudio.connect(dest);
        dest.stream.getAudioTracks().forEach(tr => stream.addTrack(tr));
      }
      const rec = new MediaRecorder(stream, { mimeType: mime || undefined, videoBitsPerSecond: 8_000_000 });
      const partes = []; rec.ondataavailable = e => { if (e.data.size) partes.push(e.data); };
      const fim = new Promise(r => { rec.onstop = r; });
      const btn = $("#rExport"); btn.disabled = true;
      rec.start(250); if (fonteAudio) fonteAudio.start();
      const T0 = performance.now(), dt = total();
      await new Promise(res => {
        const passo = () => {
          t = (performance.now() - T0) / 1000;
          quadro(ctx, Math.min(t, dt)); $("#rExpMsg").innerHTML = `<div class="info">Gravando vídeo… ${Math.min(100, Math.round(100 * t / dt))}% — mantenha esta aba aberta e visível.</div>`;
          if (t >= dt + .3) return res(); requestAnimationFrame(passo);
        }; passo();
      });
      rec.stop(); await fim; if (actx) actx.close(); btn.disabled = false;
      const ext = (rec.mimeType || mime).includes("mp4") ? "mp4" : "webm";
      baixar(`reels.${ext}`, new Blob(partes, { type: rec.mimeType || mime }));
      $("#rExpMsg").innerHTML = `<div class="sucesso">Vídeo exportado (${ext.toUpperCase()}, ${dt.toFixed(1)} s, 1080×1920).${ext === "webm" ? " Converta para MP4 antes de postar, se o Instagram recusar." : ""}</div>`;
    });

    // ------------------------------------------------ teleprompter + gravação de voz
    function ajustarAoAudio() {
      if (!audioBlob) return;
      const a = new Audio(URL.createObjectURL(audioBlob));
      a.addEventListener("loadedmetadata", () => {
        const dA = a.duration; if (!isFinite(dA) || !dA) return;
        const atual = total(); if (Math.abs(dA - atual) < .3) return;
        if (confirm(`O áudio tem ${dA.toFixed(1)} s e o vídeo ${atual.toFixed(1)} s. Ajustar a duração das cenas proporcionalmente ao áudio?`)) {
          const f = dA / atual; st.cenas.forEach(c => { c.dur = +(dur(c) * f).toFixed(2); }); salvar(); viewReels(pmidInicial);
        }
      });
    }
    $("#rTele").addEventListener("click", () => {
      parar(); const box = $("#rTeleBox"); box.hidden = false;
      box.innerHTML = `<div class="tele-in"><div class="row" style="justify-content:space-between"><b>🎙 Teleprompter</b><button class="btn sec peq" id="tFechar">Fechar</button></div>
        <p class="muted">Leia no ritmo das cenas. A cena atual fica em destaque e o vídeo roda junto. Use fone de ouvido para não captar ruído.</p>
        <div id="tTexto" class="tele-texto">${st.cenas.map((c, i) => `<p data-ti="${i}">${esc((c.fala || "").replace(/\*/g, "")) || "<i>(sem fala)</i>"}</p>`).join("")}</div>
        <div class="row"><button class="btn" id="tEnsaiar">▶ Ensaiar (sem gravar)</button><button class="btn perigo" id="tGravar">⏺ Gravar voz</button><span id="tStatus" class="muted"></span></div>
        <div id="tOut"></div></div>`;
      let rodando = false, rec = null, t0 = 0, rafT = 0;
      const marcar = tt => { const { i } = cenaEm(tt); $$("#tTexto p", box).forEach((p, k) => { p.classList.toggle("ativa", k === i); }); const at = $(`#tTexto p[data-ti="${i}"]`, box); if (at) at.scrollIntoView({ block: "center", behavior: "smooth" }); };
      const rodar = (comGravacao) => {
        rodando = true; t0 = performance.now() + 3000; let ultima = -1;
        const passo = () => {
          const tt = (performance.now() - t0) / 1000;
          if (tt < 0) { $("#tStatus", box).textContent = `Começando em ${Math.ceil(-tt)}…`; }
          else {
            if (comGravacao && rec && rec.state === "inactive") rec.start();
            $("#tStatus", box).textContent = `${comGravacao ? "⏺ Gravando" : "Ensaio"} · ${tt.toFixed(1)} / ${total().toFixed(1)} s`;
            const { i } = cenaEm(tt); if (i !== ultima) { ultima = i; marcar(tt); }
            t = Math.min(tt, total()); quadro(ctx, t);
            if (tt >= total() + .5) { encerrar(); return; }
          }
          if (rodando) rafT = requestAnimationFrame(passo);
        }; passo();
      };
      const encerrar = () => { rodando = false; cancelAnimationFrame(rafT); if (rec && rec.state === "recording") rec.stop(); else $("#tStatus", box).textContent = "Fim."; };
      $("#tEnsaiar", box).addEventListener("click", () => { if (rodando) encerrar(); else rodar(false); });
      $("#tGravar", box).addEventListener("click", async () => {
        if (rodando) { encerrar(); return; }
        try {
          const mic = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
          const partes = []; rec = new MediaRecorder(mic); rec.ondataavailable = e => { if (e.data.size) partes.push(e.data); };
          rec.onstop = () => {
            mic.getTracks().forEach(tr => tr.stop()); audioBlob = new Blob(partes, { type: rec.mimeType }); st.audioNome = "voz gravada";
            $("#tStatus", box).textContent = "Gravação concluída.";
            $("#tOut", box).innerHTML = `<audio controls src="${URL.createObjectURL(audioBlob)}" style="width:100%"></audio>
              <div class="row"><button class="btn" id="tUsar">Usar esta voz no vídeo</button><button class="btn sec" id="tBaixarVoz">Baixar áudio</button></div>`;
            $("#tUsar", box).addEventListener("click", () => { box.hidden = true; viewReels(pmidInicial); setTimeout(ajustarAoAudio, 50); });
            $("#tBaixarVoz", box).addEventListener("click", () => baixar("voz-reels." + (audioBlob.type.includes("mp4") ? "m4a" : "webm"), audioBlob));
          };
          rodar(true);
        } catch (e) { $("#tOut", box).innerHTML = `<div class="alerta">Não foi possível acessar o microfone: ${esc(e.message)}</div>`; }
      });
      $("#tFechar", box).addEventListener("click", () => { encerrar(); box.hidden = true; });
    });

    editores(); atualizaDur();
    (document.fonts ? document.fonts.load(`800 40px Montserrat`).catch(() => {}) : Promise.resolve()).then(desenhar);
    if (audioBlob) $("#rExpMsg").innerHTML = `<div class="sucesso">🎵 Áudio carregado: ${esc(st.audioNome || "voz")}. Marque "Incluir voz gravada" para exportar com som.</div>`;
  }

  rotas.reels = viewReels;
})();
