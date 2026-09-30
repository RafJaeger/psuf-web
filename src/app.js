"use strict";

const DB_FILES = ["patches.csv", "graphics_patches.csv", "native60.csv", "fix_patches.csv"];
const RAW_BASE = "https://raw.githubusercontent.com/RafJaeger/psuf-ps3/main/release/USRDIR/";
const CLOCK_MIN = 50;
const CLOCK_STEP = 50;
const CLOCK_DEFAULT_GPU = 500;
const CLOCK_DEFAULT_VRAM = 650;
const CLOCK_MAX_GPU = 750;
const CLOCK_MAX_VRAM = 850;

const state = {
  lang: localStorage.getItem("psuf.lang") || "pt",
  games: [],
  selectedGame: null,
  lastCodes: [],
  dbTexts: {},
  titleNames: {},
};

const T = {
  pt: {
    subtitle: "Patch tool web",
    manual: "Manual",
    patches: "Patches",
    overclock: "Overclock",
    testConnection: "Testar conexao",
    autoConnect: "Conectar automaticamente",
    manualTitle: "Codigos",
    manualHint: "Use com o jogo aberto. Manual escreve direto na memoria via PS3MAPI.",
    importPatch: "Importar patch",
    exportPatch: "Exportar patch",
    saveOnPs3: "Salvar no PS3 para reaplicar quando abrir o jogo",
    applyOpenGame: "Aplicar em jogo aberto",
    database: "Banco de patches",
    importDb: "Importar PSUFDB",
    onlineUpdate: "Atualizar online",
    onlineHint: "Atualiza o banco do site usando os arquivos publicados no GitHub.",
    patchLibrary: "Lista de jogos",
    clockTitle: "webMAN / Overclock",
    clockNotice: "Overclock pode aumentar FPS, mas esquenta mais. Limite PSUF: GPU 750 / VRAM 850. HEN nao funciona overclock.",
    clockRiskShort: "Use overclock por sua conta e risco.",
    defaultClock: "Padrao 500/650",
    applyClock: "Aplicar clock",
    info: "Informacao",
    fpsPatch: "Patch FPS",
    gfxPatch: "Patches graficos",
    restoreDefault: "Restaurar padrao",
    settings: "Configuracoes",
    howToUse: "Como usar?",
    supportProject: "Apoiar projeto",
    loadingDb: "Carregando banco...",
    dbReady: "Banco carregado: {count} jogos.",
    dbUpdated: "Banco atualizado online: {count} jogos.",
    noIp: "Coloque o IP local do PS3.",
    connectionSent: "Comando enviado. Se o navegador bloquear, abra o link mostrado abaixo.",
    applying: "Aplicando codigos...",
    applied: "Aplicado: {count} codigo(s).",
    saved: " Patch salvo no PS3.",
    noCodes: "Nao achei codigo valido.",
    choosePatch: "Escolha uma opcao.",
    noPatch: "Esse jogo nao tem patch aqui.",
    browserLimit: "Se o iPhone bloquear a chamada local, abra estes links pela mesma rede do PS3:",
    importedDb: "Banco importado.",
    importedPatch: "Patch importado.",
    exportedPatch: "Patch exportado.",
    onlineFail: "Nao consegui atualizar online: ",
    clockConfirm: "USE OVERCLOCK POR SUA CONTA E RISCO.\n\nNao me responsabilizo por danos ao seu console. Fique de olho na temperatura. Esta opcao nao funciona em HEN.\n\nAplicar GPU {gpu} / VRAM {vram}?",
    clockSent: "Clock enviado: GPU {gpu} MHz | VRAM {vram} MHz.",
    helpHtml: "<h3>Como usar</h3><p>Coloque o IP local do PS3 com webMAN/PS3MAPI ativo.</p><p><b>Manual:</b> cole um ou varios codigos e aplique com o jogo aberto.</p><p><b>Patches:</b> pesquise o jogo, abra FPS ou graficos e aplique. Patch de FPS remove o limite padrao, mas nao garante 60 FPS fixos.</p><p><b>Salvar no PS3:</b> cria arquivos para tentar reaplicar o patch quando o jogo abrir.</p><p><b>Atualizar online:</b> baixa o banco novo publicado no GitHub.</p>",
    donateHtml: "<h3>Apoiar projeto</h3><p>Se quiser ajudar o PSUF, use Pix ou PayPal.</p>",
  },
  en: {
    subtitle: "Web patch tool",
    manual: "Manual",
    patches: "Patches",
    overclock: "Overclock",
    testConnection: "Test connection",
    autoConnect: "Auto connect",
    manualTitle: "Codes",
    manualHint: "Use with the game open. Manual writes directly to memory through PS3MAPI.",
    importPatch: "Import patch",
    exportPatch: "Export patch",
    saveOnPs3: "Save on PS3 to reapply when the game starts",
    applyOpenGame: "Apply in open game",
    database: "Patch database",
    importDb: "Import PSUFDB",
    onlineUpdate: "Online update",
    onlineHint: "Updates this site database using the files published on GitHub.",
    patchLibrary: "Game list",
    clockTitle: "webMAN / Overclock",
    clockNotice: "Overclock may improve FPS, but it adds heat. PSUF limit: GPU 750 / VRAM 850. HEN does not support overclock.",
    clockRiskShort: "Use overclock at your own risk.",
    defaultClock: "Default 500/650",
    applyClock: "Apply clock",
    info: "Information",
    fpsPatch: "FPS patch",
    gfxPatch: "Graphic patches",
    restoreDefault: "Restore default",
    settings: "Settings",
    howToUse: "How to use?",
    supportProject: "Support project",
    loadingDb: "Loading database...",
    dbReady: "Database loaded: {count} games.",
    dbUpdated: "Database updated online: {count} games.",
    noIp: "Enter the PS3 local IP.",
    connectionSent: "Command sent. If the browser blocks it, open the link shown below.",
    applying: "Applying codes...",
    applied: "Applied: {count} code(s).",
    saved: " Patch saved on PS3.",
    noCodes: "No valid code found.",
    choosePatch: "Choose an option.",
    noPatch: "This game has no patch here.",
    browserLimit: "If iPhone blocks the local call, open these links on the same network as the PS3:",
    importedDb: "Database imported.",
    importedPatch: "Patch imported.",
    exportedPatch: "Patch exported.",
    onlineFail: "Could not update online: ",
    clockConfirm: "USE OVERCLOCK AT YOUR OWN RISK.\n\nI am not responsible for damage to your console. Watch the temperature. This option does not work on HEN.\n\nApply GPU {gpu} / VRAM {vram}?",
    clockSent: "Clock sent: GPU {gpu} MHz | VRAM {vram} MHz.",
    helpHtml: "<h3>How to use</h3><p>Enter the PS3 local IP with webMAN/PS3MAPI enabled.</p><p><b>Manual:</b> paste one or more codes and apply with the game open.</p><p><b>Patches:</b> search a game, open FPS or graphics and apply. FPS patches remove the default cap, but do not guarantee fixed 60 FPS.</p><p><b>Save on PS3:</b> creates files to try reapplying the patch when the game starts.</p><p><b>Online update:</b> downloads the new database published on GitHub.</p>",
    donateHtml: "<h3>Support project</h3><p>If you want to support PSUF, use Pix or PayPal.</p>",
  },
  es: {
    subtitle: "Herramienta web de patches",
    manual: "Manual",
    patches: "Parches",
    overclock: "Overclock",
    testConnection: "Probar conexion",
    autoConnect: "Conectar automaticamente",
    manualTitle: "Codigos",
    manualHint: "Usa con el juego abierto. Manual escribe directo en memoria por PS3MAPI.",
    importPatch: "Importar patch",
    exportPatch: "Exportar patch",
    saveOnPs3: "Guardar en PS3 para reaplicar al abrir el juego",
    applyOpenGame: "Aplicar en juego abierto",
    database: "Banco de patches",
    importDb: "Importar PSUFDB",
    onlineUpdate: "Actualizar online",
    onlineHint: "Actualiza el banco del sitio usando los archivos publicados en GitHub.",
    patchLibrary: "Lista de juegos",
    clockTitle: "webMAN / Overclock",
    clockNotice: "El overclock puede mejorar FPS, pero calienta mas. Limite PSUF: GPU 750 / VRAM 850. HEN no permite overclock.",
    clockRiskShort: "Usa overclock bajo tu propio riesgo.",
    defaultClock: "Predeterminado 500/650",
    applyClock: "Aplicar clock",
    info: "Informacion",
    fpsPatch: "Patch FPS",
    gfxPatch: "Patches graficos",
    restoreDefault: "Restaurar predeterminado",
    settings: "Configuraciones",
    howToUse: "Como usar?",
    supportProject: "Apoyar proyecto",
    loadingDb: "Cargando banco...",
    dbReady: "Banco cargado: {count} juegos.",
    dbUpdated: "Banco actualizado online: {count} juegos.",
    noIp: "Coloca la IP local del PS3.",
    connectionSent: "Comando enviado. Si el navegador bloquea, abre el link abajo.",
    applying: "Aplicando codigos...",
    applied: "Aplicado: {count} codigo(s).",
    saved: " Patch guardado en PS3.",
    noCodes: "No encontre codigo valido.",
    choosePatch: "Elige una opcion.",
    noPatch: "Este juego no tiene patch aqui.",
    browserLimit: "Si iPhone bloquea la llamada local, abre estos links en la misma red del PS3:",
    importedDb: "Banco importado.",
    importedPatch: "Patch importado.",
    exportedPatch: "Patch exportado.",
    onlineFail: "No pude actualizar online: ",
    clockConfirm: "USA OVERCLOCK BAJO TU PROPIO RIESGO.\n\nNo me responsabilizo por danos en tu consola. Mira la temperatura. Esta opcion no funciona en HEN.\n\nAplicar GPU {gpu} / VRAM {vram}?",
    clockSent: "Clock enviado: GPU {gpu} MHz | VRAM {vram} MHz.",
    helpHtml: "<h3>Como usar</h3><p>Coloca la IP local del PS3 con webMAN/PS3MAPI activo.</p><p><b>Manual:</b> pega uno o varios codigos y aplica con el juego abierto.</p><p><b>Parches:</b> busca un juego, abre FPS o graficos y aplica. Los patches FPS quitan el limite original, pero no garantizan 60 FPS fijos.</p><p><b>Guardar en PS3:</b> crea archivos para intentar reaplicar el patch al iniciar el juego.</p><p><b>Actualizar online:</b> baja el banco nuevo publicado en GitHub.</p>",
    donateHtml: "<h3>Apoyar proyecto</h3><p>Si quieres apoyar PSUF, usa Pix o PayPal.</p>",
  },
};

