/* SiteHunter — SVG-спрайт иконок. Никаких эмодзи: всё векторное.
   Использование: <svg class="ic"><use href="#i-phone"></use></svg> */
(function () {
  "use strict";

  var P = {
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.1 9.9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.9z"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 2"/>',
    instagram: '<rect x="2" y="2" width="20" height="20" rx="5.5"/><circle cx="12" cy="12" r="4"/><circle cx="17.6" cy="6.4" r="1.1" fill="currentColor" stroke="none"/>',
    send: '<path d="M21.5 2.5 10.8 13.2"/><path d="M21.5 2.5 14.7 21.5l-3.9-8.3-8.3-3.9 19-6.8z"/>',
    star: '<path d="M12 2.6l2.9 5.9 6.5.95-4.7 4.6 1.1 6.5L12 17.5l-5.8 3.05 1.1-6.5-4.7-4.6 6.5-.95z"/>',
    check: '<path d="M20 6 9 17.5 4 12.5"/>',
    checkCircle: '<circle cx="12" cy="12" r="9.5"/><path d="M8 12.4l2.6 2.6L16 9.6"/>',
    arrowRight: '<path d="M4.5 12h15"/><path d="m13 5.5 6.5 6.5-6.5 6.5"/>',
    arrowUp: '<path d="M12 19.5V4.5"/><path d="m5.5 11 6.5-6.5 6.5 6.5"/>',
    chevronDown: '<path d="m6 9.5 6 6 6-6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    close: '<path d="M18 6 6 18M6 6l12 12"/>',

    burger: '<path d="M3 11.2a9 9 0 0 1 18 0z"/><path d="M3 14.4c2-1.3 4-1.3 6 0s4 1.3 6 0 4-1.3 6 0"/><path d="M3.4 17.6h17.2"/><path d="M4.6 20.6h14.8a1.6 1.6 0 0 0-1.6-1.6H6.2a1.6 1.6 0 0 0-1.6 1.6z"/>',
    fries: '<path d="M6.5 9.5V6.8a1.3 1.3 0 0 1 2.6 0v2.7"/><path d="M10.7 9.5V4.6a1.3 1.3 0 0 1 2.6 0v4.9"/><path d="M14.9 9.5V6.4a1.3 1.3 0 0 1 2.6 0v3.1"/><path d="M5.4 9.5h13.2l-1.2 10.9a1.4 1.4 0 0 1-1.4 1.2H8a1.4 1.4 0 0 1-1.4-1.2z"/>',
    cup: '<path d="M7 3.5h10l-1.1 16.2a1.4 1.4 0 0 1-1.4 1.3h-5a1.4 1.4 0 0 1-1.4-1.3z"/><path d="M6.6 8.4h10.8"/>',
    pizza: '<path d="M12 3 3.2 20.4a18.4 18.4 0 0 0 17.6 0z"/><circle cx="11" cy="10" r="1.4"/><circle cx="14.5" cy="15" r="1.4"/><circle cx="9" cy="16" r="1.4"/>',
    coffee: '<path d="M4 8.5h13.5v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M17.5 10h1.3a3.1 3.1 0 0 1 0 6.2h-1.3"/><path d="M8 3v3M12 3v3"/>',
    cake: '<path d="M3.5 20.5h17"/><path d="M5.5 20.5v-5.8a3 3 0 0 1 3-3h7a3 3 0 0 1 3 3v5.8"/><path d="M12 11.7V8"/><path d="M8.5 8h7"/>',

    scissors: '<circle cx="6.2" cy="6.2" r="2.8"/><circle cx="6.2" cy="17.8" r="2.8"/><path d="M20 4 8.3 15.7"/><path d="M14.6 14.6 20 20"/><path d="M8.3 8.3 12 12"/>',
    sparkle: '<path d="M12 3 14 9l6 2-6 2-2 6-2-6-6-2 6-2z"/><path d="M19 3.5v3M17.5 5h3M5.5 16v2.6M4.2 17.3h2.6"/>',
    polish: '<path d="M9.4 13.6 15 8l3.4 3.4-5.6 5.6z"/><path d="m8.4 15.5-2.9 4 4-2.9"/><path d="M15.4 7.6 17 6a2.1 2.1 0 0 1 3 3l-1.6 1.6"/>',
    eye: '<path d="M2.2 12S6 5.8 12 5.8 21.8 12 21.8 12 18 18.2 12 18.2 2.2 12 2.2 12z"/><circle cx="12" cy="12" r="3.1"/>',
    heart: '<path d="M20.8 5.6a5 5 0 0 0-7.1 0L12 7.3l-1.7-1.7a5 5 0 1 0-7.1 7.1L12 21.5l8.8-8.8a5 5 0 0 0 0-7.1z"/>',
    drop: '<path d="M12 2.6 6.7 8.2a7.5 7.5 0 1 0 10.6 0z"/>',
    flower: '<circle cx="12" cy="12" r="2.6"/><path d="M12 9.4c0-3 1-5.4 3-5.4s2.4 2.6.6 5.4M14.6 12c3 0 5.4 1 5.4 3s-2.6 2.4-5.4.6M12 14.6c0 3-1 5.4-3 5.4s-2.4-2.6-.6-5.4M9.4 12c-3 0-5.4-1-5.4-3s2.6-2.4 5.4-.6"/>',

    bike: '<circle cx="5.6" cy="17.4" r="3.6"/><circle cx="18.4" cy="17.4" r="3.6"/><path d="M9.2 17.4h5.6l4.2-9.4"/><path d="M9.2 17.4 12.4 8H9"/><path d="M15.5 8h3.4"/>',
    moto: '<circle cx="5" cy="17.6" r="3.4"/><circle cx="19" cy="17.6" r="3.4"/><path d="M8.4 17.6h7.2"/><path d="m13.4 17.6 3-8.4h3.2"/><path d="M9.2 9.2h4.6l2.4 8.4"/>',
    scooter: '<circle cx="5.2" cy="17.8" r="3.2"/><circle cx="18.8" cy="17.8" r="3.2"/><path d="M8.4 17.8h7.2"/><path d="M14.4 17.8 16.4 7.6h3"/><path d="M9 7.6h4.6"/>',
    wheel: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><path d="M12 3.2v5.8M12 15v5.8M3.2 12H9M15 12h5.8"/>',
    wrench: '<path d="M14.6 6.2a1 1 0 0 0 0 1.4l1.8 1.8a1 1 0 0 0 1.4 0l3.6-3.6a6.2 6.2 0 0 1-8.2 8.2l-6.3 6.3a2.1 2.1 0 0 1-3-3l6.3-6.3a6.2 6.2 0 0 1 8.2-8.2z"/>',
    shield: '<path d="M12 21.6s8-4.1 8-10.2V5.1L12 2 4 5.1v6.3c0 6.1 8 10.2 8 10.2z"/><path d="M9 12.2l2.2 2.2 4-4.2"/>',
    gauge: '<path d="M4.3 18.2a10 10 0 1 1 15.4 0"/><path d="m12 13.4 5.6-5.2"/><circle cx="12" cy="14.4" r="1.6"/>',
    battery: '<rect x="2.2" y="7" width="17" height="10" rx="2.6"/><path d="M21.6 10.4v3.2"/><path d="M6 10.6v2.8M10 10.6v2.8M14 10.6v2.8"/>',
    oil: '<path d="M3 16.8h13.4a3.6 3.6 0 0 0 3.6-3.6V9.4l-4.4-1.6H9.4L7 10.4H3z"/><path d="M6.4 10.4V7.6h6"/><path d="M20 12.4h1.8"/>',
    snow: '<path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9"/>',

    tooth: '<path d="M12 3.6c-4.1 0-6.2 2.2-6.2 5.2 0 2 .5 3 .8 5.1.3 1.7.4 4.5 1.8 4.5 1.3 0 1.3-2.8 1.8-4.5.3-1.1.8-1.8 1.8-1.8s1.5.7 1.8 1.8c.5 1.7.5 4.5 1.8 4.5 1.4 0 1.5-2.8 1.8-4.5.3-2.1.8-3.1.8-5.1 0-3-2.1-5.2-6.2-5.2z"/>',
    smile: '<circle cx="12" cy="12" r="9.2"/><path d="M8 14.2s1.5 2.4 4 2.4 4-2.4 4-2.4"/><path d="M9.2 9.6v.6M14.8 9.6v.6"/>',
    syringe: '<path d="M18.6 2.4 21.6 5.4"/><path d="m16.4 7.6-1.9-1.9"/><path d="m13.6 4.6 5.8 5.8"/><path d="m10.6 7.6 5.8 5.8"/><path d="m9.2 11.6-6.4 6.4v3.6h3.6l6.4-6.4"/>',
    stetho: '<path d="M6 3v6a5 5 0 0 0 10 0V3"/><path d="M11 14v1.6a4 4 0 0 0 8 0V13"/><circle cx="19" cy="10.4" r="2.4"/>',
    award: '<circle cx="12" cy="9" r="5.8"/><path d="M9.2 14.2 7.6 21.4 12 19l4.4 2.4-1.6-7.2"/>',
    calendar: '<rect x="3.2" y="5" width="17.6" height="16" rx="2.6"/><path d="M8 3v4M16 3v4M3.2 11h17.6"/>',
    percent: '<path d="M19 5 5 19"/><circle cx="6.8" cy="6.8" r="2.6"/><circle cx="17.2" cy="17.2" r="2.6"/>',
    truck: '<path d="M1.6 5.6h13.8v11.2H1.6z"/><path d="M15.4 8.6h3.9l3.1 3.1v5.1h-7z"/><circle cx="5.8" cy="18.8" r="2.4"/><circle cx="18.2" cy="18.8" r="2.4"/>',
    users: '<path d="M16.4 20.6v-1.9a4 4 0 0 0-4-4H5.6a4 4 0 0 0-4 4v1.9"/><circle cx="9" cy="7.4" r="3.8"/><path d="M22.4 20.6v-1.9a4 4 0 0 0-3-3.9"/><path d="M15.6 3.8a4 4 0 0 1 0 7.4"/>',
    flame: '<path d="M12 2.4s4.2 4.8 4.2 8.8a4.2 4.2 0 0 1-8.4 0c0-.9.3-1.8.3-1.8s-2.5 2.1-2.5 5.1a6.4 6.4 0 0 0 12.8 0c0-4.8-6.4-12.1-6.4-12.1z"/>',
    leaf: '<path d="M11 20.4A7.4 7.4 0 0 1 3.6 13c0-5.2 4.2-9.4 9.4-9.4h7.4V11a7.4 7.4 0 0 1-7.4 7.4z"/><path d="M3.6 20.4C7 15.6 11.4 12.6 17 11"/>',
    card: '<rect x="2.2" y="5" width="19.6" height="14" rx="2.6"/><path d="M2.2 10h19.6"/>',
    mail: '<rect x="2.2" y="4.4" width="19.6" height="15.2" rx="2.6"/><path d="m2.8 7 9.2 6 9.2-6"/>',
    camera: '<path d="M21.6 19a2.4 2.4 0 0 1-2.4 2.4H4.8A2.4 2.4 0 0 1 2.4 19V8.6a2.4 2.4 0 0 1 2.4-2.4h3.9l1.9-2.8h6.8l1.9 2.8h3.9a2.4 2.4 0 0 1 2.4 2.4z"/><circle cx="12" cy="13.4" r="3.8"/>',
    box: '<path d="m21 8.2-9-5.2-9 5.2v7.6l9 5.2 9-5.2z"/><path d="m3 8.2 9 5.2 9-5.2"/><path d="M12 13.4v10"/>',
    tag: '<path d="M20.6 12.6 12.7 20.5a2 2 0 0 1-2.8 0L2.6 13.2V3.4h9.8l8.2 8.2a1 1 0 0 1 0 1z"/><circle cx="7.2" cy="8" r="1.4"/>',
    search: '<circle cx="11" cy="11" r="7.4"/><path d="m20.6 20.6-4.4-4.4"/>',
    hand: '<path d="M8.4 11V4.6a1.8 1.8 0 0 1 3.6 0V10"/><path d="M12 10V3.6a1.8 1.8 0 0 1 3.6 0V10"/><path d="M15.6 10.6V5.6a1.8 1.8 0 0 1 3.6 0v9.8a6.6 6.6 0 0 1-6.6 6.6h-1a6.6 6.6 0 0 1-6.6-6.6v-3a1.8 1.8 0 0 1 3.6 0"/>',
    baby: '<circle cx="12" cy="8" r="5"/><path d="M9.8 7.4v.4M14.2 7.4v.4"/><path d="M10.2 10.4s.8 1 1.8 1 1.8-1 1.8-1"/><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>',
    gift: '<rect x="3" y="8.6" width="18" height="4.4" rx="1.4"/><path d="M4.6 13v6.6a1.8 1.8 0 0 0 1.8 1.8h11.2a1.8 1.8 0 0 0 1.8-1.8V13"/><path d="M12 8.6v12.8"/><path d="M12 8.6S10.6 3 8 3a2.6 2.6 0 0 0 0 5.6z"/><path d="M12 8.6S13.4 3 16 3a2.6 2.6 0 0 1 0 5.6z"/>',
    route: '<circle cx="6" cy="19" r="2.6"/><circle cx="18" cy="5" r="2.6"/><path d="M8.6 19h6.4a3.4 3.4 0 0 0 0-6.8h-6a3.4 3.4 0 0 1 0-6.8h6.4"/>',
    quote: '<path d="M9.4 6.4C6.4 7.4 4.6 10 4.6 13.2c0 2.6 1.6 4.4 3.9 4.4 2 0 3.5-1.5 3.5-3.5 0-1.9-1.3-3.3-3.1-3.3-.3 0-.6 0-.9.1.4-1.5 1.6-2.7 3.2-3.3z"/><path d="M19.4 6.4c-3 1-4.8 3.6-4.8 6.8 0 2.6 1.6 4.4 3.9 4.4 2 0 3.5-1.5 3.5-3.5 0-1.9-1.3-3.3-3.1-3.3-.3 0-.6 0-.9.1.4-1.5 1.6-2.7 3.2-3.3z"/>'
  };

  var symbols = "";
  for (var k in P) { if (P.hasOwnProperty(k)) {
    symbols += '<symbol id="i-' + k + '" viewBox="0 0 24 24">' + P[k] + "</symbol>";
  } }

  var sprite = '<svg xmlns="http://www.w3.org/2000/svg" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true" focusable="false">'
    + '<defs><style>symbol{fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}'
    + 'symbol .solid,.solid{fill:currentColor;stroke:none}</style></defs>' + symbols + "</svg>";

  function inject() {
    if (document.getElementById("sh-sprite")) return;
    var d = document.createElement("div");
    d.id = "sh-sprite";
    d.setAttribute("aria-hidden", "true");
    d.style.cssText = "position:absolute;width:0;height:0;overflow:hidden";
    d.innerHTML = sprite;
    document.body.insertBefore(d, document.body.firstChild);
  }

  if (document.body) inject();
  else document.addEventListener("DOMContentLoaded", inject);
})();
