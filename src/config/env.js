require('dotenv').config();

console.log('Variables de entorno cargadas:');
console.log('User:', process.env.POSTGRES_USER);
console.log('Password:', typeof process.env.POSTGRES_PASSWORD, process.env.POSTGRES_PASSWORD ? 'Existe' : 'No existe');
console.log('DB:', process.env.POSTGRES_DB);
console.log('Port:', process.env.PORT_DB);
console.log('Host:', process.env.DB_HOST);