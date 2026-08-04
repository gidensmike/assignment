/* ==========================================================================
   LANDING PAGE — interactions for index.html only
   Entrance animation, scroll cue, and button ripples.
   Respects prefers-reduced-motion.
   ========================================================================== */
(() => {
  "use strict";

  const reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.body.classList.add("landing");

  /* ---------- Staggered hero entrance ---------- */
  const riseEls = document.querySelectorAll(".landing .hero [data-rise]");
  riseEls.forEach((el, i) => {
    el.style.transitionDelay = `${i * 110}ms`;
  });
  // Let the first paint settle, then fade the hero in.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.body.classList.add("is-loaded");
    });
  });

  /* ---------- Scroll cue fades once the user scrolls ---------- */
  const cue = document.querySelector(".landing .scroll-cue");
  if (cue) {
    const onScroll = () => {
      if (window.scrollY > 40) {
        cue.classList.add("is-hidden");
        window.removeEventListener("scroll", onScroll);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Scroll to top ---------- */
  const scrollTop = document.getElementById("scroll-top");
  if (scrollTop) {
    const onScroll = () => {
      if (window.scrollY > 320) {
        scrollTop.classList.add("is-visible");
      } else {
        scrollTop.classList.remove("is-visible");
      }
    };
    const scrollToTop = () => {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    };
    scrollTop.addEventListener("click", scrollToTop);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Button ripple ---------- */
  document.querySelectorAll(".landing .btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      if (reduceMotion) return;
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const ripple = document.createElement("span");
      ripple.className = "btn-ripple";
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
      btn.appendChild(ripple);
      ripple.addEventListener("animationend", () => ripple.remove());
    });
  });
})();
