// Incrementar / Decrementar números
function setupNumberControls() {
    document.querySelectorAll('.increment-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = btn.getAttribute('data-target');
            const input = document.getElementById(targetId);
            const currentValue = parseInt(input.value) || 1;

            let maxValue = Number.MAX_SAFE_INTEGER;
            if (targetId === 'minNumero') {
                const maxNumero = parseInt(document.getElementById('maxNumero').value) || 100;
                maxValue = maxNumero - 1;
            }

            if (currentValue < maxValue) {
                input.value = currentValue + 1;
            }
        });
    });

    document.querySelectorAll('.decrement-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = btn.getAttribute('data-target');
            const input = document.getElementById(targetId);
            const currentValue = parseInt(input.value) || 1;

            let minValue = Number.MIN_SAFE_INTEGER;
            if (targetId === 'maxNumero') {
                const minNumero = parseInt(document.getElementById('minNumero').value) || 1;
                minValue = minNumero + 1;
            }

            if (currentValue > minValue) {
                input.value = currentValue - 1;
            }
        });
    });
}

// Botones de preset
function setupPresetButtons() {
    document.querySelectorAll('.preset-button').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('minNumero').value = 1;
            document.getElementById('maxNumero').value = btn.getAttribute('data-max');
        });
    });
}

// Realizar el sorteo
function realizarSorteo() {
    const titulo = document.getElementById("TituloSorteo").value.trim();
    const min = parseInt(document.getElementById("minNumero").value, 10);
    const max = parseInt(document.getElementById("maxNumero").value, 10);
    const count = parseInt(document.getElementById("cantidadNumeros").value, 10);
    const unique = document.getElementById("unicos").checked;

    // Validaciones
    if (min >= max) {
        alert("El número mínimo debe ser menor que el número máximo.");
        return;
    }

    if (count < 1) {
        alert("Debe generar al menos 1 número.");
        return;
    }

    const range = max - min + 1;
    if (unique && count > range) {
        alert("No se pueden generar tantos números únicos en el rango especificado.");
        return;
    }

    // Generar números
    const nums = new Set();
    const arr = [];
    while (arr.length < count) {
        const num = Math.floor(Math.random() * range) + min;
        if (unique) {
            if (!nums.has(num)) {
                nums.add(num);
                arr.push(num);
            }
        } else {
            arr.push(num);
        }
    }

    // Mostrar resultados en la misma página
    localStorage.setItem("numerosSorteados", JSON.stringify(arr));
    localStorage.setItem("tituloNumeros", titulo || "Sorteo de Números");

    // Ocultar la sección de configuración
    document.getElementById("sorteo-numeros").classList.add("hidden");

    // Mostrar la sección de resultados
    const resultadosSection = document.getElementById("resultado-section");
    resultadosSection.classList.remove("hidden");

    // Mostrar título y números
    document.getElementById("tituloMostrado").textContent = titulo || "Sorteo de Números";
    mostrarNumeros(arr);
    createConfetti();
}

// Confeti animado
function createConfetti() {
    const confettiCount = 50;
    const body = document.body;

    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.animationDelay = Math.random() * 3 + 's';
        confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
        body.appendChild(confetti);

        setTimeout(() => {
            if (confetti.parentNode) {
                confetti.parentNode.removeChild(confetti);
            }
        }, 5000);
    }
}

// Mostrar números sorteados
function mostrarNumeros(numeros) {
    const resultadoDiv = document.getElementById("resultado");

    if (!resultadoDiv) return;

    // 🧹 Limpiar resultados previos antes de agregar los nuevos
    resultadoDiv.innerHTML = "";

    if (numeros.length === 0) {
        resultadoDiv.innerHTML = '<div class="no-results">No se encontraron resultados.</div>';
        return;
    }

    const numerosContainer = document.createElement('div');
    numerosContainer.className = 'numeros-container';

    numeros.forEach((numero, index) => {
        const card = document.createElement('div');
        card.className = 'numero-card';
        card.innerHTML = `
            <div class="numero-index">${index + 1}</div>
            <div class="numero-value">${numero}</div>
        `;
        numerosContainer.appendChild(card);
    });

    resultadoDiv.appendChild(numerosContainer);
}

// Obtener números guardados
function obtenerNumeros() {
    const numerosGuardados = localStorage.getItem("numerosSorteados");
    if (numerosGuardados) {
        return JSON.parse(numerosGuardados);
    }
    return [];
}

// Descargar resultados
function setupDownloadButton() {
    const downloadBtn = document.getElementById("downloadResults");
    if (!downloadBtn) return;

    downloadBtn.addEventListener("click", function (e) {
        e.preventDefault();

        const numeros = obtenerNumeros();
        if (!numeros || numeros.length === 0) {
            alert("No hay resultados para descargar.");
            return;
        }

        const titulo = localStorage.getItem("tituloNumeros") || "Resultados del sorteo";
        let contenido = `${titulo}\n\n`;

        numeros.forEach((num, i) => {
            contenido += `#${i + 1}: ${num}\n`;
        });

        const blob = new Blob([contenido], { type: "text/plain" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "resultados_sorteo.txt";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
}

// carga funciones de los botones
document.addEventListener("DOMContentLoaded", () => {
    // Configurar botones
    setupNumberControls();
    setupPresetButtons();

    // Botón principal
    document.getElementById("btnSorteo").addEventListener("click", realizarSorteo);

    // Botón de volver
    document.getElementById("btnVolver").addEventListener("click", () => {
        // Ocultar resultados, mostrar configuración
        document.getElementById("resultado-section").classList.add("hidden");
        document.getElementById("sorteo-numeros").classList.remove("hidden");
        document.getElementById("resultado").innerHTML = ""; // Limpiar resultados al volver
    });
    
    // Botón para descargar
    setupDownloadButton();

    // Botón para recargar (tirar otros números)
document.getElementById("recargar").addEventListener("click", () => {
    // Obtener los valores actuales de la configuración
    const titulo = document.getElementById("TituloSorteo").value.trim();
    const min = parseInt(document.getElementById("minNumero").value, 10);
    const max = parseInt(document.getElementById("maxNumero").value, 10);
    const count = parseInt(document.getElementById("cantidadNumeros").value, 10);
    const unique = document.getElementById("unicos").checked;

    // Validaciones básicas
    if (min >= max) {
        alert("El número mínimo debe ser menor que el número máximo.");
        return;
    }
    if (count < 1) {
        alert("Debe generar al menos 1 número.");
        return;
    }
    const range = max - min + 1;
    if (unique && count > range) {
        alert("No se pueden generar tantos números únicos en el rango especificado.");
        return;
    }

    // Generar nuevos números
    const nums = new Set();
    const arr = [];
    while (arr.length < count) {
        const num = Math.floor(Math.random() * range) + min;
        if (unique) {
            if (!nums.has(num)) {
                nums.add(num);
                arr.push(num);
            }
        } else {
            arr.push(num);
        }
    }

    // Guardar nuevos números y actualizar interfaz
    localStorage.setItem("numerosSorteados", JSON.stringify(arr));
    localStorage.setItem("tituloNumeros", titulo || "Sorteo de Números");

    // Actualizar los resultados visibles con animación
    const resultadoDiv = document.getElementById("resultado");
    resultadoDiv.innerHTML = ""; // limpiar
    mostrarNumeros(arr);
    createConfetti();
});
});