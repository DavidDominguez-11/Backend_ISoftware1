//app.js

const express = require('express');
const cors = require('cors'); // AÑADIR
const cookieParser = require('cookie-parser');
require('./config/env'); // Carga variables de entorno y muestra logs

const app = express();
app.use(cors({
    origin: ['*'], // permite peticiones desde tu frontend
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
const clientesRoutes = require('./routes/clientesRoutes');

app.use('/services/auth', authRoutes);
app.use('/services', projectsRoutes);
app.use('/services', rolesRoutes);
app.use('/services', registerUserRolRoutes);
app.use('/services', getEstadoMaterial);
app.use('/services', getBodegaMateriales);
app.use('/services', materialesRoutes);
app.use('/services', getUsersInfo);
app.use('/services', proyectoMaterialRoutes);
app.use('/services', clientesRoutes);

module.exports = app;