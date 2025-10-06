// Global state
let allPokemon = [];
let allAbilities = new Set();
let allMoves = new Set();
let filteredPokemon = [];
let currentSort = { column: null, direction: 'asc' };

// Filter state
let selectedAbility = null;
let selectedMoves = [null, null, null, null];
let selectedCategories = new Set();

// Lazy loading state
let displayedRows = 0;
const ROWS_PER_LOAD = 50;
let isLoading = false;

// Move category mappings (hardcoded based on Bulbapedia classifications)
const MOVE_CATEGORIES = {
    'ohko': ['fissure', 'guillotine', 'horn-drill', 'sheer-cold'],
    'multi-hit': ['double-slap', 'comet-punch', 'fury-attack', 'pin-missile', 'spike-cannon', 'barrage', 'fury-swipes', 
                  'bonemerang', 'double-kick', 'twineedle', 'icicle-spear', 'rock-blast', 'bullet-seed', 'tail-slap', 
                  'scale-shot', 'arm-thrust', 'water-shuriken', 'bone-rush', 'icicle-crash', 'triple-kick', 'triple-axel',
                  'double-iron-bash', 'gear-grind', 'surging-strikes', 'population-bomb', 'dragon-darts'],
    'recoil': ['take-down', 'double-edge', 'submission', 'brave-bird', 'flare-blitz', 'volt-tackle', 'wood-hammer', 
               'head-smash', 'wild-charge', 'head-charge', 'light-of-ruin', 'wave-crash', 'chloroblast', 'supercell-slam'],
    'draining': ['absorb', 'mega-drain', 'leech-life', 'giga-drain', 'drain-punch', 'draining-kiss', 'horn-leech', 
                 'parabolic-charge', 'oblivion-wing', 'dream-eater', 'bitter-malice'],
    'binding': ['bind', 'wrap', 'fire-spin', 'clamp', 'whirlpool', 'sand-tomb', 'magma-storm', 'infestation', 
                'snap-trap', 'thunder-cage', 'g-max-sandblast', 'g-max-centiferno'],
    'priority': ['quick-attack', 'extreme-speed', 'aqua-jet', 'mach-punch', 'bullet-punch', 'shadow-sneak', 
                 'ice-shard', 'vacuum-wave', 'feint', 'sucker-punch', 'accelerock', 'water-shuriken', 'first-impression',
                 'jet-punch', 'grassy-glide', 'wicked-blow', 'aqua-step', 'upper-hand'],
    'status-sleep': ['sleep-powder', 'hypnosis', 'lovely-kiss', 'sing', 'grass-whistle', 'spore', 'dark-void', 'yawn'],
    'status-paralyze': ['thunder-wave', 'stun-spore', 'glare', 'body-slam', 'lick', 'force-palm', 'bounce', 'nuzzle',
                        'discharge', 'thunder', 'thunderbolt', 'thunder-fang', 'spark', 'volt-switch', 'zing-zap'],
    'status-burn': ['will-o-wisp', 'ember', 'fire-punch', 'flamethrower', 'fire-blast', 'flame-wheel', 'sacred-fire',
                    'scald', 'steam-eruption', 'scorching-sands', 'infernal-parade', 'blazing-torque'],
    'status-freeze': ['ice-beam', 'blizzard', 'powder-snow', 'ice-punch', 'ice-fang', 'freeze-dry', 'tri-attack'],
    'status-poison': ['poison-powder', 'poisonpowder', 'poison-gas', 'toxic', 'poison-sting', 'sludge', 'sludge-bomb',
                      'poison-jab', 'toxic-spikes', 'cross-poison', 'gunk-shot', 'poison-tail', 'smog', 'poison-fang',
                      'baneful-bunker', 'noxious-torque'],
    'stat-boost': ['swords-dance', 'dragon-dance', 'nasty-plot', 'calm-mind', 'bulk-up', 'coil', 'shift-gear', 
                   'quiver-dance', 'shell-smash', 'cosmic-power', 'iron-defense', 'amnesia', 'barrier', 'agility',
                   'rock-polish', 'autotomize', 'cotton-guard', 'acid-armor', 'double-team', 'minimize', 'howl',
                   'meditate', 'sharpen', 'growth', 'hone-claws', 'work-up', 'curse', 'power-trick', 'no-retreat',
                   'victory-dance', 'tidyup', 'fillet-away'],
    'stat-lower': ['leer', 'growl', 'string-shot', 'sand-attack', 'smokescreen', 'screech', 'scary-face', 'cotton-spore',
                   'fake-tears', 'metal-sound', 'tickle', 'charm', 'feather-dance', 'swagger', 'flatter', 'acid-spray',
                   'venom-drench', 'parting-shot', 'baby-doll-eyes', 'play-nice', 'noble-roar', 'tearful-look',
                   'octolock', 'tar-shot'],
    'switching': ['u-turn', 'volt-switch', 'flip-turn', 'baton-pass', 'parting-shot', 'teleport', 'shed-tail', 'chilly-reception'],
    'hazards': ['spikes', 'stealth-rock', 'toxic-spikes', 'sticky-web', 'stone-axe', 'ceaseless-edge'],
    'weather': ['sunny-day', 'rain-dance', 'sandstorm', 'hail', 'snowscape', 'chilly-reception'],
    'terrain': ['electric-terrain', 'grassy-terrain', 'misty-terrain', 'psychic-terrain'],
    'healing': ['recover', 'soft-boiled', 'rest', 'milk-drink', 'slack-off', 'roost', 'synthesis', 'moonlight', 
                'morning-sun', 'wish', 'heal-order', 'shore-up', 'heal-pulse', 'floral-healing', 'life-dew',
                'jungle-healing', 'lunar-blessing', 'purify'],
    'protection': ['protect', 'detect', 'endure', 'wide-guard', 'quick-guard', 'kings-shield', 'spiky-shield',
                   'baneful-bunker', 'obstruct', 'max-guard', 'silk-trap', 'burning-bulwark']
};

