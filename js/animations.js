/**
 * animations.js - Handles game animations and visual effects
 * Global Conquest - World Domination Game
 */

class GameAnimations {
    constructor() {
        this.animationsEnabled = true;
    }

    // Initialize animations
    initialize() {
        // Add animation styles to the document
        this.addAnimationStyles();
    }

    // Add animation styles to the document
    addAnimationStyles() {
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            /* Territory hover animation */
            .territory {
                transition: transform 0.3s ease, box-shadow 0.3s ease;
            }
            
            /* Attack animation */
            @keyframes attack-pulse {
                0% { transform: scale(1); box-shadow: 0 0 5px rgba(255, 0, 0, 0.5); }
                50% { transform: scale(1.2); box-shadow: 0 0 15px rgba(255, 0, 0, 0.8); }
                100% { transform: scale(1); box-shadow: 0 0 5px rgba(255, 0, 0, 0.5); }
            }
            
            .attack-animation {
                animation: attack-pulse 0.5s ease-in-out;
            }
            
            /* Victory animation */
            @keyframes victory-glow {
                0% { box-shadow: 0 0 10px rgba(255, 215, 0, 0.5); }
                50% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.8); }
                100% { box-shadow: 0 0 10px rgba(255, 215, 0, 0.5); }
            }
            
            .victory-animation {
                animation: victory-glow 2s infinite;
            }
            
            /* Territory capture animation */
            @keyframes territory-capture {
                0% { transform: scale(1); opacity: 0.7; }
                50% { transform: scale(1.3); opacity: 1; }
                100% { transform: scale(1); opacity: 1; }
            }
            
            .capture-animation {
                animation: territory-capture 0.8s ease-out;
            }
            
            /* Army build animation */
            @keyframes army-build {
                0% { transform: scale(0.5); opacity: 0; }
                100% { transform: scale(1); opacity: 1; }
            }
            
            .army-build-animation {
                animation: army-build 0.5s ease-out;
            }
            
            /* Button pulse animation */
            @keyframes button-pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
            
            .pulse-animation {
                animation: button-pulse 1s infinite;
            }
        `;
        document.head.appendChild(styleElement);
    }

    // Play attack animation
    playAttackAnimation(sourceTerritory, targetTerritory) {
        if (!this.animationsEnabled) return;
        
        // Add attack animation class to source territory
        sourceTerritory.element.classList.add('attack-animation');
        
        // Remove the class after animation completes
        setTimeout(() => {
            sourceTerritory.element.classList.remove('attack-animation');
        }, 500);
    }

    // Play territory capture animation
    playCaptureAnimation(territory) {
        if (!this.animationsEnabled) return;
        
        // Add capture animation class to territory
        territory.element.classList.add('capture-animation');
        
        // Remove the class after animation completes
        setTimeout(() => {
            territory.element.classList.remove('capture-animation');
        }, 800);
    }

    // Play army build animation
    playArmyBuildAnimation(territory) {
        if (!this.animationsEnabled) return;
        
        // Add army build animation class to territory
        territory.element.classList.add('army-build-animation');
        
        // Remove the class after animation completes
        setTimeout(() => {
            territory.element.classList.remove('army-build-animation');
        }, 500);
    }

    // Play victory animation on territories
    playVictoryAnimation(territories) {
        if (!this.animationsEnabled) return;
        
        // Add victory animation class to all territories
        territories.forEach(territory => {
            territory.element.classList.add('victory-animation');
        });
    }

    // Add pulse animation to a button
    addButtonPulse(button) {
        if (!this.animationsEnabled) return;
        
        button.classList.add('pulse-animation');
    }

    // Remove pulse animation from a button
    removeButtonPulse(button) {
        button.classList.remove('pulse-animation');
    }

    // Toggle animations on/off
    toggleAnimations(enabled) {
        this.animationsEnabled = enabled;
    }
}
