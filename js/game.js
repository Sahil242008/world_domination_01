/**
 * game.js - Core game mechanics and logic
 * Global Conquest - World Domination Game
 */

// Game Configuration
const GAME_CONFIG = {
    minPlayers: 2,
    maxPlayers: 4,
    startingGold: 100,
    startingProduction: 5,
    startingTechPoints: 0,
    armyCost: 50,
    baseIncomePerTerritory: 10,
    baseProductionPerTerritory: 1,
    baseTechPointsPerTurn: 1,
    victoryPercentage: 75 // Percentage of territories needed to win
};

// Player colors
const PLAYER_COLORS = [
    { name: 'Blue', primary: 'rgba(0, 128, 255, 0.4)', border: 'rgba(0, 128, 255, 0.8)' },
    { name: 'Red', primary: 'rgba(255, 0, 0, 0.4)', border: 'rgba(255, 0, 0, 0.8)' },
    { name: 'Green', primary: 'rgba(0, 200, 0, 0.4)', border: 'rgba(0, 200, 0, 0.8)' },
    { name: 'Purple', primary: 'rgba(128, 0, 255, 0.4)', border: 'rgba(128, 0, 255, 0.8)' }
];

class Game {
    constructor() {
        this.players = [];
        this.currentPlayerIndex = 0;
        this.currentPlayer = null;
        this.gamePhase = 'setup'; // setup, playing, gameover
        this.turnNumber = 0;
        this.worldMap = new WorldMap();
        this.technologies = {
            'improved-economy': { name: 'Improved Economy', cost: 10, effect: '+2 Gold per territory' },
            'advanced-weaponry': { name: 'Advanced Weaponry', cost: 15, effect: '+25% Combat Strength' },
            'efficient-training': { name: 'Efficient Training', cost: 12, effect: '-25% Army Cost' },
            'espionage': { name: 'Espionage', cost: 8, effect: 'View enemy territory strength' }
        };
        this.attackMode = false;
        this.moveMode = false;
    }

    // Initialize the game
    initialize(numPlayers = 2) {
        // Validate number of players
        numPlayers = Math.max(GAME_CONFIG.minPlayers, Math.min(numPlayers, GAME_CONFIG.maxPlayers));
        
        // Create players
        this.createPlayers(numPlayers);
        
        // Initialize the world map
        this.worldMap.initialize();
        
        // Set initial territories
        this.worldMap.initializeStartingTerritories();
        
        // Set current player
        this.currentPlayerIndex = 0;
        this.currentPlayer = this.players[0];
        
        // Set game phase
        this.gamePhase = 'playing';
        this.turnNumber = 1;
        
        // Update UI
        ui.updatePlayerInfo();
        ui.updateGameLog(`Game started! ${this.currentPlayer.name}'s turn.`);
    }

    // Create players
    createPlayers(numPlayers) {
        this.players = [];
        
        for (let i = 0; i < numPlayers; i++) {
            const player = {
                id: i + 1,
                name: `Player ${i + 1}`,
                color: PLAYER_COLORS[i],
                gold: GAME_CONFIG.startingGold,
                production: GAME_CONFIG.startingProduction,
                techPoints: GAME_CONFIG.startingTechPoints,
                technologies: [],
                isHuman: i === 0 // First player is human, others are AI
            };
            
            this.players.push(player);
        }
    }

    // End the current player's turn
    endTurn() {
        // Move to next player
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        this.currentPlayer = this.players[this.currentPlayerIndex];
        
        // If we've gone through all players, increment turn number
        if (this.currentPlayerIndex === 0) {
            this.turnNumber++;
        }
        
        // Collect resources for the new current player
        this.collectResources();
        
        // Update UI
        ui.updatePlayerInfo();
        ui.updateGameLog(`Turn ${this.turnNumber}: ${this.currentPlayer.name}'s turn.`);
        
        // Check for AI turn
        if (!this.currentPlayer.isHuman) {
            this.playAITurn();
        }
    }

