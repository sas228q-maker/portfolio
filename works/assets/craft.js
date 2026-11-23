/* SiteHunter — «крафтовые» эффекты. Ванильный JS, без React и без зависимостей.
   Приёмы взяты из каталога 21st.dev (Spotlight Card, Tracing Beam) и
   переписаны под статический сайт: только transform/opacity, поддержка
   prefers-reduced-motion, ноль внешних запросов.

   Подключение через атрибуты:
     data-spotlight      — радиальный свет за курсором
     data-magnetic       — кнопка тянется к курсору
     data-reveal-text    — заголовок собирается по словам
     data-beam           — световой луч по SVG-пути при прокрутке
     data-border-beam    — бегущий блик по рамке
*/
(function () {
  "use strict";

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. Spotlight: свет follows курсор ---------- */
  document.querySelectorAll("[data-spotlight]").forEach(function (el) {
    var raf = 0, x = 50, y = 50, pending = false;

    function apply() {
      el.style.setProperty("--sx", x.toFixed(1) + "%");
      el.style.setProperty("--sy", y.toFixed(1) + "%");
      pending = false;
    }
    function onMove(e) {
      var r = el.getBoundingClientRect();
      x = ((e.clientX - r.left) / r.width) * 100;
      y = ((e.clientY - r.top) / r.height) * 100;
      if (!pending) { pending = true; raf = requestAnimationFrame(apply); }
    }
    if (!reduce) {
      el.addEventListener("mousemove", onMove, { passive: true });
      el.addEventListener("mouseleave", function () {
        cancelAnimationFrame(raf);
        pending = false;
      });
    }
  });

  /* ---------- 2. Magnetic: кнопка тягнеться до курсора ---------- */
  if (!reduce) {
    document.querySelectorAll("[data-magnetic]").forEach(function (el) {
      var strength = parseFloat(el.getAttribute("data-magnetic")) || 0.22;
      var max = 14;
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) * strength;
        var dy = (e.clientY - (r.top + r.height / 2)) * strength;
        dx = Math.max(-max, Math.min(max, dx));
        dy = Math.max(-max, Math.min(max, dy));
        el.style.transform = "translate(" + dx.toFixed(1) + "px," + dy.toFixed(1) + "px)";
      });
      el.addEventListener("mouseleave", function () { el.style.transform = ""; });
    });
  }

  /* ---------- 3. Text reveal: заголовок по словам ----------
     Работает только с простыми заголовками (текст и <br>), иначе пропускает,
     чтобы не поломать вложенную разметку.
     Проявление дублируется тремя путями: IntersectionObserver, обработчик
     прокрутки и интервал на первые секунды — иначе при быстрой прокрутке
     заголовок мог остаться невидимым. */
  var revealTargets = [];
  document.querySelectorAll("[data-reveal-text]").forEach(function (el) {
    if (reduce) return;
    if (el.querySelector("svg, img, a, span, i, em, b, strong")) return;

    var lines = el.innerHTML.split(/<br\s*\/?>/i);
    var out = [];
    lines.forEach(function (line, li) {
      var words = line.replace(/<[^>]+>/g, "").trim().split(/\s+/).filter(Boolean);
      out.push(words.map(function (w) {
        return '<span class="rw"><i>' + w + "</i></span>";
      }).join(" "));
      if (li < lines.length - 1) out[out.length - 1] += "<br>";
    });
    el.innerHTML = out.join(" ");
    el.classList.add("has-reveal");
    revealTargets.push({ el: el, spans: el.querySelectorAll(".rw i"), done: false });
  });

  function playReveal(t) {
    if (t.done) return;
    t.done = true;
    Array.prototype.forEach.call(t.spans, function (s, i) {
      s.style.transitionDelay = (i * 55) + "ms";
      s.classList.add("in");
    });
  }

  function checkReveals() {
    var vh = window.innerHeight || 800;
    revealTargets.forEach(function (t) {
      if (t.done) return;
      var r = t.el.getBoundingClientRect();
      if (r.top < vh * 0.92 && r.bottom > 0) playReveal(t);
    });
  }

  if (revealTargets.length) {
    window.addEventListener("scroll", checkReveals, { passive: true });
    window.addEventListener("resize", checkReveals);
    if ("IntersectionObserver" in window) {
      var rvIo = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          var t = revealTargets.find(function (x) { return x.el === e.target; });
          if (t) { playReveal(t); rvIo.unobserve(e.target); }
        });
      }, { threshold: 0.25 });
      revealTargets.forEach(function (t) { rvIo.observe(t.el); });
    }
    var rvGuard = 0;
    var rvId = setInterval(function () {
      checkReveals();
      if (++rvGuard > 20 || revealTargets.every(function (t) { return t.done; })) clearInterval(rvId);
    }, 700);
    checkReveals();
  }

  /* ---------- 4. Tracing beam: луч по кривой при прокрутке ----------
     Тот же приём, что в Tracing Beam: длина обводки связана с прогрессом,
     голова луча идёт по пути через getPointAtLength. */
  document.querySelectorAll("[data-beam]").forEach(function (host) {
    var svg = host.querySelector(".beam-svg");
    var path = host.querySelector(".beam-path");
    var head = host.querySelector(".beam-head");
    if (!svg || !path) return;

    var len = 0;
    function measure() {
      var h = host.offsetHeight || 1;
      var w = 48;
      svg.setAttribute("viewBox", "0 0 " + w + " " + h);
      svg.setAttribute("width", w);
      svg.setAttribute("height", h);
      /* мягкая S-кривая вместо прямой линии */
      path.setAttribute("d", "M" + (w / 2) + ",0 C" + (w * 1.55) + "," + (h * 0.24) +
        " " + (-w * 0.55) + "," + (h * 0.72) + " " + (w / 2) + "," + h);
      len = path.getTotalLength();
      path.style.strokeDasharray = len;
      path.style.strokeDashoffset = len;
      update();
    }

    function update() {
      var r = host.getBoundingClientRect();
      var vh = window.innerHeight || 800;
      var p = (vh * 0.62 - r.top) / (r.height || 1);
      p = Math.max(0, Math.min(1, p));
      if (len) {
        path.style.strokeDashoffset = (len * (1 - p)).toFixed(0);
        if (head) {
          var pt = path.getPointAtLength(len * p);
          head.setAttribute("cx", pt.x.toFixed(1));
          head.setAttribute("cy", pt.y.toFixed(1));
          head.style.opacity = p > 0.02 && p < 0.995 ? "1" : "0";
        }
      }
    }

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", measure);
    window.addEventListener("load", measure);
    measure();
    setTimeout(measure, 600);
  });

  /* ---------- 5. Border beam: блик бежит по рамке ---------- */
  document.querySelectorAll("[data-border-beam]").forEach(function (el) {
    if (reduce) return;
    el.classList.add("has-border-beam");
  });
})();