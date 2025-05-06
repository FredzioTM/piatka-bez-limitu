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


let currentAttempt = 0;

function newRound() {
    currentWord = allowedWords[Math.floor(Math.random() * allowedWords.length)].toUpperCase();
    const board = document.getElementById('board');
    board.innerHTML = '';
    document.getElementById('message').textContent = '';
    for (let i = 0; i < 5; i++) {
        const row = document.createElement('div');
        row.className = 'row';
        for (let j = 0; j < 5; j++) {
            const input = document.createElement('input');
            input.className = 'tile';
            input.maxLength = 1;
            input.dataset.row = i;
            input.dataset.col = j;
            row.appendChild(input);
        }
        board.appendChild(row);
    }
    currentAttempt = 0;
}

function checkGuess() {
    if (currentAttempt >= 5) return;

    const rowInputs = document.querySelectorAll(`input[data-row='${currentAttempt}']`);
    const guess = Array.from(rowInputs).map(input => input.value.toUpperCase()).join('');

    if (guess.length !== 5 || !allowedWords.includes(guess.toLowerCase())) {
        document.getElementById('message').textContent = 'Nieprawidłowe słowo.';
        return;
    }

    rowInputs.forEach((input, i) => {
        if (guess[i] === currentWord[i]) {
            input.classList.add('correct');
        } else if (currentWord.includes(guess[i])) {
            input.classList.add('present');
        } else {
            input.classList.add('absent');
        }
        input.disabled = true;
    });

    stats.attempts++;

    if (guess === currentWord) {
        stats.wins++;
        stats.guessCounts[currentAttempt + 1] = (stats.guessCounts[currentAttempt + 1] || 0) + 1;
        document.getElementById('message').textContent = 'Brawo! Odgadłeś słowo.';
        saveStats();
        updateStats();
        setTimeout(newRound, 2000);
    } else {
        currentAttempt++;
        if (currentAttempt === 5) {
            document.getElementById('message').textContent = 'Przegrałeś. Hasło to: ' + currentWord;
        }
        saveStats();
        updateStats();
    }
}
 {
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