    // Collect resources for the current player
    collectResources() {
        const player = this.currentPlayer;
        const playerTerritories = this.worldMap.getTerritoriesByOwner(player);
        
        // Base income
        let goldIncome = 0;
        let productionIncome = 0;
        
        // Territory income
        playerTerritories.forEach(territory => {
            goldIncome += GAME_CONFIG.baseIncomePerTerritory + territory.resources;
            productionIncome += GAME_CONFIG.baseProductionPerTerritory;
        });
        
        // Continent bonuses
        const continentBonus = this.worldMap.getContinentBonus(player);
        goldIncome += continentBonus;
        
        // Technology bonuses
        if (player.technologies.includes('improved-economy')) {
            goldIncome += playerTerritories.length * 2;
        }
        
        // Add resources to player
        player.gold += goldIncome;
        player.production += productionIncome;
        player.techPoints += GAME_CONFIG.baseTechPointsPerTurn;
        
        // Log resource collection
        ui.updateGameLog(`${player.name} collected ${goldIncome} gold, ${productionIncome} production, and 1 tech point.`);
    }

    // Build army in selected territory
    buildArmy() {
        const territory = this.worldMap.selectedTerritory;
        const player = this.currentPlayer;
        
        // Check if territory is owned by current player
        if (territory.owner !== player) {
            ui.updateGameLog('You can only build armies in territories you own.');
            return false;
        }
        
        // Calculate army cost with technology discount
        let armyCost = GAME_CONFIG.armyCost;
        if (player.technologies.includes('efficient-training')) {
            armyCost = Math.floor(armyCost * 0.75);
        }
        
        // Check if player has enough gold
        if (player.gold < armyCost) {
            ui.updateGameLog(`Not enough gold to build an army. Need ${armyCost} gold.`);
            return false;
        }
        
        // Build army
        player.gold -= armyCost;
        territory.armies += 1;
        
        // Play build animation and sound
        if (animations) animations.playArmyBuildAnimation(territory);
        if (sounds) sounds.play('build');
        
        // Update UI
        this.worldMap.updateTerritoryVisuals();
        ui.updatePlayerInfo();
        ui.updateTerritoryInfo(territory);
        ui.updateGameLog(`Built 1 army in ${territory.name}. Remaining gold: ${player.gold}.`);
        
        return true;
    }

    // Attack from selected territory to target territory
    attack(targetTerritory) {
        const sourceTerritory = this.worldMap.selectedTerritory;
        const player = this.currentPlayer;
        
        // Check if source territory is owned by current player
        if (sourceTerritory.owner !== player) {
            ui.updateGameLog('You can only attack from territories you own.');
            return false;
        }
        
        // Check if target territory is not owned by current player
        if (targetTerritory.owner === player) {
            ui.updateGameLog('You cannot attack your own territories.');
            return false;
        }
        
        // Check if territories are adjacent
        if (!this.worldMap.areAdjacent(sourceTerritory, targetTerritory)) {
            ui.updateGameLog('You can only attack adjacent territories.');
            return false;
        }
        
        // Check if source territory has enough armies
        if (sourceTerritory.armies <= 1) {
            ui.updateGameLog('You need at least 2 armies to attack (1 must stay behind).');
            return false;
        }
        
        // Play attack animation and sound
        if (animations) animations.playAttackAnimation(sourceTerritory, targetTerritory);
        if (sounds) sounds.play('attack');
        
        // Calculate attack strength with technology bonus
        let attackStrength = sourceTerritory.armies - 1; // Leave 1 army behind
        if (player.technologies.includes('advanced-weaponry')) {
            attackStrength = Math.floor(attackStrength * 1.25);
        }
        
        // Calculate defense strength
        const defenseStrength = targetTerritory.armies;
        
        // Add random factor
        const attackRoll = Math.random() * 0.5 + 0.75; // 0.75 to 1.25
        const defenseRoll = Math.random() * 0.5 + 0.75; // 0.75 to 1.25
        
        const finalAttackStrength = attackStrength * attackRoll;
        const finalDefenseStrength = defenseStrength * defenseRoll;
        
        // Determine winner
        let attackSuccess = false;
        let attackerLosses = 0;
        let defenderLosses = 0;
        
        if (finalAttackStrength > finalDefenseStrength) {
            // Attacker wins
            attackSuccess = true;
            attackerLosses = Math.floor(defenseStrength * 0.5);
            defenderLosses = targetTerritory.armies;
        } else {
            // Defender wins
            attackerLosses = Math.floor(sourceTerritory.armies * 0.5);
            defenderLosses = Math.floor(targetTerritory.armies * 0.3);
        }
        
        // Ensure losses don't exceed available armies
        attackerLosses = Math.min(attackerLosses, sourceTerritory.armies - 1);
        defenderLosses = Math.min(defenderLosses, targetTerritory.armies);
        
        // Apply losses
        sourceTerritory.armies -= attackerLosses;
        targetTerritory.armies -= defenderLosses;
        
        // If attacker won and defender has no armies left, capture territory
        if (attackSuccess && targetTerritory.armies <= 0) {
            const previousOwner = targetTerritory.owner ? targetTerritory.owner.name : 'Neutral';
            
            // Transfer ownership
            targetTerritory.owner = player;
            targetTerritory.armies = sourceTerritory.armies - 1;
            sourceTerritory.armies = 1;
            
            // Play capture animation and sound
            if (animations) animations.playCaptureAnimation(targetTerritory);
            if (sounds) sounds.play('capture');
            
            ui.updateGameLog(`${player.name} conquered ${targetTerritory.name} from ${previousOwner}!`);
            
            // Check for victory
            this.checkVictoryConditions();
        } else {
            ui.updateGameLog(`Attack on ${targetTerritory.name} ${attackSuccess ? 'succeeded' : 'failed'}. ` +
                            `Attacker lost ${attackerLosses} armies, defender lost ${defenderLosses} armies.`);
        }
        
        // Update UI
        this.worldMap.updateTerritoryVisuals();
        ui.updateTerritoryInfo(this.worldMap.selectedTerritory);
        
        // Exit attack mode
        this.attackMode = false;
        
        return true;
    }

