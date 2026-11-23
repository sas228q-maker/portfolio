/* SiteHunter — переиспользуемая WebGL-основа для 3D-сцен.
   Зависимость: vendor/three.min.js (UMD, локально, без CDN).

   Зачем своя обёртка: нужен предсказуемый каркас (рендер, свет, тени,
   вращение мышью, пауза когда сцена не видна) — чтобы новые 3D-сцены
   добавлялись десятком строк, а не заново каждый раз.

   Использование:
     var stage = SH3D.stage({
       canvas: el,
       fov: 38,
       camPos: [0, 1.5, 4.6],
       target: [0, 1.05, 0],
       build: function (ctx) { ctx.root.add(myMesh); },
       frame: function (t, ctx, dt) { ... }   // необязательный колбэк кадра
     });
*/
(function () {
  "use strict";

  function supports() {
    try {
      var c = document.createElement("canvas");
      return !!(window.WebGLRenderingContext &&
        (c.getContext("webgl2") || c.getContext("webgl")));
    } catch (e) { return false; }
  }

  function stage(opts) {
    var canvas = opts.canvas;
    if (!canvas || !window.THREE || !supports()) {
      if (opts.fallback) opts.fallback();
      return null;
    }

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: canvas, antialias: true, alpha: true,
        powerPreference: "high-performance"
      });
    } catch (e) {
      if (opts.fallback) opts.fallback();
      return null;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    if (THREE.ACESFilmicToneMapping) {
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = opts.exposure || 1.05;
    }
    if (THREE.SRGBColorSpace && "outputColorSpace" in renderer) {
      renderer.outputColorSpace = THREE.SRGBColorSpace;
    }

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(opts.fov || 38, 1, 0.1, 100);
    var cp = opts.camPos || [0, 1.5, 4.6];
    camera.position.set(cp[0], cp[1], cp[2]);
    var tg = opts.target || [0, 1, 0];
    camera.lookAt(tg[0], tg[1], tg[2]);

    /* корень: всё, что нужно вращать мышью, кладём сюда */
    var root = new THREE.Group();
    scene.add(root);

    var ctx = {
      THREE: THREE, scene: scene, camera: camera, renderer: renderer,
      root: root, pointer: { x: 0, y: 0 }, dragging: false,
      spin: { x: 0, y: 0 }, autoSpin: 0.22
    };

    if (opts.build) opts.build(ctx);

    /* --- размеры --- */
    function resize() {
      var r = canvas.getBoundingClientRect();
      var w = Math.max(1, Math.round(r.width));
      var h = Math.max(1, Math.round(r.height));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener("resize", resize);

    /* хук: сцене нужно пересчитать что-то своё при смене размера
       (например, сдвиг камеры на широком экране) */
    if (opts.onResize) {
      opts.onResize(ctx);
      window.addEventListener("resize", function () { opts.onResize(ctx); });
    }

    /* --- вращение мышью и пальцем --- */
    var px = 0, py = 0, idleTimer = 0;

    function down(e) {
      ctx.dragging = true;
      idleTimer = 0;
      px = e.clientX; py = e.clientY;
      canvas.setPointerCapture && canvas.setPointerCapture(e.pointerId);
    }
    function move(e) {
      if (!ctx.dragging) return;
      var dx = e.clientX - px, dy = e.clientY - py;
      px = e.clientX; py = e.clientY;
      ctx.spin.y += dx * 0.009;
      ctx.spin.x = Math.max(-0.28, Math.min(0.28, ctx.spin.x + dy * 0.004));
    }
    function up() {
      ctx.dragging = false;
      idleTimer = 0;
    }
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);
    canvas.addEventListener("pointerleave", up);

    /* --- пауза, когда сцена вне экрана: не жжём батарею --- */
    var visible = true;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        visible = es[0].isIntersecting;
        if (visible) clock.start();
      }, { threshold: 0.02 }).observe(canvas);
    }

    var clock = new THREE.Clock();
    var raf = 0;
    var reduce = window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function loop() {
      raf = requestAnimationFrame(loop);
      if (!visible) return;
      var dt = Math.min(clock.getDelta(), 0.05);
      var t = clock.elapsedTime;

      /* докрутка после отпускания + мягкое авто-вращение в простое */
      if (!ctx.dragging) {
        idleTimer += dt;
        if (!reduce && idleTimer > 1.2) {
          ctx.spin.y += ctx.autoSpin * dt;
          ctx.spin.x += (0 - ctx.spin.x) * Math.min(1, dt * 1.4);
        }
      }
      root.rotation.y += (ctx.spin.y - root.rotation.y) * Math.min(1, dt * 9);
      root.rotation.x += (ctx.spin.x - root.rotation.x) * Math.min(1, dt * 9);

      if (opts.frame) opts.frame(t, ctx, dt);
      renderer.render(scene, camera);
    }
    loop();

    /* остановить при уходе со страницы */
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) { cancelAnimationFrame(raf); }
      else { clock.start(); cancelAnimationFrame(raf); loop(); }
    });

    ctx.destroy = function () { cancelAnimationFrame(raf); renderer.dispose(); };
    return ctx;
  }

  window.SH3D = { stage: stage, supports: supports };
})();