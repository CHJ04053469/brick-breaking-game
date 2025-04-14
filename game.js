// 캔버스 설정
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// 사운드 설정
const hitSound = document.getElementById("hitSound");
const powerupSound = document.getElementById("powerupSound");
const brickSound = document.getElementById("brickSound");
let soundEnabled = true;

// 동물 패턴 정의
const animalPatterns = {
    cat: [
        [0,0,1,0,0,0,1,0,0], // 귀
        [0,1,2,1,0,1,2,1,0], // 귀
        [0,1,2,2,2,2,2,1,0], // 얼굴
        [1,2,3,2,2,2,3,2,1], // 얼굴
        [0,1,2,3,3,3,2,1,0], // 얼굴
        [0,0,1,2,2,2,1,0,0]  // 턱
    ],
    rabbit: [
        [0,1,1,0,0,0,1,1,0], // 귀
        [1,2,2,1,0,1,2,2,1], // 귀
        [0,2,2,1,0,1,2,2,0], // 귀
        [0,1,2,2,2,2,2,1,0], // 얼굴
        [0,1,3,2,2,2,3,1,0], // 얼굴
        [0,0,1,2,2,2,1,0,0]  // 턱
    ],
    dog: [
        [1,0,0,1,1,1,0,0,1], // 귀
        [1,1,1,2,2,2,1,1,1], // 머리
        [0,1,2,2,2,2,2,1,0], // 얼굴
        [0,1,2,3,2,3,2,1,0], // 얼굴
        [0,1,2,2,2,2,2,1,0], // 얼굴
        [0,0,1,1,1,1,1,0,0]  // 턱
    ],
    panda: [
        [1,1,0,0,0,0,0,1,1], // 귀
        [1,1,1,2,2,2,1,1,1], // 머리
        [0,1,3,2,2,2,3,1,0], // 눈
        [0,1,3,2,2,2,3,1,0], // 눈
        [0,0,1,2,3,2,1,0,0], // 코
        [0,0,0,1,1,1,0,0,0]  // 입
    ],
    fox: [
        [1,0,0,1,0,1,0,0,1], // 귀
        [1,1,1,2,2,2,1,1,1], // 머리
        [0,1,2,3,2,3,2,1,0], // 얼굴
        [0,1,3,2,2,2,3,1,0], // 얼굴
        [0,0,1,2,2,2,1,0,0], // 얼굴
        [0,0,0,1,2,1,0,0,0]  // 턱
    ],
    penguin: [
        [0,0,1,1,1,1,1,0,0], // 머리
        [0,1,2,2,2,2,2,1,0], // 얼굴
        [1,2,3,2,2,2,3,2,1], // 몸통
        [0,1,2,3,3,3,2,1,0], // 몸통
        [0,0,1,2,2,2,1,0,0], // 몸통
        [0,0,0,1,0,1,0,0,0]  // 발
    ],
    bear: [
        [1,1,0,0,0,0,0,1,1], // 귀
        [1,2,1,1,1,1,1,2,1], // 머리
        [0,1,2,3,2,3,2,1,0], // 얼굴
        [0,1,2,2,2,2,2,1,0], // 얼굴
        [0,0,1,2,3,2,1,0,0], // 코
        [0,0,1,1,1,1,1,0,0]  // 입
    ]
};

// 동물별 색상 정의
const animalColors = {
    cat: ['#FFE5D9', '#FFB7B2', '#594A4E', '#000000'],  // 고양이 (살구색, 분홍, 회색, 검정)
    rabbit: ['#FFFFFF', '#FFE5E5', '#FFC0CB', '#000000'],  // 토끼 (흰색, 연분홍, 분홍, 검정)
    dog: ['#8B4513', '#D2691E', '#FFE4B5', '#000000'],  // 강아지 (갈색계열)
    panda: ['#FFFFFF', '#333333', '#000000', '#444444'],  // 판다 (흰색, 회색, 검정)
    fox: ['#FF6B00', '#FF8C42', '#FFFFFF', '#000000'],  // 여우 (주황계열)
    penguin: ['#000000', '#FFFFFF', '#FFD700', '#4682B4'],  // 펭귄 (검정, 흰색, 노랑, 파랑)
    bear: ['#8B4513', '#A0522D', '#6B4423', '#000000']  // 곰 (갈색계열)
};