const $ = (id) => document.getElementById(id);
const text = (key, vars = {}) => {
  let value = (T[state.lang] && T[state.lang][key]) || T.pt[key] || key;
  for (const [name, replacement] of Object.entries(vars)) {
    value = value.replaceAll(`{${name}}`, String(replacement));
  }
  return value;
};

function setStatus(message, links = []) {
  $("statusBox").textContent = message;
  const box = $("commandFallback");
  box.innerHTML = "";
  box.classList.toggle("hidden", links.length === 0);
  if (links.length) {
    const p = document.createElement("p");
    p.textContent = text("browserLimit");
    box.appendChild(p);
    links.slice(0, 80).forEach((url) => {
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.rel = "noreferrer";
      a.textContent = url;
      box.appendChild(a);
    });
  }
}

function applyTranslations() {
  document.documentElement.lang = state.lang === "pt" ? "pt-BR" : state.lang;
  $("languageSelect").value = state.lang;
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = text(node.dataset.i18n);
  });
  $("searchInput").placeholder = state.lang === "en" ? "Search game, Title ID or version" :
    state.lang === "es" ? "Buscar juego, Title ID o version" :
    "Pesquisar jogo, Title ID ou versao";
}

function cleanIp() {
  return $("ipInput").value.trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
}

function ps3Url(path) {
  const ip = cleanIp();
  if (!ip) throw new Error(text("noIp"));
  return `http://${ip}${path}`;
}

