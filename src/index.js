const timerElement = document.getElementById('timer');
const quoteDisplayElement = document.getElementById('quoteDisplay');
const quoteInputElement = document.getElementById('quoteInput');
const statisticsElements = document.querySelectorAll('.statistics');
const statisticsItemElements = document.querySelectorAll('.statistics-item');

// round statistics
const timeElapsedElement = document.getElementById('timeElapsed');
const wordsPerMinuteElement = document.getElementById('wordsPerMinute');
const errorsElement = document.getElementById('errors');
const accuracyElement = document.getElementById('accuracy');

// global statistics
const highestWordsPerMinuteElement = document.getElementById('highestWordsPerMinute');
const averageWordsPerMinuteElement = document.getElementById('averageWordsPerMinute');
const highestAccuracyElement = document.getElementById('highestAccuracy');
const averageAccuracyElement = document.getElementById('averageAccuracy');

let inProgress = false;

function start() {
    startTimer();
}

function stop() {
    stopTimer();
    showStatistics();
    saveStatistics();
    resetProperties();
    renderNewQuote();
}

function resetProperties() {
    quoteLength = 0;
    inProgress = false;
    strokesCount = 0;
    errorsCount = 0;
}

function showStatistics() {
    showRoundStatistics();
    showGlobalStatistics();

    statisticsElements.forEach(element => {
        element.classList.add('blink');

        setInterval(() => {
            element.classList.remove('blink');
        }, 3000);
    });

    statisticsItemElements.forEach(element => {
        element.style.visibility = 'visible';
    });
}

function showRoundStatistics() {
    const wpm = calculateWordsPerMinute();
    const accuracy = calculateAccuracy();

    timeElapsedElement.innerText = `Elapsed time: ${time}`;
    wordsPerMinuteElement.innerText = `Words per minute: ${wpm}`;
    errorsElement.innerText = `Errors: ${errorsCount}`;
    accuracyElement.innerText = `Accuracy: ${accuracy}%`;
}

function showGlobalStatistics() {
    highestWordsPerMinuteElement.innerText = `Highest wpm: ${highestWpm}`;
    averageWordsPerMinuteElement.innerText = `Average wpm: ${averageWpm}`;
    highestAccuracyElement.innerText = `Highest accuracy: ${highestAccuracy}%`;
    averageAccuracyElement.innerText = `Average accuracy: ${averageAccuracy}%`;
}

let highestWpm = 0;
let averageWpm = 0;
let wpmArray = [];

function calculateWordsPerMinute() {
    const wpm = Math.floor(quoteLength / 5 / (time / 60));

    wpmArray.push(wpm);

    if (wpm > highestWpm) {
        addAllTimeHighTag(wordsPerMinuteElement);
        highestWpm = wpm;
    } else {
        removeAllTimeHighTag(wordsPerMinuteElement);
    }

    averageWpm = Math.floor(wpmArray.reduce((a, b) => a + b, 0) / wpmArray.length);

    return wpm;
}

let highestAccuracy = 0;
let averageAccuracy = 0;
let accuracyArray = [];

function calculateAccuracy() {
    const accuracy = Math.floor((quoteLength / strokesCount) * 100);

    accuracyArray.push(accuracy);

    if (accuracy > highestAccuracy) {
        addAllTimeHighTag(accuracyElement);
        highestAccuracy = accuracy;
    } else {
        removeAllTimeHighTag(accuracyElement);
    }

    averageAccuracy = Math.floor(
        accuracyArray.reduce((a, b) => a + b, 0) / accuracyArray.length
    );

    return accuracy;
}

function saveStatistics() {
    localStorage.highestWpm = highestWpm;
    localStorage.averageWpm = averageWpm;
    localStorage.wpmArray = JSON.stringify(wpmArray);

    localStorage.highestAccuracy = highestAccuracy;
    localStorage.averageAccuracy = averageAccuracy;
    localStorage.accuracyArray = JSON.stringify(accuracyArray);
}

