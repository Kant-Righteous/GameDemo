# GameDemo Agent Team Rules

These rules apply to every agent working in this repository. Read
[`SPEC.md`](./SPEC.md) before acting; it is the Source of Truth.

## Product and Scope

- Treat the Product Owner as the authority for product decisions.
- If a request conflicts with [`SPEC.md`](./SPEC.md), stop before changing
  files and ask the Product Owner to resolve the conflict.
- Do not start game development, UI implementation, debugging-tool work,
  testing infrastructure, or CI/CD work unless the Product Owner has approved
  that scope.
- Preserve unrelated work in the working tree.

## Context and Delegation

- Share only the minimum context needed to complete a task: objective,
  acceptance criteria, relevant paths, constraints, and validation command.
- ScrumMaster is the coordinator and the only team role configured to
  delegate to other custom agents.
- A custom-agent file is configuration, not proof that the host supports
  custom-agent discovery or subagent invocation. Report unsupported runtime
  capabilities explicitly.
- Specialists must not silently broaden scope or delegate further.

## Engineering Practice

- Inspect existing files before editing and make precise, focused changes.
- Follow repository conventions and preserve type safety and existing behavior.
- Surface errors explicitly; do not hide failures behind silent fallbacks.
- Validate changes with the smallest relevant existing check.
- Report changed files, validation results, assumptions, and unresolved risks.

## Handoff Format

Every delegated result should include:

1. Summary of work or findings.
2. Files changed or inspected.
3. Validation performed and its result.
4. Open questions, risks, or Product Owner decisions required.
