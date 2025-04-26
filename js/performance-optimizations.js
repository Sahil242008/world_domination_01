/**
 * performance-optimizations.js - Optimizes game performance
 * Global Conquest - World Domination Game
 */

class PerformanceOptimizer {
    constructor() {
        this.debounceTimers = {};
        this.throttleTimers = {};
        this.lastRenderTime = 0;
        this.fps = 60;
        this.fpsInterval = 1000 / this.fps;
    }

    // Initialize performance optimizations
    initialize() {
        // Apply performance optimizations
        this.optimizeEventHandlers();
        this.optimizeRendering();
        this.optimizeMemoryUsage();
    }

    // Optimize event handlers with debouncing and throttling
    optimizeEventHandlers() {
        // Replace territory click handler with optimized version
        const originalMapClickHandler = document.getElementById('world-map').onclick;
        document.getElementById('world-map').onclick = (event) => {
            this.throttle('mapClick', () => {
                if (originalMapClickHandler) originalMapClickHandler(event);
            }, 100);
        };

        // Optimize button clicks
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            const originalClickHandler = button.onclick;
            if (originalClickHandler) {
                button.onclick = (event) => {
                    this.debounce(button.id || 'button', () => {
                        originalClickHandler(event);
                    }, 200);
                };
            }
        });
    }

    // Optimize rendering with requestAnimationFrame
    optimizeRendering() {
        // Override territory visual updates with optimized version
        const originalUpdateTerritoryVisuals = game.worldMap.updateTerritoryVisuals;
        game.worldMap.updateTerritoryVisuals = () => {
            window.requestAnimationFrame(() => {
                const now = Date.now();
                if (now - this.lastRenderTime > this.fpsInterval) {
                    this.lastRenderTime = now;
                    originalUpdateTerritoryVisuals.call(game.worldMap);
                }
            });
        };
    }

    // Optimize memory usage
    optimizeMemoryUsage() {
        // Clear unused objects and references
        window.addEventListener('beforeunload', () => {
            // Clear timers
            Object.values(this.debounceTimers).forEach(timer => clearTimeout(timer));
            Object.values(this.throttleTimers).forEach(timer => clearTimeout(timer));
            
            // Clear event listeners
            document.getElementById('world-map').onclick = null;
            const buttons = document.querySelectorAll('button');
            buttons.forEach(button => {
                button.onclick = null;
            });
        });
    }

    // Debounce function to limit function calls
    debounce(id, func, delay) {
        clearTimeout(this.debounceTimers[id]);
        this.debounceTimers[id] = setTimeout(() => {
            func();
        }, delay);
    }

    // Throttle function to limit function calls
    throttle(id, func, limit) {
        if (!this.throttleTimers[id]) {
            func();
            this.throttleTimers[id] = setTimeout(() => {
                delete this.throttleTimers[id];
            }, limit);
        }
    }
}
