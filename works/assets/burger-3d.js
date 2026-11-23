/* SiteHunter — 3D-бургер на WebGL (Three.js).
   Настоящая геометрия: тела вращения (Lathe), цилиндры, смещение вершин
   для листа салата и текстуры котлеты, инстансы сезама, тени от источника.

   Это не слои 2D-эллипсов: у каждого ингредиента есть объём, и при вращении
   видно его боковую поверхность, толщину и то, как он лежит на нижнем хлебе.
*/
(function () {
  "use strict";

  function V2(x, y) { return new THREE.Vector2(x, y); }

  /* ---------- профили хлеба (Lathe: тело вращения) ---------- */
  var BOTTOM_PROFILE = [
    [0.00, 0.000], [0.62, 0.000], [0.95, 0.030], [1.13, 0.100], [1.225, 0.200],
    [1.250, 0.300], [1.235, 0.380], [1.160, 0.415], [0.000, 0.430]
  ];
  var TOP_PROFILE = [
    [0.00, 1.200], [0.55, 1.205], [0.92, 1.220], [1.120, 1.260], [1.235, 1.340],
    [1.275, 1.460], [1.270, 1.600], [1.225, 1.750], [1.140, 1.900], [1.000, 2.040],
    [0.800, 2.160], [0.550, 2.245], [0.280, 2.278], [0.000, 2.285]
  ];

  function lathe(profile, color, rough) {
    var pts = profile.map(function (p) { return V2(p[0], p[1]); });
    var geo = new THREE.LatheGeometry(pts, 96);
    geo.computeVertexNormals();
    var mat = new THREE.MeshStandardMaterial({
      color: color, roughness: rough, metalness: 0.0, flatShading: false
    });
    var mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  /* ---------- котлета: цилиндр с неровной боковой поверхностью ---------- */
  function patty() {
    var geo = new THREE.CylinderGeometry(1.16, 1.17, 0.44, 96, 6);
    var pos = geo.attributes.position;
    for (var i = 0; i < pos.count; i++) {
      var x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      var r = Math.sqrt(x * x + z * z);
      if (r > 0.5) {
        var a = Math.atan2(z, x);
        /* рваная кромка: сумма двух частот */
        var k = 1 + 0.035 * Math.sin(a * 7 + y * 3) + 0.02 * Math.sin(a * 13 - y * 5);
        pos.setX(i, x * k);
        pos.setZ(i, z * k);
        pos.setY(i, y + 0.012 * Math.sin(a * 5 + y * 8));
      }
    }
    geo.computeVertexNormals();
    var mat = new THREE.MeshStandardMaterial({
      color: 0x4A2E1A, roughness: 0.94, metalness: 0.0
    });
    var m = new THREE.Mesh(geo, mat);
    m.position.y = 0.80;
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
  }

  /* ---------- салат: волнистый обод ---------- */
  function lettuce() {
    var geo = new THREE.CylinderGeometry(1.30, 1.36, 0.10, 128, 3, false);
    var pos = geo.attributes.position;
    for (var i = 0; i < pos.count; i++) {
      var x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      var r = Math.sqrt(x * x + z * z);
      if (r < 0.3) continue;
      var a = Math.atan2(z, x);
      var k = 1 + 0.115 * Math.sin(a * 9) + 0.05 * Math.sin(a * 17 + 1.2);
      pos.setX(i, x * k);
      pos.setZ(i, z * k);
      pos.setY(i, y + 0.028 * Math.sin(a * 9 + 0.6));
    }
    geo.computeVertexNormals();
    var mat = new THREE.MeshStandardMaterial({
      color: 0x5FA83C, roughness: 0.72, metalness: 0.0, flatShading: false,
      side: THREE.DoubleSide
    });
    var m = new THREE.Mesh(geo, mat);
    m.position.y = 1.145;
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
  }

  /* ---------- сыр: восьмиугольная пластина + капли по краю ---------- */
  function cheese() {
    var g = new THREE.Group();
    var mat = new THREE.MeshStandardMaterial({
      color: 0xF2C044, roughness: 0.34, metalness: 0.06
    });

    var slab = new THREE.Mesh(new THREE.CylinderGeometry(1.295, 1.295, 0.075, 8), mat);
    slab.rotation.y = Math.PI / 8;
    slab.castShadow = true;
    slab.receiveShadow = true;
    g.add(slab);

    /* четыре подтёка: тонкие «языки», свисающие с краёв */
    for (var i = 0; i < 4; i++) {
      var a = (i / 4) * Math.PI * 2 + Math.PI / 8;
      var drip = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.20, 0.055), mat);
      drip.position.set(Math.cos(a) * 1.235, -0.10, Math.sin(a) * 1.235);
      drip.rotation.y = -a;
      drip.rotation.x = 0.16 * Math.cos(a);
      drip.castShadow = true;
      g.add(drip);
    }
    g.position.y = 1.055;
    return g;
  }

  /* ---------- томат ---------- */
  function tomato() {
    var mat = new THREE.MeshStandardMaterial({
      color: 0xC0392B, roughness: 0.46, metalness: 0.0
    });
    var m = new THREE.Mesh(new THREE.CylinderGeometry(1.10, 1.115, 0.115, 96), mat);
    m.position.y = 0.505;
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
  }

  /* ---------- сезам: инстансы по куполу ---------- */
  function sesame() {
    var count = 34;
    var geo = new THREE.SphereGeometry(0.043, 7, 5);
    geo.scale(1, 0.62, 1.5);
    var mat = new THREE.MeshStandardMaterial({
      color: 0xF3E3C2, roughness: 0.68, metalness: 0.0
    });
    var inst = new THREE.InstancedMesh(geo, mat, count);
    var dummy = new THREE.Object3D();
    var seed = 7;
    function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }

    for (var i = 0; i < count; i++) {
      var a = rnd() * Math.PI * 2;
      /* угол от вершины: ближе к макушке, но не в самый центр */
      var polar = 0.16 + rnd() * 0.78;
      var sx = 1.19 * Math.sin(polar) * Math.cos(a);
      var sz = 1.19 * Math.sin(polar) * Math.sin(a);
      var sy = 1.44 + 0.80 * Math.cos(polar);
      dummy.position.set(sx, sy, sz);
      dummy.rotation.set(rnd() * 0.5 - 0.25, a + Math.PI / 2, rnd() * 0.4 - 0.2);
      dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
    }
    inst.instanceMatrix.needsUpdate = true;
    inst.castShadow = false;
    return inst;
  }

  /* ---------- сборка ---------- */
  function buildBurger() {
    var g = new THREE.Group();
    g.add(lathe(BOTTOM_PROFILE, 0xD89A50, 0.62));
    g.add(tomato());
    g.add(patty());
    g.add(cheese());
    g.add(lettuce());
    g.add(lathe(TOP_PROFILE, 0xE0A050, 0.58));
    g.add(sesame());
    /* ставим бургер так, чтобы центр вращения был посередине */
    g.position.y = -1.15;
    return g;
  }

  function lights(scene) {
    var hemi = new THREE.HemisphereLight(0xFFE3BF, 0x1A120C, 0.55);
    scene.add(hemi);

    var key = new THREE.DirectionalLight(0xFFFFFF, 3.1);
    key.position.set(3.6, 6.2, 5.0);
    key.castShadow = true;
    key.shadow.mapSize.width = 1024;
    key.shadow.mapSize.height = 1024;
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 20;
    key.shadow.camera.left = -3.2;
    key.shadow.camera.right = 3.2;
    key.shadow.camera.top = 3.2;
    key.shadow.camera.bottom = -3.2;
    key.shadow.bias = -0.0009;
    scene.add(key);

    var rim = new THREE.DirectionalLight(0xFFC27A, 2.0);
    rim.position.set(-4.6, 2.6, -3.8);
    scene.add(rim);

    var fill = new THREE.DirectionalLight(0x8FA6C0, 0.9);
    fill.position.set(-2.5, 1.2, 4.0);
    scene.add(fill);

    scene.add(new THREE.AmbientLight(0x9AA7B8, 0.32));
  }

  function shadowCatcher(scene) {
    var geo = new THREE.PlaneGeometry(9, 9);
    var mat = new THREE.ShadowMaterial({ opacity: 0.42 });
    var plane = new THREE.Mesh(geo, mat);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -1.16;
    plane.receiveShadow = true;
    scene.add(plane);
  }

  function init() {
    var canvas = document.querySelector("[data-burger3d-canvas]");
    if (!canvas) return;

    var stage = window.SH3D && window.SH3D.stage({
      canvas: canvas,
      fov: 36,
      camPos: [0, 0.15, 5.5],
      target: [0, 0.05, 0],
      exposure: 1.02,
      build: function (ctx) {
        lights(ctx.scene);
        shadowCatcher(ctx.scene);
        var burger = buildBurger();
        ctx.root.add(burger);
        ctx.burger = burger;
        /* стартовый наклон — чтобы сразу читался объём */
        ctx.spin.x = 0.06;
        ctx.spin.y = 0.5;
        ctx.root.rotation.y = 0.5;
      },
      frame: function (t, ctx) {
        /* лёгкое «дыхание» по высоте — сцена живая, но не мельтешит */
        if (ctx.burger && !ctx.dragging) {
          ctx.burger.position.y = -1.15 + Math.sin(t * 0.9) * 0.018;
        }
      },
      fallback: function () {
        document.body.classList.add("no-webgl");
      }
    });

    /* подпись-подсказка исчезает после первого перетаскивания */
    if (stage) {
      var hint = document.querySelector("[data-burger3d-hint]");
      canvas.addEventListener("pointerdown", function () {
        if (hint) hint.classList.add("is-hidden");
      }, { once: true });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();