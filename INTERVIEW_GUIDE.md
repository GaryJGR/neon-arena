# Demo and technical discussion

## 30-second demo

1. Start a run, move and fire.
2. Let enemies approach, then dash through them.
3. Pause and explain the timer and cooldown.
4. Explain one implementation choice you understand.

## Understand before listing this project

- Movement: normalize the input vector so diagonal movement is not faster.
- Pursuit: subtract enemy position from player position and normalize the vector.
- Collision: circles overlap when center distance is smaller than the sum of radii.
- Timing: simulation advances in 1/120-second steps; rendering follows requestAnimationFrame.
- State: pause stops simulation updates while preserving the world.
- Performance: pairwise bullet/enemy collision costs O(B × E); a spatial grid could reduce candidate checks.
- Dash: movement changes temporarily, collisions destroy enemies, and a cooldown prevents continuous use.

## Honest introduction

“I put together a small browser gameplay prototype with AI coding assistance. I’m using it to learn input handling, collision detection, and game state management. I can walk you through the implementation and the changes I’ve personally made.”

## Before the event

- Play and test it yourself in the exact browser you will use.
- Make one change you understand, such as enemy tuning or dash cooldown.
- Record a short video as a backup.
- Confirm a public repository and demo link work while logged out.
- Do not claim AI-generated code as independently written work.
