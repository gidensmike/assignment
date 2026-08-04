/* ==========================================================================
   DEVELOPMENT GUIDE — accordion + interactions for guide.html only
   Smooth expand/collapse, deep-link TOC support, reduced-motion safe.
   ========================================================================== */
(() => {
  "use strict";

  const reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const accordions = Array.from(document.querySelectorAll(".gd-acc"));

  /* ---------- Open / close one accordion ---------- */
  const setOpen = (acc, open, scroll = false) => {
    if (!acc) return;
    const isOpen = acc.classList.contains("is-open");
    if (open === isOpen) {
      if (open && scroll) {
        acc.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      }
      return;
    }
    acc.classList.toggle("is-open", open);
    const head = acc.querySelector(".gd-acc-head");
    if (head) head.setAttribute("aria-expanded", String(open));
    if (open && scroll) {
      // Wait for the expand animation to settle before scrolling into view.
      window.setTimeout(() => {
        acc.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      }, reduceMotion ? 0 : 420);
    }
  };

  /* ---------- Header clicks ---------- */
  accordions.forEach((acc) => {
    const head = acc.querySelector(".gd-acc-head");
    if (!head) return;
    head.addEventListener("click", () => {
      setOpen(acc, !acc.classList.contains("is-open"));
    });
  });

  /* ---------- TOC / deep links open the matching accordion ---------- */
  const openAccForHash = (hash) => {
    if (!hash) return;
    const target = document.querySelector(hash);
    if (!target) return;
    // If the hash points at an accordion, open it.
    if (target.classList.contains("gd-acc")) {
      setOpen(target, true, true);
      return;
    }
    // Otherwise, find the nearest enclosing accordion and open it.
    const acc = target.closest(".gd-acc");
    if (acc) setOpen(acc, true, true);
  };

  document.querySelectorAll(".gd-toc-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      const hash = link.getAttribute("href");
      e.preventDefault();
      history.replaceState(null, "", hash);
      openAccForHash(hash);
    });
  });

  // Deep-link on initial load (e.g. #gd-acc-portfolio)
  openAccForHash(window.location.hash);

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
})();
