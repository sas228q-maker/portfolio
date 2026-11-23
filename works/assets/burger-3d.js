/* SiteHunter — 3D-бургер на WebGL (Three.js).
   Настоящая геометрия: тела вращения (Lathe), цилиндры со смещением вершин,
   инстансы сезама, тени от источника.

   Качество поверхности: процедурные карты рельефа (canvas -> CanvasTexture)
   используются как bumpMap. Без них чёрные булочки выглядят как крашеный
   пластик: у них нет ни пор, ни неровностей корочки.
*/
(function () {
  "use strict";

  function V2(x, y) { return new THREE.Vector2(x, y); }

  var _texCache = {};

  /* ---------- процедурный шум: несколько октав value-noise ----------
     Дешево (несколько миллисекунд) и не требует ни одной внешней картинки. */
  function noiseCanvas(size, cells, octaves, seed) {
    var c = document.createElement("canvas");
    c.width = c.height = size;
    var ctx = c.getContext("2d");
    var img = ctx.createImageData(size, size);
    var d = img.data;

    function mulberry32(a) {
      return function () {
        a |= 0; a = a + 0x6D2B79F5 | 0;
        var t = Math.imul(a ^ a >>> 15, 1 | a);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
      };
    }
    var rnd = mulberry32(seed || 1);

    var layers = [], n = cells;
    for (var o = 0; o < octaves; o++) {
      var g = [];
      for (var y = 0; y <= n; y++) {
        g[y] = [];
        for (var x = 0; x <= n; x++) g[y][x] = rnd();
      }
      layers.push({ g: g, n: n });
      n *= 2;
    }

    function sample(L, fx, fy) {
      var m = L.n, G = L.g;
      var x0 = Math.floor(fx), y0 = Math.floor(fy);
      var tx = fx - x0, ty = fy - y0;
      var sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
      var a = G[y0 % m][x0 % m], b = G[y0 % m][(x0 + 1) % m];
      var cc = G[(y0 + 1) % m][x0 % m], dd = G[(y0 + 1) % m][(x0 + 1) % m];
      return (a * (1 - sx) + b * sx) * (1 - sy) + (cc * (1 - sx) + dd * sx) * sy;
    }

    for (var py = 0; py < size; py++) {
      for (var px = 0; px < size; px++) {
        var v = 0, amp = 0.5, tot = 0;
        for (var li = 0; li < layers.length; li++) {
          var L = layers[li];
          v += sample(L, px / size * L.n, py / size * L.n) * amp;
          tot += amp; amp *= 0.5;
        }
        var k = Math.round((v / tot) * 255);
        var i = (py * size + px) * 4;
        d[i] = d[i + 1] = d[i + 2] = k;
        d[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    return c;
  }

  function bump(key, cells, octaves, repeat, seed) {
    if (_texCache[key]) return _texCache[key];
    var t = new THREE.CanvasTexture(noiseCanvas(256, cells, octaves, seed));
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat, repeat);
    t.anisotropy = 4;
    _texCache[key] = t;
    return t;
  }


  /* ---------- карта котлеты: пятна прожарки + полосы от гриля ----------
     Без неё котлета — однотонный коричневый цилиндр, и это сразу читается
     как «игрушка». UV цилиндра тянется по окружности, поэтому полосы
     выходят косыми — как следы решётки. */
  function pattyCanvas() {
    var c = document.createElement("canvas");
    c.width = c.height = 256;
    var x = c.getContext("2d");
    x.fillStyle = "#5A3A20";
    x.fillRect(0, 0, 256, 256);

    /* пятна разной прожарки */
    var seed = 3;
    function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    for (var i = 0; i < 90; i++) {
      var rx = rnd() * 256, ry = rnd() * 256, r = 10 + rnd() * 34;
      var g = x.createRadialGradient(rx, ry, 0, rx, ry, r);
      var dark = rnd() > 0.45;
      g.addColorStop(0, dark ? "rgba(40,22,10,0.55)" : "rgba(140,92,52,0.35)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      x.fillStyle = g;
      x.beginPath(); x.arc(rx, ry, r, 0, Math.PI * 2); x.fill();
    }

    /* полосы от гриля */
    x.strokeStyle = "rgba(26,12,4,0.62)";
    x.lineWidth = 11;
    x.lineCap = "round";
    for (var k = 0; k < 9; k++) {
      x.beginPath();
      x.moveTo(-30, k * 30 + 6);
      x.lineTo(286, k * 30 - 14);
      x.stroke();
    }
    var t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(1, 1);
    t.anisotropy = 4;
    return t;
  }

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

  function lathe(profile, color, rough, bumpKey) {
    var pts = profile.map(function (p) { return V2(p[0], p[1]); });
    var geo = new THREE.LatheGeometry(pts, 144);

    /* Неровность поверхности: смещаем вершины по радиусу на доли процента.
       Без этого корочка читается как крашеный пластик. */
    var pos = geo.attributes.position;
    for (var i = 0; i < pos.count; i++) {
      var x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      var ang = Math.atan2(z, x);
      var nz = 0.009 * Math.sin(ang * 11 + y * 9) + 0.005 * Math.sin(ang * 23 - y * 15);
      var rl = Math.sqrt(x * x + z * z) || 1;
      pos.setX(i, x + (x / rl) * nz);
      pos.setZ(i, z + (z / rl) * nz);
      pos.setY(i, y + nz * 0.45);
    }
    geo.computeVertexNormals();

    /* Чёрная булочка: матовая корочка, лишь лёгкий блик по куполу.
       clearcoat намеренно маленький — иначе выглядит как лак. */
    var mat = new THREE.MeshPhysicalMaterial({
      color: color, roughness: rough, metalness: 0.0,
      clearcoat: 0.05, clearcoatRoughness: 0.85,
      bumpMap: bumpKey ? bump(bumpKey, 16, 6, 9, 11) : null,
      bumpScale: 0.115,
      /* корочка неоднородна: где-то матовее, где-то блестит сильнее */
      roughnessMap: bumpKey ? bump(bumpKey + "R", 8, 3, 4, 17) : null
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
        var k = 1 + 0.038 * Math.sin(a * 7 + y * 3) + 0.022 * Math.sin(a * 13 - y * 5);
        pos.setX(i, x * k);
        pos.setZ(i, z * k);
        pos.setY(i, y + 0.014 * Math.sin(a * 5 + y * 8));
      }
    }
    geo.computeVertexNormals();
    var mat = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF, map: pattyCanvas(), roughness: 0.94, metalness: 0.0,
      bumpMap: bump("patty", 18, 5, 6, 29), bumpScale: 0.075
    });
    var m = new THREE.Mesh(geo, mat);
    m.position.y = 0.80;
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
  }

  /* ---------- салат: волнистый обод ---------- */
  function lettuce() {
    var geo = new THREE.CylinderGeometry(1.30, 1.36, 0.10, 160, 4, false);
    var pos = geo.attributes.position;
    for (var i = 0; i < pos.count; i++) {
      var x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      var r = Math.sqrt(x * x + z * z);
      if (r < 0.3) continue;
      var a = Math.atan2(z, x);
      /* три частоты: край получается рваным, а не «звёздочкой» */
      var k = 1 + 0.125 * Math.sin(a * 9) + 0.055 * Math.sin(a * 17 + 1.2)
                + 0.02 * Math.sin(a * 31 + 0.4);
      pos.setX(i, x * k);
      pos.setZ(i, z * k);
      pos.setY(i, y + 0.034 * Math.sin(a * 9 + 0.6) + 0.014 * Math.sin(a * 21));
    }
    geo.computeVertexNormals();
    var mat = new THREE.MeshPhysicalMaterial({
      color: 0x4E8F33, roughness: 0.62, metalness: 0.0,
      side: THREE.DoubleSide,
      sheen: 0.4, sheenColor: new THREE.Color(0x9BD46A), sheenRoughness: 0.8,
      bumpMap: bump("let", 14, 4, 7, 47), bumpScale: 0.055,
      clearcoat: 0.34, clearcoatRoughness: 0.34
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
    var mat = new THREE.MeshPhysicalMaterial({
      color: 0xF2C044, roughness: 0.30, metalness: 0.05,
      clearcoat: 0.30, clearcoatRoughness: 0.45,
      sheen: 0.25, sheenColor: new THREE.Color(0xFFE08A), sheenRoughness: 0.6
    });

    var slab = new THREE.Mesh(new THREE.CylinderGeometry(1.295, 1.295, 0.075, 8), mat);
    slab.rotation.y = Math.PI / 8;
    slab.castShadow = true;
    slab.receiveShadow = true;
    g.add(slab);

    /* подтёки: «языки» свисают с краёв под разными углами */
    for (var i = 0; i < 4; i++) {
      var a = (i / 4) * Math.PI * 2 + Math.PI / 8;
      var drip = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.22, 0.055), mat);
      drip.position.set(Math.cos(a) * 1.235, -0.105, Math.sin(a) * 1.235);
      drip.rotation.y = -a;
      drip.rotation.x = 0.18 * Math.cos(a);
      drip.castShadow = true;
      g.add(drip);
    }
    g.position.y = 1.055;
    return g;
  }

  /* ---------- томат: срез с неровным краем ---------- */
  function tomato() {
    var geo = new THREE.CylinderGeometry(1.10, 1.115, 0.115, 128, 1);
    var pos = geo.attributes.position;
    for (var i = 0; i < pos.count; i++) {
      var x = pos.getX(i), z = pos.getZ(i);
      var a = Math.atan2(z, x);
      var k = 1 + 0.018 * Math.sin(a * 6) + 0.010 * Math.sin(a * 15);
      pos.setX(i, x * k);
      pos.setZ(i, z * k);
    }
    geo.computeVertexNormals();
    var mat = new THREE.MeshPhysicalMaterial({
      color: 0xB33224, roughness: 0.38, metalness: 0.0,
      clearcoat: 0.34, clearcoatRoughness: 0.40,
      bumpMap: bump("tom", 16, 4, 6, 71), bumpScale: 0.02
    });
    var m = new THREE.Mesh(geo, mat);
    m.position.y = 0.505;
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
  }

  /* ---------- сезам: инстансы по куполу ---------- */
  function sesame() {
    var count = 34;
    var geo = new THREE.SphereGeometry(0.043, 8, 6);
    geo.scale(1, 0.62, 1.5);
    var mat = new THREE.MeshStandardMaterial({
      color: 0xC9B493, roughness: 0.78, metalness: 0.0
    });
    var inst = new THREE.InstancedMesh(geo, mat, count);
    var dummy = new THREE.Object3D();
    var seed = 7;
    function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }

    for (var i = 0; i < count; i++) {
      var a = rnd() * Math.PI * 2;
      var polar = 0.16 + rnd() * 0.78;
      dummy.position.set(
        1.19 * Math.sin(polar) * Math.cos(a),
        1.44 + 0.80 * Math.cos(polar),
        1.19 * Math.sin(polar) * Math.sin(a)
      );
      dummy.rotation.set(rnd() * 0.5 - 0.25, a + Math.PI / 2, rnd() * 0.4 - 0.2);
      dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
    }
    inst.instanceMatrix.needsUpdate = true;
    return inst;
  }

  /* ---------- сборка ---------- */
  function buildBurger() {
    var g = new THREE.Group();
    g.add(lathe(BOTTOM_PROFILE, 0x241C16, 0.80, "bunB"));
    g.add(tomato());
    g.add(patty());
    g.add(cheese());
    g.add(lettuce());
    g.add(lathe(TOP_PROFILE, 0x2A211A, 0.76, "bunT"));
    g.add(sesame());
    g.position.y = -1.15;
    return g;
  }

  function lights(scene) {
    scene.add(new THREE.HemisphereLight(0xFFE3BF, 0x1A120C, 0.40));

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

    var rim = new THREE.DirectionalLight(0xFFC27A, 3.2);
    rim.position.set(-4.6, 2.6, -3.8);
    scene.add(rim);

    var fill = new THREE.DirectionalLight(0x8FA6C0, 0.85);
    fill.position.set(-2.5, 1.2, 4.0);
    scene.add(fill);

    scene.add(new THREE.AmbientLight(0x9AA7B8, 0.16));
  }

  function shadowCatcher(scene) {
    var plane = new THREE.Mesh(
      new THREE.PlaneGeometry(9, 9),
      new THREE.ShadowMaterial({ opacity: 0.45 })
    );
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
      camPos: [-1.35, 0.15, 5.5],
      target: [-1.35, 0.05, 0],
      exposure: 1.02,
      /* объект смещён вправо от центра, чтобы текст слева его не закрывал.
         На узких экранах сдвиг уменьшаем — иначе бургер уедет за край. */
      onResize: function (ctx) {
        var w = ctx.renderer.domElement.getBoundingClientRect().width || 1200;
        var shift = w > 1000 ? -1.35 : (w > 700 ? -0.75 : 0);
        ctx.camera.position.x = shift;
        ctx.camera.lookAt(shift, 0.05, 0);
      },
      build: function (ctx) {
        lights(ctx.scene);
        shadowCatcher(ctx.scene);
        var burger = buildBurger();
        ctx.root.add(burger);
        ctx.burger = burger;
        ctx.spin.x = 0.06;
        ctx.spin.y = 0.5;
        ctx.root.rotation.y = 0.5;
      },
      frame: function (t, ctx) {
        if (ctx.burger && !ctx.dragging) {
          ctx.burger.position.y = -1.15 + Math.sin(t * 0.9) * 0.018;
        }
      },
      fallback: function () {
        document.body.classList.add("no-webgl");
      }
    });

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