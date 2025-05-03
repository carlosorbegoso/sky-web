document.addEventListener('DOMContentLoaded', function() {
    initFontSizeControls();
    initCategoryPreferences();
    initContentFilter();
    saveUserPreferences();
});

function initFontSizeControls() {
    const fontControls = document.createElement('div');
    fontControls.className = 'font-size-controls';
    fontControls.innerHTML = `
        <button class="font-size-btn" data-size="small">A-</button>
        <button class="font-size-btn" data-size="medium">A</button>
        <button class="font-size-btn" data-size="large">A+</button>
    `;

    const header = document.querySelector('.header-container');
    if (header) {
        header.appendChild(fontControls);
    }

    const savedSize = localStorage.getItem('fontSize');
    if (savedSize) {
        document.body.classList.add(`font-size-${savedSize}`);

        const activeButton = document.querySelector(`.font-size-btn[data-size="${savedSize}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }
    } else {
        document.querySelector('.font-size-btn[data-size="medium"]').classList.add('active');
    }

    document.querySelectorAll('.font-size-btn').forEach(button => {
        button.addEventListener('click', function() {
            const size = this.getAttribute('data-size');

            document.body.classList.remove('font-size-small', 'font-size-medium', 'font-size-large');

            document.body.classList.add(`font-size-${size}`);

            document.querySelectorAll('.font-size-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');

            localStorage.setItem('fontSize', size);
        });
    });
}

function initCategoryPreferences() {
    const categoryLinks = document.querySelectorAll('nav ul li a[href^="/category/"]');
    if (categoryLinks.length === 0) return;

    categoryLinks.forEach(link => {
        const favoriteButton = document.createElement('button');
        favoriteButton.className = 'favorite-category';
        favoriteButton.innerHTML = '☆';
        favoriteButton.setAttribute('title', 'Add to favorites');

        const categorySlug = link.getAttribute('href').split('/').pop();
        const favorites = JSON.parse(localStorage.getItem('favoriteCategories') || '[]');

        if (favorites.includes(categorySlug)) {
            favoriteButton.innerHTML = '★';
            favoriteButton.setAttribute('title', 'Remove from favorites');
        }

        link.parentNode.appendChild(favoriteButton);

        favoriteButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            const categorySlug = link.getAttribute('href').split('/').pop();
            let favorites = JSON.parse(localStorage.getItem('favoriteCategories') || '[]');

            if (favorites.includes(categorySlug)) {
                favorites = favorites.filter(slug => slug !== categorySlug);
                this.innerHTML = '☆';
                this.setAttribute('title', 'Add to favorites');
            } else {
                favorites.push(categorySlug);
                this.innerHTML = '★';
                this.setAttribute('title', 'Remove from favorites');
            }

            localStorage.setItem('favoriteCategories', JSON.stringify(favorites));

            if (document.querySelector('.show-favorites-first')) {
                sortCategoriesByFavorites();
            }
        });
    });

    const navList = document.querySelector('nav ul');
    if (navList) {
        const favToggle = document.createElement('li');
        favToggle.className = 'favorites-toggle';
        favToggle.innerHTML = `<a href="#" class="show-favorites-first">Favorites First</a>`;
        navList.appendChild(favToggle);

        favToggle.querySelector('a').addEventListener('click', function(e) {
            e.preventDefault();
            this.classList.toggle('active');

            if (this.classList.contains('active')) {
                sortCategoriesByFavorites();
            } else {
                resetCategoryOrder();
            }
        });
    }
}

function sortCategoriesByFavorites() {
    const navList = document.querySelector('nav ul');
    const categoryItems = Array.from(document.querySelectorAll('nav ul li:not(.favorites-toggle)'));
    const favorites = JSON.parse(localStorage.getItem('favoriteCategories') || '[]');

    categoryItems.sort((a, b) => {
        const aLink = a.querySelector('a');
        const bLink = b.querySelector('a');

        if (!aLink || !bLink) return 0;

        const aSlug = aLink.getAttribute('href').split('/').pop();
        const bSlug = bLink.getAttribute('href').split('/').pop();

        const aIsFavorite = favorites.includes(aSlug);
        const bIsFavorite = favorites.includes(bSlug);

        if (aIsFavorite && !bIsFavorite) return -1;
        if (!aIsFavorite && bIsFavorite) return 1;
        return 0;
    });

    const favToggle = document.querySelector('.favorites-toggle');
    navList.innerHTML = '';

    categoryItems.forEach(item => {
        navList.appendChild(item);
    });

    navList.appendChild(favToggle);
}

function resetCategoryOrder() {
    window.location.reload();
}

function initContentFilter() {
    const filterContainer = document.createElement('div');
    filterContainer.className = 'content-filter';

    // Create filter UI
    filterContainer.innerHTML = `
        <h3>Filter Content</h3>
        <div class="filter-options">
            <label>
                <input type="checkbox" class="filter-option" data-type="news"> News
            </label>
            <label>
                <input type="checkbox" class="filter-option" data-type="reviews"> Reviews
            </label>
            <label>
                <input type="checkbox" class="filter-option" data-type="features"> Features
            </label>
            <label>
                <input type="checkbox" class="filter-option" data-type="opinion"> Opinion
            </label>
        </div>
        <button class="apply-filters">Apply Filters</button>
    `;

    // Add to sidebar if it exists
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.appendChild(filterContainer);
    }

    // Load and apply saved filters
    const savedFilters = JSON.parse(localStorage.getItem('contentFilters') || '[]');
    savedFilters.forEach(filterType => {
        const checkbox = document.querySelector(`.filter-option[data-type="${filterType}"]`);
        if (checkbox) {
            checkbox.checked = true;
        }
    });

    // Apply filters on page load if any exist
    if (savedFilters.length > 0) {
        applyContentFilters(savedFilters);
    }

    // Handle filter application
    document.querySelector('.apply-filters')?.addEventListener('click', function() {
        const selectedFilters = [];
        document.querySelectorAll('.filter-option:checked').forEach(checkbox => {
            selectedFilters.push(checkbox.getAttribute('data-type'));
        });

        // Save filters
        localStorage.setItem('contentFilters', JSON.stringify(selectedFilters));

        // Apply filters
        applyContentFilters(selectedFilters);
    });
}

function applyContentFilters(filters) {
    // First show all articles
    document.querySelectorAll('.article').forEach(article => {
        article.style.display = 'block';
    });

    // If no filters selected, show everything
    if (filters.length === 0) return;

    // Hide articles that don't match the filter
    document.querySelectorAll('.article').forEach(article => {
        const articleType = article.getAttribute('data-type');

        // If article doesn't have one of the selected types, hide it
        if (!filters.includes(articleType)) {
            article.style.display = 'none';
        }
    });
}

function saveUserPreferences() {
    // Check if we need to save preferences
    const userHasInteracted = localStorage.getItem('hasInteracted');

    if (!userHasInteracted) {
        // Create a save preferences prompt
        const savePrompt = document.createElement('div');
        savePrompt.className = 'save-preferences-prompt';
        savePrompt.innerHTML = `
            <div class="prompt-content">
                <h3>Save Your Preferences?</h3>
                <p>Would you like to save your preferences for future visits?</p>
                <div class="prompt-buttons">
                    <button class="save-prefs-yes">Yes</button>
                    <button class="save-prefs-no">No</button>
                </div>
            </div>
        `;

        document.body.appendChild(savePrompt);

        // Handle user choice
        document.querySelector('.save-prefs-yes').addEventListener('click', function() {
            localStorage.setItem('hasInteracted', 'true');
            localStorage.setItem('savePreferences', 'true');
            savePrompt.remove();
        });

        document.querySelector('.save-prefs-no').addEventListener('click', function() {
            localStorage.setItem('hasInteracted', 'true');
            localStorage.setItem('savePreferences', 'false');
            savePrompt.remove();
        });
    }
}