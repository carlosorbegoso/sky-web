/**
 * performance.js - Optimización de rendimiento (continuación)
 */

function initImagePlaceholders() {
    // Reemplazar imágenes con placeholders coloridos
    document.querySelectorAll('img.lazy-image').forEach(img => {
        // Crear un color de placeholder basado en la URL de imagen
        const hash = hashString(img.getAttribute('data-src'));
        const hue = hash % 360;
        const color = `hsl(${hue}, 70%, 80%)`;

        // Aplicar background mientras carga
        img.style.backgroundColor = color;
    });
}

/**
 * Función simple de hash para URL
 */
function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0; // Convertir a entero de 32 bits
    }
    return Math.abs(hash);
}

/**
 * Precarga de enlaces al hacer hover
 */
function initPreloadLinks() {
    // Precarga al hacer hover sobre enlaces de artículos
    document.querySelectorAll('.article-title, .read-more').forEach(link => {
        link.addEventListener('mouseenter', function() {
            const url = this.getAttribute('href');

            // Solo precargar si no se ha hecho ya
            if (url && !document.querySelector(`link[rel="prefetch"][href="${url}"]`)) {
                const prefetch = document.createElement('link');
                prefetch.rel = 'prefetch';
                prefetch.href = url;
                document.head.appendChild(prefetch);
            }
        });
    });
}

/**
 * Paginación infinita
 */
function initPagination() {
    // Solo en páginas con paginación
    const pagination = document.querySelector('.pagination');
    if (!pagination) return;

    // Reemplazar paginación estándar con carga infinita
    const nextPageLink = pagination.querySelector('.pagination-next');
    if (nextPageLink && !nextPageLink.classList.contains('disabled')) {
        // Reemplazar botones con carga automática
        pagination.innerHTML = '<div class="infinite-scroll-loader">Loading more articles...</div>';
        const loader = pagination.querySelector('.infinite-scroll-loader');
        loader.style.display = 'none';

        // Función para cargar más contenido
        function loadMoreContent() {
            // Mostrar loader
            loader.style.display = 'block';

            // Obtener siguiente página (simulación)
            setTimeout(() => {
                // Aquí conectarías con backend para cargar más artículos
                // Por ahora, clonar artículos existentes como ejemplo
                const articles = document.querySelectorAll('.article');
                const articlesContainer = articles[0].parentNode;

                articles.forEach(article => {
                    const clone = article.cloneNode(true);
                    // Modificar para que sea visiblemente diferente
                    const title = clone.querySelector('.article-title');
                    if (title) {
                        title.textContent = 'More: ' + title.textContent;
                    }
                    articlesContainer.appendChild(clone);
                });

                // Ocultar loader cuando termina
                loader.style.display = 'none';

                // Reinicializar funciones en nuevo contenido
                initLazyLoading();
            }, 1000);
        }

        // Detectar cuando el usuario llega cerca del final de la página
        window.addEventListener('scroll', function() {
            if (loader.style.display === 'block') return; // Evitar cargas múltiples

            const scrollY = window.scrollY || window.pageYOffset;
            const windowHeight = window.innerHeight;
            const documentHeight = document.body.scrollHeight;

            // Cargar más cuando está a 300px del final
            if (scrollY + windowHeight > documentHeight - 300) {
                loadMoreContent();
            }
        });
    }
}