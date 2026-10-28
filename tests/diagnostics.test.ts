import { describe, expect, it } from "vitest";
import {
  DiagnosticLog,
  serializeBugReport,
  serializeDiagnosticLog
} from "../src/qa/diagnostics";

describe("diagnostic and report serialization", () => {
  it("records immutable snapshots and exports valid JSON", () => {
    const log = new DiagnosticLog();
    log.record("info", "game started", { state: "running" }, "2026-01-01T00:00:00.000Z");
    const snapshot = log.snapshot();
    snapshot[0].context!.state = "changed";
    expect(log.snapshot()[0].context?.state).toBe("running");
    expect(JSON.parse(log.serialize())).toEqual([
      {
        level: "info",
        message: "game started",
        timestamp: "2026-01-01T00:00:00.000Z",
        context: { state: "running" }
      }
    ]);
  });

  it("serializes supplied entries and validates bug report essentials", () => {
    const entries = [{ level: "error" as const, message: "boom", timestamp: "now" }];
    expect(JSON.parse(serializeDiagnosticLog(entries))).toEqual(entries);
    const report = {
      selectedElement: "#score",
      description: "Score is not visible",
      timestamp: "2026-01-01T00:00:00.000Z",
      context: { state: "ended" }
    };
    expect(JSON.parse(serializeBugReport(report))).toEqual(report);
    expect(() => serializeBugReport({ ...report, description: " " })).toThrow(
      "description"
    );
  });
});
