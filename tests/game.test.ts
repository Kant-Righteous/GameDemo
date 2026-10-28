import { describe, expect, it } from "vitest";
import {
  GAME_DURATION_SECONDS,
  HOLE_COUNT,
  createGame
} from "../src/game";

describe("gameplay state contract", () => {
  it("starts idle, enters running, and ends after 30 seconds", () => {
    const game = createGame({ random: () => 0 });
    expect(game.snapshot).toMatchObject({
      state: "idle",
      score: 0,
      remainingTime: GAME_DURATION_SECONDS
    });

    game.start();
    expect(game.snapshot.state).toBe("running");
    for (let second = 0; second < GAME_DURATION_SECONDS; second += 1) {
      game.tick();
    }
    expect(game.snapshot).toMatchObject({ state: "ended", remainingTime: 0 });
    expect(game.snapshot.holes.every((hole) => !hole.hasMole)).toBe(true);
  });

  it("scores the visible mole once and rejects misses or inactive clicks", () => {
    const game = createGame({ random: () => 0 });
    expect(game.click(0)).toBe(false);
    game.start();
    expect(game.snapshot.holes).toHaveLength(HOLE_COUNT);
    expect(game.click(1)).toBe(false);
    expect(game.click(0)).toBe(true);
    expect(game.snapshot.score).toBe(1);
    game.end();
    expect(game.click(0)).toBe(false);
    expect(game.snapshot.score).toBe(1);
  });

  it("restarts with a fresh running session and score", () => {
    const game = createGame({ random: () => 0.5 });
    game.start();
    game.click(4);
    game.tick(5);
    game.restart();
    expect(game.snapshot).toMatchObject({
      state: "running",
      score: 0,
      remainingTime: GAME_DURATION_SECONDS
    });
  });

  it("notifies subscribers with state changes and supports unsubscribe", () => {
    const game = createGame({ random: () => 0 });
    const states: string[] = [];
    const unsubscribe = game.subscribe((snapshot) => states.push(snapshot.state));
    game.start();
    game.end();
    unsubscribe();
    game.restart();
    expect(states).toEqual(["running", "ended"]);
  });
});
