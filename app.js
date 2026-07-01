const ROUND_SECONDS = 45;

const cardWordRuEl = document.getElementById("card-word-ru");
const cardWordEnEl = document.getElementById("card-word-en");
const skipBtn = document.getElementById("skip-btn");
const nextBtn = document.getElementById("next-btn");
const restartBtn = document.getElementById("restart-btn");
const startBtn = document.getElementById("start-btn");
const startRoundBtn = document.getElementById("start-round-btn");
const progressEl = document.getElementById("progress");
const timerEl = document.getElementById("timer");
const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const roundOverScreen = document.getElementById("round-over-screen");
const finishedScreen = document.getElementById("finished-screen");

let queue = [];
let currentWord = null;
let shownCount = 0;
let totalSlots = 0;
let timeLeft = ROUND_SECONDS;
let timerId = null;

function shuffle(array) {
  const result = array.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function buildQueue() {
  return shuffle(WORDS).map((word) => ({ ...word, skippedOnce: false }));
}

function renderCard() {
  cardWordRuEl.textContent = currentWord.ru;
  cardWordEnEl.textContent = currentWord.en;
  progressEl.textContent = `Слово ${shownCount} / ${totalSlots}`;
}

function showNextCard() {
  if (queue.length === 0) {
    showFinishedScreen();
    return;
  }
  currentWord = queue.shift();
  shownCount += 1;
  renderCard();
}

function updateTimerDisplay() {
  timerEl.textContent = `⏱ ${timeLeft}`;
  timerEl.classList.toggle("timer-low", timeLeft <= 10);
}

function tick() {
  timeLeft -= 1;
  if (timeLeft <= 0) {
    timeLeft = 0;
    updateTimerDisplay();
    endRound();
  } else {
    updateTimerDisplay();
  }
}

function startRound() {
  clearInterval(timerId);
  timeLeft = ROUND_SECONDS;
  updateTimerDisplay();
  roundOverScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  timerId = setInterval(tick, 1000);
}

function endRound() {
  clearInterval(timerId);
  gameScreen.classList.add("hidden");
  roundOverScreen.classList.remove("hidden");
}

function startDeck() {
  queue = buildQueue();
  totalSlots = queue.length;
  shownCount = 0;
  startScreen.classList.add("hidden");
  finishedScreen.classList.add("hidden");
  showNextCard();
  startRound();
}

function showFinishedScreen() {
  clearInterval(timerId);
  gameScreen.classList.add("hidden");
  roundOverScreen.classList.add("hidden");
  finishedScreen.classList.remove("hidden");
}

skipBtn.addEventListener("click", () => {
  if (!currentWord.skippedOnce) {
    currentWord.skippedOnce = true;
    totalSlots += 1;
    const insertAt = Math.floor(Math.random() * (queue.length + 1));
    queue.splice(insertAt, 0, currentWord);
  }
  showNextCard();
});

nextBtn.addEventListener("click", showNextCard);

startRoundBtn.addEventListener("click", startRound);
restartBtn.addEventListener("click", startDeck);
startBtn.addEventListener("click", startDeck);
