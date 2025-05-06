const allowedWords = ["słowo", "testy", "zebra", "klucz", "mapka", "brama", "domek", "kwiat", "rysuj", "dzika"];
let secret = allowedWords[Math.floor(Math.random() * allowedWords.length)].toUpperCase();
let currentRow = [];
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
        const tile = document.createElement("div");
        tile.className = "tile";
        row.appendChild(tile);
    }
    game.appendChild(row);
}

function getCurrentTiles() {
    return document.querySelectorAll(`.row:nth-child(${currentRowIndex + 1}) .tile`);
}

function updateRow() {
    const tiles = getCurrentTiles();
    tiles.forEach((tile, i) => {
        tile.textContent = currentRow[i] || "";
    });
}

function submitGuess() {
    if (currentRow.length < 5) return;

    const guess = currentRow.join("");
    if (!allowedWords.includes(guess.toLowerCase())) {
        message.textContent = "Nieprawidłowe słowo.";
        return;
    }

    const tiles = getCurrentTiles();
    const letterCount = {};
    for (let char of secret) letterCount[char] = (letterCount[char] || 0) + 1;

    currentRow.forEach((char, i) => {
        if (secret[i] === char) {
            tiles[i].classList.add("correct");
            letterCount[char]--;
        }
    });

    currentRow.forEach((char, i) => {
        if (secret[i] !== char) {
            if (secret.includes(char) && letterCount[char] > 0) {
                tiles[i].classList.add("present");
                letterCount[char]--;
            } else {
                tiles[i].classList.add("absent");
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

    currentRow = [];
    currentRowIndex++;
    createRow();
    updateStats();
    saveStats();
}

function saveStats() {
    localStorage.setItem("stats", JSON.stringify(stats));
}

function updateStats() {
    document.getElementById("wins").textContent = stats.wins;
    document.getElementById("attempts").textContent = stats.attempts;
    let text = "";
    for (let i = 1; i <= 10; i++) {
        if (stats.guessCounts[i]) {
            text += `${i} próba: ${stats.guessCounts[i]}\n`;
        }
    }
    document.getElementById("guessStats").textContent = text;
}

document.addEventListener("keydown", (e) => {
    message.textContent = "";
    if (e.key === "Enter") {
        submitGuess();
    } else if (e.key === "Backspace") {
        currentRow.pop();
        updateRow();
    } else if (/^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]$/.test(e.key) && currentRow.length < 5) {
        currentRow.push(e.key.toUpperCase());
        updateRow();
    }
});

for (let i = 0; i < 5; i++) createRow();
