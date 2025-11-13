//app.js

const express = require('express');
const cors = require('cors'); // AÑADIR
const cookieParser = require('cookie-parser');
require('./config/env'); // Carga variables de entorno y muestra logs

const app = express();
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://85.25.172.78:5173', '*'], // permite peticiones desde tu frontend
    credentials: true // si vas a usar cookies o encabezados auth
  }));
app.use(express.json());
app.use(cookieParser());

// Rutas
const authRoutes = require('./routes/authRoutes'); 
const projectsRoutes = require('./routes/projectRoutes');
const rolesRoutes = require('./routes/rolesRoutes');
const registerUserRolRoutes = require('./routes/registerUserRolRoutes');
const getEstadoMaterial = require('./routes/estado_materialesRoutes');
const getBodegaMateriales = require('./routes/bodegaMaterialesRoutes');
const materialesRoutes = require('./routes/materialesRoutes');
const getUsersInfo = require('./routes/userRoutes');
const proyectoMaterialRoutes = require('./routes/proyectoMaterialRoutes');
const statisticsRoutes = require('./routes/statisticsRoutes');
const clientesRoutes = require('./routes/clientesRoutes');
const reportesRoutes = require('./routes/reportesRoutes');
const serverRoutes = require('./routes/serverRoutes');

app.use('/services/auth', authRoutes);
app.use('/services', projectsRoutes);
app.use('/services', rolesRoutes);
app.use('/services', registerUserRolRoutes);
app.use('/services', getEstadoMaterial);
app.use('/services', getBodegaMateriales);
app.use('/services', materialesRoutes);
app.use('/services', getUsersInfo);
app.use('/services', proyectoMaterialRoutes);
app.use('/services', statisticsRoutes);
app.use('/services', clientesRoutes);
app.use('/services', reportesRoutes);
app.use('/services', serverRoutes);

module.exports = app;