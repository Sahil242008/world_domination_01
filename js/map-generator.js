/**
 * map-generator.js - Creates a stylized world map background for the game
 * Global Conquest - World Domination Game
 */

// This script will run in the browser to generate the world map background
class MapGenerator {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 1200;
        this.canvas.height = 800;
        this.ctx = this.canvas.getContext('2d');
    }

    // Generate the world map background
    generate() {
        // Set background
        this.ctx.fillStyle = '#16213e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw grid lines
        this.drawGrid();
        
        // Draw continents
        this.drawContinents();
        
        // Add points of interest
        this.addPointsOfInterest();
        
        // Add glow effects
        this.addGlowEffects();
        
        // Add vignette effect
        this.addVignette();
        
        return this.canvas;
    }

    // Draw grid lines
    drawGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;

        // Horizontal grid lines
        for (let y = 0; y < this.canvas.height; y += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }

        // Vertical grid lines
        for (let x = 0; x < this.canvas.width; x += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
    }

    // Draw stylized continents
    drawContinents() {
        const continents = [
            // North America
            {
                points: [
                    [100, 100], [300, 80], [400, 150], [350, 300], 
                    [250, 350], [200, 320], [150, 250], [100, 200]
                ],
                color: 'rgba(70, 130, 180, 0.3)'
            },
            // South America
            {
                points: [
                    [250, 350], [350, 350], [400, 500], [350, 600],
                    [250, 650], [200, 550], [220, 450]
                ],
                color: 'rgba(60, 179, 113, 0.3)'
            },
            // Europe
            {
                points: [
                    [500, 100], [650, 120], [600, 200], [550, 250],
                    [450, 230], [430, 180], [450, 120]
                ],
                color: 'rgba(255, 165, 0, 0.3)'
            },
            // Africa
            {
                points: [
                    [500, 250], [600, 250], [650, 350], [600, 500],
                    [500, 550], [450, 500], [430, 350], [450, 280]
                ],
                color: 'rgba(255, 69, 0, 0.3)'
            },
            // Asia
            {
                points: [
                    [650, 120], [900, 100], [1000, 150], [950, 300],
                    [850, 350], [750, 320], [650, 300], [600, 200]
                ],
                color: 'rgba(138, 43, 226, 0.3)'
            },
            // Australia
            {
                points: [
                    [850, 450], [950, 470], [980, 550], [900, 600],
                    [820, 580], [800, 500]
                ],
                color: 'rgba(220, 20, 60, 0.3)'
            }
        ];

        // Draw each continent
        continents.forEach(continent => {
            this.ctx.fillStyle = continent.color;
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            this.ctx.lineWidth = 2;
            
            this.ctx.beginPath();
            this.ctx.moveTo(continent.points[0][0], continent.points[0][1]);
            
            for (let i = 1; i < continent.points.length; i++) {
                this.ctx.lineTo(continent.points[i][0], continent.points[i][1]);
            }
            
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
        });
    }

    // Add random dots for cities/points of interest
    addPointsOfInterest() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            const radius = Math.random() * 2 + 1;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    // Add glow effects
    addGlowEffects() {
        // Add some glowing points
        this.addGlow(300, 150, 80, 'rgba(70, 130, 180, 0.1)');
        this.addGlow(300, 500, 70, 'rgba(60, 179, 113, 0.1)');
        this.addGlow(550, 180, 60, 'rgba(255, 165, 0, 0.1)');
        this.addGlow(550, 400, 80, 'rgba(255, 69, 0, 0.1)');
        this.addGlow(800, 200, 100, 'rgba(138, 43, 226, 0.1)');
        this.addGlow(900, 520, 60, 'rgba(220, 20, 60, 0.1)');
    }

    // Add a glow effect
    addGlow(x, y, radius, color) {
        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
    }

    // Add a vignette effect
    addVignette() {
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width / 2, this.canvas.height / 2, this.canvas.height / 3,
            this.canvas.width / 2, this.canvas.height / 2, this.canvas.height
        );
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
}
