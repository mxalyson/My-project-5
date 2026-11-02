/* Exercícios e Pilates: biblioteca + montagem de programas por condição e fase, com PDF e WhatsApp. */
(function () {
  "use strict";
  const { $, $$, esc, store, app, rotas, tabs, norm, regiaoNome } = window.FR;
  const FASE_NOME = { I: "Inflamatória (aguda)", P: "Proliferativa (subaguda)", R: "Remodelação / retorno" };
  const FASE_ID = { I: "inflamatoria", P: "proliferativa", R: "remodelacao" };
  const ex = id => EXERCICIOS.find(e => e.id === id);
  const programas = () => store.get("programas", []);
  const salvarProgramas = l => store.set("programas", l);
  const pacientes = () => store.get("pacientes", []);

  function viewExercicios(sub, idPrograma) {
    app.innerHTML = `<h1>🏋️ Exercícios e Pilates</h1>
      <p class="muted">Biblioteca de ${EXERCICIOS.length} exercícios (incluindo Pilates solo e aparelhos) e montagem de programas por condição e fase do reparo, com PDF da sua marca e envio por WhatsApp.</p>
      ${tabs("tabEx", [["montar", "Montar programa"], ["programas", `Programas salvos (${programas().length})`], ["biblioteca", "Biblioteca"]], sub === "biblioteca" ? "biblioteca" : sub === "programas" ? "programas" : "montar", (k, el) => {
        if (k === "biblioteca") viewBiblioteca(el);
        if (k === "montar") viewMontar(el, idPrograma);
        if (k === "programas") viewProgramas(el);
      }, !!sub)}`;
  }

  // ---------------------------------------------------------------- biblioteca
  function cartaoEx(e, extra = "") {
    return `<details class="ex-card"><summary><b>${esc(e.nome)}</b> <span class="tag">${esc(e.cat)}</span>${e.fases.split("").map(f => `<span class="tag ${f === "I" ? "bad" : f === "P" ? "warn" : "ok"}" title="${FASE_NOME[f]}">${f}</span>`).join("")} ${extra}</summary>
      <p><b>Dose sugerida:</b> ${esc(e.dose)}</p><p><b>Como fazer:</b> ${esc(e.como)}</p><p><b>Cuidados:</b> ${esc(e.cuidados)}</p><p><b>Progressão:</b> ${esc(e.progressao)}</p>
      <p class="muted">Regiões: ${e.regioes.map(r => r === "global" ? "global" : regiaoNome(r)).join(", ")}</p></details>`;
  }
  function viewBiblioteca(el) {
    el.innerHTML = `<div class="row"><input type="search" id="exQ" placeholder="Buscar (ex.: ponte, Reformer, ombro)" style="max-width:320px">
      <select id="exCat" style="max-width:220px"><option value="">Todas as categorias</option>${EX_CATEGORIAS.map(c => `<option>${esc(c)}</option>`).join("")}</select>
      <select id="exReg" style="max-width:220px"><option value="">Todas as regiões</option>${REGIOES.filter(r => r.id !== "atm").map(r => `<option value="${r.id}">${esc(r.nome)}</option>`).join("")}</select>
      <select id="exFase" style="max-width:220px"><option value="">Todas as fases</option>${Object.entries(FASE_NOME).map(([k, v]) => `<option value="${k}">${v}</option>`).join("")}</select></div>
      <p class="muted">Fases: <span class="tag bad">I</span> inflamatória · <span class="tag warn">P</span> proliferativa · <span class="tag ok">R</span> remodelação/retorno</p><div id="exLista"></div>`;
    const f = () => {
      const q = norm($("#exQ").value), c = $("#exCat").value, r = $("#exReg").value, fa = $("#exFase").value;
      const l = EXERCICIOS.filter(e => (!q || norm(e.nome + " " + e.cat + " " + e.como).includes(q)) && (!c || e.cat === c) && (!r || e.regioes.includes(r) || e.regioes.includes("global")) && (!fa || e.fases.includes(fa)));
      $("#exLista").innerHTML = l.map(e => cartaoEx(e)).join("") || `<p class="muted">Nenhum exercício encontrado.</p>`;
    };
    el.addEventListener("input", f); el.addEventListener("change", f); f();
  }

  // ---------------------------------------------------------------- montar programa
  const novoPrograma = () => ({ id: Date.now().toString(36), criado: new Date().toISOString(), titulo: "Programa de exercícios", pacienteId: "", pacienteNome: "", condicao: "", fase: "P", frequencia: "3 vezes por semana", orientacoes: "Dor durante o exercício até 3–5/10 é aceitável se voltar ao normal até a manhã seguinte. Se piorar, reduza a carga e me avise.", itens: [] });
  function viewMontar(el, idPrograma) {
    const lista = programas();
    let pg = lista.find(p => p.id === idPrograma) || store.get("programa_rascunho", null) || novoPrograma();
    const salvarRasc = () => store.set("programa_rascunho", pg);
    const desenhar = () => {
      const c = CONDICOES.find(x => x.id === pg.condicao);
      el.innerHTML = `<div class="grid-2" style="align-items:start"><div>
        <div class="card" id="pgForm"><h3>1. Para quem e para quê</h3><div class="form-grid">
          <div><label>Paciente</label><select data-k="pacienteId"><option value="">— sem vínculo —</option>${pacientes().map(p => `<option value="${p.id}" ${p.id === pg.pacienteId ? "selected" : ""}>${esc(p.nome)}</option>`).join("")}</select></div>
          <div><label>Nome (se não cadastrado)</label><input type="text" data-k="pacienteNome" value="${esc(pg.pacienteNome)}"></div>
          <div><label>Condição</label><select data-k="condicao"><option value="">— geral —</option>${CONDICOES.map(x => `<option value="${x.id}" ${x.id === pg.condicao ? "selected" : ""}>${esc(x.nome)}</option>`).join("")}</select></div>
          <div><label>Fase do reparo</label><select data-k="fase">${Object.entries(FASE_NOME).map(([k, v]) => `<option value="${k}" ${k === pg.fase ? "selected" : ""}>${v}</option>`).join("")}</select></div>
          <div><label>Título</label><input type="text" data-k="titulo" value="${esc(pg.titulo)}"></div>
          <div><label>Frequência</label><input type="text" data-k="frequencia" value="${esc(pg.frequencia)}"></div></div>
          <label>Orientações ao paciente</label><textarea data-k="orientacoes">${esc(pg.orientacoes)}</textarea>
          ${c ? `<div class="info"><b>Conduta da fase (${FASE_NOME[pg.fase]}):</b> ${esc(c.conduta[FASE_ID[pg.fase]].join(" · "))}</div>` : ""}</div>
        <div class="card"><h3>2. Sugestões para a condição e a fase</h3>
          <label class="check"><input type="checkbox" id="pgPilates" ${store.get("pg_pilates", true) ? "checked" : ""}> Incluir exercícios de Pilates (solo e aparelhos)</label>
          <div id="pgSug"></div></div></div>
        <div style="position:sticky;top:76px"><div class="card"><h3>3. Programa (${pg.itens.length} exercícios)</h3><div id="pgItens"></div>
          <div class="row" style="margin-top:10px"><button class="btn" id="pgSalvar">💾 Salvar programa</button><button class="btn sec" id="pgPdf">🖨 PDF / imprimir</button><button class="btn sec" id="pgZap">📲 WhatsApp</button><button class="btn sec peq" id="pgNovo">Novo</button></div><div id="pgMsg"></div></div></div></div>`;
      sugestoes(); itens();
    };
    const sugestoes = () => {
      const c = CONDICOES.find(x => x.id === pg.condicao); const comPilates = $("#pgPilates").checked; store.set("pg_pilates", comPilates);
      const regs = c ? [c.regiao] : [];
      const l = EXERCICIOS.filter(e => e.fases.includes(pg.fase) && (!regs.length || e.regioes.some(r => regs.includes(r)) || (c && c.regiao === "global" && e.regioes.includes("global"))) && (comPilates || !e.cat.startsWith("Pilates")));
      $("#pgSug").innerHTML = (l.length ? l : EXERCICIOS.filter(e => e.fases.includes(pg.fase))).map(e => cartaoEx(e, pg.itens.some(i => i.id === e.id) ? `<span class="tag ok">no programa</span>` : `<button class="btn peq" data-add="${e.id}">+ Adicionar</button>`)).join("");
    };
    const itens = () => {
      $("#pgItens").innerHTML = pg.itens.length ? pg.itens.map((it, k) => { const e = ex(it.id); return `<div class="pg-item" data-i="${k}"><div class="row" style="justify-content:space-between"><b>${k + 1}. ${esc(e ? e.nome : it.id)}</b><span><button class="btn sec peq" data-mv="-1">↑</button><button class="btn sec peq" data-mv="1">↓</button><button class="btn peq perigo" data-rm="1">✖</button></span></div>
        <div class="form-grid"><div><label>Dose</label><input type="text" data-d="dose" value="${esc(it.dose)}"></div><div><label>Observação</label><input type="text" data-d="obs" value="${esc(it.obs || "")}"></div></div></div>`; }).join("") : `<p class="muted">Adicione exercícios a partir das sugestões ou da biblioteca.</p>`;
    };
    desenhar();
    el.addEventListener("input", e => {
      const k = e.target.dataset.k; if (k) { pg[k] = e.target.value; salvarRasc(); }
      const d = e.target.dataset.d; if (d) { pg.itens[+e.target.closest("[data-i]").dataset.i][d] = e.target.value; salvarRasc(); }
    });
    el.addEventListener("change", e => {
      const k = e.target.dataset.k;
      if (k === "pacienteId") { const p = pacientes().find(x => x.id === e.target.value); if (p) pg.pacienteNome = p.nome; if (p && p.condicao && !pg.condicao) pg.condicao = p.condicao; salvarRasc(); desenhar(); }
      if (k === "condicao" || k === "fase") { salvarRasc(); desenhar(); }
      if (e.target.id === "pgPilates") sugestoes();
    });
    el.addEventListener("click", e => {
      const a = e.target.dataset.add; if (a) { const x = ex(a); pg.itens.push({ id: a, dose: x.dose, obs: "" }); salvarRasc(); itens(); sugestoes(); return; }
      const box = e.target.closest("[data-i]");
      if (box && e.target.dataset.rm) { pg.itens.splice(+box.dataset.i, 1); salvarRasc(); itens(); sugestoes(); return; }
      if (box && e.target.dataset.mv) { const i = +box.dataset.i, j = i + +e.target.dataset.mv; if (j < 0 || j >= pg.itens.length) return; [pg.itens[i], pg.itens[j]] = [pg.itens[j], pg.itens[i]]; salvarRasc(); itens(); return; }
      if (e.target.id === "pgSalvar") {
        const l = programas(); const i = l.findIndex(x => x.id === pg.id); pg.atualizado = new Date().toISOString();
        if (i >= 0) l[i] = pg; else l.push(pg); salvarProgramas(l);
        $("#pgMsg").innerHTML = `<div class="sucesso">Programa salvo${pg.pacienteId ? " e vinculado ao paciente" : ""}.</div>`;
      }
      if (e.target.id === "pgPdf") imprimirPrograma(pg);
      if (e.target.id === "pgZap") enviarWhatsApp(pg);
      if (e.target.id === "pgNovo") { if (pg.itens.length && !confirm("Começar um novo programa? O rascunho atual será descartado (programas salvos continuam salvos).")) return; pg = novoPrograma(); salvarRasc(); desenhar(); }
    });
  }

  function textoPrograma(pg) {
    const m = window.MARCA.get(); const nome = pg.pacienteNome || "";
    return `*${pg.titulo}*${nome ? `\nPaciente: ${nome}` : ""}\nFrequência: ${pg.frequencia}\n\n` +
      pg.itens.map((it, k) => { const e = ex(it.id); return `*${k + 1}. ${e.nome}*\n${it.dose}\n${e.como}${it.obs ? `\nObs.: ${it.obs}` : ""}`; }).join("\n\n") +
      `\n\n${pg.orientacoes}\n\n${m.nome} — ${m.sub}`;
  }
  function enviarWhatsApp(pg) {
    if (!pg.itens.length) return alert("Adicione exercícios ao programa.");
    const p = pacientes().find(x => x.id === pg.pacienteId); let tel = (p && p.telefone || "").replace(/\D/g, "");
    if (tel && tel.length <= 11) tel = "55" + tel;
    window.open(`https://wa.me/${tel}?text=${encodeURIComponent(textoPrograma(pg))}`, "_blank", "noopener");
  }
  function imprimirPrograma(pg) {
    if (!pg.itens.length) return alert("Adicione exercícios ao programa.");
    const c = CONDICOES.find(x => x.id === pg.condicao);
    window.MARCA.imprimir(pg.titulo, `<p><b>Paciente:</b> ${esc(pg.pacienteNome || "—")} · <b>Data:</b> ${new Date().toLocaleDateString("pt-BR")}${c ? ` · <b>Foco:</b> ${esc(c.nome.replace(/ — ENCAMINHAR$/, ""))}` : ""}<br><b>Frequência:</b> ${esc(pg.frequencia)}</p>
      ${pg.itens.map((it, k) => { const e = ex(it.id); return `<div class="pa-ex"><b>${k + 1}. ${esc(e.nome)}</b> — <i>${esc(it.dose)}</i><br>${esc(e.como)}${it.obs ? `<br><b>Obs.:</b> ${esc(it.obs)}` : ""}</div>`; }).join("")}
      <p style="margin-top:14px"><b>Orientações:</b> ${esc(pg.orientacoes)}</p>`);
  }

  function viewProgramas(el) {
    const l = programas().slice().reverse();
    el.innerHTML = l.length ? l.map(p => `<div class="card"><div class="row" style="justify-content:space-between"><span><b>${esc(p.titulo)}</b> <small class="muted">· ${esc(p.pacienteNome || "sem paciente")} · ${p.itens.length} exercícios · ${new Date(p.atualizado || p.criado).toLocaleDateString("pt-BR")}</small></span>
      <span class="row"><a class="btn peq" href="#/exercicios/montar/${p.id}">Abrir</a><button class="btn peq sec" data-pdf="${p.id}">PDF</button><button class="btn peq sec" data-zap="${p.id}">WhatsApp</button><button class="btn peq perigo" data-del="${p.id}">Excluir</button></span></div></div>`).join("") : `<p class="muted">Nenhum programa salvo.</p>`;
    el.addEventListener("click", e => {
      const id = e.target.dataset.pdf || e.target.dataset.zap || e.target.dataset.del; if (!id) return;
      const p = programas().find(x => x.id === id);
      if (e.target.dataset.pdf) imprimirPrograma(p);
      if (e.target.dataset.zap) enviarWhatsApp(p);
      if (e.target.dataset.del && confirm("Excluir este programa?")) { salvarProgramas(programas().filter(x => x.id !== id)); viewProgramas(el); }
    });
  }

  rotas.exercicios = (sub, id) => { if (sub === "montar" && id) store.set("programa_rascunho", programas().find(p => p.id === id) || null); viewExercicios(sub, id); };
  window.PRESCRICAO = { programas, imprimirPrograma, enviarWhatsApp, textoPrograma, ex };
})();
