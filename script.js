const allowedWords = ["słowo", "testy", "zebra", "klucz", "mapka", "brama", "domek", "kwiat", "rysuj", "dzika"];
let secret = allowedWords[Math.floor(Math.random() * allowedWords.length)].toUpperCase();
let currentRowIndex = 0;

const game = document.getElementById("game");
const message = document.getElementById("message");
let stats = JSON.parse(localStorage.getItem("stats")) || {
    wins: 0,
    attempts: 0,
    guessCounts: {}
};
updateStats();

function createRow() {
    const row = document.createElement("div");
    row.className = "row";
    for (let i = 0; i < 5; i++) {
        const input = document.createElement("input");
        input.maxLength = 1;
        input.className = "tile";
        input.dataset.index = i;
        input.autocomplete = "off";
        input.addEventListener("input", handleInput);
        row.appendChild(input);
    }
    game.appendChild(row);
    row.firstChild.focus();
}

function handleInput(e) {
    const input = e.target;
    const val = input.value.toUpperCase();
    input.value = val;
    const next = input.nextElementSibling;
    if (val && next) next.focus();
}

function submitGuess() {
    const row = game.children[currentRowIndex];
    const guess = Array.from(row.children).map(input => input.value).join("");
    if (guess.length < 5) return;
    if (!allowedWords.includes(guess.toLowerCase())) {
        message.textContent = "Nieprawidłowe słowo.";
        return;
    }

    const letterCount = {};
    for (let char of secret) letterCount[char] = (letterCount[char] || 0) + 1;

    Array.from(row.children).forEach((input, i) => {
        const char = input.value;
        if (secret[i] === char) {
            input.classList.add("correct");
            letterCount[char]--;
        }
    });

    Array.from(row.children).forEach((input, i) => {
        const char = input.value;
        if (secret[i] !== char) {
            if (secret.includes(char) && letterCount[char] > 0) {
                input.classList.add("present");
                letterCount[char]--;
            } else {
                input.classList.add("absent");
            }
        }
    });

    stats.attempts++;
    if (guess === secret) {
        message.textContent = "Brawo! Odgadłeś hasło!";
        stats.wins++;
        stats.guessCounts[currentRowIndex + 1] = (stats.guessCounts[currentRowIndex + 1] || 0) + 1;
        saveStats();
        return;
    }

    currentRowIndex++;
    createRow();
    updateStats();
    saveStats();
}

function updateStats() {
    document.getElementById("wins").textContent = stats.wins;
    document.getElementById("attempts").textContent = stats.attempts;
    let text = "";
    for (let i = 1; i <= 10; i++) {
        if (stats.guessCounts[i]) {
            text += `${i} próba: ${stats.guessCounts[i]}\\n`;
        }
    }
    document.getElementById("guessStats").textContent = text;
}

function saveStats() {
    localStorage.setItem("stats", JSON.stringify(stats));
}

document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        submitGuess();
    }
});

createRow();
