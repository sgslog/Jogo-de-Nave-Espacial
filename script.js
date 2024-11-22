const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Variáveis do jogo
let score = 0;
let lives = 3;
let time = 0;
let gameOver = false;
let paused = false; // Nova variável para controlar o estado de pausa
let difficultyLevel = 1; // Nível de dificuldade
let enemySpeed = 2; // Velocidade inicial dos inimigos
let enemyCount = 5; // Número inicial de inimigos
let lastDifficultyIncrease = 0; // Marca o último tempo em que a dificuldade foi aumentada

const naveImg = new Image();
naveImg.src = 'nave.png'; // Caminho para a imagem da nave

const inimigoImg = new Image();
inimigoImg.src = 'inimigo.png'; // Caminho para a imagem do inimigo

const bossImg = new Image(); // Imagem do boss
bossImg.src = 'boss.png'; // Caminho para a imagem do boss

// Classe da Nave
class Nave {
    constructor() {
        this.x = canvas.width / 2 - 25;
        this.y = canvas.height - 60;
        this.width = 50;
        this.height = 50;
        this.speed = 5;
    }

    draw() {
        ctx.drawImage(naveImg, this.x, this.y, this.width, this.height); // Desenha a nave usando a imagem
    }

    move(direction) {
        if (direction === 'left' && this.x > 0) {
            this.x -= this.speed;
        } else if (direction === 'right' && this.x < canvas.width - this.width) {
            this.x += this.speed;
        } else if (direction === 'up' && this.y > 0) {
            this.y -= this.speed;
        } else if (direction === 'down' && this.y < canvas.height - this.height) {
            this.y += this.speed;
        }
    }

    shoot() {
        return new Projectile(this.x + this.width / 2 - 2.5, this.y); // Cria um novo projétil
    }
}

// Classe dos Projéteis
class Projectile {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 5;
        this.height = 10;
        this.speed = 5; // Velocidade do projétil
    }

    draw() {
        ctx.fillStyle = 'yellow';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    move() {
        this.y -= this.speed; // Move o projétil para cima
    }
}

// Classe dos Inimigos
class Inimigo {
    constructor() {
        this.x = Math.random() * (canvas.width - 50);
        this.y = Math.random() * -100;
        this.width = 50;
        this.height = 50;
        this.speed = enemySpeed; // Usa a velocidade definida globalmente
    }

    draw() {
        ctx.drawImage(inimigoImg, this.x, this.y, this.width, this.height); // Desenha o inimigo usando a imagem
    }

    move() {
        this.y += this.speed;
        if (this.y > canvas.height) {
            // Reinicia a posição do inimigo quando ele sai da tela
            this.y = Math.random() * -100;
            this.x = Math.random() * (canvas.width - 50);
        }
    }
}

// Classe dos Inimigos Resistentes
class InimigoResistente extends Inimigo {
    constructor() {
        super();
        this.life = 3; // Vida do inimigo resistente
    }

    draw() {
        ctx.drawImage(inimigoImg, this.x, this.y, this.width, this.height); // Desenha o inimigo resistente usando a mesma imagem
    }
}

// Classe do Boss
class Boss {
    constructor() {
        this.x = canvas.width / 2 - 75; // Centraliza o boss
        this.y = 0; // Fica na parte superior
        this.width = 150;
        this.height = 100;
        this.speed = 2; // Velocidade de movimento do boss
        this.direction = 1; // Direção inicial (1 = direita, -1 = esquerda)
        this.life = 10; // Vida do boss
    }

    draw() {
        ctx.drawImage(bossImg, this.x, this.y, this.width, this.height); // Desenha o boss usando a imagem
    }

    move() {
        this.x += this.speed * this.direction; // Move o boss lateralmente

        // Verifica se o boss atingiu as bordas do canvas
        if (this.x + this.width > canvas.width || this.x < 0) {
            this.direction *= -1; // Inverte a direção
        }
    }

    shoot() {
        return new BossProjectile(this.x + this.width / 2 - 2.5, this.y + this.height); // Cria um projétil do boss
    }
}

// Classe dos projéteis do Boss
class BossProjectile {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 5;
        this.height = 10;
        this.speed = 3; // Velocidade do projétil do boss
    }

    draw() {
        ctx.fillStyle = 'blue'; // Desenha o projétil do boss como azul
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    move() {
        this.y += this.speed; // Move o projétil para baixo
    }
}

const nave = new Nave();
let inimigos = Array.from({ length: enemyCount }, () => new Inimigo());
let inimigosResistentes = Array.from({ length: enemyCount }, () => new InimigoResistente());
let projectiles = [];
let boss = null; // Inicializa o boss como null
let bossProjectiles = []; // Array para armazenar os projéteis do boss

// Função para desenhar informações do jogo
function drawInfo() {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText('Pontuação: ' + score, 10, 30);
    ctx.fillText('Vidas: ' + lives, 10, 60);
    ctx.fillText('Tempo: ' + Math.floor(time), 10, 90);
    ctx.fillText('Dificuldade: ' + difficultyLevel, 10, 120);
    
    // Indica se o jogo está pausado
    if (paused) {
        ctx.fillText('PAUSADO', canvas.width / 2 - 50, canvas.height / 2);
    }
}

