/* ============================================================
   AL-FURQON SCRABBLE — app.js
   Desain interaksi mengikuti Apple Human Interface Guidelines:
   - Feedback instan dengan ikon Font Awesome (tanpa emoji)
   - Animasi spring / staggered yang halus
   - Haptic-style micro interaction (shake ringan saat invalid)
   ============================================================ */

const input = document.getElementById("word"),

    resultText = document.getElementById("resultText"),
    pointBadge = document.getElementById("pointBadge"),
    meaning = document.getElementById("meaning"),
    scoreBox = document.getElementById("score"),
    wordTitle = document.getElementById("wordTitle"),
    tilesBox = document.getElementById("tiles"),
    soundValid = new Audio("https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg"),

    soundInvalid = new Audio("https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg"),
    buzzerSound = new Audio("https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg"),
    playerABox = document.getElementById("playerABox"),
    playerBBox = document.getElementById("playerBBox"),
    SCORE = {
        a: 1,
        b: 3,
        c: 3,
        d: 2,
        e: 1,
        f: 4,
        g: 2,
        h: 4,
        i: 1,
        j: 8,
        k: 5,
        l: 1,
        m: 3,
        n: 1,
        o: 1,
        p: 3,
        q: 10,
        r: 1,
        s: 1,
        t: 1,
        u: 1,
        v: 4,
        w: 4,
        x: 8,
        y: 4,
        z: 10
    };

/* ---------- Ikon Font Awesome untuk feedback (bukan emoji) ---------- */
const ICON_VALID   = '<i class="fa-solid fa-circle-check" aria-hidden="true"></i>';
const ICON_INVALID = '<i class="fa-solid fa-circle-xmark" aria-hidden="true"></i>';
const ICON_POINT   = '<i class="fa-solid fa-star" aria-hidden="true"></i>';

/* Helper: set hasil valid/invalid dengan ikon + animasi muncul */
function showResult(valid, message) {
    resultText.className = valid ? "valid" : "invalid";
    resultText.innerHTML = (valid ? ICON_VALID : ICON_INVALID) + " " + message;
    // Restart animasi fade ala iOS
    resultText.style.animation = "none";
    void resultText.offsetWidth; // reflow
    resultText.style.animation = "fadeSlideUp .35s var(--spring) both";
}

/* Helper: reset seluruh panel hasil */
function resetPanels() {
    resultText.textContent = "";
    resultText.className = "";
    meaning.textContent = "";
    scoreBox.textContent = "";
    tilesBox.innerHTML = "";
    wordTitle.textContent = "-";
    pointBadge.style.display = "none";
}

function exists(t) {
    t = t.toLowerCase();
    const e = DICT[t.length];
    if (!e) return !1;
    let n = 0,
        a = e.length - 1;
    for (; n <= a;) {
        const i = n + a >> 1;
        if (e[i] === t) return !0;
        e[i] < t ? n = i + 1 : a = i - 1
    }
    return !1
}

function renderScore(t) {
    let e = 0;
    tilesBox.innerHTML = "", scoreBox.textContent = "", [...t].forEach(((n, a) => {
        const i = SCORE[n] || 0;
        e += i, setTimeout((() => {
            const l = document.createElement("div");
            l.className = "tile", i >= 8 && l.classList.add("high"), l.innerHTML = `\n        <div class="letter">${n.toUpperCase()}</div>\n        <div class="point">${i}</div>\n      `, tilesBox.appendChild(l), a === t.length - 1 && (
                pointBadge.innerHTML = ICON_POINT + " " + e + " POINT",
                pointBadge.style.display = "inline-flex",
                pointBadge.style.animation = "none",
                void pointBadge.offsetWidth,
                pointBadge.style.animation = "fadeSlideUp .35s var(--spring) both"
            )
        }), 90 * a)
    }))
}

input.addEventListener("keydown", function(t) {
    if (t.key !== "Enter") return;

    const e = input.value.trim().toLowerCase();
    // Saat input kosong → reset semua dan sembunyikan pointBadge
    if (!e) {
        resetPanels();
        return;
    }

    wordTitle.textContent = e.toUpperCase();
    const isGameMode = gameSwitch.checked; // cek apakah game mode aktif

    if (exists(e)) {
        showResult(true, "VALID");
        soundValid.currentTime = 0;
        soundValid.play();

        if (!isGameMode) {
            // Mode biasa → tampil arti & skor
            meaning.textContent = DEF[e] || "(Meaning not available)";
            renderScore(e);
        } else {
            // Mode turnamen → jangan tampil arti & skor
            meaning.textContent = "";
            tilesBox.innerHTML = "";
            pointBadge.style.display = "none";
        }

    } else {
        showResult(false, "Not Found");
        soundInvalid.currentTime = 0;
        soundInvalid.play();
        // Micro-feedback gaya HIG: getaran singkat pada kartu hasil
        const card = input.closest(".left");
        card.classList.remove("shake");
        void card.offsetWidth;
        card.classList.add("shake");
        meaning.textContent = "";
        scoreBox.textContent = "";
        tilesBox.innerHTML = "";
        pointBadge.style.display = "none";
    }

    input.value = "";
    input.focus();
});

