//server.js

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

// 🚀 Servidor HTTPS (seguro)
https.createServer(sslOptions, app).listen(HTTPS_PORT, () => {
  console.log(`✅ Servidor HTTPS corriendo en https://${DOMAIN}:${HTTPS_PORT}`);
});

// 🌐 Servidor HTTP (redirige a HTTPS)
http.createServer((req, res) => {
  const host = req.headers.host.replace(/:\d+$/, ''); // quita el puerto si lo hay
  res.writeHead(301, { Location: `https://${host}:${HTTPS_PORT}${req.url}` });
  res.end();
}).listen(HTTP_PORT, () => {
  console.log(`🌐 Servidor HTTP escuchando en puerto ${HTTP_PORT} (redirigiendo a HTTPS)`);
});