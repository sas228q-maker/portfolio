/* SiteHunter — интерактив клиентских сайтов: меню, анимации, 3D-наклон, счётчики. */
(function () {
  "use strict";

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- шапка ---------- */
  var hdr = document.querySelector(".hdr");
  function onScroll() {
    if (hdr) hdr.classList.toggle("is-stuck", window.scrollY > 12);
    var up = document.querySelector(".up");
    if (up) up.classList.toggle("is-on", window.scrollY > 700);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- мобильное меню ---------- */
  var burger = document.querySelector(".burger");
  var menu = document.querySelector(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      burger.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    menu.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        menu.classList.remove("is-open");
        burger.classList.remove("is-open");
      }
    });
  }

  /* ---------- кнопка наверх ---------- */
  var up = document.querySelector(".up");
  if (up) up.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  });

  /* ---------- появление блоков ----------
     Надёжная схема: IntersectionObserver даёт красивое появление, а
     scroll-проверка гарантирует, что ни один блок не останется невидимым
     (например, если страницу прокрутили слишком быстро). */
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
        el.style.transitionDelay = Math.min(i % 5, 4) * 60 + "ms";
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
    window.addEventListener("load", onRvScroll);

    /* Сразу показываем то, что уже на экране, плюс подстраховка на случай
       быстрой прокрутки, поздней загрузки шрифтов и смены раскладки. */
    revealAll();
    requestAnimationFrame(revealAll);
    [200, 600, 1400, 2600].forEach(function (d) { setTimeout(revealAll, d); });
    var guard = 0;
    var guardId = setInterval(function () {
      revealAll();
      if (++guard > 20 || document.querySelectorAll(".rv:not(.is-in)").length === 0) {
        clearInterval(guardId);
      }
    }, 700);
  }

  /* ---------- счётчики ---------- */
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
          var p = Math.min(1, (ts - t0) / 1400);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased).toLocaleString("uk-UA") + suffix;
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.4 });
    counters.forEach(function (c) { cio.observe(c); });
  }

  /* ---------- вкладки ---------- */
  document.querySelectorAll("[data-tabs]").forEach(function (group) {
    var tabs = group.querySelectorAll(".tab");
    var panels = group.querySelectorAll(".panel");
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        tabs.forEach(function (t) { t.classList.remove("is-active"); });
        panels.forEach(function (p) { p.classList.remove("is-active"); });
        tab.classList.add("is-active");
        var t = group.querySelector('[data-panel="' + tab.dataset.tab + '"]');
        if (t) t.classList.add("is-active");
      });
    });
  });

  /* ---------- формы ---------- */
  document.querySelectorAll("form[data-form]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var phone = form.querySelector('[name="phone"]');
      if (phone && phone.value.replace(/\D/g, "").length < 9) {
        phone.focus();
        phone.style.borderColor = "#ff5c7a";
        setTimeout(function () { phone.style.borderColor = ""; }, 1800);
        return;
      }
      var name = form.querySelector('[name="name"]');
      var ok = form.querySelector(".ok-msg");
      if (ok) {
        var who = name && name.value.trim() ? name.value.trim() + ", " : "";
        ok.textContent = "";
        var svg = '<svg class="ic" aria-hidden="true"><use href="#i-checkCircle"></use></svg>';
        ok.innerHTML = svg + "<span>" + who + "дякуємо! Заявку прийнято — зв'яжемося протягом 15 хвилин у робочий час.</span>";
        ok.classList.add("is-on");
      }
      form.reset();
    });
  });

  /* ---------- бегущая строка: дублируем для бесшовности ---------- */
  document.querySelectorAll(".marquee-track").forEach(function (track) {
    track.innerHTML = track.innerHTML + track.innerHTML;
  });

  /* ---------- 3D-наклон картинки за курсором ---------- */
  if (!reduce) {
    document.querySelectorAll("[data-tilt]").forEach(function (el) {
      var max = parseFloat(el.dataset.tilt) || 14;
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

  /* ---------- бургер: слои «дихають», поки видно ---------- */
  var b3 = document.querySelector("[data-burger3d]");
  if (b3 && !reduce && "IntersectionObserver" in window) {
    var running = false, t0 = 0, visible = false;
    function loop(ts) {
      if (!visible) { running = false; return; }
      if (!t0) t0 = ts;
      var t = (ts - t0) / 1000;
      // плавне «дихання» 0…18px плюс крихітне погойдування шарів
      var s = (Math.sin(t * 0.9) * 0.5 + 0.5) * 18;
      b3.style.setProperty("--spread", s.toFixed(1) + "px");
      requestAnimationFrame(loop);
    }
    var bio = new IntersectionObserver(function (es) {
      visible = es[0].isIntersecting;
      if (visible && !running) { running = true; t0 = 0; requestAnimationFrame(loop); }
    }, { threshold: 0.05 });
    bio.observe(b3);
  }
})();
