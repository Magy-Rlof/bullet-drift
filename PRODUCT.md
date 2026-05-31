# Bullet Drift Product Brief

## Goal

Build a small personal browser game where the player survives incoming bullet patterns, earns score over time, loses on collision, and can restart immediately.

## MVP Scope

- Static web page that can run without a backend.
- Canvas-based dodge gameplay.
- Keyboard movement on desktop.
- Pointer and touch movement for mobile.
- Survival score, elapsed time, current wave pressure, and local high score.
- Failure state with final score and restart.
- Chinese / English language switch with local preference.
- Staged difficulty curve: small blue bullets first, then large blue bullets, then red bullets, then red arc patterns.
- Pause and resume without resetting the active run.
- Collectible power-up balls: clear bullets, temporary shield, and enemy slowdown.
- Timed power-up effects show a compact numeric countdown that follows the player.

## Out Of Scope For First Version

- Accounts, online leaderboard, server storage, monetization, story mode, unlock systems, and custom level editor.

## Acceptance Criteria

- Opening `index.html` shows a playable first screen.
- Starting the game spawns hazards within 1 second.
- Player movement visibly responds to keyboard and pointer/touch input.
- Score increases while alive and stops when defeated.
- Collision with a bullet changes the game to a failed state.
- Restart resets the run without reloading the page.
- Highest score persists with `localStorage`.
- Language choice switches all visible UI copy between Chinese and English and persists with `localStorage`.
- During a run, `P`, `Esc`, or the top action button pauses the game; resume continues from the same score, timer, player position, and bullet layout.
- Power-up balls spawn during play and trigger their effect when the player touches them; the HUD shows the active or upcoming power state.
- The side panel explains each power-up type so players can learn the symbols without guessing.
