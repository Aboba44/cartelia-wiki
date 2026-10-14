/* =========================
   БОГИ
   ========================= */

let currentGodPantheon = "indigenous";
let lastResolvedHash = null;

function setWikiRoute(route, replace = false) {
    if (window.location.hash !== route) {
        const method = replace ? "replaceState" : "pushState";
        window.history[method]({ route }, "", route);
    }
    lastResolvedHash = route;
}

function setBreadcrumbs(items) {
    const nav = document.getElementById("breadcrumbs");
    if (!nav) return;

    nav.replaceChildren();

    items.forEach(function (item, index) {
        if (index > 0) {
            const separator = document.createElement("span");
            separator.className = "breadcrumb-separator";
            separator.setAttribute("aria-hidden", "true");
            separator.textContent = "→";
            nav.appendChild(separator);
        }

        if (item.route && index < items.length - 1) {
            const link = document.createElement("a");
            link.href = item.route;
            link.textContent = item.label;
            nav.appendChild(link);
        } else {
            const current = document.createElement("span");
            current.className = "breadcrumb-current";
            current.textContent = item.label;
            current.setAttribute("aria-current", "page");
            nav.appendChild(current);
        }
    });
}

function getSectionLabel(section) {
    const labels = {
        home: "Главная",
        church: "Церковь",
        belonging: "Расы",
        gods: "Боги",
        worlds: "Миры",
        magic: "Магия",
        orders: "Святые ордена",
        theocracy: "Теократия",
        hegemony: "Гегемония",
        confederation: "Конфедерация",
        map: "Карта",
        author: "От автора"
    };

    return labels[section] || section;
}

function showGod(god) {

    const info = document.getElementById("god-info");
    if (!info) return;

    const data = gods[god];
    if (!data) {
        info.textContent = "Бог не найден.";
        return;
    }

    const pantheon = godPantheons[data.pantheon || "indigenous"];
    const category = pantheon?.categories[data.category];
    setBreadcrumbs([
        { label: "Боги", route: `#gods/${data.pantheon || "indigenous"}` },
        ...(category ? [{
            label: category.name,
            route: `#gods/${data.pantheon || "indigenous"}/category/${data.category}`
        }] : []),
        { label: data.name || god }
    ]);

    const sectionTitle = document.getElementById("god-section-title");
    const list = document.getElementById("god-list");
    if (list) list.hidden = true;
    if (sectionTitle) sectionTitle.hidden = true;
    info.hidden = false;

    const page = document.createElement("div");
    page.className = "god-page";

    const title = document.createElement("h1");
    title.className = "god-page-title";
    title.textContent = data.name || god;
    page.appendChild(title);

    if (data.title) {
        const subtitle = document.createElement("p");
        subtitle.className = "god-subtitle";
        subtitle.textContent = data.title;
        page.appendChild(subtitle);
    }

    const image = document.createElement("div");
    image.className = "god-image";
    if (data.image) {
        const imageElement = document.createElement("img");
        imageElement.src = data.image;
        imageElement.decoding = "async";
        imageElement.alt = `Изображение ${data.name || god}`;
        image.appendChild(imageElement);
    } else {
        image.textContent = data.imagePlaceholder || `Изображение ${data.name || god}`;
    }
    page.appendChild(image);

    const details = document.createElement("div");
    details.className = "god-details";

    const categoryLabel = godPantheons[data.pantheon]?.categories[data.category]?.label || data.category;
    [["Категория:", categoryLabel]]
        .filter(function ([, value]) { return value; })
        .forEach(function ([label, value]) {
        const row = document.createElement("p");
        const labelElement = document.createElement("strong");
        labelElement.textContent = label;
        row.append(labelElement, ` ${value}`);
        details.appendChild(row);
    });

    if (details.childElementCount > 0) {
        page.appendChild(details);
    }

    const descriptionTitle = document.createElement("h3");
    descriptionTitle.textContent = "Описание";
    page.appendChild(descriptionTitle);

    const description = document.createElement("p");
    description.textContent = data.description || "Описание пока не добавлено.";
    page.appendChild(description);

    info.replaceChildren(page);
}

