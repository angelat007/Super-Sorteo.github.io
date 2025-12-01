//Code de la aplicación de sorteo
class SorteoApp {
    constructor() {
        this.currentWinnerIndex = 0;
        this.totalWinners = 1;
        this.totalAlternates = 0; // 👈 NUEVO
        this.participants = [];
        this.allParticipants = []; // 👈 NUEVO: Guardamos la lista original
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

        //volver al inicio con el logo
        const logoPrincipal = document.getElementById('logoPrincipal');
        if (logoPrincipal) {
            logoPrincipal.addEventListener('click', () => {
                this.goBackToMain();
            });
        }

        // Botón limpiar todo
        const clearBtn = document.getElementById('clearBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearAll());
        }

        // Botón iniciar sorteo
        const startBtn = document.getElementById('startBtn');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.showConfigModal());
        }

        // Modal de configuración
        const cancelConfig = document.getElementById('cancelConfig');
        if (cancelConfig) {
            cancelConfig.addEventListener('click', () => this.hideConfigModal());
        }

        // Confirmar configuración
        const confirmConfig = document.getElementById('confirmConfig');
        if (confirmConfig) {
            confirmConfig.addEventListener('click', () => this.startSorteoSetup());
        }

        // Compartir ganadores
        const compartir = document.getElementById('compartir');
        if (compartir) {
            compartir.addEventListener('click', () => this.compartir());
        }

        // Logo personalizado
        const logoInput = document.getElementById('logoInput');
        if (logoInput) {
            logoInput.addEventListener('change', (e) => this.handleLogoUpload(e));
        }

        // Cambiar color primario
        const primaryColor = document.getElementById('primaryColor');
        if (primaryColor) {
            primaryColor.addEventListener('input', (e) => this.updateColors(e.target.value));
        }

        // Cambiar color primario (input texto)
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
            document.getElementById('addGanador').classList.add('hidden');
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

        // Botón "Próximo participante"
        const proxParticipantBtn = document.getElementById('proxParticipant');
        if (proxParticipantBtn) {
            proxParticipantBtn.addEventListener('click', () => this.continuarSorteo());
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

        // Añadir ganador
        const addGanadorBtn = document.getElementById('addGanador');
        if (addGanadorBtn) {
            addGanadorBtn.addEventListener('click', () => {
                this.showPremioNuevoModal();
            });
        }

        // Modal añadir premio al nuevo ganador
        document.getElementById('premioNuevoCancelar')?.addEventListener('click', () => {
            document.getElementById('premioNuevoModal').classList.remove('show');
        });

        document.getElementById('premioNuevoAceptar')?.addEventListener('click', () => {
            this.confirmarPremioNuevo();
        });

        // Actualizar participantes cuando cambie el textarea
        const participantsInput = document.getElementById('participantsInput');
        if (participantsInput) {
            participantsInput.addEventListener('input', () => {
                this.parseParticipantsFromTextarea(participantsInput.value);
            });
        }
    }

    // Confirmar premio para el nuevo ganador
    showPremioNuevoModal() {
        document.getElementById('premioNuevoInput').value = "";
        document.getElementById('premioNuevoModal').classList.add('show');
    }

    // Confirmar premio para el nuevo ganador
    confirmarPremioNuevo() {
        const premio = document.getElementById('premioNuevoInput').value.trim();

        document.getElementById('premioNuevoModal').classList.remove('show');

        // Guardar premio en lista / si no coloca premio se muestra nada / vacío
        this.prizes.push(premio !== "" ? premio : "");

        // Añadir un nuevo ganador
        this.realAddGanador();
    }

    // Función para manejar la carga de archivos
    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            this.parseParticipants(content, file.name);

            // Mostrar solo un preview de las primeras líneas
            this.renderParticipantsPreview();
        };
        reader.readAsText(file, 'UTF-8');
    }

    // Renderizar vista previa de participantes
    renderParticipantsPreview() {
        const textarea = document.getElementById('participantsInput');
        const maxLines = 500;

        // Array para almacenar los participantes ya mostrados
        this.shownParticipants = [];

        // Obtener 500 participantes aleatorios
        const randomSelection = this.getRandomParticipants(maxLines);
        this.shownParticipants.push(...randomSelection);

        const preview = randomSelection
            .map(p => p.name)
            .join('\n');

        textarea.value = preview;

        // Texto para avisar que se cargaron más
        const summary = document.getElementById('participantsSummary');
        if (summary) {
            summary.innerHTML = `
            Mostrando ${Math.min(maxLines, this.participants.length)} participantes (por optimización).
        `;
            summary.style.display = "block";
        }

        // Mostrar botón "Ver más" si hay más participantes
        this.toggleVerMas();
    }

    // Obtener participantes aleatorios sin repetir los ya mostrados
    getRandomParticipants(count) {
        // Filtrar participantes que aún no se han mostrado
        const notShown = this.participants.filter(p =>
            !this.shownParticipants.some(shown => shown.id === p.id)
        );

        // Si no quedan participantes sin mostrar, reiniciar
        if (notShown.length === 0) {
            this.shownParticipants = [];
            return this.getRandomParticipants(count);
        }

        // Mezclar aleatoriamente y tomar los primeros 'count'
        const shuffled = [...notShown].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, Math.min(count, shuffled.length));
    }

    // Límite actual de participantes mostrados / optimizacion
    verMas() {
        const textarea = document.getElementById('participantsInput');
        const maxLines = 100;

        // Obtener 100 participantes aleatorios nuevos
        const newRandom = this.getRandomParticipants(maxLines);

        if (newRandom.length === 0) {
            alert('Ya se han mostrado todos los participantes');
            return;
        }

        // Agregar a los ya mostrados
        this.shownParticipants.push(...newRandom);

        // Agregar al textarea (no reemplazar, sino añadir)
        const currentContent = textarea.value;
        const newContent = newRandom.map(p => p.name).join('\n');

        textarea.value = currentContent + '\n' + newContent;

        // Actualizar resumen
        const summary = document.getElementById('participantsSummary');
        if (summary) {
            summary.innerHTML = `
            Mostrando ${this.shownParticipants.length} participantes aleatorios de ${this.participants.length} totales.
        `;
        }

        // Actualizar botón
        this.toggleVerMas();
    }

    // Mostrar solo los primeros 100 al comienzo
    mostrarPrimeros() {
        const visibles = this.participants.slice(0, this.visibleCount);
        document.getElementById('participantsInput').value =
            visibles.map(p => p.name).join('\n');

        this.toggleVerMas();
    }

    // Mostrar u ocultar el botón según lo que falte por mostrar
    toggleVerMas() {
        const btn = document.getElementById("VerMas");
        if (!btn) return;

        // Si ya se mostraron todos o no hay participantes para mostrar
        if (!this.shownParticipants || this.shownParticipants.length >= this.participants.length) {
            btn.style.display = "none"; // Ya no hay más que mostrar
        } else {
            btn.style.display = "inline-block"; // Aún hay más
        }
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

        this.visibleCount = 100;
        this.mostrarPrimeros();

        document.getElementById("participantsCount").textContent =
            `${this.participants.length.toLocaleString()} participantes cargados`;

    }

    // Función para limpiar todos los datos
    clearAll() {
        document.getElementById('participantsInput').value = '';
        document.getElementById('fileInput').value = '';
        this.participants = [];
        this.visibleCount = 100;

        // Ocultar el mensaje de resumen
        const summary = document.getElementById('participantsSummary');
        if (summary) {
            summary.style.display = 'none';
            summary.innerHTML = '';
        }

        // Ocultar el botón "Ver más"
        const btnVerMas = document.getElementById('VerMas');
        if (btnVerMas) {
            btnVerMas.style.display = 'none';
        }

        // Ocultar el mensaje de importación
        const mensajeImportacion = document.getElementById('mensajeImportacion');
        if (mensajeImportacion) {
            mensajeImportacion.className = '';
            mensajeImportacion.innerHTML = '';
        }

        this.showMessage('success', 'Datos limpiados correctamente');
    }

    // Función para mostrar el modal de configuración
    showConfigModal() {
        const textareaContent = document.getElementById('participantsInput').value;
        this.parseParticipantsFromTextarea(textareaContent);

        console.log('Participantes encontrados:', this.participants.length);

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

        lines.forEach((line, index) => {
            const trimmedLine = line.trim();
            if (trimmedLine) {
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

        this.totalWinners = winnersCount;
        this.totalAlternates = alternatesCount; // 👈 NUEVO
        this.currentWinnerIndex = 0;
        this.duration = (parseInt(document.getElementById('duration').value) || 5) * 1000;
        this.animationType = document.getElementById('animationType').value;

        const modalTitle = document.getElementById('modalTitle');
        this.sorteoTitle = modalTitle ? modalTitle.value || 'Mi Sorteo' : 'Mi Sorteo';

        const prizesInput = document.getElementById('prizesInput');
        const prizesText = prizesInput ? prizesInput.value : '';
        this.prizes = prizesText.split('\n').filter(p => p.trim()).slice(0, winnersCount);

        // 👇 NUEVO: Guardamos copia de participantes originales
        this.allParticipants = [...this.participants];
        this.winners = [];
        this.alternates = [];

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
            const logoContainer = document.getElementById('logo-cargado');
            logoContainer.innerHTML = `<img src="${e.target.result}" alt="Logo personalizado">`;
        };
        reader.readAsDataURL(file);
    }

    // Iniciar sorteo
    startSorteo() {
        console.log('Iniciando sorteo con', this.participants.length, 'participantes');
        this.isRunning = true;
        this.currentNames = [...this.participants];

        // Ocultar/mostrar botones
        document.getElementById('startSorteoBtn').classList.add('hidden');
        document.getElementById('addGanador').classList.remove('hidden');
        document.getElementById('stopSorteoBtn').classList.remove('hidden');
        document.getElementById('progressBar').classList.remove('hidden');
        document.getElementById('proxParticipant').classList.add('hidden');
        document.getElementById('newSorteoBtn').classList.add('hidden');
        //document.getElementById('openConfig').classList.add('hidden');

        // Ver qué animación está seleccionada
        const animationType = document.getElementById('animationType').value;

        if (animationType === 'ruleta') {
            this.runRuletaAnimation(); // Ruleta de la fortuna
        } else if (animationType === 'regresiva') {
            this.runCountdownAnimation(); // Cuenta regresiva
        } else {
            this.runSorteoAnimation(); // Nombres giratorios
        }
    }

    // Continuar con el siguiente ganador
    continuarSorteo() {
        // Ocultar botón "Próximo participante"
        document.getElementById('proxParticipant').classList.add('hidden');

        // Mostrar barra de progreso nuevamente
        document.getElementById('progressBar').classList.remove('hidden');

        // Resetear barra
        document.getElementById('progressFill').style.width = '0%';

        // Iniciar animación para el siguiente ganador
        this.isRunning = true;
        this.currentNames = [...this.participants];

        const animationType = document.getElementById('animationType').value;

        if (animationType === 'ruleta') {
            this.runRuletaAnimation();
        } else if (animationType === 'regresiva') {
            this.runCountdownAnimation();
        } else {
            this.runSorteoAnimation();
        }
    }

    // Función para ejecutar la animación Cuenta Regresiva
    runCountdownAnimation() {
        const display = document.getElementById('sorteoDisplay');
        const progressFill = document.getElementById('progressFill');

        const totalSeconds = Math.max(1, this.duration / 1000);
        let remaining = Math.ceil(totalSeconds);

        display.innerHTML = `<div class="cuenta-regresiva">${remaining}</div>`;
        progressFill.style.width = "0%";

        const startTime = Date.now();

        const interval = setInterval(() => {
            const elapsed = (Date.now() - startTime) / 1000;
            remaining = Math.ceil(totalSeconds - elapsed);

            const progress = Math.min((elapsed / totalSeconds) * 100, 100);
            progressFill.style.width = `${progress}%`;

            if (remaining > 0) {
                display.innerHTML = `<div class="cuenta-regresiva">${remaining}</div>`;
            } else {
                clearInterval(interval);
                progressFill.style.width = "100%";
                this.finishSorteo();
            }
        }, 1000);
    }

    // Función para ejecutar la animación Nombres Giratorios
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

                // Guardamos el último nombre que se muestra
                this.lastShownName = randomName;

                display.innerHTML = `<div class="nombres-rodando">${randomName.name}</div>`;
            } else {
                this.finishSorteo(this.lastShownName); // 👈 PASAR EL GANADOR REAL
            }

        }, 100);
    }

    // Función para ejecutar la animación Ruleta de la Fortuna
    runRuletaAnimation() {
        const display = document.getElementById('sorteoDisplay');
        const progressFill = document.getElementById('progressFill');
        progressFill.style.width = '0%';

        display.innerHTML = `
        <div class="ruleta-container">
            <canvas id="fortuneWheel" width="450" height="450"></canvas>
            <div id="wheelPointer" class="wheel-pointer">▼</div>
        </div>
    `;

        const canvas = document.getElementById('fortuneWheel');
        const ctx = canvas.getContext('2d');
        const radius = 210;

        const total = this.participants.length;
        const numToShow = Math.min(20, total);
        const shuffled = [...this.participants].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, numToShow);

        const arcSize = (2 * Math.PI) / numToShow;
        const colors = ['#ffcc00', '#ff6666', '#66ccff', '#66ff66', '#ff99cc', '#ccccff', '#ff9966'];

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

        let start = null;
        const totalRotation = (Math.random() * 8 + 8) * Math.PI;
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
                const finalRotation = rotation % (2 * Math.PI);
                const winnerIndex = numToShow - Math.floor(finalRotation / arcSize) - 1;
                const normalizedIndex = ((winnerIndex % numToShow) + numToShow) % numToShow;
                const winner = selected[normalizedIndex];

                // Pass the selected winner to finishSorteo to avoid double-selection and keep consistency
                this.finishSorteo(winner);
            }
        };

        requestAnimationFrame(animate);
    }

    // Finalizar sorteo (UN ganador + N suplentes si corresponde)
    finishSorteo(winnerFromWheel) {
        clearInterval(this.sorteoInterval);
        this.isRunning = false;

        // Build a list of available participants excluding already selected winners and alternates
        const alreadySelectedIds = new Set([
            ...this.winners.map(w => w.id),
            ...this.alternates.map(a => a.id)
        ]);

        const available = this.participants.filter(p => !alreadySelectedIds.has(p.id));

        if (available.length === 0 && !winnerFromWheel) {
            // No available participants
            const displayEmpty = document.getElementById('sorteoDisplay');
            displayEmpty.innerHTML = `<div class="ganador">No hay participantes disponibles</div>`;
            document.getElementById('stopSorteoBtn').classList.add('hidden');
            document.getElementById('progressBar').classList.add('hidden');
            // Mostrar Añadir ganador
            document.getElementById('addGanador').classList.remove('hidden');

            return;
        }

        // El ganador SIEMPRE debe ser el que vino de la ruleta
        let winner = winnerFromWheel;

        // Seguridad extra: si por alguna razón no llegó, detenemos sin escoger otro
        if (!winner) {
            console.error("ERROR: No se recibió ganador desde la ruleta.");
            return;
        }


        // Añadir ganador si no está ya en la lista
        if (!this.winners.some(w => w.id === winner.id)) {
            this.winners.push(winner);
        }

        // 👇 Calcular cuántos suplentes quedan por asignar
        const suplentesAsignados = this.alternates.length;
        const suplentesRestantes = Math.max(0, this.totalAlternates - suplentesAsignados);

        // 👇 Si aún quedan suplentes por asignar, agregar hasta suplentesRestantes
        if (suplentesRestantes > 0) {
            // elegir suplentes desde los disponibles que no sean el ganador ni ya suplentes
            const remainingCandidates = this.participants.filter(p => p.id !== winner.id && !this.alternates.some(a => a.id === p.id) && !this.winners.some(w => w.id === p.id));
            for (let i = 0; i < suplentesRestantes && i < remainingCandidates.length; i++) {
                const suplente = remainingCandidates[i];
                if (!this.alternates.some(a => a.id === suplente.id)) {
                    this.alternates.push(suplente);
                }
            }
        }

        // 👇 Eliminar el ganador y los suplentes asignados de la lista de participantes
        const usedIds = new Set([winner.id, ...this.alternates.map(a => a.id)]);
        this.participants = this.participants.filter(p => !usedIds.has(p.id));

        // Mostrar ganador en pantalla
        const display = document.getElementById('sorteoDisplay');
        display.innerHTML = `<div class="ganador">${winner.name}</div>`;

        document.getElementById('stopSorteoBtn').classList.add('hidden');
        document.getElementById('progressBar').classList.add('hidden');

        // 👇 Incrementar índice
        this.currentWinnerIndex++;

        // 👇 Mostrar resultados parciales
        setTimeout(() => {
            this.showResults();

            // ¿Hay más ganadores pendientes?
            if (this.currentWinnerIndex < this.totalWinners) {
                // Mostrar botón "Próximo participante"
                document.getElementById('proxParticipant').classList.remove('hidden');

                // Ocultar añadir ganador
                document.getElementById('addGanador').classList.add('hidden');

            } else {
                // Ya terminamos todos los ganadores
                document.getElementById('newSorteoBtn').classList.remove('hidden');
                //document.getElementById('openConfig').classList.remove('hidden');
                document.getElementById('exportResults').classList.remove('hidden');
                document.getElementById('addGanador').classList.remove('hidden');
            }
        }, 2000);
    }

    // Función para detener el sorteo manualmente
    stopSorteo() {
        document.getElementById('addGanador').classList.add('hidden');

        if (this.sorteoInterval) {
            clearInterval(this.sorteoInterval);
            this.isRunning = false;
            this.finishSorteo();
        }
    }

    // Mostrar resultados actualizados
    showResults() {
        const resultsList = document.getElementById('resultadosList');
        let html = '';

        // Mostrar todos los ganadores hasta ahora
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

        // Mostrar suplentes
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

    // Añadir más ganadores
    addGanador() {
        // Ahora solo abre el modal
        this.showPremioNuevoModal();
    }

    // Añadir más ganadores (lógica interna)
    realAddGanador() {
        if (this.participants.length === 0) {
            alert('No quedan participantes disponibles');
            return;
        }

        this.totalWinners++;

        document.getElementById('exportResults').classList.add('hidden');
        document.getElementById('addGanador').classList.add('hidden');
        document.getElementById('newSorteoBtn').classList.add('hidden');

        this.continuarSorteo();
    }

    // Función para reiniciar el sorteo
    resetSorteo() {
        this.winners = [];
        this.alternates = [];
        this.isRunning = false;
        this.currentWinnerIndex = 0;

        // Restaurar participantes originales
        this.participants = [...this.allParticipants];

        clearInterval(this.sorteoInterval);

        document.getElementById('startSorteoBtn').classList.remove('hidden');
        document.getElementById('stopSorteoBtn').classList.add('hidden');
        document.getElementById('newSorteoBtn').classList.add('hidden');
        document.getElementById('progressBar').classList.add('hidden');
        document.getElementById('resultados').classList.add('hidden');
        document.getElementById('proxParticipant').classList.add('hidden');
        document.getElementById('exportResults').classList.add('hidden');
        document.getElementById('addGanador').classList.add('hidden');

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
        content += `Total participantes: ${this.allParticipants.length}\n\n`;

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
        this.allParticipants.forEach((participant, index) => {
            content += `${index + 1}. ${participant.name}\n`;
        });

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

    // Función para compartir los resultados del sorteo
    compartir() {
        if (this.winners.length === 0) return;

        // Preparar datos para la página de anuncio
        const ganadores = this.winners.map((winner, index) => {
            const parts = winner.name.split('\t');
            return {
                codigo: parts[0] ? parts[0].trim() : '',
                nombre: parts[1] ? parts[1].trim() : winner.name,
                premio: this.prizes[index] || ''
            };
        });

        const sorteoData = {
            titulo: this.sorteoTitle,
            ganadores: ganadores,
            codigo: this.generateSorteoCode(),
            fecha: new Date().toLocaleString(),
            totalParticipantes: this.allParticipants.length,
            suplentes: this.alternates.map(alt => {
                const parts = alt.name.split('\t');
                return {
                    codigo: parts[0] ? parts[0].trim() : '',
                    nombre: parts[1] ? parts[1].trim() : alt.name
                };
            })
        };

        // Guardar en localStorage
        localStorage.setItem('sorteoResultados', JSON.stringify(sorteoData));

        // Redirigir a la página de anuncio
        window.open('compartirWinners.html', '_blank');
    }

    // Generar código único para el sorteo
    generateSorteoCode() {
        const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let code = '';
        for (let i = 0; i < 7; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
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

// Alternar filtro de duplicados
function toggleDuplicates() {
    const toggle = document.getElementById('duplicateToggle');
    if (!toggle) return;

    toggle.classList.toggle('active');
    if (window.app) {
        window.app.filterDuplicates = toggle.classList.contains('active');
    }
}

// Funciones para el modal de premios
function openPrizesModal() {
    const prizesModal = document.getElementById('prizesModal');
    if (prizesModal) {
        prizesModal.classList.add('show');
    }
}

// Cerrar modal de premios
function closePrizesModal() {
    const prizesModal = document.getElementById('prizesModal');
    if (prizesModal) {
        prizesModal.classList.remove('show');
    }
}

// Guardar premios desde el modal
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

        mensaje.className = "cargando mostrar";
        mensaje.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Se esta importando el archivo...';

        const reader = new FileReader();
        reader.onload = function (e) {
            const contenido = e.target.result;
            const lineas = contenido.split(/\r?\n/).filter(linea => linea.trim() !== "");

            mensaje.className = "exito mostrar";
            mensaje.innerHTML = `<i class="fa-solid fa-circle-check"></i> Se importaron <strong>${lineas.length.toLocaleString()}</strong> participantes.`;
        };

        reader.onerror = function () {
            mensaje.className = "error mostrar";
            mensaje.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Error al leer el archivo.';
        };

        reader.readAsText(archivo);
    };
}

// Inicializar la aplicación
const app = new SorteoApp();
window.app = app;