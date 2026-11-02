/* Planejamento de conteúdo: calendário editorial, banco de ideias (dúvidas de pacientes) e "kit do artigo"
   (de um artigo: carrossel + Reels + sequência de stories, já agendados). */
(function () {
  "use strict";
  const { $, $$, esc, store, app, rotas, tabs } = window.FR;
  const TIPOS = { carrossel: "📸 Carrossel", reels: "🎬 Reels", story: "📱 Stories", outro: "✏️ Outro" };
  const STATUS = { ideia: "Ideia", roteiro: "Roteiro", produzido: "Produzido", agendado: "Agendado", publicado: "Publicado" };
  const itens = () => store.get("conteudo_itens", []);
  const salvarItens = l => store.set("conteudo_itens", l);
  const ideias = () => store.get("conteudo_ideias", []);
  const salvarIdeias = l => store.set("conteudo_ideias", l);
  const iso = d => { const x = new Date(d); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`; };
  const maisDias = (d, n) => { const x = new Date(d + "T12:00"); x.setDate(x.getDate() + n); return iso(x); };
  const novoId = () => "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);

  function view(sub) {
    app.innerHTML = `<h1>🗓 Planejamento de conteúdo</h1>
      <p class="muted">Organize posts e Reels no calendário, guarde ideias (principalmente as dúvidas dos pacientes) e transforme um artigo em carrossel + Reels + stories de uma vez.</p>
      ${tabs("tabCont", [["cal", "Calendário"], ["ideias", `Banco de ideias (${ideias().length})`], ["kit", "Kit do artigo"]], sub || "cal", (k, el) => ({ cal: tabCal, ideias: tabIdeias, kit: tabKit })[k](el), !!sub)}`;
  }

  // ---------------------------------------------------------------- calendário
  let mesAtual = new Date(); mesAtual.setDate(1);
  function formItem(it) {
    return `<div class="card" id="ciForm"><h3>${it.id ? "Editar" : "Novo"} conteúdo</h3><div class="form-grid">
      <div><label>Data</label><input type="date" data-c="data" value="${esc(it.data || iso(new Date()))}"></div>
      <div><label>Formato</label><select data-c="tipo">${Object.entries(TIPOS).map(([k, v]) => `<option value="${k}" ${it.tipo === k ? "selected" : ""}>${v}</option>`).join("")}</select></div>
      <div><label>Status</label><select data-c="status">${Object.entries(STATUS).map(([k, v]) => `<option value="${k}" ${it.status === k ? "selected" : ""}>${v}</option>`).join("")}</select></div>
      <div><label>PMID do artigo (opcional)</label><input type="text" data-c="pmid" value="${esc(it.pmid || "")}"></div></div>
      <label>Título / tema</label><input type="text" data-c="titulo" value="${esc(it.titulo || "")}">
      <label>Notas (roteiro, legenda, ideias de stories)</label><textarea data-c="notas" style="min-height:90px">${esc(it.notas || "")}</textarea>
      <div class="row" style="margin-top:8px"><button class="btn" id="ciSalvar">Salvar</button><button class="btn sec" id="ciCancelar">Fechar</button>${it.id ? `<button class="btn peq perigo" id="ciExcluir">Excluir</button>` : ""}
      ${it.tipo === "carrossel" ? `<a class="btn sec peq" href="#/instagram${it.pmid ? "/" + esc(it.pmid) : ""}">Abrir editor de posts</a>` : ""}${it.tipo === "reels" ? `<a class="btn sec peq" href="#/reels${it.pmid ? "/" + esc(it.pmid) : ""}">Abrir editor de Reels</a>` : ""}</div></div>`;
  }
  function tabCal(el) {
    const desenhar = (editar) => {
      const ano = mesAtual.getFullYear(), mes = mesAtual.getMonth(); const ini = new Date(ano, mes, 1), dias = new Date(ano, mes + 1, 0).getDate();
      const l = itens(); const porDia = {}; l.forEach(i => { (porDia[i.data] = porDia[i.data] || []).push(i); });
      const hoje = iso(new Date()); let cel = "";
      for (let k = 0; k < ini.getDay(); k++) cel += `<div class="cal-d vazio"></div>`;
      for (let d = 1; d <= dias; d++) {
        const ds = iso(new Date(ano, mes, d));
        cel += `<div class="cal-d ${ds === hoje ? "hoje" : ""}" data-dia="${ds}"><span class="cal-n">${d}</span>${(porDia[ds] || []).map(i => `<div class="cal-i st-${i.status}" data-id="${i.id}" title="${esc(STATUS[i.status])}">${TIPOS[i.tipo].split(" ")[0]} ${esc(i.titulo || "(sem título)")}</div>`).join("")}</div>`;
      }
      const proximos = l.filter(i => i.data >= hoje && i.status !== "publicado").sort((a, b) => a.data.localeCompare(b.data)).slice(0, 8);
      const semana = l.filter(i => i.status === "publicado" && i.data >= maisDias(hoje, -30)).length;
      el.innerHTML = `${editar ? formItem(editar) : ""}
        <div class="row" style="justify-content:space-between"><div class="row"><button class="btn sec peq" id="calAnt">←</button><h2 style="margin:0;min-width:220px;text-align:center">${mesAtual.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</h2><button class="btn sec peq" id="calProx">→</button></div>
          <span><span class="tag ok">${semana} publicados nos últimos 30 dias</span><button class="btn peq" id="calNovo">+ Conteúdo</button></span></div>
        <div class="cal"><div class="cal-h">Dom</div><div class="cal-h">Seg</div><div class="cal-h">Ter</div><div class="cal-h">Qua</div><div class="cal-h">Qui</div><div class="cal-h">Sex</div><div class="cal-h">Sáb</div>${cel}</div>
        <div class="row" style="margin-top:6px">${Object.entries(STATUS).map(([k, v]) => `<span class="cal-i st-${k}" style="display:inline-block">${v}</span>`).join("")}</div>
        <h2>Próximos</h2>${proximos.map(i => `<div class="row" style="justify-content:space-between;border-bottom:1px solid var(--border);padding:6px 0"><span>${new Date(i.data + "T12:00").toLocaleDateString("pt-BR")} · ${TIPOS[i.tipo]} · <b>${esc(i.titulo)}</b> <span class="tag">${STATUS[i.status]}</span></span><button class="btn peq sec" data-id="${i.id}">Editar</button></div>`).join("") || `<p class="muted">Nada agendado.</p>`}`;
      if (editar) {
        const ler = () => { const o = { ...editar }; $$("[data-c]", el).forEach(i => { o[i.dataset.c] = i.value.trim(); }); return o; };
        $("#ciSalvar", el).addEventListener("click", () => { const o = ler(); if (!o.id) o.id = novoId(); const L = itens(); const k = L.findIndex(x => x.id === o.id); if (k >= 0) L[k] = o; else L.push(o); salvarItens(L); desenhar(); });
        $("#ciCancelar", el).addEventListener("click", () => desenhar());
        $("#ciExcluir", el)?.addEventListener("click", () => { if (!confirm("Excluir?")) return; salvarItens(itens().filter(x => x.id !== editar.id)); desenhar(); });
      }
      $("#calAnt", el).addEventListener("click", () => { mesAtual.setMonth(mesAtual.getMonth() - 1); desenhar(); });
      $("#calProx", el).addEventListener("click", () => { mesAtual.setMonth(mesAtual.getMonth() + 1); desenhar(); });
      $("#calNovo", el).addEventListener("click", () => { desenhar({ tipo: "carrossel", status: "ideia", data: iso(new Date()) }); window.scrollTo(0, 0); });
      $$(".cal-d[data-dia]", el).forEach(d => d.addEventListener("click", e => {
        const i = e.target.closest("[data-id]"); if (i) { desenhar(itens().find(x => x.id === i.dataset.id)); window.scrollTo(0, 0); return; }
        desenhar({ tipo: "carrossel", status: "ideia", data: d.dataset.dia }); window.scrollTo(0, 0);
      }));
      $$("button[data-id]", el).forEach(b => b.addEventListener("click", () => { desenhar(itens().find(x => x.id === b.dataset.id)); window.scrollTo(0, 0); }));
    };
    desenhar();
  }

  // ---------------------------------------------------------------- ideias
  function tabIdeias(el) {
    const desenhar = () => {
      const l = ideias().slice().reverse();
      el.innerHTML = `<div class="card"><h3>Nova ideia</h3><div class="form-grid"><div><label>Origem</label><select id="idOrig"><option>Dúvida de paciente</option><option>Mito comum</option><option>Artigo / novidade</option><option>Caso clínico (sem identificar)</option><option>Bastidores / rotina</option><option>Outra</option></select></div></div>
        <label>Ideia</label><textarea id="idTxt" placeholder="Ex.: 'Posso fazer Pilates com hérnia de disco?'"></textarea><button class="btn" id="idAdd" style="margin-top:8px">+ Guardar ideia</button></div>
        <div class="info">💡 As dúvidas que os pacientes repetem no consultório costumam render os melhores conteúdos: são perguntas reais do seu público.</div>
        ${l.map(i => `<div class="card"><div class="row" style="justify-content:space-between"><span><span class="tag">${esc(i.origem)}</span> ${esc(i.texto)}</span>
          <span class="row"><select data-tipo="${i.id}" style="width:auto">${Object.entries(TIPOS).map(([k, v]) => `<option value="${k}">${v}</option>`).join("")}</select><input type="date" data-data="${i.id}" value="${maisDias(iso(new Date()), 3)}" style="width:auto"><button class="btn peq" data-agendar="${i.id}">Agendar</button><button class="btn peq perigo" data-rm="${i.id}">✖</button></span></div></div>`).join("") || `<p class="muted">Nenhuma ideia guardada.</p>`}`;
      $("#idAdd", el).addEventListener("click", () => { const t = $("#idTxt").value.trim(); if (!t) return; salvarIdeias([...ideias(), { id: novoId(), texto: t, origem: $("#idOrig").value, criado: new Date().toISOString() }]); desenhar(); });
    };
    el.addEventListener("click", e => {
      const ag = e.target.dataset.agendar, rm = e.target.dataset.rm;
      if (ag) { const i = ideias().find(x => x.id === ag); salvarItens([...itens(), { id: novoId(), data: $(`[data-data="${ag}"]`, el).value, tipo: $(`[data-tipo="${ag}"]`, el).value, status: "roteiro", titulo: i.texto, notas: `Origem: ${i.origem}`, pmid: "" }]); salvarIdeias(ideias().filter(x => x.id !== ag)); desenhar(); }
      if (rm && confirm("Excluir ideia?")) { salvarIdeias(ideias().filter(x => x.id !== rm)); desenhar(); }
    });
    desenhar();
  }

  // ---------------------------------------------------------------- kit do artigo
  function storiesSugeridos(art, ext) {
    if (!ext) return `1) Enquete: "Você sabia o que a ciência diz sobre ${art.titulo.slice(0, 50)}…?" (Sim / Não)\n2) Resposta curta com o principal achado (complete após ler o artigo).\n3) "Expliquei tudo no Reels de hoje 👉" + link para o post.`;
    const r0 = ext.resultados?.[0];
    return `1) Caixa de pergunta ou enquete: "${ext.pergunta_pico}" (Sim / Não / Depende)\n2) Resposta: ${ext.mensagem_para_pratica}\n3) Dado do estudo${r0 ? `: ${r0.resultado} em ${r0.desfecho}` : ""} — "isso é ${r0 && r0.clinicamente_importante === "sim" ? "uma diferença que o paciente sente" : "pequeno, e eu explico por quê"}"\n4) "Expliquei tudo no carrossel e no Reels 👉" + figurinha de link\n5) Caixinha: "Qual dúvida você tem sobre isso?" (alimenta o banco de ideias)`;
  }
  function tabKit(el) {
    const bib = Object.values(window.ARTIGOS.bib());
    const base = iso(new Date());
    el.innerHTML = `<div class="card" id="kitForm"><h3>De um artigo: carrossel + Reels + stories</h3>
      ${bib.length ? "" : `<div class="aviso">Sua biblioteca está vazia. Salve artigos em 📰 Artigos (de preferência extraídos) para usar o kit.</div>`}
      <div class="form-grid"><div><label>Artigo da biblioteca</label><select id="kPmid"><option value="">— escolher —</option>${bib.map(a => `<option value="${a.pmid}">${esc((a.ext?.titulo_pt || a.titulo).slice(0, 90))}${a.ext ? "" : " (não extraído)"}</option>`).join("")}</select></div>
        <div><label>Carrossel em</label><input type="date" id="kD1" value="${maisDias(base, 1)}"></div><div><label>Reels em</label><input type="date" id="kD2" value="${maisDias(base, 3)}"></div><div><label>Stories em</label><input type="date" id="kD3" value="${maisDias(base, 3)}"></div></div>
      <label class="check"><input type="checkbox" id="kIA" ${window.IA.temIA() ? "checked" : "disabled"}> Escrever os textos com IA ${window.IA.temIA() ? "" : "(configure em ⚙️ para ativar)"}</label>
      <button class="btn" id="kGerar" style="margin-top:8px">✨ Gerar kit e agendar</button><div id="kMsg"></div></div>
      <div class="info">O kit prepara o carrossel no editor de posts e o roteiro no editor de Reels (substituindo o que estiver aberto neles), cria a sequência de stories e agenda os três no calendário. Depois é só revisar, gravar e publicar.</div>`;
    $("#kGerar", el).addEventListener("click", async () => {
      const pmid = $("#kPmid").value; if (!pmid) return alert("Escolha um artigo.");
      const ia = $("#kIA").checked, msg = $("#kMsg"), btn = $("#kGerar"); btn.disabled = true;
      try {
        const A = window.ARTIGOS; const art = A.cacheGet(pmid, "meta") || await A.efetch(pmid); const ext = A.cacheGet(pmid, "ext");
        const titulo = ext?.titulo_pt || art.titulo;
        msg.innerHTML = `<div class="info">1/3 Preparando o carrossel…</div>`; await window.IG.gerarDeArtigo(pmid, ia);
        msg.innerHTML = `<div class="info">2/3 Escrevendo o roteiro do Reels…</div>`; await window.REELS.gerarDeArtigo(pmid, ia);
        msg.innerHTML = `<div class="info">3/3 Agendando…</div>`;
        const st = storiesSugeridos(art, ext);
        salvarItens([...itens(),
          { id: novoId(), data: $("#kD1").value, tipo: "carrossel", status: "roteiro", titulo, pmid, notas: "Carrossel preparado no editor de posts — revisar textos e números." },
          { id: novoId(), data: $("#kD2").value, tipo: "reels", status: "roteiro", titulo, pmid, notas: "Roteiro pronto no editor de Reels — gravar a voz cena a cena." },
          { id: novoId(), data: $("#kD3").value, tipo: "story", status: "roteiro", titulo: "Stories: " + titulo, pmid, notas: st }]);
        msg.innerHTML = `<div class="sucesso">Kit pronto e agendado!${ext ? "" : " (O artigo não estava extraído: alguns textos vieram como modelo para completar.)"}</div>
          <div class="row"><a class="btn" href="#/instagram">Abrir carrossel</a><a class="btn" href="#/reels">Abrir Reels</a><a class="btn sec" href="#/conteudo/cal">Ver calendário</a></div>
          <div class="card"><h3>📱 Sequência de stories</h3>${st.split("\n").map(l => `<p>${esc(l)}</p>`).join("")}</div>`;
      } catch (e) { msg.innerHTML = `<div class="alerta">${esc(e.message)}</div>`; }
      btn.disabled = false;
    });
  }

  rotas.conteudo = view;
})();
