  //app.js

  const express = require('express');
  const cors = require('cors'); // AÑADIR
  const cookieParser = require('cookie-parser');
  require('./config/env'); // Carga variables de entorno y muestra logs

  const app = express();
  app.use(cors({
      origin: 'http://localhost:5174', // permite peticiones desde tu frontend
      credentials: true // si vas a usar cookies o encabezados auth
    }));
  app.use(express.json());
  app.use(cookieParser());

  // Rutas
  const authRoutes = require('./routes/authRoutes'); 
  const userRoutes = require('./routes/userRoutes');
  const projectsRoutes = require('./routes/projectRoutes');
  const rolesRoutes = require('./routes/rolesRoutes');
  const usercreateRouter = require('./routes/usercreateRoutes');
  const registerUserRolRoutes = require('./routes/registerUserRolRoutes');

  app.use('/services/auth', authRoutes);
  app.use('/services', projectsRoutes);
  app.use('/services', rolesRoutes);
  app.use('/services', registerUserRolRoutes);


  module.exports = app;