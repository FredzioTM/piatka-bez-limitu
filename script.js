const allowedWords = ["słowo", "testy", "zebra", "klucz", "mapka", "brama", "domek", "kwiat", "rysuj", "dzika"];
let secret = allowedWords[Math.floor(Math.random() * allowedWords.length)].toUpperCase();

const game = document.getElementById("game");
const message = document.getElementById("message");
let stats = JSON.parse(localStorage.getItem("stats")) || {
  wins: 0,
  attempts: 0,
  guessCounts: {}
};

updateStats();

const maxAttempts = 6;
let currentAttempt = 0;
let usedGuesses = [];

// Stwórz 6 wierszy po 5 pól
for (let i = 0; i < maxAttempts; i++) {
  const row = document.createElement("div");
  row.className = "row";
  for (let j = 0; j < 5; j++) {
    const input = document.createElement("input");
    input.maxLength = 1;
    input.className = "tile";
    input.dataset.row = i;
    input.dataset.col = j;
    input.disabled = i !== 0;
    input.addEventListener("input", handleInput);
    row.appendChild(input);
  }
  game.appendChild(row);
}
game.children[0].children[0].focus();

function handleInput(e) {
  const input = e.target;
  const rowIdx = parseInt(input.dataset.row);
  const colIdx = parseInt(input.dataset.col);
  input.value = input.value.toUpperCase();

  if (input.value && colIdx < 4) {
    game.children[rowIdx].children[colIdx + 1].focus();
  }
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    submitGuess();
  }
});

function submitGuess() {
  if (currentAttempt >= maxAttempts) return;

  const row = game.children[currentAttempt];
  const guess = Array.from(row.children).map(i => i.value).join("");
  if (guess.length < 5) return;

  if (!allowedWords.includes(guess.toLowerCase())) {
    message.textContent = "Nieprawidłowe słowo.";
    return;
  }

  if (usedGuesses.includes(guess)) {
    message.textContent = "To słowo już było użyte.";
    return;
  }

  usedGuesses.push(guess);

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
    input.disabled = true;
  });

  stats.attempts++;

  if (guess === secret) {
    message.textContent = "Brawo! Odgadłeś hasło!";
    stats.wins++;
    stats.guessCounts[currentAttempt + 1] = (stats.guessCounts[currentAttempt + 1] || 0) + 1;
    endGame();
    return;
  }

  currentAttempt++;
  if (currentAttempt >= maxAttempts) {
    message.textContent = `Przegrałeś! Hasło to: ${secret}`;
    endGame();
    return;
  }

  const nextRow = game.children[currentAttempt];
  Array.from(nextRow.children).forEach(i => i.disabled = false);
  nextRow.children[0].focus();

  updateStats();
  saveStats();
}

function endGame() {
  for (let i = currentAttempt + 1; i < maxAttempts; i++) {
    const row = game.children[i];
    Array.from(row.children).forEach(input => input.disabled = true);
  }
  saveStats();
  updateStats();
}

function updateStats() {
  document.getElementById("wins").textContent = stats.wins;
  document.getElementById("attempts").textContent = stats.attempts;
  let text = "";
  for (let i = 1; i <= maxAttempts; i++) {
    if (stats.guessCounts[i]) {
      text += `${i} próba: ${stats.guessCounts[i]}\\n`;
    }
  }
  document.getElementById("guessStats").textContent = text;
}

function saveStats() {
  localStorage.setItem("stats", JSON.stringify(stats));
}