function renderGods(pantheonId = currentGodPantheon) {
    const list = document.getElementById("god-list");
    if (!list) return;

    const pantheon = godPantheons[pantheonId];
    if (!pantheon) return;

    currentGodPantheon = pantheonId;
    const info = document.getElementById("god-info");
    const sectionTitle = document.getElementById("god-section-title");
    if (sectionTitle) sectionTitle.textContent = pantheon.name;
    list.hidden = false;
    if (sectionTitle) sectionTitle.hidden = false;
    if (info) {
        info.hidden = true;
        info.replaceChildren();
    }

    const categories = new Map();

    Object.entries(gods).forEach(function ([key, data]) {
        if ((data.pantheon || "indigenous") !== pantheonId || data.standalone) return;

        const category = data.category || "uncategorized";
        if (!categories.has(category)) {
            categories.set(category, []);
        }
        categories.get(category).push([key, data]);
    });

    list.replaceChildren();

    const pantheonCategoryOrder = pantheonId === "indigenous"
        ? ["senior", "junior", "demigod", "heraldKitil", "heraldIbel", "heraldAlimesa"]
        : Object.keys(pantheon.categories);
    const categoryKeys = [
        ...pantheonCategoryOrder,
        ...Array.from(categories.keys()).filter(function (key) {
            return !pantheon.categories[key];
        })
    ];
    const heraldCategories = ["heraldKitil", "heraldIbel", "heraldAlimesa"];
    const heraldColumns = document.createElement("div");
    heraldColumns.className = "god-herald-columns";

    categoryKeys.forEach(function (categoryKey, index) {
        const items = categories.get(categoryKey) || [];
        const category = pantheon.categories[categoryKey];
        const heading = document.createElement("h3");
        heading.className = "god-category";

        const toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = "god-category-toggle";
        toggle.id = `god-category-toggle-${index}`;
        toggle.textContent = category?.name || (categoryKey === "uncategorized" ? "Без категории" : categoryKey);
        toggle.setAttribute("aria-label", toggle.textContent);
        toggle.setAttribute("aria-expanded", "false");

        const definition = document.createElement("div");
        definition.className = "god-category-definition";
        definition.id = `god-category-definition-${index}`;
        definition.setAttribute("role", "region");
        definition.setAttribute("aria-labelledby", toggle.id);
        definition.textContent = category?.definition || "Определение пока не добавлено.";
        definition.hidden = true;

        toggle.setAttribute("aria-controls", definition.id);
        toggle.addEventListener("click", function () {
            const isExpanded = toggle.getAttribute("aria-expanded") === "true";
            toggle.setAttribute("aria-expanded", String(!isExpanded));
            definition.hidden = isExpanded;
        });

        heading.appendChild(toggle);

        const categoryBlock = document.createElement("div");
        categoryBlock.className = "god-category-block";
        categoryBlock.id = `god-category-${categoryKey}`;

        const group = document.createElement("div");
        group.className = "god-buttons";
        if (categoryKey === "senior" || categoryKey === "junior") {
            group.classList.add("god-buttons-aligned");
        }

        items.forEach(function ([key, data]) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "god-button";
            if (data.image) {
                button.classList.add("god-button-has-image");
            }

            const name = document.createElement("strong");
            name.className = "god-button-name";
            name.textContent = data.name || key;
            if ((data.name || key).length > 30) {
                button.classList.add("god-button-wide");
            }

            if (data.image) {
                const image = document.createElement("img");
                image.className = "god-button-image";
                image.src = data.image;
                image.alt = "";
                image.loading = "lazy";
                image.decoding = "async";
                button.appendChild(image);
            } else {
                const imagePlaceholder = document.createElement("span");
                imagePlaceholder.className = "god-button-image-placeholder";
                imagePlaceholder.setAttribute("aria-hidden", "true");
                button.appendChild(imagePlaceholder);
            }

            const overlay = document.createElement("span");
            overlay.className = "god-button-overlay";
            overlay.appendChild(name);

            if (data.title) {
                const title = document.createElement("span");
                title.className = "god-button-title";
                title.textContent = data.title;
                overlay.appendChild(title);
            }

            const description = document.createElement("span");
            description.className = "god-button-description";
            const fullDescription = data.description || "Описание пока не добавлено.";
            description.textContent = fullDescription.length > 118
                ? `${fullDescription.slice(0, 115).trimEnd()}...`
                : fullDescription;
            overlay.appendChild(description);
            button.appendChild(overlay);

            button.addEventListener("pointerdown", function (event) {
                if (event.pointerType !== "touch") return;

                button.touchStartX = event.clientX;
                button.touchStartY = event.clientY;
                button.touchMoved = false;
            });
            button.addEventListener("pointermove", function (event) {
                if (event.pointerType !== "touch" || button.touchMoved) return;

                const distanceX = event.clientX - button.touchStartX;
                const distanceY = event.clientY - button.touchStartY;
                button.touchMoved = Math.hypot(distanceX, distanceY) > 10;
            });
            button.addEventListener("pointercancel", function () {
                button.touchMoved = true;
            });
            button.addEventListener("click", function (event) {
                activateGodButton(button, key, event);
            });
            group.appendChild(button);
        });

        if (items.length === 0) {
            const emptyState = document.createElement("p");
            emptyState.className = "god-empty-state";
            emptyState.textContent = "Боги пока не добавлены.";
            group.appendChild(emptyState);
        }

        categoryBlock.append(heading, definition, group);

        if (heraldCategories.includes(categoryKey)) {
            if (!heraldColumns.isConnected) {
                list.appendChild(heraldColumns);
            }
            heraldColumns.appendChild(categoryBlock);
        } else {
            list.appendChild(categoryBlock);
        }
    });
}

function isMobileGodLayout() {
    return window.matchMedia("(max-width: 700px)").matches;
}

function activateGodButton(button, godKey, event) {
    if (!isMobileGodLayout()) {
        openGodPage(godKey);
        return;
    }

    if (button.touchMoved) {
        button.touchMoved = false;
        delete button.dataset.lastTap;
        button.classList.remove("is-tap-ready");
        return;
    }

    const now = Date.now();
    const lastTap = Number(button.dataset.lastTap || 0);
    const isKeyboardActivation = event.detail === 0;

    if (isKeyboardActivation || now - lastTap <= 600) {
        delete button.dataset.lastTap;
        button.classList.remove("is-tap-ready");
        openGodPage(godKey);
        return;
    }

    button.dataset.lastTap = String(now);
    button.classList.add("is-tap-ready");
    window.setTimeout(function () {
        if (Number(button.dataset.lastTap) === now) {
            delete button.dataset.lastTap;
            button.classList.remove("is-tap-ready");
        }
    }, 650);
}

function showGods(pantheonId = "indigenous", addHistory = true) {
    if (!godPantheons[pantheonId]) return;

    currentGodPantheon = pantheonId;
    closeFactionMenu();

    const route = `#gods/${pantheonId}`;
    if (addHistory && window.location.hash !== route) {
        setWikiRoute(route);
    }

    showSection("gods", true, false, false);
}

function openGodPage(god) {
    const data = gods[god];
    if (!data) return;

    const pantheonId = data.pantheon || "indigenous";
    if (!godPantheons[pantheonId]) return;
    closeFactionMenu();

    if (currentSection !== "gods" || currentGodPantheon !== pantheonId) {
        showGods(pantheonId);
    }

    setWikiRoute(`#gods/${pantheonId}/god/${encodeURIComponent(god)}`);
    showGod(god);
}

function handleGodRoute() {
    const parts = window.location.hash.slice(1).split("/");
    if (parts[0] !== "gods") return false;

    let pantheonId = parts[1] || "indigenous";
    let viewType = parts[2];
    let itemId = parts[3];

    if (!godPantheons[pantheonId]) {
        const legacyGod = gods[pantheonId];
        if (legacyGod) {
            pantheonId = legacyGod.pantheon || "indigenous";
            viewType = "god";
            itemId = parts[1];
        } else {
            pantheonId = "indigenous";
            viewType = undefined;
            itemId = undefined;
        }
    }

    if (viewType !== "category" && viewType !== "god" && viewType) {
        const legacyGod = gods[viewType];
        if (legacyGod) {
            itemId = viewType;
            viewType = "god";
            pantheonId = legacyGod.pantheon || pantheonId;
        }
    }

    currentGodPantheon = pantheonId;
    showSection("gods", true, false, false);

    if (viewType === "category" && godPantheons[pantheonId].categories[itemId]) {
        const category = godPantheons[pantheonId].categories[itemId];
        setBreadcrumbs([
            { label: "Боги", route: `#gods/${pantheonId}` },
            { label: category.name }
        ]);
        document.getElementById(`god-category-${itemId}`)?.scrollIntoView({ block: "start" });
    } else if (viewType === "god") {
        let godKey = itemId;
        try {
            godKey = decodeURIComponent(godKey);
        } catch (error) {
            godKey = itemId;
        }

        if (gods[godKey]) {
            showGod(godKey);
        }
    }

    return true;
}


