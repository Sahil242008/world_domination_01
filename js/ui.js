/**
 * ui.js - User interface interactions and display
 * Global Conquest - World Domination Game
 */

class UI {
    constructor() {
        // UI Elements
        this.playerNameElement = document.getElementById('player-name');
        this.goldAmountElement = document.getElementById('gold-amount');
        this.productionAmountElement = document.getElementById('production-amount');
        this.techPointsElement = document.getElementById('tech-points');
        this.territoriesCountElement = document.getElementById('territories-count');
        this.totalTerritoriesElement = document.getElementById('total-territories');
        this.territoryDetailsElement = document.getElementById('territory-details');
        this.logContainerElement = document.getElementById('log-container');
        
        // Action Buttons
        this.buildArmyBtn = document.getElementById('build-army-btn');
        this.attackBtn = document.getElementById('attack-btn');
        this.moveArmyBtn = document.getElementById('move-army-btn');
        this.researchBtn = document.getElementById('research-btn');
        this.endTurnBtn = document.getElementById('end-turn-btn');
        
        // Modals
        this.helpModal = document.getElementById('help-modal');
        this.techModal = document.getElementById('tech-modal');
        this.victoryModal = document.getElementById('victory-modal');
        
        // Initialize UI
        this.initializeUI();
    }

    // Initialize UI elements and event listeners
    initializeUI() {
        // Set total territories
        this.totalTerritoriesElement.textContent = MAP_CONFIG.totalTerritories;
        
        // Initialize action buttons
        this.buildArmyBtn.addEventListener('click', () => this.handleBuildArmy());
        this.attackBtn.addEventListener('click', () => this.handleAttack());
        this.moveArmyBtn.addEventListener('click', () => this.handleMoveArmy());
        this.researchBtn.addEventListener('click', () => this.handleResearch());
        this.endTurnBtn.addEventListener('click', () => this.handleEndTurn());
        
        // Initialize control buttons
        document.getElementById('new-game-btn').addEventListener('click', () => this.handleNewGame());
        document.getElementById('help-btn').addEventListener('click', () => this.showHelpModal());
        document.getElementById('play-again-btn').addEventListener('click', () => this.handleNewGame());
        
        // Initialize close buttons for modals
        const closeButtons = document.querySelectorAll('.close-btn');
        closeButtons.forEach(button => {
            button.addEventListener('click', () => this.closeAllModals());
        });
        
        // Initialize territory click events
        this.initializeTerritoryEvents();
    }

    // Initialize territory click events
    initializeTerritoryEvents() {
        // Add event listener to the map container for event delegation
        document.getElementById('world-map').addEventListener('click', (event) => {
            // Find the clicked territory element
            let territoryElement = event.target;
            while (territoryElement && !territoryElement.classList.contains('territory')) {
                if (territoryElement === document.getElementById('world-map')) {
                    territoryElement = null;
                    break;
                }
                territoryElement = territoryElement.parentElement;
            }
            
            if (!territoryElement) return;
            
            // Get territory ID from element ID
            const territoryId = parseInt(territoryElement.id.split('-')[1]);
            const territory = game.worldMap.getTerritoryById(territoryId);
            
            // Handle territory click based on game state
            if (game.attackMode) {
                // In attack mode, clicked territory is the target
                if (territory !== game.worldMap.selectedTerritory) {
                    game.attack(territory);
                }
            } else if (game.moveMode) {
                // In move mode, clicked territory is the target
                if (territory !== game.worldMap.selectedTerritory) {
                    game.moveArmies(territory);
                }
            } else {
                // Normal selection mode
                game.worldMap.selectTerritory(territory);
            }
        });
    }

    // Update player information display
    updatePlayerInfo() {
        const player = game.currentPlayer;
        
        if (!player) return;
        
        this.playerNameElement.textContent = player.name;
        this.goldAmountElement.textContent = player.gold;
        this.productionAmountElement.textContent = player.production;
        this.techPointsElement.textContent = player.techPoints;
        
        const playerTerritories = game.worldMap.getTerritoriesByOwner(player);
        this.territoriesCountElement.textContent = playerTerritories.length;
    }

