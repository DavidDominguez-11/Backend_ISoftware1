const express = require('express');
require('./config/env'); // Carga variables de entorno y muestra logs

const app = express();
app.use(express.json());

// Rutas
const userRoutes = require('./routes/userRoutes');
app.use('/usuarios', userRoutes);

module.exports = app;