    // Move armies from selected territory to target territory
    moveArmies(targetTerritory) {
        const sourceTerritory = this.worldMap.selectedTerritory;
        const player = this.currentPlayer;
        
        // Check if both territories are owned by current player
        if (sourceTerritory.owner !== player || targetTerritory.owner !== player) {
            ui.updateGameLog('You can only move armies between territories you own.');
            return false;
        }
        
        // Check if territories are adjacent
        if (!this.worldMap.areAdjacent(sourceTerritory, targetTerritory)) {
            ui.updateGameLog('You can only move armies to adjacent territories.');
            return false;
        }
        
        // Check if source territory has enough armies
        if (sourceTerritory.armies <= 1) {
            ui.updateGameLog('You need at least 2 armies to move (1 must stay behind).');
            return false;
        }
        
        // Move half of available armies
        const armiesToMove = Math.floor((sourceTerritory.armies - 1) / 2);
        
        if (armiesToMove <= 0) {
            ui.updateGameLog('Not enough armies to move.');
            return false;
        }
        
        // Transfer armies
        sourceTerritory.armies -= armiesToMove;
        targetTerritory.armies += armiesToMove;
        
        // Update UI
        this.worldMap.updateTerritoryVisuals();
        ui.updateTerritoryInfo(this.worldMap.selectedTerritory);
        ui.updateGameLog(`Moved ${armiesToMove} armies from ${sourceTerritory.name} to ${targetTerritory.name}.`);
        
        // Exit move mode
        this.moveMode = false;
        
        return true;
    }

    // Research a technology
    researchTechnology(techId) {
        const player = this.currentPlayer;
        const tech = this.technologies[techId];
        
        // Check if player already has this technology
        if (player.technologies.includes(techId)) {
            ui.updateGameLog(`You have already researched ${tech.name}.`);
            return false;
        }
        
        // Check if player has enough tech points
        if (player.techPoints < tech.cost) {
            ui.updateGameLog(`Not enough tech points to research ${tech.name}. Need ${tech.cost} points.`);
            return false;
        }
        
        // Research technology
        player.techPoints -= tech.cost;
        player.technologies.push(techId);
        
        // Update UI
        ui.updatePlayerInfo();
        ui.updateGameLog(`Researched ${tech.name}: ${tech.effect}`);
        ui.updateTechTree();
        
        return true;
    }

