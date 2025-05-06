function setCookie(name, value, days = 365) {
    const expires = new Date(Date.now() + days * 86400000).toUTCString();
    document.cookie = name + "=" + encodeURIComponent(value) + "; expires=" + expires + "; path=/";
}

function getCookie(name) {
    const value = document.cookie.match("(^|;)\s*" + name + "\s*=\s*([^;]+)");
    return value ? decodeURIComponent(value.pop()) : null;
}

let stats = {
    wins: parseInt(getCookie('wins')) || 0,
    attempts: parseInt(getCookie('attempts')) || 0,
    guessCounts: JSON.parse(getCookie('guessCounts') || '{}')
};

let currentWord = '';
let allowedWords = [];

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('wins').textContent = stats.wins;
    document.getElementById('attempts').textContent = stats.attempts;

    fetch('slowa.json')
        .then(res => res.json())
        .then(data => {
            allowedWords = data;
            newRound();
        });

    document.getElementById('submitGuess').addEventListener('click', checkGuess);
    document.getElementById('toggleTheme').addEventListener('click', toggleTheme);
});

let currentAttempt = 1;

function newRound() {
    currentWord = allowedWords[Math.floor(Math.random() * allowedWords.length)].toUpperCase();
    document.getElementById('guessInput').value = '';
    document.getElementById('board').innerHTML = '';
    document.getElementById('message').textContent = '';
    currentAttempt = 1;
}

function checkGuess() {
    const input = document.getElementById('guessInput').value.toUpperCase();
    if (input.length !== 5 || !allowedWords.includes(input.toLowerCase())) {
        document.getElementById('message').textContent = 'Nieprawidłowe słowo.';
        return;
    }

    document.getElementById('message').textContent = '';
    const board = document.getElementById('board');
    for (let i = 0; i < 5; i++) {
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.textContent = input[i];
        if (input[i] === currentWord[i]) {
            tile.classList.add('correct');
        } else if (currentWord.includes(input[i])) {
            tile.classList.add('present');
        } else {
            tile.classList.add('absent');
        }
        board.appendChild(tile);
    }

    stats.attempts++;

    if (input === currentWord) {
        stats.wins++;
        stats.guessCounts[currentAttempt] = (stats.guessCounts[currentAttempt] || 0) + 1;
        document.getElementById('message').textContent = 'Brawo! Odgadłeś słowo.';
        saveStats();
        updateStats();
        setTimeout(newRound, 2000);
    } else {
        currentAttempt++;
        saveStats();
        updateStats();
    }
}

function saveStats() {
    setCookie('wins', stats.wins);
    setCookie('attempts', stats.attempts);
    setCookie('guessCounts', JSON.stringify(stats.guessCounts));
}

function updateStats() {
    document.getElementById('wins').textContent = stats.wins;
    document.getElementById('attempts').textContent = stats.attempts;
    renderGuessStats();
}

function renderGuessStats() {
    const statsDiv = document.getElementById('guessStats');
    if (!statsDiv) return;

    const guessCounts = stats.guessCounts;
    let totalGuesses = 0;
    let totalAttempts = 0;
    let maxCount = 0;

    for (const turn in guessCounts) {
        const count = guessCounts[turn];
        totalGuesses += count;
        totalAttempts += count * parseInt(turn);
        if (count > maxCount) maxCount = count;
    }

    const average = totalGuesses ? (totalAttempts / totalGuesses).toFixed(2) : '—';
    let chart = '';

    for (let i = 1; i <= 10; i++) {
        const count = guessCounts[i] || 0;
        const bar = '▇'.repeat((count / maxCount * 20) || 0);
        chart += `${i}. ${bar} (${count})\n`;
    }

    statsDiv.textContent = `Średnia liczba prób: ${average}\n\nRozkład trafień:\n${chart}`;
}

function toggleTheme() {
    document.body.classList.toggle('dark');
}