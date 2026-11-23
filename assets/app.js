/* SiteHunter Portfolio — общий интерактив для всех страниц */
(function () {
  "use strict";

  /* ---------- шапка: тень при скролле ---------- */
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- появление блоков ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i % 4, 3) * 70 + "ms";
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- табы (меню в кафе) ---------- */
  document.querySelectorAll("[data-tabs]").forEach(function (group) {
    var tabs = group.querySelectorAll(".tab");
    var panels = group.querySelectorAll(".tab-panel");
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        tabs.forEach(function (t) { t.classList.remove("is-active"); });
        panels.forEach(function (p) { p.classList.remove("is-active"); });
        tab.classList.add("is-active");
        var target = group.querySelector('[data-panel="' + tab.dataset.tab + '"]');
        if (target) target.classList.add("is-active");
      });
    });
  });

  /* ---------- формы: показать подтверждение ---------- */
  document.querySelectorAll("form[data-form]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.querySelector('[name="name"]');
      var phone = form.querySelector('[name="phone"]');
      if (phone && phone.value.replace(/\D/g, "").length < 9) {
        phone.focus();
        phone.style.borderColor = "#ff5c7a";
        setTimeout(function () { phone.style.borderColor = ""; }, 1800);
        return;
      }
      var ok = form.querySelector(".form-success");
      if (ok) {
        var who = name && name.value.trim() ? name.value.trim() : "";
        ok.textContent = (who ? who + ", дякуємо! " : "Дякуємо! ") +
          "Заявку прийнято — зателефонуємо протягом 15 хвилин у робочий час.";
        ok.classList.add("is-visible");
      }
      form.reset();
    });
  });

  /* ---------- год в футере ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- калькулятор в автосервісі ---------- */
  var calc = document.querySelector("[data-calc]");
  if (calc) {
    var checks = calc.querySelectorAll('input[type="checkbox"]');
    // вывод лежит ВНЕ блока чекбоксов, поэтому ищем по документу
    var out = document.querySelector("[data-calc-out]");
    var base = parseInt(calc.dataset.calc, 10) || 0;
    var recalc = function () {
      var sum = base;
      checks.forEach(function (c) { if (c.checked) sum += parseInt(c.dataset.price, 10) || 0; });
      if (out) out.textContent = sum.toLocaleString("uk-UA") + " грн";
    };
    checks.forEach(function (c) { c.addEventListener("change", recalc); });
    recalc();
  }

  /* ---------- точная подгонка превью-фреймов портфолио ---------- */
  function fitPreviews() {
    var frames = document.querySelectorAll(".work-frame");
    if (!frames.length) return;
    var IFRAME_W = 1280, IFRAME_H = 900;
    frames.forEach(function (frame) {
      var iframe = frame.querySelector("iframe");
      if (!iframe) return;
      var w = frame.clientWidth;
      if (!w) return;
      var scale = w / IFRAME_W;
      iframe.style.transform = "scale(" + scale + ")";
      frame.style.height = Math.round(IFRAME_H * scale) + "px";
    });
  }
  window.addEventListener("resize", fitPreviews);
  window.addEventListener("load", fitPreviews);
  fitPreviews();
})();
