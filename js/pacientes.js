/* Pacientes: cadastro, sessões (SOAP), evolução com gráficos e MCID, vínculo com avaliações e programas, relatório de alta. */
(function () {
  "use strict";
  const { $, $$, esc, store, app, rotas, tabs, norm } = window.FR;
  const lista = () => store.get("pacientes", []);
  const salvarLista = l => store.set("pacientes", l);
  const get = id => lista().find(p => p.id === id);
  const atualizar = p => { const l = lista(); const i = l.findIndex(x => x.id === p.id); p.atualizado = new Date().toISOString(); if (i >= 0) l[i] = p; else l.push(p); salvarLista(l); };
  const hoje = () => new Date().toISOString().slice(0, 10);
  const dataBR = d => d ? new Date(d + (d.length === 10 ? "T12:00" : "")).toLocaleDateString("pt-BR") : "—";
  const idade = n => { if (!n) return ""; const d = new Date(n), h = new Date(); let a = h.getFullYear() - d.getFullYear(); if (h < new Date(h.getFullYear(), d.getMonth(), d.getDate())) a--; return a; };
  // Desfechos em que um valor MAIOR significa melhora
  const MAIOR_MELHOR = /LEFS|KOOS|HOOS|PSFS|VISA|AKPS|Kujala|FAAM|Sentar e levantar|30 s/i;
  const mcidNum = nome => { const p = PROMS.find(x => x[0] === nome); const m = p && String(p[2]).match(/(\d+(?:[.,]\d+)?)/); return m ? parseFloat(m[1].replace(",", ".")) : null; };

  // ---------------------------------------------------------------- lista
  function viewPacientes() {
    const l = lista();
    app.innerHTML = `<h1>👥 Pacientes</h1>
      <p class="muted">Cadastro, sessões, evolução com gráficos e relatório de alta. Os dados ficam só neste aparelho — faça backup em ⚙️ Configurações.</p>
      <div class="card" id="pNovo"><h3>Novo paciente</h3><div class="form-grid">
        <div><label>Nome</label><input type="text" id="npNome"></div><div><label>Nascimento</label><input type="date" id="npNasc"></div>
        <div><label>Telefone (WhatsApp)</label><input type="text" id="npTel" placeholder="(11) 98765-4321"></div>
        <div><label>Condição principal</label><select id="npCond"><option value="">—</option>${CONDICOES.map(c => `<option value="${c.id}">${esc(c.nome)}</option>`).join("")}</select></div></div>
        <label class="check"><input type="checkbox" id="npLgpd"> Paciente consentiu com o registro e uso dos dados para o acompanhamento (LGPD)</label>
        <button class="btn" id="npCriar" style="margin-top:8px">+ Cadastrar</button></div>
      <div class="row"><input type="search" id="pBusca" placeholder="Buscar paciente" style="max-width:320px"><label class="check"><input type="checkbox" id="pAlta"> Mostrar pacientes de alta</label></div>
      <div id="pLista"></div>`;
    const desenhar = () => {
      const q = norm($("#pBusca").value), alta = $("#pAlta").checked;
      const f = lista().filter(p => (!q || norm(p.nome).includes(q)) && (alta || !p.alta)).sort((a, b) => (b.atualizado || "").localeCompare(a.atualizado || ""));
      $("#pLista").innerHTML = f.map(p => { const c = CONDICOES.find(x => x.id === p.condicao); const u = (p.sessoes || []).slice(-1)[0];
        return `<a class="card modulo" href="#/paciente/${p.id}" style="display:block"><div class="row" style="justify-content:space-between"><b>${esc(p.nome)}</b>${p.alta ? `<span class="tag ok">alta</span>` : `<span class="tag">${(p.sessoes || []).length} sessões</span>`}</div>
          <small class="muted">${p.nascimento ? idade(p.nascimento) + " anos · " : ""}${esc(c ? c.nome : "sem condição definida")}${u ? ` · última sessão ${dataBR(u.data)}` : ""}</small></a>`; }).join("") || `<p class="muted">Nenhum paciente${q ? " encontrado" : " em acompanhamento"}.</p>`;
      const ocultos = alta ? 0 : lista().filter(p => p.alta && (!q || norm(p.nome).includes(q))).length;
      if (ocultos) $("#pLista").insertAdjacentHTML("beforeend", `<p class="muted">${ocultos} paciente(s) de alta oculto(s) — marque "Mostrar pacientes de alta".</p>`);
    };
    $("#npCriar").addEventListener("click", () => {
      const nome = $("#npNome").value.trim(); if (!nome) return alert("Informe o nome.");
      const p = { id: "p" + Date.now().toString(36), nome, nascimento: $("#npNasc").value, telefone: $("#npTel").value.trim(), condicao: $("#npCond").value, consentimento: $("#npLgpd").checked, obs: "", sessoes: [], criado: new Date().toISOString() };
      atualizar(p); location.hash = "#/paciente/" + p.id;
    });
    $("#pBusca").addEventListener("input", desenhar); $("#pAlta").addEventListener("change", desenhar); desenhar();
  }

  // ---------------------------------------------------------------- ficha do paciente
  function viewPaciente(id) {
    const p = get(id); if (!p) { app.innerHTML = `<p>Paciente não encontrado. <a href="#/pacientes">Voltar</a></p>`; return; }
    p.sessoes = p.sessoes || [];
    const c = CONDICOES.find(x => x.id === p.condicao);
    app.innerHTML = `<p><a href="#/pacientes">← Pacientes</a></p>
      <h1>${esc(p.nome)} ${p.alta ? `<span class="tag ok">alta em ${dataBR(p.alta.data)}</span>` : ""}</h1>
      <p class="muted">${p.nascimento ? idade(p.nascimento) + " anos · " : ""}${esc(c ? c.nome : "sem condição definida")} · <span id="pNSess">${p.sessoes.length}</span> sessões</p>
      ${tabs("tabPac", [["resumo", "Resumo"], ["sessoes", "Sessões"], ["evolucao", "Evolução"], ["alta", "Relatório / alta"]], "resumo", (k, el) => ({ resumo: tabResumo, sessoes: tabSessoes, evolucao: tabEvolucao, alta: tabAlta })[k](el, id))}`;
  }

  function tabResumo(el, id) {
    const p = get(id);
    const avs = store.get("fisio_avaliacoes", []).filter(a => a.pacienteId === id || (!a.pacienteId && a.nome && norm(a.nome) === norm(p.nome)));
    const pgs = store.get("programas", []).filter(g => g.pacienteId === id);
    el.innerHTML = `<div class="grid-2"><div class="card" id="pDados"><h3>Dados</h3><div class="form-grid">
        <div><label>Nome</label><input type="text" data-k="nome" value="${esc(p.nome)}"></div><div><label>Nascimento</label><input type="date" data-k="nascimento" value="${esc(p.nascimento || "")}"></div>
        <div><label>Telefone</label><input type="text" data-k="telefone" value="${esc(p.telefone || "")}"></div>
        <div><label>Condição principal</label><select data-k="condicao"><option value="">—</option>${CONDICOES.map(c => `<option value="${c.id}" ${c.id === p.condicao ? "selected" : ""}>${esc(c.nome)}</option>`).join("")}</select></div></div>
        <label>Observações (objetivos, preferências, comorbidades)</label><textarea data-k="obs">${esc(p.obs || "")}</textarea>
        <label class="check"><input type="checkbox" data-k="consentimento" ${p.consentimento ? "checked" : ""}> Consentimento LGPD registrado</label>
        <div class="row" style="margin-top:8px"><button class="btn sec peq" id="pExcluir" style="color:var(--danger)">Excluir paciente</button></div></div>
      <div><div class="card"><h3>Avaliações (${avs.length})</h3>${avs.map(a => `<div class="row" style="justify-content:space-between;padding:4px 0"><span>${new Date(a.criado).toLocaleDateString("pt-BR")} · ${esc(a.queixa || "avaliação")}</span><a class="btn peq sec" href="#/avaliacao/${a.id}">Abrir</a></div>`).join("") || `<p class="muted">Nenhuma avaliação.</p>`}
        <button class="btn peq" id="pNovaAv">+ Nova avaliação</button></div>
      <div class="card"><h3>Programas de exercícios (${pgs.length})</h3>${pgs.map(g => `<div class="row" style="justify-content:space-between;padding:4px 0"><span>${esc(g.titulo)} · ${g.itens.length} exercícios</span><span><a class="btn peq sec" href="#/exercicios/montar/${g.id}">Abrir</a></span></div>`).join("") || `<p class="muted">Nenhum programa.</p>`}
        <button class="btn peq" id="pNovoPg">+ Montar programa</button></div>
      ${(p.condicao && CONDICOES.find(c => c.id === p.condicao)) ? `<div class="card"><h3>Referência rápida</h3><a href="#/condicao/${p.condicao}">Ver condição, prognóstico e conduta →</a></div>` : ""}</div></div>`;
    el.addEventListener("input", e => { const k = e.target.dataset.k; if (!k) return; const q = get(id); q[k] = e.target.type === "checkbox" ? e.target.checked : e.target.value; atualizar(q); });
    el.addEventListener("change", e => { const k = e.target.dataset.k; if (!k) return; const q = get(id); q[k] = e.target.type === "checkbox" ? e.target.checked : e.target.value; atualizar(q); });
    $("#pNovaAv", el).addEventListener("click", () => {
      const q = get(id); const av = { id: Date.now().toString(36), criado: new Date().toISOString(), passo: 0, nome: q.nome, pacienteId: id, idade: q.nascimento ? String(idade(q.nascimento)) : "", regiao: (CONDICOES.find(c => c.id === q.condicao) || {}).regiao || "" };
      const avs2 = store.get("fisio_avaliacoes", []); avs2.push(av); store.set("fisio_avaliacoes", avs2); location.hash = "#/avaliacao/" + av.id;
    });
    $("#pNovoPg", el).addEventListener("click", () => {
      const q = get(id);
      store.set("programa_rascunho", { id: Date.now().toString(36), criado: new Date().toISOString(), titulo: "Programa de exercícios", pacienteId: id, pacienteNome: q.nome, condicao: q.condicao || "", fase: "P", frequencia: "3 vezes por semana", orientacoes: "Dor durante o exercício até 3–5/10 é aceitável se voltar ao normal até a manhã seguinte. Se piorar, reduza a carga e me avise.", itens: [] });
      location.hash = "#/exercicios/montar";
    });
    $("#pExcluir", el).addEventListener("click", () => { if (!confirm("Excluir este paciente e todas as sessões? (Avaliações e programas continuam salvos.)")) return; salvarLista(lista().filter(x => x.id !== id)); location.hash = "#/pacientes"; });
  }

  // ---------------------------------------------------------------- sessões (SOAP)
  function tabSessoes(el, id) {
    const p = get(id); let editando = null;
    const pgs = store.get("programas", []).filter(g => g.pacienteId === id);
    const form = s => `<div class="card" id="sForm"><h3>${editando != null ? "Editar sessão" : "Registrar sessão"}</h3><div class="form-grid">
        <div><label>Data</label><input type="date" data-s="data" value="${esc(s.data || hoje())}"></div>
        <div><label>Dor antes (0–10)</label><input type="number" min="0" max="10" data-s="dorAntes" value="${esc(s.dorAntes ?? "")}"></div>
        <div><label>Dor depois (0–10)</label><input type="number" min="0" max="10" data-s="dorDepois" value="${esc(s.dorDepois ?? "")}"></div>
        <div><label>Resposta desde a última sessão</label><select data-s="resposta">${[["", "—"], ["melhor", "Melhor"], ["igual", "Igual"], ["pior", "Pior"]].map(([v, l]) => `<option value="${v}" ${s.resposta === v ? "selected" : ""}>${l}</option>`).join("")}</select></div></div>
      <div class="grid-2"><div><label>S — Relato do paciente</label><textarea data-s="s">${esc(s.s || "")}</textarea></div><div><label>O — Achados objetivos / testes / sinais comparáveis</label><textarea data-s="o">${esc(s.o || "")}</textarea></div>
        <div><label>A — Análise (o que mudou e por quê)</label><textarea data-s="a">${esc(s.a || "")}</textarea></div><div><label>P — Plano / próxima sessão</label><textarea data-s="pl">${esc(s.pl || "")}</textarea></div></div>
      <label>Intervenções e exercícios realizados</label><textarea data-s="intervencoes" placeholder="${pgs.length ? "Ex.: programa '" + esc(pgs[pgs.length - 1].titulo) + "', progressão de carga…" : "Ex.: ponte unilateral 3×10, Footwork no Reformer…"}">${esc(s.intervencoes || "")}</textarea>
      <div class="form-grid"><div><label>Desfecho (opcional)</label><select data-s="prom"><option value="">—</option>${PROMS.map(x => `<option ${s.prom === x[0] ? "selected" : ""}>${esc(x[0])}</option>`).join("")}</select></div><div><label>Escore</label><input type="number" step="any" data-s="promValor" value="${esc(s.promValor ?? "")}"></div></div>
      <div class="row" style="margin-top:8px"><button class="btn" id="sSalvar">${editando != null ? "Salvar alterações" : "Registrar sessão"}</button>${editando != null ? `<button class="btn sec" id="sCancelar">Cancelar</button>` : ""}</div></div>`;
    const desenhar = () => {
      const q = get(id); const s = editando != null ? { ...q.sessoes[editando] } : (store.get("sessao_rasc_" + id, {}) || {});
      el.innerHTML = form(s) + `<h2>Histórico (${q.sessoes.length})</h2>` + (q.sessoes.map((x, i) => ({ x, i })).reverse().map(({ x, i }) => `<div class="card"><div class="row" style="justify-content:space-between"><b>Sessão ${i + 1} · ${dataBR(x.data)}</b>
        <span>${x.dorAntes !== "" && x.dorAntes != null ? `<span class="tag">dor ${esc(x.dorAntes)} → ${esc(x.dorDepois ?? "?")}</span>` : ""}${x.resposta ? `<span class="tag ${x.resposta === "melhor" ? "ok" : x.resposta === "pior" ? "bad" : ""}">${esc(x.resposta)}</span>` : ""}${x.prom ? `<span class="tag">${esc(x.prom.split(" (")[0])}: ${esc(x.promValor)}</span>` : ""}
        <button class="btn peq sec" data-ed="${i}">Editar</button><button class="btn peq perigo" data-rm="${i}">✖</button></span></div>
        ${x.s ? `<p><b>S:</b> ${esc(x.s)}</p>` : ""}${x.o ? `<p><b>O:</b> ${esc(x.o)}</p>` : ""}${x.a ? `<p><b>A:</b> ${esc(x.a)}</p>` : ""}${x.pl ? `<p><b>P:</b> ${esc(x.pl)}</p>` : ""}${x.intervencoes ? `<p class="muted"><b>Intervenções:</b> ${esc(x.intervencoes)}</p>` : ""}</div>`).join("") || `<p class="muted">Nenhuma sessão registrada.</p>`);
      const lerForm = () => { const o = {}; $$("[data-s]", el).forEach(i => { o[i.dataset.s] = i.value; }); return o; };
      $("#sForm", el).addEventListener("input", () => { if (editando == null) store.set("sessao_rasc_" + id, lerForm()); });
      $("#sSalvar", el).addEventListener("click", () => {
        const q = get(id); const o = lerForm(); if (!o.data) o.data = hoje();
        if (editando != null) q.sessoes[editando] = o; else q.sessoes.push(o);
        q.sessoes.sort((a, b) => a.data.localeCompare(b.data)); atualizar(q); store.set("sessao_rasc_" + id, {}); editando = null; desenhar();
        const n = $("#pNSess"); if (n) n.textContent = q.sessoes.length;
      });
      $("#sCancelar", el)?.addEventListener("click", () => { editando = null; desenhar(); });
    };
    el.addEventListener("click", e => {
      if (e.target.dataset.ed) { editando = +e.target.dataset.ed; desenhar(); window.scrollTo(0, 0); }
      if (e.target.dataset.rm && confirm("Excluir esta sessão?")) { const q = get(id); q.sessoes.splice(+e.target.dataset.rm, 1); atualizar(q); desenhar(); }
    });
    desenhar();
  }

  // ---------------------------------------------------------------- evolução
  function grafico(canvas, series, opc) {
    // series: [{nome, cor, pontos:[{x:label, y}]}]; opc: {min, max, titulo}
    const W = canvas.width = canvas.clientWidth * 2 || 1200, H = canvas.height = 520; const ctx = canvas.getContext("2d");
    const css = getComputedStyle(document.documentElement); const txt = css.getPropertyValue("--text").trim() || "#222", grid = css.getPropertyValue("--border").trim() || "#ddd";
    ctx.clearRect(0, 0, W, H); const m = { l: 120, r: 60, t: 40, b: 90 };
    const labels = [...new Set(series.flatMap(s => s.pontos.map(p => p.x)))];
    const ys = series.flatMap(s => s.pontos.map(p => p.y)); const min = opc.min ?? Math.min(...ys), max = opc.max ?? Math.max(...ys);
    const X = i => m.l + (labels.length < 2 ? (W - m.l - m.r) / 2 : i * (W - m.l - m.r) / (labels.length - 1)), Y = v => H - m.b - (v - min) / ((max - min) || 1) * (H - m.t - m.b);
    ctx.font = "22px Montserrat, sans-serif"; ctx.fillStyle = txt; ctx.strokeStyle = grid; ctx.lineWidth = 1;
    for (let k = 0; k <= 5; k++) { const v = min + (max - min) * k / 5; const y = Y(v); ctx.beginPath(); ctx.moveTo(m.l, y); ctx.lineTo(W - m.r, y); ctx.stroke(); ctx.fillText(Number(v.toFixed(1)).toString().replace(".", ","), 10, y + 7); }
    labels.forEach((l, i) => { if (labels.length > 12 && i % Math.ceil(labels.length / 12)) return; ctx.save(); ctx.translate(X(i), H - m.b + 18); ctx.rotate(-.5); ctx.textAlign = "right"; ctx.fillText(l, 0, 10); ctx.restore(); });
    series.forEach((s, si) => {
      ctx.strokeStyle = s.cor; ctx.fillStyle = s.cor; ctx.lineWidth = 4; ctx.beginPath();
      s.pontos.forEach((p, k) => { const x = X(labels.indexOf(p.x)), y = Y(p.y); k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke();
      s.pontos.forEach(p => { ctx.beginPath(); ctx.arc(X(labels.indexOf(p.x)), Y(p.y), 7, 0, Math.PI * 2); ctx.fill(); });
      ctx.fillRect(m.l + si * 260, 8, 22, 22); ctx.fillStyle = txt; ctx.fillText(s.nome, m.l + 30 + si * 260, 27);
    });
  }
  function tabEvolucao(el, id) {
    const p = get(id); const ss = p.sessoes || [];
    const dor = ss.filter(s => s.dorAntes !== "" && s.dorAntes != null);
    const proms = {}; ss.filter(s => s.prom && s.promValor !== "" && s.promValor != null).forEach(s => { (proms[s.prom] = proms[s.prom] || []).push(s); });
    // inclui escore inicial da avaliação vinculada
    store.get("fisio_avaliacoes", []).filter(a => a.pacienteId === id && a.prom && a.promValor !== "").forEach(a => { (proms[a.prom] = proms[a.prom] || []).unshift({ data: a.criado.slice(0, 10), promValor: a.promValor, prom: a.prom, avaliacao: true }); });
    const analise = (nome, arr) => {
      if (arr.length < 2) return `<p class="muted">Registre ao menos 2 medidas para comparar.</p>`;
      const ini = +arr[0].promValor, fim = +arr[arr.length - 1].promValor, dif = fim - ini, mc = mcidNum(nome); const melhorou = MAIOR_MELHOR.test(nome) ? dif > 0 : dif < 0;
      const rel = mc != null && Math.abs(dif) >= mc;
      return `<div class="${melhorou && rel ? "sucesso" : melhorou ? "aviso" : dif === 0 ? "info" : "alerta"}">Mudança: <b>${dif > 0 ? "+" : ""}${dif.toFixed(1).replace(".", ",")}</b> (de ${ini} para ${fim}) — ${melhorou ? "melhora" : dif === 0 ? "sem mudança" : "piora"}${mc != null ? `; MCID ≈ ${mc} → ${rel ? (melhorou ? "<b>clinicamente importante</b>" : "piora relevante") : "abaixo do MCID"}` : ""}.</div>`;
    };
    el.innerHTML = `${dor.length ? `<div class="card"><h3>Dor ao longo das sessões</h3><canvas id="gDor" style="width:100%;height:260px"></canvas>${analise("NPRS / EVA (0–10)", dor.map(s => ({ promValor: s.dorAntes })))}</div>` : `<div class="info">Registre a dor nas sessões para ver o gráfico.</div>`}
      ${Object.entries(proms).map(([nome, arr], i) => `<div class="card"><h3>${esc(nome)}</h3><canvas id="gP${i}" style="width:100%;height:260px"></canvas>${analise(nome, arr)}</div>`).join("")}
      <p class="muted">MCID = menor mudança percebida como importante pelo paciente. Use junto com a percepção global de mudança e os objetivos funcionais.</p>`;
    requestAnimationFrame(() => {
      if (dor.length) grafico($("#gDor", el), [{ nome: "Antes da sessão", cor: "#4a6c5e", pontos: dor.map((s, k) => ({ x: dataBR(s.data) + (dor.filter(d => d.data === s.data).length > 1 ? ` #${k + 1}` : ""), y: +s.dorAntes })) },
        { nome: "Depois da sessão", cor: "#c9a35b", pontos: dor.filter(s => s.dorDepois !== "" && s.dorDepois != null).map((s, k) => ({ x: dataBR(s.data) + (dor.filter(d => d.data === s.data).length > 1 ? ` #${dor.indexOf(s) + 1}` : ""), y: +s.dorDepois })) }], { min: 0, max: 10 });
      Object.entries(proms).forEach(([nome, arr], i) => grafico($("#gP" + i, el), [{ nome: nome.split(" (")[0], cor: "#4a6c5e", pontos: arr.map(s => ({ x: dataBR(s.data) + (s.avaliacao ? " (aval.)" : ""), y: +s.promValor })) }], {}));
    });
  }

  // ---------------------------------------------------------------- relatório / alta
  function tabAlta(el, id) {
    const p = get(id); const ss = p.sessoes || []; const c = CONDICOES.find(x => x.id === p.condicao);
    const av = store.get("fisio_avaliacoes", []).filter(a => a.pacienteId === id).slice(-1)[0];
    const pg = store.get("programas", []).filter(g => g.pacienteId === id).slice(-1)[0];
    const dor = ss.filter(s => s.dorAntes !== "" && s.dorAntes != null);
    const proms = {}; ss.filter(s => s.prom && s.promValor !== "").forEach(s => { (proms[s.prom] = proms[s.prom] || []).push(+s.promValor); });
    const alta = p.alta || {};
    el.innerHTML = `<div class="card"><h3>Resumo do acompanhamento</h3><table>
        <tr><th>Período</th><td>${ss.length ? `${dataBR(ss[0].data)} a ${dataBR(ss[ss.length - 1].data)} · ${ss.length} sessões` : "sem sessões registradas"}</td></tr>
        <tr><th>Condição</th><td>${esc(c ? c.nome : "—")}</td></tr>
        <tr><th>Dor</th><td>${dor.length ? `${dor[0].dorAntes}/10 → ${dor[dor.length - 1].dorAntes}/10` : "—"}</td></tr>
        ${Object.entries(proms).map(([n, v]) => `<tr><th>${esc(n.split(" (")[0])}</th><td>${v[0]} → ${v[v.length - 1]}${mcidNum(n) != null ? ` (MCID ≈ ${mcidNum(n)})` : ""}</td></tr>`).join("")}
        ${av && av.metas ? `<tr><th>Metas iniciais</th><td>${esc(av.metas)}</td></tr>` : ""}
        ${pg ? `<tr><th>Programa domiciliar</th><td>${esc(pg.titulo)} (${pg.itens.length} exercícios)</td></tr>` : ""}</table></div>
      <div class="card" id="altaForm"><h3>Alta</h3><div class="form-grid"><div><label>Data da alta</label><input type="date" id="aData" value="${esc(alta.data || hoje())}"></div>
        <div><label>Motivo</label><select id="aMotivo">${["Objetivos atingidos", "Melhora parcial — segue com programa domiciliar", "Encaminhado a outro profissional", "Interrupção pelo paciente"].map(m => `<option ${alta.motivo === m ? "selected" : ""}>${m}</option>`).join("")}</select></div></div>
        <label>Evolução e resultados (texto do relatório)</label><textarea id="aTexto" style="min-height:120px">${esc(alta.texto || "")}</textarea>
        <label>Recomendações para manutenção</label><textarea id="aRec">${esc(alta.recomendacoes || "Manter o programa de exercícios 2–3 vezes por semana e atividade física regular. Retornar se houver piora persistente.")}</textarea>
        <div class="row" style="margin-top:8px"><button class="btn" id="aSalvar">${p.alta ? "Atualizar alta" : "Registrar alta"}</button><button class="btn sec" id="aPdf">🖨 Relatório (PDF)</button>${p.alta ? `<button class="btn sec" id="aReabrir">Reabrir acompanhamento</button>` : ""}</div><div id="aMsg"></div></div>`;
    const ler = () => ({ data: $("#aData").value, motivo: $("#aMotivo").value, texto: $("#aTexto").value, recomendacoes: $("#aRec").value });
    $("#aSalvar", el).addEventListener("click", () => { const q = get(id); q.alta = ler(); atualizar(q); $("#aMsg").innerHTML = `<div class="sucesso">Alta registrada.</div>`; });
    $("#aReabrir", el)?.addEventListener("click", () => { const q = get(id); delete q.alta; atualizar(q); tabAlta(el, id); });
    $("#aPdf", el).addEventListener("click", () => {
      const a = ler(); const tabela = el.querySelector("table").outerHTML;
      window.MARCA.imprimir("Relatório de fisioterapia", `<p><b>Paciente:</b> ${esc(p.nome)}${p.nascimento ? ` · ${idade(p.nascimento)} anos` : ""} · <b>Data:</b> ${dataBR(a.data)}</p>${tabela}
        <p><b>Motivo da alta:</b> ${esc(a.motivo)}</p>${a.texto ? `<p><b>Evolução:</b> ${esc(a.texto)}</p>` : ""}<p><b>Recomendações:</b> ${esc(a.recomendacoes)}</p>
        ${pg ? `<h3>Programa domiciliar — ${esc(pg.titulo)}</h3>${pg.itens.map((it, k) => { const e = window.PRESCRICAO.ex(it.id); return `<div class="pa-ex"><b>${k + 1}. ${esc(e.nome)}</b> — <i>${esc(it.dose)}</i><br>${esc(e.como)}</div>`; }).join("")}` : ""}
        <p style="margin-top:30px">_______________________________<br>${esc(window.MARCA.get().nome)} — Fisioterapeuta</p>`);
    });
  }

  rotas.pacientes = viewPacientes;
  rotas.paciente = viewPaciente;
  window.PACIENTES = { lista, get };
})();
