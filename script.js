// Variables globales
let currentPage = 1;
const itemsPerPage = 30;
let filteredMangas = [];
let allMangas = [];

// Cargar datos cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    fetch('datos.json')
        .then(response => response.json())
        .then(data => {
            allMangas = data;
            filteredMangas = [...allMangas];
            populateFilters();
            displayMangas();
            setupEventListeners();
        })
        .catch(error => console.error('Error al cargar los datos:', error));
});

// Llenar los filtros con opciones únicas
function populateFilters() {
    const demographyFilter = document.getElementById('demographyFilter');
    const editorialFilter = document.getElementById('editorialFilter');
    
    // Obtener valores únicos
    const demografias = [...new Set(allMangas.map(manga => manga.demografia))];
    const editoriales = [...new Set(allMangas.map(manga => manga.editorial))];
    
    // Llenar filtro de demografía
    demografias.forEach(demografia => {
        const option = document.createElement('option');
        option.value = demografia;
        option.textContent = demografia;
        demographyFilter.appendChild(option);
    });
    
    // Llenar filtro de editorial
    editoriales.forEach(editorial => {
        const option = document.createElement('option');
        option.value = editorial;
        option.textContent = editorial;
        editorialFilter.appendChild(option);
    });
}

// Configurar event listeners
function setupEventListeners() {
    // Búsqueda
    document.getElementById('searchButton').addEventListener('click', applyFilters);
    document.getElementById('searchInput').addEventListener('keyup', (e) => {
        if (e.key === 'Enter') applyFilters();
    });
    
    // Filtros
    document.getElementById('demographyFilter').addEventListener('change', applyFilters);
    document.getElementById('statusFilter').addEventListener('change', applyFilters);
    document.getElementById('editorialFilter').addEventListener('change', applyFilters);
    
    // Modales
    document.getElementById('closeCoversModal').addEventListener('click', () => {
        document.getElementById('coversModal').style.display = 'none';
    });
    
    document.getElementById('closeDescriptionModal').addEventListener('click', () => {
        document.getElementById('descriptionModal').style.display = 'none';
    });
    
    // Cerrar modales al hacer clic fuera
    window.addEventListener('click', (e) => {
        if (e.target === document.getElementById('coversModal')) {
            document.getElementById('coversModal').style.display = 'none';
        }
        if (e.target === document.getElementById('descriptionModal')) {
            document.getElementById('descriptionModal').style.display = 'none';
        }
    });
}

// Aplicar filtros y búsqueda
function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const demography = document.getElementById('demographyFilter').value;
    const status = document.getElementById('statusFilter').value;
    const editorial = document.getElementById('editorialFilter').value;
    
    filteredMangas = allMangas.filter(manga => {
        // Búsqueda por título, guionista o dibujante
        const matchesSearch = searchTerm === '' || 
            manga.titulo.toLowerCase().includes(searchTerm) ||
            manga.guionista.toLowerCase().includes(searchTerm) ||
            manga.dibujante.toLowerCase().includes(searchTerm);
        
        // Filtro por demografía
        const matchesDemography = demography === '' || manga.demografia === demography;
        
        // Filtro por estado
        const matchesStatus = status === '' || manga.volumenes.includes(status);
        
        // Filtro por editorial
        const matchesEditorial = editorial === '' || manga.editorial === editorial;
        
        return matchesSearch && matchesDemography && matchesStatus && matchesEditorial;
    });
    
    currentPage = 1;
    displayMangas();
}

