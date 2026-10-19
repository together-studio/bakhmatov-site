/* Кабинет курса: прогресс и сетка дней (course.html?c=main или ?c=prep) */
(function () {
  "use strict";
  var M = window.Marathon, C = M.course;
  var root = document.getElementById("app");

  var TEXTS = {
    main: {
      eyebrow: "Марафон по питанию · 30 дней",
      h1: 'Привет! Твой путь к <span class="hl">энергии</span> и <mark>балансу</mark>',
      lead: "Без революций, но с реальными изменениями. Один небольшой шаг в день — в своём темпе и без чувства вины.",
      daysTitle: 'Все <span class="hl">дни</span> марафона'
    },
    prep: {
      eyebrow: "До старта марафона · 7 дней",
      h1: 'Подготовка <span class="hl">к старту</span>',
      lead: "Знакомимся, отпускаем мифы, готовим кухню и пробуем двигаться — без нагрузки и новых правил.",
      daysTitle: 'Все <span class="hl">дни</span> подготовки'
    }
  }[M.courseId];

  function plural(n, one, few, many) {
    var a = n % 10, b = n % 100;
    return a === 1 && b !== 11 ? one : a >= 2 && a <= 4 && (b < 12 || b > 14) ? few : many;
  }

  function render(index) {
    var days = index.days;
    var total = days.length;
    var done = M.doneDays().filter(function (n) { return n >= 1 && n <= total; });
    var openCount = days.filter(function (d) { return M.isOpen(d.day); }).length;
    var author = M.isAuthor();

    // «Текущий» день: по расписанию — последний открывшийся; у автора — первый непройденный
    var current = 0;
    if (author) {
      for (var i = 0; i < days.length; i++) if (done.indexOf(days[i].day) === -1) { current = days[i].day; break; }
    } else {
      current = M.scheduledDay();
    }

    var cta = "";
    if (current) {
      cta = '<a class="btn btn-primary" href="' + M.dayLink(current) + '">' +
        (done.length ? "Продолжить: день " : "Начать: день ") + current + M.icon("arrowRight") + "</a>";
    } else if (!openCount) {
      cta = '<span class="chip chip-blue chip-lg">' + M.icon("calendar") + "Старт " + M.openLabel(1) + "</span>";
    }

    var cards = days.map(function (d) {
      var open = M.isOpen(d.day), isDone = done.indexOf(d.day) !== -1, isCurrent = d.day === current;
      var status = !open
        ? '<span class="chip chip-muted">' + M.icon("lock") + "Откроется " + M.openLabel(d.day) + "</span>"
        : isDone ? '<span class="chip chip-green">' + M.icon("check") + "Пройден</span>"
        : isCurrent ? '<span class="chip chip-blue">' + (author ? "Следующий" : "Сегодня") + "</span>"
        : '<span class="chip chip-ghost">Открыт</span>';
      var badge = '<span class="badge ' + (isDone ? "badge-green" : open ? "badge-blue" : "badge-muted") + '">' +
        (isDone ? M.icon("check") : open ? d.day : M.icon("lock")) + "</span>";
      var inner = '<div class="day-top">' + badge + '<span class="day-num">День ' + d.day + "</span></div>" +
        '<h3 class="day-title">' + M.esc(d.title) + "</h3>" + status;
      var cls = "day-card" + (isDone ? " is-done" : "") + (isCurrent ? " is-current" : "");
      return open
        ? '<li><a class="' + cls + '" href="' + M.dayLink(d.day) + '">' + inner + "</a></li>"
        : '<li><div class="' + cls + ' is-locked" aria-disabled="true">' + inner + "</div></li>";
    }).join("");

    var pct = total ? Math.round(done.length / total * 100) : 0;
    // Все тексты одним файлом — когда открыт последний день (иначе файл обгонял бы расписание)
    var docx = index.docx && M.isOpen(total)
      ? '<button type="button" class="bonus-banner bonus-banner-green enc-download" data-enc="' + M.esc(index.docx.enc) + '" data-mime="' + M.esc(index.docx.mime) + '" data-name="' + M.esc(index.docx.name) + '">' +
          '<span class="badge badge-green badge-lg">' + M.icon("download") + "</span>" +
          '<div><h2>Все тексты <span class="hl">одним файлом</span></h2>' +
          "<p>Документ Word с уроками всех дней — чтобы перечитать или распечатать.</p></div>" + M.icon("download") + "</button>"
      : "";

    root.innerHTML =
      '<section class="hero">' +
        '<p class="eyebrow">' + TEXTS.eyebrow + "</p>" +
        "<h1>" + TEXTS.h1 + "</h1>" +
        '<p class="lead">' + TEXTS.lead + "</p>" +
        cta +
      "</section>" +

      '<section class="card progress-card" aria-label="Твой прогресс">' +
        '<div class="stats">' +
          '<div class="stat"><span class="badge badge-blue">' + M.icon("calendar") + '</span><div><b>' + openCount + " из " + total + "</b><span>" + plural(openCount, "день открыт", "дня открыто", "дней открыто") + "</span></div></div>" +
          '<div class="stat"><span class="badge badge-green">' + M.icon("check") + '</span><div><b>' + done.length + "</b><span>" + plural(done.length, "день пройден", "дня пройдено", "дней пройдено") + "</span></div></div>" +
        "</div>" +
        '<div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="' + total + '" aria-valuenow="' + done.length + '" aria-label="Пройдено дней"><span style="width:' + pct + '%"></span></div>' +
      "</section>" +

      '<aside class="note">' +
        '<span class="badge badge-green badge-lg">' + M.icon("info") + "</span>" +
        "<p>Новый день открывается в " + M.esc(C.openTime) + " " + M.esc(C.timezoneLabel) + ". Пропущенный день никуда не денется — к нему можно вернуться, когда будет удобно.</p>" +
      "</aside>" +

      (author ? '<p class="preview-flag">Вход автора: открыты все дни и видны места под будущие видео и картинки. Участники видят дни по расписанию.</p>' : "") +

      '<section aria-labelledby="days-h">' +
        '<h2 id="days-h">' + TEXTS.daysTitle + "</h2>" +
        '<ul class="days">' + cards + "</ul>" +
      "</section>" + docx;
  }

  M.setHeader();
  document.title = C.title;
  M.gate().then(M.loadIndex).then(render).catch(function (e) {
    if (window.console) console.error(e);
    root.innerHTML = '<div class="card"><h2>Не получилось загрузить уроки</h2><p class="soft">Обнови страницу. Если не помогло — выйди и войди по паролю заново на <a href="index.html">главной</a>.</p></div>';
  });
})();
