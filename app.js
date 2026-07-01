const ROUND_SECONDS = 45;

const cardWordRuEl = document.getElementById("card-word-ru");
const cardWordEnEl = document.getElementById("card-word-en");
const nextBtn = document.getElementById("next-btn");
const restartBtn = document.getElementById("restart-btn");
const startRoundBtn = document.getElementById("start-round-btn");
const progressEl = document.getElementById("progress");
const timerEl = document.getElementById("timer");
const gameScreen = document.getElementById("game-screen");
const roundOverScreen = document.getElementById("round-over-screen");
const finishedScreen = document.getElementById("finished-screen");

let deck = [];
let currentIndex = 0;
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

function renderCard() {
  const word = deck[currentIndex];
  cardWordRuEl.textContent = word.ru;
  cardWordEnEl.textContent = word.en;
  progressEl.textContent = `Слово ${currentIndex + 1} / ${deck.length}`;
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
  deck = shuffle(WORDS);
  currentIndex = 0;
  finishedScreen.classList.add("hidden");
  renderCard();
  startRound();
}

function showFinishedScreen() {
  clearInterval(timerId);
  gameScreen.classList.add("hidden");
  roundOverScreen.classList.add("hidden");
  finishedScreen.classList.remove("hidden");
}

nextBtn.addEventListener("click", () => {
  currentIndex += 1;
  if (currentIndex >= deck.length) {
    showFinishedScreen();
  } else {
    renderCard();
  }
});

startRoundBtn.addEventListener("click", startRound);
restartBtn.addEventListener("click", startDeck);

startDeck();
