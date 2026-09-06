/*
  Little Big Minds — centralised language switch (EN / PL).
  ONE shared file used by every page, so the logic lives in a single place.

  How it works:
  - Any element with data-en="..." data-pl="..." gets its text swapped on switch.
    (Text that sits next to an icon is wrapped in its own <span data-en data-pl>,
     so we never delete the icon.)
  - The header toggle is <button class="lang"><span data-set="en">EN</span> / <span data-set="pl">PL</span></button>.
  - The chosen language is remembered in localStorage, so it stays across pages.
  - To add a 3rd language later: add data-xx attributes + a <span data-set="xx"> and nothing else changes.
*/
(function () {
  function apply(lang) {
    document.querySelectorAll("[data-en]").forEach(function (el) {
      var t = el.getAttribute("data-" + lang);
      if (t !== null) el.textContent = t;
    });
    document.documentElement.lang = lang;
    document.querySelectorAll(".lang span[data-set]").forEach(function (s) {
      s.classList.toggle("on", s.getAttribute("data-set") === lang);
    });
    try { localStorage.setItem("lbm_lang", lang); } catch (e) {}
  }

  function init() {
    document.querySelectorAll(".lang span[data-set]").forEach(function (s) {
      s.addEventListener("click", function () { apply(s.getAttribute("data-set")); });
    });
    var l = "en";
    try { l = localStorage.getItem("lbm_lang") || "en"; } catch (e) {}
    apply(l);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
  window.LBMsetLang = apply; // available if other scripts need it
})();