    // Update territory information display
    updateTerritoryInfo(territory) {
        if (!territory) {
            this.territoryDetailsElement.innerHTML = '<p>Select a territory to view details</p>';
            return;
        }
        
        let ownerName = 'Neutral';
        if (territory.owner) {
            ownerName = territory.owner.name;
        }
        
        let html = `
            <p><strong>Name:</strong> ${territory.name}</p>
            <p><strong>Continent:</strong> ${territory.continent}</p>
            <p><strong>Owner:</strong> ${ownerName}</p>
            <p><strong>Armies:</strong> ${territory.armies}</p>
            <p><strong>Resources:</strong> ${territory.resources}</p>
        `;
        
        // Show adjacent territories
        html += '<p><strong>Adjacent to:</strong> ';
        const adjacentTerritories = game.worldMap.getAdjacentTerritories(territory);
        html += adjacentTerritories.map(t => t.name).join(', ');
        html += '</p>';
        
        this.territoryDetailsElement.innerHTML = html;
    }

    // Update action buttons based on game state
    updateActionButtons() {
        const territory = game.worldMap.selectedTerritory;
        const player = game.currentPlayer;
        
        // Disable all buttons by default
        this.buildArmyBtn.disabled = true;
        this.attackBtn.disabled = true;
        this.moveArmyBtn.disabled = true;
        
        // Only enable buttons if it's the human player's turn
        if (!player || !player.isHuman) return;
        
        // Calculate army cost with technology discount
        let armyCost = GAME_CONFIG.armyCost;
        if (player.technologies.includes('efficient-training')) {
            armyCost = Math.floor(armyCost * 0.75);
        }
        this.buildArmyBtn.textContent = `Build Army (${armyCost} 💰)`;
        
        if (territory) {
            // Enable build army if territory is owned by player and player has enough gold
            if (territory.owner === player && player.gold >= armyCost) {
                this.buildArmyBtn.disabled = false;
            }
            
            // Enable attack if territory is owned by player and has more than 1 army
            if (territory.owner === player && territory.armies > 1) {
                // Check if there are adjacent enemy territories
                const adjacentTerritories = game.worldMap.getAdjacentTerritories(territory);
                const hasEnemyAdjacent = adjacentTerritories.some(t => t.owner !== player);
                
                if (hasEnemyAdjacent) {
                    this.attackBtn.disabled = false;
                }
            }
            
            // Enable move if territory is owned by player and has more than 1 army
            if (territory.owner === player && territory.armies > 1) {
                // Check if there are adjacent friendly territories
                const adjacentTerritories = game.worldMap.getAdjacentTerritories(territory);
                const hasFriendlyAdjacent = adjacentTerritories.some(t => t.owner === player);
                
                if (hasFriendlyAdjacent) {
                    this.moveArmyBtn.disabled = false;
                }
            }
        }
    }

    // Update the game log
    updateGameLog(message) {
        const logEntry = document.createElement('p');
        logEntry.textContent = message;
        this.logContainerElement.insertBefore(logEntry, this.logContainerElement.firstChild);
        
        // Limit log entries
        if (this.logContainerElement.children.length > 20) {
            this.logContainerElement.removeChild(this.logContainerElement.lastChild);
        }
    }

    // Update technology tree display
    updateTechTree() {
        const player = game.currentPlayer;
        
        // Update each tech item
        Object.keys(game.technologies).forEach(techId => {
            const techElement = document.querySelector(`.tech-item[data-tech="${techId}"]`);
            const techButton = techElement.querySelector('.research-tech-btn');
            const tech = game.technologies[techId];
            
            // Check if player has researched this tech
            if (player.technologies.includes(techId)) {
                techElement.classList.add('researched');
                techButton.disabled = true;
                techButton.textContent = 'Researched';
            } else {
                techElement.classList.remove('researched');
                techButton.disabled = player.techPoints < tech.cost;
                techButton.textContent = 'Research';
            }
        });
    }

