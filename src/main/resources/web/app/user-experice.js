document.addEventListener('DOMContentLoaded', function() {
    initDarkModeToggle();
    initReadingProgress();
    initBackToTop();
    initSmoothScroll();
    calculateReadingTime();
});

function initDarkModeToggle() {
    const darkModePreferred = localStorage.getItem('darkMode') === 'true';

    if (!document.querySelector('.dark-mode-toggle')) {
        const toggleButton = document.createElement('button');
        toggleButton.className = 'dark-mode-toggle';
        toggleButton.innerHTML = darkModePreferred ? '☀️' : '🌙';
        toggleButton.setAttribute('aria-label', 'Toggle dark mode');
        toggleButton.setAttribute('title', darkModePreferred ? 'Switch to light mode' : 'Switch to dark mode');

        const header = document.querySelector('.header-container');
        if (header) {
            header.appendChild(toggleButton);
        }

        if (darkModePreferred) {
            document.body.classList.add('dark-mode');
        }

        toggleButton.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            const isDarkMode = document.body.classList.contains('dark-mode');
            toggleButton.innerHTML = isDarkMode ? '☀️' : '🌙';
            toggleButton.setAttribute('title', isDarkMode ? 'Switch to light mode' : 'Switch to dark mode');
            localStorage.setItem('darkMode', isDarkMode);
        });
    }
}

function initReadingProgress() {
    const articleBody = document.querySelector('.article-body');
    if (!articleBody) return;

    const progressBar = document.createElement('div');
    progressBar.className = 'reading-progress-bar';
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', function() {
        const totalHeight = articleBody.offsetHeight;
        const windowHeight = window.innerHeight;
        const scrollTop = window.scrollY || window.pageYOffset;
        const articleStart = articleBody.offsetTop;
        let scrollPercentage = 0;

        if (scrollTop > articleStart) {
            const scrollPosition = scrollTop + windowHeight;
            scrollPercentage = ((scrollPosition - articleStart) / totalHeight) * 100;
        }

        scrollPercentage = Math.min(100, Math.max(0, scrollPercentage));
        progressBar.style.width = scrollPercentage + '%';
    });
}

function initBackToTop() {
    if (!document.querySelector('.back-to-top')) {
        const backButton = document.createElement('button');
        backButton.className = 'back-to-top';
        backButton.innerHTML = '↑';
        backButton.setAttribute('aria-label', 'Back to top');
        backButton.setAttribute('title', 'Back to top');
        backButton.style.opacity = '0';
        backButton.style.visibility = 'hidden';
        document.body.appendChild(backButton);

        window.addEventListener('scroll', function() {
            if (window.scrollY > 300) {
                backButton.style.opacity = '1';
                backButton.style.visibility = 'visible';
            } else {
                backButton.style.opacity = '0';
                backButton.style.visibility = 'hidden';
            }
        });

        backButton.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

function calculateReadingTime() {
    const articleBody = document.querySelector('.article-body');
    const readingTimeElement = document.querySelector('.reading-time');

    if (articleBody && readingTimeElement) {
        const text = articleBody.textContent || articleBody.innerText;
        const wordCount = text.split(/\s+/).length;
        const readingTime = Math.ceil(wordCount / 200);
        readingTimeElement.textContent = `${readingTime} min read`;
    }
}