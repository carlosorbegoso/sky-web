document.addEventListener('DOMContentLoaded', function() {
    initLiveSearch();
    initAdvancedFilters();
    initTagCloud();
});

function initLiveSearch() {
    if (!document.querySelector('.live-search')) {
        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-container';
        searchContainer.innerHTML = `
            <input type="text" class="live-search" placeholder="Search articles...">
            <button class="search-btn">🔍</button>
            <div class="search-results"></div>
        `;

        const header = document.querySelector('.header-container');
        if (header) {
            header.appendChild(searchContainer);
        }

        const searchInput = document.querySelector('.live-search');
        const searchResults = document.querySelector('.search-results');

        searchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase().trim();

            if (query.length < 2) {
                searchResults.innerHTML = '';
                searchResults.style.display = 'none';
                return;
            }

            const articles = document.querySelectorAll('.article');
            const results = [];

            articles.forEach(article => {
                const title = article.querySelector('.article-title').textContent.toLowerCase();
                const excerpt = article.querySelector('.article-excerpt')?.textContent.toLowerCase() || '';

                if (title.includes(query) || excerpt.includes(query)) {
                    results.push({
                        title: article.querySelector('.article-title').textContent,
                        url: article.querySelector('.article-title').getAttribute('href'),
                        excerpt: excerpt.substring(0, 100) + '...'
                    });
                }
            });

            if (results.length > 0) {
                let html = '<ul>';
                results.forEach(result => {
                    html += `
                        <li>
                            <a href="${result.url}">
                                <h4>${highlightText(result.title, query)}</h4>
                                <p>${highlightText(result.excerpt, query)}</p>
                            </a>
                        </li>
                    `;
                });
                html += '</ul>';

                searchResults.innerHTML = html;
                searchResults.style.display = 'block';
            } else {
                searchResults.innerHTML = '<p>No results found</p>';
                searchResults.style.display = 'block';
            }
        });

        document.addEventListener('click', function(e) {
            if (!searchContainer.contains(e.target)) {
                searchResults.style.display = 'none';
            }
        });
    }
}

function highlightText(text, query) {
    return text.replace(new RegExp(query, 'gi'), match => `<mark>${match}</mark>`);
}

function initAdvancedFilters() {
    const articleList = document.querySelector('.content-section');
    if (!articleList || document.querySelectorAll('.article').length === 0) return;

    const filterPanel = document.createElement('div');
    filterPanel.className = 'filter-panel';
    filterPanel.innerHTML = `
        <button class="filter-toggle">Filters ▼</button>
        <div class="filter-options">
            <div class="filter-group">
                <label>Sort by:</label>
                <select class="sort-select">
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="popular">Most Popular</option>
                </select>
            </div>
            
            <div class="filter-group">
                <label>Category:</label>
                <div class="category-filters">
                </div>
            </div>
            
            <div class="filter-group">
                <label>Reading time:</label>
                <select class="time-select">
                    <option value="all">All</option>
                    <option value="short">Short (< 5 min)</option>
                    <option value="medium">Medium (5-10 min)</option>
                    <option value="long">Long (> 10 min)</option>
                </select>
            </div>
            
            <button class="apply-filters">Apply Filters</button>
            <button class="reset-filters">Reset</button>
        </div>
    `;

    articleList.insertBefore(filterPanel, articleList.firstChild);

    const categoryFilters = document.querySelector('.category-filters');
    const categories = new Set();

    document.querySelectorAll('.article').forEach(article => {
        const categoryElement = article.querySelector('.category-badge') ||
            article.querySelector('[data-category]');

        if (categoryElement) {
            const category = categoryElement.textContent.trim();
            categories.add(category);
        }
    });

    categories.forEach(category => {
        const checkbox = document.createElement('div');
        checkbox.className = 'category-checkbox';
        checkbox.innerHTML = `
            <input type="checkbox" id="cat-${category.toLowerCase().replace(/\s+/g, '-')}" 
                  data-category="${category}">
            <label for="cat-${category.toLowerCase().replace(/\s+/g, '-')}">${category}</label>
        `;
        categoryFilters.appendChild(checkbox);
    });

    document.querySelector('.filter-toggle').addEventListener('click', function() {
        const options = document.querySelector('.filter-options');
        options.classList.toggle('visible');
        this.textContent = options.classList.contains('visible') ? 'Filters ▲' : 'Filters ▼';
    });

    document.querySelector('.apply-filters').addEventListener('click', function() {
        applyFilters();
    });

    document.querySelector('.reset-filters').addEventListener('click', function() {
        document.querySelector('.sort-select').value = 'newest';
        document.querySelectorAll('.category-checkbox input').forEach(input => {
            input.checked = false;
        });
        document.querySelector('.time-select').value = 'all';

        applyFilters();
    });
}