// DOM Elements
const loadingElement = document.getElementById('loading');
const errorElement = document.getElementById('error');
const resultsContainer = document.getElementById('results-container');
const pokemonTbody = document.getElementById('pokemon-tbody');
const noResultsElement = document.getElementById('no-results');
const emptyStateElement = document.getElementById('empty-state');
const resultsCount = document.getElementById('results-count');

// Initialize the app
async function init() {
    try {
        await fetchPokemonData();
        setupDropdowns();
        setupEventListeners();
        updateDisplay();
        hideLoading();
    } catch (error) {
        console.error('Error initializing app:', error);
        showError();
    }
}

// Fetch all Pokemon data from Gen 1-9 from PokeAPI
async function fetchPokemonData() {
    // All Pokemon from Gen 1-9 (National Dex: 1-1025)
    // This includes all forms and variations
    const totalPokemon = 1025;
    const promises = [];

    // Fetch in batches to avoid overwhelming the API
    const batchSize = 50;
    for (let i = 1; i <= totalPokemon; i += batchSize) {
        const batchPromises = [];
        for (let id = i; id < Math.min(i + batchSize, totalPokemon + 1); id++) {
            batchPromises.push(fetchPokemon(id));
        }
        const batchResults = await Promise.all(batchPromises);
        batchResults.forEach(pokemon => {
            if (pokemon) {
                // Check for duplicates by ID (some Pokemon have multiple forms)
                const existingIndex = allPokemon.findIndex(p => p.id === pokemon.id);
                if (existingIndex === -1) {
                    allPokemon.push(pokemon);
                }
            }
        });
        
        // Update loading text with progress
        const progress = Math.min(100, Math.floor((i / totalPokemon) * 100));
        const loadingText = document.querySelector('.loading p');
        if (loadingText) {
            loadingText.textContent = `Loading Mons data... ${progress}%`;
        }
    }
    
    // Extract all unique abilities and moves
    allPokemon.forEach(pokemon => {
        pokemon.abilities.forEach(ability => allAbilities.add(ability));
        pokemon.moves.forEach(move => allMoves.add(move));
    });
}

// Fetch individual Pokemon data
async function fetchPokemon(id) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        if (!response.ok) return null;
        
        const data = await response.json();
        
        return {
            id: data.id,
            name: data.name,
            sprite: data.sprites.front_default || data.sprites.other['official-artwork'].front_default,
            types: data.types.map(t => t.type.name),
            abilities: data.abilities.map(a => a.ability.name),
            moves: data.moves.map(m => m.move.name),
            stats: {
                hp: data.stats[0].base_stat,
                attack: data.stats[1].base_stat,
                defense: data.stats[2].base_stat,
                specialAttack: data.stats[3].base_stat,
                specialDefense: data.stats[4].base_stat,
                speed: data.stats[5].base_stat
            }
        };
    } catch (error) {
        console.error(`Error fetching Pokemon ${id}:`, error);
        return null;
    }
}

