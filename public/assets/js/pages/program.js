document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("programGrid");
  const pager = document.getElementById("programPagination");
  const section = document.getElementById("programList");

  if (!grid || !pager) return;

  const cardsPerPage = 16;
  const items = Array.from(grid.children); // tiap .col-... dianggap 1 item card
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / cardsPerPage);

  if (totalPages <= 1) {
    pager.innerHTML = "";
    // pastikan semua tampil
    items.forEach(el => (el.style.display = ""));
    return;
  }

  // ambil page dari URL kalau ada: ?page=2
  const url = new URL(window.location.href);
  let currentPage = parseInt(url.searchParams.get("page") || "1", 10);
  if (Number.isNaN(currentPage) || currentPage < 1) currentPage = 1;
  if (currentPage > totalPages) currentPage = totalPages;

  function setURLPage(page) {
    const u = new URL(window.location.href);
    u.searchParams.set("page", String(page));
    window.history.replaceState({}, "", u.toString());
  }

  function showPage(page) {
    currentPage = page;
    setURLPage(page);

    const start = (page - 1) * cardsPerPage;
    const end = start + cardsPerPage;

    items.forEach((el, idx) => {
      el.style.display = (idx >= start && idx < end) ? "" : "none";
    });

    renderPagination();
  }

  function makeBtn(labelHTML, ariaLabel, onClick, extraClass = "", isDisabled = false, isActive = false) {
    const li = document.createElement("li");
    li.className = "si-pagination__item";

    const a = document.createElement("a");
    a.href = "#";
    a.className = "si-pagination__btn" + (extraClass ? ` ${extraClass}` : "");
    a.setAttribute("aria-label", ariaLabel);

    if (isDisabled) a.classList.add("is-disabled");
    if (isActive) {
      a.classList.add("is-active");
      a.setAttribute("aria-current", "page");
    }

    a.innerHTML = labelHTML;

    if (!isDisabled) {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        onClick?.();
        // scroll ke atas grid biar enak
        section?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }

    li.appendChild(a);
    return li;
  }

  function makeEllipsis() {
    const li = document.createElement("li");
    li.className = "si-pagination__item";

    const span = document.createElement("span");
    span.className = "si-pagination__btn is-ellipsis";
    span.textContent = "…";
    span.setAttribute("aria-hidden", "true");

    li.appendChild(span);
    return li;
  }

  // generate list page dengan "..." (mirip gambar)
  function getPageList(total, current) {
    // kalau total kecil, tampilkan semua
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);

    // format: 1, (..), current-1, current, current+1, (..), total
    const pages = new Set([1, total, current, current - 1, current + 1]);
    const filtered = Array.from(pages)
      .filter(p => p >= 1 && p <= total)
      .sort((a, b) => a - b);

    // sisipkan "gap marker"
    const out = [];
    for (let i = 0; i < filtered.length; i++) {
      out.push(filtered[i]);
      if (i < filtered.length - 1) {
        const gap = filtered[i + 1] - filtered[i];
        if (gap > 1) out.push("...");
      }
    }
    return out;
  }

  function renderPagination() {
    pager.innerHTML = "";

    const ul = document.createElement("ul");
    ul.className = "si-pagination__list";

    // Prev
    ul.appendChild(
      makeBtn(
        `<i class="bi bi-chevron-left"></i>`,
        "Previous page",
        () => showPage(Math.max(1, currentPage - 1)),
        "",
        currentPage === 1
      )
    );

    // Pages + ellipsis
    const list = getPageList(totalPages, currentPage);
    list.forEach((p) => {
      if (p === "...") {
        ul.appendChild(makeEllipsis());
      } else {
        ul.appendChild(
          makeBtn(
            String(p),
            `Page ${p}`,
            () => showPage(p),
            "",
            false,
            p === currentPage
          )
        );
      }
    });

    // Next
    ul.appendChild(
      makeBtn(
        `<i class="bi bi-chevron-right"></i>`,
        "Next page",
        () => showPage(Math.min(totalPages, currentPage + 1)),
        "",
        currentPage === totalPages
      )
    );

    pager.appendChild(ul);
  }

  // init
  showPage(currentPage);
});
