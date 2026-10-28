# GameDemo Product Specification

## Status

This document is the Source of Truth for the classroom MVP. The Product Owner
has approved implementation of the web game, its debug tooling, automated
quality checks, and CI pipeline.

The Product Owner owns this document. A request that conflicts with this
specification must be reported to the Product Owner for a decision before any
implementation or configuration change is made.

## Team

- **ScrumMaster**: understands product requests, maintains the task plan and
  project context, coordinates the team, and delegates bounded work.
- **GameDeveloper**: implements game rules, gameplay systems, and supporting
  code once a task is approved.
- **UIDebug**: owns UI, visualization, debug tooling, and bug-report evidence.
- **QA**: owns test strategy, test execution, log inspection, and CI/CD
  pipeline work.

## Technology and Collaboration Rules

- Use Vite, TypeScript, HTML, and CSS for the client application.
- Use Vitest for automated tests and GitHub Actions for CI.
- Do not add a backend or database.

1. ScrumMaster is the default entry point for multi-step work.
2. ScrumMaster must provide each specialist only the task, acceptance criteria,
   relevant paths, constraints, and necessary context.
3. Delegation is allowed only when the host exposes custom-agent discovery and
   subagent invocation. Configuration files alone do not prove that runtime
   collaboration is available.
4. If custom agents or subagent invocation are unavailable, ScrumMaster must
   state that limitation and must not claim that delegation occurred.
5. Before delegating or implementing, ScrumMaster checks this specification
   and identifies any conflict for Product Owner review.
6. Specialists return concise findings, changed paths, validation performed,
   and unresolved risks to ScrumMaster.

## Product Scope

### Gameplay

- The game presents a 3x3 grid of holes.
- A mole appears at a random hole and moves during play.
- Clicking the visible mole increases the score by one and records a
  successful hit.
- Each game lasts 30 seconds and displays a visible countdown.
- The player can start, end, and restart a game.
- Game state includes at least idle, running, and ended states; controls and
  score remain consistent with the current state.

### User Interface and Debugging

- The interface is modern, responsive, keyboard-accessible, and clearly shows
  title, score, timer, grid, and game controls.
- The mole has a recognizable visual treatment and a simple appearance/hit
  animation.
- A Debug Mode switch exposes element-selection tooling without affecting
  normal gameplay.
- In Debug Mode, the user can select an interface element, enter a problem
  description, and generate/download a JSON bug report containing the selected
  element, description, and useful timestamp/context.

### Quality and Diagnostics

- Meaningful game events and errors are logged in an in-app diagnostic log.
- The user can view and export the diagnostic log.
- Vitest covers core state transitions, scoring, timer/end behavior, and
  relevant report/log serialization.
- GitHub Actions installs dependencies, runs tests, and runs the production
  build on supported pushes and pull requests.

## Integration Boundaries

- GameDeveloper owns gameplay state and pure game logic modules.
- UIDebug owns application markup, styling, interaction wiring, and debug
  report UI; it consumes the gameplay and diagnostics interfaces.
- QA owns tests, diagnostics/logging support where needed for observability,
  and CI configuration.
- No two agents may edit the same file concurrently. ScrumMaster integrates
  and resolves any boundary issues.

## Acceptance Criteria

- `npm install`, `npm test`, and `npm run build` succeed.
- The game can be started locally with `npm run dev -- --host 0.0.0.0`.
- A complete 30-second play cycle works, including scoring and restart.
- Debug report and log export produce valid downloadable JSON.
- CI runs the same test and build checks as local development.
