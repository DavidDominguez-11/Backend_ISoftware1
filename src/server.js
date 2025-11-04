require('dotenv').config();
const fs = require('fs');
const http = require('http');
const https = require('https');
const app = require('./app');

// ⚙️ Configura los puertos
const HTTP_PORT = process.env.SERVER_PORT_TEST || 80;
const HTTPS_PORT = process.env.SERVER_PORT || 4000;

// 🧠 Tu dominio (solo para logs)
const DOMAIN = 'poolcenter.fun';

// 🧩 Rutas esperadas de los certificados SSL
const SSL_KEY_PATH = '/etc/ssl/private/cloudflare-origin.key';
const SSL_CERT_PATH = '/etc/ssl/certs/cloudflare-origin.pem';

// 🔐 Verifica si los certificados existen antes de intentar cargarlos
let useHttps = false;
let sslOptions = {};

if (fs.existsSync(SSL_KEY_PATH) && fs.existsSync(SSL_CERT_PATH)) {
  sslOptions = {
    key: fs.readFileSync(SSL_KEY_PATH),
    cert: fs.readFileSync(SSL_CERT_PATH)
  };
  useHttps = true;
  console.log('🔐 Certificados SSL cargados correctamente.');
} else {
  console.warn('⚠️ Certificados SSL no encontrados, usando solo HTTP.');
}

// 🚀 Servidor principal
if (useHttps) {
  https.createServer(sslOptions, app).listen(HTTPS_PORT, () => {
    console.log(`✅ Servidor HTTPS corriendo en https://${DOMAIN}:${HTTPS_PORT}`);
  });

  // 🌐 Servidor HTTP que redirige a HTTPS
  http.createServer((req, res) => {
    const host = req.headers.host.replace(/:\d+$/, ''); // quita el puerto
    res.writeHead(301, { Location: `https://${host}:${HTTPS_PORT}${req.url}` });
    res.end();
  }).listen(HTTP_PORT, () => {
    console.log(`🌐 Servidor HTTP escuchando en puerto ${HTTP_PORT} (redirigiendo a HTTPS)`);
  });

} else {
  // Solo HTTP (cuando los certificados no están disponibles)
  http.createServer(app).listen(HTTPS_PORT, () => {
    console.log(`✅ Servidor HTTP corriendo en http://localhost:${HTTPS_PORT}`);
  });
}
