#!/usr/bin/env node
/**
 * scan-games.js
 * Scans game directories and emulator ROM folders, then writes js/game-catalog.json.
 */

const fs   = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const ROOT = path.resolve(__dirname, '..');

const KNOWN_SOURCES = [
  { id: 'monkeygg2', name: 'MonkeyGG2', gamesDir: 'games/monkeygg2/games' },
  { id: '3kh0',      name: '3kh0',      gamesDir: 'games/3kh0/projects' },
  { id: 'seraph',    name: 'Seraph',    gamesDir: 'games/seraph/games' },
  { id: 'seraph-apps', name: 'Seraph Apps', gamesDir: 'games/seraph/apps' },
  { id: 'selenite',  name: 'Selenite',  gamesDir: 'games/selenite' },
  { id: 'mecvg',     name: 'MecVG',     gamesDir: 'games/mecvg/projects' },
  { id: 'phexus-v',  name: 'Phexus-V',  gamesDir: 'games/phexus/Vafor_IT' },
  { id: 'phexus-g',  name: 'Phexus-G',  gamesDir: 'games/phexus/gxmes' },
  { id: 't9lat',     name: 'T9lat',     gamesDir: 'games/t9lat' },
  { id: 'tharun',    name: 'Tharun',    gamesDir: 'games/tharun/gameFiles' },
  { id: 'kazwire',   name: 'Kazwire',   gamesDir: 'games/kazwire/static/game' },
  { id: 'mocvg',     name: 'MocVG-2',   gamesDir: 'games/mocvg/projects' },
  { id: 'gfiles',    name: 'GFiles',    gamesDir: 'games/gfiles/gfiles/html5' },
  { id: 'lukicenturi', name: 'Lukicenturi', gamesDir: 'games/lukicenturi' },
  { id: 'polaris',   name: 'Polaris',   gamesDir: 'games/polaris' },
  { id: 'radon',     name: 'Radon',     gamesDir: 'games/radon/html' },
  { id: 'truffled',  name: 'Truffled',  gamesDir: 'games/truffled/public/games' },
  { id: 'illuminate', name: 'Illuminate', gamesDir: 'games/illuminate' },
  { id: 'ogcoders',  name: 'OGCoders',  gamesDir: 'games/ogcoders/unblocked' },
  { id: 'p0xx',      name: 'P0XX',      gamesDir: 'games/p0xx/g/games' },
  { id: 'html5games', name: 'HTML5Games', gamesDir: 'games/html5games' },
  { id: 'gams',      name: 'Gams',      gamesDir: 'games/gams/g' },
];

const THUMB_NAMES = ['icon.png', 'thumb.png', 'preview.png', 'screenshot.png', 'logo.png'];

const ROM_EXTENSIONS = {
  '.nes': 'nes',
  '.sfc': 'snes',  '.smc': 'snes',
  '.gb':  'gbc',   '.gbc': 'gbc',
  '.gba': 'gba',
  '.z64': 'n64',   '.n64': 'n64',  '.v64': 'n64',
  '.nds': 'nds',
  '.md':  'genesis', '.bin': 'genesis', '.gen': 'genesis',
  '.pbp': 'psx',   '.chd': 'psx',
};

