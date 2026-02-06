const STORAGE_KEY = "ledgerline-data";
const defaultState = {
  monthlyGoal: 160,
  days: [
    {
      date: new Date().toISOString().slice(0, 10),
      entries: [
        {
          id: crypto.randomUUID(),
          matter: "",
          detail: "",
          start: "",
          end: "",
          running: false,
        },
      ],
    },
  ],
};

const state = loadState();
let activeDayId = state.days[0].date;
let timerInterval = null;

const dayTabs = document.getElementById("dayTabs");
const entriesContainer = document.getElementById("entriesContainer");
const dayTotal = document.getElementById("dayTotal");
const activeTimers = document.getElementById("activeTimers");
const matterCount = document.getElementById("matterCount");
const matterBreakdown = document.getElementById("matterBreakdown");
const goalHours = document.getElementById("goalHours");
const goalInput = document.getElementById("goalInput");
const loggedHours = document.getElementById("loggedHours");
const remainingHours = document.getElementById("remainingHours");
const dailyPace = document.getElementById("dailyPace");
const topMatters = document.getElementById("topMatters");
const weeklyPace = document.getElementById("weeklyPace");
const lastEntry = document.getElementById("lastEntry");

function loadState() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return structuredClone(defaultState);
  }
  try {
    return JSON.parse(stored);
  } catch (error) {
    console.warn("Failed to load saved state", error);
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function formatDateLabel(value) {
  const date = new Date(value + "T00:00:00");
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    weekday: "short",
  });
}

function formatHours(value) {
  return `${value.toFixed(1)} hrs`;
}

