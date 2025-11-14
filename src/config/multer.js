// config/multer.config.js
const multer = require('multer');
const path = require('path');

// Configuración temporal (luego optimizamos con sharp)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'temp/'); // Carpeta temporal
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// Filtro de archivos
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, webp, gif)'));
};

const upload = multer({
  storage,
  limits: { 
    fileSize: 10 * 1024 * 1024 // 10MB antes de optimizar
  },
  fileFilter
});

module.exports = upload;