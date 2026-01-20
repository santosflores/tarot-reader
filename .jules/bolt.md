# Bolt's Journal

## 2024-05-23 - Memory Allocation in Audio Loops
**Learning:** High-frequency loops (like audio analysis in `useFrame` or `scriptProcessor`) that create new objects/arrays every frame cause significant GC pressure and performance drops.
**Action:** Use object pooling and in-place array modification for audio analysis buffers instead of `map` / `filter` / `spread`.

## 2024-05-24 - Idle State Short-Circuiting in useFrame
**Learning:** `useFrame` loops that drive animations (like blinking) often continue to run calculation logic even when the animation is settled (e.g., eyes fully open), causing unnecessary CPU usage and potential Three.js overhead.
**Action:** Track a "settled" state ref (e.g., `isIdle`) and return early from `useFrame` callbacks to skip all processing when no updates are needed.