// Mostrar mangas con paginación
function displayMangas() {
    const mangaGrid = document.getElementById('mangaGrid');
    const pagination = document.getElementById('pagination');
    
    // Limpiar grid y paginación
    mangaGrid.innerHTML = '';
    pagination.innerHTML = '';
    
    // Calcular total de páginas
    const totalPages = Math.ceil(filteredMangas.length / itemsPerPage);
    
    // Mostrar mensaje si no hay resultados
    if (filteredMangas.length === 0) {
        mangaGrid.innerHTML = '<div class="no-results">No se encontraron mangas que coincidan con los criterios de búsqueda.</div>';
        return;
    }
    
    // Calcular índices para la paginación
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredMangas.length);
    const currentMangas = filteredMangas.slice(startIndex, endIndex);
    
    // Crear elementos para cada manga
    currentMangas.forEach(manga => {
        const mangaCard = document.createElement('div');
        mangaCard.className = 'manga-card';
        
        // Usar la primera imagen de la lista como portada principal
        const mainImage = manga.imagenes && manga.imagenes.length > 0 ? 
            manga.imagenes[0] : 
            (manga.imagen || 'https://via.placeholder.com/280x350/cccccc/666666?text=Sin+imagen');
        
        // Escapar comillas en el título para evitar problemas con JSON
        const escapedTitle = manga.titulo.replace(/'/g, "\\'").replace(/"/g, '\\"');
        
        // En la función displayMangas(), dentro del forEach que crea las tarjetas:
mangaCard.innerHTML = `
    <div class="manga-image-container">
        <img class="manga-image" src="${mainImage}" alt="${manga.titulo}" onerror="handleImageError(this, '${manga.titulo}')">
    </div>
    <div class="manga-info">
        <h3 class="manga-title">${manga.titulo}</h3>
        <div class="manga-details">
            <p><strong>Demografia:</strong> ${manga.demografia}</p>
            <p><strong>Volúmenes:</strong> ${manga.volumenes}</p>
            <p><strong>Guionista:</strong> ${manga.guionista}</p>
            <p><strong>Dibujante:</strong> ${manga.dibujante}</p>
        </div>
        <p class="manga-description">${truncateDescription(manga.descripcion, 150)}</p>
        <div class="manga-actions">
            <button class="manga-button view-covers-btn" data-title="${escapedTitle}" data-images='${JSON.stringify(manga.imagenes)}'>Ver Portadas</button>
            <button class="manga-button view-desc-btn" data-manga='${JSON.stringify(manga).replace(/'/g, "\\'")}'>Ver Descripción</button>
            ${manga.enlace ? `<a class="manga-link" href="${manga.enlace}" target="_blank">Ver Enlace</a>` : ''}
        </div>
    </div>
`;
        
        mangaGrid.appendChild(mangaCard);
    });
    
    // Añadir event listeners a los botones después de crear las tarjetas
    document.querySelectorAll('.view-covers-btn').forEach(button => {
        button.addEventListener('click', function() {
            const title = this.getAttribute('data-title');
            const images = JSON.parse(this.getAttribute('data-images'));
            showCovers(title, images);
        });
    });
    
    document.querySelectorAll('.view-desc-btn').forEach(button => {
        button.addEventListener('click', function() {
            const manga = JSON.parse(this.getAttribute('data-manga'));
            showDescription(manga);
        });
    });
    
    // Crear controles de paginación
    if (totalPages > 1) {
        // Botón anterior
        if (currentPage > 1) {
            const prevButton = document.createElement('button');
            prevButton.className = 'pagination-button';
            prevButton.textContent = '« Anterior';
            prevButton.addEventListener('click', () => {
                currentPage--;
                displayMangas();
            });
            pagination.appendChild(prevButton);
        }
        
        // Números de página
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            const pageButton = document.createElement('button');
            pageButton.className = 'pagination-button';
            if (i === currentPage) pageButton.classList.add('active');
            pageButton.textContent = i;
            pageButton.addEventListener('click', () => {
                currentPage = i;
                displayMangas();
            });
            pagination.appendChild(pageButton);
        }
        
        // Botón siguiente
        if (currentPage < totalPages) {
            const nextButton = document.createElement('button');
            nextButton.className = 'pagination-button';
            nextButton.textContent = 'Siguiente »';
            nextButton.addEventListener('click', () => {
                currentPage++;
                displayMangas();
            });
            pagination.appendChild(nextButton);
        }
    }
}

