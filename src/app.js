const express = require('express');
const cors = require('cors'); // AÑADIR
require('./config/env'); // Carga variables de entorno y muestra logs

const app = express();
app.use(cors({
    origin: 'http://localhost:5173', // permite peticiones desde tu frontend
    credentials: true // si vas a usar cookies o encabezados auth
  }));
app.use(express.json());

// Rutas
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes'); // AÑADIR

app.use('/usuarios', userRoutes);
app.use('/services/auth', authRoutes); // AÑADIR

module.exports = app;