// 동물 이름 한글화
const animalNames = {
    cat: '고양이',
    rabbit: '토끼',
    dog: '강아지',
    panda: '판다',
    fox: '여우',
    penguin: '펭귄',
    bear: '곰'
};

// 게임 상태
let gameStarted = false;
let countdownActive = false;
let level = 1;
let gameTime = 0;
let timer = null;
let highScore = localStorage.getItem('highScore') || 0;
document.getElementById("highScore").textContent = highScore;

// 시작 화면 관련
const startScreen = document.getElementById('startScreen');
const startButton = document.getElementById('startButton');
const countdownElement = document.getElementById('countdown');
const currentAnimalElement = document.getElementById('currentAnimal');

// 떨어지는 아이템 배열
let fallingPowerups = [];

// 게임 상수
const brickRowCount = 9;
const brickColumnCount = 9;
const brickWidth = 45;
const brickHeight = 45;
const brickPadding = 8;
const brickOffsetTop = 50;
const brickOffsetLeft = 85;

// 공 관련 변수
let ballRadius = 8;
let balls = [{
    x: canvas.width/2,
    y: canvas.height-30,
    dx: 4,
    dy: -4,
    color: "#0095DD"
}];

// 패들 관련 변수
const paddleHeight = 10;
let paddleWidth = 100;
let paddleX = (canvas.width-paddleWidth)/2;
let paddleColor = "#0095DD";

// 키보드 컨트롤 변수
let rightPressed = false;
let leftPressed = false;

// 파티클 시스템
let particles = [];

// 파워업
let powerups = {
    multiball: false
};

// 점수
let score = 0;
// 사운드 컨트롤
soundControl.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    soundControl.textContent = soundEnabled ? "🔊 소리 켜기" : "🔈 소리 끄기";
});

function playSound(sound) {
    if (soundEnabled) {
        sound.currentTime = 0;
        sound.play().catch(e => console.log("오디오 재생 실패:", e));
    }
}

// 시작 버튼 이벤트 리스너
startButton.addEventListener('click', function() {
    startScreen.style.display = 'none';
    startCountdown();
});

// 카운트다운 함수
function startCountdown() {
    countdownActive = true;
    let count = 3;
    countdownElement.style.display = 'block';
    countdownElement.textContent = count;

    const countInterval = setInterval(() => {
        count--;
        if (count > 0) {
            countdownElement.textContent = count;
        } else {
            clearInterval(countInterval);
            countdownElement.style.display = 'none';
            countdownActive = false;
            gameStarted = true;
            resetGame();
            draw();
        }
    }, 1000);
}

// 랜덤 색상 생성 함수
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// 떨어지는 아이템 생성 함수
function createFallingPowerup(x, y) {
    const isBomb = Math.random() < 0.3;
    fallingPowerups.push({
        x: x,
        y: y,
        type: isBomb ? 'bomb' : 'multiball',
        width: 20,
        height: 20,
        speed: 2
    });
}

// 벽돌 배열 초기화
const bricks = [];

function initBricks() {
    const animalTypes = Object.keys(animalPatterns);
    const currentAnimal = animalTypes[(level - 1) % animalTypes.length];
    const pattern = animalPatterns[currentAnimal];
    const colors = animalColors[currentAnimal];
    
    currentAnimalElement.textContent = animalNames[currentAnimal];
    
    for(let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for(let r = 0; r < brickRowCount; r++) {
            if (r < pattern.length && c < pattern[0].length) {
                const value = pattern[r][c];
                if (value > 0) {
                    bricks[c][r] = {
                        x: 0,
                        y: 0,
                        status: value,
                        color: colors[value - 1],
                        width: value > 1 ? brickWidth * 1.2 : brickWidth,
                        height: value > 1 ? brickHeight * 1.2 : brickHeight
                    };
                } else {
                    bricks[c][r] = { status: 0 };
                }
            } else {
                bricks[c][r] = { status: 0 };
            }
        }
    }
}

