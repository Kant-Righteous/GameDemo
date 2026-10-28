/**
 * Pure, UI-agnostic Whac-a-Mole game state and actions.
 *
 * Time is advanced explicitly with tick(), rather than using a timer here.
 * This keeps the game deterministic for callers and tests; a UI may call
 * tick once per second (or provide a measured elapsed duration).
 */

export const GRID_SIZE = 3;
export const HOLE_COUNT = GRID_SIZE * GRID_SIZE;
export const GAME_DURATION_SECONDS = 30;

export type GameState = "idle" | "running" | "ended";

export interface HoleState {
  readonly index: number;
  readonly hasMole: boolean;
}

export interface GameSnapshot {
  readonly state: GameState;
  readonly holes: readonly HoleState[];
  readonly score: number;
  readonly remainingTime: number;
}

export interface GameOptions {
  /**
   * Returns a value in [0, 1). Values outside that range are normalized.
   * Supplying this function makes mole placement deterministic in tests.
   */
  readonly random?: () => number;
  readonly durationSeconds?: number;
}

export interface GameController {
  readonly snapshot: GameSnapshot;
  start(): GameSnapshot;
  end(): GameSnapshot;
  restart(): GameSnapshot;
  tick(elapsedSeconds?: number): GameSnapshot;
  click(holeIndex: number): boolean;
  subscribe(listener: (snapshot: GameSnapshot) => void): () => void;
}

const createHoles = (moleIndex: number | null): readonly HoleState[] =>
  Array.from({ length: HOLE_COUNT }, (_, index) => ({
    index,
    hasMole: index === moleIndex
  }));

const clampRandom = (value: number): number => {
  if (!Number.isFinite(value)) return 0;
  return Math.min(0.999999999, Math.max(0, value));
};

const validDuration = (duration: number | undefined): number =>
  Number.isFinite(duration) && (duration as number) > 0
    ? (duration as number)
    : GAME_DURATION_SECONDS;

/**
 * Creates an independent game session. No global state or browser APIs are
 * used, so several sessions can coexist and the controller works in Node.
 */
export function createGame(options: GameOptions = {}): GameController {
  const random = options.random ?? Math.random;
  const duration = validDuration(options.durationSeconds);
  const listeners = new Set<(snapshot: GameSnapshot) => void>();
  let state: GameState = "idle";
  let score = 0;
  let remainingTime = duration;
  let moleIndex: number | null = null;

  const getSnapshot = (): GameSnapshot => ({
    state,
    holes: createHoles(moleIndex),
    score,
    remainingTime
  });

  const notify = (): GameSnapshot => {
    const next = getSnapshot();
    listeners.forEach((listener) => listener(next));
    return next;
  };

  const moveMole = (): void => {
    moleIndex = Math.floor(clampRandom(random()) * HOLE_COUNT);
  };

  const start = (): GameSnapshot => {
    state = "running";
    score = 0;
    remainingTime = duration;
    moveMole();
    return notify();
  };

  const end = (): GameSnapshot => {
    if (state !== "ended") {
      state = "ended";
      remainingTime = 0;
    }
    return notify();
  };

  const restart = (): GameSnapshot => start();

  const tick = (elapsedSeconds = 1): GameSnapshot => {
    if (state !== "running") return getSnapshot();
    if (!Number.isFinite(elapsedSeconds) || elapsedSeconds <= 0) {
      return getSnapshot();
    }

    remainingTime = Math.max(0, remainingTime - elapsedSeconds);
    if (remainingTime === 0) {
      state = "ended";
      moleIndex = null;
    } else {
      moveMole();
    }
    return notify();
  };

  const click = (holeIndex: number): boolean => {
    if (state !== "running" || holeIndex !== moleIndex) return false;
    score += 1;
    moveMole();
    notify();
    return true;
  };

  return {
    get snapshot() {
      return getSnapshot();
    },
    start,
    end,
    restart,
    tick,
    click,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
}