// Setup dropdown functionality
function setupDropdowns() {
    setupAbilityDropdown();
    setupMoveDropdowns();
}

// Setup ability dropdown
function setupAbilityDropdown() {
    const input = document.getElementById('ability-filter');
    const dropdown = document.getElementById('ability-dropdown');
    
    input.addEventListener('focus', () => {
        populateDropdown(dropdown, Array.from(allAbilities).sort(), selectedAbility);
    });
    
    input.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().replace(/\s+/g, '-');
        const filtered = Array.from(allAbilities)
            .filter(ability => ability.replace(/\s+/g, '-').includes(searchTerm))
            .sort();
        populateDropdown(dropdown, filtered, selectedAbility);
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('show');
        }
    });
}

// Setup move dropdowns
function setupMoveDropdowns() {
    const moveInputs = document.querySelectorAll('.move-filter');
    
    moveInputs.forEach((input, index) => {
        const dropdown = document.getElementById(`move-dropdown-${index + 1}`);
        
        input.addEventListener('focus', () => {
            populateDropdown(dropdown, Array.from(allMoves).sort(), selectedMoves[index], true, index);
        });
        
        input.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().replace(/\s+/g, '-');
            const filtered = Array.from(allMoves)
                .filter(move => move.replace(/\s+/g, '-').includes(searchTerm))
                .sort();
            populateDropdown(dropdown, filtered, selectedMoves[index], true, index);
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!input.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.remove('show');
            }
        });
    });
}

// Populate a dropdown with items
function populateDropdown(dropdown, items, selectedItem, isMove = false, moveIndex = null) {
    dropdown.innerHTML = '';
    
    if (items.length === 0) {
        dropdown.innerHTML = '<div class="dropdown-item">No results</div>';
        dropdown.classList.add('show');
        return;
    }
    
    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'dropdown-item';
        if (item === selectedItem) {
            div.classList.add('selected');
        }
        div.textContent = formatName(item);
        
        div.addEventListener('click', () => {
            if (isMove) {
                selectMove(moveIndex, item);
            } else {
                selectAbility(item);
            }
            dropdown.classList.remove('show');
        });
        
        dropdown.appendChild(div);
    });
    
    dropdown.classList.add('show');
}

// Select an ability
function selectAbility(ability) {
    selectedAbility = ability;
    document.getElementById('ability-filter').value = formatName(ability);
    applyFilters();
}

// Select a move
function selectMove(index, move) {
    selectedMoves[index] = move;
    document.getElementById(`move-filter-${index + 1}`).value = formatName(move);
    applyFilters();
}

// Apply all filters
function applyFilters() {
    filteredPokemon = allPokemon.filter(pokemon => {
        // Check ability filter
        if (selectedAbility && !pokemon.abilities.includes(selectedAbility)) {
            return false;
        }
        
        // Check individual move filters
        for (let move of selectedMoves) {
            if (move && !pokemon.moves.includes(move)) {
                return false;
            }
        }
        
        // Check category filters (Pokemon must have at least one move from each selected category)
        if (selectedCategories.size > 0) {
            for (let category of selectedCategories) {
                const categoryMoves = MOVE_CATEGORIES[category];
                const hasMatchingMove = pokemon.moves.some(move => categoryMoves.includes(move));
                if (!hasMatchingMove) {
                    return false;
                }
            }
        }
        
        return true;
    });
    
    updateDisplay();
}

// Update the display
function updateDisplay() {
    const hasActiveFilters = selectedAbility || selectedMoves.some(m => m !== null) || selectedCategories.size > 0;
    const pokemonTable = document.getElementById('pokemon-table');
    
    if (!hasActiveFilters) {
        // No filters applied - show empty state
        pokemonTable.classList.add('disabled-sort');
        pokemonTbody.innerHTML = '';
        noResultsElement.classList.add('hidden');
        emptyStateElement.classList.remove('hidden');
        resultsCount.textContent = `${allPokemon.length} Mons available`;
        return;
    }
    
    // Filters are applied
    emptyStateElement.classList.add('hidden');
    
    if (filteredPokemon.length === 0) {
        // Show no results message
        pokemonTable.classList.add('disabled-sort');
        pokemonTbody.innerHTML = '';
        noResultsElement.classList.remove('hidden');
        resultsCount.textContent = '0 Mons found';
    } else {
        // Show table with results
        pokemonTable.classList.remove('disabled-sort');
        noResultsElement.classList.add('hidden');
        
        displayedRows = 0;
        renderTable(filteredPokemon, true);
        resultsCount.textContent = `${filteredPokemon.length} Mons found`;
    }
}

