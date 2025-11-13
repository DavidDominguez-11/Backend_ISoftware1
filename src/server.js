require('dotenv').config();
const http = require('http');
const app = require('./app');

// ⚙️ Configura el puerto
const PORT = process.env.SERVER_PORT_TEST || 4000;

// 🧠 Tu dominio (para logs)
const DOMAIN = 'poolcenter.fun';

// 🚀 Servidor HTTP simple
http.createServer(app).listen(PORT, () => {
  console.log(`✅ Servidor HTTP corriendo en http://${DOMAIN}:${PORT}`);
});