function encodePath(path) {
  return path.split("/").map((part, index) => index === 0 ? part : encodeURIComponent(part)).join("/");
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sendCommand(path) {
  const url = ps3Url(path);
  return new Promise((resolve) => {
    const img = new Image();
    const done = () => {
      img.onload = null;
      img.onerror = null;
      resolve(url);
    };
    img.onload = done;
    img.onerror = done;
    img.src = url;
    setTimeout(done, 1400);
  });
}

async function sendCommands(paths, gap = 130) {
  const urls = [];
  for (const path of paths) {
    urls.push(await sendCommand(path));
    await wait(gap);
  }
  return urls;
}

function parsePipeRows(textValue) {
  return textValue.split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => line.split("|"));
}

function titleFromNote(note) {
  if (!note) return "";
  const match = note.match(/Game:\s*([^.;]+)/i) || note.match(/^([^.;]{4,80})\./);
  return match ? match[1].trim() : "";
}

async function loadTitleNames() {
  const raw = await fetch("data/titleid.txt").then((r) => r.text());
  raw.split(/\r?\n/).forEach((line) => {
    const match = line.match(/^([A-Z0-9]{9})\s+(.+)$/);
    if (match) state.titleNames[match[1]] = match[2].trim();
  });
}

function addPatch(map, row, graphics) {
  const titleId = (row[0] || "").trim();
  const version = (row[1] || "*").trim();
  if (!titleId || titleId.startsWith("#")) return;
  const gameName = graphics ? (row[2] || "").trim() : "";
  const entry = graphics ? {
    titleId,
    version,
    game: gameName || state.titleNames[titleId] || titleId,
    kind: "gfx",
    status: row[4] || "",
    method: row[5] || "",
    label: row[3] || "Graphics patch",
    source: row[6] || "",
    payload: row[7] || "",
    note: row[8] || "",
    delay: row[9] || "120",
  } : {
    titleId,
    version,
    game: state.titleNames[titleId] || titleFromNote(row[8] || "") || titleId,
    kind: row[2] || "fps",
    status: row[3] || "",
    method: row[4] || "",
    label: row[5] || "FPS patch",
    source: row[6] || "",
    payload: row[7] || "",
    note: row[8] || "",
    delay: row[9] || "120",
  };
  if (!entry.payload || entry.method === "none") return;
  const key = titleId;
  if (!map.has(key)) {
    map.set(key, {
      titleId,
      title: entry.game || state.titleNames[titleId] || titleId,
      fps: [],
      gfx: [],
    });
  }
  const game = map.get(key);
  if (entry.game && game.title === titleId) game.title = entry.game;
  if (graphics) game.gfx.push(entry); else game.fps.push(entry);
}

