# Bolt's Journal

## 2024-05-23 - Memory Allocation in Audio Loops
**Learning:** High-frequency loops (like audio analysis in `useFrame` or `scriptProcessor`) that create new objects/arrays every frame cause significant GC pressure and performance drops.
**Action:** Use object pooling and in-place array modification for audio analysis buffers instead of `map` / `filter` / `spread`.
