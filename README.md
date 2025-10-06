# FindMons (Pokefind)
Find a Pokémon based on moves, abilities, and category filters. The app loads Pokémon data (Generations 1–9) from the public PokeAPI and lets you interactively filter and sort results right in your browser.

- Live, client-side app
- No build step or backend required
- Written in JavaScript, HTML, and CSS

> Data source: [PokeAPI](https://pokeapi.co/)

---

## Table of contents
- [Features](#features)
- [How it works](#how-it-works)
- [Getting started](#getting-started)
- [Usage](#usage)
- [Project structure](#project-structure)
- [Data, performance, and limits](#data-performance-and-limits)
- [Accessibility and mobile](#accessibility-and-mobile)
- [Acknowledgements](#acknowledgements)

---

## Features
- Ability filter
  - Type to search abilities with autocomplete; select exactly one ability to filter by
- Move filters (up to 4)
  - Four independent move-search inputs with autocomplete
  - Combine any subset of the four; each selected move must be learnable by the Pokémon
- Move category filters
  - Quick checkboxes for move “categories” (e.g., OHKO, recoil, draining, binding, priority, weather, terrain, status effects, stat stages, switching, hazards, protection, etc.)
  - A Pokémon matches when it has at least one move within each selected category set
- Fast, interactive results table
  - Columns: Sprite, Name, Type(s), HP, ATK, DEF, Sp.ATK, Sp.DEF, SPD, and BST (Base Stat Total)
  - Sort by any stat or by name; toggles ascending/descending
  - Progressive rendering with infinite scroll for smooth UX
- Clear all filters button
- Mobile-friendly layout with a compact filter toggle
- Error and loading states

---

## How it works
- Data loading
  - Fetches Pokémon 1–1025 from PokeAPI (Generations 1–9)
  - Uses batched parallel requests (50 per batch) with a visible “Loading Mons data…” progress indicator
  - Deduplicates by Pokédex ID (to avoid listing different forms as separate rows)
- Data extracted per Pokémon
  - id, name
  - sprite: front_default (fallbacks handled in code)
  - types: normalized and displayed as concise “badges”
  - moves: all learnable moves; used by name search and category filters
  - abilities: by name
  - stats: HP, Attack, Defense, Special Attack, Special Defense, Speed
  - BST (computed as the sum of the six base stats)
- Filtering model
  - Ability: when set, a Pokémon must have that ability
  - Moves: for each move input that has a selection, a Pokémon must have that move
  - Categories: for each checked category group, a Pokémon must have at least one move belonging to that category’s set
- Sorting and display
  - Click table headers (other than Sprite) to sort; click again to toggle direction
  - Incremental rendering in “row batches” for responsiveness
  - Infinite scroll loads the next batch when you near the bottom

Implementation lives entirely in the browser. No server or framework is required.

---

## Getting started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, or Edge)
- An internet connection (data comes from PokeAPI)

### Try it on Render
The web application is hosted on Render at this [link](https://findmons.onrender.com).

### Run locally
You can run this app by simply serving the repository as static files:

- Python 3
  ```bash
  python3 -m http.server 8080
  ```
  Then open http://localhost:8080 in your browser.

- VS Code Live Server
  - Open the folder in VS Code
  - Use the Live Server extension to “Open with Live Server”

Directly double-clicking `index.html` may work in some browsers, but using a local server is more reliable for fetch/CORS behavior.

---

## Usage
1. Open the app (index.html) in your browser.
2. Ability filter
   - Start typing an ability; choose from the autocomplete dropdown
   - Clear via the “×” icon or the “Clear All Filters” button
3. Move filters
   - There are four move inputs (Move 1–4). Type and select moves to require
   - Each selected move must be present on the Pokémon
   - Clear any individual move with its “×” icon
4. Move categories
   - Expand “Show Categories” and toggle desired category checkboxes
   - A Pokémon matches when it has at least one move from every selected category set
5. Results
   - Results update automatically as you apply filters
   - Click a table header to sort (e.g., by ATK or Speed); click again to toggle direction
   - Scroll to load more results
6. Reset
   - Click “Clear All Filters” to reset everything

---

## Project structure
- index.html
  - Page structure, filter controls, results table
- styles.css
  - Responsive layout, table and badge styling, mobile filter UI
- app.js
  - Data fetching (PokeAPI), dropdown/autocomplete logic, filter application, category mapping, sorting, progressive rendering, infinite scroll, and UI state

Key modules/functions in app.js (high level):
- init(): bootstraps the app (fetch, UI setup, event listeners)
- fetchPokemonData() and fetchPokemon(id): loads and normalizes Pokémon data from PokeAPI
- setupDropdowns(): wires up ability and move dropdowns
- applyFilters(): computes the filtered result set based on ability, moves, and categories
- updateDisplay() and renderTable(): render the table with progressive batches and handle empty/no-results states
- sortPokemon(): sorts by chosen column and direction
- Event listeners for sorting, clearing, mobile toggles, and infinite scrolling
- Utilities: formatName, getTypeAbbreviation, getTypeId, hideLoading, showError

---

## Data, performance, and limits
- Source: PokeAPI (public, rate-limited). Large fetches may take time
- Batch size: 50 Pokémon per fetch batch, up to ~1025 total
- Progressive UI:
  - Loading indicator updates as batches complete
  - Rows render in chunks to keep the UI responsive
- Offline use is not supported (requires network access to PokeAPI)

---

## Accessibility and mobile
- Mobile
  - Collapsible filter panel for small screens
  - Types shown as compact badges; table remains scrollable
- Keyboard/interaction
  - Inputs focusable; autocomplete dropdowns navigable by pointer
- Visual
  - Clear contrast and spacing; includes loading/error states

If you find accessibility issues, please open an issue with details about your device, browser, and steps to reproduce.

---

## Acknowledgements
- Pokémon data and sprites provided by the amazing community-run [PokeAPI](https://pokeapi.co/)
- Pokémon and Pokémon character names are trademarks of Nintendo, Game Freak, and The Pokémon Company. This project is unaffiliated and for educational/demonstration purposes only.