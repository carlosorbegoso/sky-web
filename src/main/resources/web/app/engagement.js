document.addEventListener('DOMContentLoaded', function() {
    initReadingGoals();
    initBookmarks();
    initRelatedContentPopup();
    initReadingHistory();
});

function initReadingGoals() {
    if (!document.querySelector('.content-section')) return;

    const goalsPanel = document.createElement('div');
    goalsPanel.className = 'reading-goals-panel';

    const readCount = parseInt(localStorage.getItem('articlesRead') || '0');
    const goalCount = parseInt(localStorage.getItem('readingGoal') || '5');
    const progress = Math.min(100, Math.round((readCount / goalCount) * 100));

    goalsPanel.innerHTML = `
        <h3>Reading Goal</h3>
        <div class="goal-progress">
            <div class="progress-bar" style="width: ${progress}%"></div>
        </div>
        <p>${readCount} of ${goalCount} articles</p>
        <button class="set-goal-btn">Set Goal</button>
    `;

    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.appendChild(goalsPanel);
    }

    document.querySelector('.set-goal-btn').addEventListener('click', function() {
        const newGoal = prompt('Set your reading goal (number of articles):', goalCount);

        if (newGoal && !isNaN(newGoal) && newGoal > 0) {
            localStorage.setItem('readingGoal', newGoal);
            window.location.reload();
        }
    });

    const articleLinks = document.querySelectorAll('.article-title');
    articleLinks.forEach(link => {
        link.addEventListener('click', function() {
            localStorage.setItem('articlesRead', readCount + 1);
        });
    });
}

function initBookmarks() {
    document.querySelectorAll('.article').forEach(article => {
        const articleTitle = article.querySelector('.article-title');
        if (!articleTitle) return;

        const articleUrl = articleTitle.getAttribute('href');
        const articleId = articleUrl.split('/').pop();

        const bookmarkBtn = document.createElement('button');
        bookmarkBtn.className = 'bookmark-btn';
        bookmarkBtn.setAttribute('data-article-id', articleId);

        const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
        const isBookmarked = bookmarks.some(bookmark => bookmark.id === articleId);

        bookmarkBtn.innerHTML = isBookmarked ? '🔖' : '🔖';
        bookmarkBtn.classList.toggle('active', isBookmarked);

        article.querySelector('.article-header').appendChild(bookmarkBtn);

        bookmarkBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            const articleId = this.getAttribute('data-article-id');
            let bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');

            if (this.classList.contains('active')) {
                bookmarks = bookmarks.filter(bookmark => bookmark.id !== articleId);
                this.classList.remove('active');
            } else {
                bookmarks.push({
                    id: articleId,
                    title: articleTitle.textContent,
                    url: articleUrl,
                    date: new Date().toISOString()
                });
                this.classList.add('active');
            }

            localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
        });
    });

    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');

        if (bookmarks.length > 0) {
            const bookmarkPanel = document.createElement('div');
            bookmarkPanel.className = 'bookmarks-panel';

            let html = `<h3>Your Bookmarks</h3><ul class="bookmark-list">`;

            bookmarks.forEach(bookmark => {
                html += `
                    <li>
                        <a href="${bookmark.url}">${bookmark.title}</a>
                        <button class="remove-bookmark" data-id="${bookmark.id}">×</button>
                    </li>
                `;
            });

            html += `</ul>`;
            bookmarkPanel.innerHTML = html;

            sidebar.appendChild(bookmarkPanel);

            document.querySelectorAll('.remove-bookmark').forEach(button => {
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();

                    const articleId = this.getAttribute('data-id');
                    let bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');

                    bookmarks = bookmarks.filter(bookmark => bookmark.id !== articleId);
                    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));

                    this.parentNode.remove();

                    const relatedBtn = document.querySelector(`.bookmark-btn[data-article-id="${articleId}"]`);
                    if (relatedBtn) {
                        relatedBtn.classList.remove('active');
                    }
                });
            });
        }
    }
}

function initRelatedContentPopup() {
    const articles = document.querySelectorAll('.article');
    if (articles.length === 0) return;

    articles.forEach(article => {
        const articleId = article.getAttribute('data-id') ||
            article.querySelector('.article-title')?.getAttribute('href')?.split('/').pop();

        if (!articleId) return;

        article.addEventListener('mouseover', function() {
            const relatedContent = document.querySelector('.related-popup');
            if (relatedContent) relatedContent.remove();

            const popup = document.createElement('div');
            popup.className = 'related-popup';
            popup.innerHTML = `<h4>Related Articles</h4><div class="related-loading">Loading...</div>`;

            document.body.appendChild(popup);

            // Position the popup near the article
            const rect = article.getBoundingClientRect();
            popup.style.left = `${rect.right + 10}px`;
            popup.style.top = `${rect.top}px`;

            // Simulate fetching related content
            setTimeout(() => {
                popup.querySelector('.related-loading').remove();
                popup.innerHTML += `
                    <ul>
                        <li><a href="#">Similar article 1</a></li>
                        <li><a href="#">Similar article 2</a></li>
                        <li><a href="#">Similar article 3</a></li>
                    </ul>
                `;
            }, 500);
        });

        article.addEventListener('mouseout', function(e) {
            if (!e.relatedTarget || !e.relatedTarget.closest('.related-popup')) {
                const popup = document.querySelector('.related-popup');
                if (popup) popup.remove();
            }
        });
    });
}

function initReadingHistory() {
    const historySection = document.createElement('div');
    historySection.className = 'reading-history';

    // Get reading history from localStorage
    const history = JSON.parse(localStorage.getItem('readingHistory') || '[]');

    if (history.length > 0) {
        historySection.innerHTML = `<h3>Recently Read</h3><ul class="history-list"></ul>`;
        const historyList = historySection.querySelector('.history-list');

        // Display the 5 most recent items
        history.slice(0, 5).forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `
                <a href="${item.url}">${item.title}</a>
                <span class="history-date">${new Date(item.date).toLocaleDateString()}</span>
            `;
            historyList.appendChild(li);
        });

        // Add to sidebar if it exists
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.appendChild(historySection);
        }
    }

    // Track article views
    const articleLinks = document.querySelectorAll('.article-title');
    articleLinks.forEach(link => {
        link.addEventListener('click', function() {
            const articleUrl = this.getAttribute('href');
            const articleTitle = this.textContent;

            let history = JSON.parse(localStorage.getItem('readingHistory') || '[]');

            // Add to beginning of array
            history.unshift({
                url: articleUrl,
                title: articleTitle,
                date: new Date().toISOString()
            });

            // Keep only the 20 most recent items
            history = history.slice(0, 20);

            localStorage.setItem('readingHistory', JSON.stringify(history));
        });
    });
}