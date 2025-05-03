document.addEventListener('DOMContentLoaded', function() {
    initScrollAnimations();
    initHoverEffects();
    initFadeEffects();
    initParallaxEffects();
});

function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    if ('IntersectionObserver' in window) {
        const scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                } else {
                    entry.target.classList.remove('animated');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        animatedElements.forEach(element => {
            scrollObserver.observe(element);
        });
    } else {
        animatedElements.forEach(element => {
            element.classList.add('animated');
        });
    }
}

function initHoverEffects() {
    const articles = document.querySelectorAll('.article');

    articles.forEach(article => {
        article.addEventListener('mouseenter', function() {
            this.classList.add('article-hover');
        });

        article.addEventListener('mouseleave', function() {
            this.classList.remove('article-hover');
        });
    });

    const articleImages = document.querySelectorAll('.article-image img, .popular-post-thumb img');

    articleImages.forEach(img => {
        img.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
            this.style.transition = 'transform 0.3s ease';
        });

        img.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
}

function initFadeEffects() {
    const fadeElements = document.querySelectorAll('.hero-content, .section-title, .article');

    fadeElements.forEach((element, index) => {
        const delay = 100 + (index * 100);

        setTimeout(() => {
            element.classList.add('fade-in');
        }, delay);
    });
}

function initParallaxEffects() {
    const parallaxElements = document.querySelectorAll('.parallax-bg');

    if (parallaxElements.length > 0) {
        window.addEventListener('scroll', function() {
            const scrollTop = window.pageYOffset;

            parallaxElements.forEach(element => {
                const speed = element.getAttribute('data-speed') || 0.5;
                element.style.backgroundPositionY = `${scrollTop * speed}px`;
            });
        });
    }

    const heroElement = document.querySelector('.hero');
    if (heroElement) {
        window.addEventListener('scroll', function() {
            const scrollTop = window.pageYOffset;
            const heroHeight = heroElement.offsetHeight;

            if (scrollTop < heroHeight) {
                const opacity = 1 - (scrollTop / heroHeight);
                heroElement.style.opacity = Math.max(opacity, 0.5);
                heroElement.style.transform = `translateY(${scrollTop * 0.4}px)`;
            }
        });
    }
}