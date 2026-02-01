// Navbar
document.addEventListener("DOMContentLoaded", () => {
    const nav = document.querySelector(".si-nav");
    if (!nav) return;

    const searchWrap = nav.querySelector(".si-nav__search");
    const toggleBtn = nav.querySelector(".si-nav__search-toggle");
    const popoverForm = nav.querySelector(".si-nav__search-popover");
    const input = nav.querySelector(".si-nav__search-popover .si-nav__search-input");

    function isMobile() {
        return window.matchMedia("(max-width: 991.98px)").matches;
    }

    function openSearch() {
        if (!searchWrap) return;
        nav.classList.add("is-search-open");
        toggleBtn?.setAttribute("aria-expanded", "true");
        setTimeout(() => input?.focus(), 60);
    }

    function closeSearch() {
        nav.classList.remove("is-search-open");
        toggleBtn?.setAttribute("aria-expanded", "false");
        if (input) input.value = "";
    }

    toggleBtn?.addEventListener("click", () => {
        if (isMobile()) return;
        nav.classList.contains("is-search-open") ? closeSearch() : openSearch();
    });

    popoverForm?.addEventListener("submit", (e) => {
        e.preventDefault();
        const q = input?.value?.trim();
        if (!q) return;
        window.location.href = `?q=${encodeURIComponent(q)}`;
    });

    document.addEventListener("click", (e) => {
        if (!nav.classList.contains("is-search-open")) return;
        if (searchWrap && searchWrap.contains(e.target)) return;
        closeSearch();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key !== "Escape") return;
        if (!nav.classList.contains("is-search-open")) return;
        closeSearch();
    });

    const offcanvasEl = document.getElementById("siNavMobile");
    if (offcanvasEl) {
        offcanvasEl.addEventListener("show.bs.offcanvas", closeSearch);
    }

    window.addEventListener("resize", () => {
        if (isMobile()) closeSearch();
    });
});


// Client
(function () {
    const marquee = document.querySelector(".si-clients__marquee");
    if (!marquee) return;

    let isDown = false;
    let startX = 0;
    let startScrollLeft = 0;
    let resumeTimeout = null;

    const pause = () => {
        marquee.classList.add("is-paused");
        clearTimeout(resumeTimeout);
    };

    const resumeAfter = (ms = 1000) => {
        clearTimeout(resumeTimeout);
        resumeTimeout = setTimeout(() => {
            marquee.classList.remove("is-paused");
            marquee.classList.remove("is-dragging");
        }, ms);
    };

    marquee.addEventListener("mousedown", (e) => {
        pause();
        isDown = true;
        marquee.classList.add("is-dragging");

        startX = e.pageX - marquee.offsetLeft;
        startScrollLeft = marquee.scrollLeft;

        resumeAfter(1000);
    });

    marquee.addEventListener("mousemove", (e) => {
        if (!isDown) return;

        e.preventDefault();
        pause();
        clearTimeout(resumeTimeout);

        const x = e.pageX - marquee.offsetLeft;
        const walk = (x - startX) * 1.2;
        marquee.scrollLeft = startScrollLeft - walk;
    });

    marquee.addEventListener("mouseup", () => {
        if (!isDown) return;
        isDown = false;
        marquee.classList.remove("is-dragging");
        resumeAfter(1000);
    });

    marquee.addEventListener("mouseleave", () => {
        if (!isDown) return;
        isDown = false;
        marquee.classList.remove("is-dragging");
        resumeAfter(1000);
    });

    marquee.addEventListener("touchstart", (e) => {
        pause();
        isDown = true;
        marquee.classList.add("is-dragging");

        startX = e.touches[0].pageX - marquee.offsetLeft;
        startScrollLeft = marquee.scrollLeft;

        resumeAfter(1000);
    }, { passive: true });

    marquee.addEventListener("touchmove", (e) => {
        if (!isDown) return;

        pause();
        clearTimeout(resumeTimeout);

        const x = e.touches[0].pageX - marquee.offsetLeft;
        const walk = (x - startX) * 1.2;
        marquee.scrollLeft = startScrollLeft - walk;
    }, { passive: true });

    marquee.addEventListener("touchend", () => {
        if (!isDown) return;
        isDown = false;
        marquee.classList.remove("is-dragging");
        resumeAfter(1000);
    });
})();

// Team
document.addEventListener("DOMContentLoaded", () => {
    const section = document.querySelector(".si-team");
    if (!section) return;

    const track = section.querySelector(".si-team__track");
    const itemsWrap = section.querySelector(".si-team__items");
    const btnPrev = section.querySelector(".si-team__arrow--left");
    const btnNext = section.querySelector(".si-team__arrow--right");

    if (!track || !itemsWrap) return;

    const cards = Array.from(itemsWrap.querySelectorAll(".si-team-card"));
    if (!cards.length) return;

    track.innerHTML = "";
    cards.forEach((c) => track.appendChild(c));

    const intervalMs = 3000;
    let timer = null;
    let index = 0;
    let cardWidth = 0;
    let gap = 22;

    function getPerView() {
        const w = window.innerWidth;
        if (w < 768) return 1;
        if (w < 992) return 2;
        if (w < 1200) return 3;
        return 4;
    }

    function syncPer() {
        section.style.setProperty("--per", getPerView());
    }

    function measure() {
        const computed = window.getComputedStyle(track);
        gap = parseFloat(computed.gap || "22") || 22;

        const firstCard = track.querySelector(".si-team-card");
        if (!firstCard) return;

        cardWidth = firstCard.getBoundingClientRect().width || cardWidth;
    }

    function maxIndex() {
        const per = getPerView();
        const total = track.querySelectorAll(".si-team-card").length;
        return Math.max(0, total - per);
    }

    function applyTransform() {
        const x = (cardWidth + gap) * index;
        track.style.transform = `translateX(-${x}px)`;
    }

    function goTo(newIndex, resetTimer = false) {
        syncPer();
        measure();

        const max = maxIndex();
        index = Math.min(Math.max(newIndex, 0), max);

        applyTransform();
        if (resetTimer) restartTimer();
    }

    function next(resetTimer = false) {
        syncPer();
        measure();

        const max = maxIndex();
        index = index >= max ? 0 : index + 1;

        applyTransform();
        if (resetTimer) restartTimer();
    }

    function prev(resetTimer = false) {
        syncPer();
        measure();

        const max = maxIndex();
        index = index <= 0 ? max : index - 1;

        applyTransform();
        if (resetTimer) restartTimer();
    }

    function startTimer() {
        stopTimer();
        timer = setInterval(() => next(false), intervalMs);
    }

    function stopTimer() {
        if (timer) clearInterval(timer);
        timer = null;
    }

    function restartTimer() {
        startTimer();
    }

    btnNext?.addEventListener("click", () => next(true));
    btnPrev?.addEventListener("click", () => prev(true));

    let rT = null;
    window.addEventListener("resize", () => {
        clearTimeout(rT);
        rT = setTimeout(() => {
            syncPer();
            measure();
            const max = maxIndex();
            if (index > max) index = max;
            applyTransform();
            restartTimer();
        }, 150);
    });

    syncPer();
    requestAnimationFrame(() => {
        measure();
        goTo(0, false);
        startTimer();
    });
});

// Scroll to Top
(function () {
    const btn = document.querySelector(".si-to-top");
    if (!btn) return;

    const showAt = 350;

    function onScroll() {
        if (window.scrollY > showAt) btn.classList.add("is-show");
        else btn.classList.remove("is-show");
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    btn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
})();