function buildGames() {
  const map = new Map();
  for (const row of parsePipeRows(state.dbTexts["patches.csv"] || "")) addPatch(map, row, false);
  for (const row of parsePipeRows(state.dbTexts["graphics_patches.csv"] || "")) addPatch(map, row, true);
  state.games = [...map.values()].sort((a, b) => a.title.localeCompare(b.title));
  renderGames();
}

async function loadBundledDatabase() {
  setStatus(text("loadingDb"));
  await loadTitleNames();
  for (const file of DB_FILES) {
    const saved = localStorage.getItem(`psuf.db.${file}`);
    state.dbTexts[file] = saved || await fetch(`data/${file}`).then((r) => r.text());
  }
  buildGames();
  setStatus(text("dbReady", { count: state.games.length }));
}

async function updateOnline() {
  try {
    setStatus(text("loadingDb"));
    for (const file of DB_FILES) {
      const response = await fetch(`${RAW_BASE}${file}?t=${Date.now()}`, { cache: "no-store" });
      if (!response.ok) throw new Error(`${file}: HTTP ${response.status}`);
      const body = await response.text();
      if (!body.includes("|") && file.endsWith(".csv")) throw new Error(`${file}: arquivo invalido`);
      state.dbTexts[file] = body;
      localStorage.setItem(`psuf.db.${file}`, body);
    }
    buildGames();
    setStatus(text("dbUpdated", { count: state.games.length }));
  } catch (error) {
    setStatus(text("onlineFail") + error.message);
  }
}

async function importDatabase(file) {
  if (!window.JSZip) {
    setStatus("JSZip nao carregou.");
    return;
  }
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  for (const name of DB_FILES) {
    const item = Object.values(zip.files).find((entry) => entry.name.endsWith(name));
    if (!item) throw new Error(`Faltou ${name}`);
    const body = await item.async("string");
    state.dbTexts[name] = body;
    localStorage.setItem(`psuf.db.${name}`, body);
  }
  buildGames();
  setStatus(text("importedDb"));
}

function parseCodes(input) {
  const out = [];
  const source = input.replace(/\r/g, "\n").replace(/→/g, "->").split(/[;\n]/);
  for (const raw of source) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    let match = line.match(/^(?:0\s+)?(?:0x)?([0-9a-fA-F]{5,8})\s+(?:[0-9a-fA-F]{2,16}\s*->\s*)?([0-9a-fA-F]{2,16})$/);
    if (!match) match = line.match(/^(?:0\s+)?(?:0x)?([0-9a-fA-F]{5,8})\s+([0-9a-fA-F]{2,16})$/);
    if (match) {
      const addr = match[1].toUpperCase().padStart(8, "0");
      const value = match[2].toUpperCase();
      out.push({ fullAddr: addr, shortAddr: addr.replace(/^0+/, "") || "0", value });
    }
  }
  return out;
}

