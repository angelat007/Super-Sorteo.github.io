let canvas = document.getElementById('hiddenCanvas');
let ctx = canvas.getContext('2d');


let sorteoData = {
    titulo: 'TREN DE LA VIDA',
    fecha: '2025-12-1',
    tipo: 'Listado de Nombres',
    participantes: 2,
    ganadores: [
        { nombre: 'nadie', premio: '' }
    ],
};

let businessLogo = new Image();
businessLogo.src = "MEDIA/Medio-logo.webp";

let logoLoaded = false;

businessLogo.onload = () => {
    logoLoaded = true;
    console.log("Logo cargado correctamente");
    generateImage();
};




const backgroundColors = [
    { type: 'gradient', colors: ['#4caf50', '#81c784'] },
    { type: 'gradient', colors: ['#2196f3', '#64b5f6'] },
    { type: 'gradient', colors: ['#ff9800', '#ffb74d'] },
    { type: 'gradient', colors: ['#f44336', '#ef5350'] },
    { type: 'gradient', colors: ['#9c27b0', '#ba68c8'] },
    { type: 'gradient', colors: ['#00bcd4', '#4dd0e1'] },
    { type: 'gradient', colors: ['#ff5722', '#ff8a65'] }
];

let currentBackground = backgroundColors[0];
let customBackgroundImage = null;

function loadSorteoData() {
    const data = localStorage.getItem('sorteoResultados');
    if (data) {
        sorteoData = JSON.parse(data);
        updateSorteoDetails();
    }
}

function updateSorteoDetails() {
    document.getElementById('sorteoFecha').textContent = sorteoData.fecha || '2025-12-1';
    document.getElementById('sorteoTipo').textContent = sorteoData.tipo || 'Listado de Nombres';

    const winnersList = document.getElementById('winnersList');
    winnersList.innerHTML = sorteoData.ganadores.map((ganador, index) => `
        <li class="winner-item">
            <span class="winner-number">${index + 1}.</span>
            <span class="winner-name">${ganador.nombre}</span>
        </li>
    `).join('');
}

