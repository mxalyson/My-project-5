/* Identidade visual (verde-escuro + dourado, serifada) compartilhada pelo app, posts e Reels,
   instalação como app (PWA) e registro do service worker. */
(function () {
  "use strict";
  const { $, store } = window.FR;
  const PADRAO = { nome: "Alyson Tavares", sub: "Pilates & Fisioterapia", mono: "AT", perfil: "@alysontavaresfisio", rodape: "Avaliação • Tratamento • Acompanhamento", lema: "Seu bem-estar em boas mãos" };
  // Migração: troca @ antigos/genéricos já salvos neste aparelho pelo @ oficial
  ["marca", "ig_estado", "reels_estado"].forEach(k => {
    const v = store.get(k, null);
    if (v && ["@alysontavares", "@seuperfil", ""].includes(v.perfil)) { v.perfil = PADRAO.perfil; store.set(k, v); }
  });
  const get = () => Object.assign({}, PADRAO, store.get("marca", {}));
  const set = m => { store.set("marca", m); aplicarCabecalho(); };

  // Tema de canvas "Marca": usado nos posts e Reels
  const TEMA = {
    nome: "Marca — verde e dourado", marca: true,
    bg: "#4a6c5e", bg2: "#3a5649", fg: "#f4ecd8", acc: "#d6b26a", sub: "#e7dcc0", card: "rgba(214,178,106,.10)",
    fTit: '"Cinzel", "Cormorant Garamond", Georgia, serif', fCorpo: '"Cormorant Garamond", Georgia, serif'
  };
  function ouro(ctx, x0, x1) {
    const g = ctx.createLinearGradient(x0, 0, x1, 0);
    g.addColorStop(0, "#f3dc9b"); g.addColorStop(.45, "#c9a35b"); g.addColorStop(.75, "#f0d48f"); g.addColorStop(1, "#b88a3e");
    return g;
  }
  // Fundo com curvas douradas (sem fotos) — inspirado no material da marca
  function fundo(ctx, W, H, t = 0) {
    const g = ctx.createRadialGradient(W * .3, H * .25, 50, W * .5, H * .5, Math.max(W, H));
    g.addColorStop(0, "#557a6a"); g.addColorStop(.55, "#4a6c5e"); g.addColorStop(1, "#3a5649"); // verde da marca
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const d = Math.sin(t * .35) * 18;
    ctx.save(); ctx.lineCap = "round";
    // grande arco à direita
    ctx.strokeStyle = ouro(ctx, W * .55, W); ctx.lineWidth = 5; ctx.globalAlpha = .9;
    ctx.beginPath(); ctx.moveTo(W * .98, -20); ctx.bezierCurveTo(W * .62 + d, H * .25, W * .78 - d, H * .55, W * 1.05, H * .78); ctx.stroke();
    ctx.lineWidth = 1.5; ctx.globalAlpha = .45;
    ctx.beginPath(); ctx.moveTo(W * 1.02, -20); ctx.bezierCurveTo(W * .68 + d, H * .27, W * .84 - d, H * .55, W * 1.08, H * .74); ctx.stroke();
    // onda inferior
    ctx.strokeStyle = ouro(ctx, 0, W); ctx.lineWidth = 4; ctx.globalAlpha = .85;
    ctx.beginPath(); ctx.moveTo(-20, H * .93); ctx.quadraticCurveTo(W * .5, H * .80 - d, W + 20, H * .86); ctx.stroke();
    ctx.restore();
  }
  // Logos oficiais (arquivos da marca)
  const IMG = {};
  [["mono", "icons/monograma.png"], ["dourada", "icons/logo-dourada.png"], ["verde", "icons/logo-verde.png"]].forEach(([k, src]) => { const i = new Image(); i.src = src; IMG[k] = i; });
  const pronto = Promise.all(Object.values(IMG).map(i => i.decode().catch(() => {})));
  const desenhaImg = (ctx, img, cx, cy, w) => { if (!img || !img.naturalWidth) return 0; const h = w * img.naturalHeight / img.naturalWidth; ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h); return h; };
  // Monograma AT dourado (logo oficial)
  function monograma(ctx, cx, cy, r) { desenhaImg(ctx, IMG.mono, cx, cy, r * 2); }
  // Logo completa (monograma + nome em círculo), versão para fundo escuro
  function logo(ctx, cx, cy, w) { return desenhaImg(ctx, IMG.dourada, cx, cy, w); }
  // Assinatura: monograma + nome + subtítulo
  function assinatura(ctx, x, y, escala = 1) {
    const m = get(); const r = 46 * escala;
    monograma(ctx, x + r, y + r, r);
    ctx.save(); ctx.textBaseline = "alphabetic"; ctx.textAlign = "left";
    ctx.fillStyle = "#f4ecd8"; ctx.font = `500 ${40 * escala}px ${TEMA.fTit}`;
    espacado(ctx, m.nome.toUpperCase(), x + 2 * r + 24 * escala, y + r + 4 * escala, 3 * escala);
    ctx.fillStyle = "#e7dcc0"; ctx.font = `600 ${17 * escala}px "Montserrat", sans-serif`;
    espacado(ctx, m.sub.toUpperCase(), x + 2 * r + 26 * escala, y + r + 36 * escala, 4 * escala);
    ctx.restore();
  }
  function espacado(ctx, txt, x, y, esp, centro = false) {
    let w = 0; for (const ch of txt) w += ctx.measureText(ch).width + esp; w -= esp;
    let cx = centro ? x - w / 2 : x;
    for (const ch of txt) { ctx.fillText(ch, cx, y); cx += ctx.measureText(ch).width + esp; }
  }
  function rodape(ctx, W, y) {
    const m = get(); if (!m.rodape) return;
    ctx.save(); ctx.fillStyle = "#d6b26a"; ctx.font = `600 22px "Montserrat", sans-serif`; ctx.textBaseline = "middle";
    espacado(ctx, m.rodape.toUpperCase(), W / 2, y, 5, true); ctx.restore();
  }

  // ---------------------------------------------------------------- cabeçalho do app
  function aplicarCabecalho() {
    const m = get(); const b = $(".brand"); if (!b) return;
    b.innerHTML = `<img src="icons/monograma.png" alt=""><span><span class="bn">${FR.esc(m.nome)}</span><span class="bs">${FR.esc(m.sub)}</span></span>`;
    document.title = `${m.nome} — Estudo e Raciocínio Clínico`;
  }
  aplicarCabecalho();

  // ---------------------------------------------------------------- PWA
  let promptInstalar = null;
  window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); promptInstalar = e; const b = $("#btnInstalar"); if (b) b.hidden = false; });
  window.addEventListener("appinstalled", () => { const b = $("#btnInstalar"); if (b) b.hidden = true; });
  document.addEventListener("click", async e => {
    if (e.target.id !== "btnInstalar") return;
    if (promptInstalar) { promptInstalar.prompt(); await promptInstalar.userChoice; promptInstalar = null; e.target.hidden = true; }
  });
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }

  window.MARCA = { get, set, PADRAO, TEMA, ouro, fundo, monograma, logo, assinatura, espacado, rodape, IMG, pronto };
})();
