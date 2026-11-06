/* Marketing do studio/clínica: assistente de Instagram (IA), anúncios (Meta Ads), métricas, datas, respostas prontas e perfil do negócio. */
(function () {
  "use strict";
  const { $, $$, esc, store, app, rotas, tabs } = window.FR;
  const MK = window.MARCA;

  // ---------------------------------------------------------------- perfil do negócio
  const PERFIL_PADRAO = () => {
    const m = MK.get();
    return { nome: `${m.nome} ${m.sub}`, tipo: "Studio de Pilates e clínica de fisioterapia (atendimento por fisioterapeuta)", cidade: "Itabaiana – SE", bairro: "", whatsapp: "", instagram: m.perfil,
      servicos: "Pilates em aparelhos (turmas pequenas)\nPilates solo\nFisioterapia ortopédica e esportiva\nAvaliação postural e funcional",
      publico: "Mulheres e homens de 30 a 65 anos que querem cuidar da coluna, ganhar força e se movimentar sem dor; pessoas em reabilitação",
      diferenciais: "Atendimento conduzido por fisioterapeuta, turmas reduzidas, avaliação antes de começar, exercícios baseados em evidências",
      identidade: "Elegante, profissional, acolhedor, moderno e sofisticado. Paleta: verde musgo, verde oliva, bege, off-white e dourado discreto. Evitar artes genéricas, excesso de elementos e aparência artificial de IA.",
      oferta: "Aula experimental", horarios: "", convenios: "", tom: "acolhedor e técnico", objetivo: "Encher as turmas de Pilates e aumentar as avaliações de fisioterapia" };
  };
  const perfil = () => Object.assign(PERFIL_PADRAO(), store.get("mkt_perfil", {}));
  const local = p => [p.bairro, p.cidade].filter(Boolean).join(", ") || "sua cidade";

  // ---------------------------------------------------------------- regras (Meta + ética profissional)
  const REGRAS = [
    ["Meta — atributos pessoais", "O anúncio não pode afirmar nem insinuar que o leitor tem uma condição de saúde. Evite \"Você tem dor nas costas?\" ou \"Sofre com hérnia?\"; prefira \"Pilates para cuidar da coluna\" ou \"Fisioterapia para voltar a se movimentar\"."],
    ["Sem promessa de resultado", "Nada de \"cura\", \"acabe com a dor em 7 dias\" ou garantias. Fale do processo, do acompanhamento e do que a evidência mostra."],
    ["Pacientes e alunos", "Não exponha pacientes sem autorização por escrito; não use fotos de \"antes e depois\"; preserve o sigilo. Confira as normas do COFFITO sobre publicidade antes de usar depoimentos."],
    ["Preços e promoções", "Evite chamar atenção apenas por preço ou desconto; destaque a qualidade do cuidado. Confira as orientações do COFFITO sobre divulgação de valores."],
    ["Linguagem", "Sem sensacionalismo ou medo (\"sua coluna vai travar\"); termos técnicos explicados; identifique-se com nome e número do CREFITO quando pertinente."]
  ];

  // ---------------------------------------------------------------- assistente (IA)
  // Instruções de trabalho escritas pelo dono do studio (editáveis na aba Perfil)
  const INSTRUCOES_PADRAO = `Você é meu estrategista de marketing digital, social media, roteirista e diretor criativo. Sua função é auxiliar na criação de conteúdo profissional para Instagram, voltado para Pilates, fisioterapia, saúde, qualidade de vida e divulgação do meu Studio.

Suas funções:
1. Criar ideias de conteúdo relevantes e originais.
2. Planejar calendário editorial semanal e mensal.
3. Criar roteiros completos de Reels.
4. Escrever legendas e chamadas para ação.
5. Criar textos para carrosséis e posts.
6. Elaborar prompts para geração de imagens.
7. Sugerir tendências e formatos de conteúdo.
8. Criar conteúdos que aumentem autoridade, conexão e procura pelos serviços.
9. Ajudar a melhorar minha comunicação diante da câmera.
10. Adaptar conteúdos para Instagram Reels, Stories e Feed.

Ao criar um Reel, entregar: tema e objetivo; gancho inicial de até 3 segundos; roteiro falado, em linguagem natural; cena e enquadramento de cada trecho; texto que aparece na tela; sugestão de duração; legenda pronta; CTA; capa com título curto.

Ao criar uma arte, entregar: conceito visual; texto exato da arte; composição; cores e fontes; prompt para geração da imagem; formato recomendado.

Priorizar conteúdo original, visual profissional e identidade consistente.

Diretrizes:
- Usar linguagem simples, natural e profissional.
- Evitar promessas de cura ou resultados garantidos.
- Não inventar evidências científicas.
- Respeitar as diretrizes profissionais da fisioterapia e a privacidade dos pacientes.
- Evitar conteúdos repetitivos.
- Não sugerir apenas ideias genéricas.
- Priorizar conteúdos que eu consiga gravar sozinho no Studio.
- Criar conteúdo educativo sem substituir avaliação individual.

Sempre que eu pedir conteúdo, entregar algo pronto para utilizar, e não apenas sugestões vagas.`;
  const instrucoes = () => store.get("mkt_instrucoes", null) || INSTRUCOES_PADRAO;

  const sistemaAssistente = () => {
    const p = perfil();
    return `${instrucoes()}

Contexto técnico que você também domina: Instagram (Reels, carrosséis, stories, bio, destaques, alcance local), anúncios no Meta (objetivos, públicos por localização, orçamento, criativos, testes A/B, métricas como CPM, CTR, custo por conversa), WhatsApp como canal de conversão, Perfil da Empresa no Google, parcerias locais e indicação.
Formato das respostas: português do Brasil, organizado com títulos curtos e listas, pronto para copiar. Nos prompts de imagem, escreva o prompt em inglês (funciona melhor nos geradores) seguido de uma linha em português explicando a ideia, e respeite a paleta e o estilo da marca; peça cenas realistas no próprio studio, luz natural, sem rostos de pacientes identificáveis e sem texto dentro da imagem gerada (o texto entra depois na edição). Use o tom de voz do negócio (${p.tom}). Se faltar algo essencial, assuma o mais razoável para o studio e diga o que assumiu.
Regras que sempre valem, além das diretrizes acima:
- Ética profissional (fisioterapia, COFFITO): sem promessas de cura ou de resultado garantido, sem fotos de antes e depois de pacientes, sem expor pacientes sem autorização por escrito, sem sensacionalismo nem uso do medo. Quando envolver depoimentos ou divulgação de preços/promoções, recomende conferir as normas do COFFITO.
- Anúncios da Meta: nunca afirmar ou insinuar condições de saúde do leitor (política de atributos pessoais). Ex.: em vez de "Você tem dor lombar?", use "Pilates para cuidar da coluna".
- Não cite estudos, números ou estatísticas sem fonte; se uma informação científica for útil, diga que deve ser conferida em fonte confiável.
Os dados do negócio abaixo servem para personalizar as respostas.
<negocio>
Nome: ${p.nome}
Tipo: ${p.tipo}
Local: ${local(p)}
Instagram: ${p.instagram} · WhatsApp: ${p.whatsapp || "não informado"}
Serviços: ${p.servicos.replace(/\n/g, "; ")}
Público: ${p.publico}
Diferenciais: ${p.diferenciais}
Identidade visual e estilo: ${p.identidade}
Oferta de entrada: ${p.oferta}
Horários: ${p.horarios || "não informado"} · Convênios: ${p.convenios || "não informado"}
Objetivo atual: ${p.objetivo}
</negocio>`;
  };
  const ATALHOS = [
    ["🎬 Reel completo", "Crie um Reel completo no formato combinado (tema e objetivo, gancho de até 3 s, roteiro falado natural, cena e enquadramento de cada trecho, texto na tela, duração, legenda, CTA e capa). Que eu consiga gravar sozinho no studio.\n\nTema: ", true],
    ["🖼 Arte para o feed", "Crie uma arte para o feed no formato combinado (conceito visual, texto exato da arte, composição, cores e fontes, prompt para geração da imagem e formato recomendado).\n\nTema: ", true],
    ["📑 Carrossel", "Escreva um carrossel de 6 a 8 slides (texto exato de cada slide, sugestão visual de cada um, legenda e CTA).\n\nTema: ", true],
    ["📅 Plano da semana", "Monte meu calendário editorial dos próximos 7 dias: para cada dia, formato (Reels, carrossel, arte ou stories), tema, objetivo (autoridade, conexão ou procura pelos serviços), gancho e CTA. Priorize o que eu consigo gravar sozinho no studio e evite repetir formatos seguidos."],
    ["🗓 Calendário do mês", "Monte meu calendário editorial do mês, semana a semana (4 a 5 posts por semana + stories diários), equilibrando autoridade, conexão e procura pelos serviços, e incluindo as datas comemorativas da saúde que caírem no mês."],
    ["📱 Stories da semana", "Crie uma sequência de stories para os 7 dias da semana (3 a 5 telas por dia), com enquetes, caixas de pergunta, bastidores do studio e um convite para a aula experimental, com o texto exato de cada tela."],
    ["🎙 Comunicação na câmera", "Me dê um treino prático de 15 minutos para eu melhorar minha comunicação diante da câmera (voz, postura, olhar, ritmo, como começar sem travar), com um roteiro curto para eu praticar hoje no studio."],
    ["📈 Tendências e formatos", "Quais formatos de conteúdo estão funcionando bem no Instagram para profissionais de saúde e studios de Pilates? Para cada um, explique como eu aplicaria no meu studio, com um exemplo pronto."],
    ["📢 Anúncio", "Crie um anúncio no Instagram para trazer novos alunos de Pilates pelo WhatsApp em Itabaiana: público local, orçamento inicial, 3 variações de texto (respeitando a política de atributos pessoais da Meta) e o roteiro do criativo em vídeo."],
    ["💬 Responder mensagem", "Escreva uma resposta acolhedora para a mensagem abaixo, que tire a dúvida e convide para a aula experimental, em até 5 linhas.\n\nMensagem recebida: ", true],
    ["✍️ Bio e destaques", "Escreva 3 opções de bio para o meu Instagram (até 150 caracteres), com o que faço, para quem, onde e uma chamada para o WhatsApp. Sugira 6 destaques com nomes curtos e a descrição da capa de cada um, na identidade da marca."],
    ["📊 Analisar resultados", "Analise meus números da seção Métricas e diga o que está funcionando, o que melhorar e 3 ações para a próxima semana."],
    ["🤝 Parcerias locais", "Sugira 6 parcerias locais em Itabaiana para o meu studio (academias, nutricionistas, médicos, lojas de artigos esportivos, empresas) com uma mensagem de abordagem pronta para cada uma."],
    ["⭐ Avaliações no Google", "Como conseguir mais avaliações no Google de forma ética? Inclua uma mensagem pronta para pedir avaliação no WhatsApp após a aula/sessão."]
  ];
  function md(texto) {
    // markdown simples e seguro (escapa antes)
    const linhas = esc(texto).split("\n"); let html = "", lista = null;
    const inline = s => s.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/(^|[^*])\*(?!\s)(.+?)\*/g, "$1<i>$2</i>").replace(/`([^`]+)`/g, "<code>$1</code>");
    const fecha = () => { if (lista) { html += `</${lista}>`; lista = null; } };
    linhas.forEach(l => {
      const h = l.match(/^(#{1,4})\s+(.*)/), ul = l.match(/^\s*[-•]\s+(.*)/), ol = l.match(/^\s*\d+[.)]\s+(.*)/);
      if (h) { fecha(); html += `<h4>${inline(h[2])}</h4>`; }
      else if (ul) { if (lista !== "ul") { fecha(); html += "<ul>"; lista = "ul"; } html += `<li>${inline(ul[1])}</li>`; }
      else if (ol) { if (lista !== "ol") { fecha(); html += "<ol>"; lista = "ol"; } html += `<li>${inline(ol[1])}</li>`; }
      else if (!l.trim()) { fecha(); }
      else { fecha(); html += `<p>${inline(l)}</p>`; }
    });
    fecha(); return html;
  }
  const conversa = () => store.get("mkt_chat", []);
  function tabAssistente(el) {
    if (!window.IA.temIA()) {
      el.innerHTML = `<div class="card mkt-ia"><h3>🤖 Ative o assistente</h3>
        <p>O assistente usa a IA da Claude para escrever posts, roteiros, anúncios e respostas personalizados para o seu negócio, quando você precisar. Para ativar:</p>
        <ol><li>Crie uma conta em <a href="https://platform.claude.com/" target="_blank" rel="noopener">platform.claude.com</a> e adicione créditos (o uso é cobrado por volume; uma conversa típica custa centavos).</li>
        <li>Gere uma chave de API (começa com <code>sk-ant-</code>).</li><li>Cole em <a href="#/ia">⚙️ Configurações → Inteligência artificial</a> e clique em "Testar conexão".</li></ol>
        <p class="muted">Enquanto isso, as abas Anúncios, Métricas, Datas, Respostas e Perfil funcionam sem IA.</p></div>`;
      return;
    }
    const desenhar = () => {
      const c = conversa();
      el.innerHTML = `<div class="mkt-chat">
        <div class="row" style="justify-content:space-between"><span class="muted">Conversa com o assistente — ele já conhece o seu <a href="#/marketing/perfil">perfil do negócio</a>.</span><button class="btn sec peq" id="chNova">Nova conversa</button></div>
        <div class="chips">${ATALHOS.map(([r, t], i) => `<button class="tag chip" data-at="${i}">${esc(r)}</button>`).join("")}</div>
        <div id="chMsgs" class="chat-msgs">${c.length ? c.map((m, i) => bolha(m, i)).join("") : `<div class="chat-vazio"><b>Comece por um atalho acima</b> ou peça o que precisar: "um carrossel sobre Pilates para gestantes", "como divulgar a nova turma das 7h", "resposta para quem perguntou o preço"…</div>`}</div>
        <div class="chat-in"><textarea id="chTxt" placeholder="Escreva seu pedido… (Enter envia, Shift+Enter quebra linha)"></textarea><button class="btn" id="chEnviar">Enviar</button></div></div>`;
      const box = $("#chMsgs", el); box.scrollTop = box.scrollHeight;
    };
    const bolha = (m, i) => m.role === "user" ? `<div class="msg eu">${esc(m.content).replace(/\n/g, "<br>")}</div>`
      : `<div class="msg ia">${md(m.content)}<div class="row msg-acoes"><button class="btn peq sec" data-copiar="${i}">Copiar</button><button class="btn peq sec" data-ideia="${i}">Guardar no banco de ideias</button></div></div>`;
    async function enviar(texto) {
      texto = texto.trim(); if (!texto) return;
      const c = conversa(); c.push({ role: "user", content: texto }); store.set("mkt_chat", c); desenhar();
      const box = $("#chMsgs", el); box.insertAdjacentHTML("beforeend", `<div class="msg ia" id="chResp"><p class="muted">Pensando…</p></div>`); box.scrollTop = box.scrollHeight;
      $("#chEnviar", el).disabled = true;
      try {
        const historico = c.slice(-20).map(m => ({ role: m.role, content: m.content }));
        const r = await window.IA.chamar({ system: sistemaAssistente(), mensagens: historico, maxTokens: 12000, effort: "medium", onText: s => { const d = $("#chResp", el); if (d) { d.innerHTML = md((d.dataset.acc = (d.dataset.acc || "") + s)); box.scrollTop = box.scrollHeight; } } });
        c.push({ role: "assistant", content: r }); store.set("mkt_chat", c.slice(-60)); desenhar();
      } catch (e) { const d = $("#chResp", el); if (d) d.innerHTML = `<div class="alerta">${esc(e.message)}</div>`; c.pop(); store.set("mkt_chat", c); $("#chEnviar", el).disabled = false; $("#chTxt", el).value = texto; }
    }
    el.addEventListener("click", async e => {
      const at = e.target.dataset.at; if (at != null) { const [, t, completar] = ATALHOS[+at]; if (completar) { const tx = $("#chTxt", el); tx.value = t; tx.focus(); tx.setSelectionRange(tx.value.length, tx.value.length); } else enviar(t.includes("seção Métricas") ? t + "\n\n" + resumoMetricas() : t); return; }
      if (e.target.id === "chEnviar") { enviar($("#chTxt", el).value); return; }
      if (e.target.id === "chNova") { if (conversa().length) store.set("mkt_chat", []); desenhar(); return; }
      const cp = e.target.dataset.copiar; if (cp != null) { try { await navigator.clipboard.writeText(conversa()[+cp].content); e.target.textContent = "Copiado ✓"; } catch (x) { e.target.textContent = "Selecione e copie"; } return; }
      const id = e.target.dataset.ideia; if (id != null) { const t = conversa()[+id].content; const l = store.get("conteudo_ideias", []); l.push({ id: "c" + Date.now().toString(36), texto: t.split("\n").find(x => x.trim()).replace(/[#*]/g, "").slice(0, 140), origem: "Assistente de marketing", notas: t, criado: new Date().toISOString() }); store.set("conteudo_ideias", l); e.target.textContent = "Guardado ✓"; }
    });
    el.addEventListener("keydown", e => { if (e.target.id === "chTxt" && e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviar(e.target.value); } });
    desenhar();
    const pend = store.get("mkt_pendente", ""); if (pend) { store.set("mkt_pendente", ""); enviar(pend); }
  }
  // abre o assistente já com um pedido (usado por outras abas)
  function perguntarAoAssistente(texto) { store.set("mkt_pendente", texto); store.set("tab_tabMkt", "assistente"); if (location.hash === "#/marketing") rotas.marketing(); else location.hash = "#/marketing"; }

  // ---------------------------------------------------------------- anúncios
  const OBJETIVOS = { whatsapp: "Mensagens no WhatsApp (recomendado)", perfil: "Visitas ao perfil / seguidores da região", cadastro: "Cadastros (formulário instantâneo)" };
  const campanhas = () => store.get("mkt_campanhas", []);
  function copiesModelo(p, f) {
    const serv = f.servico || "Pilates";
    return [
      { texto: `${serv} com acompanhamento de fisioterapeuta em ${f.local || local(p)}. Turmas pequenas, avaliação antes de começar e exercícios pensados para você se movimentar melhor. 💚\n\nAgende sua ${p.oferta.toLowerCase()} pelo WhatsApp.`, titulo: `${serv} em ${f.local || local(p)}`, cta: f.objetivo === "whatsapp" ? "Enviar mensagem" : "Saiba mais" },
      { texto: `Cuidar da coluna e ganhar força pode ser leve e prazeroso. No ${p.nome}, cada aula é planejada por fisioterapeuta, no seu ritmo.\n\n📍 ${f.local || local(p)}\n👉 Fale com a gente e conheça o studio.`, titulo: "Movimento com cuidado profissional", cta: f.objetivo === "whatsapp" ? "Enviar mensagem" : "Saiba mais" },
      { texto: `Quer começar a se exercitar com segurança? Aqui você é avaliado antes da primeira aula e acompanhado de perto em todas as outras. ${serv} para todas as idades.\n\nVagas nos horários ${p.horarios || "da manhã e da noite"}. Chame no WhatsApp.`, titulo: "Comece com segurança", cta: f.objetivo === "whatsapp" ? "Enviar mensagem" : "Saiba mais" }
    ];
  }
  function tabAnuncios(el) {
    const p = perfil();
    const servicos = p.servicos.split("\n").map(s => s.trim()).filter(Boolean);
    el.innerHTML = `<div class="grid-2" style="align-items:start"><div class="card" id="adForm"><h3>Planejar campanha</h3>
        <div class="form-grid">
          <div><label>Objetivo</label><select id="adObj">${Object.entries(OBJETIVOS).map(([k, v]) => `<option value="${k}">${v}</option>`).join("")}</select></div>
          <div><label>Serviço anunciado</label><select id="adServ">${servicos.map(s => `<option>${esc(s)}</option>`).join("")}</select></div>
          <div><label>Bairro/cidade alvo</label><input type="text" id="adLocal" value="${esc(local(p) === "sua cidade" ? "" : local(p))}" placeholder="ex.: Moema, São Paulo"></div>
          <div><label>Raio a partir do endereço (km)</label><input type="number" id="adRaio" value="4" min="1" max="40"></div>
          <div><label>Idade</label><div class="row" style="flex-wrap:nowrap"><input type="number" id="adIdMin" value="30" min="18" max="65"><span>a</span><input type="number" id="adIdMax" value="65" min="18" max="65"></div></div>
          <div><label>Orçamento diário (R$)</label><input type="number" id="adOrc" value="20" min="6" step="1"></div>
          <div><label>Duração (dias)</label><input type="number" id="adDias" value="7" min="3" max="60"></div>
        </div>
        <div class="row" style="margin-top:10px"><button class="btn" id="adGerar">Montar plano</button>${window.IA.temIA() ? `<button class="btn sec" id="adIA">✨ Criar anúncio com IA</button>` : ""}</div></div>
      <div class="card"><h3>Regras para não ter o anúncio reprovado (e respeitar a ética)</h3>${REGRAS.map(r => `<p><b>${esc(r[0])}:</b> ${esc(r[1])}</p>`).join("")}</div></div>
      <div id="adOut"></div>
      <h2>Campanhas e resultados</h2><div id="adLista"></div>`;
    const ler = () => ({ objetivo: $("#adObj").value, servico: $("#adServ").value, local: $("#adLocal").value.trim(), raio: +$("#adRaio").value, idMin: +$("#adIdMin").value, idMax: +$("#adIdMax").value, orc: +$("#adOrc").value, dias: +$("#adDias").value });
    const plano = (f, copies, extra = "") => {
      const total = f.orc * f.dias;
      return `<div class="card"><h3>Plano: ${esc(f.servico)} · ${esc(OBJETIVOS[f.objetivo])}</h3>
        <div class="grid-2"><div><h4>Estrutura</h4><ul><li><b>1 campanha</b> com objetivo "${f.objetivo === "whatsapp" ? "Engajamento → Mensagens (WhatsApp)" : f.objetivo === "perfil" ? "Tráfego → Perfil do Instagram" : "Cadastros → Formulário instantâneo"}".</li>
          <li><b>1 conjunto de anúncios:</b> ${f.raio} km ao redor do endereço${f.local ? ` (${esc(f.local)})` : ""}, ${f.idMin}–${f.idMax} anos, todos os gêneros (deixe o algoritmo encontrar quem responde).</li>
          <li><b>2 a 3 anúncios</b> para comparar: um Reels seu explicando como é a aula, um carrossel com o passo a passo da primeira aula, uma foto real do studio.</li></ul>
          <h4>Orçamento</h4><p>R$ ${f.orc.toFixed(2).replace(".", ",")}/dia × ${f.dias} dias = <b>R$ ${total.toFixed(2).replace(".", ",")}</b>. Não mexa nos primeiros 3–4 dias (fase de aprendizado). Depois, pause o anúncio com pior custo por resultado e mantenha o melhor.</p></div>
        <div><h4>Como criar</h4><ol><li>Abra o <b>Gerenciador de Anúncios</b> da Meta (ou "Impulsionar" no app do Instagram para algo mais simples).</li><li>Escolha o objetivo acima e conecte o WhatsApp da empresa.</li><li>Em público, use localização por raio no seu endereço e a faixa de idade.</li><li>Suba os criativos e cole os textos abaixo (um por anúncio).</li><li>Prepare a resposta automática do WhatsApp (aba Respostas) para responder rápido.</li></ol>
          <h4>O que acompanhar</h4><p>Custo por conversa iniciada, quantas viram agendamento e quantas viram alunos/pacientes. Registre na lista abaixo.</p></div></div>
        <h4>Textos (copie para cada anúncio)</h4>${copies.map((c, i) => `<div class="ad-copy"><div class="row" style="justify-content:space-between"><b>Variação ${String.fromCharCode(65 + i)}${c.titulo ? ` — título: ${esc(c.titulo)}` : ""}</b><button class="btn peq sec" data-copia="${esc(c.texto)}">Copiar</button></div><p>${esc(c.texto).replace(/\n/g, "<br>")}</p><small class="muted">Botão: ${esc(c.cta || "Enviar mensagem")}</small></div>`).join("")}
        ${extra}<div class="row" style="margin-top:10px"><button class="btn" id="adSalvar">Salvar campanha para acompanhar resultados</button></div></div>`;
    };
    let ultimo = null;
    $("#adGerar", el).addEventListener("click", () => { const f = ler(); ultimo = { f, copies: copiesModelo(p, f) }; $("#adOut", el).innerHTML = plano(f, ultimo.copies); });
    $("#adIA", el)?.addEventListener("click", async () => {
      const f = ler(); const out = $("#adOut", el); out.innerHTML = `<div class="info">Criando o anúncio…</div>`;
      try {
        const S = q => ({ type: "object", properties: q, required: Object.keys(q), additionalProperties: false }); const s = { type: "string" };
        const r = await window.IA.chamar({ system: sistemaAssistente(), schema: S({ copies: { type: "array", items: S({ texto: s, titulo: s, cta: s }) }, criativo: s, roteiro_video: s, observacoes: s }),
          prompt: `Crie um anúncio para o Meta (Instagram/Facebook). Objetivo: ${OBJETIVOS[f.objetivo]}. Serviço: ${f.servico}. Local: ${f.local || local(p)} (raio ${f.raio} km). Idade ${f.idMin}–${f.idMax}. Orçamento R$ ${f.orc}/dia por ${f.dias} dias.
Entregue 3 variações de texto principal (até 300 caracteres cada, com emoji moderado e chamada para ${f.objetivo === "whatsapp" ? "o WhatsApp" : "a ação"}), título curto (até 40 caracteres) e botão. Em "criativo", descreva o visual ideal; em "roteiro_video", um roteiro de Reels de 20–30 s para o anúncio; em "observacoes", dicas de público e otimização. Respeite a política de atributos pessoais da Meta e a ética profissional.` });
        ultimo = { f, copies: r.copies };
        out.innerHTML = plano(f, r.copies, `<h4>Criativo</h4><p>${esc(r.criativo)}</p><h4>Roteiro do vídeo</h4><p>${esc(r.roteiro_video).replace(/\n/g, "<br>")}</p><h4>Dicas</h4><p>${esc(r.observacoes).replace(/\n/g, "<br>")}</p>`);
      } catch (e) { out.innerHTML = `<div class="alerta">${esc(e.message)}</div>`; }
    });
    el.addEventListener("click", async e => {
      if (e.target.dataset.copia) { try { await navigator.clipboard.writeText(e.target.dataset.copia); e.target.textContent = "Copiado ✓"; } catch (x) { e.target.textContent = "Selecione e copie"; } }
      if (e.target.id === "adSalvar" && ultimo) { const l = campanhas(); l.push({ id: "a" + Date.now().toString(36), criado: new Date().toISOString(), ...ultimo.f, gasto: "", alcance: "", conversas: "", agendamentos: "", clientes: "" }); store.set("mkt_campanhas", l); lista(); e.target.textContent = "Salva ✓"; }
      if (e.target.dataset.delc && confirm("Excluir esta campanha?")) { store.set("mkt_campanhas", campanhas().filter(c => c.id !== e.target.dataset.delc)); lista(); }
    });
    const real = v => v === "" || v == null ? null : +v;
    const brl = v => "R$ " + v.toFixed(2).replace(".", ",");
    function lista() {
      const l = campanhas().slice().reverse();
      $("#adLista", el).innerHTML = l.length ? `<div class="tabela-wrap"><table><tr><th>Campanha</th><th>Gasto (R$)</th><th>Alcance</th><th>Conversas</th><th>Agendamentos</th><th>Novos clientes</th><th>Custo por conversa</th><th>Custo por cliente</th><th></th></tr>
        ${l.map(c => { const g = real(c.gasto), cv = real(c.conversas), cl = real(c.clientes); return `<tr data-c="${c.id}"><td><b>${esc(c.servico)}</b><br><small class="muted">${new Date(c.criado).toLocaleDateString("pt-BR")} · ${esc(OBJETIVOS[c.objetivo].split(" (")[0])}</small></td>
          ${["gasto", "alcance", "conversas", "agendamentos", "clientes"].map(k => `<td><input type="number" min="0" step="any" data-k="${k}" value="${esc(c[k])}" style="width:90px"></td>`).join("")}
          <td>${g && cv ? brl(g / cv) : "—"}</td><td>${g && cl ? `<b>${brl(g / cl)}</b>` : "—"}</td><td><button class="btn peq perigo" data-delc="${c.id}">✖</button></td></tr>`; }).join("")}</table></div>
        <p class="muted">Compare o <b>custo por cliente</b> com o valor que um aluno/paciente gera em alguns meses: é isso que diz se o anúncio vale a pena.</p>` : `<p class="muted">Nenhuma campanha salva. Monte um plano acima e clique em "Salvar campanha".</p>`;
    }
    el.addEventListener("change", e => { const tr = e.target.closest("[data-c]"); if (!tr || !e.target.dataset.k) return; const l = campanhas(); const c = l.find(x => x.id === tr.dataset.c); c[e.target.dataset.k] = e.target.value; store.set("mkt_campanhas", l); lista(); });
    lista();
  }

  // ---------------------------------------------------------------- métricas semanais
  const CAMPOS = [["seguidores", "Seguidores"], ["alcance", "Contas alcançadas"], ["visitas", "Visitas ao perfil"], ["cliques", "Cliques no link/WhatsApp"], ["mensagens", "Conversas recebidas"], ["agendamentos", "Agendamentos (avaliação/aula experimental)"], ["clientes", "Novos alunos/pacientes"], ["investimento", "Investimento em anúncios (R$)"]];
  const metricas = () => store.get("mkt_metricas", []);
  function resumoMetricas() {
    const l = metricas(); if (!l.length) return "(Ainda não há métricas registradas.)";
    return "Métricas semanais (da mais antiga para a mais recente):\n" + l.map(m => `${m.semana}: ` + CAMPOS.map(([k, n]) => `${n} ${m[k] || 0}`).join("; ")).join("\n");
  }
  function tabMetricas(el) {
    const hoje = new Date(); const seg = new Date(hoje); seg.setDate(hoje.getDate() - ((hoje.getDay() + 6) % 7));
    const desenhar = () => {
      const l = metricas().slice().sort((a, b) => a.semana.localeCompare(b.semana));
      const u = l[l.length - 1], a = l[l.length - 2];
      const varia = (k) => u && a && +a[k] ? Math.round((+u[k] - +a[k]) / +a[k] * 100) : null;
      const taxa = (x, y) => (+y ? Math.round(+x / +y * 100) + "%" : "—");
      el.innerHTML = `<div class="card" id="mtForm"><h3>Registrar semana</h3><p class="muted">Pegue os números no painel profissional do Instagram (Insights) e no seu controle de agenda. Leva 2 minutos por semana.</p>
          <div class="form-grid"><div><label>Semana (segunda-feira)</label><input type="date" id="mtSem" value="${seg.toISOString().slice(0, 10)}"></div>${CAMPOS.map(([k, n]) => `<div><label>${n}</label><input type="number" min="0" step="any" data-m="${k}"></div>`).join("")}</div>
          <div class="row" style="margin-top:8px"><button class="btn" id="mtSalvar">Salvar semana</button>${window.IA.temIA() && l.length ? `<button class="btn sec" id="mtIA">✨ Analisar com o assistente</button>` : ""}</div></div>
        ${u ? `<div class="grid kpis">${[["seguidores", "Seguidores"], ["alcance", "Alcance"], ["mensagens", "Conversas"], ["clientes", "Novos clientes"]].map(([k, n]) => { const v = varia(k); return `<div class="card kpi-card"><small class="muted">${n} · semana de ${new Date(u.semana + "T12:00").toLocaleDateString("pt-BR")}</small><div class="kpi">${(+u[k] || 0).toLocaleString("pt-BR")}</div>${v != null ? `<span class="tag ${v >= 0 ? "ok" : "bad"}">${v >= 0 ? "+" : ""}${v}% vs semana anterior</span>` : ""}</div>`; }).join("")}</div>
          <div class="card"><h3>Funil da última semana</h3><p>Visitas ao perfil → cliques: <b>${taxa(u.cliques, u.visitas)}</b> · conversas → agendamentos: <b>${taxa(u.agendamentos, u.mensagens)}</b> · agendamentos → novos clientes: <b>${taxa(u.clientes, u.agendamentos)}</b>${+u.investimento && +u.clientes ? ` · custo por novo cliente: <b>R$ ${(u.investimento / u.clientes).toFixed(2).replace(".", ",")}</b>` : ""}</p>
          <p class="muted">Se muitas pessoas conversam e poucas agendam, o gargalo está no atendimento (velocidade e roteiro de resposta). Se poucas visitam o perfil, o problema está no alcance do conteúdo/anúncio.</p>
          <canvas id="mtGraf" style="width:100%;height:220px"></canvas></div>` : ""}
        <h3>Histórico</h3>${l.length ? `<div class="tabela-wrap"><table><tr><th>Semana</th>${CAMPOS.map(c => `<th>${c[1]}</th>`).join("")}<th></th></tr>${l.slice().reverse().map(m => `<tr><td>${new Date(m.semana + "T12:00").toLocaleDateString("pt-BR")}</td>${CAMPOS.map(([k]) => `<td>${esc(m[k] ?? "")}</td>`).join("")}<td><button class="btn peq perigo" data-delm="${m.semana}">✖</button></td></tr>`).join("")}</table></div>` : `<p class="muted">Nenhuma semana registrada.</p>`}`;
      if (u && l.length > 1) requestAnimationFrame(() => grafico($("#mtGraf", el), l));
    };
    function grafico(cv, l) {
      const W = cv.width = cv.clientWidth * 2, H = cv.height = 440, ctx = cv.getContext("2d"); const css = getComputedStyle(document.documentElement);
      const series = [["seguidores", "#4a6c5e"], ["clientes", "#c9a35b"]]; const m = { l: 60, r: 20, t: 40, b: 50 };
      ctx.font = "22px Montserrat, sans-serif"; ctx.fillStyle = css.getPropertyValue("--text");
      series.forEach(([k, cor], si) => {
        const vs = l.map(x => +x[k] || 0), max = Math.max(...vs) || 1, min = Math.min(...vs);
        ctx.strokeStyle = cor; ctx.fillStyle = cor; ctx.lineWidth = 4; ctx.beginPath();
        vs.forEach((v, i) => { const x = m.l + i * (W - m.l - m.r) / (vs.length - 1), y = H - m.b - (v - min) / ((max - min) || 1) * (H - m.t - m.b); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke();
        ctx.fillRect(m.l + si * 300, 6, 20, 20); ctx.fillStyle = css.getPropertyValue("--text"); ctx.fillText(k === "seguidores" ? "Seguidores (escala própria)" : "Novos clientes (escala própria)", m.l + 28 + si * 300, 24);
      });
    }
    el.addEventListener("click", e => {
      if (e.target.id === "mtSalvar") {
        const sem = $("#mtSem", el).value; if (!sem) return; const o = { semana: sem }; $$("[data-m]", el).forEach(i => { o[i.dataset.m] = i.value; });
        const l = metricas().filter(m => m.semana !== sem); l.push(o); store.set("mkt_metricas", l); desenhar();
      }
      if (e.target.dataset.delm && confirm("Excluir esta semana?")) { store.set("mkt_metricas", metricas().filter(m => m.semana !== e.target.dataset.delm)); desenhar(); }
      if (e.target.id === "mtIA") perguntarAoAssistente(ATALHOS.find(a => a[0].includes("Analisar"))[1] + "\n\n" + resumoMetricas());
    });
    desenhar();
  }

  // ---------------------------------------------------------------- datas comemorativas
  const DATAS = [
    [1, null, "Janeiro Branco (saúde mental)", "Movimento e bem-estar emocional; rotina de exercícios para começar o ano; Pilates e respiração."],
    [1, null, "Metas de ano novo", "Como começar a se exercitar com segurança; avaliação antes de iniciar; turmas para iniciantes."],
    [3, 8, "Dia Internacional da Mulher", "Força em todas as fases: gestação, pós-parto, menopausa; homenagem às alunas (com autorização)."],
    [4, 6, "Dia Mundial da Atividade Física", "Quanto de exercício a OMS recomenda; como o Pilates entra na rotina; desafio de movimento da semana."],
    [4, 7, "Dia Mundial da Saúde", "Cuidado preventivo; quando procurar um fisioterapeuta; mitos sobre dor e repouso."],
    [5, null, "Dia Mundial do Pilates (1º sábado de maio)", "Aula aberta/evento no studio; história do método; bastidores da equipe."],
    [5, null, "Dia das Mães (2º domingo)", "Aula mãe e filha(o); Pilates no pós-parto; cuidado com a coluna ao carregar o bebê."],
    [7, 26, "Dia dos Avós", "Equilíbrio e prevenção de quedas; força para a independência; turma para a melhor idade."],
    [8, null, "Dia dos Pais (2º domingo)", "Homens também fazem Pilates; dor nas costas no trabalho; convite para pai e filho(a)."],
    [9, 8, "Dia Mundial da Fisioterapia", "O que faz um fisioterapeuta; bastidores da clínica; tema anual da World Physiotherapy."],
    [9, null, "Setembro Amarelo", "Exercício e saúde mental (com cuidado e sem simplificar); acolhimento; onde buscar ajuda (CVV 188)."],
    [10, 1, "Dia Internacional da Pessoa Idosa", "Prevenção de quedas, força e autonomia; depoimento autorizado de aluno(a) mais velho(a)."],
    [10, null, "Outubro Rosa", "Exercício durante e após o tratamento do câncer de mama, com liberação médica; mobilidade do ombro; acolhimento."],
    [10, 12, "Dia Mundial da Artrite", "Exercício é tratamento para osteoartrite; mitos sobre 'desgaste'; aula adaptada."],
    [10, 13, "Dia do Fisioterapeuta (Brasil)", "Homenagem à profissão; sua trajetória; por que escolheu a fisioterapia."],
    [10, 16, "Dia Mundial da Coluna", "Cuidados com a coluna no dia a dia; Pilates para a coluna; quando procurar avaliação."],
    [10, 20, "Dia Mundial da Osteoporose", "Força e impacto adequados para os ossos; equilíbrio; prevenção de quedas."],
    [11, null, "Novembro Azul", "Saúde do homem; assoalho pélvico masculino; convite para começar a se exercitar."],
    [12, null, "Fim de ano e férias", "Como manter o movimento nas férias; programa curto para fazer em casa; retrospectiva do studio."]
  ];
  function tabDatas(el) {
    const mesAtual = new Date().getMonth() + 1;
    const ordem = DATAS.slice().sort((a, b) => ((a[0] - mesAtual + 12) % 12) - ((b[0] - mesAtual + 12) % 12) || (a[1] || 0) - (b[1] || 0));
    const nomeMes = m => new Date(2026, m - 1, 1).toLocaleDateString("pt-BR", { month: "long" });
    el.innerHTML = `<p class="muted">Datas da saúde e do bem-estar que rendem conteúdo, a partir do mês atual. Planeje com 2–3 semanas de antecedência.</p>
      ${ordem.map((d, i) => `<div class="card data-card"><div class="row" style="justify-content:space-between"><span><span class="tag ${d[0] === mesAtual ? "ok" : ""}">${d[1] ? `${d[1]} de ${nomeMes(d[0])}` : nomeMes(d[0])}</span> <b>${esc(d[2])}</b></span>
        <span class="row"><button class="btn peq sec" data-gd="${i}">Guardar ideia</button>${window.IA.temIA() ? `<button class="btn peq" data-ad="${i}">✨ Planejar com o assistente</button>` : ""}</span></div><p class="muted">${esc(d[3])}</p></div>`).join("")}`;
    el.addEventListener("click", e => {
      const g = e.target.dataset.gd, a = e.target.dataset.ad;
      if (g != null) { const d = ordem[+g]; const l = store.get("conteudo_ideias", []); l.push({ id: "c" + Date.now().toString(36), texto: `${d[2]}: ${d[3]}`, origem: "Data comemorativa", criado: new Date().toISOString() }); store.set("conteudo_ideias", l); e.target.textContent = "Guardada ✓"; }
      if (a != null) { const d = ordem[+a]; perguntarAoAssistente(`Planeje os conteúdos do Instagram para "${d[2]}" (${d[1] ? `${d[1]} de ${nomeMes(d[0])}` : nomeMes(d[0])}). Ideias de partida: ${d[3]}. Quero: 1 Reels com roteiro, 1 carrossel com o texto de cada slide, 3 stories e a legenda principal. Se fizer sentido, sugira uma ação no studio/clínica.`); }
    });
  }

  // ---------------------------------------------------------------- respostas prontas
  const RESP_PADRAO = () => {
    const p = perfil();
    return [
      ["Boas-vindas (resposta automática)", `Olá! 😊 Que bom falar com você. Aqui é do ${p.nome}. Me conta: você procura Pilates, fisioterapia ou ainda está decidindo? Já te passo todas as informações.`],
      ["Quando perguntam o preço", `Oi! Os valores dependem do plano (frequência por semana) e do tipo de atendimento. Para indicar o melhor para você, posso te fazer 2 perguntinhas? 1) Qual seu objetivo principal? 2) Quantas vezes por semana gostaria de vir? Assim já te mando as opções certinhas. 💚`],
      ["Convite para a oferta de entrada", `Que tal conhecer o studio na prática? Temos ${p.oferta.toLowerCase()} para você sentir como é a aula e conversar com a fisioterapeuta. Tenho horários ${p.horarios || "de manhã e à noite"} — qual fica melhor para você?`],
      ["Confirmação de horário", `Combinado! ✅ Sua ${p.oferta.toLowerCase()} ficou para [DIA] às [HORA]. Endereço: [ENDEREÇO]. Venha com roupa confortável e chegue 10 minutinhos antes. Qualquer imprevisto, é só me avisar por aqui.`],
      ["Convênio", `Sobre convênio: ${p.convenios ? p.convenios : "atendemos de forma particular e fornecemos recibo/nota para você solicitar reembolso ao seu plano, se ele tiver essa cobertura"}. Quer que eu te explique como funciona?`],
      ["Pessoa sumiu depois do primeiro contato", `Oi, [NOME]! Passando para saber se ficou alguma dúvida sobre o Pilates/fisioterapia. Esta semana ainda tenho horários para a ${p.oferta.toLowerCase()}. Se quiser, já reservo um para você. 😊`],
      ["Aluno que parou de vir", `Oi, [NOME]! Sentimos sua falta por aqui. 💚 Está tudo bem? Se a rotina apertou, podemos ajustar dia e horário para você retomar sem pressão.`],
      ["Pedido de avaliação no Google", `[NOME], obrigado pela confiança! Se você gostou do atendimento, sua avaliação no Google ajuda muito outras pessoas a nos encontrarem: [LINK]. Leva menos de 1 minuto. 🙏`]
    ];
  };
  function tabRespostas(el) {
    const salvas = store.get("mkt_respostas", null); const lista = salvas || RESP_PADRAO();
    el.innerHTML = `<p class="muted">Modelos para WhatsApp e Direct, já com os dados do seu perfil. Edite à vontade; o que estiver entre [colchetes] você completa na hora. Responder em poucos minutos aumenta muito a chance de agendamento.</p>
      ${lista.map(([t, txt], i) => `<div class="card"><div class="row" style="justify-content:space-between"><b>${esc(t)}</b><button class="btn peq sec" data-cp="${i}">Copiar</button></div><textarea data-r="${i}" style="min-height:80px">${esc(txt)}</textarea></div>`).join("")}
      <div class="row"><button class="btn sec" id="rpRestaurar">Restaurar modelos originais</button>${window.IA.temIA() ? `<button class="btn" id="rpIA">✨ Responder uma mensagem com o assistente</button>` : ""}</div>`;
    el.addEventListener("input", e => { const i = e.target.dataset.r; if (i == null) return; const l = (store.get("mkt_respostas", null) || RESP_PADRAO()); l[+i][1] = e.target.value; store.set("mkt_respostas", l); });
    el.addEventListener("click", async e => {
      const i = e.target.dataset.cp; if (i != null) { try { await navigator.clipboard.writeText($(`[data-r="${i}"]`, el).value); e.target.textContent = "Copiado ✓"; } catch (x) { $(`[data-r="${i}"]`, el).select(); } }
      if (e.target.id === "rpRestaurar" && confirm("Restaurar os modelos originais? Suas edições serão perdidas.")) { store.set("mkt_respostas", null); tabRespostas(el); }
      if (e.target.id === "rpIA") perguntarAoAssistente(ATALHOS.find(a => a[0].includes("Responder"))[1] + "[cole aqui a mensagem recebida]");
    });
  }

  // ---------------------------------------------------------------- perfil do negócio + bio
  function tabPerfil(el) {
    const p = perfil();
    const campo = (k, rot, tipo = "text", ph = "") => tipo === "area" ? `<div><label>${rot}</label><textarea data-p="${k}" placeholder="${esc(ph)}">${esc(p[k])}</textarea></div>` : `<div><label>${rot}</label><input type="text" data-p="${k}" value="${esc(p[k])}" placeholder="${esc(ph)}"></div>`;
    const gerarBios = q => [
      `${q.tipo.split(" e ")[0]} com fisioterapeuta 💚 | ${local(q)}\nMovimento com cuidado e ciência\n👇 ${q.oferta}: chame no WhatsApp`,
      `Pilates & Fisioterapia em ${local(q)}\nTurmas pequenas · avaliação antes de começar\n👇 Agende sua ${q.oferta.toLowerCase()}`,
      `Fisioterapeuta | Pilates | Reabilitação\nAjudo você a se movimentar melhor, com segurança\n📍 ${local(q)} · 👇 WhatsApp`
    ];
    let bios = gerarBios(p);
    const htmlBios = () => bios.map((b, i) => `<div class="ad-copy"><div class="row" style="justify-content:space-between"><small class="muted">${b.length} caracteres</small><button class="btn peq sec" data-bio="${i}">Copiar</button></div><p>${esc(b).replace(/\n/g, "<br>")}</p></div>`).join("");
    const atualizaBios = () => { bios = gerarBios(perfil()); const d = $("#pfBios", el); if (d) d.innerHTML = htmlBios(); };
    el.innerHTML = `<div class="grid-2" style="align-items:start"><div class="card" id="pfForm"><h3>Perfil do negócio</h3><p class="muted">O assistente e os modelos usam estas informações. Quanto mais completo, mais personalizado fica.</p>
        <div class="form-grid">${campo("nome", "Nome")}${campo("tipo", "Tipo de negócio")}${campo("cidade", "Cidade", "text", "ex.: São Paulo")}${campo("bairro", "Bairro", "text", "ex.: Moema")}${campo("whatsapp", "WhatsApp", "text", "(11) 99999-9999")}${campo("instagram", "@ do Instagram")}${campo("oferta", "Oferta de entrada", "text", "ex.: Aula experimental")}${campo("horarios", "Horários", "text", "ex.: seg a sex 6h–21h, sáb 8h–12h")}${campo("convenios", "Convênios / reembolso")}
          <div><label>Tom de voz</label><select data-p="tom">${["acolhedor e técnico", "leve e motivacional", "profissional e direto", "descontraído e próximo"].map(t => `<option ${p.tom === t ? "selected" : ""}>${t}</option>`).join("")}</select></div></div>
        ${campo("servicos", "Serviços (um por linha)", "area")}${campo("publico", "Público que você quer atrair", "area")}${campo("diferenciais", "Diferenciais", "area")}${campo("identidade", "Identidade visual e estilo", "area")}${campo("objetivo", "Objetivo deste mês", "area")}
        <p class="muted" id="pfSalvo">Salvo automaticamente.</p>
        <h3>🤖 Instruções do assistente</h3><p class="muted">Como o assistente deve trabalhar: papel, funções, formato de entrega e diretrizes. Edite quando quiser — vale a partir da próxima mensagem.</p>
        <textarea id="pfInstr" style="min-height:280px;font-size:.88rem">${esc(instrucoes())}</textarea>
        <div class="row" style="margin-top:6px"><button class="btn sec peq" id="pfInstrPadrao">Restaurar instruções originais</button><span class="muted" id="pfInstrMsg"></span></div></div>
      <div><div class="card"><h3>Sugestões de bio (até 150 caracteres)</h3><div id="pfBios">${htmlBios()}</div>
        <p class="muted">Coloque o link do WhatsApp no campo "Links" do perfil.</p></div>
      <div class="card"><h3>Destaques sugeridos</h3><div class="row">${["Comece aqui", "Aulas", "Fisioterapia", "Planos", "Studio", "Dúvidas", "Equipe", "Endereço"].map(d => `<span class="tag">${d}</span>`).join("")}</div>
        <p class="muted">Use capas na identidade visual (verde e dourado) e mantenha "Comece aqui" como o primeiro destaque, explicando como agendar.</p></div></div></div>`;
    el.addEventListener("input", e => { if (e.target.id === "pfInstr") { store.set("mkt_instrucoes", e.target.value.trim() ? e.target.value : null); $("#pfInstrMsg").textContent = "Salvo ✓"; return; } });
    el.addEventListener("click", e => { if (e.target.id === "pfInstrPadrao" && confirm("Restaurar as instruções originais? Suas edições serão perdidas.")) { store.set("mkt_instrucoes", null); $("#pfInstr").value = INSTRUCOES_PADRAO; $("#pfInstrMsg").textContent = "Restauradas ✓"; } });
    el.addEventListener("input", e => { const k = e.target.dataset.p; if (!k) return; const q = store.get("mkt_perfil", {}); q[k] = e.target.value; store.set("mkt_perfil", q); $("#pfSalvo").textContent = "Salvo ✓ " + new Date().toLocaleTimeString("pt-BR"); });
    el.addEventListener("change", e => { if (["cidade", "bairro", "oferta", "tipo"].includes(e.target.dataset.p)) atualizaBios(); });
    el.addEventListener("change", e => { const k = e.target.dataset.p; if (k === "tom") { const q = store.get("mkt_perfil", {}); q.tom = e.target.value; store.set("mkt_perfil", q); } });
    el.addEventListener("click", async e => { const i = e.target.dataset.bio; if (i != null) { try { await navigator.clipboard.writeText(bios[+i]); e.target.textContent = "Copiado ✓"; } catch (x) { } } });
  }

  // ---------------------------------------------------------------- tela
  function viewMarketing(sub) {
    app.innerHTML = `<h1>📣 Marketing</h1>
      <p class="muted">Seu assistente para o Instagram, anúncios e atendimento do ${esc(perfil().nome)}. ${window.IA.temIA() ? `<span class="tag ok">Assistente ativo</span>` : `<a class="tag warn" href="#/ia">Ative o assistente (IA)</a>`}</p>
      ${tabs("tabMkt", [["assistente", "🤖 Assistente"], ["anuncios", "📢 Anúncios"], ["metricas", "📊 Métricas"], ["datas", "📆 Datas"], ["respostas", "💬 Respostas prontas"], ["perfil", "🏷 Perfil e bio"]], sub || "assistente", (k, el) => ({ assistente: tabAssistente, anuncios: tabAnuncios, metricas: tabMetricas, datas: tabDatas, respostas: tabRespostas, perfil: tabPerfil })[k](el), !!sub)}`;
  }
  rotas.marketing = viewMarketing;
  window.MARKETING = { perfil, perguntarAoAssistente };
})();
