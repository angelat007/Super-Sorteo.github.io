//Code de la aplicación de sorteo
class SorteoApp {
    constructor() {
        this.participants = [];
        this.winners = [];
        this.alternates = [];
        this.prizes = [];
        this.isRunning = false;
        this.currentNames = [];
        this.sorteoInterval = null;
        this.duration = 5000;
        this.sorteoTitle = '';
        this.filterDuplicates = false;

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Verificar que los elementos existan antes de agregar listeners
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        }

        const clearBtn = document.getElementById('clearBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearAll());
        }

        const startBtn = document.getElementById('startBtn');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.showConfigModal());
        }

        // Modal de configuración
        const cancelConfig = document.getElementById('cancelConfig');
        if (cancelConfig) {
            cancelConfig.addEventListener('click', () => this.hideConfigModal());
        }

        const confirmConfig = document.getElementById('confirmConfig');
        if (confirmConfig) {
            confirmConfig.addEventListener('click', () => this.startSorteoSetup());
        }

        const logoInput = document.getElementById('logoInput');
        if (logoInput) {
            logoInput.addEventListener('change', (e) => this.handleLogoUpload(e));
        }

        const primaryColor = document.getElementById('primaryColor');
        if (primaryColor) {
            primaryColor.addEventListener('input', (e) => this.updateColors(e.target.value));
        }

        const primaryColorText = document.getElementById('primaryColorText');
        if (primaryColorText) {
            primaryColorText.addEventListener('input', (e) => this.updateColors(e.target.value));
        }

        // Página del sorteo
        const backBtn = document.getElementById('backBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => this.goBackToMain());
        }

        // Iniciar sorteo
        const startSorteoBtn = document.getElementById('startSorteoBtn');
        if (startSorteoBtn) {
            startSorteoBtn.addEventListener('click', () => this.startSorteo());
        }

        // Detener sorteo
        const stopSorteoBtn = document.getElementById('stopSorteoBtn');
        if (stopSorteoBtn) {
            stopSorteoBtn.addEventListener('click', () => this.stopSorteo());
        }

        // Nuevo sorteo
        const newSorteoBtn = document.getElementById('newSorteoBtn');
        if (newSorteoBtn) {
            newSorteoBtn.addEventListener('click', () => this.resetSorteo());
        }

        // Reabrir configuración
        const openConfigBtn = document.getElementById('openConfig');
        if (openConfigBtn) {
            openConfigBtn.addEventListener('click', () => this.showConfigModal());
        }

        // Exportar resultados
        const exportResults = document.getElementById('exportResults');
        if (exportResults) {
            exportResults.addEventListener('click', () => this.exportResults());
        }

        // Actualizar participantes cuando cambie el textarea
        const participantsInput = document.getElementById('participantsInput');
        if (participantsInput) {
            participantsInput.addEventListener('input', () => {
                this.parseParticipantsFromTextarea(participantsInput.value);
            });
        }
    }

    // Función para manejar la carga de archivos
    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            this.parseParticipants(content, file.name);
            document.getElementById('participantsInput').value = this.participants.map(p => p.name).join('\n');
        };
        // Especificar UTF-8 para evitar problemas con caracteres especiales como Ñ
        reader.readAsText(file, 'UTF-8');
    }

    // Función para parsear participantes desde el contenido del archivo
    parseParticipants(content, filename) {
        const tempParticipants = [];
        const lines = content.split(/\r?\n/).filter(l => l.trim() !== '');

        lines.forEach((line, index) => {
            let columns;
            if (line.includes('\t')) {
                columns = line.split('\t', 2);
            } else {
                columns = line.split(',', 2);
            }

            const codigo = (columns[0] || '').trim().replace(/(^"|"$)/g, '');
            const nombreCol = (columns[1] || '').trim().replace(/(^"|"$)/g, '');
            const displayName = nombreCol ? `${codigo}\t${nombreCol}` : codigo || nombreCol;

            if (displayName) {
                tempParticipants.push({ id: Date.now() + index, name: displayName });
            }
        });

        this.participants = tempParticipants;
    }

    // Función para limpiar todos los datos
    clearAll() {
        document.getElementById('sorteoTitle').value = '';
        document.getElementById('participantsInput').value = '';
        document.getElementById('fileInput').value = '';
        this.participants = [];
        this.showMessage('success', 'Datos limpiados correctamente');
    }

    // Función para mostrar el modal de configuración
    showConfigModal() {
        // Primero parseamos los participantes del textarea
        const textareaContent = document.getElementById('participantsInput').value;
        this.parseParticipantsFromTextarea(textareaContent);

        console.log('Participantes encontrados:', this.participants.length); // Debug

        if (this.participants.length === 0) {
            alert('Debes ingresar al menos un participante');
            return;
        }

        this.sorteoTitle = document.getElementById('sorteoTitle').value || 'Mi Sorteo';
        const modalTitle = document.getElementById('modalTitle');
        if (modalTitle) {
            modalTitle.value = this.sorteoTitle;
        }
        document.getElementById('configModal').classList.add('show');
    }

    // Función para parsear participantes desde el textarea
    parseParticipantsFromTextarea(content) {
        if (!content || content.trim() === '') {
            this.participants = [];
            return;
        }

        const tempParticipants = [];
        const lines = content.split(/\r?\n/).filter(l => l.trim() !== '');

        console.log('Líneas procesando:', lines); // Debug

        lines.forEach((line, index) => {
            const trimmedLine = line.trim();
            if (trimmedLine) {
                // Simplificamos: si tiene tab o coma, separamos, si no, usamos toda la línea
                let displayName;
                if (trimmedLine.includes('\t')) {
                    const parts = trimmedLine.split('\t', 2);
                    const codigo = (parts[0] || '').trim();
                    const nombre = (parts[1] || '').trim();
                    displayName = nombre ? `${codigo}\t${nombre}` : codigo;
                } else if (trimmedLine.includes(',')) {
                    const parts = trimmedLine.split(',', 2);
                    const codigo = (parts[0] || '').trim().replace(/(^"|"$)/g, '');
                    const nombre = (parts[1] || '').trim().replace(/(^"|"$)/g, '');
                    displayName = nombre ? `${codigo}\t${nombre}` : codigo;
                } else {
                    // Línea simple, sin separadores
                    displayName = trimmedLine;
                }

                if (displayName) {
                    tempParticipants.push({
                        id: Date.now() + index + Math.random(),
                        name: displayName
                    });
                }
            }
        });

        this.participants = tempParticipants;
        console.log('Participantes parseados:', this.participants); // Debug
    }

    // Función para ocultar el modal de configuración
    hideConfigModal() {
        document.getElementById('configModal').classList.remove('show');
    }

    // Función para iniciar la configuración del sorteo
    startSorteoSetup() {
        const winnersCount = parseInt(document.getElementById('winnersCount').value) || 1;
        const alternatesCount = parseInt(document.getElementById('alternatesCount').value) || 0;

        if (winnersCount + alternatesCount > this.participants.length) {
            alert('La cantidad total de ganadores y suplentes no puede superar el número de participantes');
            return;
        }

        this.duration = (parseInt(document.getElementById('duration').value) || 5) * 1000;
        this.animationType = document.getElementById('animationType').value; // 👈 guardar tipo de animación

        const modalTitle = document.getElementById('modalTitle');
        this.sorteoTitle = modalTitle ? modalTitle.value || 'Mi Sorteo' : 'Mi Sorteo';

        const prizesInput = document.getElementById('prizesInput');
        const prizesText = prizesInput ? prizesInput.value : '';
        this.prizes = prizesText.split('\n').filter(p => p.trim()).slice(0, winnersCount);

        this.hideConfigModal();
        this.showSorteoPage();
    }


    // Función para mostrar la página del sorteo
    showSorteoPage() {
        document.getElementById('mainPage').classList.add('hidden');
        document.getElementById('containerHelp').classList.add('hidden');
        document.getElementById('footerPage').classList.add('hidden');
        document.getElementById('sorteoPage').classList.add('show');

        document.getElementById('sorteoTitleDisplay').textContent = this.sorteoTitle;
        document.getElementById('participantsCount').textContent = `${this.participants.length} participantes cargados`;
    }

    // Función para regresar a la página principal
    goBackToMain() {
        document.getElementById('sorteoPage').classList.remove('show');
        document.getElementById('footerPage').classList.remove('hidden');
        document.getElementById('mainPage').classList.remove('hidden');
        document.getElementById('containerHelp').classList.remove('hidden');
        this.resetSorteo();
    }

    // Función para actualizar colores
    updateColors(color) {
        if (color.startsWith('#')) {
            document.documentElement.style.setProperty('--green', color);
            document.getElementById('primaryColor').value = color;
            document.getElementById('primaryColorText').value = color;
        }
    }

    // Función para manejar la carga del logo personalizado
    handleLogoUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const logoContainer = document.getElementById('logoContainer');
            logoContainer.innerHTML = `<img src="${e.target.result}" alt="Logo personalizado">`;
        };
        reader.readAsDataURL(file);
    }

    // Función para iniciar el sorteo
    startSorteo() {
        console.log('Iniciando sorteo con', this.participants.length, 'participantes');

        if (this.participants.length === 0) {
            alert('No hay participantes para sortear');
            return;
        }

        this.isRunning = true;
        this.winners = [];
        this.alternates = [];
        this.currentNames = [...this.participants];

        // Ocultar/mostrar botones
        document.getElementById('startSorteoBtn').classList.add('hidden');
        document.getElementById('stopSorteoBtn').classList.remove('hidden');
        document.getElementById('progressBar').classList.remove('hidden');
        document.getElementById('resultados').classList.add('hidden');

        // Ver qué animación está seleccionada
        const animationType = document.getElementById('animationType').value;

        if (animationType === 'ruleta') {
            this.runRuletaAnimation(); // llama a la ruleta de la fortuna
        } else if (animationType === 'regresiva') {
            this.runCountdownAnimation(); // llama a la cuenta regresiva
        } else {
            this.runSorteoAnimation(); // Nombres giratorios (por defecto)
        }
    }


    //funcion de cuenta regresiva
    runCountdownAnimation() {
        const display = document.getElementById('sorteoDisplay');
        const progressFill = document.getElementById('progressFill');

        const totalSeconds = Math.max(1, this.duration / 1000); // Convertimos a segundos, mínimo 1
        let remaining = Math.ceil(totalSeconds);

        // Mostrar el primer número
        display.innerHTML = `<div class="cuenta-regresiva">${remaining}</div>`;
        progressFill.style.width = "0%";

        const startTime = Date.now();

        const interval = setInterval(() => {
            const elapsed = (Date.now() - startTime) / 1000;
            remaining = Math.ceil(totalSeconds - elapsed);

            // Actualizar barra de progreso
            const progress = Math.min((elapsed / totalSeconds) * 100, 100);
            progressFill.style.width = `${progress}%`;

            if (remaining > 0) {
                display.innerHTML = `<div class="cuenta-regresiva">${remaining}</div>`;
            } else {
                clearInterval(interval);
                progressFill.style.width = "100%";
                this.finishSorteo();
            }
        }, 1000); // Actualiza 5 veces por segundo para suavizar la barra
    }

    // Función para ejecutar la animación del sorteo
    runSorteoAnimation() {
        const display = document.getElementById('sorteoDisplay');
        const progressFill = document.getElementById('progressFill');
        const startTime = Date.now();

        this.sorteoInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = (elapsed / this.duration) * 100;

            progressFill.style.width = `${Math.min(progress, 100)}%`;

            if (elapsed < this.duration) {
                const randomName = this.currentNames[Math.floor(Math.random() * this.currentNames.length)];
                display.innerHTML = `<div class="nombres-rodando">${randomName.name}</div>`;
            } else {
                this.finishSorteo();
            }
        }, 100);
    }

    //funcion para ejecutar la animacion de la ruleta de la fortuna
    runRuletaAnimation() {
        const display = document.getElementById('sorteoDisplay');
        const progressFill = document.getElementById('progressFill');
        progressFill.style.width = '0%';

        // Limpiar y crear estructura
        display.innerHTML = `
        <div class="ruleta-container">
            <canvas id="fortuneWheel" width="450" height="450"></canvas>
            <div id="wheelPointer" class="wheel-pointer">▼</div>
        </div>
    `;

        const canvas = document.getElementById('fortuneWheel');
        const ctx = canvas.getContext('2d');
        const radius = 210;

        // 🔹 Elegir 20 participantes aleatorios (o menos si hay pocos)
        const total = this.participants.length;
        const numToShow = Math.min(20, total);
        const shuffled = [...this.participants].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, numToShow);

        // 🔹 Calcular ángulo por segmento
        const arcSize = (2 * Math.PI) / numToShow;
        const colors = ['#ffcc00', '#ff6666', '#66ccff', '#66ff66', '#ff99cc', '#ccccff', '#ff9966'];


        // 🔹 Dibujar ruleta (solo nombres)
        const drawWheel = (rotation = 0) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(rotation);

            for (let i = 0; i < numToShow; i++) {
                const startAngle = i * arcSize;
                const endAngle = startAngle + arcSize;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.arc(0, 0, radius, startAngle, endAngle);
                ctx.fillStyle = colors[i % colors.length];
                ctx.fill();

                // 🏷 Mostrar SOLO el nombre (sin código)
                const parts = selected[i].name.split('\t');
                const nombre = parts[1] ? parts[1].trim() : selected[i].name.trim();

                ctx.save();
                ctx.rotate(startAngle + arcSize / 2);
                ctx.textAlign = "right";
                ctx.fillStyle = "#fff";
                ctx.font = "bold 14px Poppins, sans-serif";
                ctx.fillText(nombre.slice(0, 18), radius - 10, 5);
                ctx.restore();
            }

            ctx.restore();
        };

        // 🔹 Animación del giro
        let start = null;
        const totalRotation = (Math.random() * 8 + 8) * Math.PI; // vueltas aleatorias
        const duration = this.duration;
        const easeOut = (t) => 1 - Math.pow(1 - t, 3);

        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const elapsed = timestamp - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeOut(progress);
            const rotation = totalRotation * eased;

            drawWheel(rotation);
            progressFill.style.width = `${(progress * 100).toFixed(1)}%`;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // 🎯 Calcular ganador
                const finalRotation = rotation % (2 * Math.PI);
                const winnerIndex = numToShow - Math.floor(finalRotation / arcSize) - 1;
                const winner = selected[winnerIndex >= numToShow ? winnerIndex - numToShow : winnerIndex];

                this.winners = [winner];
                this.finishSorteo();
            }
        };

        requestAnimationFrame(animate);
    }



    // Función para finalizar el sorteo
    finishSorteo() {
        clearInterval(this.sorteoInterval);
        this.isRunning = false;

        const winnersCount = parseInt(document.getElementById('winnersCount').value) || 1;
        const alternatesCount = parseInt(document.getElementById('alternatesCount').value) || 0;

        const shuffled = [...this.participants].sort(() => Math.random() - 0.5);
        this.winners = shuffled.slice(0, winnersCount);
        this.alternates = shuffled.slice(winnersCount, winnersCount + alternatesCount);

        const display = document.getElementById('sorteoDisplay');
        display.innerHTML = `<div class="ganador">${this.winners[0].name}</div>`;

        document.getElementById('stopSorteoBtn').classList.add('hidden');
        document.getElementById('newSorteoBtn').classList.remove('hidden');
        document.getElementById('openConfig').classList.remove('hidden');
        document.getElementById('progressBar').classList.add('hidden');

        setTimeout(() => {
            this.showResults();
        }, 3000);
    }

    // Función para detener el sorteo manualmente
    stopSorteo() {
        if (this.sorteoInterval) {
            clearInterval(this.sorteoInterval);
            this.isRunning = false;
            this.finishSorteo();
        }
    }

    // Función para mostrar los resultados
    showResults() {
        const resultsList = document.getElementById('resultadosList');
        let html = '';

        // En showResults
        this.winners.forEach((winner, index) => {
            const prize = this.prizes[index] ? `<div class="premio-tag">${this.prizes[index]}</div>` : "";
            html += `
        <div class="resultado-item fade-in">
            <div>
                <strong>${winner.name}</strong>
                <div style="color: var(--text-muted); font-size: 0.9rem;">Ganador #${index + 1}</div>
            </div>
            ${prize}
        </div>
    `;
        });


        this.alternates.forEach((alternate, index) => {
            html += `
                <div class="resultado-item resultado-suplente fade-in">
                    <div>
                        <strong>${alternate.name}</strong>
                        <div style="color: var(--text-muted); font-size: 0.9rem;">Suplente #${index + 1}</div>
                    </div>
                    <div class="premio-tag suplente">Suplente</div>
                </div>
            `;
        });

        resultsList.innerHTML = html;
        document.getElementById('resultados').classList.remove('hidden');
    }

    // Función para reiniciar el sorteo
    resetSorteo() {
        this.winners = [];
        this.alternates = [];
        this.isRunning = false;

        clearInterval(this.sorteoInterval);

        document.getElementById('startSorteoBtn').classList.remove('hidden');
        document.getElementById('stopSorteoBtn').classList.add('hidden');
        document.getElementById('newSorteoBtn').classList.add('hidden');
        document.getElementById('openConfig').classList.add('hidden');
        document.getElementById('progressBar').classList.add('hidden');
        document.getElementById('resultados').classList.add('hidden');

        const display = document.getElementById('sorteoDisplay');
        display.innerHTML = `
            <h2>¡Listo para sortear!</h2>
            <p style="color: var(--text-muted); margin-top: 10px;">
                Presiona "Comenzar Sorteo" cuando estés listo
            </p>
        `;

        document.getElementById('progressFill').style.width = '0%';
    }

    // Función para exportar los resultados a un archivo de texto
    exportResults() {
        if (this.winners.length === 0) return;

        let content = `RESULTADOS DEL SORTEO: ${this.sorteoTitle}\n`;
        content += '=' + '='.repeat(this.sorteoTitle.length + 25) + '\n\n';
        content += `Fecha: ${new Date().toLocaleString()}\n`;
        content += `Total participantes: ${this.participants.length}\n\n`;

        content += 'GANADORES:\n';
        content += '-----------\n';
        this.winners.forEach((winner, index) => {
            if (this.prizes[index]) {
                content += `${index + 1}. ${winner.name} - ${this.prizes[index]}\n`;
            } else {
                content += `${index + 1}. ${winner.name}\n`;
            }
        });


        if (this.alternates.length > 0) {
            content += '\nSUPLENTES:\n';
            content += '-----------\n';
            this.alternates.forEach((alternate, index) => {
                content += `${index + 1}. ${alternate.name}\n`;
            });
        }

        content += '\n\nTODOS LOS PARTICIPANTES:\n';
        content += '------------------------\n';
        this.participants.forEach((participant, index) => {
            content += `${index + 1}. ${participant.name}\n`;
        });

        // Crear el blob con codificación UTF-8 explícita
        const blob = new Blob(['\uFEFF' + content], {
            type: 'text/plain;charset=utf-8-sig'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `resultados_${this.sorteoTitle.replace(/[^a-z0-9áéíóúñü]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Función para mostrar mensajes al usuario
    showMessage(type, message) {
        console.log(`${type}: ${message}`);
    }
}

// Funciones globales para los controles del modal
function changeValue(inputId, delta) {
    const input = document.getElementById(inputId);
    if (!input) return;

    const currentValue = parseInt(input.value) || 0;
    const min = parseInt(input.getAttribute('min')) || 0;
    const max = parseInt(input.getAttribute('max')) || 999;

    const newValue = Math.max(min, Math.min(max, currentValue + delta));
    input.value = newValue;
}

// Función para alternar el filtro de duplicados
function toggleDuplicates() {
    const toggle = document.getElementById('duplicateToggle');
    if (!toggle) return;

    toggle.classList.toggle('active');
    if (window.app) {
        window.app.filterDuplicates = toggle.classList.contains('active');
    }
}

// Función para abrir el modal de premios
function openPrizesModal() {
    const prizesModal = document.getElementById('prizesModal');
    if (prizesModal) {
        prizesModal.classList.add('show');
    }
}

// Función para cerrar el modal de premios
function closePrizesModal() {
    const prizesModal = document.getElementById('prizesModal');
    if (prizesModal) {
        prizesModal.classList.remove('show');
    }
}

// Función para guardar premios desde el modal
function savePrizes() {
    closePrizesModal();
}

// Función para importar archivo de participantes
function importarArchivo() {
    const input = document.getElementById("fileInput");
    const mensaje = document.getElementById("mensajeImportacion");

    input.click();

    input.onchange = function (event) {
        const archivo = event.target.files[0];
        if (!archivo) return;

        // Mostrar mensaje de carga
        mensaje.className = "cargando mostrar";
        mensaje.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Se esta importando el archivo...';

        const reader = new FileReader();
        reader.onload = function (e) {
            const contenido = e.target.result;
            const lineas = contenido.split(/\r?\n/).filter(linea => linea.trim() !== "");

            // Mostrar mensaje de éxito
            mensaje.className = "exito mostrar";
            mensaje.innerHTML = `<i class="fa-solid fa-circle-check"></i> Se importaron <strong>${lineas.length.toLocaleString()}</strong> participantes.`;

            // Guardar si deseas
            // localStorage.setItem("listaParticipantes", JSON.stringify(lineas));
        };

        reader.onerror = function () {
            mensaje.className = "error mostrar";
            mensaje.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Error al leer el archivo.';
        };

        reader.readAsText(archivo);
    };
}

// Initialize app
const app = new SorteoApp();
window.app = app;