// Render the Pokemon table with lazy loading
function renderTable(pokemon, reset = false) {
    if (reset) {
        pokemonTbody.innerHTML = '';
        displayedRows = 0;
    }
    
    // Apply current sort if any
    let sortedPokemon = [...pokemon];
    if (currentSort.column) {
        sortedPokemon = sortPokemon(sortedPokemon, currentSort.column, currentSort.direction);
    }
    
    // Check if mobile view
    const isMobile = window.innerWidth <= 768;
    
    // Load initial batch or next batch
    const startIdx = displayedRows;
    const endIdx = Math.min(startIdx + ROWS_PER_LOAD, sortedPokemon.length);
    
    for (let i = startIdx; i < endIdx; i++) {
        const p = sortedPokemon[i];
        const row = document.createElement('tr');
        
        const bst = Object.values(p.stats).reduce((sum, stat) => sum + stat, 0);
        
        // Use abbreviated type names on mobile
        const type1Text = isMobile ? getTypeAbbreviation(p.types[0]) : formatName(p.types[0]);
        const type2Text = p.types[1] ? (isMobile ? getTypeAbbreviation(p.types[1]) : formatName(p.types[1])) : '';
        
        // Stack types vertically in a single column
        const typeDisplay = p.types[1] 
            ? `<span class="type-badge type-${p.types[0]}">${type1Text}</span><br><span class="type-badge type-${p.types[1]}">${type2Text}</span>`
            : `<span class="type-badge type-${p.types[0]}">${type1Text}</span>`;
        
        row.innerHTML = `
            <td class="sprite-cell"><img src="${p.sprite}" alt="${p.name}" class="pokemon-sprite"></td>
            <td class="pokemon-name">${formatName(p.name)}</td>
            <td class="type-column">${typeDisplay}</td>
            <td class="stat-cell">${p.stats.hp}</td>
            <td class="stat-cell">${p.stats.attack}</td>
            <td class="stat-cell">${p.stats.defense}</td>
            <td class="stat-cell">${p.stats.specialAttack}</td>
            <td class="stat-cell">${p.stats.specialDefense}</td>
            <td class="stat-cell">${p.stats.speed}</td>
            <td class="bst-cell">${bst}</td>
        `;
        
        pokemonTbody.appendChild(row);
    }
    
    displayedRows = endIdx;
    isLoading = false;
}

// Sort Pokemon by column
function sortPokemon(pokemon, column, direction) {
    return [...pokemon].sort((a, b) => {
        let aValue, bValue;
        
        switch (column) {
            case 'name':
                aValue = a.name;
                bValue = b.name;
                break;
            case 'type1':
                aValue = a.types[0];
                bValue = b.types[0];
                break;
            case 'hp':
                aValue = a.stats.hp;
                bValue = b.stats.hp;
                break;
            case 'attack':
                aValue = a.stats.attack;
                bValue = b.stats.attack;
                break;
            case 'defense':
                aValue = a.stats.defense;
                bValue = b.stats.defense;
                break;
            case 'specialAttack':
                aValue = a.stats.specialAttack;
                bValue = b.stats.specialAttack;
                break;
            case 'specialDefense':
                aValue = a.stats.specialDefense;
                bValue = b.stats.specialDefense;
                break;
            case 'speed':
                aValue = a.stats.speed;
                bValue = b.stats.speed;
                break;
            case 'bst':
                aValue = Object.values(a.stats).reduce((sum, stat) => sum + stat, 0);
                bValue = Object.values(b.stats).reduce((sum, stat) => sum + stat, 0);
                break;
            default:
                return 0;
        }
        
        if (typeof aValue === 'string') {
            return direction === 'asc' 
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
        } else {
            return direction === 'asc' 
                ? aValue - bValue
                : bValue - aValue;
        }
    });
}

