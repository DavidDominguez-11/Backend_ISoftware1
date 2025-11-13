require('dotenv').config();
const fs = require('fs');
const https = require('https');
const app = require('./app');

// ⚙️ Configura el puerto
const HTTPS_PORT = 4000;

// 🧠 Tu dominio
const DOMAIN = 'poolcenter.fun';

// 🔐 Certificados SSL de Cloudflare
const sslOptions = {
  key: fs.readFileSync('/etc/ssl/private/cloudflare-origin.key'),
  cert: fs.readFileSync('/etc/ssl/certs/cloudflare-origin.pem')
};

// 🚀 Servidor HTTPS principal (puerto 4000)
https.createServer(sslOptions, app).listen(HTTPS_PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor HTTPS corriendo en https://${DOMAIN}:${HTTPS_PORT}`);
});