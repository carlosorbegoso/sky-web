/**
 * accessibility.js - Mejoras de accesibilidad
 */

document.addEventListener('DOMContentLoaded', function() {
    improveAccessibility();
    initKeyboardNavigation();
    initHighContrastMode();
    addScreenReaderInfo();
});

/**
 * Mejorar accesibilidad general
 */
function improveAccessibility() {
    // Asegurar que todos los enlaces tienen texto descriptivo
    document.querySelectorAll('a').forEach(link => {
        // Detectar enlaces vacíos o solo con iconos
        if (link.textContent.trim() === '' || link.textContent.length < 2) {
            const ariaLabel = link.getAttribute('aria-label');

            if (!ariaLabel) {
                // Intentar determinar propósito
                if (link.classList.contains('read-more')) {
                    const articleTitle = link.closest('.article')?.querySelector('.article-title')?.textContent;
                    link.setAttribute('aria-label', `Read more about ${articleTitle || 'this article'}`);
                } else {
                    // Usar URL como fallback
                    const url = link.getAttribute('href');
                    if (url && url !== '#') {
                        link.setAttribute('aria-label', `Link to ${url.split('/').pop() || 'page'}`);
                    }
                }
            }
        }
    });

    // Asegurar contraste adecuado en elementos con texto
    document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, a, button, label, input').forEach(element => {
        const style = window.getComputedStyle(element);
        const backgroundColor = style.backgroundColor;
        const color = style.color;

        // Solo añadir clase si el contraste podría ser bajo
        // (determinación completa requeriría cálculos más complejos)
        if (backgroundColor !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'transparent') {
            const bgRGB = backgroundColor.match(/\d+/g);
            const fgRGB = color.match(/\d+/g);

            if (bgRGB && fgRGB) {
                // Cálculo simplificado para detectar posible bajo contraste
                const bgLuminance = (parseInt(bgRGB[0]) + parseInt(bgRGB[1]) + parseInt(bgRGB[2])) / 3;
                const fgLuminance = (parseInt(fgRGB[0]) + parseInt(fgRGB[1]) + parseInt(fgRGB[2])) / 3;

                const ratio = Math.max(bgLuminance, fgLuminance) / Math.min(bgLuminance, fgLuminance);

                if (ratio < 3) {  // Umbral simplificado (WCAG requiere 4.5:1)
                    element.classList.add('improve-contrast');
                }
            }
        }
    });

    // Mejorar accesibilidad de formularios
    document.querySelectorAll('input, textarea, select').forEach(formField => {
        const id = formField.id || `field-${Math.random().toString(36).substring(2, 9)}`;
        formField.id = id;

        // Buscar label existente
        const label = document.querySelector(`label[for="${id}"]`);

        if (!label) {
            // Crear label si no existe
            const placeholder = formField.getAttribute('placeholder');

            if (placeholder) {
                const newLabel = document.createElement('label');
                newLabel.setAttribute('for', id);
                newLabel.className = 'sr-only';  // Solo visible para lectores de pantalla
                newLabel.textContent = placeholder;

                formField.parentNode.insertBefore(newLabel, formField);
            }
        }
    });
}

/**
 * Navegación por teclado mejorada
 */
