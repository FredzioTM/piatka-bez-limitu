// script.js

const wordList = ["kotek", "piesek", "zamek", "lasem", "kwiat"];
let secretWord = wordList[Math.floor(Math.random() * wordList.length)].toUpperCase();
const game = document.getElementById("game");
const message = document.getElementById("message");
const winsSpan = document.getElementById("wins");
const attemptsSpan = document.getElementById("attempts");
const guessStats = document.getElementById("guessStats");

let currentRow = 0;
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

  // Sprawdzenie trafionych liter
  for (let i = 0; i < 5; i++) {
    if (guess[i] === secretWord[i]) {
      colors[i] = "correct";
      letterCount[guess[i]]--;
    }
  }
  // Sprawdzenie obecnych liter (ale nie w odpowiednich miejscach)
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
  
  updateStats(guess === secretWord);

  // Jeżeli zgadł, resetujemy grę
  if (guess === secretWord) {
    message.textContent = "Brawo! Odgadles slowo.";
    resetGame();
  } else if (currentRow < 6) {
    enableRow(currentRow);
  } else {
    message.textContent = `Koniec gry. Haslo to: ${secretWord}`;
    resetGame();
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

function resetGame() {
  // Resetujemy pola
  const rows = game.querySelectorAll(".row");
  rows.forEach(row => {
    const inputs = row.querySelectorAll(".tile");
    inputs.forEach(input => {
      input.value = "";
      input.disabled = false;
      input.classList.remove("correct", "present", "absent", "flip");
    });
  });

  // Wylosowanie nowego słowa
  secretWord = wordList[Math.floor(Math.random() * wordList.length)].toUpperCase();
  currentRow = 0;
  usedWords.clear();
  enableRow(currentRow);
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
});
