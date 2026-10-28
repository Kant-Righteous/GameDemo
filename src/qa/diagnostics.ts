/**
 * UI-agnostic diagnostics boundary. The UI can consume this without taking a
 * dependency on storage or DOM APIs.
 */
export type DiagnosticLevel = "info" | "warn" | "error";

export interface DiagnosticEntry {
  level: DiagnosticLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

export interface BugReport {
  selectedElement: string;
  description: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

export class DiagnosticLog {
  private readonly entries: DiagnosticEntry[] = [];

  record(
    level: DiagnosticLevel,
    message: string,
    context?: Record<string, unknown>,
    timestamp = new Date().toISOString()
  ): DiagnosticEntry {
    const entry: DiagnosticEntry = { level, message, timestamp };
    if (context !== undefined) entry.context = { ...context };
    this.entries.push(entry);
    return { ...entry, context: entry.context && { ...entry.context } };
  }

  snapshot(): DiagnosticEntry[] {
    return this.entries.map((entry) => ({
      ...entry,
      context: entry.context && { ...entry.context }
    }));
  }

  serialize(): string {
    return serializeDiagnosticLog(this.entries);
  }
}

export function serializeDiagnosticLog(entries: readonly DiagnosticEntry[]): string {
  return JSON.stringify(entries, null, 2);
}

export function serializeBugReport(report: BugReport): string {
  if (!report.selectedElement.trim()) {
    throw new Error("Bug report requires a selected element");
  }
  if (!report.description.trim()) {
    throw new Error("Bug report requires a description");
  }
  return JSON.stringify(report, null, 2);
}
