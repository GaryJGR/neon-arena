# Neon Arena

A small, offline browser survival game: evade pursuing robots, shoot to clear a path, and dash through enemies. Survive for 60 seconds to win.

## Run on macOS

No dependencies or build step. In this directory:

```sh
python3 -m http.server 8000
```

Open http://localhost:8000 in Chrome or Safari. A local server is required for the JavaScript module. To publish on GitHub Pages, serve these files from the repository root.

## Controls

| Action | Input |
|---|---|
| Move | WASD or arrow keys |
| Aim | Mouse |
| Fire | Hold left mouse button |
| Dash | Space (2.4-second cooldown) |
| Pause / resume | P or Escape |

## Implementation

- JavaScript and Canvas 2D; procedural graphics, no external assets.
- A fixed 120 Hz simulation with capped elapsed frame time.
- Normalized directional movement and distance-based pursuit AI.
- Circle collision tests for bullets, enemies, and player.
- Gameplay states: ready, playing, paused, won, lost.
- Time-based spawning, two enemy variants, hit particles, and brief damage immunity.
- Local best elimination count stored in localStorage, with a fallback when storage is unavailable.
- Automatic pause when the window loses focus.

## Source map

- `index.html`: page structure and HUD.
- `style.css`: responsive interface.
- `game.js`: input, simulation, collisions, state transitions, rendering.

## Scope and limitations

Desktop keyboard and mouse only. Collision checks are linear per bullet/enemy pair; this is suitable for the small arena, not a large-scale simulation. No audio, multiplayer, mobile controls, or engine integration. Possible next steps: enemy separation, spatial partitioning, configurable tuning, and an engine port.

## Development transparency

This prototype was developed with AI coding assistance. Anyone presenting it should be able to explain the implementation and distinguish their own decisions, modifications, and testing from generated code. It is a new prototype, not evidence of professional engine or C++ game development experience.