/* =========================
   ПРИНАДЛЕЖНОСТЬ
   ========================= */

function renderBelongingRoot() {
    const info = document.getElementById("belonging-info");

    if (!info) return;

    info.replaceChildren();
    setBreadcrumbs([
        { label: "Расы", route: "#races" },
        { label: "Принадлежность" }
    ]);
}

function showBelonging(belongingId, syncRoute = true) {
    const info = document.getElementById("belonging-info");
    const belonging = raceBelongings[belongingId];

    if (!info || !belonging) return;

    if (syncRoute) setWikiRoute(`#belonging/${belongingId}`);
    setBreadcrumbs([
        { label: "Расы", route: "#races" },
        { label: "Принадлежность", route: "#belonging" },
        { label: belonging.name }
    ]);

    const categoryButtons = Object.entries(belonging.categories).map(([id, category]) => `
        <button
            class="creature-category-button"
            onclick="showCreatureCategory('${belongingId}', '${id}')"
        >
            ${category.name}
        </button>
    `).join("");

    info.innerHTML = `
        <h2>${belonging.name}</h2>
        <p>${belonging.description}</p>

        <div class="creature-category-list">
            ${categoryButtons || "<p>Категории существ пока не определены.</p>"}
        </div>
    `;

}


/* =========================
   КАТЕГОРИИ СУЩЕСТВ
   ========================= */

function showCreatureCategory(belongingId, categoryId, syncRoute = true) {
    const info = document.getElementById("belonging-info");
    const belonging = raceBelongings[belongingId];
    const category = belonging && belonging.categories[categoryId];

    if (!info || !belonging || !category) return;

    if (syncRoute) setWikiRoute(`#belonging/${belongingId}/${categoryId}`);
    setBreadcrumbs([
        { label: "Расы", route: "#races" },
        { label: "Принадлежность", route: "#belonging" },
        { label: belonging.name, route: `#belonging/${belongingId}` },
        { label: category.name }
    ]);

    const raceButtons = (category.races || []).map((raceId) => {
        const race = races[raceId];

        if (!race) return "";

        return `
            <button
                class="creature-category-button"
                onclick="showRace('${raceId}', '${categoryId}')"
            >
                ${race.name}
            </button>
        `;
    }).join("");

    info.innerHTML = `
        <h2>${belonging.name} — ${category.name}</h2>
        <p>${category.description}</p>

        <div class="creature-category-list">
            ${raceButtons || "<p>Категория пока не проработана.</p>"}
        </div>
    `;

}


/* =========================
   РАСЫ
   ========================= */

function showRace(raceId, categoryId = "sentient", syncRoute = true) {
    const info = document.getElementById("belonging-info");
    const race = races[raceId];

    if (!info || !race) return;

    const belonging = raceBelongings[race.belonging];
    const category = belonging?.categories[categoryId];
    if (!belonging || !category) return;

    if (syncRoute) setWikiRoute(`#belonging/${race.belonging}/${categoryId}/${raceId}`);
    setBreadcrumbs([
        { label: "Расы", route: "#races" },
        { label: "Принадлежность", route: "#belonging" },
        { label: belonging.name, route: `#belonging/${race.belonging}` },
        { label: category.name, route: `#belonging/${race.belonging}/${categoryId}` },
        { label: race.name }
    ]);

    info.innerHTML = `
        <h2>${race.name}</h2>
        <p>${race.description}</p>
        ${race.notes ? `<p>${race.notes}</p>` : ""}
    `;

}


/* =========================
   ПЕРЕКЛЮЧЕНИЕ РАЗДЕЛОВ
   ========================= */

let currentSection = "home";

function updateActiveNav(section) {
    document.querySelectorAll(".sidebar nav [data-nav-section]").forEach(function (element) {
        const isActive = element.dataset.navSection
            .split(",")
            .map(function (item) { return item.trim(); })
            .includes(section);

        element.classList.toggle("is-active", isActive);
        if (isActive) {
            element.setAttribute("aria-current", "true");
        } else {
            element.removeAttribute("aria-current");
        }
    });
}

function showSection(section, setRootRoute = false, syncGodRoute = true, syncRoute = true) {
    const sections = document.querySelectorAll(".content section");
    const selected = document.getElementById(section);

    if (!selected) return;

    document.querySelector(".app")?.classList.toggle("is-home", section === "home");
    if (section === "home") window.scrollTo(0, 0);

    if (
        syncGodRoute &&
        currentSection === "gods" &&
        section !== "gods" &&
        /^#gods(?:\/|$)/.test(window.location.hash)
    ) {
        window.history.replaceState({ route: section }, "", `#${section}`);
    }

    const sectionChanged = currentSection !== section;
    currentSection = section;
    if (setRootRoute || sectionChanged) {
        setBreadcrumbs(section === "belonging"
            ? [
                { label: "Расы", route: "#races" },
                { label: "Принадлежность" }
            ]
            : [{ label: getSectionLabel(section) }]);
    }

    if (setRootRoute && syncRoute) {
        setWikiRoute(`#${section}`);
    }

    sections.forEach(function (item) {
        item.style.display = "none";
    });

    selected.style.display = section === "home" ? "flex" : "block";
    if (sectionChanged) {
        selected.classList.remove("section-enter");
        void selected.offsetWidth;
        selected.classList.add("section-enter");
    }
    updateActiveNav(section);
    if (section === "gods") {
        renderGods();
    }
}

function closeFactionMenu() {
    document.querySelectorAll(".menu-dropdown").forEach(function (menu) {
        const toggle = menu.querySelector(":scope > button");

        menu.classList.remove("is-open");

        if (toggle) {
            toggle.setAttribute("aria-expanded", "false");
        }
    });
}

function toggleFactionMenu(event) {
    const menu = event.currentTarget.closest(".menu-dropdown");

    if (!menu) return;

    const isOpen = menu.classList.contains("is-open");
    if (isOpen) {
        closeFactionMenu();
        return;
    }

    closeFactionMenu();
    menu.classList.add("is-open");
    event.currentTarget.setAttribute("aria-expanded", "true");
    event.stopPropagation();
}

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        closeFactionMenu();
    }
});


/* =========================
   СТАРТОВАЯ СТРАНИЦА
   ========================= */

let currentLanguage = "ru";
let searchIndex = [];

