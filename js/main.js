const canvas = document.getElementById("canvas");
const collisionSound = new Audio('campana.mp3');  // Asegúrate de que el archivo esté en la ruta correcta

let ctx = canvas.getContext("2d");
canvas.width = 550;
canvas.height = 550;

let mouseX = 0;
let mouseY = 0;

let circlesDeleted = 0;
let totalCircles = 10;
let currentLevel = 1;
let circles = [];

let circlesToGenerate = 10;  // Número total de círculos por nivel
let circleGenerationInterval = 1000;  // Intervalo en milisegundos para generar círculos
let circleGenerationTimer = null

function getRandomColor() {
    return `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`;
}

class Circle {
    constructor(x, radius, speed) {
        this.radius = 40;
        this.posX = x;
        this.posY = canvas.height + radius;
        this.color = getRandomColor();
        this.originalColor = this.color;
        this.speed = speed;

        let angle = -Math.PI / 2 + (Math.random() * Math.PI / 4);  // Ajustar el ángulo para mayor inclinación hacia arriba
        this.dx = Math.cos(angle) * this.speed * 0.5;  // Menos movimiento horizontal
        this.dy = Math.sin(angle) * this.speed;  // Mayor movimiento vertical

        this.opacity = 1;  // Inicia con opacidad total
        this.isClicked = false;  // Bandera para saber si fue clickeado
    }

    draw() {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.fillStyle = `rgba(${parseInt(this.color.split(',')[0].slice(4))}, ${parseInt(this.color.split(',')[1])}, ${parseInt(this.color.split(',')[2])}, ${this.opacity})`;  // Usamos opacidad en el color
        ctx.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    }

    update() {
        if (this.isClicked) {
            // Reducir opacidad lentamente
            if (this.opacity > 0) {
                this.opacity -= 0.01;
            } else {
                // Eliminar el círculo si ya está completamente transparente
                let index = circles.indexOf(this);
                if (index > -1) {
                    circles.splice(index, 1); // Remover el círculo del array
                    circlesDeleted++;  // Incrementar el contador de círculos eliminados
                    updateDeletedInfo();
                }
                return; // No dibujar más el círculo
            }
        }
        this.posX += this.dx;
        this.posY += this.dy;

        // Si el círculo se sale por la parte superior, reaparece en la parte inferior
        if (this.posY + this.radius < 0) {
            this.posY = canvas.height + this.radius;  // Reaparece en la parte inferior
            this.posX = Math.random() * (canvas.width - 2 * this.radius) + this.radius;  // Nueva posición aleatoria en X
        }

        // Limitar los movimientos horizontales al canvas
        if (this.posX - this.radius <= 0 || this.posX + this.radius >= canvas.width) {
            this.dx *= -1;
        }

        // Cambiar el color cuando el mouse está sobre el círculo
        if (this.isMouseOver(mouseX, mouseY)) {
            this.color = "red";  // Cambiar a rojo
        } else {
            this.color = this.originalColor;  // Restaurar al color original
        }
    }

    isMouseOver(mx, my) {
        let dx = mx - this.posX;
        let dy = my - this.posY;
        return Math.sqrt(dx * dx + dy * dy) <= this.radius;
    }

    onClick(mx, my) {
        if (this.isMouseOver(mx, my)) {
            this.isClicked = true;  // Marcar el círculo como clickeado
            collisionSound.currentTime = 0;  // Reiniciar el sonido
            collisionSound.play();  // Reproducir sonido al hacer clic
        }
    }
}

// Captura el evento de clic
canvas.addEventListener('click', function (event) {
    let mouseX = event.offsetX;
    let mouseY = event.offsetY;

    for (let i = 0; i < circles.length; i++) {
        circles[i].onClick(mouseX, mouseY);
    }
});

function generateCircleAtInterval() {
    // Si no hemos llegado al número de círculos deseado, generamos más
    if (circles.length < circlesToGenerate) {
        let speed = 0.1 + (currentLevel * 2);  // Incrementar la velocidad en cada nivel
        let radius = Math.floor(Math.random() * 30) + 20;
        let x = Math.random() * (canvas.width - 2 * radius) + radius;
        circles.push(new Circle(x, radius, speed));  // Generar y agregar un círculo
    } else {
        // Detener el temporizador cuando se han generado todos los círculos
        clearInterval(circleGenerationTimer);
    }
}

// Llamar a la función que genera círculos a intervalos regulares
circleGenerationTimer = setInterval(generateCircleAtInterval, circleGenerationInterval);

function updateCircles() {
    requestAnimationFrame(updateCircles);

    let gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, "rgb(34, 4, 4)");
    gradient.addColorStop(1, "rgba(5, 6, 36, 0.88)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < circles.length; i++) {
        circles[i].update();
        circles[i].draw();
    }

    // Si todos los círculos han sido eliminados, avanzamos al siguiente nivel
    if (circlesDeleted === totalCircles) {
        currentLevel++;
        if (currentLevel <= 10) {
            circlesToGenerate = 10 + currentLevel;  // Incrementar los círculos por nivel
            circlesDeleted = 0;  // Resetear los círculos eliminados
            updateLevelInfo();  // Actualizar el nivel en la pantalla
            // Reiniciar el temporizador para generar círculos gradualmente
            circleGenerationTimer = setInterval(generateCircleAtInterval, circleGenerationInterval);
        }
    }
}

canvas.addEventListener('mousemove', function (event) {
    mouseX = event.offsetX;
    mouseY = event.offsetY;
});

// Función para actualizar la información de círculos eliminados
function updateDeletedInfo() {
    let percentage = ((circlesDeleted / totalCircles) * 100).toFixed(2);
    document.getElementById('deleted-info').innerHTML = `Eliminados: ${circlesDeleted} (${percentage}%)`;
}

// Función para actualizar la información del nivel
function updateLevelInfo() {
    document.getElementById('level-info').innerHTML = `Nivel: ${currentLevel}`;
}

// Inicializamos el juego con los círculos del primer nivel
circleGenerationTimer = setInterval(generateCircleAtInterval, circleGenerationInterval);

updateCircles();