/* Identidade visual (verde-escuro + dourado, serifada) compartilhada pelo app, posts e Reels,
   instalação como app (PWA) e registro do service worker. */
(function () {
  "use strict";
  const { $, store } = window.FR;
  const PADRAO = { nome: "Alyson Tavares", sub: "Pilates & Fisioterapia", mono: "AT", perfil: "@alysontavares", rodape: "Avaliação • Tratamento • Acompanhamento", lema: "Seu bem-estar em boas mãos" };
  const get = () => Object.assign({}, PADRAO, store.get("marca", {}));
  const set = m => { store.set("marca", m); aplicarCabecalho(); };

  // Tema de canvas "Marca": usado nos posts e Reels
  const TEMA = {
    nome: "Marca — verde e dourado", marca: true,
    bg: "#0b3b2c", bg2: "#05231a", fg: "#f4ecd8", acc: "#d6b26a", sub: "#e7dcc0", card: "rgba(214,178,106,.10)",
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
    g.addColorStop(0, "#11523d"); g.addColorStop(.55, "#0b3b2c"); g.addColorStop(1, "#04201a");
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
  // Monograma em círculo dourado
  function monograma(ctx, cx, cy, r) {
    const m = get();
    ctx.save(); ctx.strokeStyle = ouro(ctx, cx - r, cx + r); ctx.lineWidth = Math.max(2, r * .06);
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = Math.max(1, r * .015); ctx.globalAlpha = .7; ctx.beginPath(); ctx.arc(cx, cy, r * .88, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
    ctx.fillStyle = ouro(ctx, cx - r, cx + r); ctx.font = `600 ${r * .78}px ${TEMA.fTit}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(m.mono, cx, cy + r * .05); ctx.restore();
  }
  // Assinatura: monograma + nome + subtítulo
  function assinatura(ctx, x, y, escala = 1) {
    const m = get(); const r = 46 * escala;
    monograma(ctx, x + r, y + r, r);
    ctx.save(); ctx.textBaseline = "alphabetic"; ctx.textAlign = "left";
    ctx.fillStyle = ouro(ctx, x + 2 * r, x + 2 * r + 600 * escala); ctx.font = `500 ${40 * escala}px ${TEMA.fTit}`;
    ctx.fillText(m.nome.toUpperCase(), x + 2 * r + 24 * escala, y + r + 4 * escala);
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
    b.innerHTML = `<img src="icons/logo.svg" alt=""><span><span class="bn">${FR.esc(m.nome)}</span><span class="bs">${FR.esc(m.sub)}</span></span>`;
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

  window.MARCA = { get, set, PADRAO, TEMA, ouro, fundo, monograma, assinatura, espacado, rodape };
})();