function t(key) {
    const value = key.split(".").reduce(function (result, part) {
        return result ? result[part] : null;
    }, i18n[currentLanguage]);

    return value || key;
}

function applyTranslations() {
    document.querySelectorAll("[data-i18n]").forEach(function (element) {
        element.textContent = t(element.dataset.i18n);
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (element) {
        element.placeholder = t(element.dataset.i18nPlaceholder);
    });

    document.querySelectorAll("[data-i18n-aria]").forEach(function (element) {
        element.setAttribute("aria-label", t(element.dataset.i18nAria));
    });

    document.querySelectorAll("[data-i18n-title]").forEach(function (element) {
        element.title = t(element.dataset.i18nTitle);
    });

    document.querySelectorAll("[data-language]").forEach(function (button) {
        button.classList.toggle(
            "is-active",
            button.dataset.language === currentLanguage
        );
    });
}

function setLanguage(language) {
    if (language !== "ru") {
        applyTranslations();
        return;
    }

    currentLanguage = "ru";
    document.documentElement.lang = currentLanguage;
    applyTranslations();

    if (searchIndex.length > 0) {
        searchIndex = buildSearchIndex();
        const input = document.getElementById("site-search-input");
        if (input?.value) renderSearchResults(input.value);
    }
}

/* =========================
   КНОПКА-РОЗЫГРЫШ

   Светлой темы больше нет — кнопка осталась как розыгрыш.
   Звук синтезируется через Web Audio API, без файлов.
   ========================= */

let prankHideTimeout = null;

function ensurePrankOverlay() {
    let overlay = document.getElementById("prank-overlay");

    if (overlay) return overlay;

    overlay = document.createElement("div");
    overlay.id = "prank-overlay";
    overlay.hidden = true;

    const text = document.createElement("span");
    text.className = "prank-text";
    text.textContent = "ХУЙ ТЕБЕ";
    overlay.appendChild(text);

    overlay.addEventListener("click", hidePrank);
    document.body.appendChild(overlay);

    return overlay;
}

function playPrankSound() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    const context = new AudioContextClass();
    const now = context.currentTime;

    const master = context.createGain();
    master.gain.value = 0.85;
    master.connect(context.destination);

    // Долгое эхо: линия задержки с обратной связью
    const delay = context.createDelay(2);
    delay.delayTime.value = 0.33;
    const feedback = context.createGain();
    feedback.gain.value = 0.5;
    const echoTone = context.createBiquadFilter();
    echoTone.type = "lowpass";
    echoTone.frequency.value = 800;

    delay.connect(feedback);
    feedback.connect(echoTone);
    echoTone.connect(delay);
    delay.connect(master);

    // Тело звука: пилообразный осциллятор с падающей частотой и дрожанием
    const body = context.createOscillator();
    body.type = "sawtooth";
    body.frequency.setValueAtTime(90, now);
    body.frequency.exponentialRampToValueAtTime(42, now + 0.9);

    const wobble = context.createOscillator();
    wobble.frequency.value = 27;
    const wobbleDepth = context.createGain();
    wobbleDepth.gain.value = 24;
    wobble.connect(wobbleDepth);
    wobbleDepth.connect(body.frequency);

    const tone = context.createBiquadFilter();
    tone.type = "lowpass";
    tone.frequency.setValueAtTime(500, now);
    tone.frequency.exponentialRampToValueAtTime(160, now + 1.0);
    tone.Q.value = 7;

    const envelope = context.createGain();
    envelope.gain.setValueAtTime(0.0001, now);
    envelope.gain.exponentialRampToValueAtTime(1.0, now + 0.06);
    envelope.gain.setValueAtTime(1.0, now + 0.45);
    envelope.gain.exponentialRampToValueAtTime(0.001, now + 1.1);

    body.connect(envelope);
    envelope.connect(tone);
    tone.connect(master);
    tone.connect(delay);

    // Шелест: короткий шумовой всплеск поверх основного тона
    const noiseLength = Math.floor(context.sampleRate * 0.9);
    const noiseBuffer = context.createBuffer(1, noiseLength, context.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseLength; i++) {
        noiseData[i] = Math.random() * 2 - 1;
    }

    const noise = context.createBufferSource();
    noise.buffer = noiseBuffer;

    const noiseEnvelope = context.createGain();
    noiseEnvelope.gain.setValueAtTime(0.35, now);
    noiseEnvelope.gain.exponentialRampToValueAtTime(0.002, now + 0.8);

    noise.connect(noiseEnvelope);
    noiseEnvelope.connect(tone);

    body.start(now);
    wobble.start(now);
    noise.start(now);
    body.stop(now + 1.2);
    wobble.stop(now + 1.2);
    noise.stop(now + 0.9);

    window.setTimeout(function () {
        context.close();
    }, 6000);
}

function triggerPrank() {
    const overlay = ensurePrankOverlay();

    overlay.hidden = false;
    overlay.classList.remove("is-playing");
    void overlay.offsetWidth;
    overlay.classList.add("is-playing");

    playPrankSound();

    window.clearTimeout(prankHideTimeout);
    prankHideTimeout = window.setTimeout(hidePrank, 3500);
}

function hidePrank() {
    window.clearTimeout(prankHideTimeout);
    const overlay = document.getElementById("prank-overlay");
    if (overlay) overlay.hidden = true;
}

setLanguage("ru");

showSection("home");
handleWikiRoute();

function renderWikiCards(items, renderItem) {
    return `
        <div class="wiki-cards">
            ${items.map(renderItem).join("")}
        </div>
    `;
}

function renderMagicFoundations() {
    const content = document.getElementById("magic-foundations");

    if (!content) return;

    content.innerHTML = `
        <h2>Основные темы</h2>
        ${renderWikiCards(magic.foundations, topic => `
            <button class="wiki-card"
                    onclick="showMagicFoundation('${topic.id}')">
                <h2>${topic.title}</h2>
                <p>${topic.description}</p>
            </button>
        `)}
    `;
}

function renderMagicTypes() {
    const content = document.getElementById("magic-types");

    if (!content) return;

    content.innerHTML = `
        <h2>Виды магии</h2>
        ${renderWikiCards(Object.entries(magic.types), ([id, type]) => `
            <button class="wiki-card"
                    onclick="showMagicType('${id}')">
                <h2>${type.name}</h2>
                <p>${type.summary}</p>
            </button>
        `)}
    `;
}

