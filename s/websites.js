(function () {
    const DATA_URL = new URL('websites.json', window.location.href).href;
    const STORAGE_KEY = 'surrplexie-websites-custom';

    const DOMAIN_NAMES = {
        'chatgpt.com': 'ChatGPT',
        'claude.ai': 'Claude',
        'cursor.com': 'Cursor',
        'gemini.google.com': 'Google Gemini',
        'perplexity.ai': 'Perplexity',
        'github.com': 'GitHub',
        'stackoverflow.com': 'Stack Overflow',
        'reddit.com': 'Reddit',
        'youtube.com': 'YouTube',
        'google.com': 'Google',
        'linkedin.com': 'LinkedIn',
        'discord.com': 'Discord',
        'twitter.com': 'X',
        'x.com': 'X',
        'instagram.com': 'Instagram',
        'tiktok.com': 'TikTok',
        'twitch.tv': 'Twitch',
        'amazon.com': 'Amazon',
        'netflix.com': 'Netflix',
        'spotify.com': 'Spotify',
        'wikipedia.org': 'Wikipedia',
    };

    const searchInput = document.getElementById('website-search');
    const categoryFilter = document.getElementById('category-filter');
    const listRoot = document.getElementById('websites-list');
    const resultsCount = document.getElementById('results-count');
    const emptyState = document.getElementById('websites-empty');
    const addForm = document.getElementById('add-bookmark-form');
    const addUrlInput = document.getElementById('add-url');
    const addCategoryInput = document.getElementById('add-category');
    const addNameInput = document.getElementById('add-name');
    const addStatus = document.getElementById('add-bookmark-status');
    const categorySuggestions = document.getElementById('category-suggestions');

    let categories = [];
    let baseCategories = [];
    let customLinks = loadCustomLinks();
    let nameManuallyEdited = false;

    function escapeHtml(value) {
        return value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function escapeRegExp(value) {
        return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function highlight(text, query) {
        if (!query) {
            return escapeHtml(text);
        }

        const pattern = new RegExp(`(${escapeRegExp(query)})`, 'ig');
        return escapeHtml(text).replace(pattern, '<mark>$1</mark>');
    }

    function normalize(value) {
        return value.trim().toLowerCase();
    }

    function normalizeUrl(url) {
        const trimmed = url.trim();
        if (!trimmed) {
            return '';
        }

        const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

        try {
            const parsed = new URL(withProtocol);
            return parsed.href.replace(/\/$/, '');
        } catch {
            return '';
        }
    }

    function urlKey(url) {
        return normalizeUrl(url).toLowerCase();
    }

    function displayUrl(url) {
        return url.replace(/^https?:\/\//i, '').replace(/\/$/, '');
    }

    function displayName(rawUrl) {
        let parsed;

        try {
            parsed = new URL(normalizeUrl(rawUrl));
        } catch {
            return rawUrl.trim();
        }

        const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
        if (!host) {
            return rawUrl.trim();
        }

        for (const [domain, name] of Object.entries(DOMAIN_NAMES)) {
            if (host === domain || host.endsWith(`.${domain}`)) {
                const path = parsed.pathname.replace(/^\/|\/$/g, '');

                if (domain === 'github.com' && path) {
                    const parts = path.split('/');
                    if (parts[0].toLowerCase() === 'orgs' && parts.length >= 2) {
                        return `${parts[1]} · GitHub`;
                    }
                    if (parts[0]) {
                        return `${parts[0]} · GitHub`;
                    }
                    return name;
                }

                if (domain === 'reddit.com' && path) {
                    const segments = path.split('/').filter(Boolean);
                    if (segments[0] === 'r' && segments[1]) {
                        return `r/${segments[1]} · Reddit`;
                    }
                    if (segments[0] === 'user' && segments[1]) {
                        return `u/${segments[1]} · Reddit`;
                    }
                }

                return name;
            }
        }

        const path = parsed.pathname.replace(/\/$/, '');
        if (path && path !== '/') {
            const parts = path.split('/').filter(Boolean);
            const segment = (parts[parts.length - 1] || parts[parts.length - 2] || '')
                .replace(/[-_.]/g, ' ')
                .slice(0, 48)
                .trim();

            if (segment) {
                const brand = host.split('.')[0].replace(/-/g, ' ');
                return `${segment.replace(/\b\w/g, (char) => char.toUpperCase())} · ${brand.replace(/\b\w/g, (char) => char.toUpperCase())}`;
            }
        }

        return host.split('.')[0].replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
    }

    function loadCustomLinks() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) {
                return [];
            }

            const parsed = JSON.parse(stored);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }

    function saveCustomLinks() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(customLinks));
    }

    function cloneCategories(source) {
        return (source.categories || []).map((category) => ({
            name: category.name,
            links: category.links.map((link) => ({ ...link })),
        }));
    }

    function mergeCustomLinks(baseCategories) {
        const merged = cloneCategories({ categories: baseCategories });
        const seen = new Set();

        merged.forEach((category) => {
            category.links.forEach((link) => {
                seen.add(urlKey(link.url));
            });
        });

        customLinks.forEach((entry) => {
            const normalized = normalizeUrl(entry.url);
            const key = urlKey(normalized);
            if (!normalized || seen.has(key)) {
                return;
            }

            seen.add(key);
            let category = merged.find((item) => item.name === entry.category);
            if (!category) {
                category = { name: entry.category, links: [] };
                merged.push(category);
            }

            category.links.push({
                name: entry.name || displayName(normalized),
                url: normalized,
                customId: entry.id,
            });
        });

        return merged.filter((category) => category.links.length > 0);
    }

    function populateCategorySuggestions() {
        categorySuggestions.innerHTML = '';
        categories.forEach((category) => {
            const option = document.createElement('option');
            option.value = category.name;
            categorySuggestions.appendChild(option);
        });
    }

    function createBookmarkNode(link, categoryIndex, linkIndex, categoryName) {
        const wrap = document.createElement('div');
        wrap.className = 'bookmark-item-wrap';

        const anchor = document.createElement('a');
        anchor.className = 'bookmark-item';
        anchor.href = link.url;
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
        anchor.dataset.categoryIndex = String(categoryIndex);
        anchor.dataset.linkIndex = String(linkIndex);
        anchor.dataset.name = link.name;
        anchor.dataset.url = link.url;
        anchor.dataset.categoryName = categoryName;

        anchor.innerHTML = `
            <span class="bookmark-name">${escapeHtml(link.name)}</span>
            <span class="bookmark-url">${escapeHtml(displayUrl(link.url))}</span>
        `;

        wrap.appendChild(anchor);

        if (link.customId) {
            const removeButton = document.createElement('button');
            removeButton.type = 'button';
            removeButton.className = 'bookmark-remove';
            removeButton.dataset.customId = link.customId;
            removeButton.setAttribute('aria-label', `Remove ${link.name}`);
            removeButton.innerHTML = '<i class="fas fa-times" aria-hidden="true"></i>';
            removeButton.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                removeCustomLink(link.customId);
            });
            wrap.appendChild(removeButton);
        }

        return wrap;
    }

    function refreshView() {
        categories = mergeCustomLinks(baseCategories);
        listRoot.innerHTML = '';
        categoryFilter.innerHTML = '<option value="">All categories</option>';
        populateCategorySuggestions();

        categories.forEach((category, index) => {
            const option = document.createElement('option');
            option.value = String(index);
            option.textContent = category.name;
            categoryFilter.appendChild(option);

            const section = document.createElement('section');
            section.className = 'website-category';
            section.dataset.categoryIndex = String(index);

            const heading = document.createElement('h3');
            heading.className = 'category-heading';
            heading.innerHTML = `${escapeHtml(category.name)}<span class="category-count">${category.links.length}</span>`;
            section.appendChild(heading);

            const grid = document.createElement('div');
            grid.className = 'bookmark-grid';

            category.links.forEach((link, linkIndex) => {
                grid.appendChild(createBookmarkNode(link, index, linkIndex, category.name));
            });

            section.appendChild(grid);
            listRoot.appendChild(section);
        });

        updateFilters();
    }

    function renderCategories(baseData) {
        baseCategories = cloneCategories(baseData);
        refreshView();
    }

    function updateFilters() {
        const query = normalize(searchInput.value);
        const selectedCategory = categoryFilter.value;
        let visibleCount = 0;

        listRoot.querySelectorAll('.website-category').forEach((section) => {
            const categoryIndex = section.dataset.categoryIndex;
            const categoryMatches = !selectedCategory || selectedCategory === categoryIndex;
            let sectionVisible = 0;

            section.querySelectorAll('.bookmark-item').forEach((item) => {
                const haystack = normalize([
                    item.dataset.name,
                    item.dataset.url,
                    item.dataset.categoryName,
                ].join(' '));

                const visible = (!query || haystack.includes(query)) && categoryMatches;
                item.hidden = !visible;
                item.closest('.bookmark-item-wrap').hidden = !visible;

                if (visible) {
                    sectionVisible += 1;
                    visibleCount += 1;
                    item.querySelector('.bookmark-name').innerHTML = highlight(item.dataset.name, query);
                    item.querySelector('.bookmark-url').innerHTML = highlight(displayUrl(item.dataset.url), query);
                }
            });

            section.hidden = sectionVisible === 0;
            const countBadge = section.querySelector('.category-count');
            if (countBadge) {
                countBadge.textContent = sectionVisible === 0
                    ? '0'
                    : (query || selectedCategory ? `${sectionVisible} shown` : String(section.querySelectorAll('.bookmark-item').length));
            }
        });

        const total = categories.reduce((sum, category) => sum + category.links.length, 0);
        resultsCount.textContent = query || selectedCategory
            ? `${visibleCount} of ${total} bookmarks`
            : `${total} bookmarks in ${categories.length} categories`;

        emptyState.hidden = visibleCount > 0;
    }

    function setAddStatus(message, type) {
        addStatus.textContent = message;
        addStatus.classList.remove('is-success', 'is-error');
        if (type) {
            addStatus.classList.add(type === 'success' ? 'is-success' : 'is-error');
        }
    }

    function linkExists(url) {
        const key = urlKey(url);
        return categories.some((category) => category.links.some((link) => urlKey(link.url) === key));
    }

    function removeCustomLink(customId) {
        customLinks = customLinks.filter((entry) => entry.id !== customId);
        saveCustomLinks();
        refreshView();
        setAddStatus('Bookmark removed from this device.', 'success');
    }

    function handleAddSubmit(event) {
        event.preventDefault();

        const normalizedUrl = normalizeUrl(addUrlInput.value);
        const categoryName = addCategoryInput.value.trim();
        const name = addNameInput.value.trim() || displayName(normalizedUrl);

        if (!normalizedUrl) {
            setAddStatus('Enter a valid URL.', 'error');
            addUrlInput.focus();
            return;
        }

        if (!categoryName) {
            setAddStatus('Choose or type a category.', 'error');
            addCategoryInput.focus();
            return;
        }

        if (linkExists(normalizedUrl)) {
            setAddStatus('That URL is already saved.', 'error');
            return;
        }

        const entry = {
            id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
            url: normalizedUrl,
            name,
            category: categoryName,
        };

        customLinks.push(entry);
        saveCustomLinks();
        refreshView();
        addForm.reset();
        nameManuallyEdited = false;
        setAddStatus(`Saved “${name}” under ${categoryName}. Stored on this device.`, 'success');
    }

    function syncAutoName() {
        if (nameManuallyEdited) {
            return;
        }

        const normalizedUrl = normalizeUrl(addUrlInput.value);
        addNameInput.value = normalizedUrl ? displayName(normalizedUrl) : '';
        addNameInput.placeholder = normalizedUrl ? '' : 'Auto-generated from URL';
    }

    searchInput.addEventListener('input', updateFilters);
    categoryFilter.addEventListener('change', updateFilters);
    addForm.addEventListener('submit', handleAddSubmit);
    addUrlInput.addEventListener('input', syncAutoName);
    addNameInput.addEventListener('input', () => {
        nameManuallyEdited = addNameInput.value.trim().length > 0;
    });

    fetch(DATA_URL)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Failed to load bookmarks (${response.status})`);
            }
            return response.json();
        })
        .then(renderCategories)
        .catch((error) => {
            if (baseCategories.length) {
                refreshView();
                return;
            }

            listRoot.innerHTML = `<p class="websites-empty">Could not load bookmarks: ${escapeHtml(error.message)}</p>`;
            resultsCount.textContent = '';
        });
})();