// Truncar descripción para tarjeta
function truncateDescription(text, maxLength) {
    if (!text || text.length <= maxLength) return text || 'Descripción no disponible';
    return text.substr(0, maxLength) + '...';
}

// Manejar errores de carga de imágenes
function handleImageError(img, title) {
    console.error(`Error cargando imagen para: ${title}`);
    img.src = 'https://via.placeholder.com/280x350/cccccc/666666?text=Imagen+no+disponible';
    img.alt = `Imagen no disponible para ${title}`;
    img.onerror = null; // Prevenir bucles infinitos
}

// Reemplazar la función showCovers con esta versión mejorada
function showCovers(title, images) {
    const modal = document.getElementById('coversModal');
    const titleElement = document.getElementById('coversModalTitle');
    const gallery = document.getElementById('coversGallery');
    
    titleElement.textContent = `Portadas de ${title}`;
    gallery.innerHTML = '';
    
    // Verificar si hay imágenes
    if (!images || images.length === 0) {
        gallery.innerHTML = '<p>No hay portadas disponibles</p>';
        modal.style.display = 'block';
        return;
    }
    
    // Crear contenedor para cada imagen con número
    images.forEach((image, index) => {
        const container = document.createElement('div');
        container.className = 'cover-container';
        
        const img = document.createElement('img');
        img.className = 'cover-image modal-cover';
        img.src = image;
        img.alt = `Portada ${index + 1} de ${title}`;
        img.loading = 'lazy'; // Carga diferida para mejor rendimiento
        img.onerror = function() {
            this.src = 'https://via.placeholder.com/300x400/cccccc/666666?text=Imagen+no+disponible';
        };
        
        const number = document.createElement('p');
        number.className = 'cover-number';
        number.textContent = `Portada ${index + 1} de ${images.length}`;
        number.style.textAlign = 'center';
        number.style.marginTop = '0.5rem';
        number.style.fontSize = '0.9rem';
        number.style.color = '#666';
        
        container.appendChild(img);
        container.appendChild(number);
        gallery.appendChild(container);
    });
    
    modal.style.display = 'block';
    
    // Añadir funcionalidad de swipe para móviles
    setupSwipeGestures(gallery);
}

// Función para configurar gestos de deslizamiento en móviles
function setupSwipeGestures(gallery) {
    let touchStartX = 0;
    let touchEndX = 0;
    let currentImageIndex = 0;
    const images = gallery.querySelectorAll('.cover-container');
    
    // Ocultar todas las imágenes excepto la primera
    images.forEach((img, index) => {
        img.style.display = index === 0 ? 'block' : 'none';
    });
    
    // Solo activar swipe si hay más de una imagen
    if (images.length <= 1) return;
    
    // Añadir indicador de navegación
    const navIndicator = document.createElement('div');
    navIndicator.style.textAlign = 'center';
    navIndicator.style.margin = '1rem 0';
    navIndicator.innerHTML = `
        <button class="nav-button" id="prevCover">◀</button>
        <span id="currentIndicator">1/${images.length}</span>
        <button class="nav-button" id="nextCover">▶</button>
    `;
    gallery.parentNode.insertBefore(navIndicator, gallery.nextSibling);
    
    // Estilos para botones de navegación
    const style = document.createElement('style');
    style.textContent = `
        .nav-button {
            background: var(--accent-color);
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            font-size: 1.2rem;
            margin: 0 0.5rem;
            cursor: pointer;
        }
        .nav-button:hover {
            background: var(--primary-color);
            color: white;
        }
    `;
    document.head.appendChild(style);
    
    // Funcionalidad para botones de navegación
    document.getElementById('prevCover').addEventListener('click', () => {
        navigateCovers(-1);
    });
    
    document.getElementById('nextCover').addEventListener('click', () => {
        navigateCovers(1);
    });
    
    // Funcionalidad para gestos táctiles
    gallery.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    }, false);
    
    gallery.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, false);
    
    // Funcionalidad para teclado
    document.addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft') navigateCovers(-1);
        if (e.key === 'ArrowRight') navigateCovers(1);
        if (e.key === 'Escape') document.getElementById('closeCoversModal').click();
    });
    
    function handleSwipe() {
        const minSwipeDistance = 50; // Distancia mínima para considerar un swipe
        const distance = touchStartX - touchEndX;
        
        if (Math.abs(distance) < minSwipeDistance) return;
        
        if (distance > 0) {
            navigateCovers(1); // Swipe izquierda -> siguiente imagen
        } else {
            navigateCovers(-1); // Swipe derecha -> imagen anterior
        }
    }
    
    function navigateCovers(direction) {
        currentImageIndex += direction;
        
        // Navegación circular
        if (currentImageIndex < 0) currentImageIndex = images.length - 1;
        if (currentImageIndex >= images.length) currentImageIndex = 0;
        
        // Ocultar todas las imágenes
        images.forEach(img => img.style.display = 'none');
        
        // Mostrar imagen actual
        images[currentImageIndex].style.display = 'block';
        
        // Actualizar indicador
        document.getElementById('currentIndicator').textContent = 
            `${currentImageIndex + 1}/${images.length}`;
    }
}