    // Check victory conditions
    checkVictoryConditions() {
        const totalTerritories = this.worldMap.territories.length;
        const victoryThreshold = Math.floor(totalTerritories * (GAME_CONFIG.victoryPercentage / 100));
        
        // Check each player
        for (const player of this.players) {
            const playerTerritories = this.worldMap.getTerritoriesByOwner(player);
            
            // Check territory count victory
            if (playerTerritories.length >= victoryThreshold) {
                this.endGame(player, 'territory');
                return true;
            }
            
            // Check elimination victory (only one player left)
            const activePlayers = this.players.filter(p => {
                return this.worldMap.getTerritoriesByOwner(p).length > 0;
            });
            
            if (activePlayers.length === 1) {
                this.endGame(activePlayers[0], 'elimination');
                return true;
            }
        }
        
        return false;
    }

    // End the game with a winner
    endGame(winner, victoryType) {
        this.gamePhase = 'gameover';
        
        let victoryMessage = '';
        if (victoryType === 'territory') {
            victoryMessage = `${winner.name} has conquered ${GAME_CONFIG.victoryPercentage}% of the world!`;
        } else if (victoryType === 'elimination') {
            victoryMessage = `${winner.name} has eliminated all opponents!`;
        }
        
        // Play victory sound
        if (sounds) sounds.play('victory');
        
        // Play victory animation on winner's territories
        if (animations) {
            const winnerTerritories = this.worldMap.getTerritoriesByOwner(winner);
            animations.playVictoryAnimation(winnerTerritories);
        }
        
        // Update UI
        ui.showVictoryScreen(winner, victoryMessage);
        ui.updateGameLog(`Game Over! ${victoryMessage}`);
    }

    // Play AI turn
    playAITurn() {
        const player = this.currentPlayer;
        const playerTerritories = this.worldMap.getTerritoriesByOwner(player);
        
        // Simple AI logic
        setTimeout(() => {
            // 1. Build armies in territories with enemies nearby
            let builtArmies = false;
            for (const territory of playerTerritories) {
                const adjacentTerritories = this.worldMap.getAdjacentTerritories(territory);
                const enemyAdjacent = adjacentTerritories.some(t => t.owner !== player && t.owner !== null);
                
                if (enemyAdjacent && player.gold >= GAME_CONFIG.armyCost) {
                    this.worldMap.selectTerritory(territory);
                    this.buildArmy();
                    builtArmies = true;
                }
            }
            
            // If no armies built with priority, build in random territory
            if (!builtArmies && playerTerritories.length > 0 && player.gold >= GAME_CONFIG.armyCost) {
                const randomTerritory = playerTerritories[Math.floor(Math.random() * playerTerritories.length)];
                this.worldMap.selectTerritory(randomTerritory);
                this.buildArmy();
            }
            
            // 2. Research technology if possible
            if (player.techPoints >= 8) {
                const availableTechs = Object.keys(this.technologies)
                    .filter(techId => !player.technologies.includes(techId));
                
                if (availableTechs.length > 0) {
                    const randomTech = availableTechs[Math.floor(Math.random() * availableTechs.length)];
                    this.researchTechnology(randomTech);
                }
            }
            
            // 3. Attack if possible
            let attackMade = false;
            for (const territory of playerTerritories) {
                if (territory.armies <= 1) continue;
                
                const adjacentTerritories = this.worldMap.getAdjacentTerritories(territory);
                const attackableTerritories = adjacentTerritories.filter(t => t.owner !== player);
                
                if (attackableTerritories.length > 0) {
                    // Find weakest target
                    const weakestTarget = attackableTerritories.reduce((weakest, current) => {
                        return (current.armies < weakest.armies) ? current : weakest;
                    }, attackableTerritories[0]);
                    
                    // Only attack if we have more armies
                    if (territory.armies > weakestTarget.armies + 1) {
                        this.worldMap.selectTerritory(territory);
                        this.attack(weakestTarget);
                        attackMade = true;
                        break;
                    }
                }
            }
            
            // 4. End turn
            setTimeout(() => {
                this.endTurn();
            }, 500);
        }, 1000);
    }

    // Reset the game
    resetGame() {
        // Reset game state
        this.players = [];
        this.currentPlayerIndex = 0;
        this.currentPlayer = null;
        this.gamePhase = 'setup';
        this.turnNumber = 0;
        
        // Create new world map
        this.worldMap = new WorldMap();
        
        // Reset attack and move modes
        this.attackMode = false;
        this.moveMode = false;
        
        // Initialize new game
        this.initialize();
    }
}