function generateImage() {
    const numGanadores = sorteoData.ganadores.length;

    // Determinar si usar diseño de 1 o 2 columnas
    const useDoubleColumn = numGanadores > 5;

    // Calcular dimensiones dinámicas
    let config = calculateLayout(numGanadores, useDoubleColumn);

    // Ajustar tamaño del canvas
    canvas.width = 1080;
    canvas.height = config.canvasHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!logoLoaded) {
        console.log("Logo aún no cargado, intentando más tarde...");
        return;
    }


    // Dibujar fondo
    if (customBackgroundImage) {
        ctx.drawImage(customBackgroundImage, 0, 0, canvas.width, canvas.height);
    } else {
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, currentBackground.colors[0]);
        gradient.addColorStop(1, currentBackground.colors[1]);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Título del sorteo
    ctx.fillStyle = 'white';
    ctx.font = `bold ${config.titleSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText(sorteoData.titulo, canvas.width / 2, config.titleY);

    // Estrellas decorativas alrededor del título
    drawHeaderStars(ctx, config);

    // Texto "Ganadores"
    ctx.fillStyle = 'white';
    ctx.font = `bold ${config.ganadoresSize}px Arial`;
    ctx.fillText('Ganadores', canvas.width / 2, config.ganadoresY);

    // Dibujar ganadores en 1 o 2 columnas
    if (useDoubleColumn) {
        drawWinnersDoubleColumn(ctx, config, canvas);
    } else {
        drawWinnersSingleColumn(ctx, config, canvas);

    }

    // Footer con nombre del negocio
    const footerY = canvas.height - config.footerMargin;
    // CAJA DEL FOOTER — MÁS GRANDE, CON BORDE Y SOMBRA
    const boxWidth = 685;
    const boxHeight = config.footerHeight + 40;
    const boxX = (canvas.width - boxWidth) / 2;
    const boxY = footerY - 20;

    // Sombra
    ctx.shadowColor = 'rgba(0,0,0,0.35)';
    ctx.shadowBlur = 25;
    ctx.shadowOffsetY = 8;

    // Fondo blanco redondeado
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 25);
    ctx.fill();

    // Reset sombra
    ctx.shadowColor = 'transparent';

    // ====== DIBUJAR LOGO ======
    const logoSize = boxHeight * 0.55;
    const logoX = boxX + 40;
    const logoY = boxY + (boxHeight - logoSize) / 2;

    ctx.drawImage(businessLogo, logoX, logoY, logoSize, logoSize);

    // ====== TEXTO ======
    ctx.fillStyle = '#333';
    ctx.font = `bold ${config.footerFontSize + 12}px Arial`;
    ctx.textAlign = 'left';

    const textX = logoX + logoSize + 40;
    const textY = boxY + boxHeight * 0.58;

    ctx.fillText("Super Plaza Venezuela", textX, textY);


    const dataURL = canvas.toDataURL('image/jpeg', 0.95);
    displayGeneratedImage(dataURL);
}

function drawWinnersSingleColumn(ctx, config, canvas) {
    let yPosition = config.winnersStartY;

    sorteoData.ganadores.forEach((ganador, i) => {
        drawWinnerItem(ctx, ganador, config, canvas.width / 2, yPosition, config.itemWidth);
        yPosition += config.itemSpacing;
    });
}

function drawWinnersDoubleColumn(ctx, config, canvas) {
    const canvasWidth = 1080;
    const leftX = canvasWidth * 0.27;  // Columna izquierda
    const rightX = canvasWidth * 0.73; // Columna derecha
    let yPosition = config.winnersStartY;

    sorteoData.ganadores.forEach((ganador, i) => {
        const isLeft = i % 2 === 0;
        const x = isLeft ? leftX : rightX;

        drawWinnerItem(ctx, ganador, config, x, yPosition, config.itemWidth);

        // Solo avanzar Y cuando completamos ambas columnas
        if (!isLeft) {
            yPosition += config.itemSpacing;
        }
    });
}

function drawWinnerItem(ctx, ganador, config, centerX, yPosition, itemWidth) {

    // Posición izquierda donde irá la estrella
    const starX = centerX - (itemWidth / 2) + config.starSize;
    const starY = yPosition;

    // Dibujar estrella (a la izquierda)
    ctx.fillStyle = 'white';
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 5;

    drawStar(ctx, starX, starY, 5, config.starSize, config.starSize / 2);

    // Reset sombra
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Posicionar texto a la derecha de la estrella
    ctx.fillStyle = 'white';
    ctx.font = `bold ${config.winnerFontSize}px Arial`;
    ctx.textAlign = 'left';

    const textX = starX + config.starSize * 1.8;
    const textY = starY + config.winnerFontSize / 2;

    let displayText = ganador.nombre;
    const maxWidth = itemWidth - (config.starSize * 3);

    if (ctx.measureText(displayText).width > maxWidth) {
        let fontSize = config.winnerFontSize;
        while (ctx.measureText(displayText).width > maxWidth && fontSize > 16) {
            fontSize -= 2;
            ctx.font = `bold ${fontSize}px Arial`;
        }
        if (ctx.measureText(displayText).width > maxWidth) {
            while (ctx.measureText(displayText + '...').width > maxWidth && displayText.length > 0) {
                displayText = displayText.slice(0, -1);
            }
            displayText += '...';
        }
    }

    ctx.fillText(displayText, textX, textY);
}


function calculateLayout(numGanadores, useDoubleColumn) {
    const canvasWidth = 1080;

    // Factor de escala más agresivo para llenar mejor el espacio
    const scaleFactor = Math.max(0.65, 1 - (numGanadores - 1) * 0.025);

    // Tamaños de encabezado más grandes
    const titleSize = Math.max(45, Math.round(65 * scaleFactor));
    const ganadoresSize = Math.max(70, Math.round(110 * scaleFactor));

    // Tamaños de items de ganadores
    let starSize, winnerFontSize, itemSpacing, itemWidth;

    if (useDoubleColumn) {
        // Diseño de 2 columnas - aumentar tamaños
        starSize = Math.max(15, Math.round(40 * scaleFactor));
        winnerFontSize = Math.max(34, Math.round(38 * scaleFactor));
        itemSpacing = Math.max(240, Math.round(180 * scaleFactor));
        itemWidth = canvasWidth * 0.42; // Ancho de cada columna
    } else {
        // Diseño de 1 columna
        starSize = Math.max(55, Math.round(85 * scaleFactor));
        winnerFontSize = Math.max(45, Math.round(45 * scaleFactor));
        itemSpacing = Math.max(210, Math.round(290 * scaleFactor));
        itemWidth = canvasWidth * 0.8;
    }

    const textOffset = Math.round(starSize * 0.75);

    // Calcular posiciones Y con mejor distribución
    const titleY = 160;
    const ganadoresY = titleY + 150;
    const winnersStartY = ganadoresY + 120;

    // Calcular altura total necesaria
    const rowsNeeded = useDoubleColumn ? Math.ceil(numGanadores / 2) : numGanadores;
    const totalWinnersHeight = rowsNeeded * itemSpacing;
    const footerSpace = 220;
    const calculatedHeight = winnersStartY + totalWinnersHeight + footerSpace;
    const canvasHeight = Math.max(1920, calculatedHeight);

    const footerHeight = Math.max(80, Math.round(100 * scaleFactor));
    const footerFontSize = Math.max(28, Math.round(38 * scaleFactor));

    return {
        canvasHeight,
        titleSize,
        titleY,
        ganadoresSize,
        ganadoresY,
        winnersStartY,
        starSize,
        winnerFontSize,
        itemSpacing,
        itemWidth,
        textOffset,
        footerHeight,
        footerFontSize,
        footerMargin: 150
    };
}

function drawHeaderStars(ctx, config) {
    const titleY = config.titleY;
    const ganadoresY = config.ganadoresY;

    // Estrellas alrededor de "Ganadores"
    const starPositions = [
        { x: 120, y: ganadoresY - 35, size: 50 },
        { x: 240, y: ganadoresY - 60, size: 65 },
        { x: 840, y: ganadoresY - 60, size: 65 },
        { x: 960, y: ganadoresY - 35, size: 50 }
    ];

    ctx.fillStyle = '#FFD700';
    starPositions.forEach(star => {
        drawStar(ctx, star.x, star.y, 5, star.size, star.size / 2);
    });
}

function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
}

function displayGeneratedImage(dataURL) {
    const previewContainer = document.getElementById('imagePreview');
    previewContainer.innerHTML = `
        <img src="${dataURL}" class="preview-img" onclick="showModal('${dataURL}')">
        <button class="btn-download" onclick="downloadImage('${dataURL}')">
            <i class="fa-solid fa-download"></i>
            Descargar
        </button>
    `;
}

function downloadImage(dataURL) {
    const link = document.createElement('a');
    link.download = `ganadores_${sorteoData.titulo}_${Date.now()}.jpg`;
    link.href = dataURL;
    link.click();
}

function handleBackgroundUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const img = new Image();
            img.onload = function () {
                customBackgroundImage = img;
                generateImage();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function randomizeBackground() {
    customBackgroundImage = null;
    const randomIndex = Math.floor(Math.random() * backgroundColors.length);
    currentBackground = backgroundColors[randomIndex];
    generateImage();
}

function showModal(dataURL) {
    document.getElementById('modalImage').src = dataURL;
    document.getElementById('imageModal').classList.add('show');
}

function closeModal() {
    document.getElementById('imageModal').classList.remove('show');
}

window.onclick = function (event) {
    const modal = document.getElementById('imageModal');
    if (event.target === modal) {
        closeModal();
    }
};

document.getElementById('backgroundUpload').addEventListener('change', handleBackgroundUpload);
document.getElementById('randomBtn').addEventListener('click', randomizeBackground);

loadSorteoData();
generateImage();