function loadSavedStatistics() {
    const tempHighestWpm = localStorage.highestWpm;

    if (tempHighestWpm !== null && tempHighestWpm !== undefined) {
        highestWpm = tempHighestWpm;
    }

    const tempAverageWpm = localStorage.averageWpm;

    if (tempAverageWpm !== null && tempAverageWpm !== undefined) {
        averageWpm = tempAverageWpm;
    }

    const tempWpmArray = localStorage.wpmArray;

    if (tempWpmArray !== null && tempWpmArray?.length > 0) {
        wpmArray = JSON.parse(tempWpmArray);
    }

    const tempHighestAccuracy = localStorage.highestAccuracy;

    if (tempHighestAccuracy !== null && tempHighestAccuracy !== undefined) {
        highestAccuracy = tempHighestAccuracy;
    }

    const tempAverageAccuracy = localStorage.averageAccuracy;

    if (tempAverageAccuracy !== null && tempAverageAccuracy !== undefined) {
        averageAccuracy = tempAverageAccuracy;
    }

    const tempAccuracyArray = localStorage.accuracyArray;

    if (tempAccuracyArray !== null && tempAccuracyArray?.length > 0) {
        accuracyArray = JSON.parse(tempAccuracyArray);
    }

    if (
        highestWpm !== null &&
        highestWpm !== undefined &&
        averageWpm !== null &&
        averageWpm !== undefined &&
        wpmArray.length > 0 &&
        highestAccuracy !== null &&
        highestAccuracy !== undefined &&
        averageAccuracy !== null &&
        averageAccuracy !== undefined &&
        accuracyArray.length > 0
    ) {
        statisticsItemElements[1].style.visibility = 'visible'; // global statistics
        showGlobalStatistics();
    }
}

let strokesCount = 0;
let errorsCount = 0;

quoteInputElement.addEventListener('input', () => {
    if (!inProgress) {
        inProgress = true;
        start();
    }

    strokesCount++;

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
            errorsCount++;
        }
    });

    if (finishedAndCorrect) {
        stop();
    }
});

async function getRandomQuote() {
    addLoading();

    await sleep();

    return fetch('../data/quotes-en.json')
        .then(response => response.json())
        .then(data => {
            const shuffledArray = shuffleArray(data.quotes);
            return getItem(shuffledArray, 1);
        })
        .finally(() => removeLoading());
}

const NUMBER_OF_WORDS = 15;

async function getRandomWords() {
    addLoading();

    await sleep();

    return fetch('../data/words-en.json')
        .then(response => response.json())
        .then(data => {
            const shuffledArray = shuffleArray(data.words);
            return getItems(shuffledArray, NUMBER_OF_WORDS);
        })
        .finally(() => removeLoading());
}

function addLoading() {
    const loadingDiv = document.createElement('div');
    loadingDiv.setAttribute('id', 'loadingDiv');
    loadingDiv.innerHTML = '<div class="loading">Loading...</div>';
    document.body.appendChild(loadingDiv);
}

function removeLoading() {
    const loadingDiv = document.getElementById('loadingDiv');
    loadingDiv?.remove();
}

async function sleep() {
    await new Promise(r => setTimeout(r, 500));
}

function shuffleArray(array) {
    return array.sort(() => 0.5 - Math.random());
}

function getItem(array, numberOfItems) {
    return array.slice(0, numberOfItems)[0];
}

function getItems(array, numberOfItems) {
    return array.slice(0, numberOfItems).join(' ');
}

function addAllTimeHighTag(element) {
    const span = getAllTimeHighSpan(element);

    if (span !== null) {
        span.style.visibility = 'visible';
    }
}

function removeAllTimeHighTag(element) {
    const span = getAllTimeHighSpan(element);

    if (span !== null) {
        span.style.visibility = 'hidden';
    }
}

function getAllTimeHighSpan(element) {
    return document.getElementById(`allTimeHighSpan_${element.id}`);
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
loadSavedStatistics();
