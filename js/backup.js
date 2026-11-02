/* Backup completo: tudo do localStorage + mídias do IndexedDB (voz, fotos, vídeos, músicas),
   num único arquivo, opcionalmente criptografado com senha (AES-GCM + PBKDF2). */
(function () {
  "use strict";
  const { $, esc, store, app, rotas } = window.FR;
  const IGNORAR = /^(tab_|sessao_rasc_)/; // preferências de tela e rascunhos

  // IndexedDB das mídias (mesmo banco usado pelo editor de Reels)
  const abrir = () => new Promise((res, rej) => { const r = indexedDB.open("fisio_midia", 1); r.onupgradeneeded = () => r.result.createObjectStore("m"); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
  async function midias() {
    const db = await abrir(); return new Promise((res, rej) => {
      const out = []; const c = db.transaction("m").objectStore("m").openCursor();
      c.onsuccess = () => { const cur = c.result; if (cur) { out.push([cur.key, cur.value]); cur.continue(); } else res(out); }; c.onerror = () => rej(c.error);
    });
  }
  async function gravarMidia(k, blob) { const db = await abrir(); return new Promise((res, rej) => { const t = db.transaction("m", "readwrite"); t.objectStore("m").put(blob, k); t.oncomplete = res; t.onerror = () => rej(t.error); }); }
  const blobB64 = b => new Promise(r => { const f = new FileReader(); f.onload = () => r(f.result); f.readAsDataURL(b); });
  const b64Blob = async d => (await fetch(d)).blob();
  const bufB64 = buf => { let s = ""; const a = new Uint8Array(buf); for (let i = 0; i < a.length; i += 32768) s += String.fromCharCode.apply(null, a.subarray(i, i + 32768)); return btoa(s); };
  const b64Buf = b => Uint8Array.from(atob(b), c => c.charCodeAt(0));

  async function chave(senha, salt) {
    const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(senha), "PBKDF2", false, ["deriveKey"]);
    return crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations: 250000, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
  }

  async function exportar(senha, incluirChave, incluirMidias, prog) {
    const dados = { local: {}, midias: [] };
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i); if (IGNORAR.test(k)) continue;
      if (k === "ia_cfg" && !incluirChave) { const v = store.get(k, {}); dados.local[k] = JSON.stringify({ ...v, key: "" }); continue; }
      dados.local[k] = localStorage.getItem(k);
    }
    if (incluirMidias) { const ms = await midias(); for (let i = 0; i < ms.length; i++) { prog(`Mídias ${i + 1}/${ms.length}…`); dados.midias.push([ms[i][0], await blobB64(ms[i][1])]); } }
    const texto = JSON.stringify(dados);
    const marca = window.MARCA.get();
    const env = { app: "fisio-raciocinio", versao: 1, criado: new Date().toISOString(), marca: marca.nome, cifrado: !!senha };
    if (senha) {
      prog("Criptografando…");
      const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
      const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await chave(senha, salt), new TextEncoder().encode(texto));
      Object.assign(env, { salt: bufB64(salt), iv: bufB64(iv), dados: bufB64(ct) });
    } else env.dados = dados;
    const blob = new Blob([JSON.stringify(env)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `backup-fisio-${new Date().toISOString().slice(0, 10)}.json`; a.click();
    store.set("ultimo_backup", new Date().toISOString());
    return blob.size;
  }

  async function importar(arquivo, senha, prog) {
    const env = JSON.parse(await arquivo.text());
    if (env.app !== "fisio-raciocinio") throw new Error("Este arquivo não é um backup do sistema.");
    let dados = env.dados;
    if (env.cifrado) {
      if (!senha) throw new Error("Este backup está protegido por senha. Digite a senha.");
      try { const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: b64Buf(env.iv) }, await chave(senha, b64Buf(env.salt)), b64Buf(env.dados)); dados = JSON.parse(new TextDecoder().decode(pt)); }
      catch (e) { throw new Error("Senha incorreta ou arquivo corrompido."); }
    }
    const chaveAtual = store.get("ia_cfg", {}).key;
    Object.entries(dados.local).forEach(([k, v]) => { try { localStorage.setItem(k, v); } catch (e) { /* cota */ } });
    if (chaveAtual && !store.get("ia_cfg", {}).key) store.set("ia_cfg", { ...store.get("ia_cfg", {}), key: chaveAtual }); // não apaga a chave atual
    for (let i = 0; i < (dados.midias || []).length; i++) { prog(`Restaurando mídias ${i + 1}/${dados.midias.length}…`); const [k, d] = dados.midias[i]; await gravarMidia(k, await b64Blob(d)); }
    return { itens: Object.keys(dados.local).length, midias: (dados.midias || []).length };
  }

  function cartao() {
    const ult = store.get("ultimo_backup", null);
    return `<h2>💾 Backup</h2><div class="card" id="bkCard">
      <p>Tudo o que você cria fica salvo <b>só neste aparelho</b>: pacientes, avaliações, programas, biblioteca de artigos, roteiros, gravações e mídias. Faça backup regularmente e guarde o arquivo em local seguro (Google Drive, iCloud, pendrive).</p>
      <p class="muted">Último backup: ${ult ? new Date(ult).toLocaleString("pt-BR") : "nunca"}</p>
      <div class="grid-2"><div><h3>Fazer backup</h3>
        <label>Senha (recomendado se houver dados de pacientes)</label><input type="password" id="bkSenha" autocomplete="new-password" placeholder="Deixe em branco para não proteger">
        <label class="check"><input type="checkbox" id="bkMidias" checked> Incluir gravações de voz, fotos, vídeos e músicas</label>
        <label class="check"><input type="checkbox" id="bkChave"> Incluir a chave da API de IA</label>
        <button class="btn" id="bkExportar">⬇ Baixar backup</button></div>
      <div><h3>Restaurar</h3><p class="muted">Use para passar tudo para outro aparelho. Os dados do arquivo substituem os atuais com o mesmo nome.</p>
        <label>Senha do backup (se tiver)</label><input type="password" id="bkSenhaImp" autocomplete="off">
        <label class="btn sec" style="cursor:pointer;margin-top:8px">📂 Escolher arquivo de backup<input type="file" id="bkArquivo" accept=".json,application/json" hidden></label></div></div>
      <div id="bkMsg"></div>
      <p class="muted" style="font-size:.82rem">Atenção: sem a senha não é possível abrir um backup protegido — não há como recuperá-la.</p></div>`;
  }
  function ligar() {
    const msg = h => { $("#bkMsg").innerHTML = h; };
    $("#bkExportar").addEventListener("click", async () => {
      const b = $("#bkExportar"); b.disabled = true;
      try { const t = await exportar($("#bkSenha").value, $("#bkChave").checked, $("#bkMidias").checked, s => msg(`<div class="info">${esc(s)}</div>`)); msg(`<div class="sucesso">Backup gerado (${(t / 1048576).toFixed(1)} MB)${$("#bkSenha").value ? ", protegido por senha" : ""}.</div>`); }
      catch (e) { msg(`<div class="alerta">${esc(e.message)}</div>`); }
      b.disabled = false;
    });
    $("#bkArquivo").addEventListener("change", async e => {
      const f = e.target.files[0]; if (!f) return;
      if (!confirm("Restaurar este backup? Os dados atuais com o mesmo nome serão substituídos.")) return;
      try { const r = await importar(f, $("#bkSenhaImp").value, s => msg(`<div class="info">${esc(s)}</div>`)); msg(`<div class="sucesso">Restaurado: ${r.itens} conjuntos de dados e ${r.midias} mídias. Recarregando…</div>`); setTimeout(() => location.reload(), 1200); }
      catch (err) { msg(`<div class="alerta">${esc(err.message)}</div>`); }
      e.target.value = "";
    });
  }
  const original = rotas.ia;
  rotas.ia = (...a) => { original(...a); app.insertAdjacentHTML("beforeend", cartao()); ligar(); };

  // Lembrete na tela inicial quando há dados e o último backup tem mais de 14 dias
  const inicioOriginal = rotas[""];
  rotas[""] = (...a) => {
    inicioOriginal(...a);
    const temDados = store.get("pacientes", []).length || store.get("fisio_avaliacoes", []).length || Object.keys(store.get("bib_artigos", {})).length || store.get("programas", []).length;
    const ult = store.get("ultimo_backup", null); const dias = ult ? (Date.now() - new Date(ult)) / 864e5 : Infinity;
    if (temDados && dias > 14) app.querySelector(".hero")?.insertAdjacentHTML("afterend", `<div class="aviso">💾 ${ult ? `Seu último backup foi há ${Math.floor(dias)} dias.` : "Você ainda não fez backup."} Os dados ficam só neste aparelho — <a href="#/ia">fazer backup agora</a>.</div>`);
  };
  window.BACKUP = { exportar, importar };
})();