    // Show the help modal
    showHelpModal() {
        this.closeAllModals();
        this.helpModal.style.display = 'flex';
    }

    // Show the technology research modal
    showTechModal() {
        this.closeAllModals();
        this.updateTechTree();
        this.techModal.style.display = 'flex';
        
        // Add event listeners to research buttons
        const researchButtons = document.querySelectorAll('.research-tech-btn');
        researchButtons.forEach(button => {
            // Remove existing event listeners
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // Add new event listener
            newButton.addEventListener('click', () => {
                const techId = newButton.getAttribute('data-tech');
                game.researchTechnology(techId);
            });
        });
    }

    // Show the victory screen
    showVictoryScreen(winner, message) {
        document.getElementById('victory-title').textContent = `${winner.name} Wins!`;
        document.getElementById('victory-message').textContent = message;
        this.victoryModal.style.display = 'flex';
    }

    // Close all modals
    closeAllModals() {
        this.helpModal.style.display = 'none';
        this.techModal.style.display = 'none';
        this.victoryModal.style.display = 'none';
    }

    // Handle build army button click
    handleBuildArmy() {
        if (game.buildArmy()) {
            this.updateActionButtons();
        }
    }

    // Handle attack button click
    handleAttack() {
        // Toggle attack mode
        game.attackMode = !game.attackMode;
        game.moveMode = false;
        
        if (game.attackMode) {
            this.attackBtn.textContent = 'Cancel Attack';
            this.updateGameLog('Select an enemy territory to attack.');
        } else {
            this.attackBtn.textContent = 'Attack';
            this.updateGameLog('Attack cancelled.');
        }
    }

    // Handle move army button click
    handleMoveArmy() {
        // Toggle move mode
        game.moveMode = !game.moveMode;
        game.attackMode = false;
        
        if (game.moveMode) {
            this.moveArmyBtn.textContent = 'Cancel Move';
            this.updateGameLog('Select a friendly territory to move armies to.');
        } else {
            this.moveArmyBtn.textContent = 'Move Army';
            this.updateGameLog('Move cancelled.');
        }
    }

    // Handle research button click
    handleResearch() {
        this.showTechModal();
    }

    // Handle end turn button click
    handleEndTurn() {
        // Reset attack and move modes
        game.attackMode = false;
        game.moveMode = false;
        this.attackBtn.textContent = 'Attack';
        this.moveArmyBtn.textContent = 'Move Army';
        
        // Deselect territory
        game.worldMap.deselectTerritory();
        
        // End turn
        game.endTurn();
    }

    // Handle new game button click
    handleNewGame() {
        this.closeAllModals();
        game.resetGame();
        this.updateGameLog('New game started!');
    }
}

// Create global instances
let game, ui, animations, sounds, mapGenerator, optimizer;

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create map generator and generate background
    mapGenerator = new MapGenerator();
    const mapCanvas = mapGenerator.generate();
    
    // Set the map canvas as the background
    const mapElement = document.getElementById('world-map');
    mapElement.style.backgroundImage = 'none'; // Remove default background
    mapElement.appendChild(mapCanvas);
    mapCanvas.style.position = 'absolute';
    mapCanvas.style.top = '0';
    mapCanvas.style.left = '0';
    mapCanvas.style.width = '100%';
    mapCanvas.style.height = '100%';
    mapCanvas.style.zIndex = '-1';
    
    // Initialize animations
    animations = new GameAnimations();
    animations.initialize();
    
    // Initialize sound effects
    sounds = new SoundEffects();
    sounds.initialize();
    
    // Create game and UI instances
    game = new Game();
    ui = new UI();
    
    // Start a new game
    game.initialize();
    
    // Initialize performance optimizations
    optimizer = new PerformanceOptimizer();
    optimizer.initialize();
    
    // Log game initialization
    console.log('Global Conquest game initialized successfully!');
});