function nclLines(entry) {
  const lines = [entry.label || "PSUF Patch", entry.method === "ncl_constant" ? "1" : "0", entry.source || "PSUF Web"];
  for (const raw of entry.payload.replace(/\r/g, "").split(/[;\n]/)) {
    const line = raw.trim();
    if (line.startsWith("0 ")) lines.push(line);
  }
  lines.push("#");
  return lines;
}

function safeId(value) {
  return String(value || "").replace(/[^A-Za-z0-9_.-]/g, "_").slice(0, 80);
}

function triggerNames(game, entry) {
  const names = new Set([game.titleId]);
  const title = game.title || "";
  if (title) {
    names.add(title);
    names.add(title.replace(/\s*\[[^\]]+\]\s*/g, "").trim());
  }
  if (entry && entry.game) names.add(entry.game);
  return [...names].filter(Boolean).map(safeId);
}

function ingameScript(entry, game, codes) {
  const delay = Math.max(0, Math.min(600, parseInt(entry.delay || "120", 10) || 120));
  const lines = [
    "# PSUF Web auto attach",
    "logfile /dev_hdd0/FPSU/cache/webman_ingame.log",
    `log PSUF Web inicio ${game.titleId}`,
    "popup PSUF Web: patch salvo. Aguarde carregar.",
    "/netstatus.ps3?start-ps3mapi",
  ];
  let left = delay;
  while (left > 0) {
    const part = Math.min(9, left);
    lines.push(`wait ${part}`);
    left -= part;
  }
  lines.push("popup PSUF Web: aplicando patch.", "/ps3mapi.ps3?PROCESS%20GETCURRENTPID", "wait 1");
  for (let round = 1; round <= 3; round += 1) {
    for (const code of codes) {
      lines.push(`/setmem.ps3mapi?addr=${code.shortAddr}&val=${code.value}`);
      lines.push(`/patch.ps3?addr=0x${code.fullAddr}&val=${code.value}`);
    }
    if (round < 3) lines.push("wait 2");
  }
  lines.push(`log PSUF Web fim ${game.titleId}`);
  return lines;
}

function writeFileCommands(path, lines) {
  const commands = [];
  lines.forEach((line, index) => {
    const command = index === 0 ? "/write.ps3" : "/write_ps3";
    const textLine = index === 0 ? line : `|${line}`;
    commands.push(`${command}${encodePath(path)}&t=${encodeURIComponent(textLine)}`);
  });
  return commands;
}

function persistentCommands(entry, game, codes) {
  const titleId = safeId(game.titleId);
  const version = entry.version && !["*", "-"].includes(entry.version) ? safeId(entry.version) : "";
  const commands = [
    "/mkdir.ps3/dev_hdd0/FPSU",
    "/mkdir.ps3/dev_hdd0/FPSU/cache",
    "/mkdir.ps3/dev_hdd0/FPSU/patches",
    "/mkdir.ps3/dev_hdd0/FPSU/patches/USERLIST",
    "/mkdir.ps3/dev_hdd0/tmp/artemis",
    "/mkdir.ps3/dev_hdd0/tmp/wm_ingame",
  ];
  const ncl = nclLines(entry);
  [`/dev_hdd0/tmp/artemis/${titleId}.ncl`, version ? `/dev_hdd0/tmp/artemis/${titleId}_${version}.ncl` : "", `/dev_hdd0/FPSU/patches/USERLIST/${titleId}_FPSU.ncl`]
    .filter(Boolean)
    .forEach((path) => commands.push(...writeFileCommands(path, ncl)));
  const script = ingameScript(entry, game, codes);
  triggerNames(game, entry).forEach((trigger) => {
    commands.push(...writeFileCommands(`/dev_hdd0/tmp/wm_ingame/${trigger}.bat`, script));
  });
  return commands;
}

