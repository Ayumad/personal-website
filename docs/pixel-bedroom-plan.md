# GBA Pixel Bedroom Plan

## Summary

Shift the site away from a walkable 3D room, CSS furniture, and terminal-first
navigation. V1 should feel like an original Game Boy Advance-era top-down bedroom:
a small 240x160 tilemap, hard sprite outlines, a lived-in room, and clickable or
inspectable objects that reveal short pieces of Ayush's identity.

## Direction

- Render the room as a fixed-resolution canvas scene at 240x160, then scale it
  with nearest-neighbor filtering.
- Use hand-drawn tile and sprite routines in TypeScript for now, with original
  assets only. Do not import copyrighted game sprites.
- Compose the room on a 15x10 grid with 16x16 tiles, a top wall band, parquet
  floor, rug, player sprite, and furniture hitboxes.
- Prioritize the bedroom feeling authentic and lived in before rebuilding any
  terminal or full content browser.
- Keep every major object interactable through both direct click/tap and
  keyboard inspection.

## Room Objects

- Computer desk: home/projects/local AI and notes.
- Bass guitar: audio, bass, headphones, DACs, amps, and sound experiments.
- TV and game console: gaming, PCVR, handhelds, old tech, and performance tuning.
- Bed and nightstand: about, education, interests, and personal snapshot.
- Project poster wall: Owlbot, DeluluBot, audio visualization, homelab, and site.
- Mini server stack: homelab, Proxmox, self-hosting, dashboards, storage, local AI.
- Open notebook: Obsidian, RAG, notes, writing, and knowledge systems.
- Camera shelf: photography and future visual gallery.
- Now board: current focus and experiments.
- Gear shelf: PC, audio chain, cameras, software, and tools.
- Mail crate: contact, resume, GitHub, LinkedIn, and future links.
- AI-ush plant: teaser for a future assistant, with no chatbot backend in V1.

## Interaction Rules

- Arrow keys or WASD move the player on the tile grid.
- Z, Enter, or Space inspects the object the player is facing.
- Mouse or touch can inspect objects directly.
- Solid objects block movement; wall-mounted objects can still be inspected.
- The in-game dialogue box is drawn inside the canvas so it remains stylistically
  consistent with the room.
- URL hashes may update to the inspected section, but the visible UI remains the
  room for V1.

## V1 Boundaries

- No terminal surface for this pass.
- No CSS-rendered furniture, Three.js, WebGL, Blender assets, or 3D scene.
- No backend, auth, real chatbot, or external integrations.
- Contact and resume links remain placeholders until public URLs are confirmed.
