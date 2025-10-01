const fs = require('fs');
const path = require('path');

// Create placeholder images for missing poets
const poets = [
  'khalil-kumbhar.webp',
  'rubina-abro.jpg', 
  'ustad-bukhari.jpg'
];

const assetsDir = path.join(__dirname, 'public', 'assets', 'images', 'poets');

// Ensure directory exists
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Create simple placeholder images
poets.forEach(poet => {
  const filePath = path.join(assetsDir, poet);
  
  // Create a simple SVG placeholder
  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
  <rect width="300" height="300" fill="#f3f4f6"/>
  <circle cx="150" cy="120" r="60" fill="#d1d5db"/>
  <rect x="90" y="200" width="120" height="80" rx="10" fill="#d1d5db"/>
  <text x="150" y="250" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#6b7280">
    ${poet.split('.')[0].replace(/-/g, ' ').toUpperCase()}
  </text>
</svg>`;
  
  // Convert to appropriate format
  if (poet.endsWith('.webp')) {
    // For WebP, we'll create a simple HTML file that can be converted
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>Placeholder</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;display:flex;align-items:center;justify-content:center;height:100vh;">
  <div style="text-align:center;color:#6b7280;font-family:Arial,sans-serif;">
    <div style="width:120px;height:120px;background:#d1d5db;border-radius:50%;margin:0 auto 20px;"></div>
    <div style="width:120px;height:60px;background:#d1d5db;border-radius:10px;margin:0 auto;"></div>
    <p style="margin-top:20px;font-size:14px;">${poet.split('.')[0].replace(/-/g, ' ').toUpperCase()}</p>
  </div>
</body>
</html>`;
    fs.writeFileSync(filePath.replace('.webp', '.html'), htmlContent);
  } else {
    // For JPG, create SVG
    fs.writeFileSync(filePath.replace('.jpg', '.svg'), svgContent);
  }
});

console.log('Placeholder images created for:', poets);
console.log('Note: These are placeholder files. You should replace them with actual poet images.');
