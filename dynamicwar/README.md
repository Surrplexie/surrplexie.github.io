# Dynamic War

Play at **[surrplexie.github.io/dynamicwar/](https://surrplexie.github.io/dynamicwar/)**.

An offline, bots-first strategy prototype built with plain HTML, CSS, JavaScript, and Canvas. Three AI factions hold, probe, then fight, creating soft front lines from unit vision instead of capturing fixed provinces.

## Run locally

From the repository root:

```powershell
python -m http.server 8080
```

Open `http://127.0.0.1:8080/dynamicwar/`. The demo needs a local server because browsers block `fetch()` for local `file://` URLs, but it makes no internet requests once served.

## Controls

- **Start war / Pause / Reset** control the simulation.
- **1× / 2× / 4×** changes simulation speed.
- Set a numeric **seed** before resetting for a repeatable run. The seed is also stored in the URL.
- Drag the map to pan, use the mouse wheel to zoom, and click a unit to follow it.

## Architecture

- `js/map.js` projects the bundled geographic data and supplies the land mask.
- `js/engine.js` owns deterministic fixed-timestep state.
- `js/relations.js` tracks hold / tense / war between factions.
- `js/units.js` handles spacing, movement, and local attrition combat.
- `js/bots.js` holds standoff lines, probes under tension, and only charges in war.
- `js/influence.js` stamps vision-based control into a low-resolution field with delayed ownership changes.
- `js/render.js` composites the cached map, interpolated influence, units, and minimap.
- `js/app.js` wires controls, camera input, and the animation loop.

The first map is a compact Benelux/southern North Sea extract. The map adapter, bounding box, and world dimensions are configuration-driven so later versions can load regional chunks or a global vector-tile pyramid without changing the bot and influence systems.

## Data and license

The bundled `data/benelux.geojson` is a heavily simplified offline cartographic extract based on OpenStreetMap geography.

Map data © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright), available under the Open Database License (ODbL) 1.0. The required attribution is shown in the demo.

## Demo limits

This prototype intentionally omits player orders, economy, logistics, equipment, diplomacy, multiplayer, and detailed terrain costs. Combat is simple proximity attrition. Borders represent current military influence, not legal national boundaries.
