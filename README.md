# Headliner

A festival management game inside a living music industry. Built with React,
TypeScript, Tauri 2, Rust and SQLite.

## Play the first festival

1. Create a world in **My Festival**.
2. Choose your festival name, site and musical identity.
3. Start a normal edition or the labelled **Backstage crisis** challenge.
4. Book up to three acts within your budget.
5. Advance weeks, follow the news and respond if a booking is threatened.
6. Read the attendance, financial and reputation results after opening.

Manual saves and a separate autosave preserve the world, storylines and decisions.
See [First festival](docs/FIRST_FESTIVAL.md) and
[Saving and news](docs/PERSISTENT_WORLD_AND_NEWS.md).

## Develop

Use Node 22 or newer. For the Windows app, install Rust and the Windows C++
build tools required by Tauri.

```sh
npm ci
npm run tauri dev
```

The browser preview uses separate localStorage saves:

```sh
npm run dev
```

Checks:

```sh
npm test
python -m unittest discover -s tests -p "*_test.py"
npm run build
```

The Windows game build workflow validates the native app and uploads an NSIS
installer artifact. Android packaging and device testing are still pending.

The Simulation Lab remains available for inspecting and fast-forwarding the
world. The broader design is recorded in the [Design Bible](docs/HEADLINER_DESIGN_BIBLE_V1.md).