// 떨어지는 아이템 업데이트 및 그리기
function updateAndDrawPowerups() {
    for (let i = fallingPowerups.length - 1; i >= 0; i--) {
        const powerup = fallingPowerups[i];
        powerup.y += powerup.speed;

        if (powerup.y + powerup.height > canvas.height - paddleHeight &&
            powerup.x + powerup.width > paddleX &&
            powerup.x < paddleX + paddleWidth) {
            if (powerup.type === 'bomb') {
                playSound(hitSound);
                if(confirm("폭탄을 받았습니다!\n게임 오버!\n다시 하시겠습니까?")) {
                    startCountdown();
                } else {
                    gameStarted = false;
                    startScreen.style.display = 'flex';
                }
                return;
            } else {
                playSound(powerupSound);
                activatePowerup(powerup.type);
            }
            fallingPowerups.splice(i, 1);
            continue;
        }

        if (powerup.y > canvas.height) {
            fallingPowerups.splice(i, 1);
            continue;
        }

        ctx.beginPath();
        if (powerup.type === 'bomb') {
            ctx.fillStyle = '#FF0000';
            ctx.arc(powerup.x + 10, powerup.y + 10, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(powerup.x + 10, powerup.y);
            ctx.lineTo(powerup.x + 15, powerup.y - 5);
            ctx.strokeStyle = '#000000';
            ctx.stroke();
        } else {
            ctx.rect(powerup.x, powerup.y, powerup.width, powerup.height);
            ctx.fillStyle = '#00FF00';
            ctx.fill();
        }
        ctx.closePath();
    }
}

// 이벤트 리스너
document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);
document.addEventListener("mousemove", mouseMoveHandler);

function activatePowerup(type) {
    if (type === 'multiball') {
        const currentBalls = [...balls];
        currentBalls.forEach(ball => {
            const newBall = {...ball};
            newBall.dx = -ball.dx;
            balls.push(newBall);
        });
    }
}

function createParticles(x, y, color) {
    for(let i = 0; i < 10; i++) {
        particles.push({
            x: x,
            y: y,
            dx: (Math.random() - 0.5) * 4,
            dy: (Math.random() - 0.5) * 4,
            radius: Math.random() * 3,
            color: color,
            alpha: 1
        });
    }
}

function updateParticles() {
    for(let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.dx;
        p.y += p.dy;
        p.alpha -= 0.02;
        
        if(p.alpha <= 0) {
            particles.splice(i, 1);
        }
    }
}

function drawParticles() {
    particles.forEach(p => {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.restore();
    });
}
function keyDownHandler(e) {
    if(e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = true;
    } else if(e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = true;
    } else if(e.key === "r" || e.key === "R") {
        startCountdown();
    }
}

function keyUpHandler(e) {
    if(e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = false;
    } else if(e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = false;
    }
}

function mouseMoveHandler(e) {
    const relativeX = e.clientX - canvas.offsetLeft;
    if(relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleWidth/2;
    }
}

function collisionDetection() {
    balls.forEach(ball => {
        for(let c = 0; c < brickColumnCount; c++) {
            for(let r = 0; r < brickRowCount; r++) {
                const b = bricks[c][r];
                if(b.status > 0) {
                    const brickWidth = b.width || brickWidth;
                    const brickHeight = b.height || brickHeight;
                    
                    if(ball.x > b.x && ball.x < b.x + brickWidth && 
                       ball.y > b.y && ball.y < b.y + brickHeight) {
                        ball.dy = -ball.dy;
                        ball.color = getRandomColor();
                        b.status--;
                        playSound(brickSound);
                        
                        if(b.status === 0) {
                            createParticles(b.x + brickWidth/2, b.y + brickHeight/2, b.color);
                            score += 10 * level;
                            if(Math.random() < 0.2) {
                                createFallingPowerup(b.x + brickWidth/2, b.y + brickHeight/2);
                            }
                            if(score > highScore) {
                                highScore = score;
                                localStorage.setItem('highScore', highScore);
                                document.getElementById("highScore").textContent = highScore;
                            }
                        }
                        
                        if(isLevelComplete()) {
                            level++;
                            document.getElementById("levelInfo").textContent = `레벨 ${level}`;
                            balls = [{
                                x: canvas.width/2,
                                y: canvas.height-30,
                                dx: 4 * (1 + level * 0.1),
                                dy: -4 * (1 + level * 0.1),
                                color: "#0095DD"
                            }];
                            initBricks();
                            increaseDifficulty();
                        }
                    }
                }
            }
        }
    });
}

