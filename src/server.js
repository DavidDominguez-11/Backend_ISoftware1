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

// 🔐 Rutas de certificados SSL
const SSL_KEY_PATH = '/etc/ssl/private/cloudflare-origin.key';
const SSL_CERT_PATH = '/etc/ssl/certs/cloudflare-origin.pem';

// 🚀 Lógica para determinar si usar HTTPS o HTTP
if (fs.existsSync(SSL_KEY_PATH) && fs.existsSync(SSL_CERT_PATH)) {
  // Si existen los certificados, usa HTTPS
  const sslOptions = {
    key: fs.readFileSync(SSL_KEY_PATH),
    cert: fs.readFileSync(SSL_CERT_PATH)
  };

  https.createServer(sslOptions, app).listen(HTTPS_PORT, () => {
    console.log(`✅ Servidor HTTPS corriendo en https://${DOMAIN}:${HTTPS_PORT}`);
  });

  // 🌐 HTTP redirige a HTTPS
  http.createServer((req, res) => {
    const host = req.headers.host.replace(/:\d+$/, ''); // quita el puerto si lo hay
    res.writeHead(301, { Location: `https://${host}:${HTTPS_PORT}${req.url}` });
    res.end();
  }).listen(HTTP_PORT, () => {
    console.log(`🌐 Servidor HTTP escuchando en puerto ${HTTP_PORT} (redirigiendo a HTTPS)`);
  });

} else {
  // Si NO existen los certificados, usa solo HTTP (modo Docker o desarrollo)
  console.warn('⚠️ Certificados SSL no encontrados, usando solo HTTP.');
  http.createServer(app).listen(HTTPS_PORT, () => {
    console.log(`✅ Servidor HTTP corriendo en http://localhost:${HTTPS_PORT}`);
  });
}
