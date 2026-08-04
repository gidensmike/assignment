/* ==========================================================================
   ASSIGNMENT 3 — STUDENT MANAGEMENT SYSTEM (premium dashboard)
   Each student is an object; all students live in one array.
   ========================================================================== */
(() => {
  "use strict";

  /* ---------- Data ---------- */
  const students = [
    { id: "STU-1001", name: "Amina Bello", age: 18, score: 85 },
    { id: "STU-1002", name: "Chinedu Okafor", age: 19, score: 45 },
    { id: "STU-1003", name: "Fatima Yusuf", age: 20, score: 92 },
    { id: "STU-1004", name: "David Adeyemi", age: 19, score: 58 },
    { id: "STU-1005", name: "Grace Johnson", age: 18, score: 71 },
  ];

  const PASS_MARK = 50;

  /* ---------- Grade helpers ---------- */
  const gradeOf = (score) => {
    if (score >= 70) return { letter: "A", cls: "st-grade-a" };
    if (score >= 60) return { letter: "B", cls: "st-grade-b" };
    if (score >= 50) return { letter: "C", cls: "st-grade-c" };
    if (score >= 40) return { letter: "D", cls: "st-grade-d" };
    return { letter: "F", cls: "st-grade-f" };
  };

  /* ---------- Core operations (each returns a meaningful value) ---------- */
  function addStudent(id, name, age, score) {
    const student = { id, name, age, score };
    students.push(student);
    return student;
  }

  function removeStudentById(id) {
    const index = students.findIndex((s) => s.id === id);
    if (index === -1) return false;
    students.splice(index, 1);
    return true;
  }

  function findStudentById(id) {
    return students.find((s) => s.id === id) || null;
  }

  function updateScore(id, newScore) {
    const student = findStudentById(id);
    if (!student) return null;
    student.score = newScore;
    return student;
  }

  function getHighestScore() {
    return students.reduce(
      (best, s) => (s.score > best.score ? s : best),
      students[0]
    );
  }

  function getLowestScore() {
    return students.reduce(
      (worst, s) => (s.score < worst.score ? s : worst),
      students[0]
    );
  }

  function getClassAverage() {
    if (!students.length) return 0;
    return students.reduce((sum, s) => sum + s.score, 0) / students.length;
  }

  /* ---------- UI helpers ---------- */
  const $ = (id) => document.getElementById(id);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Toast notifications */
  function toast(message, type) {
    const wrap = $("st-toast-wrap");
    if (!wrap) return;
    const el = document.createElement("div");
    el.className = "st-toast " + type;
    el.setAttribute("role", "status");
    el.innerHTML =
      '<span class="st-toast-icon" aria-hidden="true">' +
      (type === "success" ? "✓" : "!") +
      "</span><span>" + message + "</span>";
    wrap.appendChild(el);

    setTimeout(() => {
      el.classList.add("is-leaving");
      setTimeout(() => el.remove(), 320);
    }, 3200);
  }

  /* Count-up animation */
  function countUp(el, target, formatter) {
    if (!el) return;
    if (reducedMotion) {
      el.textContent = formatter ? formatter(target) : String(target);
      return;
    }
    const duration = 650;
    const start = performance.now();
    const from = Number(el.textContent.replace(/[^0-9.]/g, "")) || 0;
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(from + (target - from) * eased);
      el.textContent = formatter ? formatter(current) : String(current);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  const badge = (score) =>
    score >= PASS_MARK
      ? '<span class="st-badge pass">PASS</span>'
      : '<span class="st-badge fail">FAIL</span>';

  const initials = (name) =>
    name
      .split(" ")
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase();

  const rowActions = (id) =>
    '<div class="st-row-actions">' +
    '<button type="button" class="btn btn-ghost btn-sm" data-edit="' + id + '">Edit</button>' +
    '<button type="button" class="btn btn-danger btn-sm" data-remove="' + id + '">' +
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path><path d="M10 11v6M14 11v6"></path></svg>' +
    "Remove</button>" +
    "</div>";

  /* ---------- Render ---------- */
  const tableBody = $("st-table-body");
  const searchInput = $("st-search");

  function renderTable() {
    if (!tableBody) return;
    const query = (searchInput ? searchInput.value : "").trim().toLowerCase();
    const rows = students.filter((s) => {
      if (!query) return true;
      return (
        s.name.toLowerCase().includes(query) || s.id.toLowerCase().includes(query)
      );
    });

    if (!rows.length) {
      tableBody.innerHTML =
        '<tr><td colspan="7"><p class="st-empty">No students found.</p></td></tr>';
    } else {
      tableBody.innerHTML = rows
        .map((s) => {
          const g = gradeOf(s.score);
          return (
            "<tr>" +
            '<td class="st-row-id">' + s.id + "</td>" +
            '<td class="st-row-name">' + s.name + "</td>" +
            "<td>" + s.age + "</td>" +
            '<td class="st-row-score">' + s.score + "</td>" +
            '<td><span class="st-grade ' + g.cls + '">' + g.letter + "</span></td>" +
            "<td>" + badge(s.score) + "</td>" +
            "<td>" + rowActions(s.id) + "</td>" +
            "</tr>"
          );
        })
        .join("");
    }

    renderDashboard();
  }

  /* Dashboard stats, charts, performers */
  function renderDashboard() {
    const set = (id, value) => {
      const el = $(id);
      if (el) el.textContent = value;
    };

    // Stats
    countUp($("st-count"), students.length);
    const avg = getClassAverage();
    countUp($("st-average"), Math.round(avg * 10) / 10);
    countUp($("st-highest-score"), students.length ? getHighestScore().score : 0);
    countUp($("st-lowest-score"), students.length ? getLowestScore().score : 0);

    const passed = students.filter((s) => s.score >= PASS_MARK).length;
    const failed = students.length - passed;
    countUp($("st-passed"), passed);
    countUp($("st-failed"), failed);

    // Score distribution bars
    const ranges = [
      { label: "0-39", count: 0 },
      { label: "40-49", count: 0 },
      { label: "50-59", count: 0 },
      { label: "60-69", count: 0 },
      { label: "70-100", count: 0 },
    ];
    students.forEach((s) => {
      if (s.score < 40) ranges[0].count++;
      else if (s.score < 50) ranges[1].count++;
      else if (s.score < 60) ranges[2].count++;
      else if (s.score < 70) ranges[3].count++;
      else ranges[4].count++;
    });
    const maxRange = Math.max(...ranges.map((r) => r.count), 1);
    const barsEl = $("st-bars");
    if (barsEl) {
      barsEl.innerHTML = ranges
        .map((r) => {
          return (
            '<div class="st-bar-col">' +
            '<span class="st-bar-val">' + r.count + "</span>" +
            '<div class="st-bar" style="height:' + (r.count / maxRange) * 100 + '%"></div>' +
            '<span class="st-bar-label">' + r.label + "</span>" +
            "</div>"
          );
        })
        .join("");
    }

    // Donut (pass vs fail)
    const passPct = students.length ? Math.round((passed / students.length) * 100) : 0;
    const donut = $("st-donut");
    if (donut) donut.style.setProperty("--pass-pct", passPct);
    countUp($("st-donut-center"), passPct, (v) => v + "%");
    set("st-donut-pass", passed);
    set("st-donut-fail", failed);

    // Average indicator
    countUp($("st-average-big"), Math.round(avg * 10) / 10);
    const fill = $("st-average-fill");
    if (fill) fill.style.width = Math.min(100, avg) + "%";

    // Top performers
    if (students.length) {
      const top = getHighestScore();
      const low = getLowestScore();
      set("st-top-name", top.name);
      set("st-top-meta", top.id + " · Age " + top.age);
      countUp($("st-top-score"), top.score);
      set("st-low-name", low.name);
      set("st-low-meta", low.id + " · Age " + low.age);
      countUp($("st-low-score"), low.score);
    } else {
      set("st-top-name", "—");
      set("st-top-meta", "No students");
      set("st-top-score", 0);
      set("st-low-name", "—");
      set("st-low-meta", "No students");
      set("st-low-score", 0);
    }
  }

  /* ---------- Search profile card ---------- */
  function renderProfile(student) {
    const card = $("st-profile");
    if (!card) return;
    if (!student) {
      card.hidden = true;
      card.innerHTML = "";
      return;
    }
    const g = gradeOf(student.score);
    card.hidden = false;
    card.innerHTML =
      '<div class="st-profile is-visible">' +
      '<div class="st-profile-avatar">' + initials(student.name) + "</div>" +
      '<div class="st-profile-info">' +
      '<span class="st-profile-name">' + student.name + "</span>" +
      '<span class="st-profile-id">' + student.id + "</span>" +
      '<div class="st-profile-details">' +
      '<span class="st-profile-chip">Age <strong>' + student.age + "</strong></span>" +
      '<span class="st-profile-chip">Score <strong>' + student.score + "</strong></span>" +
      '<span class="st-profile-chip">Grade <strong>' + g.letter + "</strong></span>" +
      "</div>" +
      "</div>" +
      badge(student.score) +
      "</div>";
  }

  /* ---------- Events ---------- */

  // Add form
  const addForm = $("st-add-form");
  if (addForm) {
    addForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const id = addForm["st-id"].value.trim();
      const name = addForm["st-name"].value.trim();
      const age = Number(addForm["st-age"].value);
      const score = Number(addForm["st-score"].value);

      if (!id || !name || Number.isNaN(age) || Number.isNaN(score)) {
        toast("Please fill in all fields with valid values.", "error");
        return;
      }
      if (score < 0 || score > 100) {
        toast("Score must be between 0 and 100.", "error");
        return;
      }
      if (findStudentById(id)) {
        toast("A student with that ID already exists.", "error");
        return;
      }

      addStudent(id, name, age, score);
      addForm.reset();
      toast("Student " + id + " added successfully.", "success");
      renderTable();
    });
  }

  // Remove form
  const removeForm = $("st-remove-form");
  if (removeForm) {
    removeForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const id = removeForm["st-remove-id"].value.trim();
      if (!id) {
        toast("Enter a student ID to remove.", "error");
        return;
      }
      const removed = removeStudentById(id);
      toast(
        removed
          ? "Student " + id + " removed."
          : "No student found with ID " + id + ".",
        removed ? "success" : "error"
      );
      removeForm.reset();
      renderTable();
    });
  }

  // Find form (control panel)
  const findForm = $("st-find-form");
  if (findForm) {
    findForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const id = findForm["st-find-id"].value.trim();
      const student = findStudentById(id);
      if (!student) {
        toast("No student found with ID " + id + ".", "error");
        renderProfile(null);
        return;
      }
      renderProfile(student);
      toast("Found " + student.name + ".", "success");
    });
  }

  // Search bar (live profile card)
  const searchForm = $("st-search-form");
  const searchIdInput = $("st-search-id");
  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const id = (searchIdInput ? searchIdInput.value : "").trim();
      const student = findStudentById(id);
      if (!student) {
        toast("No student found with ID " + id + ".", "error");
        renderProfile(null);
        return;
      }
      renderProfile(student);
      toast("Found " + student.name + ".", "success");
    });
  }

  // Update form
  const updateForm = $("st-update-form");
  if (updateForm) {
    updateForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const id = updateForm["st-update-id"].value.trim();
      const newScore = Number(updateForm["st-update-score"].value);
      if (!id || Number.isNaN(newScore)) {
        toast("Enter a valid ID and score.", "error");
        return;
      }
      if (newScore < 0 || newScore > 100) {
        toast("Score must be between 0 and 100.", "error");
        return;
      }
      const updated = updateScore(id, newScore);
      if (!updated) {
        toast("No student found with ID " + id + ".", "error");
        return;
      }
      toast("Score updated for " + id + " to " + newScore + ".", "success");
      updateForm.reset();
      renderTable();
    });
  }

  // Table search + reset
  if (searchInput) {
    searchInput.addEventListener("input", renderTable);
  }
  const resetBtn = $("st-reset");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      renderProfile(null);
      renderTable();
      toast("Roster reset.", "success");
    });
  }

  // Row actions (edit / remove)
  if (tableBody) {
    tableBody.addEventListener("click", (e) => {
      const editBtn = e.target.closest("[data-edit]");
      const removeBtn = e.target.closest("[data-remove]");

      if (editBtn) {
        const id = editBtn.dataset.edit;
        const student = findStudentById(id);
        if (student) {
          const row = editBtn.closest("tr");
          if (!row) return;
          const scoreCell = row.querySelector(".st-row-score");
          if (scoreCell && !scoreCell.querySelector("input")) {
            const current = student.score;
            scoreCell.innerHTML =
              '<input type="number" min="0" max="100" value="' + current +
              '" style="width:90px;background:var(--surface);color:var(--text);border:1px solid var(--accent);border-radius:8px;padding:0.4rem 0.5rem;" aria-label="New score for ' +
              student.name + '" />';
            const input = scoreCell.querySelector("input");
            input.focus();
            input.select();

            const commit = () => {
              const value = Number(input.value);
              if (!Number.isNaN(value) && value >= 0 && value <= 100) {
                updateScore(id, value);
                toast("Score updated for " + id + " to " + value + ".", "success");
              } else {
                toast("Score must be a number between 0 and 100.", "error");
              }
              renderTable();
            };

            input.addEventListener("keydown", (ev) => {
              if (ev.key === "Enter") {
                ev.preventDefault();
                commit();
              }
              if (ev.key === "Escape") renderTable();
            });
            input.addEventListener("blur", commit);
          }
        }
        return;
      }

      if (removeBtn) {
        const id = removeBtn.dataset.remove;
        if (removeStudentById(id)) {
          toast("Student " + id + " removed.", "success");
          renderTable();
        }
      }
    });
  }

  // Initial render
  renderTable();
})();
