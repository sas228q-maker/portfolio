/* Интерактив сайтов SiteHunter.
   Принципы: только transform/opacity в анимациях, клавиатура для вкладок,
   aria-live для статусов, уважение prefers-reduced-motion. */
(function () {
  "use strict";

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- шапка и кнопка «наверх» ---------- */
  var hdr = document.querySelector(".hdr");
  var up = document.querySelector(".up");
  function onScroll() {
    if (hdr) hdr.classList.toggle("is-stuck", window.scrollY > 8);
    if (up) up.classList.toggle("is-on", window.scrollY > 700);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (up) {
    up.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    });
  }

  /* ---------- мобильное меню (Esc закрывает) ---------- */
  var burger = document.querySelector(".burger");
  var menu = document.querySelector(".menu");
  if (burger && menu) {
    function setMenu(open) {
      menu.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    }
    burger.addEventListener("click", function () {
      setMenu(!menu.classList.contains("is-open"));
    });
    menu.addEventListener("click", function (e) {
      if (e.target.tagName === "A") setMenu(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("is-open")) {
        setMenu(false);
        burger.focus();
      }
    });
  }

  /* ---------- появление блоков ----------
     IntersectionObserver даёт плавность, scroll-проверка гарантирует,
     что блок не останется невидимым при быстрой прокрутке. */
  var rvs = document.querySelectorAll(".rv");
  function revealAll() {
    var vh = window.innerHeight || 800;
    rvs.forEach(function (el) {
      if (el.classList.contains("is-in")) return;
      var r = el.getBoundingClientRect();
      if (r.top < vh * 0.93 && r.bottom > -vh) el.classList.add("is-in");
    });
  }
  if (rvs.length) {
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
        });
      }, { rootMargin: "0px 0px -6% 0px", threshold: 0.06 });
      rvs.forEach(function (el, i) {
        el.style.transitionDelay = Math.min(i % 5, 4) * 55 + "ms";
        io.observe(el);
      });
    }
    var ticking = false;
    function onRvScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { revealAll(); ticking = false; });
    }
    window.addEventListener("scroll", onRvScroll, { passive: true });
    window.addEventListener("resize", onRvScroll);
    revealAll();
    requestAnimationFrame(revealAll);
    [200, 600, 1400, 2600].forEach(function (d) { setTimeout(revealAll, d); });
    var guard = 0;
    var gid = setInterval(function () {
      revealAll();
      if (++guard > 20 || document.querySelectorAll(".rv:not(.is-in)").length === 0) clearInterval(gid);
    }, 700);
  }

  /* ---------- вкладки: мышь + клавиатура (стрелки, Home, End) ---------- */
  document.querySelectorAll("[data-tabs]").forEach(function (group) {
    var tabs = Array.prototype.slice.call(group.querySelectorAll(".tab"));
    var tabPanels = group.querySelectorAll(".panel");
    if (!tabs.length) return;

    function activate(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.classList.toggle("is-active", on);
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
      });
      tabPanels.forEach(function (p) { p.classList.remove("is-active"); p.hidden = true; });
      var target = group.querySelector('[data-panel="' + tab.dataset.tab + '"]');
      if (target) { target.classList.add("is-active"); target.hidden = false; }
      if (focus) tab.focus();
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { activate(tab, false); });
      tab.addEventListener("keydown", function (e) {
        var k = e.key, n = null;
        if (k === "ArrowRight" || k === "ArrowDown") n = tabs[(i + 1) % tabs.length];
        else if (k === "ArrowLeft" || k === "ArrowUp") n = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (k === "Home") n = tabs[0];
        else if (k === "End") n = tabs[tabs.length - 1];
        if (n) { e.preventDefault(); activate(n, true); }
      });
    });
  });

  /* ---------- формы: заявка реально уходит в Telegram ----------
     Сайт статический, бэкенда нет. Отправляем через Bot API прямо из браузера.
     Если не получилось — предлагаем отправить в Telegram в один тап,
     чтобы заявка не потерялась ни за каких условий. */
  function leadText(form, formName) {
    var get = function (n) {
      var el = form.querySelector('[name="' + n + '"]');
      return el ? el.value.trim() : '';
    };
    var lines = [
      "🔔 <b>Нова заявка з сайту</b>",
      "Сайт: <b>" + formName + "</b>",
      "Ім'я: " + (get("name") || "не вказано"),
      "Телефон: " + get("phone")
    ];
    if (get("service")) lines.push("Послуга: " + get("service"));
    if (get("type")) lines.push("Заклад: " + get("type"));
    if (get("guests")) lines.push("Осіб: " + get("guests"));
    if (get("date")) lines.push("Бажана дата: " + get("date"));
    if (get("time")) lines.push("Час: " + get("time"));
    if (get("car")) lines.push("Авто: " + get("car"));
    if (get("message")) lines.push("Повідомлення: " + get("message"));
    lines.push("—");
    lines.push("Сторінка: " + location.href);
    lines.push("Час: " + new Date().toLocaleString("uk-UA"));
    return lines.join("\n");
  }

  function sendToTelegram(form, formName, onDone) {
    var cfg = window.SH_LEAD;
    var text = leadText(form, formName);
    if (!cfg || !cfg.token || !cfg.chat) { onDone(false, "not-configured", text); return; }
    var body = new URLSearchParams({
      chat_id: cfg.chat, text: text, parse_mode: "HTML", disable_web_page_preview: "true"
    });
    fetch("https://api.telegram.org/bot" + cfg.token + "/sendMessage", { method: "POST", body: body })
      .then(function (r) { return r.json(); })
      .then(function (j) { onDone(!!j.ok, j.description || "", text); })
      .catch(function (e) { onDone(false, String(e).slice(0, 90), text); });
  }

  function tgDeepLink(text) {
    var cfg = window.SH_LEAD;
    var who = (cfg && cfg.owner) || "Sanik9991";
    return "https://t.me/" + who + "?text=" + encodeURIComponent(text);
  }

  document.querySelectorAll("form[data-form]").forEach(function (form) {
    var status = form.querySelector(".status");
    if (status) status.setAttribute("aria-live", "polite");

    /* Скрытая ловушка для спам-ботов. Реальные люди это поле не видят,
       потому что оно вынесено за экран и помечено aria-hidden. */
    var honey = document.createElement("input");
    honey.type = "text";
    honey.name = "company";
    honey.tabIndex = -1;
    honey.autocomplete = "off";
    honey.setAttribute("aria-hidden", "true");
    honey.style.cssText = "position:absolute;left:-9999px;width:1px;height:1px;opacity:0";
    form.appendChild(honey);

    var t = (document.querySelector("title") || {}).textContent || "Сайт";
    var formName = t.split("—")[0].split("|")[0].trim() || "Сайт";

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (honey.value) return;                    // это бот — тихо выходим

      var tel = form.querySelector('input[type="tel"]');
      if (tel && tel.value.replace(/\D/g, "").length < 9) {
        tel.focus();
        tel.setAttribute("aria-invalid", "true");
        setTimeout(function () { tel.removeAttribute("aria-invalid"); }, 2200);
        return;
      }

      // ограничение: не чаще одной заявки в минуту с одного браузера
      try {
        var lastAt = +localStorage.getItem("sh_lead_at") || 0;
        if (Date.now() - lastAt < 60000) {
          if (status) {
            status.innerHTML = '<svg class="ic" aria-hidden="true"><use href="#i-clock"></use></svg>' +
              "<span>Заявку вже надіслано. Якщо потрібно ще раз — зачекайте хвилину " +
              "або напишіть у Telegram.</span>";
            status.classList.add("is-on");
          }
          return;
        }
      } catch (err) { /* режим приватності — просто продовжуємо */ }

      var btn = form.querySelector('button[type="submit"]');
      var label = btn ? btn.innerHTML : "";
      if (btn) { btn.disabled = true; btn.textContent = "Надсилаємо..."; }

      sendToTelegram(form, formName, function (ok, why, text) {
        if (btn) { btn.disabled = false; btn.innerHTML = label; }
        if (!status) return;
        status.classList.add("is-on");

        if (ok) {
          try { localStorage.setItem("sh_lead_at", String(Date.now())); } catch (err) {}
          status.innerHTML = '<svg class="ic" aria-hidden="true"><use href="#i-checkCircle"></use></svg>' +
            "<span>Дякуємо! Заявку надіслано — зв'яжемося протягом 15 хвилин у робочий час.</span>";
          form.reset();
        } else {
          /* Резервный путь: посетитель отправляет заявку сам, в один тап.
             Так заявка не теряется, даже если Telegram недоступен. */
          status.innerHTML = '<svg class="ic" aria-hidden="true"><use href="#i-send"></use></svg>' +
            '<span>Автоматична відправка не спрацювала. Натисніть кнопку — текст заявки ' +
            'вже складено, залишиться тільки надіслати.<br>' +
            '<a class="btn btn--sm" style="margin-top:10px" target="_blank" rel="noopener" href="' +
            tgDeepLink(text) + '">Відкрити Telegram із заявкою</a></span>';
        }
      });
    });
  });

  /* ---------- счётчики (если на странице есть) ---------- */
  var counters = document.querySelectorAll("[data-count]");
  if (counters.length && "IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        cio.unobserve(el);
        var target = parseFloat(el.dataset.count);
        var suffix = el.dataset.suffix || "";
        if (reduce) { el.textContent = target.toLocaleString("uk-UA") + suffix; return; }
        var t0 = null;
        function step(ts) {
          if (!t0) t0 = ts;
          var p = Math.min(1, (ts - t0) / 1200);
          el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))).toLocaleString("uk-UA") + suffix;
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { cio.observe(c); });
  }

  /* ---------- 3D-наклон за курсором (один авторский момент на странице) ---------- */
  if (!reduce) {
    document.querySelectorAll("[data-tilt]").forEach(function (el) {
      var max = parseFloat(el.dataset.tilt) || 12;
      var base = parseFloat(el.dataset.tiltBase || "0");
      var zone = el.closest("[data-tilt-zone]") || el.parentElement;
      if (!zone) return;
      zone.addEventListener("mousemove", function (e) {
        var r = zone.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = "rotateY(" + (px * max * 2).toFixed(2) + "deg) rotateX(" +
          (base - py * max * 1.6).toFixed(2) + "deg)";
      });
      zone.addEventListener("mouseleave", function () { el.style.transform = ""; });
    });
  }

  /* ---------- слои 3D-бургера «дихають», поки видно ---------- */
  var b3 = document.querySelector("[data-burger3d]");
  if (b3 && !reduce && "IntersectionObserver" in window) {
    var running = false, t0 = 0, visible = false;
    function loop(ts) {
      if (!visible) { running = false; return; }
      if (!t0) t0 = ts;
      var t = (ts - t0) / 1000;
      b3.style.setProperty("--spread", ((Math.sin(t * 0.9) * 0.5 + 0.5) * 16).toFixed(1) + "px");
      requestAnimationFrame(loop);
    }
    new IntersectionObserver(function (es) {
      visible = es[0].isIntersecting;
      if (visible && !running) { running = true; t0 = 0; requestAnimationFrame(loop); }
    }, { threshold: 0.05 }).observe(b3);
  }

  /* ---------- превью работ на главной портфолио ---------- */
  function fitPreviews() {
    var frames = document.querySelectorAll(".work-frame");
    if (!frames.length) return;
    frames.forEach(function (frame) {
      var iframe = frame.querySelector("iframe");
      if (!iframe) return;
      var w = frame.clientWidth;
      if (!w) return;
      var scale = w / 1280;
      iframe.style.transform = "scale(" + scale + ")";
      frame.style.height = Math.round(880 * scale) + "px";
    });
  }
  window.addEventListener("resize", fitPreviews);
  window.addEventListener("load", fitPreviews);
  fitPreviews();

  /* ---------- прогресс прочтения страницы ---------- */
  var progBar = document.querySelector(".progress");
  if (progBar) {
    var upd = function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var p = h > 0 ? Math.min(1, Math.max(0, window.scrollY / h)) : 0;
      progBar.style.width = (p * 100).toFixed(2) + "%";
    };
    window.addEventListener("scroll", upd, { passive: true });
    window.addEventListener("resize", upd);
    upd();
  }

  /* ---------- бегущая строка: дублируем, чтобы шов не был виден ---------- */
  document.querySelectorAll(".ticker-track").forEach(function (track) {
    track.innerHTML = track.innerHTML + track.innerHTML;
  });

  /* ---------- сборщик заказа: позиции, количество, сумма ----------
     Референсы True Burger и W Burger работают как магазин: можно набрать
     позиции и увидеть сумму. Добавляем то же, без бэкенда. */
  var orderRoot = document.querySelector("[data-order]");
  if (orderRoot) {
    var bag = {};
    var ordBar = document.querySelector("[data-order-bar]");
    var qtyEl = document.querySelector("[data-order-qty]");
    var sumEl = document.querySelector("[data-order-sum]");
    var listEl = document.querySelector("[data-order-list]");
    var msgEl = document.querySelector("#mb-msg") || document.querySelector('textarea[name="message"]');

    var render = function () {
      var names = Object.keys(bag), qty = 0, sum = 0;
      names.forEach(function (n) { qty += bag[n].qty; sum += bag[n].qty * bag[n].price; });

      if (qtyEl) qtyEl.textContent = qty;
      if (sumEl) sumEl.textContent = sum.toLocaleString("uk-UA") + " ₴";
      if (ordBar) ordBar.classList.toggle("is-on", qty > 0);

      if (listEl) {
        listEl.innerHTML = names.map(function (n) {
          return '<li><span>' + bag[n].qty + ' × ' + n + '</span><b>' +
            (bag[n].qty * bag[n].price).toLocaleString("uk-UA") + ' ₴</b>' +
            '<button type="button" class="ord-x" data-remove="' + n +
            '" aria-label="Прибрати ' + n + ' з замовлення">×</button></li>';
        }).join("");
      }
      if (msgEl && names.length) {
        msgEl.value = names.map(function (n) { return bag[n].qty + " × " + n; }).join(", ");
      }
      document.querySelectorAll("[data-add]").forEach(function (btn) {
        var n = btn.getAttribute("data-add");
        var inBag = !!bag[n];
        btn.classList.toggle("is-added", inBag);
        btn.setAttribute("aria-label", (inBag ? "Ще одну " : "Додати ") + n);
        var label = btn.querySelector("[data-add-label]");
        if (label) label.textContent = inBag ? "Ще одну" : "Додати";
      });
      if (ordBar) ordBar.setAttribute("aria-live", "polite");
    };

    /* делегируем на документ: список заказа находится в форме, ВНЕ контейнера
       меню, поэтому обработчик на orderRoot его не видел */
    document.addEventListener("click", function (e) {
      var add = e.target.closest("[data-add]");
      if (add) {
        var n = add.getAttribute("data-add");
        var p = parseFloat(add.getAttribute("data-price")) || 0;
        if (!bag[n]) bag[n] = { price: p, qty: 0 };
        bag[n].qty++;
        render();
        return;
      }
      var rm = e.target.closest("[data-remove]");
      if (rm) {
        var key = rm.getAttribute("data-remove");
        if (bag[key] && --bag[key].qty <= 0) delete bag[key];
        render();
      }
    });
    render();
  }

  /* ---------- подбор модели по бюджету и задаче ----------
     APEX в референсе делает квиз «найдите байк за 10 секунд». Покупатель
     не знает моделей, но знает бюджет и где будет ездить.
     Пока фильтр пуст — работают обычные вкладки категорий. Как только
     выбран бюджет или задача, вкладки скрываются и показываются ВСЕ
     подходящие позиции из всех категорий. */
  var picker = document.querySelector("[data-picker]");
  if (picker) {
    var bsel = picker.querySelector('[name="budget"]');
    var tsel = picker.querySelector('[name="task"]');
    var countEl = document.querySelector("[data-picker-count]");
    var totalEl = document.querySelector("[data-picker-total]");
    var countWrap = document.querySelector("[data-picker-count-wrap]");
    var resetEl = document.querySelector("[data-picker-reset]");
    var items = document.querySelectorAll("[data-model]");
    var group = picker.parentElement.querySelector("[data-tabs]");
    var tabsEl = group ? group.querySelector(".tabs") : null;
    var pickPanels = group ? Array.prototype.slice.call(group.querySelectorAll(".panel")) : [];
    var lastTab = 0;
    var wasFiltering = false;

    var apply = function () {
      var filtering = !!(bsel.value || tsel.value);

      /* Панелями управляем ТОЛЬКО на переходах режима.
         Если трогать их постоянно, обработчик вкладок и этот код начинают
         перебивать друг друга — выбранная вкладка откатывалась назад. */
      if (group && pickPanels.length) {
        if (filtering && !wasFiltering) {
          var cur = pickPanels.findIndex(function (p) { return p.classList.contains("is-active"); });
          if (cur >= 0) lastTab = cur;
          pickPanels.forEach(function (p) { p.hidden = false; p.classList.add("is-active"); });
        } else if (!filtering && wasFiltering) {
          pickPanels.forEach(function (p, i) {
            var on = i === lastTab;
            p.classList.toggle("is-active", on);
            p.hidden = !on;
          });
        }
      }
      wasFiltering = filtering;
      if (tabsEl) tabsEl.hidden = filtering;

      var shown = 0;
      items.forEach(function (el) {
        var ok = true;
        if (filtering) {
          var okB = !bsel.value || (el.getAttribute("data-budget") || "").indexOf(bsel.value) >= 0;
          var okT = !tsel.value || (el.getAttribute("data-task") || "").indexOf(tsel.value) >= 0;
          ok = okB && okT;
        }
        el.hidden = !ok;
        if (ok) shown++;
      });
      if (countEl) countEl.textContent = shown;
      if (totalEl) totalEl.textContent = items.length;
      // при пустом фильтре показана одна категория — счётчик по всем 12 только путал бы
      if (countWrap) countWrap.hidden = !filtering;
      if (resetEl) resetEl.hidden = !filtering;
    };

    bsel.addEventListener("change", apply);
    tsel.addEventListener("change", apply);
    /* Клик по вкладке во время активного фильтра: сбрасываем фильтр и
       остаёмся на той вкладке, которую выбрал человек. */
    if (resetEl) {
      resetEl.addEventListener("click", function () {
        bsel.value = "";
        tsel.value = "";
        apply();
      });
    }
    if (tabsEl) {
      tabsEl.addEventListener("click", function (e) {
        if (!wasFiltering) return;                 // обычный режим — не мешаем вкладкам
        var btn = e.target.closest(".tab");
        var idx = btn ? Array.prototype.indexOf.call(tabsEl.querySelectorAll(".tab"), btn) : -1;
        if (idx >= 0) lastTab = idx;
        bsel.value = "";
        tsel.value = "";
        apply();
      });
    }
    apply();
  }
})();
