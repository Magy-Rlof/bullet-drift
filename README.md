# Bullet Drift

A small static Canvas game about dodging bullet patterns and surviving for a high score.

## Run

Open `index.html` in a browser, or serve this folder with any static file server.

For local testing with Node:

```bash
node server.mjs
```

Then open `http://127.0.0.1:4173`.

## Controls

- Move: `WASD` or arrow keys
- Start / restart: `Space` or the on-screen button
- Pause / resume: `P`, `Esc`, or the on-screen button
- Touch or pointer: drag inside the arena

## Power-Ups

- `C`: clears hostile bullets from the arena
- `S`: grants a short shield
- `L`: slows hostile bullets for a short window

Timed effects show a compact numeric countdown near the player while active.

## Language

Use the `EN` / `中文` switch in the top bar. The game remembers the last selected language in this browser.
