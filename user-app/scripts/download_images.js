const https = require('https');
const fs = require('fs');
const path = require('path');

const images = {
  'basilica.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Basilica_Minore_del_Santo_Ni%C3%B1o_Cebu.jpg/1280px-Basilica_Minore_del_Santo_Ni%C3%B1o_Cebu.jpg',
  'magellan-cross.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Magellan%27s_Cross%2C_Cebu_City.jpg/1280px-Magellan%27s_Cross%2C_Cebu_City.jpg',
  'temple-of-leah.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Temple_of_Leah.jpg/1280px-Temple_of_Leah.jpg',
  'kawasan-falls.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Kawasan_Falls%2C_Cebu.jpg/1280px-Kawasan_Falls%2C_Cebu.jpg',
  'moalboal.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Moalboal_Beach.jpg/1280px-Moalboal_Beach.jpg',
  'oslob.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Whale_shark_watching_in_Oslob%2C_Cebu.jpg/1280px-Whale_shark_watching_in_Oslob%2C_Cebu.jpg',
  'fort-san-pedro.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Fort_San_Pedro%2C_Cebu_City.jpg/1280px-Fort_San_Pedro%2C_Cebu_City.jpg',
  'bantayan.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Bantayan_Island_Beach.jpg/1280px-Bantayan_Island_Beach.jpg',
  'sirao-garden.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Sirao_Flower_Garden%2C_Cebu_City.jpg/1280px-Sirao_Flower_Garden%2C_Cebu_City.jpg',
  'tops-lookout.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Tops_Lookout%2C_Cebu_City.jpg/1280px-Tops_Lookout%2C_Cebu_City.jpg',
};

const imagesDir = path.join(__dirname, '..', 'assets', 'images');

// Create images directory if it doesn't exist
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Download each image
Object.entries(images).forEach(([filename, url]) => {
  const filePath = path.join(imagesDir, filename);
  
  https.get(url, (response) => {
    const fileStream = fs.createWriteStream(filePath);
    response.pipe(fileStream);
    
    fileStream.on('finish', () => {
      console.log(`Downloaded: ${filename}`);
      fileStream.close();
    });
  }).on('error', (err) => {
    console.error(`Error downloading ${filename}:`, err.message);
  });
}); 