function renderWorlds() {
    const content = document.getElementById("worlds-content");

    if (!content) return;

    content.innerHTML = `
        <h1>Миры</h1>
        <p>Выберите мир или измерение, чтобы открыть подробности.</p>

        <h2>Измерения</h2>
        ${renderWikiCards(Object.entries(dimensions), ([id, dimension]) => `
            <button class="wiki-card"
                    onclick="showDimension('${id}')">
                <h2>${dimension.name}</h2>
                <p>${dimension.summary}</p>
            </button>
        `)}

        <h2>Миры</h2>
        ${renderWikiCards(Object.entries(worlds), ([id, world]) => `
            <button class="wiki-card"
                    onclick="showWorld('${id}')">
                <h2>${world.name}</h2>
                <p>${world.description}</p>
            </button>
        `)}
    `;
}

function showWorlds() {
    showSection("worlds", true);
    renderWorlds();
    const info = document.getElementById("worlds-info");

    if (info) {
        info.innerHTML = "";
    }
}

function showWorld(worldId, syncRoute = true) {
    const world = worlds[worldId];
    const info = document.getElementById("worlds-info");

    if (!world || !info) return;

    if (syncRoute) setWikiRoute(`#worlds/world/${encodeURIComponent(worldId)}`);
    setBreadcrumbs([
        { label: "Миры", route: "#worlds" },
        { label: world.name }
    ]);
    info.innerHTML = `
        <h2>${world.name}</h2>
        <p>${world.description}</p>
    `;
}

function showDimension(dimensionId, syncRoute = true) {
    const dimension = dimensions[dimensionId];
    const info = document.getElementById("worlds-info");

    if (!dimension || !info) return;

    if (syncRoute) setWikiRoute(`#worlds/dimension/${encodeURIComponent(dimensionId)}`);
    setBreadcrumbs([
        { label: "Миры", route: "#worlds" },
        { label: "Измерения", route: "#worlds" },
        { label: dimension.name }
    ]);
    info.innerHTML = `
        <h2>${dimension.name}</h2>
        <p>${dimension.description}</p>
        <p>${dimension.summary}</p>
        <ul>
            ${dimension.notes.map(note => `<li>${note}</li>`).join("") || "<li>Описание пока не добавлено.</li>"}
        </ul>
    `;
}

function showMagic() {
    showSection("magic", true);
    renderMagicFoundations();
    renderMagicTypes();
    document.getElementById("magic-foundation-info")?.replaceChildren();
    document.getElementById("magic-type-info")?.replaceChildren();
}

function showMagicFoundation(topicId, syncRoute = true) {
    const topic = magic.foundations.find(item => item.id === topicId);
    const info = document.getElementById("magic-foundation-info");

    if (!topic || !info) return;

    if (syncRoute) setWikiRoute(`#magic/foundation/${encodeURIComponent(topicId)}`);
    setBreadcrumbs([
        { label: "Магия", route: "#magic" },
        { label: "Основные темы", route: "#magic" },
        { label: topic.title }
    ]);
    document.getElementById("magic-type-info")?.replaceChildren();
    info.innerHTML = `
        <h2>${topic.title}</h2>
        <p>${topic.description}</p>
    `;
}

function showMagicType(typeId, syncRoute = true) {
    const type = magic.types[typeId];
    const info = document.getElementById("magic-type-info");

    if (!type || !info) return;

    if (syncRoute) setWikiRoute(`#magic/type/${encodeURIComponent(typeId)}`);
    setBreadcrumbs([
        { label: "Магия", route: "#magic" },
        { label: "Виды магии", route: "#magic" },
        { label: type.name }
    ]);
    document.getElementById("magic-foundation-info")?.replaceChildren();
    info.innerHTML = `
        <h2>${type.name}</h2>
        <p>${type.description}</p>
    `;
}

function renderOrders(targetId = "orders-content") {
    const content = document.getElementById(targetId);

    if (!content) return;

    if (targetId === "orders-content") {
        setBreadcrumbs([{ label: "Святые ордена" }]);
    }

    content.innerHTML = `
        <h1>Святые ордена</h1>
        <p>Выберите орден, чтобы открыть его описание.</p>
        ${renderWikiCards(Object.entries(orders), ([id, order]) => `
            <button class="wiki-card"
                    onclick="showOrder('${id}', '${targetId === 'church-content'}')">
                <h2>${order.name}</h2>
                <p>${order.description}</p>
            </button>
        `)}
    `;
}

function showOrders(fromChurchContext = false) {
    if (fromChurchContext) {
        showSection("church");
        renderOrders("church-content");
        return;
    }

    showSection("orders", true);
    renderOrders();
}

