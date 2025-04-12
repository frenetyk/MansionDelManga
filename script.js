// Función para cargar datos desde JSON
async function loadJSON() {
    try {
        const response = await fetch('datos.json');
        if (!response.ok) {
            throw new Error('Error al cargar los datos');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

// Cargar y mostrar datos
let mangas = []; // Variable global para almacenar los datos

async function initialize() {
    mangas = await loadJSON();
    loadTableData(mangas);
    
    // Configurar búsqueda
    document.getElementById("searchInput").addEventListener("input", (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredMangas = mangas.filter(manga => 
            manga.Titulo.toLowerCase().includes(searchTerm) ||
            manga.Guinista.toLowerCase().includes(searchTerm) ||
            manga.Dibujante.toLowerCase().includes(searchTerm)
        );
        loadTableData(filteredMangas);
    });

    cargarEditoriales(); // Carga el filtro de editoriales
    
    // Event listeners
    document.getElementById('searchInput').addEventListener('input', filtrarDatos);
    document.getElementById('editorialFilter').addEventListener('change', filtrarDatos);

}

// Resto del código (loadTableData, sortTable) se mantiene igual que antes
function loadTableData(data) {
    const tableBody = document.getElementById("tableBody");
    tableBody.innerHTML = "";

    data.forEach(manga => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><img src="${manga.Imagen || 'placeholder.jpg'}" alt="${manga.Titulo}" onerror="this.src='placeholder.jpg'"></td>
            <td><b>${manga.Titulo}</b></td>
            <td>${manga.Guinista}</td>
            <td>${manga.Dibujante}</td>
            <td>${manga.Tomos}</td>
            <td>${manga.Editorial}</td>
            <td><a href="${manga.Enlace}" target="_blank">Ver</a></td>
        `;
        tableBody.appendChild(row);
    });
}

function cargarEditoriales() {
    const editoriales = [...new Set(mangas.map(manga => manga.Editorial))];
    const select = document.getElementById('editorialFilter');
    
    editoriales.sort().forEach(editorial => {
        const option = document.createElement('option');
        option.value = editorial;
        option.textContent = editorial;
        select.appendChild(option);
    });
}

function actualizarContador(resultados) {
    document.getElementById('resultCount').textContent = 
        `Mostrando ${resultados.length} de ${mangas.length} mangas`;
}

function filtrarDatos() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const editorialSeleccionada = document.getElementById('editorialFilter').value;
    
    const resultados = mangas.filter(manga => {
        const coincideBusqueda = (
            manga.Titulo.toLowerCase().includes(searchTerm) ||
            manga.Guinista.toLowerCase().includes(searchTerm) ||
            manga.Dibujante.toLowerCase().includes(searchTerm)
        );
        
        const coincideEditorial = (
            !editorialSeleccionada || 
            manga.Editorial === editorialSeleccionada
        );
        
        return coincideBusqueda && coincideEditorial;
    });
    
    loadTableData(resultados);
    if (document.getElementById('grid-portadas')) {
        mostrarPortadas(resultados); // Filtra también las portadas
    }
}


let sortDirection = 1;
let lastSortedColumn = -1;

function sortTable(columnIndex) {
    const sortKey = ["Titulo", "Guinista", "Dibujante", "Tomos", "Editorial"][columnIndex];
    
    if (lastSortedColumn === columnIndex) {
        sortDirection *= -1;
    } else {
        sortDirection = 1;
        lastSortedColumn = columnIndex;
    }

    const sortedMangas = [...mangas].sort((a, b) => {
        const valA = a[sortKey].toString().toLowerCase();
        const valB = b[sortKey].toString().toLowerCase();
        return valA.localeCompare(valB) * sortDirection;
    });

    loadTableData(sortedMangas);
}

// Inicializar la aplicación
initialize();