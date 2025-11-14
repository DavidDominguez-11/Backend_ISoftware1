// middleware/imageOptimizer.js
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

// Para MÚLTIPLES archivos
const optimizeMultipleImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No se subieron archivos' });
    }

    req.optimizedImages = [];

    for (const file of req.files) {
      const filename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`;
      const outputPath = path.join('uploads/reports', filename);

      // Optimizar imagen
      await sharp(file.path)
        .resize(1920, 1080, { 
          fit: 'inside', 
          withoutEnlargement: true 
        })
        .jpeg({ 
          quality: 80, 
          progressive: true 
        })
        .toFile(outputPath);

      // Eliminar archivo temporal
      await fs.unlink(file.path);

      req.optimizedImages.push({
        filename,
        path: `/uploads/reports/${filename}`
      });
    }

    next();
  } catch (error) {
    console.error('Error optimizando imágenes:', error);
    
    // Limpiar archivos temporales
    if (req.files) {
      for (const file of req.files) {
        try {
          await fs.unlink(file.path);
        } catch {}
      }
    }
    
    res.status(500).json({ error: 'Error al procesar las imágenes' });
  }
};

// Para UN SOLO archivo (como te mostré antes)
const optimizeSingleImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return next();
    }

    const filename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`;
    const outputPath = path.join('uploads/reports', filename);

    await sharp(req.file.path)
      .resize(1920, 1080, { 
        fit: 'inside', 
        withoutEnlargement: true 
      })
      .jpeg({ 
        quality: 80, 
        progressive: true 
      })
      .toFile(outputPath);

    await fs.unlink(req.file.path);

    req.optimizedImage = {
      filename,
      path: `/uploads/reports/${filename}`
    };

    next();
  } catch (error) {
    console.error('Error optimizando imagen:', error);
    
    if (req.file?.path) {
      try {
        await fs.unlink(req.file.path);
      } catch {}
    }
    
    res.status(500).json({ error: 'Error al procesar la imagen' });
  }
};

module.exports = {
  optimizeMultipleImages,
  optimizeSingleImage
};