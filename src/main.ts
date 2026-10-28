import "./style.css";
import { createGame, type GameSnapshot } from "./game";

type DiagnosticEntry = { timestamp?: string; level?: string; message: string; context?: unknown };

const $ = <T extends HTMLElement>(id: string) => {
  const element = document.getElementById(id) as T | null;
  if (!element) throw new Error(`Required UI element #${id} is missing`);
  return element;
};
const score = $("score"), timer = $("timer"), stateText = $("game-state");
const status = $("game-status"), error = $("ui-error"), grid = $("grid");
const debugToggle = $("debug-toggle") as HTMLInputElement, debugPanel = $("debug-panel");
const selectedElement = $("selected-element") as HTMLInputElement;
const description = $("problem-description") as HTMLTextAreaElement;
const diagnosticLog = $("diagnostic-log"), logCount = $("log-count");
const holes = [...document.querySelectorAll<HTMLButtonElement>(".hole")];
const entries: DiagnosticEntry[] = [];
let selected: HTMLElement | null = null;
let unsubscribe: (() => void) | void;

function showError(message: string) {
  error.textContent = message;
  error.hidden = false;
  addLog({ level: "error", message });
}
function addLog(entry: DiagnosticEntry) {
  entries.push({ timestamp: new Date().toISOString(), level: "info", ...entry });
  diagnosticLog.textContent = entries.map((item) =>
    `[${item.timestamp}] ${(item.level ?? "info").toUpperCase()} ${item.message}${item.context ? ` ${JSON.stringify(item.context)}` : ""}`,
  ).join("\n");
  logCount.textContent = `${entries.length} event${entries.length === 1 ? "" : "s"}`;
}
function render(snapshot: GameSnapshot) {
  score.textContent = String(snapshot.score);
  timer.textContent = String(Math.ceil(Math.max(0, snapshot.remainingTime)));
  stateText.textContent = snapshot.state === "running" ? "Find the mole!" : snapshot.state === "ended" ? "Time's up. Play again?" : "Ready when you are.";
  holes.forEach((hole, index) => {
    const hasMole = snapshot.state === "running" && snapshot.holes[index]?.hasMole;
    hole.classList.toggle("mole", hasMole);
    hole.setAttribute("aria-label", hasMole ? `Mole in hole ${index + 1}` : `Hole ${index + 1}`);
  });
}
function download(name: string, value: unknown) {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob); link.download = name; link.click();
  URL.revokeObjectURL(link.href);
}
function selectElement(target: HTMLElement) {
  selected = target.closest<HTMLElement>("[data-debug-label]") ?? target;
  selectedElement.value = selected.dataset.debugLabel ?? `${selected.tagName.toLowerCase()}#${selected.id || "(no id)"}`;
  addLog({ message: `Selected ${selectedElement.value}`, context: { tag: selected.tagName } });
}

document.querySelector("#debug-toggle")?.addEventListener("change", () => {
  document.body.classList.toggle("debug-active", debugToggle.checked);
  debugToggle.setAttribute("aria-checked", String(debugToggle.checked));
  debugPanel.hidden = !debugToggle.checked;
  addLog({ message: `Debug mode ${debugToggle.checked ? "enabled" : "disabled"}` });
});
grid.addEventListener("click", (event) => {
  if (debugToggle.checked) { event.preventDefault(); selectElement(event.target as HTMLElement); return; }
  const hole = (event.target as HTMLElement).closest<HTMLButtonElement>(".hole");
  if (!hole) return;
  const index = Number(hole.dataset.hole);
  try {
    if (game.click(index)) addLog({ message: "Mole hit", context: { hole: index } });
    hole.classList.add("hit"); setTimeout(() => hole.classList.remove("hit"), 250);
  }
  catch (cause) { showError(`Could not record hit: ${cause instanceof Error ? cause.message : String(cause)}`); }
});
document.addEventListener("click", (event) => {
  if (!debugToggle.checked) return;
  const target = event.target;
  if (!(target instanceof HTMLElement) || grid.contains(target)) return;
  const selectable = target.closest<HTMLElement>("[data-debug-label]");
  if (!selectable || debugPanel.contains(selectable)) return;
  event.preventDefault();
  event.stopPropagation();
  selectElement(selectable);
}, true);
document.querySelector("#start")?.addEventListener("click", () => { try { game.start(); addLog({ message: "Game started" }); } catch (cause) { showError(String(cause)); } });
document.querySelector("#end")?.addEventListener("click", () => { try { game.end(); addLog({ message: "Game ended" }); } catch (cause) { showError(String(cause)); } });
document.querySelector("#restart")?.addEventListener("click", () => { try { game.restart(); addLog({ message: "Game restarted" }); } catch (cause) { showError(String(cause)); } });
document.querySelector("#download-report")?.addEventListener("click", () => {
  if (!selected) { showError("Select an interface element before downloading a bug report."); return; }
  if (!description.value.trim()) { showError("Describe the problem before downloading a bug report."); return; }
  download("whack-a-mole-bug-report.json", { selectedElement: selectedElement.value, description: description.value.trim(), timestamp: new Date().toISOString(), context: { url: location.href, score: score.textContent, timeRemaining: timer.textContent, gameState: stateText.textContent } });
  addLog({ message: "Bug report exported" });
});
document.querySelector("#export-log")?.addEventListener("click", () => download("whack-a-mole-diagnostic-log.json", { exportedAt: new Date().toISOString(), entries }));

const game = createGame();
try {
  unsubscribe = game.subscribe((snapshot) => {
    render(snapshot);
    if (snapshot.state === "ended") addLog({ message: "Game ended", context: { score: snapshot.score } });
  });
  render(game.snapshot);
  status.textContent = "Game engine connected.";
  addLog({ message: "Game engine connected" });
} catch (cause) {
  showError(`Game engine subscription failed: ${cause instanceof Error ? cause.message : String(cause)}`);
}
const timerHandle = window.setInterval(() => game.tick(1), 1000);
window.addEventListener("beforeunload", () => {
  window.clearInterval(timerHandle);
  if (typeof unsubscribe === "function") unsubscribe();
});
