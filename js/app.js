/* FisioRaciocínio — aplicação SPA sem dependências. */
(function () {
  "use strict";

  // ---------------------------------------------------------------- utilidades
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const store = {
    get(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* armazenamento indisponível */ } }
  };
  const app = $("#app");
  const fase = id => FASES.find(f => f.id === id);
  const teste = id => TESTES.find(t => t.id === id);
  const cond = id => CONDICOES.find(c => c.id === id);
  const tecido = id => TECIDOS.find(t => t.id === id);
  const regiaoNome = id => (REGIOES.find(r => r.id === id) || {}).nome || id;
  const fmt = v => (v == null ? "—" : String(v).replace(".", ","));
  const lrPos = t => (t.sn != null && t.sp != null && t.sp < 1 ? (t.sn / (1 - t.sp)) : null);
  const lrNeg = t => (t.sn != null && t.sp ? ((1 - t.sn) / t.sp) : null);
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pillFase = id => { const f = fase(id); return f ? `<span class="fase-pill" style="background:${f.cor}">${esc(f.nome)}</span>` : ""; };
  const lista = arr => `<ul>${(arr || []).map(i => `<li>${esc(i)}</li>`).join("")}</ul>`;

  function tabs(id, itens, ativo, render, forcar) {
    // itens: [[chave, rótulo]]. forcar = usar 'ativo' mesmo que haja aba lembrada.
    const html = `<div class="tabs" id="${id}">${itens.map(([k, l]) => `<button data-tab="${k}">${esc(l)}</button>`).join("")}</div><div id="${id}-c"></div>`;
    setTimeout(() => {
      const box = $("#" + id);
      if (!box) return;
      const show = k => {
        $$("button", box).forEach(b => b.classList.toggle("ativo", b.dataset.tab === k));
        const velho = $("#" + id + "-c"), novo = velho.cloneNode(false); // remove listeners antigos
        velho.replaceWith(novo); render(k, novo); store.set("tab_" + id, k);
      };
      box.addEventListener("click", e => { const b = e.target.closest("button[data-tab]"); if (b) show(b.dataset.tab); });
      const lembrada = store.get("tab_" + id, null);
      show(!forcar && itens.some(i => i[0] === lembrada) ? lembrada : ativo);
    });
    return html;
  }

  // ---------------------------------------------------------------- tema / menu / busca
  const temaSalvo = store.get("tema", null);
  if (temaSalvo) document.documentElement.dataset.theme = temaSalvo;
  $("#temaBtn").addEventListener("click", () => {
    const atual = document.documentElement.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const novo = atual === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = novo; store.set("tema", novo);
  });
  $("#menuBtn").addEventListener("click", () => $("#sidebar").classList.toggle("aberto"));

  const indiceBusca = [
    ...CONDICOES.map(c => ({ t: c.nome, tipo: "Condição · " + regiaoNome(c.regiao), h: "#/condicao/" + c.id })),
    ...TESTES.map(t => ({ t: t.nome, tipo: "Teste · " + t.objetivo, h: "#/testes/" + t.id })),
    ...Object.entries(MUSCULOS).flatMap(([g, ms]) => ms.map(m => ({ t: m[0], tipo: "Músculo · " + m[3], h: "#/anatomia/m/" + encodeURIComponent(m[0]) }))),
    ...NERVOS.map(n => ({ t: "Nervo " + n[0], tipo: "Nervo · " + n[1], h: "#/anatomia/nervos" })),
    ...TECIDOS.map(t => ({ t: t.nome, tipo: "Tecido · reparo", h: "#/reparo" })),
    ...NEURO_SEG.map(n => ({ t: "Raiz " + n[0], tipo: "Dermátomo/miótomo · " + n[1], h: "#/anatomia/neuro" }))
  ];
  const norm = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const busca = $("#busca"), buscaRes = $("#buscaRes");
  busca.addEventListener("input", () => {
    const q = norm(busca.value.trim());
    if (q.length < 2) { buscaRes.hidden = true; return; }
    const termos = q.split(/\s+/);
    const res = indiceBusca.filter(i => { const alvo = norm(i.t + " " + i.tipo); return termos.every(t => alvo.includes(t)); }).slice(0, 15);
    buscaRes.innerHTML = res.length ? res.map(r => `<a href="${r.h}">${esc(r.t)}<div class="tipo">${esc(r.tipo)}</div></a>`).join("") : `<div style="padding:10px" class="muted">Nada encontrado.</div>`;
    buscaRes.hidden = false;
  });
  buscaRes.addEventListener("click", () => { buscaRes.hidden = true; busca.value = ""; });
  document.addEventListener("click", e => { if (!e.target.closest(".search-wrap")) buscaRes.hidden = true; });

  // ---------------------------------------------------------------- roteador
  const rotas = { "": inicio, avaliacao, raciocinio, reparo, condicoes, condicao, testes: viewTestes, ferramentas, anatomia, evidencias, estudo };
  function router() {
    const [r, ...args] = location.hash.replace(/^#\/?/, "").split("/");
    (rotas[r] || inicio)(...args.map(decodeURIComponent));
    $$(".sidebar a").forEach(a => a.classList.toggle("ativo", a.dataset.r === ({ condicao: "condicoes", artigo: "artigos" }[r] || r)));
    $("#sidebar").classList.remove("aberto");
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", router);

  // ================================================================= INÍCIO
  function inicio() {
    const avs = store.get("fisio_avaliacoes", []);
    const nMusc = Object.values(MUSCULOS).reduce((s, a) => s + a.length, 0);
    app.innerHTML = `
      <h1>FisioRaciocínio</h1>
      <p class="muted">Sistema de estudo e apoio ao raciocínio clínico em fisioterapia musculoesquelética — da avaliação à conduta, com base em diretrizes e artigos de alta qualidade.</p>
      <div class="card">
        <h3>Fluxo do raciocínio clínico</h3>
        <div class="row" style="gap:6px">
          ${["1. Anamnese", "2. Triagem (red/yellow flags)", "3. Comportamento da dor (SINSS)", "4. Exame físico + testes", "5. Hipóteses e diferenciais", "6. Fase do reparo tecidual", "7. Prognóstico", "8. Conduta por fase", "9. Reavaliação (MCID)"].map(s => `<span class="tag">${s}</span>`).join("→")}
        </div>
        <p class="muted" style="margin-top:8px">Comece pela <a href="#/avaliacao">Avaliação completa</a> — ao final ela gera hipóteses, estima a fase do tecido, prognóstico e conduta.</p>
      </div>
      <div class="grid">
        ${[
          ["#/avaliacao", "📋", "Avaliação completa", "Ficha guiada em 6 etapas com síntese automática, CIF e relatório para impressão."],
          ["#/raciocinio", "🧠", "Raciocínio clínico", "Marque achados e veja hipóteses ranqueadas, o que falta confirmar e diferenciais."],
          ["#/reparo", "🩹", "Reparo tecidual", "Fases inflamatória, proliferativa e de remodelação; prazos por tecido e estimador de fase."],
          ["#/condicoes", "📚", `Condições (${CONDICOES.length})`, "Diagnóstico, prognóstico, conduta por fase e evidências de cada condição."],
          ["#/testes", "🔍", `Testes especiais (${TESTES.length})`, "Execução, sensibilidade/especificidade, LR e calculadora de probabilidade pós-teste."],
          ["#/ferramentas", "🧮", "Escalas e prescrição", "STarT Back, PROMs com MCID, Oxford, end-feel, 1RM e parâmetros de carga."],
          ["#/anatomia", "🦵", `Anatomia (${nMusc} músculos)`, "Origem, inserção, inervação, ação, ossos, nervos, dermátomos e artrocinemática."],
          ["#/evidencias", "🔬", "Evidências e guidelines", "O que fazer e o que não fazer, leitura crítica, PEDro, GRADE e busca de artigos."],
          ["#/estudo", "🎓", "Estudo", "Flashcards com repetição espaçada, quiz e casos clínicos comentados."],
          ["#/artigos", "📰", "Artigos (PubMed)", "Busque no PubMed, avalie a qualidade, traduza (texto completo em acesso aberto) e extraia o que importa."],
          ["#/instagram", "📸", "Posts para Instagram", "Gere carrosséis e legendas a partir de artigos ou condições, prontos para baixar em PNG."]
        ].map(([h, i, t, d]) => `<a class="card modulo" href="${h}"><div class="ico">${i}</div><h3>${t}</h3><p class="muted">${d}</p></a>`).join("")}
      </div>
      ${avs.length ? `<h2>Avaliações recentes</h2><div class="card">${avs.slice(-5).reverse().map(a => `<div class="row" style="justify-content:space-between;border-bottom:1px solid var(--border);padding:6px 0"><span><b>${esc(a.nome || "Sem nome")}</b> <small>· ${esc(regiaoNome(a.regiao) || "")} · ${new Date(a.criado).toLocaleDateString("pt-BR")}</small></span><a class="btn peq sec" href="#/avaliacao/${a.id}">Abrir</a></div>`).join("")}</div>` : ""}
      <div class="aviso"><b>Aviso:</b> ferramenta educacional. As hipóteses são apoio ao raciocínio, não diagnóstico. Valores de acurácia e prazos são aproximados e variam entre estudos — consulte as fontes originais.</div>`;
  }

  // ================================================================= MOTOR DE HIPÓTESES
  function ajustarPorTestes(rank, resultados) {
    if (!resultados) return rank;
    return rank.map(r => {
      let pct = r.pct; const notas = [];
      (r.c.testes || []).forEach(tid => {
        const res = resultados[tid], t = teste(tid);
        if (!res || !t) return;
        if (res === "+") { const bonus = t.sp != null && t.sp >= 0.8 ? 20 : 8; pct += bonus; notas.push(`${t.nome} positivo (+${bonus})`); }
        if (res === "-") { const pen = t.sn != null && t.sn >= 0.85 ? 25 : 6; pct -= pen; notas.push(`${t.nome} negativo (−${pen})`); }
      });
      return { ...r, pct: Math.max(0, Math.min(100, pct)), notas };
    }).sort((a, b) => b.pct - a.pct);
  }

  function htmlHipoteses(rank, n = 5) {
    const top = rank.filter(r => r.pct > 0).slice(0, n);
    if (!top.length) return `<p class="muted">Marque achados da história e do exame para gerar hipóteses.</p>`;
    return top.map((r, i) => {
      const c = r.c;
      const testesSug = (c.testes || []).map(teste).filter(Boolean);
      return `<div class="hip">
        <div class="hip-head"><b>${i + 1}. <a href="#/condicao/${c.id}">${esc(c.nome)}</a></b><span class="tag ${r.pct >= 60 ? "ok" : r.pct >= 35 ? "warn" : ""}">${r.pct}% compatível</span></div>
        <div class="barra"><div style="width:${r.pct}%"></div></div>
        <details><summary>Raciocínio: por que considerar e como confirmar</summary>
          ${r.presentes.length ? `<p><b>A favor:</b> ${r.presentes.map(k => `<span class="tag ok">${esc(rotuloAchado(k))}</span>`).join("")}</p>` : ""}
          ${r.contra.length ? `<p><b>Contra:</b> ${r.contra.map(k => `<span class="tag bad">${esc(rotuloAchado(k))}</span>`).join("")}</p>` : ""}
          ${r.ausentes.length ? `<p><b>Pergunte/examine também:</b> ${r.ausentes.slice(0, 5).map(k => `<span class="tag">${esc(rotuloAchado(k))}</span>`).join("")}</p>` : ""}
          ${r.notas && r.notas.length ? `<p><b>Testes realizados:</b> ${r.notas.map(esc).join("; ")}</p>` : ""}
          ${testesSug.length ? `<p><b>Testes sugeridos:</b> ${testesSug.map(t => `<a class="tag" href="#/testes/${t.id}">${esc(t.nome)}${t.sn != null ? ` (Sn ${fmt(t.sn)} / Sp ${fmt(t.sp)})` : ""}</a>`).join("")}</p>` : ""}
          <p><b>Diferenciais:</b> ${esc(c.diferencial.join("; "))}</p>
          ${c.encaminhar.length ? `<p><b>Encaminhar se:</b> ${esc(c.encaminhar.join("; "))}</p>` : ""}
        </details>
      </div>`;
    }).join("");
  }

  function checksAchados(grupos, selecionados, attr = "data-achado") {
    return grupos.map(g => {
      const grp = ACHADOS[g]; if (!grp) return "";
      return `<h3>${esc(grp.titulo)}</h3><div class="checks">${Object.entries(grp.itens).map(([k, l]) => `<label class="check"><input type="checkbox" ${attr}="${k}" ${selecionados.includes(k) ? "checked" : ""}> ${esc(l)}</label>`).join("")}</div>`;
    }).join("");
  }

  // ================================================================= RACIOCÍNIO
  function raciocinio() {
    const st = store.get("raciocinio", { regiao: "joelho", achados: [] });
    app.innerHTML = `
      <h1>🧠 Raciocínio clínico</h1>
      <p class="muted">Gere hipóteses a partir dos achados (modelo hipotético-dedutivo + reconhecimento de padrões). Use como checklist — sempre confirme com o exame e as fontes.</p>
      ${tabs("tabRac", [["motor", "Gerador de hipóteses"], ["modelo", "Modelo de raciocínio"], ["dor", "Tipos de dor e SINSS"], ["vieses", "Erros comuns"]], "motor", (k, el) => {
        if (k === "motor") {
          el.innerHTML = `
            <div class="aviso"><b>Antes de tudo: triagem de red flags.</b> <a href="#/ferramentas/flags">Ver lista completa</a>. Se presente, encaminhe — hipóteses musculoesqueléticas ficam em segundo plano.</div>
            <div class="grid-2">
              <div class="card">
                <label>Região</label>
                <select id="racReg">${REGIOES.map(r => `<option value="${r.id}" ${r.id === st.regiao ? "selected" : ""}>${esc(r.nome)}</option>`).join("")}</select>
                <div id="racChecks"></div>
                <button class="btn sec peq" id="racLimpar" style="margin-top:10px">Limpar achados</button>
              </div>
              <div><div class="card"><h3>Hipóteses ranqueadas</h3><div id="racHip"></div></div></div>
            </div>`;
          const desenhar = () => {
            $("#racChecks").innerHTML = checksAchados(["geral", st.regiao], st.achados);
            $("#racHip").innerHTML = htmlHipoteses(rankearHipoteses(st.regiao, st.achados));
          };
          $("#racReg").addEventListener("change", e => { st.regiao = e.target.value; store.set("raciocinio", st); desenhar(); });
          el.addEventListener("change", e => {
            const k2 = e.target.dataset.achado; if (!k2) return;
            st.achados = e.target.checked ? [...new Set([...st.achados, k2])] : st.achados.filter(x => x !== k2);
            store.set("raciocinio", st); $("#racHip").innerHTML = htmlHipoteses(rankearHipoteses(st.regiao, st.achados));
          });
          $("#racLimpar").addEventListener("click", () => { st.achados = []; store.set("raciocinio", st); desenhar(); });
          desenhar();
        }
        if (k === "modelo") {
          el.innerHTML = `
            <div class="card"><h3>Raciocínio hipotético-dedutivo (passo a passo)</h3><ol>
              <li><b>Coleta inicial de pistas</b> — idade, queixa, mecanismo, tempo de evolução. Já gere 2–4 hipóteses iniciais nos primeiros minutos.</li>
              <li><b>Teste de hipóteses na anamnese</b> — perguntas que diferenciem as hipóteses (agravantes, 24 h, sintomas associados).</li>
              <li><b>Triagem</b> — red flags (patologia grave), yellow flags (psicossocial), comorbidades e medicamentos.</li>
              <li><b>Planejamento do exame físico</b> — baseado na irritabilidade (SINSS): quanto você pode provocar?</li>
              <li><b>Exame físico dirigido</b> — testes para confirmar (Sp alta) ou descartar (Sn alta) as hipóteses principais; clusters de testes.</li>
              <li><b>Diagnóstico fisioterapêutico (CIF)</b> — condição de saúde + deficiências + limitações + restrições + fatores contextuais.</li>
              <li><b>Fase tecidual e prognóstico</b> — define a dose (carga) e as expectativas.</li>
              <li><b>Intervenção</b> — baseada em evidência, alinhada às metas do paciente.</li>
              <li><b>Reavaliação</b> — sinais comparáveis (asteriscos) na própria sessão e PROMs com MCID ao longo do tempo. Se não melhora, revise a hipótese.</li>
            </ol></div>
            <div class="grid-2">
              <div class="card"><h3>Categorias de hipóteses (Jones & Rivett)</h3><ul>
                <li>Atividade e participação (capacidades e restrições)</li><li>Perspectivas do paciente (crenças, medos, expectativas)</li>
                <li>Mecanismos de dor (nociceptiva, neuropática, nociplástica)</li><li>Fontes dos sintomas (estrutura/tecido)</li>
                <li>Fatores contribuintes (biomecânicos, carga, ambiente)</li><li>Precauções e contraindicações</li>
                <li>Manejo e tratamento</li><li>Prognóstico</li></ul></div>
              <div class="card"><h3>Sinais comparáveis (asteriscos)</h3>
                <p>Escolha 2–3 movimentos/testes que reproduzem a queixa (ex.: agachamento com dor 6/10, elevação do braço até 110°).</p>
                <p>Reteste após cada intervenção: se melhora, a hipótese e a técnica são reforçadas; se não, mude a abordagem.</p>
                <h3>Diagnóstico cinesiológico funcional (CIF)</h3>${lista(CIF.map(c => c[0] + ": " + c[1]))}
              </div>
            </div>`;
        }
        if (k === "dor") {
          el.innerHTML = `
            <div class="grid">${TIPOS_DOR.map(t => `<div class="card"><h3>${esc(t.tipo)}</h3><p>${esc(t.desc)}</p><p><b>Implicação:</b> ${esc(t.conduta)}</p></div>`).join("")}</div>
            <div class="card"><h3>SINSS — planejar a intensidade do exame e do tratamento</h3><table>${SINSS.map(s => `<tr><th>${esc(s[0])}</th><td>${esc(s[1])}</td></tr>`).join("")}</table></div>
            <div class="grid">${Object.entries(IRRITABILIDADE).map(([k2, v]) => `<div class="card"><h3>Irritabilidade ${k2}</h3>${lista(v)}</div>`).join("")}</div>`;
        }
        if (k === "vieses") {
          el.innerHTML = `<div class="card"><h3>Armadilhas cognitivas mais comuns</h3><table>
            ${[["Ancoragem", "Fixar-se na primeira hipótese (ou no diagnóstico do encaminhamento) e ignorar dados contrários.", "Mantenha sempre ≥ 2 hipóteses e procure ativamente dados que as refutem."],
              ["Viés de confirmação", "Buscar só testes que confirmem a hipótese favorita.", "Use testes de alta Sn para descartar o que é perigoso."],
              ["Supervalorizar imagem", "Atribuir a dor a achados frequentes em assintomáticos (protrusões, degeneração, rupturas parciais).", "Correlacione imagem com clínica (Brinjikji 2015)."],
              ["Disponibilidade", "Diagnosticar o que viu recentemente ou é mais lembrado.", "Pense na prevalência (probabilidade pré-teste)."],
              ["Fechamento prematuro", "Parar de pensar após um diagnóstico plausível.", "Pergunte: 'o que mais pode ser? o que não pode passar despercebido?'"],
              ["Foco excessivo no tecido", "Ignorar fatores psicossociais e mecanismos centrais em dor persistente.", "Use modelo biopsicossocial e triagem de yellow flags."]]
              .map(v => `<tr><th>${v[0]}</th><td>${v[1]}</td><td><b>Antídoto:</b> ${v[2]}</td></tr>`).join("")}</table></div>`;
        }
      })}`;
  }

  // ================================================================= REPARO TECIDUAL
  function reparo() {
    app.innerHTML = `
      <h1>🩹 Reparo tecidual e estágio da lesão</h1>
      <p class="muted">A conduta correta depende da fase biológica do tecido e da irritabilidade clínica — não apenas do tempo desde a lesão.</p>
      <div class="timeline">${FASES.map(f => `<div class="card fase" style="border-top-color:${f.cor}">
        <h3>${esc(f.nome)}</h3><span class="tag">${esc(f.dias)}</span>
        <details open><summary>O que acontece no tecido</summary>${lista(f.biologia)}</details>
        <details><summary>Sinais clínicos</summary>${lista(f.sinais)}</details>
        <details><summary>Objetivos</summary>${lista(f.objetivos)}</details>
        <details><summary>Conduta</summary>${lista(f.conduta)}</details>
        <div class="aviso">${esc(f.alerta)}</div></div>`).join("")}</div>

      <div class="card" id="estimador"><h2>Estimador de fase</h2>
        <div class="form-grid">
          <div><label>Tecido</label><select id="eTec">${TECIDOS.map(t => `<option value="${t.id}">${esc(t.nome)}</option>`).join("")}</select></div>
          <div><label>Dias desde a lesão/início</label><input type="number" id="eDias" min="0" value="7"></div>
          <div><label>Irritabilidade</label><select id="eIrr"><option value="alta">Alta</option><option value="moderada" selected>Moderada</option><option value="baixa">Baixa</option></select></div>
        </div>
        <div class="checks" style="margin-top:8px">
          <label class="check"><input type="checkbox" id="eRep"> Dor em repouso</label>
          <label class="check"><input type="checkbox" id="eCal"> Calor / rubor</label>
          <label class="check"><input type="checkbox" id="eEde"> Edema / derrame</label>
          <label class="check"><input type="checkbox" id="eNot"> Dor noturna</label>
        </div>
        <div id="eRes" style="margin-top:12px"></div>
      </div>

      <h2>Tempo de reparo por tecido</h2>
      ${TECIDOS.map(t => `<details><summary>${esc(t.nome)} <small class="muted">· vascularização: ${esc(t.vascular)}</small></summary>
        <p><b>Tempo:</b> ${esc(t.tempo)}</p>${lista(t.particularidades)}<p><b>Progressão de carga:</b> ${esc(t.carga)}</p>
        <p><b>Condições relacionadas:</b> ${CONDICOES.filter(c => c.tecido === t.id).map(c => `<a class="tag" href="#/condicao/${c.id}">${esc(c.nome)}</a>`).join("") || "—"}</p></details>`).join("")}

      <div class="card"><h2>Princípios de mecanoterapia</h2><ul>
        <li><b>Mecanotransdução:</b> a carga mecânica é convertida em resposta celular (síntese de colágeno, alinhamento das fibras). Tecido sem carga perde propriedades.</li>
        <li><b>Envelope de função (Dye):</b> cada tecido tem uma faixa de carga tolerável; acima dela → irritação/lesão, abaixo → descondicionamento. A reabilitação expande o envelope gradualmente.</li>
        <li><b>Capacidade vs. carga:</b> lesões por sobrecarga ocorrem quando a carga excede a capacidade. Aumente a capacidade (força) e controle a carga (volume, frequência, intensidade).</li>
        <li><b>Monitoramento:</b> use resposta em 24 h, dor durante (≤ 5/10 em tendões) e sinais inflamatórios para ajustar a dose.</li>
        <li><b>Fatores que atrasam o reparo:</b> tabagismo, diabetes, idade avançada, desnutrição, deficiência energética (RED-S), sono ruim, corticoides, AINEs em uso prolongado, estresse psicológico.</li>
        <li><b>PEACE & LOVE</b> (Dubois & Esculier, BJSM 2020): substitui RICE/PRICE — enfatiza educação, evitar AINEs de rotina e carga precoce.</li></ul></div>`;
    const calc = () => {
      const t = tecido($("#eTec").value);
      const r = estimarFase(+$("#eDias").value || 0, { repouso: $("#eRep").checked, calor: $("#eCal").checked, edema: $("#eEde").checked, noturna: $("#eNot").checked, irritabilidade: $("#eIrr").value });
      const f = fase(r.fase);
      $("#eRes").innerHTML = `<div class="info"><p>Fase provável: ${pillFase(r.fase)}</p>
        <p><b>Objetivos:</b> ${esc(f.objetivos.join("; "))}</p><p><b>Tecido (${esc(t.nome)}):</b> ${esc(t.tempo)}</p><p><b>Progressão:</b> ${esc(t.carga)}</p>
        ${r.obs.map(o => `<div class="aviso">${esc(o)}</div>`).join("")}</div>`;
    };
    $("#estimador").addEventListener("input", calc); $("#estimador").addEventListener("change", calc); calc();
  }

  // ================================================================= CONDIÇÕES
  function condicoes() {
    const st = store.get("filtroCond", "");
    app.innerHTML = `<h1>📚 Condições e condutas</h1>
      <p class="muted">Cada condição traz raciocínio diagnóstico, prognóstico, conduta por fase do reparo e evidências.</p>
      <div class="row"><select id="fReg" style="max-width:260px"><option value="">Todas as regiões</option>${REGIOES.map(r => `<option value="${r.id}" ${st === r.id ? "selected" : ""}>${esc(r.nome)}</option>`).join("")}</select></div>
      <div id="lCond" class="grid" style="margin-top:14px"></div>`;
    const desenhar = () => {
      const r = $("#fReg").value; store.set("filtroCond", r);
      $("#lCond").innerHTML = CONDICOES.filter(c => !r || c.regiao === r).map(c => `<a class="card modulo" href="#/condicao/${c.id}">
        <span class="tag">${esc(regiaoNome(c.regiao))}</span><span class="tag">${esc(tecido(c.tecido)?.nome || "")}</span>
        <h3>${esc(c.nome)}</h3><p class="muted">${esc(c.resumo.slice(0, 150))}…</p></a>`).join("");
    };
    $("#fReg").addEventListener("change", desenhar); desenhar();
  }

  function condicao(id) {
    const c = cond(id);
    if (!c) { app.innerHTML = `<p>Condição não encontrada. <a href="#/condicoes">Voltar</a></p>`; return; }
    const t = tecido(c.tecido);
    app.innerHTML = `
      <p><a href="#/condicoes">← Condições</a></p>
      <h1>${esc(c.nome)}</h1>
      <div class="row"><span class="tag">${esc(regiaoNome(c.regiao))}</span><span class="tag">Tecido: ${esc(t?.nome)}</span></div>
      <div class="card"><p>${esc(c.resumo)}</p></div>
      <div class="grid-2">
        <div class="card"><h3>Achados-chave</h3>${Object.entries(c.achados).sort((a, b) => b[1] - a[1]).map(([k, w]) => `<span class="tag ${w >= 4 ? "ok" : ""}">${esc(rotuloAchado(k))}</span>`).join("")}
          ${Object.keys(c.contra || {}).length ? `<h3>Tornam menos provável</h3>${Object.keys(c.contra).map(k => `<span class="tag bad">${esc(rotuloAchado(k))}</span>`).join("")}` : ""}</div>
        <div class="card"><h3>Diagnóstico diferencial</h3>${lista(c.diferencial)}
          ${c.encaminhar.length ? `<div class="alerta"><b>Encaminhar / atenção:</b>${lista(c.encaminhar)}</div>` : ""}</div>
      </div>
      ${c.testes.length ? `<div class="card"><h3>Testes especiais</h3><div class="tabela-wrap"><table><tr><th>Teste</th><th>Positivo se</th><th>Sn</th><th>Sp</th><th>Utilidade</th></tr>
        ${c.testes.map(teste).filter(Boolean).map(x => `<tr><td><a href="#/testes/${x.id}">${esc(x.nome)}</a></td><td>${esc(x.positivo)}</td><td>${fmt(x.sn)}</td><td>${fmt(x.sp)}</td><td>${esc(x.nota)}</td></tr>`).join("")}</table></div></div>` : ""}
      <div class="card"><h3>Prognóstico</h3><p>${esc(c.prognostico.texto)}</p>
        <div class="grid-2"><div><b>Fatores favoráveis</b>${lista(c.prognostico.bom)}</div><div><b>Fatores desfavoráveis</b>${lista(c.prognostico.ruim)}</div></div>
        <p><b>Reparo do tecido (${esc(t?.nome)}):</b> ${esc(t?.tempo)}</p></div>
      <h2>Conduta por fase</h2>
      <div class="timeline">${FASES.map(f => `<div class="card fase" style="border-top-color:${f.cor}"><h3>${esc(f.nome)}</h3>${lista(c.conduta[f.id])}</div>`).join("")}</div>
      <div class="card"><h3>O que dizem as evidências</h3>${c.evidencia.map(e => `<div class="info"><b>${esc(e.ref)}</b><p>${esc(e.msg)}</p>
        <a href="https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(e.ref.replace(/[—()]/g, " ").slice(0, 120))}" target="_blank" rel="noopener">Buscar no PubMed ↗</a></div>`).join("")}</div>
      <div class="card"><h3>Medidas de desfecho sugeridas</h3>${c.desfechos.map(d => `<span class="tag">${esc(d)}</span>`).join("")} <a href="#/ferramentas">ver MCID</a></div>`;
  }

  // ================================================================= TESTES
  function viewTestes(foco) {
    app.innerHTML = `<h1>🔍 Testes especiais</h1>
      <p class="muted">Sn alta + teste negativo → descarta (SnNout). Sp alta + teste positivo → confirma (SpPin). Valores aproximados de revisões/estudos de acurácia.</p>
      <div class="card" id="calcPos"><h3>Calculadora de probabilidade pós-teste</h3>
        <div class="form-grid">
          <div><label>Probabilidade pré-teste (%)</label><input type="number" id="pPre" value="30" min="1" max="99"></div>
          <div><label>Teste</label><select id="pTeste">${TESTES.filter(t => lrPos(t) != null).map(t => `<option value="${t.id}">${esc(t.nome)}</option>`).join("")}</select></div>
          <div><label>Resultado</label><select id="pRes"><option value="+">Positivo</option><option value="-">Negativo</option></select></div>
        </div><div id="pOut" style="margin-top:10px"></div>
        <small>Pré-teste = prevalência no seu contexto ajustada pela história clínica. Pós-teste calculado pelo teorema de Bayes (odds × LR).</small></div>
      <div class="row"><select id="tReg" style="max-width:240px"><option value="">Todas as regiões</option>${REGIOES.map(r => `<option value="${r.id}">${esc(r.nome)}</option>`).join("")}</select></div>
      <div id="lTestes" style="margin-top:12px"></div>`;
    const calc = () => {
      const t = teste($("#pTeste").value); const pre = Math.min(99, Math.max(1, +$("#pPre").value || 30)) / 100;
      const lr = $("#pRes").value === "+" ? lrPos(t) : lrNeg(t);
      const odds = pre / (1 - pre) * lr; const pos = odds / (1 + odds);
      $("#pOut").innerHTML = `<div class="info">LR${$("#pRes").value} = <b>${lr.toFixed(2).replace(".", ",")}</b> → probabilidade pós-teste: <b>${(pos * 100).toFixed(0)}%</b> (pré: ${(pre * 100).toFixed(0)}%). ${lr > 10 || lr < 0.1 ? "Mudança grande." : lr > 5 || lr < 0.2 ? "Mudança moderada." : lr > 2 || lr < 0.5 ? "Mudança pequena." : "Mudança mínima — o teste isolado pouco ajuda."}</div>`;
    };
    $("#calcPos").addEventListener("input", calc); $("#calcPos").addEventListener("change", calc); calc();
    const desenhar = () => {
      const r = $("#tReg").value;
      $("#lTestes").innerHTML = TESTES.filter(t => !r || t.regiao === r).map(t => {
        const lp = lrPos(t), ln = lrNeg(t);
        const usa = t.sn != null && t.sn >= 0.85 ? `<span class="tag ok">Bom para descartar</span>` : "";
        const usb = t.sp != null && t.sp >= 0.85 ? `<span class="tag ok">Bom para confirmar</span>` : "";
        return `<details id="t-${t.id}" ${foco === t.id ? "open" : ""}><summary>${esc(t.nome)} <small class="muted">· ${esc(regiaoNome(t.regiao))} · ${esc(t.objetivo)}</small> ${usa}${usb}</summary>
          <p><b>Execução:</b> ${esc(t.execucao)}</p><p><b>Positivo:</b> ${esc(t.positivo)}</p>
          <p><b>Sn:</b> ${fmt(t.sn)} · <b>Sp:</b> ${fmt(t.sp)} ${lp ? `· <b>LR+:</b> ${lp.toFixed(1).replace(".", ",")}` : ""} ${ln != null ? `· <b>LR−:</b> ${ln.toFixed(2).replace(".", ",")}` : ""}</p>
          ${t.nota ? `<p class="muted">${esc(t.nota)}</p>` : ""}<p><small>Fonte: ${esc(t.fonte)}</small></p>
          <p>Usado em: ${CONDICOES.filter(c => c.testes.includes(t.id)).map(c => `<a class="tag" href="#/condicao/${c.id}">${esc(c.nome)}</a>`).join("")}</p></details>`;
      }).join("");
      if (foco) setTimeout(() => $("#t-" + foco)?.scrollIntoView({ block: "center" }), 50);
    };
    $("#tReg").addEventListener("change", () => { foco = null; desenhar(); });
    if (foco) { const t = teste(foco); if (t) $("#tReg").value = t.regiao; }
    desenhar();
  }

  // ================================================================= FERRAMENTAS
  function ferramentas(sub) {
    app.innerHTML = `<h1>🧮 Escalas, instrumentos e prescrição</h1>
      ${tabs("tabFer", [["flags", "Red / yellow flags"], ["startback", "STarT Back"], ["proms", "PROMs e MCID"], ["exame", "Força e end-feel"], ["presc", "Prescrição de carga"], ["rts", "Retorno ao esporte"]], sub || "flags", (k, el) => {
        if (k === "flags") el.innerHTML = `<div class="grid-2">${RED_FLAGS.map(g => `<div class="card"><h3>🚩 ${esc(g.grupo)}</h3>${lista(g.itens)}<div class="alerta">${esc(g.acao)}</div></div>`).join("")}</div>
          <div class="card"><h3>🟡 Yellow flags (psicossociais)</h3>${lista(YELLOW_FLAGS)}<p class="muted">Não impedem o tratamento: indicam que a abordagem deve ser psicologicamente informada (educação, exposição gradual, metas, comunicação).</p>
          <h3>Outras flags</h3>${lista(OUTRAS_FLAGS.map(f => f.cor + ": " + f.desc))}<p><small>Finucane LM et al. International Framework for Red Flags for Potential Serious Spinal Pathologies. JOSPT 2020.</small></p></div>`;
        if (k === "startback") { el.innerHTML = `<div class="card"><h3>STarT Back Screening Tool (9 itens)</h3><p class="muted">Estratifica pacientes com dor lombar em baixo, médio e alto risco de mau prognóstico (Hill et al., 2008/2011). Versão brasileira: Pilz et al., 2014.</p>${htmlStartBack(null)}</div>`; bindStartBack(el, () => {}); }
        if (k === "proms") el.innerHTML = `<div class="card"><h3>Instrumentos de desfecho e mínima diferença clinicamente importante (MCID)</h3>
          <div class="tabela-wrap"><table><tr><th>Instrumento</th><th>Domínio</th><th>MCID / ponto de corte</th><th>Referência</th></tr>${PROMS.map(p => `<tr>${p.map(x => `<td>${esc(x)}</td>`).join("")}</tr>`).join("")}</table></div>
          <p class="muted">MCIDs variam com a população e o método. Use também a percepção global de mudança (GROC) do paciente.</p></div>`;
        if (k === "exame") el.innerHTML = `<div class="grid-2"><div class="card"><h3>Escala de Oxford / MRC (força)</h3><table>${OXFORD.map(o => `<tr><th>${o[0]}</th><td>${esc(o[1])}</td></tr>`).join("")}</table>
          <p class="muted">Para graus 4–5, prefira dinamometria manual (maior sensibilidade a déficits e permite LSI).</p></div>
          <div class="card"><h3>Sensação final (end-feel — Cyriax)</h3><table><tr><th>Tipo</th><th>Normal</th><th>Patológico</th></tr>${END_FEEL.map(e => `<tr>${e.map(x => `<td>${esc(x)}</td>`).join("")}</tr>`).join("")}</table></div></div>
          <div class="card"><h3>Relação dor × resistência (Maitland)</h3><ul><li><b>Dor antes da resistência:</b> alta irritabilidade/fase aguda → técnicas suaves (graus I–II).</li><li><b>Dor junto com a resistência:</b> fase subaguda → graus III.</li><li><b>Resistência antes da dor:</b> rigidez predominante → graus III–IV, alongamento, carga.</li></ul></div>`;
        if (k === "presc") {
          el.innerHTML = `<div class="card"><h3>Parâmetros de treino resistido (ACSM / NSCA)</h3><div class="tabela-wrap"><table><tr><th>Objetivo</th><th>Intensidade</th><th>Repetições</th><th>Séries</th><th>Descanso</th><th>Esforço</th></tr>
            ${PRESCRICAO.map(p => `<tr>${p.map(x => `<td>${esc(x)}</td>`).join("")}</tr>`).join("")}</table></div>
            <p class="muted">Frequência: 2–3x/semana por grupo muscular. RIR = repetições em reserva. Progrida carga ~2–10% quando completar as repetições com RIR alvo.</p></div>
            <div class="grid-2"><div class="card" id="rmCalc"><h3>Estimativa de 1RM</h3><div class="form-grid"><div><label>Carga (kg)</label><input type="number" id="rmCarga" value="40"></div><div><label>Repetições até a falha</label><input type="number" id="rmRep" value="8" min="1" max="15"></div></div><div id="rmOut"></div></div>
            <div class="card"><h3>Monitoramento da dor durante a carga</h3>${lista(REGRA_DOR)}</div></div>`;
          const calc = () => { const w = +$("#rmCarga").value, r = +$("#rmRep").value; if (!w || !r) return; const brz = w / (1.0278 - 0.0278 * r), ep = w * (1 + r / 30);
            $("#rmOut").innerHTML = `<div class="info">1RM Brzycki: <b>${brz.toFixed(1)} kg</b> · Epley: <b>${ep.toFixed(1)} kg</b><br>${[60, 70, 80, 85].map(p => `${p}% ≈ ${(brz * p / 100).toFixed(1)} kg`).join(" · ")}</div>`; };
          $("#rmCalc").addEventListener("input", calc); calc();
        }
        if (k === "rts") el.innerHTML = `<div class="grid-2"><div class="card"><h3>Continuum de retorno (Ardern et al., BJSM 2016)</h3><table>${RETORNO_ESPORTE.map(r => `<tr><th>${esc(r[0])}</th><td>${esc(r[1])}</td></tr>`).join("")}</table></div>
          <div class="card"><h3>Critérios para alta / retorno</h3>${lista(RETORNO_CRITERIOS)}</div></div>
          <div class="card" id="lsiCalc"><h3>Índice de simetria entre membros (LSI)</h3><div class="form-grid"><div><label>Membro lesado</label><input type="number" id="lsiL" value="85"></div><div><label>Membro não lesado</label><input type="number" id="lsiN" value="100"></div></div><div id="lsiOut"></div></div>`;
        if (k === "rts") { const c = () => { const l = +$("#lsiL").value, n = +$("#lsiN").value; if (!n) return; const v = l / n * 100; $("#lsiOut").innerHTML = `<div class="${v >= 90 ? "sucesso" : "aviso"}">LSI = <b>${v.toFixed(0)}%</b> ${v >= 90 ? "— atinge o critério (≥ 90%)." : "— abaixo de 90%: continuar fortalecimento."}</div>`; }; $("#lsiCalc").addEventListener("input", c); c(); }
      }, !!sub)}`;
  }

  function htmlStartBack(resp) {
    resp = resp || [];
    return `<div class="sb">${STARTBACK.map((q, i) => `<label class="check"><input type="checkbox" data-sb="${i}" ${resp[i] ? "checked" : ""}> ${i + 1}. ${esc(q)} ${i >= 4 ? `<span class="tag">psicossocial</span>` : ""}</label>`).join("")}<div class="sbOut"></div></div>`;
  }
  function calcStartBack(resp) {
    const total = resp.filter(Boolean).length, psico = resp.slice(4).filter(Boolean).length;
    const risco = total <= 3 ? "baixo" : psico >= 4 ? "alto" : "médio";
    return { total, psico, risco };
  }
  function bindStartBack(el, onChange, inicial) {
    const resp = inicial ? inicial.slice() : Array(9).fill(false);
    const out = () => {
      const r = calcStartBack(resp);
      const txt = { baixo: "Baixo risco: educação, tranquilização, estímulo à atividade, analgesia simples; poucas sessões.", médio: "Médio risco: fisioterapia com exercício e terapia manual, educação.", alto: "Alto risco: fisioterapia psicologicamente informada (abordagem cognitivo-comportamental, exposição gradual) + exercício." }[r.risco];
      $(".sbOut", el).innerHTML = `<div class="${r.risco === "alto" ? "alerta" : r.risco === "médio" ? "aviso" : "sucesso"}">Total: <b>${r.total}/9</b> · Psicossocial: <b>${r.psico}/5</b> → <b>risco ${r.risco}</b>. ${txt}</div>`;
    };
    el.addEventListener("change", e => { if (e.target.dataset.sb == null) return; resp[+e.target.dataset.sb] = e.target.checked; out(); onChange(resp); });
    out();
  }

  // ================================================================= ANATOMIA
  function anatomia(sub, item) {
    app.innerHTML = `<h1>🦵 Anatomia aplicada</h1>
      ${tabs("tabAna", [["m", "Músculos"], ["ossos", "Ossos"], ["nervos", "Nervos periféricos"], ["neuro", "Dermátomos, miótomos e reflexos"], ["art", "Artrocinemática"]], sub === "nervos" || sub === "neuro" || sub === "ossos" || sub === "art" ? sub : "m", (k, el) => {
        if (k === "m") {
          el.innerHTML = `<div class="row"><input type="search" id="mBusca" placeholder="Filtrar por nome, inervação, ação (ex.: radial, abdução, L5)" style="max-width:480px" value="${esc(item || "")}">
            <select id="mGrupo" style="max-width:260px"><option value="">Todos os grupos</option>${Object.keys(MUSCULOS).map(g => `<option>${esc(g)}</option>`).join("")}</select></div><div id="mLista" style="margin-top:12px"></div>`;
          const desenhar = () => {
            const q = norm($("#mBusca").value.trim()), g = $("#mGrupo").value;
            $("#mLista").innerHTML = Object.entries(MUSCULOS).filter(([gr]) => !g || gr === g).map(([gr, ms]) => {
              const f = ms.filter(m => !q || norm(m.join(" ")).includes(q));
              if (!f.length) return "";
              return `<h3>${esc(gr)}</h3><div class="tabela-wrap"><table><tr><th>Músculo</th><th>Origem</th><th>Inserção</th><th>Inervação</th><th>Ação / relevância clínica</th></tr>${f.map(m => `<tr><td><b>${esc(m[0])}</b></td><td>${esc(m[1])}</td><td>${esc(m[2])}</td><td>${esc(m[3])}</td><td>${esc(m[4])}</td></tr>`).join("")}</table></div>`;
            }).join("") || `<p class="muted">Nenhum músculo encontrado.</p>`;
          };
          $("#mBusca").addEventListener("input", desenhar); $("#mGrupo").addEventListener("change", desenhar); desenhar();
        }
        if (k === "ossos") el.innerHTML = OSSOS.map(o => `<div class="card"><h3>${esc(o.regiao)}</h3><table>${o.itens.map(i => `<tr><th style="width:28%">${esc(i[0])}</th><td>${esc(i[1])}</td></tr>`).join("")}</table></div>`).join("");
        if (k === "nervos") el.innerHTML = `<div class="tabela-wrap"><table><tr><th>Nervo (raízes)</th><th>Músculos</th><th>Território sensitivo</th><th>Locais de lesão / sinais</th></tr>${NERVOS.map(n => `<tr>${n.map((x, i) => `<td>${i ? esc(x) : `<b>${esc(x)}</b>`}</td>`).join("")}</tr>`).join("")}</table></div>
          <div class="info">Plexo braquial: C5–T1 (raízes → troncos → divisões → fascículos → ramos: "Rafael Tem Dois Fascículos Ruins"). Plexo lombar: T12–L4. Plexo sacral: L4–S4.</div>`;
        if (k === "neuro") el.innerHTML = `<div class="card"><p>No exame neurológico, compare bilateralmente: <b>sensibilidade</b> (tato leve, picada) no dermátomo, <b>força</b> no miótomo e <b>reflexos</b>. Alteração em ≥ 2 componentes do mesmo nível reforça radiculopatia. Hiperreflexia/sinais de neurônio motor superior → suspeita de mielopatia/lesão central.</p></div>
          <div class="tabela-wrap"><table><tr><th>Nível</th><th>Dermátomo</th><th>Miótomo</th><th>Reflexo</th></tr>${NEURO_SEG.map(n => `<tr><td><b>${esc(n[0])}</b></td><td>${esc(n[1])}</td><td>${esc(n[2])}</td><td>${esc(n[3])}</td></tr>`).join("")}</table></div>
          <div class="card"><h3>Graduação de reflexos</h3><p>0 ausente · 1+ diminuído · 2+ normal · 3+ aumentado · 4+ clônus. Sinais de neurônio motor superior: Hoffmann, Babinski, clônus, marcha atáxica.</p></div>`;
        if (k === "art") el.innerHTML = `<div class="tabela-wrap"><table><tr><th>Articulação</th><th>Tipo / artrocinemática</th><th>Padrão capsular</th><th>Posições de repouso e travamento</th></tr>${ARTICULACOES.map(a => `<tr>${a.map((x, i) => `<td>${i ? esc(x) : `<b>${esc(x)}</b>`}</td>`).join("")}</tr>`).join("")}</table></div>
          <div class="card"><h3>Regra convexo-côncavo (Kaltenborn)</h3><p><b>Superfície convexa</b> movendo sobre côncava: rolamento e deslizamento em sentidos <b>opostos</b> (ex.: úmero na glenoide — para ganhar abdução, deslizar a cabeça umeral inferiormente).</p><p><b>Superfície côncava</b> movendo sobre convexa: rolamento e deslizamento no <b>mesmo</b> sentido (ex.: tíbia no fêmur — para ganhar extensão, deslizar a tíbia anteriormente).</p></div>`;
      }, !!sub)}`;
  }

  // ================================================================= EVIDÊNCIAS
  function evidencias() {
    app.innerHTML = `<h1>🔬 Evidências, guidelines e leitura de artigos</h1>
      <p class="muted">O que as diretrizes e os melhores estudos dizem — traduzido para a prática: o que importa, o que não importa e o que ainda é incerto.</p>
      ${tabs("tabEv", [["pratica", "O que fazer / não fazer"], ["guidelines", "Guidelines por condição"], ["onze", "11 recomendações"], ["niveis", "Níveis e GRADE"], ["leitura", "Leitura crítica"], ["analise", "Interpretar resultados"], ["busca", "Buscar artigos"], ["glossario", "Glossário PT ↔ EN"], ["fontes", "Fontes confiáveis"]], "pratica", (k, el) => {
        if (k === "pratica") el.innerHTML = `<div class="grid">
          <div class="card"><h3 style="color:var(--ok)">✅ O que importa (faça)</h3>${FACA_NAO_FACA.faca.map(f => `<p><b>${esc(f[0])}</b><br><small>${esc(f[1])}</small></p>`).join("")}</div>
          <div class="card"><h3 style="color:var(--danger)">⛔ Pouco valor ou não recomendado</h3>${FACA_NAO_FACA.nao.map(f => `<p><b>${esc(f[0])}</b><br><small>${esc(f[1])}</small></p>`).join("")}</div>
          <div class="card"><h3 style="color:var(--warn)">❓ Incerto / evidência mista</h3>${FACA_NAO_FACA.incerto.map(f => `<p><b>${esc(f[0])}</b><br><small>${esc(f[1])}</small></p>`).join("")}</div></div>`;
        if (k === "guidelines") el.innerHTML = REGIOES.map(r => {
          const cs = CONDICOES.filter(c => c.regiao === r.id); if (!cs.length) return "";
          return `<h2>${esc(r.nome)}</h2>${cs.map(c => `<details><summary>${esc(c.nome)}</summary>${c.evidencia.map(e => `<div class="info"><b>${esc(e.ref)}</b><p>${esc(e.msg)}</p></div>`).join("")}<a href="#/condicao/${c.id}">Ver condição completa →</a></details>`).join("")}`;
        }).join("");
        if (k === "onze") el.innerHTML = `<div class="card"><h3>Melhor prática para dor musculoesquelética</h3><p class="muted">Lin I et al. What does best practice care for musculoskeletal pain look like? Eleven consistent recommendations from high-quality clinical practice guidelines. BJSM 2020;54:79–86.</p><ol>${ONZE_RECOMENDACOES.map(r => `<li>${esc(r)}</li>`).join("")}</ol></div>`;
        if (k === "niveis") el.innerHTML = `<div class="card"><h3>Hierarquia de evidência (Oxford CEBM — intervenção)</h3><table>${NIVEIS_EVIDENCIA.map(n => `<tr><th>${n.nivel}</th><td>${esc(n.desc)}<br><small>${esc(n.nota)}</small></td></tr>`).join("")}</table>
          <p class="muted">Para perguntas de diagnóstico, prognóstico e etiologia, o melhor desenho muda (estudos de acurácia transversais, coortes prospectivas).</p></div>
          <div class="grid-2"><div class="card"><h3>GRADE — certeza da evidência</h3><table>${GRADE.map(g => `<tr><th>${g[0]}</th><td>${esc(g[1])}</td></tr>`).join("")}</table></div>
          <div class="card"><h3>O que muda a certeza</h3><b>Rebaixam:</b>${lista(GRADE_FATORES.rebaixam)}<b>Elevam (estudos observacionais):</b>${lista(GRADE_FATORES.elevam)}</div></div>`;
        if (k === "leitura") {
          el.innerHTML = `<div class="grid-2"><div>${LEITURA_CRITICA.map(s => `<div class="card"><h3>${esc(s.titulo)}</h3>${lista(s.itens)}</div>`).join("")}
            <div class="card"><h3>Como ler um resumo (abstract) rapidamente</h3><table>
              <tr><th>Background / Objective</th><td>Qual a pergunta? (identifique o PICO)</td></tr>
              <tr><th>Methods / Design</th><td>Qual o desenho? ECR? Revisão sistemática? Quantos participantes? Qual comparação?</td></tr>
              <tr><th>Results</th><td>Diferença ENTRE grupos com IC 95%. Ignore "melhorou em ambos os grupos" — isso não prova eficácia.</td></tr>
              <tr><th>Conclusion</th><td>Confere com os resultados? Desconfie de conclusões mais otimistas que os números ("spin").</td></tr></table></div></div>
            <div class="card" id="pedroCalc"><h3>Calculadora da escala PEDro</h3><p class="muted">Marque os critérios satisfeitos pelo ensaio clínico. Item 1 não pontua.</p>
              ${PEDRO.map((p, i) => `<label class="check"><input type="checkbox" data-pedro="${i}"> ${i + 1}. ${esc(p)}</label>`).join("")}<div id="pedroOut"></div></div></div>`;
          const c = () => { const s = $$("[data-pedro]", el).filter(x => x.checked && x.dataset.pedro !== "0").length;
            $("#pedroOut").innerHTML = `<div class="${s >= 6 ? "sucesso" : s >= 4 ? "aviso" : "alerta"}">Pontuação: <b>${s}/10</b> — ${s >= 9 ? "excelente" : s >= 6 ? "boa qualidade (≥ 6)" : s >= 4 ? "qualidade regular" : "baixa qualidade"}. <small>Em fisioterapia, cegar paciente e terapeuta raramente é possível — 8/10 é praticamente o máximo realista.</small></div>`; };
          $("#pedroCalc").addEventListener("change", c); c();
        }
        if (k === "analise") {
          el.innerHTML = `<div class="grid-2"><div class="card" id="mcidCalc"><h3>O efeito é clinicamente importante?</h3>
            <p class="muted">Insira a diferença média ENTRE grupos (a favor da intervenção = positivo), o IC 95% e o MCID do desfecho (mesma escala).</p>
            <div class="form-grid"><div><label>Diferença entre grupos</label><input type="number" step="any" id="aDif" value="1.2"></div><div><label>IC 95% inferior</label><input type="number" step="any" id="aLo" value="0.4"></div>
            <div><label>IC 95% superior</label><input type="number" step="any" id="aHi" value="2.0"></div><div><label>MCID</label><input type="number" step="any" id="aMcid" value="2"></div></div><div id="aOut"></div></div>
            <div class="card" id="nntCalc"><h3>NNT — número necessário para tratar</h3><p class="muted">Proporção de pacientes com desfecho positivo (ex.: "melhorou muito") em cada grupo.</p>
            <div class="form-grid"><div><label>% sucesso intervenção</label><input type="number" id="nI" value="60"></div><div><label>% sucesso controle</label><input type="number" id="nC" value="40"></div></div><div id="nOut"></div></div></div>
            <div class="card"><h3>Tamanho de efeito (SMD / d de Cohen)</h3><p>0,2 = pequeno · 0,5 = moderado · 0,8 = grande. Em revisões com escalas diferentes, o SMD permite combinar estudos. Converta para a escala original multiplicando pelo DP típico (ex.: SMD 0,5 × DP 2 pontos na NPRS ≈ 1 ponto — abaixo do MCID de 2).</p></div>`;
          const a = () => {
            const d = +$("#aDif").value, lo = +$("#aLo").value, hi = +$("#aHi").value, m = +$("#aMcid").value;
            let msg, cls;
            if (lo <= 0 && hi >= 0) { msg = "IC inclui zero: diferença NÃO estatisticamente significativa. " + (hi < m ? "E o IC exclui o MCID → provavelmente não há efeito importante." : "Estudo inconclusivo (pode haver ou não efeito importante)."); cls = "aviso"; }
            else if (hi < 0) { msg = "A diferença favorece o CONTROLE."; cls = "alerta"; }
            else if (lo >= m) { msg = "Todo o IC está acima do MCID: efeito clinicamente importante com boa precisão."; cls = "sucesso"; }
            else if (hi < m) { msg = "Estatisticamente significativo, mas TODO o IC está abaixo do MCID: efeito provavelmente trivial para o paciente."; cls = "alerta"; }
            else { msg = d >= m ? "Estimativa acima do MCID, mas o IC inclui valores triviais: provável benefício, com incerteza." : "Significativo, mas a estimativa está abaixo do MCID; o IC inclui efeitos importantes e triviais: incerto se é relevante."; cls = "aviso"; }
            $("#aOut").innerHTML = `<div class="${cls}">${msg}</div>`;
          };
          const n = () => { const i = +$("#nI").value / 100, c = +$("#nC").value / 100, arr = i - c;
            $("#nOut").innerHTML = arr > 0 ? `<div class="info">Redução/aumento absoluto: <b>${(arr * 100).toFixed(1)}%</b> → NNT = <b>${Math.ceil(1 / arr)}</b>: é preciso tratar ${Math.ceil(1 / arr)} pacientes para 1 a mais ter sucesso.</div>` : `<div class="aviso">Sem benefício absoluto da intervenção.</div>`; };
          $("#mcidCalc").addEventListener("input", a); $("#nntCalc").addEventListener("input", n); a(); n();
        }
        if (k === "busca") {
          const opP = GLOSSARIO.slice(0, 12).map(g => `<option value="${esc(g[1])}">${esc(g[0])} — ${esc(g[1])}</option>`).join("");
          const opI = GLOSSARIO.slice(11, 15).map(g => `<option value="${esc(g[1])}">${esc(g[0])} — ${esc(g[1])}</option>`).join("");
          el.innerHTML = `<div class="card" id="pico"><h3>Montar busca com PICO</h3><p class="muted">Selecione termos traduzidos ou digite em inglês. A busca prioriza revisões sistemáticas, ensaios clínicos e diretrizes.</p>
            <div class="form-grid">
              <div><label>P — População/condição</label><select id="qPs"><option value="">(digitar)</option>${opP}</select><input type="text" id="qP" placeholder="ex.: patellofemoral pain"></div>
              <div><label>I — Intervenção</label><select id="qIs"><option value="">(digitar)</option>${opI}</select><input type="text" id="qI" placeholder="ex.: hip strengthening"></div>
              <div><label>C — Comparação (opcional)</label><input type="text" id="qC" placeholder="ex.: placebo"></div>
              <div><label>O — Desfecho (opcional)</label><input type="text" id="qO" placeholder="ex.: pain, function"></div>
            </div>
            <label>Tipo de estudo</label><div class="row">
              <label class="check"><input type="checkbox" data-f="pubt.systematicreview" checked> Revisão sistemática</label>
              <label class="check"><input type="checkbox" data-f="pubt.meta-analysis"> Meta-análise</label>
              <label class="check"><input type="checkbox" data-f="pubt.randomizedcontrolledtrial"> ECR</label>
              <label class="check"><input type="checkbox" data-f="pubt.guideline"> Diretriz</label>
              <label class="check"><input type="checkbox" data-f="datesearch.y_5"> Últimos 5 anos</label></div>
            <div id="qOut" style="margin-top:10px"></div></div>
            <div class="card"><h3>Dica: estratégia de busca em ordem</h3><ol><li>Diretrizes (JOSPT CPG, NICE) — síntese pronta.</li><li>Revisões sistemáticas recentes (Cochrane, BJSM, JOSPT).</li><li>ECRs de alta qualidade (PEDro ≥ 6) se não houver revisão recente.</li><li>Ao achar um bom artigo, use "Similar articles" e "Cited by" no PubMed.</li></ol></div>`;
          const g = () => {
            const P = $("#qP").value.trim() || $("#qPs").value, I = $("#qI").value.trim() || $("#qIs").value, C = $("#qC").value.trim(), O = $("#qO").value.trim();
            const partes = [P, I, C, O].filter(Boolean).map(x => `(${x})`);
            if (!partes.length) { $("#qOut").innerHTML = `<p class="muted">Preencha ao menos P ou I.</p>`; return; }
            const q = partes.join(" AND ");
            const filtros = $$("[data-f]", el).filter(x => x.checked).map(x => "&filter=" + x.dataset.f).join("");
            $("#qOut").innerHTML = `<div class="info"><b>Consulta:</b> <code>${esc(q)}</code></div><div class="row">
              <a class="btn" target="_blank" rel="noopener" href="https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(q)}${filtros}">PubMed ↗</a>
              <a class="btn sec" target="_blank" rel="noopener" href="https://europepmc.org/search?query=${encodeURIComponent(q)}">Europe PMC ↗</a>
              <a class="btn sec" target="_blank" rel="noopener" href="https://scholar.google.com/scholar?q=${encodeURIComponent(q)}">Google Scholar ↗</a>
              <a class="btn sec" target="_blank" rel="noopener" href="https://pedro.org.au/">PEDro ↗</a></div>
              <small class="muted">No PEDro, cole os termos na busca simples ou avançada.</small>`;
          };
          $("#pico").addEventListener("input", g); $("#pico").addEventListener("change", g); g();
        }
        if (k === "glossario") el.innerHTML = `<div class="tabela-wrap"><table><tr><th>Português</th><th>Inglês</th><th>Termo de busca / MeSH</th></tr>${GLOSSARIO.map(g => `<tr><td>${esc(g[0])}</td><td><b>${esc(g[1])}</b></td><td><small>${esc(g[2])}</small></td></tr>`).join("")}</table></div>
          <h3>Estatística para testes diagnósticos</h3><div class="tabela-wrap"><table>${ESTATISTICA.map(e => `<tr><th>${esc(e[0])}</th><td>${esc(e[1])}</td></tr>`).join("")}</table></div>`;
        if (k === "fontes") el.innerHTML = `<div class="grid">${FONTES.map(f => `<div class="card"><h3><a href="${f.url}" target="_blank" rel="noopener">${esc(f.nome)} ↗</a></h3><p>${esc(f.desc)}</p></div>`).join("")}</div>`;
      })}`;
  }

  // ================================================================= ESTUDO
  function gerarCartoes() {
    const cards = [];
    Object.entries(MUSCULOS).forEach(([g, ms]) => ms.forEach(m => {
      cards.push({ id: "mi_" + m[0], deck: "musculos", f: `Inervação: <b>${esc(m[0])}</b>`, v: esc(m[3]) });
      cards.push({ id: "ma_" + m[0], deck: "musculos", f: `Origem, inserção e ação: <b>${esc(m[0])}</b>`, v: `<b>O:</b> ${esc(m[1])}<br><b>I:</b> ${esc(m[2])}<br><b>Ação:</b> ${esc(m[4])}` });
    }));
    TESTES.forEach(t => cards.push({ id: "t_" + t.id, deck: "testes", f: `O que avalia e como interpretar: <b>${esc(t.nome)}</b>?`, v: `${esc(t.objetivo)}<br><small>${esc(t.positivo)}</small><br>Sn ${fmt(t.sn)} · Sp ${fmt(t.sp)}<br><small>${esc(t.nota)}</small>` }));
    NEURO_SEG.forEach(n => cards.push({ id: "n_" + n[0], deck: "neuro", f: `Dermátomo, miótomo e reflexo de <b>${esc(n[0])}</b>`, v: `${esc(n[1])}<br>Miótomo: ${esc(n[2])}<br>Reflexo: ${esc(n[3])}` }));
    NERVOS.forEach(n => cards.push({ id: "nv_" + n[0], deck: "neuro", f: `Nervo <b>${esc(n[0])}</b>: músculos e lesão típica`, v: `${esc(n[1])}<br><small>${esc(n[3])}</small>` }));
    CONDICOES.forEach(c => {
      cards.push({ id: "cp_" + c.id, deck: "condicoes", f: `Prognóstico: <b>${esc(c.nome)}</b>`, v: esc(c.prognostico.texto) });
      cards.push({ id: "cd_" + c.id, deck: "condicoes", f: `Diagnóstico diferencial: <b>${esc(c.nome)}</b>`, v: esc(c.diferencial.join("; ")) });
      cards.push({ id: "cc_" + c.id, deck: "condicoes", f: `Conduta na fase proliferativa: <b>${esc(c.nome)}</b>`, v: esc(c.conduta.proliferativa.join("; ")) });
    });
    FASES.forEach(f => cards.push({ id: "f_" + f.id, deck: "reparo", f: `Biologia e conduta: <b>${esc(f.nome)}</b> (${esc(f.dias)})`, v: lista(f.biologia.slice(0, 3)) + "<b>Conduta:</b> " + esc(f.conduta[0]) }));
    TECIDOS.forEach(t => cards.push({ id: "tc_" + t.id, deck: "reparo", f: `Tempo de reparo: <b>${esc(t.nome)}</b>`, v: esc(t.tempo) }));
    RED_FLAGS.forEach((r, i) => cards.push({ id: "rf_" + i, deck: "reparo", f: `Red flags de <b>${esc(r.grupo)}</b>`, v: lista(r.itens) + esc(r.acao) }));
    return cards;
  }
  const INTERVALOS = [0, 1, 3, 7, 14, 30]; // dias por caixa de Leitner

  function estudo() {
    app.innerHTML = `<h1>🎓 Estudo</h1>${tabs("tabEst", [["flash", "Flashcards (repetição espaçada)"], ["quiz", "Quiz"], ["casos", "Casos clínicos"]], "flash", (k, el) => {
      if (k === "flash") viewFlash(el);
      if (k === "quiz") viewQuiz(el);
      if (k === "casos") viewCasos(el);
    })}`;
  }

  function viewFlash(el) {
    const todos = gerarCartoes();
    const prog = store.get("flash_prog", {});
    const decks = { todos: "Todos", musculos: "Músculos", testes: "Testes especiais", neuro: "Neuro: dermátomos e nervos", condicoes: "Condições", reparo: "Reparo e red flags" };
    let deck = store.get("flash_deck", "todos");
    let fila = [], atual = null, virado = false;
    const hoje = () => Math.floor(Date.now() / 86400000);
    const montar = () => {
      const pool = todos.filter(c => deck === "todos" || c.deck === deck);
      const devidos = pool.filter(c => !prog[c.id] || prog[c.id].due <= hoje());
      fila = shuffle(devidos).sort((a, b) => (prog[a.id]?.box || 0) - (prog[b.id]?.box || 0)).slice(0, 20);
      return pool;
    };
    const desenhar = () => {
      const pool = montar();
      const dominados = pool.filter(c => (prog[c.id]?.box || 0) >= 4).length;
      el.innerHTML = `<div class="row"><select id="fDeck" style="max-width:280px">${Object.entries(decks).map(([k, l]) => `<option value="${k}" ${k === deck ? "selected" : ""}>${l}</option>`).join("")}</select>
        <span class="tag">${pool.length} cartões</span><span class="tag ok">${dominados} dominados</span><span class="tag warn">${fila.length} para revisar agora</span>
        <button class="btn sec peq" id="fReset">Zerar progresso deste baralho</button></div><div id="fArea" style="margin-top:14px"></div>
        <p class="muted">Clique no cartão para ver a resposta. "Acertei" move o cartão para uma caixa com intervalo maior (1, 3, 7, 14, 30 dias); "Errei" volta para o início.</p>`;
      $("#fDeck", el).addEventListener("change", e => { deck = e.target.value; store.set("flash_deck", deck); desenhar(); });
      $("#fReset", el).addEventListener("click", () => { if (!confirm("Zerar progresso deste baralho?")) return; pool.forEach(c => delete prog[c.id]); store.set("flash_prog", prog); desenhar(); });
      proximo();
    };
    const proximo = () => {
      atual = fila.shift(); virado = false;
      const area = $("#fArea", el);
      if (!atual) { area.innerHTML = `<div class="sucesso">🎉 Nenhum cartão pendente neste baralho hoje. Volte amanhã ou escolha outro baralho.</div>`; return; }
      area.innerHTML = `<div class="card flash" id="fCard"><div>${atual.f}</div><div class="resp" hidden>${atual.v}</div></div>
        <div class="row" id="fBtns" hidden><button class="btn perigo" data-r="0">Errei</button><button class="btn sec" data-r="1">Difícil</button><button class="btn" data-r="2">Acertei</button></div>`;
      $("#fCard", el).addEventListener("click", () => { virado = true; $(".resp", el).hidden = false; $("#fBtns", el).hidden = false; });
      $("#fBtns", el).addEventListener("click", e => {
        const b = e.target.closest("button[data-r]"); if (!b || !virado) return;
        const p = prog[atual.id] || { box: 0 };
        p.box = b.dataset.r === "0" ? 0 : b.dataset.r === "1" ? Math.max(1, p.box) : Math.min(5, p.box + 1);
        p.due = hoje() + INTERVALOS[p.box]; prog[atual.id] = p; store.set("flash_prog", prog);
        if (b.dataset.r === "0") fila.push(atual);
        proximo();
      });
    };
    desenhar();
  }

  function gerarQuiz(n = 10) {
    const qs = [];
    const musc = Object.values(MUSCULOS).flat();
    const tipos = [
      () => { const m = musc[Math.floor(Math.random() * musc.length)]; const dist = shuffle([...new Set(musc.filter(x => x[3] !== m[3]).map(x => x[3]))]).slice(0, 3); return { p: `Qual a inervação do músculo ${m[0]}?`, op: shuffle([m[3], ...dist]), c: m[3], exp: `${m[0]}: ${m[4]}` }; },
      () => { const m = musc[Math.floor(Math.random() * musc.length)]; const dist = shuffle(musc.filter(x => x[0] !== m[0])).slice(0, 3).map(x => x[0]); return { p: `Qual músculo tem a ação: "${m[4]}"?`, op: shuffle([m[0], ...dist]), c: m[0], exp: `Inervação: ${m[3]}` }; },
      () => { const t = TESTES[Math.floor(Math.random() * TESTES.length)]; const dist = shuffle([...new Set(TESTES.filter(x => x.objetivo !== t.objetivo).map(x => x.objetivo))]).slice(0, 3); return { p: `O teste "${t.nome}" é usado principalmente para:`, op: shuffle([t.objetivo, ...dist]), c: t.objetivo, exp: `${t.positivo} ${t.nota}` }; },
      () => { const s = NEURO_SEG.filter(x => x[2] !== "—"); const r = s[Math.floor(Math.random() * s.length)]; const dist = shuffle(s.filter(x => x[0] !== r[0])).slice(0, 3).map(x => x[0]); return { p: `Qual nível corresponde ao miótomo "${r[2]}" e dermátomo "${r[1]}"?`, op: shuffle([r[0], ...dist]), c: r[0], exp: `Reflexo: ${r[3]}` }; },
      () => { const c = CONDICOES[Math.floor(Math.random() * CONDICOES.length)]; const dist = shuffle(TECIDOS.filter(t => t.id !== c.tecido)).slice(0, 3).map(t => t.nome); const certo = tecido(c.tecido).nome; return { p: `Qual o tecido principal envolvido em "${c.nome}" (para guiar o reparo)?`, op: shuffle([certo, ...dist]), c: certo, exp: tecido(c.tecido).tempo }; },
      () => { const ts = TESTES.filter(t => t.sn != null && t.sp != null && Math.abs(t.sn - t.sp) >= 0.25); const t = ts[Math.floor(Math.random() * ts.length)]; const certo = t.sn > t.sp ? "Descartar a condição quando negativo (SnNout)" : "Confirmar a condição quando positivo (SpPin)"; return { p: `${t.nome} (Sn ${fmt(t.sn)}, Sp ${fmt(t.sp)}) é mais útil para:`, op: shuffle(["Descartar a condição quando negativo (SnNout)", "Confirmar a condição quando positivo (SpPin)"]), c: certo, exp: t.nota }; }
    ];
    for (let i = 0; i < n; i++) qs.push(tipos[Math.floor(Math.random() * tipos.length)]());
    return qs;
  }

  function viewQuiz(el) {
    let qs = gerarQuiz(), i = 0, acertos = 0;
    const hist = store.get("quiz_hist", []);
    const mostrar = () => {
      if (i >= qs.length) {
        hist.push({ d: Date.now(), a: acertos, n: qs.length }); store.set("quiz_hist", hist.slice(-30));
        el.innerHTML = `<div class="card"><div class="kpi">${acertos}/${qs.length}</div><p>${acertos >= 8 ? "Excelente!" : acertos >= 6 ? "Bom — revise os erros nos flashcards." : "Continue estudando: use os flashcards e a anatomia."}</p>
          <p class="muted">Últimos resultados: ${hist.slice(-8).map(h => `${h.a}/${h.n}`).join(" · ")}</p><button class="btn" id="qNovo">Novo quiz</button></div>`;
        $("#qNovo", el).addEventListener("click", () => { qs = gerarQuiz(); i = 0; acertos = 0; mostrar(); });
        return;
      }
      const q = qs[i];
      el.innerHTML = `<div class="card"><small class="muted">Questão ${i + 1} de ${qs.length} · acertos: ${acertos}</small><h3>${esc(q.p)}</h3>
        ${q.op.map(o => `<button class="opcao" data-o="${esc(o)}">${esc(o)}</button>`).join("")}<div id="qExp"></div></div>`;
      el.querySelector(".card").addEventListener("click", e => {
        const b = e.target.closest(".opcao"); if (!b || b.disabled) return;
        const certo = b.dataset.o === q.c; if (certo) acertos++;
        $$(".opcao", el).forEach(x => { x.disabled = true; if (x.dataset.o === q.c) x.classList.add("certa"); });
        if (!certo) b.classList.add("errada");
        $("#qExp", el).innerHTML = `<div class="${certo ? "sucesso" : "alerta"}">${certo ? "Correto!" : "Resposta: " + esc(q.c)}<br><small>${esc(q.exp)}</small></div><button class="btn" id="qProx">Próxima →</button>`;
        $("#qProx", el).addEventListener("click", () => { i++; mostrar(); });
      });
    };
    mostrar();
  }

  function viewCasos(el) {
    el.innerHTML = CASOS.map((c, ci) => `<div class="card"><h3>Caso ${ci + 1}: ${esc(c.titulo)}</h3><p>${esc(c.texto)}</p>
      ${c.perguntas.map((p, pi) => `<div class="caso-q" data-c="${ci}" data-p="${pi}"><p><b>${pi + 1}. ${esc(p.p)}</b></p>${p.op.map((o, oi) => `<button class="opcao" data-oi="${oi}">${esc(o)}</button>`).join("")}<div class="exp"></div></div>`).join("")}</div>`).join("");
    el.addEventListener("click", e => {
      const b = e.target.closest(".opcao"); if (!b || b.disabled) return;
      const box = b.closest(".caso-q"); const p = CASOS[+box.dataset.c].perguntas[+box.dataset.p];
      const certo = +b.dataset.oi === p.c;
      $$(".opcao", box).forEach((x, i) => { x.disabled = true; if (i === p.c) x.classList.add("certa"); });
      if (!certo) b.classList.add("errada");
      $(".exp", box).innerHTML = `<div class="${certo ? "sucesso" : "alerta"}">${certo ? "Correto." : "Não exatamente."} ${esc(p.exp)}</div>`;
    });
  }

  // ================================================================= AVALIAÇÃO
  const PASSOS = ["Identificação", "Triagem", "História da dor", "Exame físico", "Desfechos", "Síntese e conduta"];
  const DESCRITORES = ["Pontada", "Queimação", "Choque", "Latejante", "Peso/pressão", "Formigamento", "Rigidez", "Difusa", "Profunda"];
  const SINAIS_NEURO = ["Queimação / choque elétrico", "Distribuição dermatomal ou de nervo periférico", "Alteração de sensibilidade (hipoestesia, alodinia)"];
  const SINAIS_NOCIPLAST = ["Dor difusa / multirregional", "Desproporcional à lesão ou além do tempo de reparo", "Hipersensibilidade a luz, som, odores, toque", "Fadiga, sono ruim, alterações cognitivas"];
  const novaAv = () => ({ id: Date.now().toString(36), criado: new Date().toISOString(), passo: 0, nome: "", idade: "", sexo: "", profissao: "", atividade: "", queixa: "", objetivo: "", dias: "", mecanismo: "", regiao: "", red: [], yellow: [], comorb: "", meds: "", exames: "", evaAtual: "", evaMelhor: "", evaPior: "", local: "", descritores: [], comport24: "", agravantes: "", aliviantes: "", irritab: "", estab: "", sinRepouso: false, sinCalor: false, neuroSin: [], nociSin: [], achados: [], inspecao: "", palpacao: "", adm: "", forca: "", neuro: "", testesRes: {}, prom: "", promValor: "", psfs: "", startback: null, metas: "", notas: "" });

  function salvarAv(av) {
    const avs = store.get("fisio_avaliacoes", []);
    const i = avs.findIndex(a => a.id === av.id);
    av.atualizado = new Date().toISOString();
    if (i >= 0) avs[i] = av; else avs.push(av);
    store.set("fisio_avaliacoes", avs);
  }

  function avaliacao(id) {
    const avs = store.get("fisio_avaliacoes", []);
    if (!id) {
      app.innerHTML = `<h1>📋 Avaliação fisioterapêutica completa</h1>
        <p class="muted">Ficha guiada em ${PASSOS.length} etapas. Ao final, o sistema integra os dados: hipóteses ranqueadas, fase do reparo tecidual, SINSS, prognóstico, conduta e diagnóstico pela CIF. Os dados ficam salvos apenas neste navegador.</p>
        <div class="row"><button class="btn" id="avNova">+ Nova avaliação</button><button class="btn sec" id="avImport">Importar (.json)</button><input type="file" id="avFile" accept=".json" hidden></div>
        <h2>Avaliações salvas</h2>
        ${avs.length ? `<div class="card" id="avLista">${avs.slice().reverse().map(a => `<div class="row" style="justify-content:space-between;border-bottom:1px solid var(--border);padding:8px 0">
          <span><b>${esc(a.nome || "Sem nome")}</b> <small class="muted">· ${esc(a.queixa || "")} · ${esc(regiaoNome(a.regiao) || "")} · ${new Date(a.criado).toLocaleDateString("pt-BR")}</small></span>
          <span class="row"><a class="btn peq" href="#/avaliacao/${a.id}">Abrir</a><button class="btn peq perigo" data-del="${a.id}">Excluir</button></span></div>`).join("")}</div>` : `<p class="muted">Nenhuma avaliação salva ainda.</p>`}
        <div class="info">Privacidade: os dados não saem do seu dispositivo (armazenamento local do navegador). Para uso clínico real, siga a LGPD e as normas do COFFITO sobre prontuário.</div>`;
      $("#avNova").addEventListener("click", () => { const av = novaAv(); salvarAv(av); location.hash = "#/avaliacao/" + av.id; });
      $("#avImport").addEventListener("click", () => $("#avFile").click());
      $("#avFile").addEventListener("change", e => {
        const f = e.target.files[0]; if (!f) return;
        f.text().then(t => { try { const av = Object.assign(novaAv(), JSON.parse(t)); av.id = av.id || Date.now().toString(36); salvarAv(av); location.hash = "#/avaliacao/" + av.id; } catch (err) { alert("Arquivo inválido."); } });
      });
      $("#avLista")?.addEventListener("click", e => {
        const b = e.target.closest("[data-del]"); if (!b) return;
        if (!confirm("Excluir esta avaliação?")) return;
        store.set("fisio_avaliacoes", store.get("fisio_avaliacoes", []).filter(a => a.id !== b.dataset.del));
        avaliacao();
      });
      return;
    }
    const av = Object.assign(novaAv(), avs.find(a => a.id === id) || {});
    if (!avs.find(a => a.id === id)) { app.innerHTML = `<p>Avaliação não encontrada. <a href="#/avaliacao">Voltar</a></p>`; return; }
    desenharAv(av);
  }

  function achadosEfetivos(av) {
    const s = new Set(av.achados);
    const idade = +av.idade;
    if (idade) { s.add(idade < 35 ? "jovem" : idade <= 55 ? "meia" : "idoso"); }
    if (av.mecanismo === "trauma") s.add("trauma");
    if (av.mecanismo === "insidioso") s.add("insidioso");
    if (av.mecanismo === "sobrecarga") { s.add("carga"); s.add("insidioso"); }
    return [...s];
  }

  function campo(av, k, rotulo, tipo = "text", extra = "") {
    if (tipo === "textarea") return `<div><label>${rotulo}</label><textarea data-k="${k}" ${extra}>${esc(av[k])}</textarea></div>`;
    return `<div><label>${rotulo}</label><input type="${tipo}" data-k="${k}" value="${esc(av[k])}" ${extra}></div>`;
  }
  function selecao(av, k, rotulo, ops) {
    return `<div><label>${rotulo}</label><select data-k="${k}"><option value="">—</option>${ops.map(([v, l]) => `<option value="${v}" ${av[k] === v ? "selected" : ""}>${esc(l)}</option>`).join("")}</select></div>`;
  }
  function checksArr(av, k, itens) {
    return `<div class="checks">${itens.map(i => `<label class="check"><input type="checkbox" data-arr="${k}" value="${esc(i)}" ${av[k].includes(i) ? "checked" : ""}> ${esc(i)}</label>`).join("")}</div>`;
  }

  function desenharAv(av) {
    const p = av.passo;
    let corpo = "";
    if (p === 0) corpo = `<div class="card"><h3>Identificação e queixa</h3><div class="form-grid">
        ${campo(av, "nome", "Nome / iniciais")}${campo(av, "idade", "Idade", "number", 'min="0" max="120"')}
        ${selecao(av, "sexo", "Sexo", [["F", "Feminino"], ["M", "Masculino"], ["O", "Outro"]])}${campo(av, "profissao", "Profissão / ocupação")}
        ${campo(av, "atividade", "Atividade física / esporte")}${selecao(av, "regiao", "Região principal", REGIOES.map(r => [r.id, r.nome]))}
        ${campo(av, "dias", "Tempo desde o início (dias)", "number", 'min="0"')}${selecao(av, "mecanismo", "Mecanismo", [["trauma", "Traumático (evento definido)"], ["sobrecarga", "Sobrecarga / aumento de carga"], ["insidioso", "Insidioso, sem causa aparente"], ["pos_op", "Pós-operatório"]])}</div>
        <div class="grid-2">${campo(av, "queixa", "Queixa principal (nas palavras do paciente)", "textarea")}${campo(av, "objetivo", "Objetivos e expectativas do paciente", "textarea")}</div>
        <div class="info">Dica: pergunte "O que você acha que está causando sua dor?" e "O que você espera do tratamento?" — crenças e expectativas são preditores de prognóstico.</div></div>`;
    if (p === 1) corpo = `<div class="card"><h3>🚩 Red flags — patologia grave</h3><p class="muted">Pergunte ativamente. Um único item pode não ser significativo isoladamente (exceto cauda equina), mas combinações aumentam a suspeita.</p>
        ${RED_FLAGS.map(g => `<details ${g.itens.some(i => av.red.includes(i)) ? "open" : ""}><summary>${esc(g.grupo)}</summary>${checksArr(av, "red", g.itens)}<small class="muted">Ação: ${esc(g.acao)}</small></details>`).join("")}</div>
        <div class="card"><h3>🟡 Yellow flags — fatores psicossociais</h3>${checksArr(av, "yellow", YELLOW_FLAGS)}</div>
        <div class="card"><div class="grid-2">${campo(av, "comorb", "Comorbidades (diabetes, HAS, osteoporose, câncer, doenças reumáticas…)", "textarea")}${campo(av, "meds", "Medicamentos (corticoide, anticoagulante, fluoroquinolona…)", "textarea")}</div>${campo(av, "exames", "Exames complementares (imagem, laboratório)", "textarea")}</div>`;
    if (p === 2) corpo = `<div class="card"><h3>Intensidade e características</h3><div class="form-grid">
        ${campo(av, "evaAtual", "Dor agora (0–10)", "number", 'min="0" max="10"')}${campo(av, "evaMelhor", "Melhor nas últimas 24 h", "number", 'min="0" max="10"')}${campo(av, "evaPior", "Pior nas últimas 24 h", "number", 'min="0" max="10"')}</div>
        ${campo(av, "local", "Localização / irradiação (body chart)", "textarea")}<label>Descritores</label>${checksArr(av, "descritores", DESCRITORES)}</div>
        <div class="card"><h3>Comportamento</h3><div class="grid-2">${campo(av, "agravantes", "Fatores agravantes (o que piora, quanto e quanto tempo para aliviar)", "textarea")}${campo(av, "aliviantes", "Fatores de alívio", "textarea")}</div>
        ${campo(av, "comport24", "Comportamento em 24 h (manhã, durante o dia, noite, rigidez matinal)", "textarea")}
        <div class="form-grid">${selecao(av, "irritab", "Irritabilidade", [["alta", "Alta"], ["moderada", "Moderada"], ["baixa", "Baixa"]])}${selecao(av, "estab", "Evolução (estabilidade)", [["melhorando", "Melhorando"], ["estavel", "Estável"], ["piorando", "Piorando"], ["flutuante", "Flutuante"]])}</div>
        <div class="checks" style="margin-top:8px"><label class="check"><input type="checkbox" data-bool="sinRepouso" ${av.sinRepouso ? "checked" : ""}> Dor em repouso</label><label class="check"><input type="checkbox" data-bool="sinCalor" ${av.sinCalor ? "checked" : ""}> Calor / rubor local</label></div></div>
        <div class="grid-2"><div class="card"><h3>Sinais de dor neuropática</h3>${checksArr(av, "neuroSin", SINAIS_NEURO)}</div><div class="card"><h3>Sinais de dor nociplástica</h3>${checksArr(av, "nociSin", SINAIS_NOCIPLAST)}</div></div>
        <div class="card">${checksAchados(["geral"], av.achados)}</div>`;
    if (p === 3) {
      const reg = av.regiao;
      const ts = TESTES.filter(t => t.regiao === reg || (reg === "cotovelo" && t.regiao === "punho") || (reg === "punho" && t.regiao === "cotovelo"));
      corpo = `<div class="card"><h3>Exame físico geral</h3><div class="grid-2">${campo(av, "inspecao", "Inspeção (postura, edema, atrofia, marcha, cicatrizes)", "textarea")}${campo(av, "palpacao", "Palpação (dor, temperatura, espessamento, pontos)", "textarea")}
          ${campo(av, "adm", "ADM ativa e passiva (graus, dor, end-feel)", "textarea")}${campo(av, "forca", "Força (Oxford, dinamometria, LSI)", "textarea")}</div>
          ${campo(av, "neuro", "Exame neurológico (dermátomos, miótomos, reflexos, neurodinâmica)", "textarea")} <small><a href="#/anatomia/neuro" target="_blank">Ver tabela de dermátomos/miótomos</a></small></div>
        ${reg ? `<div class="card">${checksAchados([reg], av.achados)}</div>
        <div class="card"><h3>Testes especiais — ${esc(regiaoNome(reg))}</h3><p class="muted">Registre o resultado. Testes negativos com Sn alta e positivos com Sp alta pesam mais na síntese.</p>
          <div class="tabela-wrap"><table><tr><th>Teste</th><th>Objetivo</th><th>Sn/Sp</th><th>Resultado</th></tr>${ts.map(t => `<tr><td><a href="#/testes/${t.id}" target="_blank">${esc(t.nome)}</a></td><td>${esc(t.objetivo)}</td><td>${fmt(t.sn)} / ${fmt(t.sp)}</td>
          <td><select data-teste="${t.id}" style="min-width:110px"><option value="">Não realizado</option><option value="+" ${av.testesRes[t.id] === "+" ? "selected" : ""}>Positivo</option><option value="-" ${av.testesRes[t.id] === "-" ? "selected" : ""}>Negativo</option></select></td></tr>`).join("")}</table></div></div>`
        : `<div class="aviso">Selecione a região principal na etapa 1 para ver achados e testes específicos.</div>`}`;
    }
    if (p === 4) {
      const sugeridos = [...new Set(CONDICOES.filter(c => c.regiao === av.regiao).flatMap(c => c.desfechos))];
      corpo = `<div class="card"><h3>Medidas de desfecho (linha de base)</h3>
        ${sugeridos.length ? `<p>Sugeridos para a região: ${sugeridos.map(s => `<span class="tag">${esc(s)}</span>`).join("")}</p>` : ""}
        <div class="form-grid">${selecao(av, "prom", "Instrumento principal", PROMS.map(pr => [pr[0], pr[0]]))}${campo(av, "promValor", "Escore inicial")}</div>
        ${campo(av, "psfs", "PSFS — 3 atividades importantes com nota 0 (incapaz) a 10 (normal)", "textarea", 'placeholder="Ex.: correr 5 km: 3/10; agachar para pegar o filho: 5/10; subir escadas: 6/10"')}</div>
        ${av.regiao === "lombar" ? `<div class="card" id="sbBox"><h3>STarT Back</h3>${htmlStartBack(av.startback)}</div>` : ""}
        <div class="card">${campo(av, "metas", "Metas SMART (específicas, mensuráveis, alcançáveis, relevantes, com prazo)", "textarea", 'placeholder="Ex.: em 6 semanas, subir 2 lances de escada sem dor > 2/10"')}</div>`;
    }
    if (p === 5) corpo = htmlSintese(av);

    app.innerHTML = `<p class="no-print"><a href="#/avaliacao">← Avaliações</a></p>
      <h1>📋 ${esc(av.nome || "Nova avaliação")}</h1>
      <div class="steps">${PASSOS.map((s, i) => `<button data-passo="${i}" class="${i === p ? "ativo" : i < p ? "feito" : ""}">${i + 1}. ${s}</button>`).join("")}</div>
      <div id="avForm">${corpo}</div>
      <div class="wiz-nav"><button class="btn sec" id="avAnt" ${p === 0 ? "disabled" : ""}>← Anterior</button><span class="muted" id="avSalvo">Salvo automaticamente</span>
      ${p < PASSOS.length - 1 ? `<button class="btn" id="avProx">Próximo →</button>` : `<button class="btn" onclick="window.print()">🖨 Imprimir relatório</button>`}</div>`;

    const form = $("#avForm");
    const salvar = () => { salvarAv(av); const s = $("#avSalvo"); if (s) { s.textContent = "Salvo ✓ " + new Date().toLocaleTimeString("pt-BR"); } };
    form.addEventListener("input", e => { const k = e.target.dataset.k; if (k) { av[k] = e.target.value; salvar(); } });
    form.addEventListener("change", e => {
      const t = e.target;
      if (t.dataset.k) { av[t.dataset.k] = t.value; salvar(); }
      if (t.dataset.arr) { const k = t.dataset.arr; av[k] = t.checked ? [...new Set([...av[k], t.value])] : av[k].filter(x => x !== t.value); salvar(); if (k === "red" && p === 1) alertaRed(); }
      if (t.dataset.bool) { av[t.dataset.bool] = t.checked; salvar(); }
      if (t.dataset.achado) { const k = t.dataset.achado; av.achados = t.checked ? [...new Set([...av.achados, k])] : av.achados.filter(x => x !== k); salvar(); }
      if (t.dataset.teste) { if (t.value) av.testesRes[t.dataset.teste] = t.value; else delete av.testesRes[t.dataset.teste]; salvar(); }
    });
    if (p === 4 && $("#sbBox")) bindStartBack($("#sbBox"), r => { av.startback = r.slice(); salvar(); }, av.startback);
    if (p === 5) {
      $("#avExport")?.addEventListener("click", () => {
        const blob = new Blob([JSON.stringify(av, null, 2)], { type: "application/json" });
        const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `avaliacao-${(av.nome || "paciente").replace(/\W+/g, "_")}.json`; a.click();
      });
    }
    const alertaRed = () => { const box = $("#redAlert"); if (box) box.remove(); if (av.red.length) form.insertAdjacentHTML("afterbegin", `<div class="alerta" id="redAlert"><b>Red flags marcadas (${av.red.length}).</b> Considere encaminhamento antes de prosseguir com o tratamento.</div>`); };
    if (p === 1) alertaRed();
    const ir = n => { av.passo = Math.max(0, Math.min(PASSOS.length - 1, n)); salvarAv(av); desenharAv(av); window.scrollTo(0, 0); };
    $(".steps").addEventListener("click", e => { const b = e.target.closest("[data-passo]"); if (b) ir(+b.dataset.passo); });
    $("#avAnt").addEventListener("click", () => ir(p - 1));
    $("#avProx")?.addEventListener("click", () => ir(p + 1));
  }

  function htmlSintese(av) {
    const ach = achadosEfetivos(av);
    const rank = ajustarPorTestes(rankearHipoteses(av.regiao || null, ach), av.testesRes);
    const top = rank.find(r => r.pct > 0);
    const dias = +av.dias || 0;
    const irr = av.irritab || (+av.evaPior >= 7 ? "alta" : +av.evaPior >= 4 ? "moderada" : "baixa");
    const fz = estimarFase(dias, { repouso: av.sinRepouso, calor: av.sinCalor, edema: ach.includes("edema"), noturna: ach.includes("noturna"), irritabilidade: irr });
    const f = fase(fz.fase);
    const tec = top ? tecido(top.c.tecido) : null;
    const estagio = !av.dias ? "não informado" : dias < 42 ? "agudo (< 6 semanas)" : dias <= 84 ? "subagudo (6–12 semanas)" : "crônico (> 12 semanas)";
    const sev = av.evaPior === "" ? "não informada" : +av.evaPior >= 7 ? "alta" : +av.evaPior >= 4 ? "moderada" : "baixa";
    const tipoDor = av.nociSin.length >= 3 ? "Predomínio NOCIPLÁSTICO provável" : av.neuroSin.length >= 2 ? "Componente NEUROPÁTICO provável" : "Predomínio NOCICEPTIVO provável";
    const sb = av.startback ? calcStartBack(av.startback) : null;
    // modificadores de prognóstico
    const mod = [];
    if (av.yellow.length >= 3) mod.push(["bad", `${av.yellow.length} yellow flags: risco aumentado de cronificação — abordagem psicologicamente informada.`]);
    else if (av.yellow.length) mod.push(["warn", `${av.yellow.length} yellow flag(s): monitorar e abordar na educação.`]);
    if (sb) mod.push([sb.risco === "alto" ? "bad" : sb.risco === "médio" ? "warn" : "ok", `STarT Back: risco ${sb.risco} (${sb.total}/9).`]);
    if (dias > 84) mod.push(["warn", "Dor crônica (> 12 semanas): considerar mecanismos centrais e fatores contextuais."]);
    if (av.estab === "piorando") mod.push(["bad", "Quadro piorando: reavaliar hipótese, considerar encaminhamento."]);
    if (av.estab === "melhorando") mod.push(["ok", "Quadro já em melhora: fator prognóstico favorável."]);
    if (av.nociSin.length >= 3) mod.push(["warn", "Sinais nociplásticos: priorizar educação em neurociência da dor e exposição gradual."]);
    if (+av.idade > 65) mod.push(["warn", "Idade > 65: reparo mais lento; atenção a fragilidade, quedas e comorbidades."]);

    return `
      ${av.red.length ? `<div class="alerta"><b>🚩 Red flags presentes:</b>${lista(av.red)}<b>Priorize o encaminhamento/investigação médica.</b> As hipóteses abaixo assumem que patologia grave foi descartada.</div>` : `<div class="sucesso">Nenhuma red flag registrada.</div>`}
      <div class="card"><h2>1. Hipóteses diagnósticas</h2>${htmlHipoteses(rank, 4)}</div>
      <div class="grid-2">
        <div class="card"><h2>2. Estágio e fase do tecido</h2>
          <p>Fase provável do reparo: ${pillFase(fz.fase)}</p><p><b>Estágio temporal:</b> ${estagio}</p>
          ${tec ? `<p><b>Tecido provável:</b> ${esc(tec.nome)} — ${esc(tec.tempo)}</p><p><b>Progressão:</b> ${esc(tec.carga)}</p>` : ""}
          <details><summary>O que acontece no tecido agora</summary>${lista(f.biologia)}</details>
          ${fz.obs.map(o => `<div class="aviso">${esc(o)}</div>`).join("")}</div>
        <div class="card"><h2>3. SINSS</h2><table>
          <tr><th>Severidade</th><td>${sev} ${av.evaPior !== "" ? `(pior ${esc(av.evaPior)}/10)` : ""}</td></tr>
          <tr><th>Irritabilidade</th><td>${irr}${!av.irritab ? " (estimada pela EVA)" : ""}</td></tr>
          <tr><th>Natureza</th><td>${tipoDor}${top ? "; hipótese: " + esc(top.c.nome) : ""}</td></tr>
          <tr><th>Estágio</th><td>${estagio}; ${esc(f.nome)}</td></tr>
          <tr><th>Estabilidade</th><td>${esc(av.estab || "não informada")}</td></tr></table>
          <p class="muted">Irritabilidade ${irr}: ${esc(IRRITABILIDADE[irr].slice(-1)[0])}</p></div>
      </div>
      <div class="card"><h2>4. Prognóstico</h2>${top ? `<p>${esc(top.c.prognostico.texto)}</p><div class="grid-2"><div><b>Favoráveis possíveis</b>${lista(top.c.prognostico.bom)}</div><div><b>Desfavoráveis a investigar</b>${lista(top.c.prognostico.ruim)}</div></div>` : "<p class='muted'>Sem hipótese principal.</p>"}
        ${mod.length ? `<h3>Modificadores identificados neste paciente</h3>${mod.map(([c, t]) => `<div class="${c === "bad" ? "alerta" : c === "warn" ? "aviso" : "sucesso"}">${esc(t)}</div>`).join("")}` : ""}</div>
      <div class="card"><h2>5. Conduta sugerida — ${esc(f.nome)}</h2>
        <div class="grid-2"><div><h3>Objetivos da fase</h3>${lista(f.objetivos)}<h3>Princípios gerais da fase</h3>${lista(f.conduta)}</div>
        <div>${top ? `<h3>Específico: ${esc(top.c.nome)}</h3>${lista(top.c.conduta[fz.fase])}<h3>Próxima fase (${esc(fase(FASES[Math.min(2, FASES.findIndex(x => x.id === fz.fase) + 1)].id).nome)})</h3>${lista(top.c.conduta[FASES[Math.min(2, FASES.findIndex(x => x.id === fz.fase) + 1)].id])}` : ""}
          ${sb && sb.risco === "alto" ? `<div class="aviso">STarT Back alto risco: incluir abordagem cognitivo-funcional / exposição gradual.</div>` : ""}</div></div>
        ${top ? `<h3>Evidências</h3>${top.c.evidencia.map(e => `<p><b>${esc(e.ref)}:</b> ${esc(e.msg)}</p>`).join("")}` : ""}</div>
      <div class="card"><h2>6. Diagnóstico fisioterapêutico (CIF)</h2><table>
        <tr><th>Condição de saúde</th><td>${top ? esc(top.c.nome) : "—"}</td></tr>
        <tr><th>Estrutura e função</th><td>Dor ${esc(av.evaAtual || "?")}/10 (pior ${esc(av.evaPior || "?")}); ${esc([av.adm, av.forca].filter(Boolean).join("; ") || "ADM/força não registradas")}</td></tr>
        <tr><th>Atividade</th><td>${esc(av.psfs || av.agravantes || "—")}</td></tr>
        <tr><th>Participação</th><td>${esc([av.profissao, av.atividade].filter(Boolean).join("; ") || "—")}</td></tr>
        <tr><th>Fatores pessoais</th><td>${esc(av.yellow.join("; ") || "Sem yellow flags registradas")}${av.objetivo ? " · Expectativa: " + esc(av.objetivo) : ""}</td></tr>
        <tr><th>Fatores ambientais</th><td>${esc(av.comorb || "—")}${av.meds ? " · Medicamentos: " + esc(av.meds) : ""}</td></tr></table></div>
      <div class="card"><h2>7. Reavaliação</h2><p><b>Desfecho principal:</b> ${esc(av.prom || "não definido")} ${av.promValor ? "— inicial: " + esc(av.promValor) : ""}
        ${av.prom ? ` · MCID: <b>${esc((PROMS.find(x => x[0] === av.prom) || [])[2] || "?")}</b>` : ""}</p>
        <p><b>Metas:</b> ${esc(av.metas || "—")}</p><p class="muted">Reavalie sinais comparáveis a cada sessão e o PROM a cada 2–4 semanas. Sem melhora em 4–6 semanas: revisar hipótese, adesão, dose e considerar encaminhamento.</p>
        <label>Raciocínio do terapeuta / observações</label><textarea data-k="notas" style="min-height:110px">${esc(av.notas)}</textarea>
        <div class="row no-print" style="margin-top:10px"><button class="btn sec" id="avExport">Exportar (.json)</button></div></div>
      <div class="aviso">Síntese gerada automaticamente como apoio ao raciocínio. O diagnóstico e a conduta são de responsabilidade do fisioterapeuta.</div>`;
  }

  // ---------------------------------------------------------------- API para módulos extras
  window.FR = { $, $$, esc, store, tabs, lista, fmt, app, rotas, regiaoNome, norm, shuffle };
  document.addEventListener("DOMContentLoaded", router);
})();
