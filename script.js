// script.js

const wordList = ["kotek", "piesek", "zamek", "lasem", "kwiat"];
const secretWord = wordList[Math.floor(Math.random() * wordList.length)].toUpperCase();
const game = document.getElementById("game");
const message = document.getElementById("message");
const winsSpan = document.getElementById("wins");
const attemptsSpan = document.getElementById("attempts");
const guessStats = document.getElementById("guessStats");

let currentRow = 0;
let currentCol = 0;
let usedWords = new Set();

function enableRow(rowIndex) {
  const row = game.children[rowIndex].querySelectorAll(".tile");
  row.forEach((input, i) => {
    input.disabled = false;
    input.addEventListener("input", () => {
      if (input.value.length === 1 && i < 4) row[i + 1].focus();
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") submitGuess();
      if (e.key === "Backspace" && input.value === "" && i > 0) row[i - 1].focus();
    });
  });
  row[0].focus();
}

function submitGuess() {
  if (currentRow >= 6) return;
  const row = game.children[currentRow].querySelectorAll(".tile");
  const guess = Array.from(row).map((i) => i.value.toUpperCase()).join("");
  if (guess.length !== 5 || usedWords.has(guess)) {
    message.textContent = guess.length !== 5 ? "Podaj 5-literowe slowo" : "To slowo juz bylo";
    return;
  }

  usedWords.add(guess);
  message.textContent = "";

  const colors = Array(5).fill("absent");
  const letterCount = {};
  for (const char of secretWord) letterCount[char] = (letterCount[char] || 0) + 1;

  for (let i = 0; i < 5; i++) {
    if (guess[i] === secretWord[i]) {
      colors[i] = "correct";
      letterCount[guess[i]]--;
    }
  }
  for (let i = 0; i < 5; i++) {
    if (colors[i] === "correct") continue;
    if (secretWord.includes(guess[i]) && letterCount[guess[i]] > 0) {
      colors[i] = "present";
      letterCount[guess[i]]--;
    }
  }

  row.forEach((input, i) => {
    input.classList.add("flip");
    setTimeout(() => {
      input.classList.add(colors[i]);
      input.classList.remove("flip");
      input.disabled = true;
    }, i * 300);
  });

  currentRow++;
  currentCol = 0;

  updateStats(guess === secretWord);

  if (guess === secretWord) {
    message.textContent = "Brawo! Odgadles slowo.";
  } else if (currentRow < 6) {
    enableRow(currentRow);
  } else {
    message.textContent = `Koniec gry. Haslo to: ${secretWord}`;
  }
}

function updateStats(won) {
  const wins = Number(getCookie("wins") || 0);
  const attempts = Number(getCookie("attempts") || 0);

  if (won) setCookie("wins", wins + 1, 365);
  setCookie("attempts", attempts + 1, 365);

  winsSpan.textContent = getCookie("wins") || 0;
  attemptsSpan.textContent = getCookie("attempts") || 0;
  guessStats.textContent += `\n${currentRow}: ${won ? "wygrana" : "pudlo"}`;
}

function setCookie(name, value, days) {
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/`;
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

function createKeyboard() {
  const keyboardLayout = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Enter", "Z", "X", "C", "V", "B", "N", "M", "←"]
  ];
  const keyboard = document.createElement("div");
  keyboard.id = "keyboard";
  keyboard.style.marginTop = "20px";

  keyboardLayout.forEach(row => {
    const rowDiv = document.createElement("div");
    row.forEach(key => {
      const keyButton = document.createElement("button");
      keyButton.textContent = key;
      keyButton.style.margin = "3px";
      keyButton.style.padding = "10px";
      keyButton.style.fontSize = "16px";
      keyButton.addEventListener("click", () => handleKeyboardInput(key));
      rowDiv.appendChild(keyButton);
    });
    keyboard.appendChild(rowDiv);
  });

  document.body.appendChild(keyboard);
}

function handleKeyboardInput(key) {
  const row = game.children[currentRow].querySelectorAll(".tile");
  if (key === "Enter") {
    submitGuess();
  } else if (key === "←") {
    for (let i = 4; i >= 0; i--) {
      if (row[i].value !== "") {
        row[i].value = "";
        row[i].focus();
        break;
      }
    }
  } else if (/^[A-Z]$/.test(key)) {
    for (let i = 0; i < 5; i++) {
      if (row[i].value === "") {
        row[i].value = key;
        if (i < 4) row[i + 1].focus();
        break;
      }
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  enableRow(currentRow);
  winsSpan.textContent = getCookie("wins") || 0;
  attemptsSpan.textContent = getCookie("attempts") || 0;

  // Tryb ciemny wg ustawień systemowych
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.style.backgroundColor = '#121213';
    document.body.style.color = '#f5f5f5';
    document.querySelectorAll('.tile').forEach(tile => tile.style.backgroundColor = '#3a3a3c');
  }

  createKeyboard();
});
