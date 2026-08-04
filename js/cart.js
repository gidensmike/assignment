/* ==========================================================================
   ASSIGNMENT 5 — SHOPPING CART SYSTEM (premium e-commerce dashboard)
   Each item is { name, price, quantity }. All functions return values.
   ========================================================================== */
(() => {
  "use strict";

  /* ---------- State ---------- */
  let cart = [
    { name: "Wireless Mouse", price: 4500, quantity: 2 },
    { name: "USB-C Cable", price: 1500, quantity: 3 },
    { name: "Laptop Stand", price: 12000, quantity: 1 },
    { name: "Desk Lamp", price: 8500, quantity: 1 },
  ];

  const VAT_RATE = 0.075; // 7.5%
  let receiptNumber = 1001;

  const naira = (amount) =>
    "\u20A6" + Number(amount).toLocaleString("en-NG", { maximumFractionDigits: 0 });

  /* ---------- Core functions (all return values) ---------- */

  // Add an item; returns the added/updated item
  function addItem(name, price, quantity) {
    const existing = cart.find((item) => item.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      existing.quantity += quantity;
      return existing;
    }
    const item = { name, price, quantity };
    cart.push(item);
    return item;
  }

  // Remove an item by name; returns true if removed
  function removeItem(name) {
    const index = cart.findIndex((item) => item.name.toLowerCase() === name.toLowerCase());
    if (index === -1) return false;
    cart.splice(index, 1);
    return true;
  }

  // Increase quantity; returns the new quantity
  function increaseQuantity(name) {
    const item = cart.find((i) => i.name.toLowerCase() === name.toLowerCase());
    if (!item) return 0;
    item.quantity += 1;
    return item.quantity;
  }

  // Decrease quantity; returns the new quantity (removes at 0)
  function decreaseQuantity(name) {
    const item = cart.find((i) => i.name.toLowerCase() === name.toLowerCase());
    if (!item) return 0;
    item.quantity -= 1;
    if (item.quantity <= 0) {
      removeItem(name);
      return 0;
    }
    return item.quantity;
  }

  // Subtotal (sum of price x quantity)
  function calculateSubtotal() {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  // VAT on the subtotal
  function calculateVAT() {
    return calculateSubtotal() * VAT_RATE;
  }

  // Total = subtotal + VAT
  function calculateTotal() {
    return calculateSubtotal() + calculateVAT();
  }

  // Most expensive item by unit price
  function findMostExpensiveItem() {
    if (!cart.length) return null;
    return cart.reduce((best, item) => (item.price > best.price ? item : best), cart[0]);
  }

  /* ---------- UI helpers ---------- */
  const $ = (id) => document.getElementById(id);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Toast notifications */
  function toast(message, type) {
    const wrap = $("ct-toast-wrap");
    if (!wrap) return;
    const el = document.createElement("div");
    el.className = "ct-toast " + type;
    el.setAttribute("role", "status");
    el.innerHTML =
      '<span class="ct-toast-icon" aria-hidden="true">' +
      (type === "success" ? "✓" : "!") +
      "</span><span>" + message + "</span>";
    wrap.appendChild(el);

    setTimeout(() => {
      el.classList.add("is-leaving");
      setTimeout(() => el.remove(), 320);
    }, 3200);
  }

  /* Count-up animation for money */
  function countUpMoney(el, target) {
    if (!el) return;
    if (reducedMotion) {
      el.textContent = naira(target);
      return;
    }
    const duration = 650;
    const start = performance.now();
    const from = Number(el.textContent.replace(/[^0-9.]/g, "")) || 0;
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(from + (target - from) * eased);
      el.textContent = naira(current);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* Count-up animation for plain numbers */
  function countUp(el, target) {
    if (!el) return;
    if (reducedMotion) {
      el.textContent = String(target);
      return;
    }
    const duration = 650;
    const start = performance.now();
    const from = Number(el.textContent) || 0;
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = String(Math.round(from + (target - from) * eased));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  const initials = (name) =>
    name
      .split(" ")
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase();

  /* ---------- Display receipt ---------- */
  function displayReceipt() {
    const body = $("ct-receipt-body");
    if (!body) return;

    const date = new Date();
    const dateStr = date.toLocaleDateString("en-NG", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    if ($("ct-receipt-meta")) {
      $("ct-receipt-meta").textContent =
        "Receipt #" + receiptNumber + " · " + dateStr;
    }

    if (!cart.length) {
      body.innerHTML = '<p class="ct-empty">Your cart is empty. Add an item to see a receipt.</p>';
      $("ct-receipt-sub").textContent = naira(0);
      $("ct-receipt-vat").textContent = naira(0);
      $("ct-receipt-total").textContent = naira(0);
      return;
    }

    const lines = cart
      .map(
        (item) =>
          '<div class="ct-receipt-line">' +
          "<span>" + item.name + " × " + item.quantity + "</span>" +
          "<span>" + naira(item.price * item.quantity) + "</span>" +
          "</div>"
      )
      .join("");

    body.innerHTML = lines + '<div class="ct-receipt-sep"></div>';

    $("ct-receipt-sub").textContent = naira(calculateSubtotal());
    $("ct-receipt-vat").textContent = naira(calculateVAT());
    $("ct-receipt-total").textContent = naira(calculateTotal());
  }

  /* ---------- Render everything ---------- */
  function render() {
    const subtotal = calculateSubtotal();
    const vat = calculateVAT();
    const total = calculateTotal();
    const most = findMostExpensiveItem();

    // Dashboard stats
    countUp($("ct-item-count"), cart.length);
    countUp($("ct-qty-count"), cart.reduce((s, i) => s + i.quantity, 0));
    countUpMoney($("ct-subtotal"), subtotal);
    countUpMoney($("ct-vat"), vat);
    countUpMoney($("ct-total"), total);
    if ($("ct-most")) {
      $("ct-most").textContent = most ? most.name + " \u2014 " + naira(most.price) : "\u2014";
    }

    // Cart cards
    const cardsEl = $("ct-cart-list");
    if (cardsEl) {
      if (!cart.length) {
        cardsEl.innerHTML = '<p class="ct-empty">Your cart is empty.</p>';
      } else {
        cardsEl.innerHTML = cart
          .map(
            (item) =>
              '<article class="ct-item">' +
              '<div class="ct-item-thumb">' + initials(item.name) + "</div>" +
              '<div class="ct-item-info">' +
              '<div class="ct-item-name">' + item.name + "</div>" +
              '<div class="ct-item-price">' + naira(item.price) + " each</div>" +
              "</div>" +
              '<div class="ct-item-controls">' +
              '<button type="button" class="ct-qty-btn" data-inc="' + item.name + '" aria-label="Increase quantity of ' + item.name + '">+</button>' +
              '<span class="ct-qty">Qty ' + item.quantity + "</span>" +
              '<button type="button" class="ct-qty-btn" data-dec="' + item.name + '" aria-label="Decrease quantity of ' + item.name + '"' + (item.quantity <= 1 ? " disabled" : "") + ">−</button>" +
              '<button type="button" class="btn btn-danger btn-sm" data-remove="' + item.name + '">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path><path d="M10 11v6M14 11v6"></path></svg>' +
              "Remove</button>" +
              "</div>" +
              '<div class="ct-item-sub">' + naira(item.price * item.quantity) + "</div>" +
              "</article>"
          )
          .join("");
      }
    }

    // Table
    const tableBody = $("ct-table-body");
    if (tableBody) {
      if (!cart.length) {
        tableBody.innerHTML =
          '<tr><td colspan="5"><p class="ct-empty">Your cart is empty.</p></td></tr>';
      } else {
        tableBody.innerHTML = cart
          .map(
            (item) =>
              "<tr>" +
              '<td class="ct-table-name">' + item.name + "</td>" +
              "<td>" + naira(item.price) + "</td>" +
              '<td class="ct-table-qty">' + item.quantity + "</td>" +
              '<td class="ct-table-line">' + naira(item.price * item.quantity) + "</td>" +
              "<td>" +
              '<button type="button" class="ct-qty-btn" data-inc="' + item.name + '" aria-label="Increase quantity of ' + item.name + '">+</button> ' +
              '<button type="button" class="ct-qty-btn" data-dec="' + item.name + '" aria-label="Decrease quantity of ' + item.name + '">−</button> ' +
              '<button type="button" class="btn btn-danger btn-sm" data-remove="' + item.name + '">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path><path d="M10 11v6M14 11v6"></path></svg>' +
              "Remove</button>" +
              "</td>" +
              "</tr>"
          )
          .join("");
      }
    }

    // Order summary
    countUpMoney($("ct-sum-subtotal"), subtotal);
    countUpMoney($("ct-sum-vat"), vat);
    countUpMoney($("ct-sum-total"), total);

    // Breakdown bars (subtotal vs vat share of total)
    const totalForBar = Math.max(total, 1);
    const barSub = $("ct-sum-bar-sub");
    const barVat = $("ct-sum-bar-vat");
    if (barSub) barSub.style.width = Math.min(100, (subtotal / totalForBar) * 100) + "%";
    if (barVat) barVat.style.width = Math.min(100, (vat / totalForBar) * 100) + "%";

    // Analytics — quantity distribution
    const qtyChart = $("ct-qty-chart");
    if (qtyChart) {
      const maxQty = Math.max(...cart.map((i) => i.quantity), 1);
      qtyChart.innerHTML = cart.length
        ? cart
            .map(
              (item) =>
                '<div class="ct-hbar-row">' +
                '<span class="ct-hbar-label" title="' + item.name + '">' + item.name + "</span>" +
                '<div class="ct-hbar-track"><div class="ct-hbar-fill" style="width:' +
                (item.quantity / maxQty) * 100 + '%"></div></div>' +
                '<span class="ct-hbar-val">' + item.quantity + "</span>" +
                "</div>"
            )
            .join("")
        : '<p class="ct-empty">No items.</p>';
    }

    // Analytics — price comparison (vertical bars)
    const priceChart = $("ct-price-chart");
    if (priceChart) {
      const maxPrice = Math.max(...cart.map((i) => i.price), 1);
      priceChart.innerHTML = cart.length
        ? cart
            .map((item) => {
              const short =
                item.name.length > 9 ? item.name.slice(0, 9) + "…" : item.name;
              return (
                '<div class="ct-vbar-col" title="' + item.name + '">' +
                '<span class="ct-vbar-val">' + naira(item.price) + "</span>" +
                '<div class="ct-vbar" style="height:' +
                (item.price / maxPrice) * 100 + '%"></div>' +
                '<span class="ct-vbar-label">' + short + "</span>" +
                "</div>"
              );
            })
            .join("")
        : '<p class="ct-empty">No items.</p>';
    }

    // Analytics — spending breakdown
    const spendEl = $("ct-spend");
    if (spendEl) {
      const maxLine = Math.max(...cart.map((i) => i.price * i.quantity), 1);
      spendEl.innerHTML = cart.length
        ? cart
            .map(
              (item) =>
                '<div class="ct-spend-row">' +
                '<span class="ct-spend-label" title="' + item.name + '">' + item.name + "</span>" +
                '<div class="ct-spend-track"><div class="ct-spend-fill" style="width:' +
                ((item.price * item.quantity) / maxLine) * 100 + '%"></div></div>' +
                '<span class="ct-spend-val">' + naira(item.price * item.quantity) + "</span>" +
                "</div>"
            )
            .join("")
        : '<p class="ct-empty">No items.</p>';
    }

    // Receipt
    displayReceipt();
  }

  /* ---------- Events ---------- */

  // Add item form
  const addForm = $("ct-add-form");
  if (addForm) {
    addForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = addForm["ct-name"].value.trim();
      const price = Number(addForm["ct-price"].value);
      const quantity = Number(addForm["ct-quantity"].value) || 1;

      if (!name || Number.isNaN(price) || price < 0) {
        toast("Enter a valid item name and price.", "error");
        return;
      }
      if (quantity < 1) {
        toast("Quantity must be at least 1.", "error");
        return;
      }

      const item = addItem(name, price, quantity);
      toast(
        "Added " + item.name + " (" + quantity + " × " + naira(price) + ").",
        "success"
      );
      addForm.reset();
      addForm["ct-quantity"].value = 1;
      render();
    });
  }

  // Remove item form
  const removeForm = $("ct-remove-form");
  if (removeForm) {
    removeForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = removeForm["ct-remove-name"].value.trim();
      if (!name) {
        toast("Enter an item name to remove.", "error");
        return;
      }
      const ok = removeItem(name);
      toast(
        ok
          ? name + " removed from cart."
          : "No item named \u201C" + name + "\u201D in the cart.",
        ok ? "success" : "error"
      );
      removeForm.reset();
      render();
    });
  }

  // Clear cart
  const clearBtn = $("ct-clear");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (!cart.length) {
        toast("Your cart is already empty.", "error");
        return;
      }
      cart = [];
      toast("Cart cleared.", "success");
      render();
    });
  }

  // Print receipt
  const printBtn = $("ct-print");
  if (printBtn) {
    printBtn.addEventListener("click", () => {
      window.print();
    });
  }

  // Delegated actions (cards + table)
  [$("ct-cart-list"), $("ct-table-body")].forEach((container) => {
    if (!container) return;
    container.addEventListener("click", (e) => {
      const incBtn = e.target.closest("[data-inc]");
      const decBtn = e.target.closest("[data-dec]");
      const removeBtn = e.target.closest("[data-remove]");

      if (incBtn) {
        increaseQuantity(incBtn.dataset.inc);
        render();
        return;
      }
      if (decBtn) {
        decreaseQuantity(decBtn.dataset.dec);
        render();
        return;
      }
      if (removeBtn) {
        const ok = removeItem(removeBtn.dataset.remove);
        if (ok) toast(removeBtn.dataset.remove + " removed from cart.", "success");
        render();
      }
    });
  });

  // Initial render
  render();
})();