// Bonus: sembunyikan pointBadge saat mulai ketik kata baru
input.addEventListener("input", function() {
    pointBadge.style.display = "none";
});



const turnProgress = document.getElementById("turnProgress"),
    gameSwitch = document.getElementById("gameSwitch"),
    timerPanel = document.getElementById("timerPanel"),
    timeAEl = document.getElementById("timeA"),
    timeBEl = document.getElementById("timeB"),
    turnTimeEl = document.getElementById("turnTime");
let totalTimeA = 1500,
    totalTimeB = 1500,
    turnTime = 120,
    activePlayer = "A",
    gameRunning = !1,
    timerInterval = null;
const tickSound = new Audio("tick.mp3");

function formatTime(t) {
    const e = Math.floor(t / 60),
        n = t % 60;
    return String(e).padStart(2, "0") + ":" + String(n).padStart(2, "0")
}

function updateDisplay() {
    timeAEl.textContent = formatTime(totalTimeA), timeBEl.textContent = formatTime(totalTimeB), turnTimeEl.textContent = formatTime(turnTime);
    const t = turnTime / 120 * 100;
    turnProgress.style.width = t + "%", turnTimeEl.classList.remove("turnWarning", "turnDanger"), turnTime <= 10 && turnTime > 5 ? (turnTimeEl.classList.add("turnWarning"), turnProgress.style.background = "var(--ios-orange)") : turnTime <= 5 ? (turnTimeEl.classList.add("turnDanger"), turnProgress.style.background = "var(--ios-red)") : turnProgress.style.background = "var(--ios-green)"
}

function startGame() {
    input.disabled = !1, timerPanel.style.display = "block", timerPanel.classList.add("visible"), document.body.classList.remove("gameOver"), updatePlayerHighlight(), timerInterval || (totalTimeA = 1500, totalTimeB = 1500, turnTime = 120, activePlayer = "A", gameRunning = !0, input.disabled = !1, document.body.classList.remove("gameOver"), updatePlayerHighlight(), updateDisplay(), timerInterval = setInterval((() => {
        gameRunning && ("A" === activePlayer ? totalTimeA-- : totalTimeB--, turnTime--, turnTime <= 10 && turnTime > 5 && (tickSound.playbackRate = 1, tickSound.currentTime = 0, tickSound.play()), turnTime <= 5 && turnTime > 0 && (tickSound.playbackRate = 1.5, tickSound.currentTime = 0, tickSound.play()), totalTimeA <= 0 && (buzzerSound.play(), stopGame(), input.disabled = !0, document.body.classList.add("gameOver"), alert("Pemain A kalah waktu")), totalTimeB <= 0 && (buzzerSound.play(), stopGame(), input.disabled = !0, document.body.classList.add("gameOver"), alert("Pemain B kalah waktu")), turnTime <= 0 && switchTurn(), updateDisplay())
    }), 1e3))
}

function switchTurn() {
    activePlayer = activePlayer === "A" ? "B" : "A";
    turnTime = 120;
    updatePlayerHighlight();
}

function stopGame() {
    gameRunning = !1, clearInterval(timerInterval), timerInterval = null
}

function destroyGame() {
    stopGame(), timerPanel.style.display = "none", timerPanel.classList.remove("visible"), totalTimeA = 1500, totalTimeB = 1500, turnTime = 120, activePlayer = "A", updateDisplay()
}

function updatePlayerHighlight() {
    if (activePlayer === "A") {
        playerABox.classList.add("playerActive");
        playerABox.classList.remove("playerInactive");
        playerBBox.classList.add("playerInactive");
        playerBBox.classList.remove("playerActive");
    } else {
        playerBBox.classList.add("playerActive");
        playerBBox.classList.remove("playerInactive");
        playerABox.classList.add("playerInactive");
        playerABox.classList.remove("playerActive");
    }
}

gameSwitch.addEventListener("change", (function() {
    this.checked ? (timerPanel.style.display = "block", startGame()) : destroyGame()
})), document.addEventListener("keydown", (function(t) {
    "Space" === t.code && gameRunning && (t.preventDefault(), switchTurn())
}));
