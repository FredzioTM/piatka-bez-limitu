// script.js
const words = ['piesek', 'kotek', 'domki', 'stoły', 'kwiat'];  // Przykładowe słowa
let score = 0;
let currentWord = words[Math.floor(Math.random() * words.length)];
let gameBoard = document.getElementById("game-board");
let scoreDisplay = document.getElementById("score");
let wordInput = document.getElementById("word-input");
let submitButton = document.getElementById("submit-word");
let toggleThemeButton = document.getElementById("toggle-theme");

// Funkcja do rysowania planszy gry
function drawBoard() {
    gameBoard.innerHTML = `Zgadnij słowo: ${currentWord}`;
}

// Funkcja sprawdzająca wpisane słowo
function checkWord() {
    const inputWord = wordInput.value.toLowerCase();
    if (inputWord === currentWord) {
        score++;
        currentWord = words[Math.floor(Math.random() * words.length)];
        scoreDisplay.innerText = score;
        wordInput.value = '';
        drawBoard();
    } else {
        alert('Spróbuj ponownie!');
    }
}

// Funkcja zmieniająca tryb na ciemny/normalny
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
}

// Event listeners
submitButton.addEventListener("click", checkWord);
toggleThemeButton.addEventListener("click", toggleTheme);

// Inicjalizacja gry
drawBoard();