function parseTimeToMinutes(time) {
  if (!time) return null;
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToHours(minutes) {
  return minutes / 60;
}

function calculateEntryMinutes(entry) {
  const startMinutes = parseTimeToMinutes(entry.start);
  const endMinutes = parseTimeToMinutes(entry.end);
  if (startMinutes === null || endMinutes === null) return 0;
  const diff = endMinutes - startMinutes;
  return diff > 0 ? diff : 0;
}

function getActiveDay() {
  return state.days.find((day) => day.date === activeDayId) ?? state.days[0];
}

function addDay() {
  const today = new Date();
  const newDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  while (state.days.find((day) => day.date === newDate.toISOString().slice(0, 10))) {
    newDate.setDate(newDate.getDate() + 1);
  }
  const dateString = newDate.toISOString().slice(0, 10);
  state.days.unshift({
    date: dateString,
    entries: [
      {
        id: crypto.randomUUID(),
        matter: "",
        detail: "",
        start: "",
        end: "",
        running: false,
      },
    ],
  });
  activeDayId = dateString;
  saveState();
  render();
}

function addEntry(day) {
  day.entries.push({
    id: crypto.randomUUID(),
    matter: "",
    detail: "",
    start: "",
    end: "",
    running: false,
  });
  saveState();
  render();
}

function removeEntry(day, entryId) {
  day.entries = day.entries.filter((entry) => entry.id !== entryId);
  if (day.entries.length === 0) {
    addEntry(day);
  }
  saveState();
  render();
}

function updateEntry(day, entryId, updates) {
  const entry = day.entries.find((item) => item.id === entryId);
  if (!entry) return;
  Object.assign(entry, updates);
  saveState();
  render();
}

function toggleTimer(day, entry) {
  if (entry.running) {
    entry.running = false;
    entry.end = new Date().toTimeString().slice(0, 5);
  } else {
    day.entries.forEach((item) => {
      if (item.running) {
        item.running = false;
        item.end = new Date().toTimeString().slice(0, 5);
      }
    });
    entry.running = true;
    entry.start = new Date().toTimeString().slice(0, 5);
    entry.end = "";
  }
  saveState();
  render();
}

function ensureTimerInterval() {
  if (timerInterval) return;
  timerInterval = window.setInterval(() => {
    if (!state.days.some((day) => day.entries.some((entry) => entry.running))) {
      clearInterval(timerInterval);
      timerInterval = null;
      return;
    }
    render(false);
  }, 30000);
}

function computeDaySummary(day) {
  const totals = new Map();
  let minutesTotal = 0;
  let activeCount = 0;

  day.entries.forEach((entry) => {
    if (entry.running) activeCount += 1;
    const minutes = calculateEntryMinutes(entry);
    minutesTotal += minutes;
    if (entry.matter) {
      const current = totals.get(entry.matter) ?? 0;
      totals.set(entry.matter, current + minutes);
    }
  });

  return {
    minutesTotal,
    activeCount,
    totals,
  };
}

function computeMonthlyTotals() {
  const totals = new Map();
  let minutesTotal = 0;
  let latestEntry = null;

  state.days.forEach((day) => {
    day.entries.forEach((entry) => {
      const minutes = calculateEntryMinutes(entry);
      if (minutes > 0) {
        minutesTotal += minutes;
        if (entry.matter) {
          const current = totals.get(entry.matter) ?? 0;
          totals.set(entry.matter, current + minutes);
        }
      }
      if (entry.end && entry.matter) {
        const timestamp = new Date(`${day.date}T${entry.end}:00`);
        if (!latestEntry || timestamp > latestEntry.time) {
          latestEntry = {
            matter: entry.matter,
            detail: entry.detail,
            time: timestamp,
          };
        }
      }
    });
  });

  return { totals, minutesTotal, latestEntry };
}

function updateGoalMetrics() {
  const { minutesTotal } = computeMonthlyTotals();
  const logged = minutesToHours(minutesTotal);
  const remaining = Math.max(state.monthlyGoal - logged, 0);

  const now = new Date();
  const totalDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysRemaining = Math.max(totalDays - now.getDate(), 0);
  const pace = daysRemaining === 0 ? remaining : remaining / daysRemaining;

  goalHours.textContent = state.monthlyGoal.toFixed(0);
  goalInput.value = state.monthlyGoal.toFixed(0);
  loggedHours.textContent = formatHours(logged);
  remainingHours.textContent = formatHours(remaining);
  dailyPace.textContent = formatHours(pace);
}

function renderTabs() {
  dayTabs.innerHTML = "";
  state.days.forEach((day) => {
    const button = document.createElement("button");
    button.className = "tab" + (day.date === activeDayId ? " active" : "");
    button.textContent = formatDateLabel(day.date);
    button.type = "button";
    button.addEventListener("click", () => {
      activeDayId = day.date;
      render();
    });
    dayTabs.appendChild(button);
  });
}

function renderEntries(day) {
  entriesContainer.innerHTML = "";
  day.entries.forEach((entry) => {
    const node = document.getElementById("entryTemplate").content.cloneNode(true);
    const matterInput = node.querySelector(".matter");
    const detailInput = node.querySelector(".detail");
    const startInput = node.querySelector(".start");
    const endInput = node.querySelector(".end");
    const durationLabel = node.querySelector(".duration");
    const timerButton = node.querySelector(".timer");
    const removeButton = node.querySelector(".remove");

    matterInput.value = entry.matter;
    detailInput.value = entry.detail;
    startInput.value = entry.start;
    endInput.value = entry.end;

    const minutes = calculateEntryMinutes(entry);
    durationLabel.textContent = `${minutesToHours(minutes).toFixed(1)}h`;

    timerButton.textContent = entry.running ? "Stop" : "Start";
    timerButton.classList.toggle("active", entry.running);

    matterInput.addEventListener("input", (event) => {
      updateEntry(day, entry.id, { matter: event.target.value });
    });
    detailInput.addEventListener("input", (event) => {
      updateEntry(day, entry.id, { detail: event.target.value });
    });
    startInput.addEventListener("input", (event) => {
      updateEntry(day, entry.id, { start: event.target.value, running: false });
    });
    endInput.addEventListener("input", (event) => {
      updateEntry(day, entry.id, { end: event.target.value, running: false });
    });

    timerButton.addEventListener("click", () => {
      toggleTimer(day, entry);
      ensureTimerInterval();
    });
    removeButton.addEventListener("click", () => removeEntry(day, entry.id));

    entriesContainer.appendChild(node);
  });

  const addButton = document.createElement("button");
  addButton.className = "secondary";
  addButton.type = "button";
  addButton.textContent = "+ Add entry";
  addButton.addEventListener("click", () => addEntry(day));
  entriesContainer.appendChild(addButton);
}

function renderSummary(day) {
  const { minutesTotal, activeCount, totals } = computeDaySummary(day);

  dayTotal.textContent = minutesToHours(minutesTotal).toFixed(1);
  activeTimers.textContent = activeCount;
  matterCount.textContent = totals.size;

  matterBreakdown.innerHTML = "";
  if (totals.size === 0) {
    matterBreakdown.innerHTML = "<p>No matters yet.</p>";
    return;
  }

  [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .forEach(([matter, minutes]) => {
      const span = document.createElement("span");
      span.innerHTML = `<span>${matter}</span><strong>${minutesToHours(minutes).toFixed(1)}h</strong>`;
      matterBreakdown.appendChild(span);
    });
}

function renderInsights() {
  const { totals, minutesTotal, latestEntry } = computeMonthlyTotals();

  const top = [...totals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  topMatters.innerHTML = "";
  if (top.length === 0) {
    topMatters.innerHTML = "<li>No logged matters yet.</li>";
  } else {
    top.forEach(([matter, minutes]) => {
      const item = document.createElement("li");
      item.innerHTML = `<span>${matter}</span><strong>${minutesToHours(minutes).toFixed(1)}h</strong>`;
      topMatters.appendChild(item);
    });
  }

  const weeksActive = new Set(state.days.filter((day) => day.entries.some((entry) => entry.start)).map((day) => {
    const date = new Date(day.date + "T00:00:00");
    const start = new Date(date.getFullYear(), 0, 1);
    const diff = Math.floor((date - start) / (24 * 60 * 60 * 1000));
    return Math.ceil((diff + start.getDay() + 1) / 7);
  })).size || 1;

  weeklyPace.textContent = `${minutesToHours(minutesTotal / weeksActive).toFixed(1)} hrs`;
  if (latestEntry) {
    lastEntry.textContent = `${latestEntry.matter} · ${latestEntry.time.toLocaleString()}`;
  } else {
    lastEntry.textContent = "No entries yet";
  }
}

function render(refreshEntries = true) {
  if (refreshEntries) {
    renderTabs();
    const day = getActiveDay();
    renderEntries(day);
  }
  renderSummary(getActiveDay());
  updateGoalMetrics();
  renderInsights();
}

function initialize() {
  render();
  document.getElementById("addDay").addEventListener("click", addDay);
  goalInput.addEventListener("input", (event) => {
    const value = Number(event.target.value);
    if (!Number.isNaN(value) && value > 0) {
      state.monthlyGoal = value;
      saveState();
      updateGoalMetrics();
    }
  });
}

initialize();