// Mejorar la función showDescription para móviles
function showDescription(manga) {
    const modal = document.getElementById('descriptionModal');
    const titleElement = document.getElementById('descriptionModalTitle');
    const detailsElement = document.getElementById('descriptionModalDetails');
    const descriptionElement = document.getElementById('descriptionModalText');
    
    titleElement.textContent = manga.titulo;
    
    detailsElement.innerHTML = `
        <p><strong>Demografia:</strong> ${manga.demografia}</p>
        <p><strong>Volúmenes:</strong> ${manga.volumenes}</p>
        <p><strong>Editorial:</strong> ${manga.editorial}</p>
        <p><strong>Guionista:</strong> ${manga.guionista}</p>
        <p><strong>Dibujante:</strong> ${manga.dibujante}</p>
    `;
    
    descriptionElement.textContent = manga.descripcion;
    
    modal.style.display = 'block';
    
    // Añadir funcionalidad de cierre con gesto de deslizamiento hacia abajo
    let touchStartY = 0;
    
    modal.addEventListener('touchstart', e => {
        touchStartY = e.changedTouches[0].screenY;
    }, false);
    
    modal.addEventListener('touchend', e => {
        const touchEndY = e.changedTouches[0].screenY;
        const distance = touchEndY - touchStartY;
        
        // Si el deslizamiento hacia abajo es suficientemente largo, cerrar modal
        if (distance > 100) {
            document.getElementById('closeDescriptionModal').click();
        }
    }, false);
}

// Mostrar descripción en modal
function showDescription(manga) {
    const modal = document.getElementById('descriptionModal');
    const titleElement = document.getElementById('descriptionModalTitle');
    const detailsElement = document.getElementById('descriptionModalDetails');
    const descriptionElement = document.getElementById('descriptionModalText');
    
    titleElement.textContent = manga.titulo;
    
    detailsElement.innerHTML = `
        <p><strong>Demografia:</strong> ${manga.demografia}</p>
        <p><strong>Volúmenes:</strong> ${manga.volumenes}</p>
        <p><strong>Editorial:</strong> ${manga.editorial}</p>
        <p><strong>Guionista:</strong> ${manga.guionista}</p>
        <p><strong>Dibujante:</strong> ${manga.dibujante}</p>
    `;
    
    descriptionElement.textContent = manga.descripcion || 'Descripción no disponible';
    
    modal.style.display = 'block';
}

// Función para depuración - verificar que los botones funcionen
function debugButtons() {
    console.log("Botones de ver portadas:", document.querySelectorAll('.view-covers-btn').length);
    console.log("Botones de ver descripción:", document.querySelectorAll('.view-desc-btn').length);
    
    // Probar con el primer manga si existe
    if (allMangas.length > 0) {
        const firstManga = allMangas[0];
        console.log("Primer manga:", firstManga.titulo);
        console.log("Imágenes del primer manga:", firstManga.imagenes);
    }
}