function isLevelComplete() {
    for(let c = 0; c < brickColumnCount; c++) {
        for(let r = 0; r < brickRowCount; r++) {
            if(bricks[c][r].status > 0) return false;
        }
    }
    return true;
}

function increaseDifficulty() {
    balls.forEach(ball => {
        ball.dx *= 1.1;
        ball.dy *= 1.1;
    });
}

function drawBall() {
    balls.forEach(ball => {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI*2);
        ctx.fillStyle = ball.color;
        ctx.fill();
        ctx.closePath();
    });
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height-paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = paddleColor;
    ctx.fill();
    ctx.closePath();
}

function drawBricks() {
    for(let c = 0; c < brickColumnCount; c++) {
        for(let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if(b.status > 0) {
                const brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
                const brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
                b.x = brickX;
                b.y = brickY;
                
                ctx.beginPath();
                ctx.rect(brickX, brickY, b.width || brickWidth, b.height || brickHeight);
                ctx.fillStyle = b.color;
                ctx.fill();
                ctx.strokeStyle = '#333';
                ctx.strokeRect(brickX, brickY, b.width || brickWidth, b.height || brickHeight);
                ctx.closePath();
            }
        }
    }
}

function updateTimer() {
    if (!gameStarted || countdownActive) return;
    gameTime++;
    const minutes = Math.floor(gameTime / 60);
    const seconds = gameTime % 60;
    document.getElementById("timer").textContent = 
        `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function resetGame() {
    score = 0;
    level = 1;
    gameTime = 0;
    document.getElementById("levelInfo").textContent = `레벨 ${level}`;
    document.getElementById("score").textContent = score;
    
    balls = [{
        x: canvas.width/2,
        y: canvas.height-30,
        dx: 4,
        dy: -4,
        color: "#0095DD"
    }];
    
    paddleX = (canvas.width-paddleWidth)/2;
    paddleWidth = 100;
    
    fallingPowerups = [];
    powerups.multiball = false;
    
    initBricks();
    
    if(timer) clearInterval(timer);
    timer = setInterval(updateTimer, 1000);
}

function draw() {
    if (!gameStarted || countdownActive) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawBricks();
    drawBall();
    drawPaddle();
    drawParticles();
    updateAndDrawPowerups();
    
    collisionDetection();
    updateParticles();
    
    document.getElementById("score").textContent = score;
    
    balls = balls.filter(ball => ball.y <= canvas.height);
    
    if (balls.length === 0) {
        if(confirm("게임 오버!\n다시 하시겠습니까?")) {
            startCountdown();
        } else {
            gameStarted = false;
            startScreen.style.display = 'flex';
        }
        return;
    }
    
    balls.forEach(ball => {
        if(ball.x + ball.dx > canvas.width-ballRadius || ball.x + ball.dx < ballRadius) {
            ball.dx = -ball.dx;
            ball.color = getRandomColor();
            playSound(hitSound);
        }
        if(ball.y + ball.dy < ballRadius) {
            ball.dy = -ball.dy;
            ball.color = getRandomColor();
            playSound(hitSound);
        } else if(ball.y + ball.dy > canvas.height-ballRadius) {
            if(ball.x > paddleX && ball.x < paddleX + paddleWidth) {
                ball.dy = -ball.dy;
                ball.color = getRandomColor();
                playSound(hitSound);
            }
        }
        
        ball.x += ball.dx;
        ball.y += ball.dy;
    });
    
    if(rightPressed && paddleX < canvas.width-paddleWidth) {
        paddleX += 7;
    } else if(leftPressed && paddleX > 0) {
        paddleX -= 7;
    }
    
    requestAnimationFrame(draw);
}

// 게임 초기화
initBricks();
// 초기 화면 그리기
drawBricks();
drawBall();
drawPaddle();