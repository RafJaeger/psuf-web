"use strict";

var DB_FILES = ["patches.csv", "graphics_patches.csv", "native60.csv", "fix_patches.csv"];
var RAW_BASE = "https://raw.githubusercontent.com/RafJaeger/psuf-ps3/main/release/USRDIR/";
var CLOCK_DEFAULT_GPU = 500;
var CLOCK_DEFAULT_VRAM = 650;
var CLOCK_MAX_GPU = 750;
var CLOCK_MAX_VRAM = 850;

var state = {
  lang: localStorage.getItem("psuf.lang") || "pt",
  games: [],
  selectedGame: null,
  lastCodes: [],
  dbTexts: {},
  titleNames: {}
};

var T = {
  pt: {
    subtitle: "Patch tool web", manual: "Manual", patches: "Patches", overclock: "Overclock",
    testConnection: "Testar conexao", autoConnect: "Conectar automaticamente",
    manualTitle: "Codigos", manualHint: "Use com o jogo aberto. Manual escreve direto na memoria via PS3MAPI.",
    importPatch: "Importar patch", exportPatch: "Exportar patch",
    saveOnPs3: "Salvar no PS3 para reaplicar quando abrir o jogo", applyOpenGame: "Aplicar em jogo aberto",
    database: "Banco de patches", importDb: "Importar PSUFDB", onlineUpdate: "Atualizar online",
    onlineHint: "Atualiza o banco do site usando os arquivos publicados no GitHub.",
    patchLibrary: "Lista de jogos", clockTitle: "webMAN / Overclock",
    clockNotice: "Overclock pode aumentar FPS, mas esquenta mais. Limite PSUF: GPU 750 / VRAM 850. HEN nao funciona overclock.",
    clockRiskShort: "Use overclock por sua conta e risco.", defaultClock: "Padrao 500/650", applyClock: "Aplicar clock",
    info: "Informacao", fpsPatch: "Patch FPS", gfxPatch: "Patches graficos", restoreDefault: "Restaurar padrao",
    settings: "Configuracoes", howToUse: "Como usar?", supportProject: "Apoiar projeto",
    loadingDb: "Carregando banco...", dbReady: "Banco carregado: {count} jogos.", dbUpdated: "Banco atualizado online: {count} jogos.",
    noIp: "Coloque o IP local do PS3.", connectionSent: "Comando enviado.", applying: "Aplicando codigos...",
    applied: "Aplicado: {count} codigo(s).", saved: " Patch salvo no PS3.", noCodes: "Nao achei codigo valido.",
    noPatch: "Esse jogo nao tem patch aqui.", browserLimit: "Se o iPad bloquear a chamada local, abra estes links na mesma rede do PS3:",
    importedDb: "Banco importado.", importedPatch: "Patch importado.", exportedPatch: "Patch exportado.",
    onlineFail: "Nao consegui atualizar online: ", clockConfirm: "USE OVERCLOCK POR SUA CONTA E RISCO.\n\nNao me responsabilizo por danos ao seu console. Fique de olho na temperatura. Esta opcao nao funciona em HEN.\n\nAplicar GPU {gpu} / VRAM {vram}?",
    clockSent: "Clock enviado: GPU {gpu} MHz | VRAM {vram} MHz.",
    restored: "Padrao restaurado. Valores: {count}. Arquivos PSUF limpos.",
    cleanNoOriginal: "Arquivos PSUF limpos. Nao achei valor original conhecido para restaurar na memoria.",
    helpHtml: "<h3>Como usar</h3><p>Coloque o IP local do PS3 com webMAN/PS3MAPI ativo.</p><p><b>Manual:</b> cole um ou varios codigos e aplique com o jogo aberto.</p><p><b>Patches:</b> pesquise o jogo, abra FPS ou graficos e aplique. Patch de FPS remove o limite padrao, mas nao garante 60 FPS fixos.</p><p><b>Salvar no PS3:</b> cria arquivos para tentar reaplicar o patch quando o jogo abrir.</p><p><b>Atualizar online:</b> baixa o banco novo publicado no GitHub.</p>",
    donateHtml: "<h3>Apoiar projeto</h3><p>Se quiser ajudar o PSUF, use Pix ou PayPal.</p>"
  },
  en: {
    subtitle: "Web patch tool", manual: "Manual", patches: "Patches", overclock: "Overclock",
    testConnection: "Test connection", autoConnect: "Auto connect",
    manualTitle: "Codes", manualHint: "Use with the game open. Manual writes directly to memory through PS3MAPI.",
    importPatch: "Import patch", exportPatch: "Export patch", saveOnPs3: "Save on PS3 to reapply when the game starts",
    applyOpenGame: "Apply in open game", database: "Patch database", importDb: "Import PSUFDB", onlineUpdate: "Online update",
    onlineHint: "Updates this site database using the files published on GitHub.", patchLibrary: "Game list",
    clockTitle: "webMAN / Overclock", clockNotice: "Overclock may improve FPS, but it adds heat. PSUF limit: GPU 750 / VRAM 850. HEN does not support overclock.",
    clockRiskShort: "Use overclock at your own risk.", defaultClock: "Default 500/650", applyClock: "Apply clock",
    info: "Information", fpsPatch: "FPS patch", gfxPatch: "Graphic patches", restoreDefault: "Restore default",
    settings: "Settings", howToUse: "How to use?", supportProject: "Support project", loadingDb: "Loading database...",
    dbReady: "Database loaded: {count} games.", dbUpdated: "Database updated online: {count} games.", noIp: "Enter the PS3 local IP.",
    connectionSent: "Command sent.", applying: "Applying codes...", applied: "Applied: {count} code(s).", saved: " Patch saved on PS3.",
    noCodes: "No valid code found.", noPatch: "This game has no patch here.",
    browserLimit: "If iPad blocks the local call, open these links on the same network as the PS3:",
    importedDb: "Database imported.", importedPatch: "Patch imported.", exportedPatch: "Patch exported.", onlineFail: "Could not update online: ",
    clockConfirm: "USE OVERCLOCK AT YOUR OWN RISK.\n\nI am not responsible for damage to your console. Watch the temperature. This option does not work on HEN.\n\nApply GPU {gpu} / VRAM {vram}?",
    clockSent: "Clock sent: GPU {gpu} MHz | VRAM {vram} MHz.", restored: "Default restored. Values: {count}. PSUF files cleaned.",
    cleanNoOriginal: "PSUF files cleaned. No known original value was found to restore in memory.",
    helpHtml: "<h3>How to use</h3><p>Enter the PS3 local IP with webMAN/PS3MAPI enabled.</p><p><b>Manual:</b> paste one or more codes and apply with the game open.</p><p><b>Patches:</b> search a game, open FPS or graphics and apply. FPS patches remove the default cap, but do not guarantee fixed 60 FPS.</p><p><b>Save on PS3:</b> creates files to try reapplying the patch when the game starts.</p><p><b>Online update:</b> downloads the new database published on GitHub.</p>",
    donateHtml: "<h3>Support project</h3><p>If you want to support PSUF, use Pix or PayPal.</p>"
  },
  es: {
    subtitle: "Herramienta web de patches", manual: "Manual", patches: "Parches", overclock: "Overclock",
    testConnection: "Probar conexion", autoConnect: "Conectar automaticamente", manualTitle: "Codigos",
    manualHint: "Usa con el juego abierto. Manual escribe directo en memoria por PS3MAPI.",
    importPatch: "Importar patch", exportPatch: "Exportar patch", saveOnPs3: "Guardar en PS3 para reaplicar al abrir el juego",
    applyOpenGame: "Aplicar en juego abierto", database: "Banco de patches", importDb: "Importar PSUFDB", onlineUpdate: "Actualizar online",
    onlineHint: "Actualiza el banco del sitio usando los archivos publicados en GitHub.", patchLibrary: "Lista de juegos",
    clockTitle: "webMAN / Overclock", clockNotice: "El overclock puede mejorar FPS, pero calienta mas. Limite PSUF: GPU 750 / VRAM 850. HEN no permite overclock.",
    clockRiskShort: "Usa overclock bajo tu propio riesgo.", defaultClock: "Predeterminado 500/650", applyClock: "Aplicar clock",
    info: "Informacion", fpsPatch: "Patch FPS", gfxPatch: "Patches graficos", restoreDefault: "Restaurar predeterminado",
    settings: "Configuraciones", howToUse: "Como usar?", supportProject: "Apoyar proyecto", loadingDb: "Cargando banco...",
    dbReady: "Banco cargado: {count} juegos.", dbUpdated: "Banco actualizado online: {count} juegos.", noIp: "Coloca la IP local del PS3.",
    connectionSent: "Comando enviado.", applying: "Aplicando codigos...", applied: "Aplicado: {count} codigo(s).", saved: " Patch guardado en PS3.",
    noCodes: "No encontre codigo valido.", noPatch: "Este juego no tiene patch aqui.",
    browserLimit: "Si iPad bloquea la llamada local, abre estos links en la misma red del PS3:", importedDb: "Banco importado.",
    importedPatch: "Patch importado.", exportedPatch: "Patch exportado.", onlineFail: "No pude actualizar online: ",
    clockConfirm: "USA OVERCLOCK BAJO TU PROPIO RIESGO.\n\nNo me responsabilizo por danos en tu consola. Mira la temperatura. Esta opcion no funciona en HEN.\n\nAplicar GPU {gpu} / VRAM {vram}?",
    clockSent: "Clock enviado: GPU {gpu} MHz | VRAM {vram} MHz.", restored: "Predeterminado restaurado. Valores: {count}. Archivos PSUF limpiados.",
    cleanNoOriginal: "Archivos PSUF limpiados. No encontre valor original conocido para restaurar en memoria.",
    helpHtml: "<h3>Como usar</h3><p>Coloca la IP local del PS3 con webMAN/PS3MAPI activo.</p><p><b>Manual:</b> pega uno o varios codigos y aplica con el juego abierto.</p><p><b>Parches:</b> busca un juego, abre FPS o graficos y aplica. Los patches FPS quitan el limite original, pero no garantizan 60 FPS fijos.</p><p><b>Guardar en PS3:</b> crea archivos para intentar reaplicar el patch al iniciar el juego.</p><p><b>Actualizar online:</b> baja el banco nuevo publicado en GitHub.</p>",
    donateHtml: "<h3>Apoyar proyecto</h3><p>Si quieres apoyar PSUF, usa Pix o PayPal.</p>"
  }
};

