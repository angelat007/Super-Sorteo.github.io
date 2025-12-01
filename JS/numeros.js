// Función para incrementar/decrementar números
function setupNumberControls() {
    document.querySelectorAll('.increment-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = btn.getAttribute('data-target');
            const input = document.getElementById(targetId);
            const currentValue = parseInt(input.value) || 1;
            
            // Establecer límites específicos para cada campo
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
            
            // Establecer límites específicos para cada campo
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

// Función para manejar los botones preset
function setupPresetButtons() {
    document.querySelectorAll('.preset-button').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('minNumero').value = 1;
            document.getElementById('maxNumero').value = btn.getAttribute('data-max');
        });
    });
}

// Función principal del sorteo
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

    // Guardar resultados en localStorage
    localStorage.setItem("numerosSorteados", JSON.stringify(arr));
    localStorage.setItem("tituloNumeros", titulo || "Sorteo de Números");

    // Redirigir a la página de resultados
    window.location.href = "sortearNumeros.html";
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    setupNumberControls();
    setupPresetButtons();
    
    // Configurar el botón de sorteo
    document.getElementById("btnSorteo").addEventListener("click", realizarSorteo);

    // Validar inputs en tiempo real
    document.getElementById('minNumero').addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        const maxValue = parseInt(document.getElementById('maxNumero').value);
    });

    document.getElementById('maxNumero').addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        const minValue = parseInt(document.getElementById('minNumero').value);
    });

    document.getElementById('cantidadNumeros').addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        if (value < 1) {
            e.target.value = 1;
        }
    });
});