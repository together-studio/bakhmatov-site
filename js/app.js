/* Общая логика: курсы, вход и расшифровка, расписание, прогресс, иконки, отрисовка материалов */
(function () {
  "use strict";

  var CFG = window.MARATHON_CONFIG;
  var PREFIX = "marathon:";
  var DAY_MS = 24 * 60 * 60 * 1000;

  /* ---------- Иконки (Lucide) ---------- */
  var ICONS = {
    lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    info: '<path d="M12 16v-5"/><path d="M12 7.5h.01"/>',
    arrowLeft: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
    arrowRight: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    play: '<path d="m7 4 13 8-13 8Z"/>',
    zap: '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/>',
    clipboard: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
    calendar: '<path d="M8 2v4M16 2v4"/><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18"/>',
    leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
    mic: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M19 10v1a7 7 0 0 1-14 0v-1"/><path d="M12 18v4"/>',
    download: '<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',
    dumbbell: '<path d="M6.5 6.5v11M17.5 6.5v11M3 9v6M21 9v6M6.5 12h11"/>',
    droplet: '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5S5 13 5 15a7 7 0 0 0 7 7Z"/>',
    coffee: '<path d="M10 2v2M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    heart: '<path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z"/>',
    flame: '<path d="M12 22a7 7 0 0 0 7-7c0-2.5-1.5-4.5-3-6-1 2-2 2.5-3 2.5C13 8 12.5 5 10 2c0 4-5 6.5-5 13a7 7 0 0 0 7 7Z"/>',
    activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    star: '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8-6.2-3.2-6.2 3.2L7 14.2 2 9.3l6.9-1Z"/>',
    gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
    loader: '<path d="M21 12a9 9 0 1 1-6.2-8.6"/>'
  };
  function icon(name) {
    return '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || ICONS.star) + "</svg>";
  }

  /* ---------- localStorage с защитой от ошибок ---------- */
  var store = {
    get: function (key, fallback) {
      try {
        var raw = localStorage.getItem(PREFIX + key);
        return raw == null ? fallback : JSON.parse(raw);
      } catch (e) {
        return fallback;
      }
    },
    set: function (key, value) {
      try {
        localStorage.setItem(PREFIX + key, JSON.stringify(value));
      } catch (e) { /* приватный режим или переполнение — работаем без сохранения */ }
    },
    del: function (key) {
      try { localStorage.removeItem(PREFIX + key); } catch (e) { /* нет доступа — ничего страшного */ }
    }
  };

  /* ---------- Какой курс открыт: ?c=main (30 дней) или ?c=prep (7 дней) ---------- */
  var params = new URLSearchParams(location.search);
  var courseId = CFG.courses[params.get("c")] ? params.get("c") : "main";
  var C = CFG.courses[courseId];

  /* ---------- Вход и расшифровка ----------
     Тексты и медиа лежат на сайте зашифрованными (AES-GCM). Ключ курса открывается только паролем. */
  var subtle = window.crypto && window.crypto.subtle;
  function b64(s) {
    var bin = atob(s), out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  function toB64(buf) {
    var bytes = new Uint8Array(buf), s = "";
    for (var i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
    return btoa(s);
  }
  var keyCache = {};
  function savedKey(id) { return store.get(id + ":key", null); }
  function isUnlocked(id) { return !!savedKey(id || courseId); }
  function isAuthor(id) { var k = savedKey(id || courseId); return !!(k && k.role === "author"); }
  function courseKey(id) {
    id = id || courseId;
    if (keyCache[id]) return keyCache[id];
    var saved = savedKey(id);
    if (!saved) return Promise.reject(new Error("locked"));
    keyCache[id] = subtle.importKey("raw", b64(saved.k), "AES-GCM", false, ["decrypt"]);
    return keyCache[id];
  }
  // пароль → ключ курса. Возвращает роль ("participant" / "author") или null, если пароль не подошёл
  function unlock(id, password) {
    if (!subtle) return Promise.reject(new Error("no-crypto"));
    var enc = new TextEncoder();
    return fetch("vault/" + id + "/key.json", { cache: "no-cache" }).then(function (r) { return r.json(); }).then(function (meta) {
      return subtle.importKey("raw", enc.encode(String(password || "").trim()), "PBKDF2", false, ["deriveKey"]).then(function (base) {
        return subtle.deriveKey({ name: "PBKDF2", salt: b64(meta.salt), iterations: meta.iter, hash: "SHA-256" },
          base, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
      }).then(function (kek) {
        var tries = meta.wraps.map(function (w) {
          return subtle.decrypt({ name: "AES-GCM", iv: b64(w.iv) }, kek, b64(w.ct))
            .then(function (raw) { return { k: toB64(raw), role: w.role }; }, function () { return null; });
        });
        return Promise.all(tries);
      }).then(function (res) {
        var hit = res.filter(Boolean)[0];
        if (!hit) return null;
        store.set(id + ":key", hit);
        delete keyCache[id];
        return hit.role;
      });
    });
  }
  function logout(id) { store.del((id || courseId) + ":key"); delete keyCache[id || courseId]; }

  function decryptBytes(path, id) {
    return Promise.all([courseKey(id), fetch(path).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.arrayBuffer();
    })]).then(function (res) {
      var buf = new Uint8Array(res[1]);
      return subtle.decrypt({ name: "AES-GCM", iv: buf.slice(0, 12) }, res[0], buf.slice(12));
    });
  }
  function decryptJson(path, id) {
    return decryptBytes(path, id).then(function (b) { return JSON.parse(new TextDecoder().decode(b)); });
  }
  function decryptUrl(path, mime, id) {
    return decryptBytes(path, id).then(function (b) { return URL.createObjectURL(new Blob([b], { type: mime || "" })); });
  }

  /* ---------- Время: берём с сервера, чтобы перевод часов на телефоне ничего не открывал ---------- */
  var timeOffset = 0;
  var timeReady = fetch("index.html?t=" + Date.now(), { method: "HEAD", cache: "no-store" }).then(function (r) {
    var d = Date.parse(r.headers.get("Date"));
    if (!isNaN(d)) timeOffset = d - Date.now();
  }).catch(function () { /* без сети берём время устройства */ });
  function now() { return Date.now() + timeOffset; }

  /* ---------- Расписание ---------- */
  function openDate(n, c) {
    c = c || C;
    var start = new Date(c.startDate + "T" + c.openTime + ":00" + c.utcOffset);
    return new Date(start.getTime() + (n - 1) * DAY_MS);
  }
  function isOpen(n) {
    if (isAuthor()) return true;
    var t = openDate(n).getTime();
    return !isNaN(t) && now() >= t;
  }
  // Дата открытия словами, в часовом поясе курса: «15 октября»
  function openLabel(n, c) {
    c = c || C;
    var m = /^([+-])(\d\d):(\d\d)$/.exec(c.utcOffset) || [0, "+", "03", "00"];
    var offsetMin = (m[1] === "-" ? -1 : 1) * (parseInt(m[2], 10) * 60 + parseInt(m[3], 10));
    var shifted = new Date(openDate(n, c).getTime() + offsetMin * 60000);
    if (isNaN(shifted.getTime())) return "";
    return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", timeZone: "UTC" }).format(shifted);
  }
  // Номер «сегодняшнего» дня по расписанию (0 — курс ещё не начался)
  function scheduledDay() {
    var n = 0;
    for (var i = 1; i <= C.totalDays; i++) if (now() >= openDate(i).getTime()) n = i;
    return n;
  }

  /* ---------- Прогресс ---------- */
  function doneDays() {
    var list = store.get(courseId + ":done", []);
    return Array.isArray(list) ? list : [];
  }
  function isDone(n) { return doneDays().indexOf(n) !== -1; }
  function setDone(n, value) {
    var list = doneDays().filter(function (d) { return d !== n; });
    if (value) list.push(n);
    store.set(courseId + ":done", list);
  }

  function dayLink(n) { return "day.html?c=" + courseId + "&day=" + n; }
  function homeLink(id) { return "course.html?c=" + (id || courseId); }
  function landingLink() { return "index.html"; }

  function loadIndex() { return decryptJson("vault/" + courseId + "/index.bin"); }
  function loadDay(n) { return decryptJson("vault/" + courseId + "/day-" + (n < 10 ? "0" : "") + n + ".bin"); }

  // Внутренние страницы без входа отправляют на главную — там визитка и форма входа
  function gate() {
    return new Promise(function (resolve) {
      if (isUnlocked() && subtle) return timeReady.then(resolve);
      location.replace(landingLink());
    });
  }

  /* ---------- Текст из бота → HTML ---------- */
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  // ссылки и @ник в Telegram делаем кликабельными
  function inline(s) {
    return esc(s)
      .replace(/(https?:\/\/[^\s<]+[^\s<.,;:!?)])/g, '<a href="$1" target="_blank" rel="noopener">$1</a>')
      .replace(/(^|[\s(])@([A-Za-z]\w{3,31})\b/g, '$1<a href="https://t.me/$2" target="_blank" rel="noopener">@$2</a>');
  }
  var LEAD_EMOJI = /^(?:[\u{1F000}-\u{1FAFF}\u{2300}-\u{23FF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]\s*)+/u;
  // Пометки автора из сценария бота — на сайте не показываем
  var AUTHOR_MARK = /^\(?\s*(?:сделать\s+)?(?:кружоч?ек|голосовое|видео)(?:\s*\/\s*видео)?\s*\)?$/i;
  var TASK_HEAD = /^(?:задание|мини-задание|финальное задание)/i;
  var LIST_START = /^(?:-\s|[•→✅❌✔☑]|\d{1,2}(?:[.)]\s|️?⃣))/;

  function stripEmoji(s) { return String(s).replace(LEAD_EMOJI, "").trim(); }

  // Текст → массив абзацев (пустая строка разделяет абзацы), абзац — массив строк
  function paragraphs(text) {
    var out = [], cur = [];
    String(text || "").replace(/\r/g, "").split("\n").forEach(function (raw) {
      var l = raw.replace(/^\s*>\s?/, "").replace(/\s*\(сделать кнопку[^)]*\)/i, "").trim();
      if (AUTHOR_MARK.test(l)) return;
      if (l) cur.push(l);
      else if (cur.length) { out.push(cur); cur = []; }
    });
    if (cur.length) out.push(cur);
    return out;
  }

  function classify(line) {
    var m;
    if ((m = /^(\d{1,2})️?⃣\s*(.*)$/.exec(line))) return { type: "num", n: m[1], text: m[2] };
    if ((m = /^(\d{1,2})[.)]\s+(.*)$/.exec(line))) return { type: "num", n: m[1], text: m[2] };
    if ((m = /^(?:✅|✔️?|☑️?)\s*(.*)$/.exec(line))) return { type: "yes", text: m[1] };
    if ((m = /^❌\s*(.*)$/.exec(line))) return { type: "no", text: m[1] };
    if ((m = /^(?:-\s|•\s*|→\s*)(.*)$/.exec(line))) return { type: "li", text: m[1] };
    return { type: "p", text: stripEmoji(line) };
  }

  // checklistKey: нумерованные пункты становятся отмечаемыми, состояние хранится под этим ключом
  function renderParagraphs(paras, checklistKey) {
    var checked = checklistKey ? store.get(checklistKey, []) : [];
    var html = "", numIndex = 0;
    paras.forEach(function (lines) {
      var open = null, pbuf = [];
      function flushP() { if (pbuf.length) { html += "<p>" + pbuf.join("<br>") + "</p>"; pbuf = []; } }
      function close() { if (open) { html += "</ul>"; open = null; } }
      lines.map(classify).forEach(function (it) {
        if (it.type === "p") {
          close();
          if (it.text) pbuf.push(inline(it.text));
        } else if (it.type === "num") {
          flushP(); close();
          if (checklistKey) {
            var on = checked.indexOf(numIndex) !== -1;
            html += '<button type="button" class="step step-check" data-step="' + numIndex + '" aria-pressed="' + on + '">' +
              '<span class="tick">' + icon("check") + "</span><span>" + inline(it.text) + "</span></button>";
            numIndex++;
          } else {
            html += '<div class="step"><span class="step-n">' + esc(it.n) + "</span><span>" + inline(it.text) + "</span></div>";
          }
        } else {
          flushP();
          if (open !== it.type) { close(); html += '<ul class="list list-' + it.type + '">'; open = it.type; }
          var mark = it.type === "yes" ? '<span class="tick tick-on">' + icon("check") + "</span>"
            : it.type === "no" ? '<span class="tick tick-no">' + icon("x") + "</span>"
            : '<span class="dot"></span>';
          html += "<li>" + mark + "<span>" + inline(it.text) + "</span></li>";
        }
      });
      flushP(); close();
    });
    return html;
  }

  // Короткая первая строка без точки в конце — подзаголовок блока. Вынимает её из paras.
  function takeHeading(paras) {
    var first = paras[0];
    if (!first) return "";
    var h = stripEmoji(first[0]);
    var isTask = TASK_HEAD.test(h) && h.length <= 60;
    if (!isTask && (first.length !== 1 || paras.length < 2)) return "";
    if (!isTask && (!h || h.length > 75 || LIST_START.test(first[0]) || /[.,;:…]$/.test(h))) return "";
    if (first.length > 1) first.shift(); else paras.shift();
    return h.replace(/\s*:$/, "");
  }

  /* ---------- Медиа ----------
     Файлы зашифрованы: картинки расшифровываются, когда до них доходит прокрутка,
     видео и аудио — по нажатию «Смотреть» / «Слушать». */
  function sizeLabel(bytes) {
    if (!bytes) return "";
    return bytes > 1048576 ? (Math.round(bytes / 104857.6) / 10).toString().replace(".", ",") + " МБ" : Math.max(1, Math.round(bytes / 1024)) + " КБ";
  }
  function encAttrs(item) {
    return ' data-enc="' + esc(item.enc) + '" data-mime="' + esc(item.mime || "") + '"';
  }

  function renderMediaItem(item) {
    if (!item.enc) {
      // материала ещё нет — место видно только автору
      if (!isAuthor()) return "";
      return '<div class="media-missing">' + icon(item.type === "voice" ? "mic" : item.type === "photo" ? "gift" : item.type === "document" ? "download" : "play") +
        "<span>Скоро здесь: " + esc(item.note || "материал") + "</span></div>";
    }
    var size = sizeLabel(item.size);
    switch (item.type) {
      case "video_note":
        return '<button type="button" class="enc-play circle" data-kind="circle"' + encAttrs(item) + ">" +
          '<span class="enc-btn">' + icon("play") + "</span><span class=\"enc-label\">Видео · " + size + "</span></button>";
      case "video":
      case "document":
        if (item.type === "document" && !/^video\//.test(item.mime || "")) {
          return '<button type="button" class="btn btn-secondary enc-download"' + encAttrs(item) + ' data-name="' + esc(item.name || "file") + '">' +
            icon("download") + "Скачать" + (item.name ? " · " + esc(item.name) : "") + "</button>";
        }
        return '<button type="button" class="enc-play clip' + (item.type === "document" ? " clip-small" : "") + '" data-kind="clip"' + encAttrs(item) + ">" +
          '<span class="enc-btn">' + icon("play") + "</span><span class=\"enc-label\">Смотреть видео · " + size + "</span></button>";
      case "voice":
        return '<div class="voice"><span class="badge badge-blue">' + icon("mic") + '</span><div class="voice-body">' +
          '<span class="voice-label">Голосовое сообщение</span>' +
          '<button type="button" class="btn btn-secondary btn-sm enc-play enc-audio" data-kind="audio"' + encAttrs(item) + ">" +
          icon("play") + "Слушать · " + size + "</button></div></div>";
      case "photo":
        return '<button type="button" class="photo" data-lightbox aria-label="Открыть картинку крупно">' +
          '<img alt="Иллюстрация к уроку" class="enc-img"' + encAttrs(item) + "></button>";
    }
    return "";
  }

  // Подключает расшифровку к отрисованному блоку
  function hydrate(root) {
    var imgs = root.querySelectorAll("img[data-enc]");
    function load(img) {
      if (img.getAttribute("data-loading")) return;
      img.setAttribute("data-loading", "1");
      decryptUrl(img.getAttribute("data-enc"), img.getAttribute("data-mime")).then(function (u) {
        img.src = u;
        img.classList.add("is-ready");
      }).catch(function () { img.closest(".photo").classList.add("is-broken"); });
    }
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); load(e.target); } });
      }, { rootMargin: "600px 0px" });
      Array.prototype.forEach.call(imgs, function (im) { io.observe(im); });
    } else {
      Array.prototype.forEach.call(imgs, load);
    }
  }

  document.addEventListener("click", function (e) {
    var play = e.target.closest(".enc-play");
    if (play && !play.getAttribute("data-loading")) {
      play.setAttribute("data-loading", "1");
      play.classList.add("is-loading");
      var label = play.querySelector(".enc-label") || play;
      var kind = play.getAttribute("data-kind");
      if (kind !== "audio") label.textContent = "Загрузка…";
      else play.lastChild.textContent = "Загрузка…";
      decryptUrl(play.getAttribute("data-enc"), play.getAttribute("data-mime")).then(function (u) {
        var el = document.createElement(kind === "audio" ? "audio" : "video");
        el.controls = true;
        el.setAttribute("playsinline", "");
        el.className = kind === "circle" ? "circle" : kind === "clip" ? play.className.replace("enc-play", "").trim() : "";
        el.src = u;
        play.replaceWith(el);
        var p = el.play();
        if (p && p.catch) p.catch(function () { /* автозапуск запрещён — нажмут сами */ });
      }).catch(function () {
        play.classList.remove("is-loading");
        play.removeAttribute("data-loading");
        if (kind !== "audio") label.textContent = "Не загрузилось — нажми ещё раз";
        else play.lastChild.textContent = "Не загрузилось — ещё раз";
      });
      return;
    }
    var dl = e.target.closest(".enc-download");
    if (dl) {
      dl.disabled = true;
      decryptUrl(dl.getAttribute("data-enc"), dl.getAttribute("data-mime")).then(function (u) {
        var a = document.createElement("a");
        a.href = u;
        a.download = dl.getAttribute("data-name") || "file";
        document.body.appendChild(a);
        a.click();
        a.remove();
      }).catch(function () { /* сеть — попробуют ещё раз */ }).then(function () { dl.disabled = false; });
    }
  });

  // Кнопки из бота: со ссылкой — настоящая кнопка; «задание» не показываем (есть блок задания); остальные — неактивные чипы
  function renderButtons(buttons) {
    var html = (buttons || []).map(function (b) {
      var m = /^(.*?)\s*->\s*(https?:\/\/\S+)\s*$/.exec(b);
      if (m) return '<a class="btn btn-secondary btn-sm" href="' + esc(m[2]) + '" target="_blank" rel="noopener">' + esc(stripEmoji(m[1])) + icon("arrowRight") + "</a>";
      if (/задани/i.test(b)) return "";
      return '<span class="chip chip-blue chip-static">' + esc(stripEmoji(b)) + "</span>";
    }).join("");
    return html ? '<div class="bot-buttons">' + html + "</div>" : "";
  }

  /* Список items → HTML, строго по порядку, как в боте.
     opts.dropDayLine — убрать первую строку «День N…» (она уже в заголовке страницы)
     opts.taskKey     — ключ для сохранения отмеченных пунктов задания; без него задание не выделяется */
  function renderItems(items, opts) {
    opts = opts || {};
    items = (items || []).filter(function (it) { return it.type !== "text" || String(it.text || "").trim(); });

    // какой текстовый блок считать заданием
    var taskIdx = -1, lastText = -1, hasTaskButton = false;
    items.forEach(function (it, i) {
      if (it.type !== "text") return;
      lastText = i;
      if ((it.buttons || []).some(function (b) { return /задани/i.test(b); })) hasTaskButton = true;
      var p = paragraphs(it.text);
      if (taskIdx === -1 && p[0] && TASK_HEAD.test(stripEmoji(p[0][0]))) taskIdx = i;
    });
    if (taskIdx === -1 && hasTaskButton && opts.taskKey) taskIdx = lastText;

    var html = "", firstTextSeen = false, i = 0;
    while (i < items.length) {
      var it = items[i];
      if (it.type === "text") {
        var paras = paragraphs(it.text);
        if (opts.dropDayLine && !firstTextSeen && paras[0] && /^День\s*\d+/i.test(stripEmoji(paras[0][0]))) {
          var dropped = paras[0].shift();
          if (!paras[0].length) paras.shift();
          // «День 23. Заголовок —» + продолжение заголовка на следующей строке
          if (/[—–-]\s*$/.test(dropped) && paras[0]) { paras[0].shift(); if (!paras[0].length) paras.shift(); }
        }
        firstTextSeen = true;
        if (i === taskIdx) {
          var title = takeHeading(paras);
          if (!TASK_HEAD.test(title)) { if (title) paras.unshift([title]); title = "Задание на сегодня"; }
          html += '<section class="task" id="task"><div class="task-head"><span class="badge badge-green">' + icon("clipboard") +
            "</span><h2>" + esc(title) + "</h2></div>" + renderParagraphs(paras, opts.taskKey) + renderButtons(it.buttons) + "</section>";
        } else {
          var h = takeHeading(paras);
          var body = renderParagraphs(paras) + renderButtons(it.buttons);
          if (h || body) html += '<section class="text-block">' + (h ? "<h2>" + inline(h) + "</h2>" : "") + body + "</section>";
        }
        i++;
        continue;
      }
      // подряд идущие фото и кружки ставим в один ряд, порядок не меняется
      var j = i, group = "";
      while (j < items.length && items[j].type === it.type) { group += renderMediaItem(items[j]); j++; }
      if (!group) { i = j; continue; }
      if (it.type === "photo" && group.indexOf("media-missing") !== -1) html += group;
      else if (it.type === "photo") html += '<div class="gallery' + (j - i === 1 ? " gallery-one" : "") + '">' + group + "</div>";
      else if (it.type === "video_note") html += '<div class="circles">' + group + "</div>";
      else html += group;
      i = j;
    }
    return html;
  }

  // Клики по отмечаемым пунктам задания
  function bindChecklist(root, key) {
    root.addEventListener("click", function (e) {
      var btn = e.target.closest(".step-check");
      if (!btn) return;
      var n = parseInt(btn.getAttribute("data-step"), 10);
      var list = store.get(key, []).filter(function (x) { return x !== n; });
      var on = btn.getAttribute("aria-pressed") !== "true";
      if (on) list.push(n);
      btn.setAttribute("aria-pressed", String(on));
      store.set(key, list);
    });
  }

  /* ---------- Лайтбокс для картинок ---------- */
  var lightbox = null, lastFocus = null;
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.remove();
    lightbox = null;
    document.documentElement.classList.remove("no-scroll");
    if (lastFocus) lastFocus.focus();
  }
  document.addEventListener("click", function (e) {
    if (lightbox) return closeLightbox();
    var trigger = e.target.closest("[data-lightbox]");
    if (!trigger) return;
    var img = trigger.querySelector("img");
    if (!img || !(img.currentSrc || img.src)) return;
    lastFocus = trigger;
    lightbox = document.createElement("div");
    lightbox.className = "lightbox";
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-label", "Просмотр картинки");
    lightbox.innerHTML = '<button type="button" class="lightbox-close" aria-label="Закрыть">' + icon("x") +
      '</button><img src="' + esc(img.currentSrc || img.src) + '" alt="">';
    document.body.appendChild(lightbox);
    document.documentElement.classList.add("no-scroll");
    lightbox.querySelector("button").focus();
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeLightbox(); });

  // один звук за раз: запуск нового видео или аудио ставит остальные на паузу
  document.addEventListener("play", function (e) {
    Array.prototype.forEach.call(document.querySelectorAll("video, audio"), function (m) {
      if (m !== e.target && !m.paused && !m.muted) m.pause();
    });
  }, true);

  function setHeader() {
    var el = document.querySelector("[data-site-title]");
    if (el) el.textContent = CFG.siteTitle;
    var home = document.querySelector("[data-home-link]");
    if (home) home.setAttribute("href", isUnlocked() ? homeLink() : landingLink());
  }

  window.Marathon = {
    config: CFG, course: C, courseId: courseId, icon: icon, store: store,
    isUnlocked: isUnlocked, isAuthor: isAuthor, unlock: unlock, logout: logout,
    decryptJson: decryptJson, loadIndex: loadIndex, loadDay: loadDay, hydrate: hydrate,
    openDate: openDate, isOpen: isOpen, openLabel: openLabel, scheduledDay: scheduledDay, timeReady: timeReady,
    doneDays: doneDays, isDone: isDone, setDone: setDone,
    dayLink: dayLink, homeLink: homeLink, landingLink: landingLink, gate: gate,
    esc: esc, renderItems: renderItems, bindChecklist: bindChecklist, setHeader: setHeader
  };
})();