function $(id) { return document.getElementById(id); }
function each(list, fn) { for (var i = 0; i < list.length; i += 1) fn(list[i], i); }
function rep(value, search, replacement) { return String(value).split(search).join(replacement); }
function text(key, vars) {
  var value = (T[state.lang] && T[state.lang][key]) || T.pt[key] || key;
  vars = vars || {};
  for (var name in vars) if (Object.prototype.hasOwnProperty.call(vars, name)) value = rep(value, "{" + name + "}", vars[name]);
  return value;
}
function addClass(node, name) { if (node && (" " + node.className + " ").indexOf(" " + name + " ") < 0) node.className = node.className ? node.className + " " + name : name; }
function removeClass(node, name) { if (node) node.className = (" " + node.className + " ").replace(" " + name + " ", " ").replace(/^\s+|\s+$/g, ""); }
function escapeHtml(value) { return String(value).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c]; }); }

function showMiniStatus(message) {
  var box = $("miniStatus");
  if (!box) return;
  box.innerHTML = escapeHtml(String(message || "PSUF Web").split("\n")[0]);
  removeClass(box, "hidden");
  clearTimeout(showMiniStatus.timer);
  showMiniStatus.timer = setTimeout(function () { addClass(box, "hidden"); }, 4200);
}
function setStatus(message, links) {
  links = links || [];
  $("statusBox").innerHTML = escapeHtml(message);
  showMiniStatus(message);
  var box = $("commandFallback");
  box.innerHTML = "";
  if (!links.length) { addClass(box, "hidden"); return; }
  removeClass(box, "hidden");
  var p = document.createElement("p");
  p.innerHTML = escapeHtml(text("browserLimit"));
  box.appendChild(p);
  for (var i = 0; i < links.length && i < 80; i += 1) {
    var a = document.createElement("a");
    a.href = links[i]; a.target = "_blank"; a.rel = "noreferrer"; a.innerHTML = escapeHtml(links[i]);
    box.appendChild(a);
  }
}
function openModal(id) { removeClass($(id), "hidden"); }
function closeModal(id) { addClass($(id), "hidden"); }

