/* Shared model-viewer treatment for all experiment pages:
   - photoreal pass: commerce tone-mapping, soft grounded contact shadow, longer (24deg) product lens
   - turntable: spin the OBJECT around vertical (lighting/HDRI stays fixed), pause on interaction
   Applies to static AND dynamically-rendered <model-viewer> elements (cat/gso build cards via JS). */
(function () {
  var SPIN_DPS = 24;

  function setup(mv) {
    if (mv.__vx) return; mv.__vx = true;
    mv.removeAttribute('auto-rotate');
    mv.setAttribute('tone-mapping', 'commerce');
    mv.setAttribute('exposure', '1.0');
    mv.setAttribute('shadow-intensity', '1.3');
    mv.setAttribute('shadow-softness', '1');
    mv.setAttribute('field-of-view', '24deg');
    mv.setAttribute('camera-orbit', '0deg 78deg 110%');
    mv.setAttribute('interaction-prompt', 'none');

    function start() {
      try { var c = mv.getBoundingBoxCenter(); mv.cameraTarget = c.x + 'm ' + c.y + 'm ' + c.z + 'm'; } catch (e) {}
      var yaw = 0, last = null, paused = false, idle = null;
      function onInteract() { paused = true; clearTimeout(idle); idle = setTimeout(function () { paused = false; }, 2500); }
      mv.addEventListener('pointerdown', onInteract);
      mv.addEventListener('wheel', onInteract, { passive: true });
      function frame(t) {
        if (last != null && !paused) { yaw = (yaw + SPIN_DPS * (t - last) / 1000) % 360; mv.setAttribute('orientation', '0deg 0deg ' + yaw + 'deg'); }
        last = t; requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }
    if (mv.loaded) start(); else mv.addEventListener('load', start, { once: true });
  }

  function scan(root) {
    if (!root || !root.querySelectorAll) return;
    if (root.tagName === 'MODEL-VIEWER') setup(root);
    root.querySelectorAll('model-viewer').forEach(setup);
  }

  function init() {
    scan(document.body);
    new MutationObserver(function (muts) {
      muts.forEach(function (m) { m.addedNodes.forEach(scan); });
    }).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState !== 'loading') init(); else document.addEventListener('DOMContentLoaded', init);
})();
