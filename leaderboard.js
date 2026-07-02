const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1UptRuYCjkSd465dHAGAnWBakxaDkA9eqF3KQ1IBNGeQ/gviz/tq?tqx=out:json";
const GAME_LABELS = ["Quiz", "True or False", "Charades"];
const TOTAL_LABEL = "TOTAL";

const loadingScreen = document.getElementById("leaderboard-loading");
const errorScreen = document.getElementById("leaderboard-error");
const contentScreen = document.getElementById("leaderboard-content");
const rankListEl = document.getElementById("rank-list");
const chartCanvas = document.getElementById("breakdown-chart");
const chartContainer = document.querySelector(".chart-container");
const lastUpdatedEl = document.getElementById("last-updated");
const refreshBtn = document.getElementById("refresh-btn");
const retryBtn = document.getElementById("retry-btn");

let chartInstance = null;

function parseGvizResponse(text) {
  const start = text.indexOf("(");
  const end = text.lastIndexOf(")");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("Unexpected gviz response format");
  }
  return JSON.parse(text.slice(start + 1, end));
}

function extractStandings(parsed) {
  if (!parsed || parsed.status !== "ok") {
    throw new Error("gviz response status is not ok");
  }
  const cols = parsed.table.cols;
  const rows = parsed.table.rows;

  const gameIndexes = GAME_LABELS.map((label) => {
    const idx = cols.findIndex((c) => c.label === label);
    if (idx === -1) {
      throw new Error(`Missing expected column: ${label}`);
    }
    return idx;
  });
  const totalIndex = cols.findIndex((c) => c.label === TOTAL_LABEL);

  return rows.map((row) => {
    const cells = row.c;
    const name = cells[0] && cells[0].v != null ? cells[0].v : "";
    const scores = gameIndexes.map((idx) => {
      const cell = cells[idx];
      return cell && cell.v != null ? cell.v : 0;
    });
    const computedTotal = scores.reduce((sum, v) => sum + v, 0);
    const totalCell = totalIndex >= 0 ? cells[totalIndex] : null;
    const total = totalCell && totalCell.v != null ? totalCell.v : computedTotal;

    return {
      name,
      quiz: scores[0],
      trueFalse: scores[1],
      charades: scores[2],
      total,
    };
  });
}

function rankStandings(players) {
  const sorted = players.slice().sort((a, b) => b.total - a.total);
  let rank = 0;
  let previousTotal = null;
  return sorted.map((player, i) => {
    if (player.total !== previousTotal) {
      rank = i + 1;
      previousTotal = player.total;
    }
    return { ...player, rank };
  });
}

function renderRankList(rankedPlayers) {
  rankListEl.innerHTML = "";
  rankedPlayers.forEach((player) => {
    const li = document.createElement("li");
    li.className = `rank-item rank-${player.rank}`;

    const badge = document.createElement("span");
    badge.className = "rank-badge";
    badge.textContent = player.rank;

    const name = document.createElement("span");
    name.className = "rank-name";
    name.textContent = player.name;

    const total = document.createElement("span");
    total.className = "rank-total";
    total.textContent = player.total;

    li.append(badge, name, total);
    rankListEl.appendChild(li);
  });
}

function renderChart(players) {
  if (chartInstance) {
    chartInstance.destroy();
  }

  const styles = getComputedStyle(document.documentElement);
  const pink = styles.getPropertyValue("--pink").trim();
  const gold = styles.getPropertyValue("--gold").trim();
  const pinkDeep = styles.getPropertyValue("--pink-deep").trim();

  chartContainer.style.height = `${Math.max(320, players.length * 55)}px`;

  chartInstance = new Chart(chartCanvas, {
    type: "bar",
    data: {
      labels: players.map((p) => p.name),
      datasets: [
        { label: "Quiz", data: players.map((p) => p.quiz), backgroundColor: pink },
        { label: "True or False", data: players.map((p) => p.trueFalse), backgroundColor: gold },
        { label: "Charades", data: players.map((p) => p.charades), backgroundColor: pinkDeep },
      ],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { beginAtZero: true, ticks: { precision: 0 } },
      },
      plugins: {
        legend: { position: "bottom" },
      },
    },
  });
}

function showState(state) {
  loadingScreen.classList.toggle("hidden", state !== "loading");
  errorScreen.classList.toggle("hidden", state !== "error");
  contentScreen.classList.toggle("hidden", state !== "content");
}

function updateTimestamp() {
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  lastUpdatedEl.textContent = `Обновлено в ${time} / Updated at ${time}`;
}

async function fetchStandings() {
  showState("loading");
  try {
    const res = await fetch(SHEET_URL, { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const text = await res.text();
    const parsed = parseGvizResponse(text);
    const players = extractStandings(parsed);
    const ranked = rankStandings(players);
    renderRankList(ranked);
    renderChart(ranked);
    updateTimestamp();
    showState("content");
  } catch (err) {
    console.error("Leaderboard fetch failed:", err);
    showState("error");
  }
}

refreshBtn.addEventListener("click", fetchStandings);
retryBtn.addEventListener("click", fetchStandings);

fetchStandings();