// Função principal do jogo
function gameLoop() {
    if (gameOver) {
        ctx.fillStyle = 'white';
        ctx.font = '48px Arial';
        ctx.fillText('Game Over', canvas.width / 2 - 100, canvas.height / 2);
        return;
    }

    if (paused) {
        drawInfo(); // Apenas desenha as informações se estiver pausado
        return; // Sai da função para não atualizar o jogo
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    nave.draw();
    
    // Desenha e move os projéteis da nave
    projectiles.forEach((proj, projIndex) => {
        proj.move();
        proj.draw();

        // Remove projéteis que saíram da tela
        if (proj.y < 0) {
            projectiles.splice(projIndex, 1);
        }
    });

    // Lógica para o boss
    if (difficultyLevel >= 10 && !boss) {
        boss = new Boss(); // Cria o boss quando o nível de dificuldade atinge 10
    }

    if (boss) {
        boss.move();
        boss.draw();

        // O boss atira a cada 60 quadros
        if (Math.floor(time * 60) % 60 === 0) {
            bossProjectiles.push(boss.shoot());
        }

        // Move e desenha os projéteis do boss
        bossProjectiles.forEach((proj, projIndex) => {
            proj.move();
            proj.draw();

            // Remove projéteis que saíram da tela
            if (proj.y > canvas.height) {
                bossProjectiles.splice(projIndex, 1);
            }

            // Verifica colisão entre projéteis do boss e a nave
            if (proj.x < nave.x + nave.width && proj.x + proj.width > nave.x &&
                proj.y < nave.y + nave.height && proj.y + proj.height > nave.y) {
                lives -= 1; // Perde uma vida
                bossProjectiles.splice(projIndex, 1); // Remove o projétil que atingiu a nave
                if (lives <= 0) {
                    gameOver = true; // Fim do jogo
                }
            }
        });
    }

    // Verifica colisões entre projéteis e inimigos normais
    inimigos.forEach((inimigo, inimigoIndex) => {
        inimigo.move();
        inimigo.draw();

        // Verifica colisão entre projéteis e inimigos normais
        projectiles.forEach((proj, projIndex) => {
            if (proj.x < inimigo.x + inimigo.width && proj.x + proj.width > inimigo.x &&
                proj.y < inimigo.y + inimigo.height &&
                proj.y + proj.height > inimigo.y) {
                // Remove o inimigo e o projétil
                inimigos.splice(inimigoIndex, 1);
                projectiles.splice(projIndex, 1);
                score += 20; // Aumenta a pontuação ao eliminar um inimigo
            }
        });

        // Verifica colisão entre a nave e os inimigos
        if (nave.x < inimigo.x + inimigo.width && nave.x + nave.width > inimigo.x &&
            nave.y < inimigo.y + inimigo.height &&
            nave.y + nave.height > inimigo.y) {
            lives -= 1; // Perde uma vida
            if (lives <= 0) {
                gameOver = true; // Fim do jogo
            }
            // Reinicia a posição do inimigo
            inimigo.y = Math.random() * -100;
            inimigo.x = Math.random() * (canvas.width - 50);
        }
    });

    // Verifica colisões entre projéteis e inimigos resistentes
    inimigosResistentes.forEach((inimigoResistente, inimigoIndex) => {
        inimigoResistente.move();
        inimigoResistente.draw();

        // Verifica colisão entre projéteis e inimigos resistentes
        projectiles.forEach((proj, projIndex) => {
            if (proj.x < inimigoResistente.x + inimigoResistente.width && proj.x + proj.width > inimigoResistente.x &&
                proj.y < inimigoResistente.y + inimigoResistente.height &&
                proj.y + proj.height > inimigoResistente.y) {
                // Reduz a vida do inimigo resistente
                inimigoResistente.life -= 1;
                projectiles.splice(projIndex, 1); // Remove o projétil

                // Remove o inimigo resistente se a vida chegar a zero
                if (inimigoResistente.life <= 0) {
                    inimigosResistentes.splice(inimigoIndex, 1);
                    score += 40; // Aumenta a pontuação ao eliminar um inimigo resistente
                }
            }
        });

        // Verifica colisão entre a nave e os inimigos resistentes
        if (nave.x < inimigoResistente.x + inimigoResistente.width && nave.x + nave.width > inimigoResistente.x &&
            nave.y < inimigoResistente.y + inimigoResistente.height &&
            nave.y + nave.height > inimigoResistente.y) {
            lives -= 1; // Perde uma vida
            if (lives <= 0) {
                gameOver = true; // Fim do jogo
            }
            // Reinicia a posição do inimigo resistente
            inimigoResistente.y = Math.random() * -100;
            inimigoResistente.x = Math.random() * (canvas.width - 50);
        }
    });

    // Atualiza o tempo
    time += 1 / 60; // Atualiza o tempo
    drawInfo(); // Desenha as informações do jogo

    // Aumenta a dificuldade a cada 30 segundos
    if (Math.floor(time) % 30 === 0 && Math.floor(time) !== lastDifficultyIncrease) {
        lastDifficultyIncrease = Math.floor(time); // Atualiza o último tempo de aumento
        difficultyLevel++;
        enemySpeed += 0.5; // Aumenta a velocidade dos inimigos
        enemyCount++; // Aumenta o número de inimigos
        inimigos.push(new Inimigo());
        inimigosResistentes.push(new InimigoResistente()); // Adiciona um novo inimigo resistente
    }

    requestAnimationFrame(gameLoop);
}

// Função para alternar o estado de pausa
function togglePause() {
    paused = !paused;
}

// Adiciona um listener para a tecla 'p' para pausar o jogo
window.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowLeft':
            nave.move('left');
            break;
        case 'ArrowRight':
            nave.move('right');
            break;
        case 'ArrowUp':
            nave.move('up');
            break;
        case 'ArrowDown':
            nave.move('down');
            break;
        case ' ': // Tecla de espaço para atirar
 projectiles.push(nave.shoot());
            break;
        case 'p': // Tecla 'p' para pausar
            togglePause();
            break;
    }
});

gameLoop();