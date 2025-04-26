/**
 * map.js - Handles world map generation and territory management
 * Global Conquest - World Domination Game
 */

// Map Configuration
const MAP_CONFIG = {
    totalTerritories: 25,
    continents: [
        { name: "North America", territories: 5, bonus: 5 },
        { name: "South America", territories: 3, bonus: 2 },
        { name: "Europe", territories: 5, bonus: 5 },
        { name: "Africa", territories: 4, bonus: 3 },
        { name: "Asia", territories: 6, bonus: 7 },
        { name: "Australia", territories: 2, bonus: 2 }
    ]
};

// Territory Data
const TERRITORIES = [
    // North America
    { id: 1, name: "Alaska", continent: "North America", x: 15, y: 15, size: 40, resources: 2, adjacent: [2, 3, 19] },
    { id: 2, name: "Canada", continent: "North America", x: 20, y: 20, size: 50, resources: 3, adjacent: [1, 3, 4] },
    { id: 3, name: "Western US", continent: "North America", x: 18, y: 25, size: 45, resources: 4, adjacent: [1, 2, 4, 5] },
    { id: 4, name: "Eastern US", continent: "North America", x: 22, y: 28, size: 45, resources: 5, adjacent: [2, 3, 5] },
    { id: 5, name: "Central America", continent: "North America", x: 20, y: 35, size: 35, resources: 2, adjacent: [3, 4, 6] },
    
    // South America
    { id: 6, name: "Venezuela", continent: "South America", x: 25, y: 42, size: 35, resources: 2, adjacent: [5, 7, 8] },
    { id: 7, name: "Brazil", continent: "South America", x: 30, y: 50, size: 50, resources: 4, adjacent: [6, 8, 9] },
    { id: 8, name: "Argentina", continent: "South America", x: 25, y: 60, size: 40, resources: 3, adjacent: [6, 7] },
    
    // Europe
    { id: 9, name: "Iceland", continent: "Europe", x: 40, y: 15, size: 25, resources: 1, adjacent: [10, 11] },
    { id: 10, name: "Great Britain", continent: "Europe", x: 42, y: 20, size: 30, resources: 3, adjacent: [9, 11, 12] },
    { id: 11, name: "Northern Europe", continent: "Europe", x: 48, y: 20, size: 35, resources: 4, adjacent: [9, 10, 12, 13] },
    { id: 12, name: "Western Europe", continent: "Europe", x: 45, y: 28, size: 35, resources: 4, adjacent: [10, 11, 13, 14] },
    { id: 13, name: "Southern Europe", continent: "Europe", x: 50, y: 30, size: 35, resources: 3, adjacent: [11, 12, 14, 15, 16] },
    
    // Africa
    { id: 14, name: "North Africa", continent: "Africa", x: 45, y: 40, size: 45, resources: 3, adjacent: [12, 13, 15, 17] },
    { id: 15, name: "Egypt", continent: "Africa", x: 52, y: 38, size: 35, resources: 2, adjacent: [13, 14, 16, 17] },
    { id: 16, name: "Middle East", continent: "Africa", x: 58, y: 35, size: 40, resources: 4, adjacent: [13, 15, 17, 19, 20] },
    { id: 17, name: "Central Africa", continent: "Africa", x: 50, y: 50, size: 45, resources: 3, adjacent: [14, 15, 16, 18] },
    { id: 18, name: "South Africa", continent: "Africa", x: 52, y: 60, size: 40, resources: 3, adjacent: [17] },
    
    // Asia
    { id: 19, name: "Ural", continent: "Asia", x: 65, y: 20, size: 40, resources: 3, adjacent: [1, 16, 20, 21, 22] },
    { id: 20, name: "Afghanistan", continent: "Asia", x: 63, y: 30, size: 40, resources: 2, adjacent: [16, 19, 21, 23] },
    { id: 21, name: "Siberia", continent: "Asia", x: 72, y: 15, size: 45, resources: 3, adjacent: [19, 20, 22, 23, 24] },
    { id: 22, name: "Yakutsk", continent: "Asia", x: 80, y: 12, size: 40, resources: 2, adjacent: [19, 21, 24] },
    { id: 23, name: "India", continent: "Asia", x: 70, y: 40, size: 45, resources: 4, adjacent: [20, 21, 24, 25] },
    { id: 24, name: "China", continent: "Asia", x: 78, y: 35, size: 50, resources: 5, adjacent: [21, 22, 23, 25] },
    
    // Australia
    { id: 25, name: "Indonesia", continent: "Australia", x: 78, y: 50, size: 35, resources: 2, adjacent: [23, 24, 26] },
    { id: 26, name: "Australia", continent: "Australia", x: 85, y: 65, size: 45, resources: 3, adjacent: [25] }
];