async function applyCodes(codes, entry = null, game = null, save = false) {
  if (!codes.length) {
    setStatus(text("noCodes"));
    return;
  }
  localStorage.setItem("psuf.ip", cleanIp());
  state.lastCodes = codes;
  setStatus(text("applying"));
  const commands = ["/netstatus.ps3?start-ps3mapi", "/ps3mapi.ps3?PROCESS%20GETCURRENTPID"];
  for (let round = 1; round <= 3; round += 1) {
    codes.forEach((code) => {
      commands.push(`/setmem.ps3mapi?addr=${encodeURIComponent(code.shortAddr)}&val=${encodeURIComponent(code.value)}`);
      commands.push(`/patch.ps3?addr=0x${encodeURIComponent(code.fullAddr)}&val=${encodeURIComponent(code.value)}`);
    });
  }
  if (save && entry && game) commands.push(...persistentCommands(entry, game, codes));
  const urls = await sendCommands(commands);
  setStatus(text("applied", { count: codes.length }) + (save ? text("saved") : ""), urls);
}

function renderGames() {
  const query = $("searchInput").value.trim().toLowerCase();
  const list = $("gameList");
  list.innerHTML = "";
  const games = state.games.filter((game) => {
    const haystack = `${game.title} ${game.titleId} ${game.fps.map(p => p.version).join(" ")} ${game.gfx.map(p => p.version).join(" ")}`.toLowerCase();
    return !query || haystack.includes(query);
  }).slice(0, 260);
  $("stats").textContent = `${games.length} / ${state.games.length}`;
  games.forEach((game) => {
    const card = document.createElement("button");
    card.className = "game-card";
    card.type = "button";
    card.innerHTML = `
      <div class="game-mark">${game.title.slice(0, 2).toUpperCase()}</div>
      <div>
        <div class="game-title">${escapeHtml(game.title)}</div>
        <div class="game-meta">${game.titleId}</div>
      </div>
      <div class="pill-row">
        <span class="pill">${game.fps.length} FPS</span>
        <span class="pill">${game.gfx.length} GFX</span>
      </div>`;
    card.addEventListener("click", () => openGame(game));
    list.appendChild(card);
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char]));
}

function openGame(game) {
  state.selectedGame = game;
  $("dialogTitle").textContent = game.title;
  $("dialogMeta").textContent = `${game.titleId} | ${game.fps.length} FPS | ${game.gfx.length} GFX`;
  $("patchList").innerHTML = "";
  $("gameDialog").showModal();
}

function renderPatchList(kind) {
  const game = state.selectedGame;
  if (!game) return;
  const patches = kind === "gfx" ? game.gfx : game.fps;
  const list = $("patchList");
  list.innerHTML = "";
  if (!patches.length) {
    list.textContent = text("noPatch");
    return;
  }
  patches.forEach((patch) => {
    const card = document.createElement("div");
    card.className = "patch-card";
    card.innerHTML = `
      <h3>${escapeHtml(patch.label)}</h3>
      <div class="muted">${escapeHtml(patch.version || "*")} | ${escapeHtml(patch.status || "")} | ${escapeHtml(patch.source || "")}</div>
      <p>${escapeHtml(patch.note || "")}</p>
      <pre>${escapeHtml(patch.payload.replaceAll(";", "\n"))}</pre>
      <button class="primary wide" type="button">${text("applyOpenGame")}</button>`;
    card.querySelector("button").addEventListener("click", () => {
      applyCodes(parseCodes(patch.payload), patch, game, $("savePatchInput").checked);
    });
    list.appendChild(card);
  });
}

async function restoreSelectedGame() {
  const game = state.selectedGame;
  if (!game) return;
  const titleId = safeId(game.titleId);
  const commands = [
    "/delete.ps3/dev_hdd0/tmp/art.txt",
    "/delete.ps3/dev_hdd0/tmp/art.log",
    `/delete.ps3/dev_hdd0/tmp/artemis/${titleId}.ncl`,
    `/delete.ps3/dev_hdd0/FPSU/patches/USERLIST/${titleId}_FPSU.ncl`,
  ];
  triggerNames(game, null).forEach((trigger) => commands.push(`/delete.ps3/dev_hdd0/tmp/wm_ingame/${trigger}.bat`));
  const urls = await sendCommands(commands);
  setStatus("Restore enviado.", urls);
}

