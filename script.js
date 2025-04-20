document.addEventListener('DOMContentLoaded', async () => {
    // Cargar datos desde el JSON (ajusta la ruta si es necesario)
    const response = await fetch('datos.json');
    
    if (!response.ok) {
        console.error("Error al cargar el JSON:", response.status);
        return;
    }
    const mangas = await response.json();
    console.log("Datos cargados:", mangas); // Verifica la estructura
    
    // Elementos del DOM
    const searchInput = document.getElementById('searchInput');
    const demografiaFilter = document.getElementById('demografiaFilter');
    const editorialFilter = document.getElementById('editorialFilter');
    const mangasContainer = document.getElementById('mangasContainer');

    // Generar opciones únicas para filtros
    const demografias = [...new Set(mangas.map(m => m.demografia))];
    const editoriales = [...new Set(mangas.map(m => m.editorial))];

    demografias.forEach(d => {
        demografiaFilter.innerHTML += `<option value="${d}">${d}</option>`;
    });

    editoriales.forEach(e => {
        editorialFilter.innerHTML += `<option value="${e}">${e}</option>`;
    });

    // Función para renderizar mangas filtrados
    function renderMangas(filteredMangas) {
        mangasContainer.innerHTML = '';
        filteredMangas.forEach(manga => {
            mangasContainer.innerHTML += `
                <div class="manga-card">
                    <img src="${manga.imagen}" alt="${manga.titulo}" class="manga-image">
                    <h3>${manga.titulo}</h3>
                    <p><strong>Guionista:</strong> ${manga.guionista}</p>
                    <p><strong>Dibujante:</strong> ${manga.dibujante}</p>
                    <p><strong>Volúmenes:</strong> ${manga.volumenes}</p>
                    <p><strong>Demografía:</strong> ${manga.demografia}</p>
                    <p><strong>Editorial:</strong> ${manga.editorial}</p>
                    <!-- Enlace como botón -->
                    <a href="${manga.enlace}" target="_blank" class="enlace-btn">Descargar</a>
                </div>
            `;
        });
    }

    // Función para filtrar
    function filterMangas() {
        const searchTerm = searchInput.value.toLowerCase();
        const demografia = demografiaFilter.value;
        const editorial = editorialFilter.value;
    
        const filtered = mangas.filter(manga => {
            // Busca en título, guionista Y dibujante (en minúsculas para evitar case-sensitive)
            const matchesSearch = 
                manga.titulo.toLowerCase().includes(searchTerm) ||
                manga.guionista.toLowerCase().includes(searchTerm) || 
                manga.dibujante.toLowerCase().includes(searchTerm);
            
            // Filtros por demografía y editorial
            const matchesDemo = demografia ? manga.demografia === demografia : true;
            const matchesEditorial = editorial ? manga.editorial === editorial : true;
    
            return matchesSearch && matchesDemo && matchesEditorial;
        });
    
        renderMangas(filtered);
    }
    
    //aqui va ORDENAR A-Z
    // Variables globales
let isSorted = false;

// Función para ordenar mangas A-Z o Z-A
function sortMangas() {
    const mangasContainer = document.getElementById('mangasContainer');
    const mangasArray = Array.from(mangasContainer.children);
    
    mangasArray.sort((a, b) => {
        const titleA = a.querySelector('h3').textContent.toLowerCase();
        const titleB = b.querySelector('h3').textContent.toLowerCase();
        return isSorted ? titleB.localeCompare(titleA) : titleA.localeCompare(titleB);
    });

    // Limpia y reinserta las tarjetas ordenadas
    mangasContainer.innerHTML = '';
    mangasArray.forEach(card => mangasContainer.appendChild(card));
    
    isSorted = !isSorted; // Alterna entre A-Z y Z-A
    document.getElementById('sortButton').textContent = isSorted ? 'Ordenar Z-A' : 'Ordenar A-Z';
}

// Evento del botón
document.getElementById('sortButton').addEventListener('click', sortMangas);

    // Event listeners
    searchInput.addEventListener('input', filterMangas);
    demografiaFilter.addEventListener('change', filterMangas);
    editorialFilter.addEventListener('change', filterMangas);

    // Cargar todos los mangas inicialmente
    renderMangas(mangas);
});