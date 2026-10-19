// Шифрует уроки и медиа из папки source/ в папку vault/ (её и публикуем).
// Запуск: node tools/build.mjs
// Пароли и ключи — в source/secrets.json (создаётся при первом запуске, на сайт не попадает).
import { webcrypto as wc, randomBytes, randomInt, createHash, createHmac } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const SRC = path.join(ROOT, "source");
const VAULT = path.join(ROOT, "vault");
const subtle = wc.subtle;
const ITER = 250000;

const COURSES = {
  main: { days: "data/days_with_media.json", docx: { file: "files/marathon-30-days.docx", name: "Тексты марафона 30 дней.docx" } },
  prep: { days: "data/prep-days.json" }
};

const MIME = {
  ".mp4": "video/mp4", ".m4v": "video/mp4", ".mov": "video/quicktime", ".m4a": "audio/mp4", ".ogg": "audio/ogg",
  ".mp3": "audio/mpeg", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".jfif": "image/jpeg", ".png": "image/png",
  ".webp": "image/webp", ".pdf": "application/pdf",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
};

const WORDS = ("aist arbuz baton bereg bobr veter volna gora grusha dozhd dub ezhik zhuk zvezda zebra iva kaktus kedr kit klen kofe kot " +
  "kubik lama les lev limon lipa list luna luk malina mak med more most myata nebo olen oreh orel ostrov palma panda park pero " +
  "pesok pion polje poni put raduga reka roza sad sever sinica sliva slon sneg sokol sova sok tigr tropa tulpan tucha ulitka utka " +
  "fazan fikus holm chaika cherry shar shmel yabloko yagoda yakor zakat zarya vishnya kapusta morkov svekla tykva ogurec pomidor " +
  "persik abrikos banan kivi mango gorod domik okno").split(/\s+/).filter((w) => /^[a-z]+$/.test(w));

function makePassword() {
  const w = () => WORDS[randomInt(WORDS.length)];
  return `${w()}-${w()}-${String(randomInt(10000)).padStart(4, "0")}`;
}

// ---------- секреты ----------
const secretsPath = path.join(SRC, "secrets.json");
const secrets = fs.existsSync(secretsPath) ? JSON.parse(fs.readFileSync(secretsPath, "utf8")) : {};
secrets.author ??= { password: makePassword() };
for (const id of Object.keys(COURSES)) {
  secrets[id] ??= { password: makePassword() };
  secrets[id].key ??= randomBytes(32).toString("base64");
  secrets[id].salt ??= randomBytes(16).toString("base64");
}
fs.writeFileSync(secretsPath, JSON.stringify(secrets, null, 2));

// одинаковое содержимое → одинаковый шифротекст, чтобы при пересборке git не раздувался
async function encrypt(keyRaw, data, label) {
  const iv = createHmac("sha256", keyRaw).update(label).update(createHash("sha256").update(data).digest()).digest().subarray(0, 12);
  const key = await subtle.importKey("raw", keyRaw, "AES-GCM", false, ["encrypt"]);
  const ct = new Uint8Array(await subtle.encrypt({ name: "AES-GCM", iv }, key, data));
  return Buffer.concat([iv, ct]);
}
async function wrap(password, salt, keyRaw, role) {
  const base = await subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]);
  const kek = await subtle.deriveKey({ name: "PBKDF2", salt, iterations: ITER, hash: "SHA-256" }, base,
    { name: "AES-GCM", length: 256 }, false, ["encrypt"]);
  const iv = createHmac("sha256", salt).update(role).update(password).digest().subarray(0, 12);
  const ct = new Uint8Array(await subtle.encrypt({ name: "AES-GCM", iv }, kek, keyRaw));
  return { role, iv: Buffer.from(iv).toString("base64"), ct: Buffer.from(ct).toString("base64") };
}
function writeIfChanged(file, buf) {
  if (fs.existsSync(file) && Buffer.compare(fs.readFileSync(file), buf) === 0) return false;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, buf);
  return true;
}

let written = 0;
for (const [id, spec] of Object.entries(COURSES)) {
  const keyRaw = Buffer.from(secrets[id].key, "base64");
  const salt = Buffer.from(secrets[id].salt, "base64");
  const out = path.join(VAULT, id);
  const keep = new Set();
  const put = (rel, buf) => { keep.add(path.join(out, rel)); if (writeIfChanged(path.join(out, rel), buf)) written++; };

  const meta = { v: 1, iter: ITER, salt: salt.toString("base64"),
    wraps: [await wrap(secrets[id].password, salt, keyRaw, "participant"), await wrap(secrets.author.password, salt, keyRaw, "author")] };
  put("key.json", Buffer.from(JSON.stringify(meta)));

  const days = JSON.parse(fs.readFileSync(path.join(SRC, spec.days), "utf8"));
  const mediaName = (local) => createHmac("sha256", keyRaw).update("media:" + local).digest("hex").slice(0, 20) + ".bin";
  const index = { days: days.map((d) => ({ day: d.day, title: d.title })) };

  for (const d of days) {
    const items = [];
    for (const it of d.items) {
      if (it.type === "text") {
        items.push({ type: "text", text: it.text, ...(it.buttons ? { buttons: it.buttons } : {}) });
      } else if (!it.local) {
        items.push({ type: it.type, note: it.note || "", pending: true });
      } else {
        const file = path.join(SRC, it.local);
        if (!fs.existsSync(file)) throw new Error(`нет файла: ${it.local}`);
        const data = fs.readFileSync(file);
        const name = mediaName(it.local);
        put("m/" + name, await encrypt(keyRaw, data, "m/" + name));
        items.push({ type: it.type, enc: `vault/${id}/m/${name}`, mime: MIME[path.extname(file).toLowerCase()] || "application/octet-stream",
          size: data.length, ...(it.type === "document" && it.name ? { name: it.name } : {}) });
      }
    }
    const rel = `day-${String(d.day).padStart(2, "0")}.bin`;
    put(rel, await encrypt(keyRaw, Buffer.from(JSON.stringify({ day: d.day, title: d.title, items })), rel));
  }

  if (spec.docx && fs.existsSync(path.join(SRC, spec.docx.file))) {
    const data = fs.readFileSync(path.join(SRC, spec.docx.file));
    put("texts.bin", await encrypt(keyRaw, data, "texts.bin"));
    index.docx = { enc: `vault/${id}/texts.bin`, mime: MIME[".docx"], name: spec.docx.name };
  }
  put("index.bin", await encrypt(keyRaw, Buffer.from(JSON.stringify(index)), "index.bin"));

  // убираем файлы, которых больше нет в уроках
  const walk = (dir) => fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]) : [];
  for (const f of walk(out)) if (!keep.has(f)) { fs.unlinkSync(f); written++; }
  console.log(`${id}: ${days.length} дней, файлов ${keep.size}`);
}
console.log(`изменено файлов: ${written}`);
