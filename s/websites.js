(function () {
    const DATA_URL = new URL('websites.json', window.location.href).href;

    const searchInput = document.getElementById('website-search');
    const categoryFilter = document.getElementById('category-filter');
    const listRoot = document.getElementById('websites-list');
    const resultsCount = document.getElementById('results-count');
    const emptyState = document.getElementById('websites-empty');

    let categories = [];

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

    function displayUrl(url) {
        return url.replace(/^https?:\/\//i, '').replace(/\/$/, '');
    }

    function renderCategories(data) {
        categories = data.categories || [];
        listRoot.innerHTML = '';
        categoryFilter.innerHTML = '<option value="">All categories</option>';

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
                const anchor = document.createElement('a');
                anchor.className = 'bookmark-item';
                anchor.href = link.url;
                anchor.target = '_blank';
                anchor.rel = 'noopener noreferrer';
                anchor.dataset.categoryIndex = String(index);
                anchor.dataset.linkIndex = String(linkIndex);
                anchor.dataset.name = link.name;
                anchor.dataset.url = link.url;
                anchor.dataset.categoryName = category.name;

                anchor.innerHTML = `
                    <span class="bookmark-name">${escapeHtml(link.name)}</span>
                    <span class="bookmark-url">${escapeHtml(displayUrl(link.url))}</span>
                `;

                grid.appendChild(anchor);
            });

            section.appendChild(grid);
            listRoot.appendChild(section);
        });

        updateFilters();
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

    searchInput.addEventListener('input', updateFilters);
    categoryFilter.addEventListener('change', updateFilters);

    fetch(DATA_URL)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Failed to load bookmarks (${response.status})`);
            }
            return response.json();
        })
        .then(renderCategories)
        .catch((error) => {
            listRoot.innerHTML = `<p class="websites-empty">Could not load bookmarks: ${escapeHtml(error.message)}</p>`;
            resultsCount.textContent = '';
        });
})();