const SYSTEM_META = {
  nes:     { core: 'nes',     name: 'NES' },
  snes:    { core: 'snes',    name: 'SNES' },
  gbc:     { core: 'gbc',     name: 'GBC' },
  gba:     { core: 'gba',     name: 'GBA' },
  n64:     { core: 'n64',     name: 'N64' },
  nds:     { core: 'nds',     name: 'NDS' },
  genesis: { core: 'genesis', name: 'Genesis' },
  psx:     { core: 'psx',     name: 'PSX' },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Check if a path exists and is a directory. */
function isDir(p) {
  try { return fs.statSync(p).isDirectory(); } catch { return false; }
}

/** Check if a file exists. */
function fileExists(p) {
  try { return fs.statSync(p).isFile(); } catch { return false; }
}

/** Convert a slug like "my-cool-game_2" to "My Cool Game 2" */
function slugToName(slug) {
  return slug
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

/** Directories / files to skip when scanning for games */
const SKIP_DIRS = new Set([
  'node_modules', '.git', 'css', 'js', 'img', 'imgs', 'images', 'fonts',
  'assets', 'emulatorjs', 'emulatorJS', 'ruffle', 'webretro', 'n64-template',
  'gba', 'turbowarp', 'scripts', '.github', 'json',
  'data', 'data2', 'data3', 'misc', 'flash', 'retro', 'resources', 'uv',
]);

/** Recursively find subdirectories that contain an index.html file. */
function findGameDirs(baseDir, depth) {
  if (depth === undefined) depth = 0;
  const results = [];
  if (!isDir(baseDir)) return results;
  if (depth > 3) return results;  // prevent infinite recursion

  let entries;
  try { entries = fs.readdirSync(baseDir, { withFileTypes: true }); } catch { return results; }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (SKIP_DIRS.has(entry.name)) continue;
    const subDir = path.join(baseDir, entry.name);
    const indexPath = path.join(subDir, 'index.html');
    if (fileExists(indexPath)) {
      results.push({ dir: subDir, slug: entry.name });
    } else {
      // Go deeper (some repos nest games inside categories)
      const deeper = findGameDirs(subDir, depth + 1);
      results.push(...deeper);
    }
  }
  return results;
}

/** Find standalone game HTML files (not index.html) in a directory. */
function findGameHtmlFiles(baseDir) {
  const results = [];
  if (!isDir(baseDir)) return results;

  let entries;
  try { entries = fs.readdirSync(baseDir, { withFileTypes: true }); } catch { return results; }

  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (!entry.name.endsWith('.html')) continue;
    if (entry.name === 'index.html' || entry.name === '404.html') continue;
    const slug = entry.name.replace('.html', '');
    results.push({
      dir: baseDir,
      slug,
      htmlFile: entry.name,
    });
  }
  return results;
}

