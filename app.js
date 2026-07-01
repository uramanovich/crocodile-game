const cardEl = document.getElementById("card");
const cardFrontEl = document.getElementById("card-front-word");
const cardBackEl = document.getElementById("card-back-word");
const nextBtn = document.getElementById("next-btn");
const restartBtn = document.getElementById("restart-btn");
const progressEl = document.getElementById("progress");
const gameScreen = document.getElementById("game-screen");
const finishedScreen = document.getElementById("finished-screen");

let deck = [];
let currentIndex = 0;

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
  cardFrontEl.textContent = word.ru;
  cardBackEl.textContent = word.en;
  cardEl.classList.remove("flipped");
  progressEl.textContent = `Слово ${currentIndex + 1} / ${deck.length}`;
}

function startDeck() {
  deck = shuffle(WORDS);
  currentIndex = 0;
  gameScreen.classList.remove("hidden");
  finishedScreen.classList.add("hidden");
  renderCard();
}

function showFinishedScreen() {
  gameScreen.classList.add("hidden");
  finishedScreen.classList.remove("hidden");
}

cardEl.addEventListener("click", () => {
  cardEl.classList.toggle("flipped");
});

nextBtn.addEventListener("click", () => {
  currentIndex += 1;
  if (currentIndex >= deck.length) {
    showFinishedScreen();
  } else {
    renderCard();
  }
});

restartBtn.addEventListener("click", startDeck);

startDeck();