function applyTranslations() {
  $("languageSelect").value = state.lang;
  each(document.querySelectorAll("[data-i18n]"), function (node) { node.innerHTML = escapeHtml(text(node.getAttribute("data-i18n"))); });
  $("searchInput").placeholder = state.lang === "en" ? "Search game, Title ID or version" : state.lang === "es" ? "Buscar juego, Title ID o version" : "Pesquisar jogo, Title ID ou versao";
}
function cleanIp() { return $("ipInput").value.replace(/^\s+|\s+$/g, "").replace(/^https?:\/\//, "").replace(/\/.*$/, ""); }
function ps3Url(path) { var ip = cleanIp(); if (!ip) throw new Error(text("noIp")); return "http://" + ip + path; }
function encodePath(path) { var parts = path.split("/"); for (var i = 1; i < parts.length; i += 1) parts[i] = encodeURIComponent(parts[i]); return parts.join("/"); }
function sendCommand(path, done) {
  var url; try { url = ps3Url(path); } catch (e) { setStatus(e.message); if (done) done(""); return; }
  var img = new Image(), finished = false;
  function finish() { if (finished) return; finished = true; if (done) done(url); }
  img.onload = finish; img.onerror = finish; img.src = url; setTimeout(finish, 1400);
}
function sendCommands(paths, done) {
  var urls = [], index = 0;
  function next() {
    if (index >= paths.length) { if (done) done(urls); return; }
    sendCommand(paths[index], function (url) { if (url) urls.push(url); index += 1; setTimeout(next, 130); });
  }
  next();
}
function requestText(url, done, fail) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState !== 4) return;
    if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 0) done(xhr.responseText);
    else if (fail) fail(new Error("HTTP " + xhr.status));
  };
  xhr.onerror = function () { if (fail) fail(new Error("rede")); };
  xhr.send();
}

