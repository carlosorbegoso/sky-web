

document.addEventListener('DOMContentLoaded', function() {


    // --- Mobile Navigation Menu ---
    setupMobileMenu();

    // --- Navigation Active Class ---
    highlightCurrentNavItem();

    // --- Hero Slider ---
    initHeroSlider();

    // --- Share functionality ---
    setupShareButtons();

    // --- Newsletter form ---
    setupNewsletterForm();

    // --- Handle window resize ---
    handleWindowResize();

});


function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}
/**
 * Sets up the mobile menu toggle functionality
 */
function setupMobileMenu() {
    const header = document.querySelector('.header-container');
    const nav = document.querySelector('nav');
    const navList = document.querySelector('nav ul');

    // Create mobile menu toggle button if it doesn't exist
    if (!document.querySelector('.menu-toggle')) {
        const menuToggle = document.createElement('button');
        menuToggle.className = 'menu-toggle';
        menuToggle.innerHTML = '&#9776;'; // Hamburger menu icon
        menuToggle.setAttribute('aria-label', 'Toggle navigation menu');

        // Initially hide the nav
        if (window.innerWidth <= 768) {
            navList.classList.add('mobile-hidden');
        }

        // Add the toggle button to the header
        header.appendChild(menuToggle);

        // Toggle menu on click
        menuToggle.addEventListener('click', function() {
            if (navList.classList.contains('mobile-hidden')) {
                navList.classList.remove('mobile-hidden');
                navList.classList.add('mobile-visible');
                menuToggle.innerHTML = '&times;'; // Close (X) icon
            } else {
                navList.classList.remove('mobile-visible');
                navList.classList.add('mobile-hidden');
                menuToggle.innerHTML = '&#9776;'; // Hamburger menu icon
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            const isClickInside = nav.contains(event.target) || menuToggle.contains(event.target);

            if (!isClickInside && navList.classList.contains('mobile-visible')) {
                navList.classList.remove('mobile-visible');
                navList.classList.add('mobile-hidden');
                menuToggle.innerHTML = '&#9776;'; // Hamburger menu icon
            }
        });
    }
}

/**
 * Adds active class to current navigation item
 */
function highlightCurrentNavItem() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('nav ul li a');

    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.parentElement.classList.add('active');
        }
    });
}

/**
 * Initializes the hero slider
 */
function initHeroSlider() {
    const heroSlides = document.querySelectorAll('.hero-slide');
    if (heroSlides.length > 1) {
        let currentSlide = 0;
        let slideInterval;

        // Hide all slides except the first one
        for (let i = 1; i < heroSlides.length; i++) {
            heroSlides[i].style.display = 'none';
        }

        // Function to show the next slide
        function showNextSlide() {
            heroSlides[currentSlide].style.display = 'none';
            currentSlide = (currentSlide + 1) % heroSlides.length;
            heroSlides[currentSlide].style.display = 'flex';
        }

        // Function to show the previous slide
        function showPrevSlide() {
            heroSlides[currentSlide].style.display = 'none';
            currentSlide = (currentSlide - 1 + heroSlides.length) % heroSlides.length;
            heroSlides[currentSlide].style.display = 'flex';
        }

        // Start automatic slideshow
        function startSlideshow() {
            slideInterval = setInterval(showNextSlide, 5000);
        }

        // Add navigation arrows to the hero
        const heroContainer = document.querySelector('.hero');
        if (heroContainer) {
            // Create previous and next buttons
            const prevButton = document.createElement('button');
            prevButton.className = 'slide-nav prev';
            prevButton.innerHTML = '&#10094;';
            prevButton.setAttribute('aria-label', 'Previous slide');

            const nextButton = document.createElement('button');
            nextButton.className = 'slide-nav next';
            nextButton.innerHTML = '&#10095;';
            nextButton.setAttribute('aria-label', 'Next slide');

            // Add buttons to hero container
            heroContainer.appendChild(prevButton);
            heroContainer.appendChild(nextButton);

            // Add event listeners for buttons
            prevButton.addEventListener('click', function() {
                clearInterval(slideInterval);
                showPrevSlide();
                startSlideshow();
            });

            nextButton.addEventListener('click', function() {
                clearInterval(slideInterval);
                showNextSlide();
                startSlideshow();
            });
        }

        // Touch events for mobile swipe
        let touchStartX = 0;
        let touchEndX = 0;

        if (heroContainer) {
            heroContainer.addEventListener('touchstart', function(event) {
                touchStartX = event.changedTouches[0].screenX;
            }, false);

            heroContainer.addEventListener('touchend', function(event) {
                touchEndX = event.changedTouches[0].screenX;
                handleSwipe();
            }, false);
        }

        function handleSwipe() {
            const threshold = 50; // Minimum distance for swipe

            if (touchEndX - touchStartX > threshold) {
                // Swipe right - show previous slide
                clearInterval(slideInterval);
                showPrevSlide();
                startSlideshow();
            } else if (touchStartX - touchEndX > threshold) {
                // Swipe left - show next slide
                clearInterval(slideInterval);
                showNextSlide();
                startSlideshow();
            }
        }

        // Start the slideshow
        startSlideshow();
    }
}

/**
 * Sets up share button functionality
 */
function setupShareButtons() {
    const shareButtons = document.querySelectorAll('.share-button');

    shareButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();

            const platform = this.textContent.toLowerCase();
            const articleUrl = window.location.href;
            const articleTitle = document.querySelector('.article-title')?.textContent || document.title;

            let shareUrl = '';

            switch(platform) {
                case 'facebook':
                    shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`;
                    break;
                case 'twitter':
                    shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(articleUrl)}&text=${encodeURIComponent(articleTitle)}`;
                    break;
                case 'linkedin':
                    shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(articleUrl)}&title=${encodeURIComponent(articleTitle)}`;
                    break;
            }

            if (shareUrl) {
                window.open(shareUrl, '_blank', 'width=600,height=400');
            }
        });
    });
}

/**
 * Sets up newsletter form submission
 */
function setupNewsletterForm() {
    const newsletterForm = document.querySelector('.newsletter-form');

    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value.trim();

            if (email) {
                // Here you would normally send the email to a backend service
                // For now we'll just show a success message
                newsletterForm.innerHTML = '<p class="success-message">Thank you for subscribing to our newsletter!</p>';
            }
        });
    }
}

/**
 * Handles window resize events
 */
function handleWindowResize() {
    window.addEventListener('resize', function() {
        const navList = document.querySelector('nav ul');
        const menuToggle = document.querySelector('.menu-toggle');

        // Update navigation menu state based on screen width
        if (window.innerWidth > 768) {
            navList.classList.remove('mobile-hidden');
            navList.classList.remove('mobile-visible');
        } else {
            if (!navList.classList.contains('mobile-visible')) {
                navList.classList.add('mobile-hidden');
            }
        }
    });
}

/**
 * Creates responsive image lazy loading
 */
function setupLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imgOptions = {
            threshold: 0,
            rootMargin: '0px 0px 200px 0px'
        };

        const images = document.querySelectorAll('img[data-src]');
        const imgObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.getAttribute('data-src');
                    img.removeAttribute('data-src');
                    imgObserver.unobserve(img);
                }
            });
        }, imgOptions);

        images.forEach(image => {
            imgObserver.observe(image);
        });
    } else {
        // Fallback for browsers that don't support Intersection Observer
        const images = document.querySelectorAll('img[data-src]');
        images.forEach(img => {
            img.src = img.getAttribute('data-src');
            img.removeAttribute('data-src');
        });
    }
}