// Setup event listeners
function setupEventListeners() {
    // Mobile filter toggle
    const mobileFilterToggle = document.getElementById('mobile-filter-toggle');
    const filtersSection = document.getElementById('filters-section');
    
    if (mobileFilterToggle) {
        mobileFilterToggle.addEventListener('click', () => {
            mobileFilterToggle.classList.toggle('expanded');
            filtersSection.classList.toggle('show');
        });
    }
    
    // Category toggle
    const categoryToggle = document.getElementById('category-toggle');
    const categoriesContainer = document.getElementById('categories-container');
    
    categoryToggle.addEventListener('click', () => {
        categoryToggle.classList.toggle('expanded');
        categoriesContainer.classList.toggle('show');
    });
    
    // Category checkboxes
    const categoryCheckboxes = document.querySelectorAll('.category-item input[type="checkbox"]');
    categoryCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                selectedCategories.add(e.target.value);
            } else {
                selectedCategories.delete(e.target.value);
            }
            applyFilters();
        });
    });
    
    // Clear filters button
    document.getElementById('clear-filters').addEventListener('click', () => {
        selectedAbility = null;
        selectedMoves = [null, null, null, null];
        selectedCategories.clear();
        
        document.getElementById('ability-filter').value = '';
        document.querySelectorAll('.move-filter').forEach(input => {
            input.value = '';
        });
        categoryCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        filteredPokemon = [];
        updateDisplay();
    });
    
    // Table header sorting
    document.querySelectorAll('#pokemon-table th').forEach(th => {
        const sortColumn = th.dataset.sort;
        if (sortColumn === 'sprite') return; // Don't sort by sprite
        
        th.addEventListener('click', () => {
            // Toggle sort direction
            if (currentSort.column === sortColumn) {
                currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
            } else {
                currentSort.column = sortColumn;
                currentSort.direction = 'desc'; // Default to descending for stats
            }
            
            // Update UI
            document.querySelectorAll('#pokemon-table th').forEach(header => {
                header.classList.remove('sort-asc', 'sort-desc');
            });
            th.classList.add(`sort-${currentSort.direction}`);
            
            // Re-render table with new sort
            updateDisplay();
        });
    });
    
    // Lazy loading on scroll
    pokemonTbody.addEventListener('scroll', () => {
        if (isLoading) return;
        
        const scrollPercentage = (pokemonTbody.scrollTop + pokemonTbody.clientHeight) / pokemonTbody.scrollHeight;
        
        // Load more when user scrolls to 80% of the content
        if (scrollPercentage > 0.8 && displayedRows < filteredPokemon.length) {
            isLoading = true;
            renderTable(filteredPokemon, false);
        }
    });
}

// Utility functions
function formatName(name) {
    return name.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

function getTypeAbbreviation(typeName) {
    const abbreviations = {
        'normal': 'NRM',
        'fire': 'FIR',
        'water': 'WTR',
        'electric': 'ELC',
        'grass': 'GRS',
        'ice': 'ICE',
        'fighting': 'FGT',
        'poison': 'PSN',
        'ground': 'GRD',
        'flying': 'FLY',
        'psychic': 'PSY',
        'bug': 'BUG',
        'rock': 'RCK',
        'ghost': 'GHT',
        'dragon': 'DRG',
        'dark': 'DRK',
        'steel': 'STL',
        'fairy': 'FRY'
    };
    return abbreviations[typeName] || typeName.substring(0, 3).toUpperCase();
}

function getTypeId(typeName) {
    const typeIds = {
        'normal': 1, 'fighting': 2, 'flying': 3, 'poison': 4, 'ground': 5,
        'rock': 6, 'bug': 7, 'ghost': 8, 'steel': 9, 'fire': 10,
        'water': 11, 'grass': 12, 'electric': 13, 'psychic': 14, 'ice': 15,
        'dragon': 16, 'dark': 17, 'fairy': 18
    };
    return typeIds[typeName] || 1;
}

function hideLoading() {
    loadingElement.classList.add('hidden');
    resultsContainer.classList.remove('hidden');
    // Show empty state on initial load
    emptyStateElement.classList.remove('hidden');
}

function showError() {
    loadingElement.classList.add('hidden');
    errorElement.classList.remove('hidden');
}

// Start the app
init();
