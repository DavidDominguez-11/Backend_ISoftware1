require('dotenv').config();
const fs = require('fs');
const http = require('http');
const https = require('https');
const app = require('./app');

// ⚙️ Configura los puertos
const HTTP_PORT = process.env.SERVER_PORT_TEST || 80;
const HTTPS_PORT = 4000;

// 🧠 Tu dominio (para logs e información)
const DOMAIN = 'poolcenter.fun';

// 🔐 Certificados SSL de Cloudflare
const sslOptions = {
  key: fs.readFileSync('/etc/ssl/private/cloudflare-origin.key'),
  cert: fs.readFileSync('/etc/ssl/certs/cloudflare-origin.pem')
};

// 🚀 SOLO UN servidor - Elige HTTPS o HTTP:

// OPCIÓN A: Solo HTTPS (RECOMENDADO)
https.createServer(sslOptions, app).listen(HTTPS_PORT, () => {
  console.log(`✅ Servidor HTTPS corriendo en https://${DOMAIN}:${HTTPS_PORT}`);
});

// OPCIÓN B: Solo HTTP (para desarrollo)
// http.createServer(app).listen(HTTP_PORT, () => {
//   console.log(`✅ Servidor HTTP corriendo en http://${DOMAIN}:${HTTP_PORT}`);
// });

// ❌ ELIMINA el otro servidor y la redirección