function initKeyboardNavigation() {
    // Añadir atributos para focus
    document.querySelectorAll('button, a, input, select, textarea, [tabindex]').forEach(element => {
        // Asegurar que elementos interactivos son focusables pero no elementos decorativos
        if (element.disabled || element.classList.contains('no-focus')) {
            element.setAttribute('tabindex', '-1');
        } else if (!element.getAttribute('tabindex')) {
            element.setAttribute('tabindex', '0');
        }
    });

    // Indicador visual de foco mejorado
    const focusStyle = document.createElement('style');
    focusStyle.textContent = `
        *:focus {
            outline: 3px solid var(--primary-color) !important;
            outline-offset: 2px !important;
        }
        
        .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border-width: 0;
        }
    `;
    document.head.appendChild(focusStyle);

    // Atajos de teclado
    document.addEventListener('keydown', function(e) {
        // Alt + números para navegación rápida
        if (e.altKey && !e.ctrlKey && !e.shiftKey) {
            if (e.key === '1') {
                // Alt+1: Ir a inicio
                window.location.href = '/';
                e.preventDefault();
            } else if (e.key === '2') {
                // Alt+2: Ir a categorías
                const categoryLinks = document.querySelectorAll('nav ul li a[href^="/category/"]');
                if (categoryLinks.length > 0) {
                    categoryLinks[0].focus();
                    e.preventDefault();
                }
            } else if (e.key === '3') {
                // Alt+3: Ir a búsqueda
                const searchInput = document.querySelector('.live-search');
                if (searchInput) {
                    searchInput.focus();
                    e.preventDefault();
                }
            } else if (e.key === '0') {
                // Alt+0: Ir a pie de página
                const footer = document.querySelector('footer');
                if (footer) {
                    footer.focus();
                    e.preventDefault();
                }
            }
        }
    });
}

/**
 * Modo de alto contraste
 */
function initHighContrastMode() {
    // Crear botón de toggle
    const contrastToggle = document.createElement('button');
    contrastToggle.className = 'contrast-toggle';
    contrastToggle.innerHTML = 'A';
    contrastToggle.setAttribute('aria-label', 'Toggle high contrast mode');
    contrastToggle.setAttribute('title', 'Toggle high contrast mode');

    // Aplicar estado inicial
    const highContrastEnabled = localStorage.getItem('highContrast') === 'true';
    if (highContrastEnabled) {
        document.body.classList.add('high-contrast');
        contrastToggle.classList.add('active');
    }

    // Añadir a la interfaz
    const header = document.querySelector('.header-container');
    if (header) {
        header.appendChild(contrastToggle);
    }

    // Manejar cambio
    contrastToggle.addEventListener('click', function() {
        document.body.classList.toggle('high-contrast');
        const isEnabled = document.body.classList.contains('high-contrast');

        localStorage.setItem('highContrast', isEnabled);
        this.classList.toggle('active', isEnabled);
    });
}

/**
 * Añadir información para lectores de pantalla
 */
function addScreenReaderInfo() {
    // Añadir información de navegación
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Skip to main content';
    document.body.insertBefore(skipLink, document.body.firstChild);

    // Marcar contenido principal
    const mainContent = document.querySelector('.content-section');
    if (mainContent) {
        mainContent.id = 'main-content';
        mainContent.setAttribute('role', 'main');
        mainContent.setAttribute('aria-label', 'Main content');
    }

    // Añadir roles ARIA
    document.querySelector('header')?.setAttribute('role', 'banner');
    document.querySelector('footer')?.setAttribute('role', 'contentinfo');
    document.querySelector('nav')?.setAttribute('role', 'navigation');
    document.querySelector('.sidebar')?.setAttribute('role', 'complementary');

    // Añadir descripciones para imágenes sin alt
    document.querySelectorAll('img:not([alt])').forEach(img => {
        // Generar descripción basada en contexto
        let altText = '';

        // Si está en un artículo, usar título del artículo
        const article = img.closest('.article');
        if (article) {
            const title = article.querySelector('.article-title')?.textContent;
            if (title) {
                altText = `Image for article: ${title}`;
            }
        }

        // Si es en hero, usar contexto general
        if (img.closest('.hero')) {
            altText = 'Featured article hero image';
        }

        // Si es miniatura en popular posts
        if (img.closest('.popular-post')) {
            const postTitle = img.closest('.popular-post')?.querySelector('h4')?.textContent;
            if (postTitle) {
                altText = `Thumbnail for: ${postTitle}`;
            }
        }

        // Aplicar texto alternativo
        if (altText) {
            img.setAttribute('alt', altText);
        } else {
            img.setAttribute('alt', ''); // Imagen decorativa
        }
    });
}