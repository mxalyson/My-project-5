/* Reels: editor de vídeo no navegador — roteiro falado, linha do tempo, voz por cena (regravável),
   fundos com foto/vídeo próprios, trilha musical com abaixamento automático, legendas e exportação. */
(function () {
  "use strict";
  const { $, $$, esc, store, app, rotas } = window.FR;
  const MK = window.MARCA;
  const W = 1080, H = 1920, FPS = 30;
  const FONTE = '"Montserrat", system-ui, -apple-system, "Segoe UI", sans-serif';
  // Zona segura: a interface do Instagram cobre o topo, a base e a lateral direita.
  const SAFE = { top: 270, bottom: 420, left: 90, right: 150 };
  const TEMAS = {
    marca: MK.TEMA,
    clinico: { nome: "Clínico azul", bg: "#0b2f5c", bg2: "#1e6fd9", fg: "#ffffff", acc: "#7fd1ff", sub: "#cfe3ff" },
    escuro: { nome: "Escuro + coral", bg: "#101218", bg2: "#262a35", fg: "#f5f5f7", acc: "#ff7a59", sub: "#b9bfcc" },
    lilas: { nome: "Lilás", bg: "#2e2157", bg2: "#6b4fc4", fg: "#ffffff", acc: "#ffd166", sub: "#e3dcff" },
    claro: { nome: "Claro", bg: "#f4f7fb", bg2: "#dde8f7", fg: "#14213d", acc: "#1e6fd9", sub: "#4a5a75" }
  };
  const TIPOS = [["gancho", "Gancho (abertura)"], ["fala", "Explicação"], ["dado", "Número/achado"], ["lista", "Lista"], ["alerta", "Cuidado/limitação"], ["cta", "Chamada final"], ["referencia", "Referência"]];
  const RITMOS = { lento: 2.2, normal: 2.6, rapido: 3.0 }; // palavras por segundo em PT-BR

  const padrao = () => ({ tema: "marca", perfil: MK.get().perfil, ritmo: "normal", legendas: true, alvo: 45, publico: "fisio", titulo: "", cenas: [], legenda: "", hashtags: [], dicas: [],
    volVoz: 1, volMusica: .3, duck: true, musicaId: "", musicaNome: "", vozId: "", vozNome: "", usarVozCompleta: false });
  let st = Object.assign(padrao(), store.get("reels_estado", {}));
  if (!TEMAS[st.tema]) st.tema = "marca";
  const salvar = () => store.set("reels_estado", st);

  // ---------------------------------------------------------------- mídia (IndexedDB: áudios, fotos e vídeos ficam no aparelho)
  const IDB = (() => {
    let dbp = null;
    const db = () => dbp || (dbp = new Promise((res, rej) => { const r = indexedDB.open("fisio_midia", 1); r.onupgradeneeded = () => r.result.createObjectStore("m"); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }));
    const tx = (modo, fn) => db().then(d => new Promise((res, rej) => { const t = d.transaction("m", modo); const q = fn(t.objectStore("m")); t.oncomplete = () => res(q && q.result); t.onerror = () => rej(t.error); }));
    return { put: (k, v) => tx("readwrite", s => s.put(v, k)), get: k => tx("readonly", s => s.get(k)), del: k => tx("readwrite", s => s.delete(k)) };
  })();
  const MID = {}; // id -> { blob, url, el, buf, dur }
  const novoId = p => p + "_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  async function guardar(blob, prefixo) { const id = novoId(prefixo); await IDB.put(id, blob); await carregar(id); return id; }
  async function carregar(id) {
    if (!id) return null; if (MID[id]) return MID[id];
    const blob = await IDB.get(id); if (!blob) return null;
    const m = { blob, url: URL.createObjectURL(blob) }; MID[id] = m;
    if (blob.type.startsWith("image/")) { m.el = new Image(); m.el.src = m.url; await m.el.decode().catch(() => {}); }
    else if (blob.type.startsWith("video/")) { const v = document.createElement("video"); v.src = m.url; v.muted = true; v.playsInline = true; v.loop = true; v.preload = "auto"; m.el = v; await new Promise(r => { v.onloadeddata = r; v.onerror = r; setTimeout(r, 4000); }); }
    else { try { m.buf = await ac().decodeAudioData(await blob.arrayBuffer()); m.dur = m.buf.duration; } catch (e) { m.dur = 0; } }
    return m;
  }
  async function apagar(id) { if (!id) return; if (MID[id]) { URL.revokeObjectURL(MID[id].url); delete MID[id]; } await IDB.del(id).catch(() => {}); }
  const carregarTudo = () => Promise.all([st.musicaId, st.vozId, ...st.cenas.flatMap(c => [c.audioId, c.midiaId])].filter(Boolean).map(carregar));

  // ---------------------------------------------------------------- tempo
  const palavras = s => (String(s || "").trim().match(/\S+/g) || []).length;
  const duracaoAuto = c => Math.max(2.2, +(palavras(c.fala) / RITMOS[st.ritmo] + 0.5).toFixed(1));
  const dur = c => c.dur && c.dur > 0 ? c.dur : duracaoAuto(c);
  const total = () => st.cenas.reduce((s, c) => s + dur(c), 0);
  const inicioCena = i => st.cenas.slice(0, i).reduce((s, c) => s + dur(c), 0);
  function cenaEm(t) { let acc = 0; for (let i = 0; i < st.cenas.length; i++) { const d = dur(st.cenas[i]); if (t < acc + d) return { i, t0: acc, local: t - acc, d }; acc += d; } const i = st.cenas.length - 1; return { i, t0: acc - dur(st.cenas[i]), local: dur(st.cenas[i]), d: dur(st.cenas[i]) }; }
  function blocosLegenda(c, d) {
    const ws = String(c.fala || "").replace(/\*/g, "").split(/\s+/).filter(Boolean); if (!ws.length) return [];
    const blocos = []; let atual = [];
    ws.forEach(w => { atual.push(w); if (atual.length >= 5 || /[.!?…,;:]$/.test(w) && atual.length >= 3) { blocos.push(atual.join(" ")); atual = []; } });
    if (atual.length) blocos.push(atual.join(" "));
    const pesos = blocos.map(b => b.length + 6), soma = pesos.reduce((a, b) => a + b, 0); let t = 0;
    return blocos.map((b, i) => { const ini = t; t += d * pesos[i] / soma; return { ini, fim: t, txt: b }; });
  }

  // ---------------------------------------------------------------- motor de áudio (voz + música, com abaixamento)
  let actx = null;
  const ac = () => actx || (actx = new (window.AudioContext || window.webkitAudioContext)());
  // Agenda todas as faixas a partir do instante tInicio do vídeo. Retorna o relógio (t0 no AudioContext) e um parador.
  function agendarAudio(destino, tInicio) {
    const ctx = ac(); const agora = ctx.currentTime + .12; const fontes = [], ganhos = [];
    const fim = total(); const restante = Math.max(0, fim - tInicio);
    const gVoz = ctx.createGain(); gVoz.gain.value = st.volVoz; gVoz.connect(destino); ganhos.push(gVoz);
    const falas = []; // intervalos [ini, fim] com voz (tempo do vídeo)
    // toca o trecho [a, b] do buffer no instante "ini" do vídeo
    const tocar = (buf, ini, saida, a = 0, b = buf ? buf.duration : 0) => {
      if (!buf) return; const len = b - a;
      if (len <= 0 || ini + len <= tInicio || ini >= fim) return;
      const pulo = Math.max(0, tInicio - ini), quando = agora + Math.max(0, ini - tInicio);
      const src = ctx.createBufferSource(); src.buffer = buf; src.connect(saida);
      src.start(quando, a + pulo, Math.max(0, Math.min(len - pulo, fim - Math.max(ini, tInicio)))); fontes.push(src);
      falas.push([ini, Math.min(fim, ini + len)]);
    };
    if (st.usarVozCompleta && st.vozId) tocar(MID[st.vozId]?.buf, 0, gVoz);
    else st.cenas.forEach((c, i) => { const m = c.audioId && MID[c.audioId]; if (m && m.buf) tocar(m.buf, inicioCena(i) + .1, gVoz, c.cIni || 0, c.cFim ?? m.buf.duration); });
    const mus = st.musicaId && MID[st.musicaId]?.buf;
    if (mus && restante > 0) {
      const g = ctx.createGain(); g.connect(destino); ganhos.push(g);
      const src = ctx.createBufferSource(); src.buffer = mus; src.loop = true; src.connect(g);
      const base = st.volMusica, baixo = base * .28;
      const T = x => agora + Math.max(0, x - tInicio);
      g.gain.setValueAtTime(tInicio < 1 ? 0 : base, agora);
      if (tInicio < 1) g.gain.linearRampToValueAtTime(base, agora + Math.max(.05, 1 - tInicio)); // fade-in
      if (st.duck) falas.filter(f => f[1] > tInicio).sort((a, b) => a[0] - b[0]).forEach(([a, b]) => {
        g.gain.setTargetAtTime(baixo, Math.max(agora, T(a) - .25), .08); g.gain.setTargetAtTime(base, T(b) + .1, .25);
      });
      const fo = Math.max(agora, T(fim - 1.8)); g.gain.setTargetAtTime(0, fo, .5); // fade-out
      src.start(agora, tInicio % mus.duration); src.stop(agora + restante + .2); fontes.push(src);
    }
    return { agora, tInicio, parar() { fontes.forEach(f => { try { f.stop(); } catch (e) { } }); ganhos.forEach(g => g.disconnect()); } };
  }

  // ---------------------------------------------------------------- desenho
  let T_ATUAL = null;
  const fam = peso => (T_ATUAL && (+peso >= 700 ? T_ATUAL.fTit : T_ATUAL.fCorpo)) || FONTE;
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
      ctx.font = `${peso} ${s}px ${fam(peso)}`; const l = quebrar(ctx, texto, larg);
      const cabe = l.every(x => ctx.measureText(x.replace(/\*/g, "")).width <= larg); // palavra longa não pode vazar
      if (cabe && l.length * s * lh <= alt) return { s, l, lh, peso };
    }
    ctx.font = `${peso} ${min}px ${fam(peso)}`; return { s: min, l: quebrar(ctx, texto, larg), lh, peso };
  }
  function linhaRica(ctx, ln, x, y, cor, corAcc, alinhar) {
    const partes = ln.split(/(\*[^*]+\*)/).filter(Boolean);
    const larg = partes.reduce((s, p) => s + ctx.measureText(p.replace(/\*/g, "")).width, 0);
    let cx = alinhar === "center" ? x - larg / 2 : x;
    partes.forEach(p => { const dest = /^\*.*\*$/.test(p); const tx = p.replace(/\*/g, ""); ctx.fillStyle = dest ? corAcc : cor; ctx.fillText(tx, cx, y); cx += ctx.measureText(tx).width; });
  }
  function normalizaDestaque(linhas) { let aberto = false; return linhas.map(l => { let s = (aberto ? "*" : "") + l; const n = (l.match(/\*/g) || []).length; if (n % 2) aberto = !aberto; if (aberto) s += "*"; return s; }); }
  function bloco(ctx, b, x, y, cor, corAcc, alinhar, prog, escalonar = true) {
    ctx.font = `${b.peso} ${b.s}px ${fam(b.peso)}`; ctx.textBaseline = "top";
    normalizaDestaque(b.l).forEach((ln, i) => {
      const p = escalonar ? ease((prog - i * 0.08) * 1.6) : 1;
      ctx.save(); ctx.globalAlpha *= p; ctx.translate(0, (1 - p) * 40);
      linhaRica(ctx, ln, x, y + i * b.s * b.lh, cor, corAcc, alinhar); ctx.restore();
    });
    return y + b.l.length * b.s * b.lh;
  }
  function pill(ctx, txt, x, y, bg, fg) { ctx.font = `800 34px ${FONTE}`; const w = ctx.measureText(txt).width + 50; ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(x, y, w, 66, 33); ctx.fill(); ctx.fillStyle = fg; ctx.textBaseline = "middle"; ctx.fillText(txt, x + 25, y + 34); }

  function fundo(ctx, T, t) {
    if (T.marca) { MK.fundo(ctx, W, H, t); return; }
    const g = ctx.createLinearGradient(0, 0, W * .4, H); g.addColorStop(0, T.bg); g.addColorStop(1, T.bg2); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = .13; ctx.fillStyle = T.acc;
    ctx.beginPath(); ctx.arc(W - 120 + Math.sin(t * .4) * 60, 380 + Math.cos(t * .3) * 80, 330, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(140 + Math.cos(t * .35) * 50, H - 520 + Math.sin(t * .25) * 70, 240, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }
  // Fundo de mídia da cena (foto ou vídeo do usuário), em "cover", com véu escuro para leitura do texto
  let tocandoGlobal = false;
  function fundoMidia(ctx, c, local, d, T) {
    const m = c.midiaId && MID[c.midiaId]; if (!m || !m.el) return false;
    const el = m.el; let iw = el.videoWidth || el.naturalWidth, ih = el.videoHeight || el.naturalHeight; if (!iw || !ih) return false;
    if (el.tagName === "VIDEO") {
      const alvo = el.duration ? local % el.duration : local;
      if (Math.abs(el.currentTime - alvo) > .3) el.currentTime = alvo;
      if (tocandoGlobal && el.paused) el.play().catch(() => {}); if (!tocandoGlobal && !el.paused) el.pause();
    }
    const z = el.tagName === "IMG" ? 1 + .06 * (local / d) : 1; // leve zoom (Ken Burns) em fotos
    const esc2 = Math.max(W / iw, H / ih) * z, w = iw * esc2, h = ih * esc2;
    ctx.drawImage(el, (W - w) / 2, (H - h) / 2, w, h);
    const veu = c.escurecer ?? .55;
    const g = ctx.createLinearGradient(0, 0, 0, H); const base = T.marca ? "6,40,30" : "0,0,0";
    g.addColorStop(0, `rgba(${base},${Math.min(1, veu + .15)})`); g.addColorStop(.5, `rgba(${base},${veu})`); g.addColorStop(1, `rgba(${base},${Math.min(1, veu + .25)})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    return true;
  }
  function pausarVideos(excetoId) { st.cenas.forEach(c => { const m = c.midiaId && MID[c.midiaId]; if (m && m.el && m.el.tagName === "VIDEO" && c.midiaId !== excetoId && !m.el.paused) m.el.pause(); }); }

  function quadro(ctx, t) {
    const T = TEMAS[st.tema] || TEMAS.marca; T_ATUAL = T;
    if (!st.cenas.length) { fundo(ctx, T, t); return; }
    const { i, local, d } = cenaEm(t); const c = st.cenas[i];
    pausarVideos(c.midiaId);
    if (!fundoMidia(ctx, c, local, d, T)) fundo(ctx, T, t);
    else if (T.marca) { ctx.save(); ctx.globalAlpha = .9; ctx.strokeStyle = MK.ouro(ctx, 0, W); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-20, H * .93); ctx.quadraticCurveTo(W * .5, H * .8, W + 20, H * .86); ctx.stroke(); ctx.restore(); }
    const ouro = T.marca ? MK.ouro(ctx, SAFE.left, W - SAFE.right) : null;
    const corTit = ouro || T.fg, corDest = T.marca ? T.fg : T.acc, corTxt = T.fg, corTxtDest = ouro || T.acc;
    const entrada = ease(local / .45), saida = i < st.cenas.length - 1 ? 1 - ease((local - (d - .25)) / .25) : 1;
    const x = SAFE.left, larg = W - SAFE.left - SAFE.right, topo = SAFE.top, base = H - SAFE.bottom;
    const areaAlt = (st.legendas ? base - 260 : base) - topo;
    ctx.save(); ctx.globalAlpha = saida;
    const zoom = 1 + .025 * (local / d); ctx.translate(W / 2, H / 2); ctx.scale(zoom, zoom); ctx.translate(-W / 2, -H / 2);
    const txt = c.texto_tela || "";
    if (c.tipo === "gancho") {
      const b = ajustar(ctx, txt, larg, areaAlt * .7, 130, 60, 800, 1.1);
      const h = b.l.length * b.s * b.lh; bloco(ctx, b, x, topo + (areaAlt - h) / 2 - 40, corTit, corDest, "left", local / .9);
      ctx.globalAlpha = saida * entrada; ctx.fillStyle = ouro || T.acc; ctx.fillRect(x, topo + (areaAlt + h) / 2, (T.marca ? 420 : 160) * entrada, T.marca ? 4 : 12);
    } else if (c.tipo === "dado") {
      const [num, ...resto] = txt.split("\n"); const bN = ajustar(ctx, num, larg, areaAlt * .42, 210, 80, 800, 1.0);
      const bR = ajustar(ctx, resto.join(" ") || "", larg, areaAlt * .35, 76, 40, 600);
      const hT = bN.l.length * bN.s + 50 + bR.l.length * bR.s * bR.lh; let y = topo + (areaAlt - hT) / 2;
      ctx.save(); const sc = .7 + .3 * ease(local / .5); ctx.translate(x, y); ctx.scale(sc, sc); ctx.globalAlpha = saida * entrada; bloco(ctx, bN, 0, 0, ouro || T.acc, T.fg, "left", 1, false); ctx.restore();
      y += bN.l.length * bN.s + 50; bloco(ctx, bR, x, y, corTxt, corTxtDest, "left", (local - .35) / .8);
    } else if (c.tipo === "lista") {
      const itens = txt.split("\n").filter(Boolean); const passo = Math.max(.5, (d - 1) / Math.max(1, itens.length));
      const tam = Math.min(72, Math.floor(areaAlt / (itens.length * 2.4)));
      let y = topo + 40;
      itens.forEach((it, k) => {
        const p = ease((local - .3 - k * passo) / .4); if (p <= 0) return;
        const b = ajustar(ctx, it.replace(/^[•\-]\s*/, ""), larg - 90, areaAlt / itens.length - 30, tam, 34, 600, 1.15);
        ctx.save(); ctx.globalAlpha = saida * p; ctx.translate((1 - p) * -60, 0);
        if (T.marca) { ctx.strokeStyle = ouro; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x + 22, y + b.s * .6, 18, 0, Math.PI * 2); ctx.stroke(); ctx.fillStyle = ouro; ctx.beginPath(); ctx.arc(x + 22, y + b.s * .6, 6, 0, Math.PI * 2); ctx.fill(); }
        else { ctx.fillStyle = T.acc; ctx.beginPath(); ctx.arc(x + 22, y + b.s * .6, 18, 0, Math.PI * 2); ctx.fill(); }
        const yy = bloco(ctx, b, x + 70, y, corTxt, corTxtDest, "left", 1, false); ctx.restore();
        y = yy + 46;
      });
    } else if (c.tipo === "alerta") {
      if (T.marca) { ctx.strokeStyle = ouro; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(x, topo + 20, 300, 66, 33); ctx.stroke(); ctx.fillStyle = ouro; ctx.font = `600 32px ${T.fTit}`; ctx.textBaseline = "middle"; ctx.fillText("⚠ ATENÇÃO", x + 30, topo + 55); }
      else pill(ctx, "⚠ ATENÇÃO", x, topo + 20, T.acc, T.bg);
      const b = ajustar(ctx, txt, larg, areaAlt - 180, 92, 44, 800, 1.12); const h = b.l.length * b.s * b.lh;
      bloco(ctx, b, x, topo + 140 + Math.max(0, (areaAlt - 180 - h) / 2), T.marca ? T.fg : T.fg, corTxtDest, "left", local / .8);
    } else if (c.tipo === "cta") {
      const b = ajustar(ctx, txt || "Salva esse vídeo 💾", larg, areaAlt * .45, 110, 52, 800, 1.1); const h = b.l.length * b.s * b.lh;
      const y0 = topo + (areaAlt - h) / 2 - 120; bloco(ctx, b, W / 2 - 30, y0, corTit, corDest, "center", local / .7);
      ctx.globalAlpha = saida * ease((local - .6) / .4);
      if (T.marca) { MK.monograma(ctx, W / 2 - 30, y0 + h + 120, 70); ctx.font = `500 44px ${T.fTit}`; ctx.fillStyle = ouro; ctx.textAlign = "center"; ctx.textBaseline = "top"; ctx.fillText(MK.get().nome.toUpperCase(), W / 2 - 30, y0 + h + 215); ctx.font = `600 34px ${FONTE}`; ctx.fillStyle = T.sub; ctx.fillText(st.perfil || "", W / 2 - 30, y0 + h + 280); ctx.textAlign = "left"; }
      else { ctx.font = `700 52px ${FONTE}`; ctx.fillStyle = T.acc; ctx.textAlign = "center"; ctx.fillText(st.perfil || "", W / 2 - 30, y0 + h + 70); ctx.textAlign = "left"; }
    } else if (c.tipo === "referencia") {
      if (T.marca) { ctx.fillStyle = ouro; ctx.font = `600 36px ${T.fTit}`; ctx.textBaseline = "top"; ctx.fillText("FONTE", x, topo + 30); ctx.fillRect(x, topo + 82, 160, 3); }
      else pill(ctx, "📚 FONTE", x, topo + 20, "rgba(255,255,255,.18)", T.fg);
      const b = ajustar(ctx, txt, larg, areaAlt - 200, 60, 30, 600, 1.3); bloco(ctx, b, x, topo + 150, T.sub, corTxtDest, "left", local / .7);
    } else {
      const b = ajustar(ctx, txt, larg, areaAlt * .75, 100, 46, 800, 1.12); const h = b.l.length * b.s * b.lh;
      bloco(ctx, b, x, topo + (areaAlt - h) / 2, T.marca ? T.fg : T.fg, corTxtDest, "left", local / .8);
    }
    ctx.restore();
    // legenda do que é falado
    if (st.legendas && c.fala) {
      const bl = blocosLegenda(c, d).find(b => local >= b.ini && local < b.fim) || null;
      if (bl) {
        ctx.font = `800 54px ${FONTE}`; const linhas = quebrar(ctx, bl.txt, larg + 40); const hh = linhas.length * 66 + 40; const yb = base - 40 - hh;
        let mw = 0; linhas.forEach(l => { mw = Math.max(mw, ctx.measureText(l).width); });
        ctx.fillStyle = T.marca ? "rgba(4,28,21,.78)" : "rgba(0,0,0,.55)"; ctx.beginPath(); ctx.roundRect(W / 2 - 30 - mw / 2 - 30, yb, mw + 60, hh, 22); ctx.fill();
        if (T.marca) { ctx.strokeStyle = "rgba(214,178,106,.7)"; ctx.lineWidth = 2; ctx.stroke(); }
        ctx.fillStyle = T.marca ? "#f4ecd8" : "#fff"; ctx.textAlign = "center"; ctx.textBaseline = "top"; linhas.forEach((l, k) => ctx.fillText(l, W / 2 - 30, yb + 22 + k * 66)); ctx.textAlign = "left";
      }
    }
    // barra de progresso e assinatura
    const tt = total(); ctx.fillStyle = "rgba(255,255,255,.22)"; ctx.fillRect(0, 0, W, 10); ctx.fillStyle = ouro || T.acc; ctx.fillRect(0, 0, W * Math.min(1, t / tt), 10);
    if (T.marca) { if (c.tipo !== "cta") MK.assinatura(ctx, SAFE.left, 120, .75); }
    else { ctx.globalAlpha = .85; ctx.fillStyle = T.sub; ctx.font = `700 34px ${FONTE}`; ctx.textBaseline = "middle"; ctx.fillText(st.perfil || "", SAFE.left, 170); ctx.globalAlpha = 1; }
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

  // ---------------------------------------------------------------- utilidades de áudio
  // Detecta silêncio no início/fim da gravação para cortar automaticamente (fala mais natural, sem "respiro" morto)
  function cortesSilencio(buf) {
    const d = buf.getChannelData(0), sr = buf.sampleRate, lim = .025, jan = Math.floor(sr * .02);
    const energia = k => { let m = 0; for (let j = k; j < Math.min(d.length, k + jan); j++) m = Math.max(m, Math.abs(d[j])); return m; };
    let a = 0; while (a < d.length && energia(a) < lim) a += jan;
    let b = d.length - jan; while (b > a && energia(b) < lim) b -= jan;
    return { ini: Math.max(0, a / sr - .12), fim: Math.min(buf.duration, (b + jan) / sr + .2) };
  }
  const tamFala = c => { const m = c.audioId && MID[c.audioId]; if (!m || !m.buf) return 0; return (c.cFim ?? m.buf.duration) - (c.cIni ?? 0); };
  async function definirAudioCena(c, blob, nome) {
    if (c.audioId) await apagar(c.audioId);
    c.audioId = await guardar(blob, "voz"); c.audioNome = nome;
    const m = MID[c.audioId];
    if (m && m.buf) { const k = cortesSilencio(m.buf); c.cIni = +k.ini.toFixed(2); c.cFim = +k.fim.toFixed(2); if (st.encaixar !== false) c.dur = +((c.cFim - c.cIni) + .35).toFixed(2); }
    salvar();
  }
  async function gravarMicrofone() {
    return navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
  }

  // ---------------------------------------------------------------- tela
  function viewReels(pmidInicial) {
    const salvos = Object.values(window.ARTIGOS.bib());
    if (st.encaixar === undefined) st.encaixar = true;
    app.innerHTML = `<h1>🎬 Reels — editor</h1>
      <p class="muted">Do artigo ao vídeo pronto, sem sair do app: roteiro natural, gravação da voz cena a cena (regrave só o trecho que errar), fotos ou vídeos seus no fundo, trilha musical que abaixa sozinha quando você fala, legendas e exportação.</p>
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
          <div class="card"><h3>2. Cenas</h3><p class="muted">Cada cena: o que você fala, o texto na tela, sua voz e um fundo opcional (foto/vídeo). Use <code>*palavra*</code> para destacar e "…" para pausas.</p>
            <label class="check"><input type="checkbox" id="rEncaixar" ${st.encaixar ? "checked" : ""}> Ao gravar/importar a voz de uma cena, ajustar a duração da cena à fala (corta silêncios do começo e do fim)</label>
            <div id="rCenas"></div><button class="btn sec peq" id="rAdd">+ Cena</button></div>
          <div class="card"><h3>3. Legenda do post</h3><textarea id="rLegenda" style="min-height:140px">${esc(st.legenda)}</textarea>
            <label>Hashtags</label><input type="text" id="rTags" value="${esc(st.hashtags.join(" "))}"><div class="row" style="margin-top:8px"><button class="btn sec" id="rCopiar">Copiar legenda</button></div></div>
        </div>
        <div class="reels-dir">
          <div class="card"><div class="row" style="justify-content:space-between"><h3 style="margin:0">Prévia 9:16</h3><span class="tag" id="rDur"></span></div>
            <canvas id="rCanvas" width="${W}" height="${H}" class="reels-canvas"></canvas>
            <div class="tl" id="rTL"></div><div class="tl tl-mus" id="rTLm"></div>
            <div class="row" style="justify-content:center;margin-top:8px"><button class="btn sec peq" id="rIni">⏮</button><button class="btn" id="rPlay">▶ Reproduzir</button><span class="muted" id="rTempo">0,0 s</span><button class="btn sec" id="rTele">🎙 Gravar tudo de uma vez</button></div></div>
          <div class="card" id="rMix"><h3>🎚 Áudio</h3>
            <div class="form-grid"><div><label>Voz usada no vídeo</label><select id="rModoVoz"><option value="cenas" ${!st.usarVozCompleta ? "selected" : ""}>Falas gravadas por cena</option><option value="unica" ${st.usarVozCompleta ? "selected" : ""} ${st.vozId ? "" : "disabled"}>Gravação única${st.vozId ? "" : " (nenhuma)"}</option></select></div>
              <div><label>Volume da voz <span id="vVoz">${Math.round(st.volVoz * 100)}%</span></label><input type="range" id="rVolVoz" min="0" max="2" step=".05" value="${st.volVoz}"></div></div>
            <div class="form-grid"><div><label>Trilha musical</label><div class="row"><label class="btn sec peq" style="cursor:pointer">🎵 ${st.musicaId ? "Trocar" : "Escolher"} música<input type="file" id="rMusica" accept="audio/*" hidden></label>${st.musicaId ? `<button class="btn peq perigo" id="rMusDel">Remover</button>` : ""}</div><small class="muted">${esc(st.musicaNome || "Nenhuma — use músicas livres de direitos (ex.: biblioteca do YouTube Studio).")}</small></div>
              <div><label>Volume da música <span id="vMus">${Math.round(st.volMusica * 100)}%</span></label><input type="range" id="rVolMus" min="0" max="1" step=".02" value="${st.volMusica}">
              <label class="check"><input type="checkbox" id="rDuck" ${st.duck ? "checked" : ""}> Abaixar a música quando eu falo</label></div></div></div>
          <div class="card" id="rVisual"><h3>🎨 Visual</h3><div class="form-grid">
            <div><label>Tema</label><select id="rTema">${Object.entries(TEMAS).map(([k, v]) => `<option value="${k}" ${k === st.tema ? "selected" : ""}>${v.nome}</option>`).join("")}</select></div>
            <div><label>Seu @</label><input type="text" id="rPerfil" value="${esc(st.perfil)}"></div></div>
            <label class="check"><input type="checkbox" id="rLeg" ${st.legendas ? "checked" : ""}> Legendas do que é falado (a maioria assiste sem som)</label></div>
          <div class="card"><h3>⬇ Exportar</h3>
            <div class="row"><button class="btn" id="rExport">Exportar vídeo final</button><label class="check"><input type="checkbox" id="rComAudio" checked> Com áudio (voz + música)</label></div>
            <div class="row" style="margin-top:6px"><button class="btn sec peq" id="rSrt">Legendas (.srt)</button><button class="btn sec peq" id="rTxt">Roteiro (.txt)</button><button class="btn sec peq" id="rCapa">Capa (.png)</button></div>
            <div id="rExpMsg"></div>
            <p class="muted" style="font-size:.82rem">A exportação acontece em tempo real (um Reels de 45 s leva ~45 s). Deixe esta aba aberta e visível. Sai em MP4 no Chrome/Edge; em outros navegadores pode sair em WebM.</p></div>
          ${st.dicas.length ? `<div class="card"><h3>🎙 Dicas para gravar</h3>${FR.lista(st.dicas)}</div>` : ""}
        </div>
      </div>
      <div id="rTeleBox" class="tele" hidden></div>`;

    const canvas = $("#rCanvas"), ctx = canvas.getContext("2d");
    let t = 0, tocando = false, raf = 0, sess = null;
    const fmt = s => s.toFixed(1).replace(".", ",") + " s";
    const desenhar = () => { quadro(ctx, t); const tt = Math.max(.1, total()); const ph = $("#rPH"); if (ph) ph.style.left = (100 * Math.min(1, t / tt)) + "%"; const tm = $("#rTempo"); if (tm) tm.textContent = fmt(t); };
    const atualizaDur = () => { const d = total(); $("#rDur").textContent = `${fmt(d)} · ${st.cenas.length} cenas`; $("#rDur").className = "tag " + (d > 90 ? "bad" : Math.abs(d - st.alvo) <= 8 ? "ok" : "warn"); linhaTempo(); };
    function loop() { t = sess.tInicio + Math.max(0, ac().currentTime - sess.agora); if (t >= total()) { t = total(); parar(); } desenhar(); if (tocando) raf = requestAnimationFrame(loop); }
    async function tocar() { if (!st.cenas.length) return; if (t >= total() - .05) t = 0; await ac().resume(); sess = agendarAudio(ac().destination, t); tocando = tocandoGlobal = true; $("#rPlay").textContent = "⏸ Pausar"; loop(); }
    function parar() { tocando = tocandoGlobal = false; cancelAnimationFrame(raf); if (sess) sess.parar(); sess = null; pausarVideos(); const b = $("#rPlay"); if (b) b.textContent = "▶ Reproduzir"; }
    const irPara = s => { const era = tocando; parar(); t = Math.max(0, Math.min(total(), s)); desenhar(); if (era) tocar(); };
    $("#rPlay").addEventListener("click", () => tocando ? parar() : tocar());
    $("#rIni").addEventListener("click", () => irPara(0));

    // linha do tempo (estilo editor): cenas proporcionais à duração, ícones de voz/fundo, música embaixo
    function linhaTempo() {
      const tt = Math.max(.1, total());
      $("#rTL").innerHTML = st.cenas.map((c, i) => `<div class="tl-b ${c.tipo}" data-i="${i}" style="flex:${dur(c)}" title="Cena ${i + 1}: ${esc(c.texto_tela || "").replace(/\*/g, "")}"><b>${i + 1}</b>${c.audioId ? "🎙" : ""}${c.midiaId ? (MID[c.midiaId]?.el?.tagName === "VIDEO" ? "🎞" : "🖼") : ""}</div>`).join("") + `<div class="tl-ph" id="rPH"></div>`;
      $("#rTLm").innerHTML = st.musicaId ? `<div class="tl-mb">🎵 ${esc(st.musicaNome)}</div>` : (st.usarVozCompleta && st.vozId ? `<div class="tl-mb voz" style="width:${Math.min(100, 100 * (MID[st.vozId]?.dur || 0) / tt)}%">🎙 gravação única</div>` : `<div class="muted" style="font-size:.75rem;padding:2px 6px">sem trilha musical</div>`);
    }
    $("#rTL").addEventListener("click", e => { const r = $("#rTL").getBoundingClientRect(); irPara(total() * (e.clientX - r.left) / r.width); });

    const origem = () => $("#rOrigem").value;
    const trocaOrigem = () => { $("#rOrigArt").hidden = origem() !== "artigo"; $("#rOrigCond").hidden = origem() !== "cond"; };
    $("#rOrigem").addEventListener("change", trocaOrigem); trocaOrigem();
    $("#rBib").addEventListener("change", e => { if (e.target.value) $("#rPmid").value = e.target.value; });
    $("#rFonte").addEventListener("change", e => { if (["rPublico", "rAlvo", "rRitmo"].includes(e.target.id)) { st.publico = $("#rPublico").value; st.alvo = +$("#rAlvo").value; st.ritmo = $("#rRitmo").value; salvar(); editores(); atualizaDur(); desenhar(); } });

    async function gerar(usarIA) {
      const msg = $("#rMsg"); parar();
      if (st.cenas.some(c => c.audioId || c.midiaId) && !confirm("Gerar um novo roteiro substitui as cenas atuais (incluindo as falas gravadas e os fundos). Continuar?")) return;
      try {
        msg.innerHTML = `<div class="info">${usarIA ? "Escrevendo o roteiro… (até 1 minuto)" : "Montando o roteiro…"}</div>`;
        const antigas = st.cenas.flatMap(c => [c.audioId, c.midiaId]).filter(Boolean);
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
            if (!ext) { antigas.forEach(apagar); salvar(); viewReels(p); $("#rMsg").innerHTML = `<div class="aviso">Este artigo ainda não foi extraído — o roteiro veio com lacunas para você completar. Faça a extração na página do artigo (aba "Extrair") ou use a IA.</div>`; return; }
          }
        }
        antigas.forEach(apagar);
        msg.innerHTML = ""; salvar(); viewReels(origem() === "artigo" ? $("#rPmid").value.trim() : "");
      } catch (e) { msg.innerHTML = `<div class="alerta">${esc(e.message)}</div>`; }
    }
    function aplicar(r) { st.cenas = r.cenas.map(c => ({ ...c, dur: c.tipo === "referencia" ? 2.5 : 0 })); st.legenda = r.legenda; st.hashtags = r.hashtags.map(h => h.replace(/^#/, "")); st.dicas = r.dicas_gravacao; st.titulo = r.titulo; }
    $("#rGerar").addEventListener("click", () => gerar(window.IA.temIA()));
    $("#rGerarSem")?.addEventListener("click", () => gerar(false));

    // ------------------------------------------------ editor de cenas
    function editores() {
      let acc = 0;
      $("#rCenas").innerHTML = st.cenas.map((c, i) => {
        const ini = acc; acc += dur(c); const m = c.midiaId && MID[c.midiaId]; const tf = tamFala(c);
        return `<details ${i < 1 ? "open" : ""} data-c="${i}"><summary>${i + 1}. ${esc(TIPOS.find(x => x[0] === c.tipo)?.[1] || c.tipo)} <small class="muted">· ${ini.toFixed(1)}–${acc.toFixed(1)} s</small> ${c.audioId ? "🎙" : ""}${c.midiaId ? "🖼" : ""}</summary>
        <div class="form-grid"><div><label>Tipo de cena</label><select data-f="tipo">${TIPOS.map(([k, l]) => `<option value="${k}" ${k === c.tipo ? "selected" : ""}>${l}</option>`).join("")}</select></div>
          <div><label>Duração (s) — 0 = automática (${duracaoAuto(c)} s)</label><input type="number" step="0.1" min="0" data-f="dur" value="${c.dur || 0}"></div></div>
        <label>🎙 Fala (o que você vai dizer)</label><textarea data-f="fala">${esc(c.fala)}</textarea>
        <label>🖼 Texto na tela</label><textarea data-f="texto_tela" style="min-height:50px">${esc(c.texto_tela)}</textarea>
        <div class="cena-midia">
          <div><b>Voz</b> ${c.audioId ? `<span class="tag ok">${esc(c.audioNome || "gravada")} · ${tf.toFixed(1)} s</span>` : `<span class="tag">sem voz</span>`}
            <div class="row"><button class="btn peq" data-a="gravar">${c.audioId ? "🔁 Regravar" : "🎙 Gravar"}</button>${c.audioId ? `<button class="btn sec peq" data-a="ouvir">▶ Ouvir</button><button class="btn sec peq" data-a="encaixar">↔ Duração = fala</button><button class="btn peq perigo" data-a="semvoz">✖</button>` : ""}
            <label class="btn sec peq" style="cursor:pointer">📁 Áudio<input type="file" accept="audio/*" data-a="impvoz" hidden></label></div></div>
          <div><b>Fundo</b> ${m ? `<span class="tag ok">${m.el?.tagName === "VIDEO" ? "vídeo" : "foto"}</span>` : `<span class="tag">padrão do tema</span>`}
            <div class="row"><label class="btn sec peq" style="cursor:pointer">🖼 Foto/vídeo<input type="file" accept="image/*,video/*" data-a="impmidia" hidden></label>${m ? `<button class="btn peq perigo" data-a="semmidia">✖</button>` : ""}</div>
            ${m ? `<label>Escurecer o fundo <span>${Math.round((c.escurecer ?? .55) * 100)}%</span></label><input type="range" min="0" max=".9" step=".05" data-f="escurecer" value="${c.escurecer ?? .55}">` : ""}</div>
        </div>
        <div class="row" style="margin-top:6px"><button class="btn sec peq" data-a="ver">▶ Ver cena</button><button class="btn sec peq" data-a="sobe">↑</button><button class="btn sec peq" data-a="desce">↓</button><button class="btn sec peq" data-a="dup">Duplicar</button><button class="btn peq perigo" data-a="del">Excluir</button></div></details>`;
      }).join("") || `<p class="muted">Gere um roteiro acima.</p>`;
    }
    const reabrir = i => { editores(); atualizaDur(); desenhar(); const d = $(`#rCenas details[data-c="${i}"]`); if (d) d.open = true; };
    $("#rCenas").addEventListener("input", e => {
      const d = e.target.closest("[data-c]"), f = e.target.dataset.f; if (!d || !f) return;
      const c = st.cenas[+d.dataset.c]; c[f] = (f === "dur" || f === "escurecer") ? +e.target.value : e.target.value; salvar(); atualizaDur(); desenhar();
      if (f === "escurecer") e.target.previousElementSibling.querySelector("span").textContent = Math.round(c.escurecer * 100) + "%";
      if (f === "dur" || f === "fala") { const s = d.querySelector("summary small"); const a0 = inicioCena(+d.dataset.c); s.textContent = `· ${a0.toFixed(1)}–${(a0 + dur(c)).toFixed(1)} s`; }
    });
    $("#rCenas").addEventListener("change", async e => {
      const d = e.target.closest("[data-c]"); if (!d) return; const i = +d.dataset.c, c = st.cenas[i];
      if (e.target.dataset.f === "tipo") { c.tipo = e.target.value; salvar(); desenhar(); linhaTempo(); }
      const f = e.target.files && e.target.files[0]; if (!f) return;
      if (e.target.dataset.a === "impvoz") { await definirAudioCena(c, f, f.name); reabrir(i); }
      if (e.target.dataset.a === "impmidia") {
        if (f.size > 200 * 1024 * 1024) { alert("Arquivo muito grande (máx. 200 MB)."); return; }
        if (c.midiaId) await apagar(c.midiaId); c.midiaId = await guardar(f, "midia"); salvar(); reabrir(i);
      }
    });
    $("#rCenas").addEventListener("click", async e => {
      const b = e.target.closest("[data-a]"); const d = e.target.closest("[data-c]"); if (!b || !d || b.tagName === "INPUT") return;
      const i = +d.dataset.c, c = st.cenas[i], a = b.dataset.a;
      if (a === "ver") { parar(); t = inicioCena(i); tocar(); return; }
      if (a === "ouvir") { const m = MID[c.audioId]; if (m) { parar(); await ac().resume(); const s = ac().createBufferSource(); s.buffer = m.buf; s.connect(ac().destination); s.start(0, c.cIni || 0, tamFala(c)); } return; }
      if (a === "gravar") { parar(); gravarCena(i); return; }
      if (a === "encaixar") { c.dur = +(tamFala(c) + .35).toFixed(2); }
      if (a === "semvoz") { await apagar(c.audioId); delete c.audioId; delete c.cIni; delete c.cFim; }
      if (a === "semmidia") { await apagar(c.midiaId); delete c.midiaId; }
      if (a === "del") { if (!confirm("Excluir esta cena?")) return; await apagar(c.audioId); await apagar(c.midiaId); st.cenas.splice(i, 1); }
      if (a === "dup") { const copia = { ...c }; delete copia.audioId; delete copia.midiaId; delete copia.cIni; delete copia.cFim; st.cenas.splice(i + 1, 0, copia); }
      if (a === "sobe" || a === "desce") { const j = i + (a === "sobe" ? -1 : 1); if (j < 0 || j >= st.cenas.length) return; [st.cenas[i], st.cenas[j]] = [st.cenas[j], st.cenas[i]]; }
      salvar(); reabrir(Math.min(i, st.cenas.length - 1));
    });
    $("#rAdd").addEventListener("click", () => { st.cenas.splice(Math.max(0, st.cenas.length - 1), 0, { tipo: "fala", fala: "Nova fala…", texto_tela: "Novo texto", dur: 0 }); salvar(); editores(); atualizaDur(); });
    $("#rEncaixar").addEventListener("change", e => { st.encaixar = e.target.checked; salvar(); });

    // ------------------------------------------------ gravação de uma cena (teleprompter da cena)
    function gravarCena(i) {
      const c = st.cenas[i]; const box = $("#rTeleBox"); box.hidden = false;
      box.innerHTML = `<div class="tele-in"><div class="row" style="justify-content:space-between"><b>🎙 Cena ${i + 1} de ${st.cenas.length}</b><button class="btn sec peq" id="gFechar">Fechar</button></div>
        <div class="tele-texto"><p class="ativa" style="font-size:1.8rem">${esc((c.fala || "").replace(/\*/g, "")) || "<i>(sem fala)</i>"}</p></div>
        <div class="row"><button class="btn perigo" id="gRec">⏺ Começar</button><span id="gStatus" class="muted">Leia com calma, como se estivesse conversando. Pode errar: é só regravar.</span></div><div id="gOut"></div></div>`;
      let rec = null, mic = null, t0 = 0, timer = 0;
      const fechar = () => { clearInterval(timer); if (rec && rec.state === "recording") { rec.onstop = null; rec.stop(); } if (mic) mic.getTracks().forEach(tr => tr.stop()); box.hidden = true; };
      $("#gFechar", box).addEventListener("click", fechar);
      $("#gRec", box).addEventListener("click", async () => {
        const btn = $("#gRec", box);
        if (rec && rec.state === "recording") { rec.stop(); btn.disabled = true; return; }
        try { mic = await gravarMicrofone(); } catch (err) { $("#gOut", box).innerHTML = `<div class="alerta">Microfone indisponível: ${esc(err.message)}</div>`; return; }
        const partes = []; rec = new MediaRecorder(mic); rec.ondataavailable = ev => { if (ev.data.size) partes.push(ev.data); };
        rec.onstop = async () => {
          clearInterval(timer); mic.getTracks().forEach(tr => tr.stop());
          const blob = new Blob(partes, { type: rec.mimeType }); $("#gStatus", box).textContent = "Processando…";
          await definirAudioCena(c, blob, "gravada");
          $("#gStatus", box).textContent = `Pronto: ${tamFala(c).toFixed(1)} s de fala.`;
          $("#gOut", box).innerHTML = `<div class="row"><button class="btn sec" id="gOuvir">▶ Ouvir</button><button class="btn sec" id="gDeNovo">🔁 Regravar</button>${i < st.cenas.length - 1 ? `<button class="btn" id="gProx">Próxima cena →</button>` : `<button class="btn" id="gFim">Concluir</button>`}</div>`;
          $("#gOuvir", box).addEventListener("click", async () => { await ac().resume(); const s = ac().createBufferSource(); s.buffer = MID[c.audioId].buf; s.connect(ac().destination); s.start(0, c.cIni || 0, tamFala(c)); });
          $('[id="gDeNovo"]', box).addEventListener("click", () => gravarCena(i));
          $("#gProx", box)?.addEventListener("click", () => { reabrir(i); gravarCena(i + 1); });
          $("#gFim", box)?.addEventListener("click", () => { box.hidden = true; reabrir(i); });
          reabrir(i);
        };
        let n = 3; btn.disabled = true;
        const conta = setInterval(() => {
          $("#gStatus", box).textContent = `Começando em ${n}…`; n--;
          if (n < 0) { clearInterval(conta); rec.start(); t0 = performance.now(); btn.disabled = false; btn.textContent = "⏹ Parar";
            timer = setInterval(() => { $("#gStatus", box).textContent = `⏺ Gravando… ${((performance.now() - t0) / 1000).toFixed(1)} s (sugerido: ${duracaoAuto(c)} s)`; }, 100); }
        }, 1000);
        $("#gStatus", box).textContent = "Começando em 3…";
      });
    }

    // ------------------------------------------------ gravação única (vídeo inteiro com teleprompter)
    $("#rTele").addEventListener("click", () => {
      parar(); const box = $("#rTeleBox"); box.hidden = false;
      box.innerHTML = `<div class="tele-in"><div class="row" style="justify-content:space-between"><b>🎙 Gravar tudo de uma vez</b><button class="btn sec peq" id="tFechar">Fechar</button></div>
        <p class="muted">O texto rola no ritmo das cenas. Prefere gravar por partes? Feche e use "🎙 Gravar" em cada cena — assim dá para regravar só o trecho que errar.</p>
        <div id="tTexto" class="tele-texto">${st.cenas.map((c, i) => `<p data-ti="${i}">${esc((c.fala || "").replace(/\*/g, "")) || "<i>(sem fala)</i>"}</p>`).join("")}</div>
        <div class="row"><button class="btn sec" id="tEnsaiar">▶ Ensaiar</button><button class="btn perigo" id="tGravar">⏺ Gravar</button><span id="tStatus" class="muted"></span></div><div id="tOut"></div></div>`;
      let rodando = false, rec = null, t0 = 0, rafT = 0;
      const marcar = tt => { const { i } = cenaEm(tt); $$("#tTexto p", box).forEach((p, k) => p.classList.toggle("ativa", k === i)); $(`#tTexto p[data-ti="${i}"]`, box)?.scrollIntoView({ block: "center", behavior: "smooth" }); };
      const rodar = com => {
        rodando = true; t0 = performance.now() + 3000; let ult = -1;
        const passo = () => {
          const tt = (performance.now() - t0) / 1000;
          if (tt < 0) $("#tStatus", box).textContent = `Começando em ${Math.ceil(-tt)}…`;
          else {
            if (com && rec && rec.state === "inactive") rec.start();
            $("#tStatus", box).textContent = `${com ? "⏺ Gravando" : "Ensaio"} · ${tt.toFixed(1)} / ${total().toFixed(1)} s`;
            const { i } = cenaEm(tt); if (i !== ult) { ult = i; marcar(tt); }
            t = Math.min(tt, total()); quadro(ctx, t);
            if (tt >= total() + .5) { encerrar(); return; }
          }
          if (rodando) rafT = requestAnimationFrame(passo);
        }; passo();
      };
      const encerrar = () => { rodando = false; cancelAnimationFrame(rafT); if (rec && rec.state === "recording") rec.stop(); else $("#tStatus", box).textContent = "Fim."; };
      $("#tEnsaiar", box).addEventListener("click", () => rodando ? encerrar() : rodar(false));
      $("#tGravar", box).addEventListener("click", async () => {
        if (rodando) { encerrar(); return; }
        try {
          const mic = await gravarMicrofone(); const partes = []; rec = new MediaRecorder(mic);
          rec.ondataavailable = e => { if (e.data.size) partes.push(e.data); };
          rec.onstop = async () => {
            mic.getTracks().forEach(tr => tr.stop());
            if (st.vozId) await apagar(st.vozId);
            st.vozId = await guardar(new Blob(partes, { type: rec.mimeType }), "vozunica"); st.vozNome = "gravação única"; st.usarVozCompleta = true; salvar();
            $("#tOut", box).innerHTML = `<audio controls src="${MID[st.vozId].url}" style="width:100%"></audio><div class="row"><button class="btn" id="tUsar">Usar no vídeo</button><button class="btn sec" id="tBaixar">Baixar áudio</button></div>`;
            $("#tUsar", box).addEventListener("click", () => { box.hidden = true; ajustarAoAudio(); });
            $("#tBaixar", box).addEventListener("click", () => baixar("voz-reels." + (rec.mimeType.includes("mp4") ? "m4a" : "webm"), MID[st.vozId].blob));
          };
          rodar(true);
        } catch (e) { $("#tOut", box).innerHTML = `<div class="alerta">Microfone indisponível: ${esc(e.message)}</div>`; }
      });
      $("#tFechar", box).addEventListener("click", () => { encerrar(); box.hidden = true; });
    });
    function ajustarAoAudio() {
      const dA = MID[st.vozId]?.dur, atual = total();
      if (dA && Math.abs(dA - atual) > .3 && confirm(`A gravação tem ${dA.toFixed(1)} s e o vídeo ${atual.toFixed(1)} s. Ajustar a duração das cenas proporcionalmente?`)) { const f = dA / atual; st.cenas.forEach(c => { c.dur = +(dur(c) * f).toFixed(2); }); salvar(); }
      viewReels(pmidInicial);
    }

    // ------------------------------------------------ mixer e visual
    $("#rMix").addEventListener("input", e => {
      if (e.target.id === "rVolVoz") { st.volVoz = +e.target.value; $("#vVoz").textContent = Math.round(st.volVoz * 100) + "%"; }
      if (e.target.id === "rVolMus") { st.volMusica = +e.target.value; $("#vMus").textContent = Math.round(st.volMusica * 100) + "%"; }
      salvar();
    });
    $("#rMix").addEventListener("change", async e => {
      if (e.target.id === "rDuck") st.duck = e.target.checked;
      if (e.target.id === "rModoVoz") st.usarVozCompleta = e.target.value === "unica";
      if (e.target.id === "rMusica" && e.target.files[0]) { const f = e.target.files[0]; if (st.musicaId) await apagar(st.musicaId); st.musicaId = await guardar(f, "musica"); st.musicaNome = f.name; salvar(); viewReels(pmidInicial); return; }
      salvar(); if (tocando) { parar(); tocar(); } linhaTempo();
    });
    $("#rMix").addEventListener("click", async e => { if (e.target.id === "rMusDel") { await apagar(st.musicaId); st.musicaId = ""; st.musicaNome = ""; salvar(); viewReels(pmidInicial); } });
    $("#rVisual").addEventListener("input", () => { st.tema = $("#rTema").value; st.perfil = $("#rPerfil").value; st.legendas = $("#rLeg").checked; salvar(); desenhar(); });
    $("#rVisual").addEventListener("change", () => { st.tema = $("#rTema").value; st.legendas = $("#rLeg").checked; salvar(); desenhar(); });
    $("#rLegenda").addEventListener("input", e => { st.legenda = e.target.value; salvar(); });
    $("#rTags").addEventListener("input", e => { st.hashtags = e.target.value.split(/[\s,]+/).map(h => h.replace(/^#/, "")).filter(Boolean); salvar(); });
    $("#rCopiar").addEventListener("click", async () => { try { await navigator.clipboard.writeText(st.legenda + "\n\n" + st.hashtags.map(h => "#" + h).join(" ")); $("#rCopiar").textContent = "Copiado ✓"; } catch (e) { $("#rLegenda").select(); } });

    // ------------------------------------------------ exportações
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

    $("#rExport").addEventListener("click", async () => {
      if (!st.cenas.length) return; parar();
      if (!window.MediaRecorder || !canvas.captureStream) { $("#rExpMsg").innerHTML = `<div class="alerta">Seu navegador não suporta gravação de vídeo. Use Chrome ou Edge.</div>`; return; }
      const tipos = ["video/mp4;codecs=avc1.42E01E,mp4a.40.2", "video/mp4;codecs=avc1", "video/mp4", "video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"];
      const mime = tipos.find(m => MediaRecorder.isTypeSupported(m)) || "";
      await ac().resume();
      const stream = canvas.captureStream(FPS);
      const comAudio = $("#rComAudio").checked;
      const dest = ac().createMediaStreamDestination();
      if (comAudio) dest.stream.getAudioTracks().forEach(tr => stream.addTrack(tr));
      const rec = new MediaRecorder(stream, { mimeType: mime || undefined, videoBitsPerSecond: 8_000_000, audioBitsPerSecond: 160_000 });
      const partes = []; rec.ondataavailable = e => { if (e.data.size) partes.push(e.data); };
      const fim = new Promise(r => { rec.onstop = r; });
      const btn = $("#rExport"); btn.disabled = true; tocandoGlobal = true;
      quadro(ctx, 0); rec.start(250);
      const s = agendarAudio(comAudio ? dest : ac().createGain(), 0); const dt = total();
      await new Promise(res => {
        const passo = () => {
          t = Math.max(0, ac().currentTime - s.agora);
          quadro(ctx, Math.min(t, dt)); const pct = Math.min(100, Math.round(100 * t / dt));
          $("#rExpMsg").innerHTML = `<div class="info">Gravando vídeo… ${pct}% — mantenha esta aba aberta e visível.</div>`;
          if (t >= dt + .3) return res(); requestAnimationFrame(passo);
        }; passo();
      });
      rec.stop(); await fim; s.parar(); tocandoGlobal = false; pausarVideos(); btn.disabled = false;
      const ext = (rec.mimeType || mime).includes("mp4") ? "mp4" : "webm";
      baixar(`reels.${ext}`, new Blob(partes, { type: rec.mimeType || mime }));
      $("#rExpMsg").innerHTML = `<div class="sucesso">Vídeo exportado (${ext.toUpperCase()}, ${dt.toFixed(1)} s, 1080×1920${comAudio ? ", com áudio" : ""}).${ext === "webm" ? " Se o Instagram recusar, converta para MP4." : ""}</div>`;
    });

    editores(); atualizaDur();
    const fontes = ["800 40px Montserrat", "600 40px Cinzel", "800 40px Cinzel", "600 40px 'Cormorant Garamond'"];
    Promise.all([carregarTudo(), document.fonts ? Promise.all(fontes.map(f => document.fonts.load(f))) : null].map(p => Promise.resolve(p).catch(() => {}))).then(() => { editores(); atualizaDur(); desenhar(); });
    desenhar();
  }

  rotas.reels = viewReels;
})();