function exportLastPatch() {
  if (!state.lastCodes.length) {
    setStatus(text("noCodes"));
    return;
  }
  const body = ["# PSUF Web patch", "", ...state.lastCodes.map((code) => `0x${code.fullAddr} ${code.value}`)].join("\n");
  const blob = new Blob([body], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "psuf-patch.psufpatch";
  a.click();
  URL.revokeObjectURL(a.href);
  setStatus(text("exportedPatch"));
}

function clampClock(value, max) {
  const parsed = parseInt(value, 10) || CLOCK_MIN;
  return Math.max(CLOCK_MIN, Math.min(max, Math.round(parsed / CLOCK_STEP) * CLOCK_STEP));
}

async function applyClock() {
  const gpu = clampClock($("gpuClock").value, CLOCK_MAX_GPU);
  const vram = clampClock($("vramClock").value, CLOCK_MAX_VRAM);
  $("gpuClock").value = gpu;
  $("vramClock").value = vram;
  if (!confirm(text("clockConfirm", { gpu, vram }))) return;
  localStorage.setItem("psuf.clock.gpu", String(gpu));
  localStorage.setItem("psuf.clock.vram", String(vram));
  const urls = await sendCommands([`/gpuclock.ps3?${gpu}|${vram}`]);
  setStatus(text("clockSent", { gpu, vram }), urls);
}

function showHelp() {
  $("settingsContent").innerHTML = text("helpHtml");
}

function showDonate() {
  $("settingsContent").innerHTML = `${text("donateHtml")}<img src="assets/pix_qr.png" alt="Pix"><img src="assets/paypal_qr.png" alt="PayPal">`;
}

function bindEvents() {
  $("languageSelect").addEventListener("change", (event) => {
    state.lang = event.target.value;
    localStorage.setItem("psuf.lang", state.lang);
    applyTranslations();
    renderGames();
  });
  document.querySelectorAll(".tab").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((tab) => tab.classList.remove("active"));
      document.querySelectorAll(".page").forEach((page) => page.classList.remove("active"));
      button.classList.add("active");
      $(`${button.dataset.page}Page`).classList.add("active");
    });
  });
  $("ipInput").addEventListener("change", () => localStorage.setItem("psuf.ip", cleanIp()));
  $("autoConnectInput").addEventListener("change", () => localStorage.setItem("psuf.auto", $("autoConnectInput").checked ? "1" : "0"));
  $("testButton").addEventListener("click", async () => setStatus(text("connectionSent"), await sendCommands(["/cpursx.ps3"])));
  $("applyManualButton").addEventListener("click", () => applyCodes(parseCodes($("manualCodes").value), null, null, $("manualSaveInput").checked));
  $("importPatchButton").addEventListener("click", () => $("patchFileInput").click());
  $("exportPatchButton").addEventListener("click", exportLastPatch);
  $("importDbButton").addEventListener("click", () => $("dbFileInput").click());
  $("onlineUpdateButton").addEventListener("click", updateOnline);
  $("searchInput").addEventListener("input", renderGames);
  $("closeDialogButton").addEventListener("click", () => $("gameDialog").close());
  $("fpsPatchButton").addEventListener("click", () => renderPatchList("fps"));
  $("gfxPatchButton").addEventListener("click", () => renderPatchList("gfx"));
  $("restoreButton").addEventListener("click", restoreSelectedGame);
  $("settingsButton").addEventListener("click", () => $("settingsDialog").showModal());
  $("closeSettingsButton").addEventListener("click", () => $("settingsDialog").close());
  $("helpButton").addEventListener("click", showHelp);
  $("donateButton").addEventListener("click", showDonate);
  $("defaultClockButton").addEventListener("click", () => {
    $("gpuClock").value = CLOCK_DEFAULT_GPU;
    $("vramClock").value = CLOCK_DEFAULT_VRAM;
  });
  $("applyClockButton").addEventListener("click", applyClock);
  $("dbFileInput").addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (file) {
      try { await importDatabase(file); } catch (error) { setStatus(error.message); }
    }
    event.target.value = "";
  });
  $("patchFileInput").addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (file) {
      $("manualCodes").value = await file.text();
      setStatus(text("importedPatch"));
    }
    event.target.value = "";
  });
}

async function init() {
  bindEvents();
  $("ipInput").value = localStorage.getItem("psuf.ip") || "";
  $("autoConnectInput").checked = localStorage.getItem("psuf.auto") === "1";
  $("gpuClock").value = localStorage.getItem("psuf.clock.gpu") || CLOCK_DEFAULT_GPU;
  $("vramClock").value = localStorage.getItem("psuf.clock.vram") || CLOCK_DEFAULT_VRAM;
  applyTranslations();
  await loadBundledDatabase();
  if ($("autoConnectInput").checked && cleanIp()) sendCommand("/cpursx.ps3");
}

init().catch((error) => setStatus(error.message));
