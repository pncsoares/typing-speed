const RANDOM_QUOTE_API_URL = 'https://api.quotable.io/random';

const timerElement = document.getElementById('timer');
const quoteDisplayElement = document.getElementById('quoteDisplay');
const quoteInputElement = document.getElementById('quoteInput');
const resultsElement = document.getElementById('results');

let inProgress = false;

function start() {
    startTimer();
}

function stop() {
    inProgress = false;

    stopTimer();
    showResults();
    renderNewQuote();
}

function assembleResults() {
  const wpm = calculateWordsPerMinute();
  return `${time} seconds\n${wpm} words per minute\n${errors} errors`;
}

function showResults() {
    const results = assembleResults();
    resultsElement.innerText = results;
    resultsElement.classList.add('blink');

    setInterval(() => {
        resultsElement.classList.remove('blink');
    }, 3000);
}

function calculateWordsPerMinute() {
    return Math.floor(quoteLength / 5 / (time / 60));
}

let strokesNumber = 0;
let errors = 0;

quoteInputElement.addEventListener('input', () => {
    if (!inProgress) {
        inProgress = true;
        start();
    }

    strokesNumber++;

    const quoteArray = quoteDisplayElement.querySelectorAll('span');
    const valueArray = quoteInputElement.value.split('');

    let finishedAndCorrect = true;

    quoteArray.forEach((characterSpan, index) => {
        const character = valueArray[index];

        if (character == null) {
            characterSpan.classList.remove('correct');
            characterSpan.classList.remove('incorrect');
            finishedAndCorrect = false;
        } else if (character === characterSpan.innerText) {
            characterSpan.classList.remove('incorrect');
            characterSpan.classList.add('correct');
        } else {
            characterSpan.classList.remove('correct');
            characterSpan.classList.add('incorrect');
            finishedAndCorrect = false;
            errors++;
        }
    });

    if (finishedAndCorrect) {
        stop();
    }
});

function getRandomQuote() {
    return fetch(RANDOM_QUOTE_API_URL)
        .then(response => response.json())
        .then(data => data.content);
}

let quoteLength;

async function renderNewQuote() {
    const quote = await getRandomQuote();

    quoteLength = quote.length;

    quoteDisplayElement.innerHTML = '';

    quote.split('').forEach(character => {
        const characterSpan = document.createElement('span');
        characterSpan.innerText = character;
        quoteDisplayElement.appendChild(characterSpan);
    });

    quoteInputElement.value = null;
}

let startTime;
let time;
let timerInterval;

function startTimer() {
    timerElement.innerText = 0;
    startTime = new Date();

    timerInterval = window.setInterval(() => {
        time = getTimerTime();
        timerElement.innerText = time;
    }, 1000);
}

function stopTimer() {
    window.clearInterval(timerInterval);
    startTime = null;
}

function getTimerTime() {
    return Math.floor((new Date() - startTime) / 1000);
}

renderNewQuote();
