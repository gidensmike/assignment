/* ==========================================================================
   MAIN — Shared behaviour across the whole project
   ========================================================================== */
(() => {
  "use strict";

  /* ---------- Side navigation (generated from one config) ---------- */
  const NAV_PAGES = [
    { href: "index.html", label: "Home", icon: "home" },
    { href: "portfolio.html", label: "Portfolio Website", icon: "code" },
    { href: "supermarket.html", label: "Supermarket Checkout", icon: "cart" },
    { href: "student.html", label: "Student Management", icon: "users" },
    { href: "library.html", label: "Library Manager", icon: "book" },
    { href: "cart.html", label: "Shopping Cart", icon: "bag" },
  ];

  // Documentation section — visually separated below the assignment links
  const NAV_DOC = [{ href: "guide.html", label: "Development Guide", icon: "doc" }];

  const ICONS = {
    home:
      '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><path d="M9 22V12h6v10"></path>',
    code:
      '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><path d="M15 3h6v6"></path><path d="M10 14 21 3"></path>',
    cart:
      '<path d="M3 3h2l.4 2M7 13h10l4-8H5.4"></path><path d="M7 13 5.4 5H3"></path><circle cx="9" cy="20" r="1.5"></circle><circle cx="17" cy="20" r="1.5"></circle>',
    users:
      '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>',
    book:
      '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>',
    bag:
      '<circle cx="9" cy="21" r="1.5"></circle><circle cx="20" cy="21" r="1.5"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>',
    doc:
      '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><path d="M14 2v6h6"></path><path d="M16 13H8"></path><path d="M16 17H8"></path><path d="M10 9H8"></path>',
  };

  const currentPage = location.pathname.split("/").pop() || "index.html";

  function renderSideNav() {
    const mount = document.getElementById("side-nav");
    if (!mount) return;

    const buildLink = (p) => {
      const active = p.href === currentPage;
      return (
        '<a href="' + p.href + '" class="side-nav-link' + (active ? " active" : "") +
        '"' + (active ? ' aria-current="page"' : "") + ">" +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        ICONS[p.icon] +
        "</svg>" +
        "<span>" + p.label + "</span>" +
        "</a>"
      );
    };

    const links = NAV_PAGES.map(buildLink).join("");
    const docLinks = NAV_DOC.map(buildLink).join("");

    mount.innerHTML =
      '<div class="side-nav-head">' +
      '<a href="index.html" class="side-nav-brand">' +
      '<span class="brand-mark" aria-hidden="true">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>' +
      "</span>" +
      '<span class="brand-text">' +
      '<span class="brand-title">ArvysTech Assignment 2026</span>' +
      '<span class="brand-sub">Frontend Development Projects</span>' +
      "</span>" +
      "</a>" +
      '<button class="side-nav-close" type="button" aria-label="Close navigation menu">' +
      '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"></path></svg>' +
      "</button>" +
      "</div>" +
      '<div class="side-nav-body">' +
      '<p class="side-nav-label">Menu</p>' +
      links +
      '<div class="side-nav-divider" role="separator" aria-label="Documentation"></div>' +
      '<p class="side-nav-label">Documentation</p>' +
      docLinks +
      "</div>" +
      '<div class="side-nav-foot">' +
      '<button class="theme-toggle" type="button" aria-label="Toggle dark mode" aria-pressed="false">' +
      '<svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"></path></svg>' +
      '<svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>' +
      '<span class="theme-toggle-label">Dark</span>' +
      "</button>" +
      "</div>";
  }

  renderSideNav();

  /* ---------- Side nav open/close ---------- */
  const sideNav = document.querySelector(".side-nav");
  const navTrigger = document.querySelector(".nav-trigger");
  const navOverlay = document.querySelector(".nav-overlay");

  const openNav = () => {
    if (!sideNav) return;
    sideNav.classList.add("is-open");
    if (navOverlay) navOverlay.classList.add("is-open");
    document.body.style.overflow = "hidden";
    sideNav.setAttribute("aria-hidden", "false");
    if (navTrigger) navTrigger.setAttribute("aria-expanded", "true");
  };

  const closeNav = () => {
    if (!sideNav) return;
    sideNav.classList.remove("is-open");
    if (navOverlay) navOverlay.classList.remove("is-open");
    document.body.style.overflow = "";
    // On desktop the sidebar is always visible — keep it accessible there.
    if (!window.matchMedia("(min-width: 992px)").matches) {
      sideNav.setAttribute("aria-hidden", "true");
    } else {
      sideNav.setAttribute("aria-hidden", "false");
    }
    if (navTrigger) navTrigger.setAttribute("aria-expanded", "false");
  };

  if (navTrigger) navTrigger.addEventListener("click", openNav);
  if (navOverlay) navOverlay.addEventListener("click", closeNav);

  // Sidebar close (×) button — generated by renderSideNav(), wire it once.
  const closeBtn = document.querySelector(".side-nav-close");
  if (closeBtn && !closeBtn.dataset.bound) {
    closeBtn.dataset.bound = "true";
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      closeNav();
    });
  }

  if (sideNav) {
    // Only hide from assistive tech when the drawer is closed on mobile.
    // On desktop the sidebar is always visible and must stay accessible.
    const syncAriaHidden = () => {
      const isDesktop = window.matchMedia("(min-width: 992px)").matches;
      sideNav.setAttribute("aria-hidden", String(!isDesktop && !sideNav.classList.contains("is-open")));
    };
    syncAriaHidden();
    window.addEventListener("resize", syncAriaHidden);

    sideNav.addEventListener("click", (e) => {
      if (e.target.closest("a")) closeNav();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeNav();
    });

    // Swipe-to-close on touch devices
    let startX = 0;
    sideNav.addEventListener(
      "touchstart",
      (e) => {
        startX = e.touches[0].clientX;
      },
      { passive: true }
    );
    sideNav.addEventListener(
      "touchmove",
      (e) => {
        if (e.touches[0].clientX - startX < -40) closeNav();
      },
      { passive: true }
    );
  }

  /* ---------- Theme toggle wiring (inside generated sidebar) ---------- */
  const bindThemeToggle = () => {
    const toggle = document.querySelector(".theme-toggle");
    if (!toggle) return;

    const syncLabel = () => {
      const theme = document.documentElement.getAttribute("data-theme");
      const label = toggle.querySelector(".theme-toggle-label");
      if (label) label.textContent = theme === "dark" ? "Light" : "Dark";
      toggle.setAttribute("aria-pressed", String(theme === "dark"));
    };

    toggle.addEventListener("click", () => {
      window.toggleTheme();
      syncLabel();
    });

    syncLabel();
  };

  bindThemeToggle();

  /* ---------- Reveal-on-scroll ---------- */
  // The portfolio page runs its own reveal logic (portfolio.js); skip it here
  // to avoid double observers.
  if (!document.body.classList.contains("pf-page")) {
    const revealEls = document.querySelectorAll("[data-reveal]");
    if (revealEls.length && "IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-revealed");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
      );

      revealEls.forEach((el, i) => {
        const siblings = el.parentElement
          ? el.parentElement.querySelectorAll("[data-reveal]")
          : [el];
        const index = Array.prototype.indexOf.call(siblings, el);
        el.style.setProperty("--reveal-delay", `${(index % 4) * 90}ms`);
        observer.observe(el);
      });
    } else {
      revealEls.forEach((el) => el.classList.add("is-revealed"));
    }
  }
})();
