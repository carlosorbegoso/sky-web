/**
 * visual-effects.js - Efectos visuales avanzados
 */

document.addEventListener('DOMContentLoaded', function() {
    initParallaxHeader();
    initImageZoom();
    initSmoothReveal();
    initTypewriterEffect();
});

/**
 * Efecto parallax para cabeceras
 */
function initParallaxHeader() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    // Añadir clase para efectos
    hero.classList.add('parallax-header');

    // Manejar efecto en scroll
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset;
        const parallaxSpeed = 0.5;

        // Mover fondo más lento que el scroll
        hero.style.backgroundPositionY = `${scrollTop * parallaxSpeed}px`;

        // Efecto de opacidad en contenido
        const heroContent = hero.querySelector('.hero-content');
        if (heroContent) {
            // Calcular opacidad basada en posición de scroll
            const opacity = 1 - (scrollTop / hero.offsetHeight);
            heroContent.style.opacity = Math.max(0.2, opacity);

            // Efecto de movimiento en texto
            heroContent.style.transform = `translateY(${scrollTop * 0.2}px)`;
        }
    });
}

/**
 * Zoom en imágenes al hacer hover o clic
 */
function initImageZoom() {
    // Aplicar a todas las imágenes de artículos
    const articleImages = document.querySelectorAll('.article-image img, .featured-image img');

    articleImages.forEach(img => {
        // Crear contenedor para zoom
        const imgContainer = document.createElement('div');
        imgContainer.className = 'zoomable-image';

        // Reemplazar imagen con contenedor
        img.parentNode.insertBefore(imgContainer, img);
        imgContainer.appendChild(img);

        // Añadir icono de zoom
        const zoomIcon = document.createElement('div');
        zoomIcon.className = 'zoom-icon';
        zoomIcon.innerHTML = '🔍';
        imgContainer.appendChild(zoomIcon);

        // Manejar clic para zoom
        imgContainer.addEventListener('click', function() {
            // Crear overlay de zoom
            const overlay = document.createElement('div');
            overlay.className = 'zoom-overlay';
            overlay.innerHTML = `
                <div class="zoom-container">
                    <img src="${img.src}" alt="${img.alt}">
                    <button class="close-zoom">×</button>
                </div>
            `;

            document.body.appendChild(overlay);
            document.body.style.overflow = 'hidden';

            // Cerrar zoom
            overlay.addEventListener('click', function(e) {
                if (e.target === overlay || e.target.className === 'close-zoom') {
                    overlay.remove();
                    document.body.style.overflow = '';
                }
            });
        });
    });
}

/**
 * Revelar elementos suavemente al hacer scroll
 */
function initSmoothReveal() {
    // Marcar elementos para revelar
    const elementsToReveal = document.querySelectorAll('.article, .popular-post, .section-title, .featured-image');

    elementsToReveal.forEach(element => {
        element.classList.add('reveal-element');
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
    });

    // Función para revelar elementos en viewport
    function revealElements() {
        elementsToReveal.forEach(element => {
            // Comprobar si el elemento está en viewport
            const rect = element.getBoundingClientRect();
            const isInViewport = (
                rect.top <= window.innerHeight - 50 &&
                rect.bottom >= 0
            );

            if (isInViewport) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    }

    // Revelar elementos iniciales
    revealElements();

    // Revelar al hacer scroll
    window.addEventListener('scroll', revealElements);
}

/**
 * Efecto de escritura para títulos de hero
 */
function initTypewriterEffect() {
    const heroTitle = document.querySelector('.hero-content h1');
    if (!heroTitle) return;

    // Guardar texto original
    const originalText = heroTitle.textContent;
    heroTitle.textContent = '';

    // Añadir cursor
    const cursor = document.createElement('span');
    cursor.className = 'typewriter-cursor';
    cursor.textContent = '|';
    heroTitle.appendChild(cursor);

    // Animar texto
    let charIndex = 0;
    const typeInterval = setInterval(() => {
        if (charIndex < originalText.length) {
            const charSpan = document.createElement('span');
            charSpan.textContent = originalText.charAt(charIndex);
            heroTitle.insertBefore(charSpan, cursor);
            charIndex++;
        } else {
            clearInterval(typeInterval);


            // Parpadeo del cursor
            setInterval(() => {
                cursor.style.opacity = cursor.style.opacity === '0' ? '1' : '0';
            }, 500);
        }
    }, 100);
}