function parsePipeRows(textValue) {
  var rows = [], lines = String(textValue || "").split(/\r?\n/);
  for (var i = 0; i < lines.length; i += 1) {
    var line = lines[i].replace(/^\s+|\s+$/g, "");
    if (line && line.charAt(0) !== "#") rows.push(line.split("|"));
  }
  return rows;
}
function titleFromNote(note) { var m = (note || "").match(/Game:\s*([^.;]+)/i) || (note || "").match(/^([^.;]{4,80})\./); return m ? m[1].replace(/^\s+|\s+$/g, "") : ""; }
function loadTitleNames(done) {
  requestText("data/titleid.txt", function (raw) {
    var lines = raw.split(/\r?\n/);
    each(lines, function (line) { var m = line.match(/^([A-Z0-9]{9})\s+(.+)$/); if (m) state.titleNames[m[1]] = m[2].replace(/^\s+|\s+$/g, ""); });
    done();
  }, done);
}
function addPatch(map, order, row, graphics) {
  var titleId = (row[0] || "").replace(/^\s+|\s+$/g, "");
  if (!titleId || titleId.charAt(0) === "#") return;
  var entry = graphics ? {
    titleId: titleId, version: row[1] || "*", game: row[2] || state.titleNames[titleId] || titleId, kind: "gfx",
    label: row[3] || "Graphics patch", status: row[4] || "", method: row[5] || "", source: row[6] || "", payload: row[7] || "", note: row[8] || "", delay: row[9] || "120"
  } : {
    titleId: titleId, version: row[1] || "*", game: state.titleNames[titleId] || titleFromNote(row[8] || "") || titleId, kind: row[2] || "fps",
    label: row[5] || "FPS patch", status: row[3] || "", method: row[4] || "", source: row[6] || "", payload: row[7] || "", note: row[8] || "", delay: row[9] || "120"
  };
  if (!entry.payload || entry.method === "none") return;
  if (!map[titleId]) { map[titleId] = { titleId: titleId, title: entry.game || titleId, fps: [], gfx: [] }; order.push(titleId); }
  if (entry.game && map[titleId].title === titleId) map[titleId].title = entry.game;
  if (graphics) map[titleId].gfx.push(entry); else map[titleId].fps.push(entry);
}
function buildGames() {
  var map = {}, order = [];
  each(parsePipeRows(state.dbTexts["patches.csv"] || ""), function (row) { addPatch(map, order, row, false); });
  each(parsePipeRows(state.dbTexts["graphics_patches.csv"] || ""), function (row) { addPatch(map, order, row, true); });
  var games = []; each(order, function (id) { games.push(map[id]); });
  games.sort(function (a, b) { return a.title.localeCompare(b.title); });
  state.games = games; renderGames();
}
function loadDbFile(index) {
  if (index >= DB_FILES.length) { buildGames(); setStatus(text("dbReady", { count: state.games.length })); return; }
  var file = DB_FILES[index], saved = localStorage.getItem("psuf.db." + file);
  if (saved) { state.dbTexts[file] = saved; loadDbFile(index + 1); return; }
  requestText("data/" + file, function (body) { state.dbTexts[file] = body; loadDbFile(index + 1); }, function () { state.dbTexts[file] = ""; loadDbFile(index + 1); });
}
function loadBundledDatabase() { setStatus(text("loadingDb")); loadTitleNames(function () { loadDbFile(0); }); }
function updateOnline() {
  setStatus(text("loadingDb"));
  var loaded = {}, index = 0;
  function next() {
    if (index >= DB_FILES.length) {
      for (var n in loaded) if (Object.prototype.hasOwnProperty.call(loaded, n)) { state.dbTexts[n] = loaded[n]; localStorage.setItem("psuf.db." + n, loaded[n]); }
      buildGames(); setStatus(text("dbUpdated", { count: state.games.length })); return;
    }
    var file = DB_FILES[index];
    requestText(RAW_BASE + file + "?t=" + new Date().getTime(), function (body) { loaded[file] = body; index += 1; next(); }, function (e) { setStatus(text("onlineFail") + file + ": " + e.message); });
  }
  next();
}
function importDatabase(file) {
  if (!window.JSZip || !window.Promise) { setStatus("Este navegador nao consegue importar PSUFDB. Use atualizar online."); return; }
  var reader = new FileReader();
  reader.onload = function () {
    JSZip.loadAsync(reader.result).then(function (zip) {
      var promises = [];
      each(DB_FILES, function (name) {
        var found = null; zip.forEach(function (path, item) { if (!found && path.slice(-name.length) === name) found = item; });
        if (!found) throw new Error("Faltou " + name);
        promises.push(found.async("string").then(function (body) { state.dbTexts[name] = body; localStorage.setItem("psuf.db." + name, body); }));
      });
      return Promise.all(promises);
    }).then(function () { buildGames(); setStatus(text("importedDb")); }).catch(function (e) { setStatus(e.message); });
  };
  reader.readAsArrayBuffer(file);
}