/** Find a thumbnail in a game directory. Returns relative path or null. */
function findThumb(gameDir) {
  for (const t of THUMB_NAMES) {
    if (fileExists(path.join(gameDir, t))) {
      return path.relative(ROOT, path.join(gameDir, t)).replace(/\\/g, '/');
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Discover additional sources under games/
// ---------------------------------------------------------------------------

function discoverSources() {
  const sources = [...KNOWN_SOURCES];
  const knownIds = new Set(sources.map(s => s.id));
  const gamesRoot = path.join(ROOT, 'games');

  if (!isDir(gamesRoot)) return sources;

  for (const entry of fs.readdirSync(gamesRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (knownIds.has(entry.name)) continue;
    // Skip gn-math directories (handled by special scanner)
    if (entry.name.startsWith('gnmath')) continue;

    // Try common sub-directory names
    const candidates = ['games', 'projects', 'apps', '.'];
    for (const sub of candidates) {
      const candidate = sub === '.'
        ? path.join(gamesRoot, entry.name)
        : path.join(gamesRoot, entry.name, sub);
      if (isDir(candidate)) {
        const relPath = path.relative(ROOT, candidate).replace(/\\/g, '/');
        sources.push({
          id: entry.name,
          name: entry.name,
          gamesDir: relPath,
        });
        knownIds.add(entry.name);
        break;
      }
    }
  }

  return sources;
}

// ---------------------------------------------------------------------------
// Scan emulator ROMs
// ---------------------------------------------------------------------------

function scanRoms() {
  const romsDir = path.join(ROOT, 'emulators', 'roms');
  const romsBySys = {};

  if (!isDir(romsDir)) return [];

  // Walk every file inside emulators/roms/
  function walk(dir) {
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) { walk(full); continue; }
      const ext = path.extname(entry.name).toLowerCase();
      const system = ROM_EXTENSIONS[ext];
      if (!system) continue;
      if (!romsBySys[system]) romsBySys[system] = [];
      romsBySys[system].push({
        file: path.relative(ROOT, full).replace(/\\/g, '/'),
        name: path.basename(entry.name, ext).replace(/[-_]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      });
    }
  }
  walk(romsDir);

  // Build sorted array
  return Object.keys(SYSTEM_META).map(sys => ({
    system: sys,
    core: SYSTEM_META[sys].core,
    name: SYSTEM_META[sys].name,
    roms: (romsBySys[sys] || []).sort((a, b) => a.name.localeCompare(b.name)),
  }));
}

// ---------------------------------------------------------------------------
// Scan Gn-MATH (special: numbered .html files + zones.json manifest)
// ---------------------------------------------------------------------------

function scanGnMath(seenSlugs) {
  const htmlDir   = path.join(ROOT, 'games', 'gnmath-html');
  const assetsDir = path.join(ROOT, 'games', 'gnmath-assets');
  const coversDir = path.join(ROOT, 'games', 'gnmath-covers');

  if (!isDir(htmlDir)) return null;

  // Try to load zones.json for name mapping
  let zones = [];
  const zonesPath = path.join(assetsDir, 'zones.json');
  if (fileExists(zonesPath)) {
    try { zones = JSON.parse(fs.readFileSync(zonesPath, 'utf-8')); } catch {}
  }

  // Build id->zone lookup
  const zoneById = {};
  // Build filename->zone lookup from url field (e.g., "{HTML_URL}/1-fde.html" -> zone)
  const zoneByFile = {};
  for (const z of zones) {
    if (z.id !== undefined) zoneById[String(z.id)] = z;
    if (z.url) {
      const m = z.url.match(/\{HTML_URL\}\/(.+\.html)$/);
      if (m) zoneByFile[m[1]] = z;
    }
  }

  // Scan all .html files in gnmath-html
  const games = [];
  let entries;
  try { entries = fs.readdirSync(htmlDir); } catch { return null; }

  for (const file of entries) {
    if (!file.endsWith('.html')) continue;

    // Match by filename first (most accurate), then by numeric id
    const zone = zoneByFile[file] || zoneById[file.replace('.html', '').replace(/-.*$/, '')];
    // Skip non-game entries (id -1 is discord link, [!] entries are meta)
    if (zone && zone.id < 0) continue;
    if (zone && zone.name && zone.name.startsWith('[!]')) continue;
    const gameName = zone ? zone.name : slugToName(file.replace('.html', ''));
    const slug = gameName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const normalSlug = gameName.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (seenSlugs.has(normalSlug)) continue;
    seenSlugs.add(normalSlug);

    const relPath = path.relative(ROOT, path.join(htmlDir, file)).replace(/\\/g, '/');

    // Check for cover image (use zone id for cover filename)
    let thumb = null;
    if (isDir(coversDir) && zone) {
      const coverId = String(zone.id);
      const coverPng = path.join(coversDir, coverId + '.png');
      const coverGif = path.join(coversDir, coverId + '.gif');
      if (fileExists(coverPng)) {
        thumb = path.relative(ROOT, coverPng).replace(/\\/g, '/');
      } else if (fileExists(coverGif)) {
        thumb = path.relative(ROOT, coverGif).replace(/\\/g, '/');
      }
    }

    games.push({
      slug,
      name: gameName,
      path: relPath,
      tags: zone && zone.special ? [zone.special] : [],
      thumb,
    });
  }

  // Also scan asset game directories (multi-file games)
  if (isDir(assetsDir)) {
    let assetEntries;
    try { assetEntries = fs.readdirSync(assetsDir, { withFileTypes: true }); } catch { assetEntries = []; }
    for (const entry of assetEntries) {
      if (!entry.isDirectory()) continue;
      if (entry.name === '.git' || entry.name === '.vscode' || entry.name === 'misc') continue;
      const subDir = path.join(assetsDir, entry.name);
      const indexPath = path.join(subDir, 'index.html');
      if (!fileExists(indexPath)) continue;

      const zone = zoneById[entry.name];
      const gameName = zone ? zone.name : slugToName(entry.name);
      const normalSlug = gameName.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (seenSlugs.has(normalSlug)) continue;
      seenSlugs.add(normalSlug);

      const relIndex = path.relative(ROOT, indexPath).replace(/\\/g, '/');
      let thumb = null;
      if (isDir(coversDir)) {
        const coverPng = path.join(coversDir, entry.name + '.png');
        if (fileExists(coverPng)) thumb = path.relative(ROOT, coverPng).replace(/\\/g, '/');
      }

      games.push({
        slug: entry.name,
        name: gameName,
        path: relIndex,
        tags: zone && zone.special ? [zone.special] : [],
        thumb,
      });
    }
  }

  games.sort((a, b) => a.name.localeCompare(b.name));
  return {
    id: 'gnmath',
    name: 'Gn-MATH',
    basePath: 'games/gnmath-html',
    games,
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  console.log('scan-games.js  --  Null Testament game catalog generator');
  console.log('=========================================================\n');

  const seenSlugs = new Set();  // normalized lowercase alphanum only for dedup
  const sources = discoverSources();
  const catalogSources = [];
  let totalGames = 0;

  for (const src of sources) {
    const absDir = path.join(ROOT, src.gamesDir);
    console.log(`[scan] Source "${src.name}" -> ${src.gamesDir}`);

    const gameDirs = findGameDirs(absDir);
    const htmlFiles = findGameHtmlFiles(absDir);
    const games = [];

    for (const { dir, slug } of gameDirs) {
      const normalSlug = slug.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (seenSlugs.has(normalSlug)) {
        continue;
      }
      seenSlugs.add(normalSlug);

      const relIndex = path.relative(ROOT, path.join(dir, 'index.html')).replace(/\\/g, '/');
      const thumb = findThumb(dir);

      games.push({
        slug,
        name: slugToName(slug),
        path: relIndex,
        tags: [],
        thumb,
      });
    }

    // Also scan standalone HTML game files
    for (const { slug, htmlFile } of htmlFiles) {
      const normalSlug = slug.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (seenSlugs.has(normalSlug)) continue;
      seenSlugs.add(normalSlug);

      const relPath = path.relative(ROOT, path.join(absDir, htmlFile)).replace(/\\/g, '/');
      games.push({
        slug,
        name: slugToName(slug),
        path: relPath,
        tags: [],
        thumb: null,
      });
    }

    games.sort((a, b) => a.name.localeCompare(b.name));
    totalGames += games.length;

    if (games.length > 0) {
      catalogSources.push({
        id: src.id,
        name: src.name,
        basePath: src.gamesDir,
        games,
      });
    }

    console.log(`       found ${games.length} game(s)\n`);
  }

  // Gn-MATH special scan
  console.log('[scan] Source "Gn-MATH" -> games/gnmath-html + games/gnmath-assets');
  const gnmathResult = scanGnMath(seenSlugs);
  if (gnmathResult && gnmathResult.games.length > 0) {
    totalGames += gnmathResult.games.length;
    catalogSources.push(gnmathResult);
    console.log(`       found ${gnmathResult.games.length} game(s)\n`);
  } else {
    console.log('       skipped (not found)\n');
  }

  // Emulator ROMs
  console.log('[scan] Scanning emulator ROMs...');
  const emulatorRoms = scanRoms();
  const totalRoms = emulatorRoms.reduce((n, s) => n + s.roms.length, 0);
  console.log(`       found ${totalRoms} ROM(s) across ${emulatorRoms.filter(s => s.roms.length > 0).length} system(s)\n`);

  // Build catalog
  const catalog = {
    version: 1,
    generated: new Date().toISOString().slice(0, 10),
    totalGames,
    sources: catalogSources,
    emulatorRoms,
  };

  // Write output — JSON for fetch, JS for file:// protocol
  const jsonStr = JSON.stringify(catalog, null, 2);
  const outPath = path.join(ROOT, 'js', 'game-catalog.json');
  const outJsPath = path.join(ROOT, 'js', 'game-catalog-data.js');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, jsonStr, 'utf-8');
  fs.writeFileSync(outJsPath, 'window.__NT_CATALOG=' + JSON.stringify(catalog) + ';', 'utf-8');

  console.log('=========================================================');
  console.log(`Catalog written to js/game-catalog.json`);
  console.log(`  Total sources : ${catalogSources.length}`);
  console.log(`  Total games   : ${totalGames}`);
  console.log(`  Total ROMs    : ${totalRoms}`);
  console.log('=========================================================');
}

main();