function applyFilters() {
    const articles = document.querySelectorAll('.article');
    const sortMethod = document.querySelector('.sort-select').value;
    const selectedCategories = Array.from(document.querySelectorAll('.category-checkbox input:checked'))
        .map(input => input.getAttribute('data-category'));
    const timeFilter = document.querySelector('.time-select').value;

    articles.forEach(article => {
        article.style.display = 'none';
    });

    let filteredArticles = Array.from(articles).filter(article => {
        if (selectedCategories.length > 0) {
            const categoryElement = article.querySelector('.category-badge') ||
                article.querySelector('[data-category]');

            if (!categoryElement) return false;

            const category = categoryElement.textContent.trim();
            if (!selectedCategories.includes(category)) return false;
        }

        if (timeFilter !== 'all') {
            const readingTime = article.querySelector('.reading-time') ||
                article.querySelector('[data-reading-time]');

            if (readingTime) {
                const minutes = parseInt(readingTime.textContent);

                if (timeFilter === 'short' && minutes >= 5) return false;
                if (timeFilter === 'medium' && (minutes < 5 || minutes > 10)) return false;
                if (timeFilter === 'long' && minutes <= 10) return false;
            }
        }

        return true;
    });

    filteredArticles.sort((a, b) => {
        if (sortMethod === 'newest' || sortMethod === 'oldest') {
            const dateA = a.querySelector('.article-meta')?.textContent || '';
            const dateB = b.querySelector('.article-meta')?.textContent || '';

            return sortMethod === 'newest' ?
                (dateB.localeCompare(dateA)) :
                (dateA.localeCompare(dateB));
        }
        else if (sortMethod === 'popular') {
            const viewsA = parseInt(a.getAttribute('data-views') || '0');
            const viewsB = parseInt(b.getAttribute('data-views') || '0');

            return viewsB - viewsA;
        }

        return 0;
    });

    filteredArticles.forEach(article => {
        article.style.display = 'block';
    });

    if (filteredArticles.length === 0) {
        const noResults = document.createElement('div');
        noResults.className = 'no-filter-results';
        noResults.textContent = 'No articles match your filters. Try different criteria.';

        const existingMessage = document.querySelector('.no-filter-results');
        if (existingMessage) {
            existingMessage.remove();
        }

        document.querySelector('.content-section').appendChild(noResults);
    } else {
        const existingMessage = document.querySelector('.no-filter-results');
        if (existingMessage) {
            existingMessage.remove();
        }
    }
}

function initTagCloud() {
    const tagCloudContainer = document.createElement('div');
    tagCloudContainer.className = 'tag-cloud-container';

    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    sidebar.appendChild(tagCloudContainer);

    // Sample tags with frequency (in a real application, this would come from the server)
    const tags = [
        { name: 'technology', count: 42 },
        { name: 'science', count: 37 },
        { name: 'politics', count: 28 },
        { name: 'health', count: 25 },
        { name: 'environment', count: 23 },
        { name: 'business', count: 21 },
        { name: 'sports', count: 19 },
        { name: 'entertainment', count: 18 },
        { name: 'education', count: 15 },
        { name: 'travel', count: 14 },
        { name: 'food', count: 12 },
        { name: 'art', count: 10 },
        { name: 'fashion', count: 8 },
        { name: 'music', count: 7 },
        { name: 'books', count: 6 }
    ];

    // Find max and min counts for sizing
    const maxCount = Math.max(...tags.map(tag => tag.count));
    const minCount = Math.min(...tags.map(tag => tag.count));

    // Calculate font size based on tag frequency
    const calculateFontSize = (count) => {
        const minSize = 0.8;  // em
        const maxSize = 2;    // em
        return minSize + ((count - minCount) / (maxCount - minCount)) * (maxSize - minSize);
    };

    // Generate cloud HTML
    let cloudHTML = '<h3>Popular Tags</h3><div class="tag-cloud">';

    // Randomize order slightly for visual interest
    tags.sort(() => Math.random() - 0.5);

    tags.forEach(tag => {
        const fontSize = calculateFontSize(tag.count);
        cloudHTML += `
            <a href="/tag/${tag.name}" 
               class="tag-cloud-item" 
               style="font-size: ${fontSize}em;" 
               data-count="${tag.count}">
               ${tag.name}
            </a>
        `;
    });

    cloudHTML += '</div>';
    tagCloudContainer.innerHTML = cloudHTML;

    // Add click tracking for tags
    document.querySelectorAll('.tag-cloud-item').forEach(tagLink => {
        tagLink.addEventListener('click', function(e) {
            // Track tag click in localStorage
            const tagName = this.textContent.trim();
            let clickedTags = JSON.parse(localStorage.getItem('clickedTags') || '[]');

            // Add to clicked tags if not already there
            if (!clickedTags.includes(tagName)) {
                clickedTags.push(tagName);
                localStorage.setItem('clickedTags', JSON.stringify(clickedTags));
            }

            // Add to recent tags
            let recentTags = JSON.parse(localStorage.getItem('recentTags') || '[]');

            // Remove if already exists (to move to front)
            recentTags = recentTags.filter(tag => tag !== tagName);

            // Add to front
            recentTags.unshift(tagName);

            // Keep only most recent 5
            if (recentTags.length > 5) {
                recentTags = recentTags.slice(0, 5);
            }

            localStorage.setItem('recentTags', JSON.stringify(recentTags));
        });
    });

    // Add recent tags section if any exist
    const recentTags = JSON.parse(localStorage.getItem('recentTags') || '[]');
    if (recentTags.length > 0) {
        const recentContainer = document.createElement('div');
        recentContainer.className = 'recent-tags';

        let recentHTML = '<h3>Your Recent Tags</h3><div class="recent-tag-list">';

        recentTags.forEach(tag => {
            recentHTML += `<a href="/tag/${tag}" class="recent-tag">${tag}</a>`;
        });

        recentHTML += '</div>';
        recentContainer.innerHTML = recentHTML;

        sidebar.appendChild(recentContainer);
    }
}