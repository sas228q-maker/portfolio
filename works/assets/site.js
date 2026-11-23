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
    var panels = group.querySelectorAll(".panel");
    if (!tabs.length) return;

    function activate(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.classList.toggle("is-active", on);
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
      });
      panels.forEach(function (p) { p.classList.remove("is-active"); p.hidden = true; });
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

  /* ---------- формы: понятный статус, защита от двойной отправки ---------- */
  document.querySelectorAll("form[data-form]").forEach(function (form) {
    var status = form.querySelector(".status");
    if (status) status.setAttribute("aria-live", "polite");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var tel = form.querySelector('input[type="tel"]');
      if (tel && tel.value.replace(/\D/g, "").length < 9) {
        tel.focus();
        tel.setAttribute("aria-invalid", "true");
        setTimeout(function () { tel.removeAttribute("aria-invalid"); }, 2200);
        return;
      }
      var btn = form.querySelector('button[type="submit"]');
      var label = btn ? btn.textContent : "";
      if (btn) { btn.disabled = true; btn.textContent = "Надсилаємо..."; }
      // демонстрационный макет: реального запроса нет
      setTimeout(function () {
        if (btn) { btn.disabled = false; btn.textContent = label; }
        if (status) {
          var nameEl = form.querySelector('input[name="name"]');
          var who = nameEl && nameEl.value.trim() ? nameEl.value.trim() + ", " : "";
          status.innerHTML = '<svg class="ic" aria-hidden="true"><use href="#i-checkCircle"></use></svg>' +
            "<span>" + who + "заявку прийнято. Зателефонуємо протягом 15 хвилин у робочий час.</span>";
          status.classList.add("is-on");
        }
        form.reset();
      }, 420);
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
})();
