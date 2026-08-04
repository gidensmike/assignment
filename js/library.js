/* ==========================================================================
   ASSIGNMENT 4 — MINI LIBRARY MANAGER (premium dashboard)
   Each book is an object { id, title, author, available, addedAt }.
   ========================================================================== */
(() => {
  "use strict";

  /* ---------- Data ---------- */
  let books = [
    { id: "BK-001", title: "Things Fall Apart", author: "Chinua Achebe", available: true },
    { id: "BK-002", title: "Half of a Yellow Sun", author: "Chimamanda Ngozi Adichie", available: false },
    { id: "BK-003", title: "The Alchemist", author: "Paulo Coelho", available: true },
    { id: "BK-004", title: "Rich Dad Poor Dad", author: "Robert Kiyosaki", available: true },
    { id: "BK-005", title: "Atomic Habits", author: "James Clear", available: false },
  ];

  let bookCounter = 6;
  let recentlyAdded = [];

  /* ---------- Core operations ---------- */

  // Add a book; returns the created book object
  function addBook(title, author) {
    const book = {
      id: "BK-" + String(bookCounter++).padStart(3, "0"),
      title,
      author,
      available: true,
    };
    books.push(book);
    recentlyAdded.push(book);
    return book;
  }

  // Remove a book by id; returns true if removed
  function removeBook(id) {
    const index = books.findIndex((b) => b.id === id);
    if (index === -1) return false;
    books.splice(index, 1);
    recentlyAdded = recentlyAdded.filter((b) => b.id !== id);
    return true;
  }

  // Borrow a book; returns true if it was available and is now borrowed
  function borrowBook(id) {
    const book = books.find((b) => b.id === id);
    if (!book || !book.available) return false;
    book.available = false;
    return true;
  }

  // Return a book; returns true if it was borrowed and is now available
  function returnBook(id) {
    const book = books.find((b) => b.id === id);
    if (!book || book.available) return false;
    book.available = true;
    return true;
  }

  // Search by title; returns an array of matches
  function searchByTitle(query) {
    const q = query.trim().toLowerCase();
    if (!q) return books;
    return books.filter((b) => b.title.toLowerCase().includes(q));
  }

  // Available books as an array
  function getAvailableBooks() {
    return books.filter((b) => b.available);
  }

  // Borrowed books as an array
  function getBorrowedBooks() {
    return books.filter((b) => !b.available);
  }

  // Unique authors count
  function getAuthorCount() {
    return new Set(books.map((b) => b.author.toLowerCase())).size;
  }

  /* ---------- UI helpers ---------- */
  const $ = (id) => document.getElementById(id);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Toast notifications */
  function toast(message, type) {
    const wrap = $("li-toast-wrap");
    if (!wrap) return;
    const el = document.createElement("div");
    el.className = "li-toast " + type;
    el.setAttribute("role", "status");
    el.innerHTML =
      '<span class="li-toast-icon" aria-hidden="true">' +
      (type === "success" ? "✓" : "!") +
      "</span><span>" + message + "</span>";
    wrap.appendChild(el);

    setTimeout(() => {
      el.classList.add("is-leaving");
      setTimeout(() => el.remove(), 320);
    }, 3200);
  }

  /* Count-up animation */
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

  const badge = (available) =>
    available
      ? '<span class="li-avail available">Available</span>'
      : '<span class="li-avail borrowed">Borrowed</span>';

  const coverShort = (title) =>
    title
      .split(" ")
      .filter((w) => w.length > 2)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "BK";

  const actionBtn = (b) =>
    b.available
      ? '<button type="button" class="btn btn-ghost btn-sm" data-borrow="' + b.id + '">Borrow</button>'
      : '<button type="button" class="btn btn-ghost btn-sm" data-return="' + b.id + '">Return</button>';

  /* ---------- Rendering ---------- */
  const availShelf = $("li-avail-shelf");
  const borrowShelf = $("li-borrow-shelf");
  const tableBody = $("li-table-body");

  function render() {
    const available = getAvailableBooks();
    const borrowed = getBorrowedBooks();

    // Stats
    countUp($("li-total"), books.length);
    countUp($("li-available"), available.length);
    countUp($("li-borrowed"), borrowed.length);
    countUp($("li-recent"), recentlyAdded.length);
    countUp($("li-authors"), getAuthorCount());
    if ($("li-status")) {
      $("li-status").textContent = books.length === 0 ? "Empty" : "Operational";
    }

    // Shelves (available / borrowed)
    const renderShelf = (el, list) => {
      if (!el) return;
      if (!list.length) {
        el.innerHTML = '<p class="li-empty">No books here.</p>';
        return;
      }
      el.innerHTML = list
        .map(
          (b) =>
            '<article class="li-book">' +
            '<div class="li-book-cover">' + coverShort(b.title) + "</div>" +
            '<div class="li-book-info">' +
            '<span class="li-book-title">' + b.title + "</span>" +
            '<span class="li-book-author">' + b.author + "</span>" +
            '<span class="li-book-id">' + b.id + "</span>" +
            "</div>" +
            '<div class="li-book-actions">' + actionBtn(b) + "</div>" +
            "</article>"
        )
        .join("");
    };
    renderShelf(availShelf, available);
    renderShelf(borrowShelf, borrowed);
    countUp($("li-avail-count"), available.length);
    countUp($("li-borrow-count"), borrowed.length);

    // Table
    if (tableBody) {
      if (!books.length) {
        tableBody.innerHTML =
          '<tr><td colspan="6"><p class="li-empty">The library is empty.</p></td></tr>';
      } else {
        tableBody.innerHTML = books
          .map(
            (b) =>
              "<tr>" +
              '<td class="li-row-id">' + b.id + "</td>" +
              '<td><div class="li-table-cover">' + coverShort(b.title) + "</div></td>" +
              "<td>" + b.title + "</td>" +
              "<td>" + b.author + "</td>" +
              "<td>" + badge(b.available) + "</td>" +
              "<td>" + actionBtn(b) + "</td>" +
              "</tr>"
          )
          .join("");
      }
    }

    // Analytics — available vs borrowed stacked bars
    const maxVal = Math.max(books.length, 1);
    const chart = $("li-chart");
    if (chart) {
      chart.innerHTML =
        '<div class="li-chart-bar-row">' +
        '<span class="li-chart-label">Available</span>' +
        '<div class="li-chart-track"><div class="li-chart-fill available" style="width:' +
        (available.length / maxVal) * 100 + '%">' + available.length + "</div></div>" +
        "</div>" +
        '<div class="li-chart-bar-row">' +
        '<span class="li-chart-label">Borrowed</span>' +
        '<div class="li-chart-track"><div class="li-chart-fill borrowed" style="width:' +
        (borrowed.length / maxVal) * 100 + '%">' + borrowed.length + "</div></div>" +
        "</div>";
    }

    // Authors distribution
    const authorsEl = $("li-authors-list");
    if (authorsEl) {
      const counts = {};
      books.forEach((b) => {
        counts[b.author] = (counts[b.author] || 0) + 1;
      });
      const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
      authorsEl.innerHTML = sorted.length
        ? sorted
            .map(
              ([name, count]) =>
                '<div class="li-author-row">' +
                '<span class="li-author-name">' + name + "</span>" +
                '<span class="li-author-count">' + count + "</span>" +
                "</div>"
            )
            .join("")
        : '<p class="li-empty">No authors yet.</p>';
    }

    // Total books indicator
    countUp($("li-total-big"), books.length);
    const fill = $("li-total-fill");
    if (fill) fill.style.width = Math.min(100, (books.length / 20) * 100) + "%";
  }

  /* ---------- Featured search card ---------- */
  function renderFeatured(book) {
    const el = $("li-featured");
    if (!el) return;
    if (!book) {
      el.hidden = true;
      el.innerHTML = "";
      return;
    }
    el.hidden = false;
    el.innerHTML =
      '<div class="li-featured-card is-visible">' +
      '<div class="li-featured-cover">' + coverShort(book.title) + "</div>" +
      '<div class="li-featured-info">' +
      '<span class="li-featured-title">' + book.title + "</span>" +
      '<span class="li-featured-author">by ' + book.author + "</span>" +
      '<span class="li-featured-id">' + book.id + "</span>" +
      badge(book.available) +
      '<div class="li-featured-actions">' +
      (book.available
        ? '<button type="button" class="btn btn-primary btn-sm" data-borrow="' + book.id + '">Borrow</button>'
        : '<button type="button" class="btn btn-ghost btn-sm" data-return="' + book.id + '">Return</button>') +
      "</div>" +
      "</div>" +
      "</div>";
  }

  /* ---------- Events ---------- */

  // Add form
  const addForm = $("li-add-form");
  if (addForm) {
    addForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const title = addForm["li-book-title"].value.trim();
      const author = addForm["li-author"].value.trim();
      if (!title || !author) {
        toast("Please enter both a title and an author.", "error");
        return;
      }
      const book = addBook(title, author);
      toast("Added \u201C" + book.title + "\u201D (" + book.id + ").", "success");
      addForm.reset();
      render();
    });
  }

  // Remove form
  const removeForm = $("li-remove-form");
  if (removeForm) {
    removeForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const id = removeForm["li-remove-id"].value.trim();
      if (!id) {
        toast("Enter a book ID to remove.", "error");
        return;
      }
      const ok = removeBook(id);
      toast(
        ok
          ? "Book " + id + " removed from the library."
          : "No book found with ID " + id + ".",
        ok ? "success" : "error"
      );
      removeForm.reset();
      render();
    });
  }

  // Borrow form
  const borrowForm = $("li-borrow-form");
  if (borrowForm) {
    borrowForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const id = borrowForm["li-borrow-id"].value.trim();
      if (!id) {
        toast("Enter a book ID to borrow.", "error");
        return;
      }
      const ok = borrowBook(id);
      toast(
        ok
          ? "Book " + id + " borrowed successfully."
          : "Book " + id + " is not available right now.",
        ok ? "success" : "error"
      );
      borrowForm.reset();
      render();
    });
  }

  // Return form
  const returnForm = $("li-return-form");
  if (returnForm) {
    returnForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const id = returnForm["li-return-id"].value.trim();
      if (!id) {
        toast("Enter a book ID to return.", "error");
        return;
      }
      const ok = returnBook(id);
      toast(
        ok
          ? "Book " + id + " returned successfully."
          : "Book " + id + " was not borrowed.",
        ok ? "success" : "error"
      );
      returnForm.reset();
      render();
    });
  }

  // Search form (featured card)
  const searchForm = $("li-search-form");
  const searchInput = $("li-search-title");
  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const q = (searchInput ? searchInput.value : "").trim();
      if (!q) {
        toast("Enter a book title to search.", "error");
        return;
      }
      const matches = searchByTitle(q);
      if (!matches.length) {
        toast("No books found matching \u201C" + q + "\u201D.", "error");
        renderFeatured(null);
        return;
      }
      renderFeatured(matches[0]);
      toast("Found " + matches.length + " matching book" + (matches.length > 1 ? "s" : "") + ".", "success");
    });
  }

  // Delegated actions (shelves, table, featured)
  [availShelf, borrowShelf, tableBody, $("li-featured")].forEach((container) => {
    if (!container) return;
    container.addEventListener("click", (e) => {
      const borrowBtn = e.target.closest("[data-borrow]");
      const returnBtn = e.target.closest("[data-return]");

      if (borrowBtn) {
        const id = borrowBtn.dataset.borrow;
        const ok = borrowBook(id);
        toast(
          ok
            ? "Book " + id + " borrowed successfully."
            : "Book " + id + " is not available right now.",
          ok ? "success" : "error"
        );
        renderFeatured(findFeatured(id));
        render();
        return;
      }
      if (returnBtn) {
        const id = returnBtn.dataset.return;
        const ok = returnBook(id);
        toast(
          ok
            ? "Book " + id + " returned successfully."
            : "Book " + id + " was not borrowed.",
          ok ? "success" : "error"
        );
        renderFeatured(findFeatured(id));
        render();
      }
    });
  });

  function findFeatured(id) {
    return books.find((b) => b.id === id) || null;
  }

  // Initial render
  render();
})();