class WorldMap {
    constructor() {
        this.territories = [];
        this.continents = MAP_CONFIG.continents;
        this.mapElement = document.getElementById('world-map');
        this.selectedTerritory = null;
        this.targetTerritory = null;
    }

    // Initialize the world map
    initialize() {
        this.createTerritories();
        this.renderMap();
    }

    // Create territory objects from data
    createTerritories() {
        this.territories = TERRITORIES.map(data => {
            return {
                id: data.id,
                name: data.name,
                continent: data.continent,
                x: data.x,
                y: data.y,
                size: data.size,
                resources: data.resources,
                adjacent: data.adjacent,
                owner: null,
                armies: 0,
                element: null
            };
        });
    }

    // Render the map with territories
    renderMap() {
        // Clear existing map
        this.mapElement.innerHTML = '';
        
        // Create territory elements
        this.territories.forEach(territory => {
            const element = document.createElement('div');
            element.className = 'territory neutral';
            element.id = `territory-${territory.id}`;
            element.style.width = `${territory.size}px`;
            element.style.height = `${territory.size}px`;
            element.style.left = `${territory.x}%`;
            element.style.top = `${territory.y}%`;
            
            // Add army count
            const armyCount = document.createElement('div');
            armyCount.className = 'army-count';
            armyCount.textContent = territory.armies;
            element.appendChild(armyCount);
            
            // Add territory name
            const nameElement = document.createElement('div');
            nameElement.className = 'territory-name';
            nameElement.textContent = territory.name;
            element.appendChild(nameElement);
            
            // Store element reference
            territory.element = element;
            
            // Add to map
            this.mapElement.appendChild(element);
        });
    }

    // Update territory visuals based on ownership
    updateTerritoryVisuals() {
        this.territories.forEach(territory => {
            // Remove all classes except 'territory'
            territory.element.className = 'territory';
            
            // Add appropriate class based on ownership
            if (!territory.owner) {
                territory.element.classList.add('neutral');
            } else if (territory.owner === game.currentPlayer) {
                territory.element.classList.add('player-owned');
            } else {
                territory.element.classList.add('enemy-owned');
            }
            
            // Update army count
            const armyCount = territory.element.querySelector('.army-count');
            armyCount.textContent = territory.armies;
            
            // Add selected class if this is the selected territory
            if (this.selectedTerritory === territory) {
                territory.element.classList.add('selected');
            }
        });
    }

    // Get territory by ID
    getTerritoryById(id) {
        return this.territories.find(t => t.id === id);
    }

    // Get territories owned by a player
    getTerritoriesByOwner(player) {
        return this.territories.filter(t => t.owner === player);
    }

    // Get adjacent territories
    getAdjacentTerritories(territory) {
        return territory.adjacent.map(id => this.getTerritoryById(id));
    }

    // Check if two territories are adjacent
    areAdjacent(territory1, territory2) {
        return territory1.adjacent.includes(territory2.id);
    }

    // Get continent bonus for a player
    getContinentBonus(player) {
        let bonus = 0;
        
        this.continents.forEach(continent => {
            const continentTerritories = this.territories.filter(t => t.continent === continent.name);
            const playerTerritories = continentTerritories.filter(t => t.owner === player);
            
            // If player owns all territories in the continent, add bonus
            if (playerTerritories.length === continentTerritories.length) {
                bonus += continent.bonus;
            }
        });
        
        return bonus;
    }

    // Select a territory
    selectTerritory(territory) {
        this.selectedTerritory = territory;
        this.updateTerritoryVisuals();
        ui.updateTerritoryInfo(territory);
        ui.updateActionButtons();
    }

    // Deselect territory
    deselectTerritory() {
        this.selectedTerritory = null;
        this.updateTerritoryVisuals();
        ui.updateTerritoryInfo(null);
        ui.updateActionButtons();
    }

    // Set target territory for attack or move
    setTargetTerritory(territory) {
        this.targetTerritory = territory;
    }

    // Clear target territory
    clearTargetTerritory() {
        this.targetTerritory = null;
    }

    // Initialize starting territories
    initializeStartingTerritories() {
        // Assign one random territory to each player
        const players = game.players;
        const availableTerritories = [...this.territories];
        
        players.forEach(player => {
            // Get random territory
            const randomIndex = Math.floor(Math.random() * availableTerritories.length);
            const territory = availableTerritories[randomIndex];
            
            // Assign to player
            territory.owner = player;
            territory.armies = 5; // Starting armies
            
            // Remove from available territories
            availableTerritories.splice(randomIndex, 1);
        });
        
        // Update visuals
        this.updateTerritoryVisuals();
    }
}
