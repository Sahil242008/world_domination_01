// Create a simple world map background using HTML5 Canvas
// This will generate a stylized world map image for our game

const canvas = document.createElement('canvas');
canvas.width = 1200;
canvas.height = 800;
const ctx = canvas.getContext('2d');

// Set background
ctx.fillStyle = '#16213e';
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Draw grid lines
ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
ctx.lineWidth = 1;

// Horizontal grid lines
for (let y = 0; y < canvas.height; y += 50) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
}

// Vertical grid lines
for (let x = 0; x < canvas.width; x += 50) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
}

// Draw stylized continents
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
    ctx.fillStyle = continent.color;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.moveTo(continent.points[0][0], continent.points[0][1]);
    
    for (let i = 1; i < continent.points.length; i++) {
        ctx.lineTo(continent.points[i][0], continent.points[i][1]);
    }
    
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
});

// Add some random dots for cities/points of interest
ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
for (let i = 0; i < 50; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const radius = Math.random() * 2 + 1;
    
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

// Add some glow effects
const addGlow = (x, y, radius, color) => {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
};

// Add some glowing points
addGlow(300, 150, 80, 'rgba(70, 130, 180, 0.1)');
addGlow(300, 500, 70, 'rgba(60, 179, 113, 0.1)');
addGlow(550, 180, 60, 'rgba(255, 165, 0, 0.1)');
addGlow(550, 400, 80, 'rgba(255, 69, 0, 0.1)');
addGlow(800, 200, 100, 'rgba(138, 43, 226, 0.1)');
addGlow(900, 520, 60, 'rgba(220, 20, 60, 0.1)');

// Add a subtle vignette effect
const addVignette = () => {
    const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, canvas.height / 3,
        canvas.width / 2, canvas.height / 2, canvas.height
    );
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
};

addVignette();

// Add a title overlay
ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
ctx.fillRect(0, 0, canvas.width, 80);

ctx.font = 'bold 40px Arial';
ctx.fillStyle = '#ff9900';
ctx.textAlign = 'center';
ctx.fillText('GLOBAL CONQUEST', canvas.width / 2, 50);

// Export the canvas as a PNG
const dataURL = canvas.toDataURL('image/png');

// In a real environment, we would save this to a file
// For this script, we'll output the data URL to be used in another script
console.log(dataURL);
