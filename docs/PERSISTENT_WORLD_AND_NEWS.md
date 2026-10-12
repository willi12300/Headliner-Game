# Persistent world and weekly news

Generate a world in the Simulation Lab, then choose **Save World**. **Advance
Week** moves the living industry forward once, opens Industry News and writes a
separate autosave. The long-range lab checkpoints also autosave.

**Load Save** restores the manual slot; **Load Autosave** restores the last
successful time advance. Each button replaces only its own slot. Generating or
resetting a world leaves existing saves intact. Unsaved world changes and read
news are marked in the controls; save them before leaving. Replacing unsaved
changes asks for confirmation.

Installed Tauri apps store both slots in the local SQLite database, using schema
migration 5. Database setup runs automatically on save/load. Browser previews use
localStorage instead, separate from installed-app saves. Saves are local to that
installation; cloud sync and exporting saves are future work.

The versioned payload contains the complete world, RNG state, event history,
snapshots, unfinished story arcs and read-news IDs. Invalid or unsupported saves
are rejected before replacing the current world. Storage failures leave the open
world available and show an error so the player can retry.

Industry News presents existing simulation events with category/search/unread
filters, links to bands, older-story pagination and a panel for active disputes.
It reports recorded outcomes; it does not roll its own events. Rumours,
interviews, scouting uncertainty and additional storyline types still need simulation
systems before they can appear as news.

Validation:

- `npm test`: save round trips, unfinished stories, exact continuation after
  loading, multiple seeds over 20 years, invalid versions/fields/references and
  news classification.
- `python -m unittest discover -s tests -p '*_test.py'`: SQLite migrations,
  independent manual/autosave slots, replacement, reopening and integrity.
- `npm run build`: TypeScript and production frontend.

The development workspace also passed a browser smoke check for generation,
weekly advancement, saving/reloading, read state, failed loads and a 390px phone
viewport. Rust/Tauri compilation and Windows/Android device testing remain
unverified because this workspace has no Rust or Android toolchain.

The first playable festival and arrest cases are documented in [FIRST_FESTIVAL.md](FIRST_FESTIVAL.md). Version-1 saves migrate in memory to version 2 without changing their history or RNG state; future weeks use simulation version 0.0.4.