function parseCodes(input) {
  var out = [], lines = String(input || "").replace(/\r/g, "\n").replace(/→/g, "->").split(/[;\n]/);
  each(lines, function (raw) {
    var line = raw.replace(/^\s+|\s+$/g, "");
    if (!line || line.charAt(0) === "#") return;
    var m = line.match(/^(?:0\s+)?(?:0x)?([0-9a-fA-F]{5,8})\s+(?:[0-9a-fA-F]{2,16}\s*->\s*)?([0-9a-fA-F]{2,16})$/) || line.match(/^(?:0\s+)?(?:0x)?([0-9a-fA-F]{5,8})\s+([0-9a-fA-F]{2,16})$/);
    if (m) { var addr = m[1].toUpperCase(); while (addr.length < 8) addr = "0" + addr; out.push({ fullAddr: addr, shortAddr: addr.replace(/^0+/, "") || "0", value: m[2].toUpperCase() }); }
  });
  return out;
}
function parseOriginalValues(note) {
  var out = {}, pair = /(?:0x)?([0-9a-fA-F]{4,8})\s*=\s*(?:0x)?([0-9a-fA-F]{2,16})/g, m;
  while ((m = pair.exec(note || ""))) { var a = m[1].toUpperCase(); while (a.length < 8) a = "0" + a; out[a] = m[2].toUpperCase(); }
  return out;
}
function allPatchEntries(game) { return game ? game.fps.concat(game.gfx) : []; }
function defaultRestoreCodes(game) {
  var map = {};
  each(allPatchEntries(game), function (entry) {
    var originals = parseOriginalValues(entry.note);
    each(parseCodes(entry.payload), function (code) { if (originals[code.fullAddr]) map[code.fullAddr] = { fullAddr: code.fullAddr, shortAddr: code.shortAddr, value: originals[code.fullAddr] }; });
  });
  var keys = []; for (var k in map) if (Object.prototype.hasOwnProperty.call(map, k)) keys.push(k);
  keys.sort(); var out = []; each(keys, function (k) { out.push(map[k]); }); return out;
}
function nclLines(entry) {
  var lines = [entry.label || "PSUF Patch", entry.method === "ncl_constant" ? "1" : "0", entry.source || "PSUF Web"];
  each(String(entry.payload || "").replace(/\r/g, "").split(/[;\n]/), function (raw) { var line = raw.replace(/^\s+|\s+$/g, ""); if (line.indexOf("0 ") === 0) lines.push(line); });
  lines.push("#"); return lines;
}
function safeId(value) { return String(value || "").replace(/[^A-Za-z0-9_.-]/g, "_").slice(0, 80); }
function triggerNames(game, entry) {
  var names = {};
  function add(v) { v = safeId(v); if (v) names[v] = true; }
  add(game.titleId); add(game.title); add(String(game.title || "").replace(/\s*\[[^\]]+\]\s*/g, "").replace(/^\s+|\s+$/g, "")); if (entry) add(entry.game);
  var out = []; for (var k in names) if (Object.prototype.hasOwnProperty.call(names, k)) out.push(k); return out;
}
function ingameScript(entry, game, codes) {
  var delay = Math.max(0, Math.min(600, parseInt(entry.delay || "120", 10) || 120));
  var lines = ["# PSUF Web auto attach", "logfile /dev_hdd0/FPSU/cache/webman_ingame.log", "log PSUF Web inicio " + game.titleId, "popup PSUF Web: patch salvo. Aguarde carregar.", "/netstatus.ps3?start-ps3mapi"];
  while (delay > 0) { var part = Math.min(9, delay); lines.push("wait " + part); delay -= part; }
  lines.push("popup PSUF Web: aplicando patch.", "/ps3mapi.ps3?PROCESS%20GETCURRENTPID", "wait 1");
  for (var r = 1; r <= 3; r += 1) { each(codes, function (c) { lines.push("/setmem.ps3mapi?addr=" + c.shortAddr + "&val=" + c.value); lines.push("/patch.ps3?addr=0x" + c.fullAddr + "&val=" + c.value); }); if (r < 3) lines.push("wait 2"); }
  lines.push("log PSUF Web fim " + game.titleId); return lines;
}
function writeFileCommands(path, lines) {
  var cmds = []; each(lines, function (line, i) { cmds.push((i === 0 ? "/write.ps3" : "/write_ps3") + encodePath(path) + "&t=" + encodeURIComponent((i === 0 ? "" : "|") + line)); }); return cmds;
}
function persistentCommands(entry, game, codes) {
  var titleId = safeId(game.titleId), version = entry.version && entry.version !== "*" && entry.version !== "-" ? safeId(entry.version) : "";
  var cmds = ["/mkdir.ps3/dev_hdd0/FPSU", "/mkdir.ps3/dev_hdd0/FPSU/cache", "/mkdir.ps3/dev_hdd0/FPSU/patches", "/mkdir.ps3/dev_hdd0/FPSU/patches/USERLIST", "/mkdir.ps3/dev_hdd0/tmp/artemis", "/mkdir.ps3/dev_hdd0/tmp/wm_ingame"];
  var ncl = nclLines(entry), paths = ["/dev_hdd0/tmp/artemis/" + titleId + ".ncl", "/dev_hdd0/FPSU/patches/USERLIST/" + titleId + "_FPSU.ncl"];
  if (version) paths.push("/dev_hdd0/tmp/artemis/" + titleId + "_" + version + ".ncl");
  each(paths, function (p) { cmds = cmds.concat(writeFileCommands(p, ncl)); });
  var script = ingameScript(entry, game, codes);
  each(triggerNames(game, entry), function (t) { cmds = cmds.concat(writeFileCommands("/dev_hdd0/tmp/wm_ingame/" + t + ".bat", script)); });
  return cmds;
}
function deleteCommands(path) { var p = encodePath(path); return ["/delete.ps3" + p, "/del.ps3" + p]; }
function removePersistentCommands(game) {
  var titleId = safeId(game.titleId), seen = {}, paths = [];
  function add(p) { if (!seen[p]) { seen[p] = true; paths.push(p); } }
  add("/dev_hdd0/tmp/art.txt"); add("/dev_hdd0/tmp/art.log"); add("/dev_hdd0/tmp/artemis/" + titleId + ".ncl"); add("/dev_hdd0/FPSU/patches/USERLIST/" + titleId + "_FPSU.ncl");
  each(triggerNames(game, null), function (t) { add("/dev_hdd0/tmp/wm_ingame/" + t + ".bat"); });
  each(allPatchEntries(game), function (e) { if (e.version && e.version !== "*" && e.version !== "-") add("/dev_hdd0/tmp/artemis/" + titleId + "_" + safeId(e.version) + ".ncl"); each(triggerNames(game, e), function (t) { add("/dev_hdd0/tmp/wm_ingame/" + t + ".bat"); }); });
  var cmds = []; each(paths, function (p) { cmds = cmds.concat(deleteCommands(p)); }); return cmds;
}
function applyCodes(codes, entry, game, save) {
  if (!codes.length) { setStatus(text("noCodes")); return; }
  localStorage.setItem("psuf.ip", cleanIp()); state.lastCodes = codes; setStatus(text("applying"));
  var cmds = ["/netstatus.ps3?start-ps3mapi", "/ps3mapi.ps3?PROCESS%20GETCURRENTPID"];
  for (var r = 1; r <= 3; r += 1) each(codes, function (c) { cmds.push("/setmem.ps3mapi?addr=" + encodeURIComponent(c.shortAddr) + "&val=" + encodeURIComponent(c.value)); cmds.push("/patch.ps3?addr=0x" + encodeURIComponent(c.fullAddr) + "&val=" + encodeURIComponent(c.value)); });
  if (save && entry && game) cmds = cmds.concat(persistentCommands(entry, game, codes));
  sendCommands(cmds, function (urls) { setStatus(text("applied", { count: codes.length }) + (save ? text("saved") : ""), urls); });
}
function renderGames() {
  var q = $("searchInput").value.replace(/^\s+|\s+$/g, "").toLowerCase(), list = $("gameList"), shown = 0;
  list.innerHTML = "";
  for (var i = 0; i < state.games.length && shown < 260; i += 1) {
    var g = state.games[i], hay = (g.title + " " + g.titleId).toLowerCase();
    if (q && hay.indexOf(q) < 0) continue;
    shown += 1;
    var card = document.createElement("button");
    card.className = "game-card"; card.type = "button"; card.setAttribute("data-index", i);
    card.innerHTML = '<div class="game-mark">' + escapeHtml(g.title.slice(0, 2).toUpperCase()) + '</div><div><div class="game-title">' + escapeHtml(g.title) + '</div><div class="game-meta">' + escapeHtml(g.titleId) + '</div></div><div class="pill-row"><span class="pill">' + g.fps.length + ' FPS</span><span class="pill">' + g.gfx.length + ' GFX</span></div>';
    card.onclick = function () { openGame(state.games[parseInt(this.getAttribute("data-index"), 10)]); };
    list.appendChild(card);
  }
  $("stats").innerHTML = shown + " / " + state.games.length;
}
function openGame(game) { state.selectedGame = game; $("dialogTitle").innerHTML = escapeHtml(game.title); $("dialogMeta").innerHTML = escapeHtml(game.titleId + " | " + game.fps.length + " FPS | " + game.gfx.length + " GFX"); $("patchList").innerHTML = ""; openModal("gameDialog"); }
function renderPatchList(kind) {
  var game = state.selectedGame; if (!game) return;
  var patches = kind === "gfx" ? game.gfx : game.fps, list = $("patchList"); list.innerHTML = "";
  if (!patches.length) { list.innerHTML = escapeHtml(text("noPatch")); return; }
  each(patches, function (p, idx) {
    var card = document.createElement("div"); card.className = "patch-card";
    card.innerHTML = '<h3>' + escapeHtml(p.label) + '</h3><div class="muted">' + escapeHtml((p.version || "*") + " | " + (p.status || "") + " | " + (p.source || "")) + '</div><p>' + escapeHtml(p.note || "") + '</p><pre>' + escapeHtml(rep(p.payload, ";", "\n")) + '</pre><button class="primary wide" type="button" data-index="' + idx + '">' + escapeHtml(text("applyOpenGame")) + '</button>';
    card.getElementsByTagName("button")[0].onclick = function () { var e = patches[parseInt(this.getAttribute("data-index"), 10)]; applyCodes(parseCodes(e.payload), e, game, $("savePatchInput").checked); };
    list.appendChild(card);
  });
}
function restoreSelectedGame() {
  var game = state.selectedGame; if (!game) return;
  var codes = defaultRestoreCodes(game), cmds = [];
  if (codes.length) { cmds.push("/netstatus.ps3?start-ps3mapi"); cmds.push("/ps3mapi.ps3?PROCESS%20GETCURRENTPID"); each(codes, function (c) { cmds.push("/setmem.ps3mapi?addr=" + encodeURIComponent(c.shortAddr) + "&val=" + encodeURIComponent(c.value)); cmds.push("/patch.ps3?addr=0x" + encodeURIComponent(c.fullAddr) + "&val=" + encodeURIComponent(c.value)); }); }
  cmds = cmds.concat(removePersistentCommands(game));
  sendCommands(cmds, function (urls) { setStatus(codes.length ? text("restored", { count: codes.length }) : text("cleanNoOriginal"), urls); });
}
function exportLastPatch() {
  if (!state.lastCodes.length) { setStatus(text("noCodes")); return; }
  var lines = ["# PSUF Web patch", ""]; each(state.lastCodes, function (c) { lines.push("0x" + c.fullAddr + " " + c.value); });
  var blob = new Blob([lines.join("\n")], { type: "text/plain" }), a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = "psuf-patch.psufpatch"; a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000); setStatus(text("exportedPatch"));
}
function clampClock(v, max) { var n = parseInt(v, 10) || 50; return Math.max(50, Math.min(max, Math.round(n / 50) * 50)); }
function applyClock() {
  var gpu = clampClock($("gpuClock").value, CLOCK_MAX_GPU), vram = clampClock($("vramClock").value, CLOCK_MAX_VRAM);
  $("gpuClock").value = gpu; $("vramClock").value = vram;
  if (!confirm(text("clockConfirm", { gpu: gpu, vram: vram }))) return;
  localStorage.setItem("psuf.clock.gpu", gpu); localStorage.setItem("psuf.clock.vram", vram);
  sendCommands(["/gpuclock.ps3?" + gpu + "|" + vram], function (urls) { setStatus(text("clockSent", { gpu: gpu, vram: vram }), urls); });
}
function showHelp() { $("settingsContent").innerHTML = text("helpHtml"); }
function showDonate() { $("settingsContent").innerHTML = text("donateHtml") + '<img src="assets/pix_qr.png" alt="Pix"><img src="assets/paypal_qr.png" alt="PayPal">'; }
function setPage(page) {
  each(document.querySelectorAll(".tab"), function (tab) { removeClass(tab, "active"); if (tab.getAttribute("data-page") === page) addClass(tab, "active"); });
  each(document.querySelectorAll(".page"), function (node) { removeClass(node, "active"); });
  addClass($(page + "Page"), "active");
}
function bindEvents() {
  $("languageSelect").onchange = function () { state.lang = this.value; localStorage.setItem("psuf.lang", state.lang); applyTranslations(); renderGames(); };
  each(document.querySelectorAll(".tab"), function (b) { b.onclick = function () { setPage(this.getAttribute("data-page")); }; });
  $("ipInput").onchange = function () { localStorage.setItem("psuf.ip", cleanIp()); };
  $("autoConnectInput").onchange = function () { localStorage.setItem("psuf.auto", $("autoConnectInput").checked ? "1" : "0"); };
  $("testButton").onclick = function () { sendCommands(["/cpursx.ps3"], function (urls) { setStatus(text("connectionSent"), urls); }); };
  $("applyManualButton").onclick = function () { applyCodes(parseCodes($("manualCodes").value), null, null, $("manualSaveInput").checked); };
  $("importPatchButton").onclick = function () { $("patchFileInput").click(); }; $("exportPatchButton").onclick = exportLastPatch;
  $("importDbButton").onclick = function () { $("dbFileInput").click(); }; $("onlineUpdateButton").onclick = updateOnline; $("searchInput").oninput = renderGames;
  $("closeDialogButton").onclick = function () { closeModal("gameDialog"); }; $("fpsPatchButton").onclick = function () { renderPatchList("fps"); }; $("gfxPatchButton").onclick = function () { renderPatchList("gfx"); }; $("restoreButton").onclick = restoreSelectedGame;
  $("settingsButton").onclick = function () { openModal("settingsDialog"); }; $("closeSettingsButton").onclick = function () { closeModal("settingsDialog"); }; $("helpButton").onclick = showHelp; $("donateButton").onclick = showDonate;
  $("defaultClockButton").onclick = function () { $("gpuClock").value = CLOCK_DEFAULT_GPU; $("vramClock").value = CLOCK_DEFAULT_VRAM; }; $("applyClockButton").onclick = applyClock;
  $("dbFileInput").onchange = function () { var file = this.files && this.files[0]; if (file) importDatabase(file); this.value = ""; };
  $("patchFileInput").onchange = function () { var file = this.files && this.files[0]; if (!file) return; var reader = new FileReader(); reader.onload = function () { $("manualCodes").value = reader.result; setStatus(text("importedPatch")); }; reader.readAsText(file); this.value = ""; };
}
function init() {
  bindEvents(); $("ipInput").value = localStorage.getItem("psuf.ip") || ""; $("autoConnectInput").checked = localStorage.getItem("psuf.auto") === "1";
  $("gpuClock").value = localStorage.getItem("psuf.clock.gpu") || CLOCK_DEFAULT_GPU; $("vramClock").value = localStorage.getItem("psuf.clock.vram") || CLOCK_DEFAULT_VRAM;
  applyTranslations(); setPage("manual"); loadBundledDatabase(); if ($("autoConnectInput").checked && cleanIp()) sendCommand("/cpursx.ps3");
}
try { init(); } catch (error) { setStatus(error.message || String(error)); }