function showOrder(orderId, fromChurchContext = false, syncRoute = true) {
    const order = orders[orderId];
    const targetId = fromChurchContext === true || fromChurchContext === "true" ? "church-content" : "orders-content";
    const content = document.getElementById(targetId);

    if (!order || !content) return;

    if (fromChurchContext === true || fromChurchContext === "true") {
        const match = window.location.hash.match(/^#church\/([^/]+)\/([^/]+)\/topic\/(\d+)/);
        if (match) {
            const [, branchId, chamberId, topicIndex] = match;
            const topic = church.branches[branchId]?.chambers[chamberId]?.topics[Number(topicIndex)];
            if (topic) {
                if (syncRoute) setWikiRoute(`${match[0]}/order/${encodeURIComponent(orderId)}`);
                setChurchBreadcrumbs(branchId, chamberId, topic.name, order.name, Number(topicIndex));
            }
        }
    } else if (syncRoute) {
        setWikiRoute(`#orders/${encodeURIComponent(orderId)}`);
        setBreadcrumbs([
            { label: "Святые ордена", route: "#orders" },
            { label: order.name }
        ]);
    }

    content.innerHTML = `
        <h1>${order.name}</h1>
        <p>${order.description}</p>
    `;
}

function renderChurchContent() {
    const content = document.getElementById("church-content");

    if (!content) return;

    setBreadcrumbs([{ label: "Церковь" }]);

    content.innerHTML = `
        <h1>Церковь</h1>
        <p>Выберите ветвь Церкви.</p>
        ${renderWikiCards(Object.entries(church.branches), ([id, branch]) => `
            <button class="wiki-card"
                    onclick="showChurchBranch('${id}')">
                <h2>${branch.name}</h2>
                <p>${branch.description}</p>
            </button>
        `)}
    `;
}

function showChurch() {
    showSection("church", true);
    renderChurchContent();
}


function showChurchBranch(branchId, syncRoute = true) {
    const branch = church.branches[branchId];

    if (!branch) return;

    if (syncRoute) setWikiRoute(`#church/${encodeURIComponent(branchId)}`);

    showSection("church");
    setBreadcrumbs([
        { label: "Церковь", route: "#church" },
        { label: branch.name }
    ]);

    const content = document.getElementById("church-content");

    content.innerHTML = `
        <h1>${branch.name}</h1>
        <p>${branch.description}</p>

        <h2>Палаты</h2>
        ${renderWikiCards(Object.entries(branch.chambers), ([id, chamber]) => `
            <button class="wiki-card"
                    onclick="showChurchChamber('${branchId}', '${id}')">
                <h2>${chamber.name}</h2>
                <p>${chamber.description}</p>
            </button>
        `)}
    `;

}


function showChurchChamber(branchId, chamberId, syncRoute = true) {
    const branch = church.branches[branchId];
    if (!branch) return;

    const chamber = branch.chambers[chamberId];

    if (!chamber) return;

    if (syncRoute) setWikiRoute(`#church/${encodeURIComponent(branchId)}/${encodeURIComponent(chamberId)}`);
    setBreadcrumbs([
        { label: "Церковь", route: "#church" },
        { label: branch.name, route: `#church/${encodeURIComponent(branchId)}` },
        { label: chamber.name }
    ]);

    showSection("church");
    setBreadcrumbs([
        { label: "Церковь", route: "#church" },
        { label: branch.name, route: `#church/${encodeURIComponent(branchId)}` },
        { label: chamber.name }
    ]);

    const content = document.getElementById("church-content");

    content.innerHTML = `
        <h1>${chamber.name}</h1>
        <p>${chamber.description}</p>

        <h2>Темы</h2>
        ${renderWikiCards(chamber.topics, topic => `
            <button class="wiki-card"
                    onclick="openChurchTopic('${branchId}', '${chamberId}', '${chamber.topics.indexOf(topic)}')">
                <h2>${topic.name}</h2>
            </button>
        `)}
    `;

}


function setChurchBreadcrumbs(branchId, chamberId, topicName, currentName, topicIndex) {
    const branch = church.branches[branchId];
    const chamber = branch?.chambers[chamberId];
    if (!branch || !chamber) return;

    setBreadcrumbs([
        { label: "Церковь", route: "#church" },
        { label: branch.name, route: `#church/${encodeURIComponent(branchId)}` },
        { label: chamber.name, route: `#church/${encodeURIComponent(branchId)}/${encodeURIComponent(chamberId)}` },
        { label: topicName, ...(currentName ? { route: `#church/${encodeURIComponent(branchId)}/${encodeURIComponent(chamberId)}/topic/${topicIndex}` } : {}) },
        ...(currentName ? [{ label: currentName }] : [])
    ]);
}

function openChurchTopic(branchId, chamberId, topicIndex, syncRoute = true) {
    const branch = church.branches[branchId];
    const chamber = branch?.chambers[chamberId];
    const topic = chamber?.topics[Number(topicIndex)];

    if (!branch || !chamber || !topic) return;

    if (syncRoute) setWikiRoute(`#church/${encodeURIComponent(branchId)}/${encodeURIComponent(chamberId)}/topic/${topicIndex}`);
    setChurchBreadcrumbs(branchId, chamberId, topic.name, null, Number(topicIndex));

    if (topic.type === "orders") {
        showOrders(true);
        return;
    }

    showSection("church");

    const content = document.getElementById("church-content");
    const article = document.createElement("article");
    article.className = "church-article";

    const title = document.createElement("h1");
    title.textContent = topic.name;
    article.appendChild(title);

    const body = document.createElement("div");
    body.className = "church-article-body";
    const paragraphs = Array.isArray(topic.content)
        ? topic.content
        : (topic.content ? [topic.content] : ["Статья будет добавлена позже."]);
    paragraphs.forEach(function (text) {
        const paragraph = document.createElement("p");
        paragraph.textContent = text;
        body.appendChild(paragraph);
    });

    article.appendChild(body);
    content.replaceChildren(article);

}

function handleWikiRoute(force = false) {
    const hash = window.location.hash;
    if (!force && hash === lastResolvedHash) return;
    lastResolvedHash = hash;

    const parts = hash.replace(/^#/, "").split("/").filter(Boolean);
    const section = parts[0] === "races" ? "belonging" : (parts[0] || "home");
    const selected = document.getElementById(section);

    if (!selected) {
        showSection("home", true, false, false);
        return;
    }

    if (section === "gods") {
        handleGodRoute();
        return;
    }

    showSection(section, true, false, false);

    if (section === "church") {
        renderChurchContent();
        const [, branchId, chamberId, type, topicId, detailType, detailId] = parts;
        if (branchId && church.branches[branchId]) {
            showChurchBranch(branchId, false);
            if (chamberId && church.branches[branchId].chambers[chamberId]) {
                showChurchChamber(branchId, chamberId, false);
                if (type === "topic" && /^\d+$/.test(topicId || "")) {
                    openChurchTopic(branchId, chamberId, Number(topicId), false);
                    if (detailType === "order" && detailId) {
                        showOrder(decodeRoutePart(detailId), true, false);
                    }
                }
            }
        }
    } else if (section === "belonging") {
        renderBelongingRoot();
        const [, belongingId, categoryId, raceId] = parts;
        if (belongingId && raceBelongings[belongingId]) {
            showBelonging(belongingId, false);
            if (categoryId && raceBelongings[belongingId].categories[categoryId]) {
                showCreatureCategory(belongingId, categoryId, false);
                if (raceId && races[raceId]) showRace(raceId, categoryId, false);
            }
        }
    } else if (section === "orders") {
        renderOrders();
        if (parts[1] && orders[decodeRoutePart(parts[1])]) {
            showOrder(decodeRoutePart(parts[1]), false, false);
        }
    } else if (section === "worlds") {
        renderWorlds();
        const [, detailType, detailId] = parts;
        if (detailType === "world" && detailId) {
            showWorld(decodeRoutePart(detailId), false);
        } else if (detailType === "dimension" && detailId) {
            showDimension(decodeRoutePart(detailId), false);
        }
    } else if (section === "magic") {
        renderMagicFoundations();
        renderMagicTypes();
        document.getElementById("magic-foundation-info")?.replaceChildren();
        document.getElementById("magic-type-info")?.replaceChildren();

        const [, detailType, detailId] = parts;
        if (detailType === "foundation" && detailId) {
            showMagicFoundation(decodeRoutePart(detailId), false);
        } else if (detailType === "type" && detailId) {
            showMagicType(decodeRoutePart(detailId), false);
        }
    }

}

function decodeRoutePart(value) {
    try {
        return decodeURIComponent(value);
    } catch (error) {
        return value;
    }
}

function normalizeSearchText(value) {
    return String(value || "")
        .normalize("NFKC")
        .toLocaleLowerCase("ru-RU")
        .replace(/ё/g, "е")
        .replace(/[^\p{L}\p{N}]+/gu, " ")
        .trim();
}

function getSearchableText(values) {
    const candidates = Array.isArray(values) ? values.flat(Infinity) : [values];

    return candidates
        .filter(value => typeof value === "string")
        .map(value => value.trim())
        .filter(value => {
            if (!value) return false;

            const normalized = normalizeSearchText(value);
            return !/^(?:описание пока не добавлено|определение еще не добавлено|категория пока не проработана|здесь будет (?:подробное )?описание(?: .*)?|description not added)$/.test(normalized);
        })
        .join(" ");
}

function getSearchSectionLabel(sectionId) {
    const translationKey = `sections.${sectionId}`;
    const translated = t(translationKey);

    if (translated !== translationKey) return translated;
    if (sectionId === "home") return currentLanguage === "en" ? "Home" : "Главная";

    return getSectionLabel(sectionId);
}

function addSearchEntry(entries, title, section, contentValues, route, open, hierarchy = []) {
    const cleanTitle = String(title || "").trim();
    if (!cleanTitle) return;

    const cleanHierarchy = (Array.isArray(hierarchy) ? hierarchy : [hierarchy])
        .map(value => getSearchableText(value))
        .filter(Boolean)
        .join(" · ");
    const content = getSearchableText(contentValues);
    const titleKey = normalizeSearchText(cleanTitle);
    const context = [section, ...cleanHierarchy.split(" · ")]
        .filter(Boolean)
        .filter((value, index, values) => {
            const normalized = normalizeSearchText(value);
            return normalized !== titleKey
                && values.findIndex(candidate => normalizeSearchText(candidate) === normalized) === index;
        })
        .join(" · ");

    entries.push({
        title: cleanTitle,
        section,
        context,
        content,
        searchable: normalizeSearchText([cleanTitle, context, content].join(" ")),
        route,
        open
    });
}

function buildSearchIndex() {
    const entries = [];
    const dynamicContent = [
        "#church-content",
        "#belonging-info",
        "#god-list",
        "#god-info",
        "#worlds-content",
        "#worlds-info",
        "#orders-content",
        "#magic-foundations",
        "#magic-foundation-info",
        "#magic-types",
        "#magic-type-info"
    ].join(",");

    document.querySelectorAll(".content > section").forEach(section => {
        const staticSection = section.cloneNode(true);
        staticSection.querySelectorAll(dynamicContent).forEach(element => element.remove());

        const heading = staticSection.querySelector("h1, h2, h3");
        const title = heading?.textContent.trim() || getSearchSectionLabel(section.id);
        heading?.remove();
        const content = getSearchableText(staticSection.textContent);
        if (!title && !content) return;

        addSearchEntry(
            entries,
            title,
            getSearchSectionLabel(section.id),
            [content],
            `#${section.id}`
        );
    });

    Object.entries(godPantheons).forEach(([pantheonId, pantheon]) => {
        const godsLabel = getSearchSectionLabel("gods");
        addSearchEntry(entries, pantheon.name, godsLabel, [], `#gods/${pantheonId}`);

        Object.entries(pantheon.categories).forEach(([categoryId, category]) => {
            addSearchEntry(
                entries,
                category.name,
                godsLabel,
                [category.definition],
                `#gods/${pantheonId}/category/${categoryId}`,
                null,
                [pantheon.name]
            );
        });
    });

    Object.entries(gods).forEach(([godId, god]) => {
        const pantheonId = god.pantheon || "indigenous";
        const pantheon = godPantheons[pantheonId];
        const category = pantheon?.categories[god.category];
        addSearchEntry(
            entries,
            god.name,
            getSearchSectionLabel("gods"),
            [god.title, god.description],
            `#gods/${pantheonId}/god/${encodeURIComponent(godId)}`,
            null,
            [pantheon?.name, category?.name]
        );
    });

    const raceLocations = new Map();
    Object.entries(raceBelongings).forEach(([belongingId, belonging]) => {
        addSearchEntry(
            entries,
            belonging.name,
            getSearchSectionLabel("races"),
            [belonging.description],
            `#belonging/${belongingId}`,
            null,
            [getSearchSectionLabel("belonging")]
        );

        Object.entries(belonging.categories).forEach(([categoryId, category]) => {
            addSearchEntry(
                entries,
                category.name,
                getSearchSectionLabel("races"),
                [category.description],
                `#belonging/${belongingId}/${categoryId}`,
                null,
                [belonging.name]
            );

            (category.races || []).forEach(raceId => {
                if (!raceLocations.has(raceId)) {
                    raceLocations.set(raceId, { belongingId, categoryId, belonging, category });
                }
            });
        });
    });

    Object.entries(races).forEach(([raceId, race]) => {
        const location = raceLocations.get(raceId);
        const belonging = location?.belonging || raceBelongings[race.belonging];
        const categoryId = location?.categoryId || "sentient";
        addSearchEntry(
            entries,
            race.name,
            getSearchSectionLabel("races"),
            [race.description, race.notes],
            `#belonging/${race.belonging}/${categoryId}/${raceId}`,
            null,
            [belonging?.name, location?.category?.name]
        );
    });

    Object.entries(church.branches).forEach(([branchId, branch]) => {
        addSearchEntry(
            entries,
            branch.name,
            getSearchSectionLabel("church"),
            [branch.description],
            `#church/${encodeURIComponent(branchId)}`
        );

        Object.entries(branch.chambers).forEach(([chamberId, chamber]) => {
            addSearchEntry(
                entries,
                chamber.name,
                getSearchSectionLabel("church"),
                [chamber.description],
                `#church/${encodeURIComponent(branchId)}/${encodeURIComponent(chamberId)}`,
                null,
                [branch.name]
            );

            (chamber.topics || []).forEach((topic, topicIndex) => {
                addSearchEntry(
                    entries,
                    topic.name,
                    getSearchSectionLabel("church"),
                    [topic.description],
                    `#church/${encodeURIComponent(branchId)}/${encodeURIComponent(chamberId)}/topic/${topicIndex}`,
                    null,
                    [branch.name, chamber.name]
                );
            });
        });
    });

    let churchOrderRoute = null;
    Object.entries(church.branches).some(([branchId, branch]) =>
        Object.entries(branch.chambers).some(([chamberId, chamber]) => {
            const topicIndex = (chamber.topics || []).findIndex(topic => topic.type === "orders");
            if (topicIndex < 0) return false;

            churchOrderRoute = `#church/${encodeURIComponent(branchId)}/${encodeURIComponent(chamberId)}/topic/${topicIndex}`;
            return true;
        })
    );

    Object.entries(orders).forEach(([orderId, order]) => {
        const route = churchOrderRoute
            ? `${churchOrderRoute}/order/${encodeURIComponent(orderId)}`
            : `#orders/${encodeURIComponent(orderId)}`;
        addSearchEntry(
            entries,
            order.name,
            getSearchSectionLabel("church"),
            [order.description],
            route,
            null,
            [church.branches[order.branch]?.name || order.branch, getSearchSectionLabel("orders")]
        );
    });

    magic.foundations.forEach(topic => {
        addSearchEntry(
            entries,
            topic.title,
            getSearchSectionLabel("magic"),
            [topic.description],
            `#magic/foundation/${encodeURIComponent(topic.id)}`,
            null,
            ["Основные темы"]
        );
    });

    Object.entries(magic.types).forEach(([typeId, type]) => {
        addSearchEntry(
            entries,
            type.name,
            getSearchSectionLabel("magic"),
            [type.summary, type.description, type.focus, type.traits, type.principles, type.applications, type.limitations],
            `#magic/type/${encodeURIComponent(typeId)}`,
            null,
            ["Виды магии"]
        );
    });

    Object.entries(worlds).forEach(([worldId, world]) => {
        addSearchEntry(
            entries,
            world.name,
            getSearchSectionLabel("worlds"),
            [world.description],
            `#worlds/world/${encodeURIComponent(worldId)}`
        );
    });

    Object.entries(dimensions).forEach(([dimensionId, dimension]) => {
        addSearchEntry(
            entries,
            dimension.name,
            getSearchSectionLabel("worlds"),
            [dimension.description, dimension.summary, dimension.notes],
            `#worlds/dimension/${encodeURIComponent(dimensionId)}`,
            null,
            ["Измерения"]
        );
    });

    return entries;
}

function getSearchMatches(query) {
    const normalizedQuery = normalizeSearchText(query);
    const terms = normalizedQuery.split(/\s+/).filter(Boolean);
    if (terms.length === 0) return [];

    return searchIndex
        .map(entry => {
            if (!terms.every(term => entry.searchable.includes(term))) return null;

            const normalizedTitle = normalizeSearchText(entry.title);
            const normalizedContext = normalizeSearchText(entry.context);
            let score = 0;

            if (normalizedTitle === normalizedQuery) score += 100;
            else if (normalizedTitle.startsWith(normalizedQuery)) score += 60;
            else if (normalizedTitle.includes(normalizedQuery)) score += 35;
            if (normalizedContext.includes(normalizedQuery)) score += 15;

            return { entry, score };
        })
        .filter(Boolean)
        .sort((left, right) => right.score - left.score || left.entry.title.localeCompare(right.entry.title, currentLanguage));
}

function renderSearchResults(query) {
    const results = document.getElementById("search-results");
    const status = document.getElementById("search-status");
    if (!results || !status) return;

    results.replaceChildren();
    if (!normalizeSearchText(query)) {
        status.textContent = t("search.hint");
        status.hidden = false;
        return;
    }

    const matches = getSearchMatches(query).slice(0, 10);
    status.hidden = false;
    status.textContent = matches.length
        ? t("search.resultCount").replace("{count}", String(matches.length))
        : t("search.noResults");

    matches.forEach(({ entry }) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "search-result";
        button.setAttribute("role", "option");
        button.addEventListener("click", () => openSearchResult(entry));

        const title = document.createElement("span");
        title.className = "search-result-title";
        title.textContent = entry.title;
        button.appendChild(title);

        if (entry.context) {
            const context = document.createElement("span");
            context.className = "search-result-context";
            context.textContent = entry.context;
            button.appendChild(context);
        }

        if (entry.content) {
            const snippet = document.createElement("span");
            snippet.className = "search-result-snippet";
            snippet.textContent = entry.content.length > 170
                ? `${entry.content.slice(0, 167).trimEnd()}...`
                : entry.content;
            button.appendChild(snippet);
        }

        results.appendChild(button);
    });
}

function closeSearch(restoreFocus = false) {
    const panel = document.getElementById("search-panel");
    const toggle = document.getElementById("search-toggle");
    if (!panel || !toggle) return;

    panel.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    if (restoreFocus) toggle.focus();
}

function toggleSearch() {
    const panel = document.getElementById("search-panel");
    const input = document.getElementById("site-search-input");
    const toggle = document.getElementById("search-toggle");
    if (!panel || !input || !toggle) return;

    panel.hidden = !panel.hidden;
    toggle.setAttribute("aria-expanded", String(!panel.hidden));
    if (!panel.hidden) {
        renderSearchResults(input.value);
        input.focus();
    }
}

function openSearchResult(entry) {
    closeSearch();

    if (entry.open) {
        entry.open();
        return;
    }

    if (entry.route) {
        setWikiRoute(entry.route);
        handleWikiRoute(true);
    }
}

function initializeSearch() {
    const input = document.getElementById("site-search-input");
    const panel = document.getElementById("search-panel");
    const toggle = document.getElementById("search-toggle");
    if (!input || !panel || !toggle) return;

    searchIndex = buildSearchIndex();
    input.addEventListener("input", () => renderSearchResults(input.value));
    input.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            const firstResult = document.querySelector("#search-results .search-result");
            if (firstResult) {
                event.preventDefault();
                firstResult.click();
            }
        } else if (event.key === "ArrowDown") {
            const firstResult = document.querySelector("#search-results .search-result");
            if (firstResult) {
                event.preventDefault();
                firstResult.focus();
            }
        }
    });

    document.addEventListener("pointerdown", event => {
        if (!panel.contains(event.target) && !toggle.contains(event.target)) closeSearch();
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && !panel.hidden) {
            closeSearch(true);
        } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
            event.preventDefault();
            if (panel.hidden) toggleSearch();
            else input.focus();
        }
    });
}

initializeSearch();

window.addEventListener("hashchange", handleWikiRoute);
window.addEventListener("popstate", handleWikiRoute);