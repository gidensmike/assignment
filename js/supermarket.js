/* ==========================================================================
   ASSIGNMENT 2 — MINI SUPERMARKET CHECKOUT SYSTEM (premium dashboard)
   Product names + prices in two arrays, computed with loops.
   ========================================================================== */
(() => {
  "use strict";

  /* ---------- Data (two arrays) ---------- */
  const productNames = [
    "Bread",
    "Milk",
    "Eggs",
    "Rice",
    "Beans",
    "Chicken",
    "Vegetable Oil",
    "Tomato Paste",
    "Sugar",
    "Indomie Noodles",
  ];

  const productPrices = [800, 1500, 1800, 12000, 2000, 4500, 7500, 900, 3500, 1500];

  const naira = (amount) =>
    "\u20A6" + Number(amount).toLocaleString("en-NG", { maximumFractionDigits: 0 });

  /* ---------- Compute statistics (loops) ---------- */
  function computeStats() {
    let totalBill = 0;
    let mostExpensive = { name: productNames[0], price: productPrices[0] };
    let cheapest = { name: productNames[0], price: productPrices[0] };
    let above3000 = [];
    let below2000 = [];

    for (let i = 0; i < productPrices.length; i++) {
      totalBill += productPrices[i];

      if (productPrices[i] > mostExpensive.price) {
        mostExpensive = { name: productNames[i], price: productPrices[i] };
      }
      if (productPrices[i] < cheapest.price) {
        cheapest = { name: productNames[i], price: productPrices[i] };
      }
      if (productPrices[i] > 3000) {
        above3000.push({ name: productNames[i], price: productPrices[i] });
      }
      if (productPrices[i] < 2000) {
        below2000.push({ name: productNames[i], price: productPrices[i] });
      }
    }

    return { totalBill, mostExpensive, cheapest, above3000, below2000 };
  }

  /* ---------- DOM helpers ---------- */
  const $ = (id) => document.getElementById(id);

  /* ---------- Count-up animation ---------- */
  function countUp(el, target, formatter) {
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      el.textContent = formatter ? formatter(target) : String(target);
      return;
    }
    const duration = 700;
    const start = performance.now();
    const from = 0;

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(from + (target - from) * eased);
      el.textContent = formatter ? formatter(current) : String(current);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ---------- Render ---------- */
  function renderAll(animate) {
    const stats = computeStats();

    // Product cards
    const productsEl = $("sm-products");
    if (productsEl) {
      productsEl.innerHTML = productNames
        .map((name, i) => {
          const price = productPrices[i];
          return (
            '<article class="sm-product">' +
            '<div class="sm-product-thumb"><span>' + (i + 1) + "</span></div>" +
            '<div class="sm-product-info">' +
            '<span class="sm-product-name">' + name + "</span>" +
            '<span class="sm-product-price">' + naira(price) + "</span>" +
            "</div>" +
            "</article>"
          );
        })
        .join("");
    }

    // Product table
    const tableBody = $("sm-table-body");
    if (tableBody) {
      tableBody.innerHTML = productNames
        .map((name, i) => {
          return (
            "<tr>" +
            '<td class="sm-table-num">' + (i + 1) + "</td>" +
            "<td>" + name + "</td>" +
            '<td class="sm-table-price">' + naira(productPrices[i]) + "</td>" +
            "</tr>"
          );
        })
        .join("");
    }

    // Stat cards
    countUp($("sm-total-count"), productNames.length);
    countUp($("sm-total"), stats.totalBill, naira);
    countUp($("sm-above-count"), stats.above3000.length);
    countUp($("sm-below-count"), stats.below2000.length);

    if ($("sm-most")) {
      $("sm-most").textContent = stats.mostExpensive.name + " \u2014 " + naira(stats.mostExpensive.price);
    }
    if ($("sm-cheapest")) {
      $("sm-cheapest").textContent = stats.cheapest.name + " \u2014 " + naira(stats.cheapest.price);
    }

    // Chart bars
    const aboveCount = stats.above3000.length;
    const belowCount = stats.below2000.length;
    const maxVal = Math.max(aboveCount, belowCount, 1);
    const barAbove = $("sm-chart-above");
    const barBelow = $("sm-chart-below");
    if (barAbove) barAbove.style.height = (aboveCount / maxVal) * 100 + "%";
    if (barBelow) barBelow.style.height = (belowCount / maxVal) * 100 + "%";
    countUp($("sm-chart-above-val"), aboveCount);
    countUp($("sm-chart-below-val"), belowCount);

    if ($("sm-above-list-count")) {
      $("sm-above-list-count").textContent = aboveCount + " product" + (aboveCount === 1 ? "" : "s");
    }
    if ($("sm-below-list-count")) {
      $("sm-below-list-count").textContent = belowCount + " product" + (belowCount === 1 ? "" : "s");
    }

    // Receipt
    const receiptBody = $("sm-receipt-body");
    if (receiptBody) {
      receiptBody.innerHTML = productNames
        .map((name, i) => {
          return (
            '<div class="sm-receipt-line">' +
            "<span>" + name + "</span>" +
            "<span>" + naira(productPrices[i]) + "</span>" +
            "</div>"
          );
        })
        .join("");
    }
    if ($("sm-receipt-total")) {
      $("sm-receipt-total").textContent = naira(stats.totalBill);
    }
    if ($("sm-receipt-date")) {
      $("sm-receipt-date").textContent =
        new Date().toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" });
    }
  }

  /* ---------- Button interactions ---------- */
  const calcBtn = $("sm-calc");
  const refreshBtn = $("sm-refresh");
  const resetBtn = $("sm-reset");

  if (calcBtn) {
    calcBtn.addEventListener("click", () => {
      renderAll(true);
    });
  }
  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      renderAll(true);
    });
  }
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      // Reset returns the dashboard to its initial state
      renderAll(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // Initial render
  renderAll(true);
})();
