/* Aulas de Pilates: biblioteca de vídeos próprios por exercício (upload, câmera ou link), montador de aulas em sequência e modo aula. */
(function () {
  "use strict";
  const { $, $$, esc, store, app, rotas, tabs, norm } = window.FR;
  const APARELHOS = ["Pilates — Reformer", "Pilates — Solo", "Pilates — Cadillac", "Pilates — Chair", "Pilates — Barrel"];
  const NIVEIS = ["Iniciante", "Intermediário", "Avançado"];

  // ---------------------------------------------------------------- dados
  const customs = () => store.get("aula_ex_custom", []);
  const todosEx = () => [...EXERCICIOS.filter(e => e.cat.startsWith("Pilates")), ...customs()];
  const exPorId = id => todosEx().find(e => e.id === id) || EXERCICIOS.find(e => e.id === id);
  const links = () => store.get("ex_videos", {});           // mesmo armazenamento usado na prescrição
  const refs = () => store.get("ex_ref", {});               // referência de estudo (ex.: Reformer Library)
  const aulas = () => store.get("aulas", []);
  const salvarAulas = l => store.set("aulas", l);

  // vídeos enviados/gravados ficam no IndexedDB do aparelho (o mesmo banco das mídias dos Reels; entram no backup)
  const IDB = (() => {
    let dbp = null;
    const db = () => dbp || (dbp = new Promise((res, rej) => { const r = indexedDB.open("fisio_midia", 1); r.onupgradeneeded = () => r.result.createObjectStore("m"); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }));
    const tx = (modo, fn) => db().then(d => new Promise((res, rej) => { const t = d.transaction("m", modo); const q = fn(t.objectStore("m")); t.oncomplete = () => res(q && q.result); t.onerror = () => rej(t.error); }));
    return { put: (k, v) => tx("readwrite", s => s.put(v, k)), get: k => tx("readonly", s => s.get(k)), del: k => tx("readwrite", s => s.delete(k)) };
  })();
  const chaveVideo = id => "exvid_" + id;
  const temArquivo = () => store.get("ex_videos_arquivo", {}); // índice: quais exercícios têm vídeo enviado
  const urls = {};
  async function urlArquivo(id) { if (urls[id]) return urls[id]; const b = await IDB.get(chaveVideo(id)).catch(() => null); if (!b) return null; return (urls[id] = URL.createObjectURL(b)); }

  const idYoutube = u => { const m = String(u || "").match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/))([\w-]{11})/); return m ? m[1] : null; };
  const buscaYoutube = e => `https://www.youtube.com/results?search_query=${encodeURIComponent((e.cat.startsWith("Pilates") ? "pilates " + e.cat.replace("Pilates — ", "").toLowerCase() + " " : "") + e.nome.replace(/\s*\(.*?\)/g, "") + " como fazer")}`;

  // Monta o player do exercício (arquivo > link do YouTube > outro link > busca)
  async function htmlVideo(e, grande = false) {
    const arq = temArquivo()[e.id] ? await urlArquivo(e.id) : null;
    if (arq) return `<video class="ex-player${grande ? " grande" : ""}" src="${arq}" controls playsinline loop preload="metadata"></video>`;
    const l = links()[e.id], yt = idYoutube(l);
    if (yt) return `<div class="ex-player${grande ? " grande" : ""} yt"><iframe src="https://www.youtube-nocookie.com/embed/${yt}?rel=0" title="${esc(e.nome)}" allow="encrypted-media; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`;
    if (l) return `<a class="btn" target="_blank" rel="noopener" href="${esc(l)}">▶ Abrir seu vídeo</a>`;
    return `<div class="ex-sem-video">Sem vídeo ainda. <a target="_blank" rel="noopener" href="${esc(buscaYoutube(e))}">Ver exemplos no YouTube ↗</a></div>`;
  }

  // ---------------------------------------------------------------- aulas-modelo (exemplos editáveis)
  const it = (id, reps, carga = "", seg = 120) => ({ id, reps, carga, seg, obs: "" });
  const MODELOS = [
    { titulo: "Reformer iniciante", aparelho: "Pilates — Reformer", nivel: "Iniciante", objetivo: "Mobilidade da coluna, força global e controle do centro", itens: [
      it("pr_footwork", "10 por posição (calcanhar, metatarso, aberto)", "média/pesada", 240), it("pr_hundred", "50–100 batidas", "leve", 90), it("pr_leg_circles", "6 por direção", "leve", 150),
      it("pr_frog", "8", "leve", 90), it("pr_pelvic_lift", "8", "média", 120), it("pr_arms_supine", "8 por movimento", "leve", 180), it("pr_rowing", "8", "leve", 150),
      it("pr_short_box_round", "6", "leve", 120), it("pr_elephant", "8", "leve", 120), it("pr_side_lying", "10 por lado", "leve", 180), it("pr_mermaid", "4 por lado", "leve", 120)] },
    { titulo: "Solo para a coluna", aparelho: "Pilates — Solo", nivel: "Iniciante", objetivo: "Mobilidade segmentar, respiração e estabilidade lombopélvica", itens: [
      it("c_respiracao", "3 min", "", 180), it("mob_gato", "10", "", 90), it("ps_bridging", "8", "", 120), it("ps_hundred", "50 batidas", "", 90), it("ps_roll_up_prep", "6", "", 120),
      it("ps_single_leg_stretch", "8 por lado", "", 90), it("ps_side_kick", "10 por lado", "", 180), it("ps_swan", "6", "", 90), it("ps_swimming", "30 s", "", 60), it("ps_spine_twist", "6 por lado", "", 90), it("ps_mermaid", "4 por lado", "", 120)] },
    { titulo: "Reformer intermediário", aparelho: "Pilates — Reformer", nivel: "Intermediário", objetivo: "Força, resistência do centro e integração de membros", itens: [
      it("pr_footwork", "10 por posição", "pesada", 240), it("pr_running", "20 alternâncias", "pesada", 90), it("pr_hundred", "100 batidas", "média", 90), it("pr_feet_straps", "8 por série", "leve", 180),
      it("pr_short_box_twist", "4 por lado", "leve", 150), it("pr_long_stretch", "5", "leve", 120), it("pr_knee_stretch", "8 por variação", "média", 150), it("pr_scooter", "10 por lado", "média", 180),
      it("pr_side_split", "8", "leve", 150), it("pr_kneeling_arms", "8 por movimento", "leve", 180), it("pr_stomach_massage", "6 por variação", "média", 150), it("pr_mermaid", "4 por lado", "leve", 120)] }
  ];
  const duracao = a => a.itens.reduce((s, x) => s + (+x.seg || 0) + 30, 0); // + 30 s de transição
  const fmtMin = s => `${Math.round(s / 60)} min`;

  // ---------------------------------------------------------------- tela
  function view(sub, id) {
    app.innerHTML = `<h1>🎥 Aulas de Pilates</h1>
      <p class="muted">Sua biblioteca de vídeos por exercício (envie, grave pela câmera do celular ou cole um link) e montador de aulas em sequência para conduzir a turma ou enviar ao aluno.</p>
      ${tabs("tabAulas", [["videos", "Biblioteca de vídeos"], ["montar", "Montar aula"], ["salvas", `Minhas aulas (${aulas().length})`]], sub && ["videos", "montar", "salvas"].includes(sub) ? sub : "videos", (k, el) => ({ videos: tabVideos, montar: el2 => tabMontar(el2, id), salvas: tabSalvas })[k](el), !!sub)}`;
  }

  // ---- biblioteca
  function tabVideos(el) {
    const st = store.get("aulas_filtro", { ap: "Pilates — Reformer", q: "" });
    el.innerHTML = `<div class="row"><select id="avAp" style="max-width:240px"><option value="">Todos os aparelhos</option>${APARELHOS.map(a => `<option ${st.ap === a ? "selected" : ""}>${esc(a)}</option>`).join("")}</select>
        <input type="search" id="avQ" placeholder="Buscar exercício" value="${esc(st.q)}" style="max-width:280px">
        <label class="check"><input type="checkbox" id="avSem"> Só os sem vídeo</label><button class="btn sec peq" id="avNovo">+ Exercício próprio</button></div>
      <div id="avNovoForm"></div>
      <p class="muted" style="font-size:.85rem">💡 No celular, "📹 Gravar" abre a câmera: grave cada exercício em 15–30 s, de lado, com boa luz. Os vídeos ficam guardados neste aparelho (e entram no backup). Para mandar ao aluno, use um link (ex.: YouTube "não listado").</p>
      <div id="avLista" class="av-grid"></div>`;
    const desenhar = async () => {
      const ap = $("#avAp", el).value, q = norm($("#avQ", el).value), sem = $("#avSem", el).checked;
      store.set("aulas_filtro", { ap, q: $("#avQ", el).value });
      const arq = temArquivo(), lk = links();
      const l = todosEx().filter(e => (!ap || e.cat === ap) && (!q || norm(e.nome).includes(q)) && (!sem || (!arq[e.id] && !lk[e.id])));
      $("#avLista", el).innerHTML = l.map(e => `<div class="card av-card" data-e="${e.id}"><div class="av-video" id="v-${e.id}"></div>
        <b>${esc(e.nome)}</b> <span class="tag">${esc(e.cat.replace("Pilates — ", ""))}</span>${e.custom ? `<span class="tag">próprio</span>` : ""}${arq[e.id] ? `<span class="tag ok">🎥 vídeo seu</span>` : lk[e.id] ? `<span class="tag ok">🔗 link</span>` : ""}
        <details><summary>Como fazer e cuidados</summary><p>${esc(e.como)}</p>${e.cuidados ? `<p><b>Cuidados:</b> ${esc(e.cuidados)}</p>` : ""}${e.dose ? `<p class="muted">${esc(e.dose)}</p>` : ""}</details>
        <div class="row" style="margin-top:6px"><label class="btn peq" style="cursor:pointer">📹 Gravar<input type="file" accept="video/*" capture="environment" data-up="${e.id}" hidden></label>
          <label class="btn peq sec" style="cursor:pointer">📂 Enviar<input type="file" accept="video/*" data-up="${e.id}" hidden></label>${arq[e.id] ? `<button class="btn peq perigo" data-rmv="${e.id}">Apagar vídeo</button>` : ""}${e.custom ? `<button class="btn peq perigo" data-rmex="${e.id}">Excluir exercício</button>` : ""}</div>
        <input type="url" data-lk="${e.id}" placeholder="…ou cole um link (YouTube toca aqui dentro)" value="${esc(lk[e.id] || "")}">
        <input type="url" data-ref="${e.id}" placeholder="Referência de estudo (ex.: link da Reformer Library)" value="${esc(refs()[e.id] || "")}">
        ${refs()[e.id] ? `<a class="muted" style="font-size:.8rem" target="_blank" rel="noopener" href="${esc(refs()[e.id])}">Abrir referência ↗</a>` : ""}</div>`).join("") || `<p class="muted">Nenhum exercício encontrado.</p>`;
      for (const e of l) { const d = $(`#v-${CSS.escape(e.id)}`, el); if (d) d.innerHTML = await htmlVideo(e); }
    };
    const filtro = e => ["avAp", "avQ", "avSem"].includes(e.target.id);
    el.addEventListener("input", e => { if (filtro(e)) desenhar(); });
    el.addEventListener("change", async e => {
      if (filtro(e)) return desenhar();
      const up = e.target.dataset.up;
      if (up && e.target.files[0]) {
        const f = e.target.files[0];
        if (f.size > 300 * 1024 * 1024) { alert("Vídeo muito grande (máx. 300 MB). Grave trechos de 15–30 s."); return; }
        const card = e.target.closest(".av-card"); card.querySelector(".av-video").innerHTML = `<p class="muted">Salvando vídeo…</p>`;
        try { await IDB.put(chaveVideo(up), f); const t = temArquivo(); t[up] = true; store.set("ex_videos_arquivo", t); if (urls[up]) { URL.revokeObjectURL(urls[up]); delete urls[up]; } }
        catch (err) { alert("Não foi possível salvar o vídeo (espaço do aparelho?)."); }
        return desenhar();
      }
      const lk = e.target.dataset.lk, rf = e.target.dataset.ref;
      if (lk || rf) {
        const v = e.target.value.trim(); if (v && !/^https?:\/\//i.test(v)) { e.target.setCustomValidity("Use um link começando com https://"); e.target.reportValidity(); return; }
        e.target.setCustomValidity(""); const k = lk ? "ex_videos" : "ex_ref"; const o = store.get(k, {}); const id = lk || rf; if (v) o[id] = v; else delete o[id]; store.set(k, o);
        if (lk) desenhar();
      }
    });
    el.addEventListener("click", async e => {
      const rm = e.target.dataset.rmv; if (rm) { if (!confirm("Apagar o vídeo deste exercício?")) return; await IDB.del(chaveVideo(rm)).catch(() => {}); const t = temArquivo(); delete t[rm]; store.set("ex_videos_arquivo", t); return desenhar(); }
      const rx = e.target.dataset.rmex; if (rx) { if (!confirm("Excluir este exercício próprio?")) return; store.set("aula_ex_custom", customs().filter(x => x.id !== rx)); return desenhar(); }
      if (e.target.id === "avNovo") {
        $("#avNovoForm", el).innerHTML = `<div class="card"><h3>Novo exercício</h3><div class="form-grid"><div><label>Nome</label><input type="text" id="nxNome"></div><div><label>Aparelho</label><select id="nxAp">${APARELHOS.map(a => `<option>${esc(a)}</option>`).join("")}</select></div><div><label>Carga/molas e dose</label><input type="text" id="nxDose" placeholder="ex.: mola média · 8 repetições"></div></div>
          <label>Como fazer (pontos-chave de instrução)</label><textarea id="nxComo"></textarea><label>Cuidados</label><input type="text" id="nxCuid"><div class="row" style="margin-top:8px"><button class="btn" id="nxSalvar">Adicionar</button><button class="btn sec" id="nxCancelar">Cancelar</button></div></div>`;
      }
      if (e.target.id === "nxCancelar") $("#avNovoForm", el).innerHTML = "";
      if (e.target.id === "nxSalvar") {
        const nome = $("#nxNome", el).value.trim(); if (!nome) return alert("Informe o nome.");
        const l = customs(); l.push({ id: "cx" + Date.now().toString(36), nome, cat: $("#nxAp", el).value, como: $("#nxComo", el).value.trim(), cuidados: $("#nxCuid", el).value.trim(), dose: $("#nxDose", el).value.trim(), regioes: ["global"], fases: "PR", progressao: "", custom: true });
        const apNovo = $("#nxAp", el).value; store.set("aula_ex_custom", l); $("#avNovoForm", el).innerHTML = ""; $("#avAp", el).value = apNovo; desenhar();
      }
    });
    desenhar();
  }

  // ---- montar aula
  const novaAula = () => ({ id: "au" + Date.now().toString(36), titulo: "Nova aula", aparelho: "Pilates — Reformer", nivel: "Iniciante", objetivo: "", itens: [] });
  function tabMontar(el, idAula) {
    let a = aulas().find(x => x.id === idAula) || store.get("aula_rascunho", null) || novaAula();
    const rasc = () => store.set("aula_rascunho", a);
    const desenhar = () => {
      el.innerHTML = `<div class="grid-2" style="align-items:start"><div>
        <div class="card" id="maForm"><div class="row" style="justify-content:space-between"><h3 style="margin:0">Aula</h3><span class="tag ok">≈ ${fmtMin(duracao(a))} · ${a.itens.length} exercícios</span></div>
          <div class="form-grid"><div><label>Título</label><input type="text" data-a="titulo" value="${esc(a.titulo)}"></div>
            <div><label>Aparelho principal</label><select data-a="aparelho">${APARELHOS.map(x => `<option ${a.aparelho === x ? "selected" : ""}>${esc(x)}</option>`).join("")}</select></div>
            <div><label>Nível</label><select data-a="nivel">${NIVEIS.map(x => `<option ${a.nivel === x ? "selected" : ""}>${x}</option>`).join("")}</select></div></div>
          <label>Objetivo da aula</label><input type="text" data-a="objetivo" value="${esc(a.objetivo)}" placeholder="ex.: mobilidade da coluna e força de glúteos">
          <div class="row" style="margin-top:10px"><button class="btn" id="maSalvar">💾 Salvar aula</button><button class="btn sec" id="maConduzir">▶ Conduzir</button><button class="btn sec peq" id="maNova">Nova</button>
            <select id="maModelo" style="max-width:240px"><option value="">Carregar aula-modelo…</option>${MODELOS.map((m, i) => `<option value="${i}">${esc(m.titulo)}</option>`).join("")}</select></div><div id="maMsg"></div></div>
        <div class="card"><h3>Sequência</h3><div id="maItens">${a.itens.length ? a.itens.map((x, i) => { const e = exPorId(x.id); return `<div class="pg-item" data-i="${i}"><div class="row" style="justify-content:space-between"><b>${i + 1}. ${esc(e ? e.nome : x.id)}</b><span><button class="btn sec peq" data-mv="-1">↑</button><button class="btn sec peq" data-mv="1">↓</button><button class="btn peq perigo" data-rm="1">✖</button></span></div>
            <div class="form-grid"><div><label>Repetições/tempo</label><input type="text" data-d="reps" value="${esc(x.reps)}"></div><div><label>Carga/molas</label><input type="text" data-d="carga" value="${esc(x.carga)}"></div><div><label>Duração (s)</label><input type="number" min="0" data-d="seg" value="${esc(x.seg)}"></div></div>
            <input type="text" data-d="obs" value="${esc(x.obs || "")}" placeholder="Pontos de instrução / adaptação"></div>`; }).join("") : `<p class="muted">Adicione exercícios da lista ao lado ou carregue uma aula-modelo.</p>`}</div></div></div>
        <div class="card" style="position:sticky;top:76px"><h3>Adicionar exercícios</h3><div class="row"><select id="maFiltro" style="max-width:220px">${APARELHOS.map(x => `<option ${a.aparelho === x ? "selected" : ""}>${esc(x)}</option>`).join("")}<option value="">Todos (inclui não Pilates)</option></select><input type="search" id="maQ" placeholder="Buscar"></div>
          <div id="maLista" class="ma-lista"></div></div></div>`;
      lista();
    };
    const lista = () => {
      const f = $("#maFiltro", el).value, q = norm($("#maQ", el).value);
      const base = f ? todosEx().filter(e => e.cat === f) : [...EXERCICIOS, ...customs()];
      $("#maLista", el).innerHTML = base.filter(e => !q || norm(e.nome).includes(q)).map(e => `<div class="row ma-ex" style="justify-content:space-between"><span>${esc(e.nome)} ${temArquivo()[e.id] || links()[e.id] ? "🎥" : ""}</span><button class="btn peq" data-add="${e.id}">+</button></div>`).join("");
    };
    desenhar();
    el.addEventListener("input", e => {
      const k = e.target.dataset.a; if (k) { a[k] = e.target.value; rasc(); }
      const d = e.target.dataset.d; if (d) { a.itens[+e.target.closest("[data-i]").dataset.i][d] = d === "seg" ? +e.target.value : e.target.value; rasc(); }
      if (e.target.id === "maQ") lista();
    });
    el.addEventListener("change", e => {
      if (e.target.id === "maFiltro") lista();
      if (e.target.id === "maModelo" && e.target.value !== "") { if (a.itens.length && !confirm("Substituir a aula atual pela aula-modelo?")) { e.target.value = ""; return; } const m = MODELOS[+e.target.value]; a = { ...JSON.parse(JSON.stringify(m)), id: "au" + Date.now().toString(36) }; rasc(); desenhar(); }
      if (e.target.dataset.d === "seg") desenhar();
    });
    el.addEventListener("click", e => {
      const ad = e.target.dataset.add; if (ad) { const ex = exPorId(ad); a.itens.push({ id: ad, reps: (ex.dose || "").split("·")[0].trim() || "8–10", carga: (ex.dose || "").split("·")[1]?.replace(/carga/i, "").trim() || "", seg: 120, obs: "" }); rasc(); desenhar(); return; }
      const box = e.target.closest("[data-i]");
      if (box && e.target.dataset.rm) { a.itens.splice(+box.dataset.i, 1); rasc(); desenhar(); return; }
      if (box && e.target.dataset.mv) { const i = +box.dataset.i, j = i + +e.target.dataset.mv; if (j < 0 || j >= a.itens.length) return; [a.itens[i], a.itens[j]] = [a.itens[j], a.itens[i]]; rasc(); desenhar(); return; }
      if (e.target.id === "maSalvar") { const l = aulas(); const k = l.findIndex(x => x.id === a.id); a.atualizado = new Date().toISOString(); if (k >= 0) l[k] = a; else l.push(a); salvarAulas(l); $("#maMsg", el).innerHTML = `<div class="sucesso">Aula salva em "Minhas aulas".</div>`; }
      if (e.target.id === "maConduzir") { if (!a.itens.length) return alert("Adicione exercícios."); conduzir(a); }
      if (e.target.id === "maNova") { if (a.itens.length && !confirm("Começar uma aula nova? (Aulas salvas continuam salvas.)")) return; a = novaAula(); rasc(); desenhar(); }
    });
  }

  // ---- aulas salvas
  function textoAula(a) {
    const m = window.MARCA.get();
    return `*${a.titulo}*\n${a.nivel} · ${a.aparelho.replace("Pilates — ", "")} · ≈ ${fmtMin(duracao(a))}${a.objetivo ? `\nObjetivo: ${a.objetivo}` : ""}\n\n` +
      a.itens.map((x, i) => { const e = exPorId(x.id); const l = links()[x.id]; return `${i + 1}. *${e ? e.nome : x.id}* — ${x.reps}${x.carga ? ` · carga ${x.carga}` : ""}${x.obs ? `\n   ${x.obs}` : ""}${l ? `\n   ▶ ${l}` : ""}`; }).join("\n") + `\n\n${m.nome} — ${m.sub}`;
  }
  function tabSalvas(el) {
    const l = aulas().slice().reverse();
    el.innerHTML = l.length ? l.map(a => `<div class="card"><div class="row" style="justify-content:space-between"><span><b>${esc(a.titulo)}</b> <small class="muted">· ${esc(a.nivel)} · ${esc(a.aparelho.replace("Pilates — ", ""))} · ${a.itens.length} exercícios · ≈ ${fmtMin(duracao(a))}</small></span>
      <span class="row"><button class="btn peq" data-cond="${a.id}">▶ Conduzir</button><a class="btn peq sec" href="#/aulas/montar/${a.id}">Editar</a><button class="btn peq sec" data-zap="${a.id}">WhatsApp</button><button class="btn peq sec" data-pdf="${a.id}">PDF</button><button class="btn peq sec" data-dup="${a.id}">Duplicar</button><button class="btn peq perigo" data-del="${a.id}">✖</button></span></div>
      ${a.objetivo ? `<p class="muted">${esc(a.objetivo)}</p>` : ""}</div>`).join("") : `<p class="muted">Nenhuma aula salva. Monte uma em "Montar aula" (comece por uma aula-modelo).</p>`;
    el.addEventListener("click", e => {
      const id = e.target.dataset.cond || e.target.dataset.zap || e.target.dataset.pdf || e.target.dataset.dup || e.target.dataset.del; if (!id) return;
      const a = aulas().find(x => x.id === id);
      if (e.target.dataset.cond) conduzir(a);
      if (e.target.dataset.zap) window.open(`https://wa.me/?text=${encodeURIComponent(textoAula(a))}`, "_blank", "noopener");
      if (e.target.dataset.pdf) window.MARCA.imprimir(a.titulo, `<p><b>${esc(a.nivel)}</b> · ${esc(a.aparelho)} · ≈ ${fmtMin(duracao(a))}${a.objetivo ? `<br><b>Objetivo:</b> ${esc(a.objetivo)}` : ""}</p>` +
        a.itens.map((x, i) => { const ex = exPorId(x.id); return `<div class="pa-ex"><b>${i + 1}. ${esc(ex ? ex.nome : x.id)}</b> — <i>${esc(x.reps)}${x.carga ? ` · carga ${esc(x.carga)}` : ""}</i><br>${esc(ex ? ex.como : "")}${x.obs ? `<br><b>Instrução:</b> ${esc(x.obs)}` : ""}</div>`; }).join(""));
      if (e.target.dataset.dup) { const l = aulas(); l.push({ ...JSON.parse(JSON.stringify(a)), id: "au" + Date.now().toString(36), titulo: a.titulo + " (cópia)" }); salvarAulas(l); tabSalvas(el); }
      if (e.target.dataset.del && confirm("Excluir esta aula?")) { salvarAulas(aulas().filter(x => x.id !== id)); tabSalvas(el); }
    });
  }

  // ---------------------------------------------------------------- modo aula
  async function conduzir(a) {
    let i = 0, restante = 0, timer = null, pausado = false, wake = null;
    const box = document.createElement("div"); box.className = "modo-aula"; document.body.appendChild(box);
    try { wake = await navigator.wakeLock?.request("screen"); } catch (e) { /* tela pode apagar */ }
    const fim = () => { clearInterval(timer); try { wake && wake.release(); } catch (e) { } box.remove(); document.removeEventListener("keydown", teclas); };
    const tick = () => { if (pausado) return; restante--; const t = $("#maTempo", box); if (t) t.textContent = fmtT(restante); if (restante <= 0) { clearInterval(timer); if (i < a.itens.length - 1) { i++; desenhar(); } else { const t2 = $("#maTempo", box); if (t2) t2.textContent = "Fim! 👏"; } } };
    const fmtT = s => s <= 0 ? "0:00" : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
    async function desenhar() {
      clearInterval(timer); const x = a.itens[i], e = exPorId(x.id), prox = a.itens[i + 1] && exPorId(a.itens[i + 1].id);
      restante = +x.seg || 0; pausado = false;
      box.innerHTML = `<div class="ma-topo"><span>${esc(a.titulo)} · ${i + 1}/${a.itens.length}</span><button class="btn sec peq" id="maSair">✕ Sair</button></div>
        <div class="ma-corpo"><div class="ma-video" id="maVid"></div><div class="ma-info"><h2>${esc(e ? e.nome : x.id)}</h2>
          <p class="ma-dose">${esc(x.reps)}${x.carga ? ` · carga ${esc(x.carga)}` : ""}</p>${x.obs ? `<p class="ma-obs">💬 ${esc(x.obs)}</p>` : ""}<p>${esc(e ? e.como : "")}</p>
          ${restante ? `<div class="ma-tempo" id="maTempo">${fmtT(restante)}</div>` : ""}
          ${prox ? `<p class="muted">A seguir: <b>${esc(prox.nome)}</b></p>` : `<p class="muted">Último exercício.</p>`}</div></div>
        <div class="ma-barra"><button class="btn sec" id="maAnt" ${i ? "" : "disabled"}>← Anterior</button>${restante ? `<button class="btn sec" id="maPausa">⏸ Pausar</button>` : ""}<button class="btn" id="maProx">${i < a.itens.length - 1 ? "Próximo →" : "Concluir"}</button></div>`;
      if (e) $("#maVid", box).innerHTML = await htmlVideo(e, true);
      const v = $("video", box); if (v) { v.muted = true; v.play().catch(() => {}); }
      if (restante) timer = setInterval(tick, 1000);
    }
    box.addEventListener("click", e => {
      if (e.target.id === "maSair") fim();
      if (e.target.id === "maAnt" && i > 0) { i--; desenhar(); }
      if (e.target.id === "maProx") { if (i < a.itens.length - 1) { i++; desenhar(); } else fim(); }
      if (e.target.id === "maPausa") { pausado = !pausado; e.target.textContent = pausado ? "▶ Continuar" : "⏸ Pausar"; }
    });
    const teclas = ev => { if (ev.key === "ArrowRight") $("#maProx", box)?.click(); if (ev.key === "ArrowLeft") $("#maAnt", box)?.click(); if (ev.key === "Escape") fim(); };
    document.addEventListener("keydown", teclas);
    desenhar();
  }

  rotas.aulas = view;
})();
