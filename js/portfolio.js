/* ==========================================================================
   ASSIGNMENT 1 — PORTFOLIO WEBSITE interactions (premium redesign)
   ========================================================================== */
(() => {
  "use strict";

  const solution = document.querySelector(".pf-hero") ? document : document.querySelector(".pf-solution");
  if (!solution) return;

  /* ---------- Scrollspy for the section sub-nav ---------- */
  const navLinks = Array.from(document.querySelectorAll(".pf-nav-link"));
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  function updateActiveLink() {
    const pos = window.scrollY + 140;
    let currentId = sections[0] ? sections[0].id : null;

    sections.forEach((section) => {
      if (section.offsetTop <= pos) currentId = section.id;
    });

    if (window.scrollY < sections[0].offsetTop - 160) currentId = null;

    navLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${currentId}`;
      link.classList.toggle("active", isActive);
      if (isActive) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        history.replaceState(null, "", link.getAttribute("href"));
      }
    });
  });

  window.addEventListener("scroll", updateActiveLink, { passive: true });
  window.addEventListener("resize", updateActiveLink);
  updateActiveLink();

  /* ---------- Reveal on scroll ---------- */
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

  /* ---------- Projects carousel (infinite loop, pixel-precise) ---------- */
  const carousel = document.getElementById("pf-carousel");
  if (carousel) {
    const track = document.getElementById("pf-carousel-track");
    const prevBtn = document.getElementById("pf-carousel-prev");
    const nextBtn = document.getElementById("pf-carousel-next");
    const dotsWrap = document.getElementById("pf-carousel-dots");
    const viewport = carousel.querySelector(".pf-carousel-viewport");

    let originals = Array.from(carousel.querySelectorAll(".pf-carousel-slide"));
    let slides = originals;
    let index = 0;
    let perView = 1;
    let moving = false;
    const TRANSITION_MS = 600;

    const getPerView = () => {
      if (window.matchMedia("(min-width: 900px)").matches) return 3;
      if (window.matchMedia("(min-width: 640px)").matches) return 2;
      return 1;
    };

    // Pixel-exact step: one full slide + the inter-slide gap.
    const stepWidth = () => {
      if (!slides.length) return 0;
      const gap = parseFloat(getComputedStyle(track).gap) || 0;
      const slideW = viewport ? viewport.clientWidth / perView : slides[0].clientWidth;
      return slideW + gap;
    };

    // Duplicate the first/last slides so the loop has no visible end.
    const buildClones = () => {
      if (!track) return;
      originals.forEach((slide) => {
        const clone = slide.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        clone.classList.add("pf-carousel-clone");
        track.appendChild(clone);
      });
      originals.forEach((slide) => {
        const clone = slide.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        clone.classList.add("pf-carousel-clone");
        track.insertBefore(clone, track.firstChild);
      });
      slides = Array.from(track.children);
    };

    const buildDots = () => {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = "";
      originals.forEach((_, i) => {
        const dot = document.createElement("button");
        dot.className = "pf-carousel-dot";
        dot.type = "button";
        dot.setAttribute("role", "tab");
        dot.setAttribute("aria-label", "Go to slide " + (i + 1));
        dot.addEventListener("click", () => goTo(i));
        dotsWrap.appendChild(dot);
      });
    };

    // Current logical slide index (0-based within originals).
    const currentSlide = () => {
      const n = originals.length;
      return ((index % n) + n) % n;
    };

    const syncDots = () => {
      if (!dotsWrap) return;
      const active = currentSlide();
      Array.from(dotsWrap.children).forEach((dot, i) => {
        dot.classList.toggle("active", i === active);
        dot.setAttribute("aria-selected", String(i === active));
      });
    };

    // Jump without animation (used for the seamless loop reset).
    const jumpTo = (i, animate = true) => {
      index = i;
      const offset = index * stepWidth();
      track.style.transition = animate ? "" : "none";
      track.style.transform = `translate3d(-${offset}px, 0, 0)`;
      if (!animate) {
        // Force reflow so the next transition applies from the new position.
        void track.offsetWidth;
        track.style.transition = "";
      }
      syncDots();
    };

    function goTo(i) {
      if (moving) return;
      const n = originals.length;
      const target = ((i % n) + n) % n;
      const delta = target - currentSlide();

      // Choose the shortest path around the loop.
      const alt = delta > 0 ? delta - n : delta + n;
      const step = Math.abs(alt) < Math.abs(delta) ? alt : delta;

      moving = true;
      jumpTo(index + step);
      window.setTimeout(() => {
        // Snap back to the canonical clone position for the same logical slide.
        jumpTo(currentSlide() + originals.length, false);
        moving = false;
      }, TRANSITION_MS + 40);
    }

    function next() {
      goTo(currentSlide() + 1);
    }

    function prev() {
      goTo(currentSlide() - 1);
    }

    // Arrow buttons
    if (prevBtn) prevBtn.addEventListener("click", prev);
    if (nextBtn) nextBtn.addEventListener("click", next);

    // Mouse drag / swipe (pointer events cover touch + mouse).
    let dragStartX = 0;
    let dragStartY = 0;
    let dragging = false;
    let pointerId = null;

    viewport.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      dragging = true;
      pointerId = e.pointerId;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
    });

    viewport.addEventListener("pointermove", (e) => {
      if (!dragging || e.pointerId !== pointerId) return;
      const dx = e.clientX - dragStartX;
      const dy = e.clientY - dragStartY;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
        track.style.transition = "none";
        track.style.transform = `translate3d(${dx - index * stepWidth()}px, 0, 0)`;
      }
    });

    const endDrag = (e) => {
      if (!dragging || e.pointerId !== pointerId) return;
      dragging = false;
      pointerId = null;
      const dx = e.clientX - dragStartX;
      const dy = e.clientY - dragStartY;
      track.style.transition = "";
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 48) {
        if (dx < 0) next();
        else prev();
      } else {
        // Snap back to the resting position.
        jumpTo(index, false);
      }
    };

    viewport.addEventListener("pointerup", endDrag);
    viewport.addEventListener("pointercancel", endDrag);

    // Prevent native touch scrolling/clicking during a drag.
    viewport.addEventListener("touchmove", (e) => {
      if (dragging && Math.abs(e.touches[0].clientX - dragStartX) > 10) {
        e.preventDefault();
      }
    }, { passive: false });

    viewport.addEventListener("click", (e) => {
      if (Math.abs(e.clientX - dragStartX) > 10) e.preventDefault();
    }, true);

    // Keyboard arrows
    carousel.setAttribute("tabindex", "0");
    carousel.setAttribute("role", "region");
    carousel.setAttribute("aria-label", "Projects carousel");
    carousel.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      }
    });

    // Rebuild on resize (per-view changes alter the geometry).
    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        perView = getPerView();
        jumpTo(currentSlide() + originals.length, false);
        moving = false;
      }, 120);
    });

    // Init
    perView = getPerView();
    buildClones();
    buildDots();
    jumpTo(originals.length, false);
  }

  /* ---------- About Me — See More / See Less (smooth height) ---------- */
  const aboutBody = document.getElementById("pf-about-body");
  const aboutToggle = document.getElementById("pf-about-toggle");
  const aboutLabel = document.getElementById("pf-about-toggle-label");
  const aboutMore = document.querySelectorAll(".pf-about-more");

  if (aboutBody && aboutToggle) {
    const reveal = (open) => {
      aboutToggle.setAttribute("aria-expanded", String(open));
      if (aboutLabel) aboutLabel.textContent = open ? "See Less" : "See More";
      if (aboutBody.classList.contains("pf-about-animating")) return;

      if (open) {
        // Pin the current height so the browser can transition from it.
        aboutBody.style.height = `${aboutBody.offsetHeight}px`;
        aboutBody.classList.add("pf-about-open");
        aboutBody.classList.add("pf-about-animating");
        aboutMore.forEach((p) => (p.hidden = false));
        // Let the content reflow, then animate to full height.
        requestAnimationFrame(() => {
          aboutBody.style.height = `${aboutBody.scrollHeight}px`;
        });
      } else {
        aboutBody.classList.add("pf-about-animating");
        aboutBody.style.height = `${aboutBody.scrollHeight}px`;
        // Let the browser paint at full height, then animate down.
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            aboutBody.classList.remove("pf-about-open");
            aboutBody.style.height = "0px";
          });
        });
      }

      const done = () => {
        aboutBody.classList.remove("pf-about-animating");
        if (!open) aboutMore.forEach((p) => (p.hidden = true));
        aboutBody.style.height = "";
      };
      aboutBody.addEventListener("transitionend", done, { once: true });
    };

    aboutToggle.addEventListener("click", () => {
      reveal(aboutToggle.getAttribute("aria-expanded") !== "true");
    });
  }

  /* ---------- Scroll to top ---------- */
  const scrollTop = document.getElementById("scroll-top");
  if (scrollTop) {
    const reduceMotion =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

  /* ---------- Contact form (no alerts) ---------- */
  const form = document.getElementById("pf-contact-form");
  const statusEl = document.getElementById("pf-form-status");
  if (form && statusEl) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const message = form.message.value.trim();

      if (!name || !email || !message) {
        statusEl.textContent = "Please fill in all fields.";
        statusEl.className = "pf-form-status error";
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        statusEl.textContent = "Please enter a valid email address.";
        statusEl.className = "pf-form-status error";
        return;
      }

      // No backend — simulate a successful send and reset
      statusEl.textContent = "Thanks, " + name + "! Your message has been sent.";
      statusEl.className = "pf-form-status success";
      form.reset();
    });
  }
})();
