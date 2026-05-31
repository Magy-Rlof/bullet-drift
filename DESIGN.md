# Bullet Drift Design Notes

## Product Type

Browser game / interactive toy.

## Scene

A player uses this in short breaks on a laptop or phone, likely in mixed ambient light, expecting fast feedback and no setup.

## Visual Direction

- Compact arcade command surface.
- Dark high-contrast playfield with saturated coral, mint, and electric cyan accents.
- Functional HUD, no landing-page hero.
- Motion should communicate danger and momentum, not decorate static content.

## Interface Principles

- First screen is playable.
- Controls remain visible but not verbose.
- Important state uses shape, color, and text together.
- Desktop and mobile layouts keep the arena stable and avoid text overlap.

## Core States

- Ready: title, short objective, start action, high score.
- Running: arena, player, bullets, live score, survival time, pressure.
- Failed: final score, high score, restart action.
