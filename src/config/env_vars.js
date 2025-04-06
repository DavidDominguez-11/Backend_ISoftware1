//const ppp = "C:/Users/domin/OneDrive/Documentos/UVG/2025/S5/ingSOFTWARE/PROYECTO/Backend_ISoftware1/.env"
require('dotenv').config({ path: '../../.env' });  // Example if .env is in a 'config' folder


console.log('Variables de entorno cargadas:');
console.log('User:', process.env.POSTGRES_USER);
console.log('Password:', typeof process.env.POSTGRES_PASSWORD, process.env.POSTGRES_PASSWORD ? 'Existe' : 'No existe', process.env.POSTGRES_PASSWORD);
console.log('DB:', process.env.POSTGRES_DB);
console.log('Port:', process.env.PORT_DB);
console.log('Host:', process.env.DB_HOST);