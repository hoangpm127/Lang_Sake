const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, 'public', 'images');
const images = ['login-admin.jpg', 'login-f1.jpg', 'login-f2.jpg'];

async function optimizeImages() {
    console.log('🖼️  Starting image optimization...\n');

    for (const imageName of images) {
        const inputPath = path.join(imagesDir, imageName);
        const outputPath = path.join(imagesDir, imageName.replace('.jpg', '-optimized.jpg'));

        if (!fs.existsSync(inputPath)) {
            console.log(`⚠️  Skipping ${imageName} - file not found`);
            continue;
        }

        const originalSize = fs.statSync(inputPath).size;

        try {
            await sharp(inputPath)
                .resize(1920, null, {
                    withoutEnlargement: true,
                    fit: 'inside'
                })
                .jpeg({
                    quality: 80,
                    progressive: true
                })
                .toFile(outputPath);

            const newSize = fs.statSync(outputPath).size;
            const savings = ((originalSize - newSize) / originalSize * 100).toFixed(1);

            console.log(`✅ ${imageName}`);
            console.log(`   Original: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
            console.log(`   Optimized: ${(newSize / 1024 / 1024).toFixed(2)} MB`);
            console.log(`   Savings: ${savings}%\n`);

            // Replace original with optimized
            fs.unlinkSync(inputPath);
            fs.renameSync(outputPath, inputPath);
            console.log(`   Replaced original file.\n`);

        } catch (error) {
            console.error(`❌ Error optimizing ${imageName}:`, error.message);
        }
    }

    console.log('🎉 Image optimization complete!');
}

optimizeImages().catch(console.error);
