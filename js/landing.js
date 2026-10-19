/* Страница-визитка марафона (видна до входа) + форма входа вверху.
   Все тексты визитки — в объекте L ниже, их можно править прямо здесь. */
(function () {
  "use strict";

  var L = {
    chip: "Марафон по питанию · онлайн",
    title: 'Рацион для похудения: <span class="hl">научишься за 30 дней</span>',
    subtitle: "Без жёстких диет, запретов и срывов",
    start: "31 октября",
    price: "2 500 ₽",
    perDay: "≈ 83 ₽ в день",
    contact: { label: "Написать «МАРАФОН» в Telegram", url: "https://t.me/psyker16" },

    coach: {
      name: "Сергей Бахматов",
      short: "нутрициолог · 5+ лет · 150+ клиентов",
      photo: "media/landing/sergey.jpg",
      about: "Фитнес-тренер и фитнес-нутрициолог (профпереподготовка, 280 часов). Колледж фитнеса и бодибилдинга им. Бена Вейдера",
      stats: [["5+", "лет практики"], ["150+", "клиентов"]],
      quote: "«Мы здесь не для того, чтобы себя ограничивать, а чтобы обрести свободу осознанного выбора»"
    },

    heroResult: { photo: "media/landing/client-1.jpg", value: "−35 кг", from: "со 107 до 72 кг", note: "результат клиентки личного сопровождения" },

    pains: [
      "«Начну с понедельника» — уже в который раз",
      "Неделя на гречке, потом срыв и чувство вины",
      "Ешь вроде немного, а вес стоит",
      "Вечером тянет к холодильнику и на сладкое",
      "К обеду нет сил, тяжесть и отёки",
      "Тысяча советов в интернете, и все спорят"
    ],
    painsNote: ["Дело не в силе воли", "Нужна система, которую можно держать годами, а не две недели. Этому и посвящён марафон."],

    blocks: [
      { days: "Дни 1–7", title: "Старт", color: "blue", items: ["Цель и замеры «точки А»", "Дневник питания 4 дня", "Видеосозвон: разбор дневников"] },
      { days: "Дни 8–15", title: "Завтрак и перекус", color: "green", items: ["Конструктор готовых блюд", "Сладкое без запретов", "Клетчатка, анализы, витамин D"] },
      { days: "Дни 16–23", title: "Обед и ужин", color: "green", items: ["Обед в контейнере с вечера", "Железо, кальций, магний", "«Еда — не награда»"] },
      { days: "Дни 24–30", title: "Закрепляем", color: "blue", items: ["Метод руки для кафе и гостей", "Своя норма и сохранение мышц", "Итоги и подарки"] }
    ],

    how: [
      { icon: "calendar", color: "blue", title: "Каждый день новый урок", text: "Бот ведёт по дням, материалы на закрытом сайте по паролю" },
      { icon: "video", color: "green", title: "Видеовстреча каждую субботу", text: "Разбираем вопросы и трудности недели вживую" },
      { icon: "pill", color: "blue", title: "Витамины и анализы простым языком", text: "Витамин D, железо, кальций и добавки, которые реально работают" },
      { icon: "dumbbell", color: "green", title: "Тренировки и доп. материалы", text: "Техника базовых упражнений, комплекс для дома, отёки, тяга к сладкому, метаболизм" }
    ],

    gifts: [
      { when: "сразу после оплаты", whenColor: "green", big: "7", title: "дней вводных материалов", text: "Мифы о похудении, подготовка кухни и 3 тренировки с видео" },
      { when: "в финале марафона", whenColor: "blue", icon: "repeat", title: "Список продуктов-замен", text: "Делаешь полезнее любимую еду без отказа от привычных блюд" },
      { when: "в финале марафона", whenColor: "blue", icon: "file", title: "Памятка «Питание без лишней готовки»", text: "Готовая еда из магазина, меню на рабочий день, корзина на 3 дня" }
    ],
    giftsNote: "Финальные подарки получают все, кто активно проходит марафон",

    changes: [
      ["Диета с понедельника, срыв к пятнице", "Понятная система питания, которую легко держать"],
      ["Чувство вины после сладкого", "Сладкое без запретов и без срывов"],
      ["Не знаешь, что приготовить, чтобы худеть", "Знаешь, как собрать сытную тарелку дома и в кафе"],
      ["Витамины «наугад» по совету из интернета", "Понимаешь, какие анализы обсудить с врачом и какие добавки работают"],
      ["Тренировки без результата", "Худеешь и при этом сохраняешь мышцы"]
    ],

    // Результаты. Если файла нет — карточка просто не показывается.
    results: [
      { photo: "media/landing/client-1.jpg", caption: "107 → 72 кг" },
      { photo: "media/landing/client-2.jpg", caption: "78 → 61 кг" },
      { photo: "media/landing/client-5.jpg", caption: "−6 кг за 2 месяца" },
      { photo: "media/landing/client-6.jpg", caption: "−8 кг за 2,5 месяца" }
    ],
    resultsMen: [
      { photo: "media/landing/client-3.jpg", caption: "−13 кг за 3 месяца", wide: true },
      { photo: "media/landing/client-4.jpg", caption: "−11 кг за 2 месяца" }
    ],
    resultsNote: "Марафон — первый шаг: за 30 дней ты разберёшься, как питаться, чтобы прийти к своему результату",
    resultsDisclaimer: "Результаты клиентов личного сопровождения. Фото опубликованы с согласия. Результат у каждого свой и зависит от исходных данных.",

    education: {
      school: "Колледж фитнеса и бодибилдинга им. Бена Вейдера",
      title: "Более 600 часов обучения",
      photo: "media/landing/diploma.jpg",
      items: [
        ["Фитнес-нутрициолог", "профпереподготовка · 280 часов · 2024"],
        ["Нутрициолог-эксперт", "диплом · 200 часов · 2024"],
        ["Нутрициолог-специалист", "диплом · 96 часов · 2023"],
        ["Питание при ожирении и некоторых заболеваниях", "сертификат · 17 часов"],
        ["Прикладная нутрициология", "сертификат · 15 часов"]
      ],
      note: "Не только нутрициолог, но и фитнес-тренер: питание и тренировки в одной системе"
    }
  };

  var EXTRA_ICONS = {
    video: '<path d="m16 13 5.2 3.5a.5.5 0 0 0 .8-.4V7.9a.5.5 0 0 0-.8-.4L16 11"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
    pill: '<path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/>',
    repeat: '<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>',
    file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M8 13h8M8 17h8"/>',
    send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>'
  };

  window.MarathonLanding = function (root, days, onUnlock) {
    var M = window.Marathon;
    var esc = M.esc;
    function icon(name) {
      if (!EXTRA_ICONS[name]) return M.icon(name);
      return '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + EXTRA_ICONS[name] + "</svg>";
    }
    function img(src, alt, cls) {
      return '<img class="' + (cls || "") + '" src="' + esc(src) + '" alt="' + esc(alt) + '" loading="lazy" data-hide-on-error>';
    }
    function resultCard(r) {
      return '<figure class="result' + (r.wide ? " result-wide" : "") + '">' +
        '<button type="button" class="photo" data-lightbox aria-label="Открыть фото крупно">' + img(r.photo, "Результат клиента: " + r.caption) + "</button>" +
        "<figcaption>" + esc(r.caption) + "</figcaption></figure>";
    }
    var LOGIN = {
      main: { title: "Марафон «30 дней»", hint: "Вход для участников по паролю из бота", badge: "blue", icon: "lock" },
      prep: { title: "Подготовка к старту — 7 дней", hint: "Отдельный пароль, приходит после оплаты", badge: "green", icon: "leaf" }
    };
    function loginForm(courseId, id) {
      var t = LOGIN[courseId];
      if (M.isUnlocked(courseId)) {
        return '<div class="login login-' + courseId + '">' +
          '<div class="login-text"><span class="badge badge-green">' + M.icon("check") + "</span><div><b>" + esc(t.title) + "</b><span>Вход выполнен — пароль не нужен</span></div></div>" +
          '<a class="btn btn-primary" href="' + M.homeLink(courseId) + '">Открыть' + M.icon("arrowRight") + "</a></div>";
      }
      return '<form class="login login-' + courseId + '" data-login="' + courseId + '">' +
        '<div class="login-text"><span class="badge badge-' + t.badge + '">' + M.icon(t.icon) + "</span><div><b>" + esc(t.title) + "</b><span>" + esc(t.hint) + "</span></div></div>" +
        '<div class="login-fields"><label class="sr-only" for="' + id + '">Пароль</label>' +
        '<input id="' + id + '" class="input" type="password" autocomplete="current-password" placeholder="Пароль" required>' +
        '<button class="btn btn-primary" type="submit">Войти</button></div>' +
        '<p class="gate-error" role="alert" hidden>Не подошло. Проверь раскладку и попробуй ещё раз.</p>' +
        "</form>";
    }

    document.title = L.coach.name + " — марафон по питанию «30 дней»";
    var c = L.coach, h = L.heroResult;

    root.innerHTML =
      '<div class="logins">' + loginForm("main", "login-main") + loginForm("prep", "login-prep") + "</div>" +

      // 1. Первый экран
      '<section class="l-hero">' +
        '<div class="l-hero-text">' +
          '<span class="chip chip-green chip-lg">' + esc(L.chip) + "</span>" +
          "<h1>" + L.title + "</h1>" +
          '<p class="lead">' + esc(L.subtitle) + "</p>" +
          '<div class="l-facts"><div><span>Старт</span><b>' + esc(L.start) + '</b></div><div><span>Участие</span><b class="hl">' + esc(L.price) + "</b></div></div>" +
          '<a class="btn btn-primary" href="#join">Хочу участвовать' + M.icon("arrowRight") + "</a>" +
        "</div>" +
        '<div class="l-hero-photo">' +
          '<div class="l-portrait">' + img(c.photo, c.name) + '<span class="l-days"><b>30</b>дней</span></div>' +
          '<div class="l-name card"><b>' + esc(c.name) + "</b><span>" + esc(c.short) + "</span></div>" +
        "</div>" +
        '<div class="l-proof card">' +
          img(h.photo, "До и после: " + h.from) +
          '<div><span class="eyebrow eyebrow-green">До и после</span><b class="l-proof-value">' + esc(h.value) + "</b><span class=\"l-proof-from\">" + esc(h.from) + '</span><span class="soft">' + esc(h.note) + "</span></div>" +
        "</div>" +
      "</section>" +

      // 2. Знакомо?
      '<section class="l-section"><h2 class="l-h">Знакомо?</h2>' +
        '<ul class="l-pains">' + L.pains.map(function (p) { return '<li class="card"><span class="l-bang">!</span>' + esc(p) + "</li>"; }).join("") + "</ul>" +
        '<div class="l-banner"><h3>' + esc(L.painsNote[0]) + "</h3><p>" + esc(L.painsNote[1]) + "</p></div>" +
      "</section>" +

      // 3. Что внутри
      '<section class="l-section"><h2 class="l-h">Что внутри: <span class="hl">30 дней</span></h2>' +
        '<p class="lead">Меняем по одному приёму пищи, остальное закрепляем</p>' +
        '<div class="l-blocks">' + L.blocks.map(function (b) {
          return '<div class="l-block l-block-' + b.color + '"><p class="l-block-days">' + esc(b.days) + "</p><h3>" + esc(b.title) + "</h3>" +
            '<ul class="list">' + b.items.map(function (i) { return '<li><span class="l-check">' + M.icon("check") + "</span><span>" + esc(i) + "</span></li>"; }).join("") + "</ul></div>";
        }).join("") + "</div>" +
      "</section>" +

      // 4. Как проходит
      '<section class="l-section"><h2 class="l-h">Как проходит марафон</h2>' +
        '<ul class="l-how">' + L.how.map(function (x) {
          return '<li class="card"><span class="l-icon l-icon-' + x.color + '">' + icon(x.icon) + "</span><div><h3>" + esc(x.title) + "</h3><p>" + esc(x.text) + "</p></div></li>";
        }).join("") + "</ul>" +
      "</section>" +

      // 5. Бонусы
      '<section class="l-dark"><span class="chip l-chip-lime">Бонусы</span><h2 class="l-h">Подарки в начале и в конце пути</h2>' +
        '<ul class="l-gifts">' + L.gifts.map(function (g) {
          return '<li><span class="chip l-when l-when-' + g.whenColor + '">' + esc(g.when) + "</span>" +
            (g.big ? '<b class="l-big">' + esc(g.big) + "</b>" : '<span class="l-gift-icon l-gift-' + g.whenColor + '">' + icon(g.icon) + "</span>") +
            "<h3>" + esc(g.title) + "</h3><p>" + esc(g.text) + "</p></li>";
        }).join("") + "</ul>" +
        '<p class="l-dark-note">' + esc(L.giftsNote) + "</p>" +
      "</section>" +

      // 6. Что изменится
      '<section class="l-section"><h2 class="l-h">Что изменится за 30 дней</h2>' +
        '<div class="l-changes"><p class="l-col-h">Сейчас</p><span></span><p class="l-col-h l-col-after">После марафона</p>' +
        L.changes.map(function (r) {
          return '<div class="l-now">' + esc(r[0]) + '</div><span class="l-arrow">' + M.icon("arrowRight") + '</span><div class="l-after">' + esc(r[1]) + "</div>";
        }).join("") + "</div>" +
      "</section>" +

      // 7. Результаты
      '<section class="l-section"><h2 class="l-h">Результаты моих клиентов</h2>' +
        '<p class="lead">Без голодовок и жёстких запретов: питание, привычки и тренировки</p>' +
        '<div class="l-results">' + L.results.map(resultCard).join("") + "</div>" +
        '<h3 class="l-sub">Результаты клиентов-мужчин</h3>' +
        '<div class="l-results l-results-men">' + L.resultsMen.map(resultCard).join("") + "</div>" +
        '<div class="l-note-green">' + esc(L.resultsNote) + "</div>" +
        '<p class="l-small">' + esc(L.resultsDisclaimer) + "</p>" +
      "</section>" +

      // 8. Обучение
      '<section class="l-section"><span class="chip chip-green chip-lg">' + esc(L.education.school) + '</span><h2 class="l-h">' + esc(L.education.title) + "</h2>" +
        '<div class="l-edu">' +
          '<button type="button" class="photo l-diploma" data-lightbox aria-label="Открыть диплом крупно">' + img(L.education.photo, "Диплом о профессиональной переподготовке") + "</button>" +
          '<ul class="l-edu-list">' + L.education.items.map(function (e) { return "<li><b>" + esc(e[0]) + "</b><span>" + esc(e[1]) + "</span></li>"; }).join("") + "</ul>" +
        "</div>" +
        '<div class="l-banner"><p class="l-banner-strong">' + esc(L.education.note) + "</p></div>" +
      "</section>" +

      // 9. Ведёт марафон + цена
      '<section class="l-section" id="join">' +
        '<div class="l-coach">' + img(c.photo, c.name, "l-coach-photo") +
          '<div><p class="eyebrow eyebrow-green">Ведёт марафон</p><h2 class="l-h">' + esc(c.name) + "</h2><p class=\"lead\">" + esc(c.about) + "</p>" +
          '<div class="l-stats">' + c.stats.map(function (s) { return '<span class="card"><b>' + esc(s[0]) + "</b> " + esc(s[1]) + "</span>"; }).join("") + "</div></div>" +
        "</div>" +
        '<blockquote class="l-quote">' + esc(c.quote) + "</blockquote>" +
        '<div class="l-price"><div><b>' + esc(L.price) + "</b><span>" + esc(L.perDay) + " · старт " + esc(L.start) + "</span></div>" +
          '<a class="btn l-price-btn" href="' + esc(L.contact.url) + '" target="_blank" rel="noopener">' + icon("send") + esc(L.contact.label) + "</a></div>" +
      "</section>" +

      '<div class="logins">' + loginForm("main", "login-main-2") + loginForm("prep", "login-prep-2") + "</div>";

    // картинки, которых ещё нет в папке, прячем вместе с карточкой
    Array.prototype.forEach.call(root.querySelectorAll("img[data-hide-on-error]"), function (im) {
      im.addEventListener("error", function () {
        var box = im.closest(".result") || im.closest(".l-proof img") || im;
        box.style.display = "none";
      });
    });

    Array.prototype.forEach.call(root.querySelectorAll("[data-login]"), function (form) {
      var input = form.querySelector("input"), btn = form.querySelector("button");
      var err = form.querySelector(".gate-error"), courseId = form.getAttribute("data-login");
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        btn.disabled = true;
        err.hidden = true;
        M.unlock(courseId, input.value).then(function (role) {
          if (role) return onUnlock(courseId);
          err.textContent = "Не подошло. Проверь раскладку и попробуй ещё раз.";
          err.hidden = false;
          input.select();
        }).catch(function () {
          err.textContent = "Не получилось проверить пароль. Проверь интернет и попробуй ещё раз.";
          err.hidden = false;
        }).then(function () { btn.disabled = false; });
      });
    });
  };
})();
