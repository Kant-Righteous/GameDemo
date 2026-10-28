# GameDemo

## Whack-a-Mole

GameDemo is a Vite + TypeScript Whac-a-Mole classroom MVP. Start a 30-second
round, click the mole in the 3x3 grid to score, and use Debug Mode to select
an interface element, export a JSON bug report, or export the in-app log.

### Technology

- Vite and TypeScript
- HTML and CSS
- Vitest
- GitHub Actions

There is no backend or database. Gameplay state is kept in the browser.

### Development

```bash
npm install
npm test
npm run build
npm run dev -- --host 0.0.0.0
```

In Codespaces, run the development command above, open the **Ports** panel,
and select the forwarded port `5173` (or use **Open in Browser**) to preview
the game.

### Debug tools

Enable **Debug Mode** in the top-right corner, then click an outlined game
element to select it. Enter a problem description and choose **Download bug
report** to save a JSON report containing the selected element, description,
timestamp, and current game context. **Export log** downloads the in-app
diagnostic events as JSON.
