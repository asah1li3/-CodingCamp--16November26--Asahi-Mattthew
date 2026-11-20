# Project: To-Do Dashboard

## Stack
- HTML, CSS, Vanilla JavaScript — no frameworks, no build step
- All data stored in browser localStorage (no backend)

## Structure
```
index.html          # entry point
css/style.css       # all styles (single file rule)
js/app.js           # all logic  (single file rule)
.kiro/steering/     # Kiro workspace configuration
```

## Features
- Live clock and time-based greeting with custom name
- 25-minute Pomodoro focus timer (custom duration supported)
- To-do list: add, edit, check off, delete — persisted in localStorage
- Quick links: add label + URL, opens in new tab — persisted in localStorage
- Light / dark mode toggle — preference persisted in localStorage

## Coding conventions
- No external libraries or CDN imports
- CSS custom properties (variables) for all theme colours
- JavaScript: plain ES6+, no classes required, keep functions small and named
- localStorage keys: `todos`, `quickLinks`, `userName`, `theme`, `timerDuration`
